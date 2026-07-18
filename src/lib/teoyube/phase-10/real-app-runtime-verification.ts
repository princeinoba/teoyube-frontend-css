import type {
  TeoyubeRealAppRuntimeVerificationArea,
  TeoyubeRealAppRuntimeVerificationBlocker,
  TeoyubeRealAppRuntimeVerificationCheck,
  TeoyubeRealAppRuntimeVerificationDecision,
  TeoyubeRealAppRuntimeVerificationReport,
  TeoyubeRealAppRuntimeVerificationResult,
  TeoyubeRealAppRuntimeVerificationWarning
} from "./real-app-runtime-verification-contracts";

export type TeoyubeRealAppRuntimeVerificationInput = Partial<{
  projectRootIdentified: boolean;
  frameworkIdentified: boolean;
  packageScriptsIdentified: boolean;
  typecheckScriptAvailable: boolean;
  lintScriptAvailable: boolean;
  buildScriptAvailable: boolean;
  testScriptAvailable: boolean;
  routesInventoried: boolean;
  componentsInventoried: boolean;
  realDataFilesFound: boolean;
  appBuildPassed: boolean;
  routesRenderLocally: boolean;
  realDataLoads: boolean;
  blankScreenFound: boolean;
  obviousRuntimeCrashFound: boolean;
  debugPayloadVisible: boolean;
  safetyBoundariesIntact: boolean;
  projectRoot: string;
  framework: string;
  packageManager: string;
  results: TeoyubeRealAppRuntimeVerificationResult[];
}>;

function check(id: string, area: TeoyubeRealAppRuntimeVerificationArea, label: string, passed: boolean, details: string, required = true): TeoyubeRealAppRuntimeVerificationCheck {
  return { id, area, label, passed, required, details };
}

export function createRealAppRuntimeVerificationChecklist(input: TeoyubeRealAppRuntimeVerificationInput = {}): TeoyubeRealAppRuntimeVerificationCheck[] {
  return [
    check("project_root_identified", "project_root", "Project root identified", input.projectRootIdentified !== false, input.projectRoot || "teoyube-app"),
    check("framework_identified", "project_root", "Framework identified", input.frameworkIdentified !== false, input.framework || "Next.js App Router"),
    check("package_scripts_identified", "package_scripts", "Package scripts identified", input.packageScriptsIdentified !== false, "dev, build, and start are present; typecheck, lint, and test are missing."),
    check("typecheck_documented", "typecheck", "Typecheck command available or documented missing", input.typecheckScriptAvailable === true, "npm run typecheck is missing in teoyube-app/package.json.", false),
    check("lint_documented", "lint", "Lint command available or documented missing", input.lintScriptAvailable === true, "npm run lint is missing in teoyube-app/package.json.", false),
    check("build_command", "build", "Build command available", input.buildScriptAvailable !== false, "npm run build exists but cannot run until dependencies are installed."),
    check("test_documented", "test", "Test command available or documented missing", input.testScriptAvailable === true, "npm run test is missing in teoyube-app/package.json.", false),
    check("routes_inventoried", "route_rendering", "Routes inventoried", input.routesInventoried !== false, "App Router pages and API routes were inventoried."),
    check("components_inventoried", "component_rendering", "Core components inventoried", input.componentsInventoried !== false, "WordCard, PrayerCompanion, CompassExperience, TIG panels, and public notices were inventoried."),
    check("data_files_found", "data_loading", "Real data files found", input.realDataFilesFound !== false, "teoyube-app/data JSON and root src/data JSON were found and parsed."),
    check("app_build_passed", "build", "App can build", input.appBuildPassed === true, "Build is blocked because next is not installed locally."),
    check("routes_render_locally", "route_rendering", "Routes can render locally where possible", input.routesRenderLocally === true, "Local route rendering is blocked because next dev cannot start without dependencies."),
    check("real_data_can_load", "data_loading", "Real data can load", input.realDataLoads !== false, "JSON parse checks passed for app data and core Teoyube data."),
    check("no_blank_screen", "runtime_errors", "No blank-screen route found", !input.blankScreenFound, "No route was rendered because local runtime is blocked."),
    check("no_runtime_crash", "runtime_errors", "No obvious runtime crash found", !input.obviousRuntimeCrashFound, "No runtime crash was confirmed; runtime is blocked by missing dependencies."),
    check("no_debug_payload", "runtime_errors", "No debug payload visible to normal users", !input.debugPayloadVisible, "Legacy companion API debug payload was removed."),
    check("safety_boundaries", "service_disabled_state", "Safety boundaries remain intact", input.safetyBoundariesIntact !== false, "Scripture, explanation, fallback, confidence, privacy, and service-disabled boundaries remain protected.")
  ];
}

export function createRealAppRuntimeVerificationResult(input: TeoyubeRealAppRuntimeVerificationInput = {}): TeoyubeRealAppRuntimeVerificationResult[] {
  return input.results || [
    { id: "npm_typecheck", area: "typecheck", status: "not_run", command: "npm run typecheck", summary: "Missing script in teoyube-app/package.json." },
    { id: "npm_lint", area: "lint", status: "not_run", command: "npm run lint", summary: "Missing script in teoyube-app/package.json." },
    { id: "npm_build", area: "build", status: "blocked", command: "npm run build", summary: "Build script exists but fails because next is not installed in teoyube-app/node_modules.", files: ["teoyube-app/package.json"] },
    { id: "npm_test", area: "test", status: "not_run", command: "npm run test", summary: "Missing script in teoyube-app/package.json." },
    { id: "npm_dev", area: "route_rendering", status: "blocked", command: "npm run dev", summary: "Dev server cannot start because next is not installed in teoyube-app/node_modules.", files: ["teoyube-app/package.json"] }
  ];
}

export function getRealAppRuntimeVerificationBlockers(input: TeoyubeRealAppRuntimeVerificationInput = {}): TeoyubeRealAppRuntimeVerificationBlocker[] {
  return createRealAppRuntimeVerificationChecklist(input)
    .filter((entry) => entry.required && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details, requiredAction: "Install project dependencies and rerun the real app checks from teoyube-app." }));
}

export function getRealAppRuntimeVerificationWarnings(input: TeoyubeRealAppRuntimeVerificationInput = {}): TeoyubeRealAppRuntimeVerificationWarning[] {
  return createRealAppRuntimeVerificationChecklist(input)
    .filter((entry) => !entry.required && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }))
    .concat([
      { id: "local_only_verification", area: "project_root", message: "Phase 10.2 verification remains local-only and does not fetch public URLs or connect external services." }
    ]);
}

export function createRealAppRuntimeVerificationDecision(input: TeoyubeRealAppRuntimeVerificationInput = {}): TeoyubeRealAppRuntimeVerificationDecision {
  const blockers = getRealAppRuntimeVerificationBlockers(input);
  if (blockers.some((entry) => entry.area === "build")) return "blocked_by_build";
  if (blockers.some((entry) => entry.area === "route_rendering")) return "blocked_by_routes";
  if (blockers.some((entry) => entry.area === "data_loading")) return "blocked_by_data";
  if (blockers.some((entry) => entry.area === "service_disabled_state")) return "blocked_by_safety";
  if (blockers.length) return "blocked_by_runtime";
  return getRealAppRuntimeVerificationWarnings(input).length ? "ready_with_warnings" : "ready_for_deployment_readiness";
}

export function createRealAppRuntimeVerificationReport(input: TeoyubeRealAppRuntimeVerificationInput = {}): TeoyubeRealAppRuntimeVerificationReport {
  const blockers = getRealAppRuntimeVerificationBlockers(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : getRealAppRuntimeVerificationWarnings(input).length ? "passed_with_warnings" : "passed",
    decision: createRealAppRuntimeVerificationDecision(input),
    projectRoot: input.projectRoot || "teoyube-app",
    framework: input.framework || "Next.js App Router",
    packageManager: input.packageManager || "pnpm lockfile present; pnpm command unavailable; npm command available",
    checks: createRealAppRuntimeVerificationChecklist(input),
    results: createRealAppRuntimeVerificationResult(input),
    blockers,
    warnings: getRealAppRuntimeVerificationWarnings(input),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
