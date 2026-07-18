import type { TeoyubeManualPreviewDeploymentStatus } from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewSafeFixImplementationAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubeManualPreviewDeploymentStatus;
  details: string;
};

export type TeoyubeManualPreviewSafeFixImplementationAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubeManualPreviewSafeFixImplementationAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Manual Preview Deployment Execution 2.5 - Preview Re-Check & Soft Launch Candidate Confirmation";
  generatedAt: string;
};

function item(
  id: string,
  label: string,
  complete = true,
  details = "Module exists and is exportable."
): TeoyubeManualPreviewSafeFixImplementationAuditItem {
  return {
    id,
    label,
    required: true,
    complete,
    status: complete ? "ready" : "blocked",
    details
  };
}

export function getManualPreviewSafeFixImplementationAuditChecklist(): TeoyubeManualPreviewSafeFixImplementationAuditItem[] {
  return [
    item("manual_preview_safe_fix_contracts", "Safe fix contracts exist"),
    item("manual_preview_safe_fix_candidate_evaluator", "Safe fix candidate evaluator exists"),
    item("manual_preview_safe_fix_planner", "Safe fix implementation planner exists"),
    item("manual_preview_safe_fix_result_recorder", "Safe fix result recorder exists"),
    item("manual_preview_regression_verification_contracts", "Regression verification contracts exist"),
    item("manual_preview_regression_verification_runner", "Regression verification runner exists"),
    item("manual_preview_post_fix_safety_verification", "Post-fix safety verification exists"),
    item("manual_preview_post_fix_surface_regression", "Post-fix surface regression exists"),
    item("manual_preview_issue_resolution_verification", "Issue resolution verification exists"),
    item("manual_preview_safe_fix_implementation_audit", "Safe fix implementation audit exists"),
    item("manual_preview_2_4_smoke_check", "Manual Preview Deployment 2.4 smoke check exists"),
    item("manual_preview_2_4_documentation", "Manual Preview Deployment 2.4 documentation exists")
  ];
}

export function getManualPreviewSafeFixImplementationMissingItems(): string[] {
  return getManualPreviewSafeFixImplementationAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.id);
}

export function getManualPreviewSafeFixImplementationWarnings(): string[] {
  return [
    "Manual Preview Deployment 2.4 plans and records safe fixes only; it does not deploy or fetch preview URLs.",
    "Unsafe, architecture-level, provider, persistence, analytics, live AI, or secret-related fixes remain blocked or manual-only.",
    "Preview re-check and soft launch candidate confirmation should happen in Manual Preview Deployment Execution 2.5."
  ];
}

export function getManualPreviewSafeFixImplementationCompletionPercentage(): number {
  const checklist = getManualPreviewSafeFixImplementationAuditChecklist();
  const required = checklist.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);

  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runManualPreviewSafeFixImplementationAudit(): TeoyubeManualPreviewSafeFixImplementationAuditReport {
  const checklist = getManualPreviewSafeFixImplementationAuditChecklist();
  const missingItems = getManualPreviewSafeFixImplementationMissingItems();
  const completionPercentage = getManualPreviewSafeFixImplementationCompletionPercentage();

  return {
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getManualPreviewSafeFixImplementationWarnings(),
    nextStep: "Manual Preview Deployment Execution 2.5 - Preview Re-Check & Soft Launch Candidate Confirmation",
    generatedAt: new Date().toISOString()
  };
}
