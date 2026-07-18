const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { validateTeoyubeWorldOwnerGate, approvedPilotPath, runtimeManifestPath } = require("./validateTeoyubeWorldOwnerGate.cjs");
const { artifactSnapshot, determineLifecycleState } = require("./lib/teoyubeWorldPilotLifecycle.cjs");

const root = path.resolve(__dirname, "..");
const checks = [];
function read(relativePath) { return fs.readFileSync(path.join(root, relativePath), "utf8"); }
function check(id, passed, message) { checks.push({ id, status: passed ? "pass" : "fail", message }); }

async function run() {
  const gate = await validateTeoyubeWorldOwnerGate();
  const runtime = JSON.parse(read("src/data/teoyubeworld-media-manifest.json"));
  const publicRoot = path.join(root, "public", "media", "teoyubeworld");
  const derivativePlanPath = path.join(root, "generated", "teoyubeworld-media", "pilot-v1", "plans", "derivative-plan.json");
  const publicFiles = fs.readdirSync(publicRoot, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name !== ".gitkeep");
  check("gate_validator", fs.existsSync(path.join(root, "scripts", "validateTeoyubeWorldOwnerGate.cjs")), "Owner gate validator exists.");
  check("gate_approved", gate.status === "passed" && gate.blockers.length === 0, "Owner gate is clear after checksum-bound batch attestation.");
  check("short_gate", gate.counts.approvedShorts === 12 && !gate.blockers.some((item) => item.code === "short_count"), "First-pilot short count is exactly 12.");
  check("sequence_gate", gate.counts.approvedSequences === 1 && gate.counts.confirmedSequenceSegments === 12, "Exactly one complete 12-segment sequence is approved.");
  check("approved_manifest_present", fs.existsSync(approvedPilotPath), "The checksum-bound approved pilot artifact exists.");
  check("runtime_manifest_absent", !fs.existsSync(runtimeManifestPath), "C.2B runtime media manifest was not created before approval.");
  check("legacy_runtime_empty", runtime.recordCount === 0 && runtime.records.length === 0, "Existing runtime media manifest remains empty.");
  check("public_root_no_loose_files", publicFiles.length === 0, "No loose source master or unplanned file exists at the public TeoyubeWorld root.");
  const lifecycleArtifacts = artifactSnapshot();
  const lifecycleState = determineLifecycleState(gate, lifecycleArtifacts);
  check("c2b_lifecycle_chain", fs.existsSync(derivativePlanPath) && ["derivative_plan_ready", "derivative_execution_authorized", "derivatives_generated", "derivatives_validated", "publication_plan_ready", "publication_authorized", "published"].includes(lifecycleState) && (lifecycleState !== "published" || lifecycleArtifacts.publicationReceipt?.totalFilesPublished === 49), "C.2B remains in a valid ordered lifecycle state, including the exact terminal publication when present.");
  const server = read("server.js");
  check("secure_local_review_preserved", server.includes("/__qa/teoyubeworld/media-status") && server.includes("parseRangeHeader"), "Secure local owner-review playback remains available.");
  const prior = spawnSync(process.execPath, [path.join(root, "scripts", "phase116c2aOwnerReviewSmoke.cjs")], { cwd: root, encoding: "utf8", windowsHide: true, timeout: 180000, maxBuffer: 8 * 1024 * 1024 });
  check("c2a_regression", prior.status === 0, "Phase 11.6C.2A smoke remains passing.");
  const sources = [read("server.js"), read("app.js"), read("media-review.js")].join("\n");
  check("no_autoplay_audio", !/autoplay[^\n>]*sound|\.play\(\).*volume\s*=\s*[1-9]/i.test(sources), "No autoplay-audio path was added.");
  check("no_external_upload", !/presigned|cloudinary|s3\.amazonaws|multipart\/form-data/i.test(sources), "No external upload was added.");
  check("no_analytics", !/gtag\(|posthog|mixpanel|plausible/i.test(sources), "No analytics was added.");
  check("no_database", !/indexedDB|new\s+PrismaClient|createClient\([^)]*supabase/i.test(sources), "No database or browser persistence was added.");
  check("no_live_ai", !/chat\/completions|responses\.create|new\s+OpenAI/i.test(sources), "No live AI was added.");
  check("no_service_worker", !/serviceWorker\.register|navigator\.serviceWorker/i.test(sources), "No service worker was added.");
  check("scripture_guardrails", sources.includes("Scripture") && sources.includes("Guardrails"), "Scripture and guardrail markers remain present.");
  const report = {
    phase: "11.6C.2B",
    valid: checks.every((item) => item.status === "pass"),
    phaseComplete: false,
    gateStatus: gate.status,
    lifecycleState,
    checks,
    blockers: gate.blockers,
    safety: { originalsModified: 0, publicFilesCopied: lifecycleArtifacts.publicationReceipt?.totalFilesPublished || 0, loosePublicFiles: publicFiles.length, externalUploads: 0, runtimeRecords: runtime.recordCount }
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
  return report;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { run };
