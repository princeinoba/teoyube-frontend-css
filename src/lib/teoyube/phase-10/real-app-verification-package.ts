import { createBuildStabilizationReport } from "./build-stabilization";
import { createComponentRenderVerificationReport } from "./component-render-verification";
import { createDataLoadingVerificationReport } from "./data-loading-verification";
import { createRealAppRuntimeVerificationReport } from "./real-app-runtime-verification";
import { createRouteQaReport } from "./route-qa";

export type TeoyubeRealAppVerificationPackageDecision =
  | "ready_for_deployment_readiness"
  | "blocked_by_build"
  | "blocked_by_runtime"
  | "ready_with_warnings";

export type TeoyubeRealAppVerificationCommandResult = {
  command: string;
  cwd: string;
  status: "passed" | "failed" | "missing_script" | "blocked";
  summary: string;
};

export type TeoyubeRealAppVerificationPackage = {
  id: string;
  runtimeVerificationReport: ReturnType<typeof createRealAppRuntimeVerificationReport>;
  routeQaReport: ReturnType<typeof createRouteQaReport>;
  dataLoadingVerificationReport: ReturnType<typeof createDataLoadingVerificationReport>;
  componentRenderVerificationReport: ReturnType<typeof createComponentRenderVerificationReport>;
  buildStabilizationReport: ReturnType<typeof createBuildStabilizationReport>;
  commandResults: TeoyubeRealAppVerificationCommandResult[];
  safePatchSummary: string[];
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Fix dependency/build blockers before Phase 10.3.";
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function defaultCommandResults(): TeoyubeRealAppVerificationCommandResult[] {
  const cwd = "teoyube-app";
  return [
    { command: "npm run typecheck", cwd, status: "missing_script", summary: "Missing script in teoyube-app/package.json." },
    { command: "npm run lint", cwd, status: "missing_script", summary: "Missing script in teoyube-app/package.json." },
    { command: "npm run build", cwd, status: "blocked", summary: "Build script exists but fails because next is not installed locally." },
    { command: "npm run test", cwd, status: "missing_script", summary: "Missing script in teoyube-app/package.json." },
    { command: "npm run dev", cwd, status: "blocked", summary: "Dev server cannot start because next is not installed locally." }
  ];
}

function collectStrings(entries: unknown[]): string[] {
  return entries.map((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") {
      const record = entry as Record<string, unknown>;
      return String(record.message || record.summary || record.details || record.id || "Phase 10.2 item needs attention.");
    }
    return "Phase 10.2 item needs attention.";
  });
}

export function createRealAppVerificationPackage(input: { commandResults?: TeoyubeRealAppVerificationCommandResult[] } = {}): TeoyubeRealAppVerificationPackage {
  const runtimeVerificationReport = createRealAppRuntimeVerificationReport();
  const routeQaReport = createRouteQaReport();
  const dataLoadingVerificationReport = createDataLoadingVerificationReport();
  const componentRenderVerificationReport = createComponentRenderVerificationReport();
  const buildStabilizationReport = createBuildStabilizationReport();
  const commandResults = input.commandResults || defaultCommandResults();
  const blockers = [
    ...collectStrings(runtimeVerificationReport.blockers),
    ...collectStrings(routeQaReport.blockers),
    ...collectStrings(dataLoadingVerificationReport.blockers),
    ...collectStrings(componentRenderVerificationReport.blockers),
    ...collectStrings(buildStabilizationReport.blockers)
  ];
  const warnings = [
    ...collectStrings(runtimeVerificationReport.warnings),
    ...collectStrings(routeQaReport.warnings),
    ...collectStrings(dataLoadingVerificationReport.warnings),
    ...collectStrings(componentRenderVerificationReport.warnings),
    ...collectStrings(buildStabilizationReport.warnings)
  ];
  return {
    id: "phase_10_2_real_app_verification_package",
    runtimeVerificationReport,
    routeQaReport,
    dataLoadingVerificationReport,
    componentRenderVerificationReport,
    buildStabilizationReport,
    commandResults,
    safePatchSummary: buildStabilizationReport.patches.map((entry) => `${entry.file}: ${entry.summary}`),
    blockers,
    warnings,
    nextActionRecommendation: "Fix dependency/build blockers before Phase 10.3.",
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getRealAppVerificationPackageBlockers(pkg: TeoyubeRealAppVerificationPackage): string[] {
  return pkg.blockers;
}

export function getRealAppVerificationPackageWarnings(pkg: TeoyubeRealAppVerificationPackage): string[] {
  return pkg.warnings;
}

export function createRealAppVerificationPackageDecision(pkg: TeoyubeRealAppVerificationPackage): TeoyubeRealAppVerificationPackageDecision {
  if (pkg.buildStabilizationReport.decision === "blocked_by_dependencies" || pkg.runtimeVerificationReport.decision === "blocked_by_build") return "blocked_by_build";
  if (pkg.runtimeVerificationReport.decision === "blocked_by_routes" || pkg.routeQaReport.decision === "not_run") return "blocked_by_runtime";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_deployment_readiness";
}

export function validateRealAppVerificationPackage(pkg: TeoyubeRealAppVerificationPackage): boolean {
  return getRealAppVerificationPackageBlockers(pkg).length === 0;
}

export function createRealAppVerificationPackageReport(pkg: TeoyubeRealAppVerificationPackage) {
  return {
    valid: validateRealAppVerificationPackage(pkg),
    decision: createRealAppVerificationPackageDecision(pkg),
    package: pkg,
    blockers: getRealAppVerificationPackageBlockers(pkg),
    warnings: getRealAppVerificationPackageWarnings(pkg),
    nextActionRecommendation: pkg.nextActionRecommendation,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
