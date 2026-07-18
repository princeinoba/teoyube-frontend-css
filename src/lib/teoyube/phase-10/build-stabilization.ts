import type {
  TeoyubeBuildStabilizationArea,
  TeoyubeBuildStabilizationBlocker,
  TeoyubeBuildStabilizationCheck,
  TeoyubeBuildStabilizationDecision,
  TeoyubeBuildStabilizationPatch,
  TeoyubeBuildStabilizationReport,
  TeoyubeBuildStabilizationStatus,
  TeoyubeBuildStabilizationWarning
} from "./build-stabilization-contracts";

export type TeoyubeBuildStabilizationInput = Partial<{
  dependenciesInstalled: boolean;
  nextAvailable: boolean;
  typecheckScriptAvailable: boolean;
  lintScriptAvailable: boolean;
  testScriptAvailable: boolean;
  buildPassed: boolean;
  runtimePassed: boolean;
  patches: TeoyubeBuildStabilizationPatch[];
}>;

function check(id: string, area: TeoyubeBuildStabilizationArea, label: string, status: TeoyubeBuildStabilizationStatus, details: string): TeoyubeBuildStabilizationCheck {
  return { id, area, label, status, details };
}

export function createBuildStabilizationChecklist(input: TeoyubeBuildStabilizationInput = {}): TeoyubeBuildStabilizationCheck[] {
  return [
    check("dependencies", "package_scripts", "Dependencies installed", input.dependenciesInstalled ? "passed" : "blocked", "teoyube-app/node_modules is absent."),
    check("next_available", "framework_config", "Next binary available", input.nextAvailable ? "passed" : "blocked", "next is not recognized by npm run build/dev."),
    check("typecheck_script", "typescript", "Typecheck script available", input.typecheckScriptAvailable ? "passed" : "not_run", "npm run typecheck is missing."),
    check("lint_script", "eslint", "Lint script available", input.lintScriptAvailable ? "passed" : "not_run", "npm run lint is missing."),
    check("test_script", "tests", "Test script available", input.testScriptAvailable ? "passed" : "not_run", "npm run test is missing."),
    check("build", "build", "Build passes", input.buildPassed ? "passed" : "blocked", "Build is blocked until dependencies are installed."),
    check("runtime", "runtime", "Runtime starts", input.runtimePassed ? "passed" : "blocked", "Runtime is blocked until next dev can start.")
  ];
}

export function createBuildStabilizationPatchRecord(input: TeoyubeBuildStabilizationPatch): TeoyubeBuildStabilizationPatch {
  return input;
}

export function recordBuildStabilizationPatch(records: TeoyubeBuildStabilizationPatch[], patch: TeoyubeBuildStabilizationPatch): TeoyubeBuildStabilizationPatch[] {
  return [...records.filter((entry) => entry.id !== patch.id), patch];
}

function defaultPatches(): TeoyubeBuildStabilizationPatch[] {
  return [
    createBuildStabilizationPatchRecord({
      id: "gate_youtube_lookup",
      area: "runtime",
      file: "teoyube-app/lib/youtube.ts",
      summary: "Added TEOYUBE_ENABLE_YOUTUBE_LOOKUP gate so local verification cannot call YouTube unless explicitly enabled later.",
      safetyImpact: "Preserves no external service/public URL fetching boundary for Phase 10.2."
    }),
    createBuildStabilizationPatchRecord({
      id: "hide_ai_companion_debug_payload",
      area: "route_files",
      file: "teoyube-app/app/api/ai/companion/route.ts",
      summary: "Removed the internal production object from the normal API response while keeping Scripture, explanation, confidence, fallback, and safety fields.",
      safetyImpact: "Hides debug-only payload from normal API consumers."
    })
  ];
}

export function getBuildStabilizationBlockers(input: TeoyubeBuildStabilizationInput = {}): TeoyubeBuildStabilizationBlocker[] {
  return createBuildStabilizationChecklist(input)
    .filter((entry) => entry.status === "blocked")
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details }));
}

export function getBuildStabilizationWarnings(input: TeoyubeBuildStabilizationInput = {}): TeoyubeBuildStabilizationWarning[] {
  return createBuildStabilizationChecklist(input)
    .filter((entry) => entry.status === "not_run" || entry.status === "warning")
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
}

export function createBuildStabilizationDecision(input: TeoyubeBuildStabilizationInput = {}): TeoyubeBuildStabilizationDecision {
  const blockers = getBuildStabilizationBlockers(input);
  if (blockers.some((entry) => entry.id === "dependencies_blocker" || entry.id === "next_available_blocker")) return "blocked_by_dependencies";
  if (blockers.length) return "blocked_by_build";
  return getBuildStabilizationWarnings(input).length ? "ready_with_warnings" : "build_stabilized";
}

export function createBuildStabilizationReport(input: TeoyubeBuildStabilizationInput = {}): TeoyubeBuildStabilizationReport {
  const blockers = getBuildStabilizationBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createBuildStabilizationDecision(input),
    checks: createBuildStabilizationChecklist(input),
    patches: input.patches || defaultPatches(),
    blockers,
    warnings: getBuildStabilizationWarnings(input),
    noExternalServicesRequired: true,
    noPublicLaunchPerformed: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
