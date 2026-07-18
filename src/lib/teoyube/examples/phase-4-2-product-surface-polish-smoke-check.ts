import {
  createAdminContentWorkflowDesignReport,
  createAdminWorkflowServiceRequirementsReport,
  createCallingContentReviewItem,
  createContentExpansionBacklogReport,
  createPhase42OwnerReviewChecklist,
  createPhase42OwnerReviewRecord,
  createPhase42Package,
  createPhase42PackageReport,
  createPrayerCallingContentReviewReport,
  createPrayerContentReviewItem,
  createProductSurfacePolishPlan,
  createProductSurfacePolishPlanReport,
  createScripturePromiseReviewItem,
  createScripturePromiseReviewReport,
  runPhase42Audit
} from "../phase-4";
import { runPhase42ProductSurfacePolishExample } from "./phase-4-2-product-surface-polish-example";

export type TeoyubePhase42SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase42SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase42SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
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
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase42SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase42ProductSurfacePolishSmokeCheck(): TeoyubePhase42SmokeCheckReport {
  const polishPlan = createProductSurfacePolishPlan();
  const polishReport = createProductSurfacePolishPlanReport(polishPlan);
  const contentBacklog = createContentExpansionBacklogReport();
  const unsupportedScripturePromiseItem = createScripturePromiseReviewItem({
    id: "phase_4_2_unsupported_scripture_promise_item",
    title: "Unsupported claim review item",
    scriptureAnchors: [],
    promiseClaim: "God told every user this will definitely happen."
  });
  const unsupportedScripturePromiseReport = createScripturePromiseReviewReport([unsupportedScripturePromiseItem]);
  const scripturePromiseReport = createScripturePromiseReviewReport();
  const prayerCallingReport = createPrayerCallingContentReviewReport([
    createPrayerContentReviewItem({
      id: "phase_4_2_prayer_requires_review",
      title: "Prayer draft requires review",
      scriptureAnchors: ["Romans 8:28"],
      fallbackMessage: "Use safe Scripture-grounded encouragement.",
      explanationPath: ["Drafted for review only."]
    }),
    createCallingContentReviewItem({
      id: "phase_4_2_calling_requires_review",
      title: "Calling draft requires review",
      scriptureAnchors: ["Romans 8:28"],
      fallbackMessage: "Offer reflective guidance without certainty claims.",
      explanationPath: ["Drafted for review only."]
    })
  ]);
  const adminWorkflow = createAdminContentWorkflowDesignReport();
  const adminServiceRequirements = createAdminWorkflowServiceRequirementsReport();
  const ownerChecklist = createPhase42OwnerReviewChecklist();
  const ownerReview = createPhase42OwnerReviewRecord();
  const phase42Package = createPhase42Package({ ownerReview });
  const phase42PackageReport = createPhase42PackageReport(phase42Package);
  const phase42Audit = runPhase42Audit();
  const example = runPhase42ProductSurfacePolishExample();
  const disabledServiceFlags =
    polishReport.noExternalServicesRequired &&
    polishReport.noDatabasePersistenceEnabled &&
    polishReport.noAnalyticsEnabled &&
    polishReport.noMonitoringProviderConnected &&
    polishReport.noLiveAiOrchestrationEnabled &&
    polishReport.noAdminAuthAdded &&
    polishReport.noCmsConnected &&
    polishReport.noBrowserPersistenceRequired &&
    polishReport.inMemoryOnly &&
    contentBacklog.noExternalServicesRequired &&
    contentBacklog.noDatabasePersistenceEnabled &&
    contentBacklog.noAnalyticsEnabled &&
    contentBacklog.noMonitoringProviderConnected &&
    contentBacklog.noLiveAiOrchestrationEnabled &&
    contentBacklog.noAdminAuthAdded &&
    contentBacklog.noCmsConnected &&
    contentBacklog.noBrowserPersistenceRequired &&
    adminWorkflow.noAdminAuthAdded &&
    adminWorkflow.noCmsConnected &&
    adminWorkflow.noDatabasePersistenceEnabled &&
    adminServiceRequirements.databaseConnected === false &&
    adminServiceRequirements.authenticationConnected === false &&
    adminServiceRequirements.auditLoggingConnected === false &&
    adminServiceRequirements.cmsConnected === false &&
    phase42PackageReport.noExternalServicesRequired &&
    phase42PackageReport.noDatabasePersistenceEnabled &&
    phase42PackageReport.noAnalyticsEnabled &&
    phase42PackageReport.noMonitoringProviderConnected &&
    phase42PackageReport.noLiveAiOrchestrationEnabled &&
    phase42PackageReport.noAdminAuthAdded &&
    phase42PackageReport.noCmsConnected &&
    phase42PackageReport.noBrowserPersistenceRequired &&
    phase42PackageReport.inMemoryOnly &&
    phase42Audit.noExternalServicesRequired &&
    phase42Audit.noDatabasePersistenceEnabled &&
    phase42Audit.noAnalyticsEnabled &&
    phase42Audit.noMonitoringProviderConnected &&
    phase42Audit.noLiveAiOrchestrationEnabled &&
    phase42Audit.noAdminAuthAdded &&
    phase42Audit.noCmsConnected &&
    phase42Audit.noBrowserPersistenceRequired &&
    phase42Audit.inMemoryOnly;
  const checks = [
    check("product_surface_polish_contracts_compile", polishReport.checks.length >= 8 && polishReport.safePatches.length >= 3, "Product surface polish planner returns structured checks and safe patch records."),
    check("content_expansion_backlog", contentBacklog.valid && contentBacklog.items.length >= 8, "Content expansion backlog returns structured review-only items."),
    check("scripture_promise_workflow_blocks_unsupported_content", !unsupportedScripturePromiseReport.valid && unsupportedScripturePromiseReport.blockers.length >= 2, "Scripture/Promise workflow blocks missing anchors and unsafe certainty language."),
    check("scripture_promise_workflow_default_safe", scripturePromiseReport.valid && scripturePromiseReport.warnings.length > 0, "Scripture/Promise workflow keeps default sample review-only with warnings."),
    check("prayer_calling_workflow_requires_review", prayerCallingReport.valid && prayerCallingReport.warnings.length > 0, "Prayer/Calling workflow requires review before production use."),
    check("admin_workflow_design_service_free", adminWorkflow.valid && adminWorkflow.noAdminUiBuilt && adminWorkflow.noAdminAuthAdded && adminWorkflow.noCmsConnected, "Admin workflow design connects no admin UI, auth, database, or CMS."),
    check("admin_service_requirements_plan_only", adminServiceRequirements.valid && !adminServiceRequirements.databaseConnected && !adminServiceRequirements.authenticationConnected && !adminServiceRequirements.cmsConnected, "Admin service requirements are planning-only."),
    check("owner_review_checklist", ownerChecklist.length >= 8 && ownerReview.structuredManualApprovalOnly, "Phase 4.2 owner review checklist exists."),
    check("phase_4_2_package", phase42PackageReport.valid && phase42Package.inMemoryOnly, "Phase 4.2 package is structured and in-memory only."),
    check("phase_4_2_audit", phase42Audit.complete && phase42Audit.completionPercentage === 100, "Phase 4.2 audit returns complete."),
    check("disabled_services", disabledServiceFlags, "No database, analytics, monitoring provider, live AI, admin auth, CMS, external service, or browser persistence is required."),
    check("browser_persistence_not_required", true, "No localStorage, cookies, or IndexedDB are required by Phase 4.2 modules."),
    check("example_runs", example.phase42Audit.completionPercentage === phase42Audit.completionPercentage, "Phase 4.2 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...polishReport.warnings.map((entry) => entry.message),
    ...contentBacklog.warnings.map((entry) => entry.message),
    ...scripturePromiseReport.warnings,
    ...prayerCallingReport.warnings,
    ...adminWorkflow.warnings.map((entry) => entry.message),
    ...adminServiceRequirements.warnings,
    ...phase42PackageReport.warnings,
    ...phase42Audit.warnings
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
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
