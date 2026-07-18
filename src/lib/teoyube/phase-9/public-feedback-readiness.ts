export type TeoyubePublicFeedbackReadinessInput = Partial<{
  manualFeedbackWorkflowReady: boolean;
  sensitiveFeedbackRedactedOrFlagged: boolean;
  ownerReviewRequiredBeforeStorage: boolean;
  automaticFeedbackCollectionEnabled: boolean;
  databaseStorageEnabled: boolean;
  analyticsEnabled: boolean;
  hiddenPersonalizationEnabled: boolean;
  rawSensitiveTextStoredByDefault: boolean;
}>;

export type TeoyubePublicFeedbackReadinessDecision =
  | "public_feedback_ready_manual"
  | "public_feedback_ready_with_warnings"
  | "public_feedback_blocked"
  | "unknown";

export type TeoyubePublicFeedbackReadinessReport = {
  valid: boolean;
  decision: TeoyubePublicFeedbackReadinessDecision;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  feedbackRemainsManual: true;
  noAutomaticCollection: true;
  noDatabaseStorage: true;
  noAnalyticsEnabled: true;
  noHiddenPersonalization: true;
  noRawSensitiveTextStorageByDefault: true;
  ownerReviewRequiredBeforeFutureStorage: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function validateManualPublicFeedbackReadiness(input: TeoyubePublicFeedbackReadinessInput = {}): boolean {
  return flag(input.manualFeedbackWorkflowReady);
}

export function validateNoAutomaticPublicFeedbackCollection(input: TeoyubePublicFeedbackReadinessInput = {}): boolean {
  return !input.automaticFeedbackCollectionEnabled;
}

export function validateNoPublicFeedbackPersistence(input: TeoyubePublicFeedbackReadinessInput = {}): boolean {
  return !input.databaseStorageEnabled && !input.rawSensitiveTextStoredByDefault;
}

export function validateSensitivePublicFeedbackHandling(input: TeoyubePublicFeedbackReadinessInput = {}): boolean {
  return flag(input.sensitiveFeedbackRedactedOrFlagged);
}

export function validateNoPublicFeedbackAnalytics(input: TeoyubePublicFeedbackReadinessInput = {}): boolean {
  return !input.analyticsEnabled;
}

export function validateNoHiddenPersonalizationFromFeedback(input: TeoyubePublicFeedbackReadinessInput = {}): boolean {
  return !input.hiddenPersonalizationEnabled;
}

export function createPublicFeedbackReadinessChecklist(input: TeoyubePublicFeedbackReadinessInput = {}) {
  return [
    check("manual_feedback_workflow_ready", validateManualPublicFeedbackReadiness(input), "Feedback remains manual."),
    check("no_automatic_feedback_collection", validateNoAutomaticPublicFeedbackCollection(input), "Feedback is not collected automatically."),
    check("no_public_feedback_persistence", validateNoPublicFeedbackPersistence(input), "No database storage or raw sensitive text storage is enabled."),
    check("sensitive_feedback_handling", validateSensitivePublicFeedbackHandling(input), "Sensitive feedback is redacted or flagged manually."),
    check("no_public_feedback_analytics", validateNoPublicFeedbackAnalytics(input), "No feedback analytics are enabled."),
    check("no_hidden_personalization", validateNoHiddenPersonalizationFromFeedback(input), "Feedback does not create hidden personalization."),
    check("owner_review_before_storage", flag(input.ownerReviewRequiredBeforeStorage), "Owner review is required before any future feedback storage.")
  ];
}

export function getPublicFeedbackReadinessBlockers(input: TeoyubePublicFeedbackReadinessInput = {}): string[] {
  return createPublicFeedbackReadinessChecklist(input).filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
}

export function getPublicFeedbackReadinessWarnings(): string[] {
  return ["Public feedback readiness is manual and in-memory; it does not collect, store, analyze, or personalize from feedback automatically."];
}

export function createPublicFeedbackReadinessDecision(input: TeoyubePublicFeedbackReadinessInput = {}): TeoyubePublicFeedbackReadinessDecision {
  if (getPublicFeedbackReadinessBlockers(input).length) return "public_feedback_blocked";
  return getPublicFeedbackReadinessWarnings().length ? "public_feedback_ready_with_warnings" : "public_feedback_ready_manual";
}

export function createPublicFeedbackReadinessReport(input: TeoyubePublicFeedbackReadinessInput = {}): TeoyubePublicFeedbackReadinessReport {
  const blockers = getPublicFeedbackReadinessBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createPublicFeedbackReadinessDecision(input),
    checklist: createPublicFeedbackReadinessChecklist(input),
    blockers,
    warnings: getPublicFeedbackReadinessWarnings(),
    feedbackRemainsManual: true,
    noAutomaticCollection: true,
    noDatabaseStorage: true,
    noAnalyticsEnabled: true,
    noHiddenPersonalization: true,
    noRawSensitiveTextStorageByDefault: true,
    ownerReviewRequiredBeforeFutureStorage: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
