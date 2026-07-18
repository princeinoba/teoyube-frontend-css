import { createSoftLaunchCommunicationPacket } from "../soft-launch-communication-guidance";
import { createSoftLaunchCompletionReadinessReport } from "../soft-launch-completion-criteria";
import { createSoftLaunchDailyReviewRecord, createSoftLaunchDailyReviewReport } from "../soft-launch-daily-review";
import { addSoftLaunchFeedbackItem, createSoftLaunchFeedbackIntakeReport, createSoftLaunchFeedbackItem, createSoftLaunchFeedbackLog, summarizeSoftLaunchFeedback } from "../soft-launch-feedback-intake";
import { createSoftLaunchFeedbackTriageReport } from "../soft-launch-feedback-triage";
import { createSoftLaunchIssueResponseReport } from "../soft-launch-issue-response-plan";
import { createSoftLaunchRunbook, createSoftLaunchRunbookReport } from "../soft-launch-runbook";
import { runSoftLaunchRunbookAudit } from "../soft-launch-runbook-audit";

export function runProductionLaunchSoftLaunchRunbookExample() {
  const runbook = createSoftLaunchRunbook();
  const runbookReport = createSoftLaunchRunbookReport();
  const feedbackLog = addSoftLaunchFeedbackItem(
    createSoftLaunchFeedbackLog(),
    createSoftLaunchFeedbackItem({
      type: "content_clarity",
      category: "content",
      severity: "low",
      surface: "TIG Response Panel",
      summary: "Sample redacted feedback for the soft launch runbook example.",
      notes: "Example note only; no real participant feedback is collected."
    })
  );
  const feedbackSummary = summarizeSoftLaunchFeedback(feedbackLog);
  const feedbackReport = createSoftLaunchFeedbackIntakeReport(feedbackLog);
  const triageReport = createSoftLaunchFeedbackTriageReport(feedbackLog);
  const issueResponseReport = createSoftLaunchIssueResponseReport(feedbackLog.items);
  const communicationPacket = createSoftLaunchCommunicationPacket();
  const dailyReviewRecord = createSoftLaunchDailyReviewRecord({ feedbackVolume: feedbackSummary.itemCount });
  const dailyReviewReport = createSoftLaunchDailyReviewReport([dailyReviewRecord]);
  const completionReadiness = createSoftLaunchCompletionReadinessReport({
    feedbackLog,
    dailyReviewRecords: [dailyReviewRecord]
  });
  const audit = runSoftLaunchRunbookAudit();

  return {
    runbook,
    runbookReport,
    feedbackLog,
    feedbackSummary,
    feedbackReport,
    triageReport,
    issueResponseReport,
    communicationPacket,
    dailyReviewRecord,
    dailyReviewReport,
    completionReadiness,
    audit,
    actualLaunchPerformed: false,
    usersContacted: false,
    generatedAt: new Date().toISOString()
  };
}
