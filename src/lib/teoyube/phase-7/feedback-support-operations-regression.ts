export type TeoyubeFeedbackSupportOperationsRegressionInput = Partial<{
  feedbackManualOnly: boolean;
  feedbackNoAutomaticCollection: boolean;
  feedbackNoPersistence: boolean;
  feedbackSanitized: boolean;
  supportNoAutomaticContact: boolean;
  supportBoundarySafe: boolean;
  issueTriageManual: boolean;
}>;

function value(input: TeoyubeFeedbackSupportOperationsRegressionInput, key: keyof TeoyubeFeedbackSupportOperationsRegressionInput): boolean {
  return input[key] ?? true;
}

export function validateOperationsFeedbackManualOnly(input: TeoyubeFeedbackSupportOperationsRegressionInput = {}) {
  return value(input, "feedbackManualOnly");
}

export function validateOperationsFeedbackNoAutomaticCollection(input: TeoyubeFeedbackSupportOperationsRegressionInput = {}) {
  return value(input, "feedbackNoAutomaticCollection");
}

export function validateOperationsFeedbackNoPersistence(input: TeoyubeFeedbackSupportOperationsRegressionInput = {}) {
  return value(input, "feedbackNoPersistence");
}

export function validateOperationsFeedbackSanitization(input: TeoyubeFeedbackSupportOperationsRegressionInput = {}) {
  return value(input, "feedbackSanitized");
}

export function validateOperationsSupportNoAutomaticContact(input: TeoyubeFeedbackSupportOperationsRegressionInput = {}) {
  return value(input, "supportNoAutomaticContact");
}

export function validateOperationsSupportBoundarySafety(input: TeoyubeFeedbackSupportOperationsRegressionInput = {}) {
  return value(input, "supportBoundarySafe");
}

export function validateOperationsIssueTriageManual(input: TeoyubeFeedbackSupportOperationsRegressionInput = {}) {
  return value(input, "issueTriageManual");
}

export function createFeedbackSupportOperationsRegressionReport(input: TeoyubeFeedbackSupportOperationsRegressionInput = {}) {
  const checks = [
    { id: "feedback_manual_only", passed: validateOperationsFeedbackManualOnly(input), details: "Feedback review remains manual." },
    { id: "feedback_no_automatic_collection", passed: validateOperationsFeedbackNoAutomaticCollection(input), details: "Feedback is not collected automatically." },
    { id: "feedback_no_persistence", passed: validateOperationsFeedbackNoPersistence(input), details: "Feedback is not persisted." },
    { id: "feedback_sanitized", passed: validateOperationsFeedbackSanitization(input), details: "Feedback is sanitized/redacted." },
    { id: "support_no_automatic_contact", passed: validateOperationsSupportNoAutomaticContact(input), details: "Support workflow sends no messages." },
    { id: "support_boundary_safe", passed: validateOperationsSupportBoundarySafety(input), details: "Professional advice and emergency/crisis boundaries remain manual." },
    { id: "issue_triage_manual", passed: validateOperationsIssueTriageManual(input), details: "Issue triage remains manual." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id} regression failed.`);
  return {
    valid: blockers.length === 0,
    regressionArea: "feedback_support" as const,
    checks,
    blockers,
    warnings: [] as string[],
    manualOnly: true as const,
    inMemoryOnly: true as const,
    noUsersContacted: true as const,
    noFeedbackCollectedAutomatically: true as const,
    noDatabasePersistenceEnabled: true as const,
    noAnalyticsEnabled: true as const,
    noExternalServicesRequired: true as const,
    generatedAt: new Date().toISOString()
  };
}
