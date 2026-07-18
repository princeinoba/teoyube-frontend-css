export type TeoyubeLaunchDayFeedbackPrivacyInput = {
  summary?: string;
  redactedNotes?: string[];
  rawText?: string;
  category?: string;
  containsSensitivePersonalData?: boolean;
  containsEmergencyMedicalLegalFinancialClaim?: boolean;
  hiddenPersonalizationRisk?: boolean;
};

const SENSITIVE_PATTERNS = [
  /\b[\w.+-]+@[\w.-]+\.\w+\b/g,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{3}-\d{2}-\d{4}\b/g
];

export function sanitizeLaunchDayFeedbackText(text = ""): string {
  return SENSITIVE_PATTERNS.reduce((value, pattern) => value.replace(pattern, "[redacted]"), text).trim();
}

export function redactLaunchDayFeedbackSensitiveFields<T extends TeoyubeLaunchDayFeedbackPrivacyInput>(feedback: T): T {
  return {
    ...feedback,
    summary: sanitizeLaunchDayFeedbackText(feedback.summary || ""),
    rawText: undefined,
    redactedNotes: (feedback.redactedNotes || []).map(sanitizeLaunchDayFeedbackText),
    containsSensitivePersonalData: false
  };
}

export function validateLaunchDayFeedbackPrivacy(feedback: TeoyubeLaunchDayFeedbackPrivacyInput) {
  const warnings = getLaunchDayFeedbackPrivacyWarnings(feedback);
  const blocked = shouldBlockLaunchDayFeedbackStorage(feedback);

  return {
    valid: !blocked,
    blocked,
    warnings
  };
}

export function shouldBlockLaunchDayFeedbackStorage(feedback: TeoyubeLaunchDayFeedbackPrivacyInput): boolean {
  return Boolean(
    feedback.rawText ||
    feedback.containsSensitivePersonalData ||
    feedback.containsEmergencyMedicalLegalFinancialClaim ||
    feedback.hiddenPersonalizationRisk
  );
}

export function getLaunchDayFeedbackPrivacyWarnings(feedback: TeoyubeLaunchDayFeedbackPrivacyInput): string[] {
  return [
    feedback.rawText ? "Raw private user text must not be stored by default." : undefined,
    feedback.containsSensitivePersonalData ? "Sensitive personal attributes must not be inferred or stored." : undefined,
    feedback.containsEmergencyMedicalLegalFinancialClaim ? "Emergency, medical, legal, or financial claims require manual review." : undefined,
    feedback.hiddenPersonalizationRisk ? "Feedback must not become hidden personalization." : undefined,
    feedback.category === "spiritual_content" ? "Spiritual content feedback should be handled carefully and respectfully." : undefined
  ].filter(Boolean) as string[];
}

export function createLaunchDayFeedbackPrivacyReport(feedback: TeoyubeLaunchDayFeedbackPrivacyInput) {
  const redacted = redactLaunchDayFeedbackSensitiveFields(feedback);
  const validation = validateLaunchDayFeedbackPrivacy(feedback);

  return {
    valid: validation.valid,
    blocked: validation.blocked,
    redactedFeedback: redacted,
    warnings: validation.warnings,
    rawPrivateUserTextStored: false,
    hiddenPersonalizationCreated: false,
    manualUserControlledFeedbackOnly: true,
    generatedAt: new Date().toISOString()
  };
}
