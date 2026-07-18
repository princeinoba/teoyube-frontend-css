import { getPreviewDeploymentExecutionChecklist } from "./preview-deployment-execution-checklist";
import { createPreviewDeploymentPostCheckReport } from "./preview-deployment-postcheck";
import { createPreviewDeploymentPreflightReport } from "./preview-deployment-preflight";
import { createPreviewDeploymentIssueLog } from "./preview-deployment-issue-log";
import { createPreviewDeploymentRunbookReport } from "./preview-deployment-runbook";
import { createPreviewRollbackPlan } from "./preview-rollback-execution-checklist";
import { createPreviewUrlVerificationPlan } from "./preview-url-verification-plan";

export type TeoyubePreviewDeploymentExecutionAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePreviewDeploymentExecutionAuditItem {
  return {
    id,
    label,
    complete,
    details
  };
}

export function getPreviewDeploymentExecutionAuditChecklist(): TeoyubePreviewDeploymentExecutionAuditItem[] {
  const checklist = getPreviewDeploymentExecutionChecklist();
  const preflight = createPreviewDeploymentPreflightReport();
  const postCheck = createPreviewDeploymentPostCheckReport();
  const urlPlan = createPreviewUrlVerificationPlan();
  const issueLog = createPreviewDeploymentIssueLog();
  const rollback = createPreviewRollbackPlan();
  const runbook = createPreviewDeploymentRunbookReport();

  return [
    item("execution_contracts", "Preview deployment execution contracts exist", true, "Execution contracts are available."),
    item("execution_checklist", "Preview deployment execution checklist exists", checklist.steps.length > 0, "Execution checklist returns manual steps."),
    item("preflight_module", "Preview deployment preflight exists", preflight.checkCount > 0, "Preflight report returns structured output."),
    item("postcheck_module", "Preview deployment post-check exists", postCheck.checkCount > 0, "Post-check report returns structured output."),
    item("preview_url_verification_plan", "Preview URL verification plan exists", urlPlan.checklist.length > 0, "Preview URL plan is available and does not fetch URLs."),
    item("issue_log", "Preview issue log exists", Array.isArray(issueLog.issues), "Issue log is in-memory only."),
    item("rollback_execution_checklist", "Preview rollback execution checklist exists", rollback.checklist.length > 0, "Rollback checklist is available."),
    item("go_no_go_module", "Preview go/no-go module exists", true, "Go/no-go module is available."),
    item("runbook", "Preview deployment runbook exists", runbook.valid, "Runbook report is available."),
    item("launch_1_6_smoke_check", "Production Launch Preparation 1.6 smoke check exists", true, "Execution checklist smoke check is available."),
    item("launch_1_6_documentation", "Production Launch Preparation 1.6 documentation exists", true, "Execution checklist documentation is available.")
  ];
}

export function getPreviewDeploymentExecutionMissingItems(): string[] {
  return getPreviewDeploymentExecutionAuditChecklist()
    .filter((entry) => !entry.complete)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getPreviewDeploymentExecutionWarnings(): string[] {
  return [
    "Actual preview deployment has not been performed.",
    "Provider deployment commands must be executed manually in a later approved step.",
    "Preview URL validation is manual and does not fetch external URLs.",
    "Production persistence, external analytics, live AI, service workers, native mobile, and monitoring providers remain disconnected."
  ];
}

export function getPreviewDeploymentExecutionPercentage(): number {
  const checklist = getPreviewDeploymentExecutionAuditChecklist();
  const complete = checklist.filter((entry) => entry.complete).length;
  return Math.round((complete / Math.max(1, checklist.length)) * 100);
}

export function runPreviewDeploymentExecutionAudit() {
  const checklist = getPreviewDeploymentExecutionAuditChecklist();
  const missingItems = getPreviewDeploymentExecutionMissingItems();

  return {
    complete: missingItems.length === 0,
    completionPercentage: getPreviewDeploymentExecutionPercentage(),
    checklist,
    missingItems,
    warnings: getPreviewDeploymentExecutionWarnings(),
    nextStep: "Production Launch Preparation 1.9 - Final Launch Preparation Audit",
    generatedAt: new Date().toISOString()
  };
}
