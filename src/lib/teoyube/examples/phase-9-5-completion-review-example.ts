import {
  createFinalPhase9ServiceDisabledLockReport,
  createPhase10RoadmapReport,
  createPhase9CompletionPackage,
  createPhase9CompletionPackageReport,
  createPhase9CompletionReport,
  createPhase9EvidenceArchiveReport,
  createPhase9FeatureInventoryReport,
  createPhase9OwnerCompletionReviewRecord,
  createPhase9OwnerCompletionReviewReport,
  createPhase9RemainingRiskRegister,
  createPhase9RemainingRiskRegisterReport,
  createPublicReadinessLockReport,
  runPhase95Audit
} from "../phase-9";

export function runPhase95CompletionReviewExample() {
  const phase9CompletionReview = createPhase9CompletionReport({ ownerReviewComplete: true });
  const publicReadinessLockReport = createPublicReadinessLockReport();
  const finalServiceDisabledLockReport = createFinalPhase9ServiceDisabledLockReport();
  const phase9EvidenceArchive = createPhase9EvidenceArchiveReport();
  const phase9FeatureInventory = createPhase9FeatureInventoryReport();
  const remainingRiskRegister = createPhase9RemainingRiskRegister();
  const remainingRiskRegisterReport = createPhase9RemainingRiskRegisterReport(remainingRiskRegister);
  const ownerCompletionReviewRecord = createPhase9OwnerCompletionReviewRecord({
    reviewed: true,
    phase9MayBeMarkedComplete: true,
    notes: ["Phase 9 completion accepted for Phase 10 controlled public release execution planning."]
  });
  const ownerCompletionReviewReport = createPhase9OwnerCompletionReviewReport(ownerCompletionReviewRecord);
  const phase10Roadmap = createPhase10RoadmapReport();
  const phase9CompletionPackage = createPhase9CompletionPackage({
    ownerReviewed: true,
    ownerReview: ownerCompletionReviewRecord,
    remainingRiskRegister
  });
  const phase9CompletionPackageReport = createPhase9CompletionPackageReport(phase9CompletionPackage);
  const phase95Audit = runPhase95Audit();

  return {
    phase9CompletionReview,
    publicReadinessLockReport,
    finalServiceDisabledLockReport,
    phase9EvidenceArchive,
    phase9FeatureInventory,
    remainingRiskRegisterReport,
    ownerCompletionReviewReport,
    phase10Roadmap,
    phase9CompletionPackageReport,
    phase95Audit,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}
