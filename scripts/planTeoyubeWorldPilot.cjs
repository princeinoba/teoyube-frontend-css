const fs = require("fs");
const path = require("path");
const { generatedRoot, reportsRoot, loadReviewWorkspace, applyPatches, writeJson } = require("./lib/teoyubeWorldReviewPatches.cjs");

const MAX_PUBLIC_BYTES = 500 * 1024 * 1024;

function createPilotPlan() {
  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(manifest, patches, sourceChecksum);
  const selected = merged.manifest.records.filter((record) => record.pilotSelected === true);
  const shorts = selected.filter((record) => record.shortOrLong === "short");
  const longForm = selected.filter((record) => record.shortOrLong === "long" || record.shortOrLong === "long_form");
  const sequenceIds = [...new Set(selected.filter((record) => record.sequenceReviewStatus === "approved" && record.sequenceId).map((record) => record.sequenceId))];
  const blockers = [];
  if (!merged.valid) blockers.push("One or more review patches are invalid.");
  if (shorts.length < 12 || shorts.length > 30) blockers.push("Pilot must contain 12 to 30 unique short records.");
  if (longForm.length > 2) blockers.push("Pilot may contain no more than two long-form records.");
  if (sequenceIds.length !== 1) blockers.push("Pilot requires exactly one owner-confirmed sequence.");
  const seenChecksums = new Set();
  for (const record of selected) {
    if (seenChecksums.has(record.checksumSha256)) blockers.push(`${record.id}: exact duplicate is selected.`);
    seenChecksums.add(record.checksumSha256);
    if (record.mappingConfidence !== "confirmed" || !(record.ScriptureReferences || []).length) blockers.push(`${record.id}: Scripture mapping is not owner-confirmed.`);
    if (record.reviewStatus !== "approved") blockers.push(`${record.id}: owner review status is not approved.`);
    if (!["approved", "approved_for_pilot", "owner_attested_safe_for_pilot"].includes(record.safetyStatus)) blockers.push(`${record.id}: safety status is not approved.`);
    if (!new Set(["owner_owned", "confirmed", "licensed"]).has(record.copyrightStatus)) blockers.push(`${record.id}: copyright status is not confirmed.`);
    if (!String(record.title || "").trim()) blockers.push(`${record.id}: reviewed title is missing.`);
    if (!(record.recommendedSurfaces || []).length) blockers.push(`${record.id}: recommended surfaces are missing.`);
    if (!record.mimeType?.startsWith("video/")) blockers.push(`${record.id}: unsupported pilot media kind.`);
  }
  const sourceBytes = selected.reduce((sum, record) => sum + Number(record.fileSizeBytes || 0), 0);
  const estimatedPublicBytes = Math.ceil(sourceBytes * 0.42);
  if (estimatedPublicBytes > MAX_PUBLIC_BYTES) blockers.push("Estimated public pilot size exceeds 500 MiB.");
  const plan = {
    schemaVersion: "1.0.0",
    phase: "11.6C.2A",
    generatedAt: new Date().toISOString(),
    sourceDraftManifestChecksum: sourceChecksum,
    status: blockers.length ? "blocked" : selected.some((record) => !record.browserPlayable) ? "ready_with_derivative_requirements" : "ready",
    selectedMediaIds: selected.map((record) => record.id),
    selectedShortIds: shorts.map((record) => record.id),
    selectedLongFormIds: longForm.map((record) => record.id),
    selectedSequenceIds: sequenceIds,
    canonicalDuplicateChoices: selected.filter((record) => record.canonicalForDuplicateGroup).map((record) => ({ mediaId: record.id, duplicateGroupId: record.duplicateGroupId })),
    sourceBytes,
    estimatedPublicBytes,
    maximumPublicBytes: MAX_PUBLIC_BYTES,
    technicalMetadataCoverage: selected.length ? selected.filter((record) => record.metadataProbeStatus === "complete").length / selected.length : 0,
    posterCoverage: selected.length ? selected.filter((record) => record.posterPath || record.ownerThumbnailPath).length / selected.length : 0,
    derivativeRequirements: selected.filter((record) => !record.browserPlayable || !record.posterPath).map((record) => record.id),
    projectedPublicPaths: selected.map((record) => `public/media/teoyubeworld/${record.id}/preview.mp4`),
    projectedRuntimeManifestRecords: selected.map((record) => ({ id: record.id, approved: true, runtimePromotionPending: true })),
    estimatedProcessingStorageBytes: Math.ceil(sourceBytes * 0.75),
    warnings: selected.length ? [] : ["No records are owner-selected for the pilot."],
    blockers: [...new Set(blockers)],
    originalsModified: 0,
    publicFilesCopied: 0,
    runtimeManifestUpdated: false
  };
  return plan;
}

function run() {
  const validateOnly = process.argv.includes("--validate");
  const plan = createPilotPlan();
  const planPath = path.join(generatedRoot, "manifests", "teoyubeworld-pilot-plan.json");
  writeJson(planPath, plan);
  const lines = [
    "# TeoyubeWorld Pilot Plan", "", `- Status: ${plan.status}`, `- Selected: ${plan.selectedMediaIds.length}`,
    `- Shorts: ${plan.selectedShortIds.length}`, `- Long-form: ${plan.selectedLongFormIds.length}`,
    `- Confirmed sequences: ${plan.selectedSequenceIds.length}`, `- Source bytes: ${plan.sourceBytes}`,
    `- Estimated public bytes: ${plan.estimatedPublicBytes}`, "", "## Blockers", "",
    ...(plan.blockers.length ? plan.blockers.map((item) => `- ${item}`) : ["- None"]), "",
    "No media was copied or transcoded. Runtime promotion remains disabled."
  ];
  fs.writeFileSync(path.join(reportsRoot, "teoyubeworld-pilot-plan.md"), lines.join("\n") + "\n", "utf8");
  console.log(JSON.stringify({ ...plan, validationMode: validateOnly }, null, 2));
  return plan;
}

if (require.main === module) run();
module.exports = { MAX_PUBLIC_BYTES, createPilotPlan, run };
