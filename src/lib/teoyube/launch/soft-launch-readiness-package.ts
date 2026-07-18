import { createPreviewRollbackPlan, createPreviewRollbackReport, type TeoyubePreviewRollbackState } from "./preview-rollback-execution-checklist";
import { createPreviewDeploymentIssueLog, type TeoyubePreviewDeploymentIssueLog } from "./preview-deployment-issue-log";
import { createPreviewDeploymentReviewReport } from "./preview-deployment-review";
import { createPreviewIssueTriageReport } from "./preview-issue-triage";
import { createDefaultPreviewQaReviewRun, createPreviewQaResultReport, type TeoyubePreviewQaReviewRun } from "./preview-qa-result-collector";
import { createPreviewReleaseNotes } from "./preview-release-notes";
import { createPreviewSafetyReviewReport, type TeoyubePreviewSafetyReviewInput } from "./preview-safety-review";
import { createSoftLaunchGoNoGoReport, type TeoyubeSoftLaunchGoNoGoInput } from "./soft-launch-go-no-go";
import { createSoftLaunchManualApprovalRecord, createSoftLaunchManualApprovalReport, type TeoyubeSoftLaunchManualApprovalInput } from "./soft-launch-manual-approval";
import { createSoftLaunchScopeConfirmation, createSoftLaunchScopeReport, type TeoyubeSoftLaunchScopeConfirmation, type TeoyubeSoftLaunchScopeInput } from "./soft-launch-scope-confirmation";
import type { TeoyubePreviewDeploymentReviewInput } from "./preview-deployment-review-contracts";

export type TeoyubeSoftLaunchReadinessPackageInput = {
  review?: TeoyubePreviewDeploymentReviewInput;
  qaRun?: TeoyubePreviewQaReviewRun;
  safety?: TeoyubePreviewSafetyReviewInput;
  issueLog?: TeoyubePreviewDeploymentIssueLog;
  scope?: TeoyubeSoftLaunchScopeConfirmation | TeoyubeSoftLaunchScopeInput;
  manualApproval?: TeoyubeSoftLaunchManualApprovalInput;
  rollback?: TeoyubePreviewRollbackState;
  goNoGo?: TeoyubeSoftLaunchGoNoGoInput;
};

export type TeoyubeSoftLaunchReadinessPackage = {
  id: string;
  previewDeploymentReview: ReturnType<typeof createPreviewDeploymentReviewReport>;
  previewQaResult: ReturnType<typeof createPreviewQaResultReport>;
  previewSafetyReview: ReturnType<typeof createPreviewSafetyReviewReport>;
  previewIssueTriage: ReturnType<typeof createPreviewIssueTriageReport>;
  softLaunchScope: ReturnType<typeof createSoftLaunchScopeReport>;
  manualApproval: ReturnType<typeof createSoftLaunchManualApprovalReport>;
  rollbackPlan: ReturnType<typeof createPreviewRollbackPlan>;
  rollbackReport: ReturnType<typeof createPreviewRollbackReport>;
  releaseNotes: ReturnType<typeof createPreviewReleaseNotes>;
  goNoGoDecision: ReturnType<typeof createSoftLaunchGoNoGoReport>;
  sentExternally: false;
  storedExternally: false;
  generatedAt: string;
};

function toScopeConfirmation(
  scope: TeoyubeSoftLaunchScopeConfirmation | TeoyubeSoftLaunchScopeInput | undefined
): TeoyubeSoftLaunchScopeConfirmation {
  return scope && "generatedAt" in scope
    ? scope
    : createSoftLaunchScopeConfirmation(scope || {});
}

export function createSoftLaunchReadinessPackage(
  input: TeoyubeSoftLaunchReadinessPackageInput = {}
): TeoyubeSoftLaunchReadinessPackage {
  const issueLog = input.issueLog || createPreviewDeploymentIssueLog();
  const manualApprovalRecord = createSoftLaunchManualApprovalRecord(input.manualApproval);
  const scope = toScopeConfirmation(input.scope);

  return {
    id: "soft_launch_readiness_package_1_7",
    previewDeploymentReview: createPreviewDeploymentReviewReport(input.review),
    previewQaResult: createPreviewQaResultReport(input.qaRun || createDefaultPreviewQaReviewRun()),
    previewSafetyReview: createPreviewSafetyReviewReport(input.safety),
    previewIssueTriage: createPreviewIssueTriageReport(issueLog),
    softLaunchScope: createSoftLaunchScopeReport(scope),
    manualApproval: createSoftLaunchManualApprovalReport(manualApprovalRecord),
    rollbackPlan: createPreviewRollbackPlan(),
    rollbackReport: createPreviewRollbackReport(input.rollback),
    releaseNotes: createPreviewReleaseNotes(),
    goNoGoDecision: createSoftLaunchGoNoGoReport({
      review: input.review,
      qaRun: input.qaRun,
      safety: input.safety,
      issueLog,
      rollback: input.rollback,
      manualApproval: input.manualApproval,
      ...input.goNoGo
    }),
    sentExternally: false,
    storedExternally: false,
    generatedAt: new Date().toISOString()
  };
}

export function getSoftLaunchReadinessPackageBlockers(
  readinessPackage: TeoyubeSoftLaunchReadinessPackage
): string[] {
  return [
    readinessPackage.previewDeploymentReview.blockerCount > 0
      ? "Preview deployment review has launch-critical blockers."
      : "",
    readinessPackage.previewQaResult.blockerCount > 0
      ? "Preview QA has blocker results."
      : "",
    readinessPackage.previewSafetyReview.blockers.length > 0
      ? "Preview safety review has blockers."
      : "",
    readinessPackage.previewIssueTriage.criticalIssues.length > 0
      ? "Preview issue triage has critical issues."
      : "",
    readinessPackage.goNoGoDecision.decision === "no_go_blocked" ||
    readinessPackage.goNoGoDecision.decision === "needs_preview_fix" ||
    readinessPackage.goNoGoDecision.decision === "needs_qa_fix" ||
    readinessPackage.goNoGoDecision.decision === "needs_safety_fix"
      ? `Soft launch go/no-go decision is ${readinessPackage.goNoGoDecision.decision}.`
      : "",
    readinessPackage.sentExternally ? "Readiness package must not be sent externally by this module." : "",
    readinessPackage.storedExternally ? "Readiness package must not be stored externally by this module." : ""
  ].filter(Boolean);
}

export function getSoftLaunchReadinessPackageWarnings(
  readinessPackage: TeoyubeSoftLaunchReadinessPackage
): string[] {
  return [
    ...readinessPackage.previewDeploymentReview.findings.map((finding) => finding.message),
    ...readinessPackage.previewQaResult.warnings.map((warning) => `${warning.surface}: ${warning.notes}`),
    ...readinessPackage.previewSafetyReview.warnings,
    ...readinessPackage.softLaunchScope.warnings,
    ...readinessPackage.manualApproval.warnings,
    ...readinessPackage.goNoGoDecision.warnings.map((warning) => warning.message),
    ...readinessPackage.releaseNotes.knownLimitations
  ].filter(Boolean);
}

export function validateSoftLaunchReadinessPackage(readinessPackage: TeoyubeSoftLaunchReadinessPackage) {
  const blockers = getSoftLaunchReadinessPackageBlockers(readinessPackage);
  const warnings = getSoftLaunchReadinessPackageWarnings(readinessPackage);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createSoftLaunchReadinessPackageReport(
  readinessPackage: TeoyubeSoftLaunchReadinessPackage = createSoftLaunchReadinessPackage()
) {
  const validation = validateSoftLaunchReadinessPackage(readinessPackage);

  return {
    ...validation,
    readinessPackage,
    status: validation.blockers.length ? "blocked" : validation.warnings.length ? "ready_with_warnings" : "ready",
    goNoGoDecision: readinessPackage.goNoGoDecision.decision,
    externalWritePerformed: false,
    generatedAt: new Date().toISOString()
  };
}
