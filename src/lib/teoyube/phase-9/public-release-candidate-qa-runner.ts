import type {
  TeoyubePublicReleaseCandidateQaArea,
  TeoyubePublicReleaseCandidateQaBlocker,
  TeoyubePublicReleaseCandidateQaDecision,
  TeoyubePublicReleaseCandidateQaReport,
  TeoyubePublicReleaseCandidateQaResult,
  TeoyubePublicReleaseCandidateQaRun,
  TeoyubePublicReleaseCandidateQaScenario,
  TeoyubePublicReleaseCandidateQaWarning
} from "./public-release-candidate-qa-contracts";
import { getPublicReleaseCandidateQaScenarios } from "./public-release-candidate-qa-scenarios";

export function createPublicReleaseCandidateQaRun(input: {
  id?: string;
  scenarios?: TeoyubePublicReleaseCandidateQaScenario[];
  results?: TeoyubePublicReleaseCandidateQaResult[];
} = {}): TeoyubePublicReleaseCandidateQaRun {
  return {
    id: input.id || "phase_9_2_public_release_candidate_qa_run",
    scenarios: input.scenarios || getPublicReleaseCandidateQaScenarios(),
    results: input.results || [],
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noAnalyticsSent: true,
    noQaRunPersisted: true,
    noFilesWritten: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function recordPublicReleaseCandidateQaResult(run: TeoyubePublicReleaseCandidateQaRun, result: TeoyubePublicReleaseCandidateQaResult): TeoyubePublicReleaseCandidateQaRun {
  return { ...run, results: [...run.results, result] };
}

export function recordPublicReleaseCandidateQaAreaResult(run: TeoyubePublicReleaseCandidateQaRun, area: TeoyubePublicReleaseCandidateQaArea, result: Partial<TeoyubePublicReleaseCandidateQaResult>): TeoyubePublicReleaseCandidateQaRun {
  const scenario = run.scenarios.find((entry) => entry.area === area);
  return recordPublicReleaseCandidateQaResult(run, {
    id: result.id || `${run.id}_${area}_result`,
    scenarioId: result.scenarioId || scenario?.id || `${area}_scenario`,
    area,
    status: result.status || (result.passed === false ? "blocked" : "passed"),
    passed: result.passed !== false,
    notes: result.notes || [`${area} manually reviewed.`],
    blocker: result.blocker ?? (result.passed === false)
  });
}

export function summarizePublicReleaseCandidateQaRun(run: TeoyubePublicReleaseCandidateQaRun): TeoyubePublicReleaseCandidateQaReport["summary"] {
  return {
    totalScenarios: run.scenarios.length,
    totalResults: run.results.length,
    passedResults: run.results.filter((entry) => entry.passed).length,
    blockedResults: run.results.filter((entry) => entry.blocker || !entry.passed).length
  };
}

export function getPublicReleaseCandidateQaBlockers(run: TeoyubePublicReleaseCandidateQaRun): TeoyubePublicReleaseCandidateQaBlocker[] {
  const boundaryBlockers = run.noPublicLaunchPerformed && run.noBetaLaunchPerformed && run.noUsersContacted && run.noFeedbackCollectedAutomatically && run.noPublicUrlsFetchedAutomatically && run.noAnalyticsSent && run.noQaRunPersisted && run.noFilesWritten && run.noExternalServicesRequired && run.inMemoryOnly
    ? []
    : [{ id: "qa_boundary_blocker", area: "unknown" as const, message: "Public release candidate QA must remain manual, in-memory, no-fetch, no-contact, no-analytics, no-persistence, no-file-write, and service-disabled.", requiredAction: "Restore manual QA boundaries." }];
  return [
    ...boundaryBlockers,
    ...run.results.filter((entry) => entry.blocker || !entry.passed).map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.notes.join(" "), requiredAction: "Move blocker into the release candidate fix queue before public go/no-go." }))
  ];
}

export function getPublicReleaseCandidateQaWarnings(run: TeoyubePublicReleaseCandidateQaRun): TeoyubePublicReleaseCandidateQaWarning[] {
  return [
    { id: "qa_manual_only", area: "unknown", message: "QA is manual and in-memory; it fetches no public URLs and writes no files.", recommendedAction: "Review results manually before Phase 9.3." },
    ...(run.results.length < run.scenarios.length ? [{ id: "qa_results_incomplete", area: "unknown" as const, message: "Not every QA scenario has a recorded result.", recommendedAction: "Record manual results for each scenario before final go/no-go." }] : [])
  ];
}

export function createPublicReleaseCandidateQaDecision(run: TeoyubePublicReleaseCandidateQaRun): TeoyubePublicReleaseCandidateQaDecision {
  const blockers = getPublicReleaseCandidateQaBlockers(run);
  if (blockers.length) return "needs_fix_queue";
  return getPublicReleaseCandidateQaWarnings(run).length ? "qa_passed_with_warnings" : "qa_passed";
}

export function createPublicReleaseCandidateQaReport(run: TeoyubePublicReleaseCandidateQaRun): TeoyubePublicReleaseCandidateQaReport {
  const blockers = getPublicReleaseCandidateQaBlockers(run);
  const warnings = getPublicReleaseCandidateQaWarnings(run);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    decision: createPublicReleaseCandidateQaDecision(run),
    run,
    blockers,
    warnings,
    summary: summarizePublicReleaseCandidateQaRun(run),
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noAnalyticsSent: true,
    noQaRunPersisted: true,
    noFilesWritten: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
