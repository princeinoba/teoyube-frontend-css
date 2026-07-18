import { createFinalLaunchSafetyCertificationReport } from "./final-launch-safety-certification";
import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import type { TeoyubeManualPreviewPostFixSafetyReport } from "./manual-preview-post-fix-safety-verification";
import type { TeoyubeManualPreviewPostFixSurfaceRegressionReport } from "./manual-preview-post-fix-surface-regression";
import type { TeoyubeResolvedIssueRecheckReport } from "./manual-preview-resolved-issue-recheck";
import type { TeoyubeManualPreviewRecheckReport, TeoyubeSoftLaunchCandidateConfirmationReport } from "./manual-preview-recheck-contracts";
import type { TeoyubeManualPreviewRegressionReport } from "./manual-preview-regression-verification-contracts";
import { createPreviewRollbackPlan } from "./preview-rollback-execution-checklist";
import { createSoftLaunchCandidateReleaseNotes } from "./soft-launch-candidate-release-notes";
import { createSoftLaunchRunbookReport } from "./soft-launch-runbook";
import { createSoftLaunchScopeConfirmation } from "./soft-launch-scope-confirmation";

export type TeoyubeSoftLaunchCandidatePackage = {
  id: string;
  label: string;
  confirmationReport: TeoyubeSoftLaunchCandidateConfirmationReport;
  previewRecheckReport?: TeoyubeManualPreviewRecheckReport;
  resolvedIssueRecheckReport?: TeoyubeResolvedIssueRecheckReport;
  regressionVerificationReport?: TeoyubeManualPreviewRegressionReport;
  postFixSafetyReport?: TeoyubeManualPreviewPostFixSafetyReport;
  postFixSurfaceRegressionReport?: TeoyubeManualPreviewPostFixSurfaceRegressionReport;
  finalSafetyCertificationReference: ReturnType<typeof createFinalLaunchSafetyCertificationReport>;
  surfaceReadinessReference: ReturnType<typeof createLaunchSurfaceReadinessReport>;
  softLaunchScope: ReturnType<typeof createSoftLaunchScopeConfirmation>;
  runbookReference: ReturnType<typeof createSoftLaunchRunbookReport>;
  feedbackIntakePlanReference: ReturnType<typeof createSoftLaunchCandidateReleaseNotes>["feedbackInstructions"];
  rollbackCriteria: ReturnType<typeof createPreviewRollbackPlan>["checklist"];
  knownLimitations: string[];
  ownerReviewNotes: string[];
  nextRecommendedAction: string;
  inMemoryOnly: true;
  externallySent: false;
  fileWritten: false;
  generatedAt: string;
};

export type TeoyubeSoftLaunchCandidatePackageInput = {
  confirmationReport: TeoyubeSoftLaunchCandidateConfirmationReport;
  previewRecheckReport?: TeoyubeManualPreviewRecheckReport;
  resolvedIssueRecheckReport?: TeoyubeResolvedIssueRecheckReport;
  regressionVerificationReport?: TeoyubeManualPreviewRegressionReport;
  postFixSafetyReport?: TeoyubeManualPreviewPostFixSafetyReport;
  postFixSurfaceRegressionReport?: TeoyubeManualPreviewPostFixSurfaceRegressionReport;
  ownerReviewNotes?: string[];
};

export function createSoftLaunchCandidatePackage(input: TeoyubeSoftLaunchCandidatePackageInput): TeoyubeSoftLaunchCandidatePackage {
  const releaseNotes = createSoftLaunchCandidateReleaseNotes();

  return {
    id: "soft_launch_candidate_package",
    label: "Teoyube Soft Launch Candidate Package",
    confirmationReport: input.confirmationReport,
    previewRecheckReport: input.previewRecheckReport,
    resolvedIssueRecheckReport: input.resolvedIssueRecheckReport,
    regressionVerificationReport: input.regressionVerificationReport,
    postFixSafetyReport: input.postFixSafetyReport,
    postFixSurfaceRegressionReport: input.postFixSurfaceRegressionReport,
    finalSafetyCertificationReference: createFinalLaunchSafetyCertificationReport(),
    surfaceReadinessReference: createLaunchSurfaceReadinessReport(),
    softLaunchScope: createSoftLaunchScopeConfirmation({ accepted: true }),
    runbookReference: createSoftLaunchRunbookReport(),
    feedbackIntakePlanReference: releaseNotes.feedbackInstructions,
    rollbackCriteria: createPreviewRollbackPlan().checklist,
    knownLimitations: releaseNotes.knownLimitations,
    ownerReviewNotes: input.ownerReviewNotes || ["Owner review remains required before contacting real users."],
    nextRecommendedAction: "Soft Launch Preparation 3.3 - Final Soft Launch Readiness Package & Go/No-Go",
    inMemoryOnly: true,
    externallySent: false,
    fileWritten: false,
    generatedAt: new Date().toISOString()
  };
}

export function getSoftLaunchCandidatePackageBlockers(candidatePackage: TeoyubeSoftLaunchCandidatePackage): string[] {
  return [
    candidatePackage.confirmationReport.ready ? "" : "Soft launch candidate confirmation report is not ready.",
    candidatePackage.finalSafetyCertificationReference.valid ? "" : "Final safety certification is not valid.",
    candidatePackage.surfaceReadinessReference.blockers.length === 0 ? "" : "Surface readiness has blockers.",
    candidatePackage.softLaunchScope.accepted ? "" : "Soft launch scope is not accepted.",
    candidatePackage.runbookReference.ready ? "" : "Soft launch runbook is not ready.",
    candidatePackage.rollbackCriteria.length > 0 ? "" : "Rollback criteria are missing.",
    candidatePackage.externallySent ? "Candidate package must not be sent externally by code." : "",
    candidatePackage.fileWritten ? "Candidate package must not be written to files by code." : ""
  ].filter(Boolean);
}

export function getSoftLaunchCandidatePackageWarnings(candidatePackage: TeoyubeSoftLaunchCandidatePackage): string[] {
  return [
    candidatePackage.knownLimitations.length === 0 ? "Known limitations should be listed." : "",
    candidatePackage.ownerReviewNotes.length === 0 ? "Owner review notes should be included." : "",
    "This package is in-memory only and does not perform a soft launch."
  ].filter(Boolean);
}

export function validateSoftLaunchCandidatePackage(candidatePackage: TeoyubeSoftLaunchCandidatePackage) {
  const blockers = getSoftLaunchCandidatePackageBlockers(candidatePackage);
  const warnings = getSoftLaunchCandidatePackageWarnings(candidatePackage);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createSoftLaunchCandidatePackageDecision(candidatePackage: TeoyubeSoftLaunchCandidatePackage) {
  const validation = validateSoftLaunchCandidatePackage(candidatePackage);

  if (validation.blockers.length > 0) return "blocked";
  if (validation.warnings.length > 0) return "ready_with_warnings";
  return "ready";
}

export function createSoftLaunchCandidatePackageReport(candidatePackage: TeoyubeSoftLaunchCandidatePackage) {
  const validation = validateSoftLaunchCandidatePackage(candidatePackage);

  return {
    valid: validation.valid,
    decision: createSoftLaunchCandidatePackageDecision(candidatePackage),
    blockerCount: validation.blockers.length,
    warningCount: validation.warnings.length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    candidatePackage,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
