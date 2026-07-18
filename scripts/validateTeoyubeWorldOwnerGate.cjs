const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  root, generatedRoot, reportsRoot, patchPaths, loadReviewWorkspace, applyPatches, validatePatch, writeJson
} = require("./lib/teoyubeWorldReviewPatches.cjs");
const {
  getPilotDuplicateBlockers,
  loadOwnerDeclarations
} = require("./lib/teoyubeWorldAssistedPilot.cjs");
const {
  getCanonicalPilotState,
  getCanonicalSequenceState,
  ensureCanonicalStateRevision,
  calculateCanonicalPilotBlockers,
  blockersByCategory,
  persistCanonicalGateSnapshot
} = require("./lib/teoyubeWorldCanonicalPilotState.cjs");

const sourceRoot = path.join(root, "media-source", "teoyubeworld", "originals");
const reportJsonPath = path.join(reportsRoot, "phase-11-6c2b-owner-gate-validation.json");
const reportDocPath = path.join(root, "docs", "teoyube", "phase-11-6c2b-owner-gate-validation-report.md");
const approvedPilotPath = path.join(generatedRoot, "manifests", "teoyubeworld-approved-pilot.json");
const runtimeManifestPath = path.join(root, "src", "data", "teoyubeworld-runtime-media.json");

function contained(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function sourcePathFor(record) {
  const relative = String(record.relativeSourcePath || "").replace(/\\/g, "/");
  if (!relative || relative.includes("\0") || relative.split("/").includes("..")) return null;
  const candidate = path.resolve(sourceRoot, ...relative.split("/"));
  return contained(sourceRoot, candidate) ? candidate : null;
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const digest = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath, { highWaterMark: 4 * 1024 * 1024 });
    stream.on("data", (chunk) => digest.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(digest.digest("hex")));
  });
}

function add(blockers, code, message, mediaId = null) {
  blockers.push({ code, message, mediaId });
}

function hasOwnerPatch(ownerPatch, mediaId) {
  return Boolean(ownerPatch?.operations?.some((operation) => operation.mediaId === mediaId));
}

function validateRecordMetadata(record, blockers) {
  if (record.reviewStatus !== "approved") add(blockers, "owner_review", "Owner review status must be approved.", record.id);
  if (record.ScriptureMappingStatus !== "confirmed" && record.mappingConfidence !== "confirmed") add(blockers, "scripture_review", "Scripture review must be owner-confirmed.", record.id);
  if (!String(record.title || "").trim()) add(blockers, "title", "Reviewed title is required.", record.id);
  if (!String(record.description || "").trim()) add(blockers, "description", "Reviewed description is required.", record.id);
  if (!String(record.mediaKind || "").trim() || record.mediaKind === "unknown") add(blockers, "media_kind", "Reviewed media kind is required.", record.id);
  if (!["approved", "approved_for_pilot", "owner_attested_safe_for_pilot"].includes(record.safetyStatus)) add(blockers, "safety", "Safety status must be approved or owner-attested for the pilot.", record.id);
  if (!["owner_owned", "confirmed", "licensed"].includes(record.copyrightStatus)) add(blockers, "rights", "Rights status must be owner-owned, confirmed, or licensed.", record.id);
  if (!String(record.sourceChannel || "").trim()) add(blockers, "source_channel", "Source channel is required.", record.id);
  if (!(record.ScriptureReferences || []).length || !record.BibleBook || !record.chapter || !record.verseStart) add(blockers, "scripture_fields", "Book, chapter, verse, and Scripture reference are required.", record.id);
  if (["blocked", "unsafe", "rejected"].includes(record.reviewStatus) || ["blocked", "unsafe", "rejected"].includes(record.safetyStatus)) add(blockers, "blocked_record", "Blocked, unsafe, or rejected records cannot enter the pilot.", record.id);
  if (!record.mimeType?.startsWith("video/")) add(blockers, "unsupported", "Only reviewed video records can enter this pilot.", record.id);
  if (record.metadataProbeStatus !== "complete") add(blockers, "technical_review", "Browser technical metadata review must be complete.", record.id);
  const appFacingMetadata = {
    title: record.title,
    description: record.description,
    ScriptureReferences: record.ScriptureReferences,
    BibleBook: record.BibleBook,
    themes: record.themes,
    TeoyubeWordIds: record.TeoyubeWordIds,
    promiseClusterIds: record.promiseClusterIds,
    journeyIds: record.journeyIds,
    callingIds: record.callingIds,
    prayerSequenceIds: record.prayerSequenceIds,
    recommendedSurfaces: record.recommendedSurfaces,
    posterPath: record.posterPath,
    thumbnailPath: record.thumbnailPath
  };
  if (/[A-Za-z]:[\\/]/.test(JSON.stringify(appFacingMetadata))) add(blockers, "absolute_app_path", "App-facing metadata must not contain an absolute source path.", record.id);
}

function validateSequence(sequenceId, selected, blockers) {
  if (!sequenceId) return;
  const members = selected.filter((record) => record.sequenceId === sequenceId).sort((a, b) => Number(a.sequenceOrder) - Number(b.sequenceOrder));
  if (!members.length) return add(blockers, "sequence_members", "The confirmed sequence has no selected members.");
  if (!members.every((record) => record.sequenceReviewStatus === "approved")) add(blockers, "sequence_approval", "Every selected sequence member must be owner-approved.");
  if (!members.every((record) => String(record.sequenceTitle || "").trim())) add(blockers, "sequence_title", "The sequence requires an owner-confirmed title.");
  if (!members.every((record) => record.BibleBook && record.chapter && record.verseStart)) add(blockers, "sequence_scripture", "The sequence requires book, chapter, and verse metadata.");
  const orders = members.map((record) => Number(record.sequenceOrder));
  const sortedOrders = [...orders].sort((a, b) => a - b);
  const contiguous = sortedOrders.every((value, index) => value === index + 1);
  if (orders.some((value) => !Number.isInteger(value) || value < 1) || new Set(orders).size !== orders.length || !contiguous) add(blockers, "sequence_order", "Sequence segment order must be complete, contiguous, and unique.");
}

function getPilotRecordBlockers(record, ownerPatch) {
  const blockers = [];
  if (!hasOwnerPatch(ownerPatch, record.id)) add(blockers, "owner_patch", "A checksum-bound owner metadata patch operation is required.", record.id);
  validateRecordMetadata(record, blockers);
  return blockers;
}

function getPilotSequenceBlockers(sequenceIds, selected) {
  const blockers = [];
  if (sequenceIds.length !== 1) {
    add(blockers, "sequence_count", `Owner-confirmed sequence count is ${sequenceIds.length}; exactly one is required.`);
    return blockers;
  }
  validateSequence(sequenceIds[0], selected, blockers);
  return blockers;
}

async function validateTeoyubeWorldOwnerGate() {
  const canonical = getCanonicalPilotState();
  const { manifest, sourceChecksum, patches, merged } = canonical;
  const selected = canonical.selectedRecords;
  const shorts = selected.filter((record) => record.shortOrLong === "short");
  const longForm = selected.filter((record) => ["long", "long_form"].includes(record.shortOrLong));
  const sequenceIds = [...new Set(selected.filter((record) => record.sequenceReviewStatus === "approved" && record.sequenceId).map((record) => record.sequenceId))];
  const blockers = [];
  const warnings = [];
  const selectedSourceChecksums = {};
  const ownerDeclarations = loadOwnerDeclarations(sourceChecksum);
  const patchValidation = Object.entries(patches).map(([name, patch]) => ({ name, ...validatePatch(patch, manifest, sourceChecksum, name) }));
  if (!merged.valid || patchValidation.some((item) => !item.valid)) add(blockers, "patch_validation", "Every review patch must validate against the current draft checksum.");
  if (shorts.length !== 12) add(blockers, "short_count", `Approved short count is ${shorts.length}; exactly 12 are required for the first pilot.`);
  if (longForm.length !== 0) add(blockers, "long_form_count", `Approved long-form count is ${longForm.length}; the first pilot requires zero.`);
  blockers.push(...getPilotSequenceBlockers(sequenceIds, selected));
  blockers.push(...getPilotDuplicateBlockers(selected));
  for (const record of selected) {
    blockers.push(...getPilotRecordBlockers(record, patches.owner));
    if (record.duplicateGroupId && !record.canonicalForDuplicateGroup && record.duplicateDecision !== "keep_all") add(blockers, "duplicate", "Exact duplicate decision is unresolved.", record.id);
    const filePath = sourcePathFor(record);
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      add(blockers, "missing_source", "Protected source is missing or outside the approved root.", record.id);
      continue;
    }
    const actualChecksum = await hashFile(filePath);
    selectedSourceChecksums[record.id] = actualChecksum;
    if (actualChecksum !== record.checksumSha256) add(blockers, "checksum_mismatch", "Protected source checksum no longer matches the draft record.", record.id);
  }
  if (!selected.length) warnings.push("No records are owner-selected for the approved pilot.");
  const canonicalBlockers = calculateCanonicalPilotBlockers(blockers, canonical);
  const gatePassed = canonicalBlockers.length === 0;
  const revision = ensureCanonicalStateRevision("canonical_gate_validation");
  const sequenceState = getCanonicalSequenceState(canonical);
  const report = {
    schemaVersion: "1.0.0",
    phase: "11.6C.2A.4",
    generatedAt: new Date().toISOString(),
    stateRevision: revision.stateRevision,
    revisionNumber: revision.revisionNumber,
    serverPort: 4174,
    pilotPlanId: canonical.pilotPlanId,
    status: gatePassed ? "passed" : "blocked",
    gatePassed,
    approvalArtifactPresent: fs.existsSync(approvedPilotPath),
    executionMode: null,
    manifestVersion: manifest.schemaVersion || manifest.version || "unknown",
    sourceDraftManifestChecksum: sourceChecksum,
    counts: {
      selected: selected.length,
      approvedShorts: shorts.length,
      approvedLongForm: longForm.length,
      approvedSequences: sequenceIds.length,
      ownerReviewed: selected.filter((record) => record.ownerReviewed === true).length,
      titleConfirmed: selected.filter((record) => record.titleConfirmed === true && String(record.titleAccepted || "").trim()).length,
      descriptionConfirmed: selected.filter((record) => record.descriptionConfirmed === true && String(record.descriptionAccepted || "").trim()).length,
      scriptureConfirmed: selected.filter((record) => record.scriptureConfirmed === true && (record.ScriptureReferences || []).length).length,
      rightsConfirmed: selected.filter((record) => record.rightsConfirmed === true && record.rightsStatus !== "not_approved").length,
      safetyConfirmed: selected.filter((record) => record.safetyConfirmed === true && ["approved", "approved_for_pilot", "owner_attested_safe_for_pilot"].includes(record.safetyStatus)).length,
      confirmedSequenceSegments: sequenceIds.length === 1 ? selected.filter((record) => record.sequenceId === sequenceIds[0]).length : 0
    },
    patchValidation,
    selectedMediaIds: selected.map((record) => record.id),
    selectedSequenceIds: sequenceIds,
    selectedSequenceCandidate: sequenceState.sequenceId || sequenceState.suggestedSequenceId,
    selectedSequenceOrder: sequenceIds.length === 1
      ? selected.filter((record) => record.sequenceId === sequenceIds[0]).sort((a, b) => Number(a.sequenceOrder) - Number(b.sequenceOrder)).map((record) => record.id)
      : [],
    selectedSourceChecksums,
    ownerDeclarations,
    ownerReconfirmation: canonical.ownerReconfirmation,
    blockerCount: canonicalBlockers.length,
    blockersByCategory: blockersByCategory(canonicalBlockers),
    blockers: canonicalBlockers,
    warnings,
    outputs: {
      approvedPilotManifestCreated: fs.existsSync(approvedPilotPath),
      runtimeManifestCreated: fs.existsSync(runtimeManifestPath),
      derivativesGenerated: 0,
      filesPublished: 0
    },
    safety: { originalsModified: 0, externalUploads: 0, publicMastersCopied: 0 }
  };
  writeJson(reportJsonPath, report);
  persistCanonicalGateSnapshot(report);
  return report;
}

async function getCanonicalGateSnapshot() {
  return validateTeoyubeWorldOwnerGate();
}

function markdown(report) {
  const blockerRows = report.blockers.map((item) => `| ${item.code} | ${item.mediaId || "Pilot"} | ${item.message} |`).join("\n");
  return `# Phase 11.6C.2B Owner Gate Validation Report\n\n- Gate status: **${report.status}**\n- Approved shorts: ${report.counts.approvedShorts}\n- Approved sequences: ${report.counts.approvedSequences}\n- Approved long-form records: ${report.counts.approvedLongForm}\n- Approved/runtime manifests created: no\n- Derivatives generated: 0\n- Files published: 0\n- Original files modified: 0\n\n## Blockers\n\n| Code | Record | Detail |\n| --- | --- | --- |\n${blockerRows || "| None | - | Owner gate passed. |"}\n\n## Enforcement\n\nBecause the gate is blocked, Phase 11.6C.2B runtime integration, derivative generation, publication, and app-facing manifest creation were not performed. The normal runtime remains empty and protected media stays available only through the C.2A owner-review QA boundary.\n\n## Required owner action\n\nApprove 12-30 unique shorts, exactly one fully ordered Scripture sequence, and optionally up to three long-form records. Every selected record must have a checksum-bound owner metadata operation, confirmed Scripture, approved safety and rights, and resolved duplicate status.\n`;
}

async function run() {
  const report = await validateTeoyubeWorldOwnerGate();
  fs.mkdirSync(path.dirname(reportDocPath), { recursive: true });
  fs.writeFileSync(reportDocPath, markdown(report), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (!report.gatePassed && process.argv.includes("--require-pass")) process.exitCode = 2;
  return report;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = {
  validateTeoyubeWorldOwnerGate,
  getCanonicalGateSnapshot,
  getPilotRecordBlockers,
  getPilotSequenceBlockers,
  run,
  approvedPilotPath,
  runtimeManifestPath
};
