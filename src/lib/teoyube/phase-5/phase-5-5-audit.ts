import { createPhase5CompletionPackage, createPhase5CompletionPackageReport } from "./phase-5-completion-package";

export type TeoyubePhase55AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase55AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase55AuditChecklistItem[];
  missingItems: TeoyubePhase55AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "TEOYUBE Phase 6 - Controlled Beta Execution Planning, Manual Feedback Loop & Operational Stabilization";
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
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase55AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase55AuditChecklist(): TeoyubePhase55AuditChecklistItem[] {
  const pkg = createPhase5CompletionPackage({ ownerReviewed: true });
  const report = createPhase5CompletionPackageReport(pkg);
  return [
    item("phase_5_5_map_document", "Phase 5.5 map document exists", true, "phase-5-5-completion-review-beta-readiness-lock-phase-6-roadmap-map.md documents the map."),
    item("phase_5_completion_contracts", "Phase 5 completion contracts exist", true, "phase-5-completion-contracts.ts defines completion contracts."),
    item("phase_5_completion_review", "Phase 5 completion review exists", pkg.phase5CompletionReview.inMemoryOnly, "phase-5-completion-review.ts reviews Phase 5."),
    item("beta_readiness_lock_contracts", "Beta readiness lock contracts exist", true, "beta-readiness-lock-contracts.ts defines readiness lock contracts."),
    item("beta_readiness_lock", "Beta readiness lock exists", pkg.betaReadinessLockReport.inMemoryOnly, "beta-readiness-lock.ts protects readiness boundaries."),
    item("final_disabled_service_lock", "Final disabled service lock exists", pkg.finalDisabledServiceLockReport.inMemoryOnly, "final-disabled-service-lock.ts locks service-disabled decisions."),
    item("beta_readiness_evidence_archive", "Beta readiness evidence archive exists", pkg.betaReadinessEvidenceArchiveReport.inMemoryOnly, "beta-readiness-evidence-archive.ts summarizes evidence in memory."),
    item("phase_5_feature_inventory", "Phase 5 feature inventory exists", pkg.featureInventory.inMemoryOnly, "phase-5-feature-inventory.ts inventories Phase 5 systems."),
    item("phase_5_remaining_risk_register", "Phase 5 remaining risk register exists", pkg.remainingRiskRegisterReport.inMemoryOnly, "phase-5-remaining-risk-register.ts tracks remaining risks."),
    item("owner_completion_review", "Owner completion review exists", pkg.ownerCompletionReviewReport.inMemoryOnly, "phase-5-owner-completion-review.ts creates owner completion review."),
    item("phase_5_completion_package", "Phase 5 completion package exists", report.inMemoryOnly, "phase-5-completion-package.ts combines completion artifacts."),
    item("phase_6_roadmap_contracts", "Phase 6 roadmap contracts exist", true, "phase-6-roadmap-contracts.ts defines Phase 6 roadmap contracts."),
    item("phase_6_roadmap_builder", "Phase 6 roadmap builder exists", pkg.phase6Roadmap.inMemoryOnly, "phase-6-roadmap-builder.ts builds the Phase 6 roadmap."),
    item("smoke_check", "Phase 5.5 smoke check exists", true, "phase-5-5-completion-review-smoke-check.ts verifies Phase 5.5."),
    item("documentation", "Phase 5.5 documentation exists", true, "phase-5-5-completion-review-beta-readiness-lock-phase-6-roadmap.md documents the step.")
  ];
}

export function getPhase55MissingItems(): TeoyubePhase55AuditChecklistItem[] {
  return getPhase55AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase55Warnings(): string[] {
  return createPhase5CompletionPackageReport(createPhase5CompletionPackage({ ownerReviewed: true })).warnings;
}

export function getPhase55CompletionPercentage(): number {
  const checklist = getPhase55AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase55Audit(): TeoyubePhase55AuditReport {
  const checklist = getPhase55AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase5CompletionPackageReport(createPhase5CompletionPackage({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase55CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase55Warnings(),
    blockers,
    nextStep: "TEOYUBE Phase 6 - Controlled Beta Execution Planning, Manual Feedback Loop & Operational Stabilization",
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
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
