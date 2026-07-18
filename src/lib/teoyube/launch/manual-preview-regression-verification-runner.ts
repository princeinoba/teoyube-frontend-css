import type {
  TeoyubeManualPreviewRegressionBlocker,
  TeoyubeManualPreviewRegressionCheck,
  TeoyubeManualPreviewRegressionCheckStatus,
  TeoyubeManualPreviewRegressionDecision,
  TeoyubeManualPreviewRegressionReport,
  TeoyubeManualPreviewRegressionResult,
  TeoyubeManualPreviewRegressionRun,
  TeoyubeManualPreviewRegressionWarning
} from "./manual-preview-regression-verification-contracts";
import type { TeoyubeManualPreviewSafeFixResult } from "./manual-preview-safe-fix-contracts";

type CreateRegressionRunInput = {
  label?: string;
  checks?: TeoyubeManualPreviewRegressionCheck[];
  fixResults?: TeoyubeManualPreviewSafeFixResult[];
};

function now(): string {
  return new Date().toISOString();
}

function normalizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function createManualPreviewRegressionRun(
  input: CreateRegressionRunInput = {}
): TeoyubeManualPreviewRegressionRun {
  const createdAt = now();

  return {
    id: "manual_preview_regression_run",
    label: input.label || "Manual Preview Deployment 2.4 Regression Verification Run",
    checks: input.checks || [],
    results: [],
    fixResults: input.fixResults || [],
    inMemoryOnly: true,
    databaseWritten: false,
    analyticsSent: false,
    filesWritten: false,
    externalServicesCalled: false,
    previewUrlFetched: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordManualPreviewRegressionResult(
  run: TeoyubeManualPreviewRegressionRun,
  result: Omit<TeoyubeManualPreviewRegressionResult, "id" | "checkedAt"> & {
    id?: string;
    checkedAt?: string;
  }
): TeoyubeManualPreviewRegressionRun {
  const normalized: TeoyubeManualPreviewRegressionResult = {
    ...result,
    id: result.id || normalizeId(`manual_preview_regression_result_${result.checkId}`),
    checkedAt: result.checkedAt || now()
  };

  return {
    ...run,
    results: [...run.results.filter((entry) => entry.id !== normalized.id), normalized],
    updatedAt: now()
  };
}

export function recordManualPreviewRegressionSkipped(
  run: TeoyubeManualPreviewRegressionRun,
  check: TeoyubeManualPreviewRegressionCheck,
  reason: string
): TeoyubeManualPreviewRegressionRun {
  return recordManualPreviewRegressionResult(run, {
    checkId: check.id,
    type: check.type,
    status: "skipped",
    summary: reason,
    required: check.required,
    launchCritical: check.launchCritical,
    relatedIssueId: check.relatedIssueId,
    relatedFixResultId: check.relatedFixResultId
  });
}

export function getManualPreviewRegressionBlockers(
  run: TeoyubeManualPreviewRegressionRun
): TeoyubeManualPreviewRegressionBlocker[] {
  const failedResults = run.results
    .filter((result) => result.status === "fail" || result.status === "blocked")
    .map((result) => ({
      id: normalizeId(`manual_preview_regression_blocker_${result.id}`),
      checkId: result.checkId,
      type: result.type,
      message: result.summary,
      requiredAction: "Fix the regression or re-triage the issue before preview re-check.",
      severity: result.launchCritical ? "critical" as const : "high" as const
    }));

  const missingRequiredResults = run.checks
    .filter((check) => check.required)
    .filter((check) => !run.results.some((result) => result.checkId === check.id))
    .map((check) => ({
      id: normalizeId(`manual_preview_regression_missing_${check.id}`),
      checkId: check.id,
      type: check.type,
      message: `${check.label} has not been recorded.`,
      requiredAction: "Record this regression result before preview re-check.",
      severity: check.launchCritical ? "critical" as const : "high" as const
    }));

  return [...failedResults, ...missingRequiredResults];
}

export function getManualPreviewRegressionWarnings(
  run: TeoyubeManualPreviewRegressionRun
): TeoyubeManualPreviewRegressionWarning[] {
  return run.results
    .filter((result) => result.status === "warning" || result.status === "skipped" || result.status === "not_run")
    .map((result) => ({
      id: normalizeId(`manual_preview_regression_warning_${result.id}`),
      checkId: result.checkId,
      type: result.type,
      message: result.summary,
      recommendedAction: "Document the warning and confirm owner acceptance before preview re-check."
    }));
}

export function createManualPreviewRegressionDecision(
  run: TeoyubeManualPreviewRegressionRun
): TeoyubeManualPreviewRegressionDecision {
  const blockers = getManualPreviewRegressionBlockers(run);
  const warnings = getManualPreviewRegressionWarnings(run);

  if (run.checks.length === 0 && run.results.length === 0) return "not_run";
  if (blockers.length > 0) return "blocked";
  if (run.results.some((result) => result.status === "not_run" || result.status === "skipped")) return "needs_more_testing";
  if (warnings.length > 0) return "verified_with_warnings";
  if (run.results.length > 0 && run.results.every((result) => result.status === "pass")) return "verified";

  return "unknown";
}

export function summarizeManualPreviewRegressionRun(run: TeoyubeManualPreviewRegressionRun) {
  const blockers = getManualPreviewRegressionBlockers(run);
  const warnings = getManualPreviewRegressionWarnings(run);

  return {
    checkCount: run.checks.length,
    resultCount: run.results.length,
    passCount: run.results.filter((result) => result.status === "pass").length,
    warningCount: run.results.filter((result) => result.status === "warning").length,
    failCount: run.results.filter((result) => result.status === "fail").length,
    blockedCount: run.results.filter((result) => result.status === "blocked").length,
    skippedCount: run.results.filter((result) => result.status === "skipped").length,
    notRunCount: run.results.filter((result) => result.status === "not_run").length,
    blockers,
    warnings,
    noExternalWrite: run.inMemoryOnly && !run.databaseWritten && !run.analyticsSent && !run.filesWritten && !run.externalServicesCalled,
    noPreviewUrlFetched: !run.previewUrlFetched,
    generatedAt: now()
  };
}

export function createManualPreviewRegressionReport(
  run: TeoyubeManualPreviewRegressionRun
): TeoyubeManualPreviewRegressionReport {
  const summary = summarizeManualPreviewRegressionRun(run);
  const decision = createManualPreviewRegressionDecision(run);

  return {
    valid: summary.blockers.length === 0,
    decision,
    run,
    ...summary,
    noExternalWrite: true,
    noPreviewUrlFetched: true
  };
}

export function isPassingRegressionStatus(status: TeoyubeManualPreviewRegressionCheckStatus): boolean {
  return status === "pass" || status === "warning";
}
