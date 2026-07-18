const fs = require("fs");
const path = require("path");
const {
  projectRoot,
  frozenPlanPath,
  preExecutionSnapshotPath,
  executionAuthorizationPath,
  EXPECTED_APPROVAL_CHECKSUM,
  EXPECTED_CANONICAL_REVISION,
  EXPECTED_OPERATION_COUNT,
  EXACT_EXECUTION_AUTHORIZATION,
  writeJsonAtomic,
  fingerprint,
  safeOperationArguments,
  verifyExecutionBaseline
} = (() => {
  const execution = require("./lib/teoyubeWorldDerivativeExecution.cjs");
  const lifecycle = require("./lib/teoyubeWorldPilotLifecycle.cjs");
  return { ...execution, fingerprint: lifecycle.fingerprint };
})();
const { lifecyclePaths } = require("./lib/teoyubeWorldPilotLifecycle.cjs");

const docsRoot = path.join(projectRoot, "docs", "teoyube");
const baselineReportPath = path.join(docsRoot, "phase-11-6c2b1-execution-baseline-verification-report.md");
const authorizationReportPath = path.join(docsRoot, "phase-11-6c2b1-execution-authorization-report.md");

function writeMarkdown(filePath, lines) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
}

function baselineMarkdown(report) {
  return [
    "# Phase 11.6C.2B.1 Execution Baseline Verification",
    "",
    `- Status: ${report.valid ? "passed" : "blocked"}`,
    `- Canonical revision: ${report.canonicalRevision || "unavailable"}`,
    `- Approval checksum: ${report.approvalArtifactChecksumSha256 || "unavailable"}`,
    `- Owner attestation checksum: ${report.ownerAttestationArtifactChecksumSha256 || "unavailable"}`,
    `- Derivative plan file checksum: ${report.derivativePlanFileChecksumSha256 || "unavailable"}`,
    `- Approved short records: ${report.approvedRecordCount || 0}`,
    `- Approved Scripture sequences: ${report.approvedSequenceIds?.length || 0}`,
    `- Ordered sequence segments: ${report.approvedSequenceSegmentCount || 0}`,
    `- Approved long-form records: ${report.approvedLongFormCount || 0}`,
    `- Planned operations: ${report.operationCount || 0}`,
    `- Source integrity: ${report.sourceIntegrityPassed ? "passed" : "failed"}`,
    `- FFmpeg readiness: ${report.toolReadiness?.ready ? "passed" : "failed"}`,
    `- Public media files before execution: ${report.publicMediaSnapshot?.fileCount || 0}`,
    `- Existing pilot derivatives before execution: ${report.existingDerivativeSnapshot?.fileCount || 0}`,
    `- Execution authorization before this phase: ${report.executionAuthorizationPresent ? "present" : "absent"}`,
    `- Publication authorization: ${report.publicationAuthorizationPresent ? "present" : "absent"}`,
    "- Public writes: 0",
    "",
    "## Blockers",
    "",
    ...(report.blockers?.length ? report.blockers.map((blocker) => `- ${blocker.code}: ${blocker.message}`) : ["- None."]),
    "",
    "The approved record set, sequence order, source checksums, derivative profiles, operation count, and output destinations were verified without repairing or changing the approved pilot."
  ];
}

function authorizationMarkdown(authorization, frozen) {
  return [
    "# Phase 11.6C.2B.1 Derivative Execution Authorization",
    "",
    `- Authorization type: ${authorization.authorizationType}`,
    `- Canonical revision: ${authorization.canonicalRevision}`,
    `- Approved records: ${authorization.approvedRecordIds.length}`,
    `- Approved sequence: ${authorization.approvedSequenceId}`,
    `- Planned operations: ${authorization.operationCount}`,
    `- Approval checksum: ${authorization.approvalArtifactChecksumSha256}`,
    `- Frozen plan file checksum: ${authorization.derivativePlanFileChecksumSha256}`,
    `- Frozen execution snapshot checksum: ${authorization.frozenPlanChecksumSha256}`,
    `- Authorization artifact checksum: ${authorization.artifactChecksumSha256}`,
    `- FFmpeg: ${frozen.ffmpegVersion}`,
    `- FFprobe: ${frozen.ffprobeVersion}`,
    "- Scope: approved pilot derivatives only",
    "- Publication authorized: false",
    "- Public writes authorized: false",
    "",
    "This artifact authorizes execution of the unchanged 48-operation approved pilot derivative plan. It does not authorize publication or any write into public/media."
  ];
}

async function authorize() {
  const baseline = await verifyExecutionBaseline();
  const report = baseline.report;
  writeMarkdown(baselineReportPath, baselineMarkdown(report));
  if (!report.valid || !baseline.context) {
    console.log(JSON.stringify({ status: "blocked", blockers: report.blockers || [] }, null, 2));
    process.exitCode = 1;
    return { status: "blocked", report };
  }

  const { approval, attestation, plan, sourceSnapshots, tools } = baseline.context;
  const authorizationTimestamp = new Date().toISOString();
  const preExecutionSnapshot = {
    artifactType: "teoyubeworld_pilot_pre_execution_snapshot",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.1",
    capturedAt: authorizationTimestamp,
    canonicalRevision: EXPECTED_CANONICAL_REVISION,
    approvalArtifactChecksumSha256: EXPECTED_APPROVAL_CHECKSUM,
    derivativePlanFileChecksumSha256: report.derivativePlanFileChecksumSha256,
    sourceSnapshots,
    publicMediaSnapshot: report.publicMediaSnapshot,
    existingDerivativeSnapshot: report.existingDerivativeSnapshot,
    generatedPilotBytesBeforeExecution: report.generatedPilotBytesBeforeExecution
  };
  preExecutionSnapshot.artifactChecksumSha256 = fingerprint(preExecutionSnapshot);
  writeJsonAtomic(preExecutionSnapshotPath, preExecutionSnapshot);

  const frozenPlan = {
    artifactType: "teoyubeworld_frozen_derivative_execution_plan",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.1",
    frozenAt: authorizationTimestamp,
    canonicalRevision: EXPECTED_CANONICAL_REVISION,
    pilotPlanId: approval.pilotPlanId,
    approvalArtifactChecksumSha256: EXPECTED_APPROVAL_CHECKSUM,
    ownerAttestationArtifactId: attestation.artifactId,
    ownerAttestationArtifactChecksumSha256: approval.ownerAttestationArtifactChecksum,
    derivativePlanFileChecksumSha256: report.derivativePlanFileChecksumSha256,
    derivativePlanBoundChecksumSha256: plan.planChecksumSha256,
    approvedRecordIds: [...approval.approvedRecordIds],
    approvedSequenceId: approval.approvedSequenceIds[0],
    approvedSequenceOrder: [...approval.approvedSequenceOrder],
    sourceSnapshots,
    operations: plan.operations.map((operation) => ({
      operationId: operation.operationId,
      mediaId: operation.mediaId,
      profile: operation.profile,
      kind: operation.kind,
      sourceReference: `<protected-source:${operation.mediaId}>`,
      outputPath: operation.outputPath,
      plannedFfmpegArguments: safeOperationArguments(operation),
      projectedBytes: operation.projectedBytes
    })),
    operationCount: plan.operations.length,
    projectedOutputBytes: plan.projectedGeneratedBytes,
    ffmpegVersion: tools.ffmpegVersion,
    ffprobeVersion: tools.ffprobeVersion,
    preExecutionSnapshot: "generated/teoyubeworld-media/pilot-v1/execution/pre-execution-snapshot.json",
    publicationAuthorized: false,
    publicWriteAuthorized: false
  };
  frozenPlan.frozenPlanChecksumSha256 = fingerprint(frozenPlan);
  writeJsonAtomic(frozenPlanPath, frozenPlan);

  const authorization = {
    artifactType: "teoyubeworld_derivative_execution_authorization",
    schemaVersion: "1.0.0",
    authorizationType: "approved_pilot_derivative_execution",
    ownerResponse: EXACT_EXECUTION_AUTHORIZATION,
    authorizationTimestamp,
    lifecycleState: "derivative_execution_authorized",
    canonicalRevision: EXPECTED_CANONICAL_REVISION,
    pilotPlanId: approval.pilotPlanId,
    approvalArtifactChecksumSha256: EXPECTED_APPROVAL_CHECKSUM,
    ownerAttestationArtifactChecksumSha256: approval.ownerAttestationArtifactChecksum,
    derivativePlanFileChecksumSha256: report.derivativePlanFileChecksumSha256,
    frozenPlanChecksumSha256: frozenPlan.frozenPlanChecksumSha256,
    approvedRecordIds: [...approval.approvedRecordIds],
    approvedSequenceId: approval.approvedSequenceIds[0],
    sourceChecksums: { ...approval.sourceChecksums },
    operationCount: EXPECTED_OPERATION_COUNT,
    projectedOutputBytes: plan.projectedGeneratedBytes,
    ffmpegVersion: tools.ffmpegVersion,
    ffprobeVersion: tools.ffprobeVersion,
    authorizationScope: "approved_pilot_derivatives_only",
    publicationAuthorized: false,
    publicWriteAuthorized: false,
    commandsExecuted: 0,
    publicFilesWritten: 0
  };
  authorization.artifactChecksumSha256 = fingerprint(authorization);
  writeJsonAtomic(executionAuthorizationPath, authorization);
  writeJsonAtomic(lifecyclePaths.derivativeExecutionAuthorization, authorization);
  writeMarkdown(authorizationReportPath, authorizationMarkdown(authorization, frozenPlan));

  const result = {
    status: "authorized",
    lifecycleState: "derivative_execution_authorized",
    canonicalRevision: EXPECTED_CANONICAL_REVISION,
    approvalArtifactChecksumSha256: EXPECTED_APPROVAL_CHECKSUM,
    derivativePlanFileChecksumSha256: report.derivativePlanFileChecksumSha256,
    frozenPlanChecksumSha256: frozenPlan.frozenPlanChecksumSha256,
    authorizationArtifactChecksumSha256: authorization.artifactChecksumSha256,
    operationCount: authorization.operationCount,
    publicationAuthorized: false,
    publicWriteAuthorized: false
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) authorize().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

module.exports = { authorize, baselineReportPath, authorizationReportPath };
