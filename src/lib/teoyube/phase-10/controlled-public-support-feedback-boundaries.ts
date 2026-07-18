export type TeoyubeControlledPublicSupportFeedbackBoundaryInput = Partial<{
  supportNotManual: boolean;
  feedbackNotManual: boolean;
  issueTriageNotManual: boolean;
  sensitiveFeedbackNotFlagged: boolean;
  rawSensitiveTextStored: boolean;
  feedbackPersistenceEnabled: boolean;
  feedbackAnalyticsEnabled: boolean;
  hiddenPersonalizationFromFeedback: boolean;
  automaticSupportContactEnabled: boolean;
  automaticFeedbackCollectionEnabled: boolean;
}>;

export type TeoyubeControlledPublicSupportFeedbackBoundaryChecklistItem = {
  id: string;
  label: string;
  passed: boolean;
  details: string;
};

function item(id: string, label: string, passed: boolean, details: string): TeoyubeControlledPublicSupportFeedbackBoundaryChecklistItem {
  return { id, label, passed, details };
}

export function validateManualSupportBoundary(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): boolean {
  return !input.supportNotManual && !input.issueTriageNotManual;
}

export function validateManualFeedbackBoundary(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): boolean {
  return !input.feedbackNotManual;
}

export function validateSensitiveFeedbackBoundary(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): boolean {
  return !input.sensitiveFeedbackNotFlagged && !input.rawSensitiveTextStored;
}

export function validateNoAutomaticSupportContact(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): boolean {
  return !input.automaticSupportContactEnabled;
}

export function validateNoAutomaticFeedbackCollection(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): boolean {
  return !input.automaticFeedbackCollectionEnabled;
}

export function validateNoFeedbackPersistence(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): boolean {
  return !input.feedbackPersistenceEnabled && !input.rawSensitiveTextStored;
}

export function validateNoFeedbackAnalytics(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): boolean {
  return !input.feedbackAnalyticsEnabled;
}

export function validateNoHiddenPersonalizationFromFeedback(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): boolean {
  return !input.hiddenPersonalizationFromFeedback;
}

export function createControlledPublicSupportFeedbackBoundaryChecklist(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): TeoyubeControlledPublicSupportFeedbackBoundaryChecklistItem[] {
  return [
    item("manual_support", "Support is manual", validateManualSupportBoundary(input), "Support and issue triage remain manual."),
    item("manual_feedback", "Feedback is manual", validateManualFeedbackBoundary(input), "Feedback is not collected automatically."),
    item("sensitive_feedback_boundary", "Sensitive feedback is flagged or redacted", validateSensitiveFeedbackBoundary(input), "Raw sensitive text is not stored by default."),
    item("no_automatic_support_contact", "No automatic support contact", validateNoAutomaticSupportContact(input), "No emails, SMS, notifications, or external messages are sent."),
    item("no_automatic_feedback_collection", "No automatic feedback collection", validateNoAutomaticFeedbackCollection(input), "Feedback intake remains manual."),
    item("no_feedback_persistence", "No feedback persistence", validateNoFeedbackPersistence(input), "Feedback is not persisted by this module."),
    item("no_feedback_analytics", "No feedback analytics", validateNoFeedbackAnalytics(input), "No feedback analytics pipeline is connected."),
    item("no_hidden_personalization", "No hidden personalization from feedback", validateNoHiddenPersonalizationFromFeedback(input), "Feedback does not create hidden user profiles.")
  ];
}

export function createControlledPublicSupportFeedbackBoundaryDecision(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}): "manual_boundaries_ready" | "blocked" {
  return createControlledPublicSupportFeedbackBoundaryChecklist(input).every((entry) => entry.passed) ? "manual_boundaries_ready" : "blocked";
}

export function createControlledPublicSupportFeedbackBoundaryReport(input: TeoyubeControlledPublicSupportFeedbackBoundaryInput = {}) {
  const checklist = createControlledPublicSupportFeedbackBoundaryChecklist(input);
  const blockers = checklist.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    decision: createControlledPublicSupportFeedbackBoundaryDecision(input),
    checklist,
    blockers,
    warnings: ["Support and feedback boundaries are manual and in-memory only; they do not contact users or persist feedback."],
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noFeedbackPersistenceEnabled: true,
    noFeedbackAnalyticsEnabled: true,
    noHiddenPersonalizationEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
