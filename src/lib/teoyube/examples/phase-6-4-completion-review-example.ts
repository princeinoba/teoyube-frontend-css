import {
  addPhase6RemainingRisk,
  createControlledBetaOperationsLock,
  createFinalBetaServiceDisabledLock,
  createFinalBetaServiceDisabledLockReport,
  createPhase6CompletionPackage,
  createPhase6CompletionPackageReport,
  createPhase6CompletionReport,
  createPhase6EvidenceArchive,
  createPhase6EvidenceArchiveReport,
  createPhase6FeatureInventory,
  createPhase6FeatureInventoryReport,
  createPhase6OwnerCompletionReviewRecord,
  createPhase6OwnerCompletionReviewReport,
  createPhase6RemainingRiskRegister,
  createPhase6RemainingRiskRegisterReport,
  createPhase7Roadmap,
  createPhase7RoadmapReport,
  runPhase64Audit
} from "../phase-6";

export function runPhase64CompletionReviewExample() {
  const completionReview = createPhase6CompletionReport({ ownerReviewed: true });
  const operationsLock = createControlledBetaOperationsLock({ ownerReviewed: true });
  const finalBetaServiceDisabledLock = createFinalBetaServiceDisabledLock();
  const finalBetaServiceDisabledLockReport = createFinalBetaServiceDisabledLockReport(finalBetaServiceDisabledLock);
  const evidenceArchive = createPhase6EvidenceArchive();
  const evidenceArchiveReport = createPhase6EvidenceArchiveReport();
  const featureInventory = createPhase6FeatureInventory();
  const featureInventoryReport = createPhase6FeatureInventoryReport();
  const remainingRiskRegister = addPhase6RemainingRisk(createPhase6RemainingRiskRegister(), {
    id: "example_phase_7_manual_support_capacity",
    area: "operations_readiness",
    severity: "medium",
    status: "accepted",
    message: "Example Phase 7 manual support capacity should be reviewed before real participant operations.",
    mitigation: "Use owner cadence, support workflow, and pause criteria in Phase 7.1."
  });
  const remainingRiskRegisterReport = createPhase6RemainingRiskRegisterReport(remainingRiskRegister);
  const ownerCompletionReview = createPhase6OwnerCompletionReviewRecord({ reviewed: true });
  const ownerCompletionReviewReport = createPhase6OwnerCompletionReviewReport(ownerCompletionReview);
  const phase7Roadmap = createPhase7Roadmap();
  const phase7RoadmapReport = createPhase7RoadmapReport();
  const phase6CompletionPackage = createPhase6CompletionPackage({
    ownerReviewed: true,
    remainingRiskRegister,
    ownerCompletionReview
  });
  const phase6CompletionPackageReport = createPhase6CompletionPackageReport(phase6CompletionPackage);
  const phase64Audit = runPhase64Audit();

  return {
    completionReview,
    operationsLock,
    finalBetaServiceDisabledLock,
    finalBetaServiceDisabledLockReport,
    evidenceArchive,
    evidenceArchiveReport,
    featureInventory,
    featureInventoryReport,
    remainingRiskRegister,
    remainingRiskRegisterReport,
    ownerCompletionReview,
    ownerCompletionReviewReport,
    phase7Roadmap,
    phase7RoadmapReport,
    phase6CompletionPackage,
    phase6CompletionPackageReport,
    phase64Audit
  };
}
