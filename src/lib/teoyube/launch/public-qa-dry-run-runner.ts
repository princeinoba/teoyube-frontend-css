import { getPublicSurfaceFinalQaChecklist } from "./public-surface-final-qa-checklist";
import { validatePublicSurfaceCopyIntegration } from "./public-surface-copy-integration-validator";
import type { TeoyubePublicLaunchQaResult } from "./public-launch-qa-contracts";
import type { TeoyubePublicQaDryRun, TeoyubePublicQaDryRunReport } from "./public-qa-dry-run-contracts";

export function createPublicQaDryRun(input: Partial<TeoyubePublicQaDryRun> = {}): TeoyubePublicQaDryRun {
  const checklist = input.checklist || getPublicSurfaceFinalQaChecklist();
  const defaultResults: TeoyubePublicLaunchQaResult[] = checklist.map((entry) => ({
    checkId: entry.id,
    surface: entry.surface,
    status: "pass",
    notes: "Final QA dry run placeholder is manual, in-memory, and ready for owner review.",
    testedAt: new Date().toISOString()
  }));

  return {
    id: input.id || "public_qa_dry_run_5_3",
    label: input.label || "Public Launch Preparation 5.3 Final QA Dry Run",
    checklist,
    results: input.results || defaultResults,
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function recordPublicQaDryRunResult(
  run: TeoyubePublicQaDryRun,
  result: TeoyubePublicLaunchQaResult
): TeoyubePublicQaDryRun {
  return { ...run, results: [...run.results, { ...result, testedAt: result.testedAt || new Date().toISOString() }] };
}

export function createPublicQaDryRunReport(run: TeoyubePublicQaDryRun = createPublicQaDryRun()): TeoyubePublicQaDryRunReport {
  const integrationReport = validatePublicSurfaceCopyIntegration();
  const safetyBlockers = [
    run.fileWritten ? { id: "public_qa_dry_run_file_written", surface: "all" as const, noticeType: "unknown" as const, label: run.label, reason: "Final QA dry run must not write files.", requiredAction: "Keep final QA in memory.", riskLevel: "high" as const } : undefined,
    run.databaseWritten ? { id: "public_qa_dry_run_database_written", surface: "all" as const, noticeType: "unknown" as const, label: run.label, reason: "Final QA dry run must not write databases.", requiredAction: "Keep persistence disconnected.", riskLevel: "critical" as const } : undefined,
    run.analyticsSent ? { id: "public_qa_dry_run_analytics_sent", surface: "all" as const, noticeType: "unknown" as const, label: run.label, reason: "Final QA dry run must not send analytics.", requiredAction: "Keep analytics disconnected.", riskLevel: "critical" as const } : undefined,
    run.externalServicesCalled ? { id: "public_qa_dry_run_external_services", surface: "all" as const, noticeType: "unknown" as const, label: run.label, reason: "Final QA dry run must not call external services.", requiredAction: "Keep providers disconnected.", riskLevel: "critical" as const } : undefined,
    run.publicLaunchPerformed ? { id: "public_qa_dry_run_launch_performed", surface: "all" as const, noticeType: "unknown" as const, label: run.label, reason: "Final QA dry run must not launch Teoyube.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    run.usersContacted ? { id: "public_qa_dry_run_users_contacted", surface: "all" as const, noticeType: "unknown" as const, label: run.label, reason: "Final QA dry run must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    run.feedbackCollectedAutomatically ? { id: "public_qa_dry_run_feedback_collected", surface: "all" as const, noticeType: "unknown" as const, label: run.label, reason: "Final QA dry run must not collect feedback automatically.", requiredAction: "Use manual QA notes only.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as typeof integrationReport.blockers;
  const resultBlockers = run.results
    .filter((entry) => entry.status === "fail" || entry.status === "blocked")
    .map((entry) => ({
      id: `public_qa_dry_run_result_${entry.checkId}`,
      surface: entry.surface,
      noticeType: "unknown" as const,
      label: "Final QA dry-run result",
      reason: entry.notes || "Final QA dry-run check failed.",
      requiredAction: "Resolve the failed check before public launch.",
      riskLevel: "critical" as const
    }));
  const blockers = [...integrationReport.blockers, ...safetyBlockers, ...resultBlockers];
  const resultWarnings = run.results
    .filter((entry) => entry.status === "warning" || entry.status === "needs_review" || entry.status === "not_tested")
    .map((entry) => ({
      id: `public_qa_dry_run_warning_${entry.checkId}`,
      surface: entry.surface,
      noticeType: "unknown" as const,
      label: "Final QA dry-run warning",
      message: entry.notes || "Final QA dry-run check needs review.",
      recommendedAction: "Review before public launch.",
      riskLevel: "medium" as const
    }));
  const warnings = [...integrationReport.warnings, ...resultWarnings];
  const passCount = run.results.filter((entry) => entry.status === "pass").length;

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "ready_with_warnings" : "ready",
    decision: blockers.length > 0 ? "blocked" : "ready_for_final_qa_dry_run",
    run,
    checkCount: run.checklist.length,
    passCount,
    warningCount: warnings.length,
    blockerCount: blockers.length,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
