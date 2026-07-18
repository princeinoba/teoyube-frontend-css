import { getPreviewEnvironmentFeatureFlags } from "./preview-environment-package";

export type TeoyubePreviewSafetyReviewInput = {
  scriptureAnchoringRequired?: boolean;
  explanationPathRequired?: boolean;
  fallbackPathEnabled?: boolean;
  safetyGuardrailsEnabled?: boolean;
  consentControlsEnabled?: boolean;
  personalizationConsentAware?: boolean;
  rawTextStorageDisabled?: boolean;
  debugOutputHidden?: boolean;
  externalAnalyticsNotSending?: boolean;
  productionPersistenceDisabled?: boolean;
  liveAiDisabled?: boolean;
  noDivineCertaintyClaims?: boolean;
};

export type TeoyubePreviewSafetyCheck = {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  details: string;
};

function merged(input: TeoyubePreviewSafetyReviewInput = {}): Required<TeoyubePreviewSafetyReviewInput> {
  const flags = getPreviewEnvironmentFeatureFlags();

  return {
    scriptureAnchoringRequired: input.scriptureAnchoringRequired ?? flags.scriptureAnchoringRequired,
    explanationPathRequired: input.explanationPathRequired ?? flags.explanationPathRequired,
    fallbackPathEnabled: input.fallbackPathEnabled ?? flags.fallbackPathEnabled,
    safetyGuardrailsEnabled: input.safetyGuardrailsEnabled ?? flags.safetyGuardrailsEnabled,
    consentControlsEnabled: input.consentControlsEnabled ?? flags.consentControlsEnabled,
    personalizationConsentAware: input.personalizationConsentAware ?? true,
    rawTextStorageDisabled: input.rawTextStorageDisabled ?? !flags.rawTextStorageEnabled,
    debugOutputHidden: input.debugOutputHidden ?? !flags.debugOutputVisibleToUsers,
    externalAnalyticsNotSending: input.externalAnalyticsNotSending ?? !flags.externalAnalyticsSendingEnabled,
    productionPersistenceDisabled: input.productionPersistenceDisabled ?? !flags.productionDatabasePersistenceEnabled,
    liveAiDisabled: input.liveAiDisabled ?? !flags.liveAiOrchestrationEnabled,
    noDivineCertaintyClaims: input.noDivineCertaintyClaims ?? true
  };
}

function check(id: string, label: string, passed: boolean, details: string): TeoyubePreviewSafetyCheck {
  return { id, label, passed, required: true, details };
}

export function validatePreviewScriptureAnchoring(input: TeoyubePreviewSafetyReviewInput = {}) {
  const data = merged(input);
  return check("preview_scripture_anchoring", "Scripture anchoring required", data.scriptureAnchoringRequired, "Scripture anchoring must remain required.");
}

export function validatePreviewExplanationPaths(input: TeoyubePreviewSafetyReviewInput = {}) {
  const data = merged(input);
  return check("preview_explanation_paths", "Explanation paths required", data.explanationPathRequired, "Explanation paths must remain required.");
}

export function validatePreviewFallbackSafety(input: TeoyubePreviewSafetyReviewInput = {}) {
  const data = merged(input);
  return check("preview_fallback_safety", "Fallback path enabled", data.fallbackPathEnabled && data.safetyGuardrailsEnabled, "Fallback and guardrails must remain enabled.");
}

export function validatePreviewConsentSafety(input: TeoyubePreviewSafetyReviewInput = {}) {
  const data = merged(input);
  return check("preview_consent_safety", "Consent controls enabled", data.consentControlsEnabled && data.personalizationConsentAware, "Personalization remains consent-aware.");
}

export function validatePreviewPrivacyBoundaries(input: TeoyubePreviewSafetyReviewInput = {}) {
  const data = merged(input);
  return check("preview_privacy_boundaries", "Privacy boundaries safe", data.rawTextStorageDisabled && data.debugOutputHidden, "Raw text storage disabled and debug output hidden.");
}

export function validatePreviewNoExternalSending(input: TeoyubePreviewSafetyReviewInput = {}) {
  const data = merged(input);
  return check("preview_no_external_sending", "No external analytics or persistence", data.externalAnalyticsNotSending && data.productionPersistenceDisabled, "External analytics and production persistence remain disabled.");
}

export function validatePreviewNoLiveAiOrchestration(input: TeoyubePreviewSafetyReviewInput = {}) {
  const data = merged(input);
  return check("preview_no_live_ai", "No live AI orchestration", data.liveAiDisabled, "Live AI orchestration remains disabled.");
}

export function runPreviewSafetyReview(input: TeoyubePreviewSafetyReviewInput = {}) {
  const data = merged(input);
  return [
    validatePreviewScriptureAnchoring(data),
    validatePreviewExplanationPaths(data),
    validatePreviewFallbackSafety(data),
    validatePreviewConsentSafety(data),
    validatePreviewPrivacyBoundaries(data),
    validatePreviewNoExternalSending(data),
    validatePreviewNoLiveAiOrchestration(data),
    check("preview_no_divine_certainty", "No divine certainty claims", data.noDivineCertaintyClaims, "Do not claim divine certainty.")
  ];
}

export function createPreviewSafetyReviewReport(input: TeoyubePreviewSafetyReviewInput = {}) {
  const checks = runPreviewSafetyReview(input);
  const blockers = checks.filter((entry) => entry.required && !entry.passed);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : "pass",
    checks,
    checkCount: checks.length,
    passedCheckCount: checks.filter((entry) => entry.passed).length,
    blockers,
    warnings: blockers.map((entry) => entry.details),
    generatedAt: new Date().toISOString()
  };
}

