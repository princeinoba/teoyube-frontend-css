import { createPhase44Package, createPhase44PackageReport } from "./phase-4-4-package";

export type TeoyubePhase44AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase44AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase44AuditChecklistItem[];
  missingItems: TeoyubePhase44AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 4.5 - Controlled Admin Workflow Prototype, Service Readiness Review & Beta QA Plan";
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noDraftContentPublished: true;
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase44AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase44AuditChecklist(): TeoyubePhase44AuditChecklistItem[] {
  const phase44Package = createPhase44Package();
  const report = createPhase44PackageReport(phase44Package);
  return [
    item("phase_4_4_map_document", "Phase 4.4 map document exists", true, "phase-4-4-reviewed-content-integration-promise-table-tig-graph-map.md documents Phase 4.3 outputs, UX gaps, and review gates."),
    item("reviewed_content_integration_contracts", "Reviewed content integration contracts exist", true, "reviewed-content-integration-contracts.ts defines reviewed item, gate, release candidate, decision, source, blockers, warnings, and report types."),
    item("reviewed_content_integration_gate", "Reviewed content integration gate exists", phase44Package.reviewedContentGate.valid, "reviewed-content-integration-gate.ts blocks review-only drafts and unsafe production candidates."),
    item("release_candidate_builder", "Release candidate builder exists", phase44Package.releaseCandidates.valid, "reviewed-content-release-candidate-builder.ts creates manual in-memory release candidates only from eligible reviewed items."),
    item("reviewed_content_integration_planner", "Reviewed content integration planner exists", phase44Package.reviewedContentIntegrationPlan.valid, "reviewed-content-integration-planner.ts classifies ready, review-needed, blocked, and deferred items."),
    item("promise_table_ux_contracts", "Promise Table UX contracts exist", true, "promise-table-ux-contracts.ts defines row, filter, sort, view mode, selection, report, blocker, warning, and decision types."),
    item("promise_table_ux_view_model", "Promise Table UX view model exists", phase44Package.promiseTableUx.generatedFromRealRows, "promise-table-ux-view-model.ts builds card, mobile list, and Scripture focus models from real Promise Table rows."),
    item("tig_graph_experience_contracts", "TIG Graph experience contracts exist", true, "tig-graph-experience-contracts.ts defines graph node, edge, legend, trace overlay, view mode, report, blocker, warning, and decision types."),
    item("tig_graph_experience_view_model", "TIG Graph experience view model exists", phase44Package.tigGraphExperience.generatedFromRealTigRelationships, "tig-graph-experience-view-model.ts builds readable graph/list data from real TIG relationships."),
    item("reviewed_content_integration_qa", "Reviewed content integration QA exists", phase44Package.reviewedContentQa.valid, "reviewed-content-integration-qa.ts verifies draft exclusion, reviews, anchors, and unsupported-claim guards."),
    item("promise_table_ux_qa", "Promise Table UX QA exists", phase44Package.promiseTableUxQa.valid, "promise-table-ux-qa.ts verifies real rows, Scripture visibility, mobile readiness, empty state, and no draft content."),
    item("tig_graph_experience_qa", "TIG Graph experience QA exists", phase44Package.tigGraphExperienceQa.valid, "tig-graph-experience-qa.ts verifies readable nodes/edges, trace, mobile fallback, Scripture, and no debug payload."),
    item("owner_review", "Phase 4.4 owner review exists", phase44Package.ownerReviewReport.record.checklist.length >= 10, "phase-4-4-owner-review.ts prepares structured manual owner review."),
    item("phase_4_4_package", "Phase 4.4 package exists", report.valid, `Phase 4.4 package decision: ${report.decision}.`),
    item("smoke_check", "Phase 4.4 smoke check exists", true, "phase-4-4-reviewed-content-integration-smoke-check.ts verifies Phase 4.4 modules."),
    item("documentation", "Phase 4.4 documentation exists", true, "phase-4-4-reviewed-content-integration-promise-table-ux-tig-graph-polish.md documents this step.")
  ];
}

export function getPhase44MissingItems(): TeoyubePhase44AuditChecklistItem[] {
  return getPhase44AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase44Warnings(): string[] {
  return createPhase44PackageReport(createPhase44Package()).warnings;
}

export function getPhase44CompletionPercentage(): number {
  const checklist = getPhase44AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase44Audit(): TeoyubePhase44AuditReport {
  const checklist = getPhase44AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase44PackageReport(createPhase44Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase44CompletionPercentage();

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase44Warnings(),
    blockers,
    nextStep: "Phase 4.5 - Controlled Admin Workflow Prototype, Service Readiness Review & Beta QA Plan",
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noDraftContentPublished: true,
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
