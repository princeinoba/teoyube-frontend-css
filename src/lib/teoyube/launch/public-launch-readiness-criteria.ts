import type { TeoyubePublicLaunchReadinessDecision } from "./soft-launch-completion-contracts";
import { createSoftLaunchCompletionReport } from "./soft-launch-completion-review";
import { createSoftLaunchFeedbackSummaryReport } from "./soft-launch-feedback-summary";
import { createSoftLaunchIssueClosureReport } from "./soft-launch-issue-closure";
import { createSoftLaunchStabilityCertificationReport } from "./soft-launch-stability-certification";
import { createSoftLaunchFinalSafetyPrivacyReport } from "./soft-launch-final-safety-privacy-review";
import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";

export type TeoyubePublicLaunchReadinessCriteriaInput = {
  completionReport?: ReturnType<typeof createSoftLaunchCompletionReport>;
  feedbackSummaryReport?: ReturnType<typeof createSoftLaunchFeedbackSummaryReport>;
  issueClosureReport?: ReturnType<typeof createSoftLaunchIssueClosureReport>;
  stabilityCertificationReport?: ReturnType<typeof createSoftLaunchStabilityCertificationReport>;
  finalSafetyPrivacyReport?: ReturnType<typeof createSoftLaunchFinalSafetyPrivacyReport>;
  surfaceReadinessReport?: ReturnType<typeof createLaunchSurfaceReadinessReport>;
  publicLaunchLimitationsDocumented?: boolean;
  ownerReviewAvailable?: boolean;
  productionServiceConnectionPlanExplicit?: boolean;
  productionPersistenceEnabled?: boolean;
  externalAnalyticsEnabled?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  publicLaunchPerformed?: boolean;
  usersContacted?: boolean;
};

function normalizeInput(input: TeoyubePublicLaunchReadinessCriteriaInput = {}) {
  return {
    completionReport: input.completionReport || createSoftLaunchCompletionReport(),
    feedbackSummaryReport: input.feedbackSummaryReport || createSoftLaunchFeedbackSummaryReport(),
    issueClosureReport: input.issueClosureReport || createSoftLaunchIssueClosureReport(),
    stabilityCertificationReport: input.stabilityCertificationReport || createSoftLaunchStabilityCertificationReport(),
    finalSafetyPrivacyReport: input.finalSafetyPrivacyReport || createSoftLaunchFinalSafetyPrivacyReport(),
    surfaceReadinessReport: input.surfaceReadinessReport || createLaunchSurfaceReadinessReport(),
    publicLaunchLimitationsDocumented: input.publicLaunchLimitationsDocumented ?? true,
    ownerReviewAvailable: input.ownerReviewAvailable ?? true,
    productionServiceConnectionPlanExplicit: input.productionServiceConnectionPlanExplicit ?? true,
    productionPersistenceEnabled: input.productionPersistenceEnabled ?? false,
    externalAnalyticsEnabled: input.externalAnalyticsEnabled ?? false,
    liveAiOrchestrationEnabled: input.liveAiOrchestrationEnabled ?? false,
    publicLaunchPerformed: input.publicLaunchPerformed ?? false,
    usersContacted: input.usersContacted ?? false
  };
}

export function getPublicLaunchReadinessCriteria() {
  return [
    "Limited soft launch execution complete",
    "Soft launch completion review complete",
    "Feedback summary complete",
    "Issue closure complete",
    "Stability certification complete",
    "Final safety/privacy review complete",
    "Final surface readiness complete",
    "No unresolved launch-critical blockers",
    "Public launch limitations documented",
    "Owner review available",
    "Production service connection plan explicit and controlled",
    "Database persistence not accidentally enabled",
    "External analytics not accidentally enabled",
    "Live AI orchestration not accidentally enabled"
  ];
}

export function getPublicLaunchReadinessBlockers(input: TeoyubePublicLaunchReadinessCriteriaInput = {}) {
  const normalized = normalizeInput(input);
  return [
    !normalized.completionReport.ready ? { id: "public_launch_criteria_completion", label: "Soft launch completion review", reason: "Soft launch completion review is not ready.", requiredAction: "Resolve completion blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.feedbackSummaryReport.ready ? { id: "public_launch_criteria_feedback", label: "Feedback summary", reason: "Feedback summary is not ready.", requiredAction: "Resolve feedback summary blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.issueClosureReport.ready ? { id: "public_launch_criteria_issue_closure", label: "Issue closure", reason: "Issue closure is not ready.", requiredAction: "Close launch-critical issues or document owner-reviewed resolution.", riskLevel: "critical" as const } : undefined,
    !normalized.stabilityCertificationReport.ready ? { id: "public_launch_criteria_stability", label: "Stability certification", reason: "Soft launch stability is not certified.", requiredAction: "Resolve stability blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.finalSafetyPrivacyReport.ready ? { id: "public_launch_criteria_final_safety_privacy", label: "Final safety/privacy", reason: "Final safety/privacy review is not ready.", requiredAction: "Resolve safety/privacy blockers.", riskLevel: "critical" as const } : undefined,
    normalized.surfaceReadinessReport.blockers.length > 0 ? { id: "public_launch_criteria_surface_readiness", label: "Surface readiness", reason: "Surface readiness has blockers.", requiredAction: "Resolve surface readiness blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.publicLaunchLimitationsDocumented ? { id: "public_launch_criteria_limitations", label: "Known limitations", reason: "Public launch limitations are not documented.", requiredAction: "Document known limitations.", riskLevel: "high" as const } : undefined,
    !normalized.ownerReviewAvailable ? { id: "public_launch_criteria_owner_review", label: "Owner review", reason: "Owner review is not available.", requiredAction: "Complete structured owner review.", riskLevel: "high" as const } : undefined,
    !normalized.productionServiceConnectionPlanExplicit ? { id: "public_launch_criteria_service_plan", label: "Service connection plan", reason: "Production service connection plan is not explicit.", requiredAction: "Document a controlled service connection path.", riskLevel: "high" as const } : undefined,
    normalized.productionPersistenceEnabled ? { id: "public_launch_criteria_persistence_enabled", label: "Production persistence enabled", reason: "Production persistence must not be accidentally enabled.", requiredAction: "Disable persistence until controlled public launch preparation.", riskLevel: "critical" as const } : undefined,
    normalized.externalAnalyticsEnabled ? { id: "public_launch_criteria_analytics_enabled", label: "External analytics enabled", reason: "External analytics must not be accidentally enabled.", requiredAction: "Disable analytics until controlled public launch preparation.", riskLevel: "critical" as const } : undefined,
    normalized.liveAiOrchestrationEnabled ? { id: "public_launch_criteria_live_ai_enabled", label: "Live AI orchestration enabled", reason: "Live AI must not be accidentally enabled.", requiredAction: "Disable live AI until controlled public launch preparation.", riskLevel: "critical" as const } : undefined,
    normalized.publicLaunchPerformed ? { id: "public_launch_criteria_launch_performed", label: "Public launch performed", reason: "4.5 must not perform public launch.", requiredAction: "Remove launch execution.", riskLevel: "critical" as const } : undefined,
    normalized.usersContacted ? { id: "public_launch_criteria_users_contacted", label: "Users contacted", reason: "4.5 must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPublicLaunchReadinessWarnings(input: TeoyubePublicLaunchReadinessCriteriaInput = {}) {
  const normalized = normalizeInput(input);
  return [
    ...normalized.completionReport.warnings,
    ...normalized.feedbackSummaryReport.warnings,
    ...normalized.issueClosureReport.warnings,
    ...normalized.stabilityCertificationReport.warnings,
    ...normalized.finalSafetyPrivacyReport.warnings
  ].map((entry, index) => ({
    id: `public_launch_criteria_warning_${index}`,
    label: entry.label,
    message: "message" in entry ? entry.message : "Public launch readiness warning.",
    recommendedAction: "recommendedAction" in entry ? entry.recommendedAction : "Document owner acceptance.",
    riskLevel: "medium" as const
  }));
}

export function createPublicLaunchReadinessCriteriaDecision(input: TeoyubePublicLaunchReadinessCriteriaInput = {}): TeoyubePublicLaunchReadinessDecision {
  const blockers = getPublicLaunchReadinessBlockers(input);
  if (blockers.some((entry) => entry.id.includes("final_safety_privacy") || entry.id.includes("scripture") || entry.id.includes("privacy"))) return "needs_safety_review";
  if (blockers.some((entry) => entry.id.includes("surface"))) return "needs_qa_review";
  if (blockers.length > 0) return "blocked";
  if (getPublicLaunchReadinessWarnings(input).length > 0) return "ready_after_owner_review";
  return "ready_for_public_launch_preparation";
}

export function validatePublicLaunchReadinessCriteria(input: TeoyubePublicLaunchReadinessCriteriaInput = {}) {
  const blockers = getPublicLaunchReadinessBlockers(input);
  const warnings = getPublicLaunchReadinessWarnings(input);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPublicLaunchReadinessCriteriaReport(input: TeoyubePublicLaunchReadinessCriteriaInput = {}) {
  const normalized = normalizeInput(input);
  const validation = validatePublicLaunchReadinessCriteria(normalized);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPublicLaunchReadinessCriteriaDecision(normalized),
    criteria: getPublicLaunchReadinessCriteria(),
    completionReport: normalized.completionReport,
    feedbackSummaryReport: normalized.feedbackSummaryReport,
    issueClosureReport: normalized.issueClosureReport,
    stabilityCertificationReport: normalized.stabilityCertificationReport,
    finalSafetyPrivacyReport: normalized.finalSafetyPrivacyReport,
    surfaceReadinessReport: normalized.surfaceReadinessReport,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noProductionPersistenceEnabled: true,
    noExternalAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
