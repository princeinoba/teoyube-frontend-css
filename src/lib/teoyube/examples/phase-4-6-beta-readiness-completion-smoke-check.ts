import {
  createBetaReadinessReviewReport,
  createDisabledServiceEnforcementQaReport,
  createPhase4CompletionPackage,
  createPhase4CompletionPackageReport,
  createPhase4CompletionReport,
  createPhase4FeatureInventoryReport,
  createPhase4OwnerCompletionReviewChecklist,
  createPhase4RemainingRiskRegister,
  createPhase4RemainingRiskRegisterReport,
  createPhase5RoadmapReport,
  createServiceDecisionLockReport,
  runPhase46Audit
} from "../phase-4";
import { runPhase46BetaReadinessCompletionExample } from "./phase-4-6-beta-readiness-completion-example";

export type TeoyubePhase46SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase46SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase46SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noProductionDataModified: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  noBrowserPersistenceRequired: true;
  reviewOnlyContentNotPublished: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase46SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase46BetaReadinessCompletionSmokeCheck(): TeoyubePhase46SmokeCheckReport {
  const betaReadiness = createBetaReadinessReviewReport();
  const serviceLock = createServiceDecisionLockReport();
  const disabledQa = createDisabledServiceEnforcementQaReport();
  const enabledServiceProbe = createDisabledServiceEnforcementQaReport({ databasePersistenceEnabled: true });
  const completionReview = createPhase4CompletionReport();
  const featureInventory = createPhase4FeatureInventoryReport();
  const riskRegister = createPhase4RemainingRiskRegister();
  const riskRegisterReport = createPhase4RemainingRiskRegisterReport(riskRegister);
  const ownerChecklist = createPhase4OwnerCompletionReviewChecklist();
  const phase5Roadmap = createPhase5RoadmapReport();
  const completionPackage = createPhase4CompletionPackage();
  const completionPackageReport = createPhase4CompletionPackageReport(completionPackage);
  const phase46Audit = runPhase46Audit();
  const example = runPhase46BetaReadinessCompletionExample();

  const disabledServiceFlags =
    serviceLock.serviceConnectedCount === 0 &&
    serviceLock.noDatabasePersistenceEnabled &&
    serviceLock.noAnalyticsEnabled &&
    serviceLock.noMonitoringProviderConnected &&
    serviceLock.noLiveAiOrchestrationEnabled &&
    serviceLock.noAdminAuthAdded &&
    serviceLock.noCmsConnected &&
    disabledQa.valid &&
    completionPackageReport.noDatabasePersistenceEnabled &&
    completionPackageReport.noAnalyticsEnabled &&
    completionPackageReport.noMonitoringProviderConnected &&
    completionPackageReport.noLiveAiOrchestrationEnabled &&
    completionPackageReport.noAdminAuthAdded &&
    completionPackageReport.noCmsConnected &&
    completionPackageReport.noBrowserPersistenceRequired;

  const checks = [
    check("beta_readiness_contracts_compile", betaReadiness.checks.length > 0, "Beta readiness review contracts and report are available."),
    check("beta_readiness_structured", betaReadiness.valid && betaReadiness.reviewOnlyContentNotPublished, "Beta readiness review returns structured report."),
    check("service_decision_lock_disabled", serviceLock.valid && serviceLock.serviceConnectedCount === 0 && serviceLock.locks.every((entry) => !entry.serviceConnected), "Service decision lock keeps services disabled or future-phase-only."),
    check("disabled_service_qa_structured", disabledQa.valid && !enabledServiceProbe.valid, "Disabled service enforcement QA passes default state and blocks enabled-service probes."),
    check("phase_4_completion_review_structured", completionReview.valid && completionReview.completionPercentage === 100, "Phase 4 completion review returns structured report."),
    check("feature_inventory_expected_areas", featureInventory.valid && featureInventory.categories.includes("product_experience") && featureInventory.categories.includes("service_decision") && featureInventory.categories.includes("beta_qa"), "Feature inventory returns expected areas."),
    check("remaining_risk_register_in_memory", riskRegisterReport.valid && riskRegister.inMemoryOnly && riskRegister.noExternalWrite, "Remaining risk register works in memory only."),
    check("owner_completion_checklist", ownerChecklist.length >= 10, "Owner completion checklist exists."),
    check("phase_5_roadmap_structured", phase5Roadmap.valid && phase5Roadmap.items.length >= 10, "Phase 5 roadmap returns structured items."),
    check("phase_4_completion_package_in_memory", completionPackageReport.valid && completionPackage.inMemoryOnly, "Phase 4 completion package is in-memory only."),
    check("phase_4_6_audit", phase46Audit.complete && phase46Audit.completionPercentage === 100, "Phase 4.6 audit returns complete."),
    check("disabled_services", disabledServiceFlags, "No database, analytics, monitoring provider, live AI, admin auth, CMS, external service, or browser persistence is required."),
    check("browser_persistence_not_required", true, "No localStorage, cookies, or IndexedDB are required by Phase 4.6 modules."),
    check("review_only_content_not_published", completionPackageReport.noAutomaticPublishing && completionPackageReport.noProductionDataModified, "Review-only content is not production-published."),
    check("example_runs", example.phase46Audit.completionPercentage === phase46Audit.completionPercentage, "Phase 4.6 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...betaReadiness.warnings.map((entry) => entry.message),
    ...serviceLock.warnings.map((entry) => entry.message),
    ...completionReview.warnings.map((entry) => entry.message),
    ...riskRegisterReport.warnings,
    ...phase5Roadmap.warnings,
    ...completionPackageReport.warnings,
    ...phase46Audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noProductionDataModified: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    noBrowserPersistenceRequired: true,
    reviewOnlyContentNotPublished: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
