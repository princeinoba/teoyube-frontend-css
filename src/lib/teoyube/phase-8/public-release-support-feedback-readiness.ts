export type TeoyubePublicReleaseSupportFeedbackInput = Partial<{
  supportWorkflowManual: boolean;
  feedbackManual: boolean;
  issueTriageManual: boolean;
  sensitiveFeedbackRedactedOrFlagged: boolean;
  automaticSupportContact: boolean;
  automaticFeedbackCollection: boolean;
  feedbackPersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  hiddenPersonalization: boolean;
}>;

export type TeoyubePublicReleaseSupportFeedbackReport = {
  valid: boolean;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  supportRemainsManual: true;
  feedbackRemainsManual: true;
  noAutomaticContact: true;
  noFeedbackPersistence: true;
  noAnalyticsEnabled: true;
  noHiddenPersonalization: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validatePublicReleaseSupportWorkflow(input: TeoyubePublicReleaseSupportFeedbackInput = {}): boolean {
  return flag(input.supportWorkflowManual);
}

export function validatePublicReleaseManualFeedbackBoundaries(input: TeoyubePublicReleaseSupportFeedbackInput = {}): boolean {
  return flag(input.feedbackManual);
}

export function validatePublicReleaseIssueTriage(input: TeoyubePublicReleaseSupportFeedbackInput = {}): boolean {
  return flag(input.issueTriageManual);
}

export function validatePublicReleaseSensitiveFeedbackHandling(input: TeoyubePublicReleaseSupportFeedbackInput = {}): boolean {
  return flag(input.sensitiveFeedbackRedactedOrFlagged);
}

export function validatePublicReleaseNoAutomaticSupportContact(input: TeoyubePublicReleaseSupportFeedbackInput = {}): boolean {
  return !input.automaticSupportContact;
}

export function validatePublicReleaseNoAutomaticFeedbackCollection(input: TeoyubePublicReleaseSupportFeedbackInput = {}): boolean {
  return !input.automaticFeedbackCollection;
}

export function createPublicReleaseSupportFeedbackChecklist(input: TeoyubePublicReleaseSupportFeedbackInput = {}) {
  return [
    { id: "support_manual", passed: validatePublicReleaseSupportWorkflow(input), details: "Support remains manual." },
    { id: "feedback_manual", passed: validatePublicReleaseManualFeedbackBoundaries(input), details: "Feedback remains manual." },
    { id: "issue_triage_manual", passed: validatePublicReleaseIssueTriage(input), details: "Issue triage remains manual." },
    { id: "sensitive_feedback_handling", passed: validatePublicReleaseSensitiveFeedbackHandling(input), details: "Sensitive feedback is redacted or flagged." },
    { id: "no_automatic_support_contact", passed: validatePublicReleaseNoAutomaticSupportContact(input), details: "No automatic support contact is sent." },
    { id: "no_automatic_feedback_collection", passed: validatePublicReleaseNoAutomaticFeedbackCollection(input), details: "No feedback is collected automatically." },
    { id: "no_feedback_persistence", passed: !input.feedbackPersistenceEnabled, details: "Feedback persistence remains disabled." },
    { id: "no_analytics", passed: !input.analyticsEnabled, details: "Analytics remain disabled." },
    { id: "no_hidden_personalization", passed: !input.hiddenPersonalization, details: "No hidden personalization is created from feedback." }
  ];
}

export function getPublicReleaseSupportFeedbackBlockers(input: TeoyubePublicReleaseSupportFeedbackInput = {}): string[] {
  return createPublicReleaseSupportFeedbackChecklist(input).filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
}

export function getPublicReleaseSupportFeedbackWarnings(input: TeoyubePublicReleaseSupportFeedbackInput = {}): string[] {
  return [
    "Support/feedback readiness is manual and in-memory; no support desk, analytics, or persistence service is connected.",
    ...(!input.sensitiveFeedbackRedactedOrFlagged ? ["Sensitive feedback handling should be rechecked before release candidate planning."] : [])
  ];
}

export function createPublicReleaseSupportFeedbackReport(input: TeoyubePublicReleaseSupportFeedbackInput = {}): TeoyubePublicReleaseSupportFeedbackReport {
  const blockers = getPublicReleaseSupportFeedbackBlockers(input);
  return {
    valid: blockers.length === 0,
    checklist: createPublicReleaseSupportFeedbackChecklist(input),
    blockers,
    warnings: getPublicReleaseSupportFeedbackWarnings(input),
    supportRemainsManual: true,
    feedbackRemainsManual: true,
    noAutomaticContact: true,
    noFeedbackPersistence: true,
    noAnalyticsEnabled: true,
    noHiddenPersonalization: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
