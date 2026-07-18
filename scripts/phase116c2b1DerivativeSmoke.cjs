const fs = require("fs");
const path = require("path");
const vm = require("vm");
const {
  projectRoot,
  sourceRoot,
  publicMediaRoot,
  pilotRoot,
  frozenPlanPath,
  preExecutionSnapshotPath,
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
  EXACT_EXECUTION_AUTHORIZATION,
  PROFILE_DEFINITIONS,
  readJson,
  sha256File,
  artifactChecksum,
  resolveProjectPath,
  isWithin,
  snapshotTree,
  sourcePathForRecord
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState,
  fingerprint
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const {
  getCanonicalPilotState,
  ensureCanonicalStateRevision,
  ownerAttestationPath
} = require("./lib/teoyubeWorldCanonicalPilotState.cjs");
const { getCanonicalGateSnapshot } = require("./validateTeoyubeWorldOwnerGate.cjs");
const { loadReviewWorkspace, applyPatches } = require("./lib/teoyubeWorldReviewPatches.cjs");
const { validatePublishedTree } = require("./lib/teoyubeWorldPilotPublication.cjs");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function parses(relativePath) {
  try {
    new vm.Script(read(relativePath), { filename: relativePath });
    return true;
  } catch {
    return false;
  }
}

function checksumWithout(value, field) {
  const copy = { ...value };
  delete copy[field];
  return fingerprint(copy);
}

async function run() {
  const checks = [];
  const check = (id, passed, detail) => {
    checks.push({ id, passed: Boolean(passed), detail });
    if (!passed) throw new Error(`${id}: ${detail}`);
  };

  for (const file of [
    "app.js",
    "server.js",
    "media-review.js",
    "media-review-wizard.js",
    "media-review-derivatives.js",
    "scripts/generateTeoyubeWorldDerivatives.cjs",
    "scripts/validateTeoyubeWorldDerivatives.cjs",
    "scripts/planTeoyubeWorldPilotPublication.cjs",
    "scripts/phase116c2b1DerivativeSmoke.cjs"
  ]) check(`parses_${file.replace(/[^a-z0-9]+/gi, "_")}`, parses(file), `${file} parses.`);

  const requiredArtifacts = [
    frozenPlanPath,
    preExecutionSnapshotPath,
    executionAuthorizationPath,
    executionResultPath,
    sourceIntegrityAfterPath,
    derivativeValidationPath,
    runtimeManifestPreviewPath,
    publicationPlanPath,
    lifecyclePaths.approval,
    ownerAttestationPath
  ];
  for (const file of requiredArtifacts) check(`artifact_${path.basename(file)}`, fs.existsSync(file), `${path.relative(projectRoot, file)} exists.`);

  const approval = readJson(lifecyclePaths.approval);
  const attestation = readJson(ownerAttestationPath);
  const frozen = readJson(frozenPlanPath);
  const preExecution = readJson(preExecutionSnapshotPath);
  const authorization = readJson(executionAuthorizationPath);
  const execution = readJson(executionResultPath);
  const integrity = readJson(sourceIntegrityAfterPath);
  const validation = readJson(derivativeValidationPath);
  const manifest = readJson(runtimeManifestPreviewPath);
  const publicationPlan = readJson(publicationPlanPath);
  const artifacts = artifactSnapshot();
  const gate = await getCanonicalGateSnapshot();
  const revision = ensureCanonicalStateRevision(getCanonicalPilotState()).stateRevision;
  const lifecycleState = determineLifecycleState(gate, artifacts);

  check("approval_checksum", approval.artifactChecksumSha256 === EXPECTED_APPROVAL_CHECKSUM && artifactChecksum(approval) === EXPECTED_APPROVAL_CHECKSUM, "The owner approval checksum matches the exact authorized artifact.");
  check("canonical_revision", revision === EXPECTED_CANONICAL_REVISION && gate.stateRevision === EXPECTED_CANONICAL_REVISION, "The canonical pilot revision remains exact.");
  check("owner_attestation", artifactChecksum(attestation) === approval.ownerAttestationArtifactChecksum && attestation.artifactId === approval.ownerAttestationArtifactId, "The owner attestation remains checksum-bound to the approval.");
  check("owner_gate", gate.gatePassed === true && gate.blockerCount === 0 && gate.counts.approvedShorts === 12 && gate.counts.approvedLongForm === 0, "The owner gate remains zero-blocker for exactly 12 shorts and no long form.");
  check("approved_sequence", approval.approvedSequenceIds?.length === 1 && approval.approvedSequenceIds[0] === EXPECTED_SEQUENCE_ID && approval.approvedSequenceOrder?.length === 12, "Exactly one ordered 12-segment Scripture sequence remains approved.");

  check("frozen_plan", frozen.operationCount === EXPECTED_OPERATION_COUNT && frozen.approvedRecordIds?.length === EXPECTED_RECORD_COUNT && frozen.frozenPlanChecksumSha256 === artifactChecksum(frozen, "frozenPlanChecksumSha256"), "The frozen plan contains the exact 48-operation approved scope and a valid checksum.");
  check("execution_authorization", authorization.ownerResponse === EXACT_EXECUTION_AUTHORIZATION && authorization.operationCount === EXPECTED_OPERATION_COUNT && authorization.publicationAuthorized === false && authorization.publicWriteAuthorized === false && authorization.artifactChecksumSha256 === artifactChecksum(authorization), "Execution authorization is exact, checksum-valid, and does not authorize publication.");
  check("authorization_bindings", authorization.approvalArtifactChecksumSha256 === EXPECTED_APPROVAL_CHECKSUM && authorization.canonicalRevision === EXPECTED_CANONICAL_REVISION && authorization.frozenPlanChecksumSha256 === frozen.frozenPlanChecksumSha256, "Execution authorization remains bound to the exact approval, revision, and frozen plan.");

  check("execution_accounting", execution.operationCount === EXPECTED_OPERATION_COUNT && execution.successfulOperationCount === EXPECTED_OPERATION_COUNT && execution.failedOperationCount === 0 && execution.sourceIntegrityPassed === true && execution.publicMediaUnchanged === true, "All 48 authorized operations succeeded with source and public integrity intact.");
  for (const [profile, definition] of Object.entries(PROFILE_DEFINITIONS)) {
    const operations = execution.operationResults.filter((operation) => operation.profile === profile);
    check(`outputs_${definition.variant}`, operations.length === EXPECTED_RECORD_COUNT && operations.every((operation) => {
      const outputPath = resolveProjectPath(operation.outputPath);
      return fs.existsSync(outputPath) && isWithin(pilotRoot, outputPath) && !isWithin(sourceRoot, outputPath, true) && !isWithin(publicMediaRoot, outputPath, true) && fs.statSync(outputPath).size > 0 && sha256File(outputPath) === operation.outputChecksumSha256;
    }), `Exactly 12 checksummed ${definition.variant} outputs exist inside the generated pilot boundary.`);
  }

  check("derivative_validation", validation.valid === true && validation.validatedOperationCount === EXPECTED_OPERATION_COUNT && validation.failedOperationCount === 0 && validation.operationValidations.every((item) => item.valid === true), "All 48 derivative operations validate.");
  check("source_integrity", integrity.valid === true && integrity.sourceFilesModified === 0 && integrity.sourceFilesRenamed === 0 && integrity.sourceFilesMoved === 0 && integrity.sourceFilesDeleted === 0 && integrity.records?.length === EXPECTED_RECORD_COUNT && integrity.records.every((item) => item.exists && !item.checksumChanged && !item.byteSizeChanged && !item.modificationTimeChanged), "All 12 protected sources remain byte-for-byte and timestamp unchanged.");

  const { manifest: draft, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(draft, patches, sourceChecksum);
  const recordsById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  check("source_recheck", approval.approvedRecordIds.every((mediaId) => {
    const sourcePath = sourcePathForRecord(recordsById.get(mediaId));
    return sourcePath && fs.existsSync(sourcePath) && sha256File(sourcePath) === approval.sourceChecksums[mediaId];
  }), "Current protected source checksums still match the approval artifact.");
  const publicValidation = lifecycleState === "published" ? validatePublishedTree(publicationPlan) : null;
  check("public_tree_scope", lifecycleState === "published" ? publicValidation.valid && publicValidation.tree.fileCount === 49 : snapshotTree(publicMediaRoot).fingerprint === preExecution.publicMediaSnapshot.fingerprint, "public/media is unchanged before publication or exactly matches the authorized 49-file plan after publication.");

  const manifestText = JSON.stringify(manifest);
  check("runtime_manifest", manifest.recordCount === EXPECTED_RECORD_COUNT && manifest.records.length === EXPECTED_RECORD_COUNT && manifest.publicationAuthorized === false && manifest.publicFilesWritten === 0, "The sanitized runtime-manifest preview contains exactly 12 unpublished records.");
  check("runtime_manifest_safe", !/[A-Za-z]:[\\/]/.test(manifestText) && !/media-source|protected-source|temporary-output|ownerPrivate|ffmpegArguments/i.test(manifestText), "The runtime-manifest preview exposes no protected, temporary, command, private-note, or absolute path data.");

  const html = read("media-review.html");
  const reviewClient = read("media-review-derivatives.js");
  const reviewCss = read("media-review.css");
  check("derivative_workspace", html.includes('id="derivative-review-workspace"') && reviewClient.includes("derivative-record-list") && reviewClient.includes("derivative-technical-comparison"), "The local owner derivative review workspace exists.");
  check("sequence_preview", ["derivative-play-selected", "derivative-play-sequence", "derivative-previous", "derivative-next", "derivative-pause", "derivative-restart-segment", "derivative-restart-sequence", "derivative-timeline"].every((id) => html.includes(`id="${id}"`)) && reviewClient.includes('addEventListener("ended"') && reviewClient.includes('addEventListener("keydown"'), "The owner-initiated sequence preview, progression, restart, timeline, and keyboard controls exist.");
  check("accessible_media_policy", html.includes('id="derivative-player"') && html.includes("muted") && !/autoplay/i.test(html.match(/<video id="derivative-player"[^>]*>/i)?.[0] || "") && reviewCss.includes("prefers-reduced-motion: reduce") && reviewClient.includes("matchMedia"), "Playback is muted, owner-initiated, and reduced-motion aware.");

  check("publication_plan", publicationPlan.lifecycleState === "publication_plan_ready" && publicationPlan.mode === "dry-run" && publicationPlan.derivativeFileCount === 48 && publicationPlan.manifestFileCount === 1 && publicationPlan.totalFileCount === 49 && Object.values(publicationPlan.profileCounts).every((count) => count === 12), "The publication plan previews 48 derivatives plus one sanitized manifest.");
  check("publication_plan_bindings", publicationPlan.derivativeValidationChecksumSha256 === validation.artifactChecksumSha256 && publicationPlan.runtimeManifestPreviewChecksumSha256 === manifest.manifestChecksumSha256, "The publication plan is bound to the current derivative validation and runtime-manifest preview.");
  check("publication_plan_checksum", publicationPlan.planChecksumSha256 === checksumWithout(publicationPlan, "planChecksumSha256"), "The publication plan checksum is valid.");
  check("publication_chain", publicationPlan.publicWritesExecuted === 0 && publicationPlan.sourceMastersCopied === 0 && publicationPlan.unapprovedFilesCopied === 0 && publicationPlan.publicationAuthorized === false && (lifecycleState === "published" ? Boolean(artifacts.publicationAuthorization && artifacts.publicationReceipt?.totalFilesPublished === 49) : !artifacts.publicationAuthorization && !artifacts.publicationReceipt), "The dry-run plan remains inert and any later publication is backed by separate authorization and an exact receipt.");
  check("lifecycle_state", ["publication_plan_ready", "publication_authorized", "published"].includes(lifecycleState), "The lifecycle remains at or after publication_plan_ready without skipping a state.");

  const phaseSources = [
    read("server.js"),
    read("media-review-derivatives.js"),
    read("scripts/generateTeoyubeWorldDerivatives.cjs"),
    read("scripts/validateTeoyubeWorldDerivatives.cjs"),
    read("scripts/planTeoyubeWorldPilotPublication.cjs")
  ].join("\n");
  check("no_external_upload", !/cloudinary|s3\.amazonaws|youtube\.googleapis|presigned|multipart\/form-data/i.test(phaseSources) && execution.externalUploads === 0, "No external upload or media service is used.");
  check("no_analytics_database_ai_worker", !/gtag\(|posthog|mixpanel|plausible|indexedDB|new\s+PrismaClient|createClient\([^)]*supabase|chat\/completions|responses\.create|new\s+OpenAI|serviceWorker\.register|navigator\.serviceWorker/i.test(phaseSources), "No analytics, database, live AI, browser persistence, or service worker was added.");
  check("scripture_guardrails", read("app.js").includes("Scripture") && read("server.js").includes("publication_execution_not_exposed") && html.includes("Scripture sequence"), "Scripture and publication guardrails remain present.");

  const report = {
    valid: checks.every((item) => item.passed),
    phase: "11.6C.2B.1",
    lifecycleState,
    canonicalRevision: revision,
    approvedRecords: approval.approvedRecordIds.length,
    approvedSequences: approval.approvedSequenceIds.length,
    successfulOperations: execution.successfulOperationCount,
    validatedOperations: validation.validatedOperationCount,
    runtimeManifestRecords: manifest.recordCount,
    publicationPlanFiles: publicationPlan.totalFileCount,
    publicFilesWritten: artifacts.publicationReceipt?.totalFilesPublished || 0,
    sourceFilesModified: integrity.sourceFilesModified,
    externalUploads: execution.externalUploads,
    publicationAuthorized: Boolean(artifacts.publicationAuthorization),
    checksPassed: checks.filter((item) => item.passed).length,
    checks
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) run().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
module.exports = { run };
