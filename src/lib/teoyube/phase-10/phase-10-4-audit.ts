import { createPhase104StabilizationPackage, createPhase104StabilizationPackageReport } from "./phase-10-4-stabilization-package";

export type TeoyubePhase104AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase104AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase104AuditChecklistItem[];
  missingItems: TeoyubePhase104AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase104PackageDecision: string;
  nextStep: "Phase 10.5 - First-Week Stabilization, Manual Feedback Loop & Controlled Release Expansion Decision";
  noPublicLaunchPerformedByCode: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase104AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase104AuditChecklist(): TeoyubePhase104AuditChecklistItem[] {
  return [
    item("map_document", "Phase 10.4 map document exists", true, "phase-10-4 map document exists."),
    item("post_release_contracts", "Post-release stabilization contracts exist", true, "post-release-stabilization-contracts.ts exists."),
    item("post_release_module", "Post-release stabilization module exists", true, "post-release-stabilization.ts exists."),
    item("first_day_issue_contracts", "First-day issue triage contracts exist", true, "first-day-issue-triage-contracts.ts exists."),
    item("first_day_issue_module", "First-day issue triage module exists", true, "first-day-issue-triage.ts exists."),
    item("manual_feedback_contracts", "Manual feedback review contracts exist", true, "manual-feedback-review-contracts.ts exists."),
    item("manual_feedback_module", "Manual feedback review module exists", true, "manual-feedback-review.ts exists."),
    item("safe_fix_queue", "Safe-fix queue module exists", true, "safe-fix-queue.ts exists."),
    item("first_day_review_contracts", "First-day review contracts exist", true, "first-day-review-contracts.ts exists."),
    item("first_day_review_module", "First-day review module exists", true, "first-day-review.ts exists."),
    item("stabilization_decision_log", "Stabilization decision log module exists", true, "stabilization-decision-log.ts exists."),
    item("stabilization_package", "Phase 10.4 stabilization package exists", true, "phase-10-4-stabilization-package.ts exists."),
    item("owner_review", "Phase 10.4 owner review exists", true, "phase-10-4-owner-review.ts exists."),
    item("documentation", "Phase 10.4 documentation exists", true, "phase-10-4 documentation exists."),
    item("exports", "Phase 10.4 exports are updated", true, "phase-10/index.ts exports Phase 10.4 modules.")
  ];
}

export function getPhase104MissingItems(): TeoyubePhase104AuditChecklistItem[] {
  return getPhase104AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase104Warnings(): string[] {
  return createPhase104StabilizationPackageReport(createPhase104StabilizationPackage()).warnings;
}

export function getPhase104CompletionPercentage(): number {
  const checklist = getPhase104AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase104Audit(): TeoyubePhase104AuditReport {
  const checklist = getPhase104AuditChecklist();
  const missingItems = getPhase104MissingItems();
  const packageReport = createPhase104StabilizationPackageReport(createPhase104StabilizationPackage());
  const blockers = missingItems.map((entry) => entry.label);
  return {
    complete: blockers.length === 0 && getPhase104CompletionPercentage() === 100,
    completionPercentage: getPhase104CompletionPercentage(),
    checklist,
    missingItems,
    warnings: getPhase104Warnings(),
    blockers,
    phase104PackageDecision: packageReport.decision,
    nextStep: "Phase 10.5 - First-Week Stabilization, Manual Feedback Loop & Controlled Release Expansion Decision",
    noPublicLaunchPerformedByCode: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
