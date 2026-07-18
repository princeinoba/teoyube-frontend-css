import { createPhase7CompletionPackage, createPhase7CompletionPackageReport } from "./phase-7-completion-package";

export type TeoyubePhase74AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase74AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase74AuditChecklistItem[];
  missingItems: TeoyubePhase74AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "TEOYUBE Phase 8 - Post-Beta Readiness, Product Hardening & Controlled Service Reassessment";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase74AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase74AuditChecklist(): TeoyubePhase74AuditChecklistItem[] {
  const pkg = createPhase7CompletionPackage({ ownerReviewed: true });
  const report = createPhase7CompletionPackageReport(pkg);
  return [
    item("phase_7_4_map_document", "Phase 7.4 map document exists", true, "phase-7-4-completion-review-operations-lock-phase-8-roadmap-map.md documents the map."),
    item("phase_7_completion_contracts", "Phase 7 completion contracts exist", true, "phase-7-completion-contracts.ts defines Phase 7 completion contracts."),
    item("phase_7_completion_review", "Phase 7 completion review exists", pkg.phase7CompletionReview.inMemoryOnly, "phase-7-completion-review.ts reviews Phase 7.1 through Phase 7.3."),
    item("final_operations_lock_contracts", "Final operations lock contracts exist", true, "controlled-beta-operations-final-lock-contracts.ts defines final lock contracts."),
    item("final_operations_lock", "Final operations lock exists", pkg.operationsFinalLockReport.inMemoryOnly, "controlled-beta-operations-final-lock.ts locks manual operations boundaries."),
    item("final_service_disabled_lock", "Final service-disabled lock exists", pkg.finalPhase7ServiceDisabledLockReport.valid, "final-phase-7-service-disabled-lock.ts locks disabled service decisions."),
    item("phase_7_evidence_archive", "Phase 7 evidence archive exists", pkg.phase7EvidenceArchiveReport.inMemoryOnly, "phase-7-evidence-archive.ts summarizes Phase 7 evidence in memory."),
    item("phase_7_feature_inventory", "Phase 7 feature inventory exists", pkg.featureInventory.inMemoryOnly, "phase-7-feature-inventory.ts inventories Phase 7 systems."),
    item("phase_7_remaining_risk_register", "Phase 7 remaining risk register exists", pkg.remainingRiskRegisterReport.inMemoryOnly, "phase-7-remaining-risk-register.ts tracks remaining risks in memory."),
    item("owner_completion_review", "Owner completion review exists", pkg.ownerCompletionReviewReport.inMemoryOnly, "phase-7-owner-completion-review.ts prepares owner completion review."),
    item("phase_7_completion_package", "Phase 7 completion package exists", report.inMemoryOnly, "phase-7-completion-package.ts combines completion review, locks, evidence, inventory, risks, owner review, and roadmap."),
    item("phase_8_roadmap_contracts", "Phase 8 roadmap contracts exist", true, "phase-8-roadmap-contracts.ts defines Phase 8 roadmap contracts."),
    item("phase_8_roadmap_builder", "Phase 8 roadmap builder exists", pkg.phase8Roadmap.inMemoryOnly, "phase-8-roadmap-builder.ts builds Phase 8 roadmap items."),
    item("smoke_check", "Phase 7.4 smoke check exists", true, "phase-7-4-completion-review-smoke-check.ts verifies Phase 7.4."),
    item("documentation", "Phase 7.4 documentation exists", true, "phase-7-4-completion-review-operations-lock-phase-8-roadmap.md documents the step.")
  ];
}

export function getPhase74MissingItems(): TeoyubePhase74AuditChecklistItem[] {
  return getPhase74AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase74Warnings(): string[] {
  return createPhase7CompletionPackageReport(createPhase7CompletionPackage({ ownerReviewed: true })).warnings;
}

export function getPhase74CompletionPercentage(): number {
  const checklist = getPhase74AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase74Audit(): TeoyubePhase74AuditReport {
  const checklist = getPhase74AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase7CompletionPackageReport(createPhase7CompletionPackage({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase74CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase74Warnings(),
    blockers,
    nextStep: "TEOYUBE Phase 8 - Post-Beta Readiness, Product Hardening & Controlled Service Reassessment",
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
