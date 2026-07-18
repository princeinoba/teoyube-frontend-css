import { createSoftLaunchCommunicationPacket } from "../soft-launch-communication-guidance";
import { createSoftLaunchCompletionReadinessReport } from "../soft-launch-completion-criteria";
import { createSoftLaunchDailyReviewRecord, createSoftLaunchDailyReviewReport } from "../soft-launch-daily-review";
import { addSoftLaunchFeedbackItem, createSoftLaunchFeedbackIntakeReport, createSoftLaunchFeedbackItem, createSoftLaunchFeedbackLog } from "../soft-launch-feedback-intake";
import { sanitizeSoftLaunchFeedbackText } from "../soft-launch-feedback-safety";
import { createSoftLaunchFeedbackTriageReport } from "../soft-launch-feedback-triage";
import { createSoftLaunchIssueResponseReport } from "../soft-launch-issue-response-plan";
import { createSoftLaunchRunbookReport } from "../soft-launch-runbook";
import { runSoftLaunchRunbookAudit } from "../soft-launch-runbook-audit";

export type ProductionLaunchSoftLaunchRunbookSmokeCheckResult = {
  valid: boolean;
  errors: string[];
  noActualLaunchPerformed: boolean;
  noUsersContacted: boolean;
  noExternalSystemsRequired: boolean;
  notes: string[];
  generatedAt: string;
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runProductionLaunchSoftLaunchRunbookSmokeCheck(): ProductionLaunchSoftLaunchRunbookSmokeCheckResult {
  const runbook = createSoftLaunchRunbookReport();
  const sanitized = sanitizeSoftLaunchFeedbackText("Please contact me at person@example.com");
  const feedbackLog = addSoftLaunchFeedbackItem(
    createSoftLaunchFeedbackLog(),
    createSoftLaunchFeedbackItem({
      type: "content_clarity",
      category: "content",
      severity: "low",
      surface: "TIG Response Panel",
      summary: "Sample feedback for smoke check.",
      notes: "Reviewer email person@example.com should be redacted."
    })
  );
  const feedbackReport = createSoftLaunchFeedbackIntakeReport(feedbackLog);
  const triage = createSoftLaunchFeedbackTriageReport(feedbackLog);
  const issueResponse = createSoftLaunchIssueResponseReport(feedbackLog.items);
  const communication = createSoftLaunchCommunicationPacket();
  const dailyRecord = createSoftLaunchDailyReviewRecord({ feedbackVolume: feedbackLog.items.length });
  const dailyReview = createSoftLaunchDailyReviewReport([dailyRecord]);
  const completion = createSoftLaunchCompletionReadinessReport({ feedbackLog, dailyReviewRecords: [dailyRecord] });
  const audit = runSoftLaunchRunbookAudit();

  const errors = clean([
    runbook.ready && runbook.phases.length > 0 ? "" : "Runbook should return structured phases.",
    runbook.actualLaunchPerformed === false ? "" : "Runbook must not perform an actual launch.",
    feedbackReport.inMemoryOnly && !feedbackReport.analyticsSent && !feedbackReport.databaseWritten && !feedbackReport.fileWritten ? "" : "Feedback log should remain in-memory only.",
    sanitized.includes("[redacted]") ? "" : "Feedback sanitizer should redact sensitive text.",
    triage.priorityOrder.length > 0 ? "" : "Feedback triage should return a structured report.",
    issueResponse.codeChangesPerformed === false ? "" : "Issue response plan must not make code changes.",
    communication.messagesSent === false && communication.usersContacted === false ? "" : "Communication packet must not send messages or contact users.",
    dailyReview.inMemoryOnly && dailyReview.valid ? "" : "Daily review should work in memory only.",
    completion.decision === "ready_for_final_launch_preparation_audit" ? "" : "Completion criteria should point to final launch preparation audit.",
    audit.complete && audit.completionPercentage === 100 ? "" : "Soft launch runbook audit should be complete."
  ]);

  return {
    valid: errors.length === 0,
    errors,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noExternalSystemsRequired: true,
    notes: [
      "No actual launch is performed.",
      "No users are contacted.",
      "No database, external APIs, analytics provider, service worker, localStorage, cookies, IndexedDB, or file writes are required."
    ],
    generatedAt: new Date().toISOString()
  };
}
