import { createFinalLaunchSafetyCertificationReport } from "./final-launch-safety-certification";
import type { TeoyubeManualPreviewPostFixSafetyReport } from "./manual-preview-post-fix-safety-verification";
import type { TeoyubeManualPreviewPostFixSurfaceRegressionReport } from "./manual-preview-post-fix-surface-regression";
import type { TeoyubeResolvedIssueRecheckReport } from "./manual-preview-resolved-issue-recheck";
import type {
  TeoyubeManualPreviewRecheckReport,
  TeoyubeSoftLaunchCandidateConfirmationDecision,
  TeoyubeSoftLaunchCandidateConfirmationReport,
  TeoyubeSoftLaunchCandidateConfirmationStatus
} from "./manual-preview-recheck-contracts";
import type { TeoyubeManualPreviewRegressionReport } from "./manual-preview-regression-verification-contracts";
import { createSoftLaunchCandidateCriteriaReport, type TeoyubeSoftLaunchCandidateCriteriaReport } from "./soft-launch-candidate-criteria";
import { createSoftLaunchFeedbackIntakeReport, createSoftLaunchFeedbackLog } from "./soft-launch-feedback-intake";
import { createSoftLaunchManualApprovalRecord, createSoftLaunchManualApprovalReport } from "./soft-launch-manual-approval";
import { createSoftLaunchRunbookReport } from "./soft-launch-runbook";
import { createSoftLaunchScopeConfirmation, createSoftLaunchScopeReport } from "./soft-launch-scope-confirmation";

export type TeoyubeSoftLaunchCandidateConfirmationInput = {
  previewRecheckReport?: TeoyubeManualPreviewRecheckReport;
  resolvedIssueRecheckReport?: TeoyubeResolvedIssueRecheckReport;
  regressionVerificationReport?: TeoyubeManualPreviewRegressionReport;
  postFixSafetyReport?: TeoyubeManualPreviewPostFixSafetyReport;
  postFixSurfaceRegressionReport?: TeoyubeManualPreviewPostFixSurfaceRegressionReport;
  criteriaReport?: TeoyubeSoftLaunchCandidateCriteriaReport;
  ownerReviewAccepted?: boolean;
  manualApprovalAccepted?: boolean;
};

export function createSoftLaunchCandidateConfirmationChecklist() {
  return [
    "preview_recheck_report",
    "resolved_issue_recheck_report",
    "regression_verification_report",
    "post_fix_safety_report",
    "post_fix_surface_regression_report",
    "soft_launch_candidate_criteria_report",
    "soft_launch_scope_confirmation",
    "manual_approval_status",
    "soft_launch_runbook_audit",
    "feedback_intake_readiness"
  ].map((id) => ({
    id,
    label: id.replace(/_/g, " "),
    required: true
  }));
}

export function getSoftLaunchCandidateConfirmationBlockers(
  input: TeoyubeSoftLaunchCandidateConfirmationInput
): string[] {
  const scope = createSoftLaunchScopeReport(createSoftLaunchScopeConfirmation({ accepted: true }));
  const manualApproval = createSoftLaunchManualApprovalReport(createSoftLaunchManualApprovalRecord({
    approved: input.manualApprovalAccepted === true,
    completedItemIds: input.manualApprovalAccepted === true
      ? createSoftLaunchManualApprovalReport(createSoftLaunchManualApprovalRecord()).checklist.map((entry) => entry.id)
      : []
  }));
  const runbook = createSoftLaunchRunbookReport();
  const feedback = createSoftLaunchFeedbackIntakeReport(createSoftLaunchFeedbackLog());
  const finalSafety = createFinalLaunchSafetyCertificationReport();

  return [
    input.previewRecheckReport && input.previewRecheckReport.valid ? "" : "Preview re-check report is not valid.",
    input.resolvedIssueRecheckReport && input.resolvedIssueRecheckReport.valid ? "" : "Resolved issue re-check report is not valid.",
    input.regressionVerificationReport && input.regressionVerificationReport.valid ? "" : "Regression verification report is not valid.",
    input.postFixSafetyReport && input.postFixSafetyReport.valid ? "" : "Post-fix safety report is not valid.",
    input.postFixSurfaceRegressionReport && input.postFixSurfaceRegressionReport.valid ? "" : "Post-fix surface regression report is not valid.",
    (input.criteriaReport || createSoftLaunchCandidateCriteriaReport()).valid ? "" : "Soft launch candidate criteria are not met.",
    scope.valid ? "" : "Soft launch scope is not accepted.",
    manualApproval.valid ? "" : "Soft launch manual approval is not accepted.",
    runbook.ready ? "" : "Soft launch runbook is not ready.",
    feedback.valid ? "" : "Feedback intake readiness is not valid.",
    finalSafety.valid ? "" : "Final safety certification is not valid."
  ].filter(Boolean);
}

export function getSoftLaunchCandidateConfirmationWarnings(
  input: TeoyubeSoftLaunchCandidateConfirmationInput
): string[] {
  return [
    input.ownerReviewAccepted ? "" : "Owner review has not accepted the soft launch candidate decision.",
    input.previewRecheckReport?.warnings.length ? "Preview re-check has documented warnings." : "",
    input.resolvedIssueRecheckReport?.warnings.length ? "Resolved issue re-check has documented warnings." : "",
    input.criteriaReport?.warnings.length ? "Soft launch criteria have documented warnings." : "",
    "This module confirms candidate readiness only; it does not perform a soft launch."
  ].filter(Boolean);
}

export function createSoftLaunchCandidateConfirmationDecision(
  input: TeoyubeSoftLaunchCandidateConfirmationInput
): TeoyubeSoftLaunchCandidateConfirmationDecision {
  const blockers = getSoftLaunchCandidateConfirmationBlockers(input);
  const warnings = getSoftLaunchCandidateConfirmationWarnings(input);

  if (blockers.some((entry) => entry.toLowerCase().includes("preview re-check"))) return "needs_preview_recheck";
  if (blockers.some((entry) => entry.toLowerCase().includes("safety"))) return "needs_safety_review";
  if (blockers.some((entry) => entry.toLowerCase().includes("regression") || entry.toLowerCase().includes("criteria"))) return "needs_qa_review";
  if (blockers.length > 0) return "not_confirmed_blocked";
  if (warnings.length > 1 || !input.ownerReviewAccepted) return "confirmed_after_owner_review";
  return "confirmed_soft_launch_candidate";
}

export function createSoftLaunchCandidateConfirmationReport(
  input: TeoyubeSoftLaunchCandidateConfirmationInput
): TeoyubeSoftLaunchCandidateConfirmationReport {
  const blockers = getSoftLaunchCandidateConfirmationBlockers(input);
  const warnings = getSoftLaunchCandidateConfirmationWarnings(input);
  const decision = createSoftLaunchCandidateConfirmationDecision(input);
  const status: TeoyubeSoftLaunchCandidateConfirmationStatus =
    decision === "confirmed_soft_launch_candidate"
      ? "confirmed"
      : decision === "confirmed_after_owner_review"
        ? "confirmed_with_manual_review"
        : blockers.length > 0
          ? "blocked"
          : "needs_review";

  return {
    status,
    decision,
    ready: decision === "confirmed_soft_launch_candidate" || decision === "confirmed_after_owner_review",
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    noSoftLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function confirmSoftLaunchCandidate(
  input: TeoyubeSoftLaunchCandidateConfirmationInput
): TeoyubeSoftLaunchCandidateConfirmationReport {
  return createSoftLaunchCandidateConfirmationReport(input);
}
