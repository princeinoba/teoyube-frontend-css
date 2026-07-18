import type {
  TeoyubeSoftLaunchStabilizationRegressionBlocker,
  TeoyubeSoftLaunchStabilizationRegressionCheck,
  TeoyubeSoftLaunchStabilizationRegressionCheckType,
  TeoyubeSoftLaunchStabilizationRegressionDecision,
  TeoyubeSoftLaunchStabilizationRegressionReport,
  TeoyubeSoftLaunchStabilizationRegressionResult,
  TeoyubeSoftLaunchStabilizationRegressionRun,
  TeoyubeSoftLaunchStabilizationRegressionWarning
} from "./soft-launch-stabilization-regression-contracts";

export type CreateSoftLaunchStabilizationRegressionRunInput = {
  id?: string;
  label?: string;
  checks?: TeoyubeSoftLaunchStabilizationRegressionCheck[];
};

function now(): string {
  return new Date().toISOString();
}

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function check(
  type: TeoyubeSoftLaunchStabilizationRegressionCheckType,
  label: string,
  launchCritical = false,
  required = true
): TeoyubeSoftLaunchStabilizationRegressionCheck {
  return {
    id: normalizeId(`stabilization_${type}`),
    label,
    type,
    required,
    launchCritical,
    details: `${label} must be recorded manually after any safe fix release.`
  };
}

export function getDefaultSoftLaunchStabilizationRegressionChecks(): TeoyubeSoftLaunchStabilizationRegressionCheck[] {
  return [
    check("typecheck", "TypeScript check"),
    check("lint", "Lint check", false, false),
    check("build", "Build check"),
    check("test", "Test check", false, false),
    check("smoke_check", "Launch smoke checks", true),
    check("scripture_anchor", "Scripture anchor verification", true),
    check("explanation_path", "Explanation path verification", true),
    check("fallback", "Fallback verification", true),
    check("consent_privacy", "Consent/privacy verification", true),
    check("mobile_accessibility", "Mobile/accessibility verification", true),
    check("offline_fallback", "Offline fallback verification", true),
    check("debug_safety", "Debug safety verification", true),
    check("surface_qa", "Surface QA verification", true),
    check("feedback_intake", "Manual feedback intake verification", true)
  ];
}

export function createSoftLaunchStabilizationRegressionRun(
  input: CreateSoftLaunchStabilizationRegressionRunInput = {}
): TeoyubeSoftLaunchStabilizationRegressionRun {
  const createdAt = now();
  return {
    id: input.id || "soft_launch_stabilization_regression_run_4_4",
    label: input.label || "Soft Launch Stabilization Regression Run",
    checks: input.checks || getDefaultSoftLaunchStabilizationRegressionChecks(),
    results: [],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    previewUrlFetched: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordStabilizationRegressionResult(
  run: TeoyubeSoftLaunchStabilizationRegressionRun,
  result: Omit<TeoyubeSoftLaunchStabilizationRegressionResult, "id" | "checkedAt"> & {
    id?: string;
    checkedAt?: string;
  }
): TeoyubeSoftLaunchStabilizationRegressionRun {
  const normalized: TeoyubeSoftLaunchStabilizationRegressionResult = {
    ...result,
    id: result.id || normalizeId(`stabilization_regression_result_${result.checkId}`),
    checkedAt: result.checkedAt || now()
  };
  return {
    ...run,
    results: [...run.results.filter((entry) => entry.id !== normalized.id), normalized],
    updatedAt: now()
  };
}

export function recordStabilizationRegressionSkipped(
  run: TeoyubeSoftLaunchStabilizationRegressionRun,
  checkToSkip: TeoyubeSoftLaunchStabilizationRegressionCheck,
  reason: string
): TeoyubeSoftLaunchStabilizationRegressionRun {
  return recordStabilizationRegressionResult(run, {
    checkId: checkToSkip.id,
    type: checkToSkip.type,
    status: "not_applicable",
    summary: reason,
    required: checkToSkip.required,
    launchCritical: checkToSkip.launchCritical,
    relatedCandidateId: checkToSkip.relatedCandidateId,
    relatedFixResultId: checkToSkip.relatedFixResultId
  });
}

export function getStabilizationRegressionBlockers(
  run: TeoyubeSoftLaunchStabilizationRegressionRun
): TeoyubeSoftLaunchStabilizationRegressionBlocker[] {
  const failed = run.results
    .filter((result) => result.status === "fail" || result.status === "blocked")
    .map((result) => ({
      id: normalizeId(`stabilization_regression_blocker_${result.id}`),
      checkId: result.checkId,
      type: result.type,
      message: result.summary,
      requiredAction: "Fix or re-triage this regression before continuing the limited soft launch.",
      severity: result.launchCritical ? "critical" as const : "high" as const
    }));

  const missingRequired = run.checks
    .filter((entry) => entry.required)
    .filter((entry) => !run.results.some((result) => result.checkId === entry.id))
    .map((entry) => ({
      id: normalizeId(`stabilization_regression_missing_${entry.id}`),
      checkId: entry.id,
      type: entry.type,
      message: `${entry.label} has not been recorded.`,
      requiredAction: "Record this regression result before stabilization review.",
      severity: entry.launchCritical ? "critical" as const : "high" as const
    }));

  return [...failed, ...missingRequired];
}

export function getStabilizationRegressionWarnings(
  run: TeoyubeSoftLaunchStabilizationRegressionRun
): TeoyubeSoftLaunchStabilizationRegressionWarning[] {
  return run.results
    .filter((result) => result.status === "warning" || result.status === "not_run" || result.status === "not_applicable")
    .map((result) => ({
      id: normalizeId(`stabilization_regression_warning_${result.id}`),
      checkId: result.checkId,
      type: result.type,
      message: result.summary,
      recommendedAction: "Document the warning and confirm owner acceptance before expansion."
    }));
}

export function createStabilizationRegressionDecision(
  run: TeoyubeSoftLaunchStabilizationRegressionRun
): TeoyubeSoftLaunchStabilizationRegressionDecision {
  const blockers = getStabilizationRegressionBlockers(run);
  const warnings = getStabilizationRegressionWarnings(run);
  if (blockers.length > 0) return "blocked";
  if (run.results.some((result) => result.status === "not_run")) return "needs_more_testing";
  if (warnings.length > 0) return "stabilized_with_warnings";
  if (run.results.length > 0 && run.results.every((result) => result.status === "pass" || result.status === "not_applicable")) return "stabilized";
  return "unknown";
}

export function summarizeStabilizationRegressionRun(run: TeoyubeSoftLaunchStabilizationRegressionRun) {
  const blockers = getStabilizationRegressionBlockers(run);
  const warnings = getStabilizationRegressionWarnings(run);
  return {
    checkCount: run.checks.length,
    resultCount: run.results.length,
    passCount: run.results.filter((result) => result.status === "pass").length,
    warningCount: run.results.filter((result) => result.status === "warning").length,
    failCount: run.results.filter((result) => result.status === "fail").length,
    blockedCount: run.results.filter((result) => result.status === "blocked").length,
    notRunCount: run.results.filter((result) => result.status === "not_run").length,
    notApplicableCount: run.results.filter((result) => result.status === "not_applicable").length,
    blockers,
    warnings,
    noExternalWrite: run.inMemoryOnly && !run.fileWritten && !run.databaseWritten && !run.analyticsSent && !run.externalServicesCalled,
    noPreviewUrlFetched: !run.previewUrlFetched,
    generatedAt: now()
  };
}

export function createStabilizationRegressionReport(
  run: TeoyubeSoftLaunchStabilizationRegressionRun = createSoftLaunchStabilizationRegressionRun()
): TeoyubeSoftLaunchStabilizationRegressionReport {
  const summary = summarizeStabilizationRegressionRun(run);
  const decision = createStabilizationRegressionDecision(run);
  return {
    valid: summary.blockers.length === 0,
    ready: summary.blockers.length === 0 && ["stabilized", "stabilized_with_warnings"].includes(decision),
    decision,
    run,
    ...summary,
    noExternalWrite: true,
    noPreviewUrlFetched: true
  };
}
