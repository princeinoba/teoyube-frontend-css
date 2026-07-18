import {
  createTeoyubeLearningSummary,
  recommendPersonalizationAdjustments
} from "./ai-learning-architecture";
import type {
  TeoyubeLearningSignal,
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationContext,
  TeoyubePersonalizationDecision,
  TeoyubePersonalizationProfile,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import {
  DEFAULT_TEOYUBE_PERSONALIZATION_CONSENT,
  getPersonalizationSafetyStatus,
  shouldDisablePersonalization,
  validatePersonalizationDecision,
  validatePersonalizationConsent
} from "./personalization-safety";
import {
  createSignalFromProductionInput,
  mergeTeoyubePersonalizationSignals,
  summarizeTeoyubePersonalizationSignals
} from "./personalization-signals";
import type {
  TigProductionInput,
  TigProductionResponse
} from "./production-response-contracts";

function createDecisionId(): string {
  return `personalization_decision_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createPersonalizationContext(params?: {
  input?: TigProductionInput;
  profile?: TeoyubePersonalizationProfile;
  consent?: Partial<TeoyubePersonalizationConsent>;
  signals?: TeoyubePersonalizationSignal[];
  learningSignals?: TeoyubeLearningSignal[];
}): TeoyubePersonalizationContext {
  const consent = validatePersonalizationConsent(
    params?.consent || params?.profile?.consent || DEFAULT_TEOYUBE_PERSONALIZATION_CONSENT
  );
  const inputSignal = params?.input ? [createSignalFromProductionInput(params.input)] : [];
  const signals = mergeTeoyubePersonalizationSignals([
    ...(params?.profile?.recommendationHistory || []).map((item) => ({
      source: "system_preview" as const,
      surface: item.surface,
      selectedWordId: item.selectedWordId,
      selectedClusterId: item.selectedClusterId,
      selectedScriptureReference: item.selectedScriptureReference,
      selectedPrayerSequenceId: item.selectedPrayerSequenceId,
      selectedActionStepId: item.selectedActionStepId,
      confidenceLabel: item.confidenceLabel,
      fallbackUsed: item.fallbackUsed,
      timestamp: item.createdAt,
      weight: item.fallbackUsed ? 0.35 : 0.65
    })),
    ...inputSignal,
    ...(params?.signals || [])
  ]);

  return {
    profile: params?.profile,
    consent,
    signals,
    learningSignals: params?.learningSignals || [],
    growthPatterns: params?.profile?.growthPatterns || [],
    surfacePreferences: params?.profile?.surfacePreferences || [],
    recommendationHistory: params?.profile?.recommendationHistory || [],
    source: "preview",
    generatedAt: new Date().toISOString()
  };
}

export function getPersonalizedTigRecommendationHints(
  context: TeoyubePersonalizationContext
): string[] {
  if (shouldDisablePersonalization(context)) {
    return ["Personalization is disabled or unavailable; use the standard Scripture-anchored production path."];
  }

  const summary = summarizeTeoyubePersonalizationSignals(context.signals);
  const learningSummary = createTeoyubeLearningSummary(context.signals);
  const hints: string[] = [];

  if (summary.topWordIds[0]) {
    hints.push(`Familiar Teoyube word theme: ${summary.topWordIds[0].value}.`);
  }

  if (summary.topClusterIds[0]) {
    hints.push(`Recurring promise cluster: ${summary.topClusterIds[0].value}.`);
  }

  if (summary.topScriptureReferences[0]) {
    hints.push(`Scripture anchor to consider surfacing: ${summary.topScriptureReferences[0].value}.`);
  }

  if (learningSummary.fallbackCount > 0) {
    hints.push("Fallback appeared in prior signals; keep the response broad, gentle, and clearly explained.");
  }

  return hints.length
    ? hints
    : ["No strong personalization pattern yet; use the standard Scripture-anchored production path."];
}

export function applyPersonalizationToProductionInput(
  input: TigProductionInput,
  context: TeoyubePersonalizationContext
): TigProductionInput {
  const hints = getPersonalizedTigRecommendationHints(context);

  return {
    ...input,
    context: {
      ...input.context,
      personalizationPreview: {
        enabled: !shouldDisablePersonalization(context),
        hints,
        generatedAt: context.generatedAt
      }
    }
  };
}

export function applyPersonalizationToProductionResponse(
  response: TigProductionResponse,
  context: TeoyubePersonalizationContext
): TigProductionResponse {
  const decision = runTeoyubePersonalizationPreview(response.input, context).decision;

  return {
    ...response,
    explanation: {
      ...response.explanation,
      warnings: [
        ...response.explanation.warnings,
        ...decision.warnings,
        "Personalization preview did not override Scripture anchoring."
      ]
    },
    event: {
      ...response.event,
      metadata: {
        ...response.event.metadata,
        personalizationPreview: {
          enabled: decision.enabled,
          applied: decision.applied,
          hints: decision.hints
        }
      }
    }
  };
}

export function explainPersonalizationDecision(
  decision: TeoyubePersonalizationDecision
): string {
  const safety = validatePersonalizationDecision(decision);
  const state = decision.enabled ? "enabled" : "disabled";
  const mode = decision.previewOnly ? "preview-only" : "active";

  return `${decision.explanation} Personalization is ${state} and ${mode}. Safety status: ${safety.status}.`;
}

export function runTeoyubePersonalizationPreview(
  input: TigProductionInput,
  context: TeoyubePersonalizationContext
): {
  context: TeoyubePersonalizationContext;
  decision: TeoyubePersonalizationDecision;
  safety: ReturnType<typeof getPersonalizationSafetyStatus>;
} {
  const safety = getPersonalizationSafetyStatus(context);
  const disabled = shouldDisablePersonalization(context);
  const adjustments = disabled ? [] : recommendPersonalizationAdjustments(context);
  const hints = getPersonalizedTigRecommendationHints(context);
  const decision: TeoyubePersonalizationDecision = {
    id: createDecisionId(),
    enabled: !disabled,
    applied: false,
    previewOnly: true,
    scriptureAnchored: true,
    input,
    hints,
    adjustments,
    explanation:
      "Phase 6.1 personalization preview can suggest safer continuity hints, but it does not store data, call AI models, or override Scripture anchors.",
    warnings: safety.warnings,
    createdAt: new Date().toISOString()
  };

  return {
    context,
    decision,
    safety
  };
}
