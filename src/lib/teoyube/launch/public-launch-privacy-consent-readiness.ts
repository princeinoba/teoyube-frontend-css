export type TeoyubePublicLaunchPrivacyConsentInput = {
  consentControlsExist?: boolean;
  personalizationConsentAware?: boolean;
  rawSensitiveTextStored?: boolean;
  hiddenPersonalizationIntroduced?: boolean;
  analyticsConnectedWithoutConsentStrategy?: boolean;
  persistenceConnectedWithoutPrivacyConsentStrategy?: boolean;
  liveAiEnabledWithoutSafetyConsentReview?: boolean;
  asksForSensitivePersonalInformation?: boolean;
  publicPrivacyNoticesRequired?: boolean;
};

function normalize(input: TeoyubePublicLaunchPrivacyConsentInput = {}): Required<TeoyubePublicLaunchPrivacyConsentInput> {
  return {
    consentControlsExist: input.consentControlsExist ?? true,
    personalizationConsentAware: input.personalizationConsentAware ?? true,
    rawSensitiveTextStored: input.rawSensitiveTextStored ?? false,
    hiddenPersonalizationIntroduced: input.hiddenPersonalizationIntroduced ?? false,
    analyticsConnectedWithoutConsentStrategy: input.analyticsConnectedWithoutConsentStrategy ?? false,
    persistenceConnectedWithoutPrivacyConsentStrategy: input.persistenceConnectedWithoutPrivacyConsentStrategy ?? false,
    liveAiEnabledWithoutSafetyConsentReview: input.liveAiEnabledWithoutSafetyConsentReview ?? false,
    asksForSensitivePersonalInformation: input.asksForSensitivePersonalInformation ?? false,
    publicPrivacyNoticesRequired: input.publicPrivacyNoticesRequired ?? true
  };
}

export function getPublicLaunchPrivacyConsentChecklist() {
  return [
    { id: "consent_controls_exist", label: "Consent controls exist", required: true },
    { id: "personalization_consent_aware", label: "Personalization is consent-aware", required: true },
    { id: "raw_sensitive_text_not_stored", label: "Raw sensitive text is not stored by default", required: true },
    { id: "hidden_personalization_not_introduced", label: "Hidden personalization is not introduced", required: true },
    { id: "analytics_requires_consent_strategy", label: "Analytics are not connected without consent strategy", required: true },
    { id: "persistence_requires_privacy_consent", label: "Persistence is not connected without privacy/consent strategy", required: true },
    { id: "live_ai_requires_safety_consent", label: "Live AI is not enabled without safety and consent review", required: true },
    { id: "sensitive_information_not_requested", label: "Users are not asked to submit sensitive personal information", required: true },
    { id: "public_privacy_notice_required", label: "Public privacy notices are required before launch", required: true }
  ];
}

export function validatePublicLaunchConsentReadiness(input: TeoyubePublicLaunchPrivacyConsentInput = {}): boolean {
  const state = normalize(input);
  return state.consentControlsExist && state.personalizationConsentAware && !state.analyticsConnectedWithoutConsentStrategy && !state.persistenceConnectedWithoutPrivacyConsentStrategy && !state.liveAiEnabledWithoutSafetyConsentReview;
}

export function validatePublicLaunchPrivacyBoundaries(input: TeoyubePublicLaunchPrivacyConsentInput = {}): boolean {
  const state = normalize(input);
  return !state.rawSensitiveTextStored && !state.asksForSensitivePersonalInformation && state.publicPrivacyNoticesRequired;
}

export function validateNoHiddenPersonalizationForPublicLaunch(input: TeoyubePublicLaunchPrivacyConsentInput = {}): boolean {
  return !normalize(input).hiddenPersonalizationIntroduced;
}

export function validateNoRawSensitiveStorageForPublicLaunch(input: TeoyubePublicLaunchPrivacyConsentInput = {}): boolean {
  return !normalize(input).rawSensitiveTextStored;
}

export function createPublicLaunchPrivacyConsentReport(input: TeoyubePublicLaunchPrivacyConsentInput = {}) {
  const state = normalize(input);
  const blockers = [
    !state.consentControlsExist ? { id: "public_privacy_consent_controls_missing", label: "Consent controls", reason: "Consent controls must exist before public launch preparation advances.", requiredAction: "Restore consent controls.", riskLevel: "critical" as const } : undefined,
    !state.personalizationConsentAware ? { id: "public_privacy_personalization_not_consent_aware", label: "Personalization consent", reason: "Personalization must remain consent-aware.", requiredAction: "Make personalization visible, reversible, and consent-aware.", riskLevel: "critical" as const } : undefined,
    state.rawSensitiveTextStored ? { id: "public_privacy_raw_sensitive_text", label: "Raw sensitive text", reason: "Raw sensitive text must not be stored by default.", requiredAction: "Disable raw sensitive text storage.", riskLevel: "critical" as const } : undefined,
    state.hiddenPersonalizationIntroduced ? { id: "public_privacy_hidden_personalization", label: "Hidden personalization", reason: "Hidden personalization must not be introduced.", requiredAction: "Remove hidden personalization.", riskLevel: "critical" as const } : undefined,
    state.analyticsConnectedWithoutConsentStrategy ? { id: "public_privacy_analytics_without_consent", label: "Analytics consent", reason: "Analytics must not be connected without consent strategy.", requiredAction: "Keep analytics disconnected.", riskLevel: "critical" as const } : undefined,
    state.persistenceConnectedWithoutPrivacyConsentStrategy ? { id: "public_privacy_persistence_without_strategy", label: "Persistence consent", reason: "Persistence must not be connected without privacy/consent strategy.", requiredAction: "Keep persistence disconnected.", riskLevel: "critical" as const } : undefined,
    state.liveAiEnabledWithoutSafetyConsentReview ? { id: "public_privacy_live_ai_without_review", label: "Live AI consent", reason: "Live AI must not be enabled without safety and consent review.", requiredAction: "Keep live AI disabled.", riskLevel: "critical" as const } : undefined,
    state.asksForSensitivePersonalInformation ? { id: "public_privacy_sensitive_info_requested", label: "Sensitive information", reason: "Users must not be asked to submit sensitive personal information before terms and storage rules are finalized.", requiredAction: "Remove sensitive information request.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    checklist: getPublicLaunchPrivacyConsentChecklist(),
    state,
    blockers,
    warnings: [{ id: "public_privacy_notice_required", label: "Public privacy notice", message: "Public privacy notices are required before public launch.", recommendedAction: "Complete Privacy, Terms, Consent Copy & Public QA Checklist in 5.2.", riskLevel: "medium" as const }],
    consentReady: validatePublicLaunchConsentReadiness(state),
    privacyBoundariesReady: validatePublicLaunchPrivacyBoundaries(state),
    noHiddenPersonalization: validateNoHiddenPersonalizationForPublicLaunch(state),
    noRawSensitiveStorage: validateNoRawSensitiveStorageForPublicLaunch(state),
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
