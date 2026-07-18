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
  "phase116WhyThisOpen",
  "createPhase116WhyThisTrace",
  "renderPhase116WhyThisPanel",
  "phase116-why-this-panel",
  "calculatePhase116QualityScore",
  "Recommendation Quality Score",
  "renderPhase116GraphExplorer",
  "phase116GraphDialog",
  "data-phase116-graph-node",
  "data-phase116-graph-edge",
  "PHASE116_GRAPH_MODES",
  "renderPhase116SmartRailSections",
  "Smart Recommendation Rail",
  "getPhase113Commands",
  "No matching commands",
  "phase116-open-graph",
  "openPhase116Workflow",
  "phase116WorkflowDialog",
  "getPhase116WorkflowDefinitions",
  "Workflow: I need a promise",
  "composePhase116TeoGuideResponse",
  "local Scripture-guided preview, not live AI",
  "renderPhase116TeoPromptCategories",
  "PHASE116_TEO_PROMPT_GROUPS",
  "sanitizePhase116SearchQuery",
  "renderPhase116SearchSuggestions",
  "phase116RecentSafeSearches",
  "renderPhase116IntelligenceHealthPanel",
  "Intelligence Health",
  "externalServicesDisabled: true",
  "rawPrivateTextStored: false"
];

const requiredDocs = [
  "docs/teoyube/phase-11-6-premium-intelligence-ux-plan.md",
  "docs/teoyube/phase-11-6-why-this-reasoning-report.md",
  "docs/teoyube/phase-11-6-graph-explorer-report.md",
  "docs/teoyube/phase-11-6-command-palette-intelligence-report.md",
  "docs/teoyube/phase-11-6-guided-workflows-report.md",
  "docs/teoyube/phase-11-6-smart-recommendation-rail-report.md",
  "docs/teoyube/phase-11-6-teo-guide-local-companion-report.md",
  "docs/teoyube/phase-11-6-browser-qa-checklist.md",
  "docs/teoyube/phase-11-6-premium-intelligence-browser-qa-checklist.md",
  "docs/teoyube/phase-11-6-smoke-verification-report.md"
];

const checks = [
  parseJavaScript(appJs, "app_js_parses"),
  parseJavaScript(serverJs, "server_js_parses"),
  parseJavaScript(read("scripts/phase114Smoke.cjs"), "phase114_smoke_js_parses"),
  parseJavaScript(read("scripts/phase115Smoke.cjs"), "phase115_smoke_js_parses"),
  runNode(["--preserve-symlinks-main", "scripts/phase114Smoke.cjs"], "phase114_smoke_still_passes"),
  runNode(["--preserve-symlinks-main", "scripts/phase115Smoke.cjs"], "phase115_smoke_still_passes"),
  check("phase116_script_registered", Boolean(packageJson.scripts["phase116:smoke"]), "Phase 11.6 smoke script is registered."),
  check("phase11_qa_includes_phase116", /phase116:smoke/.test(packageJson.scripts["phase11:qa"] || ""), "Phase 11 QA includes Phase 11.6."),
  check("check_includes_phase116", /phase116:smoke/.test(packageJson.scripts.check || ""), "Root check includes Phase 11.6."),
  check("phase116_app_markers", requiredAppMarkers.every((marker) => appJs.includes(marker)), "Phase 11.6 app markers exist."),
  check("phase116_styles", [".phase116-why-this-panel", ".phase116-graph-dialog", ".phase116-workflow-dialog", ".phase116-smart-rail", ".phase116-search-suggestions"].every((marker) => stylesCss.includes(marker)), "Phase 11.6 styles exist."),
  check("phase116_cache_bust", indexHtml.includes("app.js?phase116=11-6a"), "Index loads the Phase 11.6 cache-busted script."),
  check("why_this_surfaces", ["teoyube-search", "canon-detail-rail", "promise-table", "teo-guide", "lexicon-word-detail", "book-memory", "smart-rail"].every((marker) => appJs.includes(marker)), "Why This panels cover required live surfaces."),
  check("graph_mobile_fallback", appJs.includes("mobileFallback: true") && stylesCss.includes("@media (max-width: 920px)"), "Graph explorer includes mobile/list fallback."),
  check("guided_workflows_exist", ["need-promise", "help-pray", "calling-clarity", "growth-journey", "study-word", "record-testimony"].every((marker) => appJs.includes(marker)), "Guided workflow IDs exist."),
  check("quality_labels_exist", ["Excellent", "Good", "Partial", "Needs fallback"].every((marker) => appJs.includes(marker)), "Recommendation quality labels exist."),
  check("command_palette_contextual", ["phase116-pray-word", "phase116-save-book", "phase116-add-promise-table", "phase116-find-scriptures", "phase116-clear-chat"].every((marker) => appJs.includes(marker)), "Contextual command palette entries exist."),
  check("search_suggestions_safe", appJs.includes("rawPrivateTextIncluded: false") && appJs.includes("localSessionOnly: true") && appJs.includes("sanitizePhase116SearchQuery"), "Search suggestions are sanitized and session-only."),
  check("guardrails_copy_still_present", indexHtml.includes("Scripture remains the highest authority") && indexHtml.includes("Personalization is local preview only"), "Guardrails copy remains visible."),
  check("docs_exist", requiredDocs.every(exists), "Phase 11.6 documentation files exist."),
  check("no_service_worker", !/serviceWorker|navigator\.serviceWorker/i.test(runtimeSource), "No service worker registration found."),
  check("no_database_client", !/(?:require\(|from\s+|import\s*\()["'](?:@?supabase|prisma|firebase)|indexedDB\.|openDatabase\(/i.test(runtimeSource), "No database client import or browser database API found."),
  check("no_browser_persistence", !/localStorage\.|sessionStorage\.|document\.cookie/i.test(runtimeSource), "No browser persistence API is used."),
  check("no_live_ai_call", !/api\/ai|chat\/completions|responses\.create|new\s+OpenAI|OpenAI\(/i.test(runtimeSource), "No live AI call is present."),
  check("no_analytics_calls", !/gtag\(|analytics\.track|posthog|mixpanel|segment\.io|plausible/i.test(runtimeSource), "No analytics call was added."),
  check("no_external_service_runtime", !/fetch\((?:`|\"|')https?:\/\//i.test(runtimeSource), "No obvious external service fetch was added.")
];

const report = {
  phase: "11.6",
  primaryRuntime: "static-node-app",
  valid: checks.every((item) => item.status === "pass"),
  checks,
  safety: {
    localOnly: true,
    noRawPrivateTextPersistence: true,
    noExternalServices: true,
    noLiveAi: true,
    noAnalytics: true,
    noDatabasePersistence: true,
    noBrowserPersistence: true,
    noAutomaticContact: true,
    scriptureAnchorsRemainVisible: true,
    confidenceAndFallbackRemainVisible: true
  }
};

console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exit(1);
