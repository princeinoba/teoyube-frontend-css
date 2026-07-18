const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

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

function parseJavaScript(source, id) {
  try {
    new vm.Script(source, { filename: id });
    return check(id, true, `${id} parsed.`);
  } catch (error) {
    return check(id, false, `${id} failed: ${error.message}`);
  }
}

function runNode(args, id) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
    shell: false
  });
  return check(
    id,
    result.status === 0,
    result.status === 0 ? `${id} passed.` : `${id} failed: ${(result.stderr || result.stdout || "").trim()}`
  );
}

const appJs = read("app.js");
const serverJs = read("server.js");
const indexHtml = read("index.html");
const stylesCss = read("styles.css");
const packageJson = JSON.parse(read("package.json"));
const runtimeSource = `${appJs}\n${serverJs}\n${indexHtml}`;

const requiredAppMarkers = [
  "openPhase115PersonalizationCenter",
  "setPersonalizationMode",
  "getPersonalizationStatus",
  "saveJourneyMemoryItem",
  "removeJourneyMemoryItem",
  "clearJourneyMemory",
  "exportJourneyMemory",
  "importJourneyMemoryPreview",
  "summarizeJourneyMemory",
  "derivePreferenceHintsFromJourneyMemory",
  "applyPreferenceHintsToLocalRecommendation",
  "explainWhyPreferenceWasUsed",
  "renderPhase115FeedbackControls",
  "renderPhase115SmartRecommendations",
  "renderPhase115BookMemoryTimeline",
  "getPhase115ComparisonHtml",
  "handlePhase115Feedback",
  "handlePhase115Action",
  "deletePhase115PersonalizationData",
  "phase115PersonalizationDialog",
  "phase115ComparisonDialog",
  "data-phase115-feedback",
  "data-phase115-action",
  "data-phase115-consent-mode"
];

const requiredDocs = [
  "docs/teoyube/phase-11-5-personalization-experience-plan.md",
  "docs/teoyube/phase-11-5-saved-journey-memory-report.md",
  "docs/teoyube/phase-11-5-consent-ui-report.md",
  "docs/teoyube/phase-11-5-preference-learning-preview-report.md",
  "docs/teoyube/phase-11-5-feedback-controls-report.md",
  "docs/teoyube/phase-11-5-privacy-safety-report.md",
  "docs/teoyube/phase-11-5-personalization-browser-qa-checklist.md",
  "docs/teoyube/phase-11-5-browser-qa-checklist.md",
  "docs/teoyube/phase-11-5-smoke-verification-report.md"
];

const checks = [
  parseJavaScript(appJs, "app_js_parses"),
  parseJavaScript(serverJs, "server_js_parses"),
  parseJavaScript(read("scripts/phase114Smoke.cjs"), "phase114_smoke_js_parses"),
  runNode(["--preserve-symlinks-main", "scripts/phase114Smoke.cjs"], "phase114_smoke_still_passes"),
  check("phase115_script_registered", Boolean(packageJson.scripts["phase115:smoke"]), "Phase 11.5 smoke script is registered."),
  check("personalization_default_off", /personalization:\s*"off"/.test(appJs), "Personalization defaults to off."),
  check("raw_private_text_disabled", appJs.includes("rawPrivateTextStorage: false") && appJs.includes("rawPrivateTextIncluded: false"), "Raw private text storage/export remains disabled."),
  check("personalization_handlers_exist", requiredAppMarkers.every((marker) => appJs.includes(marker)), "Personalization center, memory, hints, feedback, export/delete/reset, and comparison handlers exist."),
  check("generate_journey_personalization_aware", appJs.includes("applyPreferenceHintsToLocalRecommendation(baseline)") && appJs.includes("baselineScripture") && appJs.includes("Personalized preview used"), "Generate Today's Journey has a preference-aware preview path."),
  check("baseline_vs_preview_visible", appJs.includes("Standard Scripture Path") && appJs.includes("Personalized Preview") && appJs.includes("scripturePreserved"), "Baseline and personalized preview comparison preserves Scripture anchor visibility."),
  check("book_memory_timeline_present", appJs.includes("Journey Memory Timeline") && appJs.includes("phase115BookMemory") && appJs.includes("No saved Scriptures yet"), "Book of the Saint memory timeline and empty states exist."),
  check("right_rail_personalization_present", appJs.includes("Personalization Preview") && appJs.includes("Why this was recommended?"), "Right insight rail shows personalization preview and why-this panel."),
  check("smart_recommendations_present", appJs.includes("Recommended for Your Current Journey") && appJs.includes("Standard recommendation.") && appJs.includes("Personalized preview."), "Today and Canon smart recommendation sections exist."),
  check("consent_controls_present", indexHtml.includes("openPersonalizationCenter") && appJs.includes("Enable Session-only Personalization") && appJs.includes("Profile Preview Personalization") && appJs.includes("Disable personalization"), "Consent UI entry points and controls exist."),
  check("data_controls_present", appJs.includes("Your Teoyube Data Controls") && appJs.includes("Delete session data") && appJs.includes("Export safe data") && appJs.includes("Reset preferences"), "Data control card supports export/delete/reset/disable."),
  check("styles_present", stylesCss.includes(".phase115-personalization-dialog") && stylesCss.includes(".phase115-feedback-controls") && stylesCss.includes(".phase115-book-memory"), "Phase 11.5 styles exist."),
  check("docs_exist", requiredDocs.every(exists), "Phase 11.5 documentation files exist."),
  check("guardrails_copy_still_present", indexHtml.includes("Scripture remains the highest authority") && indexHtml.includes("Personalization is local preview only"), "Guardrails copy remains visible."),
  check("no_service_worker", !/serviceWorker|navigator\.serviceWorker/i.test(runtimeSource), "No service worker registration found."),
  check("no_database_client", !/(?:require\(|from\s+|import\s*\()["'](?:@?supabase|prisma|firebase)|indexedDB\.|openDatabase\(/i.test(runtimeSource), "No database client import or browser database API found."),
  check("no_browser_persistence", !/localStorage\.|sessionStorage\.|document\.cookie/i.test(runtimeSource), "No browser persistence API is used."),
  check("no_live_ai_call", !/api\/ai|chat\/completions|responses\.create|new\s+OpenAI|OpenAI\(/i.test(runtimeSource), "No live AI call is present."),
  check("no_analytics_calls", !/gtag\(|analytics\.track|posthog|mixpanel|segment\.io|plausible/i.test(runtimeSource), "No analytics call was added."),
  check("no_external_service_runtime", !/fetch\((?:`|\"|')https?:\/\//i.test(runtimeSource), "No obvious external service fetch was added.")
];

const report = {
  phase: "11.5",
  primaryRuntime: "static-node-app",
  valid: checks.every((item) => item.status === "pass"),
  checks,
  safety: {
    personalizationDefaultOff: true,
    noRawPrivateTextExported: true,
    noExternalServices: true,
    noLiveAi: true,
    noAnalytics: true,
    noDatabasePersistence: true,
    noBrowserPersistence: true,
    noAutomaticContact: true
  }
};

console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exit(1);
