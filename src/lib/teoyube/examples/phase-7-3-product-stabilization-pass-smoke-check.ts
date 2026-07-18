import {
  createBetaOperationsReadinessScoreReport,
  createFeedbackSupportOperationsRegressionReport,
  createMobileAccessibilityOperationsRegressionReport,
  createPhase73OwnerReviewChecklist,
  createPhase73Package,
  createPhase73PackageReport,
  createProductStabilizationPass,
  createProductStabilizationPassPackage,
  createProductStabilizationPassPackageReport,
  createProductStabilizationPassReport,
  createProductStabilizationVerificationReport,
  createReviewedContentAdminOperationsRegressionReport,
  createScriptureExplanationFallbackOperationsRegressionReport,
  createServiceDisabledOperationsRegressionReport,
  createStabilizationRegressionQaReport,
  createStabilizationRegressionQaRun,
  runPhase73Audit
} from "../phase-7";

export type TeoyubePhase73SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase73SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase73SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessScoreBand: string;
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

function result(id: string, passed: boolean, details: string): TeoyubePhase73SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase73ProductStabilizationPassSmokeCheck(): TeoyubePhase73SmokeCheckReport {
  const pass = createProductStabilizationPass();
  const passReport = createProductStabilizationPassReport(pass);
  const productStabilizationPassPackage = createProductStabilizationPassPackage();
  const verificationReport = createProductStabilizationVerificationReport(productStabilizationPassPackage.productStabilizationQueueReport.queue);
  const regressionRun = createStabilizationRegressionQaRun({
    results: createStabilizationRegressionQaRun().checks.map((check) => ({
      checkId: check.id,
      area: check.area,
      status: "passed" as const,
      notes: "Smoke check confirms Phase 7.3 regression boundary in memory.",
      blocker: false,
      warning: false,
      recordedAt: new Date().toISOString()
    }))
  });
  const regressionReport = createStabilizationRegressionQaReport(regressionRun);
  const serviceDisabledReport = createServiceDisabledOperationsRegressionReport();
  const scriptureReport = createScriptureExplanationFallbackOperationsRegressionReport();
  const reviewedAdminReport = createReviewedContentAdminOperationsRegressionReport();
  const feedbackSupportReport = createFeedbackSupportOperationsRegressionReport();
  const mobileAccessibilityReport = createMobileAccessibilityOperationsRegressionReport();
  const readinessScoreReport = createBetaOperationsReadinessScoreReport();
  const productStabilizationPassPackageReport = createProductStabilizationPassPackageReport(productStabilizationPassPackage);
  const ownerChecklist = createPhase73OwnerReviewChecklist(true);
  const phase73Package = createPhase73Package({
    productStabilizationPassPackage,
    ownerReviewed: true
  });
  const phase73PackageReport = createPhase73PackageReport(phase73Package);
  const phase73Audit = runPhase73Audit();

  const checks = [
    result("product_stabilization_pass_contracts_compile", Array.isArray(pass.items), `${pass.items.length} pass item(s).`),
    result("stabilization_pass_in_memory_only", passReport.inMemoryOnly && passReport.noUsersContacted && passReport.noExternalServicesRequired, `Pass decision: ${passReport.decision}.`),
    result("verification_mapper_structured", verificationReport.inMemoryOnly && verificationReport.criticalChecks.length >= 1, `${verificationReport.criticalChecks.length} critical check(s).`),
    result("regression_qa_in_memory_only", regressionReport.valid && regressionReport.inMemoryOnly, `${regressionReport.completedCheckCount}/${regressionReport.totalCheckCount} regression check(s).`),
    result("service_disabled_regression_passes", serviceDisabledReport.valid && serviceDisabledReport.noExternalServicesRequired, `${serviceDisabledReport.checks.length} service-disabled check(s).`),
    result("scripture_explanation_fallback_regression_structured", scriptureReport.valid && scriptureReport.inMemoryOnly, `${scriptureReport.checks.length} safety check(s).`),
    result("reviewed_content_admin_regression_structured", reviewedAdminReport.valid && reviewedAdminReport.inMemoryOnly, `${reviewedAdminReport.checks.length} reviewed/admin check(s).`),
    result("feedback_support_regression_structured", feedbackSupportReport.valid && feedbackSupportReport.inMemoryOnly, `${feedbackSupportReport.checks.length} feedback/support check(s).`),
    result("mobile_accessibility_regression_structured", mobileAccessibilityReport.valid && mobileAccessibilityReport.inMemoryOnly, `${mobileAccessibilityReport.checks.length} mobile/accessibility check(s).`),
    result("readiness_score_band_available", readinessScoreReport.valid && readinessScoreReport.band !== "unknown", `Score ${readinessScoreReport.score}, band ${readinessScoreReport.band}.`),
    result("stabilization_pass_package_in_memory_only", productStabilizationPassPackageReport.valid && productStabilizationPassPackageReport.inMemoryOnly && productStabilizationPassPackageReport.noExternalSend, `Package decision: ${productStabilizationPassPackageReport.decision}.`),
    result("owner_review_checklist_exists", ownerChecklist.length >= 10, `${ownerChecklist.length} owner review item(s).`),
    result("phase_7_3_audit_complete", phase73Audit.complete && phase73Audit.completionPercentage === 100, `Audit completion: ${phase73Audit.completionPercentage}%.`),
    result("phase_7_3_package_structured", phase73PackageReport.valid && phase73PackageReport.inMemoryOnly, `Phase 7.3 decision: ${phase73PackageReport.decision}.`),
    result("no_beta_launch_performed", phase73Package.noBetaLaunchPerformed && phase73Audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase73Package.noUsersContacted && phase73Audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", phase73Package.noFeedbackCollectedAutomatically && phase73Audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", phase73Package.noPublicUrlsFetchedAutomatically && phase73Audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase73Package.noDatabasePersistenceEnabled && phase73Audit.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", phase73Package.noAnalyticsEnabled && phase73Audit.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", phase73Package.noMonitoringProviderConnected && phase73Audit.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", phase73Package.noLiveAiOrchestrationEnabled && phase73Audit.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth", phase73Package.noAdminAuthAdded && phase73Audit.noAdminAuthAdded, "No admin auth is added."),
    result("no_cms", phase73Package.noCmsConnected && phase73Audit.noCmsConnected, "No CMS is connected."),
    result("no_external_services_required", phase73Package.noExternalServicesRequired && phase73Audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase73Package.noBrowserPersistenceRequired && phase73Audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Phase 7.3 is a manual product stabilization and readiness-scoring step only.",
      "Readiness score is a deterministic owner-review aid, not a beta launch trigger."
    ],
    readinessScore: phase73Package.readinessScore,
    readinessScoreBand: phase73Package.readinessScoreBand,
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
