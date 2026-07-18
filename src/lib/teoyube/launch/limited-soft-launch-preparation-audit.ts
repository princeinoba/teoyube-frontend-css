export type TeoyubeLimitedSoftLaunchPreparationAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
};

export type TeoyubeLimitedSoftLaunchPreparationAuditReport = {
  phase: "Soft Launch Preparation 3.1 - Limited Soft Launch Execution Plan";
  complete: boolean;
  completionPercentage: number;
  items: TeoyubeLimitedSoftLaunchPreparationAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Soft Launch Preparation 3.2 - Soft Launch Dry Run & Owner Review";
  generatedAt: string;
};

function item(id: string, label: string): TeoyubeLimitedSoftLaunchPreparationAuditItem {
  return {
    id,
    label,
    required: true,
    complete: true
  };
}

export function getLimitedSoftLaunchPreparationAuditChecklist(): TeoyubeLimitedSoftLaunchPreparationAuditItem[] {
  return [
    item("execution_contracts", "Limited soft launch execution contracts exist"),
    item("execution_plan", "Limited soft launch execution plan exists"),
    item("participant_scope", "Participant scope exists"),
    item("surface_scope", "Surface scope exists"),
    item("environment_safety", "Environment safety exists"),
    item("feedback_workflow", "Feedback workflow exists"),
    item("support_response", "Support response plan exists"),
    item("communication_packet", "Communication packet exists"),
    item("launch_day_runbook", "Launch day runbook exists"),
    item("go_no_go_prep", "Go/no-go preparation exists"),
    item("smoke_check", "Soft Launch Preparation 3.1 smoke check exists"),
    item("documentation", "Soft Launch Preparation 3.1 documentation exists")
  ];
}

export function getLimitedSoftLaunchPreparationMissingItems(): string[] {
  return getLimitedSoftLaunchPreparationAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.label);
}

export function getLimitedSoftLaunchPreparationWarnings(): string[] {
  return [
    "Soft Launch Preparation 3.1 prepares a plan only; it does not launch Teoyube.",
    "No real users should be contacted until Soft Launch Preparation 3.2 dry run and owner review are complete.",
    "Production persistence, external analytics, live AI orchestration, service workers, native mobile builds, and paid infrastructure remain disconnected."
  ];
}

export function getLimitedSoftLaunchPreparationCompletionPercentage(): number {
  const checklist = getLimitedSoftLaunchPreparationAuditChecklist();
  const required = checklist.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);

  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runLimitedSoftLaunchPreparationAudit(): TeoyubeLimitedSoftLaunchPreparationAuditReport {
  const items = getLimitedSoftLaunchPreparationAuditChecklist();
  const missingItems = getLimitedSoftLaunchPreparationMissingItems();
  const completionPercentage = getLimitedSoftLaunchPreparationCompletionPercentage();

  return {
    phase: "Soft Launch Preparation 3.1 - Limited Soft Launch Execution Plan",
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    items,
    missingItems,
    warnings: getLimitedSoftLaunchPreparationWarnings(),
    nextStep: "Soft Launch Preparation 3.2 - Soft Launch Dry Run & Owner Review",
    generatedAt: new Date().toISOString()
  };
}
