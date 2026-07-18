import { createTigProductionEventBatch } from "../production-events";
import { runPromiseClusterTigProduction } from "../production-surface-runner";
import {
  createDefaultTeoyubeConsentControlState,
  enableProfilePreviewPersonalization,
  resetTeoyubePersonalizationPreferences,
  updateTeoyubeConsentControlState
} from "../personalization-consent-controls";
import {
  addTeoyubePersonalizationSignal,
  createInMemoryTeoyubeSignalStore,
  exportTeoyubePersonalizationSignals
} from "../personalization-signal-store";
import { sanitizeSignalForStore } from "../personalization-signal-store-safety";
import { normalizeTeoyubePersonalizationSignal } from "../personalization-signals";
import {
  applyTeoyubeSignalRetentionPolicy,
  createConsentBasedRetentionPolicy
} from "../personalization-retention";
import { createTeoyubePreferenceProfileFromSignals } from "../personalization-preference-engine";
import { rankPreferenceHints } from "../personalization-preference-scoring";
import { applyPreferenceProfileToProductionInput } from "../personalization-preference-application";
import { runTeoyubePersonalizationComparison } from "../personalization-preview-service";
import { createPersonalizationPreviewComparedEvent } from "../personalization-preview-events";
import {
  applyFeedbackToPreferenceProfile,
  normalizePersonalizationFeedback
} from "../personalization-feedback-engine";
import { createPersonalizationFeedbackEvent } from "../personalization-feedback-events";
import { runPhase6PersonalizationCompletionAudit } from "../phase-6-personalization-completion-audit";
import { runPhase6PersonalizationSafetyCheck } from "../phase-6-personalization-safety-check";
import type { TeoyubePersonalizationProfile } from "../personalization-contracts";

export function runPhase6PersonalizationCompletionExample() {
  const defaultConsentState = createDefaultTeoyubeConsentControlState();
  const consentState = enableProfilePreviewPersonalization(defaultConsentState).state;
  const productionInput = {
    input: "Private note: I feel stuck and need strength while I wait.",
    userState: "discouragement",
    emotion: "discouragement",
    intent: "promise_search",
    surface: "promise_cluster" as const,
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    sessionId: "phase_6_completion_session",
    userId: "phase_6_completion_user"
  };
  const baselineProductionResponse = runPromiseClusterTigProduction(productionInput);
  const store = createInMemoryTeoyubeSignalStore({
    scope: "development",
    privacyLevel: "consented_profile",
    sessionId: productionInput.sessionId,
    userId: productionInput.userId,
    retentionPolicy: createConsentBasedRetentionPolicy()
  });
  const unsafeSignal = normalizeTeoyubePersonalizationSignal({
    source: "manual_feedback",
    surface: "promise_cluster",
    emotionTag: "discouragement",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    selectedScriptureReference: "Isaiah 40:31",
    storesRawText: true,
    rawTextPreview: "Private note should be redacted before any storage.",
    confidenceScore: 0.82,
    weight: 0.82
  });
  const sanitizedSignal = sanitizeSignalForStore(unsafeSignal, consentState.consent);
  const storeWrite = addTeoyubePersonalizationSignal(store, unsafeSignal, consentState.consent);
  const retainedSignals = applyTeoyubeSignalRetentionPolicy(
    store.records,
    createConsentBasedRetentionPolicy()
  );
  const productionEvents = createTigProductionEventBatch(
    productionInput,
    baselineProductionResponse
  );
  const preferenceProfile = createTeoyubePreferenceProfileFromSignals({
    signals: store.records.map((record) => record.signal),
    consent: consentState.consent,
    userId: productionInput.userId
  });
  const rankedPreferenceHints = rankPreferenceHints(preferenceProfile.hints);
  const preferenceAwareInput = applyPreferenceProfileToProductionInput(
    productionInput,
    preferenceProfile,
    consentState.consent
  );
  const personalizedPreview = runTeoyubePersonalizationComparison({
    productionInput,
    consent: consentState.consent,
    signalStore: store,
    preferenceHints: rankedPreferenceHints.map((hint) => hint.label)
  });
  const previewComparedEvent = createPersonalizationPreviewComparedEvent(personalizedPreview);
  const feedback = normalizePersonalizationFeedback({
    type: "less_like_this",
    target: {
      kind: "preference_hint",
      id: rankedPreferenceHints[0]?.key || "word:word_strength",
      label: rankedPreferenceHints[0]?.label || "Strength"
    },
    source: "preview_panel",
    surface: "promise_cluster",
    storesRawText: true,
    rawTextPreview: "Private feedback note should not be stored.",
    weight: 0.25
  });
  const personalizationProfile: TeoyubePersonalizationProfile = {
    consent: consentState.consent,
    preferences: preferenceProfile.hints.map((hint) => ({
      key: hint.key,
      value: hint.value,
      source: "system_preview",
      confidence: hint.confidence,
      updatedAt: hint.createdAt
    })),
    surfacePreferences: [],
    growthPatterns: [],
    recommendationHistory: [],
    dataStatus: "preview_only",
    userId: productionInput.userId,
    updatedAt: new Date().toISOString()
  };
  const feedbackAdjustedProfile = applyFeedbackToPreferenceProfile(
    personalizationProfile,
    feedback,
    consentState.consent
  );
  const feedbackEvent = createPersonalizationFeedbackEvent(feedback, {
    success: true,
    status: "accepted",
    feedback,
    decision: {
      id: "example_feedback_decision",
      feedbackId: feedback.id,
      accepted: true,
      reducePreference: true,
      increasePreference: false,
      disablePersonalization: false,
      resetPreferences: false,
      exportSignals: false,
      deleteSignals: false,
      storeSignal: false,
      explanation: "Example feedback reduces a soft preference hint.",
      warnings: [],
      createdAt: new Date().toISOString()
    },
    explanation: {
      summary: "Example feedback reduces a soft preference hint.",
      userControlImpact: "Related hints should be softened or removed.",
      privacyImpact: "No raw feedback text is retained.",
      scriptureAnchorNote: "Feedback cannot remove Scripture anchoring.",
      warnings: []
    },
    safety: {
      safe: true,
      blocked: false,
      status: "safe",
      reasons: [],
      warnings: [],
      guardrails: []
    },
    consent: consentState.consent,
    errors: [],
    warnings: []
  });
  const resetResult = resetTeoyubePersonalizationPreferences(consentState);
  const exportResult = exportTeoyubePersonalizationSignals(store, {
    includeMetadata: false
  });
  const deleteRequest = updateTeoyubeConsentControlState(consentState, {
    type: "request_delete",
    reason: "Example user requested delete simulation."
  });
  const audit = runPhase6PersonalizationCompletionAudit();
  const safety = runPhase6PersonalizationSafetyCheck();

  return {
    consent: {
      defaultState: defaultConsentState,
      activeState: consentState,
      resetResult,
      deleteRequest
    },
    signals: {
      unsafeSignal,
      sanitizedSignal,
      storeWrite,
      retainedSignals,
      storedRecordCount: store.records.length
    },
    retention: createConsentBasedRetentionPolicy(),
    preference: {
      preferenceProfile,
      rankedPreferenceHints,
      preferenceAwareInput,
      feedbackAdjustedProfile
    },
    production: {
      baselineProductionResponse,
      productionEvents
    },
    preview: {
      personalizedPreview,
      previewComparedEvent
    },
    feedback: {
      feedback,
      feedbackEvent
    },
    dataControls: {
      exportResult,
      rawTextRedacted:
        !sanitizedSignal.rawTextPreview &&
        !JSON.stringify(exportResult.data).includes("Private note")
    },
    audit,
    safety,
    phase7Ready: audit.phase7Ready && safety.valid
  };
}
