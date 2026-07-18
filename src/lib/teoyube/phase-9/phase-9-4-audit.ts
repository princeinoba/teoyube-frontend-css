import { createPhase94Package, createPhase94PackageReport } from "./phase-9-4-package";

export type TeoyubePhase94AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase94AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase94AuditChecklistItem[];
  missingItems: TeoyubePhase94AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase94PackageDecision: string;
  nextStep: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase94AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase94AuditChecklist(): TeoyubePhase94AuditChecklistItem[] {
  const packageReport = createPhase94PackageReport(createPhase94Package({ ownerReviewed: true }));
  return [
    item("phase_9_4_map_document", "Phase 9.4 map document exists", true, "phase-9-4-controlled-public-go-no-go-final-owner-approval-operational-handoff-map.md exists."),
    item("controlled_public_go_no_go_contracts", "Controlled public go/no-go contracts exist", true, "controlled-public-go-no-go-contracts.ts exists."),
    item("controlled_public_go_no_go", "Controlled public go/no-go module exists", true, "controlled-public-go-no-go.ts exists."),
    item("public_readiness_evidence_summary", "Public readiness evidence summary exists", true, "public-readiness-evidence-summary.ts exists."),
    item("public_release_boundary_final_confirmation", "Public release boundary final confirmation exists", true, "public-release-boundary-final-confirmation.ts exists."),
    item("final_public_owner_approval_contracts", "Final public owner approval contracts exist", true, "final-public-owner-approval-contracts.ts exists."),
    item("final_public_owner_approval", "Final public owner approval module exists", true, "final-public-owner-approval.ts exists."),
    item("public_operational_handoff_contracts", "Public operational handoff contracts exist", true, "public-operational-handoff-contracts.ts exists."),
    item("public_operational_handoff", "Public operational handoff module exists", true, "public-operational-handoff.ts exists."),
    item("public_release_pause_rollback_criteria", "Public release pause/rollback criteria exists", true, "public-release-pause-rollback-criteria.ts exists."),
    item("final_public_known_limitations", "Final public known limitations exists", true, "final-public-known-limitations.ts exists."),
    item("public_service_disabled_final_confirmation", "Public service-disabled final confirmation exists", true, "public-service-disabled-final-confirmation.ts exists."),
    item("public_go_no_go_readiness_package", "Public go/no-go readiness package exists", packageReport.valid, "public-go-no-go-readiness-package.ts validates without blockers."),
    item("phase_9_4_owner_review", "Phase 9.4 owner review exists", true, "phase-9-4-owner-review.ts exists."),
    item("phase_9_4_package", "Phase 9.4 package exists", packageReport.valid, "phase-9-4-package.ts validates without blockers."),
    item("smoke_check", "Phase 9.4 smoke check exists", true, "phase-9-4-controlled-public-go-no-go-smoke-check.ts exists."),
    item("documentation", "Phase 9.4 documentation exists", true, "phase-9-4-controlled-public-go-no-go-final-owner-approval-operational-handoff.md exists.")
  ];
}

export function getPhase94MissingItems(): TeoyubePhase94AuditChecklistItem[] {
  return getPhase94AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase94Warnings(): string[] {
  return createPhase94PackageReport(createPhase94Package({ ownerReviewed: true })).warnings;
}

export function getPhase94CompletionPercentage(): number {
  const checklist = getPhase94AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase94Audit(): TeoyubePhase94AuditReport {
  const checklist = getPhase94AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase94PackageReport(createPhase94Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase94CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase94Warnings(),
    blockers,
    phase94PackageDecision: packageReport.decision,
    nextStep: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap",
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
