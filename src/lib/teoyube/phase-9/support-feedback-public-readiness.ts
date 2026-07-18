export type TeoyubeSupportFeedbackPublicReadinessInput = Partial<{
  supportManual: boolean;
  feedbackManual: boolean;
  issueTriageManual: boolean;
  sensitiveFeedbackRedactedOrFlagged: boolean;
  automaticSupportContact: boolean;
  automaticFeedbackCollection: boolean;
  feedbackPersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  hiddenPersonalization: boolean;
}>;

export type TeoyubeSupportFeedbackPublicReadinessDecision =
  | "support_feedback_ready_manual"
  | "blocked"
  | "unknown";

export type TeoyubeSupportFeedbackPublicReadinessReport = {
  valid: boolean;
  decision: TeoyubeSupportFeedbackPublicReadinessDecision;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  supportRemainsManual: true;
  feedbackRemainsManual: true;
  issueTriageRemainsManual: true;
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

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function validateManualSupportReadiness(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): boolean {
  return flag(input.supportManual);
}

export function validateManualFeedbackReadiness(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): boolean {
  return flag(input.feedbackManual);
}

export function validateManualIssueTriageReadiness(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): boolean {
  return flag(input.issueTriageManual);
}

export function validateSensitiveFeedbackHandling(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): boolean {
  return flag(input.sensitiveFeedbackRedactedOrFlagged);
}

export function validateNoAutomaticSupportContact(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): boolean {
  return !input.automaticSupportContact;
}

export function validateNoAutomaticFeedbackCollection(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): boolean {
  return !input.automaticFeedbackCollection;
}

export function createSupportFeedbackPublicReadinessChecklist(input: TeoyubeSupportFeedbackPublicReadinessInput = {}) {
  return [
    check("support_manual", validateManualSupportReadiness(input), "Support remains manual."),
    check("feedback_manual", validateManualFeedbackReadiness(input), "Feedback remains manual."),
    check("issue_triage_manual", validateManualIssueTriageReadiness(input), "Issue triage remains manual."),
    check("sensitive_feedback_handling", validateSensitiveFeedbackHandling(input), "Sensitive feedback is redacted or flagged."),
    check("no_automatic_support_contact", validateNoAutomaticSupportContact(input), "No automatic support contact occurs."),
    check("no_automatic_feedback_collection", validateNoAutomaticFeedbackCollection(input), "No feedback is collected automatically."),
    check("no_feedback_persistence", !input.feedbackPersistenceEnabled, "No feedback persistence is enabled."),
    check("no_analytics", !input.analyticsEnabled, "No analytics are enabled."),
    check("no_hidden_personalization", !input.hiddenPersonalization, "No hidden personalization is created from feedback.")
  ];
}

export function getSupportFeedbackPublicReadinessBlockers(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): string[] {
  return createSupportFeedbackPublicReadinessChecklist(input).filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
}

export function getSupportFeedbackPublicReadinessWarnings(): string[] {
  return ["Support/feedback public readiness is manual and in-memory; no support desk, feedback store, analytics, or automatic contact service is connected."];
}

export function createSupportFeedbackPublicReadinessDecision(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): TeoyubeSupportFeedbackPublicReadinessDecision {
  return getSupportFeedbackPublicReadinessBlockers(input).length ? "blocked" : "support_feedback_ready_manual";
}

export function createSupportFeedbackPublicReadinessReport(input: TeoyubeSupportFeedbackPublicReadinessInput = {}): TeoyubeSupportFeedbackPublicReadinessReport {
  const blockers = getSupportFeedbackPublicReadinessBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createSupportFeedbackPublicReadinessDecision(input),
    checklist: createSupportFeedbackPublicReadinessChecklist(input),
    blockers,
    warnings: getSupportFeedbackPublicReadinessWarnings(),
    supportRemainsManual: true,
    feedbackRemainsManual: true,
    issueTriageRemainsManual: true,
    noAutomaticContact: true,
    noFeedbackPersistence: true,
    noAnalyticsEnabled: true,
    noHiddenPersonalization: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
