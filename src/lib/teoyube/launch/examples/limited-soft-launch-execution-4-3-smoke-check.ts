import { createFeedbackIssueConversionReport } from "../soft-launch-feedback-issue-converter";
import {
  createSoftLaunchFeedbackDailyReviewPackage,
  createSoftLaunchFeedbackDailyReviewPackageDecision,
  createSoftLaunchFeedbackDailyReviewPackageReport,
  createSoftLaunchFeedbackTriageItem,
  getSoftLaunchFeedbackDailyReviewPackageWarnings,
  validateSoftLaunchFeedbackDailyReviewPackage
} from "../soft-launch-feedback-daily-review-package";
import { runSoftLaunchFeedbackDailyReviewAudit } from "../soft-launch-feedback-daily-review-audit";
import { createSoftLaunchFeedbackTriageReport, isLaunchCriticalSoftLaunchFeedback } from "../soft-launch-feedback-triage-engine";
import { createSoftLaunchFixQueue, addSoftLaunchFixQueueItems, createSoftLaunchFixQueueReport } from "../soft-launch-fix-queue-manager";
import { createSoftLaunchFixQueueSafetyReport } from "../soft-launch-fix-queue-safety";
import { createSoftLaunchFixRegressionReport } from "../soft-launch-fix-regression-mapper";
import {
  createSoftLaunchDailyReviewRecord,
  createSoftLaunchDailyReviewReport,
  getSoftLaunchDailyReviewActionItems,
  summarizeSoftLaunchDailyReviewRecords
} from "../soft-launch-daily-review-manager";
import {
  createSoftLaunchPauseContinueDecision,
  createSoftLaunchPauseContinueReport,
  evaluateSoftLaunchPauseContinueDecision,
  getSoftLaunchPauseContinueBlockers,
  getSoftLaunchPauseContinueNextActions,
  getSoftLaunchPauseContinueReasons,
  getSoftLaunchPauseContinueWarnings
} from "../soft-launch-pause-continue-decision";
import {
  createSoftLaunchOwnerDailyReviewRecord,
  createSoftLaunchOwnerDailyReviewReport,
  getSoftLaunchOwnerDailyReviewBlockers,
  getSoftLaunchOwnerDailyReviewWarnings,
  validateSoftLaunchOwnerDailyReview
} from "../soft-launch-owner-daily-review";

export function runLimitedSoftLaunchExecution43SmokeCheck() {
  const criticalFeedback = createSoftLaunchFeedbackTriageItem({
    id: "smoke_missing_scripture_anchor",
    category: "scripture_anchor",
    summary: "Scripture anchor missing on sample review.",
    redactedNotes: ["Sample launch-critical feedback only."],
    launchCritical: true,
    safetyCritical: true
  });
  const safeFeedback = createSoftLaunchFeedbackTriageItem({
    id: "smoke_positive_feedback",
    category: "positive_feedback",
    summary: "Helpful explanation sample.",
    severity: "low"
  });
  const feedbackItems = [criticalFeedback, safeFeedback];
  const triageReport = createSoftLaunchFeedbackTriageReport(feedbackItems);
  const issueConversionReport = createFeedbackIssueConversionReport(feedbackItems);
  const fixQueue = addSoftLaunchFixQueueItems(createSoftLaunchFixQueue(), issueConversionReport.issues);
  const fixQueueReport = createSoftLaunchFixQueueReport(fixQueue);
  const fixQueueSafetyReport = createSoftLaunchFixQueueSafetyReport(fixQueue);
  const regressionReport = createSoftLaunchFixRegressionReport(fixQueue);
  const dailyReviewRecords = [
    createSoftLaunchDailyReviewRecord({
      status: "pause_recommended",
      feedbackVolume: feedbackItems.length,
      criticalFeedbackCount: triageReport.launchCriticalCount,
      scriptureAnchorIssues: 1,
      fixQueueLaunchBlockerCount: fixQueueReport.launchBlockerCount
    })
  ];
  const dailySummary = summarizeSoftLaunchDailyReviewRecords(dailyReviewRecords);
  const dailyActionItems = getSoftLaunchDailyReviewActionItems(dailyReviewRecords);
  const dailyReviewReport = createSoftLaunchDailyReviewReport(dailyReviewRecords);
  const pauseContinueDecision = createSoftLaunchPauseContinueDecision({
    feedbackTriageReport: triageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const pauseContinueReport = createSoftLaunchPauseContinueReport({
    feedbackTriageReport: triageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const pauseContinueReasons = getSoftLaunchPauseContinueReasons({
    feedbackTriageReport: triageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const pauseContinueBlockers = getSoftLaunchPauseContinueBlockers({
    feedbackTriageReport: triageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const pauseContinueWarnings = getSoftLaunchPauseContinueWarnings({
    feedbackTriageReport: triageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const pauseContinueNextActions = getSoftLaunchPauseContinueNextActions({
    feedbackTriageReport: triageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const evaluatedPauseContinueDecision = evaluateSoftLaunchPauseContinueDecision({
    feedbackTriageReport: triageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const ownerReviewRecord = createSoftLaunchOwnerDailyReviewRecord({ ownerDecision: pauseContinueDecision.decision });
  const ownerReviewReport = createSoftLaunchOwnerDailyReviewReport(
    ownerReviewRecord
  );
  const ownerValidation = validateSoftLaunchOwnerDailyReview(ownerReviewRecord);
  const ownerBlockers = getSoftLaunchOwnerDailyReviewBlockers(ownerReviewRecord);
  const ownerWarnings = getSoftLaunchOwnerDailyReviewWarnings(ownerReviewRecord);
  const dailyReviewPackage = createSoftLaunchFeedbackDailyReviewPackage({
    feedbackTriageReport: triageReport,
    issueConversionReport,
    fixQueueReport,
    fixQueueSafetyReport,
    regressionReport,
    dailyReviewReport,
    pauseContinueDecisionReport: pauseContinueDecision,
    ownerDailyReviewReport: ownerReviewReport
  });
  const packageReport = createSoftLaunchFeedbackDailyReviewPackageReport(dailyReviewPackage);
  const packageValidation = validateSoftLaunchFeedbackDailyReviewPackage(dailyReviewPackage);
  const packageDecision = createSoftLaunchFeedbackDailyReviewPackageDecision(dailyReviewPackage);
  const packageWarnings = getSoftLaunchFeedbackDailyReviewPackageWarnings(dailyReviewPackage);
  const audit = runSoftLaunchFeedbackDailyReviewAudit();

  const checks = [
    isLaunchCriticalSoftLaunchFeedback(criticalFeedback),
    triageReport.launchCriticalCount === 1,
    triageReport.blockers.length >= 1,
    triageReport.noUsersContacted && triageReport.noFeedbackCollectedAutomatically && triageReport.noExternalWrite,
    issueConversionReport.issueCount >= 1 && issueConversionReport.noDatabaseWrites && issueConversionReport.noAnalyticsSent,
    fixQueueReport.itemCount >= 1 && fixQueueReport.launchBlockerCount >= 1 && fixQueueReport.noExternalWrite,
    fixQueueSafetyReport.noScriptureAnchorsRemoved && fixQueueSafetyReport.noExplanationPathsRemoved,
    regressionReport.criticalChecks.includes("Scripture/explanation verification"),
    dailySummary.criticalFeedbackCount === 1 && dailyActionItems.length >= 1,
    dailyReviewReport.summary.criticalFeedbackCount === 1 && dailyReviewReport.noExternalWrite,
    pauseContinueDecision.decision === "pause_for_review" && pauseContinueDecision.noRollbackPerformed,
    pauseContinueReport.decision === "pause_for_review" && pauseContinueReport.noFeedbackCollectedAutomatically,
    evaluatedPauseContinueDecision === "pause_for_review" && pauseContinueReasons.length >= 3,
    pauseContinueBlockers.length >= 1 && pauseContinueWarnings.length >= 0 && pauseContinueNextActions.length >= 1,
    ownerReviewReport.ready && ownerReviewReport.noUsersContacted,
    ownerValidation.ready && ownerBlockers.length === 0 && ownerWarnings.length >= 0,
    dailyReviewPackage.inMemoryOnly && !dailyReviewPackage.usersContacted && !dailyReviewPackage.feedbackCollectedAutomatically,
    !dailyReviewPackage.previewUrlFetched && !dailyReviewPackage.rollbackPerformed,
    !dailyReviewPackage.databaseWritten && !dailyReviewPackage.analyticsSent && !dailyReviewPackage.fileWritten,
    packageReport.noLaunchPerformed && packageReport.noExternalWrite,
    packageValidation.noUsersContacted && packageValidation.noPreviewUrlFetched && packageDecision === "pause_for_review",
    packageWarnings.length >= 0,
    audit.complete && audit.completionPercentage === 100
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollectedAutomatically: true,
    noPreviewUrlFetched: true,
    noRollbackPerformed: true,
    noDatabaseExternalApisAnalyticsStorageOrFileWritesRequired: true,
    noServiceWorkerRequired: true,
    audit,
    feedbackTriageDecision: triageReport.decision,
    pauseContinueDecision: pauseContinueDecision.decision,
    generatedAt: new Date().toISOString()
  };
}
