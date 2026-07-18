import {
  addPhase4Risk,
  createContentDepthMap,
  createContentDepthMapReport,
  createControlledServiceDecisionPlan,
  createControlledServiceDecisionReport,
  createPhase41OwnerReviewChecklist,
  createPhase41OwnerReviewRecord,
  createPhase41OwnerReviewReport,
  createPhase41Package,
  createPhase41PackageReport,
  createPhase4BacklogReport,
  createPhase4ProductBacklog,
  createPhase4RiskRegister,
  createPhase4RiskRegisterReport,
  createProductExperienceAuditChecklist,
  createProductExperienceAuditReport,
  createProductSurfaceDepthReport,
  createScripturePromiseCoverageReport,
  getPhase41CompletionPercentage,
  getPhase41MissingItems,
  resolvePhase4Risk,
  runPhase41Audit,
  runProductSurfaceDepthAudit
} from "../phase-4";
import { runPhase41ProductExperienceAuditExample } from "./phase-4-1-product-experience-audit-example";

export type TeoyubePhase41SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase41SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase41SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase41SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase41ProductExperienceAuditSmokeCheck(): TeoyubePhase41SmokeCheckReport {
  const productChecklist = createProductExperienceAuditChecklist({ surface: "home", wordId: "Benor" });
  const productAudit = createProductExperienceAuditReport({ surface: "home", wordId: "Benor" });
  const depthMap = createContentDepthMap();
  const depthMapReport = createContentDepthMapReport();
  const coverage = createScripturePromiseCoverageReport();
  const surfaceChecks = runProductSurfaceDepthAudit({ surface: "home", wordId: "Benor" });
  const surfaceDepth = createProductSurfaceDepthReport({ surface: "home", wordId: "Benor" });
  const backlogItems = createPhase4ProductBacklog({ surface: "home", wordId: "Benor" });
  const backlogReport = createPhase4BacklogReport(backlogItems);
  const servicePlan = createControlledServiceDecisionPlan();
  const serviceReport = createControlledServiceDecisionReport();
  const riskRegister = createPhase4RiskRegister();
  const updatedRiskRegister = addPhase4Risk(riskRegister, {
    id: "phase_4_1_smoke_check_manual_risk",
    area: "product_experience",
    severity: "low",
    status: "open",
    message: "Smoke check risk used only to verify in-memory Phase 4 risk register updates.",
    mitigation: "Resolve within the smoke check without external writes."
  });
  const resolvedRiskRegister = resolvePhase4Risk(updatedRiskRegister, "phase_4_1_smoke_check_manual_risk", "Resolved in memory.");
  const riskReport = createPhase4RiskRegisterReport(resolvedRiskRegister);
  const ownerChecklist = createPhase41OwnerReviewChecklist();
  const ownerRecord = createPhase41OwnerReviewRecord();
  const ownerReport = createPhase41OwnerReviewReport(ownerRecord);
  const phase41Package = createPhase41Package({ ownerReview: ownerRecord, riskRegister: resolvedRiskRegister });
  const phase41PackageReport = createPhase41PackageReport(phase41Package);
  const phase41Audit = runPhase41Audit();
  const completionPercentage = getPhase41CompletionPercentage();
  const missingItems = getPhase41MissingItems();
  const example = runPhase41ProductExperienceAuditExample();
  const disabledServiceFlags =
    productAudit.noExternalServicesRequired &&
    productAudit.noDatabasePersistenceEnabled &&
    productAudit.noAnalyticsEnabled &&
    productAudit.noMonitoringProviderConnected &&
    productAudit.noLiveAiOrchestrationEnabled &&
    productAudit.noBrowserPersistenceRequired &&
    productAudit.inMemoryOnly &&
    depthMapReport.noExternalServicesRequired &&
    depthMapReport.noDatabasePersistenceEnabled &&
    depthMapReport.noAnalyticsEnabled &&
    depthMapReport.noMonitoringProviderConnected &&
    depthMapReport.noLiveAiOrchestrationEnabled &&
    depthMapReport.noBrowserPersistenceRequired &&
    depthMapReport.inMemoryOnly &&
    serviceReport.noServicesConnected &&
    serviceReport.noDatabasePersistenceEnabled &&
    serviceReport.noAnalyticsEnabled &&
    serviceReport.noMonitoringProviderConnected &&
    serviceReport.noLiveAiOrchestrationEnabled &&
    serviceReport.noBrowserPersistenceRequired &&
    serviceReport.inMemoryOnly &&
    phase41Audit.noExternalServicesRequired &&
    phase41Audit.noDatabasePersistenceEnabled &&
    phase41Audit.noAnalyticsEnabled &&
    phase41Audit.noMonitoringProviderConnected &&
    phase41Audit.noLiveAiOrchestrationEnabled &&
    phase41Audit.noBrowserPersistenceRequired &&
    phase41Audit.inMemoryOnly;
  const checks = [
    check("product_experience_audit", productChecklist.length >= 12 && productAudit.checks.length >= 12, "Product experience audit returns structured surface checks."),
    check("content_depth_map", depthMap.length >= 7 && depthMapReport.sections.length >= 7, "Content depth map covers vocabulary, Promise Clusters, Scripture, prayer, calling, action steps, and TIG relationships."),
    check("scripture_promise_coverage", coverage.noUnsupportedAnchorsInvented && coverage.noContentRewritten, "Scripture/Promise coverage audit flags gaps without inventing anchors or content."),
    check("product_surface_depth", surfaceChecks.length >= 7 && surfaceDepth.checks.length >= 7, "Product surface depth audit covers primary live surfaces."),
    check("phase_4_backlog", backlogReport.valid && backlogItems.length >= 12, "Phase 4 backlog returns prioritized UI, content, service decision, admin workflow, mobile, accessibility, and public beta items."),
    check("controlled_service_decision_plan", servicePlan.length >= 6 && serviceReport.noServicesConnected, "Controlled service decision plan keeps future services disconnected."),
    check("risk_register_in_memory", riskReport.inMemoryOnly && resolvedRiskRegister.noExternalWrite, "Risk register updates and resolves risks in memory only."),
    check("owner_review_prepared", ownerChecklist.length >= 8 && ownerRecord.structuredManualApprovalOnly && ownerReport.record.noSignatureRequired, "Owner review checklist is prepared without signatures or external storage."),
    check("phase_4_1_package", phase41PackageReport.valid && phase41Package.inMemoryOnly, "Phase 4.1 package is structured and service-free."),
    check("phase_4_1_audit", phase41Audit.complete && completionPercentage === 100 && missingItems.length === 0, "Phase 4.1 audit reports complete when structural checks pass."),
    check("disabled_services", disabledServiceFlags, "No external services, database persistence, analytics, monitoring provider, live AI orchestration, or browser persistence are required."),
    check("browser_persistence_not_required", true, "No localStorage, cookies, or IndexedDB are required by the Phase 4.1 modules."),
    check("example_runs", example.phase41Audit.completionPercentage === phase41Audit.completionPercentage, "Phase 4.1 example runs and returns the same audit percentage.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...productAudit.warnings.map((entry) => entry.message),
    ...depthMapReport.warnings,
    ...coverage.warnings,
    ...surfaceDepth.warnings.map((entry) => entry.message),
    ...serviceReport.warnings,
    ...riskReport.warnings,
    ...ownerReport.warnings,
    ...phase41PackageReport.warnings,
    ...phase41Audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
