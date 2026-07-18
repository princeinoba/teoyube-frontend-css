import { createSoftLaunchDailyReviewRecord, createSoftLaunchDailyReviewReport } from "./soft-launch-daily-review-manager";
import { createSoftLaunchFeedbackTriageReport } from "./soft-launch-feedback-triage-engine";
import { createSoftLaunchFixQueue, createSoftLaunchFixQueueReport } from "./soft-launch-fix-queue-manager";
import type { TeoyubeSoftLaunchDailyReviewDecision } from "./soft-launch-feedback-triage-contracts";

export type TeoyubeSoftLaunchPauseContinueDecisionInput = {
  feedbackTriageReport?: ReturnType<typeof createSoftLaunchFeedbackTriageReport>;
  fixQueueReport?: ReturnType<typeof createSoftLaunchFixQueueReport>;
  dailyReviewReport?: ReturnType<typeof createSoftLaunchDailyReviewReport>;
};

export type TeoyubeSoftLaunchPauseContinueDecisionReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeSoftLaunchDailyReviewDecision;
  reasons: string[];
  blockerCount: number;
  warningCount: number;
  noRollbackPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  generatedAt: string;
};

export function createSoftLaunchPauseContinueDecision(
  input: TeoyubeSoftLaunchPauseContinueDecisionInput = {}
): TeoyubeSoftLaunchPauseContinueDecisionReport {
  const feedbackTriageReport = input.feedbackTriageReport || createSoftLaunchFeedbackTriageReport([]);
  const fixQueueReport = input.fixQueueReport || createSoftLaunchFixQueueReport(createSoftLaunchFixQueue());
  const dailyReviewReport = input.dailyReviewReport || createSoftLaunchDailyReviewReport([createSoftLaunchDailyReviewRecord()]);
  const decisions = [feedbackTriageReport.decision, fixQueueReport.decision, dailyReviewReport.decision];
  const blockerCount = feedbackTriageReport.blockers.length + fixQueueReport.blockers.length + dailyReviewReport.blockers.length;
  const warningCount = feedbackTriageReport.warnings.length + fixQueueReport.warnings.length + dailyReviewReport.warnings.length;
  const reasons = [
    `Feedback triage decision is ${feedbackTriageReport.decision}.`,
    `Fix queue decision is ${fixQueueReport.decision}.`,
    `Daily review decision is ${dailyReviewReport.decision}.`,
    "Scripture anchors, explanation paths, fallback safety, consent, privacy, and confidence labels remain launch-critical.",
    "No rollback, user contact, automatic feedback collection, analytics, database write, or external send is performed by this decision helper."
  ];

  let decision: TeoyubeSoftLaunchDailyReviewDecision = "continue_soft_launch";
  if (decisions.includes("prepare_rollback")) decision = "prepare_rollback";
  else if (decisions.includes("blocked")) decision = "blocked";
  else if (decisions.includes("pause_for_review")) decision = "pause_for_review";
  else if (decisions.includes("needs_owner_review")) decision = "needs_owner_review";
  else if (decisions.includes("continue_with_warnings") || warningCount > 0) decision = "continue_with_warnings";

  return {
    valid: blockerCount === 0 && decision !== "blocked" && decision !== "prepare_rollback",
    ready: blockerCount === 0 && ["continue_soft_launch", "continue_with_warnings", "needs_owner_review"].includes(decision),
    decision,
    reasons,
    blockerCount,
    warningCount,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function createSoftLaunchPauseContinueReport(
  input: TeoyubeSoftLaunchPauseContinueDecisionInput = {}
): TeoyubeSoftLaunchPauseContinueDecisionReport {
  return createSoftLaunchPauseContinueDecision(input);
}

export function evaluateSoftLaunchPauseContinueDecision(
  input: TeoyubeSoftLaunchPauseContinueDecisionInput = {}
): TeoyubeSoftLaunchDailyReviewDecision {
  return createSoftLaunchPauseContinueDecision(input).decision;
}

export function getSoftLaunchPauseContinueReasons(
  input: TeoyubeSoftLaunchPauseContinueDecisionInput = {}
): string[] {
  return createSoftLaunchPauseContinueDecision(input).reasons;
}

export function getSoftLaunchPauseContinueBlockers(
  input: TeoyubeSoftLaunchPauseContinueDecisionInput = {}
): string[] {
  const report = createSoftLaunchPauseContinueDecision(input);
  return report.blockerCount > 0
    ? [`${report.blockerCount} blocker(s) require manual owner review before continuing.`]
    : [];
}

export function getSoftLaunchPauseContinueWarnings(
  input: TeoyubeSoftLaunchPauseContinueDecisionInput = {}
): string[] {
  const report = createSoftLaunchPauseContinueDecision(input);
  return report.warningCount > 0
    ? [`${report.warningCount} warning(s) should remain visible in daily owner review.`]
    : [];
}

export function getSoftLaunchPauseContinueNextActions(
  input: TeoyubeSoftLaunchPauseContinueDecisionInput = {}
): string[] {
  const report = createSoftLaunchPauseContinueDecision(input);

  if (report.decision === "prepare_rollback") {
    return ["Prepare rollback decision support, keep rollback manual, and complete owner review."];
  }

  if (report.decision === "blocked") {
    return ["Keep the soft launch blocked until all launch-critical blockers are resolved."];
  }

  if (report.decision === "pause_for_review") {
    return ["Pause expansion and complete manual owner review of feedback, fixes, and daily notes."];
  }

  if (report.decision === "needs_owner_review") {
    return ["Complete owner daily review before the next launch-day continuation decision."];
  }

  if (report.decision === "continue_with_warnings") {
    return ["Continue the soft launch with warnings visible in the next daily review."];
  }

  return ["Continue the soft launch with manual monitoring and in-memory daily review records."];
}
