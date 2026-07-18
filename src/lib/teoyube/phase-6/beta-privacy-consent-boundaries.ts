export type TeoyubeBetaPrivacyConsentBoundaryInput = Partial<{
  privacyNoticeVisible: boolean;
  consentBoundaryVisible: boolean;
  sensitiveDataWarningVisible: boolean;
  hiddenPersonalizationEnabled: boolean;
  unapprovedStorageEnabled: boolean;
  unapprovedAnalyticsEnabled: boolean;
  feedbackStorageEnabled: boolean;
  externalServicesRequired: boolean;
}>;

export type TeoyubeBetaPrivacyConsentBoundaryRule = {
  id: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeBetaPrivacyConsentBoundaryReport = {
  valid: boolean;
  rules: TeoyubeBetaPrivacyConsentBoundaryRule[];
  blockers: string[];
  warnings: string[];
  privacyNoticeVisible: boolean;
  consentBoundaryVisible: boolean;
  sensitiveDataWarningVisible: boolean;
  noHiddenPersonalization: boolean;
  noUnapprovedStorage: boolean;
  noAnalytics: boolean;
  noFeedbackStorage: boolean;
  noExternalServicesRequired: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

function rule(id: string, label: string, passed: boolean, details: string): TeoyubeBetaPrivacyConsentBoundaryRule {
  return { id, label, passed, details };
}

export function validateBetaPrivacyNoticeBoundary(input: TeoyubeBetaPrivacyConsentBoundaryInput = {}): TeoyubeBetaPrivacyConsentBoundaryRule {
  return rule("privacy_notice_visible", "Privacy notice visible", input.privacyNoticeVisible !== false, "Privacy notice must be visible before participation.");
}

export function validateBetaConsentBoundary(input: TeoyubeBetaPrivacyConsentBoundaryInput = {}): TeoyubeBetaPrivacyConsentBoundaryRule {
  return rule("consent_boundary_visible", "Consent boundary visible", input.consentBoundaryVisible !== false, "Consent boundary must be visible before participation.");
}

export function validateBetaSensitiveDataBoundary(input: TeoyubeBetaPrivacyConsentBoundaryInput = {}): TeoyubeBetaPrivacyConsentBoundaryRule {
  return rule("sensitive_data_warning_visible", "Sensitive data warning visible", input.sensitiveDataWarningVisible !== false, "Participants must be warned not to submit sensitive personal information.");
}

export function validateBetaNoHiddenPersonalizationBoundary(input: TeoyubeBetaPrivacyConsentBoundaryInput = {}): TeoyubeBetaPrivacyConsentBoundaryRule {
  return rule("no_hidden_personalization", "No hidden personalization", !input.hiddenPersonalizationEnabled, "Hidden personalization is not allowed.");
}

export function validateBetaNoUnapprovedStorageBoundary(input: TeoyubeBetaPrivacyConsentBoundaryInput = {}): TeoyubeBetaPrivacyConsentBoundaryRule {
  return rule("no_unapproved_storage", "No unapproved storage", !input.unapprovedStorageEnabled && !input.feedbackStorageEnabled, "Storage and feedback storage remain disabled.");
}

export function validateBetaNoUnapprovedAnalyticsBoundary(input: TeoyubeBetaPrivacyConsentBoundaryInput = {}): TeoyubeBetaPrivacyConsentBoundaryRule {
  return rule("no_unapproved_analytics", "No unapproved analytics", !input.unapprovedAnalyticsEnabled, "Analytics remain disabled.");
}

export function createBetaPrivacyConsentBoundaryRules(input: TeoyubeBetaPrivacyConsentBoundaryInput = {}): TeoyubeBetaPrivacyConsentBoundaryRule[] {
  return [
    validateBetaPrivacyNoticeBoundary(input),
    validateBetaConsentBoundary(input),
    validateBetaSensitiveDataBoundary(input),
    validateBetaNoHiddenPersonalizationBoundary(input),
    validateBetaNoUnapprovedStorageBoundary(input),
    validateBetaNoUnapprovedAnalyticsBoundary(input),
    rule("no_external_services_required", "No external services required", !input.externalServicesRequired, "External services are not required for Phase 6.1 planning.")
  ];
}

export function createBetaPrivacyConsentBoundaryReport(input: TeoyubeBetaPrivacyConsentBoundaryInput = {}): TeoyubeBetaPrivacyConsentBoundaryReport {
  const rules = createBetaPrivacyConsentBoundaryRules(input);
  const failed = rules.filter((entry) => !entry.passed);
  return {
    valid: failed.length === 0,
    rules,
    blockers: failed.map((entry) => `${entry.label}: ${entry.details}`),
    warnings: ["Privacy and consent copy should be manually reviewed before Phase 6.2 dry-run simulation."],
    privacyNoticeVisible: input.privacyNoticeVisible !== false,
    consentBoundaryVisible: input.consentBoundaryVisible !== false,
    sensitiveDataWarningVisible: input.sensitiveDataWarningVisible !== false,
    noHiddenPersonalization: !input.hiddenPersonalizationEnabled,
    noUnapprovedStorage: !input.unapprovedStorageEnabled && !input.feedbackStorageEnabled,
    noAnalytics: !input.unapprovedAnalyticsEnabled,
    noFeedbackStorage: !input.feedbackStorageEnabled,
    noExternalServicesRequired: !input.externalServicesRequired,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

