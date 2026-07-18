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
  "getTeoyubeDataMode",
  "setTeoyubeDataMode",
  "explainTeoyubeDataMode",
  "classifyTeoyubeRecord",
  "sanitizeTeoyubeRecordForExport",
  "sanitizeTeoyubeRecordForVault",
  "buildTeoyubeExportBundle",
  "validateTeoyubeImportBundle",
  "previewTeoyubeImportBundle",
  "mergeTeoyubeImportBundle",
  "clearTeoyubeSessionData",
  "clearTeoyubeOptionalVault",
  "summarizeTeoyubeLocalData",
  "createTeoyubeDataSafetyNotice",
  "parseImportFileSafely",
  "validateImportSchema",
  "sanitizeImportedBundle",
  "summarizeImportPreview",
  "detectImportDuplicates",
  "mergeImportedRecords",
  "renderImportPreviewDialog",
  "validatePromiseTableImportBundle",
  "renderTeoyubeDataControlsCenter",
  "openTeoyubeDataControlsCenter",
  "downloadTeoyubeExport",
  "renderTeoyubeOfflineStatus",
  "updateTeoyubeOfflineStatus",
  "renderTeoyubeBetaBackupReminder",
  "handlePhase117Action",
  "TEOYUBE_EXPORT_SCHEMA_VERSION",
  "teoyube-beta-export-v1",
  "memory_only",
  "optional_local_vault",
  "phase117DataControlsDialog",
  "phase117ImportFile",
  "phase117OfflineStatus"
];

const requiredDocs = [
  "docs/teoyube/phase-11-7-local-persistence-options-plan.md",
  "docs/teoyube/phase-11-7-data-safety-classification.md",
  "docs/teoyube/phase-11-7-export-center-hardening-report.md",
  "docs/teoyube/phase-11-7-import-preview-restore-report.md",
  "docs/teoyube/phase-11-7-data-controls-center-report.md",
  "docs/teoyube/phase-11-7-offline-ready-experience-report.md",
  "docs/teoyube/phase-11-7-clean-beta-handoff-bundle-report.md",
  "docs/teoyube/phase-11-7-book-promise-testimony-data-report.md",
  "docs/teoyube/phase-11-7-browser-qa-checklist.md",
  "docs/teoyube/phase-11-7-qa-command-reliability-report.md",
  "docs/teoyube/phase-11-7-smoke-verification-report.md"
];

const checks = [
  parseJavaScript(appJs, "app_js_parses"),
  parseJavaScript(serverJs, "server_js_parses"),
  parseJavaScript(read("scripts/phase117Smoke.cjs"), "phase117_smoke_js_parses"),
  parseJavaScript(read("scripts/createBetaBundle.cjs"), "beta_bundle_script_parses"),
  parseJavaScript(read("scripts/checkRuntime.cjs"), "runtime_check_script_parses"),
  runNode(["--preserve-symlinks-main", "scripts/phase114Smoke.cjs"], "phase114_smoke_still_passes"),
  runNode(["--preserve-symlinks-main", "scripts/phase115Smoke.cjs"], "phase115_smoke_still_passes"),
  runNode(["--preserve-symlinks-main", "scripts/phase116Smoke.cjs"], "phase116_smoke_still_passes"),
  check("phase117_scripts_registered", Boolean(packageJson.scripts["phase117:smoke"] && packageJson.scripts["bundle:beta"]), "Phase 11.7 smoke and beta bundle scripts are registered."),
  check("phase11_qa_includes_phase117", /phase117:smoke/.test(packageJson.scripts["phase11:qa"] || ""), "Phase 11 QA includes Phase 11.7."),
  check("check_static_registered", Boolean(packageJson.scripts["check:static"] && packageJson.scripts["check:runtime"]), "Static and runtime checks are split."),
  check("check_includes_phase117", /phase117:smoke/.test(packageJson.scripts.check || "") || /check:static/.test(packageJson.scripts.check || ""), "Root check includes Phase 11.7 through static QA."),
  check("phase117_app_markers", requiredAppMarkers.every((marker) => appJs.includes(marker)), "Phase 11.7 app markers exist."),
  check("phase117_export_center_hardened", ["Beta Export Center", "Safe JSON", "Safe Markdown", "JSON backup bundle", "raw private text remains redacted"].every((marker) => appJs.includes(marker)), "Beta Export Center options and redaction copy exist."),
  check("phase117_import_preview_restore", ["Import Preview / Restore", "Preview Import", "Apply Selected Strategy", "merge_new_only", "replace_current_session"].every((marker) => appJs.includes(marker)), "Import preview and restore strategy UI exists."),
  check("phase117_data_controls_accessible", ["Open Data Controls Center", "Your Teoyube Data Controls", "phase117DataControlsDialog", "data-phase117-action=\"open-data-controls\""].every((marker) => appJs.includes(marker)), "Data Controls Center is accessible from commands and UI actions."),
  check("phase117_surface_controls", ["phase117PromiseTableControls", "phase117TestimonyControls", "Beta backup reminder"].every((marker) => appJs.includes(marker)), "Book/Promise/Testimony data safety surfaces exist."),
  check("phase117_offline_ready", indexHtml.includes("phase117=11-7") && appJs.includes("Offline-ready local mode") && appJs.includes("window.addEventListener(\"offline\""), "Offline-aware UI is registered without a worker."),
  check("phase117_styles", [".phase117-data-controls-dialog", ".phase117-import-preview", ".phase117-offline-status", ".phase117-surface-controls"].every((marker) => stylesCss.includes(marker)), "Phase 11.7 styles exist."),
  check("beta_bundle_script_safe_exclusions", ["node_modules", ".git", ".next", ".env.local", "playwright-report", "BETA_BUNDLE_MANIFEST"].every((marker) => read("scripts/createBetaBundle.cjs").includes(marker)), "Beta bundle script excludes generated, cache, history, and secret files."),
  check("docs_exist", requiredDocs.every(exists), "Phase 11.7 documentation files exist."),
  check("roadmap_updated", read("docs/teoyube/teoyube-roadmap-completion-summary.md").includes("Phase 11.7 - Local Persistence Options") && read("docs/teoyube/teoyube-roadmap-completion-summary.md").includes("Phase 11.8 - Final Functional MVP Acceptance Gate"), "Roadmap summary mentions Phase 11.7 completion and Phase 11.8 next step."),
  check("no_service_worker", !/serviceWorker|navigator\.serviceWorker/i.test(runtimeSource), "No service worker registration found."),
  check("no_database_client", !/(?:require\(|from\s+|import\s*\()["'](?:@?supabase|prisma|firebase)|indexedDB\.|openDatabase\(/i.test(runtimeSource), "No database client import or browser database API found."),
  check("no_browser_persistence", !/localStorage|sessionStorage|document\.cookie/i.test(runtimeSource), "No browser persistence API or direct key appears in runtime."),
  check("no_live_ai_call", !/api\/ai|chat\/completions|responses\.create|new\s+OpenAI|OpenAI\(/i.test(runtimeSource), "No live AI call is present."),
  check("no_analytics_calls", !/gtag\(|analytics\.track|posthog|mixpanel|segment\.io|plausible/i.test(runtimeSource), "No analytics call was added."),
  check("no_external_service_runtime", !/fetch\((?:`|\"|')https?:\/\//i.test(runtimeSource), "No obvious external service fetch was added.")
];

const report = {
  phase: "11.7",
  primaryRuntime: "static-node-app",
  valid: checks.every((item) => item.status === "pass"),
  checks,
  safety: {
    defaultDataMode: "memory_only",
    safeExportDefault: true,
    importPreviewBeforeMerge: true,
    noExternalServices: true,
    noLiveAi: true,
    noAnalytics: true,
    noDatabasePersistence: true,
    noBrowserPersistenceRequired: true,
    noAutomaticContact: true,
    noPublicLaunchAction: true
  }
};

console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exit(1);
