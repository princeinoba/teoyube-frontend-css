import type { TeoyubeManualPreviewDeploymentStatus } from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewIssueTriageAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubeManualPreviewDeploymentStatus;
  details: string;
};

export type TeoyubeManualPreviewIssueTriageAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubeManualPreviewIssueTriageAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Manual Preview Deployment Execution 2.4 - Safe Fix Implementation & Regression Verification";
  generatedAt: string;
};

function item(id: string, label: string, complete = true): TeoyubeManualPreviewIssueTriageAuditItem {
  return {
    id,
    label,
    required: true,
    complete,
    status: complete ? "ready" : "blocked",
    details: complete ? "Module exists and is exportable." : "Required module is missing."
  };
}

export function getManualPreviewIssueTriageAuditChecklist(): TeoyubeManualPreviewIssueTriageAuditItem[] {
  return [
    item("manual_preview_issue_triage_contracts", "Issue triage contracts exist"),
    item("manual_preview_issue_classifier", "Issue classifier exists"),
    item("manual_preview_issue_triage_engine", "Issue triage engine exists"),
    item("manual_preview_fix_plan_generator", "Fix plan generator exists"),
    item("manual_preview_fix_plan_safety", "Fix plan safety validator exists"),
    item("manual_preview_regression_check_mapper", "Regression check mapper exists"),
    item("manual_preview_issue_resolution_tracker", "Issue resolution tracker exists"),
    item("manual_preview_fix_implementation_readiness", "Fix implementation readiness exists"),
    item("manual_preview_issue_owner_review", "Issue owner review module exists"),
    item("manual_preview_2_3_smoke_check", "Manual Preview Deployment 2.3 smoke check exists"),
    item("manual_preview_2_3_documentation", "Manual Preview Deployment 2.3 documentation exists")
  ];
}

export function getManualPreviewIssueTriageMissingItems(): string[] {
  return getManualPreviewIssueTriageAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.id);
}

export function getManualPreviewIssueTriageWarnings(): string[] {
  return [
    "Manual Preview Deployment 2.3 creates triage and fix-plan structures only; it does not apply production fixes.",
    "Preview issue resolution remains in-memory/manual until a later guarded persistence step.",
    "Safe fix implementation should happen in Manual Preview Deployment Execution 2.4 after owner review."
  ];
}

export function getManualPreviewIssueTriageCompletionPercentage(): number {
  const checklist = getManualPreviewIssueTriageAuditChecklist();
  const required = checklist.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);

  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runManualPreviewIssueTriageAudit(): TeoyubeManualPreviewIssueTriageAuditReport {
  const checklist = getManualPreviewIssueTriageAuditChecklist();
  const missingItems = getManualPreviewIssueTriageMissingItems();
  const completionPercentage = getManualPreviewIssueTriageCompletionPercentage();

  return {
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getManualPreviewIssueTriageWarnings(),
    nextStep: "Manual Preview Deployment Execution 2.4 - Safe Fix Implementation & Regression Verification",
    generatedAt: new Date().toISOString()
  };
}
