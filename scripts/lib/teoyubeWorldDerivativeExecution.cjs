const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const {
  generatedRoot,
  loadReviewWorkspace,
  applyPatches
} = require("./teoyubeWorldReviewPatches.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState,
  fingerprint
} = require("./teoyubeWorldPilotLifecycle.cjs");
const {
  getCanonicalPilotState,
  ensureCanonicalStateRevision,
  ownerAttestationPath
} = require("./teoyubeWorldCanonicalPilotState.cjs");
const { getCanonicalGateSnapshot } = require("../validateTeoyubeWorldOwnerGate.cjs");
const { resolveExplicitExecutable } = require("../checkFfmpegReadiness.cjs");

const projectRoot = path.resolve(__dirname, "..", "..");
const sourceRoot = path.join(projectRoot, "media-source", "teoyubeworld", "originals");
const publicMediaRoot = path.join(projectRoot, "public", "media");
const pilotRoot = path.join(generatedRoot, "pilot-v1");
const derivativePlanPath = path.join(pilotRoot, "plans", "derivative-plan.json");
const executionRoot = path.join(pilotRoot, "execution");
const authorizationRoot = path.join(pilotRoot, "authorizations");
const temporaryRoot = path.join(pilotRoot, "temporary");
const logsRoot = path.join(pilotRoot, "logs");
const manifestsRoot = path.join(pilotRoot, "manifests");
const frozenPlanPath = path.join(executionRoot, "frozen-derivative-plan.json");
const preExecutionSnapshotPath = path.join(executionRoot, "pre-execution-snapshot.json");
const executionAuthorizationPath = path.join(authorizationRoot, "derivative-execution-authorization.json");
const executionResultPath = path.join(executionRoot, "derivative-execution-result.json");
const executionLedgerPath = path.join(executionRoot, "derivative-operation-ledger.json");
const sourceIntegrityAfterPath = path.join(executionRoot, "source-integrity-after-execution.json");
const derivativeValidationPath = path.join(executionRoot, "derivative-validation.json");
const runtimeManifestPreviewPath = path.join(manifestsRoot, "runtime-manifest.preview.json");
const publicationPlanPath = path.join(pilotRoot, "plans", "publication-plan.json");

const EXPECTED_APPROVAL_CHECKSUM = "41856ce2093afb055a2b0253666415b3ade5b3709292d1cf4edeb28db7deb96a";
const EXPECTED_CANONICAL_REVISION = "pilot-r120-583481b46fb0";
const EXPECTED_RECORD_COUNT = 12;
const EXPECTED_SEQUENCE_ID = "sequence-402caf80cdbf4d17";
const EXPECTED_OPERATION_COUNT = 48;
const EXACT_EXECUTION_AUTHORIZATION = "AUTHORIZE APPROVED PILOT DERIVATIVE EXECUTION";

const PROFILE_DEFINITIONS = Object.freeze({
  "card-preview-mp4": {
    variant: "card",
    suffix: "card-preview.mp4",
    mimeType: "video/mp4",
    kind: "video",
    maxWidth: 1280,
    maxHeight: 720,
    videoCodec: "h264",
    pixelFormat: "yuv420p"
  },
  "mobile-preview-mp4": {
    variant: "mobile",
    suffix: "mobile-preview.mp4",
    mimeType: "video/mp4",
    kind: "video",
    maxWidth: 854,
    maxHeight: 480,
    videoCodec: "h264",
    pixelFormat: "yuv420p"
  },
  "poster-webp": {
    variant: "poster",
    suffix: "poster.webp",
    mimeType: "image/webp",
    kind: "poster",
    maxWidth: 1280,
    maxHeight: 900,
    videoCodec: "webp"
  },
  "thumbnail-webp": {
    variant: "thumbnail",
    suffix: "thumbnail.webp",
    mimeType: "image/webp",
    kind: "thumbnail",
    maxWidth: 480,
    maxHeight: 480,
    videoCodec: "webp"
  }
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2) + "\n", "utf8");
  fs.renameSync(temporaryPath, filePath);
}

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  const descriptor = fs.openSync(filePath, "r");
  const buffer = Buffer.allocUnsafe(4 * 1024 * 1024);
  try {
    let bytesRead;
    do {
      bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytesRead) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead);
  } finally {
    fs.closeSync(descriptor);
  }
  return hash.digest("hex");
}

function artifactChecksum(value, checksumField = "artifactChecksumSha256") {
  const copy = { ...value };
  delete copy[checksumField];
  return fingerprint(copy);
}

function projectPath(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function isWithin(parent, candidate, allowEqual = false) {
  const relative = path.relative(parent, candidate);
  if (relative === "") return allowEqual;
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

function resolveProjectPath(relativePath) {
  const text = String(relativePath || "").replace(/\\/g, "/");
  if (!text || path.isAbsolute(text) || /^[A-Za-z]:/.test(text) || text.split("/").includes("..") || text.includes("\0")) {
    throw new Error(`Unsafe project-relative path: ${text || "<empty>"}`);
  }
  const resolved = path.resolve(projectRoot, ...text.split("/"));
  if (!isWithin(projectRoot, resolved)) throw new Error(`Path escapes the project: ${text}`);
  return resolved;
}

function assertNoAbsoluteWindowsPath(value, label) {
  if (/[A-Za-z]:[\\/]/.test(JSON.stringify(value))) throw new Error(`${label} contains an absolute Windows path.`);
}

function snapshotTree(rootPath, options = {}) {
  if (!fs.existsSync(rootPath)) return { exists: false, fileCount: 0, totalBytes: 0, files: [], fingerprint: fingerprint([]) };
  const files = [];
  const stack = [rootPath];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) stack.push(fullPath);
      if (!entry.isFile()) continue;
      if (options.exclude && options.exclude(fullPath)) continue;
      const stat = fs.statSync(fullPath);
      files.push({
        path: path.relative(rootPath, fullPath).replace(/\\/g, "/"),
        bytes: stat.size,
        mtimeMs: stat.mtimeMs,
        checksumSha256: options.hashFiles === false ? null : sha256File(fullPath)
      });
    }
  }
  files.sort((left, right) => left.path.localeCompare(right.path));
  return {
    exists: true,
    fileCount: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
    files,
    fingerprint: fingerprint(files)
  };
}

function toolMetadata() {
  const ffmpeg = resolveExplicitExecutable("ffmpeg", "TEOYUBE_FFMPEG_PATH");
  const ffprobe = resolveExplicitExecutable("ffprobe", "TEOYUBE_FFPROBE_PATH");
  const run = (command, args) => command ? spawnSync(command, args, { encoding: "utf8", windowsHide: true, shell: false }) : { status: null, stdout: "", stderr: "" };
  const ffmpegVersion = run(ffmpeg.path, ["-hide_banner", "-version"]);
  const ffprobeVersion = run(ffprobe.path, ["-hide_banner", "-version"]);
  const encoders = run(ffmpeg.path, ["-hide_banner", "-encoders"]);
  const encoderText = String(encoders.stdout || "");
  return {
    ready: Boolean(ffmpeg.path && ffprobe.path && ffmpegVersion.status === 0 && ffprobeVersion.status === 0),
    ffmpegPath: ffmpeg.path,
    ffprobePath: ffprobe.path,
    ffmpegVersion: String(ffmpegVersion.stdout || ffmpegVersion.stderr || "").split(/\r?\n/)[0] || null,
    ffprobeVersion: String(ffprobeVersion.stdout || ffprobeVersion.stderr || "").split(/\r?\n/)[0] || null,
    h264Libx264: /\blibx264\b/.test(encoderText),
    webp: /\blibwebp(?:_anim)?\b/.test(encoderText)
  };
}

function scaleFilter(maxWidth, maxHeight) {
  return `scale=w='min(iw,${maxWidth})':h='min(ih,${maxHeight})':force_original_aspect_ratio=decrease:force_divisible_by=2`;
}

function operationArguments(operation, sourceValue, outputValue) {
  const profile = PROFILE_DEFINITIONS[operation.profile];
  if (!profile) throw new Error(`Unsupported derivative profile: ${operation.profile}`);
  const common = ["-hide_banner", "-nostdin", "-v", "warning", "-i", sourceValue, "-map_metadata", "-1"];
  if (operation.profile === "card-preview-mp4") {
    return [...common, "-map", "0:v:0", "-vf", scaleFilter(1280, 720), "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "-y", outputValue];
  }
  if (operation.profile === "mobile-preview-mp4") {
    return [...common, "-map", "0:v:0", "-vf", scaleFilter(854, 480), "-c:v", "libx264", "-preset", "medium", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "-y", outputValue];
  }
  if (operation.profile === "poster-webp") {
    return [...common, "-map", "0:v:0", "-frames:v", "1", "-vf", scaleFilter(1280, 900), "-c:v", "libwebp", "-quality", "82", "-compression_level", "6", "-y", outputValue];
  }
  return [...common, "-map", "0:v:0", "-frames:v", "1", "-vf", scaleFilter(480, 480), "-c:v", "libwebp", "-quality", "78", "-compression_level", "6", "-y", outputValue];
}

function safeOperationArguments(operation) {
  return operationArguments(operation, `<protected-source:${operation.mediaId}>`, `<temporary-output:${operation.operationId}>`);
}

function selectedRecordIsReady(record) {
  return Boolean(
    record &&
    record.shortOrLong === "short" &&
    record.ownerReviewed === true &&
    record.titleConfirmed === true &&
    record.descriptionConfirmed === true &&
    record.scriptureConfirmed === true &&
    record.rightsConfirmed === true &&
    record.safetyConfirmed === true &&
    record.browserPlayable === true &&
    record.doNotPublish !== true &&
    !["rejected", "rejected_exact_duplicate", "blocked", "unsafe", "unsupported"].includes(String(record.duplicateDecision || record.reviewStatus || ""))
  );
}

function sourcePathForRecord(record) {
  const relative = String(record?.relativeSourcePath || "").replace(/\\/g, "/");
  if (!relative || relative.split("/").includes("..") || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative)) return null;
  const resolved = path.resolve(sourceRoot, ...relative.split("/"));
  return isWithin(sourceRoot, resolved) ? resolved : null;
}

function check(checks, blockers, id, passed, detail) {
  checks.push({ id, passed: Boolean(passed), detail });
  if (!passed) blockers.push({ code: id, message: detail });
}

async function verifyExecutionBaseline() {
  const checks = [];
  const blockers = [];
  const requiredPaths = [lifecyclePaths.approval, ownerAttestationPath, derivativePlanPath];
  for (const filePath of requiredPaths) check(checks, blockers, `artifact_exists_${path.basename(filePath)}`, fs.existsSync(filePath), `${projectPath(filePath)} must exist.`);
  if (blockers.length) return { report: { valid: false, blockers, checks }, context: null };

  const approval = readJson(lifecyclePaths.approval);
  const attestation = readJson(ownerAttestationPath);
  const plan = readJson(derivativePlanPath);
  const canonical = getCanonicalPilotState();
  const canonicalRevision = ensureCanonicalStateRevision(canonical);
  const gate = await getCanonicalGateSnapshot();
  const artifacts = artifactSnapshot();
  const tools = toolMetadata();
  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(manifest, patches, sourceChecksum);
  const recordsById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  const selectedRecords = (approval.approvedRecordIds || []).map((mediaId) => recordsById.get(mediaId));
  const approvalChecksumValid = approval.artifactChecksumSha256 === EXPECTED_APPROVAL_CHECKSUM && artifactChecksum(approval) === EXPECTED_APPROVAL_CHECKSUM;

  check(checks, blockers, "approval_checksum", approvalChecksumValid, `Approval artifact checksum must equal ${EXPECTED_APPROVAL_CHECKSUM}.`);
  check(checks, blockers, "canonical_revision", canonicalRevision.stateRevision === EXPECTED_CANONICAL_REVISION && gate.stateRevision === EXPECTED_CANONICAL_REVISION, `Canonical revision must equal ${EXPECTED_CANONICAL_REVISION}.`);
  check(checks, blockers, "attestation_checksum", artifactChecksum(attestation) === approval.ownerAttestationArtifactChecksum, "Owner attestation checksum must match the approval artifact.");
  check(checks, blockers, "attestation_id", attestation.artifactId === approval.ownerAttestationArtifactId, "Owner attestation ID must match the approval artifact.");
  check(checks, blockers, "attestation_pilot", attestation.pilotPlanId === approval.pilotPlanId, "Owner attestation pilot ID must match the approval artifact.");
  check(checks, blockers, "owner_gate", gate.gatePassed === true && gate.blockerCount === 0, "The canonical owner gate must have zero blockers.");
  check(checks, blockers, "approval_state", approval.approvalState === "owner_approved", "The pilot must remain owner-approved.");
  check(checks, blockers, "lifecycle_state", determineLifecycleState(gate, artifacts) === "derivative_plan_ready", "Lifecycle state must be derivative_plan_ready before authorization.");
  check(checks, blockers, "approved_records", approval.approvedRecordIds?.length === EXPECTED_RECORD_COUNT, "Exactly 12 approved records are required.");
  check(checks, blockers, "approved_sequence", approval.approvedSequenceIds?.length === 1 && approval.approvedSequenceIds[0] === EXPECTED_SEQUENCE_ID, "Exactly the approved Scripture sequence is required.");
  check(checks, blockers, "sequence_segments", approval.approvedSequenceOrder?.length === EXPECTED_RECORD_COUNT, "The approved sequence must contain 12 ordered segments.");
  check(checks, blockers, "long_form", selectedRecords.every((record) => record?.shortOrLong === "short"), "No long-form record may enter derivative execution.");
  check(checks, blockers, "records_ready", selectedRecords.every(selectedRecordIsReady), "Every approved record must remain reviewed, supported, Scripture-confirmed, rights-confirmed, safety-confirmed, and browser-playable.");
  check(checks, blockers, "sequence_contiguous", selectedRecords.every((record, index) => record?.sequenceId === EXPECTED_SEQUENCE_ID && Number(record?.sequenceOrder) === index + 1), "Sequence order must remain contiguous from 1 through 12.");
  check(checks, blockers, "patches_valid", merged.valid, "All canonical review patches must remain valid.");
  check(checks, blockers, "app_metadata_paths", !/[A-Za-z]:[\\/]/.test(JSON.stringify({ approval, attestation, plan })), "App-facing approval, attestation, and plan metadata must not contain absolute Windows paths.");
  check(checks, blockers, "ffmpeg_readiness", tools.ready && tools.h264Libx264 && tools.webp, "FFmpeg, FFprobe, libx264, and WebP support must resolve before execution.");
  check(checks, blockers, "plan_approval_binding", plan.approvalArtifactChecksum === EXPECTED_APPROVAL_CHECKSUM, "The derivative plan must remain bound to the approved pilot checksum.");
  check(checks, blockers, "plan_record_count", plan.approvedRecordCount === EXPECTED_RECORD_COUNT && plan.approvedLongFormCount === 0, "The derivative plan must contain 12 shorts and zero long-form records.");
  check(checks, blockers, "plan_operation_count", plan.operations?.length === EXPECTED_OPERATION_COUNT && plan.plannedCommandCount === EXPECTED_OPERATION_COUNT, "The derivative plan must contain exactly 48 operations.");
  for (const profile of Object.keys(PROFILE_DEFINITIONS)) {
    check(checks, blockers, `profile_${profile}`, plan.operations?.filter((operation) => operation.profile === profile).length === EXPECTED_RECORD_COUNT, `The plan must contain 12 ${profile} operations.`);
  }
  check(checks, blockers, "execution_authorization_absent", !fs.existsSync(executionAuthorizationPath) && !artifacts.derivativeExecutionAuthorization, "No conflicting derivative execution authorization may exist.");
  check(checks, blockers, "publication_authorization_absent", !artifacts.publicationAuthorization, "Publication authorization must remain absent.");

  const sourceSnapshots = [];
  for (const [index, mediaId] of (approval.approvedRecordIds || []).entries()) {
    const record = selectedRecords[index];
    const sourcePath = sourcePathForRecord(record);
    const exists = Boolean(sourcePath && fs.existsSync(sourcePath) && fs.statSync(sourcePath).isFile());
    const stat = exists ? fs.statSync(sourcePath) : null;
    const actualChecksum = exists ? sha256File(sourcePath) : null;
    const expectedChecksum = approval.sourceChecksums?.[mediaId] || null;
    const snapshot = {
      mediaId,
      sourceReference: `<protected-source:${mediaId}>`,
      exists,
      checksumSha256: actualChecksum,
      expectedChecksumSha256: expectedChecksum,
      checksumMatches: Boolean(actualChecksum && actualChecksum === expectedChecksum),
      byteSize: stat?.size ?? null,
      modificationTimeMs: stat?.mtimeMs ?? null,
      sequenceOrder: index + 1
    };
    sourceSnapshots.push(snapshot);
    check(checks, blockers, `source_${mediaId}`, snapshot.exists && snapshot.checksumMatches, `Approved source ${mediaId} must exist with its approved checksum.`);
  }

  const operationIds = new Set();
  for (const operation of plan.operations || []) {
    const outputPath = (() => { try { return resolveProjectPath(operation.outputPath); } catch { return null; } })();
    const outputSafe = Boolean(outputPath && isWithin(pilotRoot, outputPath) && !isWithin(sourceRoot, outputPath, true) && !isWithin(publicMediaRoot, outputPath, true));
    check(checks, blockers, `output_${operation.operationId}`, outputSafe, `Operation ${operation.operationId} must remain inside the generated pilot boundary.`);
    check(checks, blockers, `operation_id_${operation.operationId}`, !operationIds.has(operation.operationId), `Operation ID ${operation.operationId} must be unique.`);
    operationIds.add(operation.operationId);
    check(checks, blockers, `operation_record_${operation.operationId}`, approval.approvedRecordIds.includes(operation.mediaId), `Operation ${operation.operationId} must reference an approved record.`);
    check(checks, blockers, `operation_profile_${operation.operationId}`, Boolean(PROFILE_DEFINITIONS[operation.profile]), `Operation ${operation.operationId} must use an approved profile.`);
  }

  const publicMediaSnapshot = snapshotTree(publicMediaRoot);
  const existingDerivativeSnapshot = snapshotTree(path.join(pilotRoot, "derivatives"));
  const generatedPilotSnapshot = snapshotTree(pilotRoot, { hashFiles: false });
  const planFileChecksumSha256 = sha256File(derivativePlanPath);
  const report = {
    artifactType: "teoyubeworld_derivative_execution_baseline_verification",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.1",
    verifiedAt: new Date().toISOString(),
    valid: blockers.length === 0,
    canonicalRevision: canonicalRevision.stateRevision,
    gateState: approval.approvalState,
    lifecycleState: determineLifecycleState(gate, artifacts),
    approvalArtifactChecksumSha256: approval.artifactChecksumSha256,
    ownerAttestationArtifactChecksumSha256: approval.ownerAttestationArtifactChecksum,
    derivativePlanFileChecksumSha256: planFileChecksumSha256,
    derivativePlanBoundChecksumSha256: plan.planChecksumSha256,
    approvedRecordCount: approval.approvedRecordIds.length,
    approvedSequenceIds: [...approval.approvedSequenceIds],
    approvedSequenceSegmentCount: approval.approvedSequenceOrder.length,
    approvedLongFormCount: 0,
    operationCount: plan.operations.length,
    sourceIntegrityPassed: sourceSnapshots.every((source) => source.checksumMatches),
    sourceSnapshots,
    publicMediaSnapshot,
    existingDerivativeSnapshot,
    generatedPilotBytesBeforeExecution: generatedPilotSnapshot.totalBytes,
    toolReadiness: {
      ready: tools.ready,
      ffmpegVersion: tools.ffmpegVersion,
      ffprobeVersion: tools.ffprobeVersion,
      h264Libx264: tools.h264Libx264,
      webp: tools.webp
    },
    executionAuthorizationPresent: false,
    publicationAuthorizationPresent: false,
    publicFilesWritten: 0,
    blockers,
    checks
  };
  assertNoAbsoluteWindowsPath(report, "Execution baseline report");
  return {
    report,
    context: { approval, attestation, plan, canonical, canonicalRevision, gate, artifacts, recordsById, selectedRecords, sourceSnapshots, tools }
  };
}

module.exports = {
  projectRoot,
  sourceRoot,
  publicMediaRoot,
  pilotRoot,
  derivativePlanPath,
  executionRoot,
  authorizationRoot,
  temporaryRoot,
  logsRoot,
  manifestsRoot,
  frozenPlanPath,
  preExecutionSnapshotPath,
  executionAuthorizationPath,
  executionResultPath,
  executionLedgerPath,
  sourceIntegrityAfterPath,
  derivativeValidationPath,
  runtimeManifestPreviewPath,
  publicationPlanPath,
  EXPECTED_APPROVAL_CHECKSUM,
  EXPECTED_CANONICAL_REVISION,
  EXPECTED_RECORD_COUNT,
  EXPECTED_SEQUENCE_ID,
  EXPECTED_OPERATION_COUNT,
  EXACT_EXECUTION_AUTHORIZATION,
  PROFILE_DEFINITIONS,
  readJson,
  writeJsonAtomic,
  sha256File,
  artifactChecksum,
  projectPath,
  isWithin,
  resolveProjectPath,
  assertNoAbsoluteWindowsPath,
  snapshotTree,
  toolMetadata,
  operationArguments,
  safeOperationArguments,
  sourcePathForRecord,
  verifyExecutionBaseline
};
