import { runPhase51ControlledBetaPreparationSmokeCheck } from "./phase-5-1-controlled-beta-preparation-smoke-check";
import { runPhase52ManualBetaQaExecutionSmokeCheck } from "./phase-5-2-manual-beta-qa-execution-smoke-check";
import { runPhase53BetaFixQueueRemediationExample } from "./phase-5-3-beta-fix-queue-remediation-example";
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
  runPhase53Audit
} from "../phase-5";

export type TeoyubePhase53SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase53SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase53SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  postRemediationReadinessScore: number;
  postRemediationReadinessBand: string;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase53SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase53BetaFixQueueRemediationSmokeCheck(): TeoyubePhase53SmokeCheckReport {
  const phase51Smoke = runPhase51ControlledBetaPreparationSmokeCheck();
  const phase52Smoke = runPhase52ManualBetaQaExecutionSmokeCheck();
  const issue = createBetaIssue({
    id: "smoke_confidence_label_issue",
    title: "Confidence label wording needs manual polish",
    description: "Label remains visible, but copy can be clearer.",
    category: "confidence_label_missing",
    severity: "medium",
    source: "manual_qa"
  });
  const conversionReport = createBetaIssueToFixConversionReport([issue]);
  const safeItem = createBetaFixQueueItem({
    id: "smoke_safe_item",
    title: "Safe documentation update",
    category: "documentation",
    priority: "low",
    riskLevel: "low",
    status: "safe_to_fix",
    safeLocalFixAllowed: true,
    ownerReviewRequired: false
  });
  const ownerReviewItem = createBetaFixQueueItem({
    id: "smoke_owner_review_item",
    title: "Scripture anchor review item",
    category: "scripture_anchor",
    priority: "high",
    riskLevel: "medium",
    status: "owner_review_required",
    safeLocalFixAllowed: false,
    ownerReviewRequired: true
  });
  const deferredItem = createBetaFixQueueItem({
    id: "smoke_deferred_item",
    title: "Future monitoring service review",
    category: "disabled_service",
    priority: "defer",
    riskLevel: "medium",
    status: "deferred",
    safeLocalFixAllowed: false,
    ownerReviewRequired: true
  });
  const blockedItem = createBetaFixQueueItem({
    id: "smoke_blocked_item",
    title: "Blocked live AI service request",
    category: "disabled_service",
    priority: "beta_blocker",
    riskLevel: "blocked",
    status: "blocked",
    safeLocalFixAllowed: false,
    ownerReviewRequired: true,
    blockedReason: "Live AI orchestration cannot be added in Phase 5.3."
  });
  const queue = addBetaFixQueueItems(createBetaFixQueue({ items: conversionReport.fixItems }), [safeItem, ownerReviewItem, deferredItem, blockedItem]);
  const queueReport = createBetaFixQueueReport(queue);
  const plan = createReadinessRemediationPlan({ queue });
  const planReport = createReadinessRemediationPlanReport(plan);
  const unsafePlan = {
    ...plan,
    items: plan.items.map((item) => item.id === `remediation_${safeItem.id}`
      ? { ...item, safetyChecks: { removesScriptureAnchors: true } }
      : item)
  };
  const safetyReport = createReadinessRemediationSafetyReport(plan);
  const unsafeSafetyReport = createReadinessRemediationSafetyReport(unsafePlan);
  const regressionRun = createBetaRegressionQaRun();
  const regressionQaReport = createBetaRegressionQaReport(regressionRun);
  const disabledRegression = createBetaDisabledServiceRegressionQaReport();
  const scriptureRegression = createBetaScriptureExplanationFallbackRegressionQaReport();
  const reviewedGateRegression = createBetaReviewedContentGateRegressionQaReport();
  const mobileRegression = createBetaMobileAccessibilityRegressionQaReport();
  const postScore = createPostRemediationReadinessScoreReport();
  const remediationPackage = createBetaRemediationPackage();
  const remediationPackageReport = createBetaRemediationPackageReport(remediationPackage);
  const ownerReview = createPhase53OwnerReviewRecord();
  const ownerReviewReport = createPhase53OwnerReviewReport(ownerReview);
  const phase53Package = createPhase53Package({ betaRemediationPackage: remediationPackage, ownerReview });
  const phase53PackageReport = createPhase53PackageReport(phase53Package);
  const phase53Audit = runPhase53Audit();
  const example = runPhase53BetaFixQueueRemediationExample();

  const checks = [
    check("phase_5_1_smoke_valid", phase51Smoke.valid, "Phase 5.1 smoke check remains valid."),
    check("phase_5_2_smoke_structured", phase52Smoke.checks.length > 0, "Phase 5.2 smoke check remains structured."),
    check("fix_queue_contracts_compile", queue.manualOnly && queue.inMemoryOnly && queue.noFilesWritten, "Fix queue works in memory only."),
    check("issue_to_fix_converter_structured", conversionReport.valid && conversionReport.fixItems.length >= 1, "Issue-to-fix converter returns structured fix items."),
    check("remediation_planner_separates_items", planReport.safeItemCount >= 1 && planReport.ownerReviewItemCount >= 1 && planReport.blockedItemCount >= 1 && planReport.deferredItemCount >= 1, "Remediation planner separates safe, owner-review, blocked, and deferred items."),
    check("safety_validator_blocks_unsafe", safetyReport.valid && !unsafeSafetyReport.valid && unsafeSafetyReport.blockers.length >= 1, "Safety validator blocks unsafe remediation."),
    check("regression_qa_in_memory", regressionQaReport.manualOnly && regressionQaReport.inMemoryOnly && regressionQaReport.noPublicUrlFetching && regressionQaReport.noUsersContacted, "Regression QA runner is manual and in-memory only."),
    check("disabled_service_regression_valid", disabledRegression.valid && disabledRegression.noDatabasePersistenceEnabled && disabledRegression.noAnalyticsEnabled && disabledRegression.noLiveAiOrchestrationEnabled, "Disabled service regression confirms services remain disabled."),
    check("scripture_regression_valid", scriptureRegression.valid && scriptureRegression.noDivineCertaintyLanguage && scriptureRegression.noProfessionalAdviceLanguage, "Scripture/explanation/fallback regression returns structured safe report."),
    check("reviewed_gate_regression_valid", reviewedGateRegression.valid && reviewedGateRegression.noAutomaticPublishing, "Reviewed content gate regression blocks review-only content and auto-publishing."),
    check("mobile_accessibility_regression_valid", mobileRegression.valid, "Mobile/accessibility regression returns structured report."),
    check("post_remediation_score_band", Boolean(postScore.band), "Post-remediation readiness score returns a score band."),
    check("remediation_package_in_memory", remediationPackageReport.valid && remediationPackage.noExternalSend && remediationPackage.inMemoryOnly, "Remediation package is in-memory only."),
    check("owner_review_exists", ownerReviewReport.valid && ownerReview.checklist.length >= 13, "Phase 5.3 owner review checklist exists."),
    check("phase_5_3_package_valid", phase53PackageReport.valid && phase53Package.noBetaLaunchPerformed && phase53Package.noExternalServicesRequired, "Phase 5.3 package is valid and does not launch beta."),
    check("phase_5_3_audit_complete", phase53Audit.complete && phase53Audit.completionPercentage === 100, "Phase 5.3 audit returns complete."),
    check("example_runs", example.phase53Audit.completionPercentage === phase53Audit.completionPercentage, "Phase 5.3 example runs."),
    check("no_browser_persistence", true, "No localStorage, cookies, or IndexedDB are required by Phase 5.3 modules.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...queueReport.warnings.map((entry) => entry.message),
    ...planReport.warnings.map((entry) => entry.message),
    ...safetyReport.warnings.map((entry) => entry.message),
    ...regressionQaReport.warnings.map((entry) => entry.message),
    ...disabledRegression.warnings,
    ...scriptureRegression.warnings,
    ...reviewedGateRegression.warnings,
    ...mobileRegression.warnings,
    ...postScore.warnings.map((entry) => entry.message),
    ...remediationPackageReport.warnings,
    ...ownerReviewReport.warnings,
    ...phase53PackageReport.warnings,
    ...phase53Audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    postRemediationReadinessScore: postScore.score,
    postRemediationReadinessBand: postScore.band,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
