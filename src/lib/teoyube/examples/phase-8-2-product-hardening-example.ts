import {
  createAccessibilityHardeningExecutionReport,
  createHardeningContentGateRegressionReport,
  createHardeningMobileAccessibilityRegressionReport,
  createHardeningRegressionQaReport,
  createHardeningRegressionQaRun,
  createHardeningSafetyRegressionReport,
  createHardeningServiceDisabledRegressionReport,
  createMobileHardeningExecutionReport,
  createPerformanceReviewReport,
  createPhase82OwnerReviewRecord,
  createPhase82OwnerReviewReport,
  createPhase82Package,
  createPhase82PackageReport,
  createProductHardeningClassificationReport,
  createProductHardeningExecutionRun,
  createProductHardeningExecutionReport,
  createProductHardeningPackage,
  createProductHardeningPackageReport,
  recordHardeningRegressionQaAreaResult,
  recordProductHardeningBlocked,
  recordProductHardeningDeferred,
  recordProductHardeningSkipped,
  runPhase82Audit
} from "../phase-8";

export function createPhase82ProductHardeningExample() {
  const executionRun = createProductHardeningExecutionRun();
  const executionReport = createProductHardeningExecutionReport(executionRun);
  const classificationReport = createProductHardeningClassificationReport();
  const skippedRun = recordProductHardeningSkipped(
    executionRun,
    executionRun.items[0],
    "Example skip record remains in memory and does not undo applied safe patches."
  );
  const blockedRun = recordProductHardeningBlocked(
    executionRun,
    executionRun.items[0],
    "Example blocked record demonstrates owner-review handling only."
  );
  const deferredRun = recordProductHardeningDeferred(
    executionRun,
    executionRun.items[0],
    "Example deferred record demonstrates follow-up handling only."
  );
  const mobileHardeningReport = createMobileHardeningExecutionReport();
  const accessibilityHardeningReport = createAccessibilityHardeningExecutionReport();
  const performanceReviewReport = createPerformanceReviewReport({ bundleAwarenessAvailable: false });
  const regressionQaRun = createHardeningRegressionQaRun();
  const updatedRegressionQaRun = recordHardeningRegressionQaAreaResult(regressionQaRun, "mobile", {
    id: "example_mobile_result",
    checkId: "mobile_not_worse",
    status: "passed",
    passed: true,
    details: "Example mobile regression result remained in-memory."
  });
  const regressionQaReport = createHardeningRegressionQaReport(updatedRegressionQaRun);
  const serviceDisabledRegressionReport = createHardeningServiceDisabledRegressionReport();
  const safetyRegressionReport = createHardeningSafetyRegressionReport();
  const contentGateRegressionReport = createHardeningContentGateRegressionReport();
  const mobileAccessibilityRegressionReport = createHardeningMobileAccessibilityRegressionReport();
  const productHardeningPackage = createProductHardeningPackage({ productHardeningExecutionReport: executionReport });
  const productHardeningPackageReport = createProductHardeningPackageReport(productHardeningPackage);
  const ownerReviewRecord = createPhase82OwnerReviewRecord({
    reviewed: true,
    notes: ["Phase 8.2 example reviewed as controlled, in-memory, service-disabled, and ready for Phase 8.3 planning."]
  });
  const ownerReviewReport = createPhase82OwnerReviewReport(ownerReviewRecord);
  const phase82Package = createPhase82Package({
    productHardeningPackage,
    ownerReview: ownerReviewRecord,
    ownerReviewed: true
  });
  const phase82PackageReport = createPhase82PackageReport(phase82Package);
  const phase82Audit = runPhase82Audit();

  return {
    executionRun,
    executionReport,
    classificationReport,
    skippedRun,
    blockedRun,
    deferredRun,
    mobileHardeningReport,
    accessibilityHardeningReport,
    performanceReviewReport,
    regressionQaRun,
    regressionQaReport,
    serviceDisabledRegressionReport,
    safetyRegressionReport,
    contentGateRegressionReport,
    mobileAccessibilityRegressionReport,
    productHardeningPackage,
    productHardeningPackageReport,
    ownerReviewRecord,
    ownerReviewReport,
    phase82Package,
    phase82PackageReport,
    phase82Audit,
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
