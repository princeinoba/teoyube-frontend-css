import type {
  TeoyubeLaunchDecision,
  TeoyubeLaunchDecisionLabel,
  TeoyubeLaunchReadinessReport
} from "./production-launch-contracts";
import { createReleaseCandidateReport } from "./release-candidate-report";
import { createDeploymentDryRunPlan, createDeploymentDryRunReport } from "./deployment-dry-run-planner";
import { runPreviewDeploymentExecutionAudit } from "./preview-deployment-execution-audit";
import { createPreviewDeploymentGoNoGoReport } from "./preview-deployment-go-no-go";
import { createPreviewDeploymentReadinessReport } from "./preview-deployment-readiness";
import { runPreviewReviewSoftLaunchAudit } from "./preview-review-soft-launch-audit";
import { createSoftLaunchCandidateReadinessReport } from "./soft-launch-candidate-planner";
import { createSoftLaunchCompletionReadinessReport } from "./soft-launch-completion-criteria";
import { createSoftLaunchGoNoGoReport } from "./soft-launch-go-no-go";
import { runSoftLaunchRunbookAudit } from "./soft-launch-runbook-audit";
import { runFinalLaunchPreparationAudit } from "./final-launch-preparation-audit";
import { runManualPreviewDeploymentAudit } from "./manual-preview-deployment-audit";
import { runManualPreviewIssueTriageAudit } from "./manual-preview-issue-triage-audit";
import { runManualPreviewPostDeploymentQaAudit } from "./manual-preview-postdeployment-qa-audit";
import { runManualPreviewSafeFixImplementationAudit } from "./manual-preview-safe-fix-implementation-audit";
import { runLimitedSoftLaunchDryRunAudit } from "./limited-soft-launch-dry-run-audit";
import { runLimitedSoftLaunchPreparationAudit } from "./limited-soft-launch-preparation-audit";
import { runFinalSoftLaunchReadinessAudit } from "./final-soft-launch-readiness-audit";
import { runSoftLaunchCandidateConfirmationAudit } from "./soft-launch-candidate-confirmation-audit";
import { runSoftLaunchFeedbackDailyReviewAudit } from "./soft-launch-feedback-daily-review-audit";
import { runSoftLaunchSafeFixStabilizationAudit } from "./soft-launch-safe-fix-stabilization-audit";
import { runSoftLaunchCompletionAudit } from "./soft-launch-completion-audit";

export function getLaunchDecisionLabel(
  report: TeoyubeLaunchReadinessReport
): TeoyubeLaunchDecisionLabel {
  if (report.blockers.length > 0) {
    return "blocked";
  }

  const dryRun = createDeploymentDryRunReport(createDeploymentDryRunPlan("vercel"));
  const releaseCandidate = createReleaseCandidateReport();
  const previewReadiness = createPreviewDeploymentReadinessReport();
  const softLaunch = createSoftLaunchCandidateReadinessReport();
  const executionAudit = runPreviewDeploymentExecutionAudit();
  const goNoGo = createPreviewDeploymentGoNoGoReport();
  const previewReviewAudit = runPreviewReviewSoftLaunchAudit();
  const softLaunchGoNoGo = createSoftLaunchGoNoGoReport();
  const runbookAudit = runSoftLaunchRunbookAudit();
  const completionReadiness = createSoftLaunchCompletionReadinessReport();
  const finalAudit = runFinalLaunchPreparationAudit();
  const manualPreviewAudit = runManualPreviewDeploymentAudit();
  const postdeploymentQaAudit = runManualPreviewPostDeploymentQaAudit();
  const issueTriageAudit = runManualPreviewIssueTriageAudit();
  const safeFixAudit = runManualPreviewSafeFixImplementationAudit();
  const softLaunchCandidateAudit = runSoftLaunchCandidateConfirmationAudit();
  const limitedSoftLaunchAudit = runLimitedSoftLaunchPreparationAudit();
  const limitedSoftLaunchDryRunAudit = runLimitedSoftLaunchDryRunAudit();
  const finalSoftLaunchAudit = runFinalSoftLaunchReadinessAudit();
  const feedbackDailyReviewAudit = runSoftLaunchFeedbackDailyReviewAudit();
  const safeFixStabilizationAudit = runSoftLaunchSafeFixStabilizationAudit();
  const softLaunchCompletionAudit = runSoftLaunchCompletionAudit();

  if (softLaunchCompletionAudit.complete && softLaunchCompletionAudit.completionPercentage === 100) {
    return "go_for_limited_soft_launch_execution";
  }

  if (safeFixStabilizationAudit.complete && safeFixStabilizationAudit.completionPercentage === 100) {
    return "go_for_limited_soft_launch_execution";
  }

  if (feedbackDailyReviewAudit.complete && feedbackDailyReviewAudit.completionPercentage === 100) {
    return "go_for_limited_soft_launch_execution";
  }

  if (finalSoftLaunchAudit.complete && finalSoftLaunchAudit.completionPercentage === 100) {
    return "go_for_limited_soft_launch_execution";
  }

  if (limitedSoftLaunchDryRunAudit.complete && limitedSoftLaunchDryRunAudit.completionPercentage === 100) {
    return "ready_for_final_soft_launch_readiness_package";
  }

  if (limitedSoftLaunchAudit.complete && limitedSoftLaunchAudit.completionPercentage === 100) {
    return "ready_for_soft_launch_dry_run_review";
  }

  if (softLaunchCandidateAudit.complete && softLaunchCandidateAudit.completionPercentage === 100) {
    return "ready_for_soft_launch_preparation";
  }

  if (safeFixAudit.complete && safeFixAudit.completionPercentage === 100) {
    return "ready_for_preview_recheck";
  }

  if (issueTriageAudit.complete && issueTriageAudit.completionPercentage === 100) {
    return "ready_for_safe_fix_implementation";
  }

  if (postdeploymentQaAudit.complete && postdeploymentQaAudit.completionPercentage === 100) {
    return "ready_for_preview_issue_triage";
  }

  if (manualPreviewAudit.complete && manualPreviewAudit.decision === "ready_for_manual_provider_deployment") {
    return "ready_for_manual_provider_deployment";
  }

  if (finalAudit.ready && finalAudit.decision === "ready_for_manual_preview_deployment") {
    return "ready_for_manual_preview_deployment";
  }

  if (runbookAudit.complete && completionReadiness.decision === "ready_for_final_launch_preparation_audit") {
    return "ready_for_final_launch_preparation_audit";
  }

  if (runbookAudit.complete) {
    return "ready_for_soft_launch_runbook_review";
  }

  if (previewReviewAudit.complete && softLaunchGoNoGo.decision === "go_for_soft_launch_candidate") {
    return "ready_for_soft_launch_candidate";
  }

  if (previewReviewAudit.complete && softLaunchGoNoGo.decision === "go_after_manual_review") {
    return "ready_after_manual_review";
  }

  if (previewReviewAudit.complete && softLaunchGoNoGo.decision === "needs_preview_fix") {
    return "needs_preview_fix";
  }

  if (previewReviewAudit.complete && softLaunchGoNoGo.decision === "needs_safety_fix") {
    return "needs_safety_fix";
  }

  if (previewReviewAudit.complete && softLaunchGoNoGo.decision === "needs_qa_fix") {
    return "needs_qa_fix";
  }

  if (previewReviewAudit.complete && softLaunchGoNoGo.decision === "no_go_blocked") {
    return "blocked";
  }

  if (executionAudit.complete && goNoGo.decision === "go_for_preview_deployment") {
    return "go_for_preview_deployment";
  }

  if (executionAudit.complete && goNoGo.decision === "go_after_manual_review") {
    return "go_after_manual_review";
  }

  if (executionAudit.complete) {
    return "ready_for_preview_deployment_execution";
  }

  if (previewReadiness.ready && softLaunch.decision === "ready_for_soft_launch_candidate") {
    return "ready_for_soft_launch_candidate";
  }

  if (
    previewReadiness.ready &&
    (previewReadiness.decision === "ready_for_preview_manual_review" ||
      softLaunch.decision === "ready_after_manual_review")
  ) {
    return "ready_for_preview_manual_review";
  }

  if (previewReadiness.decision === "ready_for_preview_deployment") {
    return "ready_for_preview_deployment";
  }

  if (
    dryRun.decision === "ready_for_preview_deployment" &&
    (releaseCandidate.status === "ready_for_preview_deployment" ||
      releaseCandidate.status === "ready_for_manual_review")
  ) {
    return "ready_for_preview_deployment";
  }

  if (dryRun.valid && report.ready) {
    return "ready_for_deployment_dry_run";
  }

  const allRequiredGatesPassed = report.qualityGates
    .filter((gate) => gate.required)
    .every((gate) => gate.passed);

  if (report.ready && report.readinessPercentage >= 95 && allRequiredGatesPassed) {
    return "ready_for_soft_launch";
  }

  if (report.ready && report.readinessPercentage >= 80) {
    return "ready_for_launch_preparation";
  }

  if (report.readinessPercentage > 0) {
    return "needs_review";
  }

  return "unknown";
}

export function getLaunchDecisionReasons(report: TeoyubeLaunchReadinessReport): string[] {
  const reasons = [
    report.blockers.length === 0
      ? "No critical launch-preparation blockers were found."
      : `${report.blockers.length} launch blocker(s) must be resolved.`,
    `Readiness score is ${report.readinessPercentage}%.`,
    report.safetyStatus.status === "ready"
      ? "Scripture anchoring, explanation paths, fallback safety, consent, privacy, and no-external-sending checks are ready."
      : "One or more launch safety checks needs review.",
    "Analytics, production persistence, live AI orchestration, service workers, native mobile builds, and paid infrastructure remain intentionally disconnected."
  ];
  const dryRun = createDeploymentDryRunReport(createDeploymentDryRunPlan("vercel"));
  const releaseCandidate = createReleaseCandidateReport();
  const previewReadiness = createPreviewDeploymentReadinessReport();
  const softLaunch = createSoftLaunchCandidateReadinessReport();
  const executionAudit = runPreviewDeploymentExecutionAudit();
  const goNoGo = createPreviewDeploymentGoNoGoReport();
  const previewReviewAudit = runPreviewReviewSoftLaunchAudit();
  const softLaunchGoNoGo = createSoftLaunchGoNoGoReport();
  const runbookAudit = runSoftLaunchRunbookAudit();
  const completionReadiness = createSoftLaunchCompletionReadinessReport();
  const finalAudit = runFinalLaunchPreparationAudit();
  const manualPreviewAudit = runManualPreviewDeploymentAudit();
  const postdeploymentQaAudit = runManualPreviewPostDeploymentQaAudit();
  const issueTriageAudit = runManualPreviewIssueTriageAudit();
  const safeFixAudit = runManualPreviewSafeFixImplementationAudit();
  const softLaunchCandidateAudit = runSoftLaunchCandidateConfirmationAudit();
  const limitedSoftLaunchAudit = runLimitedSoftLaunchPreparationAudit();
  const limitedSoftLaunchDryRunAudit = runLimitedSoftLaunchDryRunAudit();
  const finalSoftLaunchAudit = runFinalSoftLaunchReadinessAudit();
  const feedbackDailyReviewAudit = runSoftLaunchFeedbackDailyReviewAudit();
  const safeFixStabilizationAudit = runSoftLaunchSafeFixStabilizationAudit();
  const softLaunchCompletionAudit = runSoftLaunchCompletionAudit();

  reasons.push(`Deployment dry-run decision is ${dryRun.decision}.`);
  reasons.push(`Release candidate status is ${releaseCandidate.status}.`);
  reasons.push(`Preview deployment decision is ${previewReadiness.decision}.`);
  reasons.push(`Soft launch candidate decision is ${softLaunch.decision}.`);
  reasons.push(`Preview execution audit is ${executionAudit.completionPercentage}% complete.`);
  reasons.push(`Preview go/no-go decision is ${goNoGo.decision}.`);
  reasons.push(`Preview review soft launch audit is ${previewReviewAudit.completionPercentage}% complete.`);
  reasons.push(`Soft launch go/no-go decision is ${softLaunchGoNoGo.decision}.`);
  reasons.push(`Soft launch runbook audit is ${runbookAudit.completionPercentage}% complete.`);
  reasons.push(`Soft launch completion decision is ${completionReadiness.decision}.`);
  reasons.push(`Final launch preparation audit is ${finalAudit.completionPercentage}% complete with decision ${finalAudit.decision}.`);
  reasons.push(`Manual Preview Deployment 2.1 audit is ${manualPreviewAudit.completionPercentage}% complete with decision ${manualPreviewAudit.decision}.`);
  reasons.push(`Manual Preview Deployment 2.2 audit is ${postdeploymentQaAudit.completionPercentage}% complete.`);
  reasons.push(`Manual Preview Deployment 2.3 audit is ${issueTriageAudit.completionPercentage}% complete.`);
  reasons.push(`Manual Preview Deployment 2.4 audit is ${safeFixAudit.completionPercentage}% complete.`);
  reasons.push(`Manual Preview Deployment 2.5 audit is ${softLaunchCandidateAudit.completionPercentage}% complete.`);
  reasons.push(`Soft Launch Preparation 3.1 audit is ${limitedSoftLaunchAudit.completionPercentage}% complete.`);
  reasons.push(`Soft Launch Preparation 3.2 audit is ${limitedSoftLaunchDryRunAudit.completionPercentage}% complete.`);
  reasons.push(`Soft Launch Preparation 3.3 audit is ${finalSoftLaunchAudit.completionPercentage}% complete.`);
  reasons.push(`Limited Soft Launch Execution 4.3 audit is ${feedbackDailyReviewAudit.completionPercentage}% complete.`);
  reasons.push(`Limited Soft Launch Execution 4.4 audit is ${safeFixStabilizationAudit.completionPercentage}% complete.`);
  reasons.push(`Limited Soft Launch Execution 4.5 audit is ${softLaunchCompletionAudit.completionPercentage}% complete.`);

  const cliGates = report.qualityGates.filter((gate) =>
    ["typecheck_command", "lint_command", "build_command", "test_or_smoke_command"].includes(gate.id)
  );

  if (cliGates.some((gate) => !gate.passed)) {
    reasons.push("CLI quality checks still need to be run and documented before soft launch.");
  }

  return reasons;
}

export function getLaunchDecisionNextActions(report: TeoyubeLaunchReadinessReport): string[] {
  if (report.blockers.length > 0) {
    return report.blockers.map((blocker) => blocker.requiredAction);
  }

  const gateActions = report.qualityGates
    .filter((gate) => gate.required && !gate.passed && gate.nextAction)
    .map((gate) => gate.nextAction as string);

  return [
    "Proceed to Public Launch Preparation 5.1 - Public Launch Readiness Audit & Production Service Connection Plan.",
    "Run final typecheck, lint, build, and test/smoke checks before public launch preparation.",
    "Complete manual mobile, accessibility, theology, fallback, privacy, support, and consent QA.",
    ...gateActions
  ].filter((value, index, values) => values.indexOf(value) === index);
}

export function createLaunchDecision(report: TeoyubeLaunchReadinessReport): TeoyubeLaunchDecision {
  const label = getLaunchDecisionLabel(report);

  return {
    label,
    ready:
      label === "ready_for_launch_preparation" ||
      label === "ready_for_deployment_dry_run" ||
      label === "ready_for_preview_deployment" ||
      label === "ready_for_preview_manual_review" ||
      label === "ready_for_preview_deployment_execution" ||
      label === "go_for_preview_deployment" ||
      label === "go_after_manual_review" ||
      label === "ready_for_soft_launch_candidate" ||
      label === "ready_after_manual_review" ||
      label === "ready_for_soft_launch_runbook_review" ||
      label === "ready_for_final_launch_preparation_audit" ||
      label === "ready_for_manual_preview_deployment" ||
      label === "ready_for_manual_provider_deployment" ||
      label === "ready_after_environment_review" ||
      label === "ready_for_postdeployment_qa" ||
      label === "ready_for_preview_issue_triage" ||
      label === "ready_for_safe_fix_implementation" ||
      label === "ready_for_preview_recheck" ||
      label === "ready_for_soft_launch_preparation" ||
      label === "ready_for_soft_launch_dry_run_review" ||
      label === "ready_for_final_soft_launch_readiness_package" ||
      label === "go_for_limited_soft_launch_execution" ||
      label === "ready_after_owner_review" ||
      label === "ready_for_soft_launch",
    stage: report.stage,
    reasons: getLaunchDecisionReasons(report),
    nextActions: getLaunchDecisionNextActions(report),
    blockers: report.blockers,
    warnings: report.warnings
  };
}
