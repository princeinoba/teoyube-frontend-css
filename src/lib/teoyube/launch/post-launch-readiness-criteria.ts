import type { TeoyubePostLaunchReadinessDecision } from "./public-launch-completion-contracts";
import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import { createPublicLaunchCompletionReport } from "./public-launch-completion-review";
import { createPublicLaunchFeedbackSummaryReport } from "./public-launch-feedback-summary";
import { createPublicLaunchFinalSafetyPrivacyReport } from "./public-launch-final-safety-privacy-review";
import { createPublicLaunchIssueClosureReport } from "./public-launch-issue-closure";
import { createPublicLaunchStabilityCertificationReport } from "./public-launch-stability-certification";

export type TeoyubePostLaunchReadinessCriteriaInput = {
  completionReport?: ReturnType<typeof createPublicLaunchCompletionReport>;
  feedbackSummaryReport?: ReturnType<typeof createPublicLaunchFeedbackSummaryReport>;
  issueClosureReport?: ReturnType<typeof createPublicLaunchIssueClosureReport>;
  stabilityCertificationReport?: ReturnType<typeof createPublicLaunchStabilityCertificationReport>;
  finalSafetyPrivacyReport?: ReturnType<typeof createPublicLaunchFinalSafetyPrivacyReport>;
  surfaceReadinessReport?: ReturnType<typeof createLaunchSurfaceReadinessReport>;
  publicLaunchExecutionComplete?: boolean;
  postLaunchLimitationsDocumented?: boolean;
  ownerReviewAvailable?: boolean;
  productionServiceStatusExplicit?: boolean;
  productionPersistenceEnabled?: boolean;
  externalAnalyticsEnabled?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  publicLaunchPerformedByCode?: boolean;
  usersContacted?: boolean;
  publicUrlFetched?: boolean;
};

function normalizeInput(input: TeoyubePostLaunchReadinessCriteriaInput = {}) {
  return {
    completionReport: input.completionReport || createPublicLaunchCompletionReport(),
    feedbackSummaryReport: input.feedbackSummaryReport || createPublicLaunchFeedbackSummaryReport(),
    issueClosureReport: input.issueClosureReport || createPublicLaunchIssueClosureReport(),
    stabilityCertificationReport: input.stabilityCertificationReport || createPublicLaunchStabilityCertificationReport(),
    finalSafetyPrivacyReport: input.finalSafetyPrivacyReport || createPublicLaunchFinalSafetyPrivacyReport(),
    surfaceReadinessReport: input.surfaceReadinessReport || createLaunchSurfaceReadinessReport(),
    publicLaunchExecutionComplete: input.publicLaunchExecutionComplete ?? true,
    postLaunchLimitationsDocumented: input.postLaunchLimitationsDocumented ?? true,
    ownerReviewAvailable: input.ownerReviewAvailable ?? true,
    productionServiceStatusExplicit: input.productionServiceStatusExplicit ?? true,
    productionPersistenceEnabled: input.productionPersistenceEnabled ?? false,
    externalAnalyticsEnabled: input.externalAnalyticsEnabled ?? false,
    liveAiOrchestrationEnabled: input.liveAiOrchestrationEnabled ?? false,
    publicLaunchPerformedByCode: input.publicLaunchPerformedByCode ?? false,
    usersContacted: input.usersContacted ?? false,
    publicUrlFetched: input.publicUrlFetched ?? false
  };
}

export function getPostLaunchReadinessCriteria() {
  return [
    "Public Launch Execution complete",
    "Public launch completion review complete",
    "Public feedback summary complete",
    "Public issue closure complete",
    "Public stability certification complete",
    "Final safety/privacy review complete",
    "Final surface readiness complete",
    "No unresolved public-launch-critical blockers",
    "Post-launch known limitations documented",
    "Owner review available",
    "Production service status explicit and controlled",
    "Unapproved database persistence not accidentally enabled",
    "Unapproved external analytics not accidentally enabled",
    "Live AI orchestration not accidentally enabled"
  ];
}

export function getPostLaunchReadinessBlockers(input: TeoyubePostLaunchReadinessCriteriaInput = {}) {
  const normalized = normalizeInput(input);
  return [
    !normalized.publicLaunchExecutionComplete ? { id: "post_launch_criteria_execution_complete", label: "Public Launch Execution", reason: "Public Launch Execution is not marked complete.", requiredAction: "Complete Public Launch Execution before post-launch readiness.", riskLevel: "critical" as const } : undefined,
    !normalized.completionReport.ready ? { id: "post_launch_criteria_completion", label: "Public launch completion review", reason: "Public launch completion review is not ready.", requiredAction: "Resolve completion blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.feedbackSummaryReport.ready ? { id: "post_launch_criteria_feedback", label: "Feedback summary", reason: "Public feedback summary is not ready.", requiredAction: "Resolve feedback summary blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.issueClosureReport.ready ? { id: "post_launch_criteria_issue_closure", label: "Issue closure", reason: "Public issue closure is not ready.", requiredAction: "Close public-launch-critical issues or document owner-reviewed resolution.", riskLevel: "critical" as const } : undefined,
    !normalized.stabilityCertificationReport.ready ? { id: "post_launch_criteria_stability", label: "Public stability certification", reason: "Public launch stability is not certified.", requiredAction: "Resolve stability blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.finalSafetyPrivacyReport.ready ? { id: "post_launch_criteria_final_safety_privacy", label: "Final safety/privacy", reason: "Final public launch safety/privacy review is not ready.", requiredAction: "Resolve safety/privacy blockers.", riskLevel: "critical" as const } : undefined,
    normalized.surfaceReadinessReport.blockers.length > 0 ? { id: "post_launch_criteria_surface_readiness", label: "Surface readiness", reason: "Surface readiness has blockers.", requiredAction: "Resolve surface readiness blockers.", riskLevel: "critical" as const } : undefined,
    normalized.issueClosureReport.publicLaunchCriticalUnresolvedCount > 0 ? { id: "post_launch_criteria_unresolved_critical", label: "Unresolved public-launch-critical blockers", reason: "Public-launch-critical blockers remain unresolved.", requiredAction: "Resolve or owner-document all public-launch-critical blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.postLaunchLimitationsDocumented ? { id: "post_launch_criteria_limitations", label: "Known limitations", reason: "Post-launch limitations are not documented.", requiredAction: "Document known limitations.", riskLevel: "high" as const } : undefined,
    !normalized.ownerReviewAvailable ? { id: "post_launch_criteria_owner_review", label: "Owner review", reason: "Owner review is not available.", requiredAction: "Complete structured owner review.", riskLevel: "high" as const } : undefined,
    !normalized.productionServiceStatusExplicit ? { id: "post_launch_criteria_service_status", label: "Production service status", reason: "Production service status is not explicit.", requiredAction: "Document controlled production service status.", riskLevel: "high" as const } : undefined,
    normalized.productionPersistenceEnabled ? { id: "post_launch_criteria_persistence_enabled", label: "Production persistence enabled", reason: "Production persistence must not be accidentally enabled.", requiredAction: "Disable persistence until explicit approval.", riskLevel: "critical" as const } : undefined,
    normalized.externalAnalyticsEnabled ? { id: "post_launch_criteria_analytics_enabled", label: "External analytics enabled", reason: "External analytics must not be accidentally enabled.", requiredAction: "Disable analytics until explicit approval.", riskLevel: "critical" as const } : undefined,
    normalized.liveAiOrchestrationEnabled ? { id: "post_launch_criteria_live_ai_enabled", label: "Live AI orchestration enabled", reason: "Live AI must not be accidentally enabled.", requiredAction: "Disable live AI until explicit approval.", riskLevel: "critical" as const } : undefined,
    normalized.publicLaunchPerformedByCode ? { id: "post_launch_criteria_launch_performed_by_code", label: "Public launch performed by code", reason: "6.5 must not perform public launch.", requiredAction: "Remove launch execution.", riskLevel: "critical" as const } : undefined,
    normalized.usersContacted ? { id: "post_launch_criteria_users_contacted", label: "Users contacted", reason: "6.5 must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    normalized.publicUrlFetched ? { id: "post_launch_criteria_public_url_fetched", label: "Public URL fetched", reason: "6.5 must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPostLaunchReadinessWarnings(input: TeoyubePostLaunchReadinessCriteriaInput = {}) {
  const normalized = normalizeInput(input);
  return [
    ...normalized.completionReport.warnings,
    ...normalized.feedbackSummaryReport.warnings,
    ...normalized.issueClosureReport.warnings,
    ...normalized.stabilityCertificationReport.warnings,
    ...normalized.finalSafetyPrivacyReport.warnings
  ].map((entry, index) => ({
    id: `post_launch_criteria_warning_${index}`,
    label: entry.label,
    message: "message" in entry ? entry.message : "Post-launch readiness warning.",
    recommendedAction: "recommendedAction" in entry ? entry.recommendedAction : "Document owner acceptance.",
    riskLevel: "medium" as const
  }));
}

export function createPostLaunchReadinessCriteriaDecision(input: TeoyubePostLaunchReadinessCriteriaInput = {}): TeoyubePostLaunchReadinessDecision {
  const normalized = normalizeInput(input);
  const blockers = getPostLaunchReadinessBlockers(normalized);
  if (blockers.some((entry) => entry.id.includes("final_safety_privacy") || entry.id.includes("scripture") || entry.id.includes("privacy"))) return "needs_safety_review";
  if (blockers.some((entry) => entry.id.includes("surface"))) return "needs_qa_review";
  if (blockers.length > 0) return "blocked";
  if (normalized.completionReport.decision === "not_applicable_no_public_launch_recorded") return "not_applicable_no_public_launch_recorded";
  if (getPostLaunchReadinessWarnings(normalized).length > 0) return "ready_after_owner_review";
  return "ready_for_post_launch_operations";
}

export function validatePostLaunchReadinessCriteria(input: TeoyubePostLaunchReadinessCriteriaInput = {}) {
  const blockers = getPostLaunchReadinessBlockers(input);
  const warnings = getPostLaunchReadinessWarnings(input);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPostLaunchReadinessCriteriaReport(input: TeoyubePostLaunchReadinessCriteriaInput = {}) {
  const normalized = normalizeInput(input);
  const validation = validatePostLaunchReadinessCriteria(normalized);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPostLaunchReadinessCriteriaDecision(normalized),
    criteria: getPostLaunchReadinessCriteria(),
    completionReport: normalized.completionReport,
    feedbackSummaryReport: normalized.feedbackSummaryReport,
    issueClosureReport: normalized.issueClosureReport,
    stabilityCertificationReport: normalized.stabilityCertificationReport,
    finalSafetyPrivacyReport: normalized.finalSafetyPrivacyReport,
    surfaceReadinessReport: normalized.surfaceReadinessReport,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noProductionPersistenceEnabled: true,
    noExternalAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
