export type TeoyubeBetaScriptureExplanationFallbackQaInput = {
  promiseShownWithoutScriptureAnchor?: boolean;
  recommendationShownWithoutExplanationTrace?: boolean;
  fallbackStateEmpty?: boolean;
  fallbackStateUnsafe?: boolean;
  confidenceLabelMissing?: boolean;
  divineCertaintyLanguagePresent?: boolean;
  professionalAdviceLanguagePresent?: boolean;
  debugPayloadVisible?: boolean;
  displayedText?: string;
};

export type TeoyubeBetaScriptureExplanationFallbackQaCheck = {
  id: string;
  label: string;
  passed: boolean;
  blocker: boolean;
  details: string;
};

export type TeoyubeBetaScriptureExplanationFallbackQaReport = {
  valid: boolean;
  checks: TeoyubeBetaScriptureExplanationFallbackQaCheck[];
  blockers: string[];
  warnings: string[];
  noDivineCertaintyLanguage: boolean;
  noProfessionalAdviceLanguage: boolean;
  noDebugPayloadVisible: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

const DIVINE_CERTAINTY_PHRASES = ["god told you", "god guarantees", "will definitely be your calling", "must be your calling"];
const PROFESSIONAL_ADVICE_PHRASES = ["medical advice", "legal advice", "financial advice", "emergency advice", "diagnose", "treat your condition"];

function textIncludesAny(value: string | undefined, phrases: string[]): boolean {
  const normalized = (value || "").toLowerCase();
  return phrases.some((phrase) => normalized.includes(phrase));
}

function check(id: string, label: string, passed: boolean, details: string, blocker = true): TeoyubeBetaScriptureExplanationFallbackQaCheck {
  return { id, label, passed, blocker, details };
}

export function validateBetaScriptureAnchorVisibility(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): TeoyubeBetaScriptureExplanationFallbackQaCheck {
  return check("beta_scripture_anchor_visibility", "Recommendations do not show promises without Scripture anchors", !input.promiseShownWithoutScriptureAnchor, "A promise shown without Scripture support blocks beta readiness.");
}

export function validateBetaExplanationTraceVisibility(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): TeoyubeBetaScriptureExplanationFallbackQaCheck {
  return check("beta_explanation_trace_visibility", "Recommendations keep explanation traces visible", !input.recommendationShownWithoutExplanationTrace, "TIG, prayer, calling, and action flows need visible explanation traces or fallback reasons.");
}

export function validateBetaFallbackSafety(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): TeoyubeBetaScriptureExplanationFallbackQaCheck {
  return check("beta_fallback_safety", "Fallback states are non-empty and safe", !input.fallbackStateEmpty && !input.fallbackStateUnsafe, "Fallbacks must not invent unsupported promises, prayers, callings, or certainty claims.");
}

export function validateBetaConfidenceLabelVisibility(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): TeoyubeBetaScriptureExplanationFallbackQaCheck {
  return check("beta_confidence_label_visibility", "Confidence labels remain visible", !input.confidenceLabelMissing, "Recommendation surfaces must preserve visible confidence or uncertainty boundaries.");
}

export function validateBetaNoDivineCertaintyLanguage(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): TeoyubeBetaScriptureExplanationFallbackQaCheck {
  const unsafe = input.divineCertaintyLanguagePresent || textIncludesAny(input.displayedText, DIVINE_CERTAINTY_PHRASES);
  return check("beta_no_divine_certainty_language", "No divine-certainty language appears", !unsafe, "Rewrite over-certain spiritual claims before beta readiness.");
}

export function validateBetaNoProfessionalAdviceLanguage(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): TeoyubeBetaScriptureExplanationFallbackQaCheck {
  const unsafe = input.professionalAdviceLanguagePresent || textIncludesAny(input.displayedText, PROFESSIONAL_ADVICE_PHRASES);
  return check("beta_no_professional_advice_language", "No professional-advice language appears", !unsafe, "Remove medical, legal, financial, emergency, or other professional advice claims.");
}

export function createBetaScriptureExplanationFallbackChecklist(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): TeoyubeBetaScriptureExplanationFallbackQaCheck[] {
  return [
    validateBetaScriptureAnchorVisibility(input),
    validateBetaExplanationTraceVisibility(input),
    validateBetaFallbackSafety(input),
    validateBetaConfidenceLabelVisibility(input),
    validateBetaNoDivineCertaintyLanguage(input),
    validateBetaNoProfessionalAdviceLanguage(input),
    check("beta_no_debug_payload", "No debug payload is visible to normal users", !input.debugPayloadVisible, "Debug payloads must remain hidden from normal beta surfaces.")
  ];
}

export function getBetaScriptureExplanationFallbackQaBlockers(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): string[] {
  return createBetaScriptureExplanationFallbackChecklist(input)
    .filter((entry) => entry.blocker && !entry.passed)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getBetaScriptureExplanationFallbackQaWarnings(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): string[] {
  return createBetaScriptureExplanationFallbackChecklist(input)
    .filter((entry) => !entry.blocker && !entry.passed)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function createBetaScriptureExplanationFallbackQaReport(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}): TeoyubeBetaScriptureExplanationFallbackQaReport {
  const blockers = getBetaScriptureExplanationFallbackQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checks: createBetaScriptureExplanationFallbackChecklist(input),
    blockers,
    warnings: getBetaScriptureExplanationFallbackQaWarnings(input),
    noDivineCertaintyLanguage: validateBetaNoDivineCertaintyLanguage(input).passed,
    noProfessionalAdviceLanguage: validateBetaNoProfessionalAdviceLanguage(input).passed,
    noDebugPayloadVisible: !input.debugPayloadVisible,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
