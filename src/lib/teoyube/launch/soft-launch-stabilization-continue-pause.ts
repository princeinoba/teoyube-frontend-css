import type { TeoyubeSoftLaunchStabilizationDecision } from "./soft-launch-safe-fix-release-contracts";

export type TeoyubeSoftLaunchStabilizationContinuePauseInput = {
  unresolvedLaunchCriticalIssues?: number;
  fixQueueBlockers?: number;
  regressionBlockers?: number;
  postReleaseSafetyBlockers?: number;
  surfaceStabilizationBlockers?: number;
  feedbackTriageDecision?: string;
  dailyReviewDecision?: string;
  ownerReviewDecision?: string;
  pauseRollbackWatchStatus?: string;
  warningCount?: number;
};

export function getStabilizationContinuePauseBlockers(input: TeoyubeSoftLaunchStabilizationContinuePauseInput = {}): string[] {
  return [
    (input.unresolvedLaunchCriticalIssues || 0) > 0 ? "Unresolved launch-critical issues remain." : "",
    (input.fixQueueBlockers || 0) > 0 ? "Fix queue blockers remain." : "",
    (input.regressionBlockers || 0) > 0 ? "Regression blockers remain." : "",
    (input.postReleaseSafetyBlockers || 0) > 0 ? "Post-release safety blockers remain." : "",
    (input.surfaceStabilizationBlockers || 0) > 0 ? "Surface stabilization blockers remain." : "",
    input.ownerReviewDecision === "blocked" ? "Owner review is blocked." : ""
  ].filter(Boolean);
}

export function getStabilizationContinuePauseWarnings(input: TeoyubeSoftLaunchStabilizationContinuePauseInput = {}): string[] {
  return [
    (input.warningCount || 0) > 0 ? `${input.warningCount} stabilization warning(s) remain.` : "",
    input.feedbackTriageDecision === "continue_with_warnings" ? "Feedback triage has warnings." : "",
    input.dailyReviewDecision === "continue_with_warnings" ? "Daily review has warnings." : "",
    input.ownerReviewDecision === "continue_with_warnings" ? "Owner review has warnings." : ""
  ].filter(Boolean);
}

export function getStabilizationContinuePauseReasons(input: TeoyubeSoftLaunchStabilizationContinuePauseInput = {}): string[] {
  return [
    `Feedback triage decision is ${input.feedbackTriageDecision || "unknown"}.`,
    `Daily review decision is ${input.dailyReviewDecision || "unknown"}.`,
    `Owner review decision is ${input.ownerReviewDecision || "unknown"}.`,
    `Pause/rollback watch status is ${input.pauseRollbackWatchStatus || "unknown"}.`,
    "Scripture anchors, explanation paths, fallback safety, consent, privacy, mobile accessibility, and confidence labels remain launch-critical."
  ];
}

export function evaluateSoftLaunchStabilizationContinuePause(
  input: TeoyubeSoftLaunchStabilizationContinuePauseInput = {}
): TeoyubeSoftLaunchStabilizationDecision {
  const blockers = getStabilizationContinuePauseBlockers(input);
  if (input.pauseRollbackWatchStatus === "rollback_recommended" || input.feedbackTriageDecision === "prepare_rollback") return "prepare_rollback";
  if (blockers.length > 0) return "pause_for_review";
  if (input.ownerReviewDecision === "needs_owner_review" || input.dailyReviewDecision === "needs_owner_review") return "needs_owner_review";
  if (getStabilizationContinuePauseWarnings(input).length > 0) return "continue_with_warnings";
  return "continue_soft_launch";
}

export function getStabilizationContinuePauseNextActions(
  input: TeoyubeSoftLaunchStabilizationContinuePauseInput = {}
): string[] {
  const decision = evaluateSoftLaunchStabilizationContinuePause(input);
  if (decision === "prepare_rollback") return ["Prepare rollback review manually; do not execute rollback from code."];
  if (decision === "pause_for_review") return ["Pause expansion and resolve stabilization blockers with owner review."];
  if (decision === "needs_owner_review") return ["Complete structured owner stabilization review before continuing."];
  if (decision === "continue_with_warnings") return ["Continue limited soft launch only with documented owner-accepted warnings."];
  return ["Continue manual soft launch stabilization and prepare 4.5 completion review."];
}

export function createStabilizationContinuePauseReport(
  input: TeoyubeSoftLaunchStabilizationContinuePauseInput = {}
) {
  const blockers = getStabilizationContinuePauseBlockers(input);
  const warnings = getStabilizationContinuePauseWarnings(input);
  const decision = evaluateSoftLaunchStabilizationContinuePause(input);
  return {
    valid: decision !== "blocked" && decision !== "prepare_rollback",
    ready: blockers.length === 0 && ["continue_soft_launch", "continue_with_warnings", "needs_owner_review"].includes(decision),
    decision,
    blockers,
    warnings,
    reasons: getStabilizationContinuePauseReasons(input),
    nextActions: getStabilizationContinuePauseNextActions(input),
    noRollbackPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
