import {
  createPersonalizationContext,
  applyPersonalizationToProductionInput,
  explainPersonalizationDecision,
  runTeoyubePersonalizationPreview
} from "./personalization-engine";
import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationContext,
  TeoyubePersonalizationDecision,
  TeoyubePersonalizationProfile
} from "./personalization-contracts";
import type { TeoyubePersonalizationFeedback } from "./personalization-feedback-contracts";
import {
  createFeedbackDecision,
  shouldDisablePersonalizationFromFeedback
} from "./personalization-feedback-engine";
import { createPersonalizationContextFromSignalStore } from "./personalization-context-from-store";
import {
  storeProductionEventAsPersonalizationSignal
} from "./personalization-event-signal-bridge";
import { validateSignalStoreConsent } from "./personalization-signal-store-safety";
import type {
  TeoyubeSignalStoreAdapter,
  TeoyubeSignalStoreWriteResult
} from "./personalization-signal-store-contracts";
import { createTigProductionEvent } from "./production-events";
import { runTeoyubeProductionIntelligence } from "./production-intelligence-service";
import type {
  TigProductionEvent,
  TigProductionInput,
  TigProductionResponse
} from "./production-response-contracts";

export function createPersonalizedProductionInput(
  input: TigProductionInput,
  personalizationContext: TeoyubePersonalizationContext
): TigProductionInput {
  return applyPersonalizationToProductionInput(input, personalizationContext);
}

export function createPersonalizedProductionExplanation(
  response: TigProductionResponse,
  personalizationDecision: TeoyubePersonalizationDecision
): {
  summary: string;
  hints: string[];
  adjustments: TeoyubePersonalizationDecision["adjustments"];
  explanation: string;
} {
  return {
    summary:
      "Personalization preview was evaluated after Scripture anchoring and did not replace the production recommendation.",
    hints: personalizationDecision.hints,
    adjustments: personalizationDecision.adjustments,
    explanation: `${explainPersonalizationDecision(personalizationDecision)} Production Scripture anchor: ${
      response.selection.scriptureAnchor?.label || "Scripture"
    }.`
  };
}

export function createPersonalizationAwareEvent(
  input: TigProductionInput,
  response: TigProductionResponse,
  personalizationDecision: TeoyubePersonalizationDecision
): TigProductionEvent {
  const event = createTigProductionEvent(input, response);

  return {
    ...event,
    eventName: "tig.production.personalization.previewed",
    metadata: {
      ...event.metadata,
      personalizationPreview: {
        decisionId: personalizationDecision.id,
        enabled: personalizationDecision.enabled,
        applied: personalizationDecision.applied,
        previewOnly: personalizationDecision.previewOnly,
        scriptureAnchored: personalizationDecision.scriptureAnchored,
        hintCount: personalizationDecision.hints.length,
        adjustmentCount: personalizationDecision.adjustments.length,
        warnings: personalizationDecision.warnings
      }
    }
  };
}

export function runPersonalizedTeoyubeProductionPreview(
  input: TigProductionInput,
  personalizationContext: TeoyubePersonalizationContext
): {
  input: TigProductionInput;
  productionResponse: TigProductionResponse;
  personalizationDecision: TeoyubePersonalizationDecision;
  personalizationExplanation: ReturnType<typeof createPersonalizedProductionExplanation>;
  personalizationEvent: TigProductionEvent;
} {
  const personalizedInput = createPersonalizedProductionInput(input, personalizationContext);
  const productionResponse = runTeoyubeProductionIntelligence(personalizedInput);
  const preview = runTeoyubePersonalizationPreview(personalizedInput, personalizationContext);
  const personalizationExplanation = createPersonalizedProductionExplanation(
    productionResponse,
    preview.decision
  );
  const personalizationEvent = createPersonalizationAwareEvent(
    personalizedInput,
    productionResponse,
    preview.decision
  );

  return {
    input: personalizedInput,
    productionResponse,
    personalizationDecision: preview.decision,
    personalizationExplanation,
    personalizationEvent
  };
}

export function recordProductionResponseSignal(
  store: TeoyubeSignalStoreAdapter,
  input: TigProductionInput,
  response: TigProductionResponse,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubeSignalStoreWriteResult {
  const event = createTigProductionEvent(input, response);
  return storeProductionEventAsPersonalizationSignal(store, event, consent);
}

export function runPersonalizedProductionPreviewWithSignalStore(
  input: TigProductionInput,
  store: TeoyubeSignalStoreAdapter,
  consent?: Partial<TeoyubePersonalizationConsent>
): ReturnType<typeof runPersonalizedTeoyubeProductionPreview> & {
  signalStoreWrite: TeoyubeSignalStoreWriteResult;
} {
  const personalizationContext = createPersonalizationContextFromSignalStore(
    store,
    {
      surfaces: input.surface ? [input.surface] : undefined,
      sessionId: input.sessionId,
      userId: input.userId,
      limit: 25
    },
    consent
  );
  const preview = runPersonalizedTeoyubeProductionPreview(input, personalizationContext);
  const signalStoreWrite = recordProductionResponseSignal(
    store,
    preview.input,
    preview.productionResponse,
    consent
  );

  return {
    ...preview,
    signalStoreWrite
  };
}

function getPreferenceHintsFromProfile(profile?: TeoyubePersonalizationProfile): string[] {
  if (!profile) return [];

  return [
    ...profile.preferences.map((preference) => `${preference.key}: ${String(preference.value)}`),
    ...profile.surfacePreferences
      .filter((preference) => preference.preferred)
      .map((preference) => `Preferred surface: ${preference.surface}`)
  ];
}

export function createPreviewSafePersonalizedInput(
  input: TigProductionInput,
  context: TeoyubePersonalizationContext,
  profile?: TeoyubePersonalizationProfile,
  consent?: Partial<TeoyubePersonalizationConsent>
): TigProductionInput {
  const consentStatus = validateSignalStoreConsent(consent || context.consent);

  if (!consentStatus.allowed) {
    return {
      ...input,
      context: {
        ...input.context,
        personalizationPreview: {
          enabled: false,
          reason: "Preview personalization is disabled by consent.",
          generatedAt: new Date().toISOString()
        }
      }
    };
  }

  const profileContext = createPersonalizationContext({
    input,
    profile,
    consent: consentStatus.consent,
    signals: context.signals,
    learningSignals: context.learningSignals
  });
  const personalizedInput = applyPersonalizationToProductionInput(input, profileContext);

  return {
    ...personalizedInput,
    context: {
      ...personalizedInput.context,
      preferencePreview: {
        hints: getPreferenceHintsFromProfile(profile),
        softHintsOnly: true,
        scriptureAnchorMustRemain: true,
        generatedAt: new Date().toISOString()
      }
    }
  };
}

export function createPreviewPersonalizationExplanation(
  response: TigProductionResponse,
  profile?: TeoyubePersonalizationProfile
): {
  summary: string;
  preferenceHints: string[];
  explanation: string;
} {
  const preferenceHints = getPreferenceHintsFromProfile(profile);

  return {
    summary:
      "Preference-aware preview considered soft hints while preserving the production Scripture anchor.",
    preferenceHints,
    explanation: `Production Scripture anchor: ${
      response.selection.scriptureAnchor?.label || "Scripture"
    }. Preference hints used: ${preferenceHints.length}.`
  };
}

export function createPreviewPersonalizationEvent(
  input: TigProductionInput,
  response: TigProductionResponse,
  profile?: TeoyubePersonalizationProfile
): TigProductionEvent {
  const event = createTigProductionEvent(input, response);

  return {
    ...event,
    eventName: "tig.production.preference_preview.created",
    metadata: {
      ...event.metadata,
      preferencePreview: {
        softHintsOnly: true,
        preferenceHintCount: getPreferenceHintsFromProfile(profile).length,
        scriptureAnchored: Boolean(response.selection.scriptureAnchor),
        persistenceConnected: false
      }
    }
  };
}

export function runPersonalizedProductionPreviewWithPreferences(
  input: TigProductionInput,
  context: TeoyubePersonalizationContext,
  profile?: TeoyubePersonalizationProfile,
  consent?: Partial<TeoyubePersonalizationConsent>
): {
  input: TigProductionInput;
  productionResponse: TigProductionResponse;
  personalizationDecision: TeoyubePersonalizationDecision;
  personalizationExplanation: ReturnType<typeof createPreviewPersonalizationExplanation>;
  personalizationEvent: TigProductionEvent;
} {
  const personalizedInput = createPreviewSafePersonalizedInput(input, context, profile, consent);
  const productionResponse = runTeoyubeProductionIntelligence(personalizedInput);
  const previewContext = createPersonalizationContext({
    input: personalizedInput,
    profile,
    consent: consent || context.consent,
    signals: context.signals,
    learningSignals: context.learningSignals
  });
  const preview = runTeoyubePersonalizationPreview(personalizedInput, previewContext);
  const personalizationExplanation = createPreviewPersonalizationExplanation(
    productionResponse,
    profile
  );
  const personalizationEvent = createPreviewPersonalizationEvent(
    personalizedInput,
    productionResponse,
    profile
  );

  return {
    input: personalizedInput,
    productionResponse,
    personalizationDecision: preview.decision,
    personalizationExplanation,
    personalizationEvent
  };
}

export function createFeedbackAwareProductionInput(
  input: TigProductionInput,
  profile: TeoyubePersonalizationProfile | undefined,
  feedback: Array<Partial<TeoyubePersonalizationFeedback>>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TigProductionInput {
  const disabledByFeedback = feedback.some(shouldDisablePersonalizationFromFeedback);
  const context = createPersonalizationContext({
    input,
    profile,
    consent,
    signals: []
  });

  if (disabledByFeedback) {
    return {
      ...input,
      context: {
        ...input.context,
        personalizationPreview: {
          enabled: false,
          reason: "Personalization preview disabled by explicit feedback.",
          feedbackAware: true,
          generatedAt: new Date().toISOString()
        }
      }
    };
  }

  const previewInput = createPreviewSafePersonalizedInput(input, context, profile, consent);

  return {
    ...previewInput,
    context: {
      ...previewInput.context,
      feedbackAwarePreview: {
        feedbackCount: feedback.length,
        hardOverridesAllowed: false,
        scriptureAnchorMustRemain: true,
        generatedAt: new Date().toISOString()
      }
    }
  };
}

export function createFeedbackAwarePersonalizationExplanation(
  response: TigProductionResponse,
  feedback: Array<Partial<TeoyubePersonalizationFeedback>>,
  decision: TeoyubePersonalizationDecision
): {
  summary: string;
  feedbackCount: number;
  disabledByFeedback: boolean;
  explanation: string;
  warnings: string[];
} {
  const disabledByFeedback = feedback.some(shouldDisablePersonalizationFromFeedback);

  return {
    summary:
      "Feedback-aware preview considered explicit user controls without replacing the production Scripture anchor.",
    feedbackCount: feedback.length,
    disabledByFeedback,
    explanation: disabledByFeedback
      ? "User feedback disabled personalized preview, so the baseline Scripture-anchored path should remain primary."
      : `Feedback was treated as a soft control signal. Scripture anchor: ${
          response.selection.scriptureAnchor?.label || "Scripture"
        }.`,
    warnings: decision.warnings
  };
}

export function runFeedbackAwarePersonalizedPreview(
  input: TigProductionInput,
  context: TeoyubePersonalizationContext,
  profile: TeoyubePersonalizationProfile | undefined,
  feedback: Array<Partial<TeoyubePersonalizationFeedback>>,
  consent?: Partial<TeoyubePersonalizationConsent>
): {
  input: TigProductionInput;
  productionResponse: TigProductionResponse;
  personalizationDecision: TeoyubePersonalizationDecision;
  feedbackDecision: ReturnType<typeof createFeedbackDecision>;
  personalizationExplanation: ReturnType<typeof createFeedbackAwarePersonalizationExplanation>;
  personalizationEvent: TigProductionEvent;
} {
  const feedbackAwareInput = createFeedbackAwareProductionInput(input, profile, feedback, consent);
  const productionResponse = runTeoyubeProductionIntelligence(feedbackAwareInput);
  const previewContext = createPersonalizationContext({
    input: feedbackAwareInput,
    profile,
    consent: consent || context.consent,
    signals: context.signals,
    learningSignals: context.learningSignals
  });
  const preview = runTeoyubePersonalizationPreview(feedbackAwareInput, previewContext);
  const feedbackDecision = createFeedbackDecision(feedback[0] || { type: "unknown" }, profile, consent);
  const personalizationExplanation = createFeedbackAwarePersonalizationExplanation(
    productionResponse,
    feedback,
    preview.decision
  );
  const personalizationEvent = {
    ...createPreviewPersonalizationEvent(feedbackAwareInput, productionResponse, profile),
    eventName: "tig.production.feedback_aware_preview.created",
    metadata: {
      ...createPreviewPersonalizationEvent(feedbackAwareInput, productionResponse, profile).metadata,
      feedbackCount: feedback.length,
      disabledByFeedback: feedback.some(shouldDisablePersonalizationFromFeedback)
    }
  };

  return {
    input: feedbackAwareInput,
    productionResponse,
    personalizationDecision: preview.decision,
    feedbackDecision,
    personalizationExplanation,
    personalizationEvent
  };
}
