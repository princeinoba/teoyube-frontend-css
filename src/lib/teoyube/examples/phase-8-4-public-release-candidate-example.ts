import {
  createFinalControlledServiceDecisionLockReport,
  createFinalPrivacySecurityLockReport,
  createFinalPublicReadinessReport,
  createFinalPublicReleaseBoundaryLockReport,
  createPhase8CompletionPackage,
  createPhase8CompletionPackageReport,
  createPhase8CompletionReport,
  createPhase8EvidenceArchiveReport,
  createPhase8FeatureInventoryReport,
  createPhase8OwnerCompletionReviewRecord,
  createPhase8OwnerCompletionReviewReport,
  createPhase8RemainingRiskRegister,
  createPhase8RemainingRiskRegisterReport,
  createPhase9RoadmapReport,
  createPublicReleaseCandidatePlan,
  createPublicReleaseCandidateReport,
  runPhase84Audit
} from "../phase-8";

export function createPhase84PublicReleaseCandidateExample() {
  const publicReleaseCandidatePlan = createPublicReleaseCandidatePlan({ ownerReviewPathExists: true });
  const publicReleaseCandidateReport = createPublicReleaseCandidateReport({ ownerReviewPathExists: true });
  const finalPublicReadinessReport = createFinalPublicReadinessReport({ ownerReviewPathExists: true });
  const finalPrivacySecurityLockReport = createFinalPrivacySecurityLockReport();
  const finalControlledServiceDecisionLockReport = createFinalControlledServiceDecisionLockReport();
  const finalPublicReleaseBoundaryLockReport = createFinalPublicReleaseBoundaryLockReport();
  const phase8CompletionReview = createPhase8CompletionReport({ ownerReviewComplete: true });
  const phase8EvidenceArchive = createPhase8EvidenceArchiveReport();
  const phase8FeatureInventory = createPhase8FeatureInventoryReport();
  const phase8RemainingRiskRegister = createPhase8RemainingRiskRegister();
  const phase8RemainingRiskRegisterReport = createPhase8RemainingRiskRegisterReport(phase8RemainingRiskRegister);
  const ownerCompletionReviewRecord = createPhase8OwnerCompletionReviewRecord({
    reviewed: true,
    phase8MayBeMarkedComplete: true,
    notes: ["Phase 8.4 example reviewed as planning-only, service-disabled, privacy-protective, and ready for Phase 9 planning."]
  });
  const ownerCompletionReviewReport = createPhase8OwnerCompletionReviewReport(ownerCompletionReviewRecord);
  const phase9Roadmap = createPhase9RoadmapReport();
  const phase8CompletionPackage = createPhase8CompletionPackage({
    ownerReview: ownerCompletionReviewRecord,
    ownerReviewed: true,
    remainingRiskRegister: phase8RemainingRiskRegister
  });
  const phase8CompletionPackageReport = createPhase8CompletionPackageReport(phase8CompletionPackage);
  const phase84Audit = runPhase84Audit();

  return {
    publicReleaseCandidatePlan,
    publicReleaseCandidateReport,
    finalPublicReadinessReport,
    finalPrivacySecurityLockReport,
    finalControlledServiceDecisionLockReport,
    finalPublicReleaseBoundaryLockReport,
    phase8CompletionReview,
    phase8EvidenceArchive,
    phase8FeatureInventory,
    phase8RemainingRiskRegister,
    phase8RemainingRiskRegisterReport,
    ownerCompletionReviewRecord,
    ownerCompletionReviewReport,
    phase9Roadmap,
    phase8CompletionPackage,
    phase8CompletionPackageReport,
    phase84Audit,
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
