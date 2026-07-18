import type { TeoyubePersonalizationConsent } from "./personalization-contracts";
import { validatePersonalizationConsent } from "./personalization-safety";
import type {
  TeoyubePreferenceHint,
  TeoyubePreferenceSafetyStatus
} from "./personalization-preference-contracts";

const GUARDRAILS = [
  "Preference hints require consent.",
  "Preference hints are soft hints only.",
  "Preference hints must not override Scripture anchoring.",
  "Preference hints must not claim divine certainty.",
  "Raw private text is not used in preference hints."
];

function containsUnsafeLanguage(value: string): boolean {
  const normalized = value.toLowerCase();
  return ["god told me", "thus says", "guaranteed", "diagnose", "medical", "legal", "financial", "emergency"].some(
    (pattern) => normalized.includes(pattern)
  );
}

export function validatePreferenceConsent(
  consent?: Partial<TeoyubePersonalizationConsent>
): {
  consent: TeoyubePersonalizationConsent;
  allowed: boolean;
  reasons: string[];
  warnings: string[];
} {
  const normalized = validatePersonalizationConsent(consent);
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (!normalized.personalizationEnabled) reasons.push("Personalization consent is not enabled.");
  if (!normalized.allowedScopes.includes("preferences")) {
    reasons.push("Preference scope is not included in consent.");
  }
  if (!normalized.learningEnabled) {
    warnings.push("Learning is disabled; use preferences as session-safe preview hints only.");
  }

  return {
    consent: normalized,
    allowed: reasons.length === 0,
    reasons,
    warnings
  };
}

export function validatePreferenceHintsSafety(
  hints: TeoyubePreferenceHint[],
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePreferenceSafetyStatus {
  const consentStatus = validatePreferenceConsent(consent);
  const reasons = [...consentStatus.reasons];
  const warnings = [...consentStatus.warnings];

  hints.forEach((hint) => {
    if (!hint.softHintOnly) reasons.push(`Preference hint ${hint.id} is not marked as softHintOnly.`);
    if (containsUnsafeLanguage(`${hint.label} ${hint.explanation}`)) {
      reasons.push(`Preference hint ${hint.id} contains unsafe or overclaiming language.`);
    }
    if (!hint.sourceSignalIds.length) {
      warnings.push(`Preference hint ${hint.id} has no source signal evidence.`);
    }
  });

  return {
    safe: reasons.length === 0,
    blocked: reasons.length > 0,
    status: reasons.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "safe",
    reasons,
    warnings,
    guardrails: GUARDRAILS
  };
}

export function shouldBlockPreferenceUse(
  hints: TeoyubePreferenceHint[],
  consent?: Partial<TeoyubePersonalizationConsent>
): boolean {
  return validatePreferenceHintsSafety(hints, consent).blocked;
}
