import { createSoftLaunchFeedbackSummaryReport } from "./soft-launch-feedback-summary";
import { createSoftLaunchIssueClosureReport } from "./soft-launch-issue-closure";
import { createSoftLaunchStabilizationPackage, createSoftLaunchStabilizationPackageReport } from "./soft-launch-stabilization-package";

export type TeoyubeSoftLaunchStabilityCertificationInput = {
  stabilizationPackageReport?: ReturnType<typeof createSoftLaunchStabilizationPackageReport>;
  feedbackSummaryReport?: ReturnType<typeof createSoftLaunchFeedbackSummaryReport>;
  issueClosureReport?: ReturnType<typeof createSoftLaunchIssueClosureReport>;
  dailyReviewRecommendsRollback?: boolean;
  ownerReviewExists?: boolean;
  publicLaunchPerformed?: boolean;
  usersContacted?: boolean;
  externalWritePerformed?: boolean;
};

function normalizeInput(input: TeoyubeSoftLaunchStabilityCertificationInput = {}) {
  const stabilizationPackageReport = input.stabilizationPackageReport || createSoftLaunchStabilizationPackageReport(createSoftLaunchStabilizationPackage());
  const feedbackSummaryReport = input.feedbackSummaryReport || createSoftLaunchFeedbackSummaryReport();
  const issueClosureReport = input.issueClosureReport || createSoftLaunchIssueClosureReport();
  return {
    stabilizationPackageReport,
    feedbackSummaryReport,
    issueClosureReport,
    dailyReviewRecommendsRollback: input.dailyReviewRecommendsRollback ?? false,
    ownerReviewExists: input.ownerReviewExists ?? true,
    publicLaunchPerformed: input.publicLaunchPerformed ?? false,
    usersContacted: input.usersContacted ?? false,
    externalWritePerformed: input.externalWritePerformed ?? false
  };
}

export function validateSoftLaunchRuntimeStability(input: TeoyubeSoftLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.stabilizationPackageReport.ready && normalized.stabilizationPackageReport.noExternalWrite;
}

export function validateSoftLaunchSurfaceStability(input: TeoyubeSoftLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.stabilizationPackageReport.package.postReleaseSurfaceStabilizationReport.ready;
}

export function validateSoftLaunchFeedbackStability(input: TeoyubeSoftLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.feedbackSummaryReport.valid && normalized.feedbackSummaryReport.summary.criticalFeedbackCount === 0;
}

export function validateSoftLaunchFixQueueStability(input: TeoyubeSoftLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.stabilizationPackageReport.package.fixQueueReport.launchBlockerCount === 0;
}

export function validateSoftLaunchRegressionStability(input: TeoyubeSoftLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.stabilizationPackageReport.package.stabilizationRegressionReport.ready;
}

export function getSoftLaunchStabilityBlockers(input: TeoyubeSoftLaunchStabilityCertificationInput = {}) {
  const normalized = normalizeInput(input);
  return [
    !validateSoftLaunchRuntimeStability(normalized) ? { id: "soft_launch_stability_runtime", label: "Runtime stability", reason: "Runtime stabilization package is not ready.", requiredAction: "Resolve stabilization package blockers.", riskLevel: "critical" as const } : undefined,
    !validateSoftLaunchSurfaceStability(normalized) ? { id: "soft_launch_stability_surface", label: "Surface stability", reason: "Surface stabilization is not ready.", requiredAction: "Resolve surface stabilization blockers.", riskLevel: "critical" as const } : undefined,
    !validateSoftLaunchFeedbackStability(normalized) ? { id: "soft_launch_stability_feedback", label: "Feedback stability", reason: "Critical feedback remains unresolved or feedback summary is unsafe.", requiredAction: "Resolve critical feedback or document owner-reviewed limitation.", riskLevel: "critical" as const } : undefined,
    !validateSoftLaunchFixQueueStability(normalized) ? { id: "soft_launch_stability_fix_queue", label: "Fix queue stability", reason: "Fix queue still has launch blockers.", requiredAction: "Resolve launch-blocking fixes before public launch preparation.", riskLevel: "critical" as const } : undefined,
    !validateSoftLaunchRegressionStability(normalized) ? { id: "soft_launch_stability_regression", label: "Regression stability", reason: "Regression checks are not ready.", requiredAction: "Complete required regression or owner-reviewed documentation.", riskLevel: "critical" as const } : undefined,
    normalized.dailyReviewRecommendsRollback ? { id: "soft_launch_stability_rollback_recommended", label: "Rollback recommendation", reason: "Daily review recommends rollback.", requiredAction: "Pause public launch preparation and complete owner review.", riskLevel: "critical" as const } : undefined,
    !normalized.ownerReviewExists ? { id: "soft_launch_stability_owner_review_missing", label: "Owner review", reason: "Owner review is required when stabilizing soft launch completion.", requiredAction: "Create owner review before public launch preparation.", riskLevel: "high" as const } : undefined,
    normalized.publicLaunchPerformed ? { id: "soft_launch_stability_public_launch_performed", label: "Public launch performed", reason: "Stability certification must not perform a public launch.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    normalized.usersContacted ? { id: "soft_launch_stability_users_contacted", label: "Users contacted", reason: "Stability certification must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    normalized.externalWritePerformed ? { id: "soft_launch_stability_external_write", label: "External write", reason: "Stability certification must not write externally.", requiredAction: "Keep certification in memory.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getSoftLaunchStabilityWarnings(input: TeoyubeSoftLaunchStabilityCertificationInput = {}) {
  const normalized = normalizeInput(input);
  return [
    ...normalized.stabilizationPackageReport.warnings.map((entry) => ({
      id: `soft_launch_stability_${entry.id}`,
      label: entry.label,
      message: entry.message,
      recommendedAction: entry.recommendedAction,
      riskLevel: "medium" as const
    })),
    ...normalized.issueClosureReport.warnings.map((entry) => ({
      id: `soft_launch_stability_issue_${entry.id}`,
      label: entry.label,
      message: entry.message,
      recommendedAction: entry.recommendedAction,
      riskLevel: "medium" as const
    }))
  ];
}

export function createSoftLaunchStabilityCertificationReport(input: TeoyubeSoftLaunchStabilityCertificationInput = {}) {
  const normalized = normalizeInput(input);
  const blockers = getSoftLaunchStabilityBlockers(normalized);
  const warnings = getSoftLaunchStabilityWarnings(normalized);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: blockers.length > 0 ? "blocked" as const : warnings.length > 0 ? "stable_with_warnings" as const : "stable" as const,
    runtimeStable: validateSoftLaunchRuntimeStability(normalized),
    surfaceStable: validateSoftLaunchSurfaceStability(normalized),
    feedbackStable: validateSoftLaunchFeedbackStability(normalized),
    fixQueueStable: validateSoftLaunchFixQueueStability(normalized),
    regressionStable: validateSoftLaunchRegressionStability(normalized),
    stabilizationPackageReport: normalized.stabilizationPackageReport,
    feedbackSummaryReport: normalized.feedbackSummaryReport,
    issueClosureReport: normalized.issueClosureReport,
    blockers,
    warnings,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function runSoftLaunchStabilityCertification(input: TeoyubeSoftLaunchStabilityCertificationInput = {}) {
  return createSoftLaunchStabilityCertificationReport(input);
}
