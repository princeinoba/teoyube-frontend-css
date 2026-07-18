const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  projectRoot,
  sourceRoot,
  publicMediaRoot,
  pilotRoot,
  derivativePlanPath,
  temporaryRoot,
  logsRoot,
  frozenPlanPath,
  preExecutionSnapshotPath,
  executionAuthorizationPath,
  executionResultPath,
  executionLedgerPath,
  EXPECTED_APPROVAL_CHECKSUM,
  EXPECTED_CANONICAL_REVISION,
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
  snapshotTree,
  toolMetadata,
  operationArguments,
  sourcePathForRecord
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const {
  lifecyclePaths,
  fingerprint
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const { getCanonicalPilotState, ensureCanonicalStateRevision } = require("./lib/teoyubeWorldCanonicalPilotState.cjs");
const { getCanonicalGateSnapshot } = require("./validateTeoyubeWorldOwnerGate.cjs");
const { loadReviewWorkspace, applyPatches } = require("./lib/teoyubeWorldReviewPatches.cjs");

const commandLogPath = path.join(logsRoot, "derivative-execution-commands.jsonl");

function fail(message, code = "EXECUTION_BLOCKED") {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function redact(text, sourcePath) {
  return String(text || "")
    .split(sourcePath || "\0").join("<protected-source>")
    .split(sourceRoot).join("<protected-source-root>")
    .split(projectRoot).join("<project-root>")
    .slice(-12000);
}

function appendCommandLog(entry) {
  fs.mkdirSync(logsRoot, { recursive: true });
  fs.appendFileSync(commandLogPath, JSON.stringify(entry) + "\n", "utf8");
}

function basicProbe(ffprobePath, outputPath) {
  const result = spawnSync(ffprobePath, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", outputPath], {
    encoding: "utf8",
    windowsHide: true,
    shell: false
  });
  if (result.status !== 0) return { valid: false, error: redact(result.stderr, outputPath), data: null };
  try {
    return { valid: true, error: null, data: JSON.parse(result.stdout || "{}") };
  } catch {
    return { valid: false, error: "FFprobe returned invalid JSON.", data: null };
  }
}

function sourceState(record, expectedChecksum) {
  const sourcePath = sourcePathForRecord(record);
  if (!sourcePath || !fs.existsSync(sourcePath)) fail(`Approved source ${record?.id || "unknown"} is unavailable.`, "SOURCE_INTEGRITY");
  const stat = fs.statSync(sourcePath);
  const checksumSha256 = sha256File(sourcePath);
  if (checksumSha256 !== expectedChecksum) fail(`Approved source checksum changed for ${record.id}.`, "SOURCE_INTEGRITY");
  return { sourcePath, checksumSha256, byteSize: stat.size, modificationTimeMs: stat.mtimeMs };
}

function sameSourceState(left, right) {
  return left.checksumSha256 === right.checksumSha256 && left.byteSize === right.byteSize && left.modificationTimeMs === right.modificationTimeMs;
}

function outputPathFor(operation) {
  const outputPath = resolveProjectPath(operation.outputPath);
  if (!isWithin(pilotRoot, outputPath) || isWithin(sourceRoot, outputPath, true) || isWithin(publicMediaRoot, outputPath, true)) {
    fail(`Output boundary rejected ${operation.operationId}.`, "OUTPUT_BOUNDARY");
  }
  return outputPath;
}

function temporaryPathFor(operation, outputPath) {
  const extension = path.extname(outputPath);
  const temporaryPath = path.join(temporaryRoot, `${operation.operationId}.${process.pid}.partial${extension}`);
  if (!isWithin(temporaryRoot, temporaryPath) || isWithin(sourceRoot, temporaryPath, true) || isWithin(publicMediaRoot, temporaryPath, true)) {
    fail(`Temporary output boundary rejected ${operation.operationId}.`, "OUTPUT_BOUNDARY");
  }
  return temporaryPath;
}

function loadLedger() {
  if (!fs.existsSync(executionLedgerPath)) return { schemaVersion: "1.0.0", operations: [] };
  return readJson(executionLedgerPath);
}

function validateBoundArtifacts() {
  const required = [
    lifecyclePaths.approval,
    lifecyclePaths.derivativePlan,
    lifecyclePaths.derivativeExecutionAuthorization,
    derivativePlanPath,
    frozenPlanPath,
    preExecutionSnapshotPath,
    executionAuthorizationPath
  ];
  for (const filePath of required) if (!fs.existsSync(filePath)) fail(`Required execution artifact is missing: ${projectPath(filePath)}`);
  if (fs.existsSync(lifecyclePaths.publicationAuthorization)) fail("Publication authorization must not exist during derivative execution.");

  const approval = readJson(lifecyclePaths.approval);
  const plan = readJson(derivativePlanPath);
  const frozen = readJson(frozenPlanPath);
  const preExecution = readJson(preExecutionSnapshotPath);
  const authorization = readJson(executionAuthorizationPath);
  const lifecycleAuthorization = readJson(lifecyclePaths.derivativeExecutionAuthorization);
  const canonical = getCanonicalPilotState();
  const canonicalRevision = ensureCanonicalStateRevision(canonical);
  if (approval.artifactChecksumSha256 !== EXPECTED_APPROVAL_CHECKSUM || artifactChecksum(approval) !== EXPECTED_APPROVAL_CHECKSUM) fail("Approval artifact checksum no longer matches the owner-approved pilot.");
  if (canonicalRevision.stateRevision !== EXPECTED_CANONICAL_REVISION) fail("Canonical pilot revision changed after derivative authorization.");
  if (sha256File(derivativePlanPath) !== frozen.derivativePlanFileChecksumSha256) fail("The approved derivative plan file checksum changed after authorization.");
  if (artifactChecksum(frozen, "frozenPlanChecksumSha256") !== frozen.frozenPlanChecksumSha256) fail("The frozen derivative plan checksum is invalid.");
  if (artifactChecksum(preExecution) !== preExecution.artifactChecksumSha256) fail("The pre-execution snapshot checksum is invalid.");
  if (artifactChecksum(authorization) !== authorization.artifactChecksumSha256) fail("The derivative execution authorization checksum is invalid.");
  if (authorization.artifactChecksumSha256 !== lifecycleAuthorization.artifactChecksumSha256) fail("The lifecycle execution authorization does not match the frozen authorization.");
  if (authorization.ownerResponse !== EXACT_EXECUTION_AUTHORIZATION || authorization.authorizationType !== "approved_pilot_derivative_execution") fail("The exact owner derivative execution authorization is absent.");
  if (authorization.publicationAuthorized || authorization.publicWriteAuthorized) fail("Derivative execution authorization must not authorize publication.");
  if (plan.operations?.length !== EXPECTED_OPERATION_COUNT || frozen.operations?.length !== EXPECTED_OPERATION_COUNT || authorization.operationCount !== EXPECTED_OPERATION_COUNT) fail("Execution artifacts must remain bound to exactly 48 operations.");
  if (fingerprint(plan) !== fingerprint(readJson(lifecyclePaths.derivativePlan))) fail("The lifecycle derivative plan does not match the approved plan.");
  return { approval, plan, frozen, preExecution, authorization, canonical, canonicalRevision };
}

async function execute() {
  const bound = validateBoundArtifacts();
  const gate = await getCanonicalGateSnapshot();
  if (!gate.gatePassed || gate.blockerCount !== 0) fail("The canonical owner gate is no longer clear.", "SOURCE_INTEGRITY");
  const tools = toolMetadata();
  if (!tools.ready || !tools.h264Libx264 || !tools.webp) fail("FFmpeg derivative tooling is not ready.");

  const workspace = loadReviewWorkspace();
  const merged = applyPatches(workspace.manifest, workspace.patches, workspace.sourceChecksum);
  if (!merged.valid) fail("The canonical media patch set is invalid.");
  const recordsById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  const publicBefore = bound.preExecution.publicMediaSnapshot;
  const currentPublic = snapshotTree(publicMediaRoot);
  if (currentPublic.fingerprint !== publicBefore.fingerprint) fail("public/media changed after execution authorization.", "SOURCE_INTEGRITY");

  const ledger = loadLedger();
  const ledgerById = new Map((ledger.operations || []).map((operation) => [operation.operationId, operation]));
  const operationResults = [];
  const recordIntegrity = [];
  const errors = [];
  const warnings = [];
  let commandsExecuted = 0;
  let skippedValidOperations = 0;
  const executionStartedAt = new Date().toISOString();

  fs.mkdirSync(temporaryRoot, { recursive: true });
  fs.mkdirSync(logsRoot, { recursive: true });
  for (const mediaId of bound.approval.approvedRecordIds) {
    const record = recordsById.get(mediaId);
    if (!record || record.shortOrLong !== "short") fail(`Unapproved or long-form record entered execution: ${mediaId}`, "SOURCE_INTEGRITY");
    const expectedChecksum = bound.approval.sourceChecksums[mediaId];
    const before = sourceState(record, expectedChecksum);
    const frozenSource = bound.frozen.sourceSnapshots.find((source) => source.mediaId === mediaId);
    if (!frozenSource || frozenSource.byteSize !== before.byteSize || frozenSource.modificationTimeMs !== before.modificationTimeMs) {
      fail(`Approved source metadata changed for ${mediaId}.`, "SOURCE_INTEGRITY");
    }
    const recordOperations = bound.frozen.operations.filter((operation) => operation.mediaId === mediaId);
    if (recordOperations.length !== 4) fail(`Approved record ${mediaId} does not have exactly four frozen operations.`);

    for (const operation of recordOperations) {
      const profile = PROFILE_DEFINITIONS[operation.profile];
      const outputPath = outputPathFor(operation);
      const existing = ledgerById.get(operation.operationId);
      if (existing && fs.existsSync(outputPath)) {
        const existingChecksum = sha256File(outputPath);
        const canSkip = existing.mediaId === mediaId && existing.profile === operation.profile &&
          existing.sourceChecksumSha256 === expectedChecksum && existing.derivativePlanFileChecksumSha256 === bound.frozen.derivativePlanFileChecksumSha256 &&
          existing.outputChecksumSha256 === existingChecksum && existing.validationStatus === "passed";
        if (canSkip) {
          skippedValidOperations += 1;
          operationResults.push({ ...existing, status: "skipped_valid" });
          continue;
        }
        fail(`Existing derivative cannot be overwritten without a matching validated operation ledger: ${operation.operationId}`);
      }

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      const temporaryPath = temporaryPathFor(operation, outputPath);
      if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath, { force: true });
      const args = operationArguments(operation, before.sourcePath, temporaryPath);
      const safeArgs = operationArguments(operation, `<protected-source:${mediaId}>`, `<temporary-output:${operation.operationId}>`);
      const startedAt = new Date().toISOString();
      const command = spawnSync(tools.ffmpegPath, args, { encoding: "utf8", windowsHide: true, shell: false, maxBuffer: 16 * 1024 * 1024 });
      commandsExecuted += 1;
      const commandLog = {
        operationId: operation.operationId,
        mediaId,
        profile: operation.profile,
        startedAt,
        finishedAt: new Date().toISOString(),
        executable: "<local-ffmpeg-executable>",
        arguments: safeArgs,
        exitCode: command.status,
        outputPath: operation.outputPath,
        stderr: redact(command.stderr, before.sourcePath)
      };
      appendCommandLog(commandLog);

      if (command.status !== 0 || !fs.existsSync(temporaryPath) || fs.statSync(temporaryPath).size === 0) {
        if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath, { force: true });
        const message = `FFmpeg failed for ${operation.operationId} with exit code ${command.status}.`;
        errors.push({ operationId: operation.operationId, mediaId, message });
        operationResults.push({ operationId: operation.operationId, mediaId, profile: operation.profile, status: "failed", exitCode: command.status, error: message });
        continue;
      }
      const probe = basicProbe(tools.ffprobePath, temporaryPath);
      if (!probe.valid) {
        fs.rmSync(temporaryPath, { force: true });
        const message = `Generated output failed immediate FFprobe validation for ${operation.operationId}: ${probe.error}`;
        errors.push({ operationId: operation.operationId, mediaId, message });
        operationResults.push({ operationId: operation.operationId, mediaId, profile: operation.profile, status: "failed", exitCode: command.status, error: message });
        continue;
      }
      fs.renameSync(temporaryPath, outputPath);
      const stat = fs.statSync(outputPath);
      const result = {
        operationId: operation.operationId,
        mediaId,
        profile: operation.profile,
        variant: profile.variant,
        outputPath: operation.outputPath,
        outputBytes: stat.size,
        outputChecksumSha256: sha256File(outputPath),
        sourceChecksumSha256: expectedChecksum,
        derivativePlanFileChecksumSha256: bound.frozen.derivativePlanFileChecksumSha256,
        authorizationArtifactChecksumSha256: bound.authorization.artifactChecksumSha256,
        commandExitCode: command.status,
        status: "generated",
        validationStatus: "passed",
        generatedAt: new Date().toISOString()
      };
      operationResults.push(result);
      ledgerById.set(operation.operationId, result);
      writeJsonAtomic(executionLedgerPath, {
        artifactType: "teoyubeworld_derivative_operation_ledger",
        schemaVersion: "1.0.0",
        updatedAt: new Date().toISOString(),
        derivativePlanFileChecksumSha256: bound.frozen.derivativePlanFileChecksumSha256,
        operations: [...ledgerById.values()].sort((left, right) => left.operationId.localeCompare(right.operationId))
      });
    }

    const after = sourceState(record, expectedChecksum);
    const unchanged = sameSourceState(before, after);
    recordIntegrity.push({
      mediaId,
      sourceReference: `<protected-source:${mediaId}>`,
      checksumBeforeSha256: before.checksumSha256,
      checksumAfterSha256: after.checksumSha256,
      byteSizeBefore: before.byteSize,
      byteSizeAfter: after.byteSize,
      modificationTimeBeforeMs: before.modificationTimeMs,
      modificationTimeAfterMs: after.modificationTimeMs,
      unchanged
    });
    if (!unchanged) fail(`Approved source changed during derivative execution: ${mediaId}`, "SOURCE_INTEGRITY");
    if (snapshotTree(publicMediaRoot).fingerprint !== publicBefore.fingerprint) fail("public/media changed during derivative execution.", "SOURCE_INTEGRITY");
    console.log(`[derivative] ${mediaId}: ${operationResults.filter((item) => item.mediaId === mediaId && item.status !== "failed").length}/4 operations ready`);
  }

  for (const entry of fs.readdirSync(temporaryRoot, { withFileTypes: true })) {
    if (entry.isFile()) fs.rmSync(path.join(temporaryRoot, entry.name), { force: true });
  }
  const successful = operationResults.filter((operation) => ["generated", "skipped_valid"].includes(operation.status));
  const failed = operationResults.filter((operation) => operation.status === "failed");
  const totalsByProfile = Object.fromEntries(Object.keys(PROFILE_DEFINITIONS).map((profile) => [profile, successful.filter((operation) => operation.profile === profile).reduce((sum, operation) => sum + operation.outputBytes, 0)]));
  const totalGeneratedBytes = successful.reduce((sum, operation) => sum + operation.outputBytes, 0);
  const result = {
    artifactType: "teoyubeworld_derivative_execution_result",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.1",
    lifecycleState: "derivatives_generated",
    derivativePlanFileChecksumSha256: bound.frozen.derivativePlanFileChecksumSha256,
    authorizationArtifactChecksumSha256: bound.authorization.artifactChecksumSha256,
    executionStartedAt,
    executionEndedAt: new Date().toISOString(),
    ffmpegVersion: tools.ffmpegVersion,
    approvedRecordCount: bound.approval.approvedRecordIds.length,
    operationCount: EXPECTED_OPERATION_COUNT,
    commandsExecuted,
    successfulOperationCount: successful.length,
    failedOperationCount: failed.length,
    skippedValidOperationCount: skippedValidOperations,
    generatedCardCount: successful.filter((operation) => operation.profile === "card-preview-mp4").length,
    generatedMobileCount: successful.filter((operation) => operation.profile === "mobile-preview-mp4").length,
    generatedPosterCount: successful.filter((operation) => operation.profile === "poster-webp").length,
    generatedThumbnailCount: successful.filter((operation) => operation.profile === "thumbnail-webp").length,
    generatedBytesByProfile: totalsByProfile,
    totalGeneratedBytes,
    projectedBytes: bound.plan.projectedGeneratedBytes,
    sizeVarianceBytes: totalGeneratedBytes - bound.plan.projectedGeneratedBytes,
    sourceIntegrityPassed: recordIntegrity.every((record) => record.unchanged),
    publicMediaUnchanged: snapshotTree(publicMediaRoot).fingerprint === publicBefore.fingerprint,
    sourceFilesModified: 0,
    sourceFilesRenamed: 0,
    sourceFilesMoved: 0,
    sourceFilesDeleted: 0,
    sourceMastersCopied: 0,
    publicFilesWritten: 0,
    externalUploads: 0,
    mediaFilesTranscoded: successful.filter((operation) => PROFILE_DEFINITIONS[operation.profile].kind === "video").length,
    imageDerivativesGenerated: successful.filter((operation) => PROFILE_DEFINITIONS[operation.profile].kind !== "video").length,
    operationResults,
    recordIntegrity,
    errors,
    warnings
  };
  result.artifactChecksumSha256 = fingerprint(result);
  writeJsonAtomic(executionResultPath, result);
  writeJsonAtomic(lifecyclePaths.derivatives, result);
  console.log(JSON.stringify({
    lifecycleState: result.lifecycleState,
    successfulOperations: result.successfulOperationCount,
    failedOperations: result.failedOperationCount,
    skippedValidOperations: result.skippedValidOperationCount,
    totalGeneratedBytes: result.totalGeneratedBytes,
    sourceIntegrityPassed: result.sourceIntegrityPassed,
    publicFilesWritten: result.publicFilesWritten
  }, null, 2));
  if (failed.length) process.exitCode = 1;
  return result;
}

if (require.main === module) execute().catch((error) => {
  console.error(JSON.stringify({ status: "blocked", code: error.code || "EXECUTION_FAILED", error: error.message }, null, 2));
  process.exitCode = 1;
});

module.exports = { execute, validateBoundArtifacts, commandLogPath };
