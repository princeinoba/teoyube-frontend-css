import { createFirstHourMonitoringPlan, createFirstHourMonitoringReport } from "./launch-day-first-hour-monitoring";
import { createLaunchDayDailyReviewRecord, createLaunchDayDailyReviewReport } from "./launch-day-daily-review";
import { createLaunchDayFeedbackIntakeReport, createLaunchDayFeedbackItem, createLaunchDayFeedbackLog } from "./launch-day-manual-feedback-intake";
import { createLaunchDayFeedbackPrivacyReport } from "./launch-day-feedback-privacy-guard";
import { createLaunchDayIssueEscalationReport, createLaunchDayIssueFromFeedbackItem } from "./launch-day-issue-escalation";
import { createLaunchDayMonitoringReport, createLaunchDayMonitoringRun } from "./launch-day-monitoring-run";
import { createLaunchDayPauseRollbackWatchReport } from "./launch-day-pause-rollback-watch";
import { createScriptureExplanationFallbackWatchReport } from "./launch-day-scripture-explanation-fallback-watch";
import { createSurfaceHealthMonitoringReport, createSurfaceHealthMonitoringRun } from "./launch-day-surface-health-monitor";
import type { TeoyubeLaunchDayMonitoringBlocker, TeoyubeLaunchDayMonitoringDecision, TeoyubeLaunchDayMonitoringWarning } from "./launch-day-monitoring-contracts";

export type TeoyubeLaunchDayMonitoringPackage = {
  id: string;
  label: string;
  monitoringRunReport: ReturnType<typeof createLaunchDayMonitoringReport>;
  firstHourMonitoringReport: ReturnType<typeof createFirstHourMonitoringReport>;
  surfaceHealthReport: ReturnType<typeof createSurfaceHealthMonitoringReport>;
  scriptureExplanationFallbackWatchReport: ReturnType<typeof createScriptureExplanationFallbackWatchReport>;
  manualFeedbackIntakeReport: ReturnType<typeof createLaunchDayFeedbackIntakeReport>;
  feedbackPrivacyReport: ReturnType<typeof createLaunchDayFeedbackPrivacyReport>;
  issueEscalationReport: ReturnType<typeof createLaunchDayIssueEscalationReport>;
  pauseRollbackWatchReport: ReturnType<typeof createLaunchDayPauseRollbackWatchReport>;
  dailyReviewReport: ReturnType<typeof createLaunchDayDailyReviewReport>;
  nextActionRecommendation: string;
  inMemoryOnly: true;
  sentExternally: false;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  launchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  previewUrlFetched: false;
  generatedAt: string;
};

export function createLaunchDayMonitoringPackage(input: Partial<TeoyubeLaunchDayMonitoringPackage> = {}): TeoyubeLaunchDayMonitoringPackage {
  const feedback = createLaunchDayFeedbackItem({ id: "sample_manual_feedback", category: "content_clarity", summary: "Sample sanitized manual feedback." });
  const feedbackLog = addFeedback(createLaunchDayFeedbackLog(), feedback);

  return {
    id: input.id || "launch_day_monitoring_package_4_2",
    label: input.label || "Launch Day Monitoring Package",
    monitoringRunReport: input.monitoringRunReport || createLaunchDayMonitoringReport(createLaunchDayMonitoringRun()),
    firstHourMonitoringReport: input.firstHourMonitoringReport || createFirstHourMonitoringReport(createFirstHourMonitoringPlan()),
    surfaceHealthReport: input.surfaceHealthReport || createSurfaceHealthMonitoringReport(createSurfaceHealthMonitoringRun()),
    scriptureExplanationFallbackWatchReport: input.scriptureExplanationFallbackWatchReport || createScriptureExplanationFallbackWatchReport([]),
    manualFeedbackIntakeReport: input.manualFeedbackIntakeReport || createLaunchDayFeedbackIntakeReport(feedbackLog),
    feedbackPrivacyReport: input.feedbackPrivacyReport || createLaunchDayFeedbackPrivacyReport(feedback),
    issueEscalationReport: input.issueEscalationReport || createLaunchDayIssueEscalationReport([createLaunchDayIssueFromFeedbackItem(feedback)]),
    pauseRollbackWatchReport: input.pauseRollbackWatchReport || createLaunchDayPauseRollbackWatchReport(),
    dailyReviewReport: input.dailyReviewReport || createLaunchDayDailyReviewReport([createLaunchDayDailyReviewRecord()]),
    nextActionRecommendation: input.nextActionRecommendation || "Limited Soft Launch Execution 4.3 - Feedback Triage, Fix Queue & Daily Review",
    inMemoryOnly: true,
    sentExternally: false,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    launchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    previewUrlFetched: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

function addFeedback(log: ReturnType<typeof createLaunchDayFeedbackLog>, item: ReturnType<typeof createLaunchDayFeedbackItem>) {
  return { ...log, items: [...log.items, item] };
}

export function getLaunchDayMonitoringPackageBlockers(pkg: TeoyubeLaunchDayMonitoringPackage): TeoyubeLaunchDayMonitoringBlocker[] {
  return [
    ...pkg.monitoringRunReport.blockers,
    ...pkg.firstHourMonitoringReport.blockers,
    ...pkg.surfaceHealthReport.blockers,
    ...pkg.scriptureExplanationFallbackWatchReport.blockers,
    ...pkg.manualFeedbackIntakeReport.blockers,
    ...pkg.pauseRollbackWatchReport.blockers,
    ...pkg.dailyReviewReport.blockers,
    pkg.sentExternally ? { id: "launch_day_package_sent", label: "Package sent externally", phase: "daily_summary", severity: "critical", reason: "Monitoring package must not be sent externally.", requiredAction: "Keep package in memory." } : undefined,
    pkg.fileWritten ? { id: "launch_day_package_file_written", label: "Package wrote files", phase: "daily_summary", severity: "critical", reason: "Monitoring package must not write files.", requiredAction: "Keep package in memory." } : undefined,
    pkg.databaseWritten ? { id: "launch_day_package_database_written", label: "Package wrote database", phase: "daily_summary", severity: "critical", reason: "Monitoring package must not write databases.", requiredAction: "Remove database writes." } : undefined,
    pkg.analyticsSent ? { id: "launch_day_package_analytics_sent", label: "Package sent analytics", phase: "daily_summary", severity: "critical", reason: "Monitoring package must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    pkg.launchPerformed ? { id: "launch_day_package_launched", label: "Package launched", phase: "activation_observation", severity: "critical", reason: "Monitoring package must not perform launch.", requiredAction: "Remove launch execution." } : undefined,
    pkg.usersContacted ? { id: "launch_day_package_users_contacted", label: "Package contacted users", phase: "activation_observation", severity: "critical", reason: "Monitoring package must not contact users.", requiredAction: "Keep user contact manual." } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "launch_day_package_feedback_collected", label: "Feedback collected automatically", phase: "feedback_intake_review", severity: "critical", reason: "Monitoring package must not collect feedback automatically.", requiredAction: "Use manual feedback only." } : undefined,
    pkg.previewUrlFetched ? { id: "launch_day_package_preview_url_fetched", label: "Preview URL fetched", phase: "pre_launch_manual_check", severity: "critical", reason: "Monitoring package must not fetch preview URLs.", requiredAction: "Keep URL review manual." } : undefined
  ].filter(Boolean) as TeoyubeLaunchDayMonitoringBlocker[];
}

export function getLaunchDayMonitoringPackageWarnings(pkg: TeoyubeLaunchDayMonitoringPackage): TeoyubeLaunchDayMonitoringWarning[] {
  return [
    ...pkg.monitoringRunReport.warnings,
    ...pkg.firstHourMonitoringReport.warnings,
    ...pkg.surfaceHealthReport.warnings,
    ...pkg.scriptureExplanationFallbackWatchReport.warnings,
    ...pkg.manualFeedbackIntakeReport.warnings,
    ...pkg.pauseRollbackWatchReport.warnings,
    ...pkg.dailyReviewReport.warnings
  ];
}

export function createLaunchDayMonitoringPackageDecision(pkg: TeoyubeLaunchDayMonitoringPackage): TeoyubeLaunchDayMonitoringDecision {
  const blockers = getLaunchDayMonitoringPackageBlockers(pkg);
  if (blockers.some((entry) => /rollback|analytics|persistence|live ai|unsafe/i.test(`${entry.label} ${entry.reason}`))) return "rollback_recommended";
  if (blockers.length > 0) return "pause_for_review";
  if (getLaunchDayMonitoringPackageWarnings(pkg).length > 0) return "continue_with_warnings";
  return "continue_soft_launch";
}

export function validateLaunchDayMonitoringPackage(pkg: TeoyubeLaunchDayMonitoringPackage) {
  const blockers = getLaunchDayMonitoringPackageBlockers(pkg);
  return { valid: blockers.length === 0, blockers, warnings: getLaunchDayMonitoringPackageWarnings(pkg) };
}

export function createLaunchDayMonitoringPackageReport(pkg: TeoyubeLaunchDayMonitoringPackage = createLaunchDayMonitoringPackage()) {
  const validation = validateLaunchDayMonitoringPackage(pkg);
  const decision = createLaunchDayMonitoringPackageDecision(pkg);

  return {
    valid: validation.valid,
    ready: validation.valid && ["continue_soft_launch", "continue_with_warnings"].includes(decision),
    decision,
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
    inMemoryOnly: true,
    noLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
