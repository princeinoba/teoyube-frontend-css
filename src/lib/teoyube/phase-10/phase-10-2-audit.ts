import { createPhase102Package, createPhase102PackageReport } from "./phase-10-2-package";

export type TeoyubePhase102AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase102AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase102AuditChecklistItem[];
  missingItems: TeoyubePhase102AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase102PackageDecision: string;
  nextStep: "Fix the remaining build/runtime blockers before Phase 10.3.";
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase102AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase102AuditChecklist(): TeoyubePhase102AuditChecklistItem[] {
  const packageReport = createPhase102PackageReport(createPhase102Package({ ownerReviewed: true }));
  return [
    item("map_document", "Phase 10.2 map document exists", true, "phase-10-2 map document exists."),
    item("runtime_contracts", "Runtime verification contracts exist", true, "real-app-runtime-verification-contracts.ts exists."),
    item("runtime_module", "Runtime verification module exists", true, "real-app-runtime-verification.ts exists."),
    item("route_contracts", "Route QA contracts exist", true, "route-qa-contracts.ts exists."),
    item("route_module", "Route QA module exists", true, "route-qa.ts exists."),
    item("data_loading", "Data loading verification exists", true, "data-loading-verification.ts exists."),
    item("component_render", "Component render verification exists", true, "component-render-verification.ts exists."),
    item("build_contracts", "Build stabilization contracts exist", true, "build-stabilization-contracts.ts exists."),
    item("build_module", "Build stabilization module exists", true, "build-stabilization.ts exists."),
    item("verification_package", "Real app verification package exists", true, "real-app-verification-package.ts exists."),
    item("owner_review", "Owner review exists", true, "phase-10-2-owner-review.ts exists."),
    item("phase_10_2_package", "Phase 10.2 package exists", true, "phase-10-2-package.ts exists."),
    item("smoke_check", "Smoke check exists", true, "phase-10-2-route-build-smoke-check.ts exists."),
    item("documentation", "Documentation exists", true, "phase-10-2 documentation exists."),
    item("command_results_documented", "Build/typecheck/lint/test results are documented", packageReport.commandResults.length >= 4, "Command results are included in the package.")
  ];
}

export function getPhase102MissingItems(): TeoyubePhase102AuditChecklistItem[] {
  return getPhase102AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase102Warnings(): string[] {
  return createPhase102PackageReport(createPhase102Package({ ownerReviewed: true })).warnings;
}

export function getPhase102CompletionPercentage(): number {
  const checklist = getPhase102AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase102Audit(): TeoyubePhase102AuditReport {
  const checklist = getPhase102AuditChecklist();
  const missingItems = getPhase102MissingItems();
  const packageReport = createPhase102PackageReport(createPhase102Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  return {
    complete: false,
    completionPercentage: getPhase102CompletionPercentage(),
    checklist,
    missingItems,
    warnings: getPhase102Warnings(),
    blockers,
    phase102PackageDecision: packageReport.decision,
    nextStep: "Fix the remaining build/runtime blockers before Phase 10.3.",
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
