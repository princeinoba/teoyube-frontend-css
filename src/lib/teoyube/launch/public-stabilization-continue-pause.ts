import type { TeoyubePublicStabilizationDecision } from "./public-safe-fix-release-contracts";

export type TeoyubePublicStabilizationContinuePauseInput = {
  unresolvedPublicLaunchCriticalIssues?: number;
  publicFixQueueBlockers?: number;
  releasePlanBlockers?: number;
  releaseSafetyBlockers?: number;
  releaseRunBlockers?: number;
  regressionBlockers?: number;
  postReleaseSafetyBlockers?: number;
  surfaceStabilizationBlockers?: number;
  feedbackTriageDecision?: TeoyubePublicStabilizationDecision;
  dailyReviewDecision?: TeoyubePublicStabilizationDecision;
  ownerReviewDecision?: TeoyubePublicStabilizationDecision;
  ownerReviewAccepted?: boolean;
  pauseRollbackWatchStatus?: "healthy" | "warning" | "pause_recommended" | "rollback_recommended" | "blocked" | "unknown";
  warningCount?: number;
};

export type TeoyubePublicStabilizationContinuePauseReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicStabilizationDecision;
  blockers: string[];
  warnings: string[];
  reasons: string[];
  nextActions: string[];
  noRollbackPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};

export function getPublicStabilizationContinuePauseBlockers(input: TeoyubePublicStabilizationContinuePauseInput = {}): string[] {
  return [
    (input.unresolvedPublicLaunchCriticalIssues || 0) > 0 ? `${input.unresolvedPublicLaunchCriticalIssues} unresolved public-launch-critical issue(s) remain.` : "",
    (input.publicFixQueueBlockers || 0) > 0 ? `${input.publicFixQueueBlockers} public fix queue blocker(s) remain.` : "",
    (input.releasePlanBlockers || 0) > 0 ? `${input.releasePlanBlockers} public safe-fix release plan blocker(s) remain.` : "",
    (input.releaseSafetyBlockers || 0) > 0 ? `${input.releaseSafetyBlockers} public safe-fix safety blocker(s) remain.` : "",
    (input.releaseRunBlockers || 0) > 0 ? `${input.releaseRunBlockers} public safe-fix release run blocker(s) remain.` : "",
    (input.regressionBlockers || 0) > 0 ? `${input.regressionBlockers} public stabilization regression blocker(s) remain.` : "",
    (input.postReleaseSafetyBlockers || 0) > 0 ? `${input.postReleaseSafetyBlockers} public post-release safety blocker(s) remain.` : "",
    (input.surfaceStabilizationBlockers || 0) > 0 ? `${input.surfaceStabilizationBlockers} public surface stabilization blocker(s) remain.` : "",
    input.ownerReviewAccepted === false ? "Owner stabilization review has not been accepted." : "",
    input.feedbackTriageDecision === "blocked" ? "Public feedback triage is blocked." : "",
    input.dailyReviewDecision === "blocked" ? "Public daily review is blocked." : "",
    input.ownerReviewDecision === "blocked" ? "Public owner review is blocked." : "",
    input.pauseRollbackWatchStatus === "blocked" ? "Pause/rollback watch is blocked." : ""
  ].filter(Boolean);
}

export function getPublicStabilizationContinuePauseWarnings(input: TeoyubePublicStabilizationContinuePauseInput = {}): string[] {
  return [
    (input.warningCount || 0) > 0 ? `${input.warningCount} public stabilization warning(s) remain.` : "",
    input.feedbackTriageDecision === "continue_with_warnings" ? "Public feedback triage recommends continuing with warnings." : "",
    input.dailyReviewDecision === "continue_with_warnings" ? "Public daily review recommends continuing with warnings." : "",
    input.ownerReviewDecision === "continue_with_warnings" ? "Owner review recommends continuing with warnings." : "",
    input.pauseRollbackWatchStatus === "warning" ? "Pause/rollback watch has a warning." : ""
  ].filter(Boolean);
}

export function createPublicStabilizationContinuePauseDecision(input: TeoyubePublicStabilizationContinuePauseInput = {}): TeoyubePublicStabilizationDecision {
  const blockers = getPublicStabilizationContinuePauseBlockers(input);
  if (input.pauseRollbackWatchStatus === "rollback_recommended" || input.feedbackTriageDecision === "prepare_rollback" || input.dailyReviewDecision === "prepare_rollback" || input.ownerReviewDecision === "prepare_rollback") return "prepare_rollback";
  if (blockers.length > 0 || input.pauseRollbackWatchStatus === "blocked") return "pause_for_review";
  if (input.pauseRollbackWatchStatus === "pause_recommended" || input.feedbackTriageDecision === "pause_for_review" || input.dailyReviewDecision === "pause_for_review" || input.ownerReviewDecision === "pause_for_review") return "pause_for_review";
  if (input.ownerReviewAccepted === false || input.ownerReviewDecision === "needs_owner_review" || input.dailyReviewDecision === "needs_owner_review") return "needs_owner_review";
  if (getPublicStabilizationContinuePauseWarnings(input).length > 0) return "continue_with_warnings";
  return "continue_public_launch";
}

function nextActionsForDecision(decision: TeoyubePublicStabilizationDecision): string[] {
  if (decision === "prepare_rollback") return ["Prepare rollback decision support manually, hold public expansion, and complete owner review."];
  if (decision === "blocked") return ["Keep public launch blocked until all stabilization blockers are resolved."];
  if (decision === "pause_for_review") return ["Pause public launch expansion and resolve stabilization blockers with owner review."];
  if (decision === "needs_owner_review") return ["Complete owner stabilization review before continuing."];
  if (decision === "continue_with_warnings") return ["Continue public launch with warnings visible in the next daily review."];
  return ["Continue public launch stabilization and prepare Public Launch Execution 6.5 completion review."];
}

export function createPublicStabilizationContinuePauseReport(
  input: TeoyubePublicStabilizationContinuePauseInput = {}
): TeoyubePublicStabilizationContinuePauseReport {
  const blockers = getPublicStabilizationContinuePauseBlockers(input);
  const warnings = getPublicStabilizationContinuePauseWarnings(input);
  const decision = createPublicStabilizationContinuePauseDecision(input);
  return {
    valid: blockers.length === 0 && decision !== "prepare_rollback" && decision !== "blocked",
    ready: blockers.length === 0 && ["continue_public_launch", "continue_with_warnings", "needs_owner_review"].includes(decision),
    decision,
    blockers,
    warnings,
    reasons: [
      `Feedback triage decision is ${input.feedbackTriageDecision || "continue_public_launch"}.`,
      `Daily review decision is ${input.dailyReviewDecision || "continue_public_launch"}.`,
      `Owner review decision is ${input.ownerReviewDecision || "continue_public_launch"}.`,
      `Pause/rollback watch status is ${input.pauseRollbackWatchStatus || "healthy"}.`,
      "No rollback, user contact, automatic feedback collection, public URL fetch, analytics, database write, live AI orchestration, deployment, or external send is performed by this decision helper."
    ],
    nextActions: nextActionsForDecision(decision),
    noRollbackPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
