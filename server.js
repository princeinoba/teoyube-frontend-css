const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { validateTeoyubeWorldOwnerGate, getCanonicalGateSnapshot } = require("./scripts/validateTeoyubeWorldOwnerGate.cjs");
const { createApprovedPilotDerivativePlan } = require("./scripts/planTeoyubeWorldApprovedPilotDerivatives.cjs");
const {
  pilotRoot: derivativePilotRoot,
  runtimeManifestPreviewPath,
  derivativeValidationPath,
  executionResultPath,
  sourceIntegrityAfterPath,
  publicationPlanPath,
  sha256File,
  artifactChecksum,
  resolveProjectPath,
  isWithin
} = require("./scripts/lib/teoyubeWorldDerivativeExecution.cjs");
const {
  publicationAuthorizationPath,
  publicationReceiptPath,
  publishedPilotRoot,
  EXPECTED_PUBLICATION_PLAN_CHECKSUM
} = require("./scripts/lib/teoyubeWorldPilotPublication.cjs");
const {
  getRuntimeAcceptanceGate,
  acceptPublishedPilotRuntime
} = require("./scripts/lib/teoyubeWorldRuntimeAcceptance.cjs");
const {
  writeJson,
  patchPaths,
  allowedFields,
  loadReviewWorkspace,
  applyPatches,
  validatePatch
} = require("./scripts/lib/teoyubeWorldReviewPatches.cjs");
const {
  assistedCandidatePath,
  ownerDeclarationsPath,
  emptyOwnerDeclarations,
  loadOwnerDeclarations
} = require("./scripts/lib/teoyubeWorldAssistedPilot.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState,
  createApprovalControlResponse,
  requestOwnerApproval,
  revokeOwnerApproval,
  authorizeDerivativeExecution,
  authorizePublication,
  requireDerivativeExecutionAuthorization,
  requirePublicationAuthorization
} = require("./scripts/lib/teoyubeWorldPilotLifecycle.cjs");
const {
  APPROVED_TRANSLATIONS,
  APPROVED_RIGHTS_STATUSES,
  APPROVED_SAFETY_STATUSES,
  selectedRecordSchemaFields,
  ownerReconfirmationPath,
  OWNER_RECONFIRMATION_VERSION,
  getCanonicalPilotState,
  getCanonicalSequenceState,
  normalizeCanonicalRecord,
  ensureCanonicalStateRevision,
  incrementCanonicalStateRevision,
  assertCurrentStateRevision
} = require("./scripts/lib/teoyubeWorldCanonicalPilotState.cjs");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const authoritativeReviewPort = 4174;
const protectedPathPrefixes = ["/media-source", "/generated", "/.git", "/.media-tmp"];
const mediaReviewDraftPath = path.join(root, "generated", "teoyubeworld-media", "manifests", "teoyubeworld-media-manifest.draft.json");
const mediaOriginalsRoot = path.join(root, "media-source", "teoyubeworld", "originals");
const mediaGeneratedRoot = path.join(root, "generated", "teoyubeworld-media");
const reviewReportsRoot = path.join(mediaGeneratedRoot, "reports");
const browserPlayableMimeTypes = new Set(["video/mp4", "video/webm", "video/quicktime", "image/jpeg", "image/png", "image/webp"]);
const reviewPatchFiles = {
  technical: "browser-technical-metadata.patch.json",
  owner: "owner-metadata-review.patch.json",
  duplicate: "duplicate-resolution.patch.json",
  sequence: "sequence-curation.patch.json",
  pilot: "pilot-selection.patch.json"
};
let mediaReviewManifestCache = null;

function readAssistedCandidate() {
  if (!fs.existsSync(assistedCandidatePath)) return null;
  const candidate = JSON.parse(fs.readFileSync(assistedCandidatePath, "utf8"));
  if (/[A-Za-z]:[\\/]/.test(JSON.stringify(candidate))) throw new Error("Assisted pilot candidate contains a disallowed absolute path.");
  return candidate;
}

function sanitizeAssistedRecord(record) {
  const safe = { ...record };
  for (const field of ["absolutePath", "sourcePath", "sourceAbsolutePath", "directoryPath"]) delete safe[field];
  return safe;
}

function writeReviewOperation(category, mediaId, newValues, reason, reviewedBy = "local_project_owner") {
  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(manifest, patches, sourceChecksum);
  const current = merged.manifest.records.find((record) => record.id === mediaId);
  if (!current) throw Object.assign(new Error("The media record is unavailable."), { statusCode: 404 });
  for (const field of Object.keys(newValues)) {
    if (!allowedFields.has(field)) throw Object.assign(new Error(`Field ${field} is not reviewable.`), { statusCode: 422 });
  }
  if (/[A-Za-z]:[\\/]|(?:^|["'\s])\.\.[\\/]|<script\b|javascript:/i.test(JSON.stringify(newValues))) {
    throw Object.assign(new Error("The review operation contains a disallowed value."), { statusCode: 422 });
  }
  const existing = patches[category];
  const priorOperation = (existing?.operations || []).find((operation) => operation.mediaId === mediaId);
  const preserved = (existing?.operations || []).filter((operation) => operation.mediaId !== mediaId);
  const mergedNewValues = { ...(priorOperation?.newValues || {}), ...newValues };
  const operation = {
    mediaId,
    changedFields: Object.keys(mergedNewValues),
    previousValues: {
      ...(priorOperation?.previousValues || {}),
      ...Object.fromEntries(Object.keys(newValues).filter((field) => !(field in (priorOperation?.previousValues || {}))).map((field) => [field, current[field] ?? null]))
    },
    newValues: mergedNewValues,
    reviewReason: reason,
    timestamp: new Date().toISOString()
  };
  const patch = {
    schemaVersion: "1.0.0",
    sourceDraftManifestChecksum: sourceChecksum,
    generatedAt: new Date().toISOString(),
    reviewedBy,
    operationCount: preserved.length + 1,
    operations: [...preserved, operation],
    warnings: [],
    localOnly: true,
    runtimeManifestUpdated: false
  };
  const validation = validatePatch(patch, manifest, sourceChecksum, category);
  if (!validation.valid) throw Object.assign(new Error(validation.errors.join(" ")), { statusCode: 422 });
  writeJsonWithBackup(patchPaths[category], patch);
  return { operation, patch, validation };
}

function parseScriptureReference(value) {
  const text = String(value || "").trim();
  if (!text || /^Book\s+\d+:/i.test(text)) return null;
  const match = /^(?<book>(?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(?<chapter>\d+):(?<start>\d+)(?:-(?<end>\d+))?$/.exec(text);
  return match ? {
    reference: text,
    BibleBook: match.groups.book,
    chapter: Number(match.groups.chapter),
    verseStart: Number(match.groups.start),
    verseEnd: Number(match.groups.end || match.groups.start)
  } : null;
}

function normalizeTranslation(value) {
  const text = String(value || "Unknown").trim() || "Unknown";
  const translation = [...APPROVED_TRANSLATIONS].find((item) => item.toLowerCase() === text.toLowerCase());
  if (!translation) throw Object.assign(new Error("Translation must be a supported Bible translation or Unknown."), { statusCode: 422, code: "invalid_translation" });
  return translation;
}

function mapRightsStatus(value) {
  const aliases = { owner_owned: "owner_controlled", confirmed: "permission_granted", unknown: "not_approved", needs_review: "not_approved" };
  const status = aliases[String(value || "")] || String(value || "not_approved");
  if (!APPROVED_RIGHTS_STATUSES.has(status)) throw Object.assign(new Error("Choose an explicit supported rights status."), { statusCode: 422, code: "invalid_rights_status" });
  return {
    status,
    copyrightStatus: ["owner_created", "owner_controlled"].includes(status) ? "owner_owned"
      : ["permission_granted", "public_domain"].includes(status) ? "confirmed"
        : status === "licensed" ? "licensed" : "needs_review"
  };
}

function normalizeSafetyStatus(value) {
  const status = String(value || "unknown");
  if (!APPROVED_SAFETY_STATUSES.has(status)) throw Object.assign(new Error("Choose an explicit supported safety status."), { statusCode: 422, code: "invalid_safety_status" });
  return status;
}

function requireAuthoritativeReviewWrite(req, res) {
  if (port === authoritativeReviewPort) return true;
  sendJson(res, 409, {
    saved: false,
    state: "blocked",
    blockerCount: 1,
    blockers: [{ code: "non_authoritative_review_port", category: "technical", message: `Review writes are accepted only by the authoritative server on port ${authoritativeReviewPort}.`, mediaId: null }]
  });
  return false;
}

async function canonicalAssistedPilotPayload() {
  const canonical = getCanonicalPilotState();
  const gate = await getCanonicalGateSnapshot();
  const sequence = getCanonicalSequenceState(canonical);
  const records = canonical.candidateRecords.map((record) => sanitizeAssistedRecord(normalizeCanonicalRecord(record, canonical.suggestions[record.id])));
  const artifacts = artifactSnapshot();
  const approval = artifacts.approval;
  const approved = Boolean(gate.gatePassed && gate.blockerCount === 0 && approval?.approvalState === "owner_approved");
  return {
    candidate: canonical.candidate,
    selectedRecords: records,
    ownerPatchedIds: (canonical.patches.owner?.operations || []).map((operation) => operation.mediaId).filter(Boolean),
    declarations: canonical.ownerReconfirmation,
    sequence,
    recordSchemaFields: selectedRecordSchemaFields,
    gate,
    stateRevision: gate.stateRevision,
    generatedAt: gate.generatedAt,
    serverPort: gate.serverPort,
    pilotPlanId: gate.pilotPlanId,
    manifestVersion: gate.manifestVersion,
    approvalArtifactPresent: gate.approvalArtifactPresent,
    blockerCount: gate.blockerCount,
    blockersByCategory: gate.blockersByCategory,
    state: approved ? "owner_approved" : gate.gatePassed ? "ready_for_owner_approval" : "awaiting_owner_reconfirmation",
    lifecycleState: determineLifecycleState(gate, artifacts),
    approvalSummary: approved ? {
      artifactId: `teoyubeworld-approved-pilot-${String(approval.artifactChecksumSha256 || "").slice(0, 12)}`,
      artifactChecksumSha256: approval.artifactChecksumSha256,
      approvalTimestamp: approval.approvalTimestamp,
      approvalRevision: approval.approvalRevision,
      ownerAttestationArtifactId: approval.ownerAttestationArtifactId,
      approvedRecordCount: approval.approvedRecordIds?.length || 0,
      approvedSequenceCount: approval.approvedSequenceIds?.length || 0,
      approvedSequenceSegmentCount: approval.approvedSequenceOrder?.length || 0,
      derivativeExecutionAuthorized: approval.derivativeExecutionAuthorized === true,
      publicationAuthorized: approval.publicationAuthorized === true
    } : null,
    approvalControlRendered: false,
    sourceFilesModified: 0,
    mediaCopied: 0,
    mediaTranscoded: 0,
    derivativesGenerated: 0,
    publicFilesWritten: 0,
    externalUploads: 0
  };
}

async function canonicalApprovedPilotPayload() {
  const gate = await getCanonicalGateSnapshot();
  const artifacts = artifactSnapshot();
  const approval = artifacts.approval;
  if (!gate.gatePassed || gate.blockerCount !== 0 || approval?.approvalState !== "owner_approved") {
    throw Object.assign(new Error("The approved pilot is unavailable."), { statusCode: 409 });
  }
  return {
    artifactType: "teoyubeworld_approved_pilot_summary",
    schemaVersion: "1.0.0",
    gateState: "owner_approved",
    lifecycleState: determineLifecycleState(gate, artifacts),
    pilotPlanId: approval.pilotPlanId,
    approvalArtifactId: `teoyubeworld-approved-pilot-${String(approval.artifactChecksumSha256 || "").slice(0, 12)}`,
    approvalArtifactChecksumSha256: approval.artifactChecksumSha256,
    approvalTimestamp: approval.approvalTimestamp,
    approvalRevision: approval.approvalRevision,
    ownerAttestationArtifactId: approval.ownerAttestationArtifactId,
    approvedRecordIds: [...(approval.approvedRecordIds || [])],
    approvedSequenceIds: [...(approval.approvedSequenceIds || [])],
    approvedSequenceOrder: [...(approval.approvedSequenceOrder || [])],
    approvedRecordCount: approval.approvedRecordIds?.length || 0,
    approvedSequenceCount: approval.approvedSequenceIds?.length || 0,
    approvedSequenceSegmentCount: approval.approvedSequenceOrder?.length || 0,
    approvedLongFormCount: 0,
    blockerCount: 0,
    sourceIntegrityPassed: true,
    derivativeExecutionAuthorized: Boolean(artifacts.derivativeExecutionAuthorization),
    publicationAuthorized: Boolean(artifacts.publicationAuthorization),
    derivativesGenerated: artifacts.derivatives?.successfulOperationCount || 0,
    mediaCopied: 0,
    mediaTranscoded: 0,
    publicFilesWritten: 0
  };
}

function sanitizedDerivativePlanPayload(plan) {
  if (!plan) return null;
  const safe = JSON.parse(JSON.stringify(plan));
  if (/[A-Za-z]:[\\/]/.test(JSON.stringify(safe))) throw new Error("The derivative plan contains a disallowed absolute path.");
  return safe;
}

function currentPreExecutionLifecycleState() {
  const artifacts = artifactSnapshot();
  return determineLifecycleState({ gatePassed: true, blockers: [] }, artifacts);
}

function readJsonIfExists(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : null;
}

function derivativeVariantDefinition(variant) {
  return {
    card: { fileName: "card-preview.mp4", mimeType: "video/mp4", profile: "card-preview-mp4" },
    mobile: { fileName: "mobile-preview.mp4", mimeType: "video/mp4", profile: "mobile-preview-mp4" },
    poster: { fileName: "poster.webp", mimeType: "image/webp", profile: "poster-webp" },
    thumbnail: { fileName: "thumbnail.webp", mimeType: "image/webp", profile: "thumbnail-webp" }
  }[variant] || null;
}

function validatedDerivativeFile(mediaId, variant) {
  if (!/^media-[a-f0-9]{20}$/i.test(mediaId || "")) return null;
  const definition = derivativeVariantDefinition(variant);
  const manifest = readJsonIfExists(runtimeManifestPreviewPath);
  const validation = readJsonIfExists(derivativeValidationPath);
  const record = manifest?.records?.find((item) => item.mediaId === mediaId);
  const operation = validation?.operationValidations?.find((item) => item.mediaId === mediaId && item.profile === definition?.profile && item.valid === true);
  if (!definition || manifest?.status !== "preview_only" || !record || !operation) return null;
  const derivativesRoot = path.join(derivativePilotRoot, "derivatives");
  const filePath = path.join(derivativesRoot, mediaId, definition.fileName);
  if (!isContainedPath(derivativesRoot, filePath) || !fs.existsSync(filePath)) return null;
  return { filePath, mimeType: definition.mimeType, operation, record };
}

function validatedPublishedPilotFile(pathname) {
  if (!String(pathname || "").startsWith("/media/teoyubeworld/pilot-v1/")) return null;
  const plan = readJsonIfExists(publicationPlanPath);
  const authorization = readJsonIfExists(publicationAuthorizationPath);
  const receipt = readJsonIfExists(publicationReceiptPath);
  const lifecycleReceipt = readJsonIfExists(lifecyclePaths.publicationReceipt);
  if (!plan || !authorization || !receipt || !lifecycleReceipt) return null;
  if (plan.planChecksumSha256 !== EXPECTED_PUBLICATION_PLAN_CHECKSUM || artifactChecksum(plan, "planChecksumSha256") !== EXPECTED_PUBLICATION_PLAN_CHECKSUM) return null;
  if (authorization.artifactChecksumSha256 !== artifactChecksum(authorization) || authorization.publicationPlanChecksumSha256 !== plan.planChecksumSha256) return null;
  if (receipt.lifecycleState !== "published" || receipt.artifactChecksumSha256 !== artifactChecksum(receipt) || lifecycleReceipt.artifactChecksumSha256 !== receipt.artifactChecksumSha256) return null;
  if (receipt.publicationAuthorizationChecksumSha256 !== authorization.artifactChecksumSha256 || receipt.publicationPlanChecksumSha256 !== plan.planChecksumSha256) return null;
  const item = plan.items?.find((candidate) => candidate.proposedPublicUrl === pathname);
  if (!item) return null;
  let filePath;
  try { filePath = resolveProjectPath(item.proposedPublicPath); } catch { return null; }
  if (!isWithin(publishedPilotRoot, filePath) || !fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size !== item.byteSize || sha256File(filePath) !== item.checksumSha256) return null;
  const mimeType = path.extname(filePath).toLowerCase() === ".mp4" ? "video/mp4"
    : path.extname(filePath).toLowerCase() === ".webp" ? "image/webp"
      : path.extname(filePath).toLowerCase() === ".json" ? "application/json; charset=utf-8"
        : null;
  return mimeType ? { filePath, mimeType, item, stat } : null;
}

function derivativeReviewPayload() {
  const manifest = readJsonIfExists(runtimeManifestPreviewPath);
  const validation = readJsonIfExists(derivativeValidationPath);
  const execution = readJsonIfExists(executionResultPath);
  const sourceIntegrity = readJsonIfExists(sourceIntegrityAfterPath);
  if (!manifest || manifest.recordCount !== 12 || !validation?.valid || validation.validatedOperationCount !== 48 || !execution) {
    throw Object.assign(new Error("Validated pilot derivatives are unavailable."), { statusCode: 409 });
  }
  const { manifest: draft, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(draft, patches, sourceChecksum);
  if (!merged.valid) throw Object.assign(new Error("The canonical media workspace is invalid."), { statusCode: 409 });
  const sourceById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  const integrityById = new Map((sourceIntegrity?.records || []).map((record) => [record.mediaId, record]));
  const operationByMedia = new Map();
  for (const operation of validation.operationValidations || []) {
    if (!operationByMedia.has(operation.mediaId)) operationByMedia.set(operation.mediaId, {});
    operationByMedia.get(operation.mediaId)[operation.variant] = operation;
  }
  const records = manifest.records.map((record) => {
    const source = sourceById.get(record.mediaId) || {};
    const operations = operationByMedia.get(record.mediaId) || {};
    const sourceBytes = Number(integrityById.get(record.mediaId)?.byteSizeAfter || 0);
    const variants = Object.fromEntries(["card", "mobile", "poster", "thumbnail"].map((variant) => {
      const operation = operations[variant];
      return [variant, {
        url: `/__qa/teoyubeworld/derivative/${record.mediaId}/${variant}?qa=1`,
        bytes: Number(operation?.outputBytes || 0),
        checksumSha256: operation?.outputChecksumSha256 || null,
        width: operation?.width || null,
        height: operation?.height || null,
        durationSeconds: operation?.durationSeconds || null,
        codec: operation?.codec || null,
        pixelFormat: operation?.pixelFormat || null,
        valid: operation?.valid === true,
        compressionRatio: sourceBytes ? Number((Number(operation?.outputBytes || 0) / sourceBytes).toFixed(4)) : null
      }];
    }));
    return {
      mediaId: record.mediaId,
      title: record.title,
      description: record.description,
      ScriptureReference: record.ScriptureReference,
      sequenceId: record.sequenceId,
      sequenceTitle: record.sequenceTitle,
      sequenceOrder: record.sequenceOrder,
      durationSeconds: record.durationSeconds,
      hasAudio: record.hasAudio,
      orientation: record.orientation,
      sourceTechnical: {
        bytes: sourceBytes,
        width: source.width || null,
        height: source.height || null,
        durationSeconds: source.durationSeconds || null,
        hasAudio: Boolean(source.hasAudio),
        orientation: source.orientation || null,
        integrityPassed: integrityById.get(record.mediaId) ? !integrityById.get(record.mediaId).checksumChanged && !integrityById.get(record.mediaId).byteSizeChanged && !integrityById.get(record.mediaId).modificationTimeChanged : false
      },
      variants,
      qa: {
        generated: Object.values(variants).every((variant) => variant.bytes > 0),
        ffprobeValid: Object.values(operations).every((operation) => operation.ffprobeValid),
        durationValid: [operations.card, operations.mobile].every((operation) => operation?.valid),
        dimensionsValid: Object.values(operations).every((operation) => operation?.width && operation?.height),
        orientationValid: Object.values(operations).every((operation) => operation?.orientationValid),
        codecValid: Object.values(operations).every((operation) => operation?.codec === "h264" || operation?.codec === "webp"),
        audioPolicyValid: Object.values(operations).every((operation) => operation?.audioPolicyValid),
        checksumValid: Object.values(operations).every((operation) => operation?.checksumValid),
        posterValid: operations.poster?.valid === true,
        thumbnailValid: operations.thumbnail?.valid === true,
        sourceUnchanged: integrityById.get(record.mediaId) ? !integrityById.get(record.mediaId).checksumChanged : false,
        readyForPublicationPreview: Object.values(operations).length === 4 && Object.values(operations).every((operation) => operation.valid)
      }
    };
  });
  const payload = {
    artifactType: "teoyubeworld_owner_derivative_review",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.2",
    lifecycleState: currentPreExecutionLifecycleState(),
    publicationAuthorized: Boolean(artifactSnapshot().publicationAuthorization),
    publicFilesWritten: artifactSnapshot().publicationReceipt?.totalFilesPublished || 0,
    summary: {
      approvedRecords: records.length,
      validatedOperations: validation.validatedOperationCount,
      cardPreviews: validation.cardCount,
      mobilePreviews: validation.mobileCount,
      posters: validation.posterCount,
      thumbnails: validation.thumbnailCount,
      generatedBytes: execution.totalGeneratedBytes,
      sourceIntegrityPassed: sourceIntegrity?.valid === true,
      publicMediaUnchanged: validation.publicMediaUnchanged === true
    },
    sequence: {
      sequenceId: records[0]?.sequenceId || null,
      title: records[0]?.sequenceTitle || "No Other Gospel",
      ScriptureReference: "Galatians 1:1-12",
      segmentCount: records.length,
      orderValid: records.every((record, index) => record.sequenceOrder === index + 1),
      duplicateSegmentIds: new Set(records.map((record) => record.mediaId)).size !== records.length,
      allCardDerivativesValid: records.every((record) => record.variants.card.valid),
      allPostersValid: records.every((record) => record.variants.poster.valid),
      allThumbnailsValid: records.every((record) => record.variants.thumbnail.valid)
    },
    records,
    operationLog: execution.operationResults.map((operation) => ({
      operationId: operation.operationId,
      mediaId: operation.mediaId,
      profile: operation.profile,
      status: operation.status,
      outputBytes: operation.outputBytes,
      validationStatus: operation.validationStatus,
      commandExitCode: operation.commandExitCode
    })),
    errors: validation.errors || [],
    warnings: validation.warnings || [],
    publicationPlanPresent: fs.existsSync(publicationPlanPath)
  };
  if (/[A-Za-z]:[\\/]/.test(JSON.stringify(payload))) throw new Error("Derivative review payload contains an absolute path.");
  return payload;
}

function assistedArtifactAllowlist(candidate) {
  const values = [
    ...Object.values(candidate?.reviewArtifacts?.posters || {}),
    ...Object.values(candidate?.reviewArtifacts?.contactSheets || {}),
    candidate?.reviewArtifacts?.sequenceContactSheet,
    candidate?.reviewArtifacts?.sequenceMotionStrip,
    ...(candidate?.candidateSequences || []).map((item) => item.previewPath)
  ];
  return new Set(values.filter(Boolean));
}

function isProtectedRequestPath(pathname) {
  const normalizedPath = String(pathname || "/")
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .toLowerCase();

  return protectedPathPrefixes.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  );
}

function isLoopbackRequest(req) {
  const address = String(req.socket?.remoteAddress || "").toLowerCase();
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function isQaRequest(req, url) {
  return isLoopbackRequest(req) && url.searchParams.get("qa") === "1";
}

function isContainedPath(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function loadMediaReviewManifest() {
  const stat = fs.statSync(mediaReviewDraftPath);
  if (mediaReviewManifestCache?.mtimeMs === stat.mtimeMs) return mediaReviewManifestCache;
  const raw = fs.readFileSync(mediaReviewDraftPath, "utf8");
  const manifest = JSON.parse(raw);
  const records = Array.isArray(manifest.records) ? manifest.records : [];
  const byId = new Map(records.map((record) => [record.id, record]));
  mediaReviewManifestCache = {
    manifest,
    byId,
    mtimeMs: stat.mtimeMs,
    checksum: crypto.createHash("sha256").update(raw).digest("hex")
  };
  return mediaReviewManifestCache;
}

function getReviewMediaFile(mediaId) {
  if (!/^media-[a-f0-9]{20}$/i.test(mediaId || "")) return null;
  const { byId } = loadMediaReviewManifest();
  const record = byId.get(mediaId);
  if (!record || !browserPlayableMimeTypes.has(record.mimeType)) return null;
  const relativePath = String(record.relativeSourcePath || "").replace(/\\/g, "/");
  if (!relativePath || relativePath.includes("\0") || relativePath.split("/").includes("..")) return null;
  const filePath = path.resolve(mediaOriginalsRoot, ...relativePath.split("/"));
  if (!isContainedPath(mediaOriginalsRoot, filePath)) return null;
  return { record, filePath };
}

function parseRangeHeader(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(String(value || "").trim());
  if (!match) return null;
  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= size || end < start) return null;
  return { start, end: Math.min(end, size - 1) };
}

function collectRequestBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(Object.assign(new Error("Request is too large."), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function collectJsonRequest(req, limitBytes = 64 * 1024) {
  if (String(req.headers["content-type"] || "").split(";")[0] !== "application/json") {
    throw Object.assign(new Error("A JSON request is required."), { statusCode: 415 });
  }
  const body = await collectRequestBody(req, limitBytes);
  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    throw Object.assign(new Error("Request JSON is invalid."), { statusCode: 400 });
  }
}

function writeJsonWithBackup(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) {
    const backupRoot = path.join(path.dirname(filePath), "backups");
    fs.mkdirSync(backupRoot, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.copyFileSync(filePath, path.join(backupRoot, `${path.basename(filePath, ".json")}-${stamp}.json`));
  }
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function sendNotFound(res) {
  res.writeHead(404, { "Cache-Control": "no-store" });
  res.end("Not found");
}

function loadLocalEnv() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(root, name);
    if (!fs.existsSync(envPath)) continue;

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}

loadLocalEnv();

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const teoyubeWorldFallbackVideos = [
  {
    id: "local-seed-of-promise",
    title: "The Seed of Promise",
    category: "Teaching",
    description: "A local TeoyubeWorld preview about tending promise language through Scripture and faithful action.",
    thumbnail: "public/images/embed/embedded-videos-hero-bg.png",
    scriptureReferences: ["2 Corinthians 5:17", "Ephesians 1:18"]
  },
  {
    id: "local-power-of-prayer",
    title: "The Power of Prayer",
    category: "Message",
    description: "A local preview for prayer, surrender, wisdom, and one faithful next step.",
    thumbnail: "public/images/today/teoyubeworld-search-bg.png",
    scriptureReferences: ["Proverbs 3:5-6", "James 1:5"]
  },
  {
    id: "local-walk-in-purpose",
    title: "Walk in Divine Purpose",
    category: "Teaching",
    description: "A cautious calling preview that connects purpose, courage, and Scripture without claiming certainty.",
    thumbnail: "public/images/table/calling-compass-panel-bg.png",
    scriptureReferences: ["Romans 8:28", "Joshua 1:9"]
  },
  {
    id: "local-rooted-in-truth",
    title: "Rooted in His Word",
    category: "Documentary",
    description: "A local preview about Scripture as the highest authority over Teoyube language aids.",
    thumbnail: "public/images/search/search-purpose-hero.png",
    scriptureReferences: ["Psalm 119:105", "Ephesians 1:18"]
  },
  {
    id: "local-called-for-more",
    title: "Called for More",
    category: "Short",
    description: "A short local preview encouraging prayerful testing of calling through Scripture, fruit, counsel, and time.",
    thumbnail: "public/images/canon/journey-calling.png",
    scriptureReferences: ["Ephesians 2:10", "Romans 8:28"]
  },
  {
    id: "local-strength-for-today",
    title: "Strength for Today",
    category: "Worship",
    description: "A worship preview for renewed strength, patient trust, and hope in waiting.",
    thumbnail: "public/images/carousel/kingdom-wisdom.png",
    scriptureReferences: ["Isaiah 40:31"]
  }
];

let promiseSeedFallback = [];

try {
  promiseSeedFallback = require("./scripts/seedDB").promiseSearchSeeds || [];
} catch {
  promiseSeedFallback = [];
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

async function getTeoyubeWorldVideos(query) {
  const normalizedQuery = normalizeText(query || "TeoyubeWorld");
  const normalizedNeedle = normalizedQuery.replace(/\bteoyubeworld\b/g, "").trim();
  const videos = getFallbackTeoyubeWorldVideos();
  const filtered = normalizedNeedle
    ? videos.filter((video) =>
        normalizeText([
          video.title,
          video.category,
          video.description,
          video.channelTitle,
          ...(video.scriptureReferences || [])
        ].join(" ")).includes(normalizedNeedle)
      )
    : videos;

  return filtered.length ? filtered : videos;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getFallbackTeoyubeWorldVideos() {
  return teoyubeWorldFallbackVideos.map((video) => ({
    ...video,
    channelTitle: "TeoyubeWorld",
    publishedAt: "",
    sourceStatus: "source_not_connected"
  }));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/__qa/teoyubeworld/media-status") {
    if (!isQaRequest(req, url) || req.method !== "GET") return sendNotFound(res);
    try {
      const { manifest } = loadMediaReviewManifest();
      const records = Array.isArray(manifest.records) ? manifest.records : [];
      sendJson(res, 200, {
        reviewPlaybackEnabled: true,
        draftManifestLoaded: true,
        recordCount: records.length,
        supportedBrowserPlayableCount: records.filter((record) => browserPlayableMimeTypes.has(record.mimeType)).length,
        unsupportedCount: Math.max(0, Number(manifest.sourceFileCount || 3975) - records.length),
        absolutePathsExposed: false,
        localOnly: true
      });
    } catch {
      sendJson(res, 503, {
        reviewPlaybackEnabled: false,
        draftManifestLoaded: false,
        recordCount: 0,
        supportedBrowserPlayableCount: 0,
        unsupportedCount: 0,
        absolutePathsExposed: false,
        localOnly: true
      });
    }
    return;
  }

  if (pathname === "/__qa/teoyubeworld/runtime-acceptance") {
    if (!isQaRequest(req, url) || !["GET", "POST"].includes(req.method)) return sendNotFound(res);
    if (req.method === "GET") {
      getRuntimeAcceptanceGate()
        .then(({ result }) => sendJson(res, 200, result))
        .catch((error) => sendJson(res, 503, {
          runtimeAcceptance: "blocked",
          ready: false,
          accepted: false,
          acceptanceControlVisible: false,
          blockerCount: 1,
          blockers: [{ code: "runtime_acceptance_validation_failed", message: error.message || "Runtime acceptance validation failed." }]
        }));
      return;
    }
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    collectJsonRequest(req)
      .then((body) => acceptPublishedPilotRuntime(body.ownerConfirmation))
      .then((result) => sendJson(res, result.statusCode || (result.accepted ? 201 : 409), result))
      .catch((error) => sendJson(res, error.statusCode || 503, {
        accepted: false,
        runtimeAcceptance: "blocked",
        blockerCount: 1,
        blockers: [{ code: "runtime_acceptance_request_failed", message: error.message || "Runtime acceptance request failed." }]
      }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/assisted-pilot") {
    if (!isQaRequest(req, url) || req.method !== "GET") return sendNotFound(res);
    Promise.resolve()
      .then(async () => {
        sendJson(res, 200, await canonicalAssistedPilotPayload());
      })
      .catch((error) => sendJson(res, 503, { error: error.message || "The assisted pilot could not be loaded.", state: "blocked" }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/assisted-pilot/review-artifact") {
    if (!isQaRequest(req, url) || !["GET", "HEAD"].includes(req.method)) return sendNotFound(res);
    try {
      const candidate = readAssistedCandidate();
      const asset = String(url.searchParams.get("asset") || "").replace(/\\/g, "/");
      if (!candidate || !assistedArtifactAllowlist(candidate).has(asset) || !/^review\/[a-z0-9_./-]+\.jpg$/i.test(asset)) return sendNotFound(res);
      const filePath = path.resolve(mediaGeneratedRoot, ...asset.split("/"));
      if (!isContainedPath(mediaGeneratedRoot, filePath) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return sendNotFound(res);
      const stat = fs.statSync(filePath);
      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Content-Length": stat.size,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer"
      });
      if (req.method === "HEAD") return res.end();
      fs.createReadStream(filePath).pipe(res);
    } catch {
      sendNotFound(res);
    }
    return;
  }

  if (pathname === "/__qa/teoyubeworld/assisted-pilot/record") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    collectJsonRequest(req)
      .then(async (body) => {
        assertCurrentStateRevision(body.stateRevision);
        const candidate = readAssistedCandidate();
        if (!candidate?.selectedShortIds?.includes(body.mediaId)) throw Object.assign(new Error("Only a selected assisted-pilot record may be reviewed here."), { statusCode: 422 });
        const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
        const current = applyPatches(manifest, patches, sourceChecksum).manifest.records.find((record) => record.id === body.mediaId);
        const canonical = getCanonicalPilotState();
        const suggestion = canonical.suggestions[body.mediaId];
        const scripture = parseScriptureReference(body.ScriptureReference);
        if (body.confirmScriptureReviewed === true && !scripture) throw Object.assign(new Error("A valid, non-placeholder Scripture reference is required before confirmation."), { statusCode: 422, code: "invalid_scripture_reference" });
        const translation = normalizeTranslation(body.translation);
        const rights = mapRightsStatus(body.rightsStatus || body.copyrightStatus);
        const safetyStatus = normalizeSafetyStatus(body.safetyStatus || (body.confirmSafety === true ? "approved_for_pilot" : "unknown"));
        const timestamp = new Date().toISOString();
        const title = String(body.title || "").trim();
        const description = String(body.description || "").trim();
        if (!title || !description) throw Object.assign(new Error("Title and description are required."), { statusCode: 422, code: "record_metadata_required" });
        const newValues = {
          title,
          description,
          titleSuggested: suggestion.title,
          titleAccepted: body.acceptTitle === true ? title : (current.titleAccepted || null),
          titleConfirmed: body.acceptTitle === true ? true : current.titleConfirmed === true,
          descriptionSuggested: suggestion.description,
          descriptionAccepted: body.acceptDescription === true ? description : (current.descriptionAccepted || null),
          descriptionConfirmed: body.acceptDescription === true ? true : current.descriptionConfirmed === true,
          mediaKind: "short",
          shortOrLong: "short",
          BibleBook: scripture?.BibleBook || null,
          chapter: scripture?.chapter || null,
          verseStart: scripture?.verseStart || null,
          verseEnd: scripture?.verseEnd || null,
          ScriptureReferences: scripture ? [scripture.reference] : [],
          scriptureReferenceSuggested: suggestion.scriptureReference,
          scriptureReferenceAccepted: body.acceptScripture === true && scripture ? scripture.reference : (current.scriptureReferenceAccepted || null),
          scriptureConfirmed: body.confirmScriptureReviewed === true && Boolean(scripture),
          scriptureConfirmedAt: body.confirmScriptureReviewed === true && scripture ? timestamp : (current.scriptureConfirmedAt || null),
          translation,
          translationConfirmed: body.confirmScriptureReviewed === true,
          mappingConfidence: body.confirmScriptureReviewed === true && scripture ? "confirmed" : (current.mappingConfidence || "needs_review"),
          ScriptureMappingStatus: body.confirmScriptureReviewed === true && scripture ? "confirmed" : (current.ScriptureMappingStatus || "needs_review"),
          sourceChannel: body.confirmOwnerSource === true ? (String(body.sourceChannel || "").trim() || null) : (current.sourceChannel || null),
          rightsStatus: rights.status,
          rightsConfirmed: body.confirmRights === true && rights.status !== "not_approved",
          rightsConfirmedAt: body.confirmRights === true && rights.status !== "not_approved" ? timestamp : (current.rightsConfirmedAt || null),
          copyrightStatus: body.confirmRights === true ? rights.copyrightStatus : (current.copyrightStatus || "needs_review"),
          safetyStatus,
          safetyConfirmed: body.confirmSafety === true && safetyStatus === "approved_for_pilot",
          safetyConfirmedAt: body.confirmSafety === true && safetyStatus === "approved_for_pilot" ? timestamp : (current.safetyConfirmedAt || null),
          reviewStatus: body.confirmRecordReviewed === true ? "approved" : (current.reviewStatus || "needs_review"),
          ownerReviewed: body.confirmRecordReviewed === true,
          ownerReviewedAt: body.confirmRecordReviewed === true ? timestamp : (current.ownerReviewedAt || null),
          ownerReviewVersion: body.confirmRecordReviewed === true ? OWNER_RECONFIRMATION_VERSION : (current.ownerReviewVersion || null),
          recommendedSurfaces: Array.isArray(body.recommendedSurfaces) ? body.recommendedSurfaces.map(String).slice(0, 12) : (current.recommendedSurfaces || []),
          ownerNotes: String(body.ownerNotes || "").trim() || null,
          technicalMetadataComplete: current.metadataProbeStatus === "complete"
        };
        const saved = writeReviewOperation("owner", body.mediaId, newValues, "Owner explicitly saved assisted-pilot record review.");
        incrementCanonicalStateRevision("owner_record_saved");
        const payload = await canonicalAssistedPilotPayload();
        sendJson(res, 200, { saved: true, mediaId: body.mediaId, operation: saved.operation, ...payload });
      })
      .catch((error) => sendJson(res, error.statusCode || 400, { saved: false, code: error.code || "record_save_failed", error: error.message || "The owner record review could not be saved.", canonicalRevision: error.canonicalRevision || null }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/assisted-pilot/selection") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    collectJsonRequest(req)
      .then(async (body) => {
        assertCurrentStateRevision(body.stateRevision);
        const candidate = readAssistedCandidate();
        if (!candidate?.selectedShortIds?.includes(body.mediaId) || typeof body.selected !== "boolean") {
          throw Object.assign(new Error("A known candidate record and explicit selection value are required."), { statusCode: 422 });
        }
        writeReviewOperation("pilot", body.mediaId, { pilotSelected: body.selected === true }, body.selected === true ? "Owner restored record to assisted pilot." : "Owner removed record from assisted pilot.");
        incrementCanonicalStateRevision("pilot_selection_saved");
        sendJson(res, 200, { saved: true, mediaId: body.mediaId, selected: body.selected === true, ...(await canonicalAssistedPilotPayload()) });
      })
      .catch((error) => sendJson(res, error.statusCode || 400, { saved: false, error: error.message || "The pilot selection could not be updated." }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/assisted-pilot/sequence") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    collectJsonRequest(req)
      .then(async (body) => {
        assertCurrentStateRevision(body.stateRevision);
        if (body.confirmSequence !== true) throw Object.assign(new Error("Explicit owner sequence confirmation is required."), { statusCode: 422 });
        const candidate = readAssistedCandidate();
        const selectedIds = new Set(candidate?.selectedShortIds || []);
        const segmentIds = Array.isArray(body.segmentIds) ? body.segmentIds.map(String) : [];
        const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
        const mergedRecords = applyPatches(manifest, patches, sourceChecksum).manifest.records;
        const activeSelectedIds = new Set(mergedRecords.filter((record) => selectedIds.has(record.id) && record.pilotSelected === true).map((record) => record.id));
        if (segmentIds.length < 5 || segmentIds.length > 12 || new Set(segmentIds).size !== segmentIds.length || segmentIds.some((id) => !activeSelectedIds.has(id))) {
          throw Object.assign(new Error("Choose five to twelve unique, currently selected records in a complete owner-confirmed order."), { statusCode: 422 });
        }
        const scripture = parseScriptureReference(body.ScriptureReference);
        if (!scripture) throw Object.assign(new Error("Enter an owner-reviewed Scripture reference such as Galatians 1:6-9."), { statusCode: 422 });
        const sequenceTitle = String(body.sequenceTitle || "").trim();
        if (!sequenceTitle) throw Object.assign(new Error("An owner-confirmed sequence title is required."), { statusCode: 422 });
        const sequenceId = String(body.sequenceId || candidate.recommendedSequenceId || "");
        if (!/^sequence-[a-f0-9]{16}$/i.test(sequenceId)) throw Object.assign(new Error("The selected sequence identifier is invalid."), { statusCode: 422 });
        const recordsById = new Map(mergedRecords.map((record) => [record.id, record]));
        for (const mediaId of selectedIds) {
          const position = segmentIds.indexOf(mediaId);
          const record = recordsById.get(mediaId);
          const newValues = position >= 0 ? {
            sequenceId,
            sequenceOrder: position + 1,
            sequenceTitle,
            sequenceDescription: "Owner-curated complete pilot Scripture sequence.",
            sequenceReviewStatus: "approved",
            segmentTitle: String(record?.title || record?.sourceFileName || `Segment ${position + 1}`),
            segmentScripture: scripture.reference,
            sequenceRole: "segment"
          } : {
            sequenceId: null,
            sequenceOrder: null,
            sequenceTitle: null,
            sequenceDescription: null,
            sequenceReviewStatus: "not_selected",
            segmentTitle: null,
            segmentScripture: null,
            sequenceRole: "standalone"
          };
          writeReviewOperation("sequence", mediaId, newValues, "Owner explicitly confirmed the assisted-pilot sequence definition and order.");
        }
        incrementCanonicalStateRevision("sequence_confirmation_saved");
        sendJson(res, 200, { saved: true, sequenceId, segmentIds, sequenceOrderValid: true, ...(await canonicalAssistedPilotPayload()) });
      })
      .catch((error) => sendJson(res, error.statusCode || 400, { saved: false, error: error.message || "The sequence review could not be saved." }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/assisted-pilot/bulk-review") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    collectJsonRequest(req)
      .then(async (body) => {
        assertCurrentStateRevision(body.stateRevision);
        const canonical = getCanonicalPilotState();
        const requested = new Set(Array.isArray(body.recordIds) && body.recordIds.length ? body.recordIds.map(String) : canonical.selectedRecords.map((record) => record.id));
        const records = canonical.selectedRecords.filter((record) => requested.has(record.id));
        if (!records.length) throw Object.assign(new Error("Choose at least one selected pilot record."), { statusCode: 422 });
        if (!new Set(["metadata", "scripture_suggestions", "rights", "safety"]).has(body.kind)) throw Object.assign(new Error("Choose a supported bulk review action."), { statusCode: 422 });
        const rights = body.kind === "rights" ? mapRightsStatus(body.status) : null;
        const safety = body.kind === "safety" ? normalizeSafetyStatus(body.status) : null;
        const affected = records.filter((record) => body.kind !== "rights" || body.includeAudio === true || record.hasAudio !== true);
        const warnings = records.filter((record) => body.kind === "rights" && body.includeAudio !== true && record.hasAudio === true).map((record) => `${record.id}: audio rights require explicit inclusion.`);
        const previewToken = crypto.createHash("sha256").update(JSON.stringify({ stateRevision: body.stateRevision, kind: body.kind, status: body.status || null, recordIds: affected.map((record) => record.id) })).digest("hex");
        if (body.preview === true) return sendJson(res, 200, { preview: true, kind: body.kind, affectedRecordIds: affected.map((record) => record.id), affectedCount: affected.length, warnings, previewToken, stateRevision: body.stateRevision, filesWritten: 0 });
        if (body.ownerConfirmation !== true || body.previewToken !== previewToken) throw Object.assign(new Error("Preview this bulk action and explicitly confirm the unchanged preview before applying it."), { statusCode: 422, code: "bulk_preview_required" });
        const timestamp = new Date().toISOString();
        for (const record of affected) {
          const suggestion = canonical.suggestions[record.id];
          let newValues;
          if (body.kind === "metadata") {
            newValues = { title: suggestion.title, titleSuggested: suggestion.title, titleAccepted: suggestion.title, titleConfirmed: true, description: suggestion.description, descriptionSuggested: suggestion.description, descriptionAccepted: suggestion.description, descriptionConfirmed: true };
          } else if (body.kind === "scripture_suggestions") {
            const scripture = parseScriptureReference(suggestion.scriptureReference);
            if (!scripture) continue;
            newValues = { ScriptureReferences: [scripture.reference], scriptureReferenceSuggested: scripture.reference, scriptureReferenceAccepted: scripture.reference, BibleBook: scripture.BibleBook, chapter: scripture.chapter, verseStart: scripture.verseStart, verseEnd: scripture.verseEnd, translation: "Unknown", translationConfirmed: false, scriptureConfirmed: false, mappingConfidence: "needs_review", ScriptureMappingStatus: "needs_review" };
          } else if (body.kind === "rights") {
            newValues = { rightsStatus: rights.status, copyrightStatus: rights.copyrightStatus, rightsConfirmed: false, rightsConfirmedAt: null };
          } else {
            newValues = { safetyStatus: safety, safetyConfirmed: false, safetyConfirmedAt: null };
          }
          writeReviewOperation("owner", record.id, newValues, `Owner explicitly applied previewed ${body.kind} values to the selected pilot.`);
        }
        incrementCanonicalStateRevision(`bulk_${body.kind}_saved`);
        sendJson(res, 200, { saved: true, kind: body.kind, affectedRecordIds: affected.map((record) => record.id), affectedCount: affected.length, warnings, ...(await canonicalAssistedPilotPayload()) });
      })
      .catch((error) => sendJson(res, error.statusCode || 400, { saved: false, code: error.code || "bulk_review_failed", error: error.message || "The bulk review action could not be saved.", canonicalRevision: error.canonicalRevision || null }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/assisted-pilot/reconfirmation") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    collectJsonRequest(req)
      .then(async (body) => {
        assertCurrentStateRevision(body.stateRevision);
        const declarationNames = ["watchedAndReviewed", "rights", "scriptureAndSequence", "safety"];
        if (declarationNames.some((name) => body.declarations?.[name] !== true)) throw Object.assign(new Error("All four owner reconfirmations must be checked explicitly."), { statusCode: 422, code: "owner_reconfirmation_required" });
        const canonical = getCanonicalPilotState();
        const sequence = getCanonicalSequenceState(canonical);
        const preflightGate = await getCanonicalGateSnapshot();
        const technicalPreflightBlockers = preflightGate.blockers.filter((blocker) => ["missing_source", "checksum_mismatch", "unsupported", "blocked_record", "technical_review", "patch_validation", "absolute_app_path"].includes(blocker.code));
        const ineligible = canonical.selectedRecords.flatMap((record) => {
          const normalized = normalizeCanonicalRecord(record, canonical.suggestions[record.id]);
          const reasons = [];
          if (!normalized.technicalMetadataComplete) reasons.push("technical metadata incomplete");
          if (!normalized.titleConfirmed || !normalized.descriptionConfirmed) reasons.push("metadata not accepted");
          if (!parseScriptureReference(normalized.scriptureReferenceAccepted)) reasons.push("Scripture not accepted");
          if (!APPROVED_TRANSLATIONS.has(normalized.translation)) reasons.push("translation invalid");
          if (normalized.rightsStatus === "not_approved") reasons.push("rights status not approved");
          if (normalized.safetyStatus !== "approved_for_pilot") reasons.push("safety not approved for pilot");
          const sourcePath = getReviewMediaFile(record.id)?.filePath;
          if (!sourcePath || !fs.existsSync(sourcePath)) reasons.push("source unavailable");
          return reasons.length ? [{ mediaId: record.id, reasons }] : [];
        });
        if (canonical.selectedRecords.length !== 12 || ineligible.length || technicalPreflightBlockers.length || !sequence.confirmed || sequence.segmentIds.length < 1) {
          throw Object.assign(new Error("The final reconfirmation is blocked until all 12 records, their checksums, and one sequence are eligible."), { statusCode: 409, code: "owner_reconfirmation_ineligible", ineligible: [...ineligible, ...technicalPreflightBlockers] });
        }
        const timestamp = new Date().toISOString();
        for (const record of canonical.selectedRecords) {
          const normalized = normalizeCanonicalRecord(record, canonical.suggestions[record.id]);
          const rights = mapRightsStatus(normalized.rightsStatus);
          writeReviewOperation("owner", record.id, {
            ownerReviewed: true, ownerReviewedAt: timestamp, ownerReviewVersion: OWNER_RECONFIRMATION_VERSION, reviewStatus: "approved",
            scriptureConfirmed: true, scriptureConfirmedAt: timestamp, translationConfirmed: true, mappingConfidence: "confirmed", ScriptureMappingStatus: "confirmed",
            rightsConfirmed: true, rightsConfirmedAt: timestamp, copyrightStatus: rights.copyrightStatus,
            safetyConfirmed: true, safetyConfirmedAt: timestamp, safetyStatus: "approved_for_pilot"
          }, "Owner explicitly applied the four pilot reconfirmations.");
        }
        const artifact = {
          schemaVersion: OWNER_RECONFIRMATION_VERSION,
          declarationVersion: OWNER_RECONFIRMATION_VERSION,
          pilotPlanId: canonical.pilotPlanId,
          manifestVersion: canonical.manifestVersion,
          appliedAt: timestamp,
          selectedRecordIds: canonical.selectedRecords.map((record) => record.id),
          sourceChecksums: Object.fromEntries(canonical.selectedRecords.map((record) => [record.id, record.checksumSha256])),
          declarations: Object.fromEntries(declarationNames.map((name) => [name, { confirmed: true, confirmedAt: timestamp, confirmedBy: "local_project_owner" }])),
          localOnly: true,
          runtimeManifestUpdated: false
        };
        writeJsonWithBackup(ownerReconfirmationPath, artifact);
        incrementCanonicalStateRevision("owner_reconfirmation_applied");
        sendJson(res, 200, { saved: true, declarationsApplied: true, ...(await canonicalAssistedPilotPayload()) });
      })
      .catch((error) => sendJson(res, error.statusCode || 400, { saved: false, code: error.code || "owner_reconfirmation_failed", error: error.message || "Owner reconfirmation could not be applied.", ineligible: error.ineligible || [], canonicalRevision: error.canonicalRevision || null }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/assisted-pilot/declaration") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    collectJsonRequest(req)
      .then(async (body) => {
        assertCurrentStateRevision(body.stateRevision);
        if (!["rights", "scripture", "safety"].includes(body.declaration) || typeof body.confirmed !== "boolean") {
          throw Object.assign(new Error("A known declaration and explicit true or false confirmation are required."), { statusCode: 422 });
        }
        const { sourceChecksum } = loadReviewWorkspace();
        const declarations = loadOwnerDeclarations(sourceChecksum) || emptyOwnerDeclarations(sourceChecksum);
        const timestamp = new Date().toISOString();
        declarations.updatedAt = timestamp;
        declarations.declarations[body.declaration] = {
          confirmed: body.confirmed === true,
          confirmedAt: body.confirmed === true ? timestamp : null,
          confirmedBy: body.confirmed === true ? "local_project_owner" : null
        };
        declarations.localOnly = true;
        declarations.runtimeManifestUpdated = false;
        writeJsonWithBackup(ownerDeclarationsPath, declarations);
        incrementCanonicalStateRevision("legacy_owner_declaration_saved");
        sendJson(res, 200, { saved: true, declaration: body.declaration, confirmed: body.confirmed === true, declarations, ...(await canonicalAssistedPilotPayload()) });
      })
      .catch((error) => sendJson(res, error.statusCode || 400, { saved: false, error: error.message || "The owner declaration could not be saved." }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/owner-gate-control") {
    if (!isQaRequest(req, url) || req.method !== "GET") return sendNotFound(res);
    validateTeoyubeWorldOwnerGate()
      .then((gateReport) => {
        const result = createApprovalControlResponse(gateReport, artifactSnapshot());
        sendJson(res, result.statusCode, result.payload);
      })
      .catch(() => sendJson(res, 503, {
        accepted: false,
        state: "blocked",
        gatePassed: false,
        blockerCount: 1,
        blockers: [{ code: "gate_validation_failed", message: "Complete owner-gate validation could not be completed.", mediaId: null }]
      }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/owner-approval") {
    if (!isQaRequest(req, url) || !["POST", "DELETE"].includes(req.method)) return sendNotFound(res);
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    if (req.method === "DELETE") {
      const result = revokeOwnerApproval();
      sendJson(res, result.statusCode, result.payload);
      return;
    }
    collectJsonRequest(req)
      .then(async (body) => {
        assertCurrentStateRevision(body.stateRevision);
        const gateReport = await getCanonicalGateSnapshot();
        if (artifactSnapshot().approval) {
          return sendJson(res, 409, {
            accepted: false,
            state: "owner_approved",
            blockerCount: 0,
            blockers: [{ code: "pilot_already_owner_approved", message: "The checksum-bound pilot definition is already owner-approved.", mediaId: null }],
            mediaFilesCreated: 0,
            sourceFilesModified: 0,
            publicFilesWritten: 0
          });
        }
        const result = requestOwnerApproval(gateReport, {
          ownerConfirmation: body.ownerConfirmation === true,
          confirmedBy: "local_project_owner"
        });
        sendJson(res, result.statusCode, result.payload);
      })
      .catch((error) => sendJson(res, error.statusCode || 503, {
        accepted: false,
        state: "blocked",
        blockerCount: 1,
        blockers: [{ code: "approval_request_failed", message: error.message || "Owner approval request failed.", mediaId: null }]
      }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/approved-pilot") {
    if (!isQaRequest(req, url) || req.method !== "GET") return sendNotFound(res);
    canonicalApprovedPilotPayload()
      .then((payload) => sendJson(res, 200, payload))
      .catch((error) => sendJson(res, error.statusCode || 503, {
        state: "blocked",
        error: error.message || "The approved pilot summary could not be loaded."
      }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/derivative-plan") {
    if (!isQaRequest(req, url) || !["GET", "POST"].includes(req.method)) return sendNotFound(res);
    if (req.method === "GET") {
      const plan = artifactSnapshot().derivativePlan;
      if (!plan) return sendJson(res, 404, { status: "not_planned", commandsExecuted: 0, publicFilesWritten: 0 });
      try {
        sendJson(res, 200, sanitizedDerivativePlanPayload(plan));
      } catch (error) {
        sendJson(res, 503, { status: "blocked", error: error.message, commandsExecuted: 0, publicFilesWritten: 0 });
      }
      return;
    }
    createApprovedPilotDerivativePlan()
      .then(({ plan }) => sendJson(res, 200, sanitizedDerivativePlanPayload(plan)))
      .catch((error) => sendJson(res, 503, { status: "blocked", lifecycleState: "blocked", error: error.message || "Complete owner-gate validation failed.", commandsExecuted: 0, mediaFilesCopied: 0, mediaFilesTranscoded: 0, publicFilesWritten: 0 }));
    return;
  }

  if (pathname === "/__qa/teoyubeworld/derivative-execution-authorization") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    sendJson(res, 409, { authorized: false, state: currentPreExecutionLifecycleState(), blockers: [{ code: "derivative_execution_authorization_already_recorded", message: "The checksum-bound derivative execution authorization has already been recorded. No browser control can replace or repeat it.", mediaId: null }], commandsExecuted: 0, mediaFilesCreated: 0 });
    return;
  }

  if (pathname === "/__qa/teoyubeworld/derivative-execution") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    sendJson(res, 409, { executed: false, state: currentPreExecutionLifecycleState(), blockers: [{ code: "derivative_execution_not_exposed", message: "Derivative execution is not exposed through the browser. The authorized pilot execution has completed under the checksum-bound local command workflow.", mediaId: null }], commandsExecuted: 0, mediaFilesCreated: 0 });
    return;
  }

  if (pathname === "/__qa/teoyubeworld/publication-authorization") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    sendJson(res, 409, { authorized: false, state: currentPreExecutionLifecycleState(), blockers: [{ code: "publication_authorization_not_exposed", message: "The checksum-bound publication authorization is recorded through the explicit local owner command only. No browser control can replace or repeat it.", mediaId: null }], filesPublished: artifactSnapshot().publicationReceipt?.totalFilesPublished || 0 });
    return;
  }

  if (pathname === "/__qa/teoyubeworld/publication") {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    sendJson(res, 409, { published: false, state: currentPreExecutionLifecycleState(), blockers: [{ code: "publication_execution_not_exposed", message: "Pilot publication is not exposed through a browser command. The checksum-bound local publication workflow has completed and cannot be repeated here.", mediaId: null }], filesPublished: artifactSnapshot().publicationReceipt?.totalFilesPublished || 0 });
    return;
  }

  if (pathname === "/__qa/teoyubeworld/derivative-review") {
    if (!isQaRequest(req, url) || req.method !== "GET") return sendNotFound(res);
    try {
      sendJson(res, 200, derivativeReviewPayload());
    } catch (error) {
      sendJson(res, error.statusCode || 503, { state: "blocked", error: error.message || "Derivative review data is unavailable." });
    }
    return;
  }

  const derivativeRoute = pathname.match(/^\/__qa\/teoyubeworld\/derivative\/(media-[a-f0-9]{20})\/(card|mobile|poster|thumbnail)$/i);
  if (derivativeRoute) {
    if (!isQaRequest(req, url) || !["GET", "HEAD"].includes(req.method)) return sendNotFound(res);
    try {
      const derivative = validatedDerivativeFile(derivativeRoute[1], derivativeRoute[2].toLowerCase());
      if (!derivative) return sendNotFound(res);
      const stat = fs.statSync(derivative.filePath);
      const commonHeaders = {
        "Content-Type": derivative.mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer"
      };
      if (derivative.mimeType === "video/mp4") commonHeaders["Accept-Ranges"] = "bytes";
      const rangeHeader = derivative.mimeType === "video/mp4" ? req.headers.range : null;
      if (rangeHeader) {
        const range = parseRangeHeader(rangeHeader, stat.size);
        if (!range) {
          res.writeHead(416, { ...commonHeaders, "Content-Range": `bytes */${stat.size}` });
          res.end();
          return;
        }
        const length = range.end - range.start + 1;
        res.writeHead(206, { ...commonHeaders, "Content-Length": length, "Content-Range": `bytes ${range.start}-${range.end}/${stat.size}` });
        if (req.method === "HEAD") return res.end();
        fs.createReadStream(derivative.filePath, { start: range.start, end: range.end }).on("error", () => res.destroy()).pipe(res);
        return;
      }
      res.writeHead(200, { ...commonHeaders, "Content-Length": stat.size });
      if (req.method === "HEAD") return res.end();
      fs.createReadStream(derivative.filePath).on("error", () => res.destroy()).pipe(res);
    } catch {
      sendNotFound(res);
    }
    return;
  }

  const mediaRoute = pathname.match(/^\/__qa\/teoyubeworld\/media\/(media-[a-f0-9]{20})$/i);
  if (mediaRoute) {
    if (!isQaRequest(req, url) || !["GET", "HEAD"].includes(req.method)) return sendNotFound(res);
    try {
      const media = getReviewMediaFile(mediaRoute[1]);
      if (!media || !fs.existsSync(media.filePath)) return sendNotFound(res);
      const stat = fs.statSync(media.filePath);
      if (!stat.isFile()) return sendNotFound(res);
      const commonHeaders = {
        "Content-Type": media.record.mimeType,
        "Content-Disposition": "inline",
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer"
      };
      const rangeHeader = req.headers.range;
      if (rangeHeader) {
        const range = parseRangeHeader(rangeHeader, stat.size);
        if (!range) {
          res.writeHead(416, { ...commonHeaders, "Content-Range": `bytes */${stat.size}` });
          res.end();
          return;
        }
        const length = range.end - range.start + 1;
        res.writeHead(206, {
          ...commonHeaders,
          "Content-Length": length,
          "Content-Range": `bytes ${range.start}-${range.end}/${stat.size}`
        });
        if (req.method === "HEAD") return res.end();
        fs.createReadStream(media.filePath, { start: range.start, end: range.end })
          .on("error", () => res.destroy())
          .pipe(res);
        return;
      }
      res.writeHead(200, { ...commonHeaders, "Content-Length": stat.size });
      if (req.method === "HEAD") return res.end();
      fs.createReadStream(media.filePath).on("error", () => res.destroy()).pipe(res);
    } catch {
      sendNotFound(res);
    }
    return;
  }

  const frameRoute = pathname.match(/^\/__qa\/teoyubeworld\/review-image\/(media-[a-f0-9]{20})$/i);
  if (frameRoute) {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    const captureType = url.searchParams.get("type");
    const contentType = String(req.headers["content-type"] || "").split(";")[0].toLowerCase();
    const extensions = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
    if (!extensions[contentType] || !["poster", "thumbnail"].includes(captureType)) {
      sendJson(res, 415, { error: "Only bounded PNG, JPEG, or WebP review images are accepted." });
      return;
    }
    try {
      if (!getReviewMediaFile(frameRoute[1])) return sendNotFound(res);
      collectRequestBody(req, 3 * 1024 * 1024).then((body) => {
        if (!body.length) return sendJson(res, 400, { error: "Review image is empty." });
        const folder = captureType === "poster" ? "posters" : "thumbnails";
        const fileName = `${frameRoute[1]}-${captureType}.${extensions[contentType]}`;
        const outputRoot = path.join(mediaGeneratedRoot, folder);
        const outputPath = path.join(outputRoot, fileName);
        if (!isContainedPath(mediaGeneratedRoot, outputPath)) return sendNotFound(res);
        fs.mkdirSync(outputRoot, { recursive: true });
        fs.writeFileSync(outputPath, body);
        const generatedPath = `${folder}/${fileName}`;
        const metadataPath = path.join(reviewReportsRoot, "review-frame-captures.json");
        const captures = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf8")) : [];
        captures.push({
          mediaId: frameRoute[1], captureType, generatedPath,
          timestamp: new Date().toISOString(), ownerReviewed: true,
          generatedBy: "browser-frame-capture", byteSize: body.length
        });
        writeJsonWithBackup(metadataPath, captures.slice(-1000));
        sendJson(res, 201, { mediaId: frameRoute[1], captureType, generatedPath, ownerReviewed: true });
      }).catch((error) => sendJson(res, error.statusCode || 400, { error: error.message || "Review image could not be stored." }));
    } catch {
      sendNotFound(res);
    }
    return;
  }

  const patchRoute = pathname.match(/^\/__qa\/teoyubeworld\/review-patch\/(technical|owner|duplicate|sequence|pilot)$/);
  if (patchRoute) {
    if (!isQaRequest(req, url) || req.method !== "POST") return sendNotFound(res);
    if (!requireAuthoritativeReviewWrite(req, res)) return;
    if (String(req.headers["content-type"] || "").split(";")[0] !== "application/json") {
      sendJson(res, 415, { error: "A JSON review patch is required." });
      return;
    }
    collectRequestBody(req, 4 * 1024 * 1024).then((body) => {
      const patch = JSON.parse(body.toString("utf8"));
      const manifest = loadMediaReviewManifest();
      if (!patch || !Array.isArray(patch.operations) || patch.sourceDraftManifestChecksum !== manifest.checksum) {
        sendJson(res, 422, { error: "Patch schema or source manifest checksum is invalid." });
        return;
      }
      if (/[A-Za-z]:[\\/]/.test(body.toString("utf8")) || body.includes(Buffer.from("../"))) {
        sendJson(res, 422, { error: "Patch contains a disallowed path value." });
        return;
      }
      patch.operationCount = patch.operations.length;
      patch.generatedAt = new Date().toISOString();
      patch.localOnly = true;
      patch.runtimeManifestUpdated = false;
      const fileName = reviewPatchFiles[patchRoute[1]];
      writeJsonWithBackup(path.join(reviewReportsRoot, fileName), patch);
      const revision = incrementCanonicalStateRevision(`legacy_${patchRoute[1]}_patch_saved`);
      sendJson(res, 200, { saved: true, patchType: patchRoute[1], operationCount: patch.operationCount, relativePath: `reports/${fileName}`, stateRevision: revision.stateRevision });
    }).catch((error) => sendJson(res, error.statusCode || 400, { error: "Review patch could not be saved." }));
    return;
  }

  if (pathname === "/api/media-review/draft") {
    if (!isQaRequest(req, url)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    fs.readFile(mediaReviewDraftPath, "utf8", (error, content) => {
      if (error) {
        sendJson(res, 404, { error: "Draft manifest is not available." });
        return;
      }
      try {
        JSON.parse(content);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
        res.end(content);
      } catch {
        sendJson(res, 500, { error: "Draft manifest is invalid." });
      }
    });
    return;
  }

  if (isProtectedRequestPath(pathname)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  if (pathname.startsWith("/media/teoyubeworld/pilot-v1/")) {
    if (!["GET", "HEAD"].includes(req.method)) return sendNotFound(res);
    const published = validatedPublishedPilotFile(pathname);
    if (!published) return sendNotFound(res);
    const headers = {
      "Content-Type": published.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": pathname.endsWith("/runtime-manifest.json") ? "no-store" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    };
    if (published.mimeType === "video/mp4") headers["Accept-Ranges"] = "bytes";
    const rangeHeader = published.mimeType === "video/mp4" ? req.headers.range : null;
    if (rangeHeader) {
      const range = parseRangeHeader(rangeHeader, published.stat.size);
      if (!range) {
        res.writeHead(416, { ...headers, "Content-Range": `bytes */${published.stat.size}` });
        res.end();
        return;
      }
      const length = range.end - range.start + 1;
      res.writeHead(206, { ...headers, "Content-Length": length, "Content-Range": `bytes ${range.start}-${range.end}/${published.stat.size}` });
      if (req.method === "HEAD") return res.end();
      fs.createReadStream(published.filePath, { start: range.start, end: range.end }).on("error", () => res.destroy()).pipe(res);
      return;
    }
    res.writeHead(200, { ...headers, "Content-Length": published.stat.size });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(published.filePath).on("error", () => res.destroy()).pipe(res);
    return;
  }

  if (pathname === "/api/youtube/teoyube") {
    getTeoyubeWorldVideos(url.searchParams.get("q") || "TeoyubeWorld")
      .then((videos) =>
        sendJson(res, 200, {
          videos: videos.length ? videos : getFallbackTeoyubeWorldVideos(),
          sourceStatus: "source_not_connected",
          message: "Local TeoyubeWorld preview data only. External media lookup is disabled."
        })
      )
      .catch((error) =>
        sendJson(res, 200, {
          videos: getFallbackTeoyubeWorldVideos(),
          sourceStatus: "source_not_connected",
          error: error?.message || "Using local TeoyubeWorld preview data."
        })
      );
    return;
  }

  if (pathname === "/api/promises/seed") {
    sendJson(res, 200, {
      promises: promiseSeedFallback
    });
    return;
  }

  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(root, safePath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(content);
  });
});

function checkExistingTeoyubeServer() {
  return new Promise((resolve) => {
    const request = http.get(`http://localhost:${port}/index.html`, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve(response.statusCode === 200 && body.includes("<title>TEOYUBE App</title>"));
      });
    });

    request.on("error", () => resolve(false));
    request.setTimeout(2000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

server.on("error", async (error) => {
  if (error.code !== "EADDRINUSE") {
    console.error(error);
    process.exit(1);
  }

  const teoyubeAlreadyRunning = await checkExistingTeoyubeServer();
  if (teoyubeAlreadyRunning) {
    console.log(`TEOYUBE prototype is already running at http://localhost:${port}`);
    process.exit(0);
  }

  console.error(`Port ${port} is already in use by another service.`);
  process.exit(1);
});

if (require.main === module) {
  server.listen(port, () => {
    console.log(`TEOYUBE prototype running at http://localhost:${port}`);
  });
}

module.exports = {
  server,
  isLoopbackRequest,
  isQaRequest,
  loadMediaReviewManifest
};
