import type {
  TeoyubeManualPreviewSafeFixBlocker,
  TeoyubeManualPreviewSafeFixCandidate,
  TeoyubeManualPreviewSafeFixResult,
  TeoyubeManualPreviewSafeFixWarning
} from "./manual-preview-safe-fix-contracts";

export type TeoyubeManualPreviewSafeFixRun = {
  id: string;
  label: string;
  results: TeoyubeManualPreviewSafeFixResult[];
  inMemoryOnly: true;
  databaseWritten: false;
  analyticsSent: false;
  filesWritten: false;
  externalServicesCalled: false;
  createdAt: string;
  updatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

export function createManualPreviewSafeFixRun(label = "Manual Preview Deployment 2.4 Safe Fix Run"): TeoyubeManualPreviewSafeFixRun {
  const createdAt = now();
  return {
    id: "manual_preview_safe_fix_run",
    label,
    results: [],
    inMemoryOnly: true,
    databaseWritten: false,
    analyticsSent: false,
    filesWritten: false,
    externalServicesCalled: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordManualPreviewSafeFixResult(
  run: TeoyubeManualPreviewSafeFixRun,
  result: Omit<TeoyubeManualPreviewSafeFixResult, "id"> & { id?: string }
): TeoyubeManualPreviewSafeFixRun {
  const normalized: TeoyubeManualPreviewSafeFixResult = {
    ...result,
    id: result.id || `safe_fix_result_${result.candidateId}`.replace(/[^a-zA-Z0-9_-]/g, "_")
  };

  return {
    ...run,
    results: [...run.results.filter((entry) => entry.id !== normalized.id), normalized],
    updatedAt: now()
  };
}

export function recordManualPreviewSafeFixSkipped(
  run: TeoyubeManualPreviewSafeFixRun,
  candidate: TeoyubeManualPreviewSafeFixCandidate,
  reason: string
): TeoyubeManualPreviewSafeFixRun {
  return recordManualPreviewSafeFixResult(run, {
    candidateId: candidate.id,
    issueId: candidate.issue.id,
    status: "skipped",
    filesChanged: [],
    fixSummary: candidate.summary,
    riskLevel: candidate.riskLevel,
    regressionChecksRequired: candidate.regressionChecks,
    verificationStatus: "not_run",
    skippedReason: reason
  });
}

export function recordManualPreviewSafeFixBlocked(
  run: TeoyubeManualPreviewSafeFixRun,
  candidate: TeoyubeManualPreviewSafeFixCandidate,
  reason: string
): TeoyubeManualPreviewSafeFixRun {
  return recordManualPreviewSafeFixResult(run, {
    candidateId: candidate.id,
    issueId: candidate.issue.id,
    status: "blocked",
    filesChanged: [],
    fixSummary: candidate.summary,
    riskLevel: candidate.riskLevel,
    regressionChecksRequired: candidate.regressionChecks,
    verificationStatus: "blocked",
    blockedReason: reason
  });
}

export function getManualPreviewSafeFixRunBlockers(run: TeoyubeManualPreviewSafeFixRun): TeoyubeManualPreviewSafeFixBlocker[] {
  return run.results
    .filter((result) => result.status === "blocked" || result.verificationStatus === "failed" || result.verificationStatus === "blocked")
    .map((result) => ({
      id: `safe_fix_run_blocker_${result.id}`,
      candidateId: result.candidateId,
      message: result.blockedReason || `${result.fixSummary} is blocked or failed verification.`,
      requiredAction: "Resolve or re-triage this fix before preview re-check.",
      riskLevel: result.riskLevel === "critical" ? "critical" : "high"
    }));
}

export function getManualPreviewSafeFixRunWarnings(run: TeoyubeManualPreviewSafeFixRun): TeoyubeManualPreviewSafeFixWarning[] {
  return run.results
    .filter((result) => result.status === "skipped" || result.verificationStatus === "warning" || result.verificationStatus === "not_run")
    .map((result) => ({
      id: `safe_fix_run_warning_${result.id}`,
      candidateId: result.candidateId,
      message: result.skippedReason || `${result.fixSummary} needs manual review or regression verification.`,
      recommendedAction: "Document the reason and complete regression verification before preview re-check."
    }));
}

export function summarizeManualPreviewSafeFixRun(run: TeoyubeManualPreviewSafeFixRun) {
  const blockers = getManualPreviewSafeFixRunBlockers(run);
  const warnings = getManualPreviewSafeFixRunWarnings(run);

  return {
    resultCount: run.results.length,
    appliedCount: run.results.filter((result) => result.status === "applied").length,
    skippedCount: run.results.filter((result) => result.status === "skipped").length,
    blockedCount: run.results.filter((result) => result.status === "blocked").length,
    verifiedCount: run.results.filter((result) => result.status === "verified" || result.verificationStatus === "passed").length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    inMemoryOnly: run.inMemoryOnly,
    noExternalWrite: run.inMemoryOnly && !run.databaseWritten && !run.analyticsSent && !run.filesWritten && !run.externalServicesCalled,
    generatedAt: new Date().toISOString()
  };
}

export function createManualPreviewSafeFixRunReport(run: TeoyubeManualPreviewSafeFixRun) {
  const summary = summarizeManualPreviewSafeFixRun(run);

  return {
    valid: summary.blockerCount === 0,
    run,
    ...summary
  };
}
