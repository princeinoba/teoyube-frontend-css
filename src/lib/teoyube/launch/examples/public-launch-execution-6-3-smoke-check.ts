import { createPublicDailyReviewRecord, createPublicDailyReviewReport } from "../public-daily-review-manager";
import { createPublicFeedbackDailyReviewPackage, createPublicFeedbackDailyReviewPackageReport, createPublicFeedbackTriageItem } from "../public-feedback-daily-review-package";
import { runPublicFeedbackDailyReviewAudit } from "../public-feedback-daily-review-audit";
import { createPublicFeedbackIssueConversionReport, createIssuesFromPublicFeedback } from "../public-feedback-issue-converter";
import { createPublicFeedbackTriageReport, isPublicLaunchCriticalFeedback } from "../public-feedback-triage-engine";
import { createPublicFixQueue, addPublicFixQueueItem, addPublicFixQueueItems, createPublicFixQueueReport } from "../public-fix-queue-manager";
import { createPublicFixQueueSafetyReport } from "../public-fix-queue-safety";
import { createPublicFixRegressionReport } from "../public-fix-regression-mapper";
import { createPublicOwnerDailyReviewChecklist, createPublicOwnerDailyReviewRecord, createPublicOwnerDailyReviewReport } from "../public-owner-daily-review";
import { createPublicPauseContinueReport } from "../public-pause-continue-decision";

export function runPublicLaunchExecution63SmokeCheck() {
  const criticalFeedback = createPublicFeedbackTriageItem({
    id: "critical_public_feedback",
    category: "scripture_anchor",
    summary: "Missing Scripture anchor on public response.",
    redactedNotes: ["Sanitized critical sample."],
    publicLaunchCritical: true,
    publicSafetyCritical: true
  });
  const clarityFeedback = createPublicFeedbackTriageItem({
    id: "clarity_public_feedback",
    category: "content_clarity",
    summary: "Public copy could be clearer.",
    severity: "medium"
  });
  const feedbackItems = [criticalFeedback, clarityFeedback];
  const feedbackTriageReport = createPublicFeedbackTriageReport(feedbackItems);
  const issueConversionReport = createPublicFeedbackIssueConversionReport(feedbackItems);
  const fixQueue = addPublicFixQueueItems(createPublicFixQueue(), createIssuesFromPublicFeedback(feedbackItems));
  const fixQueueReport = createPublicFixQueueReport(fixQueue);
  const unsafeQueue = addPublicFixQueueItem(createPublicFixQueue(), {
    title: "Unsafe public fix sample",
    category: "scripture_anchor",
    severity: "critical",
    priority: "public_launch_blocker",
    publicLaunchCritical: true,
    publicSafetyCritical: true,
    proposedFix: "Remove Scripture anchors and enable external analytics.",
    verificationRequired: [],
    status: "new",
    manualOnly: true
  });
  const unsafeSafetyReport = createPublicFixQueueSafetyReport(unsafeQueue);
  const fixQueueSafetyReport = createPublicFixQueueSafetyReport(fixQueue);
  const regressionReport = createPublicFixRegressionReport(fixQueue);
  const dailyReviewReport = createPublicDailyReviewReport([
    createPublicDailyReviewRecord({
      feedbackVolume: feedbackTriageReport.itemCount,
      criticalFeedbackCount: feedbackTriageReport.publicLaunchCriticalCount,
      scriptureAnchorIssues: 1,
      publicFixQueueBlockerCount: fixQueueReport.publicLaunchBlockerCount,
      status: "pause_recommended"
    })
  ]);
  const pauseContinueReport = createPublicPauseContinueReport({ feedbackTriageReport, fixQueueReport, dailyReviewReport });
  const ownerChecklist = createPublicOwnerDailyReviewChecklist();
  const ownerDailyReviewReport = createPublicOwnerDailyReviewReport(createPublicOwnerDailyReviewRecord({ ownerDecision: pauseContinueReport.decision }));
  const pkg = createPublicFeedbackDailyReviewPackage({
    feedbackItems,
    feedbackTriageReport,
    issueConversionReport,
    fixQueueReport,
    fixQueueSafetyReport,
    regressionReport,
    dailyReviewReport,
    pauseContinueReport,
    ownerDailyReviewReport
  });
  const packageReport = createPublicFeedbackDailyReviewPackageReport(pkg);
  const audit = runPublicFeedbackDailyReviewAudit();
  const checks = [
    feedbackTriageReport.itemCount === 2,
    isPublicLaunchCriticalFeedback(criticalFeedback) && feedbackTriageReport.publicLaunchCriticalCount >= 1,
    issueConversionReport.inMemoryOnly && issueConversionReport.noDatabaseWrites && issueConversionReport.issueCount >= 1,
    fixQueue.manualOnly && fixQueue.inMemoryOnly && fixQueueReport.noExternalWrite,
    unsafeSafetyReport.blockers.length >= 1,
    regressionReport.criticalChecks.length >= 1 && regressionReport.noExternalWrite,
    dailyReviewReport.noExternalWrite && dailyReviewReport.summary.recordCount === 1,
    pauseContinueReport.noRollbackPerformed && typeof pauseContinueReport.decision === "string",
    ownerChecklist.length >= 10 && ownerDailyReviewReport.noUsersContacted,
    packageReport.inMemoryOnly && pkg.inMemoryOnly,
    audit.complete && audit.completionPercentage === 100,
    !pkg.usersContacted,
    !pkg.feedbackCollectedAutomatically,
    !pkg.analyticsSent,
    !pkg.databaseWritten,
    !pkg.liveAiOrchestrationEnabled,
    !pkg.fileWritten && !pkg.publicUrlFetched && !pkg.rollbackPerformed
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    publicDailyReviewDecision: dailyReviewReport.decision,
    publicPauseContinueDecision: pauseContinueReport.decision,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noUnapprovedProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noDatabaseExternalApisAnalyticsProviderServiceWorkerLocalStorageCookiesIndexedDbOrFileWritesRequired: true,
    audit,
    generatedAt: new Date().toISOString()
  };
}
