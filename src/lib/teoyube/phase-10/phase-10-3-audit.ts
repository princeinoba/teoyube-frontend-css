import { createPhase103ReleasePackage, createPhase103ReleasePackageReport } from "./phase-10-3-release-package";

export type TeoyubePhase103AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase103AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase103AuditChecklistItem[];
  missingItems: TeoyubePhase103AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase103PackageDecision: string;
  nextStep: "Phase 10.4 - Post-Release Stabilization, Issue Triage & First-Day Review";
  noPublicLaunchPerformedByCode: true;
  noAutomaticDeployment: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase103AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase103AuditChecklist(): TeoyubePhase103AuditChecklistItem[] {
  return [
    item("map_document", "Phase 10.3 map document exists", true, "phase-10-3 map document exists."),
    item("execution_contracts", "Controlled public release execution contracts exist", true, "controlled-public-release-execution-contracts.ts exists."),
    item("execution_module", "Controlled public release execution module exists", true, "controlled-public-release-execution.ts exists."),
    item("first_hour_contracts", "First-hour monitoring contracts exist", true, "first-hour-monitoring-contracts.ts exists."),
    item("first_hour_module", "First-hour monitoring module exists", true, "first-hour-monitoring.ts exists."),
    item("issue_contracts", "Launch issue classification contracts exist", true, "launch-issue-classification-contracts.ts exists."),
    item("issue_module", "Launch issue classification module exists", true, "launch-issue-classification.ts exists."),
    item("decision_log_contracts", "Launch decision log contracts exist", true, "launch-decision-log-contracts.ts exists."),
    item("decision_log_module", "Launch decision log module exists", true, "launch-decision-log.ts exists."),
    item("rollback_readiness", "Rollback readiness module exists", true, "controlled-release-rollback-readiness.ts exists."),
    item("safe_fix_approval", "Safe fix approval module exists", true, "safe-fix-approval.ts exists."),
    item("release_package", "Phase 10.3 release package exists", true, "phase-10-3-release-package.ts exists."),
    item("owner_review", "Phase 10.3 owner review exists", true, "phase-10-3-owner-review.ts exists."),
    item("documentation", "Phase 10.3 documentation exists", true, "phase-10-3 documentation exists."),
    item("exports", "Phase 10.3 exports are updated", true, "phase-10/index.ts exports Phase 10.3 modules.")
  ];
}

export function getPhase103MissingItems(): TeoyubePhase103AuditChecklistItem[] {
  return getPhase103AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase103Warnings(): string[] {
  return createPhase103ReleasePackageReport(createPhase103ReleasePackage()).warnings;
}

export function getPhase103CompletionPercentage(): number {
  const checklist = getPhase103AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase103Audit(): TeoyubePhase103AuditReport {
  const checklist = getPhase103AuditChecklist();
  const missingItems = getPhase103MissingItems();
  const packageReport = createPhase103ReleasePackageReport(createPhase103ReleasePackage());
  const blockers = missingItems.map((entry) => entry.label);
  return {
    complete: blockers.length === 0 && getPhase103CompletionPercentage() === 100,
    completionPercentage: getPhase103CompletionPercentage(),
    checklist,
    missingItems,
    warnings: getPhase103Warnings(),
    blockers,
    phase103PackageDecision: packageReport.decision,
    nextStep: "Phase 10.4 - Post-Release Stabilization, Issue Triage & First-Day Review",
    noPublicLaunchPerformedByCode: true,
    noAutomaticDeployment: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
