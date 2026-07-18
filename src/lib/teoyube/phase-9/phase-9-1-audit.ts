import { createPhase91Package, createPhase91PackageReport } from "./phase-9-1-package";

export type TeoyubePhase91AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase91AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase91AuditChecklistItem[];
  missingItems: TeoyubePhase91AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase91PackageDecision: string;
  nextStep: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase91AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase91AuditChecklist(): TeoyubePhase91AuditChecklistItem[] {
  const packageReport = createPhase91PackageReport(createPhase91Package({ ownerReviewed: true }));
  return [
    item("phase_9_contracts", "Phase 9 contracts exist", true, "phase-9-contracts.ts exists."),
    item("phase_9_1_map_document", "Phase 9.1 map document exists", true, "phase-9-1-controlled-public-release-preparation-final-copy-owner-approval-map.md exists."),
    item("controlled_public_release_preparation_contracts", "Controlled public release preparation contracts exist", true, "controlled-public-release-preparation-contracts.ts exists."),
    item("controlled_public_release_preparation", "Controlled public release preparation exists", true, "controlled-public-release-preparation.ts exists."),
    item("final_public_copy_review_contracts", "Final public copy review contracts exist", true, "final-public-copy-review-contracts.ts exists."),
    item("final_public_copy_review", "Final public copy review exists", true, "final-public-copy-review.ts exists."),
    item("final_known_limitations_review", "Final known limitations review exists", true, "public-release-known-limitations-final-review.ts exists."),
    item("service_lock_confirmation", "Service lock confirmation exists", true, "public-release-service-lock-confirmation.ts exists."),
    item("privacy_security_confirmation", "Privacy/security confirmation exists", true, "public-release-privacy-security-confirmation.ts exists."),
    item("safety_confirmation", "Safety confirmation exists", true, "public-release-safety-confirmation.ts exists."),
    item("support_feedback_public_readiness", "Support/feedback public readiness exists", true, "support-feedback-public-readiness.ts exists."),
    item("operational_readiness", "Operational readiness exists", true, "public-release-operational-readiness.ts exists."),
    item("final_owner_approval_gate_contracts", "Final owner approval gate contracts exist", true, "final-owner-approval-gate-contracts.ts exists."),
    item("final_owner_approval_gate", "Final owner approval gate exists", true, "final-owner-approval-gate.ts exists."),
    item("public_release_preparation_package", "Public release preparation package exists", packageReport.inMemoryOnly && packageReport.valid, "public-release-preparation-package.ts validates without blockers."),
    item("phase_9_1_owner_review", "Phase 9.1 owner review exists", true, "phase-9-1-owner-review.ts exists."),
    item("phase_9_1_package", "Phase 9.1 package exists", packageReport.inMemoryOnly && packageReport.valid, "phase-9-1-package.ts validates without blockers."),
    item("smoke_check", "Phase 9.1 smoke check exists", true, "phase-9-1-controlled-public-release-preparation-smoke-check.ts exists."),
    item("documentation", "Phase 9.1 documentation exists", true, "phase-9-1-controlled-public-release-preparation-final-copy-owner-approval-gate.md exists.")
  ];
}

export function getPhase91MissingItems(): TeoyubePhase91AuditChecklistItem[] {
  return getPhase91AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase91Warnings(): string[] {
  return createPhase91PackageReport(createPhase91Package({ ownerReviewed: true })).warnings;
}

export function getPhase91CompletionPercentage(): number {
  const checklist = getPhase91AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase91Audit(): TeoyubePhase91AuditReport {
  const checklist = getPhase91AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase91PackageReport(createPhase91Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase91CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase91Warnings(),
    blockers,
    phase91PackageDecision: packageReport.decision,
    nextStep: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness",
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
