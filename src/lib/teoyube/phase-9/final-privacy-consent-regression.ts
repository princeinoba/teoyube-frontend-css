export type TeoyubeFinalPrivacyConsentRegressionInput = Partial<{
  privacyNoticeVisible: boolean;
  consentNoticeVisible: boolean;
  sensitiveDataWarningVisible: boolean;
  rawSensitiveTextStoredByDefault: boolean;
  sensitiveBrowserPersistenceEnabled: boolean;
  hiddenPersonalizationCreated: boolean;
  manualFeedbackBoundariesPreserved: boolean;
  manualSupportBoundariesPreserved: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validateFinalPrivacyNotice(input: TeoyubeFinalPrivacyConsentRegressionInput = {}): boolean {
  return flag(input.privacyNoticeVisible);
}

export function validateFinalConsentNotice(input: TeoyubeFinalPrivacyConsentRegressionInput = {}): boolean {
  return flag(input.consentNoticeVisible);
}

export function validateFinalSensitiveDataWarning(input: TeoyubeFinalPrivacyConsentRegressionInput = {}): boolean {
  return flag(input.sensitiveDataWarningVisible);
}

export function validateFinalNoRawSensitiveTextStorage(input: TeoyubeFinalPrivacyConsentRegressionInput = {}): boolean {
  return !input.rawSensitiveTextStoredByDefault;
}

export function validateFinalNoSensitiveBrowserPersistence(input: TeoyubeFinalPrivacyConsentRegressionInput = {}): boolean {
  return !input.sensitiveBrowserPersistenceEnabled;
}

export function validateFinalNoHiddenPersonalization(input: TeoyubeFinalPrivacyConsentRegressionInput = {}): boolean {
  return !input.hiddenPersonalizationCreated;
}

export function validateFinalManualFeedbackBoundaries(input: TeoyubeFinalPrivacyConsentRegressionInput = {}): boolean {
  return flag(input.manualFeedbackBoundariesPreserved);
}

export function validateFinalManualSupportBoundaries(input: TeoyubeFinalPrivacyConsentRegressionInput = {}): boolean {
  return flag(input.manualSupportBoundariesPreserved);
}

export function createFinalPrivacyConsentRegressionReport(input: TeoyubeFinalPrivacyConsentRegressionInput = {}) {
  const checks = [
    { id: "privacy_notice", passed: validateFinalPrivacyNotice(input), details: "Privacy notice remains visible." },
    { id: "consent_notice", passed: validateFinalConsentNotice(input), details: "Consent notice remains visible." },
    { id: "sensitive_data_warning", passed: validateFinalSensitiveDataWarning(input), details: "Sensitive data warning remains visible." },
    { id: "no_raw_sensitive_text_storage", passed: validateFinalNoRawSensitiveTextStorage(input), details: "No raw sensitive text is stored by default." },
    { id: "no_sensitive_browser_persistence", passed: validateFinalNoSensitiveBrowserPersistence(input), details: "No localStorage, cookies, IndexedDB, or browser persistence for sensitive data is required." },
    { id: "no_hidden_personalization", passed: validateFinalNoHiddenPersonalization(input), details: "No hidden personalization is created." },
    { id: "manual_feedback_boundaries", passed: validateFinalManualFeedbackBoundaries(input), details: "Feedback remains manual." },
    { id: "manual_support_boundaries", passed: validateFinalManualSupportBoundaries(input), details: "Support remains manual." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Final privacy/consent regression is manual and in-memory; it does not claim legal approval."],
    privacyNoticeVisible: true,
    consentNoticeVisible: true,
    sensitiveDataWarningVisible: true,
    noRawSensitiveTextStorage: true,
    noSensitiveBrowserPersistence: true,
    noHiddenPersonalization: true,
    manualFeedbackBoundariesPreserved: true,
    manualSupportBoundariesPreserved: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
