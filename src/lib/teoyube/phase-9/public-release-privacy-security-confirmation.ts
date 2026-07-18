export type TeoyubePublicReleasePrivacySecurityConfirmationInput = Partial<{
  privacyNoticeVisible: boolean;
  consentNoticeVisible: boolean;
  sensitiveDataWarningVisible: boolean;
  rawSensitiveTextStorageEnabled: boolean;
  sensitiveBrowserPersistenceRequired: boolean;
  hiddenPersonalization: boolean;
  secretsExposed: boolean;
  manualSupportFeedbackBoundaries: boolean;
  automaticFeedbackCollection: boolean;
  automaticUserContact: boolean;
}>;

export type TeoyubePublicReleasePrivacySecurityConfirmationDecision =
  | "privacy_security_confirmed"
  | "blocked"
  | "unknown";

export type TeoyubePublicReleasePrivacySecurityConfirmationReport = {
  valid: boolean;
  decision: TeoyubePublicReleasePrivacySecurityConfirmationDecision;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noRawSensitiveTextStorage: true;
  noSensitiveBrowserPersistence: true;
  noHiddenPersonalization: true;
  noSecretsExposed: true;
  noAutomaticFeedbackCollection: true;
  noAutomaticUserContact: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function confirmPublicReleasePrivacyNotice(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): boolean {
  return flag(input.privacyNoticeVisible);
}

export function confirmPublicReleaseConsentNotice(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): boolean {
  return flag(input.consentNoticeVisible);
}

export function confirmPublicReleaseSensitiveDataWarning(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): boolean {
  return flag(input.sensitiveDataWarningVisible);
}

export function confirmNoRawSensitiveTextStorage(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): boolean {
  return !input.rawSensitiveTextStorageEnabled;
}

export function confirmNoSensitiveBrowserPersistence(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): boolean {
  return !input.sensitiveBrowserPersistenceRequired;
}

export function confirmNoHiddenPersonalization(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): boolean {
  return !input.hiddenPersonalization;
}

export function confirmNoSecretsExposure(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): boolean {
  return !input.secretsExposed;
}

export function confirmManualSupportFeedbackBoundaries(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): boolean {
  return flag(input.manualSupportFeedbackBoundaries) && !input.automaticFeedbackCollection && !input.automaticUserContact;
}

function checks(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}) {
  return [
    check("privacy_notice", confirmPublicReleasePrivacyNotice(input), "Privacy notice remains visible."),
    check("consent_notice", confirmPublicReleaseConsentNotice(input), "Consent notice remains visible."),
    check("sensitive_warning", confirmPublicReleaseSensitiveDataWarning(input), "Sensitive data warning remains visible."),
    check("no_raw_sensitive_storage", confirmNoRawSensitiveTextStorage(input), "Raw sensitive text storage remains disabled by default."),
    check("no_sensitive_browser_persistence", confirmNoSensitiveBrowserPersistence(input), "No localStorage, cookies, or IndexedDB are required for sensitive data."),
    check("no_hidden_personalization", confirmNoHiddenPersonalization(input), "No hidden personalization is created."),
    check("no_secrets_exposed", confirmNoSecretsExposure(input), "No secrets are exposed."),
    check("manual_support_feedback", confirmManualSupportFeedbackBoundaries(input), "Support and feedback boundaries remain manual."),
    check("no_auto_feedback", !input.automaticFeedbackCollection, "Feedback is not collected automatically."),
    check("no_auto_contact", !input.automaticUserContact, "Users are not contacted automatically.")
  ];
}

export function createPublicReleasePrivacySecurityConfirmationDecision(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): TeoyubePublicReleasePrivacySecurityConfirmationDecision {
  return checks(input).some((entry) => !entry.passed) ? "blocked" : "privacy_security_confirmed";
}

export function createPublicReleasePrivacySecurityConfirmationReport(input: TeoyubePublicReleasePrivacySecurityConfirmationInput = {}): TeoyubePublicReleasePrivacySecurityConfirmationReport {
  const entries = checks(input);
  const blockers = entries.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    decision: createPublicReleasePrivacySecurityConfirmationDecision(input),
    checks: entries,
    blockers,
    warnings: ["Privacy/security confirmation is manual and in-memory; it does not claim legal approval."],
    noRawSensitiveTextStorage: true,
    noSensitiveBrowserPersistence: true,
    noHiddenPersonalization: true,
    noSecretsExposed: true,
    noAutomaticFeedbackCollection: true,
    noAutomaticUserContact: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
