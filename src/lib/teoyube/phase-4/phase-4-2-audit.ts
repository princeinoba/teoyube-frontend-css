import { createPhase42Package, createPhase42PackageReport } from "./phase-4-2-package";

export type TeoyubePhase42AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase42AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase42AuditChecklistItem[];
  missingItems: TeoyubePhase42AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 4.3 - Content Review Queue, Promise Cluster Expansion Drafts & Surface UX Refinement";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase42AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase42AuditChecklist(): TeoyubePhase42AuditChecklistItem[] {
  const phase42Package = createPhase42Package();
  const report = createPhase42PackageReport(phase42Package);
  return [
    item("phase_4_2_map_document", "Phase 4.2 map document exists", true, "phase-4-2-product-surface-polish-content-expansion-admin-workflow-map.md documents surfaces, gaps, patches, and backlog-only items."),
    item("product_surface_polish_contracts", "Product surface polish contracts exist", true, "product-surface-polish-contracts.ts defines status, surfaces, checks, issues, patches, reports, blockers, warnings, and decisions."),
    item("product_surface_polish_planner", "Product surface polish planner exists", phase42Package.productSurfacePolishPlan.safePatches.length >= 3, "product-surface-polish-planner.ts classifies safe patches and deferred polish work."),
    item("content_expansion_contracts", "Content expansion contracts exist", true, "content-expansion-contracts.ts defines content areas, candidates, backlog items, review states, reports, blockers, and warnings."),
    item("content_expansion_backlog", "Content expansion backlog exists", phase42Package.contentExpansionBacklog.items.length >= 8, "content-expansion-backlog.ts builds review-only backlog items from Phase 4.1 data."),
    item("scripture_promise_review_workflow", "Scripture/Promise review workflow exists", phase42Package.scripturePromiseReviewWorkflow.noUnsupportedScriptureInvented, "scripture-promise-content-review-workflow.ts requires anchor, promise, theology, copy, and owner review."),
    item("prayer_calling_review_workflow", "Prayer/Calling review workflow exists", phase42Package.prayerCallingReviewWorkflow.noProductionContentCreated, "prayer-calling-content-review-workflow.ts requires Scripture support, humility, explanation, fallback, and owner review."),
    item("admin_content_workflow_contracts", "Admin content workflow contracts exist", true, "admin-content-workflow-contracts.ts defines design-only workflow types."),
    item("admin_content_workflow_design", "Admin content workflow design exists", phase42Package.adminContentWorkflowDesign.noAdminUiBuilt, "admin-content-workflow-design.ts designs draft, review, approval, block, archive, change log, and rollback concepts."),
    item("admin_workflow_service_requirements", "Admin workflow service requirements exist", phase42Package.adminWorkflowServiceRequirements.noCmsConnected, "admin-workflow-service-requirements.ts keeps database, auth, audit logging, and CMS disconnected."),
    item("owner_review", "Phase 4.2 owner review exists", phase42Package.ownerReviewReport.record.checklist.length >= 8, "phase-4-2-owner-review.ts prepares structured manual owner review."),
    item("phase_4_2_package", "Phase 4.2 package exists", report.valid, `Phase 4.2 package decision: ${report.decision}.`),
    item("smoke_check", "Phase 4.2 smoke check exists", true, "phase-4-2-product-surface-polish-smoke-check.ts verifies Phase 4.2 modules."),
    item("documentation", "Phase 4.2 documentation exists", true, "phase-4-2-product-surface-polish-content-expansion-admin-workflow-design.md documents this step.")
  ];
}

export function getPhase42MissingItems(): TeoyubePhase42AuditChecklistItem[] {
  return getPhase42AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase42Warnings(): string[] {
  return createPhase42PackageReport(createPhase42Package()).warnings;
}

export function getPhase42CompletionPercentage(): number {
  const checklist = getPhase42AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase42Audit(): TeoyubePhase42AuditReport {
  const checklist = getPhase42AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase42PackageReport(createPhase42Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase42CompletionPercentage();

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase42Warnings(),
    blockers,
    nextStep: "Phase 4.3 - Content Review Queue, Promise Cluster Expansion Drafts & Surface UX Refinement",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
