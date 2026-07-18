import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationContext,
  TeoyubePersonalizationDecision,
  TeoyubePersonalizationSafetyStatus,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";

const DEFAULT_GUARDRAILS = [
  "Personalization must be consent-aware.",
  "Raw private text is not stored by default.",
  "Personalization may suggest hints but must not override Scripture anchors.",
  "Personalization must not claim divine certainty.",
  "Fallback remains available when personalization is unavailable or unsafe."
];

const RISKY_TEXT_PATTERNS = [
  "diagnose",
  "medical",
  "legal",
  "financial",
  "emergency",
  "guaranteed",
  "god told me",
  "thus says"
];

export const DEFAULT_TEOYUBE_PERSONALIZATION_CONSENT: TeoyubePersonalizationConsent = {
  personalizationEnabled: false,
  learningEnabled: false,
  allowRawTextStorage: false,
  allowedScopes: [],
  source: "system_default"
};

function cleanText(value?: string): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || undefined;
}

function containsRiskyText(value: string): boolean {
  const normalized = value.toLowerCase();
  return RISKY_TEXT_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function validatePersonalizationConsent(
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationConsent {
  return {
    ...DEFAULT_TEOYUBE_PERSONALIZATION_CONSENT,
    ...consent,
    personalizationEnabled: Boolean(consent?.personalizationEnabled),
    learningEnabled: Boolean(consent?.learningEnabled),
    allowRawTextStorage: Boolean(consent?.allowRawTextStorage),
    allowedScopes: Array.isArray(consent?.allowedScopes) ? consent.allowedScopes : [],
    updatedAt: cleanText(consent?.updatedAt),
    source: consent?.source || "system_default"
  };
}

export function sanitizePersonalizationSignal(
  signal: TeoyubePersonalizationSignal
): TeoyubePersonalizationSignal {
  return {
    ...signal,
    emotionTag: cleanText(signal.emotionTag)?.toLowerCase(),
    intent: cleanText(signal.intent),
    selectedWordId: cleanText(signal.selectedWordId),
    selectedClusterId: cleanText(signal.selectedClusterId),
    selectedScriptureReference: cleanText(signal.selectedScriptureReference),
    selectedPrayerSequenceId: cleanText(signal.selectedPrayerSequenceId),
    selectedActionStepId: cleanText(signal.selectedActionStepId),
    fallbackReasons: (signal.fallbackReasons || []).map((reason) => cleanText(reason)).filter(
      (reason): reason is string => Boolean(reason)
    ),
    storesRawText: false,
    rawTextPreview: undefined,
    metadata: {
      ...signal.metadata,
      sanitized: true
    }
  };
}

export function canUsePersonalizationSignal(
  signal: TeoyubePersonalizationSignal,
  consent?: Partial<TeoyubePersonalizationConsent>
): boolean {
  const normalizedConsent = validatePersonalizationConsent(consent);

  if (!normalizedConsent.personalizationEnabled) return false;
  if (!normalizedConsent.allowedScopes.includes("signals")) return false;
  if (signal.storesRawText && !normalizedConsent.allowRawTextStorage) return false;
  if (signal.rawTextPreview && containsRiskyText(signal.rawTextPreview)) return false;

  return true;
}

export function validatePersonalizationDecision(
  decision: TeoyubePersonalizationDecision
): TeoyubePersonalizationSafetyStatus {
  const warnings: string[] = [];
  const reasons: string[] = [];
  const text = [decision.explanation, ...decision.hints, ...decision.warnings].join(" ");

  if (!decision.scriptureAnchored) {
    reasons.push("Personalization decision is not Scripture-anchored.");
  }

  if (!decision.previewOnly) {
    warnings.push("Phase 6.1 decisions must remain preview-only.");
  }

  if (containsRiskyText(text)) {
    reasons.push("Personalization decision contains overclaiming or unsafe advice language.");
  }

  if (!decision.enabled) {
    warnings.push("Personalization decision is disabled.");
  }

  return {
    safe: reasons.length === 0,
    disabled: !decision.enabled || reasons.length > 0,
    status: reasons.length > 0 ? "disabled" : warnings.length > 0 ? "warning" : "safe",
    reasons,
    warnings,
    guardrails: DEFAULT_GUARDRAILS
  };
}

export function shouldDisablePersonalization(
  context: TeoyubePersonalizationContext
): boolean {
  const consent = validatePersonalizationConsent(context.consent);
  if (!consent.personalizationEnabled) return true;
  if (!consent.learningEnabled) return true;
  if (!consent.allowedScopes.includes("signals")) return true;
  if (context.signals.some((signal) => signal.storesRawText && !consent.allowRawTextStorage)) {
    return true;
  }
  return false;
}

export function getPersonalizationSafetyStatus(
  context: TeoyubePersonalizationContext
): TeoyubePersonalizationSafetyStatus {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const consent = validatePersonalizationConsent(context.consent);

  if (!consent.personalizationEnabled) {
    reasons.push("Personalization consent is not enabled.");
  }

  if (!consent.learningEnabled) {
    reasons.push("Learning consent is not enabled.");
  }

  if (!consent.allowedScopes.includes("signals")) {
    reasons.push("Signal use is not included in consent scopes.");
  }

  if (context.signals.some((signal) => signal.storesRawText)) {
    warnings.push("One or more signals attempted to store raw text.");
  }

  if (context.signals.some((signal) => signal.rawTextPreview && containsRiskyText(signal.rawTextPreview))) {
    reasons.push("One or more signals contained sensitive or unsafe raw text.");
  }

  if (!context.signals.length) {
    warnings.push("No personalization signals are available.");
  }

  return {
    safe: reasons.length === 0,
    disabled: reasons.length > 0,
    status: reasons.length > 0 ? "disabled" : warnings.length > 0 ? "warning" : "safe",
    reasons,
    warnings,
    guardrails: DEFAULT_GUARDRAILS
  };
}
