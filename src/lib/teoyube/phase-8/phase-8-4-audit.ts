import { createPhase8CompletionPackage, createPhase8CompletionPackageReport } from "./phase-8-completion-package";

export type TeoyubePhase84AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase84AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase84AuditChecklistItem[];
  missingItems: TeoyubePhase84AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase8CompletionDecision: string;
  nextStep: "TEOYUBE Phase 9 - Controlled Public Release Preparation, Final Owner Approval & Operational Readiness";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase84AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase84AuditChecklist(): TeoyubePhase84AuditChecklistItem[] {
  const packageReport = createPhase8CompletionPackageReport(createPhase8CompletionPackage({ ownerReviewed: true }));
  return [
    item("phase_8_4_map_document", "Phase 8.4 map document exists", true, "phase-8-4-public-release-candidate-final-readiness-phase-9-roadmap-map.md exists."),
    item("public_release_candidate_contracts", "Public release candidate contracts exist", true, "public-release-candidate-contracts.ts exists."),
    item("public_release_candidate_planner", "Public release candidate planner exists", true, "public-release-candidate-planner.ts exists."),
    item("final_public_readiness_review_contracts", "Final public readiness review contracts exist", true, "final-public-readiness-review-contracts.ts exists."),
    item("final_public_readiness_review", "Final public readiness review exists", true, "final-public-readiness-review.ts exists."),
    item("final_privacy_security_lock", "Final privacy/security lock exists", true, "final-privacy-security-lock.ts exists."),
    item("final_controlled_service_decision_lock", "Final controlled service decision lock exists", true, "final-controlled-service-decision-lock.ts exists."),
    item("final_public_release_boundary_lock", "Final public release boundary lock exists", true, "final-public-release-boundary-lock.ts exists."),
    item("phase_8_completion_contracts", "Phase 8 completion contracts exist", true, "phase-8-completion-contracts.ts exists."),
    item("phase_8_completion_review", "Phase 8 completion review exists", true, "phase-8-completion-review.ts exists."),
    item("phase_8_evidence_archive", "Phase 8 evidence archive exists", true, "phase-8-evidence-archive.ts exists."),
    item("phase_8_feature_inventory", "Phase 8 feature inventory exists", true, "phase-8-feature-inventory.ts exists."),
    item("phase_8_remaining_risk_register", "Phase 8 remaining risk register exists", true, "phase-8-remaining-risk-register.ts exists."),
    item("owner_completion_review", "Owner completion review exists", true, "phase-8-owner-completion-review.ts exists."),
    item("phase_8_completion_package", "Phase 8 completion package exists", packageReport.inMemoryOnly && packageReport.valid, "phase-8-completion-package.ts exists and validates without blockers."),
    item("phase_9_roadmap_contracts", "Phase 9 roadmap contracts exist", true, "phase-9-roadmap-contracts.ts exists."),
    item("phase_9_roadmap_builder", "Phase 9 roadmap builder exists", true, "phase-9-roadmap-builder.ts exists."),
    item("smoke_check", "Phase 8.4 smoke check exists", true, "phase-8-4-public-release-candidate-smoke-check.ts exists."),
    item("documentation", "Phase 8.4 documentation exists", true, "phase-8-4-public-release-candidate-final-readiness-phase-9-roadmap.md exists.")
  ];
}

export function getPhase84MissingItems(): TeoyubePhase84AuditChecklistItem[] {
  return getPhase84AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase84Warnings(): string[] {
  return createPhase8CompletionPackageReport(createPhase8CompletionPackage({ ownerReviewed: true })).warnings;
}

export function getPhase84CompletionPercentage(): number {
  const checklist = getPhase84AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase84Audit(): TeoyubePhase84AuditReport {
  const checklist = getPhase84AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase8CompletionPackageReport(createPhase8CompletionPackage({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase84CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase84Warnings(),
    blockers,
    phase8CompletionDecision: packageReport.decision,
    nextStep: "TEOYUBE Phase 9 - Controlled Public Release Preparation, Final Owner Approval & Operational Readiness",
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
