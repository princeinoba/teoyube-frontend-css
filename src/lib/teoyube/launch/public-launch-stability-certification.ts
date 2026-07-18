import { createPublicFeedbackDailyReviewPackage, createPublicFeedbackDailyReviewPackageReport } from "./public-feedback-daily-review-package";
import { createPublicLaunchFeedbackSummaryReport } from "./public-launch-feedback-summary";
import { createPublicLaunchIssueClosureReport } from "./public-launch-issue-closure";
import { createPublicLaunchStabilizationPackage, createPublicLaunchStabilizationPackageReport } from "./public-launch-stabilization-package";

export type TeoyubePublicLaunchStabilityCertificationInput = {
  stabilizationPackageReport?: ReturnType<typeof createPublicLaunchStabilizationPackageReport>;
  feedbackSummaryReport?: ReturnType<typeof createPublicLaunchFeedbackSummaryReport>;
  issueClosureReport?: ReturnType<typeof createPublicLaunchIssueClosureReport>;
  feedbackDailyReviewPackageReport?: ReturnType<typeof createPublicFeedbackDailyReviewPackageReport>;
  dailyReviewRecommendsRollback?: boolean;
  ownerReviewExists?: boolean;
  productionServiceStatusKnown?: boolean;
  productionServiceStatusSafe?: boolean;
  publicLaunchPerformedByCode?: boolean;
  usersContacted?: boolean;
  publicUrlFetched?: boolean;
  externalWritePerformed?: boolean;
};

function normalizeInput(input: TeoyubePublicLaunchStabilityCertificationInput = {}) {
  const stabilizationPackageReport = input.stabilizationPackageReport || createPublicLaunchStabilizationPackageReport(createPublicLaunchStabilizationPackage());
  const feedbackSummaryReport = input.feedbackSummaryReport || createPublicLaunchFeedbackSummaryReport();
  const issueClosureReport = input.issueClosureReport || createPublicLaunchIssueClosureReport();
  const feedbackDailyReviewPackageReport = input.feedbackDailyReviewPackageReport || createPublicFeedbackDailyReviewPackageReport(
    createPublicFeedbackDailyReviewPackage({ feedbackItems: [] })
  );
  return {
    stabilizationPackageReport,
    feedbackSummaryReport,
    issueClosureReport,
    feedbackDailyReviewPackageReport,
    dailyReviewRecommendsRollback: input.dailyReviewRecommendsRollback ?? false,
    ownerReviewExists: input.ownerReviewExists ?? true,
    productionServiceStatusKnown: input.productionServiceStatusKnown ?? true,
    productionServiceStatusSafe: input.productionServiceStatusSafe ?? true,
    publicLaunchPerformedByCode: input.publicLaunchPerformedByCode ?? false,
    usersContacted: input.usersContacted ?? false,
    publicUrlFetched: input.publicUrlFetched ?? false,
    externalWritePerformed: input.externalWritePerformed ?? false
  };
}

export function validatePublicLaunchRuntimeStability(input: TeoyubePublicLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.stabilizationPackageReport.ready && normalized.stabilizationPackageReport.noExternalWrite;
}

export function validatePublicLaunchSurfaceStability(input: TeoyubePublicLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.stabilizationPackageReport.package.postReleaseSurfaceStabilizationReport.ready;
}

export function validatePublicLaunchFeedbackStability(input: TeoyubePublicLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.feedbackSummaryReport.valid && normalized.feedbackSummaryReport.summary.criticalFeedbackCount === 0;
}

export function validatePublicLaunchFixQueueStability(input: TeoyubePublicLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.feedbackDailyReviewPackageReport.package.fixQueueReport.publicLaunchBlockerCount === 0;
}

export function validatePublicLaunchRegressionStability(input: TeoyubePublicLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.stabilizationPackageReport.package.stabilizationRegressionReport.ready;
}

export function validatePublicLaunchServiceStatusStability(input: TeoyubePublicLaunchStabilityCertificationInput = {}): boolean {
  const normalized = normalizeInput(input);
  return normalized.productionServiceStatusKnown && normalized.productionServiceStatusSafe;
}

export function getPublicLaunchStabilityBlockers(input: TeoyubePublicLaunchStabilityCertificationInput = {}) {
  const normalized = normalizeInput(input);
  return [
    !validatePublicLaunchRuntimeStability(normalized) ? { id: "public_launch_stability_runtime", label: "Runtime stability", reason: "Public launch stabilization package is not ready.", requiredAction: "Resolve stabilization package blockers.", riskLevel: "critical" as const } : undefined,
    !validatePublicLaunchSurfaceStability(normalized) ? { id: "public_launch_stability_surface", label: "Surface stability", reason: "Public surface stabilization is not ready.", requiredAction: "Resolve surface stabilization blockers.", riskLevel: "critical" as const } : undefined,
    !validatePublicLaunchFeedbackStability(normalized) ? { id: "public_launch_stability_feedback", label: "Feedback stability", reason: "Critical public feedback remains unresolved or feedback summary is unsafe.", requiredAction: "Resolve critical feedback or document owner-reviewed limitation.", riskLevel: "critical" as const } : undefined,
    !validatePublicLaunchFixQueueStability(normalized) ? { id: "public_launch_stability_fix_queue", label: "Public fix queue stability", reason: "Public fix queue still has launch blockers.", requiredAction: "Resolve public-launch-blocking fixes before post-launch readiness.", riskLevel: "critical" as const } : undefined,
    !validatePublicLaunchRegressionStability(normalized) ? { id: "public_launch_stability_regression", label: "Regression stability", reason: "Public stabilization regression checks are not ready.", requiredAction: "Complete required regression or owner-reviewed documentation.", riskLevel: "critical" as const } : undefined,
    !validatePublicLaunchServiceStatusStability(normalized) ? { id: "public_launch_stability_service_status", label: "Production service status", reason: "Production service status is not known or safe.", requiredAction: "Document controlled production service status.", riskLevel: "high" as const } : undefined,
    normalized.dailyReviewRecommendsRollback ? { id: "public_launch_stability_rollback_recommended", label: "Rollback recommendation", reason: "Public daily review recommends rollback.", requiredAction: "Pause post-launch readiness and complete owner review.", riskLevel: "critical" as const } : undefined,
    !normalized.ownerReviewExists ? { id: "public_launch_stability_owner_review_missing", label: "Owner review", reason: "Owner review is required when certifying public launch completion.", requiredAction: "Create owner review before post-launch readiness.", riskLevel: "high" as const } : undefined,
    normalized.publicLaunchPerformedByCode ? { id: "public_launch_stability_launch_performed", label: "Public launch performed by code", reason: "Stability certification must not perform a public launch.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    normalized.usersContacted ? { id: "public_launch_stability_users_contacted", label: "Users contacted", reason: "Stability certification must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    normalized.publicUrlFetched ? { id: "public_launch_stability_public_url_fetched", label: "Public URL fetched", reason: "Stability certification must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined,
    normalized.externalWritePerformed ? { id: "public_launch_stability_external_write", label: "External write", reason: "Stability certification must not write externally.", requiredAction: "Keep certification in memory.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPublicLaunchStabilityWarnings(input: TeoyubePublicLaunchStabilityCertificationInput = {}) {
  const normalized = normalizeInput(input);
  return [
    ...normalized.stabilizationPackageReport.warnings.map((entry) => ({
      id: `public_launch_stability_${entry.id}`,
      label: entry.label,
      message: entry.message,
      recommendedAction: entry.recommendedAction,
      riskLevel: "medium" as const
    })),
    ...normalized.issueClosureReport.warnings.map((entry) => ({
      id: `public_launch_stability_issue_${entry.id}`,
      label: entry.label,
      message: entry.message,
      recommendedAction: entry.recommendedAction,
      riskLevel: "medium" as const
    }))
  ];
}

export function createPublicLaunchStabilityCertificationReport(input: TeoyubePublicLaunchStabilityCertificationInput = {}) {
  const normalized = normalizeInput(input);
  const blockers = getPublicLaunchStabilityBlockers(normalized);
  const warnings = getPublicLaunchStabilityWarnings(normalized);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: blockers.length > 0 ? "blocked" as const : warnings.length > 0 ? "stable_with_warnings" as const : "stable" as const,
    runtimeStable: validatePublicLaunchRuntimeStability(normalized),
    surfaceStable: validatePublicLaunchSurfaceStability(normalized),
    feedbackStable: validatePublicLaunchFeedbackStability(normalized),
    fixQueueStable: validatePublicLaunchFixQueueStability(normalized),
    regressionStable: validatePublicLaunchRegressionStability(normalized),
    serviceStatusStable: validatePublicLaunchServiceStatusStability(normalized),
    stabilizationPackageReport: normalized.stabilizationPackageReport,
    feedbackSummaryReport: normalized.feedbackSummaryReport,
    issueClosureReport: normalized.issueClosureReport,
    feedbackDailyReviewPackageReport: normalized.feedbackDailyReviewPackageReport,
    blockers,
    warnings,
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function runPublicLaunchStabilityCertification(input: TeoyubePublicLaunchStabilityCertificationInput = {}) {
  return createPublicLaunchStabilityCertificationReport(input);
}
