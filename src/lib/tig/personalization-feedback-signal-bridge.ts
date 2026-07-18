import type {
  TeoyubeLearningSignal,
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import { scoreTeoyubeLearningRelevance } from "./ai-learning-architecture";
import {
  sanitizePersonalizationFeedback
} from "./personalization-feedback-engine";
import type {
  TeoyubePersonalizationFeedback
} from "./personalization-feedback-contracts";
import {
  addTeoyubePersonalizationSignal,
  addTeoyubePersonalizationSignals
} from "./personalization-signal-store";
import type {
  TeoyubeSignalStoreAdapter,
  TeoyubeSignalStoreWriteResult
} from "./personalization-signal-store-contracts";
import { normalizeTeoyubePersonalizationSignal } from "./personalization-signals";

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function signalTypeFor(feedback: TeoyubePersonalizationFeedback): TeoyubePersonalizationSignal["type"] {
  if (feedback.type === "save_scripture") return "scripture_saved";
  if (feedback.type === "save_word") return "word_selected";
  if (feedback.type === "save_prayer" || feedback.type === "repeat_prayer_sequence") {
    return "prayer_theme_repeated";
  }
  if (feedback.type === "complete_action_step") return "action_completed";
  if (feedback.type === "fallback_helpful" || feedback.type === "fallback_not_helpful") {
    return "fallback_frequency";
  }
  return "confidence_feedback";
}

export function createSignalFromPersonalizationFeedback(
  feedbackInput: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationSignal {
  const feedback = sanitizePersonalizationFeedback(feedbackInput, consent);
  const target = feedback.target;

  return normalizeTeoyubePersonalizationSignal({
    id: createId("feedback_signal"),
    type: signalTypeFor(feedback),
    source: "manual_feedback",
    timestamp: feedback.createdAt,
    surface: feedback.surface || target.surface,
    selectedWordId: target.kind === "word" ? target.id : undefined,
    selectedClusterId: target.kind === "promise_cluster" ? target.id : undefined,
    selectedScriptureReference: target.kind === "scripture_anchor" ? target.label || target.id : undefined,
    selectedPrayerSequenceId: target.kind === "prayer_sequence" ? target.id : undefined,
    selectedActionStepId: target.kind === "action_step" ? target.id : undefined,
    fallbackUsed: feedback.type === "fallback_helpful" || feedback.type === "fallback_not_helpful",
    fallbackReasons:
      feedback.type === "fallback_not_helpful"
        ? ["fallback_not_helpful"]
        : feedback.type === "fallback_helpful"
          ? ["fallback_helpful"]
          : [],
    confidenceScore:
      feedback.type === "more_like_this" || feedback.type.startsWith("save_")
        ? 0.72
        : feedback.type === "less_like_this" || feedback.type === "not_relevant"
          ? 0.28
          : 0.5,
    weight: feedback.weight,
    storesRawText: false,
    metadata: {
      feedbackId: feedback.id,
      feedbackType: feedback.type,
      targetKind: target.kind,
      userControlled: true,
      rawTextRedacted: true
    }
  });
}

export function storeFeedbackAsPersonalizationSignal(
  store: TeoyubeSignalStoreAdapter,
  feedback: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubeSignalStoreWriteResult {
  return addTeoyubePersonalizationSignal(
    store,
    createSignalFromPersonalizationFeedback(feedback, consent),
    consent
  );
}

export function storeFeedbackBatchAsPersonalizationSignals(
  store: TeoyubeSignalStoreAdapter,
  feedbackItems: Array<Partial<TeoyubePersonalizationFeedback>>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubeSignalStoreWriteResult {
  return addTeoyubePersonalizationSignals(
    store,
    feedbackItems.map((feedback) => createSignalFromPersonalizationFeedback(feedback, consent)),
    consent
  );
}

export function createFeedbackLearningSignal(
  feedback: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubeLearningSignal {
  const signal = createSignalFromPersonalizationFeedback(feedback, consent);
  const patternKey =
    signal.selectedClusterId ||
    signal.selectedWordId ||
    signal.selectedScriptureReference ||
    signal.surface ||
    "feedback_control";

  return {
    id: createId("feedback_learning_signal"),
    type:
      signal.type === "fallback_frequency"
        ? "fallback_reduction"
        : signal.selectedPrayerSequenceId
          ? "prayer_familiarity"
          : signal.selectedScriptureReference
            ? "scripture_relevance"
            : signal.surface
              ? "surface_preference"
              : "confidence_adjustment",
    sourceSignalIds: [signal.id],
    patternKey,
    score: scoreTeoyubeLearningRelevance(signal),
    explanation:
      "Feedback learning signal was created from explicit user control and remains preview-only.",
    suggestedAdjustment:
      signal.type === "fallback_frequency"
        ? "reduce_repeated_fallback"
        : signal.selectedPrayerSequenceId
          ? "recommend_familiar_prayer"
          : signal.selectedScriptureReference
          ? "surface_scripture_anchor"
            : "prefer_word_theme",
    scriptureAnchored: Boolean(signal.selectedScriptureReference),
    createdAt: new Date().toISOString()
  };
}
