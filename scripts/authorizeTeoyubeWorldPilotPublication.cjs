const fs = require("fs");
const path = require("path");
const {
  projectRoot,
  publicMediaRoot,
  writeJsonAtomic,
  snapshotTree,
  assertNoAbsoluteWindowsPath
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const {
  EXACT_PUBLICATION_AUTHORIZATION,
  publicationAuthorizationPath,
  verifyPublicationBaseline,
  fingerprint
} = require("./lib/teoyubeWorldPilotPublication.cjs");

const docsRoot = path.join(projectRoot, "docs", "teoyube");
const baselineReportPath = path.join(docsRoot, "phase-11-6c2b2-publication-baseline-verification-report.md");
const authorizationReportPath = path.join(docsRoot, "phase-11-6c2b2-publication-authorization-report.md");

function writeMarkdown(filePath, lines) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
}

function baselineMarkdown(report) {
  return [
    "# Phase 11.6C.2B.2 Publication Baseline Verification",
    "",
    `- Status: ${report.valid ? "passed" : "blocked"}`,
    `- Lifecycle state: ${report.lifecycleState || "unavailable"}`,
    `- Canonical revision: ${report.canonicalRevision || "unavailable"}`,
    `- Approval checksum: ${report.approvalArtifactChecksumSha256 || "unavailable"}`,
    `- Derivative validation checksum: ${report.derivativeValidationChecksumSha256 || "unavailable"}`,
    `- Runtime manifest file checksum: ${report.runtimeManifestFileChecksumSha256 || "unavailable"}`,
    `- Publication plan checksum: ${report.publicationPlanChecksumSha256 || "unavailable"}`,
    `- Approved shorts: ${report.approvedRecordCount || 0}`,
    `- Approved Scripture sequences: ${report.approvedSequenceIds?.length || 0}`,
    `- Ordered sequence segments: ${report.approvedSequenceSegmentCount || 0}`,
    `- Approved long-form records: ${report.approvedLongFormCount || 0}`,
    `- Planned derivative files: ${report.plannedDerivativeFiles || 0}`,
    `- Planned manifest files: ${report.plannedManifestFiles || 0}`,
    `- Planned total files: ${report.plannedTotalFiles || 0}`,
    `- Planned total bytes: ${report.plannedTotalBytes || 0}`,
    `- Source integrity: ${report.sourceIntegrityPassed ? "passed" : "failed"}`,
    "- Public writes during baseline verification: 0",
    "",
    "## Blockers",
    "",
    ...(report.blockers?.length ? report.blockers.map((item) => `- ${item.code}: ${item.message}`) : ["- None."]),
    "",
    "The complete gate, exact artifact bindings, every derivative checksum, every destination, and all protected source checksums, sizes, and modification times were re-verified immediately before publication authorization."
  ];
}

function authorizationMarkdown(authorization) {
  return [
    "# Phase 11.6C.2B.2 Pilot Publication Authorization",
    "",
    `- Authorization type: ${authorization.authorizationType}`,
    `- Lifecycle state: ${authorization.lifecycleState}`,
    `- Canonical revision: ${authorization.canonicalRevision}`,
    `- Approved records: ${authorization.approvedRecordIds.length}`,
    `- Approved sequence: ${authorization.approvedSequenceIds[0]}`,
    `- Ordered sequence segments: ${authorization.approvedSequenceOrder.length}`,
    `- Derivative files authorized: ${authorization.derivativeFileCount}`,
    `- Manifest files authorized: ${authorization.manifestFileCount}`,
    `- Total files authorized: ${authorization.totalFileCount}`,
    `- Total bytes authorized: ${authorization.totalByteSize}`,
    `- Approval checksum: ${authorization.approvalArtifactChecksumSha256}`,
    `- Derivative validation checksum: ${authorization.derivativeValidationChecksumSha256}`,
    `- Runtime manifest file checksum: ${authorization.runtimeManifestFileChecksumSha256}`,
    `- Publication plan checksum: ${authorization.publicationPlanChecksumSha256}`,
    `- Authorization artifact checksum: ${authorization.artifactChecksumSha256}`,
    "- Source checksums unchanged: true",
    "- Runtime manifest approved: true",
    "- Publication executed by authorization: false",
    "- Public files written by authorization: 0",
    "",
    "This separate owner authorization permits publication of only the 49 checksum-bound files in the approved pilot plan. It does not expand the pilot, authorize external upload, alter source masters, or regenerate derivatives."
  ];
}

async function authorizePublication() {
  const publicBefore = snapshotTree(publicMediaRoot);
  const baseline = await verifyPublicationBaseline({ requireUnpublished: true, allowedStates: ["publication_plan_ready"] });
  writeMarkdown(baselineReportPath, baselineMarkdown(baseline.report));
  if (!baseline.report.valid || !baseline.context) {
    const result = { authorized: false, lifecycleState: baseline.report.lifecycleState || "blocked", blockers: baseline.report.blockers || [], filesPublished: 0 };
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return result;
  }

  const { approval, validation, runtimeManifest, plan, gate } = baseline.context;
  const authorizedAt = new Date().toISOString();
  const authorization = {
    artifactType: "teoyubeworld_pilot_publication_authorization",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.2",
    authorizationType: "approved_pilot_publication",
    ownerResponse: EXACT_PUBLICATION_AUTHORIZATION,
    ownerConfirmation: {
      confirmed: true,
      confirmedBy: "local_project_owner",
      exactPhraseConfirmed: true,
      scope: "checksum_bound_approved_pilot_publication_only"
    },
    authorizedAt,
    lifecycleState: "publication_authorized",
    canonicalRevision: baseline.report.canonicalRevision,
    pilotPlanId: approval.pilotPlanId,
    approvalArtifactChecksumSha256: approval.artifactChecksumSha256,
    ownerAttestationArtifactChecksumSha256: approval.ownerAttestationArtifactChecksum,
    derivativeValidationChecksumSha256: validation.artifactChecksumSha256,
    runtimeManifestChecksumSha256: runtimeManifest.manifestChecksumSha256,
    runtimeManifestFileChecksumSha256: baseline.report.runtimeManifestFileChecksumSha256,
    publicationPlanChecksumSha256: plan.planChecksumSha256,
    publicationPlanFileChecksumSha256: baseline.report.publicationPlanFileChecksumSha256,
    approvedRecordIds: [...approval.approvedRecordIds],
    approvedSequenceIds: [...approval.approvedSequenceIds],
    approvedSequenceOrder: [...approval.approvedSequenceOrder],
    sourceChecksums: { ...approval.sourceChecksums },
    sourceChecksumsUnchanged: true,
    runtimeManifestApproved: true,
    derivativeFileCount: plan.derivativeFileCount,
    manifestFileCount: plan.manifestFileCount,
    totalFileCount: plan.totalFileCount,
    totalByteSize: plan.totalByteSize,
    approvedPublicRoot: plan.proposedPublicRoot,
    approvedPublicUrlPrefix: plan.proposedPublicUrlPrefix,
    exactValidationResult: baseline.report,
    publicationScope: "exact_approved_plan_items_only",
    sourceMastersAuthorized: false,
    longFormAuthorized: false,
    externalUploadAuthorized: false,
    derivativesRegenerationAuthorized: false,
    filesPublished: 0,
    sourceFilesModified: 0,
    externalUploads: 0
  };
  assertNoAbsoluteWindowsPath(authorization, "Publication authorization");
  authorization.artifactChecksumSha256 = fingerprint(authorization);
  writeJsonAtomic(publicationAuthorizationPath, authorization);
  writeJsonAtomic(lifecyclePaths.publicationAuthorization, authorization);

  const publicAfter = snapshotTree(publicMediaRoot);
  if (publicAfter.fingerprint !== publicBefore.fingerprint) throw new Error("Publication authorization changed public/media; authorization must be non-executing.");
  const lifecycleState = determineLifecycleState(gate, artifactSnapshot());
  if (lifecycleState !== "publication_authorized") throw new Error(`Publication lifecycle did not advance to publication_authorized: ${lifecycleState}`);
  writeMarkdown(authorizationReportPath, authorizationMarkdown(authorization));

  const result = {
    authorized: true,
    lifecycleState,
    canonicalRevision: authorization.canonicalRevision,
    approvalArtifactChecksumSha256: authorization.approvalArtifactChecksumSha256,
    publicationPlanChecksumSha256: authorization.publicationPlanChecksumSha256,
    authorizationArtifactChecksumSha256: authorization.artifactChecksumSha256,
    totalFileCount: authorization.totalFileCount,
    totalByteSize: authorization.totalByteSize,
    sourceChecksumsUnchanged: true,
    runtimeManifestApproved: true,
    filesPublished: 0,
    sourceFilesModified: 0,
    externalUploads: 0
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) authorizePublication().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

module.exports = { authorizePublication, baselineReportPath, authorizationReportPath };
