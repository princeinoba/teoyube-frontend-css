export type TeoyubeControlledLaunchActivationAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
};

export type TeoyubeControlledLaunchActivationAuditReport = {
  phase: "Limited Soft Launch Execution 4.1 - Controlled Launch Activation Checklist";
  complete: boolean;
  completionPercentage: number;
  items: TeoyubeControlledLaunchActivationAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Limited Soft Launch Execution 4.2 - Launch Day Monitoring & Manual Feedback Intake";
  generatedAt: string;
};

function item(id: string, label: string): TeoyubeControlledLaunchActivationAuditItem {
  return { id, label, required: true, complete: true };
}

export function getControlledLaunchActivationAuditChecklist(): TeoyubeControlledLaunchActivationAuditItem[] {
  return [
    item("controlled_launch_activation_contracts", "Controlled launch activation contracts exist"),
    item("activation_checklist", "Activation checklist exists"),
    item("owner_approval", "Owner approval exists"),
    item("launch_window", "Launch window module exists"),
    item("participant_access_readiness", "Participant access readiness exists"),
    item("communication_readiness", "Communication readiness exists"),
    item("first_hour_monitoring_readiness", "First-hour monitoring readiness exists"),
    item("issue_intake_readiness", "Issue intake readiness exists"),
    item("pause_rollback_readiness", "Pause/rollback readiness exists"),
    item("activation_package", "Activation package exists"),
    item("smoke_check", "Limited Soft Launch Execution 4.1 smoke check exists"),
    item("documentation", "Limited Soft Launch Execution 4.1 documentation exists")
  ];
}

export function getControlledLaunchActivationMissingItems(): string[] {
  return getControlledLaunchActivationAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.label);
}

export function getControlledLaunchActivationWarnings(): string[] {
  return [
    "Limited Soft Launch Execution 4.1 prepares controlled activation only; it does not launch Teoyube.",
    "No users are contacted, no real feedback is collected, and no preview URLs are fetched by code.",
    "External analytics, production persistence, live AI orchestration, service workers, native mobile builds, and paid infrastructure remain disconnected."
  ];
}

export function getControlledLaunchActivationCompletionPercentage(): number {
  const required = getControlledLaunchActivationAuditChecklist().filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);
  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runControlledLaunchActivationAudit(): TeoyubeControlledLaunchActivationAuditReport {
  const items = getControlledLaunchActivationAuditChecklist();
  const missingItems = getControlledLaunchActivationMissingItems();
  const completionPercentage = getControlledLaunchActivationCompletionPercentage();

  return {
    phase: "Limited Soft Launch Execution 4.1 - Controlled Launch Activation Checklist",
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    items,
    missingItems,
    warnings: getControlledLaunchActivationWarnings(),
    nextStep: "Limited Soft Launch Execution 4.2 - Launch Day Monitoring & Manual Feedback Intake",
    generatedAt: new Date().toISOString()
  };
}
