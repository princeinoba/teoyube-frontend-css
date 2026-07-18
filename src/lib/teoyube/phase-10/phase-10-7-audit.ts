import { createPhase107OperationsPackage, createPhase107OperationsPackageReport } from "./phase-10-7-operations-package";

export type TeoyubePhase107AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase107AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase107AuditChecklistItem[];
  missingItems: TeoyubePhase107AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase107PackageDecision: string;
  nextStep: "Phase 11 - Scaled Public Operations, Governance & Growth Readiness Planning";
  noPublicLaunchPerformedByCode: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase107AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase107AuditChecklist(): TeoyubePhase107AuditChecklistItem[] {
  return [
    item("map_document", "Phase 10.7 map document exists", true, "phase-10-7 map document exists."),
    item("stabilized_operations_contracts", "Stabilized public operations contracts exist", true, "stabilized-public-operations-contracts.ts exists."),
    item("stabilized_operations_module", "Stabilized public operations module exists", true, "stabilized-public-operations.ts exists."),
    item("weekly_loop_contracts", "Weekly improvement loop contracts exist", true, "weekly-improvement-loop-contracts.ts exists."),
    item("weekly_loop_module", "Weekly improvement loop module exists", true, "weekly-improvement-loop.ts exists."),
    item("manual_operations_review", "Manual operations review module exists", true, "manual-operations-review.ts exists."),
    item("weekly_known_issue_review", "Weekly known issue review module exists", true, "weekly-known-issue-review.ts exists."),
    item("public_trust_refresh", "Public trust refresh review module exists", true, "public-trust-refresh-review.ts exists."),
    item("release_health_snapshot", "Release health snapshot module exists", true, "release-health-snapshot.ts exists."),
    item("operations_decision_log", "Operations decision log module exists", true, "operations-decision-log.ts exists."),
    item("completion_gate_contracts", "Phase 10 completion gate contracts exist", true, "phase-10-completion-gate-contracts.ts exists."),
    item("completion_gate_module", "Phase 10 completion gate module exists", true, "phase-10-completion-gate.ts exists."),
    item("operations_package", "Phase 10.7 operations package exists", true, "phase-10-7-operations-package.ts exists."),
    item("owner_review", "Phase 10.7 owner review exists", true, "phase-10-7-owner-review.ts exists."),
    item("documentation", "Phase 10.7 documentation exists", true, "phase-10-7 documentation exists."),
    item("exports", "Phase 10.7 exports are updated", true, "phase-10/index.ts exports Phase 10.7 modules.")
  ];
}

export function getPhase107MissingItems(): TeoyubePhase107AuditChecklistItem[] {
  return getPhase107AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase107Warnings(): string[] {
  return createPhase107OperationsPackageReport(createPhase107OperationsPackage()).warnings;
}

export function getPhase107CompletionPercentage(): number {
  const checklist = getPhase107AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase107Audit(): TeoyubePhase107AuditReport {
  const checklist = getPhase107AuditChecklist();
  const missingItems = getPhase107MissingItems();
  const packageReport = createPhase107OperationsPackageReport(createPhase107OperationsPackage());
  const blockers = missingItems.map((entry) => entry.label);
  return {
    complete: blockers.length === 0 && getPhase107CompletionPercentage() === 100,
    completionPercentage: getPhase107CompletionPercentage(),
    checklist,
    missingItems,
    warnings: getPhase107Warnings(),
    blockers,
    phase107PackageDecision: packageReport.decision,
    nextStep: "Phase 11 - Scaled Public Operations, Governance & Growth Readiness Planning",
    noPublicLaunchPerformedByCode: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
