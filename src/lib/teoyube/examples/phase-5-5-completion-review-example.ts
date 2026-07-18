import {
  createBetaReadinessEvidenceArchive,
  createBetaReadinessLock,
  createFinalDisabledServiceLock,
  createPhase5CompletionPackage,
  createPhase5CompletionPackageReport,
  createPhase5CompletionReport,
  createPhase5FeatureInventory,
  createPhase5OwnerCompletionReviewRecord,
  createPhase5RemainingRiskRegister,
  createPhase6Roadmap,
  runPhase55Audit
} from "../phase-5";

export function createPhase55CompletionReviewExample() {
  const completionReview = createPhase5CompletionReport();
  const betaReadinessLock = createBetaReadinessLock();
  const finalDisabledServiceLock = createFinalDisabledServiceLock();
  const evidenceArchive = createBetaReadinessEvidenceArchive();
  const featureInventory = createPhase5FeatureInventory();
  const remainingRiskRegister = createPhase5RemainingRiskRegister();
  const ownerCompletionReview = createPhase5OwnerCompletionReviewRecord({ reviewed: true });
  const phase6Roadmap = createPhase6Roadmap();
  const completionPackage = createPhase5CompletionPackage({
    ownerCompletionReview
  });
  const completionPackageReport = createPhase5CompletionPackageReport(completionPackage);
  const audit = runPhase55Audit();

  return {
    completionReview,
    betaReadinessLock,
    finalDisabledServiceLock,
    evidenceArchive,
    featureInventory,
    remainingRiskRegister,
    ownerCompletionReview,
    phase6Roadmap,
    completionPackage,
    completionPackageReport,
    audit,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}
