import { createFirstHourMonitoringPlan, createFirstHourMonitoringReport } from "../launch-day-first-hour-monitoring";
import { createLaunchDayDailyReviewRecord, createLaunchDayDailyReviewReport } from "../launch-day-daily-review";
import { createLaunchDayFeedbackIntakeReport, createLaunchDayFeedbackItem, createLaunchDayFeedbackLog, addLaunchDayFeedbackItem } from "../launch-day-manual-feedback-intake";
import { createLaunchDayFeedbackPrivacyReport } from "../launch-day-feedback-privacy-guard";
import { createLaunchDayIssueEscalationReport, createLaunchDayIssueFromFeedbackItem } from "../launch-day-issue-escalation";
import { createLaunchDayMonitoringPackage, createLaunchDayMonitoringPackageReport } from "../launch-day-monitoring-package";
import { runLaunchDayMonitoringAudit } from "../launch-day-monitoring-audit";
import { createLaunchDayMonitoringReport, createLaunchDayMonitoringRun } from "../launch-day-monitoring-run";
import { createLaunchDayPauseRollbackWatchReport } from "../launch-day-pause-rollback-watch";
import { createScriptureExplanationFallbackWatchReport, recordScriptureExplanationFallbackWatchResult } from "../launch-day-scripture-explanation-fallback-watch";
import { createSurfaceHealthMonitoringReport, createSurfaceHealthMonitoringRun, LAUNCH_DAY_REQUIRED_SURFACES } from "../launch-day-surface-health-monitor";

export function runLimitedSoftLaunchExecution42SmokeCheck() {
  const monitoringRun = createLaunchDayMonitoringRun();
  const monitoringRunReport = createLaunchDayMonitoringReport(monitoringRun);
  const firstHourPlan = createFirstHourMonitoringPlan();
  const firstHourReport = createFirstHourMonitoringReport(firstHourPlan);
  const surfaceHealthReport = createSurfaceHealthMonitoringReport(createSurfaceHealthMonitoringRun());
  const failedWatch = recordScriptureExplanationFallbackWatchResult({ results: [] }, { checkId: "scripture_anchor_missing", notes: ["Missing anchor sample."] });
  const watchReport = createScriptureExplanationFallbackWatchReport(failedWatch.results);
  const feedbackItem = createLaunchDayFeedbackItem({ id: "privacy_sample", category: "content_clarity", summary: "Contact me at test@example.com" });
  const feedbackLog = addLaunchDayFeedbackItem(createLaunchDayFeedbackLog(), feedbackItem);
  const feedbackReport = createLaunchDayFeedbackIntakeReport(feedbackLog);
  const privacyReport = createLaunchDayFeedbackPrivacyReport({ rawText: "Private raw text", summary: "test@example.com" });
  const issueReport = createLaunchDayIssueEscalationReport([
    createLaunchDayIssueFromFeedbackItem(createLaunchDayFeedbackItem({ id: "critical_feedback", category: "scripture_anchor", summary: "Scripture anchor missing" }))
  ]);
  const pauseRollbackReport = createLaunchDayPauseRollbackWatchReport({ appDoesNotLoad: true });
  const dailyReviewReport = createLaunchDayDailyReviewReport([createLaunchDayDailyReviewRecord()]);
  const monitoringPackage = createLaunchDayMonitoringPackage();
  const monitoringPackageReport = createLaunchDayMonitoringPackageReport(monitoringPackage);
  const audit = runLaunchDayMonitoringAudit();

  const checks = [
    monitoringRun.manualOnly && monitoringRun.inMemoryOnly && monitoringRunReport.noLaunchPerformed,
    !firstHourPlan.fetchesPreviewUrls && !firstHourPlan.automatedMonitoringPerformed && firstHourReport.noPreviewUrlFetched,
    surfaceHealthReport.requiredSurfaces.length >= LAUNCH_DAY_REQUIRED_SURFACES.length,
    watchReport.blockers.some((entry) => entry.id.includes("scripture_anchor_missing")),
    feedbackReport.manualOnly && feedbackReport.noFeedbackCollectedAutomatically && feedbackReport.noDatabaseWrites,
    privacyReport.blocked && privacyReport.rawPrivateUserTextStored === false,
    issueReport.criticalIssueCount >= 1,
    pauseRollbackReport.noRollbackPerformed && pauseRollbackReport.noProviderCommandsExecuted,
    dailyReviewReport.noExternalWrite && dailyReviewReport.summary.inMemoryOnly,
    monitoringPackage.inMemoryOnly && monitoringPackageReport.inMemoryOnly,
    audit.complete && audit.completionPercentage === 100,
    !monitoringPackage.launchPerformed,
    !monitoringPackage.usersContacted,
    !monitoringPackage.feedbackCollectedAutomatically,
    !monitoringPackage.previewUrlFetched,
    !monitoringPackage.databaseWritten && !monitoringPackage.analyticsSent && !monitoringPackage.fileWritten
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollectedAutomatically: true,
    noPreviewUrlFetched: true,
    noDatabaseExternalApisAnalyticsStorageOrFileWritesRequired: true,
    noServiceWorkerRequired: true,
    audit,
    launchDayMonitoringDecision: monitoringPackageReport.decision,
    generatedAt: new Date().toISOString()
  };
}
