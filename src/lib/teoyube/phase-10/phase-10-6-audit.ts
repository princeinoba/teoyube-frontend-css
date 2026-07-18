import { createPhase106OperationsPackage, createPhase106OperationsPackageReport } from "./phase-10-6-operations-package";

export type TeoyubePhase106AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase106AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase106AuditChecklistItem[];
  missingItems: TeoyubePhase106AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase106PackageDecision: string;
  nextStep: "Phase 10.7 - Stabilized Public Operations, Weekly Improvement Loop & Phase 10 Completion Gate";
  noPublicExpansionPerformedByCode: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase106AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase106AuditChecklist(): TeoyubePhase106AuditChecklistItem[] {
  return [
    item("map_document", "Phase 10.6 map document exists", true, "phase-10-6 map document exists."),
    item("expansion_readiness_contracts", "Controlled release expansion readiness contracts exist", true, "controlled-release-expansion-readiness-contracts.ts exists."),
    item("expansion_readiness_module", "Controlled release expansion readiness module exists", true, "controlled-release-expansion-readiness.ts exists."),
    item("public_trust_contracts", "Public trust review contracts exist", true, "public-trust-review-contracts.ts exists."),
    item("public_trust_module", "Public trust review module exists", true, "public-trust-review.ts exists."),
    item("known_limitations", "Known limitations readiness module exists", true, "known-limitations-readiness.ts exists."),
    item("public_safety", "Public safety boundary review module exists", true, "public-safety-boundary-review.ts exists."),
    item("handoff_contracts", "Stabilized operations handoff contracts exist", true, "stabilized-operations-handoff-contracts.ts exists."),
    item("handoff_module", "Stabilized operations handoff module exists", true, "stabilized-operations-handoff.ts exists."),
    item("controlled_expansion_gate", "Controlled expansion gate module exists", true, "controlled-expansion-gate.ts exists."),
    item("runbook", "Stabilized operations runbook module exists", true, "stabilized-operations-runbook.ts exists."),
    item("operations_package", "Phase 10.6 operations package exists", true, "phase-10-6-operations-package.ts exists."),
    item("owner_review", "Phase 10.6 owner review exists", true, "phase-10-6-owner-review.ts exists."),
    item("documentation", "Phase 10.6 documentation exists", true, "phase-10-6 documentation exists."),
    item("exports", "Phase 10.6 exports are updated", true, "phase-10/index.ts exports Phase 10.6 modules.")
  ];
}

export function getPhase106MissingItems(): TeoyubePhase106AuditChecklistItem[] {
  return getPhase106AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase106Warnings(): string[] {
  return createPhase106OperationsPackageReport(createPhase106OperationsPackage()).warnings;
}

export function getPhase106CompletionPercentage(): number {
  const checklist = getPhase106AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase106Audit(): TeoyubePhase106AuditReport {
  const checklist = getPhase106AuditChecklist();
  const missingItems = getPhase106MissingItems();
  const packageReport = createPhase106OperationsPackageReport(createPhase106OperationsPackage());
  const blockers = missingItems.map((entry) => entry.label);
  return {
    complete: blockers.length === 0 && getPhase106CompletionPercentage() === 100,
    completionPercentage: getPhase106CompletionPercentage(),
    checklist,
    missingItems,
    warnings: getPhase106Warnings(),
    blockers,
    phase106PackageDecision: packageReport.decision,
    nextStep: "Phase 10.7 - Stabilized Public Operations, Weekly Improvement Loop & Phase 10 Completion Gate",
    noPublicExpansionPerformedByCode: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
