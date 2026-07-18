import type { TeoyubePersonalizationConsent } from "./personalization-contracts";
import {
  createTeoyubePreferenceDecision,
  deriveTeoyubePreferenceHints
} from "./personalization-preference-engine";
import type {
  TeoyubePreferenceApplicationResult,
  TeoyubePreferenceHint,
  TeoyubePreferenceProfile
} from "./personalization-preference-contracts";
import type { TigProductionInput } from "./production-response-contracts";

export function applyPreferenceHintsToProductionInput(
  input: TigProductionInput,
  hints: TeoyubePreferenceHint[],
  consent?: Partial<TeoyubePersonalizationConsent>
): TigProductionInput {
  return {
    ...input,
    context: {
      ...input.context,
      preferenceHints: {
        enabled: Boolean(consent?.personalizationEnabled),
        softHintsOnly: true,
        scriptureAnchorMustRemain: true,
        hints: hints.map((hint) => ({
          type: hint.type,
          key: hint.key,
          value: hint.value,
          confidence: hint.confidence
        })),
        generatedAt: new Date().toISOString()
      }
    }
  };
}

export function applyPreferenceProfileToProductionInput(
  input: TigProductionInput,
  profile: TeoyubePreferenceProfile,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePreferenceApplicationResult {
  const decision = createTeoyubePreferenceDecision(profile, consent || profile.consent);
  const hints = decision.enabled ? deriveTeoyubePreferenceHints(profile) : [];

  return {
    input: applyPreferenceHintsToProductionInput(input, hints, consent || profile.consent),
    decision,
    appliedHintCount: hints.length
  };
}
