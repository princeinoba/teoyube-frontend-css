import {
  createControlledPublicReleasePreparationReport,
  createControlledPublicReleaseScope,
  createFinalOwnerApprovalGateRecord,
  createFinalOwnerApprovalGateReport,
  createFinalPublicCopyReviewReport,
  createFinalPublicReleaseKnownLimitationsReport,
  createPhase91OwnerReviewRecord,
  createPhase91OwnerReviewReport,
  createPhase91Package,
  createPhase91PackageReport,
  createPublicReleaseOperationalReadinessReport,
  createPublicReleasePreparationPackage,
  createPublicReleasePreparationPackageReport,
  createPublicReleasePrivacySecurityConfirmationReport,
  createPublicReleaseSafetyConfirmationReport,
  createPublicReleaseServiceLockConfirmationReport,
  createSupportFeedbackPublicReadinessReport,
  runPhase91Audit
} from "../phase-9";

export function createPhase91ControlledPublicReleasePreparationExample() {
  const controlledPublicReleaseScope = createControlledPublicReleaseScope();
  const controlledPublicReleasePreparationReport = createControlledPublicReleasePreparationReport({ ownerApprovalRequired: true, publicCopyReviewRequired: true });
  const finalPublicCopyReviewReport = createFinalPublicCopyReviewReport();
  const knownLimitationsFinalReviewReport = createFinalPublicReleaseKnownLimitationsReport();
  const serviceLockConfirmationReport = createPublicReleaseServiceLockConfirmationReport();
  const privacySecurityConfirmationReport = createPublicReleasePrivacySecurityConfirmationReport();
  const safetyConfirmationReport = createPublicReleaseSafetyConfirmationReport();
  const supportFeedbackReadinessReport = createSupportFeedbackPublicReadinessReport();
  const operationalReadinessReport = createPublicReleaseOperationalReadinessReport({ ownerReviewPathExists: true });
  const finalOwnerApprovalGateRecord = createFinalOwnerApprovalGateRecord({
    reviewed: true,
    nextPhaseAccepted: true,
    notes: ["Phase 9.1 example approved for public release candidate QA preparation only."]
  });
  const finalOwnerApprovalGateReport = createFinalOwnerApprovalGateReport(finalOwnerApprovalGateRecord);
  const publicReleasePreparationPackage = createPublicReleasePreparationPackage({ ownerReviewed: true });
  const publicReleasePreparationPackageReport = createPublicReleasePreparationPackageReport(publicReleasePreparationPackage);
  const phase91OwnerReviewRecord = createPhase91OwnerReviewRecord({
    reviewed: true,
    nextPhaseAccepted: true,
    notes: ["Phase 9.1 owner review example keeps release preparation manual and service-disabled."]
  });
  const phase91OwnerReviewReport = createPhase91OwnerReviewReport(phase91OwnerReviewRecord);
  const phase91Package = createPhase91Package({ ownerReview: phase91OwnerReviewRecord, ownerReviewed: true });
  const phase91PackageReport = createPhase91PackageReport(phase91Package);
  const phase91Audit = runPhase91Audit();

  return {
    controlledPublicReleaseScope,
    controlledPublicReleasePreparationReport,
    finalPublicCopyReviewReport,
    knownLimitationsFinalReviewReport,
    serviceLockConfirmationReport,
    privacySecurityConfirmationReport,
    safetyConfirmationReport,
    supportFeedbackReadinessReport,
    operationalReadinessReport,
    finalOwnerApprovalGateRecord,
    finalOwnerApprovalGateReport,
    publicReleasePreparationPackage,
    publicReleasePreparationPackageReport,
    phase91OwnerReviewRecord,
    phase91OwnerReviewReport,
    phase91Package,
    phase91PackageReport,
    phase91Audit,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true
  };
}
