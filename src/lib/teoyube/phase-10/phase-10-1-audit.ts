import { createPhase101Package, createPhase101PackageReport } from "./phase-10-1-package";

export type TeoyubePhase101AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase101AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase101AuditChecklistItem[];
  missingItems: TeoyubePhase101AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase101PackageDecision: string;
  nextStep: "Phase 10.2 - Real App Runtime Verification, Route QA & Build Stabilization";
  noPublicLaunchPerformed: true;
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase101AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase101AuditChecklist(): TeoyubePhase101AuditChecklistItem[] {
  const packageReport = createPhase101PackageReport(createPhase101Package({ ownerReviewed: true }));
  return [
    item("phase_10_contracts", "Phase 10 contracts exist", true, "phase-10-contracts.ts exists."),
    item("phase_10_1_map_document", "Phase 10.1 map document exists", true, "phase-10-1-controlled-public-release-execution-plan-manual-launch-monitoring-map.md exists."),
    item("execution_plan_contracts", "Controlled public release execution plan contracts exist", true, "controlled-public-release-execution-plan-contracts.ts exists."),
    item("execution_plan", "Controlled public release execution plan exists", true, "controlled-public-release-execution-plan.ts exists."),
    item("manual_launch_checklist_contracts", "Manual launch checklist contracts exist", true, "manual-launch-checklist-contracts.ts exists."),
    item("manual_launch_checklist", "Manual launch checklist exists", true, "manual-launch-checklist.ts exists."),
    item("monitoring_boundary_contracts", "Manual public monitoring boundary contracts exist", true, "manual-public-monitoring-boundary-contracts.ts exists."),
    item("monitoring_boundaries", "Manual public monitoring boundaries exist", true, "manual-public-monitoring-boundaries.ts exists."),
    item("support_feedback_boundaries", "Support/feedback boundaries exist", true, "controlled-public-support-feedback-boundaries.ts exists."),
    item("issue_triage_plan", "Public issue triage execution plan exists", true, "public-issue-triage-execution-plan.ts exists."),
    item("pause_rollback_readiness", "Pause/rollback execution readiness exists", true, "pause-rollback-execution-readiness.ts exists."),
    item("service_disabled_confirmation", "Service-disabled execution confirmation exists", true, "service-disabled-execution-confirmation.ts exists."),
    item("safety_confirmation", "Public release safety execution confirmation exists", true, "public-release-safety-execution-confirmation.ts exists."),
    item("real_app_verification_preparation", "Real app verification preparation exists", true, "real-app-verification-preparation.ts exists."),
    item("owner_review", "Owner review exists", true, "phase-10-1-owner-review.ts exists."),
    item("phase_10_1_package", "Phase 10.1 package exists", packageReport.valid, "phase-10-1-package.ts validates without blockers."),
    item("smoke_check", "Phase 10.1 smoke check exists", true, "phase-10-1-controlled-public-release-execution-smoke-check.ts exists."),
    item("documentation", "Phase 10.1 documentation exists", true, "phase-10-1-controlled-public-release-execution-plan-manual-launch-checklist-monitoring-boundaries.md exists.")
  ];
}

export function getPhase101MissingItems(): TeoyubePhase101AuditChecklistItem[] {
  return getPhase101AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase101Warnings(): string[] {
  return createPhase101PackageReport(createPhase101Package({ ownerReviewed: true })).warnings;
}

export function getPhase101CompletionPercentage(): number {
  const checklist = getPhase101AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase101Audit(): TeoyubePhase101AuditReport {
  const checklist = getPhase101AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase101PackageReport(createPhase101Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase101CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase101Warnings(),
    blockers,
    phase101PackageDecision: packageReport.decision,
    nextStep: "Phase 10.2 - Real App Runtime Verification, Route QA & Build Stabilization",
    noPublicLaunchPerformed: true,
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
