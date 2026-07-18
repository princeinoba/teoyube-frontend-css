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
  createPhase82OwnerReviewChecklist,
  createPhase82Package,
  createPhase82PackageReport,
  createProductHardeningClassificationReport,
  createProductHardeningExecutionRun,
  createProductHardeningExecutionReport,
  createProductHardeningPackage,
  createProductHardeningPackageReport,
  runPhase81Audit,
  runPhase82Audit
} from "../phase-8";
import { runPhase81PostBetaReadinessSmokeCheck } from "./phase-8-1-post-beta-readiness-smoke-check";

export type TeoyubePhase82SmokeCheckResult = {
  id: string;
  passed: boolean;
  notes: string;
};

export type TeoyubePhase82SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase82SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function result(id: string, passed: boolean, notes: string): TeoyubePhase82SmokeCheckResult {
  return { id, passed, notes };
}

export function runPhase82ProductHardeningSmokeCheck(): TeoyubePhase82SmokeCheckReport {
  const executionRun = createProductHardeningExecutionRun();
  const executionReport = createProductHardeningExecutionReport(executionRun);
  const classificationReport = createProductHardeningClassificationReport();
  const mobileHardeningReport = createMobileHardeningExecutionReport();
  const accessibilityHardeningReport = createAccessibilityHardeningExecutionReport();
  const performanceReviewReport = createPerformanceReviewReport({ bundleAwarenessAvailable: false });
  const regressionQaRun = createHardeningRegressionQaRun();
  const regressionQaReport = createHardeningRegressionQaReport(regressionQaRun);
  const serviceDisabledRegressionReport = createHardeningServiceDisabledRegressionReport();
  const safetyRegressionReport = createHardeningSafetyRegressionReport();
  const contentGateRegressionReport = createHardeningContentGateRegressionReport();
  const mobileAccessibilityRegressionReport = createHardeningMobileAccessibilityRegressionReport();
  const productHardeningPackage = createProductHardeningPackage({ productHardeningExecutionReport: executionReport });
  const productHardeningPackageReport = createProductHardeningPackageReport(productHardeningPackage);
  const ownerReviewChecklist = createPhase82OwnerReviewChecklist();
  const phase81SmokeCheck = runPhase81PostBetaReadinessSmokeCheck();
  const phase81Audit = runPhase81Audit();
  const phase82Package = createPhase82Package({ productHardeningPackage, ownerReviewed: true });
  const phase82PackageReport = createPhase82PackageReport(phase82Package);
  const phase82Audit = runPhase82Audit();

  const results = [
    result("hardening_execution_contracts_compile", executionRun.items.length > 0, "Product hardening execution contracts are represented by structured items."),
    result("hardening_execution_in_memory", executionReport.valid && executionReport.inMemoryOnly && executionRun.inMemoryOnly, `${executionReport.safePatchSummary.length} safe patch(es) recorded.`),
    result("hardening_classifier_structured", classificationReport.results.length > 0 && classificationReport.inMemoryOnly, `${classificationReport.ownerReviewItems.length} owner-review item(s) identified.`),
    result("mobile_hardening_structured", mobileHardeningReport.valid && mobileHardeningReport.inMemoryOnly, `${mobileHardeningReport.checks.length} mobile check(s) represented.`),
    result("accessibility_hardening_structured", accessibilityHardeningReport.valid && accessibilityHardeningReport.inMemoryOnly, `${accessibilityHardeningReport.checks.length} accessibility check(s) represented.`),
    result("performance_review_structured", performanceReviewReport.valid && performanceReviewReport.inMemoryOnly && performanceReviewReport.noAnalyticsEnabled, `${performanceReviewReport.checks.length} performance check(s) represented.`),
    result("regression_qa_in_memory", regressionQaReport.valid && regressionQaReport.inMemoryOnly && regressionQaRun.inMemoryOnly, `${regressionQaReport.summary.total} regression check(s) represented.`),
    result("service_disabled_regression", serviceDisabledRegressionReport.valid && serviceDisabledRegressionReport.noExternalServicesRequired, "Services remain disabled after hardening."),
    result("safety_regression_structured", safetyRegressionReport.valid && safetyRegressionReport.noDivineCertaintyClaimed, "Scripture, explanation, fallback, confidence, theology, and privacy boundaries remain safe."),
    result("content_gate_regression", contentGateRegressionReport.valid && contentGateRegressionReport.noAutomaticPublishing && contentGateRegressionReport.noProductionJsonWrite, "Review-only content remains gated."),
    result("mobile_accessibility_regression", mobileAccessibilityRegressionReport.valid && mobileAccessibilityRegressionReport.preservesScriptureAnchors, "Mobile/accessibility regression preserves anchors, explanation text, and confidence labels."),
    result("product_hardening_package_in_memory", productHardeningPackageReport.valid && productHardeningPackageReport.inMemoryOnly, `Product hardening package decision: ${productHardeningPackageReport.decision}.`),
    result("owner_review_checklist_exists", ownerReviewChecklist.length >= 10, `${ownerReviewChecklist.length} owner review item(s) represented.`),
    result("phase_8_1_smoke_still_valid", phase81SmokeCheck.valid, "Phase 8.1 smoke check remains structurally valid."),
    result("phase_8_1_audit_still_complete", phase81Audit.complete && phase81Audit.completionPercentage === 100, "Phase 8.1 audit remains complete."),
    result("phase_8_2_package_in_memory", phase82PackageReport.valid && phase82PackageReport.inMemoryOnly, `Phase 8.2 package decision: ${phase82PackageReport.decision}.`),
    result("phase_8_2_audit_structured", phase82Audit.complete && phase82Audit.completionPercentage === 100, `Phase 8.2 audit completion: ${phase82Audit.completionPercentage}%.`),
    result("no_public_launch", phase82Audit.noPublicLaunchPerformed && phase82Package.noPublicLaunchPerformed, "No public launch is performed."),
    result("no_beta_launch", phase82Audit.noBetaLaunchPerformed && phase82Package.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase82Audit.noUsersContacted && phase82Package.noUsersContacted, "No users are contacted."),
    result("no_feedback_auto_collection", phase82Audit.noFeedbackCollectedAutomatically && phase82Package.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_url_fetching", phase82Audit.noPublicUrlsFetchedAutomatically && phase82Package.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase82Audit.noDatabasePersistenceEnabled && phase82Package.noDatabasePersistenceEnabled, "Database persistence remains disabled."),
    result("no_analytics", phase82Audit.noAnalyticsEnabled && phase82Package.noAnalyticsEnabled, "Analytics remain disabled."),
    result("no_monitoring_provider", phase82Audit.noMonitoringProviderConnected && phase82Package.noMonitoringProviderConnected, "No production monitoring provider is connected."),
    result("no_live_ai", phase82Audit.noLiveAiOrchestrationEnabled && phase82Package.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    result("no_admin_auth_or_cms", phase82Audit.noAdminAuthAdded && phase82Audit.noCmsConnected && phase82Package.noAdminAuthAdded && phase82Package.noCmsConnected, "Admin auth and CMS remain disabled."),
    result("no_external_services", phase82Audit.noExternalServicesRequired && phase82Package.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase82Audit.noBrowserPersistenceRequired && phase82Package.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.notes}`);

  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: [
      "Phase 8.2 is controlled hardening only; it does not launch, contact users, collect feedback automatically, fetch public URLs automatically, or connect services.",
      ...executionReport.warnings.map((entry) => entry.message),
      ...phase82PackageReport.warnings
    ],
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
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
