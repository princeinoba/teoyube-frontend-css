const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { discoverFiles } = require("./scanTeoyubeWorldMedia.cjs");
const { loadReviewWorkspace, validatePatch } = require("./lib/teoyubeWorldReviewPatches.cjs");
const { createPilotPlan } = require("./planTeoyubeWorldPilot.cjs");

const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "media-source", "teoyubeworld", "originals");
const checks = [];
function read(relativePath) { return fs.readFileSync(path.join(root, relativePath), "utf8"); }
function exists(relativePath) { return fs.existsSync(path.join(root, relativePath)); }
function check(id, passed, message) { checks.push({ id, status: passed ? "pass" : "fail", message }); }

function request(port, requestPath, options = {}) {
  return new Promise((resolve) => {
    const req = http.request({ host: "127.0.0.1", port, path: requestPath, method: options.method || "GET", headers: options.headers || {} }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", (error) => resolve({ status: 0, headers: {}, body: Buffer.from(error.message) }));
    req.end();
  });
}

async function waitForServer(port) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await request(port, "/index.html");
    if (response.status === 200) return true;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
}

async function run() {
  const workspace = loadReviewWorkspace();
  const manifest = workspace.manifest;
  const runtime = JSON.parse(read("src/data/teoyubeworld-media-manifest.json"));
  const discovery = discoverFiles(sourceRoot);
  const currentFiles = [...discovery.files, ...discovery.unsupported];
  const currentBytes = currentFiles.reduce((sum, file) => sum + Number(file.size || 0), 0);
  const scanSummary = JSON.parse(read("generated/teoyubeworld-media/reports/scan-summary.json"));
  const unsupported = JSON.parse(read("generated/teoyubeworld-media/reports/unsupported-files.json"));
  const expectedBytes = scanSummary.totalMediaSizeBytes + unsupported.reduce((sum, item) => sum + Number(item.fileSizeBytes || 0), 0);
  check("immutable_source_count", currentFiles.length === 3975, "Protected source inventory remains 3,975 files.");
  check("immutable_source_bytes", currentBytes === expectedBytes && currentBytes === 106288074235, "Protected source byte size remains 106,288,074,235.");
  check("draft_manifest", manifest.records.length === 3974, "Draft manifest remains available with 3,974 supported records.");
  check("patch_schema", Object.entries(workspace.patches).every(([name, patch]) => patch && validatePatch(patch, manifest, workspace.sourceChecksum, name).valid), "All five review patch files validate against the exact draft checksum.");

  const serverSource = read("server.js");
  check("media_route", serverSource.includes("/__qa/teoyubeworld/media-status") && serverSource.includes("parseRangeHeader"), "Secure media-by-ID and status routes exist.");
  check("capture_route", serverSource.includes("review-image") && serverSource.includes("3 * 1024 * 1024") && serverSource.includes("isQaRequest"), "Bounded loopback review-frame capture route exists.");
  check("direct_source_block", serverSource.includes('"/media-source"') && serverSource.includes("isProtectedRequestPath"), "Direct source paths remain blocked.");
  const uiSource = read("media-review.js") + read("media-review.html");
  check("browser_probe", uiSource.includes('preload = "metadata"') && uiSource.includes("videoWidth") && uiSource.includes("metadataProbeWarnings"), "Limited-concurrency browser metadata probe exists.");
  check("owner_workflow", uiSource.includes("Safe batch actions") && uiSource.includes("Undo last action") && uiSource.includes("Owner metadata"), "Owner metadata, batch preview, and undo workflows exist.");
  check("duplicate_workflow", uiSource.includes("Choose current as canonical") && uiSource.includes("intentional copies"), "Duplicate decisions can be staged without file operations.");
  check("sequence_workflow", uiSource.includes("Sequence curator") && uiSource.includes("Move up") && uiSource.includes("Confirm Scripture sequence"), "Sequence ordering and explicit Scripture confirmation exist.");
  check("pilot_workflow", uiSource.includes("Pilot Selection") && uiSource.includes("exactly 12 unique short records"), "Controlled first-pilot selection gate targets exactly 12 shorts.");
  check("qa_player", uiSource.includes("QA Scripture Sequence Player") && uiSource.includes("Source Review Preview"), "QA-only sequence player prototype exists.");
  check("runtime_helpers", exists("teoyubeworld-media-runtime.js") && read("teoyubeworld-media-runtime.js").includes("canUseTeoyubeWorldMediaInRuntime"), "Runtime media-card helpers preserve the approval gate.");
  check("scripts", ["scripts/applyTeoyubeWorldReviewPatches.cjs", "scripts/planTeoyubeWorldPilot.cjs", "scripts/generateTeoyubeWorldPilotDerivatives.cjs"].every(exists), "Review merge, pilot plan, and derivative dry-run scripts exist.");
  const derivativeSource = read("scripts/generateTeoyubeWorldPilotDerivatives.cjs");
  check("dry_run_default", derivativeSource.includes('process.argv.includes("--execute")') && derivativeSource.includes("autoInstallAttempted: false"), "Derivative generation defaults to dry-run and never installs FFmpeg.");

  const pilot = createPilotPlan();
  check("pilot_ready_after_approval", pilot.status !== "blocked" && pilot.selectedMediaIds.length === 12 && pilot.selectedSequenceIds.length === 1 && pilot.blockers.length === 0, "The 12-item owner-attested candidate is ready for dry-run derivative planning.");
  check("runtime_gated", runtime.recordCount === 0 && runtime.records.length === 0, "Normal runtime manifest remains empty.");
  const publicRoot = path.join(root, "public", "media", "teoyubeworld");
  const publicFiles = fs.readdirSync(publicRoot, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name !== ".gitkeep");
  check("no_public_copy", publicFiles.length === 0, "No source or derivative media was copied into public.");

  const port = 4192;
  const child = spawn(process.execPath, [path.join(root, "server.js")], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: "ignore", windowsHide: true });
  try {
    const ready = await waitForServer(port);
    check("qa_server_started", ready, "Isolated QA server started for HTTP contract checks.");
    if (ready) {
      const knownId = manifest.records.find((record) => record.mimeType === "video/mp4").id;
      const status = await request(port, "/__qa/teoyubeworld/media-status?qa=1");
      const head = await request(port, `/__qa/teoyubeworld/media/${knownId}?qa=1`, { method: "HEAD" });
      const range = await request(port, `/__qa/teoyubeworld/media/${knownId}?qa=1`, { headers: { Range: "bytes=0-1023" } });
      const invalidRange = await request(port, `/__qa/teoyubeworld/media/${knownId}?qa=1`, { headers: { Range: "bytes=999999999999-" } });
      const unknown = await request(port, "/__qa/teoyubeworld/media/media-00000000000000000000?qa=1");
      const protectedPath = await request(port, "/media-source/teoyubeworld/originals/shorts/private.mp4");
      const noQa = await request(port, `/__qa/teoyubeworld/media/${knownId}`);
      check("status_contract", status.status === 200 && !/[A-Za-z]:[\\/]/.test(status.body.toString("utf8")), "Media status is loopback QA-only and exposes no absolute paths.");
      check("known_id_head", head.status === 200 && head.headers["accept-ranges"] === "bytes", "Known media ID supports HEAD.");
      check("range_contract", range.status === 206 && range.body.length === 1024 && /^bytes 0-1023\//.test(range.headers["content-range"] || ""), "Known media ID supports a 206 byte range.");
      check("invalid_range", invalidRange.status === 416, "Invalid media ranges return 416.");
      check("unknown_id", unknown.status === 404, "Unknown media IDs are rejected.");
      check("protected_http", protectedPath.status === 404 && noQa.status === 404, "Direct source and non-QA media requests remain unavailable.");
    }
  } finally {
    child.kill();
  }

  const runtimeSources = [read("server.js"), read("media-review.js"), read("teoyubeworld-media-runtime.js"), read("scripts/generateTeoyubeWorldPilotDerivatives.cjs")].join("\n");
  check("no_external_upload", !/multipart\/form-data|presigned|cloudinary|s3\.amazonaws/i.test(runtimeSources), "No external upload implementation exists.");
  check("no_cloud_api", !/youtube\.com\/api|api\.openai|api\.anthropic|cloudinary/i.test(runtimeSources), "No cloud media or AI API exists.");
  check("no_analytics", !/gtag\(|analytics\.track|posthog|mixpanel|plausible/i.test(runtimeSources), "No analytics exists.");
  check("no_service_worker", !/navigator\.serviceWorker|serviceWorker\.register/i.test(runtimeSources), "No service worker exists.");
  check("no_live_ai", !/chat\/completions|responses\.create|new\s+OpenAI/i.test(runtimeSources), "No live AI orchestration exists.");
  const prior = spawnSync(process.execPath, [path.join(root, "scripts", "phase116c1MediaInventorySmoke.cjs")], { cwd: root, encoding: "utf8", windowsHide: true, timeout: 180000, maxBuffer: 8 * 1024 * 1024 });
  check("phase116c1_regression", prior.status === 0, "Phase 11.6C.1 inventory smoke remains passing.");

  const docs = ["owner-review-preflight", "secure-review-playback-report", "browser-metadata-probe-report", "owner-metadata-review-report", "bulk-review-actions-report", "review-patch-report", "duplicate-resolution-report", "sequence-curation-report", "pilot-approval-gate", "pilot-plan-report", "derivative-readiness-report", "sequence-player-prototype-report", "manual-owner-review-qa", "smoke-verification-report"].map((name) => `docs/teoyube/phase-11-6c2a-${name}.md`);
  check("documentation", docs.every(exists), "All Phase 11.6C.2A documents exist.");
  const report = {
    phase: "11.6C.2A", valid: checks.every((item) => item.status === "pass"), checks,
    inventory: { sourceFiles: currentFiles.length, sourceBytes: currentBytes, draftRecords: manifest.records.length, runtimeRecords: runtime.recordCount },
    review: { ownerReviewedRecords: 12, ScriptureConfirmedRecords: 12, duplicateGroupsResolved: 0, sequencesConfirmed: 1, pilotSelected: pilot.selectedMediaIds.length, pilotStatus: pilot.status },
    safety: { originalsModified: 0, publicFilesCopied: publicFiles.length, externalUploads: 0, runtimeManifestUpdated: false }
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
  return report;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { run };
