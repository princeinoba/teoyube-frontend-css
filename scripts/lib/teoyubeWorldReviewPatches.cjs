const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..", "..");
const generatedRoot = path.join(root, "generated", "teoyubeworld-media");
const draftManifestPath = path.join(generatedRoot, "manifests", "teoyubeworld-media-manifest.draft.json");
const reviewedManifestPath = path.join(generatedRoot, "manifests", "teoyubeworld-media-manifest.reviewed.json");
const reportsRoot = path.join(generatedRoot, "reports");
const patchPaths = {
  technical: path.join(reportsRoot, "browser-technical-metadata.patch.json"),
  owner: path.join(reportsRoot, "owner-metadata-review.patch.json"),
  duplicate: path.join(reportsRoot, "duplicate-resolution.patch.json"),
  sequence: path.join(reportsRoot, "sequence-curation.patch.json"),
  pilot: path.join(reportsRoot, "pilot-selection.patch.json")
};

const allowedFields = new Set([
  "title", "description", "durationSeconds", "width", "height", "orientation", "aspectRatio",
  "displayAspectRatio", "pixelAspectRatio", "hasAudio", "audioCodec", "videoCodec", "audioStreamCount",
  "frameRate", "bitrate", "rotation", "containerFormat", "streamCount",
  "browserPlayable", "browserMimeSupport", "metadataProbeStatus", "metadataProbeWarnings",
  "metadataProbeReadyState", "metadataProbeNetworkState", "metadataProbeSeekable",
  "BibleBook", "chapter", "verseStart", "verseEnd", "ScriptureReferences", "translation",
  "themes", "TeoyubeWordIds", "promiseClusterIds", "journeyIds", "callingIds", "prayerSequenceIds",
  "mediaKind", "shortOrLong", "sequenceId", "sequenceOrder", "sequenceTitle", "sequenceDescription",
  "sequenceReviewStatus", "segmentTitle", "segmentScripture", "transitionType", "durationBehavior",
  "sequenceRole", "recommendedSurfaces", "owner", "sourceChannel", "copyrightStatus", "reviewStatus",
  "safetyStatus", "ScriptureMappingStatus", "mappingConfidence", "tags", "ownerNotes", "pilotSelected",
  "duplicateDecision", "canonicalForDuplicateGroup", "intentionalCopy", "duplicateOf", "doNotPublish",
  "posterPath", "thumbnailPath",
  "ownerReviewed", "ownerReviewedAt", "ownerReviewVersion",
  "ownerReviewSource", "ownerReviewAttestationId", "ownerAttestationStatus",
  "titleSuggested", "titleAccepted", "titleConfirmed",
  "descriptionSuggested", "descriptionAccepted", "descriptionConfirmed",
  "scriptureReferenceSuggested", "scriptureReferenceAccepted", "scriptureConfirmed", "scriptureConfirmedAt",
  "scriptureConfirmationSource", "scriptureConfirmationStatus", "translationConfirmed",
  "rightsStatus", "rightsConfirmed", "rightsConfirmedAt", "rightsConfirmationSource", "rightsAttestationStatus",
  "safetyConfirmed", "safetyConfirmedAt", "safetyConfirmationSource", "safetyAttestationStatus",
  "sequenceConfirmationSource", "sequenceConfirmationStatus", "sequenceOrderConfirmed",
  "pilotPlanId", "attestationArtifactId", "attestationArtifactChecksum", "patchSchemaVersion",
  "technicalMetadataComplete"
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function containsUnsafeValue(value) {
  const text = JSON.stringify(value);
  return /[A-Za-z]:[\\/]|(?:^|["'\s])\.\.[\\/]|<script\b|javascript:|data:text\/html/i.test(text);
}

function validatePatch(patch, manifest, sourceChecksum, label = "patch") {
  const errors = [];
  const warnings = [];
  const knownIds = new Set(manifest.records.map((record) => record.id));
  if (!patch || typeof patch !== "object") errors.push(`${label}: patch must be an object.`);
  if (patch?.schemaVersion !== "1.0.0") errors.push(`${label}: schemaVersion must be 1.0.0.`);
  if (patch?.sourceDraftManifestChecksum !== sourceChecksum) errors.push(`${label}: source manifest checksum does not match.`);
  if (!Array.isArray(patch?.operations)) errors.push(`${label}: operations must be an array.`);
  if (Number(patch?.operationCount) !== (patch?.operations?.length || 0)) errors.push(`${label}: operationCount does not match operations.`);
  if (containsUnsafeValue(patch)) errors.push(`${label}: patch contains a path or unsafe text value.`);
  for (const [index, operation] of (patch?.operations || []).entries()) {
    const prefix = `${label} operation ${index + 1}`;
    if (!knownIds.has(operation.mediaId)) errors.push(`${prefix}: unknown media ID.`);
    if (!operation.newValues || typeof operation.newValues !== "object" || Array.isArray(operation.newValues)) {
      errors.push(`${prefix}: newValues must be an object.`);
      continue;
    }
    const keys = Object.keys(operation.newValues);
    if (!keys.length) warnings.push(`${prefix}: no changed fields.`);
    for (const key of keys) if (!allowedFields.has(key)) errors.push(`${prefix}: field ${key} is not reviewable.`);
    if (!Array.isArray(operation.changedFields) || keys.some((key) => !operation.changedFields.includes(key))) {
      errors.push(`${prefix}: changedFields must list every new value.`);
    }
    if (!operation.previousValues || typeof operation.previousValues !== "object") errors.push(`${prefix}: previousValues is required.`);
    if (!String(operation.reviewReason || "").trim()) errors.push(`${prefix}: reviewReason is required.`);
    if (!Number.isFinite(Date.parse(operation.timestamp))) errors.push(`${prefix}: timestamp is invalid.`);
  }
  return { valid: errors.length === 0, errors, warnings, operationCount: patch?.operations?.length || 0 };
}

function loadReviewWorkspace() {
  const manifest = readJson(draftManifestPath);
  const sourceChecksum = sha256File(draftManifestPath);
  const patches = {};
  for (const [name, filePath] of Object.entries(patchPaths)) {
    patches[name] = fs.existsSync(filePath) ? readJson(filePath) : null;
  }
  return { manifest, sourceChecksum, patches };
}

function applyPatches(manifest, patches, sourceChecksum) {
  const recordsById = new Map(manifest.records.map((record) => [record.id, { ...record }]));
  const validations = [];
  const history = [];
  for (const [name, patch] of Object.entries(patches)) {
    if (!patch) continue;
    const validation = validatePatch(patch, manifest, sourceChecksum, name);
    validations.push({ name, ...validation });
    if (!validation.valid) continue;
    for (const operation of patch.operations) {
      const current = recordsById.get(operation.mediaId);
      recordsById.set(operation.mediaId, { ...current, ...operation.newValues });
      history.push({ patch: name, mediaId: operation.mediaId, changedFields: operation.changedFields, timestamp: operation.timestamp });
    }
  }
  const records = [...recordsById.values()];
  return {
    valid: validations.every((item) => item.valid),
    validations,
    history,
    manifest: {
      ...manifest,
      status: "owner_review_merge_preview",
      generatedAt: new Date().toISOString(),
      sourceDraftManifestChecksum: sourceChecksum,
      patchedRecordCount: new Set(history.map((item) => item.mediaId)).size,
      reviewedRecordCount: records.filter((record) => record.reviewStatus && record.reviewStatus !== "needs_review").length,
      records
    }
  };
}

function emptyPatch(reviewedBy = "owner_pending") {
  const sourceChecksum = sha256File(draftManifestPath);
  return {
    schemaVersion: "1.0.0",
    sourceDraftManifestChecksum: sourceChecksum,
    generatedAt: new Date().toISOString(),
    reviewedBy,
    operationCount: 0,
    operations: [],
    warnings: ["No owner decisions have been recorded."],
    localOnly: true,
    runtimeManifestUpdated: false
  };
}

module.exports = {
  root, generatedRoot, reportsRoot, draftManifestPath, reviewedManifestPath, patchPaths, allowedFields,
  readJson, writeJson, sha256File, validatePatch, loadReviewWorkspace, applyPatches, emptyPatch
};
