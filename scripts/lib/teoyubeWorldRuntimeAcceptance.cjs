const fs = require("fs");
const path = require("path");
const {
  pilotRoot,
  publicationPlanPath,
  readJson,
  writeJsonAtomic,
  artifactChecksum,
  sha256File,
  assertNoAbsoluteWindowsPath
} = require("./teoyubeWorldDerivativeExecution.cjs");
const {
  EXPECTED_TOTAL_PUBLICATION_FILES,
  EXPECTED_TOTAL_PUBLICATION_BYTES,
  publicationValidationPath,
  publicationReceiptPath,
  publishedRuntimeManifestPath,
  validatePublishedTree,
  verifyPublicationBaseline
} = require("./teoyubeWorldPilotPublication.cjs");

const EXACT_RUNTIME_ACCEPTANCE = "ACCEPT PUBLISHED PILOT RUNTIME";
const EXPECTED_REVISION = "pilot-r120-583481b46fb0";
const runtimeAcceptanceRoot = path.join(pilotRoot, "owner-acceptance");
const runtimeIntegrationQaPath = path.join(runtimeAcceptanceRoot, "runtime-integration-qa.json");
const runtimeBrowserQaPath = path.join(runtimeAcceptanceRoot, "runtime-browser-qa.json");
const runtimeAcceptancePath = path.join(runtimeAcceptanceRoot, "runtime-acceptance.json");
const SURFACES = ["today", "canon", "search", "table", "calling", "book", "lexicon", "testimony", "guide", "graph", "media"];

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? readJson(filePath) : null;
}

function validArtifact(artifact) {
  return Boolean(artifact && artifact.artifactChecksumSha256 === artifactChecksum(artifact));
}

function safeMatrix(integration) {
  return Object.fromEntries(SURFACES.map((surface) => {
    const row = integration?.surfaceMatrix?.[surface] || {};
    return [surface, {
      integrated: row.integrated === true,
      contextualMatching: row.contextualMatching === true,
      playback: row.playback === true,
      saveAction: row.saveAction === true,
      whyThisMedia: row.whyThisMedia === true,
      mobile: row.mobile === true,
      accessibility: row.accessibility === true,
      errors: Array.isArray(row.errors) ? row.errors.map((item) => String(item).slice(0, 180)) : []
    }];
  }));
}

async function getRuntimeAcceptanceGate() {
  const blockers = [];
  const warnings = [];
  const baseline = await verifyPublicationBaseline({ allowedStates: ["published"] });
  if (!baseline.report.valid) blockers.push(...baseline.report.blockers.map((item) => ({ code: `publication_${item.code}`, message: item.message })));
  const publicationValidation = readIfExists(publicationValidationPath);
  const publicationReceipt = readIfExists(publicationReceiptPath);
  const publicationPlan = readIfExists(publicationPlanPath);
  const integration = readIfExists(runtimeIntegrationQaPath);
  const browser = readIfExists(runtimeBrowserQaPath);
  const acceptance = readIfExists(runtimeAcceptancePath);
  const publicTree = publicationPlan ? validatePublishedTree(publicationPlan) : { valid: false, tree: { fileCount: 0, totalBytes: 0, fingerprint: null } };
  if (!publicationValidation?.valid || !validArtifact(publicationValidation)) blockers.push({ code: "publication_validation", message: "The checksum-valid publication validation artifact is required." });
  if (!publicationReceipt || !validArtifact(publicationReceipt) || publicationReceipt.lifecycleState !== "published") blockers.push({ code: "publication_receipt", message: "The checksum-valid published receipt is required." });
  if (!publicTree.valid || publicTree.tree.fileCount !== EXPECTED_TOTAL_PUBLICATION_FILES || publicTree.tree.totalBytes !== EXPECTED_TOTAL_PUBLICATION_BYTES) blockers.push({ code: "published_asset_integrity", message: "All 49 published files must match the approved checksums and bytes." });
  if (!integration?.valid || !validArtifact(integration)) blockers.push({ code: "runtime_integration_qa", message: "The Phase 11.6C.3 runtime integration smoke artifact must pass." });
  if (!browser?.valid || !validArtifact(browser)) blockers.push({ code: "runtime_browser_qa", message: "Desktop and required mobile runtime browser QA must pass." });
  const matrix = safeMatrix(integration);
  for (const [surface, row] of Object.entries(matrix)) {
    if (!row.integrated || !row.contextualMatching || !row.playback || !row.saveAction || !row.whyThisMedia || !row.mobile || !row.accessibility || row.errors.length) {
      blockers.push({ code: `surface_${surface}`, message: `${surface} has an incomplete runtime integration or QA result.` });
    }
  }
  if (integration?.accessibility?.blockingIssues > 0) blockers.push({ code: "accessibility", message: "Blocking accessibility issues remain." });
  if (integration?.playback?.blockingIssues > 0 || integration?.rangeSupported !== true) blockers.push({ code: "playback", message: "Playback or byte-range validation is incomplete." });
  if (integration?.sourceBoundary?.protectedPathExposureCount > 0 || integration?.sourceBoundary?.sourceMasterUrlResolvedCount > 0) blockers.push({ code: "source_boundary", message: "A protected path or source master URL was exposed." });
  if (integration?.unapprovedRecordCount > 0) blockers.push({ code: "unapproved_media", message: "Unapproved media appeared in the runtime." });
  if (browser?.consoleErrorCount > 0 || browser?.externalRequestCount > 0 || browser?.horizontalOverflowCount > 0) blockers.push({ code: "browser_quality", message: "Browser QA reported console errors, external requests, or horizontal overflow." });
  const accepted = Boolean(acceptance && validArtifact(acceptance) && acceptance.runtimeAcceptance === "owner_accepted" && acceptance.publishedRevision === EXPECTED_REVISION && acceptance.publicTreeFingerprint === publicTree.tree.fingerprint);
  if (acceptance && !accepted) warnings.push("A stale or invalid runtime acceptance artifact was ignored.");
  const status = accepted ? "owner_accepted" : blockers.length ? "blocked" : "ready_for_owner_acceptance";
  const result = {
    phase: "11.6C.3",
    lifecycle: "published",
    runtimeAcceptance: status,
    canonicalRevision: EXPECTED_REVISION,
    ready: blockers.length === 0,
    accepted,
    blockerCount: blockers.length,
    blockers,
    warnings,
    runtimeManifest: {
      valid: Boolean(publicationValidation?.valid),
      checksumSha256: fs.existsSync(publishedRuntimeManifestPath) ? sha256File(publishedRuntimeManifestPath) : null,
      recordCount: Number(publicationValidation?.runtimeManifestRecords || 0),
      sequenceCount: Number(publicationValidation?.approvedSequenceCount || 0),
      sequenceSegmentCount: Number(publicationValidation?.approvedSequenceSegmentCount || 0)
    },
    publishedAssets: {
      valid: publicTree.valid,
      fileCount: publicTree.tree.fileCount,
      byteSize: publicTree.tree.totalBytes,
      fingerprint: publicTree.tree.fingerprint
    },
    surfaceMatrix: matrix,
    accessibility: integration?.accessibility || { valid: false, blockingIssues: 1 },
    performance: integration?.performance || { valid: false },
    playback: integration?.playback || { valid: false, blockingIssues: 1 },
    browserQa: browser ? {
      valid: browser.valid === true,
      viewportCount: browser.viewportCount,
      checksPassed: browser.checksPassed,
      consoleErrorCount: browser.consoleErrorCount,
      externalRequestCount: browser.externalRequestCount,
      horizontalOverflowCount: browser.horizontalOverflowCount
    } : { valid: false, viewportCount: 0, checksPassed: 0, consoleErrorCount: 0, externalRequestCount: 0, horizontalOverflowCount: 0 },
    acceptanceControlVisible: blockers.length === 0 && !accepted,
    acceptedAt: accepted ? acceptance.acceptedAt : null,
    acceptanceArtifactChecksumSha256: accepted ? acceptance.artifactChecksumSha256 : null
  };
  assertNoAbsoluteWindowsPath(result, "Runtime acceptance gate");
  return { result, context: { baseline, publicationValidation, publicationReceipt, integration, browser, publicTree } };
}

async function acceptPublishedPilotRuntime(ownerConfirmation) {
  const gate = await getRuntimeAcceptanceGate();
  if (!gate.result.ready) return { accepted: false, statusCode: 409, ...gate.result };
  if (ownerConfirmation !== EXACT_RUNTIME_ACCEPTANCE) {
    return {
      accepted: false,
      statusCode: 400,
      runtimeAcceptance: gate.result.runtimeAcceptance,
      blockers: [{ code: "exact_owner_confirmation_required", message: `Owner confirmation must exactly match: ${EXACT_RUNTIME_ACCEPTANCE}` }]
    };
  }
  const { publicationValidation, integration, browser, publicTree } = gate.context;
  const artifact = {
    artifactType: "teoyubeworld_published_runtime_owner_acceptance",
    schemaVersion: "1.0.0",
    phase: "11.6C.3",
    runtimeAcceptance: "owner_accepted",
    acceptedAt: new Date().toISOString(),
    publishedRevision: EXPECTED_REVISION,
    runtimeManifestChecksumSha256: gate.result.runtimeManifest.checksumSha256,
    publicTreeFingerprint: publicTree.tree.fingerprint,
    publishedFileCount: publicTree.tree.fileCount,
    publishedByteSize: publicTree.tree.totalBytes,
    publicationValidationChecksumSha256: publicationValidation.artifactChecksumSha256,
    runtimeIntegrationQaChecksumSha256: integration.artifactChecksumSha256,
    runtimeBrowserQaChecksumSha256: browser.artifactChecksumSha256,
    surfaceIntegrationResults: gate.result.surfaceMatrix,
    accessibilityResults: gate.result.accessibility,
    browserQaResult: gate.result.browserQa,
    ownerConfirmation: {
      response: EXACT_RUNTIME_ACCEPTANCE,
      confirmed: true,
      scope: "published_runtime_behavior_only"
    },
    mediaFilesCreated: 0,
    mediaFilesModified: 0,
    additionalRecordsPublished: 0,
    externalUploads: 0
  };
  artifact.artifactChecksumSha256 = artifactChecksum(artifact);
  assertNoAbsoluteWindowsPath(artifact, "Runtime acceptance artifact");
  writeJsonAtomic(runtimeAcceptancePath, artifact);
  return { accepted: true, statusCode: 201, runtimeAcceptance: "owner_accepted", artifactChecksumSha256: artifact.artifactChecksumSha256, acceptedAt: artifact.acceptedAt };
}

module.exports = {
  EXACT_RUNTIME_ACCEPTANCE,
  EXPECTED_REVISION,
  SURFACES,
  runtimeAcceptanceRoot,
  runtimeIntegrationQaPath,
  runtimeBrowserQaPath,
  runtimeAcceptancePath,
  getRuntimeAcceptanceGate,
  acceptPublishedPilotRuntime
};
