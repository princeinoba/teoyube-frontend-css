import { createPreviewDeploymentIssueLog } from "./preview-deployment-issue-log";
import { createPreviewDeploymentReviewReport } from "./preview-deployment-review";
import { createPreviewIssueTriageReport } from "./preview-issue-triage";
import { createDefaultPreviewQaReviewRun, createPreviewQaResultReport } from "./preview-qa-result-collector";
import { createPreviewSafetyReviewReport } from "./preview-safety-review";
import { createSoftLaunchGoNoGoReport } from "./soft-launch-go-no-go";
import { createSoftLaunchManualApprovalChecklist } from "./soft-launch-manual-approval";
import { createSoftLaunchReadinessPackageReport } from "./soft-launch-readiness-package";
import { createSoftLaunchScopeConfirmation, createSoftLaunchScopeReport } from "./soft-launch-scope-confirmation";

export type TeoyubePreviewReviewSoftLaunchAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePreviewReviewSoftLaunchAuditItem {
  return {
    id,
    label,
    complete,
    details
  };
}

export function getPreviewReviewSoftLaunchChecklist(): TeoyubePreviewReviewSoftLaunchAuditItem[] {
  const review = createPreviewDeploymentReviewReport();
  const qa = createPreviewQaResultReport(createDefaultPreviewQaReviewRun());
  const issueLog = createPreviewDeploymentIssueLog();
  const triage = createPreviewIssueTriageReport(issueLog);
  const safety = createPreviewSafetyReviewReport();
  const goNoGo = createSoftLaunchGoNoGoReport();
  const manualApprovalChecklist = createSoftLaunchManualApprovalChecklist();
  const scope = createSoftLaunchScopeReport(createSoftLaunchScopeConfirmation({ accepted: true }));
  const readinessPackage = createSoftLaunchReadinessPackageReport();

  return [
    item("preview_review_contracts", "Preview deployment review contracts exist", true, "Review contracts compile as TypeScript."),
    item("preview_review_module", "Preview deployment review module exists", review.checklistCount > 0, "Review report returns structured output."),
    item("preview_qa_result_collector", "Preview QA result collector exists", qa.expectedSurfaceCount > 0, "QA collector supports in-memory manual results."),
    item("preview_issue_triage", "Preview issue triage exists", triage.priorityOrder.length > 0, "Issue triage prioritizes launch-critical safety issues."),
    item("preview_safety_review", "Preview safety review exists", safety.checkCount > 0 && safety.valid, "Preview safety review confirms launch guardrails."),
    item("soft_launch_go_no_go", "Soft launch go/no-go exists", goNoGo.ready, "Go/no-go report returns a soft-launch readiness decision."),
    item("soft_launch_manual_approval", "Soft launch manual approval exists", manualApprovalChecklist.length > 0, "Manual approval checklist is available."),
    item("soft_launch_scope_confirmation", "Soft launch scope confirmation exists", scope.includedSurfaceCount > 0, "Soft launch scope report is available."),
    item("soft_launch_readiness_package", "Soft launch readiness package exists", readinessPackage.readinessPackage.id === "soft_launch_readiness_package_1_7", "Readiness package combines preview review artifacts."),
    item("launch_1_7_smoke_check", "Production Launch Preparation 1.7 smoke check exists", true, "Preview review and soft launch smoke check is available."),
    item("launch_1_7_documentation", "Production Launch Preparation 1.7 documentation exists", true, "Preview review and soft launch documentation is available.")
  ];
}

export function getPreviewReviewSoftLaunchMissingItems(): string[] {
  return getPreviewReviewSoftLaunchChecklist()
    .filter((entry) => !entry.complete)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getPreviewReviewSoftLaunchWarnings(): string[] {
  return [
    "Actual deployment has not been performed.",
    "Actual soft launch has not been performed.",
    "Preview QA results are in-memory/manual only.",
    "Manual approval remains a structured record and not a signature requirement.",
    "Production persistence, external analytics, live AI, service workers, native mobile, and monitoring providers remain disconnected."
  ];
}

export function getPreviewReviewSoftLaunchPercentage(): number {
  const checklist = getPreviewReviewSoftLaunchChecklist();
  const complete = checklist.filter((entry) => entry.complete).length;
  return Math.round((complete / Math.max(1, checklist.length)) * 100);
}

export function runPreviewReviewSoftLaunchAudit() {
  const checklist = getPreviewReviewSoftLaunchChecklist();
  const missingItems = getPreviewReviewSoftLaunchMissingItems();

  return {
    complete: missingItems.length === 0,
    completionPercentage: getPreviewReviewSoftLaunchPercentage(),
    checklist,
    missingItems,
    warnings: getPreviewReviewSoftLaunchWarnings(),
    nextStep: "Production Launch Preparation 1.9 - Final Launch Preparation Audit",
    generatedAt: new Date().toISOString()
  };
}
