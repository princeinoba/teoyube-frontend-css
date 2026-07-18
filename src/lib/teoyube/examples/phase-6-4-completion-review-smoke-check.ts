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
  createPhase6OwnerCompletionReviewChecklist,
  createPhase6OwnerCompletionReviewRecord,
  createPhase6RemainingRiskRegister,
  createPhase6RemainingRiskRegisterReport,
  createPhase7RoadmapReport,
  runPhase64Audit
} from "../phase-6";

export type TeoyubePhase64SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase64SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase64SmokeCheckResult[];
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

function result(id: string, passed: boolean, details: string): TeoyubePhase64SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase64CompletionReviewSmokeCheck(): TeoyubePhase64SmokeCheckReport {
  const completionReview = createPhase6CompletionReport({ ownerReviewed: true });
  const operationsLock = createControlledBetaOperationsLock({ ownerReviewed: true });
  const unsafeOperationsLock = createControlledBetaOperationsLock({
    ownerReviewed: true,
    usersContacted: true,
    feedbackCollectedAutomatically: true,
    databasePersistenceEnabled: true
  });
  const finalBetaServiceDisabledLock = createFinalBetaServiceDisabledLock();
  const finalBetaServiceDisabledLockReport = createFinalBetaServiceDisabledLockReport(finalBetaServiceDisabledLock);
  const evidenceArchive = createPhase6EvidenceArchive();
  const evidenceArchiveReport = createPhase6EvidenceArchiveReport();
  const featureInventory = createPhase6FeatureInventory();
  const riskRegister = addPhase6RemainingRisk(createPhase6RemainingRiskRegister(), {
    id: "smoke_phase_7_manual_ops_capacity",
    area: "operations_readiness",
    severity: "medium",
    status: "accepted",
    message: "Smoke-check Phase 7 manual operations capacity risk.",
    mitigation: "Carry into Phase 7 support workflow."
  });
  const riskRegisterReport = createPhase6RemainingRiskRegisterReport(riskRegister);
  const ownerChecklist = createPhase6OwnerCompletionReviewChecklist(true);
  const ownerCompletionReview = createPhase6OwnerCompletionReviewRecord({ reviewed: true });
  const phase7RoadmapReport = createPhase7RoadmapReport();
  const phase6CompletionPackage = createPhase6CompletionPackage({
    ownerReviewed: true,
    remainingRiskRegister: riskRegister,
    ownerCompletionReview
  });
  const phase6CompletionPackageReport = createPhase6CompletionPackageReport(phase6CompletionPackage);
  const phase64Audit = runPhase64Audit();

  const checks = [
    result("phase_6_completion_contracts_compile", Array.isArray(completionReview.checks), `${completionReview.checks.length} completion check(s).`),
    result("completion_review_structured", completionReview.valid && completionReview.inMemoryOnly && completionReview.completionPercentage === 100, `Decision: ${completionReview.decision}; completion: ${completionReview.completionPercentage}%.`),
    result("operations_lock_protects_boundaries", operationsLock.valid && operationsLock.inMemoryOnly && !unsafeOperationsLock.valid && unsafeOperationsLock.blockers.length >= 3, "Operations lock passes safe input and blocks unsafe contact, automatic feedback, and persistence."),
    result("final_service_disabled_lock", finalBetaServiceDisabledLockReport.valid && finalBetaServiceDisabledLockReport.lock.items.length === 9, "Final beta service-disabled lock keeps all service decisions disabled or plan-only."),
    result("evidence_archive_in_memory", evidenceArchive.inMemoryOnly && evidenceArchive.noExternalWrite && evidenceArchiveReport.valid, `${evidenceArchive.items.length} evidence item(s).`),
    result("feature_inventory_expected_areas", featureInventory.some((entry) => entry.id === "controlled_beta_execution_plan") && featureInventory.some((entry) => entry.id === "controlled_beta_operations_lock"), `${featureInventory.length} inventory item(s).`),
    result("risk_register_in_memory", riskRegister.inMemoryOnly && riskRegisterReport.summary.total >= 1 && riskRegisterReport.valid, `${riskRegisterReport.summary.total} remaining risk(s).`),
    result("owner_completion_checklist_exists", ownerChecklist.length >= 10, `${ownerChecklist.length} owner completion checklist item(s).`),
    result("phase_7_roadmap_structured", phase7RoadmapReport.valid && phase7RoadmapReport.items.length >= 12 && phase7RoadmapReport.inMemoryOnly, `${phase7RoadmapReport.items.length} Phase 7 roadmap item(s).`),
    result("completion_package_in_memory", phase6CompletionPackageReport.valid && phase6CompletionPackageReport.inMemoryOnly && phase6CompletionPackageReport.noExternalSend, `Package decision: ${phase6CompletionPackageReport.decision}.`),
    result("phase_6_4_audit_complete", phase64Audit.complete && phase64Audit.completionPercentage === 100, `Audit completion: ${phase64Audit.completionPercentage}%.`),
    result("no_beta_launch_performed", phase6CompletionPackage.noBetaLaunchPerformed && phase64Audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase6CompletionPackage.noUsersContacted && phase64Audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", phase6CompletionPackage.noFeedbackCollectedAutomatically && phase64Audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", phase6CompletionPackage.noPublicUrlsFetchedAutomatically && phase64Audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase6CompletionPackage.noDatabasePersistenceEnabled && phase64Audit.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", phase6CompletionPackage.noAnalyticsEnabled && phase64Audit.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", phase6CompletionPackage.noMonitoringProviderConnected && phase64Audit.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", phase6CompletionPackage.noLiveAiOrchestrationEnabled && phase64Audit.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth", phase6CompletionPackage.noAdminAuthAdded && phase64Audit.noAdminAuthAdded, "No admin auth is added."),
    result("no_cms", phase6CompletionPackage.noCmsConnected && phase64Audit.noCmsConnected, "No CMS is connected."),
    result("no_external_services_required", phase6CompletionPackage.noExternalServicesRequired && phase64Audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase6CompletionPackage.noBrowserPersistenceRequired && phase64Audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Phase 6.4 is a completion review and operations lock only; it does not launch beta.",
      "Phase 7 remains a roadmap until explicit owner approval for controlled beta operations."
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
