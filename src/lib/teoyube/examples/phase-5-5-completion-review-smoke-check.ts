import {
  createBetaReadinessEvidenceArchiveReport,
  createBetaReadinessLockReport,
  createFinalDisabledServiceLockReport,
  createPhase5CompletionPackage,
  createPhase5CompletionPackageReport,
  createPhase5CompletionReport,
  createPhase5FeatureInventoryReport,
  createPhase5OwnerCompletionReviewChecklist,
  createPhase5RemainingRiskRegister,
  createPhase5RemainingRiskRegisterReport,
  createPhase6RoadmapReport,
  runPhase55Audit
} from "../phase-5";

export type TeoyubePhase55SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase55SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase55SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
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

function result(id: string, passed: boolean, details: string): TeoyubePhase55SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase55CompletionReviewSmokeCheck(): TeoyubePhase55SmokeCheckReport {
  const completionReview = createPhase5CompletionReport();
  const betaReadinessLock = createBetaReadinessLockReport();
  const finalDisabledServiceLock = createFinalDisabledServiceLockReport();
  const evidenceArchive = createBetaReadinessEvidenceArchiveReport();
  const featureInventory = createPhase5FeatureInventoryReport();
  const riskRegister = createPhase5RemainingRiskRegisterReport(createPhase5RemainingRiskRegister());
  const ownerChecklist = createPhase5OwnerCompletionReviewChecklist();
  const phase6Roadmap = createPhase6RoadmapReport();
  const completionPackage = createPhase5CompletionPackage({ ownerReviewed: true });
  const completionPackageReport = createPhase5CompletionPackageReport(completionPackage);
  const audit = runPhase55Audit();

  const checks = [
    result("phase_5_completion_contracts_compile", completionReview.checks.length >= 20, `${completionReview.checks.length} completion check(s) generated.`),
    result("completion_review_structured", completionReview.valid && completionReview.inMemoryOnly, `Decision: ${completionReview.decision}.`),
    result("beta_readiness_lock_boundaries", betaReadinessLock.valid && betaReadinessLock.noBetaLaunchPerformed && betaReadinessLock.noExternalServicesRequired, `Readiness lock decision: ${betaReadinessLock.decision}.`),
    result("final_disabled_service_lock", finalDisabledServiceLock.valid && finalDisabledServiceLock.lock.items.length >= 9, `${finalDisabledServiceLock.lock.items.length} disabled service decision(s) locked.`),
    result("evidence_archive_in_memory", evidenceArchive.archive.inMemoryOnly && evidenceArchive.archive.noExternalWrite, `${evidenceArchive.archive.items.length} evidence item(s) archived in memory.`),
    result("feature_inventory_expected_areas", featureInventory.valid && featureInventory.inventory.length >= 25, `${featureInventory.inventory.length} inventory item(s) generated.`),
    result("remaining_risk_register_in_memory", riskRegister.valid && riskRegister.register.inMemoryOnly, `${riskRegister.summary.total} remaining risk(s) represented.`),
    result("owner_completion_checklist_exists", ownerChecklist.length >= 10, `${ownerChecklist.length} owner completion item(s) generated.`),
    result("phase_6_roadmap_structured", phase6Roadmap.valid && phase6Roadmap.items.length >= 12, `${phase6Roadmap.items.length} Phase 6 roadmap item(s) generated.`),
    result("phase_5_completion_package_in_memory", completionPackage.inMemoryOnly && completionPackageReport.inMemoryOnly, `Package decision: ${completionPackageReport.decision}.`),
    result("phase_5_5_audit_structured", audit.complete && audit.completionPercentage === 100, `Audit completion: ${audit.completionPercentage}%.`),
    result("no_beta_launch_performed", completionPackage.noBetaLaunchPerformed && audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", completionPackage.noUsersContacted && audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", completionPackage.noFeedbackCollectedAutomatically && audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", completionPackage.noPublicUrlsFetchedAutomatically && audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", completionPackage.noDatabasePersistenceEnabled && audit.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", completionPackage.noAnalyticsEnabled && audit.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", completionPackage.noMonitoringProviderConnected && audit.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", completionPackage.noLiveAiOrchestrationEnabled && audit.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth_or_cms", completionPackage.noAdminAuthAdded && completionPackage.noCmsConnected, "No admin auth or CMS is added."),
    result("no_external_services_required", completionPackage.noExternalServicesRequired && audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", completionPackage.noBrowserPersistenceRequired && audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Phase 6 remains planning only until explicit future owner approval.",
      "Accepted remaining risks must be carried into Phase 6.1."
    ],
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
