import { createPreviewDeploymentCommandGuideReport } from "./preview-deployment-command-guide";
import { createPreviewDeploymentReadinessReport } from "./preview-deployment-readiness";
import { createPreviewEnvironmentPackageReport } from "./preview-environment-package";
import { createPreviewReleaseNotes } from "./preview-release-notes";
import { createPreviewManualReviewReport } from "./preview-rollback-manual-review";
import { createPreviewSurfaceLaunchReport } from "./preview-surface-launch-report";
import { createSoftLaunchCandidateReadinessReport } from "./soft-launch-candidate-planner";

export type TeoyubePreviewDeploymentReadinessAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePreviewDeploymentReadinessAuditItem {
  return {
    id,
    label,
    complete,
    details
  };
}

export function getPreviewDeploymentReadinessChecklist(): TeoyubePreviewDeploymentReadinessAuditItem[] {
  const preview = createPreviewDeploymentReadinessReport();
  const environment = createPreviewEnvironmentPackageReport();
  const softLaunch = createSoftLaunchCandidateReadinessReport();
  const surfaces = createPreviewSurfaceLaunchReport();
  const notes = createPreviewReleaseNotes();
  const manualReview = createPreviewManualReviewReport();
  const commandGuide = createPreviewDeploymentCommandGuideReport();

  return [
    item("preview_deployment_contracts", "Preview deployment contracts exist", true, "Preview deployment contracts are available."),
    item("preview_deployment_readiness", "Preview deployment readiness module exists", preview.ready, "Preview readiness report returns structured output."),
    item("preview_environment_package", "Preview environment package exists", environment.valid, "Preview environment package validates with placeholders only."),
    item("soft_launch_candidate_contracts", "Soft launch candidate contracts exist", true, "Soft launch candidate contracts are available."),
    item("soft_launch_candidate_planner", "Soft launch candidate planner exists", softLaunch.ready, "Soft launch candidate planner returns structured output."),
    item("preview_surface_launch_report", "Preview surface launch report exists", surfaces.surfaceCount >= 12, "Preview surface launch report covers launch-critical surfaces."),
    item("preview_release_notes", "Preview release notes exist", notes.knownLimitations.length > 0 && notes.safetyNotes.length > 0, "Preview release notes include limitations and safety notes."),
    item("rollback_manual_review_plan", "Rollback/manual review plan exists", manualReview.checklistCount > 0, "Rollback and manual review checklist is available."),
    item("preview_command_guide", "Preview deployment command guide exists", commandGuide.commandCount > 0 && !commandGuide.deploymentCommandsExecuted, "Command guide describes commands without executing deployment."),
    item("launch_1_5_smoke_check", "Production Launch Preparation 1.5 smoke check exists", true, "Preview/soft-launch smoke check is available."),
    item("launch_1_5_documentation", "Production Launch Preparation 1.5 documentation exists", true, "Preview deployment and soft launch candidate documentation is available.")
  ];
}

export function getPreviewDeploymentReadinessMissingItems(): string[] {
  return getPreviewDeploymentReadinessChecklist()
    .filter((entry) => !entry.complete)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getPreviewDeploymentReadinessWarnings(): string[] {
  return [
    "Preview deployment has not been executed yet.",
    "Manual mobile, accessibility, Scripture, fallback, consent, and privacy QA should be recorded before public sharing.",
    "Production persistence, external analytics, live AI, service workers, native mobile, and paid infrastructure remain disconnected."
  ];
}

export function getPreviewDeploymentReadinessPercentage(): number {
  const checklist = getPreviewDeploymentReadinessChecklist();
  const complete = checklist.filter((entry) => entry.complete).length;
  return Math.round((complete / Math.max(1, checklist.length)) * 100);
}

export function runPreviewDeploymentReadinessAudit() {
  const checklist = getPreviewDeploymentReadinessChecklist();
  const missingItems = getPreviewDeploymentReadinessMissingItems();
  const completionPercentage = getPreviewDeploymentReadinessPercentage();

  return {
    complete: missingItems.length === 0,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPreviewDeploymentReadinessWarnings(),
    nextStep: "Production Launch Preparation 1.9 - Final Launch Preparation Audit",
    generatedAt: new Date().toISOString()
  };
}
