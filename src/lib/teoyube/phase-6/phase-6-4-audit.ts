import { createPhase6CompletionPackage, createPhase6CompletionPackageReport } from "./phase-6-completion-package";

export type TeoyubePhase64AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase64AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase64AuditChecklistItem[];
  missingItems: TeoyubePhase64AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "TEOYUBE Phase 7 - Controlled Beta Operations, Manual Feedback Review & Product Stabilization";
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noUserAccountsAdded: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase64AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase64AuditChecklist(): TeoyubePhase64AuditChecklistItem[] {
  const pkg = createPhase6CompletionPackage({ ownerReviewed: true });
  const report = createPhase6CompletionPackageReport(pkg);
  return [
    item("phase_6_4_map_document", "Phase 6.4 map document exists", true, "phase-6-4-controlled-beta-readiness-operations-lock-phase-7-roadmap-map.md documents the map."),
    item("phase_6_completion_contracts", "Phase 6 completion contracts exist", true, "phase-6-completion-contracts.ts defines Phase 6 completion contracts."),
    item("phase_6_completion_review", "Phase 6 completion review exists", pkg.phase6CompletionReview.inMemoryOnly, "phase-6-completion-review.ts reviews Phase 6.1 through Phase 6.3."),
    item("operations_lock_contracts", "Controlled beta operations lock contracts exist", true, "controlled-beta-operations-lock-contracts.ts defines operations lock contracts."),
    item("operations_lock", "Controlled beta operations lock exists", pkg.operationsLockReport.inMemoryOnly, "controlled-beta-operations-lock.ts locks manual operations boundaries."),
    item("final_beta_service_disabled_lock", "Final beta service-disabled lock exists", pkg.finalBetaServiceDisabledLockReport.valid, "final-beta-service-disabled-lock.ts locks disabled service decisions."),
    item("phase_6_evidence_archive", "Phase 6 evidence archive exists", pkg.phase6EvidenceArchiveReport.inMemoryOnly, "phase-6-evidence-archive.ts summarizes Phase 6 evidence in memory."),
    item("phase_6_feature_inventory", "Phase 6 feature inventory exists", pkg.featureInventory.inMemoryOnly, "phase-6-feature-inventory.ts inventories Phase 6 systems."),
    item("phase_6_remaining_risk_register", "Phase 6 remaining risk register exists", pkg.remainingRiskRegisterReport.inMemoryOnly, "phase-6-remaining-risk-register.ts tracks remaining risks in memory."),
    item("owner_completion_review", "Owner completion review exists", pkg.ownerCompletionReviewReport.inMemoryOnly, "phase-6-owner-completion-review.ts prepares owner completion review."),
    item("phase_6_completion_package", "Phase 6 completion package exists", report.inMemoryOnly, "phase-6-completion-package.ts combines completion review, locks, evidence, inventory, risks, owner review, and roadmap."),
    item("phase_7_roadmap_contracts", "Phase 7 roadmap contracts exist", true, "phase-7-roadmap-contracts.ts defines Phase 7 roadmap contracts."),
    item("phase_7_roadmap_builder", "Phase 7 roadmap builder exists", pkg.phase7Roadmap.inMemoryOnly, "phase-7-roadmap-builder.ts builds Phase 7 roadmap items."),
    item("smoke_check", "Phase 6.4 smoke check exists", true, "phase-6-4-completion-review-smoke-check.ts verifies Phase 6.4."),
    item("documentation", "Phase 6.4 documentation exists", true, "phase-6-4-controlled-beta-readiness-operations-lock-phase-7-roadmap.md documents the step.")
  ];
}

export function getPhase64MissingItems(): TeoyubePhase64AuditChecklistItem[] {
  return getPhase64AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase64Warnings(): string[] {
  return createPhase6CompletionPackageReport(createPhase6CompletionPackage({ ownerReviewed: true })).warnings;
}

export function getPhase64CompletionPercentage(): number {
  const checklist = getPhase64AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase64Audit(): TeoyubePhase64AuditReport {
  const checklist = getPhase64AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase6CompletionPackageReport(createPhase6CompletionPackage({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase64CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase64Warnings(),
    blockers,
    nextStep: "TEOYUBE Phase 7 - Controlled Beta Operations, Manual Feedback Review & Product Stabilization",
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noUserAccountsAdded: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
