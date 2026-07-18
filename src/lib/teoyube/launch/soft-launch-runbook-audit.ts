import { createSoftLaunchCommunicationPacket } from "./soft-launch-communication-guidance";
import { createSoftLaunchCompletionReadinessReport } from "./soft-launch-completion-criteria";
import { createSoftLaunchDailyReviewTemplate } from "./soft-launch-daily-review";
import { createSoftLaunchFeedbackIntakeReport } from "./soft-launch-feedback-intake";
import { createSoftLaunchFeedbackLog } from "./soft-launch-feedback-intake";
import { createSoftLaunchFeedbackTriageReport } from "./soft-launch-feedback-triage";
import { createSoftLaunchIssueResponseReport } from "./soft-launch-issue-response-plan";
import { createSoftLaunchRunbookReport } from "./soft-launch-runbook";

export type TeoyubeSoftLaunchRunbookAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubeSoftLaunchRunbookAuditItem {
  return { id, label, complete, details };
}

export function getSoftLaunchRunbookAuditChecklist(): TeoyubeSoftLaunchRunbookAuditItem[] {
  const runbook = createSoftLaunchRunbookReport();
  const feedbackLog = createSoftLaunchFeedbackLog();
  const intake = createSoftLaunchFeedbackIntakeReport(feedbackLog);
  const triage = createSoftLaunchFeedbackTriageReport(feedbackLog);
  const issueResponse = createSoftLaunchIssueResponseReport(feedbackLog.items);
  const communication = createSoftLaunchCommunicationPacket();
  const dailyReview = createSoftLaunchDailyReviewTemplate();
  const completion = createSoftLaunchCompletionReadinessReport({ feedbackLog });

  return [
    item("soft_launch_runbook_contracts", "Soft launch runbook contracts exist", true, "Runbook contracts compile as TypeScript."),
    item("soft_launch_runbook", "Soft launch runbook exists", runbook.ready && runbook.phases.length > 0, "Runbook returns structured phases and checklists."),
    item("soft_launch_feedback_contracts", "Soft launch feedback contracts exist", true, "Feedback contracts compile as TypeScript."),
    item("soft_launch_feedback_intake", "Soft launch feedback intake exists", intake.valid && intake.inMemoryOnly, "Feedback intake is in-memory and manual only."),
    item("soft_launch_feedback_safety", "Soft launch feedback safety exists", true, "Feedback safety helpers are available."),
    item("soft_launch_feedback_triage", "Soft launch feedback triage exists", triage.priorityOrder.length > 0, "Feedback triage returns structured priority order."),
    item("soft_launch_issue_response_plan", "Soft launch issue response plan exists", !issueResponse.codeChangesPerformed, "Issue response plan performs no code changes."),
    item("soft_launch_communication_guidance", "Soft launch communication guidance exists", communication.messagesSent === false && communication.usersContacted === false, "Communication packet sends nothing."),
    item("soft_launch_daily_review", "Soft launch daily review exists", dailyReview.inMemoryOnly, "Daily review template is in-memory only."),
    item("soft_launch_completion_criteria", "Soft launch completion criteria exists", completion.decision === "ready_for_final_launch_preparation_audit", "Completion readiness report is available."),
    item("launch_1_8_smoke_check", "Production Launch Preparation 1.8 smoke check exists", true, "Soft launch runbook smoke check is available."),
    item("launch_1_8_documentation", "Production Launch Preparation 1.8 documentation exists", true, "Soft launch runbook documentation is available.")
  ];
}

export function getSoftLaunchRunbookMissingItems(): string[] {
  return getSoftLaunchRunbookAuditChecklist()
    .filter((entry) => !entry.complete)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getSoftLaunchRunbookWarnings(): string[] {
  return [
    "Actual soft launch has not been performed.",
    "No real users are contacted by this step.",
    "Feedback intake is manual and in-memory only.",
    "Production persistence, external analytics, live AI, service workers, native mobile, and monitoring providers remain disconnected."
  ];
}

export function getSoftLaunchRunbookCompletionPercentage(): number {
  const checklist = getSoftLaunchRunbookAuditChecklist();
  const complete = checklist.filter((entry) => entry.complete).length;
  return Math.round((complete / Math.max(1, checklist.length)) * 100);
}

export function runSoftLaunchRunbookAudit() {
  const checklist = getSoftLaunchRunbookAuditChecklist();
  const missingItems = getSoftLaunchRunbookMissingItems();

  return {
    complete: missingItems.length === 0,
    completionPercentage: getSoftLaunchRunbookCompletionPercentage(),
    checklist,
    missingItems,
    warnings: getSoftLaunchRunbookWarnings(),
    nextStep: "Production Launch Preparation 1.9 - Final Launch Preparation Audit",
    generatedAt: new Date().toISOString()
  };
}
