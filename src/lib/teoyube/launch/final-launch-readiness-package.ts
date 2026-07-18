import type {
  TeoyubeFinalLaunchDecision,
  TeoyubeFinalLaunchReadinessPackage
} from "./final-launch-preparation-contracts";
import { createFinalLaunchBlockerRegister, createFinalLaunchBlockerReport, type TeoyubeFinalLaunchBlockerRegister } from "./final-launch-blocker-register";
import { runFinalLaunchPreparationAudit } from "./final-launch-preparation-audit";
import { createFinalLaunchQualityGateReport } from "./final-launch-quality-gate-report";
import { createFinalLaunchSafetyCertificationReport } from "./final-launch-safety-certification";
import { createFinalLaunchSurfaceCertificationReport } from "./final-launch-surface-certification";
import { createLaunchQaReadinessReport } from "./launch-qa-checklist";
import { createLaunchSafetyReviewReport } from "./launch-safety-review";
import { createPredeploymentSafetyGateReport } from "./predeployment-safety-gates";
import { runPreviewDeploymentExecutionAudit } from "./preview-deployment-execution-audit";
import { runPreviewDeploymentReadinessAudit } from "./preview-deployment-readiness-audit";
import { runPreviewReviewSoftLaunchAudit } from "./preview-review-soft-launch-audit";
import { runProductionLaunchReadinessAudit } from "./production-launch-readiness-audit";
import { createReleaseCandidateReport } from "./release-candidate-report";
import { runSoftLaunchRunbookAudit } from "./soft-launch-runbook-audit";

export type TeoyubeFinalLaunchReadinessPackageInput = {
  blockerRegister?: TeoyubeFinalLaunchBlockerRegister;
};

function packageDecision(params: {
  auditReady: boolean;
  safetyReady: boolean;
  qualityReady: boolean;
  surfacesReady: boolean;
  criticalBlockerCount: number;
}): TeoyubeFinalLaunchDecision {
  if (params.criticalBlockerCount > 0) return "blocked";
  if (!params.safetyReady) return "needs_safety_fix";
  if (!params.surfacesReady || !params.qualityReady) return "needs_qa_fix";
  return params.auditReady ? "ready_for_manual_preview_deployment" : "ready_after_manual_review";
}

export function createFinalLaunchReadinessPackage(
  input: TeoyubeFinalLaunchReadinessPackageInput = {}
): TeoyubeFinalLaunchReadinessPackage {
  const audit = runFinalLaunchPreparationAudit();
  const safetyCertification = createFinalLaunchSafetyCertificationReport();
  const qualityGateReport = createFinalLaunchQualityGateReport();
  const surfaceCertification = createFinalLaunchSurfaceCertificationReport();
  const launchReadinessAudit = runProductionLaunchReadinessAudit();
  const launchQaReport = createLaunchQaReadinessReport();
  const launchSafetyReview = createLaunchSafetyReviewReport();
  const releaseCandidateReport = createReleaseCandidateReport();
  const predeploymentSafetyGates = createPredeploymentSafetyGateReport();
  const previewDeploymentReadinessAudit = runPreviewDeploymentReadinessAudit();
  const previewExecutionAudit = runPreviewDeploymentExecutionAudit();
  const previewReviewSoftLaunchAudit = runPreviewReviewSoftLaunchAudit();
  const softLaunchRunbookAudit = runSoftLaunchRunbookAudit();
  const blockerRegister = input.blockerRegister || createFinalLaunchBlockerRegister();
  const blockerReport = createFinalLaunchBlockerReport(blockerRegister);
  const decision = packageDecision({
    auditReady: audit.ready,
    safetyReady: safetyCertification.valid && launchSafetyReview.valid,
    qualityReady: qualityGateReport.ready && launchQaReport.valid,
    surfacesReady: surfaceCertification.ready,
    criticalBlockerCount: blockerReport.summary.criticalCount
  });
  const blockers = [
    ...audit.blockers,
    ...qualityGateReport.blockers.map((gate) => ({
      id: gate.id,
      label: gate.label,
      category: gate.category,
      riskLevel: "high" as const,
      reason: gate.details,
      requiredAction: gate.nextAction || "Resolve this final launch quality gate."
    })),
    ...blockerRegister.blockers.filter((blocker) => !blocker.resolved)
  ];
  const warnings = [
    ...audit.warnings,
    ...safetyCertification.warnings,
    ...qualityGateReport.warnings,
    ...surfaceCertification.warnings
  ];

  return {
    id: `final_launch_readiness_package_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: blockers.length ? "ready_with_warnings" : "ready",
    ready: decision === "ready_for_manual_preview_deployment",
    decision,
    audit,
    safetyCertification,
    qualityGateReport,
    surfaceCertification,
    launchReadinessAudit,
    launchQaReport,
    launchSafetyReview,
    releaseCandidateReport,
    predeploymentSafetyGates,
    previewDeploymentReadinessAudit,
    previewExecutionAudit,
    previewReviewSoftLaunchAudit,
    softLaunchRunbookAudit,
    blockerRegister,
    nextAction: decision === "ready_for_manual_preview_deployment" ? "manual_preview_deployment_execution" : "owner_review",
    blockers,
    warnings,
    sentExternally: false,
    filesWritten: false,
    deploymentPerformed: false,
    generatedAt: new Date().toISOString()
  };
}

export function getFinalLaunchReadinessPackageBlockers(
  readinessPackage: TeoyubeFinalLaunchReadinessPackage
) {
  return readinessPackage.blockers;
}

export function getFinalLaunchReadinessPackageWarnings(
  readinessPackage: TeoyubeFinalLaunchReadinessPackage
) {
  return readinessPackage.warnings;
}

export function createFinalLaunchReadinessPackageDecision(
  readinessPackage: TeoyubeFinalLaunchReadinessPackage
): TeoyubeFinalLaunchDecision {
  return readinessPackage.decision;
}

export function validateFinalLaunchReadinessPackage(
  readinessPackage: TeoyubeFinalLaunchReadinessPackage
): boolean {
  return readinessPackage.ready &&
    readinessPackage.sentExternally === false &&
    readinessPackage.filesWritten === false &&
    readinessPackage.deploymentPerformed === false;
}

export function createFinalLaunchReadinessPackageReport(
  readinessPackage: TeoyubeFinalLaunchReadinessPackage
) {
  return {
    valid: validateFinalLaunchReadinessPackage(readinessPackage),
    status: readinessPackage.status,
    decision: readinessPackage.decision,
    ready: readinessPackage.ready,
    blockerCount: readinessPackage.blockers.length,
    warningCount: readinessPackage.warnings.length,
    nextAction: readinessPackage.nextAction,
    sentExternally: readinessPackage.sentExternally,
    filesWritten: readinessPackage.filesWritten,
    deploymentPerformed: readinessPackage.deploymentPerformed,
    generatedAt: new Date().toISOString()
  };
}
