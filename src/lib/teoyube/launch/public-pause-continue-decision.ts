import { createPublicDailyReviewRecord, createPublicDailyReviewReport } from "./public-daily-review-manager";
import { createPublicFeedbackTriageReport } from "./public-feedback-triage-engine";
import { createPublicFixQueue, createPublicFixQueueReport } from "./public-fix-queue-manager";
import type { TeoyubePublicDailyReviewDecision } from "./public-feedback-triage-contracts";

export type TeoyubePublicPauseContinueDecisionInput = {
  feedbackTriageReport?: ReturnType<typeof createPublicFeedbackTriageReport>;
  issueEscalationReport?: { blockers?: unknown[]; warnings?: unknown[]; decision?: string };
  fixQueueReport?: ReturnType<typeof createPublicFixQueueReport>;
  dailyReviewReport?: ReturnType<typeof createPublicDailyReviewReport>;
  pauseRollbackWatchReport?: { rollbackRecommended?: boolean; pauseRecommended?: boolean; blockers?: unknown[]; warnings?: unknown[] };
  scriptureExplanationFallbackWatchReport?: { blockers?: unknown[]; warnings?: unknown[]; ready?: boolean };
  privacyConsentReport?: { ready?: boolean; blockers?: unknown[]; warnings?: unknown[] };
  ownerReviewAccepted?: boolean;
};

export type TeoyubePublicPauseContinueDecisionReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicDailyReviewDecision;
  reasons: string[];
  nextActions: string[];
  blockerCount: number;
  warningCount: number;
  noRollbackPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};

export function evaluatePublicPauseContinueDecision(input: TeoyubePublicPauseContinueDecisionInput = {}): TeoyubePublicDailyReviewDecision {
  return createPublicPauseContinueReport(input).decision;
}

export function getPublicPauseContinueReasons(input: TeoyubePublicPauseContinueDecisionInput = {}): string[] {
  const feedbackTriageReport = input.feedbackTriageReport || createPublicFeedbackTriageReport([]);
  const fixQueueReport = input.fixQueueReport || createPublicFixQueueReport(createPublicFixQueue());
  const dailyReviewReport = input.dailyReviewReport || createPublicDailyReviewReport([createPublicDailyReviewRecord()]);
  return [
    `Public feedback triage decision is ${feedbackTriageReport.decision}.`,
    `Public fix queue decision is ${fixQueueReport.decision}.`,
    `Public daily review decision is ${dailyReviewReport.decision}.`,
    `Owner review accepted is ${input.ownerReviewAccepted !== false}.`,
    "Scripture anchors, explanation paths, fallback safety, confidence labels, public privacy/terms/consent notices, and consent controls remain public-launch-critical.",
    "No rollback, user contact, automatic feedback collection, public URL fetch, analytics, database write, live AI orchestration, or external send is performed by this decision helper."
  ];
}

export function getPublicPauseContinueBlockers(input: TeoyubePublicPauseContinueDecisionInput = {}): string[] {
  const feedbackTriageReport = input.feedbackTriageReport || createPublicFeedbackTriageReport([]);
  const fixQueueReport = input.fixQueueReport || createPublicFixQueueReport(createPublicFixQueue());
  const dailyReviewReport = input.dailyReviewReport || createPublicDailyReviewReport([createPublicDailyReviewRecord()]);
  const count =
    feedbackTriageReport.blockers.length +
    fixQueueReport.blockers.length +
    dailyReviewReport.blockers.length +
    (input.issueEscalationReport?.blockers?.length || 0) +
    (input.pauseRollbackWatchReport?.blockers?.length || 0) +
    (input.scriptureExplanationFallbackWatchReport?.blockers?.length || 0) +
    (input.privacyConsentReport?.blockers?.length || 0) +
    (input.ownerReviewAccepted === false ? 1 : 0);
  return count > 0 ? [`${count} public launch blocker(s) require manual owner review before continuing.`] : [];
}

export function getPublicPauseContinueWarnings(input: TeoyubePublicPauseContinueDecisionInput = {}): string[] {
  const feedbackTriageReport = input.feedbackTriageReport || createPublicFeedbackTriageReport([]);
  const fixQueueReport = input.fixQueueReport || createPublicFixQueueReport(createPublicFixQueue());
  const dailyReviewReport = input.dailyReviewReport || createPublicDailyReviewReport([createPublicDailyReviewRecord()]);
  const count =
    feedbackTriageReport.warnings.length +
    fixQueueReport.warnings.length +
    dailyReviewReport.warnings.length +
    (input.issueEscalationReport?.warnings?.length || 0) +
    (input.pauseRollbackWatchReport?.warnings?.length || 0) +
    (input.scriptureExplanationFallbackWatchReport?.warnings?.length || 0) +
    (input.privacyConsentReport?.warnings?.length || 0);
  return count > 0 ? [`${count} public launch warning(s) should remain visible in daily owner review.`] : [];
}

export function getPublicPauseContinueNextActions(input: TeoyubePublicPauseContinueDecisionInput = {}): string[] {
  const decision = createPublicPauseContinueReport(input).decision;
  if (decision === "prepare_rollback") return ["Prepare rollback decision support, keep rollback manual, and complete owner review."];
  if (decision === "blocked") return ["Keep public launch blocked until all public-launch-critical blockers are resolved."];
  if (decision === "pause_for_review") return ["Pause public promotion and complete manual owner review of feedback, fixes, and daily notes."];
  if (decision === "needs_owner_review") return ["Complete owner daily review before the next public launch continuation decision."];
  if (decision === "continue_with_warnings") return ["Continue controlled public launch with warnings visible in the next daily review."];
  return ["Continue controlled public launch with manual monitoring and in-memory daily review records."];
}

export function createPublicPauseContinueReport(input: TeoyubePublicPauseContinueDecisionInput = {}): TeoyubePublicPauseContinueDecisionReport {
  const feedbackTriageReport = input.feedbackTriageReport || createPublicFeedbackTriageReport([]);
  const fixQueueReport = input.fixQueueReport || createPublicFixQueueReport(createPublicFixQueue());
  const dailyReviewReport = input.dailyReviewReport || createPublicDailyReviewReport([createPublicDailyReviewRecord()]);
  const decisions = [feedbackTriageReport.decision, fixQueueReport.decision, dailyReviewReport.decision, input.issueEscalationReport?.decision];
  const blockerCount = getPublicPauseContinueBlockers({ ...input, feedbackTriageReport, fixQueueReport, dailyReviewReport }).length;
  const warningCount = getPublicPauseContinueWarnings({ ...input, feedbackTriageReport, fixQueueReport, dailyReviewReport }).length;

  let decision: TeoyubePublicDailyReviewDecision = "continue_public_launch";
  if (input.pauseRollbackWatchReport?.rollbackRecommended || decisions.includes("prepare_rollback")) decision = "prepare_rollback";
  else if (decisions.includes("blocked")) decision = "blocked";
  else if (input.pauseRollbackWatchReport?.pauseRecommended || decisions.includes("pause_for_review") || blockerCount > 0) decision = "pause_for_review";
  else if (input.ownerReviewAccepted === false || decisions.includes("needs_owner_review")) decision = "needs_owner_review";
  else if (decisions.includes("continue_with_warnings") || warningCount > 0) decision = "continue_with_warnings";

  return {
    valid: blockerCount === 0 && decision !== "blocked" && decision !== "prepare_rollback",
    ready: blockerCount === 0 && ["continue_public_launch", "continue_with_warnings", "needs_owner_review"].includes(decision),
    decision,
    reasons: getPublicPauseContinueReasons({ ...input, feedbackTriageReport, fixQueueReport, dailyReviewReport }),
    nextActions: getPublicPauseContinueNextActionsForDecision(decision),
    blockerCount,
    warningCount,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

function getPublicPauseContinueNextActionsForDecision(decision: TeoyubePublicDailyReviewDecision): string[] {
  if (decision === "prepare_rollback") return ["Prepare rollback decision support, keep rollback manual, and complete owner review."];
  if (decision === "blocked") return ["Keep public launch blocked until all public-launch-critical blockers are resolved."];
  if (decision === "pause_for_review") return ["Pause public promotion and complete manual owner review."];
  if (decision === "needs_owner_review") return ["Complete owner daily review before continuing."];
  if (decision === "continue_with_warnings") return ["Continue controlled public launch with warnings visible."];
  return ["Continue controlled public launch with manual monitoring."];
}
