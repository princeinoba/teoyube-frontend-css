import { createSoftLaunchFeedbackLog, summarizeSoftLaunchFeedback } from "./soft-launch-feedback-intake";
import type { TeoyubeSoftLaunchFeedbackLog } from "./soft-launch-feedback-contracts";
import { createSoftLaunchDailyReviewRecord, type TeoyubeSoftLaunchDailyReviewRecord } from "./soft-launch-daily-review";
import type { TeoyubeSoftLaunchCompletionDecision } from "./soft-launch-runbook-contracts";

export type TeoyubeSoftLaunchCompletionState = {
  feedbackLog?: TeoyubeSoftLaunchFeedbackLog;
  dailyReviewRecords?: TeoyubeSoftLaunchDailyReviewRecord[];
  noCriticalScriptureAnchorIssues?: boolean;
  noCriticalExplanationPathIssues?: boolean;
  noUnsafeFallbackIssues?: boolean;
  noConsentControlBlockers?: boolean;
  noCriticalMobileBlockers?: boolean;
  noCriticalAccessibilityBlockers?: boolean;
  noExposedDebugPayloads?: boolean;
  noAccidentalAnalyticsSending?: boolean;
  noAccidentalPersistenceEnablement?: boolean;
  noLiveAiOrchestration?: boolean;
  feedbackTriaged?: boolean;
  rollbackCriteriaReviewed?: boolean;
  nextLaunchStageDocumented?: boolean;
};

function value(state: TeoyubeSoftLaunchCompletionState, key: keyof TeoyubeSoftLaunchCompletionState): boolean {
  return state[key] !== false;
}

export function getSoftLaunchCompletionCriteria() {
  return [
    "No critical Scripture anchor issues",
    "No critical explanation path issues",
    "No unsafe fallback issues",
    "No consent control blockers",
    "No critical mobile blockers",
    "No critical accessibility blockers",
    "No exposed debug payloads",
    "No accidental analytics sending",
    "No accidental persistence enablement",
    "No live AI orchestration",
    "Feedback triaged",
    "Rollback criteria reviewed",
    "Next launch stage documented"
  ];
}

export function getSoftLaunchCompletionBlockers(state: TeoyubeSoftLaunchCompletionState = {}): string[] {
  const feedbackSummary = summarizeSoftLaunchFeedback(state.feedbackLog || createSoftLaunchFeedbackLog());

  return [
    value(state, "noCriticalScriptureAnchorIssues") && feedbackSummary.scriptureIssueCount === 0 ? "" : "Critical Scripture anchor issues must be resolved.",
    value(state, "noCriticalExplanationPathIssues") && feedbackSummary.explanationIssueCount === 0 ? "" : "Critical explanation path issues must be resolved.",
    value(state, "noUnsafeFallbackIssues") && feedbackSummary.fallbackIssueCount === 0 ? "" : "Unsafe fallback issues must be resolved.",
    value(state, "noConsentControlBlockers") && feedbackSummary.consentIssueCount === 0 ? "" : "Consent control blockers must be resolved.",
    value(state, "noCriticalMobileBlockers") ? "" : "Critical mobile blockers must be resolved.",
    value(state, "noCriticalAccessibilityBlockers") ? "" : "Critical accessibility blockers must be resolved.",
    value(state, "noExposedDebugPayloads") ? "" : "Exposed debug payloads must be resolved.",
    value(state, "noAccidentalAnalyticsSending") ? "" : "Accidental analytics sending must not occur.",
    value(state, "noAccidentalPersistenceEnablement") ? "" : "Accidental persistence enablement must not occur.",
    value(state, "noLiveAiOrchestration") ? "" : "Live AI orchestration must remain disabled."
  ].filter(Boolean);
}

export function getSoftLaunchCompletionWarnings(state: TeoyubeSoftLaunchCompletionState = {}): string[] {
  return [
    value(state, "feedbackTriaged") ? "" : "Feedback triage should be documented before completion.",
    value(state, "rollbackCriteriaReviewed") ? "" : "Rollback criteria should be reviewed before completion.",
    value(state, "nextLaunchStageDocumented") ? "" : "Next launch stage should be documented.",
    "This completion criteria module does not launch Teoyube."
  ].filter(Boolean);
}

export function createSoftLaunchCompletionDecision(
  state: TeoyubeSoftLaunchCompletionState = {}
): TeoyubeSoftLaunchCompletionDecision {
  const blockers = getSoftLaunchCompletionBlockers(state);

  if (blockers.length > 0) return "blocked";
  return "ready_for_final_launch_preparation_audit";
}

export function validateSoftLaunchCompletionCriteria(state: TeoyubeSoftLaunchCompletionState = {}) {
  const blockers = getSoftLaunchCompletionBlockers(state);
  const warnings = getSoftLaunchCompletionWarnings(state);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createSoftLaunchCompletionReadinessReport(
  state: TeoyubeSoftLaunchCompletionState = {}
) {
  const validation = validateSoftLaunchCompletionCriteria(state);
  const records = state.dailyReviewRecords || [createSoftLaunchDailyReviewRecord()];

  return {
    ...validation,
    criteria: getSoftLaunchCompletionCriteria(),
    decision: createSoftLaunchCompletionDecision(state),
    feedbackSummary: summarizeSoftLaunchFeedback(state.feedbackLog || createSoftLaunchFeedbackLog()),
    dailyReviewRecordCount: records.length,
    actualLaunchPerformed: false,
    generatedAt: new Date().toISOString()
  };
}
