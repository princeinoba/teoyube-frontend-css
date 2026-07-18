const fs = require("fs");
const path = require("path");
const {
  root,
  generatedRoot,
  reportsRoot,
  loadReviewWorkspace
} = require("./teoyubeWorldReviewPatches.cjs");

const sourceRoot = path.join(root, "media-source", "teoyubeworld", "originals");
const reviewRoot = path.join(generatedRoot, "review");
const assistedCandidatePath = path.join(reviewRoot, "assisted-pilot-candidate.json");
const assistedTechnicalReportPath = path.join(reviewRoot, "assisted-pilot-technical-report.json");
const ownerDeclarationsPath = path.join(reviewRoot, "assisted-pilot-owner-declarations.json");
const sequenceCandidatesPath = path.join(reportsRoot, "scripture-sequences.json");
const exactDuplicatesPath = path.join(reportsRoot, "exact-duplicates.json");

function isContained(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function sourcePathFor(record) {
  const relative = String(record.relativeSourcePath || "").replace(/\\/g, "/");
  if (!relative || relative.includes("\0") || relative.split("/").includes("..")) return null;
  const candidate = path.resolve(sourceRoot, ...relative.split("/"));
  return isContained(sourceRoot, candidate) ? candidate : null;
}

function loadAssistedPilotWorkspace() {
  const workspace = loadReviewWorkspace();
  const sequences = JSON.parse(fs.readFileSync(sequenceCandidatesPath, "utf8"));
  const exactDuplicates = JSON.parse(fs.readFileSync(exactDuplicatesPath, "utf8"));
  return { ...workspace, sequences, exactDuplicates };
}

function duplicateIndex(exactDuplicates) {
  const index = new Map();
  for (const group of exactDuplicates) {
    for (const mediaId of group.mediaIds || []) index.set(mediaId, group);
  }
  return index;
}

function preferredDuplicateIds(exactDuplicates) {
  return new Set(exactDuplicates.map((group) => group.probablePreferredCopy).filter(Boolean));
}

function baseRecordScore(record, duplicateMap, preferredIds) {
  let score = 0;
  const reasons = [];
  if (record.mimeType === "video/mp4") { score += 30; reasons.push("browser-compatible MP4 source"); }
  if (record.shortOrLong === "short") { score += 25; reasons.push("classified as a short record"); }
  if (record.sourceChannel === "TeoyubeWorld" || record.owner === "TeoyubeWorld") { score += 10; reasons.push("existing TeoyubeWorld source metadata"); }
  if (record.checksumSha256 && /^[a-f0-9]{64}$/i.test(record.checksumSha256)) { score += 15; reasons.push("stable SHA-256 inventory checksum"); }
  const sourcePath = sourcePathFor(record);
  if (sourcePath && fs.existsSync(sourcePath)) { score += 20; reasons.push("protected source exists"); }
  const duplicate = duplicateMap.get(record.id);
  if (!duplicate) { score += 12; reasons.push("no exact duplicate group"); }
  else if (preferredIds.has(record.id)) { score += 4; reasons.push("deterministic preferred copy in an exact duplicate group"); }
  else score -= 100;
  if (!/\(\d+\)\.[^.]+$/i.test(record.sourceFileName || "")) score += 4;
  if ((record.warnings || []).some((warning) => /corrupt|unsupported|unsafe|blocked/i.test(warning))) score -= 200;
  return { score, reasons, sourceExists: Boolean(sourcePath && fs.existsSync(sourcePath)) };
}

function technicalRecordScore(probe) {
  let score = 0;
  const reasons = [];
  if (probe.sourceIntegrityVerified) { score += 100; reasons.push("source hash, size, and timestamp unchanged after probe"); }
  if (probe.durationSeconds > 0 && probe.durationSeconds <= 30) { score += 55; reasons.push("duration is 30 seconds or shorter"); }
  else if (probe.durationSeconds > 30) { score -= 60; reasons.push("duration exceeds the preferred first-pilot limit"); }
  if (probe.videoCodec === "h264") { score += 35; reasons.push("H.264 video codec"); }
  if (!probe.hasAudio) { score += 45; reasons.push("no audio stream detected"); }
  else { score -= 15; reasons.push("audio stream requires separate owner rights confirmation"); }
  if (probe.width > 0 && probe.height > 0) score += 10;
  if (probe.orientation === "portrait") score += 5;
  return { score, reasons };
}

function rankSequenceCandidates(manifest, sequences, exactDuplicates) {
  const byId = new Map(manifest.records.map((record) => [record.id, record]));
  const duplicateMap = duplicateIndex(exactDuplicates);
  const preferredIds = preferredDuplicateIds(exactDuplicates);
  return sequences.map((sequence) => {
    const eligible = [];
    for (const mediaId of sequence.mediaIds || []) {
      const record = byId.get(mediaId);
      if (!record) continue;
      const base = baseRecordScore(record, duplicateMap, preferredIds);
      if (base.sourceExists && base.score > 0 && record.mimeType === "video/mp4" && record.shortOrLong === "short") {
        eligible.push({ id: record.id, score: base.score, reasons: base.reasons, relativeSourcePath: record.relativeSourcePath });
      }
    }
    eligible.sort((a, b) => b.score - a.score || a.relativeSourcePath.localeCompare(b.relativeSourcePath));
    const completeSequenceFitsPilot = eligible.length >= 5 && eligible.length <= 30 && eligible.length === (sequence.mediaIds || []).length;
    const score = eligible.length + (completeSequenceFitsPilot ? 500 : 0) - (Math.max(0, (sequence.mediaIds || []).length - 30) * 2);
    return {
      sequenceId: sequence.sequenceId,
      sequenceTitle: sequence.sequenceTitle,
      sourceRecordCount: (sequence.mediaIds || []).length,
      eligibleRecordCount: eligible.length,
      completeSequenceFitsPilot,
      score,
      orderConfidence: sequence.orderConfidence || "unknown",
      ScriptureReferences: sequence.ScriptureReferences || [],
      warnings: sequence.warnings || [],
      rankedRecords: eligible
    };
  }).sort((a, b) => b.score - a.score || a.sourceRecordCount - b.sourceRecordCount || a.sequenceTitle.localeCompare(b.sequenceTitle));
}

function getPilotScopedRecords(records, selectedIds, selectedSequenceId) {
  const selected = new Set(selectedIds || []);
  return records.filter((record) => selected.has(record.id) || (selectedSequenceId && record.sequenceId === selectedSequenceId && selected.has(record.id)));
}

function getPilotDuplicateBlockers(selectedRecords) {
  const blockers = [];
  const checksumOwners = new Map();
  for (const record of selectedRecords) {
    const prior = checksumOwners.get(record.checksumSha256);
    if (prior && record.duplicateDecision !== "keep_all") {
      blockers.push({ code: "exact_duplicate", mediaId: record.id, relatedMediaId: prior, message: "Two selected pilot records have the same SHA-256." });
    }
    checksumOwners.set(record.checksumSha256, record.id);
  }
  return blockers;
}

function getPilotSequenceBlockers(selectedRecords, selectedSequenceId) {
  if (!selectedSequenceId) return [{ code: "sequence_count", mediaId: null, message: "Choose and owner-confirm exactly one proposed sequence." }];
  const members = selectedRecords.filter((record) => record.sequenceId === selectedSequenceId);
  if (!members.length) return [{ code: "sequence_members", mediaId: null, message: "The selected sequence has no pilot members." }];
  const orders = members.map((record) => Number(record.sequenceOrder)).sort((a, b) => a - b);
  return orders.every((order, index) => order === index + 1)
    ? []
    : [{ code: "sequence_order", mediaId: null, message: "Selected sequence order must be contiguous from one." }];
}

function getPilotRecordBlockers(selectedRecords) {
  const blockers = [];
  for (const record of selectedRecords) {
    if (record.metadataProbeStatus !== "complete") blockers.push({ code: "technical_review", mediaId: record.id, message: "Technical metadata is incomplete." });
    if (record.reviewStatus !== "approved") blockers.push({ code: "owner_review", mediaId: record.id, message: "Explicit owner review is required." });
    if (record.mappingConfidence !== "confirmed" && record.ScriptureMappingStatus !== "confirmed") blockers.push({ code: "scripture_review", mediaId: record.id, message: "Explicit Scripture confirmation is required." });
    if (!new Set(["owner_owned", "confirmed", "licensed"]).has(record.copyrightStatus)) blockers.push({ code: "rights", mediaId: record.id, message: "Explicit rights confirmation is required." });
    if (record.safetyStatus !== "approved") blockers.push({ code: "safety", mediaId: record.id, message: "Explicit safety confirmation is required." });
  }
  return blockers;
}

function getPilotOwnerConfirmationBlockers(declarations = {}) {
  return ["rights", "scripture", "safety"].filter((name) => declarations[name] !== true).map((name) => ({
    code: `${name}_declaration`,
    mediaId: null,
    message: `The owner ${name} declaration is required.`
  }));
}

function getPilotScopedBlockers({ records, selectedIds, selectedSequenceId, declarations }) {
  const selectedRecords = getPilotScopedRecords(records, selectedIds, selectedSequenceId);
  return [
    ...getPilotDuplicateBlockers(selectedRecords),
    ...getPilotSequenceBlockers(selectedRecords, selectedSequenceId),
    ...getPilotRecordBlockers(selectedRecords),
    ...getPilotOwnerConfirmationBlockers(declarations)
  ];
}

function validateSelectedPilot(input) {
  const selectedRecords = getPilotScopedRecords(input.records, input.selectedIds, input.selectedSequenceId);
  const shorts = selectedRecords.filter((record) => record.shortOrLong === "short");
  const longForm = selectedRecords.filter((record) => ["long", "long_form"].includes(record.shortOrLong));
  const blockers = getPilotScopedBlockers(input);
  if (shorts.length !== 12) blockers.push({ code: "short_count", mediaId: null, message: `The assisted pilot requires exactly 12 shorts; found ${shorts.length}.` });
  if (longForm.length !== 0) blockers.push({ code: "long_form_count", mediaId: null, message: `The first assisted pilot requires zero long-form records; found ${longForm.length}.` });
  return { valid: blockers.length === 0, selectedRecords, shorts, longForm, blockers };
}

function emptyOwnerDeclarations(sourceDraftManifestChecksum) {
  return {
    schemaVersion: "1.0.0",
    sourceDraftManifestChecksum,
    updatedAt: null,
    declarations: {
      rights: { confirmed: false, confirmedAt: null, confirmedBy: null },
      scripture: { confirmed: false, confirmedAt: null, confirmedBy: null },
      safety: { confirmed: false, confirmedAt: null, confirmedBy: null }
    },
    localOnly: true,
    runtimeManifestUpdated: false
  };
}

function loadOwnerDeclarations(sourceDraftManifestChecksum) {
  if (!fs.existsSync(ownerDeclarationsPath)) return emptyOwnerDeclarations(sourceDraftManifestChecksum);
  try {
    const value = JSON.parse(fs.readFileSync(ownerDeclarationsPath, "utf8"));
    if (value.sourceDraftManifestChecksum !== sourceDraftManifestChecksum) {
      return emptyOwnerDeclarations(sourceDraftManifestChecksum);
    }
    return {
      ...emptyOwnerDeclarations(sourceDraftManifestChecksum),
      ...value,
      declarations: {
        ...emptyOwnerDeclarations(sourceDraftManifestChecksum).declarations,
        ...(value.declarations || {})
      }
    };
  } catch {
    return emptyOwnerDeclarations(sourceDraftManifestChecksum);
  }
}

module.exports = {
  sourceRoot,
  reviewRoot,
  assistedCandidatePath,
  assistedTechnicalReportPath,
  ownerDeclarationsPath,
  sourcePathFor,
  loadAssistedPilotWorkspace,
  duplicateIndex,
  preferredDuplicateIds,
  baseRecordScore,
  technicalRecordScore,
  rankSequenceCandidates,
  getPilotScopedRecords,
  getPilotDuplicateBlockers,
  getPilotSequenceBlockers,
  getPilotRecordBlockers,
  getPilotOwnerConfirmationBlockers,
  getPilotScopedBlockers,
  validateSelectedPilot,
  emptyOwnerDeclarations,
  loadOwnerDeclarations
};
