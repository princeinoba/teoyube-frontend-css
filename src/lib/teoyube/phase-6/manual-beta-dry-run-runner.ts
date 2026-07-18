import type {
  TeoyubeManualBetaDryRun,
  TeoyubeManualBetaDryRunArea,
  TeoyubeManualBetaDryRunBlocker,
  TeoyubeManualBetaDryRunDecision,
  TeoyubeManualBetaDryRunEvidence,
  TeoyubeManualBetaDryRunReport,
  TeoyubeManualBetaDryRunResult,
  TeoyubeManualBetaDryRunStatus,
  TeoyubeManualBetaDryRunWarning
} from "./manual-beta-dry-run-contracts";
import { getManualBetaDryRunScenarios } from "./manual-beta-dry-run-scenarios";

export type TeoyubeManualBetaDryRunInput = Partial<{
  id: string;
  results: TeoyubeManualBetaDryRunResult[];
  evidence: TeoyubeManualBetaDryRunEvidence[];
}>;

function now(): string {
  return new Date().toISOString();
}

function evidence(id: string, area: TeoyubeManualBetaDryRunArea, label: string, status: TeoyubeManualBetaDryRunEvidence["status"], details: string): TeoyubeManualBetaDryRunEvidence {
  return { id, area, label, status, details };
}

export function createManualBetaDryRun(input: TeoyubeManualBetaDryRunInput = {}): TeoyubeManualBetaDryRun {
  const createdAt = now();
  return {
    id: input.id || "phase_6_2_manual_beta_dry_run",
    status: "not_started",
    scenarios: getManualBetaDryRunScenarios(),
    results: input.results || [],
    evidence: input.evidence || [
      evidence("dry_run_manual_only", "execution_plan", "Dry run remains manual", "confirmed", "No beta launch, contact, URL fetching, analytics, or service connection is performed."),
      evidence("dry_run_service_disabled", "service_disabled_state", "Services remain disabled", "confirmed", "Disabled-service boundaries from Phase 6.1 remain in force."),
      evidence("dry_run_privacy", "privacy_consent", "Privacy reminder included", "confirmed", "Participants are reminded not to submit sensitive information.")
    ],
    manualOnly: true,
    simulatedOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordManualBetaDryRunStepResult(run: TeoyubeManualBetaDryRun, result: Omit<TeoyubeManualBetaDryRunResult, "id" | "simulatedOnly" | "recordedAt"> & { id?: string }): TeoyubeManualBetaDryRun {
  return {
    ...run,
    status: "in_progress",
    results: [
      ...run.results,
      {
        ...result,
        id: result.id || `dry_run_result_${run.results.length + 1}`,
        simulatedOnly: true,
        recordedAt: now()
      }
    ],
    updatedAt: now()
  };
}

export function recordManualBetaDryRunAreaResult(
  run: TeoyubeManualBetaDryRun,
  area: TeoyubeManualBetaDryRunArea,
  result: Omit<TeoyubeManualBetaDryRunResult, "id" | "area" | "scenarioId" | "simulatedOnly" | "recordedAt"> & { id?: string; scenarioId?: string }
): TeoyubeManualBetaDryRun {
  return recordManualBetaDryRunStepResult(run, {
    ...result,
    scenarioId: result.scenarioId || `area_${area}`,
    area
  });
}

export function summarizeManualBetaDryRun(run: TeoyubeManualBetaDryRun) {
  return {
    scenarioCount: run.scenarios.length,
    resultCount: run.results.length,
    passedCount: run.results.filter((entry) => entry.status === "passed").length,
    warningCount: run.results.filter((entry) => entry.status === "warning").length,
    blockedCount: run.results.filter((entry) => entry.status === "blocked").length
  };
}

export function getManualBetaDryRunBlockers(run: TeoyubeManualBetaDryRun): TeoyubeManualBetaDryRunBlocker[] {
  return [
    ...run.results
      .filter((entry) => entry.status === "blocked")
      .map((entry) => ({
        id: `${entry.id}_blocker`,
        area: entry.area,
        message: `Dry-run result blocked: ${entry.notes}`,
        requiredAction: "Triage this simulated issue before Phase 6.3 stabilization."
      })),
    ...run.evidence
      .filter((entry) => entry.status === "blocked")
      .map((entry) => ({
        id: `${entry.id}_blocker`,
        area: entry.area,
        message: `${entry.label}: ${entry.details}`,
        requiredAction: "Resolve or triage blocked evidence before continuing."
      })),
    ...(!run.manualOnly || !run.simulatedOnly || !run.inMemoryOnly ? [{
      id: "dry_run_boundary_violation",
      area: "execution_plan" as const,
      message: "Dry run must remain manual, simulated, and in-memory only.",
      requiredAction: "Restore dry-run boundaries."
    }] : [])
  ];
}

export function getManualBetaDryRunWarnings(run: TeoyubeManualBetaDryRun): TeoyubeManualBetaDryRunWarning[] {
  return [
    ...run.results
      .filter((entry) => entry.status === "warning")
      .map((entry) => ({
        id: `${entry.id}_warning`,
        area: entry.area,
        message: `Dry-run warning: ${entry.notes}`,
        recommendedAction: "Review during owner dry-run review."
      })),
    ...(!run.results.length ? [{
      id: "dry_run_no_step_results",
      area: "execution_plan" as const,
      message: "No dry-run step results have been recorded.",
      recommendedAction: "Use default simulated pass results in the example or record manual step observations."
    }] : [])
  ];
}

export function createManualBetaDryRunDecision(run: TeoyubeManualBetaDryRun): TeoyubeManualBetaDryRunDecision {
  const blockers = getManualBetaDryRunBlockers(run);
  const warnings = getManualBetaDryRunWarnings(run);
  if (blockers.length) return "dry_run_blocked";
  if (run.results.some((entry) => entry.area === "issue_intake" && entry.status !== "passed")) return "needs_issue_triage";
  if (!run.results.length) return "needs_owner_review";
  return warnings.length ? "dry_run_passed_with_warnings" : "dry_run_passed";
}

function statusFromDecision(decision: TeoyubeManualBetaDryRunDecision): TeoyubeManualBetaDryRunStatus {
  if (decision === "dry_run_passed") return "passed";
  if (decision === "dry_run_passed_with_warnings") return "passed_with_warnings";
  if (decision === "dry_run_blocked") return "blocked";
  if (decision === "needs_issue_triage" || decision === "needs_owner_review") return "needs_review";
  return "unknown";
}

export function createManualBetaDryRunReport(run: TeoyubeManualBetaDryRun): TeoyubeManualBetaDryRunReport {
  const blockers = getManualBetaDryRunBlockers(run);
  const warnings = getManualBetaDryRunWarnings(run);
  const decision = createManualBetaDryRunDecision(run);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    run,
    summary: summarizeManualBetaDryRun(run),
    blockers,
    warnings,
    manualOnly: true,
    simulatedOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

