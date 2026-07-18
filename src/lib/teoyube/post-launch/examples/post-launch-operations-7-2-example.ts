import { runPostLaunch72Audit } from "../post-launch-7-2-audit";
import { createSupportIssueFixBridgeReport, createFixCandidatesFromSupportTickets } from "../support-issue-fix-bridge";
import { createSupportDeskReport, createSupportTicket, sanitizeSupportTicket } from "../support-desk-workflow";
import { createWeeklyFeedbackReview, createWeeklyFeedbackReviewReport } from "../weekly-feedback-review";
import { createWeeklyImprovementPackage, createWeeklyImprovementPackageReport } from "../weekly-improvement-package";
import { createWeeklyImprovementPlan, createWeeklyImprovementReport } from "../weekly-improvement-loop";
import { createWeeklyOwnerReviewRecord, createWeeklyOwnerReviewReport } from "../weekly-owner-review";

export function runPostLaunchOperations72Example() {
  const supportTickets = [
    sanitizeSupportTicket(createSupportTicket({
      id: "example_ticket_mobile",
      source: "manual_support",
      summary: "Mobile Prayer Companion layout is hard to scan.",
      redactedNotes: ["Manual note, no raw sensitive text retained."]
    })),
    sanitizeSupportTicket(createSupportTicket({
      id: "example_ticket_scripture",
      source: "manual_feedback",
      summary: "Scripture anchor should be clearer in the WordCard explanation path.",
      redactedNotes: ["Manual note, no raw sensitive text retained."]
    }))
  ];
  const supportDeskReport = createSupportDeskReport(supportTickets);

  const weeklyFeedback = createWeeklyFeedbackReview([
    {
      id: "example_feedback_prayer",
      summary: "Prayer Companion was useful but the closing explanation could be clearer.",
      redactedNotes: ["Manual weekly feedback summary."]
    },
    {
      id: "example_feedback_accessibility",
      summary: "Keyboard focus on TIG Graph Explorer needs a clearer state.",
      redactedNotes: ["Manual accessibility feedback summary."],
      severity: "medium"
    }
  ]);
  const weeklyFeedbackReview = createWeeklyFeedbackReviewReport(weeklyFeedback);

  const weeklyImprovementPlan = createWeeklyImprovementPlan({
    items: [
      {
        id: "example_improvement_wordcard",
        title: "Clarify WordCard Scripture explanation copy",
        category: "wordcard_clarity",
        priority: "medium",
        sourceIds: ["example_ticket_scripture"],
        rationale: "Improve clarity while preserving Scripture anchoring and explanation paths.",
        verificationRequired: ["Owner review", "Scripture anchor check", "Explanation path check"]
      },
      {
        id: "example_improvement_accessibility",
        title: "Improve TIG Graph Explorer focus state",
        category: "accessibility_polish",
        priority: "medium",
        sourceIds: ["example_feedback_accessibility"],
        rationale: "Improve keyboard accessibility without adding external services.",
        verificationRequired: ["Keyboard QA", "Owner review"]
      }
    ]
  });
  const weeklyImprovementReport = createWeeklyImprovementReport(weeklyImprovementPlan.items);

  const fixCandidates = createFixCandidatesFromSupportTickets(supportTickets);
  const supportIssueFixBridgeReport = createSupportIssueFixBridgeReport(supportTickets);

  const ownerReview = createWeeklyOwnerReviewReport(createWeeklyOwnerReviewRecord());
  const weeklyImprovementPackage = createWeeklyImprovementPackage({
    supportTickets,
    feedback: weeklyFeedback,
    improvementItems: weeklyImprovementPlan.items,
    ownerReviewRecord: ownerReview.record
  });
  const weeklyImprovementPackageReport = createWeeklyImprovementPackageReport(weeklyImprovementPackage);
  const audit = runPostLaunch72Audit();

  return {
    supportTickets,
    supportDeskReport,
    weeklyFeedback,
    weeklyFeedbackReview,
    weeklyImprovementPlan,
    weeklyImprovementReport,
    fixCandidates,
    supportIssueFixBridgeReport,
    ownerReview,
    weeklyImprovementPackage,
    weeklyImprovementPackageReport,
    audit
  };
}
