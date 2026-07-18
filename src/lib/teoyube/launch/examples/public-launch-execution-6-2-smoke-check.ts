import { createPublicLaunchDayFeedbackIntakeReport, createPublicLaunchDayFeedbackItem, createPublicLaunchDayFeedbackLog, addPublicLaunchDayFeedbackItem } from "../public-launch-day-feedback-intake";
import { triagePublicLaunchDayFeedback } from "../public-launch-day-feedback-triage";
import { runPublicLaunchDayMonitoringFeedbackAudit } from "../public-launch-day-monitoring-feedback-audit";
import { createPublicLaunchDayMonitoringFeedbackPackage, createPublicLaunchDayMonitoringFeedbackPackageReport } from "../public-launch-day-monitoring-feedback-package";
import { createPublicLaunchDayMonitoringReport, createPublicLaunchDayMonitoringRun, recordPublicLaunchDayMonitoringResult } from "../public-launch-day-monitoring-run";
import { createPublicLaunchDayCommunicationStatus, createPublicLaunchDayOwnerReview } from "../public-launch-day-owner-communication-review";

export function runPublicLaunchExecution62SmokeCheck() {
  const monitoringRun = recordPublicLaunchDayMonitoringResult(createPublicLaunchDayMonitoringRun(), { checkId: "public_app_load_manual_check", status: "pass" });
  const monitoringReport = createPublicLaunchDayMonitoringReport(monitoringRun);
  const criticalFeedback = createPublicLaunchDayFeedbackItem({ id: "scripture_anchor_sample", category: "scripture_anchor", summary: "Scripture anchor concern sample." });
  const feedbackLog = addPublicLaunchDayFeedbackItem(createPublicLaunchDayFeedbackLog(), criticalFeedback);
  const feedbackReport = createPublicLaunchDayFeedbackIntakeReport(feedbackLog);
  const triageResults = triagePublicLaunchDayFeedback(feedbackLog.items);
  const ownerReview = createPublicLaunchDayOwnerReview({ ownerApprovedContinuation: true });
  const communicationStatus = createPublicLaunchDayCommunicationStatus();
  const pkg = createPublicLaunchDayMonitoringFeedbackPackage({ monitoringReport, feedbackIntakeReport: feedbackReport, triageResults, ownerReview, communicationStatus });
  const packageReport = createPublicLaunchDayMonitoringFeedbackPackageReport(pkg);
  const audit = runPublicLaunchDayMonitoringFeedbackAudit();
  const checks = [
    monitoringReport.noPublicLaunchPerformedByCode && monitoringReport.noPublicUrlFetched,
    feedbackReport.manualOnly && feedbackReport.noFeedbackCollectedAutomatically && feedbackReport.noDatabaseWrites,
    triageResults.some((entry) => entry.severity === "critical" && entry.recommendedAction === "pause_public_promotion"),
    ownerReview.manualDecisionOnly && ownerReview.ownerAvailableForPauseRollback,
    communicationStatus.privacyTermsConsentVisible && communicationStatus.messagesSentByCode === false,
    packageReport.inMemoryOnly && packageReport.noExternalWrite,
    !pkg.publicLaunchPerformedByCode,
    !pkg.usersContacted,
    !pkg.feedbackCollectedAutomatically,
    !pkg.publicUrlFetched,
    !pkg.databaseWritten && !pkg.analyticsSent && !pkg.fileWritten,
    audit.complete && audit.completionPercentage === 100
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    publicLaunchDayDecision: packageReport.decision,
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noDatabaseExternalApisAnalyticsStorageOrFileWritesRequired: true,
    noServiceWorkerRequired: true,
    audit,
    generatedAt: new Date().toISOString()
  };
}
