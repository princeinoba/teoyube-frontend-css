import { createLaunchDecision } from "../launch-decision-helper";
import { runProductionLaunchReadinessAudit } from "../production-launch-readiness-audit";
import { createPreviewDeploymentCommandGuideReport } from "../preview-deployment-command-guide";
import { runPreviewDeploymentReadinessAudit } from "../preview-deployment-readiness-audit";
import { createPreviewDeploymentReadinessReport } from "../preview-deployment-readiness";
import { createPreviewEnvironmentPackage, createPreviewEnvironmentPackageReport } from "../preview-environment-package";
import { createPreviewReleaseNotes } from "../preview-release-notes";
import { createPreviewManualReviewReport, getPreviewRollbackPlan } from "../preview-rollback-manual-review";
import { createPreviewSurfaceLaunchReport } from "../preview-surface-launch-report";
import { createSoftLaunchCandidatePlan, createSoftLaunchCandidateReadinessReport } from "../soft-launch-candidate-planner";

export function runProductionLaunchPreviewSoftLaunchExample() {
  const previewEnvironmentPackage = createPreviewEnvironmentPackage();
  const previewEnvironmentReport = createPreviewEnvironmentPackageReport(previewEnvironmentPackage);
  const previewReadiness = createPreviewDeploymentReadinessReport();
  const softLaunchCandidate = createSoftLaunchCandidatePlan();
  const softLaunchReadiness = createSoftLaunchCandidateReadinessReport();
  const previewSurfaces = createPreviewSurfaceLaunchReport();
  const releaseNotes = createPreviewReleaseNotes();
  const manualReview = createPreviewManualReviewReport();
  const rollbackPlan = getPreviewRollbackPlan();
  const commandGuide = createPreviewDeploymentCommandGuideReport(previewEnvironmentPackage.target);
  const previewAudit = runPreviewDeploymentReadinessAudit();
  const launchAudit = runProductionLaunchReadinessAudit();
  const launchDecision = createLaunchDecision(launchAudit);

  return {
    previewEnvironmentPackage,
    previewEnvironmentReport,
    previewReadiness,
    softLaunchCandidate,
    softLaunchReadiness,
    previewSurfaces,
    releaseNotes,
    manualReview,
    rollbackPlan,
    commandGuide,
    previewAudit,
    launchDecision,
    generatedAt: new Date().toISOString()
  };
}

