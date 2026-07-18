import {
  addBetaFixQueueItems,
  createBetaDisabledServiceRegressionQaReport,
  createBetaFixQueue,
  createBetaFixQueueItem,
  createBetaFixQueueReport,
  createBetaIssue,
  createBetaIssueToFixConversionReport,
  createBetaMobileAccessibilityRegressionQaReport,
  createBetaRegressionQaReport,
  createBetaRegressionQaRun,
  createBetaRemediationPackage,
  createBetaRemediationPackageReport,
  createBetaReviewedContentGateRegressionQaReport,
  createBetaScriptureExplanationFallbackRegressionQaReport,
  createPhase53OwnerReviewRecord,
  createPhase53OwnerReviewReport,
  createPhase53Package,
  createPhase53PackageReport,
  createPostRemediationReadinessScoreReport,
  createReadinessRemediationPlan,
  createReadinessRemediationPlanReport,
  createReadinessRemediationSafetyReport,
  recordBetaRegressionQaAreaResult,
  runPhase53Audit
} from "../phase-5";

export function runPhase53BetaFixQueueRemediationExample() {
  const betaIssues = [
    createBetaIssue({
      id: "example_confidence_label_polish",
      title: "Confidence label wording needs polish",
      description: "Confidence label remains visible, but owner wants clearer wording.",
      category: "confidence_label_missing",
      severity: "medium",
      source: "manual_qa",
      surface: "tig_response_panel"
    }),
    createBetaIssue({
      id: "example_scripture_anchor_review",
      title: "Scripture anchor needs owner review",
      description: "A recommendation path needs manual Scripture anchor review before any fix.",
      category: "scripture_anchor_missing",
      severity: "high",
      source: "manual_qa",
      surface: "word_card"
    })
  ];
  const conversionReport = createBetaIssueToFixConversionReport(betaIssues);
  const safeItem = createBetaFixQueueItem({
    id: "example_safe_documentation_patch",
    title: "Document Phase 5.3 remediation boundary",
    category: "documentation",
    priority: "low",
    riskLevel: "low",
    status: "safe_to_fix",
    safeLocalFixAllowed: true,
    ownerReviewRequired: false,
    proposedFix: "Update docs and exports only; do not change runtime service or content behavior."
  });
  const deferredItem = createBetaFixQueueItem({
    id: "example_deferred_service_item",
    title: "Future monitoring provider review",
    category: "disabled_service",
    priority: "defer",
    riskLevel: "medium",
    status: "deferred",
    safeLocalFixAllowed: false,
    ownerReviewRequired: true,
    deferredReason: "Monitoring provider remains plan-only until owner/privacy/security/cost review."
  });
  const blockedItem = createBetaFixQueueItem({
    id: "example_blocked_live_ai_item",
    title: "Live AI provider request remains blocked",
    category: "disabled_service",
    priority: "beta_blocker",
    riskLevel: "blocked",
    status: "blocked",
    safeLocalFixAllowed: false,
    ownerReviewRequired: true,
    blockedReason: "Live AI orchestration cannot be added in Phase 5.3."
  });
  const queue = addBetaFixQueueItems(createBetaFixQueue({ items: conversionReport.fixItems }), [safeItem, deferredItem, blockedItem]);
  const queueReport = createBetaFixQueueReport(queue);
  const remediationPlan = createReadinessRemediationPlan({ queue });
  const remediationPlanReport = createReadinessRemediationPlanReport(remediationPlan);
  const safetyReport = createReadinessRemediationSafetyReport(remediationPlan);
  const regressionRun = recordBetaRegressionQaAreaResult(createBetaRegressionQaRun(), "confidence_label", {
    status: "passed",
    notes: "Confidence labels remain visible after wording-only remediation.",
    blocker: false,
    warning: false
  });
  const betaRegressionQaReport = createBetaRegressionQaReport(regressionRun);
  const disabledServiceRegressionQaReport = createBetaDisabledServiceRegressionQaReport();
  const scriptureExplanationFallbackRegressionQaReport = createBetaScriptureExplanationFallbackRegressionQaReport();
  const reviewedContentGateRegressionQaReport = createBetaReviewedContentGateRegressionQaReport();
  const mobileAccessibilityRegressionQaReport = createBetaMobileAccessibilityRegressionQaReport();
  const postRemediationReadinessScoreReport = createPostRemediationReadinessScoreReport();
  const betaRemediationPackage = createBetaRemediationPackage();
  const betaRemediationPackageReport = createBetaRemediationPackageReport(betaRemediationPackage);
  const ownerReview = createPhase53OwnerReviewRecord();
  const ownerReviewReport = createPhase53OwnerReviewReport(ownerReview);
  const phase53Package = createPhase53Package({ betaRemediationPackage, ownerReview });
  const phase53PackageReport = createPhase53PackageReport(phase53Package);
  const phase53Audit = runPhase53Audit();

  return {
    betaIssues,
    conversionReport,
    queue,
    queueReport,
    remediationPlan,
    remediationPlanReport,
    safetyReport,
    regressionRun,
    betaRegressionQaReport,
    disabledServiceRegressionQaReport,
    scriptureExplanationFallbackRegressionQaReport,
    reviewedContentGateRegressionQaReport,
    mobileAccessibilityRegressionQaReport,
    postRemediationReadinessScoreReport,
    betaRemediationPackage,
    betaRemediationPackageReport,
    ownerReview,
    ownerReviewReport,
    phase53Package,
    phase53PackageReport,
    phase53Audit
  };
}
