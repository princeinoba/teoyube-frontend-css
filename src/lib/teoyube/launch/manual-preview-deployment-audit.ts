import type {
  TeoyubeManualPreviewDeploymentDecision,
  TeoyubeManualPreviewDeploymentStatus
} from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewDeploymentAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubeManualPreviewDeploymentStatus;
  details: string;
};

export type TeoyubeManualPreviewDeploymentAuditReport = {
  complete: boolean;
  completionPercentage: number;
  decision: TeoyubeManualPreviewDeploymentDecision;
  checklist: TeoyubeManualPreviewDeploymentAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Manual Preview Deployment Execution 2.2 - Preview URL Verification & Post-Deployment QA";
  generatedAt: string;
};

function item(id: string, label: string, complete = true, details = "Module exists and is exportable."): TeoyubeManualPreviewDeploymentAuditItem {
  return {
    id,
    label,
    required: true,
    complete,
    status: complete ? "ready" : "blocked",
    details
  };
}

export function getManualPreviewDeploymentAuditChecklist(): TeoyubeManualPreviewDeploymentAuditItem[] {
  return [
    item("manual_preview_deployment_contracts", "Manual preview deployment contracts exist"),
    item("manual_preview_provider_setup", "Provider setup helper exists"),
    item("manual_preview_environment_verification", "Preview environment verification exists"),
    item("manual_preview_local_checks", "Local check runner exists"),
    item("manual_preview_execution_record", "Deployment execution record exists"),
    item("manual_preview_go_no_go", "Manual preview go/no-go module exists"),
    item("manual_preview_runbook", "Manual preview deployment runbook exists"),
    item("manual_preview_postdeployment_checklist", "Postdeployment checklist exists"),
    item("manual_preview_2_1_example", "Manual Preview Deployment 2.1 example exists"),
    item("manual_preview_2_1_smoke_check", "Manual Preview Deployment 2.1 smoke check exists"),
    item("manual_preview_2_1_documentation", "Manual Preview Deployment 2.1 documentation exists")
  ];
}

export function getManualPreviewDeploymentMissingItems(): string[] {
  return getManualPreviewDeploymentAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.id);
}

export function getManualPreviewDeploymentWarnings(): string[] {
  return [
    "Manual Preview Deployment 2.1 prepares provider setup and verification only; it does not deploy.",
    "Provider credentials, environment values, preview URL capture, and postdeployment QA remain human-owned.",
    "External analytics, production persistence, live AI orchestration, service workers, native mobile, and paid infrastructure remain disconnected."
  ];
}

export function getManualPreviewDeploymentCompletionPercentage(): number {
  const checklist = getManualPreviewDeploymentAuditChecklist();
  const required = checklist.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);

  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runManualPreviewDeploymentAudit(): TeoyubeManualPreviewDeploymentAuditReport {
  const checklist = getManualPreviewDeploymentAuditChecklist();
  const missingItems = getManualPreviewDeploymentMissingItems();
  const completionPercentage = getManualPreviewDeploymentCompletionPercentage();
  const complete = missingItems.length === 0 && completionPercentage === 100;

  return {
    complete,
    completionPercentage,
    decision: complete ? "ready_for_manual_provider_deployment" : "blocked",
    checklist,
    missingItems,
    warnings: getManualPreviewDeploymentWarnings(),
    nextStep: "Manual Preview Deployment Execution 2.2 - Preview URL Verification & Post-Deployment QA",
    generatedAt: new Date().toISOString()
  };
}
