export type TeoyubeLimitedSoftLaunchDryRunAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
};

export type TeoyubeLimitedSoftLaunchDryRunAuditReport = {
  phase: "Soft Launch Preparation 3.2 - Soft Launch Dry Run & Owner Review";
  complete: boolean;
  completionPercentage: number;
  items: TeoyubeLimitedSoftLaunchDryRunAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Soft Launch Preparation 3.3 - Final Soft Launch Readiness Package & Go/No-Go";
  generatedAt: string;
};

function item(id: string, label: string): TeoyubeLimitedSoftLaunchDryRunAuditItem {
  return { id, label, required: true, complete: true };
}

export function getLimitedSoftLaunchDryRunAuditChecklist(): TeoyubeLimitedSoftLaunchDryRunAuditItem[] {
  return [
    item("dry_run_contracts", "Limited soft launch dry run contracts exist"),
    item("dry_run_scenarios", "Dry run scenarios exist"),
    item("dry_run_runner", "Dry run runner exists"),
    item("launch_day_rehearsal", "Launch-day rehearsal exists"),
    item("feedback_rehearsal", "Feedback rehearsal exists"),
    item("issue_triage_rehearsal", "Issue triage rehearsal exists"),
    item("rollback_rehearsal", "Rollback rehearsal exists"),
    item("owner_review", "Owner review exists"),
    item("dry_run_package", "Dry run package exists"),
    item("smoke_check", "Soft Launch Preparation 3.2 smoke check exists"),
    item("documentation", "Soft Launch Preparation 3.2 documentation exists")
  ];
}

export function getLimitedSoftLaunchDryRunMissingItems(): string[] {
  return getLimitedSoftLaunchDryRunAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.label);
}

export function getLimitedSoftLaunchDryRunWarnings(): string[] {
  return [
    "Soft Launch Preparation 3.2 rehearses the limited soft launch only; it does not launch Teoyube.",
    "No real users should be contacted until Soft Launch Preparation 3.3 final readiness package and go/no-go are complete.",
    "Production persistence, external analytics, live AI orchestration, service workers, native mobile builds, paid infrastructure, and production monitoring remain disconnected."
  ];
}

export function getLimitedSoftLaunchDryRunCompletionPercentage(): number {
  const checklist = getLimitedSoftLaunchDryRunAuditChecklist();
  const required = checklist.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);

  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runLimitedSoftLaunchDryRunAudit(): TeoyubeLimitedSoftLaunchDryRunAuditReport {
  const items = getLimitedSoftLaunchDryRunAuditChecklist();
  const missingItems = getLimitedSoftLaunchDryRunMissingItems();
  const completionPercentage = getLimitedSoftLaunchDryRunCompletionPercentage();

  return {
    phase: "Soft Launch Preparation 3.2 - Soft Launch Dry Run & Owner Review",
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    items,
    missingItems,
    warnings: getLimitedSoftLaunchDryRunWarnings(),
    nextStep: "Soft Launch Preparation 3.3 - Final Soft Launch Readiness Package & Go/No-Go",
    generatedAt: new Date().toISOString()
  };
}
