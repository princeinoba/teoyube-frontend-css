import { createLaunchQualityGateReport } from "../launch-quality-gates";
import { createPreviewDeploymentCommandGuideReport } from "../preview-deployment-command-guide";
import { runPreviewDeploymentReadinessAudit } from "../preview-deployment-readiness-audit";
import { createPreviewDeploymentReadinessReport } from "../preview-deployment-readiness";
import { createPreviewEnvironmentPackage } from "../preview-environment-package";
import { createPreviewReleaseNotes } from "../preview-release-notes";
import { createPreviewManualReviewReport } from "../preview-rollback-manual-review";
import { createPreviewSurfaceLaunchReport } from "../preview-surface-launch-report";
import { createSoftLaunchCandidatePlan } from "../soft-launch-candidate-planner";

export type ProductionLaunchPreviewSoftLaunchSmokeCheckResult = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: boolean;
  noExternalSystemsRequired: boolean;
  notes: string[];
  generatedAt: string;
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runProductionLaunchPreviewSoftLaunchSmokeCheck(): ProductionLaunchPreviewSoftLaunchSmokeCheckResult {
  const preview = createPreviewDeploymentReadinessReport();
  const previewPackage = createPreviewEnvironmentPackage();
  const softLaunch = createSoftLaunchCandidatePlan();
  const surfaces = createPreviewSurfaceLaunchReport();
  const notes = createPreviewReleaseNotes();
  const manualReview = createPreviewManualReviewReport();
  const commandGuide = createPreviewDeploymentCommandGuideReport(previewPackage.target);
  const audit = runPreviewDeploymentReadinessAudit();
  const gates = createLaunchQualityGateReport();
  const flags = previewPackage.featureFlags;

  const errors = clean([
    preview.ready ? "" : "Preview readiness report should be ready.",
    preview.checklistCount > 0 ? "" : "Preview readiness checklist should exist.",
    previewPackage.environmentVariablePlaceholders.every((entry) => entry.includes("<"))
      ? ""
      : "Preview environment package should contain placeholders only.",
    !flags.productionDatabasePersistenceEnabled ? "" : "Production persistence must remain disabled.",
    !flags.externalAnalyticsSendingEnabled ? "" : "External analytics sending must remain disabled.",
    !flags.liveAiOrchestrationEnabled ? "" : "Live AI orchestration must remain disabled.",
    !flags.rawTextStorageEnabled ? "" : "Raw text storage must remain disabled.",
    softLaunch.checklist.length > 0 ? "" : "Soft launch candidate plan should exist.",
    surfaces.surfaceCount >= 12 ? "" : "Preview surface launch report should cover required surfaces.",
    notes.knownLimitations.length > 0 && notes.safetyNotes.length > 0 ? "" : "Preview release notes should exist.",
    manualReview.checklistCount > 0 ? "" : "Rollback/manual review plan should exist.",
    commandGuide.commandCount > 0 && !commandGuide.deploymentCommandsExecuted ? "" : "Command guide must not execute deployment commands.",
    audit.complete && audit.completionPercentage === 100 ? "" : "Preview readiness audit should be complete.",
    gates.gates.some((entry) => entry.id === "preview_deployment_readiness_report_exists") ? "" : "Launch quality gates should include preview deployment checks."
  ]);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noExternalSystemsRequired: true,
    notes: [
      "No database, external APIs, analytics provider, service worker, localStorage, cookies, IndexedDB, or file writes are required.",
      "No provider CLI is installed or executed.",
      "Preview deployment remains a later manual execution step."
    ],
    generatedAt: new Date().toISOString()
  };
}

