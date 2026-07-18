import { createPublicDailyReviewRecord, createPublicDailyReviewReport } from "../public-daily-review-manager";
import { createPublicFeedbackDailyReviewPackage, createPublicFeedbackDailyReviewPackageReport, createPublicFeedbackTriageItem } from "../public-feedback-daily-review-package";
import { runPublicFeedbackDailyReviewAudit } from "../public-feedback-daily-review-audit";
import { createPublicFeedbackIssueConversionReport, createIssuesFromPublicFeedback } from "../public-feedback-issue-converter";
import { createPublicFeedbackTriageReport } from "../public-feedback-triage-engine";
import { createPublicFixQueue, addPublicFixQueueItems, createPublicFixQueueReport } from "../public-fix-queue-manager";
import { createPublicFixQueueSafetyReport } from "../public-fix-queue-safety";
import { createPublicFixRegressionReport } from "../public-fix-regression-mapper";
import { createPublicOwnerDailyReviewRecord, createPublicOwnerDailyReviewReport } from "../public-owner-daily-review";
import { createPublicPauseContinueReport } from "../public-pause-continue-decision";

export function runPublicLaunchExecution63Example() {
  const feedbackItems = [
    createPublicFeedbackTriageItem({
      id: "public_scripture_anchor_feedback",
      category: "scripture_anchor",
      summary: "Scripture anchor missing on a public TIG response.",
      redactedNotes: ["Sanitized manual note only."],
      publicLaunchCritical: true,
      publicSafetyCritical: true
    }),
    createPublicFeedbackTriageItem({
      id: "public_copy_clarity_feedback",
      category: "public_copy",
      summary: "Public limitations copy could be clearer.",
      redactedNotes: ["No raw sensitive text stored."]
    })
  ];
  const feedbackTriageReport = createPublicFeedbackTriageReport(feedbackItems);
  const issueConversionReport = createPublicFeedbackIssueConversionReport(feedbackItems);
  const fixQueue = addPublicFixQueueItems(createPublicFixQueue(), createIssuesFromPublicFeedback(feedbackItems));
  const fixQueueReport = createPublicFixQueueReport(fixQueue);
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
  const audit = runPublicFeedbackDailyReviewAudit();

  return {
    feedbackTriageReport,
    issueConversionReport,
    fixQueueReport,
    fixQueueSafetyReport,
    regressionReport,
    dailyReviewReport,
    pauseContinueReport,
    ownerDailyReviewReport,
    packageReport: createPublicFeedbackDailyReviewPackageReport(pkg),
    audit,
    generatedAt: new Date().toISOString()
  };
}
