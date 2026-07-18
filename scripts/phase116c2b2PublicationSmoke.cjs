const fs = require("fs");
const path = require("path");
const http = require("http");
const vm = require("vm");
const { server } = require("../server.js");
const {
  projectRoot,
  sourceRoot,
  publicationPlanPath,
  readJson,
  sha256File,
  artifactChecksum,
  sourcePathForRecord
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const {
  EXACT_PUBLICATION_AUTHORIZATION,
  EXPECTED_PUBLICATION_PLAN_CHECKSUM,
  EXPECTED_TOTAL_PUBLICATION_FILES,
  EXPECTED_TOTAL_PUBLICATION_BYTES,
  publicationAuthorizationPath,
  publicationResultPath,
  publicationReceiptPath,
  publicationValidationPath,
  publishedRuntimeManifestPath,
  validatePublishedTree,
  validatePublicationAuthorization,
  verifyPublicationBaseline
} = require("./lib/teoyubeWorldPilotPublication.cjs");
const { getCanonicalGateSnapshot } = require("./validateTeoyubeWorldOwnerGate.cjs");
const { loadReviewWorkspace, applyPatches } = require("./lib/teoyubeWorldReviewPatches.cjs");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function parses(relativePath) {
  try { new vm.Script(read(relativePath), { filename: relativePath }); return true; } catch { return false; }
}

function request(port, method, pathname, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, method, path: pathname, headers }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.end();
  });
}

async function run() {
  const checks = [];
  const check = (id, passed, detail) => {
    checks.push({ id, passed: Boolean(passed), detail });
    if (!passed) throw new Error(`${id}: ${detail}`);
  };

  for (const file of [
    "server.js",
    "media-review-derivatives.js",
    "scripts/lib/teoyubeWorldPilotPublication.cjs",
    "scripts/authorizeTeoyubeWorldPilotPublication.cjs",
    "scripts/publishTeoyubeWorldApprovedPilot.cjs",
    "scripts/validateTeoyubeWorldPilotPublication.cjs",
    "scripts/phase116c2b2PublicationSmoke.cjs"
  ]) check(`parses_${file.replace(/[^a-z0-9]+/gi, "_")}`, parses(file), `${file} parses.`);

  const required = [publicationPlanPath, publicationAuthorizationPath, publicationResultPath, publicationReceiptPath, publicationValidationPath, publishedRuntimeManifestPath, lifecyclePaths.publicationAuthorization, lifecyclePaths.publicationReceipt];
  for (const file of required) check(`artifact_${path.basename(file)}`, fs.existsSync(file), `${path.relative(projectRoot, file)} exists.`);

  const baseline = await verifyPublicationBaseline({ allowedStates: ["published"] });
  check("publication_baseline", baseline.report.valid && baseline.context, "The current published pilot remains bound to a zero-blocker gate and unchanged sources.");
  const { approval, plan, gate } = baseline.context;
  const authorization = readJson(publicationAuthorizationPath);
  const result = readJson(publicationResultPath);
  const receipt = readJson(publicationReceiptPath);
  const validation = readJson(publicationValidationPath);
  const manifest = readJson(publishedRuntimeManifestPath);
  const artifacts = artifactSnapshot();

  check("explicit_authorization", authorization.ownerResponse === EXACT_PUBLICATION_AUTHORIZATION && authorization.ownerConfirmation.confirmed === true && validatePublicationAuthorization(authorization, baseline.context), "Publication authorization records the exact owner phrase and valid plan bindings.");
  check("publication_plan", plan.planChecksumSha256 === EXPECTED_PUBLICATION_PLAN_CHECKSUM && plan.totalFileCount === 49 && plan.derivativeFileCount === 48 && plan.manifestFileCount === 1 && plan.totalByteSize === EXPECTED_TOTAL_PUBLICATION_BYTES, "The frozen publication plan remains exactly 48 derivatives plus one manifest.");
  check("publication_result", result.status === "published" && result.lifecycleState === "published" && result.artifactChecksumSha256 === artifactChecksum(result) && result.ffmpegCommandsExecuted === 0 && result.derivativesRegenerated === 0, "Publication result is valid and records no FFmpeg or derivative regeneration.");
  check("publication_receipt", receipt.lifecycleState === "published" && receipt.artifactChecksumSha256 === artifactChecksum(receipt) && readJson(lifecyclePaths.publicationReceipt).artifactChecksumSha256 === receipt.artifactChecksumSha256, "The checksum-valid publication receipt is mirrored in the lifecycle.");
  check("publication_validation", validation.valid === true && validation.lifecycleState === "published" && validation.artifactChecksumSha256 === artifactChecksum(validation) && validation.errors.length === 0, "Post-publication validation is checksum-valid and error-free.");
  check("lifecycle_published", determineLifecycleState(gate, artifacts) === "published", "The lifecycle reaches published without skipping authorization or validation states.");

  const publicTree = validatePublishedTree(plan);
  check("public_tree_exact", publicTree.valid && publicTree.tree.fileCount === EXPECTED_TOTAL_PUBLICATION_FILES && publicTree.tree.totalBytes === EXPECTED_TOTAL_PUBLICATION_BYTES && publicTree.unexpectedFiles.length === 0 && publicTree.missingFiles.length === 0, "The public tree contains only the exact 49 checksum-bound plan items.");
  check("runtime_manifest", manifest.recordCount === 12 && manifest.records.length === 12 && new Set(manifest.records.map((item) => item.mediaId)).size === 12, "Published runtime manifest has exactly 12 unique approved records.");
  check("runtime_sequence", manifest.records.every((record, index) => record.sequenceId === approval.approvedSequenceIds[0] && record.sequenceOrder === index + 1), "Published runtime manifest preserves the owner-confirmed Scripture sequence.");
  check("runtime_metadata_safe", !/[A-Za-z]:[\\/]/.test(JSON.stringify(manifest)) && !/media-source|protected-source|temporary-output|ownerPrivate|ffmpegArguments/i.test(JSON.stringify(manifest)), "Published runtime metadata exposes no protected or absolute paths.");

  const { manifest: draft, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(draft, patches, sourceChecksum);
  const recordsById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  check("sources_unchanged", approval.approvedRecordIds.every((mediaId) => {
    const sourcePath = sourcePathForRecord(recordsById.get(mediaId));
    return sourcePath && sourcePath.startsWith(sourceRoot) && fs.existsSync(sourcePath) && sha256File(sourcePath) === approval.sourceChecksums[mediaId];
  }), "All 12 protected source files still match the approval checksums.");
  check("publication_accounting", result.sourceMastersCopied === 0 && result.sourceFilesModified === 0 && result.unapprovedFilesPublished === 0 && result.externalUploads === 0 && validation.sourceFilesModified === 0, "Publication copied no masters, changed no source, published no extra file, and uploaded nothing externally.");

  const html = read("media-review.html");
  const serverSource = read("server.js");
  const publicationSource = [read("scripts/authorizeTeoyubeWorldPilotPublication.cjs"), read("scripts/publishTeoyubeWorldApprovedPilot.cjs"), read("scripts/validateTeoyubeWorldPilotPublication.cjs")].join("\n");
  check("no_browser_publication_control", !/id=["'][^"']*publish[^"']*["']/i.test(html) && !/AUTHORIZE APPROVED PILOT PUBLICATION/.test(read("media-review-derivatives.js")), "No browser publication control or command bypass is exposed.");
  check("server_whitelist", serverSource.includes("validatedPublishedPilotFile") && serverSource.includes("publication_execution_not_exposed") && serverSource.includes("EXPECTED_PUBLICATION_PLAN_CHECKSUM"), "Server serves only receipt-and-plan-whitelisted public files and rejects browser publication commands.");
  check("no_external_services", !/cloudinary|s3\.amazonaws|youtube\.googleapis|presigned|multipart\/form-data|new\s+OpenAI|responses\.create|chat\/completions/i.test(publicationSource), "Publication tooling uses no external upload, media, or live AI service.");

  await new Promise((resolve, reject) => { server.listen(0, "127.0.0.1", resolve); server.once("error", reject); });
  const port = server.address().port;
  try {
    const runtime = await request(port, "GET", "/media/teoyubeworld/pilot-v1/runtime-manifest.json");
    check("runtime_route", runtime.status === 200 && String(runtime.headers["content-type"]).startsWith("application/json") && JSON.parse(runtime.body.toString("utf8")).recordCount === 12, "Published runtime manifest is served from the approved URL.");
    const firstRecord = manifest.records[0];
    const poster = await request(port, "HEAD", firstRecord.plannedPublicPosterUrl);
    check("poster_route", poster.status === 200 && poster.headers["content-type"] === "image/webp" && Number(poster.headers["content-length"]) > 0, "Approved poster URL is available with a safe MIME type.");
    const video = await request(port, "GET", firstRecord.plannedPublicCardUrl, { Range: "bytes=0-63" });
    check("video_range_route", video.status === 206 && video.headers["content-type"] === "video/mp4" && video.body.length === 64 && String(video.headers["content-range"]).startsWith("bytes 0-63/"), "Approved MP4 URL supports bounded byte-range playback.");
    const unknown = await request(port, "GET", "/media/teoyubeworld/pilot-v1/not-approved.mp4");
    check("unknown_public_file_blocked", unknown.status === 404, "Unplanned files under the public prefix are not served.");
    const sourceRequest = await request(port, "GET", "/media-source/teoyubeworld/originals/hidden.mp4");
    const generatedRequest = await request(port, "GET", "/generated/teoyubeworld-media/pilot-v1/manifests/runtime-manifest.preview.json");
    check("protected_roots_blocked", sourceRequest.status === 404 && generatedRequest.status === 404, "Protected source and generated roots remain unavailable over HTTP.");
    const directAuthorization = await request(port, "POST", "/__qa/teoyubeworld/publication-authorization?qa=1");
    const directPublication = await request(port, "POST", "/__qa/teoyubeworld/publication?qa=1");
    check("browser_commands_rejected", directAuthorization.status === 409 && directPublication.status === 409 && JSON.parse(directPublication.body.toString("utf8")).filesPublished === 49, "Browser authorization and publication commands remain rejected and perform no repeat publication.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  const report = {
    valid: checks.every((item) => item.passed),
    phase: "11.6C.2B.2",
    lifecycleState: "published",
    canonicalRevision: baseline.report.canonicalRevision,
    publicationPlanChecksumSha256: plan.planChecksumSha256,
    publicationAuthorizationChecksumSha256: authorization.artifactChecksumSha256,
    publicationReceiptChecksumSha256: receipt.artifactChecksumSha256,
    publicFilesValidated: publicTree.tree.fileCount,
    publicBytesValidated: publicTree.tree.totalBytes,
    runtimeManifestRecords: manifest.recordCount,
    sourceFilesModified: 0,
    sourceMastersCopied: 0,
    externalUploads: 0,
    checksPassed: checks.filter((item) => item.passed).length,
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
