import type { TeoyubePublicQaStatus } from "./public-launch-privacy-consent-contracts";

export type TeoyubePublicPrivacyConsentQaResults = {
  privacyCopyPresent?: boolean;
  termsCopyPresent?: boolean;
  termsReviewed?: boolean;
  consentCopyPresentWherePersonalizationAppears?: boolean;
  sensitiveInformationWarningPresent?: boolean;
  noHiddenPersonalization?: boolean;
  noRawSensitiveStorageImplied?: boolean;
  analyticsNotImpliedActive?: boolean;
  persistenceNotImpliedActive?: boolean;
  liveAiNotImpliedActive?: boolean;
  noDivineCertaintyClaimed?: boolean;
};

function normalize(results: TeoyubePublicPrivacyConsentQaResults = {}): Required<TeoyubePublicPrivacyConsentQaResults> {
  return {
    privacyCopyPresent: results.privacyCopyPresent ?? true,
    termsCopyPresent: results.termsCopyPresent ?? true,
    termsReviewed: results.termsReviewed ?? true,
    consentCopyPresentWherePersonalizationAppears: results.consentCopyPresentWherePersonalizationAppears ?? true,
    sensitiveInformationWarningPresent: results.sensitiveInformationWarningPresent ?? true,
    noHiddenPersonalization: results.noHiddenPersonalization ?? true,
    noRawSensitiveStorageImplied: results.noRawSensitiveStorageImplied ?? true,
    analyticsNotImpliedActive: results.analyticsNotImpliedActive ?? true,
    persistenceNotImpliedActive: results.persistenceNotImpliedActive ?? true,
    liveAiNotImpliedActive: results.liveAiNotImpliedActive ?? true,
    noDivineCertaintyClaimed: results.noDivineCertaintyClaimed ?? true
  };
}

export function getPublicPrivacyConsentQaChecklist() {
  return [
    { id: "privacy_copy_present", label: "Privacy copy present", required: true },
    { id: "terms_copy_present_reviewed", label: "Terms copy present and reviewed", required: true },
    { id: "consent_copy_present", label: "Consent copy present where personalization appears", required: true },
    { id: "sensitive_info_warning_present", label: "Sensitive information warning present", required: true },
    { id: "no_hidden_personalization", label: "No hidden personalization appears", required: true },
    { id: "no_raw_sensitive_storage", label: "Raw sensitive storage is not implied", required: true },
    { id: "disabled_services_accurate", label: "Analytics, persistence, and live AI are not implied as active", required: true },
    { id: "no_divine_certainty", label: "No divine certainty is claimed", required: true }
  ];
}

export function validatePublicPrivacyCopyQa(results: TeoyubePublicPrivacyConsentQaResults = {}): boolean {
  return normalize(results).privacyCopyPresent;
}

export function validatePublicTermsCopyQa(results: TeoyubePublicPrivacyConsentQaResults = {}): boolean {
  const state = normalize(results);
  return state.termsCopyPresent && state.termsReviewed;
}

export function validatePublicConsentCopyQa(results: TeoyubePublicPrivacyConsentQaResults = {}): boolean {
  return normalize(results).consentCopyPresentWherePersonalizationAppears;
}

export function validatePublicSensitiveInfoWarningQa(results: TeoyubePublicPrivacyConsentQaResults = {}): boolean {
  return normalize(results).sensitiveInformationWarningPresent;
}

export function validatePublicNoHiddenPersonalizationQa(results: TeoyubePublicPrivacyConsentQaResults = {}): boolean {
  return normalize(results).noHiddenPersonalization;
}

export function getPublicPrivacyConsentQaBlockers(results: TeoyubePublicPrivacyConsentQaResults = {}) {
  const state = normalize(results);
  return [
    !state.privacyCopyPresent ? { id: "privacy_qa_missing_privacy_copy", label: "Privacy copy", reason: "Privacy copy is missing.", requiredAction: "Add privacy copy before public launch.", riskLevel: "critical" as const } : undefined,
    !state.termsCopyPresent || !state.termsReviewed ? { id: "privacy_qa_terms_missing_or_unreviewed", label: "Terms copy", reason: "Terms copy is missing or unreviewed.", requiredAction: "Add and review terms copy before public launch.", riskLevel: "critical" as const } : undefined,
    !state.consentCopyPresentWherePersonalizationAppears ? { id: "privacy_qa_missing_consent_copy", label: "Consent copy", reason: "Consent copy is missing where personalization appears.", requiredAction: "Add consent copy before public launch.", riskLevel: "critical" as const } : undefined,
    !state.sensitiveInformationWarningPresent ? { id: "privacy_qa_missing_sensitive_warning", label: "Sensitive information warning", reason: "Sensitive information warning is missing.", requiredAction: "Add warning before public launch.", riskLevel: "critical" as const } : undefined,
    !state.noHiddenPersonalization ? { id: "privacy_qa_hidden_personalization", label: "Hidden personalization", reason: "Hidden personalization appears.", requiredAction: "Remove hidden personalization.", riskLevel: "critical" as const } : undefined,
    !state.noRawSensitiveStorageImplied ? { id: "privacy_qa_raw_sensitive_storage", label: "Raw sensitive storage", reason: "Raw sensitive storage is implied.", requiredAction: "Clarify raw sensitive storage is not enabled by default.", riskLevel: "critical" as const } : undefined,
    !state.analyticsNotImpliedActive || !state.persistenceNotImpliedActive || !state.liveAiNotImpliedActive ? { id: "privacy_qa_disabled_services_implied_active", label: "Disabled production services", reason: "Analytics, persistence, or live AI are implied as active.", requiredAction: "Correct copy before public launch.", riskLevel: "critical" as const } : undefined,
    !state.noDivineCertaintyClaimed ? { id: "privacy_qa_divine_certainty_claimed", label: "Divine certainty", reason: "Copy claims divine certainty.", requiredAction: "Remove divine certainty claim.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
}

export function getPublicPrivacyConsentQaWarnings(results: TeoyubePublicPrivacyConsentQaResults = {}) {
  const blockers = getPublicPrivacyConsentQaBlockers(results);
  return blockers.length === 0
    ? [{ id: "privacy_qa_owner_legal_review", label: "Owner/legal review", message: "Privacy, terms, consent, and warnings are draft-ready but still need human review before launch.", recommendedAction: "Complete owner/legal review before public launch.", riskLevel: "medium" as const }]
    : [];
}

export function createPublicPrivacyConsentQaReport(results: TeoyubePublicPrivacyConsentQaResults = {}) {
  const blockers = getPublicPrivacyConsentQaBlockers(results);
  const warnings = getPublicPrivacyConsentQaWarnings(results);
  const status: TeoyubePublicQaStatus = blockers.length > 0 ? "blocked" : warnings.length > 0 ? "needs_review" : "pass";
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    status,
    results: normalize(results),
    checklist: getPublicPrivacyConsentQaChecklist(),
    blockers,
    warnings,
    noHiddenPersonalization: normalize(results).noHiddenPersonalization,
    noRawSensitiveStorageImplied: normalize(results).noRawSensitiveStorageImplied,
    noDisabledServiceImpliedActive: normalize(results).analyticsNotImpliedActive && normalize(results).persistenceNotImpliedActive && normalize(results).liveAiNotImpliedActive,
    noDivineCertaintyClaimed: normalize(results).noDivineCertaintyClaimed,
    noPublicLaunchPerformed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
