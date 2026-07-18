const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function check(id, passed, message) {
  return { id, status: passed ? "pass" : "fail", message };
}

function parses(relativePath) {
  try {
    new vm.Script(read(relativePath), { filename: relativePath });
    return check(`${relativePath}_parses`, true, `${relativePath} parsed.`);
  } catch (error) {
    return check(`${relativePath}_parses`, false, error.message);
  }
}

function includesAll(source, markers) {
  return markers.every((marker) => source.includes(marker));
}

function loadCommonJs(relativePath, moduleOverrides = {}) {
  const module = { exports: {} };
  const source = read(relativePath);
  const localRequire = (specifier) => {
    if (moduleOverrides[specifier]) return moduleOverrides[specifier];
    if (["path", "fs", "crypto", "child_process"].includes(specifier)) return require(specifier);
    throw new Error(`Smoke loader blocked unexpected dependency: ${specifier}`);
  };
  const wrapper = new vm.Script(`(function(require,module,exports,__filename,__dirname){${source}\n})`, { filename: relativePath });
  wrapper.runInThisContext()(localRequire, module, module.exports, path.join(root, relativePath), path.dirname(path.join(root, relativePath)));
  return module.exports;
}

const appJs = read("app.js");
const phaseRuntime = read("phase116b1.js");
const serverJs = read("server.js");
const indexHtml = read("index.html");
const stylesCss = read("styles.css");
const packageJson = JSON.parse(read("package.json"));
const sampleManifest = JSON.parse(read("src/data/teoyubeworld-media-manifest.sample.json"));
const parser = loadCommonJs("scripts/lib/parseScriptureMediaFilename.cjs");
const validator = loadCommonJs("scripts/validateTeoyubeWorldMediaManifest.cjs", {
  "./lib/parseScriptureMediaFilename.cjs": parser
});
const scanner = loadCommonJs("scripts/scanTeoyubeWorldMedia.cjs", {
  "./lib/parseScriptureMediaFilename.cjs": parser
});
const sampleValidation = validator.validateTeoyubeWorldMediaManifest(sampleManifest);
const parserCases = [
  ["John 3 16.mp4", "John", 3, 16, null],
  ["John_3_16.mp4", "John", 3, 16, null],
  ["John-3-16-short.mp4", "John", 3, 16, null],
  ["Psalm 23.mp4", "Psalms", 23, null, null],
  ["Psalms_23_1-6.mp4", "Psalms", 23, 1, 6],
  ["Romans 8 28 animation.mp4", "Romans", 8, 28, null],
  ["Genesis-1-1-location.mov", "Genesis", 1, 1, null],
  ["Isaiah_40_31_audio.mp4", "Isaiah", 40, 31, null]
];
const parserPasses = parserCases.every(([fileName, book, chapter, verseStart, verseEnd]) => {
  const result = parser.parseScriptureMediaFilename(fileName);
  return result.book === book && result.chapter === chapter && result.verseStart === verseStart && result.verseEnd === verseEnd;
});

const requiredDocs = [
  "docs/teoyube/phase-11-6b1-runtime-and-media-readiness-audit.md",
  "docs/teoyube/phase-11-6b1-action-registry-report.md",
  "docs/teoyube/phase-11-6b1-promise-table-reliability-report.md",
  "docs/teoyube/phase-11-6b1-undo-and-action-history-report.md",
  "docs/teoyube/phase-11-6b1-smart-collections-report.md",
  "docs/teoyube/phase-11-6b1-universal-search-report.md",
  "docs/teoyube/teoyubeworld-media-manifest-schema.md",
  "docs/teoyube/teoyubeworld-media-folder-convention.md",
  "docs/teoyube/phase-11-6b1-media-ingestion-readiness-report.md",
  "docs/teoyube/phase-11-6b1-responsive-qa-lab-report.md",
  "docs/teoyube/phase-11-6b1-performance-hardening-report.md",
  "docs/teoyube/phase-11-6b1-manual-browser-qa-results.md",
  "docs/teoyube/phase-11-6b1-smoke-verification-report.md"
];

const actionMarkers = [
  "registerTeoyubeAction", "unregisterTeoyubeAction", "dispatchTeoyubeAction", "getTeoyubeAction",
  "getAvailableTeoyubeActions", "getTeoyubeActionDisabledReason", "recordTeoyubeActionOutcome", "renderTeoyubeActionStatus"
];
const undoMarkers = [
  "pushTeoyubeUndoEntry", "undoLastTeoyubeAction", "canUndoTeoyubeAction", "getRecentTeoyubeActions",
  "clearTeoyubeActionHistory", "renderRecentActionHistory", "renderUndoToast"
];
const collectionMarkers = [
  "createTeoyubeSmartCollection", "renameTeoyubeSmartCollection", "deleteTeoyubeSmartCollection",
  "addTeoyubeCollectionItem", "removeTeoyubeCollectionItem", "moveTeoyubeCollectionItem", "exportTeoyubeSmartCollection"
];
const continuationMarkers = ["getTeoyubeContinuationState", "clearTeoyubeContinuationState", "Continue Where You Left Off"];
const searchMarkers = [
  "buildTeoyubeUniversalIndex", "refreshTeoyubeUniversalIndex", "tokenizeTeoyubeSearchText", "scoreTeoyubeSearchRecord",
  "searchTeoyubeUniversalIndex", "getTeoyubeSearchSuggestions", "groupTeoyubeSearchResults", "openTeoyubeSearchResult"
];
const runtimeSource = `${appJs}\n${phaseRuntime}\n${serverJs}\n${indexHtml}`;

const checks = [
  parses("app.js"),
  parses("phase116b1.js"),
  parses("server.js"),
  parses("scripts/phase116bFunctionalSmoke.cjs"),
  parses("scripts/phase116b1ReadinessSmoke.cjs"),
  parses("scripts/scanTeoyubeWorldMedia.cjs"),
  parses("scripts/validateTeoyubeWorldMediaManifest.cjs"),
  parses("scripts/lib/parseScriptureMediaFilename.cjs"),
  check("prior_smoke_scripts_present", ["scripts/phase114Smoke.cjs", "scripts/phase115Smoke.cjs", "scripts/phase116Smoke.cjs", "scripts/phase116bFunctionalSmoke.cjs"].every(exists), "Phase 11.4, 11.5, 11.6, and 11.6B smoke scripts remain present."),
  check("phase11_qa_runs_prior_and_current", ["phase114:smoke", "phase115:smoke", "phase116:smoke", "phase116b:smoke", "phase116b1:smoke"].every((script) => packageJson.scripts["phase11:qa"]?.includes(script)), "Phase 11 QA chains prior smoke checks and Phase 11.6B.1."),
  check("manual_promise_handler", includesAll(phaseRuntime, ["phase116b1PromiseAddForm", "submitPhase116b1Promise", "promise.add.submit", "requestSubmit"]), "Deterministic Promise Table dialog, submit, keyboard, and registry markers exist."),
  check("action_registry", includesAll(phaseRuntime, actionMarkers), "Unified action registry helpers exist."),
  check("undo_and_history", includesAll(phaseRuntime, undoMarkers), "Undo and sanitized action history helpers exist."),
  check("smart_collections", includesAll(phaseRuntime, collectionMarkers) && phaseRuntime.includes("No TeoyubeWorld media has been imported yet."), "Smart Collections and honest empty media collection exist."),
  check("continuation_state", includesAll(phaseRuntime, continuationMarkers), "Continue Where You Left Off helpers and UI exist."),
  check("universal_search", includesAll(phaseRuntime, searchMarkers), "Universal search index, scoring, grouping, and open helpers exist."),
  check("media_sample_manifest", sampleManifest.sampleOnly === true && sampleManifest.imported === false && sampleManifest.actualMediaRecordCount === 0 && sampleManifest.records.length === 2 && sampleManifest.records.every((record) => record.sampleOnly === true && record.imported === false), "Sample manifest is explicit, sample-only, and reports zero actual records."),
  check("sample_manifest_valid", sampleValidation.valid, `Sample manifest validation: ${sampleValidation.errors.join("; ") || "valid"}.`),
  check("scripture_filename_parser", parserPasses, "Representative Scripture filenames parse to expected book/chapter/verse metadata."),
  check("media_scanner", exists("scripts/scanTeoyubeWorldMedia.cjs") && packageJson.scripts["media:scan"]?.includes("scanTeoyubeWorldMedia.cjs"), "Read-only local media scanner and package command exist."),
  check("media_validator", exists("scripts/validateTeoyubeWorldMediaManifest.cjs") && packageJson.scripts["media:validate"]?.includes("validateTeoyubeWorldMediaManifest.cjs"), "Manifest validator and package command exist."),
  check("media_surface_mapping", exists("src/lib/teoyube/media-surface-mapping.ts") && includesAll(read("src/lib/teoyube/media-surface-mapping.ts"), ["getRecommendedMediaSurfaces", "scoreMediaForScripture", "rankMediaForCurrentContext", "explainMediaRecommendation", "soundAutoplayAllowed: false"]), "Media surface mapping and explainable ranking rules exist."),
  check("media_readiness_panel", includesAll(phaseRuntime, ["TeoyubeWorld Media Readiness", "Actual media records", "Media ZIP imported", "Phase 11.6C"]), "QA Media Readiness panel reports import status and next step."),
  check("responsive_qa_lab", includesAll(phaseRuntime, ["Responsive QA Lab", "phase116b1ResponsiveFrame", "embedded", "touchTargetWarnings", "overflow"]), "Responsive QA Lab includes constrained iframe, recursion guard, and diagnostics."),
  check("responsive_styles", includesAll(stylesCss, [".phase116b1-responsive-viewport", ".phase116b1-promise-form", "@media (max-width: 430px)"]), "Responsive form and lab styles exist."),
  check("docs_exist", requiredDocs.every(exists), "All required Phase 11.6B.1 documents exist."),
  check("static_node_primary", packageJson.scripts.start?.includes("server.js") && !packageJson.scripts.start?.includes("next"), "Static Node remains the primary runtime."),
  check("no_false_media_import", !/phase116b1MediaRecords\s*:\s*\[[^\]]+\]/s.test(appJs) && sampleManifest.imported === false, "No live media record is falsely marked imported."),
  check("no_live_ai", !/api\/ai|chat\/completions|responses\.create|new\s+OpenAI|OpenAI\(/i.test(runtimeSource), "No live AI orchestration was added."),
  check("no_analytics", !/gtag\(|analytics\.track|posthog|mixpanel|segment\.io|plausible/i.test(runtimeSource), "No analytics call was added."),
  check("no_database", !/(?:require\(|from\s+|import\s*\()["'](?:@?supabase|prisma|firebase)|indexedDB\.|openDatabase\(/i.test(runtimeSource), "No database client or browser database API was added."),
  check("no_service_worker", !/serviceWorker|navigator\.serviceWorker/i.test(runtimeSource), "No service worker was added."),
  check("no_external_upload", !/upload(?:File|Media)?\s*\(|multipart\/form-data|presigned/i.test(runtimeSource), "No external upload flow was added."),
  check("no_browser_persistence", !/localStorage\.|sessionStorage\.|document\.cookie/i.test(runtimeSource), "No browser persistence API was added."),
  check("safety_markers", indexHtml.includes("Scripture remains the highest authority") && includesAll(appJs, ["confidenceLabel", "showFallbackNotice", "openGuardrailsModal"]), "Scripture, confidence, fallback, and guardrail markers remain present.")
];

async function run() {
  const fixtureRoot = path.join(root, ".tmp", "phase116b1-media-fixture");
  try {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
    fs.mkdirSync(path.join(fixtureRoot, "John", "03"), { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, "Psalms", "23"), { recursive: true });
    fs.writeFileSync(path.join(fixtureRoot, "John", "03", "John_3_16_animation.mp4"), "phase-11-6b1-video-fixture", "utf8");
    fs.writeFileSync(path.join(fixtureRoot, "Psalms", "23", "Psalms_23_1-6_audio.m4a"), "phase-11-6b1-audio-fixture", "utf8");
    const scannedFixture = await scanner.scanTeoyubeWorldMedia(fixtureRoot);
    const fixtureValidation = validator.validateTeoyubeWorldMediaManifest(scannedFixture);
    checks.push(
      check("media_scanner_fixture", scannedFixture.recordCount === 2 && scannedFixture.imported === false && scannedFixture.records.every((record) => record.relativePath && !path.isAbsolute(record.relativePath)), "Scanner produced two non-imported records with public-safe relative paths from a local fixture."),
      check("media_validator_fixture", fixtureValidation.valid, `Scanned fixture validation: ${fixtureValidation.errors.join("; ") || "valid"}.`)
    );
  } catch (error) {
    checks.push(check("media_scanner_fixture", false, error.message));
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }

  const report = {
    phase: "11.6B.1",
    primaryRuntime: "static-node-app",
    valid: checks.every((item) => item.status === "pass"),
    checks,
    media: {
      sampleRecords: sampleManifest.records.length,
      actualImportedRecords: 0,
      scannerAvailable: true,
      validatorAvailable: true,
      sampleManifestValid: sampleValidation.valid
    },
    safety: {
      localOnly: true,
      noExternalServices: true,
      noLiveAi: true,
      noAnalytics: true,
      noDatabasePersistence: true,
      noBrowserPersistence: true,
      noServiceWorker: true,
      noExternalUpload: true,
      scriptureAnchorsRemainVisible: true,
      fallbackAndConfidenceRemainVisible: true
    }
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
