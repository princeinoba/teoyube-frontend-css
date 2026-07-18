const fs = require("fs");
const path = require("path");
const {
  projectRoot,
  sourceRoot,
  publicMediaRoot,
  pilotRoot,
  authorizationRoot,
  preExecutionSnapshotPath,
  frozenPlanPath,
  executionAuthorizationPath,
  executionResultPath,
  sourceIntegrityAfterPath,
  derivativeValidationPath,
  runtimeManifestPreviewPath,
  publicationPlanPath,
  EXPECTED_APPROVAL_CHECKSUM,
  EXPECTED_CANONICAL_REVISION,
  EXPECTED_RECORD_COUNT,
  EXPECTED_SEQUENCE_ID,
  EXPECTED_OPERATION_COUNT,
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
  sourcePathForRecord
} = require("./teoyubeWorldDerivativeExecution.cjs");
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
const { loadReviewWorkspace, applyPatches } = require("./teoyubeWorldReviewPatches.cjs");

const EXACT_PUBLICATION_AUTHORIZATION = "AUTHORIZE APPROVED PILOT PUBLICATION";
const EXPECTED_PUBLICATION_PLAN_CHECKSUM = "dcef427b416d775e502e866c0388e02aa3b37a838dcf90679c36dde2a285e4c6";
const EXPECTED_PUBLICATION_PLAN_FILE_CHECKSUM = "162b86034bf92b754b4bdfdc6ebb71bb911c50178f23c872452ddc7ece7f0b94";
const EXPECTED_DERIVATIVE_VALIDATION_CHECKSUM = "5d3ef3d6d1f6c8493ed9766bdf9062f4cc737aa70751157200bbab0d9260e37d";
const EXPECTED_RUNTIME_MANIFEST_FILE_CHECKSUM = "68b497ffdad2686142dc400546bf9f1cc3635e7f4d5b282b0cded3b7a72131f3";
const EXPECTED_TOTAL_PUBLICATION_FILES = 49;
const EXPECTED_TOTAL_PUBLICATION_BYTES = 12058862;

const publicationRoot = path.join(pilotRoot, "publication");
const publicationStagingRoot = path.join(pilotRoot, "publication-staging");
const publicationAuthorizationPath = path.join(authorizationRoot, "publication-authorization.json");
const publicationResultPath = path.join(publicationRoot, "publication-result.json");
const publicationReceiptPath = path.join(publicationRoot, "publication-receipt.json");
const publicationValidationPath = path.join(publicationRoot, "publication-validation.json");
const publishedPilotRoot = path.join(publicMediaRoot, "teoyubeworld", "pilot-v1");
const publishedRuntimeManifestPath = path.join(publishedPilotRoot, "runtime-manifest.json");

function check(checks, blockers, id, passed, detail) {
  const result = { id, passed: Boolean(passed), detail };
  checks.push(result);
  if (!result.passed) blockers.push({ code: id, message: detail, mediaId: null });
}

function safePlanItemPaths(item) {
  try {
    const generatedPath = resolveProjectPath(item.generatedPath);
    const publicPath = resolveProjectPath(item.proposedPublicPath);
    return {
      generatedPath,
      publicPath,
      safe: isWithin(pilotRoot, generatedPath) &&
        !isWithin(sourceRoot, generatedPath, true) &&
        !isWithin(publicMediaRoot, generatedPath, true) &&
        isWithin(publishedPilotRoot, publicPath)
    };
  } catch {
    return { generatedPath: null, publicPath: null, safe: false };
  }
}

function verifyCurrentSources(approval, recordsById, preExecution) {
  const preById = new Map((preExecution.sourceSnapshots || []).map((item) => [item.mediaId, item]));
  return (approval.approvedRecordIds || []).map((mediaId) => {
    const sourcePath = sourcePathForRecord(recordsById.get(mediaId));
    const exists = Boolean(sourcePath && fs.existsSync(sourcePath) && fs.statSync(sourcePath).isFile());
    const stat = exists ? fs.statSync(sourcePath) : null;
    const expected = approval.sourceChecksums?.[mediaId] || null;
    const before = preById.get(mediaId);
    const checksum = exists ? sha256File(sourcePath) : null;
    return {
      mediaId,
      sourceReference: `<protected-source:${mediaId}>`,
      exists,
      checksumSha256: checksum,
      expectedChecksumSha256: expected,
      checksumMatches: Boolean(checksum && checksum === expected),
      byteSize: stat?.size ?? null,
      byteSizeUnchanged: Boolean(stat && before && stat.size === before.byteSize),
      modificationTimeMs: stat?.mtimeMs ?? null,
      modificationTimeUnchanged: Boolean(stat && before && stat.mtimeMs === before.modificationTimeMs)
    };
  });
}

function validatePublishedTree(plan) {
  const checks = [];
  const failures = [];
  const expectedPaths = new Set();
  let totalBytes = 0;
  for (const item of plan.items || []) {
    const paths = safePlanItemPaths(item);
    const relative = paths.publicPath && isWithin(publishedPilotRoot, paths.publicPath)
      ? path.relative(publishedPilotRoot, paths.publicPath).replace(/\\/g, "/")
      : null;
    if (relative) expectedPaths.add(relative);
    const exists = Boolean(paths.safe && paths.publicPath && fs.existsSync(paths.publicPath) && fs.statSync(paths.publicPath).isFile());
    const stat = exists ? fs.statSync(paths.publicPath) : null;
    const checksum = exists ? sha256File(paths.publicPath) : null;
    const valid = Boolean(exists && stat.size === item.byteSize && checksum === item.checksumSha256);
    checks.push({ proposedPublicUrl: item.proposedPublicUrl, relativePath: relative, exists, byteSize: stat?.size ?? null, checksumSha256: checksum, valid });
    if (!valid) failures.push({ code: "published_file_mismatch", message: `Published output does not match the authorized plan: ${item.proposedPublicUrl}`, mediaId: item.mediaId || null });
    if (stat) totalBytes += stat.size;
  }
  const tree = snapshotTree(publishedPilotRoot);
  const unexpectedFiles = tree.files.map((item) => item.path).filter((item) => !expectedPaths.has(item));
  const missingFiles = [...expectedPaths].filter((item) => !tree.files.some((file) => file.path === item));
  return {
    valid: failures.length === 0 && unexpectedFiles.length === 0 && missingFiles.length === 0 && tree.fileCount === EXPECTED_TOTAL_PUBLICATION_FILES && totalBytes === EXPECTED_TOTAL_PUBLICATION_BYTES,
    checks,
    failures,
    unexpectedFiles,
    missingFiles,
    tree,
    totalBytes
  };
}

async function verifyPublicationBaseline(options = {}) {
  const checks = [];
  const blockers = [];
  const required = [
    lifecyclePaths.approval,
    ownerAttestationPath,
    frozenPlanPath,
    executionAuthorizationPath,
    executionResultPath,
    sourceIntegrityAfterPath,
    derivativeValidationPath,
    runtimeManifestPreviewPath,
    publicationPlanPath
  ];
  for (const filePath of required) check(checks, blockers, `artifact_${path.basename(filePath)}`, fs.existsSync(filePath), `${projectPath(filePath)} must exist.`);
  if (blockers.length) return { report: { valid: false, checks, blockers }, context: null };

  const approval = readJson(lifecyclePaths.approval);
  const attestation = readJson(ownerAttestationPath);
  const frozen = readJson(frozenPlanPath);
  const executionAuthorization = readJson(executionAuthorizationPath);
  const execution = readJson(executionResultPath);
  const sourceIntegrity = readJson(sourceIntegrityAfterPath);
  const validation = readJson(derivativeValidationPath);
  const runtimeManifest = readJson(runtimeManifestPreviewPath);
  const plan = readJson(publicationPlanPath);
  const artifacts = artifactSnapshot();
  const gate = await getCanonicalGateSnapshot();
  const revision = ensureCanonicalStateRevision(getCanonicalPilotState()).stateRevision;
  const lifecycleState = determineLifecycleState(gate, artifacts);
  const allowedStates = options.allowedStates || ["publication_plan_ready"];

  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(manifest, patches, sourceChecksum);
  const recordsById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  const preExecution = readJson(preExecutionSnapshotPath);
  const sources = verifyCurrentSources(approval, recordsById, preExecution);

  check(checks, blockers, "canonical_revision", revision === EXPECTED_CANONICAL_REVISION && gate.stateRevision === EXPECTED_CANONICAL_REVISION, `Canonical revision must remain ${EXPECTED_CANONICAL_REVISION}.`);
  check(checks, blockers, "owner_gate", gate.gatePassed === true && gate.blockerCount === 0, "The complete owner gate must still report zero blockers.");
  check(checks, blockers, "lifecycle_state", allowedStates.includes(lifecycleState), `Lifecycle state must be one of: ${allowedStates.join(", ")}.`);
  check(checks, blockers, "approval_checksum", approval.artifactChecksumSha256 === EXPECTED_APPROVAL_CHECKSUM && artifactChecksum(approval) === EXPECTED_APPROVAL_CHECKSUM, "The exact owner approval checksum must remain valid.");
  check(checks, blockers, "attestation_binding", artifactChecksum(attestation) === approval.ownerAttestationArtifactChecksum && attestation.artifactId === approval.ownerAttestationArtifactId, "Owner attestation must remain checksum-bound to the approval.");
  check(checks, blockers, "approved_scope", approval.approvedRecordIds?.length === EXPECTED_RECORD_COUNT && approval.approvedSequenceIds?.length === 1 && approval.approvedSequenceIds[0] === EXPECTED_SEQUENCE_ID && approval.approvedSequenceOrder?.length === EXPECTED_RECORD_COUNT, "Publication scope must remain exactly 12 approved shorts in one 12-segment Scripture sequence.");
  check(checks, blockers, "no_long_form", approval.exactValidationResult?.counts?.approvedLongForm === 0, "No long-form media may enter the pilot publication.");
  check(checks, blockers, "frozen_plan", frozen.operationCount === EXPECTED_OPERATION_COUNT && frozen.frozenPlanChecksumSha256 === artifactChecksum(frozen, "frozenPlanChecksumSha256"), "The 48-operation frozen derivative plan must remain checksum-valid.");
  check(checks, blockers, "execution_authorization", executionAuthorization.artifactChecksumSha256 === artifactChecksum(executionAuthorization) && executionAuthorization.publicationAuthorized === false && executionAuthorization.publicWriteAuthorized === false, "Derivative execution authorization must remain valid and publication-limited.");
  check(checks, blockers, "execution_result", execution.successfulOperationCount === EXPECTED_OPERATION_COUNT && execution.failedOperationCount === 0 && execution.sourceIntegrityPassed === true && execution.publicMediaUnchanged === true, "All 48 approved derivative operations must have succeeded before publication.");
  check(checks, blockers, "derivative_validation", validation.valid === true && validation.validatedOperationCount === EXPECTED_OPERATION_COUNT && validation.failedOperationCount === 0 && validation.artifactChecksumSha256 === EXPECTED_DERIVATIVE_VALIDATION_CHECKSUM && artifactChecksum(validation) === EXPECTED_DERIVATIVE_VALIDATION_CHECKSUM, "All 48 derivatives must retain the exact successful validation artifact.");
  check(checks, blockers, "source_integrity_artifact", sourceIntegrity.valid === true && sourceIntegrity.sourceFilesModified === 0 && sourceIntegrity.sourceFilesRenamed === 0 && sourceIntegrity.sourceFilesMoved === 0 && sourceIntegrity.sourceFilesDeleted === 0, "The post-execution source-integrity artifact must remain clear.");
  check(checks, blockers, "source_integrity_current", sources.length === EXPECTED_RECORD_COUNT && sources.every((item) => item.exists && item.checksumMatches && item.byteSizeUnchanged && item.modificationTimeUnchanged), "All 12 protected source files must still match their approved checksums, sizes, and modification times.");
  check(checks, blockers, "runtime_manifest", runtimeManifest.recordCount === EXPECTED_RECORD_COUNT && runtimeManifest.records?.length === EXPECTED_RECORD_COUNT && sha256File(runtimeManifestPreviewPath) === EXPECTED_RUNTIME_MANIFEST_FILE_CHECKSUM, "The exact 12-record sanitized runtime-manifest preview must remain unchanged.");
  check(checks, blockers, "runtime_manifest_safe", !/[A-Za-z]:[\\/]/.test(JSON.stringify(runtimeManifest)) && !/media-source|protected-source|temporary-output|ownerPrivate|ffmpegArguments/i.test(JSON.stringify(runtimeManifest)), "The runtime manifest must contain no protected, private, command, temporary, or absolute path data.");
  check(checks, blockers, "publication_plan_checksum", plan.planChecksumSha256 === EXPECTED_PUBLICATION_PLAN_CHECKSUM && artifactChecksum(plan, "planChecksumSha256") === EXPECTED_PUBLICATION_PLAN_CHECKSUM && sha256File(publicationPlanPath) === EXPECTED_PUBLICATION_PLAN_FILE_CHECKSUM, "The exact owner-authorized publication plan checksum must remain valid.");
  check(checks, blockers, "publication_plan_scope", plan.mode === "dry-run" && plan.totalFileCount === EXPECTED_TOTAL_PUBLICATION_FILES && plan.derivativeFileCount === EXPECTED_OPERATION_COUNT && plan.manifestFileCount === 1 && plan.totalByteSize === EXPECTED_TOTAL_PUBLICATION_BYTES && Object.values(plan.profileCounts || {}).every((count) => count === EXPECTED_RECORD_COUNT), "Publication plan must contain exactly 48 derivatives and one runtime manifest with the approved byte total.");
  check(checks, blockers, "publication_plan_bindings", plan.canonicalPilotRevision === EXPECTED_CANONICAL_REVISION && plan.derivativeValidationChecksumSha256 === EXPECTED_DERIVATIVE_VALIDATION_CHECKSUM && plan.runtimeManifestPreviewChecksumSha256 === runtimeManifest.manifestChecksumSha256, "Publication plan must remain bound to the canonical pilot, derivative validation, and runtime manifest.");
  check(checks, blockers, "stale_files", Array.isArray(plan.stalePilotFiles) && plan.stalePilotFiles.length === 0, "The authorized publication plan must not include stale-file removal.");

  const itemKeys = new Set();
  const publicPaths = new Set();
  let plannedBytes = 0;
  for (const item of plan.items || []) {
    const paths = safePlanItemPaths(item);
    const exists = Boolean(paths.safe && paths.generatedPath && fs.existsSync(paths.generatedPath) && fs.statSync(paths.generatedPath).isFile());
    const stat = exists ? fs.statSync(paths.generatedPath) : null;
    const checksum = exists ? sha256File(paths.generatedPath) : null;
    check(checks, blockers, `item_${item.operationId || "runtime_manifest"}`, paths.safe && exists && stat.size === item.byteSize && checksum === item.checksumSha256, `Planned item must remain safe and checksum-valid: ${item.proposedPublicUrl}`);
    const key = `${item.itemType}:${item.operationId || "runtime-manifest"}`;
    check(checks, blockers, `item_unique_${item.operationId || "runtime_manifest"}`, !itemKeys.has(key) && !publicPaths.has(item.proposedPublicPath), `Planned item and destination must be unique: ${item.proposedPublicUrl}`);
    itemKeys.add(key);
    publicPaths.add(item.proposedPublicPath);
    plannedBytes += Number(item.byteSize || 0);
  }
  check(checks, blockers, "item_accounting", itemKeys.size === EXPECTED_TOTAL_PUBLICATION_FILES && publicPaths.size === EXPECTED_TOTAL_PUBLICATION_FILES && plannedBytes === EXPECTED_TOTAL_PUBLICATION_BYTES, "All 49 unique planned files and bytes must reconcile.");
  check(checks, blockers, "metadata_paths", !/[A-Za-z]:[\\/]/.test(JSON.stringify({ approval, attestation, runtimeManifest, plan })), "App-facing publication metadata must contain no absolute Windows paths.");

  if (options.requireUnpublished === true) {
    check(checks, blockers, "authorization_absent", !fs.existsSync(publicationAuthorizationPath) && !artifacts.publicationAuthorization, "No publication authorization may pre-exist.");
    check(checks, blockers, "receipt_absent", !fs.existsSync(publicationReceiptPath) && !artifacts.publicationReceipt, "No publication receipt may pre-exist.");
    check(checks, blockers, "public_tree_unchanged", snapshotTree(publicMediaRoot).fingerprint === preExecution.publicMediaSnapshot.fingerprint && !fs.existsSync(publishedPilotRoot), "public/media must remain unchanged before publication authorization.");
  }

  const report = {
    artifactType: "teoyubeworld_publication_baseline_verification",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.2",
    verifiedAt: new Date().toISOString(),
    valid: blockers.length === 0,
    lifecycleState,
    canonicalRevision: revision,
    approvalArtifactChecksumSha256: approval.artifactChecksumSha256,
    derivativeValidationChecksumSha256: validation.artifactChecksumSha256,
    runtimeManifestFileChecksumSha256: sha256File(runtimeManifestPreviewPath),
    publicationPlanChecksumSha256: plan.planChecksumSha256,
    publicationPlanFileChecksumSha256: sha256File(publicationPlanPath),
    approvedRecordCount: approval.approvedRecordIds.length,
    approvedSequenceIds: [...approval.approvedSequenceIds],
    approvedSequenceSegmentCount: approval.approvedSequenceOrder.length,
    approvedLongFormCount: 0,
    plannedDerivativeFiles: plan.derivativeFileCount,
    plannedManifestFiles: plan.manifestFileCount,
    plannedTotalFiles: plan.totalFileCount,
    plannedTotalBytes: plan.totalByteSize,
    sourceIntegrityPassed: sources.every((item) => item.exists && item.checksumMatches && item.byteSizeUnchanged && item.modificationTimeUnchanged),
    sourceSnapshots: sources,
    blockers,
    checks
  };
  assertNoAbsoluteWindowsPath(report, "Publication baseline report");
  return {
    report,
    context: blockers.length ? null : { approval, attestation, frozen, executionAuthorization, execution, sourceIntegrity, validation, runtimeManifest, plan, preExecution, artifacts, gate, sources }
  };
}

function validatePublicationAuthorization(authorization, context) {
  return Boolean(
    authorization &&
    authorization.artifactType === "teoyubeworld_pilot_publication_authorization" &&
    authorization.authorizationType === "approved_pilot_publication" &&
    authorization.ownerResponse === EXACT_PUBLICATION_AUTHORIZATION &&
    authorization.ownerConfirmation?.confirmed === true &&
    authorization.lifecycleState === "publication_authorized" &&
    authorization.canonicalRevision === EXPECTED_CANONICAL_REVISION &&
    authorization.approvalArtifactChecksumSha256 === EXPECTED_APPROVAL_CHECKSUM &&
    authorization.publicationPlanChecksumSha256 === EXPECTED_PUBLICATION_PLAN_CHECKSUM &&
    authorization.derivativeValidationChecksumSha256 === EXPECTED_DERIVATIVE_VALIDATION_CHECKSUM &&
    authorization.runtimeManifestFileChecksumSha256 === EXPECTED_RUNTIME_MANIFEST_FILE_CHECKSUM &&
    authorization.sourceChecksumsUnchanged === true &&
    authorization.runtimeManifestApproved === true &&
    authorization.totalFileCount === EXPECTED_TOTAL_PUBLICATION_FILES &&
    authorization.totalByteSize === EXPECTED_TOTAL_PUBLICATION_BYTES &&
    authorization.artifactChecksumSha256 === artifactChecksum(authorization) &&
    context.plan.planChecksumSha256 === authorization.publicationPlanChecksumSha256
  );
}

module.exports = {
  EXACT_PUBLICATION_AUTHORIZATION,
  EXPECTED_PUBLICATION_PLAN_CHECKSUM,
  EXPECTED_PUBLICATION_PLAN_FILE_CHECKSUM,
  EXPECTED_DERIVATIVE_VALIDATION_CHECKSUM,
  EXPECTED_RUNTIME_MANIFEST_FILE_CHECKSUM,
  EXPECTED_TOTAL_PUBLICATION_FILES,
  EXPECTED_TOTAL_PUBLICATION_BYTES,
  publicationRoot,
  publicationStagingRoot,
  publicationAuthorizationPath,
  publicationResultPath,
  publicationReceiptPath,
  publicationValidationPath,
  publishedPilotRoot,
  publishedRuntimeManifestPath,
  safePlanItemPaths,
  verifyCurrentSources,
  validatePublishedTree,
  verifyPublicationBaseline,
  validatePublicationAuthorization,
  fingerprint
};
