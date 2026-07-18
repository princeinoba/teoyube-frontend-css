import type { TeoyubeSupportTicket } from "../support-desk-contracts";
import { runPostLaunch72Audit } from "../post-launch-7-2-audit";
import { createSupportIssueFixBridgeReport } from "../support-issue-fix-bridge";
import { createSupportDeskReport, createSupportDeskWorkflow, createSupportTicket, validateSupportTicket } from "../support-desk-workflow";
import { createWeeklyFeedbackReview, createWeeklyFeedbackReviewReport } from "../weekly-feedback-review";
import { createWeeklyImprovementPackage, createWeeklyImprovementPackageReport } from "../weekly-improvement-package";
import { createWeeklyImprovementPlan, createWeeklyImprovementReport } from "../weekly-improvement-loop";
import { createWeeklyOwnerReviewChecklist, createWeeklyOwnerReviewRecord, createWeeklyOwnerReviewReport } from "../weekly-owner-review";
import { runPostLaunchOperations72Example } from "./post-launch-operations-7-2-example";

export type TeoyubePostLaunchOperations72SmokeCheck = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string) {
  return { id, passed, details };
}

export function runPostLaunchOperations72SmokeCheck(): TeoyubePostLaunchOperations72SmokeCheck {
  const example = runPostLaunchOperations72Example();
  const workflow = createSupportDeskWorkflow();
  const ticket = createSupportTicket({
    id: "smoke_ticket_mobile",
    summary: "Mobile Calling Compass layout needs clearer spacing.",
    redactedNotes: ["Manual sanitized note."]
  });
  const supportReport = createSupportDeskReport([ticket]);
  const ticketValidation = validateSupportTicket(ticket);
  const unsafeTicket: TeoyubeSupportTicket = createSupportTicket({
    id: "smoke_ticket_unsafe",
    summary: "Please remove Scripture anchors and enable external analytics.",
    redactedNotes: ["Unsafe requested change for smoke check."]
  });
  const unsafeBridgeReport = createSupportIssueFixBridgeReport([unsafeTicket]);
  const weeklyFeedback = createWeeklyFeedbackReview([
    {
      id: "smoke_feedback",
      summary: "Scripture clarity and fallback quality were helpful.",
      redactedNotes: ["Manual feedback only."]
    }
  ]);
  const feedbackReport = createWeeklyFeedbackReviewReport(weeklyFeedback);
  const improvementPlan = createWeeklyImprovementPlan({
    items: [{
      id: "smoke_improvement",
      title: "Improve Scripture clarity label",
      category: "scripture_coverage",
      priority: "medium",
      sourceIds: ["smoke_feedback"],
      verificationRequired: ["Owner review", "Scripture anchor regression check"]
    }]
  });
  const improvementReport = createWeeklyImprovementReport(improvementPlan.items);
  const ownerReview = createWeeklyOwnerReviewReport(createWeeklyOwnerReviewRecord());
  const weeklyPackage = createWeeklyImprovementPackage({
    supportTickets: [ticket],
    feedback: weeklyFeedback,
    improvementItems: improvementPlan.items,
    ownerReviewRecord: ownerReview.record
  });
  const weeklyPackageReport = createWeeklyImprovementPackageReport(weeklyPackage);
  const audit = runPostLaunch72Audit();

  const checks = [
    check("support_contracts_compile", Boolean(ticket.id && ticket.category && ticket.severity), "Support ticket contracts compile and create typed tickets."),
    check("support_workflow_in_memory_only", workflow.inMemoryOnly && workflow.manualOnly && supportReport.ready && supportReport.noDatabaseWrites, "Support workflow works in memory only."),
    check("support_ticket_validation", ticketValidation.valid && supportReport.sanitizedOnly, "Support tickets validate after sanitization."),
    check("feedback_review_manual_only", feedbackReport.ready && feedbackReport.noAutomaticFeedbackCollection && feedbackReport.noUsersContacted, "Feedback review uses supplied manual entries and collects nothing automatically."),
    check("weekly_improvement_priorities", improvementReport.ready && improvementReport.prioritizedItems.length === 1 && improvementReport.prioritizedItems[0].priority === "medium", "Weekly improvement plan creates structured priorities."),
    check("fix_bridge_blocks_unsafe_changes", !unsafeBridgeReport.ready && unsafeBridgeReport.blockers.length >= 1 && unsafeBridgeReport.noScriptureAnchorsRemoved, "Fix bridge blocks unsafe support requests."),
    check("owner_review_checklist_exists", createWeeklyOwnerReviewChecklist().length >= 9 && ownerReview.ready, "Owner review checklist exists and record validates."),
    check("weekly_package_in_memory_only", weeklyPackageReport.ready && weeklyPackage.inMemoryOnly && weeklyPackageReport.inMemoryOnly && weeklyPackageReport.noExternalWrite, "Weekly improvement package is in-memory only."),
    check("audit_structured", audit.complete && audit.completionPercentage === 100 && audit.nextStep === "TEOYUBE Phase 3 - Intelligent Architecture Integration", "7.2 audit returns a structured complete report."),
    check("no_users_contacted", supportReport.noUsersContacted && feedbackReport.noUsersContacted && weeklyPackageReport.noUsersContacted, "No users are contacted."),
    check("no_external_analytics", supportReport.noAnalyticsSent && feedbackReport.noAnalyticsSent && weeklyPackageReport.noExternalAnalyticsEnabled, "No external analytics are sent."),
    check("no_database_persistence", supportReport.noDatabaseWrites && feedbackReport.noDatabaseWrites && weeklyPackageReport.noProductionPersistenceEnabled, "No database persistence is enabled."),
    check("no_live_ai", supportReport.noLiveAiOrchestrationEnabled && feedbackReport.noLiveAiOrchestrationEnabled && weeklyPackageReport.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    check("no_public_urls_fetched", supportReport.noPublicUrlFetched && feedbackReport.noPublicUrlFetched && weeklyPackageReport.noPublicUrlFetched, "No public URLs are fetched."),
    check("example_runs", example.audit.complete && example.weeklyImprovementPackageReport.ready, "Post-Launch Operations 7.2 example runs.")
  ];

  return {
    valid: checks.every((entry) => entry.passed),
    checks,
    generatedAt: new Date().toISOString()
  };
}
