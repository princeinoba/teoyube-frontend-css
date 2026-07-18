import { getManualPreviewRecheckChecklist } from "./manual-preview-recheck-checklist";
import type { TeoyubePostDeploymentQaSurface } from "./manual-preview-postdeployment-qa-contracts";
import type {
  TeoyubeManualPreviewRecheckBlocker,
  TeoyubeManualPreviewRecheckDecision,
  TeoyubeManualPreviewRecheckItem,
  TeoyubeManualPreviewRecheckReport,
  TeoyubeManualPreviewRecheckResult,
  TeoyubeManualPreviewRecheckRun,
  TeoyubeManualPreviewRecheckWarning
} from "./manual-preview-recheck-contracts";

export type TeoyubeManualPreviewRecheckRunInput = {
  label?: string;
  items?: TeoyubeManualPreviewRecheckItem[];
};

function now(): string {
  return new Date().toISOString();
}

function id(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function createManualPreviewRecheckRun(
  input: TeoyubeManualPreviewRecheckRunInput = {}
): TeoyubeManualPreviewRecheckRun {
  const createdAt = now();

  return {
    id: "manual_preview_recheck_run",
    label: input.label || "Manual Preview Deployment 2.5 Preview Re-Check Run",
    items: input.items || getManualPreviewRecheckChecklist(),
    results: [],
    inMemoryOnly: true,
    databaseWritten: false,
    analyticsSent: false,
    filesWritten: false,
    externalServicesCalled: false,
    previewUrlFetched: false,
    softLaunchPerformed: false,
    usersContacted: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordManualPreviewRecheckResult(
  run: TeoyubeManualPreviewRecheckRun,
  result: Omit<TeoyubeManualPreviewRecheckResult, "id" | "checkedAt"> & {
    id?: string;
    checkedAt?: string;
  }
): TeoyubeManualPreviewRecheckRun {
  const normalized: TeoyubeManualPreviewRecheckResult = {
    ...result,
    id: result.id || id(`manual_preview_recheck_result_${result.itemId}`),
    checkedAt: result.checkedAt || now()
  };

  return {
    ...run,
    results: [...run.results.filter((entry) => entry.id !== normalized.id), normalized],
    updatedAt: now()
  };
}

export function recordManualPreviewSurfaceRecheckResult(
  run: TeoyubeManualPreviewRecheckRun,
  surface: TeoyubePostDeploymentQaSurface,
  result: Omit<TeoyubeManualPreviewRecheckResult, "id" | "checkedAt" | "surface"> & {
    id?: string;
    checkedAt?: string;
  }
): TeoyubeManualPreviewRecheckRun {
  return recordManualPreviewRecheckResult(run, {
    ...result,
    surface
  });
}

export function getManualPreviewRecheckBlockers(
  run: TeoyubeManualPreviewRecheckRun
): TeoyubeManualPreviewRecheckBlocker[] {
  const failing = run.results
    .filter((result) => result.status === "fail" || result.status === "blocked")
    .map((result) => ({
      id: id(`manual_preview_recheck_blocker_${result.id}`),
      itemId: result.itemId,
      scope: result.scope,
      surface: result.surface,
      message: result.summary,
      requiredAction: "Resolve or document this re-check blocker before soft launch candidate confirmation.",
      severity: result.launchCritical ? "critical" as const : "high" as const
    }));
  const missing = run.items
    .filter((item) => item.required && item.launchCritical)
    .filter((item) => !run.results.some((result) => result.itemId === item.id))
    .map((item) => ({
      id: id(`manual_preview_recheck_missing_${item.id}`),
      itemId: item.id,
      scope: item.scope,
      surface: item.surface,
      message: `${item.label} has not been re-checked.`,
      requiredAction: "Record a manual re-check result before candidate confirmation.",
      severity: "critical" as const
    }));

  return [...failing, ...missing];
}

export function getManualPreviewRecheckWarnings(
  run: TeoyubeManualPreviewRecheckRun
): TeoyubeManualPreviewRecheckWarning[] {
  return run.results
    .filter((result) => result.status === "warning" || result.status === "not_run" || result.status === "unknown")
    .map((result) => ({
      id: id(`manual_preview_recheck_warning_${result.id}`),
      itemId: result.itemId,
      scope: result.scope,
      surface: result.surface,
      message: result.summary,
      recommendedAction: "Document owner review or rerun the manual re-check before soft launch preparation."
    }));
}

export function createManualPreviewRecheckDecision(
  run: TeoyubeManualPreviewRecheckRun
): TeoyubeManualPreviewRecheckDecision {
  const blockers = getManualPreviewRecheckBlockers(run);
  const warnings = getManualPreviewRecheckWarnings(run);

  if (blockers.some((entry) => entry.scope === "regression" || entry.message.toLowerCase().includes("regression"))) {
    return "blocked_by_regression";
  }
  if (blockers.some((entry) => entry.scope === "issue_resolution" || entry.message.toLowerCase().includes("issue"))) {
    return "blocked_by_unresolved_issue";
  }
  if (blockers.length > 0) return "needs_more_testing";
  if (warnings.length > 0) return "ready_after_manual_review";
  if (run.results.length > 0) return "ready_for_soft_launch_candidate_confirmation";

  return "unknown";
}

export function summarizeManualPreviewRecheckRun(run: TeoyubeManualPreviewRecheckRun) {
  const blockers = getManualPreviewRecheckBlockers(run);
  const warnings = getManualPreviewRecheckWarnings(run);

  return {
    itemCount: run.items.length,
    resultCount: run.results.length,
    passCount: run.results.filter((result) => result.status === "pass").length,
    warningCount: run.results.filter((result) => result.status === "warning").length,
    failCount: run.results.filter((result) => result.status === "fail").length,
    blockerCount: blockers.length,
    notRunCount: run.results.filter((result) => result.status === "not_run").length,
    blockers,
    warnings,
    noExternalWrite: run.inMemoryOnly && !run.databaseWritten && !run.analyticsSent && !run.filesWritten && !run.externalServicesCalled,
    noPreviewUrlFetched: !run.previewUrlFetched,
    noSoftLaunchPerformed: !run.softLaunchPerformed && !run.usersContacted,
    generatedAt: now()
  };
}

export function createManualPreviewRecheckReport(run: TeoyubeManualPreviewRecheckRun): TeoyubeManualPreviewRecheckReport {
  const summary = summarizeManualPreviewRecheckRun(run);

  return {
    valid: summary.blockers.length === 0,
    decision: createManualPreviewRecheckDecision(run),
    run,
    ...summary,
    noExternalWrite: true,
    noPreviewUrlFetched: true,
    noSoftLaunchPerformed: true
  };
}
