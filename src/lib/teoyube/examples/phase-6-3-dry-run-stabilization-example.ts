import {
  addDryRunFixQueueItems,
  convertDryRunIssuesToFixQueueItems,
  createDryRunDisabledServiceRegressionReport,
  createDryRunFixItemFromIssue,
  createDryRunFixQueue,
  createDryRunFixQueueItem,
  createDryRunFixQueueReport,
  createDryRunIssue,
  createDryRunIssueToFixConversionReport,
  createDryRunMobileAccessibilityRegressionReport,
  createDryRunRegressionQaReport,
  createDryRunRegressionQaRun,
  createDryRunSafetyRegressionReport,
  createDryRunStabilizationPackage,
  createDryRunStabilizationPackageReport,
  createDryRunStabilizationPlan,
  createDryRunStabilizationPlanReport,
  createDryRunStabilizationSafetyReport,
  createOperationsReadinessReport,
  createPhase63OwnerReviewRecord,
  createPhase63OwnerReviewReport,
  createPhase63Package,
  createPhase63PackageReport,
  createPostStabilizationDryRunReadinessScoreReport,
  prioritizeDryRunFixQueue,
  runPhase63Audit
} from "../phase-6";

export function runPhase63DryRunStabilizationExample() {
  const safeIssue = createDryRunIssue({
    id: "example_content_clarity_dry_run_issue",
    title: "Example content clarity issue",
    description: "Owner noted that one dry-run instruction could be clearer.",
    category: "content_clarity",
    severity: "medium",
    source: "owner_observation"
  });
  const ownerReviewIssue = createDryRunIssue({
    id: "example_scripture_anchor_review_issue",
    title: "Example Scripture anchor owner-review issue",
    description: "Owner should review an anchor visibility warning before execution readiness.",
    category: "scripture_anchor_missing",
    severity: "high",
    source: "owner_observation"
  });
  const convertedFixItems = convertDryRunIssuesToFixQueueItems([safeIssue, ownerReviewIssue]);
  const conversionReport = createDryRunIssueToFixConversionReport([safeIssue, ownerReviewIssue]);
  const directFixItem = createDryRunFixItemFromIssue(safeIssue);
  const manualDocumentationFix = createDryRunFixQueueItem({
    id: "example_documentation_stabilization_item",
    title: "Clarify dry-run documentation wording",
    description: "Documentation wording can be clarified without touching live content or services.",
    category: "documentation",
    source: "documentation",
    priority: "low",
    riskLevel: "low",
    status: "safe_to_fix",
    safeLocalFixAllowed: true,
    ownerReviewRequired: false
  });
  const queue = prioritizeDryRunFixQueue(addDryRunFixQueueItems(createDryRunFixQueue(), [...convertedFixItems, manualDocumentationFix]));
  const queueReport = createDryRunFixQueueReport(queue);
  const stabilizationPlan = createDryRunStabilizationPlan({ queue });
  const stabilizationPlanReport = createDryRunStabilizationPlanReport(stabilizationPlan);
  const unsafePlan = {
    ...stabilizationPlan,
    items: stabilizationPlan.items.map((item, index) => index === 0 ? { ...item, safetyChecks: { removesScriptureAnchors: true } } : item)
  };
  const safetyReport = createDryRunStabilizationSafetyReport(stabilizationPlan);
  const unsafeSafetyReport = createDryRunStabilizationSafetyReport(unsafePlan);
  const operationsReadinessReport = createOperationsReadinessReport();
  const regressionRun = createDryRunRegressionQaRun({
    results: createDryRunRegressionQaRun().checks.map((check) => ({
      checkId: check.id,
      area: check.area,
      status: "passed",
      notes: "Example post-stabilization regression check passed in memory.",
      blocker: false,
      warning: false,
      recordedAt: new Date().toISOString()
    }))
  });
  const regressionQaReport = createDryRunRegressionQaReport(regressionRun);
  const disabledServiceRegressionReport = createDryRunDisabledServiceRegressionReport();
  const safetyRegressionReport = createDryRunSafetyRegressionReport();
  const mobileAccessibilityRegressionReport = createDryRunMobileAccessibilityRegressionReport();
  const postStabilizationReadinessScoreReport = createPostStabilizationDryRunReadinessScoreReport({ stabilizationPlan });
  const stabilizationPackage = createDryRunStabilizationPackage({
    issues: [safeIssue, ownerReviewIssue],
    queue,
    stabilizationPlan,
    regressionRun
  });
  const stabilizationPackageReport = createDryRunStabilizationPackageReport(stabilizationPackage);
  const ownerReviewRecord = createPhase63OwnerReviewRecord({ reviewed: true });
  const ownerReviewReport = createPhase63OwnerReviewReport(ownerReviewRecord);
  const phase63Package = createPhase63Package({
    dryRunStabilizationPackage: stabilizationPackage,
    ownerReview: ownerReviewRecord
  });
  const phase63PackageReport = createPhase63PackageReport(phase63Package);
  const phase63Audit = runPhase63Audit();

  return {
    safeIssue,
    ownerReviewIssue,
    convertedFixItems,
    conversionReport,
    directFixItem,
    manualDocumentationFix,
    queue,
    queueReport,
    stabilizationPlan,
    stabilizationPlanReport,
    safetyReport,
    unsafeSafetyReport,
    operationsReadinessReport,
    regressionRun,
    regressionQaReport,
    disabledServiceRegressionReport,
    safetyRegressionReport,
    mobileAccessibilityRegressionReport,
    postStabilizationReadinessScoreReport,
    stabilizationPackage,
    stabilizationPackageReport,
    ownerReviewRecord,
    ownerReviewReport,
    phase63Package,
    phase63PackageReport,
    phase63Audit
  };
}
