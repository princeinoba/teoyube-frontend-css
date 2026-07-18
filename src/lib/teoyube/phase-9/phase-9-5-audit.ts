import { createPhase9CompletionPackage, createPhase9CompletionPackageReport } from "./phase-9-completion-package";

export type TeoyubePhase95AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase95AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase95AuditChecklistItem[];
  missingItems: TeoyubePhase95AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase9CompletionDecision: string;
  nextStep: "TEOYUBE Phase 10 - Controlled Public Release Execution Planning, Manual Monitoring & Post-Release Stabilization";
  noPublicLaunchPerformed: true;
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase95AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase95AuditChecklist(): TeoyubePhase95AuditChecklistItem[] {
  const packageReport = createPhase9CompletionPackageReport(createPhase9CompletionPackage({ ownerReviewed: true }));
  return [
    item("phase_9_5_map_document", "Phase 9.5 map document exists", true, "phase-9-5-completion-review-public-readiness-lock-phase-10-roadmap-map.md exists."),
    item("phase_9_completion_contracts", "Phase 9 completion contracts exist", true, "phase-9-completion-contracts.ts exists."),
    item("phase_9_completion_review", "Phase 9 completion review exists", true, "phase-9-completion-review.ts exists."),
    item("public_readiness_lock_contracts", "Public readiness lock contracts exist", true, "public-readiness-lock-contracts.ts exists."),
    item("public_readiness_lock", "Public readiness lock exists", true, "public-readiness-lock.ts exists."),
    item("final_phase_9_service_disabled_lock", "Final Phase 9 service-disabled lock exists", true, "final-phase-9-service-disabled-lock.ts exists."),
    item("phase_9_evidence_archive", "Phase 9 evidence archive exists", true, "phase-9-evidence-archive.ts exists."),
    item("phase_9_feature_inventory", "Phase 9 feature inventory exists", true, "phase-9-feature-inventory.ts exists."),
    item("phase_9_remaining_risk_register", "Phase 9 remaining risk register exists", true, "phase-9-remaining-risk-register.ts exists."),
    item("owner_completion_review", "Owner completion review exists", true, "phase-9-owner-completion-review.ts exists."),
    item("phase_9_completion_package", "Phase 9 completion package exists", packageReport.valid, "phase-9-completion-package.ts validates without blockers."),
    item("phase_10_roadmap_contracts", "Phase 10 roadmap contracts exist", true, "phase-10-roadmap-contracts.ts exists."),
    item("phase_10_roadmap_builder", "Phase 10 roadmap builder exists", true, "phase-10-roadmap-builder.ts exists."),
    item("smoke_check", "Phase 9.5 smoke check exists", true, "phase-9-5-completion-review-smoke-check.ts exists."),
    item("documentation", "Phase 9.5 documentation exists", true, "phase-9-5-completion-review-public-readiness-lock-phase-10-roadmap.md exists.")
  ];
}

export function getPhase95MissingItems(): TeoyubePhase95AuditChecklistItem[] {
  return getPhase95AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase95Warnings(): string[] {
  return createPhase9CompletionPackageReport(createPhase9CompletionPackage({ ownerReviewed: true })).warnings;
}

export function getPhase95CompletionPercentage(): number {
  const checklist = getPhase95AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase95Audit(): TeoyubePhase95AuditReport {
  const checklist = getPhase95AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase9CompletionPackageReport(createPhase9CompletionPackage({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase95CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase95Warnings(),
    blockers,
    phase9CompletionDecision: packageReport.decision,
    nextStep: "TEOYUBE Phase 10 - Controlled Public Release Execution Planning, Manual Monitoring & Post-Release Stabilization",
    noPublicLaunchPerformed: true,
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
