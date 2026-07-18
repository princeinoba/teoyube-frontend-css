import {
  createConsentPublicCopyReviewReport,
  createControlledServiceDecisionPackage,
  createControlledServiceDecisionPackageReport,
  createPhase83OwnerReviewRecord,
  createPhase83OwnerReviewReport,
  createPhase83Package,
  createPhase83PackageReport,
  createPrivacySecurityReviewReport,
  createPublicReleaseBoundaryReport,
  createPublicReleaseKnownLimitationsReport,
  createPublicReleaseReadinessGateReport,
  createPublicReleaseSafetyReadinessReport,
  createPublicReleaseSupportFeedbackReport,
  createSensitiveDataBoundaryReviewReport,
  createServiceDecisionLockValidationReport,
  runPhase83Audit
} from "../phase-8";

export function createPhase83PrivacySecurityServiceDecisionExample() {
  const privacySecurityReviewReport = createPrivacySecurityReviewReport({ ownerReviewed: true });
  const sensitiveDataBoundaryReviewReport = createSensitiveDataBoundaryReviewReport();
  const consentPublicCopyReviewReport = createConsentPublicCopyReviewReport();
  const controlledServiceDecisionPackage = createControlledServiceDecisionPackage();
  const controlledServiceDecisionPackageReport = createControlledServiceDecisionPackageReport(controlledServiceDecisionPackage);
  const serviceDecisionLockValidationReport = createServiceDecisionLockValidationReport();
  const publicReleaseReadinessGateReport = createPublicReleaseReadinessGateReport();
  const publicReleaseBoundaryReport = createPublicReleaseBoundaryReport();
  const knownLimitationsReport = createPublicReleaseKnownLimitationsReport();
  const supportFeedbackReadinessReport = createPublicReleaseSupportFeedbackReport();
  const safetyReadinessReport = createPublicReleaseSafetyReadinessReport();
  const ownerReviewRecord = createPhase83OwnerReviewRecord({
    reviewed: true,
    notes: ["Phase 8.3 example reviewed as controlled, in-memory, service-disabled, and ready for Phase 8.4 planning."]
  });
  const ownerReviewReport = createPhase83OwnerReviewReport(ownerReviewRecord);
  const phase83Package = createPhase83Package({ ownerReview: ownerReviewRecord, ownerReviewed: true });
  const phase83PackageReport = createPhase83PackageReport(phase83Package);
  const phase83Audit = runPhase83Audit();

  return {
    privacySecurityReviewReport,
    sensitiveDataBoundaryReviewReport,
    consentPublicCopyReviewReport,
    controlledServiceDecisionPackage,
    controlledServiceDecisionPackageReport,
    serviceDecisionLockValidationReport,
    publicReleaseReadinessGateReport,
    publicReleaseBoundaryReport,
    knownLimitationsReport,
    supportFeedbackReadinessReport,
    safetyReadinessReport,
    ownerReviewRecord,
    ownerReviewReport,
    phase83Package,
    phase83PackageReport,
    phase83Audit,
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
