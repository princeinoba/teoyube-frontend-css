import { createContentReviewFollowUpReport } from "./content-review-follow-up-plan";
import { createControlledServiceReassessmentReport } from "./controlled-service-reassessment-gate";
import { createMobileAccessibilityHardeningReport } from "./mobile-accessibility-hardening-plan";
import { createPerformanceHardeningReport } from "./performance-hardening-plan";
import {
  createPhase81OwnerReviewRecord,
  createPhase81OwnerReviewReport,
  type TeoyubePhase81OwnerReviewRecord
} from "./phase-8-1-owner-review";
import { createPostBetaReadinessAuditReport } from "./post-beta-readiness-audit";
import { createPrivacySecurityFollowUpReport } from "./privacy-security-follow-up-plan";
import { createProductHardeningPlan, createProductHardeningPlanReport } from "./product-hardening-plan";
import { createPublicReleasePreparationReport } from "./public-release-preparation-plan";
import { createSafeHardeningPatchValidationReport } from "./safe-hardening-patch-validator";
import { createServiceReassessmentEnforcementQaReport } from "./service-reassessment-enforcement-qa";

export type TeoyubePhase81PackageDecision =
  | "phase_8_1_complete"
  | "phase_8_1_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase81PackageModel = {
  id: string;
  postBetaReadinessAuditReport: ReturnType<typeof createPostBetaReadinessAuditReport>;
  productHardeningPlanReport: ReturnType<typeof createProductHardeningPlanReport>;
  safeHardeningPatchValidationReport: ReturnType<typeof createSafeHardeningPatchValidationReport>;
  controlledServiceReassessmentReport: ReturnType<typeof createControlledServiceReassessmentReport>;
  serviceReassessmentEnforcementQaReport: ReturnType<typeof createServiceReassessmentEnforcementQaReport>;
  privacySecurityFollowUpReport: ReturnType<typeof createPrivacySecurityFollowUpReport>;
  performanceHardeningReport: ReturnType<typeof createPerformanceHardeningReport>;
  mobileAccessibilityHardeningReport: ReturnType<typeof createMobileAccessibilityHardeningReport>;
  contentReviewFollowUpReport: ReturnType<typeof createContentReviewFollowUpReport>;
  publicReleasePreparationReport: ReturnType<typeof createPublicReleasePreparationReport>;
  ownerReview: TeoyubePhase81OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase81OwnerReviewReport>;
  safeHardeningPatchesMade: Array<{ file: string; issue: string; safetyReason: string; regressionChecksRequired: string[] }>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.2 - Product Hardening Execution, Mobile/Accessibility Pass & Performance Review";
  noExternalSend: true;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase81PackageReport = {
  valid: boolean;
  decision: TeoyubePhase81PackageDecision;
  package: TeoyubePhase81PackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.2 - Product Hardening Execution, Mobile/Accessibility Pass & Performance Review";
  noExternalSend: true;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function collectMessages(entries: Array<{ message?: string; details?: string } | string>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || "Phase 8.1 package item needs attention.");
}

export function createPhase81Package(input: {
  ownerReview?: TeoyubePhase81OwnerReviewRecord;
  ownerReviewed?: boolean;
  safeHardeningPatchesMade?: TeoyubePhase81PackageModel["safeHardeningPatchesMade"];
} = {}): TeoyubePhase81PackageModel {
  const ownerReviewed = input.ownerReviewed ?? false;
  const productHardeningPlan = createProductHardeningPlan();
  const postBetaReadinessAuditReport = createPostBetaReadinessAuditReport();
  const productHardeningPlanReport = createProductHardeningPlanReport(productHardeningPlan);
  const safeHardeningPatchValidationReport = createSafeHardeningPatchValidationReport(productHardeningPlan.items.filter((entry) => entry.safeLocalPatchCandidate));
  const controlledServiceReassessmentReport = createControlledServiceReassessmentReport();
  const serviceReassessmentEnforcementQaReport = createServiceReassessmentEnforcementQaReport();
  const privacySecurityFollowUpReport = createPrivacySecurityFollowUpReport();
  const performanceHardeningReport = createPerformanceHardeningReport();
  const mobileAccessibilityHardeningReport = createMobileAccessibilityHardeningReport();
  const contentReviewFollowUpReport = createContentReviewFollowUpReport();
  const publicReleasePreparationReport = createPublicReleasePreparationReport({ ownerApproved: ownerReviewed });
  const ownerReview = input.ownerReview || createPhase81OwnerReviewRecord({ reviewed: ownerReviewed });
  const ownerReviewReport = createPhase81OwnerReviewReport(ownerReview);
  const blockers = [
    ...collectMessages(postBetaReadinessAuditReport.blockers),
    ...collectMessages(productHardeningPlanReport.blockers),
    ...collectMessages(safeHardeningPatchValidationReport.blockers),
    ...collectMessages(controlledServiceReassessmentReport.blockers),
    ...serviceReassessmentEnforcementQaReport.blockers,
    ...privacySecurityFollowUpReport.blockers,
    ...performanceHardeningReport.blockers,
    ...mobileAccessibilityHardeningReport.blockers,
    ...contentReviewFollowUpReport.blockers,
    ...collectMessages(publicReleasePreparationReport.blockers),
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...collectMessages(postBetaReadinessAuditReport.warnings),
    ...collectMessages(productHardeningPlanReport.warnings),
    ...collectMessages(safeHardeningPatchValidationReport.warnings),
    ...collectMessages(controlledServiceReassessmentReport.warnings),
    ...serviceReassessmentEnforcementQaReport.warnings,
    ...privacySecurityFollowUpReport.warnings,
    ...performanceHardeningReport.warnings,
    ...mobileAccessibilityHardeningReport.warnings,
    ...contentReviewFollowUpReport.warnings,
    ...collectMessages(publicReleasePreparationReport.warnings),
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_8_1_package",
    postBetaReadinessAuditReport,
    productHardeningPlanReport,
    safeHardeningPatchValidationReport,
    controlledServiceReassessmentReport,
    serviceReassessmentEnforcementQaReport,
    privacySecurityFollowUpReport,
    performanceHardeningReport,
    mobileAccessibilityHardeningReport,
    contentReviewFollowUpReport,
    publicReleasePreparationReport,
    ownerReview,
    ownerReviewReport,
    safeHardeningPatchesMade: input.safeHardeningPatchesMade || [],
    blockers,
    warnings,
    nextActionRecommendation: "Phase 8.2 - Product Hardening Execution, Mobile/Accessibility Pass & Performance Review",
    noExternalSend: true,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase81PackageBlockers(pkg: TeoyubePhase81PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase81PackageWarnings(pkg: TeoyubePhase81PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase81PackageDecision(pkg: TeoyubePhase81PackageModel): TeoyubePhase81PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return pkg.warnings.length ? "phase_8_1_complete_with_warnings" : "phase_8_1_complete";
}

export function validatePhase81Package(pkg: TeoyubePhase81PackageModel): TeoyubePhase81PackageReport {
  return createPhase81PackageReport(pkg);
}

export function createPhase81PackageReport(pkg: TeoyubePhase81PackageModel): TeoyubePhase81PackageReport {
  const blockers = getPhase81PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase81PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase81PackageWarnings(pkg),
    nextActionRecommendation: "Phase 8.2 - Product Hardening Execution, Mobile/Accessibility Pass & Performance Review",
    noExternalSend: true,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
