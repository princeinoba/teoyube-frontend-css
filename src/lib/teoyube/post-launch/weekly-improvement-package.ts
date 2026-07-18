import type {
  TeoyubeSupportTicket,
  TeoyubeWeeklyFeedbackItem,
  TeoyubeWeeklyImprovementItem,
  TeoyubeWeeklyImprovementPackage,
  TeoyubeWeeklyOwnerReviewRecord
} from "./support-desk-contracts";
import { createSupportIssueFixBridgeReport } from "./support-issue-fix-bridge";
import { createSupportDeskReport, createSupportTicket } from "./support-desk-workflow";
import { createWeeklyFeedbackReview, createWeeklyFeedbackReviewReport } from "./weekly-feedback-review";
import { createWeeklyImprovementPlan, createWeeklyImprovementReport } from "./weekly-improvement-loop";
import { createWeeklyOwnerReviewRecord, createWeeklyOwnerReviewReport } from "./weekly-owner-review";

export type TeoyubeWeeklyImprovementPackageInput = {
  id?: string;
  label?: string;
  supportTickets?: TeoyubeSupportTicket[];
  feedback?: TeoyubeWeeklyFeedbackItem[];
  improvementItems?: TeoyubeWeeklyImprovementItem[];
  ownerReviewRecord?: TeoyubeWeeklyOwnerReviewRecord;
  nextActionRecommendation?: string;
};

function defaultSupportTickets(): TeoyubeSupportTicket[] {
  return [
    createSupportTicket({
      id: "support_ticket_mobile_spacing",
      source: "manual_support",
      summary: "Mobile layout spacing is tight on the public Prayer Companion surface.",
      redactedNotes: ["Manual support note; no raw sensitive text retained."]
    })
  ];
}

function defaultFeedback(): TeoyubeWeeklyFeedbackItem[] {
  return createWeeklyFeedbackReview([
    {
      id: "weekly_feedback_scripture_clarity",
      summary: "Scripture explanation was helpful but could name the anchor more clearly.",
      redactedNotes: ["Manual feedback summary only."],
      severity: "low"
    }
  ]);
}

function defaultImprovementItems(): TeoyubeWeeklyImprovementItem[] {
  return createWeeklyImprovementPlan({
    items: [{
      id: "weekly_improvement_scripture_anchor_copy",
      title: "Clarify Scripture anchor copy in weekly public surfaces",
      category: "scripture_coverage",
      priority: "medium",
      sourceIds: ["weekly_feedback_scripture_clarity"],
      rationale: "Manual weekly review found a clarity improvement that preserves Scripture anchoring.",
      verificationRequired: ["Owner review", "Scripture anchor regression check", "Explanation path regression check"]
    }]
  }).items;
}

export function createWeeklyImprovementPackage(input: TeoyubeWeeklyImprovementPackageInput = {}): TeoyubeWeeklyImprovementPackage {
  const supportTickets = input.supportTickets || defaultSupportTickets();
  const feedback = input.feedback || defaultFeedback();
  const improvementItems = input.improvementItems || defaultImprovementItems();
  const supportDeskReport = createSupportDeskReport(supportTickets);
  const weeklyFeedbackReview = createWeeklyFeedbackReviewReport(feedback);
  const weeklyImprovementPlan = createWeeklyImprovementReport(improvementItems);
  const supportIssueFixBridgeReport = createSupportIssueFixBridgeReport(supportTickets);
  const ownerReview = createWeeklyOwnerReviewReport(input.ownerReviewRecord || createWeeklyOwnerReviewRecord());

  return {
    id: input.id || "post_launch_7_2_weekly_improvement_package",
    label: input.label || "Post-Launch Operations 7.2 Weekly Improvement Package",
    supportDeskReport,
    weeklyFeedbackReview,
    weeklyImprovementPlan,
    supportIssueFixBridgeReport,
    ownerReview,
    nextActionRecommendation: input.nextActionRecommendation || "Review support, feedback, and safe fix candidates with the owner before scheduling next-week improvements.",
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    liveAiOrchestrationEnabled: false,
    hiddenPersonalizationCreated: false,
    generatedAt: new Date().toISOString()
  };
}

export function getWeeklyImprovementPackageBlockers(pkg: TeoyubeWeeklyImprovementPackage) {
  return [
    ...pkg.supportDeskReport.blockers,
    ...pkg.weeklyFeedbackReview.blockers,
    ...pkg.weeklyImprovementPlan.blockers,
    ...pkg.supportIssueFixBridgeReport.blockers,
    ...pkg.ownerReview.blockers,
    pkg.fileWritten ? { id: "weekly_package_file_written", label: pkg.label, category: "feedback" as const, severity: "critical" as const, reason: "Weekly improvement package must not write files.", requiredAction: "Keep the package in memory." } : undefined,
    pkg.usersContacted || pkg.feedbackCollectedAutomatically || pkg.publicUrlFetched || pkg.databaseWritten || pkg.analyticsSent || pkg.externalServicesCalled || pkg.liveAiOrchestrationEnabled
      ? { id: "weekly_package_external_side_effect", label: pkg.label, category: "privacy_terms_consent" as const, severity: "critical" as const, reason: "Weekly improvement package must not perform external side effects.", requiredAction: "Keep weekly review manual and owner-controlled." }
      : undefined,
    pkg.hiddenPersonalizationCreated ? { id: "weekly_package_hidden_personalization", label: pkg.label, category: "personalization" as const, severity: "critical" as const, reason: "Weekly improvement package must not create hidden personalization.", requiredAction: "Keep personalization consent-aware and visible." } : undefined
  ].filter(Boolean);
}

export function getWeeklyImprovementPackageWarnings(pkg: TeoyubeWeeklyImprovementPackage) {
  return [
    ...pkg.supportDeskReport.warnings,
    ...pkg.weeklyFeedbackReview.warnings,
    ...pkg.weeklyImprovementPlan.warnings,
    ...pkg.supportIssueFixBridgeReport.warnings,
    ...pkg.ownerReview.warnings
  ];
}

export function createWeeklyImprovementPackageDecision(pkg: TeoyubeWeeklyImprovementPackage) {
  const blockers = getWeeklyImprovementPackageBlockers(pkg);
  const warnings = getWeeklyImprovementPackageWarnings(pkg);
  if (blockers.length > 0) return "blocked";
  if (warnings.length > 0) return "ready_with_warnings";
  return "ready_for_next_week_planning";
}

export function validateWeeklyImprovementPackage(pkg: TeoyubeWeeklyImprovementPackage) {
  const blockers = getWeeklyImprovementPackageBlockers(pkg);
  const warnings = getWeeklyImprovementPackageWarnings(pkg);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createWeeklyImprovementPackageReport(pkg: TeoyubeWeeklyImprovementPackage = createWeeklyImprovementPackage()) {
  const validation = validateWeeklyImprovementPackage(pkg);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createWeeklyImprovementPackageDecision(pkg),
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
    inMemoryOnly: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noProductionPersistenceEnabled: true,
    noExternalAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    noHiddenPersonalizationCreated: true,
    generatedAt: new Date().toISOString()
  };
}
