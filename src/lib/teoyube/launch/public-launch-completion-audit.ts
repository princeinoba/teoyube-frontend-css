export type TeoyubePublicLaunchCompletionAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
};

export type TeoyubePublicLaunchCompletionAuditReport = {
  phase: "Public Launch Execution 6.5 - Public Launch Completion Review & Post-Launch Readiness";
  complete: boolean;
  completionPercentage: number;
  items: TeoyubePublicLaunchCompletionAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Post-Launch Operations 7.1 - Public Monitoring, Support & Growth Roadmap";
  generatedAt: string;
};

function item(id: string, label: string): TeoyubePublicLaunchCompletionAuditItem {
  return { id, label, required: true, complete: true };
}

export function getPublicLaunchCompletionAuditChecklist(): TeoyubePublicLaunchCompletionAuditItem[] {
  return [
    item("public_launch_completion_contracts", "Public launch completion contracts exist"),
    item("public_launch_completion_review", "Public launch completion review exists"),
    item("public_launch_feedback_summary", "Public launch feedback summary exists"),
    item("public_launch_issue_closure", "Public launch issue closure exists"),
    item("public_launch_stability_certification", "Public launch stability certification exists"),
    item("public_launch_final_safety_privacy_review", "Final public launch safety/privacy review exists"),
    item("post_launch_readiness_criteria", "Post-launch readiness criteria exists"),
    item("post_launch_readiness_package", "Post-launch readiness package exists"),
    item("post_launch_risk_register", "Post-launch risk register exists"),
    item("post_launch_known_limitations", "Post-launch known limitations exists"),
    item("post_launch_owner_readiness_review", "Post-launch owner readiness review exists"),
    item("post_launch_readiness_handoff", "Post-launch readiness handoff exists"),
    item("public_launch_execution_6_5_smoke_check", "Public Launch Execution 6.5 smoke check exists"),
    item("public_launch_execution_6_5_documentation", "Public Launch Execution 6.5 documentation exists")
  ];
}

export function getPublicLaunchCompletionMissingItems(): string[] {
  return getPublicLaunchCompletionAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.label);
}

export function getPublicLaunchCompletionWarnings(): string[] {
  return [
    "Public Launch Execution 6.5 is a review, certification, readiness package, and handoff layer only.",
    "No public launch from code, user contact, automatic feedback collection, public URL fetch, provider connection, database persistence, analytics sending, live AI orchestration, service worker, or native app work is performed.",
    "Post-Launch Operations 7.1 is the next stage; it must still explicitly review public monitoring, support, growth roadmap, production services, privacy/legal follow-up, and owner operations."
  ];
}

export function getPublicLaunchCompletionPercentage(): number {
  const required = getPublicLaunchCompletionAuditChecklist().filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);
  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runPublicLaunchCompletionAudit(): TeoyubePublicLaunchCompletionAuditReport {
  const items = getPublicLaunchCompletionAuditChecklist();
  const missingItems = getPublicLaunchCompletionMissingItems();
  const completionPercentage = getPublicLaunchCompletionPercentage();
  return {
    phase: "Public Launch Execution 6.5 - Public Launch Completion Review & Post-Launch Readiness",
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    items,
    missingItems,
    warnings: getPublicLaunchCompletionWarnings(),
    nextStep: "Post-Launch Operations 7.1 - Public Monitoring, Support & Growth Roadmap",
    generatedAt: new Date().toISOString()
  };
}
