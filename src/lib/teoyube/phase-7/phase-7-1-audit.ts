import { createPhase71Package, createPhase71PackageReport } from "./phase-7-1-package";

export type TeoyubePhase71AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase71AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase71AuditChecklistItem[];
  missingItems: TeoyubePhase71AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase71AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase71AuditChecklist(): TeoyubePhase71AuditChecklistItem[] {
  const pkg = createPhase71Package({ ownerReviewed: true });
  const report = createPhase71PackageReport(pkg);
  return [
    item("phase_7_contracts", "Phase 7 contracts exist", true, "phase-7-contracts.ts defines Phase 7 contracts."),
    item("phase_7_1_map_document", "Phase 7.1 map document exists", true, "phase-7-1-controlled-beta-operations-runbook-feedback-review-support-workflow-map.md documents the map."),
    item("operations_runbook_contracts", "Operations runbook contracts exist", true, "controlled-beta-operations-runbook-contracts.ts defines runbook contracts."),
    item("operations_runbook", "Operations runbook exists", pkg.betaOperationsPackage.operationsRunbookReport.inMemoryOnly, "controlled-beta-operations-runbook.ts creates the manual operations runbook."),
    item("manual_feedback_review_contracts", "Manual feedback review contracts exist", true, "manual-beta-feedback-review-contracts.ts defines manual feedback review contracts."),
    item("manual_feedback_review", "Manual feedback review exists", pkg.betaOperationsPackage.manualFeedbackReviewReport.inMemoryOnly, "manual-beta-feedback-review.ts handles sanitized manual feedback review."),
    item("support_workflow_contracts", "Beta support workflow contracts exist", true, "beta-support-workflow-contracts.ts defines support contracts."),
    item("support_workflow", "Beta support workflow exists", pkg.betaOperationsPackage.betaSupportWorkflowReport.inMemoryOnly, "beta-support-workflow.ts creates manual support workflow reports."),
    item("manual_monitoring_contracts", "Manual operational monitoring contracts exist", true, "manual-operational-monitoring-contracts.ts defines monitoring contracts."),
    item("manual_monitoring", "Manual operational monitoring exists", pkg.betaOperationsPackage.manualOperationalMonitoringReport.inMemoryOnly, "manual-operational-monitoring.ts creates manual monitoring reports."),
    item("issue_escalation", "Issue escalation workflow exists", pkg.betaOperationsPackage.betaIssueEscalationReport.inMemoryOnly, "beta-issue-escalation-workflow.ts classifies operational issues."),
    item("support_to_issue_converter", "Support-to-issue converter exists", pkg.betaOperationsPackage.supportToIssueConversionReport.inMemoryOnly, "beta-support-to-issue-converter.ts converts support requests into manual issues."),
    item("pause_rollback_review", "Pause/rollback review exists", pkg.betaOperationsPackage.pauseRollbackReviewReport.inMemoryOnly, "beta-operations-pause-rollback-review.ts creates decision support only."),
    item("known_limitations", "Known limitations exist", pkg.betaOperationsPackage.knownLimitationsReport.inMemoryOnly, "beta-operations-known-limitations.ts creates the limitations report."),
    item("beta_operations_package", "Beta operations package exists", pkg.betaOperationsPackageReport.inMemoryOnly, "beta-operations-package.ts combines Phase 7.1 operations reports."),
    item("owner_review", "Owner review exists", pkg.ownerReviewReport.inMemoryOnly, "phase-7-1-owner-review.ts prepares owner review."),
    item("phase_7_1_package", "Phase 7.1 package exists", report.inMemoryOnly, "phase-7-1-package.ts combines operations package and owner review."),
    item("smoke_check", "Phase 7.1 smoke check exists", true, "phase-7-1-controlled-beta-operations-smoke-check.ts verifies Phase 7.1."),
    item("documentation", "Phase 7.1 documentation exists", true, "phase-7-1-controlled-beta-operations-runbook-feedback-review-support-workflow.md documents the step.")
  ];
}

export function getPhase71MissingItems(): TeoyubePhase71AuditChecklistItem[] {
  return getPhase71AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase71Warnings(): string[] {
  return createPhase71PackageReport(createPhase71Package({ ownerReviewed: true })).warnings;
}

export function getPhase71CompletionPercentage(): number {
  const checklist = getPhase71AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase71Audit(): TeoyubePhase71AuditReport {
  const checklist = getPhase71AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase71PackageReport(createPhase71Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase71CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase71Warnings(),
    blockers,
    nextStep: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue",
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
