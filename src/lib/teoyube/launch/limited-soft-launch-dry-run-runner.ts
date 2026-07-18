import type {
  TeoyubeLimitedSoftLaunchDryRun,
  TeoyubeLimitedSoftLaunchDryRunBlocker,
  TeoyubeLimitedSoftLaunchDryRunDecision,
  TeoyubeLimitedSoftLaunchDryRunReport,
  TeoyubeLimitedSoftLaunchDryRunResult,
  TeoyubeLimitedSoftLaunchDryRunWarning
} from "./limited-soft-launch-dry-run-contracts";
import { getLimitedSoftLaunchDryRunScenarios } from "./limited-soft-launch-dry-run-scenarios";

export type TeoyubeLimitedSoftLaunchDryRunInput = Partial<
  Pick<TeoyubeLimitedSoftLaunchDryRun, "id" | "label" | "status" | "scenarios" | "stepResults" | "scenarioResults">
>;

export type TeoyubeLimitedSoftLaunchDryRunSummary = {
  scenarioCount: number;
  recordedScenarioCount: number;
  stepResultCount: number;
  criticalScenarioCount: number;
  passedCriticalScenarioCount: number;
  failedResultCount: number;
  warningResultCount: number;
};

function now(): string {
  return new Date().toISOString();
}

export function createLimitedSoftLaunchDryRun(input: TeoyubeLimitedSoftLaunchDryRunInput = {}): TeoyubeLimitedSoftLaunchDryRun {
  const timestamp = now();

  return {
    id: input.id || "limited_soft_launch_dry_run_3_2",
    label: input.label || "Soft Launch Preparation 3.2 - Soft Launch Dry Run & Owner Review",
    status: input.status || "ready",
    scenarios: input.scenarios || getLimitedSoftLaunchDryRunScenarios(),
    stepResults: input.stepResults || [],
    scenarioResults: input.scenarioResults || [],
    inMemoryOnly: true,
    sampleOnly: true,
    actualLaunchPerformed: false,
    usersContacted: false,
    realFeedbackCollected: false,
    previewUrlFetched: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    browserStorageWritten: false,
    fileWritten: false,
    generatedAt: timestamp,
    updatedAt: timestamp
  };
}

export function recordLimitedSoftLaunchDryRunStep(
  run: TeoyubeLimitedSoftLaunchDryRun,
  result: TeoyubeLimitedSoftLaunchDryRunResult
): TeoyubeLimitedSoftLaunchDryRun {
  return { ...run, stepResults: [...run.stepResults, result], updatedAt: now() };
}

export function recordLimitedSoftLaunchDryRunScenario(
  run: TeoyubeLimitedSoftLaunchDryRun,
  scenarioResult: TeoyubeLimitedSoftLaunchDryRunResult
): TeoyubeLimitedSoftLaunchDryRun {
  return { ...run, scenarioResults: [...run.scenarioResults, scenarioResult], updatedAt: now() };
}

export function summarizeLimitedSoftLaunchDryRun(run: TeoyubeLimitedSoftLaunchDryRun): TeoyubeLimitedSoftLaunchDryRunSummary {
  const criticalScenarios = run.scenarios.filter((entry) => entry.critical);
  const passedCriticalScenarioCount = criticalScenarios.filter((scenario) =>
    run.scenarioResults.some((result) => result.scenarioId === scenario.id && result.status === "pass")
  ).length;
  const allResults = [...run.stepResults, ...run.scenarioResults];

  return {
    scenarioCount: run.scenarios.length,
    recordedScenarioCount: run.scenarioResults.length,
    stepResultCount: run.stepResults.length,
    criticalScenarioCount: criticalScenarios.length,
    passedCriticalScenarioCount,
    failedResultCount: allResults.filter((entry) => entry.status === "fail").length,
    warningResultCount: allResults.filter((entry) => entry.status === "warning").length
  };
}

export function getLimitedSoftLaunchDryRunBlockers(run: TeoyubeLimitedSoftLaunchDryRun): TeoyubeLimitedSoftLaunchDryRunBlocker[] {
  const failedCriticalResults = [...run.stepResults, ...run.scenarioResults]
    .filter((entry) => entry.status === "fail" && entry.launchCritical)
    .map((entry) => ({
      id: `dry_run_failed_${entry.id}`,
      label: "Launch-critical dry run result failed",
      phase: entry.phase,
      reason: entry.summary,
      requiredAction: "Fix the dry run failure before continuing.",
      severity: "critical" as const
    }));
  const restrictedActionBlockers = [
    run.actualLaunchPerformed ? "Dry run must not perform an actual launch." : "",
    run.usersContacted ? "Dry run must not contact users." : "",
    run.realFeedbackCollected ? "Dry run must not collect real feedback." : "",
    run.previewUrlFetched ? "Dry run must not fetch preview URLs from code." : "",
    run.databaseWritten ? "Dry run must not write to a database." : "",
    run.analyticsSent ? "Dry run must not send analytics." : "",
    run.externalServicesCalled ? "Dry run must not call external services." : "",
    run.browserStorageWritten ? "Dry run must not write browser storage." : "",
    run.fileWritten ? "Dry run must not write files." : ""
  ].filter(Boolean).map((reason, index) => ({
    id: `dry_run_restricted_action_${index + 1}`,
    label: "Restricted dry run action attempted",
    phase: "preflight_rehearsal" as const,
    reason,
    requiredAction: "Remove restricted action before continuing.",
    severity: "critical" as const
  }));

  return [...failedCriticalResults, ...restrictedActionBlockers];
}

export function getLimitedSoftLaunchDryRunWarnings(run: TeoyubeLimitedSoftLaunchDryRun): TeoyubeLimitedSoftLaunchDryRunWarning[] {
  const summary = summarizeLimitedSoftLaunchDryRun(run);
  const warnings: TeoyubeLimitedSoftLaunchDryRunWarning[] = [
    {
      id: "dry_run_manual_owner_review_required",
      label: "Manual owner review required",
      phase: "owner_review",
      message: "Dry run output still requires owner review before any real users are invited.",
      recommendedAction: "Complete the structured owner review record."
    }
  ];

  if (summary.recordedScenarioCount < summary.scenarioCount) {
    warnings.push({
      id: "dry_run_scenarios_not_all_recorded",
      label: "Dry run scenarios not all recorded",
      phase: "completion_review",
      message: "Not every scenario has a recorded rehearsal result.",
      recommendedAction: "Record all required scenario results during owner dry run review."
    });
  }

  return warnings;
}

export function createLimitedSoftLaunchDryRunDecision(run: TeoyubeLimitedSoftLaunchDryRun): TeoyubeLimitedSoftLaunchDryRunDecision {
  const blockers = getLimitedSoftLaunchDryRunBlockers(run);

  if (blockers.some((entry) => /scripture|explanation|fallback|consent|privacy|analytics|persistence|live ai/i.test(entry.reason))) return "needs_safety_review";
  if (blockers.some((entry) => /runbook|preview url/i.test(entry.reason))) return "needs_runbook_fix";
  if (blockers.some((entry) => /surface|mobile|accessibility|qa/i.test(entry.reason))) return "needs_qa_review";
  if (blockers.length > 0) return "blocked";
  if (getLimitedSoftLaunchDryRunWarnings(run).some((entry) => entry.id === "dry_run_manual_owner_review_required")) return "ready_after_owner_review";
  return "ready_for_final_soft_launch_readiness_package";
}

export function createLimitedSoftLaunchDryRunReport(
  run: TeoyubeLimitedSoftLaunchDryRun = createLimitedSoftLaunchDryRun()
): TeoyubeLimitedSoftLaunchDryRunReport {
  const summary = summarizeLimitedSoftLaunchDryRun(run);
  const blockers = getLimitedSoftLaunchDryRunBlockers(run);
  const warnings = getLimitedSoftLaunchDryRunWarnings(run);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createLimitedSoftLaunchDryRunDecision(run),
    run,
    scenarioCount: summary.scenarioCount,
    recordedScenarioCount: summary.recordedScenarioCount,
    stepResultCount: summary.stepResultCount,
    criticalScenarioCount: summary.criticalScenarioCount,
    passedCriticalScenarioCount: summary.passedCriticalScenarioCount,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: now()
  };
}
