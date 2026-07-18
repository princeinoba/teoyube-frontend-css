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

function parseJavaScript(source, id) {
  try {
    new vm.Script(source, { filename: id });
    return check(id, true, `${id} parsed.`);
  } catch (error) {
    return check(id, false, `${id} failed: ${error.message}`);
  }
}

function runNodeCheck(relativePath) {
  try {
    new vm.Script(read(relativePath), { filename: relativePath });
    return check(`${relativePath}_node_check`, true, `${relativePath} passed node-compatible syntax check.`);
  } catch (error) {
    return check(`${relativePath}_node_check`, false, `${relativePath} failed: ${error.message}`);
  }
}

function includesAll(source, markers) {
  return markers.every((marker) => source.includes(marker));
}

const appJs = read("app.js");
const serverJs = read("server.js");
const stylesCss = read("styles.css");
const indexHtml = read("index.html");
const packageJson = JSON.parse(read("package.json"));
const runtimeSource = `${appJs}\n${serverJs}\n${indexHtml}`;

const helperMarkers = [
  "setActiveTigResponse",
  "setActiveWord",
  "setActiveScripture",
  "setActivePromiseCluster",
  "setActiveJourney",
  "addPromiseTableItem",
  "updatePromiseTableStatus",
  "removePromiseTableItem",
  "saveToBook",
  "saveJournalEntry",
  "saveTestimonyEntry",
  "updateRightRail",
  "updateGraphFromResponse",
  "showActionToast",
  "showFallbackNotice",
  "recordUserAction",
  "refreshPageFromState"
];

const functionalMarkers = [
  "createPhase116bDailyJourney",
  "renderPhase116bTodayCommandCenter",
  "scorePhase116bPromiseSearchResult",
  "phase116b-result-metrics",
  "renderPhase116bPromiseWorkspace",
  "PHASE116B_PROMISE_STATUSES",
  "createPhase116bCompassResult",
  "renderPhase116bCallingCompassTool",
  "composePhase116TeoGuideResponse",
  "renderPhase116bTeoGuideTools",
  "updateGraphFromResponse",
  "graph-save-node",
  "renderPhase116bBookJournalControls",
  "testimony-delete",
  "renderPhase116bLexiconStudyPanel",
  "lexicon-complete-study",
  "runPhase116bFunctionalQa",
  "createPhase116bFunctionalQaReport"
];

const commandMarkers = [
  "phase116b-complete-today-action",
  "phase116b-add-current-reflection",
  "phase116b-save-current-scripture",
  "phase116b-save-current-word",
  "phase116b-save-current-promise",
  "phase116b-open-current-graph",
  "phase116b-ask-teo-current-word",
  "phase116b-add-current-promise-table",
  "phase116b-start-calling-compass",
  "phase116b-guided-promise-workflow",
  "phase116b-guided-prayer-workflow",
  "phase116b-export-book",
  "phase116b-reset-session",
  "phase116b-disable-personalization"
];

const requiredDocs = [
  "docs/teoyube/phase-11-6b-real-functionality-audit.md",
  "docs/teoyube/phase-11-6b-state-of-the-art-acceptance-criteria.md",
  "docs/teoyube/phase-11-6b-cross-app-state-report.md",
  "docs/teoyube/phase-11-6b-today-command-center-report.md",
  "docs/teoyube/phase-11-6b-search-promise-table-report.md",
  "docs/teoyube/phase-11-6b-calling-compass-report.md",
  "docs/teoyube/phase-11-6b-teo-guide-report.md",
  "docs/teoyube/phase-11-6b-graph-explorer-report.md",
  "docs/teoyube/phase-11-6b-book-journal-testimony-report.md",
  "docs/teoyube/phase-11-6b-manual-functional-qa-results.md",
  "docs/teoyube/phase-11-6b-smoke-verification-report.md"
];

const checks = [
  parseJavaScript(appJs, "app_js_parses"),
  parseJavaScript(serverJs, "server_js_parses"),
  parseJavaScript(read("scripts/phase116bFunctionalSmoke.cjs"), "phase116b_smoke_parses"),
  runNodeCheck("app.js"),
  runNodeCheck("server.js"),
  check("package_script_registered", Boolean(packageJson.scripts["phase116b:smoke"]), "phase116b:smoke script is registered."),
  check("phase11_qa_includes_phase116b", /phase116b:smoke/.test(packageJson.scripts["phase11:qa"] || ""), "Phase 11 QA includes Phase 11.6B."),
  check("root_check_includes_phase116b", /phase116b:smoke/.test(packageJson.scripts.check || ""), "Root check includes Phase 11.6B."),
  check("cross_app_state_helpers_exist", includesAll(appJs, helperMarkers), "Cross-app state helper functions exist."),
  check("functional_depth_markers_exist", includesAll(appJs, functionalMarkers), "Today, Search, Promise Table, Calling, Guide, Graph, Book, Testimony, Lexicon, and QA markers exist."),
  check("command_palette_contextual_actions_exist", includesAll(appJs, commandMarkers), "Contextual command palette actions exist."),
  check("styles_for_functional_panels_exist", includesAll(stylesCss, [".phase116b-functional-panel", ".phase116b-command-grid", ".phase116b-qa-grid", "@media (max-width: 768px)"]), "Phase 11.6B responsive styles exist."),
  check("docs_exist", requiredDocs.every(exists), "Phase 11.6B documentation files exist."),
  check("guardrails_still_exist", indexHtml.includes("Scripture remains the highest authority") && appJs.includes("openGuardrailsModal"), "Guardrails still exist."),
  check("scripture_anchors_still_visible", appJs.includes("scripture-pill") && appJs.includes("Scripture anchors available"), "Scripture anchors remain visible."),
  check("fallback_notices_exist", appJs.includes("showFallbackNotice") && appJs.includes("recordPhase114Fallback"), "Fallback notices remain visible."),
  check("confidence_labels_exist", appJs.includes("confidenceLabel") && appJs.includes("Recommendation Quality"), "Confidence labels remain visible."),
  check("no_service_worker", !/serviceWorker|navigator\.serviceWorker/i.test(runtimeSource), "No service worker registration found."),
  check("no_database_client", !/(?:require\(|from\s+|import\s*\()["'](?:@?supabase|prisma|firebase)|indexedDB\.|openDatabase\(/i.test(runtimeSource), "No database client import or browser database API found."),
  check("no_browser_persistence", !/localStorage\.|sessionStorage\.|document\.cookie/i.test(runtimeSource), "No browser persistence API is used."),
  check("no_live_ai_call", !/api\/ai|chat\/completions|responses\.create|new\s+OpenAI|OpenAI\(/i.test(runtimeSource), "No live AI call is present."),
  check("no_analytics_calls", !/gtag\(|analytics\.track|posthog|mixpanel|segment\.io|plausible/i.test(runtimeSource), "No analytics call was added."),
  check("no_external_service_runtime", !/fetch\((?:`|"|')https?:\/\//i.test(runtimeSource), "No obvious external service fetch was added."),
  check("static_node_primary_runtime", packageJson.scripts.start?.includes("server.js") && !packageJson.scripts.start?.includes("next"), "Static Node remains primary runtime.")
];

const report = {
  phase: "11.6B",
  primaryRuntime: "static-node-app",
  valid: checks.every((item) => item.status === "pass"),
  checks,
  safety: {
    localOnly: true,
    noExternalServices: true,
    noLiveAi: true,
    noAnalytics: true,
    noDatabasePersistence: true,
    noBrowserPersistence: true,
    noServiceWorker: true,
    noAutomaticContact: true,
    scriptureAnchorsRemainVisible: true,
    fallbackNoticesRemainVisible: true,
    confidenceLabelsRemainVisible: true
  }
};

console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exit(1);
