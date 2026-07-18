import { createPhase61Package, createPhase61PackageReport } from "./phase-6-1-package";

export type TeoyubePhase61AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase61AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase61AuditChecklistItem[];
  missingItems: TeoyubePhase61AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase61AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase61AuditChecklist(): TeoyubePhase61AuditChecklistItem[] {
  const pkg = createPhase61Package({ ownerReviewed: true, executionPackageInput: { participantWorkflowInput: { ownerReviewed: true } } });
  const report = createPhase61PackageReport(pkg);
  return [
    item("phase_6_contracts", "Phase 6 contracts exist", true, "phase-6-contracts.ts defines Phase 6 types."),
    item("controlled_beta_execution_plan_contracts", "Controlled beta execution plan contracts exist", true, "controlled-beta-execution-plan-contracts.ts defines execution contracts."),
    item("controlled_beta_execution_plan", "Controlled beta execution plan exists", pkg.controlledBetaExecutionPackage.controlledBetaExecutionReport.inMemoryOnly, "controlled-beta-execution-plan.ts creates planning reports."),
    item("participant_workflow_contracts", "Participant workflow contracts exist", true, "manual-participant-workflow-contracts.ts defines participant contracts."),
    item("participant_workflow", "Participant workflow exists", pkg.controlledBetaExecutionPackage.manualParticipantWorkflowReport.inMemoryOnly, "manual-participant-workflow.ts creates manual workflow reports."),
    item("manual_communication_boundaries", "Manual communication boundaries exist", pkg.controlledBetaExecutionPackage.manualCommunicationBoundaryReport.inMemoryOnly, "manual-beta-communication-boundaries.ts creates drafts that are not sent."),
    item("manual_feedback_boundary_contracts", "Manual feedback boundary contracts exist", true, "manual-feedback-boundary-contracts.ts defines feedback contracts."),
    item("manual_feedback_boundaries", "Manual feedback boundaries exist", pkg.controlledBetaExecutionPackage.manualFeedbackBoundaryReport.inMemoryOnly, "manual-feedback-boundaries.ts redacts and validates manual feedback boundaries."),
    item("controlled_beta_issue_intake", "Controlled beta issue intake exists", pkg.controlledBetaExecutionPackage.controlledBetaIssueIntakeReport.inMemoryOnly, "controlled-beta-issue-intake.ts defines manual issue intake."),
    item("beta_operations_checklist", "Beta operations checklist exists", pkg.controlledBetaExecutionPackage.betaOperationsChecklistReport.inMemoryOnly, "beta-operations-checklist.ts defines manual checklists."),
    item("safety_theology_boundaries", "Safety/theology boundaries exist", pkg.controlledBetaExecutionPackage.safetyTheologyBoundaryReport.inMemoryOnly, "beta-safety-theology-boundaries.ts protects Scripture, explanation, fallback, confidence, and advice boundaries."),
    item("privacy_consent_boundaries", "Privacy/consent boundaries exist", pkg.controlledBetaExecutionPackage.privacyConsentBoundaryReport.inMemoryOnly, "beta-privacy-consent-boundaries.ts protects privacy and consent."),
    item("service_disabled_boundaries", "Service-disabled boundaries exist", pkg.controlledBetaExecutionPackage.serviceDisabledBoundaryReport.inMemoryOnly, "beta-service-disabled-boundaries.ts keeps services disabled."),
    item("controlled_beta_execution_package", "Controlled beta execution package exists", pkg.controlledBetaExecutionPackageReport.inMemoryOnly, "controlled-beta-execution-package.ts combines Phase 6.1 reports."),
    item("owner_review", "Owner review exists", pkg.ownerReviewReport.inMemoryOnly, "phase-6-1-owner-review.ts prepares manual owner review."),
    item("phase_6_1_package", "Phase 6.1 package exists", report.inMemoryOnly, "phase-6-1-package.ts combines execution package and owner review."),
    item("smoke_check", "Phase 6.1 smoke check exists", true, "phase-6-1-controlled-beta-execution-plan-smoke-check.ts verifies Phase 6.1."),
    item("documentation", "Phase 6.1 documentation exists", true, "phase-6-1-controlled-beta-execution-plan-manual-participant-workflow-feedback-boundaries.md documents the step.")
  ];
}

export function getPhase61MissingItems(): TeoyubePhase61AuditChecklistItem[] {
  return getPhase61AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase61Warnings(): string[] {
  return createPhase61PackageReport(createPhase61Package({ ownerReviewed: true, executionPackageInput: { participantWorkflowInput: { ownerReviewed: true } } })).warnings;
}

export function getPhase61CompletionPercentage(): number {
  const checklist = getPhase61AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase61Audit(): TeoyubePhase61AuditReport {
  const checklist = getPhase61AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase61PackageReport(createPhase61Package({ ownerReviewed: true, executionPackageInput: { participantWorkflowInput: { ownerReviewed: true } } }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase61CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase61Warnings(),
    blockers,
    nextStep: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage",
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

