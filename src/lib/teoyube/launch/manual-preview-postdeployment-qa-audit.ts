import type { TeoyubeManualPreviewDeploymentStatus } from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewPostDeploymentQaAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubeManualPreviewDeploymentStatus;
  details: string;
};

export type TeoyubeManualPreviewPostDeploymentQaAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubeManualPreviewPostDeploymentQaAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Manual Preview Deployment Execution 2.3 - Preview Issue Triage & Fix Plan";
  generatedAt: string;
};

function item(id: string, label: string, complete = true): TeoyubeManualPreviewPostDeploymentQaAuditItem {
  return {
    id,
    label,
    required: true,
    complete,
    status: complete ? "ready" : "blocked",
    details: complete ? "Module exists and is exportable." : "Required module is missing."
  };
}

export function getManualPreviewPostDeploymentQaAuditChecklist(): TeoyubeManualPreviewPostDeploymentQaAuditItem[] {
  return [
    item("manual_preview_url_verification_contracts", "URL verification contracts exist"),
    item("manual_preview_url_verification", "URL verification module exists"),
    item("manual_preview_postdeployment_qa_contracts", "Postdeployment QA contracts exist"),
    item("manual_preview_postdeployment_qa_runner", "Postdeployment QA runner exists"),
    item("manual_preview_surface_postdeployment_checks", "Surface postdeployment checklist exists"),
    item("manual_preview_scripture_explanation_verification", "Scripture/explanation verification exists"),
    item("manual_preview_consent_privacy_verification", "Consent/privacy verification exists"),
    item("manual_preview_mobile_accessibility_verification", "Mobile/accessibility verification exists"),
    item("manual_preview_fallback_offline_verification", "Fallback/offline verification exists"),
    item("manual_preview_postdeployment_issue_bridge", "Postdeployment issue bridge exists"),
    item("manual_preview_2_2_smoke_check", "Manual Preview Deployment 2.2 smoke check exists"),
    item("manual_preview_2_2_documentation", "Manual Preview Deployment 2.2 documentation exists")
  ];
}

export function getManualPreviewPostDeploymentQaMissingItems(): string[] {
  return getManualPreviewPostDeploymentQaAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.id);
}

export function getManualPreviewPostDeploymentQaWarnings(): string[] {
  return [
    "Manual Preview Deployment 2.2 creates postdeployment QA structures only; it does not fetch preview URLs.",
    "Actual preview URL verification remains a human browser review.",
    "Issues remain in-memory/manual until a later guarded persistence step."
  ];
}

export function getManualPreviewPostDeploymentQaCompletionPercentage(): number {
  const checklist = getManualPreviewPostDeploymentQaAuditChecklist();
  const required = checklist.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);

  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runManualPreviewPostDeploymentQaAudit(): TeoyubeManualPreviewPostDeploymentQaAuditReport {
  const checklist = getManualPreviewPostDeploymentQaAuditChecklist();
  const missingItems = getManualPreviewPostDeploymentQaMissingItems();
  const completionPercentage = getManualPreviewPostDeploymentQaCompletionPercentage();

  return {
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getManualPreviewPostDeploymentQaWarnings(),
    nextStep: "Manual Preview Deployment Execution 2.3 - Preview Issue Triage & Fix Plan",
    generatedAt: new Date().toISOString()
  };
}
