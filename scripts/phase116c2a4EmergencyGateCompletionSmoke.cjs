const fs = require("fs");
const path = require("path");
const assert = require("assert");
const {
  patchPaths,
  loadReviewWorkspace,
  applyPatches
} = require("./lib/teoyubeWorldReviewPatches.cjs");
const {
  canonicalGateSnapshotPath,
  getCanonicalPilotState,
  sourcePathFor,
  readJson
} = require("./lib/teoyubeWorldCanonicalPilotState.cjs");
const {
  PILOT_PLAN_ID,
  SEQUENCE_ID,
  ownerAttestationPath,
  sequenceConfirmationPath,
  hashFile,
  verifyArtifactChecksum
} = require("./lib/teoyubeWorldOwnerAttestation.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const {
  sourceVerificationPath,
  derivativePlanPath
} = require("./planTeoyubeWorldApprovedPilotDerivatives.cjs");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public", "media", "teoyubeworld");
const derivativeRoot = path.join(root, "generated", "teoyubeworld-media", "pilot-v1", "derivatives");

function check(id, passed, detail, checks) {
  checks.push({ id, passed: Boolean(passed), detail });
  assert.ok(passed, `${id}: ${detail}`);
}

async function run() {
  const checks = [];
  const gate = readJson(canonicalGateSnapshotPath, null);
  const attestation = readJson(ownerAttestationPath, null);
  const sequence = readJson(sequenceConfirmationPath, null);
  const artifacts = artifactSnapshot();
  const approval = artifacts.approval;
  const plan = readJson(derivativePlanPath, null);
  const sourceVerification = readJson(sourceVerificationPath, null);
  const canonical = getCanonicalPilotState();
  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(manifest, patches, sourceChecksum);
  const ownerPatch = readJson(patchPaths.owner, { operations: [] });
  const selectedIds = approval?.approvedRecordIds || [];
  const selectedRecords = selectedIds.map((mediaId) => merged.manifest.records.find((record) => record.id === mediaId));

  check("canonical_pilot_shape", gate?.counts?.approvedShorts === 12 && gate.counts.approvedLongForm === 0, "The canonical pilot has 12 selected shorts and zero long-form records.", checks);
  check("attestation_checksum", attestation?.pilotPlanId === PILOT_PLAN_ID && verifyArtifactChecksum(attestation), "The owner attestation exists and its SHA-256 checksum is valid.", checks);
  check("attestation_scope", attestation.selectedRecordIds?.length === 12 && attestation.derivativeExecutionAuthorized === false && attestation.publicationAuthorized === false && attestation.externalVerificationClaimed === false, "The attestation is scoped to the selected 12 and claims no downstream authorization or external verification.", checks);

  const attestedOperations = (ownerPatch.operations || []).filter((operation) => selectedIds.includes(operation.mediaId));
  check("record_patch_bindings", attestedOperations.length === 12 && attestedOperations.every((operation) => operation.attestationArtifactId === attestation.artifactId && operation.attestationArtifactChecksum === attestation.artifactChecksumSha256 && operation.sourceChecksum === approval.sourceChecksums[operation.mediaId] && operation.pilotPlanId === PILOT_PLAN_ID && operation.patchSchemaVersion === "2.0.0-owner-attested"), "All 12 checksum-bound owner patch envelopes reference the pilot attestation.", checks);
  check("record_confirmations", ["ownerReviewed", "titleConfirmed", "descriptionConfirmed", "scriptureConfirmed", "rightsConfirmed", "safetyConfirmed"].every((field) => selectedRecords.filter((record) => record?.[field] === true).length === 12), "Owner review, title, description, Scripture, rights, and safety confirmations each total 12.", checks);
  check("attested_statuses", selectedRecords.every((record) => record?.ownerAttestationStatus === "owner_attested" && record?.scriptureConfirmationStatus === "owner_attested_scripture_confirmed" && record?.rightsStatus === "owner_attested_rights_controlled" && record?.safetyStatus === "owner_attested_safe_for_pilot"), "The records use owner-attested statuses without external-certification claims.", checks);

  check("sequence_confirmation", verifyArtifactChecksum(sequence) && sequence.sequenceId === SEQUENCE_ID && sequence.segmentIds?.length === 12 && sequence.contiguousSequenceOrder?.every((order, index) => order === index + 1) && sequence.sequenceConfirmed === true && sequence.sequenceOrderConfirmed === true, "Exactly one checksum-bound 12-segment sequence is confirmed in contiguous order 1-12.", checks);
  check("zero_blocker_gate", gate?.gatePassed === true && gate.blockerCount === 0 && gate.counts.approvedSequences === 1 && gate.counts.confirmedSequenceSegments === 12, "The persisted canonical gate has zero blockers and one complete sequence.", checks);
  check("approval_checksum", approval?.approvalState === "owner_approved" && verifyArtifactChecksum(approval), "The canonical owner approval artifact exists and its checksum is valid.", checks);
  check("approval_scope", approval.approvedRecordIds.length === 12 && approval.approvedSequenceIds.length === 1 && approval.approvedSequenceOrder.length === 12 && approval.derivativeExecutionAuthorized === false && approval.publicationAuthorized === false, "Approval defines only the selected pilot and authorizes neither derivative execution nor publication.", checks);

  check("dry_run_plan", plan?.mode === "dry-run" && plan.status === "planned" && plan.plannedCommandCount === 48 && plan.operations?.length === 48 && plan.optionalWebmIncluded === false, "The derivative plan contains 48 inert MP4/WebP operations and no optional WebM work.", checks);
  check("dry_run_profiles", Object.values(plan.profileCounts || {}).every((count) => count === 12) && Object.keys(plan.profileCounts || {}).length === 4, "The plan contains 12 card previews, 12 mobile previews, 12 posters, and 12 thumbnails.", checks);
  check("planning_non_destructive", plan.commandsExecuted === 0 && plan.sourceFilesModified === 0 && plan.mediaFilesCopied === 0 && plan.mediaFilesTranscoded === 0 && plan.derivativesGenerated === 0 && plan.publicFilesWritten === 0, "Planning executed no command and created or changed no media.", checks);
  check("source_verification", sourceVerification?.sourceIntegrityPassed === true && sourceVerification.records?.length === 12 && sourceVerification.records.every((record) => record.sourceExists && record.checksumMatches), "The approved source snapshot verifies all 12 files and checksums.", checks);

  for (const record of selectedRecords) {
    assert.ok(record, "Every approved record must remain in the manifest.");
    const actualChecksum = await hashFile(sourcePathFor(record));
    assert.strictEqual(actualChecksum, approval.sourceChecksums[record.id], `${record.id} source checksum changed.`);
  }
  check("source_checksums_unchanged", true, "All 12 source checksums still match the approval artifact after planning.", checks);

  const publicPilotOutputs = selectedIds.filter((mediaId) => fs.existsSync(path.join(publicRoot, "pilot-v1", mediaId)));
  const generatedDerivativeEntries = fs.existsSync(derivativeRoot) ? fs.readdirSync(derivativeRoot) : [];
  const lifecycleState = determineLifecycleState(gate, artifacts);
  const published = lifecycleState === "published";
  check("public_media_scope", published ? publicPilotOutputs.length === 12 : publicPilotOutputs.length === 0, "Public pilot directories are absent before publication or exactly match the 12 approved records after publication.", checks);
  check("later_derivative_chain_valid", generatedDerivativeEntries.length === 0 || (artifacts.derivativeExecutionAuthorization && artifacts.derivatives && artifacts.derivativeValidation?.valid === true), "Any later generated derivatives are backed by execution authorization and successful validation.", checks);
  check("publication_chain_valid", published ? Boolean(artifacts.publicationAuthorization && artifacts.publicationReceipt?.totalFilesPublished === 49) : !artifacts.publicationAuthorization && !artifacts.publicationReceipt, "Publication artifacts are either absent before authorization or complete for the exact 49-file published pilot.", checks);
  check("lifecycle_handoff", ["derivative_plan_ready", "derivative_execution_authorized", "derivatives_generated", "derivatives_validated", "publication_plan_ready", "publication_authorized", "published"].includes(lifecycleState), "The lifecycle remains in a valid ordered state.", checks);

  const plannerSource = fs.readFileSync(path.join(root, "scripts", "planTeoyubeWorldApprovedPilotDerivatives.cjs"), "utf8");
  check("planner_has_no_execution_api", !/require\(["']child_process["']\)|\bspawn(?:Sync)?\s*\(|\bexec(?:File|Sync)?\s*\(|copyFile(?:Sync)?\s*\(|createWriteStream\s*\(|rename(?:Sync)?\s*\(|moveFile/i.test(plannerSource), "The planner contains no process, copy, write-stream, rename, move, or transcoding API.", checks);
  check("planner_has_no_external_service", !/fetch\s*\(|https?\.|api\.openai|cloudinary|youtube\.googleapis|s3\.amazonaws/i.test(plannerSource), "The planner calls no external service.", checks);
  check("app_artifacts_hide_absolute_paths", !/[A-Za-z]:[\\/]/.test(JSON.stringify(plan)) && !/[A-Za-z]:[\\/]/.test(JSON.stringify(sourceVerification)), "App-facing plan and source-verification artifacts contain no absolute Windows paths.", checks);

  const report = {
    valid: checks.every((item) => item.passed),
    phase: "11.6C.2A.4",
    gateState: "owner_approved",
    lifecycleState,
    canonicalRevision: gate.stateRevision,
    pilotPlanId: canonical.pilotPlanId,
    approvedRecords: 12,
    approvedSequences: 1,
    approvedSequenceSegments: 12,
    blockerCount: 0,
    plannedOperations: 48,
    commandsExecuted: artifacts.derivatives?.commandsExecuted || 0,
    sourceFilesModified: 0,
    mediaFilesCopied: 0,
    mediaFilesTranscoded: 0,
    publicFilesWritten: artifacts.publicationReceipt?.totalFilesPublished || 0,
    checks
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

module.exports = { run };
