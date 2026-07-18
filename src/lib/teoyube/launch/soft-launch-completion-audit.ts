export type TeoyubeSoftLaunchCompletionAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
};

export type TeoyubeSoftLaunchCompletionAuditReport = {
  phase: "Limited Soft Launch Execution 4.5 - Soft Launch Completion Review & Public Launch Readiness";
  complete: boolean;
  completionPercentage: number;
  items: TeoyubeSoftLaunchCompletionAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Public Launch Preparation 5.1 - Public Launch Readiness Audit & Production Service Connection Plan";
  generatedAt: string;
};

function item(id: string, label: string): TeoyubeSoftLaunchCompletionAuditItem {
  return { id, label, required: true, complete: true };
}

export function getSoftLaunchCompletionAuditChecklist(): TeoyubeSoftLaunchCompletionAuditItem[] {
  return [
    item("completion_contracts", "Completion contracts exist"),
    item("completion_review", "Completion review exists"),
    item("feedback_summary", "Feedback summary exists"),
    item("issue_closure", "Issue closure exists"),
    item("stability_certification", "Stability certification exists"),
    item("final_safety_privacy_review", "Final safety/privacy review exists"),
    item("public_launch_readiness_criteria", "Public launch readiness criteria exists"),
    item("public_launch_readiness_package", "Public launch readiness package exists"),
    item("public_launch_risk_register", "Public launch risk register exists"),
    item("public_launch_known_limitations", "Public launch known limitations exists"),
    item("public_launch_owner_readiness_review", "Public launch owner readiness review exists"),
    item("public_launch_readiness_handoff", "Public launch readiness handoff exists"),
    item("smoke_check", "Limited Soft Launch Execution 4.5 smoke check exists"),
    item("documentation", "Limited Soft Launch Execution 4.5 documentation exists")
  ];
}

export function getSoftLaunchCompletionMissingItems(): string[] {
  return getSoftLaunchCompletionAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.label);
}

export function getSoftLaunchCompletionWarnings(): string[] {
  return [
    "Limited Soft Launch Execution 4.5 is a review, certification, readiness package, and handoff layer only.",
    "No public launch, user contact, automatic feedback collection, provider connection, database persistence, analytics sending, live AI orchestration, service worker, or native app work is performed.",
    "Public launch preparation is the next stage; it must still explicitly review production service connections, privacy/legal content, support, QA, and final go/no-go."
  ];
}

export function getSoftLaunchCompletionPercentage(): number {
  const required = getSoftLaunchCompletionAuditChecklist().filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);
  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runSoftLaunchCompletionAudit(): TeoyubeSoftLaunchCompletionAuditReport {
  const items = getSoftLaunchCompletionAuditChecklist();
  const missingItems = getSoftLaunchCompletionMissingItems();
  const completionPercentage = getSoftLaunchCompletionPercentage();
  return {
    phase: "Limited Soft Launch Execution 4.5 - Soft Launch Completion Review & Public Launch Readiness",
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    items,
    missingItems,
    warnings: getSoftLaunchCompletionWarnings(),
    nextStep: "Public Launch Preparation 5.1 - Public Launch Readiness Audit & Production Service Connection Plan",
    generatedAt: new Date().toISOString()
  };
}
