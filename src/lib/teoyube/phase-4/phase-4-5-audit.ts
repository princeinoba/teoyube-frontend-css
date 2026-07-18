import { createPhase45Package, createPhase45PackageReport } from "./phase-4-5-package";

export type TeoyubePhase45AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase45AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase45AuditChecklistItem[];
  missingItems: TeoyubePhase45AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 4.6 - Beta Readiness Review, Service Decision Lock & Phase 4 Completion";
  noProductionCms: true;
  noAdminAuthAdded: true;
  noUserAccountsAdded: true;
  noDatabasePersistenceEnabled: true;
  noExternalServicesRequired: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase45AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase45AuditChecklist(): TeoyubePhase45AuditChecklistItem[] {
  const phase45Package = createPhase45Package();
  const report = createPhase45PackageReport(phase45Package);
  return [
    item("phase_4_5_map_document", "Phase 4.5 map document exists", true, "phase-4-5-controlled-admin-workflow-service-readiness-beta-qa-map.md documents found structures and constraints."),
    item("controlled_admin_prototype_contracts", "Controlled admin prototype contracts exist", true, "controlled-admin-prototype-contracts.ts defines workspace, item, panel, action, decision, blocker, warning, and report types."),
    item("controlled_admin_workspace", "Controlled admin workspace exists", phase45Package.controlledAdminWorkspace.valid, "controlled-admin-workspace.ts builds in-memory review workspaces from queue and release candidates."),
    item("admin_review_board_view_model", "Admin review board view model exists", phase45Package.adminReviewBoardViewModel.panelCount >= 8, "admin-review-board-view-model.ts prepares prototype-only panels."),
    item("admin_workflow_action_simulator", "Admin workflow action simulator exists", phase45Package.adminWorkflowActionSimulation.simulatedOnly, "admin-workflow-action-simulator.ts simulates actions without publishing or persistence."),
    item("service_readiness_review_contracts", "Service readiness review contracts exist", true, "service-readiness-review-contracts.ts defines service readiness types."),
    item("service_readiness_review", "Service readiness review exists", phase45Package.serviceReadinessReview.valid, "service-readiness-review.ts keeps services disabled or plan-only."),
    item("beta_qa_plan_contracts", "Beta QA plan contracts exist", true, "beta-qa-plan-contracts.ts defines beta QA types."),
    item("beta_qa_plan_builder", "Beta QA plan builder exists", phase45Package.betaQaPlan.scenarioCount >= 12, "beta-qa-plan-builder.ts creates beta QA scenarios and checklist."),
    item("beta_qa_runbook", "Beta QA runbook exists", phase45Package.betaQaRunbook.valid, "beta-qa-runbook.ts creates manual beta QA runbook sections."),
    item("beta_qa_issue_triage", "Beta QA issue triage exists", phase45Package.betaIssueTriage.valid, "beta-qa-issue-triage.ts classifies blockers and recommended actions."),
    item("beta_readiness_package", "Beta readiness package exists", phase45Package.betaReadinessPackage.valid, "beta-readiness-package.ts combines admin, service, beta QA, and Phase 4.4 status."),
    item("owner_review", "Phase 4.5 owner review exists", phase45Package.ownerReviewReport.record.checklist.length >= 10, "phase-4-5-owner-review.ts prepares manual owner review."),
    item("phase_4_5_package", "Phase 4.5 package exists", report.valid, `Phase 4.5 package decision: ${report.decision}.`),
    item("smoke_check", "Phase 4.5 smoke check exists", true, "phase-4-5-controlled-admin-workflow-smoke-check.ts verifies the Phase 4.5 package."),
    item("documentation", "Phase 4.5 documentation exists", true, "phase-4-5-controlled-admin-workflow-service-readiness-beta-qa-plan.md documents this step.")
  ];
}

export function getPhase45MissingItems(): TeoyubePhase45AuditChecklistItem[] {
  return getPhase45AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase45Warnings(): string[] {
  return createPhase45PackageReport(createPhase45Package()).warnings;
}

export function getPhase45CompletionPercentage(): number {
  const checklist = getPhase45AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase45Audit(): TeoyubePhase45AuditReport {
  const checklist = getPhase45AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase45PackageReport(createPhase45Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase45CompletionPercentage();

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase45Warnings(),
    blockers,
    nextStep: "Phase 4.6 - Beta Readiness Review, Service Decision Lock & Phase 4 Completion",
    noProductionCms: true,
    noAdminAuthAdded: true,
    noUserAccountsAdded: true,
    noDatabasePersistenceEnabled: true,
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
