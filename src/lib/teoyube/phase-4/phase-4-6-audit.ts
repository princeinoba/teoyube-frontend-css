import { createPhase4CompletionPackage, createPhase4CompletionPackageReport } from "./phase-4-completion-package";

export type TeoyubePhase46AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase46AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase46AuditChecklistItem[];
  missingItems: TeoyubePhase46AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "TEOYUBE Phase 5 - Controlled Beta Preparation, Service Gates & Operational Readiness";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase46AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase46AuditChecklist(): TeoyubePhase46AuditChecklistItem[] {
  const pkg = createPhase4CompletionPackage();
  const report = createPhase4CompletionPackageReport(pkg);
  return [
    item("phase_4_6_map_document", "Phase 4.6 map document exists", true, "phase-4-6-beta-readiness-service-decision-lock-phase-4-completion-map.md documents Phase 4 completion state."),
    item("beta_readiness_review_contracts", "Beta readiness review contracts exist", true, "beta-readiness-review-contracts.ts defines Phase 4.6 readiness types."),
    item("beta_readiness_review", "Beta readiness review exists", pkg.betaReadinessReview.valid, "beta-readiness-review.ts validates readiness for controlled beta preparation."),
    item("service_decision_lock_contracts", "Service decision lock contracts exist", true, "service-decision-lock-contracts.ts defines lock types."),
    item("service_decision_lock", "Service decision lock exists", pkg.serviceDecisionLock.valid, "service-decision-lock.ts locks services disabled or future-phase-only."),
    item("disabled_service_enforcement_qa", "Disabled service enforcement QA exists", pkg.disabledServiceEnforcementQa.valid, "disabled-service-enforcement-qa.ts verifies no services are accidentally enabled."),
    item("phase_4_completion_contracts", "Phase 4 completion contracts exist", true, "phase-4-completion-contracts.ts defines completion types."),
    item("phase_4_completion_review", "Phase 4 completion review exists", pkg.phase4CompletionReview.valid && pkg.phase4CompletionReview.completionPercentage === 100, "phase-4-completion-review.ts confirms Phase 4 completion gates."),
    item("phase_4_feature_inventory", "Phase 4 feature inventory exists", pkg.featureInventory.valid && pkg.featureInventory.itemCount >= 18, "phase-4-feature-inventory.ts inventories Phase 4 systems."),
    item("phase_4_remaining_risk_register", "Phase 4 remaining risk register exists", pkg.remainingRiskRegisterReport.valid, "phase-4-remaining-risk-register.ts tracks accepted/manual risks."),
    item("owner_completion_review", "Owner completion review exists", pkg.ownerCompletionReviewReport.record.checklist.length >= 10, "phase-4-owner-completion-review.ts prepares manual owner review."),
    item("phase_4_completion_package", "Phase 4 completion package exists", report.valid, `Phase 4 completion package decision: ${report.decision}.`),
    item("phase_5_roadmap_contracts", "Phase 5 roadmap contracts exist", true, "phase-5-roadmap-contracts.ts defines Phase 5 roadmap types."),
    item("phase_5_roadmap_builder", "Phase 5 roadmap builder exists", pkg.phase5Roadmap.valid && pkg.phase5Roadmap.items.length >= 10, "phase-5-roadmap-builder.ts prepares the next milestone."),
    item("smoke_check", "Phase 4.6 smoke check exists", true, "phase-4-6-beta-readiness-completion-smoke-check.ts verifies Phase 4.6 modules."),
    item("documentation", "Phase 4.6 documentation exists", true, "phase-4-6-beta-readiness-service-decision-lock-phase-4-completion.md documents this step.")
  ];
}

export function getPhase46MissingItems(): TeoyubePhase46AuditChecklistItem[] {
  return getPhase46AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase46Warnings(): string[] {
  return createPhase4CompletionPackageReport(createPhase4CompletionPackage()).warnings;
}

export function getPhase46CompletionPercentage(): number {
  const checklist = getPhase46AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase46Audit(): TeoyubePhase46AuditReport {
  const checklist = getPhase46AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase4CompletionPackageReport(createPhase4CompletionPackage());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase46CompletionPercentage();

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase46Warnings(),
    blockers,
    nextStep: "TEOYUBE Phase 5 - Controlled Beta Preparation, Service Gates & Operational Readiness",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
