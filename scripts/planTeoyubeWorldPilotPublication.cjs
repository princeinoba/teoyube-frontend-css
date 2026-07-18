const fs = require("fs");
const path = require("path");
const {
  projectRoot,
  publicMediaRoot,
  pilotRoot,
  preExecutionSnapshotPath,
  executionResultPath,
  derivativeValidationPath,
  runtimeManifestPreviewPath,
  publicationPlanPath,
  EXPECTED_CANONICAL_REVISION,
  EXPECTED_RECORD_COUNT,
  EXPECTED_OPERATION_COUNT,
  PROFILE_DEFINITIONS,
  readJson,
  writeJsonAtomic,
  sha256File,
  resolveProjectPath,
  assertNoAbsoluteWindowsPath,
  snapshotTree
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const { lifecyclePaths, fingerprint } = require("./lib/teoyubeWorldPilotLifecycle.cjs");

const docsRoot = path.join(projectRoot, "docs", "teoyube");
const reportPath = path.join(docsRoot, "phase-11-6c2b1-publication-plan-report.md");
const futurePublicRoot = path.join(publicMediaRoot, "teoyubeworld", "pilot-v1");

function futurePath(mediaId, fileName) {
  return `public/media/teoyubeworld/pilot-v1/${mediaId}/${fileName}`;
}

function futureUrl(mediaId, fileName) {
  return `/media/teoyubeworld/pilot-v1/${mediaId}/${fileName}`;
}

function writeMarkdown(plan) {
  fs.mkdirSync(docsRoot, { recursive: true });
  fs.writeFileSync(reportPath, [
    "# Phase 11.6C.2B.1 Publication Dry-Run Plan",
    "",
    `- Lifecycle state: ${plan.lifecycleState}`,
    `- Planned derivative files: ${plan.derivativeFileCount}`,
    `- Planned manifest files: ${plan.manifestFileCount}`,
    `- Total planned files: ${plan.totalFileCount}`,
    `- Planned bytes: ${plan.totalByteSize}`,
    `- Stale pilot files identified: ${plan.stalePilotFiles.length}`,
    `- Publication plan checksum: ${plan.planChecksumSha256}`,
    "- Source masters copied: 0",
    "- Unapproved files copied: 0",
    "- Public writes executed: 0",
    "- Publication authorization: false",
    "",
    "This report is a path and byte-accounting preview only. No file was copied, removed, published, or exposed by this plan."
  ].join("\n") + "\n", "utf8");
}

function planPublication() {
  const required = [executionResultPath, derivativeValidationPath, runtimeManifestPreviewPath, preExecutionSnapshotPath];
  for (const filePath of required) if (!fs.existsSync(filePath)) throw new Error(`Publication planning input is missing: ${path.relative(projectRoot, filePath)}`);
  if (fs.existsSync(lifecyclePaths.publicationAuthorization)) throw new Error("Publication authorization must remain absent while creating the dry-run plan.");

  const execution = readJson(executionResultPath);
  const validation = readJson(derivativeValidationPath);
  const runtimeManifest = readJson(runtimeManifestPreviewPath);
  const preExecution = readJson(preExecutionSnapshotPath);
  if (!validation.valid || validation.validatedOperationCount !== EXPECTED_OPERATION_COUNT) throw new Error("All 48 derivatives must validate before publication planning.");
  if (runtimeManifest.recordCount !== EXPECTED_RECORD_COUNT) throw new Error("The runtime manifest preview must contain exactly 12 approved records.");
  if (snapshotTree(publicMediaRoot).fingerprint !== preExecution.publicMediaSnapshot.fingerprint) throw new Error("public/media changed before publication planning.");

  const items = execution.operationResults.map((operation) => {
    const profile = PROFILE_DEFINITIONS[operation.profile];
    const sourcePath = resolveProjectPath(operation.outputPath);
    if (!fs.existsSync(sourcePath) || sha256File(sourcePath) !== operation.outputChecksumSha256) throw new Error(`Validated derivative changed before publication planning: ${operation.operationId}`);
    return {
      itemType: "validated_derivative",
      operationId: operation.operationId,
      mediaId: operation.mediaId,
      variant: profile.variant,
      generatedPath: operation.outputPath,
      proposedPublicPath: futurePath(operation.mediaId, profile.suffix),
      proposedPublicUrl: futureUrl(operation.mediaId, profile.suffix),
      byteSize: operation.outputBytes,
      checksumSha256: operation.outputChecksumSha256,
      copyAuthorized: false,
      publicWriteExecuted: false
    };
  });
  const manifestBytes = fs.statSync(runtimeManifestPreviewPath).size;
  const manifestChecksum = sha256File(runtimeManifestPreviewPath);
  items.push({
    itemType: "sanitized_runtime_manifest",
    operationId: null,
    mediaId: null,
    variant: "runtime-manifest",
    generatedPath: "generated/teoyubeworld-media/pilot-v1/manifests/runtime-manifest.preview.json",
    proposedPublicPath: "public/media/teoyubeworld/pilot-v1/runtime-manifest.json",
    proposedPublicUrl: "/media/teoyubeworld/pilot-v1/runtime-manifest.json",
    byteSize: manifestBytes,
    checksumSha256: manifestChecksum,
    copyAuthorized: false,
    publicWriteExecuted: false
  });

  const plannedPublicPaths = new Set(items.map((item) => item.proposedPublicPath.replace(/^public\/media\//, "")));
  const existingFutureTree = snapshotTree(futurePublicRoot);
  const stalePilotFiles = existingFutureTree.files
    .map((file) => `teoyubeworld/pilot-v1/${file.path}`)
    .filter((file) => !plannedPublicPaths.has(file));
  const plan = {
    artifactType: "teoyubeworld_pilot_publication_dry_run_plan",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.1",
    generatedAt: new Date().toISOString(),
    lifecycleState: "publication_plan_ready",
    mode: "dry-run",
    status: "planned",
    canonicalPilotRevision: EXPECTED_CANONICAL_REVISION,
    derivativeValidationChecksumSha256: validation.artifactChecksumSha256,
    runtimeManifestPreviewChecksumSha256: runtimeManifest.manifestChecksumSha256,
    derivativeFileCount: EXPECTED_OPERATION_COUNT,
    manifestFileCount: 1,
    totalFileCount: items.length,
    totalByteSize: items.reduce((sum, item) => sum + item.byteSize, 0),
    profileCounts: {
      card: items.filter((item) => item.variant === "card").length,
      mobile: items.filter((item) => item.variant === "mobile").length,
      poster: items.filter((item) => item.variant === "poster").length,
      thumbnail: items.filter((item) => item.variant === "thumbnail").length
    },
    proposedPublicRoot: "public/media/teoyubeworld/pilot-v1/",
    proposedPublicUrlPrefix: "/media/teoyubeworld/pilot-v1/",
    items,
    stalePilotFiles,
    excluded: ["protected source masters", "unapproved records", "long-form records", "rejected duplicates", "owner private notes", "execution logs"],
    sourceMastersCopied: 0,
    unapprovedFilesCopied: 0,
    publicWritesExecuted: 0,
    runtimeManifestUpdated: false,
    publicationAuthorized: false,
    warning: "Planning only. Publication requires the exact separate owner publication authorization."
  };
  assertNoAbsoluteWindowsPath(plan, "Publication plan");
  plan.planChecksumSha256 = fingerprint(plan);
  writeJsonAtomic(publicationPlanPath, plan);
  writeJsonAtomic(lifecyclePaths.publicationPlan, plan);
  writeMarkdown(plan);
  console.log(JSON.stringify({
    lifecycleState: plan.lifecycleState,
    totalFileCount: plan.totalFileCount,
    totalByteSize: plan.totalByteSize,
    stalePilotFiles: plan.stalePilotFiles.length,
    publicWritesExecuted: plan.publicWritesExecuted,
    publicationAuthorized: plan.publicationAuthorized,
    planChecksumSha256: plan.planChecksumSha256
  }, null, 2));
  return plan;
}

if (require.main === module) {
  try { planPublication(); } catch (error) { console.error(error.stack || error.message); process.exitCode = 1; }
}

module.exports = { planPublication, reportPath };
