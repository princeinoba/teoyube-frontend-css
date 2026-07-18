import type {
  TeoyubePublicSafeFixReleaseBlocker,
  TeoyubePublicSafeFixReleaseResult,
  TeoyubePublicSafeFixReleaseStatus,
  TeoyubePublicSafeFixReleaseWarning
} from "./public-safe-fix-release-contracts";

export type TeoyubePublicSafeFixReleaseRun = {
  id: string;
  label: string;
  results: TeoyubePublicSafeFixReleaseResult[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicUrlFetched: false;
  liveAiOrchestrationEnabled: false;
  launchPerformed: false;
  rollbackPerformed: false;
  generatedAt: string;
};

export type TeoyubePublicSafeFixReleaseRunReport = {
  valid: boolean;
  ready: boolean;
  run: TeoyubePublicSafeFixReleaseRun;
  resultCount: number;
  releasedCount: number;
  verifiedCount: number;
  blockedCount: number;
  deferredCount: number;
  warningCount: number;
  blockers: TeoyubePublicSafeFixReleaseBlocker[];
  warnings: TeoyubePublicSafeFixReleaseWarning[];
  inMemoryOnly: true;
  noFixesAppliedAutomatically: true;
  noLaunchPerformed: true;
  noRollbackPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "public_safe_fix_result";
}

export function createPublicSafeFixReleaseRun(input: Partial<TeoyubePublicSafeFixReleaseRun> = {}): TeoyubePublicSafeFixReleaseRun {
  return {
    id: input.id || "public_safe_fix_release_run_6_4",
    label: input.label || "Public Safe Fix Release Run",
    results: input.results || [],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    liveAiOrchestrationEnabled: false,
    launchPerformed: false,
    rollbackPerformed: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

function createPublicSafeFixReleaseResult(
  status: TeoyubePublicSafeFixReleaseStatus,
  input: Partial<TeoyubePublicSafeFixReleaseResult> & { candidateId: string }
): TeoyubePublicSafeFixReleaseResult {
  return {
    id: input.id || normalizeId(`public_safe_fix_${status}_${input.candidateId}`),
    candidateId: input.candidateId,
    sourceFixQueueItemId: input.sourceFixQueueItemId,
    status,
    filesChanged: input.filesChanged || [],
    fixSummary: input.fixSummary || `Public safe fix ${status}.`,
    safetyStatus: input.safetyStatus || (status === "blocked" ? "blocked" : "not_run"),
    regressionChecksRequired: input.regressionChecksRequired || [],
    verificationStatus: input.verificationStatus || "not_run",
    skippedReason: input.skippedReason,
    blockedReason: input.blockedReason,
    deferredReason: input.deferredReason,
    releasedAt: input.releasedAt || (status === "released" || status === "verified" ? new Date().toISOString() : undefined)
  };
}

function appendResult(run: TeoyubePublicSafeFixReleaseRun, result: TeoyubePublicSafeFixReleaseResult): TeoyubePublicSafeFixReleaseRun {
  return { ...run, results: [...run.results, result] };
}

export function recordPublicSafeFixReleased(
  run: TeoyubePublicSafeFixReleaseRun,
  result: Partial<TeoyubePublicSafeFixReleaseResult> & { candidateId: string }
): TeoyubePublicSafeFixReleaseRun {
  return appendResult(run, createPublicSafeFixReleaseResult("released", {
    ...result,
    safetyStatus: result.safetyStatus || "passed",
    verificationStatus: result.verificationStatus || "passed"
  }));
}

export function recordPublicSafeFixVerified(
  run: TeoyubePublicSafeFixReleaseRun,
  result: Partial<TeoyubePublicSafeFixReleaseResult> & { candidateId: string }
): TeoyubePublicSafeFixReleaseRun {
  return appendResult(run, createPublicSafeFixReleaseResult("verified", {
    ...result,
    safetyStatus: result.safetyStatus || "passed",
    verificationStatus: result.verificationStatus || "passed"
  }));
}

export function recordPublicSafeFixSkipped(
  run: TeoyubePublicSafeFixReleaseRun,
  result: Partial<TeoyubePublicSafeFixReleaseResult> & { candidateId: string; skippedReason: string }
): TeoyubePublicSafeFixReleaseRun {
  return appendResult(run, createPublicSafeFixReleaseResult("skipped", result));
}

export function recordPublicSafeFixBlocked(
  run: TeoyubePublicSafeFixReleaseRun,
  result: Partial<TeoyubePublicSafeFixReleaseResult> & { candidateId: string; blockedReason: string }
): TeoyubePublicSafeFixReleaseRun {
  return appendResult(run, createPublicSafeFixReleaseResult("blocked", {
    ...result,
    safetyStatus: result.safetyStatus || "blocked",
    verificationStatus: result.verificationStatus || "blocked"
  }));
}

export function recordPublicSafeFixDeferred(
  run: TeoyubePublicSafeFixReleaseRun,
  result: Partial<TeoyubePublicSafeFixReleaseResult> & { candidateId: string; deferredReason: string }
): TeoyubePublicSafeFixReleaseRun {
  return appendResult(run, createPublicSafeFixReleaseResult("deferred", result));
}

export function getPublicSafeFixReleaseRunBlockers(run: TeoyubePublicSafeFixReleaseRun): TeoyubePublicSafeFixReleaseBlocker[] {
  return [
    ...run.results
      .filter((result) => result.status === "blocked" || result.safetyStatus === "failed" || result.safetyStatus === "blocked" || result.verificationStatus === "failed" || result.verificationStatus === "blocked")
      .map((result) => ({
        id: `public_safe_fix_release_result_blocker_${result.id}`,
        candidateId: result.candidateId,
        label: result.fixSummary,
        reason: result.blockedReason || "Public safe-fix result failed safety or regression verification.",
        requiredAction: "Do not consider this fix stabilized until safety and regression checks pass.",
        riskLevel: "critical" as const
      })),
    run.fileWritten ? { id: "public_safe_fix_release_run_file_written", label: run.label, reason: "Release run must not write files.", requiredAction: "Record release evidence in memory only.", riskLevel: "critical" as const } : undefined,
    run.databaseWritten ? { id: "public_safe_fix_release_run_database_written", label: run.label, reason: "Release run must not write a database.", requiredAction: "Remove persistence.", riskLevel: "critical" as const } : undefined,
    run.analyticsSent ? { id: "public_safe_fix_release_run_analytics_sent", label: run.label, reason: "Release run must not send analytics.", requiredAction: "Remove analytics sending.", riskLevel: "critical" as const } : undefined,
    run.externalServicesCalled ? { id: "public_safe_fix_release_run_external_service", label: run.label, reason: "Release run must not call external services.", requiredAction: "Keep release recording local and manual.", riskLevel: "critical" as const } : undefined,
    run.usersContacted ? { id: "public_safe_fix_release_run_users_contacted", label: run.label, reason: "Release run must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    run.feedbackCollectedAutomatically ? { id: "public_safe_fix_release_run_feedback_collected", label: run.label, reason: "Release run must not collect feedback automatically.", requiredAction: "Use manual feedback intake only.", riskLevel: "critical" as const } : undefined,
    run.publicUrlFetched ? { id: "public_safe_fix_release_run_url_fetched", label: run.label, reason: "Release run must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined,
    run.liveAiOrchestrationEnabled ? { id: "public_safe_fix_release_run_live_ai", label: run.label, reason: "Release run must not enable live AI orchestration.", requiredAction: "Keep live AI orchestration disabled.", riskLevel: "critical" as const } : undefined,
    run.launchPerformed ? { id: "public_safe_fix_release_run_launch_performed", label: run.label, reason: "Release run must not launch Teoyube.", requiredAction: "Keep deployment manual.", riskLevel: "critical" as const } : undefined,
    run.rollbackPerformed ? { id: "public_safe_fix_release_run_rollback_performed", label: run.label, reason: "Release run must not perform rollback.", requiredAction: "Keep rollback manual and owner-reviewed.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as TeoyubePublicSafeFixReleaseBlocker[];
}

export function getPublicSafeFixReleaseRunWarnings(run: TeoyubePublicSafeFixReleaseRun): TeoyubePublicSafeFixReleaseWarning[] {
  return [
    run.results.length === 0 ? { id: "public_safe_fix_release_run_no_results", label: run.label, message: "No public safe-fix results have been recorded.", recommendedAction: "Record released, skipped, blocked, or deferred results manually.", riskLevel: "low" as const } : undefined,
    ...run.results
      .filter((result) => result.status === "skipped" || result.status === "deferred" || result.safetyStatus === "warning" || result.verificationStatus === "warning" || result.verificationStatus === "not_run")
      .map((result) => ({
        id: `public_safe_fix_release_result_warning_${result.id}`,
        candidateId: result.candidateId,
        label: result.fixSummary,
        message: result.skippedReason || result.deferredReason || "Public safe-fix result has warning or unrun verification status.",
        recommendedAction: "Keep this result visible in owner stabilization review.",
        riskLevel: "medium" as const
      }))
  ].filter(Boolean) as TeoyubePublicSafeFixReleaseWarning[];
}

export function createPublicSafeFixReleaseRunReport(run: TeoyubePublicSafeFixReleaseRun = createPublicSafeFixReleaseRun()): TeoyubePublicSafeFixReleaseRunReport {
  const blockers = getPublicSafeFixReleaseRunBlockers(run);
  const warnings = getPublicSafeFixReleaseRunWarnings(run);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    run,
    resultCount: run.results.length,
    releasedCount: run.results.filter((result) => result.status === "released").length,
    verifiedCount: run.results.filter((result) => result.status === "verified" || result.verificationStatus === "passed").length,
    blockedCount: run.results.filter((result) => result.status === "blocked").length,
    deferredCount: run.results.filter((result) => result.status === "deferred").length,
    warningCount: warnings.length,
    blockers,
    warnings,
    inMemoryOnly: true,
    noFixesAppliedAutomatically: true,
    noLaunchPerformed: true,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
