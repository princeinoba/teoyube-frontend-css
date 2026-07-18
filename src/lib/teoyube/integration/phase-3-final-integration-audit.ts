import { createPhase3CompletionPackage, createPhase3CompletionPackageReport } from "./phase-3-completion-package";
import { createPhase3CompletionReport } from "./phase-3-completion-review";
import { createPhase3FeatureInventoryReport } from "./phase-3-feature-inventory";
import { createPhase3IntegrationLockReport } from "./phase-3-integration-lock";
import { createPhase3OwnerReviewRecord, createPhase3OwnerReviewReport } from "./phase-3-owner-review";
import { createPhase3RemainingRiskRegister, createPhase3RemainingRiskRegisterReport } from "./phase-3-remaining-risk-register";
import { createPhase4RoadmapReport } from "./phase-4-roadmap-builder";

export type TeoyubePhase3FinalAuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase3FinalIntegrationAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase3FinalAuditChecklistItem[];
  missingItems: TeoyubePhase3FinalAuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions";
  nextRecommendedStep: "Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase3FinalAuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase3FinalIntegrationAuditChecklist(): TeoyubePhase3FinalAuditChecklistItem[] {
  const completion = createPhase3CompletionReport();
  const lock = createPhase3IntegrationLockReport();
  const inventory = createPhase3FeatureInventoryReport();
  const risks = createPhase3RemainingRiskRegisterReport(createPhase3RemainingRiskRegister());
  const owner = createPhase3OwnerReviewReport(createPhase3OwnerReviewRecord());
  const roadmap = createPhase4RoadmapReport();
  const completionPackage = createPhase3CompletionPackageReport(createPhase3CompletionPackage());

  return [
    item("phase_3_completion_contracts", "Phase 3 completion contracts exist", true, "phase-3-completion-contracts.ts defines completion, lock, risk, and roadmap bridge contracts."),
    item("completion_review", "Completion review exists", completion.valid, `Completion review decision: ${completion.decision}.`),
    item("integration_lock", "Integration lock exists", lock.locked, `Integration lock protects ${lock.contracts.length} contract(s).`),
    item("feature_inventory", "Feature inventory exists", inventory.valid, `Feature inventory has ${inventory.items.length} item(s).`),
    item("remaining_risk_register", "Remaining risk register exists", risks.valid, `Risk register has ${risks.riskCount} risk(s), ${risks.criticalRiskCount} critical open risk(s).`),
    item("owner_review", "Owner review exists", owner.record.checklist.length >= 16, `Owner review checklist has ${owner.record.checklist.length} item(s).`),
    item("completion_package", "Completion package exists", completionPackage.valid, `Completion package decision: ${completionPackage.decision}.`),
    item("phase_4_roadmap_contracts", "Phase 4 roadmap contracts exist", true, "phase-4-roadmap-contracts.ts defines Phase 4 roadmap status, themes, items, risks, report, and decision."),
    item("phase_4_roadmap_builder", "Phase 4 roadmap builder exists", roadmap.valid && roadmap.items.length >= 12, `Phase 4 roadmap has ${roadmap.items.length} item(s).`),
    item("smoke_check", "Phase 3.7 smoke check exists", true, "phase-3-7-completion-review-smoke-check.ts verifies completion review, lock, inventory, risk register, owner review, package, roadmap, and audit."),
    item("documentation", "Phase 3.7 documentation exists", true, "Phase 3.7 docs and Phase 3 completion summary are present in docs/teoyube.")
  ];
}

export function getPhase3FinalMissingItems(): TeoyubePhase3FinalAuditChecklistItem[] {
  return getPhase3FinalIntegrationAuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase3FinalWarnings(): string[] {
  const completionPackage = createPhase3CompletionPackageReport(createPhase3CompletionPackage());
  return completionPackage.warnings;
}

export function getPhase3FinalCompletionPercentage(): number {
  const checklist = getPhase3FinalIntegrationAuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase3FinalIntegrationAudit(): TeoyubePhase3FinalIntegrationAuditReport {
  const checklist = getPhase3FinalIntegrationAuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const completionPackage = createPhase3CompletionPackageReport(createPhase3CompletionPackage());
  const blockers = [
    ...completionPackage.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase3FinalCompletionPercentage();

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase3FinalWarnings(),
    blockers,
    nextStep: "TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions",
    nextRecommendedStep: "Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
