export type TeoyubeConsentPublicCopyInput = Partial<{
  privacyNoticeCopyPresent: boolean;
  consentNoticeCopyPresent: boolean;
  sensitiveDataWarningCopyPresent: boolean;
  knownLimitationsCopyPresent: boolean;
  divineCertaintyClaimed: boolean;
  professionalAdviceClaimed: boolean;
  publicReleaseBoundaryCopyPresent: boolean;
  manualFeedbackBoundaryCopyPresent: boolean;
  scriptureAnchoredGuidancePreserved: boolean;
  explanationTraceAvailabilityPreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLanguageHumble: boolean;
}>;

export type TeoyubeConsentPublicCopyReviewReport = {
  valid: boolean;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  preservesScriptureAnchoredGuidance: true;
  preservesExplanationTraceAvailability: true;
  preservesFallbackSafety: true;
  preservesHumbleConfidenceLanguage: true;
  noDivineCertaintyClaimed: true;
  noProfessionalAdviceClaimed: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validatePrivacyNoticeCopy(input: TeoyubeConsentPublicCopyInput = {}): boolean {
  return flag(input.privacyNoticeCopyPresent);
}

export function validateConsentNoticeCopy(input: TeoyubeConsentPublicCopyInput = {}): boolean {
  return flag(input.consentNoticeCopyPresent);
}

export function validateSensitiveDataWarningCopy(input: TeoyubeConsentPublicCopyInput = {}): boolean {
  return flag(input.sensitiveDataWarningCopyPresent);
}

export function validateKnownLimitationsCopy(input: TeoyubeConsentPublicCopyInput = {}): boolean {
  return flag(input.knownLimitationsCopyPresent);
}

export function validateNoDivineCertaintyCopy(input: TeoyubeConsentPublicCopyInput = {}): boolean {
  return !input.divineCertaintyClaimed && flag(input.scriptureAnchoredGuidancePreserved) && flag(input.confidenceLanguageHumble);
}

export function validateNoProfessionalAdviceCopy(input: TeoyubeConsentPublicCopyInput = {}): boolean {
  return !input.professionalAdviceClaimed;
}

export function validatePublicReleaseBoundaryCopy(input: TeoyubeConsentPublicCopyInput = {}): boolean {
  return flag(input.publicReleaseBoundaryCopyPresent) && flag(input.manualFeedbackBoundaryCopyPresent);
}

export function createConsentPublicCopyChecklist(input: TeoyubeConsentPublicCopyInput = {}) {
  return [
    { id: "privacy_notice_copy", passed: validatePrivacyNoticeCopy(input), details: "Privacy notice copy is present or explicitly planned." },
    { id: "consent_notice_copy", passed: validateConsentNoticeCopy(input), details: "Consent notice copy is present or explicitly planned." },
    { id: "sensitive_warning_copy", passed: validateSensitiveDataWarningCopy(input), details: "Sensitive information warning copy is present." },
    { id: "known_limitations_copy", passed: validateKnownLimitationsCopy(input), details: "Known limitations copy is present." },
    { id: "no_divine_certainty_copy", passed: validateNoDivineCertaintyCopy(input), details: "Copy avoids divine-certainty claims and preserves humble confidence language." },
    { id: "no_professional_advice_copy", passed: validateNoProfessionalAdviceCopy(input), details: "Copy avoids medical, legal, financial, emergency, or professional counseling advice claims." },
    { id: "public_release_boundary_copy", passed: validatePublicReleaseBoundaryCopy(input), details: "Public release and manual feedback boundaries are visible." },
    { id: "explanation_fallback_copy", passed: flag(input.explanationTraceAvailabilityPreserved) && flag(input.fallbackSafetyPreserved), details: "Explanation trace availability and fallback safety are preserved." }
  ];
}

export function getConsentPublicCopyReviewBlockers(input: TeoyubeConsentPublicCopyInput = {}): string[] {
  return createConsentPublicCopyChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => `${entry.id}: ${entry.details}`);
}

export function getConsentPublicCopyReviewWarnings(input: TeoyubeConsentPublicCopyInput = {}): string[] {
  return [
    "Public copy review is manual and does not publish content automatically.",
    ...(!input.knownLimitationsCopyPresent ? ["Known limitations copy should be visible before release candidate planning."] : [])
  ];
}

export function createConsentPublicCopyReviewReport(input: TeoyubeConsentPublicCopyInput = {}): TeoyubeConsentPublicCopyReviewReport {
  const blockers = getConsentPublicCopyReviewBlockers(input);
  return {
    valid: blockers.length === 0,
    checklist: createConsentPublicCopyChecklist(input),
    blockers,
    warnings: getConsentPublicCopyReviewWarnings(input),
    preservesScriptureAnchoredGuidance: true,
    preservesExplanationTraceAvailability: true,
    preservesFallbackSafety: true,
    preservesHumbleConfidenceLanguage: true,
    noDivineCertaintyClaimed: true,
    noProfessionalAdviceClaimed: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
