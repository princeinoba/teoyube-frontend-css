import { getManualBetaQaScenarios } from "./manual-beta-qa-execution-plan";
import type {
  TeoyubeManualBetaQaExecutionArea,
  TeoyubeManualBetaQaExecutionBlocker,
  TeoyubeManualBetaQaExecutionDecision,
  TeoyubeManualBetaQaExecutionReport,
  TeoyubeManualBetaQaExecutionResult,
  TeoyubeManualBetaQaExecutionRun,
  TeoyubeManualBetaQaExecutionScenario,
  TeoyubeManualBetaQaExecutionStatus,
  TeoyubeManualBetaQaExecutionSurface,
  TeoyubeManualBetaQaExecutionWarning
} from "./manual-beta-qa-execution-contracts";

function surfaceForArea(area: TeoyubeManualBetaQaExecutionArea): TeoyubeManualBetaQaExecutionSurface {
  if (area === "word_card") return "word_card";
  if (area === "promise_table") return "promise_table";
  if (area === "prayer_companion") return "prayer_companion";
  if (area === "compass_experience") return "compass_experience";
  if (area === "tig_response_panel") return "tig_response_panel";
  if (area === "tig_graph_explorer") return "tig_graph_explorer";
  if (area === "reviewed_content_gate") return "reviewed_content_gate";
  if (area === "controlled_admin_prototype") return "controlled_admin_prototype";
  if (area === "user_journey") return "home";
  return "unknown";
}

function defaultScenarios(): TeoyubeManualBetaQaExecutionScenario[] {
  return getManualBetaQaScenarios().map((scenario) => ({
    id: scenario.id,
    area: scenario.area as TeoyubeManualBetaQaExecutionArea,
    surface: surfaceForArea(scenario.area as TeoyubeManualBetaQaExecutionArea),
    title: scenario.title,
    critical: scenario.critical,
    expectedResult: scenario.expectedResult
  }));
}

function now(): string {
  return new Date().toISOString();
}

export function createManualBetaQaExecutionRun(input: {
  id?: string;
  scenarios?: TeoyubeManualBetaQaExecutionScenario[];
  results?: TeoyubeManualBetaQaExecutionResult[];
} = {}): TeoyubeManualBetaQaExecutionRun {
  const createdAt = now();
  return {
    id: input.id || "phase_5_2_manual_beta_qa_execution_run",
    status: input.results?.length ? "in_progress" : "not_started",
    scenarios: input.scenarios || defaultScenarios(),
    results: input.results || [],
    manualOnly: true,
    inMemoryOnly: true,
    noPublicUrlFetching: true,
    noUsersContacted: true,
    noAnalyticsSent: true,
    noQaRunsPersisted: true,
    noFilesWritten: true,
    noExternalServicesConnected: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordManualBetaQaScenarioResult(
  run: TeoyubeManualBetaQaExecutionRun,
  result: TeoyubeManualBetaQaExecutionResult
): TeoyubeManualBetaQaExecutionRun {
  const results = [
    ...run.results.filter((entry) => entry.scenarioId !== result.scenarioId),
    { ...result, recordedAt: result.recordedAt || now() }
  ];
  return {
    ...run,
    results,
    status: results.some((entry) => entry.blocker || entry.status === "blocked" || entry.status === "failed")
      ? "blocked"
      : results.length === run.scenarios.length
        ? results.some((entry) => entry.warning || entry.status === "warning") ? "passed_with_warnings" : "passed"
        : "in_progress",
    updatedAt: now()
  };
}

export function recordManualBetaQaAreaResult(
  run: TeoyubeManualBetaQaExecutionRun,
  area: TeoyubeManualBetaQaExecutionArea,
  result: Omit<TeoyubeManualBetaQaExecutionResult, "scenarioId" | "area" | "surface" | "recordedAt">
): TeoyubeManualBetaQaExecutionRun {
  const scenario = run.scenarios.find((entry) => entry.area === area);
  return recordManualBetaQaScenarioResult(run, {
    ...result,
    scenarioId: scenario?.id || `${area}_manual_result`,
    area,
    surface: scenario?.surface || surfaceForArea(area),
    recordedAt: now()
  });
}

export function summarizeManualBetaQaExecutionRun(run: TeoyubeManualBetaQaExecutionRun) {
  const completed = run.results.filter((entry) => entry.status !== "not_run").length;
  const blockers = getManualBetaQaExecutionBlockers(run);
  const warnings = getManualBetaQaExecutionWarnings(run);
  return {
    runId: run.id,
    status: run.status,
    completedScenarioCount: completed,
    totalScenarioCount: run.scenarios.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    manualOnly: run.manualOnly,
    inMemoryOnly: run.inMemoryOnly
  };
}

export function getManualBetaQaExecutionBlockers(run: TeoyubeManualBetaQaExecutionRun): TeoyubeManualBetaQaExecutionBlocker[] {
  const scenarioIds = new Set(run.scenarios.map((entry) => entry.id));
  return [
    ...(!run.manualOnly || !run.inMemoryOnly || !run.noPublicUrlFetching || !run.noUsersContacted || !run.noAnalyticsSent || !run.noQaRunsPersisted || !run.noFilesWritten || !run.noExternalServicesConnected
      ? [{
          id: "manual_qa_execution_boundary_broken",
          area: "unknown" as const,
          surface: "unknown" as const,
          message: "Manual QA execution boundaries were broken.",
          requiredAction: "Keep QA execution manual, in-memory, no-fetch, no-contact, no-analytics, no-persistence, and no-service."
        }]
      : []),
    ...run.results
      .filter((entry) => entry.blocker || entry.status === "blocked" || entry.status === "failed")
      .map((entry) => ({
        id: `${entry.scenarioId}_blocker`,
        area: entry.area,
        surface: entry.surface,
        message: entry.notes || `${entry.scenarioId} is blocking manual beta QA.`,
        requiredAction: "Move this issue to the Phase 5.3 beta fix queue before moving forward."
      })),
    ...run.results
      .filter((entry) => !scenarioIds.has(entry.scenarioId))
      .map((entry) => ({
        id: `${entry.scenarioId}_unknown_scenario`,
        area: entry.area,
        surface: entry.surface,
        message: `${entry.scenarioId} is not part of the planned manual QA scenario set.`,
        requiredAction: "Map the result to a planned scenario or add an owner-approved scenario."
      }))
  ];
}

export function getManualBetaQaExecutionWarnings(run: TeoyubeManualBetaQaExecutionRun): TeoyubeManualBetaQaExecutionWarning[] {
  const recordedIds = new Set(run.results.map((entry) => entry.scenarioId));
  return [
    ...run.scenarios
      .filter((scenario) => !recordedIds.has(scenario.id))
      .map((scenario) => ({
        id: `${scenario.id}_not_run`,
        area: scenario.area,
        surface: scenario.surface,
        message: `${scenario.title} has not been manually recorded yet.`,
        recommendedAction: "Record a manual QA result during Phase 5.2 execution."
      })),
    ...run.results
      .filter((entry) => entry.warning || entry.status === "warning")
      .map((entry) => ({
        id: `${entry.scenarioId}_warning`,
        area: entry.area,
        surface: entry.surface,
        message: entry.notes || `${entry.scenarioId} has a manual QA warning.`,
        recommendedAction: "Review warning before owner acceptance."
      }))
  ];
}

export function createManualBetaQaExecutionDecision(run: TeoyubeManualBetaQaExecutionRun): TeoyubeManualBetaQaExecutionDecision {
  const blockers = getManualBetaQaExecutionBlockers(run);
  const warnings = getManualBetaQaExecutionWarnings(run);
  const completed = run.results.filter((entry) => entry.status !== "not_run").length;
  if (blockers.length) return "qa_blocked";
  if (completed < run.scenarios.length) return "needs_owner_review";
  return warnings.length ? "qa_passed_with_warnings" : "qa_passed";
}

export function createManualBetaQaExecutionReport(run: TeoyubeManualBetaQaExecutionRun = createManualBetaQaExecutionRun()): TeoyubeManualBetaQaExecutionReport {
  const blockers = getManualBetaQaExecutionBlockers(run);
  const warnings = getManualBetaQaExecutionWarnings(run);
  return {
    valid: blockers.length === 0,
    decision: createManualBetaQaExecutionDecision(run),
    run,
    completedScenarioCount: run.results.filter((entry) => entry.status !== "not_run").length,
    totalScenarioCount: run.scenarios.length,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetching: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true,
    generatedAt: now()
  };
}
