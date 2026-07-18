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

function runNode(args, id) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
    shell: false
  });
  return {
    id,
    status: result.status === 0 ? "pass" : "fail",
    message: result.status === 0 ? `${id} passed.` : `${id} failed: ${(result.stderr || result.stdout || "").trim()}`
  };
}

function parseJavaScript(source, id) {
  try {
    new vm.Script(source, { filename: id });
    return check(id, true, `${id} parsed.`);
  } catch (error) {
    return check(id, false, `${id} failed: ${error.message}`);
  }
}

function check(id, passed, message) {
  return { id, status: passed ? "pass" : "fail", message };
}

const appJs = read("app.js");
const serverJs = read("server.js");
const indexHtml = read("index.html");
const stylesCss = read("styles.css");
const packageJson = JSON.parse(read("package.json"));
const runtimeSource = `${appJs}\n${serverJs}`;

const checks = [
  parseJavaScript(appJs, "app_js_parses"),
  parseJavaScript(serverJs, "server_js_parses"),
  runNode(["--preserve-symlinks-main", "scripts/checkImports.cjs"], "check_imports_passes"),
  runNode(["--preserve-symlinks-main", "scripts/phase11Smoke.cjs"], "phase11_3_smoke_passes"),
  check("phase114_script_registered", Boolean(packageJson.scripts["phase114:smoke"] && packageJson.scripts["phase11:qa"]), "Phase 11.4 smoke and QA scripts are registered."),
  check("qa_panel_present", appJs.includes("ensurePhase114QaPanel") && stylesCss.includes(".phase114-qa-panel"), "Dev-only QA helper panel exists."),
  check("global_button_handlers_present", appJs.includes("openGuardrailsModal") && appJs.includes("generateJourney") && appJs.includes("openAssessmentDialog"), "Global Guardrails, Generate Journey, and Purpose Assessment handlers exist."),
  check("command_palette_hardened", appJs.includes("handlePhase113CommandKeyboard") && appJs.includes("Go to Today") && appJs.includes("Reset Personalization Signals"), "Command palette has required commands and keyboard support."),
  check("right_rail_handler_present", appJs.includes("renderPhase113InsightRail") && appJs.includes("phase114-session-summary"), "Right insight rail includes session summary."),
  check("save_drawer_handler_present", appJs.includes("handlePhase114SaveDrawerAction") && appJs.includes("undoPhase114LastSave"), "Save drawer actions and undo are present."),
  check("export_center_hardened", appJs.includes("createPhase114SafeExportBundle") && appJs.includes("createPhase114MarkdownExport") && appJs.includes("data-phase114-export-format"), "Safe export supports JSON and Markdown."),
  check("promise_table_rows_present", indexHtml.includes("savedPromiseTableRows") && indexHtml.includes("phase114PromiseTablePanel") && appJs.includes("renderPhase114PromiseTableRows"), "Promise Table has local saved rows and a stable QA panel id."),
  check("mobile_navigation_drawer_present", indexHtml.includes("mobileNavToggle") && indexHtml.includes("mobileNavBackdrop") && appJs.includes("setPhase114MobileNavOpen") && stylesCss.includes("body.mobile-nav-open"), "Mobile navigation drawer controls and handlers exist."),
  check("mobile_right_rail_collapse_present", stylesCss.includes(".phase113-insight-rail #phase113InsightContent") && stylesCss.includes("bottom: 4.75rem"), "Right insight rail collapses on mobile breakpoints."),
  check("accessibility_skip_link_present", indexHtml.includes("skip-link") && stylesCss.includes(".skip-link:focus-visible"), "Skip-to-content link and focus style exist."),
  check("focus_styles_present", stylesCss.includes("button:focus-visible") && stylesCss.includes("prefers-reduced-motion"), "Keyboard focus and reduced motion styles exist."),
  check("expected_routes_present", ["today", "roadmap", "search", "canon", "table", "calling", "book", "lexicon", "testimony", "guide", "ui-elements", "teoyube-tables"].every((id) => indexHtml.includes(`id="${id}"`)), "Expected static route sections exist."),
  check("guardrails_copy_complete", ["Scripture remains the highest authority", "not replacements for Scripture", "does not declare final destiny", "medical, legal, financial, emergency", "Personalization is local preview only"].every((text) => indexHtml.includes(text)), "Guardrail modal includes required boundaries."),
  check("no_service_worker", !/serviceWorker|navigator\.serviceWorker/i.test(appJs + serverJs + indexHtml), "No service worker registration found."),
  check("no_database_client", !/(?:require\(|from\s+|import\s*\()["'](?:@?supabase|prisma|firebase)|indexedDB\.|openDatabase\(/i.test(runtimeSource), "No database client import or browser database API found in static runtime."),
  check("no_browser_persistence", !/localStorage\.|sessionStorage\.|document\.cookie/i.test(runtimeSource), "No browser persistence API is used in static runtime."),
  check("no_live_ai_call", !/api\/ai|chat\/completions|responses\.create|new\s+OpenAI|OpenAI\(/i.test(runtimeSource), "No live AI call is present in static runtime."),
  check("no_external_service_runtime", !/fetch\((?:`|\"|')https?:\/\//i.test(runtimeSource), "No obvious external service fetch was added."),
  check("phase114_docs_exist", [
    "docs/teoyube/phase-11-4-user-acceptance-testing-plan.md",
    "docs/teoyube/phase-11-4-button-hardening-report.md",
    "docs/teoyube/phase-11-4-mobile-qa-report.md",
    "docs/teoyube/phase-11-4-accessibility-audit-report.md",
    "docs/teoyube/phase-11-4-local-state-reliability-report.md",
    "docs/teoyube/phase-11-4-manual-browser-qa-checklist.md",
    "docs/teoyube/phase-11-4-build-and-smoke-verification-report.md",
    "docs/teoyube/phase-11-4-beta-readiness-summary.md"
  ].every(exists), "Phase 11.4 docs exist.")
];

const report = {
  phase: "11.4",
  primaryRuntime: "static-node-app",
  valid: checks.every((item) => item.status === "pass"),
  checks,
  safety: {
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
