import {
  createBetaReadinessReviewReport,
  createDisabledServiceEnforcementQaReport,
  createPhase4CompletionPackage,
  createPhase4CompletionPackageReport,
  createPhase4CompletionReport,
  createPhase4FeatureInventoryReport,
  createPhase4OwnerCompletionReviewRecord,
  createPhase4OwnerCompletionReviewReport,
  createPhase4RemainingRiskRegister,
  createPhase4RemainingRiskRegisterReport,
  createPhase5RoadmapReport,
  createServiceDecisionLock,
  createServiceDecisionLockReport,
  runPhase46Audit
} from "../phase-4";

export function runPhase46BetaReadinessCompletionExample() {
  const betaReadinessReview = createBetaReadinessReviewReport();
  const serviceDecisionLock = createServiceDecisionLock();
  const serviceDecisionLockReport = createServiceDecisionLockReport(serviceDecisionLock);
  const disabledServiceQa = createDisabledServiceEnforcementQaReport();
  const phase4CompletionReview = createPhase4CompletionReport();
  const featureInventory = createPhase4FeatureInventoryReport();
  const remainingRiskRegister = createPhase4RemainingRiskRegister();
  const remainingRiskRegisterReport = createPhase4RemainingRiskRegisterReport(remainingRiskRegister);
  const ownerCompletionReview = createPhase4OwnerCompletionReviewRecord({ reviewed: false });
  const ownerCompletionReviewReport = createPhase4OwnerCompletionReviewReport(ownerCompletionReview);
  const phase5Roadmap = createPhase5RoadmapReport();
  const completionPackage = createPhase4CompletionPackage({ ownerReview: ownerCompletionReview, riskRegister: remainingRiskRegister });
  const completionPackageReport = createPhase4CompletionPackageReport(completionPackage);
  const phase46Audit = runPhase46Audit();

  return {
    betaReadinessReview,
    serviceDecisionLock,
    serviceDecisionLockReport,
    disabledServiceQa,
    phase4CompletionReview,
    featureInventory,
    remainingRiskRegister,
    remainingRiskRegisterReport,
    ownerCompletionReview,
    ownerCompletionReviewReport,
    phase5Roadmap,
    completionPackage,
    completionPackageReport,
    phase46Audit
  };
}
