import { createFinalLaunchBlockerRegister } from "../final-launch-blocker-register";
import { createFinalLaunchOwnerReviewRecord, createFinalLaunchOwnerReviewReport } from "../final-launch-owner-review";
import { runFinalLaunchPreparationAudit } from "../final-launch-preparation-audit";
import { createFinalLaunchPreparationSummaryReport } from "../final-launch-preparation-summary";
import { createFinalLaunchQualityGateReport } from "../final-launch-quality-gate-report";
import { createFinalLaunchReadinessPackage, createFinalLaunchReadinessPackageReport } from "../final-launch-readiness-package";
import { createFinalLaunchSafetyCertificationReport } from "../final-launch-safety-certification";
import { createFinalLaunchSurfaceCertificationReport } from "../final-launch-surface-certification";

export function runProductionLaunchFinalPreparationAuditExample() {
  const finalAudit = runFinalLaunchPreparationAudit();
  const safetyCertification = createFinalLaunchSafetyCertificationReport();
  const qualityGateReport = createFinalLaunchQualityGateReport();
  const surfaceCertification = createFinalLaunchSurfaceCertificationReport();
  const blockerRegister = createFinalLaunchBlockerRegister();
  const readinessPackage = createFinalLaunchReadinessPackage({ blockerRegister });
  const ownerReview = createFinalLaunchOwnerReviewRecord({
    roadmapReviewed: true,
    launchPreparationStepsReviewed: true,
    scriptureAnchoringReviewed: true,
    explanationPathsReviewed: true,
    fallbackSafetyReviewed: true,
    personalizationConsentReviewed: true,
    mobileReadinessReviewed: true,
    accessibilityReadinessReviewed: true,
    privacyBoundariesReviewed: true,
    noExternalAnalyticsConfirmed: true,
    noProductionPersistenceConfirmed: true,
    noLiveAiOrchestrationConfirmed: true,
    softLaunchRunbookReviewed: true,
    feedbackIntakePlanReviewed: true,
    manualPreviewDeploymentReadinessAccepted: true
  });
  const summary = createFinalLaunchPreparationSummaryReport();

  return {
    finalAudit,
    safetyCertification,
    qualityGateReport,
    surfaceCertification,
    blockerRegister,
    readinessPackage,
    readinessPackageReport: createFinalLaunchReadinessPackageReport(readinessPackage),
    ownerReview,
    ownerReviewReport: createFinalLaunchOwnerReviewReport(ownerReview),
    summary,
    finalDecision: readinessPackage.decision,
    generatedAt: new Date().toISOString()
  };
}
