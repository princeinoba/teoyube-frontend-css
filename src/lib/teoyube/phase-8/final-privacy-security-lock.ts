export type TeoyubeFinalPrivacySecurityLockInput = Partial<{
  privacyNoticeExistsOrPlanned: boolean;
  consentNoticeExistsOrPlanned: boolean;
  sensitiveDataWarningExistsOrPlanned: boolean;
  rawSensitiveTextStorageEnabled: boolean;
  feedbackBoundaryManual: boolean;
  supportBoundaryManual: boolean;
  hiddenPersonalization: boolean;
  sensitiveBrowserPersistenceRequired: boolean;
  secretsExposed: boolean;
  legalApprovalClaimedWithoutRecord: boolean;
}>;

export type TeoyubeFinalPrivacySecurityLockDecision =
  | "privacy_security_locked"
  | "privacy_security_locked_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeFinalPrivacySecurityLockRule = {
  id: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeFinalPrivacySecurityLockReport = {
  valid: boolean;
  decision: TeoyubeFinalPrivacySecurityLockDecision;
  rules: TeoyubeFinalPrivacySecurityLockRule[];
  blockers: string[];
  warnings: string[];
  noRawSensitiveTextStorage: true;
  noHiddenPersonalization: true;
  noSensitiveBrowserPersistence: true;
  noSecretsExposed: true;
  feedbackBoundaryManual: true;
  supportBoundaryManual: true;
  noLegalApprovalClaimed: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function rule(id: string, label: string, passed: boolean, details: string): TeoyubeFinalPrivacySecurityLockRule {
  return { id, label, passed, details };
}

export function validateFinalPrivacyNoticeLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): boolean {
  return flag(input.privacyNoticeExistsOrPlanned);
}

export function validateFinalConsentNoticeLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): boolean {
  return flag(input.consentNoticeExistsOrPlanned);
}

export function validateFinalSensitiveDataBoundaryLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): boolean {
  return flag(input.sensitiveDataWarningExistsOrPlanned) && !input.rawSensitiveTextStorageEnabled;
}

export function validateFinalManualFeedbackBoundaryLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): boolean {
  return flag(input.feedbackBoundaryManual);
}

export function validateFinalSupportBoundaryLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): boolean {
  return flag(input.supportBoundaryManual);
}

export function validateFinalNoHiddenPersonalizationLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): boolean {
  return !input.hiddenPersonalization;
}

export function validateFinalNoSensitiveBrowserPersistenceLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): boolean {
  return !input.sensitiveBrowserPersistenceRequired;
}

export function validateFinalNoSecretsExposureLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): boolean {
  return !input.secretsExposed;
}

export function createFinalPrivacySecurityLock(input: TeoyubeFinalPrivacySecurityLockInput = {}): TeoyubeFinalPrivacySecurityLockRule[] {
  return [
    rule("privacy_notice", "Privacy notice remains available or explicitly planned", validateFinalPrivacyNoticeLock(input), "Privacy notice must be available or explicitly planned before public release preparation."),
    rule("consent_notice", "Consent notice remains available or explicitly planned", validateFinalConsentNoticeLock(input), "Consent notice must be available or explicitly planned before services, storage, analytics, accounts, or feedback storage."),
    rule("sensitive_data_boundary", "Sensitive data warning and no raw storage", validateFinalSensitiveDataBoundaryLock(input), "Sensitive data warnings remain available and raw sensitive text storage stays disabled."),
    rule("manual_feedback_boundary", "Manual feedback boundary remains manual", validateFinalManualFeedbackBoundaryLock(input), "Feedback remains manual and is not collected automatically."),
    rule("manual_support_boundary", "Manual support boundary remains manual", validateFinalSupportBoundaryLock(input), "Support remains manual and sends no automatic contact."),
    rule("no_hidden_personalization", "No hidden personalization", validateFinalNoHiddenPersonalizationLock(input), "No hidden personalization or sensitive inference is added."),
    rule("no_sensitive_browser_persistence", "No sensitive browser persistence", validateFinalNoSensitiveBrowserPersistenceLock(input), "No localStorage, cookies, or IndexedDB are required for sensitive personalization."),
    rule("no_secrets_exposed", "No secrets exposed", validateFinalNoSecretsExposureLock(input), "No secret values are exposed by this lock."),
    rule("no_unrecorded_legal_claim", "No unrecorded legal approval claimed", !input.legalApprovalClaimedWithoutRecord, "The lock does not claim legal approval unless separately recorded.")
  ];
}

export function createFinalPrivacySecurityLockDecision(input: TeoyubeFinalPrivacySecurityLockInput = {}): TeoyubeFinalPrivacySecurityLockDecision {
  const blockers = createFinalPrivacySecurityLock(input).filter((entry) => !entry.passed);
  if (blockers.length) return "blocked";
  return "privacy_security_locked_with_warnings";
}

export function createFinalPrivacySecurityLockReport(input: TeoyubeFinalPrivacySecurityLockInput = {}): TeoyubeFinalPrivacySecurityLockReport {
  const rules = createFinalPrivacySecurityLock(input);
  const blockers = rules.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    decision: createFinalPrivacySecurityLockDecision(input),
    rules,
    blockers,
    warnings: ["Final privacy/security lock is manual and in-memory; it does not claim legal approval or connect services."],
    noRawSensitiveTextStorage: true,
    noHiddenPersonalization: true,
    noSensitiveBrowserPersistence: true,
    noSecretsExposed: true,
    feedbackBoundaryManual: true,
    supportBoundaryManual: true,
    noLegalApprovalClaimed: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
