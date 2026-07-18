import type {
  TeoyubeSoftLaunchSafeFixReleaseBlocker,
  TeoyubeSoftLaunchSafeFixReleaseCandidate,
  TeoyubeSoftLaunchSafeFixReleaseResult,
  TeoyubeSoftLaunchSafeFixReleaseWarning
} from "./soft-launch-safe-fix-release-contracts";

export type TeoyubeSoftLaunchSafeFixReleaseRun = {
  id: string;
  label: string;
  results: TeoyubeSoftLaunchSafeFixReleaseResult[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  createdAt: string;
  updatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

export function createSoftLaunchSafeFixReleaseRun(): TeoyubeSoftLaunchSafeFixReleaseRun {
  const createdAt = now();
  return {
    id: "soft_launch_safe_fix_release_run_4_4",
    label: "Soft Launch Safe Fix Release Run",
    results: [],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordSoftLaunchSafeFixReleased(
  run: TeoyubeSoftLaunchSafeFixReleaseRun,
  result: Omit<TeoyubeSoftLaunchSafeFixReleaseResult, "id" | "status" | "releasedAt"> & {
    id?: string;
    status?: TeoyubeSoftLaunchSafeFixReleaseResult["status"];
    releasedAt?: string;
  }
): TeoyubeSoftLaunchSafeFixReleaseRun {
  const normalized: TeoyubeSoftLaunchSafeFixReleaseResult = {
    ...result,
    id: result.id || normalizeId(`safe_fix_release_result_${result.candidateId}`),
    status: result.status || "released",
    releasedAt: result.releasedAt || now()
  };
  return { ...run, results: [...run.results.filter((entry) => entry.id !== normalized.id), normalized], updatedAt: now() };
}

export function recordSoftLaunchSafeFixSkipped(
  run: TeoyubeSoftLaunchSafeFixReleaseRun,
  candidate: TeoyubeSoftLaunchSafeFixReleaseCandidate,
  reason: string
): TeoyubeSoftLaunchSafeFixReleaseRun {
  return recordSoftLaunchSafeFixReleased(run, {
    candidateId: candidate.id,
    sourceFixQueueItemId: candidate.sourceFixQueueItemId,
    status: "skipped",
    filesChanged: [],
    fixSummary: candidate.summary,
    safetyStatus: "not_run",
    regressionChecksRequired: candidate.regressionChecks,
    verificationStatus: "not_run",
    skippedReason: reason
  });
}

export function recordSoftLaunchSafeFixBlocked(
  run: TeoyubeSoftLaunchSafeFixReleaseRun,
  candidate: TeoyubeSoftLaunchSafeFixReleaseCandidate,
  reason: string
): TeoyubeSoftLaunchSafeFixReleaseRun {
  return recordSoftLaunchSafeFixReleased(run, {
    candidateId: candidate.id,
    sourceFixQueueItemId: candidate.sourceFixQueueItemId,
    status: "blocked",
    filesChanged: [],
    fixSummary: candidate.summary,
    safetyStatus: "blocked",
    regressionChecksRequired: candidate.regressionChecks,
    verificationStatus: "blocked",
    blockedReason: reason
  });
}

export function recordSoftLaunchSafeFixDeferred(
  run: TeoyubeSoftLaunchSafeFixReleaseRun,
  candidate: TeoyubeSoftLaunchSafeFixReleaseCandidate,
  reason: string
): TeoyubeSoftLaunchSafeFixReleaseRun {
  return recordSoftLaunchSafeFixReleased(run, {
    candidateId: candidate.id,
    sourceFixQueueItemId: candidate.sourceFixQueueItemId,
    status: "deferred",
    filesChanged: [],
    fixSummary: candidate.summary,
    safetyStatus: "not_run",
    regressionChecksRequired: candidate.regressionChecks,
    verificationStatus: "not_run",
    deferredReason: reason
  });
}

export function getSoftLaunchSafeFixReleaseRunBlockers(run: TeoyubeSoftLaunchSafeFixReleaseRun): TeoyubeSoftLaunchSafeFixReleaseBlocker[] {
  return run.results
    .filter((result) => result.status === "blocked" || result.safetyStatus === "blocked" || result.safetyStatus === "failed" || result.verificationStatus === "failed" || result.verificationStatus === "blocked")
    .map((result) => ({
      id: `safe_fix_release_run_blocker_${result.id}`,
      candidateId: result.candidateId,
      label: result.fixSummary,
      reason: result.blockedReason || "Safe fix release is blocked or failed verification.",
      requiredAction: "Re-triage or rollback this release candidate before soft launch expansion.",
      riskLevel: "critical" as const
    }));
}

export function getSoftLaunchSafeFixReleaseRunWarnings(run: TeoyubeSoftLaunchSafeFixReleaseRun): TeoyubeSoftLaunchSafeFixReleaseWarning[] {
  return run.results
    .filter((result) => result.status === "skipped" || result.status === "deferred" || result.verificationStatus === "warning" || result.verificationStatus === "not_run")
    .map((result) => ({
      id: `safe_fix_release_run_warning_${result.id}`,
      candidateId: result.candidateId,
      label: result.fixSummary,
      message: result.skippedReason || result.deferredReason || "Safe fix release needs verification or owner review.",
      recommendedAction: "Document the decision and complete regression verification before expansion.",
      riskLevel: "medium" as const
    }));
}

export function summarizeSoftLaunchSafeFixReleaseRun(run: TeoyubeSoftLaunchSafeFixReleaseRun) {
  const blockers = getSoftLaunchSafeFixReleaseRunBlockers(run);
  const warnings = getSoftLaunchSafeFixReleaseRunWarnings(run);
  return {
    resultCount: run.results.length,
    releasedCount: run.results.filter((result) => result.status === "released").length,
    skippedCount: run.results.filter((result) => result.status === "skipped").length,
    blockedCount: run.results.filter((result) => result.status === "blocked").length,
    deferredCount: run.results.filter((result) => result.status === "deferred").length,
    verifiedCount: run.results.filter((result) => result.status === "verified" || result.verificationStatus === "passed").length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    inMemoryOnly: run.inMemoryOnly,
    noExternalWrite: run.inMemoryOnly && !run.fileWritten && !run.databaseWritten && !run.analyticsSent && !run.externalServicesCalled,
    noUsersContacted: !run.usersContacted,
    noFeedbackCollectedAutomatically: !run.feedbackCollectedAutomatically,
    generatedAt: now()
  };
}

export function createSoftLaunchSafeFixReleaseRunReport(run: TeoyubeSoftLaunchSafeFixReleaseRun = createSoftLaunchSafeFixReleaseRun()) {
  const summary = summarizeSoftLaunchSafeFixReleaseRun(run);
  return {
    valid: summary.blockerCount === 0,
    ready: summary.blockerCount === 0,
    run,
    ...summary,
    noFixesAppliedAutomatically: true
  };
}
