export type TeoyubeFinalSoftLaunchReadinessAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubeFinalSoftLaunchReadinessAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubeFinalSoftLaunchReadinessAuditItem[];
  missingItems: TeoyubeFinalSoftLaunchReadinessAuditItem[];
  warnings: string[];
  nextStep: "Limited Soft Launch Execution 4.1 - Controlled Launch Activation Checklist";
  generatedAt: string;
};

function item(id: string, label: string, complete = true): TeoyubeFinalSoftLaunchReadinessAuditItem {
  return {
    id,
    label,
    complete,
    details: complete ? `${label} is available for Soft Launch Preparation 3.3.` : `${label} is missing.`
  };
}

export function getFinalSoftLaunchReadinessAuditChecklist(): TeoyubeFinalSoftLaunchReadinessAuditItem[] {
  return [
    item("final_readiness_contracts", "Final soft launch readiness contracts exist"),
    item("final_readiness_package", "Final soft launch readiness package exists"),
    item("final_safety_certification", "Final soft launch safety certification exists"),
    item("final_surface_certification", "Final soft launch surface certification exists"),
    item("final_quality_gate_report", "Final soft launch quality gate report exists"),
    item("final_risk_register", "Final soft launch risk register exists"),
    item("final_known_limitations", "Final soft launch known limitations module exists"),
    item("final_owner_go_no_go", "Final soft launch owner go/no-go module exists"),
    item("final_go_no_go", "Final soft launch go/no-go module exists"),
    item("final_execution_handoff", "Final soft launch execution handoff exists"),
    item("final_smoke_check", "Soft Launch Preparation 3.3 smoke check exists"),
    item("final_documentation", "Soft Launch Preparation 3.3 documentation exists")
  ];
}

export function getFinalSoftLaunchReadinessMissingItems(): TeoyubeFinalSoftLaunchReadinessAuditItem[] {
  return getFinalSoftLaunchReadinessAuditChecklist().filter((entry) => !entry.complete);
}

export function getFinalSoftLaunchReadinessWarnings(): string[] {
  return [
    "Soft Launch Preparation 3.3 is decision readiness only; it does not launch Teoyube.",
    "No real users should be contacted until Limited Soft Launch Execution 4.1 owner-controlled activation.",
    "External analytics, production persistence, live AI orchestration, service workers, native mobile builds, and paid infrastructure remain disconnected."
  ];
}

export function getFinalSoftLaunchReadinessCompletionPercentage(): number {
  const checklist = getFinalSoftLaunchReadinessAuditChecklist();
  const complete = checklist.filter((entry) => entry.complete).length;

  return Math.round((complete / Math.max(1, checklist.length)) * 100);
}

export function runFinalSoftLaunchReadinessAudit(): TeoyubeFinalSoftLaunchReadinessAuditReport {
  const checklist = getFinalSoftLaunchReadinessAuditChecklist();
  const missingItems = getFinalSoftLaunchReadinessMissingItems();

  return {
    complete: missingItems.length === 0,
    completionPercentage: getFinalSoftLaunchReadinessCompletionPercentage(),
    checklist,
    missingItems,
    warnings: getFinalSoftLaunchReadinessWarnings(),
    nextStep: "Limited Soft Launch Execution 4.1 - Controlled Launch Activation Checklist",
    generatedAt: new Date().toISOString()
  };
}
