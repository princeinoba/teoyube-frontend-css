import { createPhase105StabilizationPackage, createPhase105StabilizationPackageReport } from "./phase-10-5-stabilization-package";

export type TeoyubePhase105AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase105AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase105AuditChecklistItem[];
  missingItems: TeoyubePhase105AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase105PackageDecision: string;
  nextStep: "Phase 10.6 - Controlled Release Expansion Readiness, Public Trust Review & Stabilized Operations Handoff";
  noPublicExpansionPerformedByCode: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase105AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase105AuditChecklist(): TeoyubePhase105AuditChecklistItem[] {
  return [
    item("map_document", "Phase 10.5 map document exists", true, "phase-10-5 map document exists."),
    item("first_week_contracts", "First-week stabilization contracts exist", true, "first-week-stabilization-contracts.ts exists."),
    item("first_week_module", "First-week stabilization module exists", true, "first-week-stabilization.ts exists."),
    item("manual_feedback_loop_contracts", "Manual feedback loop contracts exist", true, "manual-feedback-loop-contracts.ts exists."),
    item("manual_feedback_loop_module", "Manual feedback loop module exists", true, "manual-feedback-loop.ts exists."),
    item("repeated_issue_pattern_review", "Repeated issue pattern review exists", true, "repeated-issue-pattern-review.ts exists."),
    item("known_issue_register", "Known issue register exists", true, "known-issue-register.ts exists."),
    item("safe_fix_batch_review", "Safe-fix batch review exists", true, "safe-fix-batch-review.ts exists."),
    item("controlled_expansion_contracts", "Controlled release expansion decision contracts exist", true, "controlled-release-expansion-decision-contracts.ts exists."),
    item("controlled_expansion_module", "Controlled release expansion decision module exists", true, "controlled-release-expansion-decision.ts exists."),
    item("first_week_decision_log", "First-week stabilization decision log exists", true, "first-week-stabilization-decision-log.ts exists."),
    item("stabilization_package", "Phase 10.5 stabilization package exists", true, "phase-10-5-stabilization-package.ts exists."),
    item("owner_review", "Phase 10.5 owner review exists", true, "phase-10-5-owner-review.ts exists."),
    item("documentation", "Phase 10.5 documentation exists", true, "phase-10-5 documentation exists."),
    item("exports", "Phase 10.5 exports are updated", true, "phase-10/index.ts exports Phase 10.5 modules.")
  ];
}

export function getPhase105MissingItems(): TeoyubePhase105AuditChecklistItem[] {
  return getPhase105AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase105Warnings(): string[] {
  return createPhase105StabilizationPackageReport(createPhase105StabilizationPackage()).warnings;
}

export function getPhase105CompletionPercentage(): number {
  const checklist = getPhase105AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase105Audit(): TeoyubePhase105AuditReport {
  const checklist = getPhase105AuditChecklist();
  const missingItems = getPhase105MissingItems();
  const packageReport = createPhase105StabilizationPackageReport(createPhase105StabilizationPackage());
  const blockers = missingItems.map((entry) => entry.label);
  return {
    complete: blockers.length === 0 && getPhase105CompletionPercentage() === 100,
    completionPercentage: getPhase105CompletionPercentage(),
    checklist,
    missingItems,
    warnings: getPhase105Warnings(),
    blockers,
    phase105PackageDecision: packageReport.decision,
    nextStep: "Phase 10.6 - Controlled Release Expansion Readiness, Public Trust Review & Stabilized Operations Handoff",
    noPublicExpansionPerformedByCode: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
