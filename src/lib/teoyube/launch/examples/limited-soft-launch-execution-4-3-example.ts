import { createFeedbackIssueConversionReport } from "../soft-launch-feedback-issue-converter";
import { createSoftLaunchFeedbackDailyReviewPackage, createSoftLaunchFeedbackDailyReviewPackageReport, createSoftLaunchFeedbackTriageItem } from "../soft-launch-feedback-daily-review-package";
import { runSoftLaunchFeedbackDailyReviewAudit } from "../soft-launch-feedback-daily-review-audit";
import { createSoftLaunchFeedbackTriageReport } from "../soft-launch-feedback-triage-engine";
import { createSoftLaunchFixQueue, addSoftLaunchFixQueueItems, createSoftLaunchFixQueueReport } from "../soft-launch-fix-queue-manager";
import { createSoftLaunchFixQueueSafetyReport } from "../soft-launch-fix-queue-safety";
import { createSoftLaunchFixRegressionReport } from "../soft-launch-fix-regression-mapper";
import { createSoftLaunchDailyReviewRecord, createSoftLaunchDailyReviewReport } from "../soft-launch-daily-review-manager";
import { createSoftLaunchPauseContinueDecision } from "../soft-launch-pause-continue-decision";
import { createSoftLaunchOwnerDailyReviewRecord, createSoftLaunchOwnerDailyReviewReport } from "../soft-launch-owner-daily-review";

export function runLimitedSoftLaunchExecution43Example() {
  const feedbackItems = [
    createSoftLaunchFeedbackTriageItem({
      id: "example_feedback_scripture",
      category: "scripture_anchor",
      summary: "Scripture anchor missing on manual sample.",
      redactedNotes: ["Manual reviewer reported a missing visible anchor."],
      launchCritical: true,
      safetyCritical: true
    }),
    createSoftLaunchFeedbackTriageItem({
      id: "example_feedback_mobile",
      category: "mobile_ui",
      surface: "Prayer",
      summary: "Mobile spacing needs review.",
      severity: "medium"
    })
  ];
  const feedbackTriageReport = createSoftLaunchFeedbackTriageReport(feedbackItems);
  const issueConversionReport = createFeedbackIssueConversionReport(feedbackItems);
  const fixQueue = addSoftLaunchFixQueueItems(createSoftLaunchFixQueue(), issueConversionReport.issues);
  const fixQueueReport = createSoftLaunchFixQueueReport(fixQueue);
  const fixQueueSafetyReport = createSoftLaunchFixQueueSafetyReport(fixQueue);
  const regressionReport = createSoftLaunchFixRegressionReport(fixQueue);
  const dailyReviewRecord = createSoftLaunchDailyReviewRecord({
    feedbackVolume: feedbackItems.length,
    criticalFeedbackCount: feedbackTriageReport.launchCriticalCount,
    scriptureAnchorIssues: 1,
    mobileAccessibilityIssues: 1,
    fixQueueLaunchBlockerCount: fixQueueReport.launchBlockerCount,
    status: "pause_recommended"
  });
  const dailyReviewReport = createSoftLaunchDailyReviewReport([dailyReviewRecord]);
  const pauseContinueDecisionReport = createSoftLaunchPauseContinueDecision({
    feedbackTriageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const ownerDailyReviewReport = createSoftLaunchOwnerDailyReviewReport(
    createSoftLaunchOwnerDailyReviewRecord({ ownerDecision: pauseContinueDecisionReport.decision })
  );
  const dailyReviewPackage = createSoftLaunchFeedbackDailyReviewPackage({
    feedbackTriageReport,
    issueConversionReport,
    fixQueueReport,
    fixQueueSafetyReport,
    regressionReport,
    dailyReviewReport,
    pauseContinueDecisionReport,
    ownerDailyReviewReport
  });
  const packageReport = createSoftLaunchFeedbackDailyReviewPackageReport(dailyReviewPackage);
  const audit = runSoftLaunchFeedbackDailyReviewAudit();

  return {
    feedbackTriageReport,
    issueConversionReport,
    fixQueueReport,
    fixQueueSafetyReport,
    regressionReport,
    dailyReviewReport,
    pauseContinueDecisionReport,
    ownerDailyReviewReport,
    packageReport,
    audit
  };
}
