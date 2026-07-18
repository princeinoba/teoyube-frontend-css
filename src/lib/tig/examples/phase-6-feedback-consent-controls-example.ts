import type { TeoyubePersonalizationProfile } from "../personalization-contracts";
import {
  createDefaultTeoyubeConsentControlState,
  disableTeoyubePersonalization,
  enableSessionOnlyPersonalization,
  explainConsentControlState,
  resetTeoyubePersonalizationPreferences
} from "../personalization-consent-controls";
import {
  applyFeedbackToPreferenceProfile,
  applyFeedbackToSignalStore,
  createFeedbackDecision,
  explainPersonalizationFeedbackDecision,
  normalizePersonalizationFeedback,
  sanitizePersonalizationFeedback
} from "../personalization-feedback-engine";
import {
  createFeedbackLearningSignal,
  createSignalFromPersonalizationFeedback
} from "../personalization-feedback-signal-bridge";
import {
  createPersonalizationFeedbackEvent,
  createPersonalizationResetEvent
} from "../personalization-feedback-events";
import { createInMemoryTeoyubeSignalStore } from "../personalization-signal-store";

export function runPhase6FeedbackConsentControlsExample() {
  const defaultState = createDefaultTeoyubeConsentControlState();
  const sessionStateResult = enableSessionOnlyPersonalization(defaultState);
  const sessionState = sessionStateResult.state;
  const store = createInMemoryTeoyubeSignalStore({
    scope: "session",
    privacyLevel: "session_only",
    sessionId: "feedback_demo_session"
  });
  const profile: TeoyubePersonalizationProfile = {
    consent: sessionState.consent,
    preferences: [
      {
        key: "word:word_strength",
        value: "word_strength",
        source: "system_preview",
        confidence: 0.72,
        updatedAt: new Date().toISOString()
      }
    ],
    surfacePreferences: [],
    growthPatterns: [],
    recommendationHistory: [],
    dataStatus: "preview_only",
    updatedAt: new Date().toISOString()
  };
  const moreLikeThis = normalizePersonalizationFeedback({
    type: "more_like_this",
    target: {
      kind: "word",
      id: "word_strength",
      label: "Strength"
    },
    source: "preview_panel",
    surface: "promise_cluster",
    weight: 0.8,
    storesRawText: true,
    rawTextPreview: "This private text should be redacted."
  });
  const lessLikeThis = normalizePersonalizationFeedback({
    type: "less_like_this",
    target: {
      kind: "preference_hint",
      id: "word:word_strength",
      label: "Strength hint"
    },
    source: "preview_panel",
    surface: "promise_cluster",
    weight: 0.3
  });
  const saveScripture = normalizePersonalizationFeedback({
    type: "save_scripture",
    target: {
      kind: "scripture_anchor",
      id: "scripture_isaiah_40_31",
      label: "Isaiah 40:31"
    },
    source: "response_panel",
    surface: "promise_cluster"
  });
  const sanitizedMoreLikeThis = sanitizePersonalizationFeedback(moreLikeThis, sessionState.consent);
  const moreLikeSignal = createSignalFromPersonalizationFeedback(moreLikeThis, sessionState.consent);
  const savedScriptureSignal = createSignalFromPersonalizationFeedback(saveScripture, sessionState.consent);
  const moreLikeWrite = applyFeedbackToSignalStore(store, moreLikeThis, sessionState.consent);
  const scriptureWrite = applyFeedbackToSignalStore(store, saveScripture, sessionState.consent);
  const reducedProfile = applyFeedbackToPreferenceProfile(profile, lessLikeThis, sessionState.consent);
  const moreLikeDecision = createFeedbackDecision(moreLikeThis, profile, sessionState.consent);
  const moreLikeExplanation = explainPersonalizationFeedbackDecision(moreLikeDecision);
  const learningSignal = createFeedbackLearningSignal(saveScripture, sessionState.consent);
  const feedbackEvent = createPersonalizationFeedbackEvent(
    moreLikeWrite.feedback,
    moreLikeWrite
  );
  const resetResult = resetTeoyubePersonalizationPreferences(sessionState);
  const resetEvent = createPersonalizationResetEvent(resetResult);
  const disabledState = disableTeoyubePersonalization(resetResult.state);

  return {
    defaultState,
    sessionState,
    store,
    profile,
    feedback: {
      moreLikeThis,
      lessLikeThis,
      saveScripture,
      sanitizedMoreLikeThis
    },
    signals: {
      moreLikeSignal,
      savedScriptureSignal,
      learningSignal
    },
    writes: {
      moreLikeWrite,
      scriptureWrite
    },
    reducedProfile,
    moreLikeDecision,
    moreLikeExplanation,
    events: {
      feedbackEvent,
      resetEvent
    },
    resetResult,
    disabledState,
    consentExplanation: explainConsentControlState(disabledState.state)
  };
}
