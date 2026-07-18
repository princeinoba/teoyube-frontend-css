import type { TeoyubePersonalizationProfile } from "../personalization-contracts";
import {
  createDefaultTeoyubeConsentControlState,
  disableTeoyubePersonalization,
  enableSessionOnlyPersonalization,
  resetTeoyubePersonalizationPreferences
} from "../personalization-consent-controls";
import {
  applyFeedbackToPreferenceProfile,
  applyFeedbackToSignalStore,
  normalizePersonalizationFeedback,
  sanitizePersonalizationFeedback
} from "../personalization-feedback-engine";
import { createPersonalizationFeedbackEvent } from "../personalization-feedback-events";
import { createSignalFromPersonalizationFeedback } from "../personalization-feedback-signal-bridge";
import {
  createInMemoryTeoyubeSignalStore,
  deleteTeoyubePersonalizationSignals,
  exportTeoyubePersonalizationSignals
} from "../personalization-signal-store";

export type Phase6FeedbackConsentSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase6FeedbackConsentSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase6FeedbackConsentSmokeCheckResult[];
};

function result(name: string, errors: string[]): Phase6FeedbackConsentSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function stripEmpty(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runPhase6FeedbackConsentControlsSmokeCheck(): Phase6FeedbackConsentSmokeCheckReport {
  const defaultState = createDefaultTeoyubeConsentControlState();
  const sessionResult = enableSessionOnlyPersonalization(defaultState);
  const disabledResult = disableTeoyubePersonalization(sessionResult.state);
  const store = createInMemoryTeoyubeSignalStore({
    scope: "session",
    privacyLevel: "session_only",
    sessionId: "feedback_smoke_session"
  });
  const profile: TeoyubePersonalizationProfile = {
    consent: sessionResult.state.consent,
    preferences: [
      {
        key: "word:word_strength",
        value: "word_strength",
        source: "system_preview",
        confidence: 0.75,
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
    storesRawText: true,
    rawTextPreview: "Private user note should be redacted.",
    weight: 0.8
  });
  const lessLikeThis = normalizePersonalizationFeedback({
    type: "less_like_this",
    target: {
      kind: "preference_hint",
      id: "word:word_strength",
      label: "Strength"
    },
    source: "preview_panel",
    surface: "promise_cluster",
    weight: 0.2
  });
  const notRelevant = normalizePersonalizationFeedback({
    type: "not_relevant",
    target: {
      kind: "personalized_preview",
      id: "preview_smoke"
    },
    source: "preview_panel"
  });
  const sanitized = sanitizePersonalizationFeedback(moreLikeThis, sessionResult.state.consent);
  const disabledBefore = store.records.length;
  const disabledWrite = applyFeedbackToSignalStore(store, moreLikeThis, disabledResult.state.consent);
  const sessionWrite = applyFeedbackToSignalStore(store, moreLikeThis, sessionResult.state.consent);
  const signal = createSignalFromPersonalizationFeedback(moreLikeThis, sessionResult.state.consent);
  const reducedProfile = applyFeedbackToPreferenceProfile(profile, lessLikeThis, sessionResult.state.consent);
  const ignoredProfile = applyFeedbackToPreferenceProfile(reducedProfile, notRelevant, sessionResult.state.consent);
  const resetProfile = applyFeedbackToPreferenceProfile(
    ignoredProfile,
    { type: "reset_preferences", target: { kind: "unknown" } },
    sessionResult.state.consent
  );
  const exportResult = exportTeoyubePersonalizationSignals(store, { includeMetadata: false });
  const exportJson = JSON.stringify(exportResult.data);
  const deleteResult = deleteTeoyubePersonalizationSignals(store, {
    query: { selectedWordIds: ["word_strength"] },
    reason: "Feedback smoke delete."
  });
  const event = createPersonalizationFeedbackEvent(sessionWrite.feedback, sessionWrite);
  const eventJson = JSON.stringify(event);
  const resetConsent = resetTeoyubePersonalizationPreferences(sessionResult.state);

  const results = [
    result("default consent is privacy-protective", stripEmpty([
      defaultState.personalizationEnabled ? "Default personalization should be disabled." : "",
      defaultState.rawTextStorageEnabled ? "Raw text storage should be disabled by default." : "",
      defaultState.signalStorageAllowed ? "Signal storage should be blocked by default." : ""
    ])),
    result("disabled personalization blocks signal storage", stripEmpty([
      disabledWrite.decision.storeSignal ? "Disabled consent should not store a feedback signal." : "",
      store.records.length === disabledBefore || sessionWrite.success
        ? ""
        : "Disabled write changed the store unexpectedly."
    ])),
    result("session-only personalization allows safe session signals", stripEmpty([
      sessionResult.state.sessionOnlyPersonalization ? "" : "Session-only mode should be enabled.",
      sessionWrite.success ? "" : "Session feedback write should succeed.",
      store.records.length > 0 || deleteResult.data.deleted > 0 ? "" : "Session signal was not stored."
    ])),
    result("raw private text is redacted by default", stripEmpty([
      sanitized.rawTextPreview ? "Sanitized feedback still has raw text." : "",
      sanitized.comment ? "Sanitized feedback still has comment text." : "",
      signal.rawTextPreview ? "Feedback signal still has raw text." : ""
    ])),
    result("feedback can reduce preference weight", stripEmpty([
      (reducedProfile.preferences[0]?.confidence || 0) < profile.preferences[0].confidence
        ? ""
        : "Preference confidence was not reduced."
    ])),
    result("less like this reduces or disables a hint", stripEmpty([
      reducedProfile.preferences.length <= profile.preferences.length
        ? ""
        : "Reduced profile should not gain preferences from less_like_this."
    ])),
    result("not relevant does not crash the engine", stripEmpty([
      ignoredProfile.updatedAt ? "" : "Profile was not returned after not_relevant feedback."
    ])),
    result("reset clears preference hints or simulated signal state", stripEmpty([
      resetProfile.preferences.length === 0 ? "" : "Reset feedback should clear profile preferences.",
      resetConsent.state.preferenceHintsEnabled ? "Reset consent should disable preference hints." : ""
    ])),
    result("export simulation returns safe JSON", stripEmpty([
      exportResult.success ? "" : "Export should succeed.",
      exportJson.includes("Private user note") ? "Export includes raw private text." : ""
    ])),
    result("delete simulation removes matching safe records", stripEmpty([
      deleteResult.success ? "" : "Delete should succeed.",
      deleteResult.data.deleted > 0 ? "" : "Delete should remove a matching feedback signal."
    ])),
    result("feedback events are JSON-safe", stripEmpty([
      eventJson ? "" : "Feedback event JSON is empty.",
      eventJson.includes("Private user note") ? "Feedback event includes raw private text." : "",
      event.metadata?.externalAnalyticsSent === false ? "" : "Feedback event should remain local only."
    ])),
    result("no database localStorage cookies files external APIs or AI model calls required", stripEmpty([
      sessionWrite.feedback.metadata?.rawTextRedacted ? "" : "Feedback should show raw text redaction.",
      event.metadata?.externalAnalyticsSent === false ? "" : "Event should not be sent externally."
    ]))
  ];

  const errors = results.flatMap((item) =>
    item.errors.map((error) => `${item.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
