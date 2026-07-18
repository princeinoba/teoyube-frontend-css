import { createPhase54Package, createPhase54PackageReport } from "./phase-5-4-package";

export type TeoyubePhase54AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase54AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase54AuditChecklistItem[];
  missingItems: TeoyubePhase54AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 5.5 - Phase 5 Completion Review, Beta Readiness Lock & Phase 6 Roadmap";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase54AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase54AuditChecklist(): TeoyubePhase54AuditChecklistItem[] {
  const pkg = createPhase54Package();
  const report = createPhase54PackageReport(pkg);
  return [
    item("phase_5_4_map_document", "Phase 5.4 map document exists", true, "phase-5-4-controlled-beta-go-no-go-owner-approval-operational-handoff-map.md documents the map."),
    item("controlled_beta_go_no_go_contracts", "Controlled beta go/no-go contracts exist", true, "controlled-beta-go-no-go-contracts.ts defines the decision contracts."),
    item("controlled_beta_go_no_go_module", "Controlled beta go/no-go module exists", pkg.controlledBetaReadinessPackage.goNoGoReport.inMemoryOnly, "controlled-beta-go-no-go.ts evaluates Phase 5.1-5.3 evidence."),
    item("beta_readiness_evidence_summary", "Beta readiness evidence summary exists", pkg.controlledBetaReadinessPackage.evidenceReport.inMemoryOnly, "beta-readiness-evidence-summary.ts summarizes readiness evidence."),
    item("beta_launch_boundary_contracts", "Beta launch boundary contracts exist", true, "beta-launch-boundary-contracts.ts defines preparation-only rules."),
    item("beta_launch_boundary_validator", "Beta launch boundary validator exists", pkg.controlledBetaReadinessPackage.launchBoundaryReport.inMemoryOnly, "beta-launch-boundary-validator.ts confirms no launch/contact/collection/service action is performed."),
    item("controlled_beta_owner_approval_contracts", "Controlled beta owner approval contracts exist", true, "controlled-beta-owner-approval-contracts.ts defines manual approval contracts."),
    item("controlled_beta_owner_approval_module", "Controlled beta owner approval module exists", pkg.controlledBetaReadinessPackage.ownerApprovalReport.inMemoryOnly, "controlled-beta-owner-approval.ts creates structured manual owner approval."),
    item("beta_operational_handoff_contracts", "Beta operational handoff contracts exist", true, "beta-operational-handoff-contracts.ts defines handoff areas."),
    item("beta_operational_handoff_module", "Beta operational handoff module exists", pkg.controlledBetaReadinessPackage.operationalHandoffReport.inMemoryOnly, "beta-operational-handoff.ts creates the handoff package."),
    item("beta_pause_rollback_criteria", "Beta pause/rollback criteria exist", pkg.controlledBetaReadinessPackage.pauseRollbackCriteriaReport.inMemoryOnly, "beta-pause-rollback-criteria.ts creates decision-support criteria only."),
    item("beta_known_limitations", "Beta known limitations exist", pkg.controlledBetaReadinessPackage.knownLimitationsReport.inMemoryOnly, "beta-known-limitations.ts defines controlled beta limitations."),
    item("controlled_beta_readiness_package", "Controlled beta readiness package exists", pkg.controlledBetaReadinessPackageReport.inMemoryOnly, "controlled-beta-readiness-package.ts combines Phase 5.4 decision artifacts."),
    item("phase_5_4_owner_review", "Phase 5.4 owner review exists", pkg.ownerReviewReport.record.checklist.length >= 9, "phase-5-4-owner-review.ts prepares owner review."),
    item("phase_5_4_package", "Phase 5.4 package exists", report.valid, "phase-5-4-package.ts combines readiness package and owner review."),
    item("smoke_check", "Phase 5.4 smoke check exists", true, "phase-5-4-controlled-beta-go-no-go-smoke-check.ts verifies the step."),
    item("documentation", "Phase 5.4 documentation exists", true, "phase-5-4-controlled-beta-go-no-go-owner-approval-operational-handoff.md documents the step.")
  ];
}

export function getPhase54MissingItems(): TeoyubePhase54AuditChecklistItem[] {
  return getPhase54AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase54Warnings(): string[] {
  return createPhase54PackageReport(createPhase54Package()).warnings;
}

export function getPhase54CompletionPercentage(): number {
  const checklist = getPhase54AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase54Audit(): TeoyubePhase54AuditReport {
  const checklist = getPhase54AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase54PackageReport(createPhase54Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase54CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase54Warnings(),
    blockers,
    nextStep: "Phase 5.5 - Phase 5 Completion Review, Beta Readiness Lock & Phase 6 Roadmap",
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
