const fs = require("fs");
const path = require("path");
const {
  projectRoot,
  publicMediaRoot,
  readJson,
  writeJsonAtomic,
  sha256File,
  artifactChecksum,
  snapshotTree,
  assertNoAbsoluteWindowsPath
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const {
  publicationStagingRoot,
  publicationAuthorizationPath,
  publicationResultPath,
  publicationReceiptPath,
  publishedPilotRoot,
  safePlanItemPaths,
  validatePublishedTree,
  verifyPublicationBaseline,
  validatePublicationAuthorization,
  fingerprint
} = require("./lib/teoyubeWorldPilotPublication.cjs");

const reportPath = path.join(projectRoot, "docs", "teoyube", "phase-11-6c2b2-publication-execution-report.md");

function writeMarkdown(result, receipt) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, [
    "# Phase 11.6C.2B.2 Approved Pilot Publication Execution",
    "",
    `- Status: ${result.status}`,
    `- Lifecycle state: ${receipt.lifecycleState}`,
    `- Publication authorization checksum: ${receipt.publicationAuthorizationChecksumSha256}`,
    `- Publication plan checksum: ${receipt.publicationPlanChecksumSha256}`,
    `- Published derivative files: ${receipt.derivativeFilesPublished}`,
    `- Published manifest files: ${receipt.manifestFilesPublished}`,
    `- Total published files: ${receipt.totalFilesPublished}`,
    `- Total published bytes: ${receipt.totalBytesPublished}`,
    `- Runtime manifest URL: ${receipt.runtimeManifestUrl}`,
    `- Receipt checksum: ${receipt.artifactChecksumSha256}`,
    "- Source masters copied: 0",
    "- Source files modified: 0",
    "- FFmpeg commands executed: 0",
    "- Derivatives regenerated: 0",
    "- External uploads: 0",
    "- Unapproved files published: 0",
    "",
    "Publication copied only the exact checksum-bound derivatives and runtime manifest named by the separately authorized 49-file plan. The protected originals and generated derivative masters remain unchanged."
  ].join("\n") + "\n", "utf8");
}

function copyPlanToStaging(plan, stagingPayloadRoot) {
  const staged = [];
  for (const item of plan.items) {
    const paths = safePlanItemPaths(item);
    if (!paths.safe) throw new Error(`Unsafe publication-plan path: ${item.proposedPublicUrl}`);
    const relative = path.relative(publishedPilotRoot, paths.publicPath);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Publication destination escapes the pilot root: ${item.proposedPublicUrl}`);
    const stagingPath = path.join(stagingPayloadRoot, relative);
    fs.mkdirSync(path.dirname(stagingPath), { recursive: true });
    fs.copyFileSync(paths.generatedPath, stagingPath, fs.constants.COPYFILE_EXCL);
    const stat = fs.statSync(stagingPath);
    const checksum = sha256File(stagingPath);
    if (stat.size !== item.byteSize || checksum !== item.checksumSha256) throw new Error(`Staged publication file failed checksum verification: ${item.proposedPublicUrl}`);
    staged.push({ proposedPublicUrl: item.proposedPublicUrl, relativePath: relative.replace(/\\/g, "/"), byteSize: stat.size, checksumSha256: checksum });
  }
  return staged;
}

async function publishApprovedPilot() {
  const baseline = await verifyPublicationBaseline({ allowedStates: ["publication_authorized"] });
  if (!baseline.report.valid || !baseline.context) {
    const result = { status: "blocked", lifecycleState: baseline.report.lifecycleState || "blocked", blockers: baseline.report.blockers || [], filesPublished: 0 };
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return result;
  }
  if (!fs.existsSync(publicationAuthorizationPath)) throw new Error("The separate publication authorization artifact is missing.");
  if (fs.existsSync(publicationReceiptPath) || fs.existsSync(lifecyclePaths.publicationReceipt)) throw new Error("The approved pilot already has a publication receipt.");

  const authorization = readJson(publicationAuthorizationPath);
  if (!validatePublicationAuthorization(authorization, baseline.context)) throw new Error("Publication authorization is invalid or no longer bound to the exact approved plan.");
  const lifecycleAuthorization = readJson(lifecyclePaths.publicationAuthorization);
  if (lifecycleAuthorization.artifactChecksumSha256 !== authorization.artifactChecksumSha256 || artifactChecksum(lifecycleAuthorization) !== authorization.artifactChecksumSha256) {
    throw new Error("Lifecycle publication authorization does not match the owner authorization artifact.");
  }

  const { plan, preExecution, gate } = baseline.context;
  const publicBefore = snapshotTree(publicMediaRoot);
  const existingPublished = fs.existsSync(publishedPilotRoot) ? validatePublishedTree(plan) : null;
  if (existingPublished && !existingPublished.valid) throw new Error("A non-matching pilot publication already exists; no overwrite or repair was attempted.");
  if (!existingPublished && publicBefore.fingerprint !== preExecution.publicMediaSnapshot.fingerprint) {
    throw new Error("public/media changed after publication planning; publication was blocked.");
  }

  let staged = [];
  let publicationMode = "verified_existing_exact_plan";
  if (!existingPublished) {
    const stagingAuthorizationRoot = path.join(publicationStagingRoot, authorization.artifactChecksumSha256);
    const stagingPayloadRoot = path.join(stagingAuthorizationRoot, "pilot-v1");
    if (fs.existsSync(stagingAuthorizationRoot)) throw new Error("Publication staging already exists; no ambiguous staging data was removed.");
    fs.mkdirSync(stagingPayloadRoot, { recursive: true });
    staged = copyPlanToStaging(plan, stagingPayloadRoot);

    const secondBaseline = await verifyPublicationBaseline({ allowedStates: ["publication_authorized"] });
    if (!secondBaseline.report.valid) throw new Error(`Publication gate changed during staging: ${secondBaseline.report.blockers.map((item) => item.code).join(", ")}`);
    if (snapshotTree(publicMediaRoot).fingerprint !== preExecution.publicMediaSnapshot.fingerprint) throw new Error("public/media changed during staging.");
    if (fs.existsSync(publishedPilotRoot)) throw new Error("The public pilot destination appeared during staging.");

    fs.mkdirSync(path.dirname(publishedPilotRoot), { recursive: true });
    fs.renameSync(stagingPayloadRoot, publishedPilotRoot);
    publicationMode = "atomic_staging_promotion";
    if (fs.existsSync(stagingAuthorizationRoot) && fs.readdirSync(stagingAuthorizationRoot).length === 0) fs.rmdirSync(stagingAuthorizationRoot);
  }

  const publicValidation = validatePublishedTree(plan);
  if (!publicValidation.valid) {
    throw new Error(`Published pilot validation failed: ${[...publicValidation.failures.map((item) => item.code), ...publicValidation.unexpectedFiles, ...publicValidation.missingFiles].join(", ")}`);
  }

  const publishedAt = new Date().toISOString();
  const result = {
    artifactType: "teoyubeworld_pilot_publication_result",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.2",
    status: "published",
    lifecycleState: "published",
    publishedAt,
    publicationMode,
    canonicalRevision: authorization.canonicalRevision,
    publicationAuthorizationChecksumSha256: authorization.artifactChecksumSha256,
    publicationPlanChecksumSha256: authorization.publicationPlanChecksumSha256,
    sourceChecksumsUnchanged: true,
    runtimeManifestApproved: true,
    stagedFilesVerified: staged.length || plan.totalFileCount,
    derivativeFilesPublished: plan.derivativeFileCount,
    manifestFilesPublished: plan.manifestFileCount,
    totalFilesPublished: publicValidation.tree.fileCount,
    totalBytesPublished: publicValidation.tree.totalBytes,
    publicRoot: plan.proposedPublicRoot,
    publicUrlPrefix: plan.proposedPublicUrlPrefix,
    runtimeManifestUrl: "/media/teoyubeworld/pilot-v1/runtime-manifest.json",
    sourceMastersCopied: 0,
    sourceFilesModified: 0,
    ffmpegCommandsExecuted: 0,
    derivativesRegenerated: 0,
    unapprovedFilesPublished: 0,
    externalUploads: 0,
    publishedFiles: plan.items.map((item) => ({
      itemType: item.itemType,
      operationId: item.operationId,
      mediaId: item.mediaId,
      variant: item.variant,
      publicUrl: item.proposedPublicUrl,
      byteSize: item.byteSize,
      checksumSha256: item.checksumSha256
    }))
  };
  assertNoAbsoluteWindowsPath(result, "Publication result");
  result.artifactChecksumSha256 = fingerprint(result);
  writeJsonAtomic(publicationResultPath, result);

  const receipt = {
    artifactType: "teoyubeworld_pilot_publication_receipt",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.2",
    lifecycleState: "published",
    publishedAt,
    canonicalRevision: authorization.canonicalRevision,
    pilotPlanId: authorization.pilotPlanId,
    approvalArtifactChecksumSha256: authorization.approvalArtifactChecksumSha256,
    publicationAuthorizationChecksumSha256: authorization.artifactChecksumSha256,
    publicationPlanChecksumSha256: authorization.publicationPlanChecksumSha256,
    derivativeValidationChecksumSha256: authorization.derivativeValidationChecksumSha256,
    runtimeManifestFileChecksumSha256: authorization.runtimeManifestFileChecksumSha256,
    approvedRecordIds: [...authorization.approvedRecordIds],
    approvedSequenceIds: [...authorization.approvedSequenceIds],
    approvedSequenceOrder: [...authorization.approvedSequenceOrder],
    derivativeFilesPublished: result.derivativeFilesPublished,
    manifestFilesPublished: result.manifestFilesPublished,
    totalFilesPublished: result.totalFilesPublished,
    totalBytesPublished: result.totalBytesPublished,
    runtimeManifestUrl: result.runtimeManifestUrl,
    publishedTreeFingerprint: publicValidation.tree.fingerprint,
    publicationResultChecksumSha256: result.artifactChecksumSha256,
    sourceChecksumsUnchanged: true,
    sourceFilesModified: 0,
    sourceMastersCopied: 0,
    unapprovedFilesPublished: 0,
    externalUploads: 0
  };
  assertNoAbsoluteWindowsPath(receipt, "Publication receipt");
  receipt.artifactChecksumSha256 = fingerprint(receipt);
  writeJsonAtomic(publicationReceiptPath, receipt);
  writeJsonAtomic(lifecyclePaths.publicationReceipt, receipt);

  const lifecycleState = determineLifecycleState(gate, artifactSnapshot());
  if (lifecycleState !== "published") throw new Error(`Publication lifecycle did not advance to published: ${lifecycleState}`);
  writeMarkdown(result, receipt);

  const output = {
    status: "published",
    lifecycleState,
    canonicalRevision: receipt.canonicalRevision,
    publicationAuthorizationChecksumSha256: receipt.publicationAuthorizationChecksumSha256,
    publicationPlanChecksumSha256: receipt.publicationPlanChecksumSha256,
    publicationReceiptChecksumSha256: receipt.artifactChecksumSha256,
    derivativeFilesPublished: receipt.derivativeFilesPublished,
    manifestFilesPublished: receipt.manifestFilesPublished,
    totalFilesPublished: receipt.totalFilesPublished,
    totalBytesPublished: receipt.totalBytesPublished,
    runtimeManifestUrl: receipt.runtimeManifestUrl,
    sourceFilesModified: 0,
    sourceMastersCopied: 0,
    externalUploads: 0
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}

if (require.main === module) publishApprovedPilot().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

module.exports = { publishApprovedPilot, copyPlanToStaging, reportPath };
