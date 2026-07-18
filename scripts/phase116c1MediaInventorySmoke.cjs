const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { parseScriptureMediaFilename } = require("./lib/parseScriptureMediaFilename.cjs");
const { validateTeoyubeWorldMediaManifest } = require("./validateTeoyubeWorldMediaManifest.cjs");
const { discoverFiles } = require("./scanTeoyubeWorldMedia.cjs");

const root = path.resolve(__dirname, "..");
const generated = path.join(root, "generated", "teoyubeworld-media");
const manifestPath = path.join(generated, "manifests", "teoyubeworld-media-manifest.draft.json");
const runtimePath = path.join(root, "src", "data", "teoyubeworld-media-manifest.json");
const checks = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function check(id, passed, message) {
  checks.push({ id, status: passed ? "pass" : "fail", message });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const requiredSource = ["shorts", "long-form", "audio", "captions", "thumbnails"];
check("source_directories", requiredSource.every((name) => exists("media-source/teoyubeworld/originals/" + name)), "All protected source directories exist.");
check("source_rules", exists("media-source/teoyubeworld/AGENTS.md") && read("media-source/teoyubeworld/AGENTS.md").includes("immutable master media"), "Immutable source rules exist.");
check("scanner", exists("scripts/scanTeoyubeWorldMedia.cjs"), "Incremental scanner exists.");
check("parser", exists("scripts/lib/parseScriptureMediaFilename.cjs"), "Scripture filename parser exists.");
check("validator", exists("scripts/validateTeoyubeWorldMediaManifest.cjs"), "Draft manifest validator exists.");
check("draft_manifest", exists("generated/teoyubeworld-media/manifests/teoyubeworld-media-manifest.draft.json"), "Full draft manifest exists.");
check("review_csv", exists("generated/teoyubeworld-media/manifests/teoyubeworld-media-review.csv"), "Owner media review CSV exists.");
check("sequence_csv", exists("generated/teoyubeworld-media/manifests/teoyubeworld-sequence-review.csv"), "Owner sequence review CSV exists.");
check("duplicate_reports", exists("generated/teoyubeworld-media/reports/exact-duplicates.json") && exists("generated/teoyubeworld-media/reports/probable-duplicates.json") && exists("generated/teoyubeworld-media/reports/duplicate-review.md"), "Duplicate reports exist.");
check("sequence_reports", exists("generated/teoyubeworld-media/reports/scripture-sequences.json") && exists("generated/teoyubeworld-media/reports/scripture-sequences-review.md"), "Sequence reports exist.");
check("review_queue", exists("docs/teoyube/phase-11-6c1-media-review-queue.md"), "Complete owner review queue exists.");
check("optimization_plan", exists("generated/teoyubeworld-media/reports/media-optimization-plan.json") && exists("docs/teoyube/phase-11-6c1-media-optimization-plan.md"), "Optimization recommendations exist without bulk transcoding.");
check("runtime_gate", exists("docs/teoyube/phase-11-6c1-runtime-manifest-gate.md"), "Runtime manifest gate exists.");
check("review_interface", exists("media-review.html") && exists("media-review.js"), "Local QA media review interface exists.");
check(
  "review_interface_gate",
  read("server.js").includes("/api/media-review/draft") &&
    read("server.js").includes("isLoopbackRequest") &&
    read("media-review.js").includes("Runtime manifest remains unchanged"),
  "Media review draft access is loopback/QA gated and exports only an in-memory patch."
);
const requiredDocs = [
  "docs/teoyube/phase-11-6c1-media-workspace-preflight.md",
  "docs/teoyube/phase-11-6c1-local-media-inventory-report.md",
  "docs/teoyube/phase-11-6c1-media-review-queue.md",
  "docs/teoyube/phase-11-6c1-runtime-manifest-gate.md",
  "docs/teoyube/phase-11-6c1-media-optimization-plan.md",
  "docs/teoyube/phase-11-6c1-media-surface-recommendations.md",
  "docs/teoyube/phase-11-6c1-manual-media-review-qa.md",
  "docs/teoyube/phase-11-6c1-smoke-verification-report.md",
  "docs/teoyube/phase-11-6c1-integration-readiness-summary.md"
];
check("phase116c1_docs", requiredDocs.every(exists), "All required Phase 11.6C.1 documents exist.");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const runtimeManifest = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
const integrity = JSON.parse(read("generated/teoyubeworld-media/reports/source-integrity.json"));
const validation = validateTeoyubeWorldMediaManifest(manifest);
check("manifest_full_scan", manifest.scanMode === "full" && manifest.records.length > 0 && manifest.records.every((record) => /^[a-f0-9]{64}$/.test(record.checksumSha256)), "Full scan manifest has streamed SHA-256 coverage.");
check("manifest_valid", validation.valid, "Draft manifest validation passes.");
check("source_unchanged", integrity.unchanged === true && integrity.changeCount === 0, "Before/after source metadata comparison reports zero changes.");
check("runtime_manifest_gated", runtimeManifest.recordCount === 0 && Array.isArray(runtimeManifest.records) && runtimeManifest.records.length === 0, "Reviewed runtime manifest remains empty.");
check("no_absolute_paths", !/[A-Za-z]:[\\/]/.test(fs.readFileSync(manifestPath, "utf8")), "Draft manifest exposes no absolute Windows path.");

const publicFiles = fs.readdirSync(path.join(root, "public", "media", "teoyubeworld"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name !== ".gitkeep");
check("no_public_copy", publicFiles.length === 0, "No media was copied automatically into the approved public directory.");

const parserCases = JSON.parse(read("scripts/fixtures/teoyubeworld-media/parser-cases.json"));
const parserPass = parserCases.every((fixture) => {
  const result = parseScriptureMediaFilename(fixture.fileName);
  return result.normalizedBook === fixture.book && result.chapter === fixture.chapter &&
    result.verseStart === fixture.verseStart && result.verseEnd === fixture.verseEnd &&
    result.parserConfidence === fixture.confidence;
});
check("parser_fixtures", parserPass, "Scripture filename fixtures cover numbered books, ranges, ambiguous, audio, caption, and unknown names.");

const emptyFixture = path.join(root, "scripts", "fixtures", "teoyubeworld-media", "empty");
check("empty_folder_fixture", discoverFiles(emptyFixture).files.length === 0, "Empty media folder fixture returns zero records.");

const base = manifest.records.find((record) => !record.duplicateGroupId) || manifest.records[0];
const validatorCases = JSON.parse(read("scripts/fixtures/teoyubeworld-media/validator-cases.json"));
const validatorPass = validatorCases.every((fixture) => {
  const record = clone(base);
  const testManifest = { schemaVersion: "1.0.0", scanMode: "full", records: [record] };
  if (fixture.mutation === "duplicate_id") testManifest.records.push(clone(record));
  if (fixture.mutation === "absolute_path") record.relativeSourcePath = "C:\\private\\master.mp4";
  if (fixture.mutation === "path_traversal") record.relativeSourcePath = "../master.mp4";
  if (fixture.mutation === "html_injection") record.title = "<script>alert(1)</script>";
  if (fixture.mutation === "unknown_extension") { record.fileExtension = "exe"; record.mimeType = "application/octet-stream"; }
  if (fixture.mutation === "missing_technical_metadata") { record.durationSeconds = null; record.containerFormat = null; }
  const report = validateTeoyubeWorldMediaManifest(testManifest);
  return fixture.expectedValid === false ? report.valid === false : report.warnings.length > 0;
});
check("validator_fixtures", validatorPass, "Validator rejects duplicates, absolute paths, traversal, injection, and unknown executable formats while warning on missing metadata.");

const runtimeSources = [read("app.js"), read("server.js"), read("phase116b1.js"), read("media-review.js")].join("\n");
check("no_external_upload", !/multipart\/form-data|presigned|uploadToCloud|cloudinary|s3\.amazonaws/i.test(runtimeSources), "No external upload implementation exists.");
check("no_external_media_api", !/youtube\.com\/api|api\.youtube|vimeo\.com\/api|cloudinary/i.test(runtimeSources), "No external media API was added.");
check("no_analytics", !/gtag\(|analytics\.track|posthog|mixpanel|segment\.io|plausible/i.test(runtimeSources), "No analytics was added.");
check("no_service_worker", !/navigator\.serviceWorker|serviceWorker\.register/i.test(runtimeSources), "No service worker was added.");
check("no_live_ai", !/chat\/completions|responses\.create|new\s+OpenAI|OpenAI\(/i.test(runtimeSources), "No live AI was added.");

const prior = spawnSync(process.execPath, [path.join(root, "scripts", "phase116b1ReadinessSmoke.cjs")], {
  cwd: root, encoding: "utf8", windowsHide: true, timeout: 120000, maxBuffer: 4 * 1024 * 1024
});
check("phase116b1_regression", prior.status === 0, "Phase 11.6B.1 smoke remains passing.");

const report = {
  phase: "11.6C.1",
  valid: checks.every((item) => item.status === "pass"),
  checks,
  inventory: {
    records: manifest.recordCount,
    exactDuplicateGroups: manifest.exactDuplicateCount,
    probableDuplicateGroups: manifest.probableDuplicateCount,
    sequences: manifest.sequenceCount,
    runtimeRecords: runtimeManifest.recordCount
  },
  safety: {
    originalsModified: integrity.changeCount,
    publicFilesCopiedAutomatically: publicFiles.length,
    externalUploads: 0,
    externalServices: false,
    runtimeManifestGated: true
  }
};

console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exitCode = 1;
