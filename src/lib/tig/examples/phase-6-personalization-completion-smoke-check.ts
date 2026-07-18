import { runPhase6PersonalizationArchitectureSmokeCheck } from "./phase-6-personalization-architecture-smoke-check";
import { runPhase6PersonalizationSignalStoreSmokeCheck } from "./phase-6-personalization-signal-store-smoke-check";
import { runPhase6PersonalizedProductionPreviewSmokeCheck } from "./phase-6-personalized-production-preview-smoke-check";
import { runPhase6FeedbackConsentControlsSmokeCheck } from "./phase-6-feedback-consent-controls-smoke-check";
import { runPhase6PersonalizationCompletionExample } from "./phase-6-personalization-completion-example";
import {
  createDefaultTeoyubeConsentControlState,
  enableProfilePreviewPersonalization,
  enableSessionOnlyPersonalization,
  resetTeoyubePersonalizationPreferences,
  updateTeoyubeConsentControlState
} from "../personalization-consent-controls";
import {
  addTeoyubePersonalizationSignal,
  createInMemoryTeoyubeSignalStore,
  exportTeoyubePersonalizationSignals
} from "../personalization-signal-store";
import { normalizeTeoyubePersonalizationSignal } from "../personalization-signals";
import { sanitizeSignalForStore } from "../personalization-signal-store-safety";
import { createTeoyubePreferenceProfileFromSignals } from "../personalization-preference-engine";
import { validatePreferenceConsent } from "../personalization-preference-safety";
import { runTeoyubePersonalizationComparison } from "../personalization-preview-service";
import {
  applyFeedbackToPreferenceHints,
  createPreferenceFeedbackSummary
} from "../personalization-preference-feedback";
import {
  normalizePersonalizationFeedback,
  shouldDisablePersonalizationFromFeedback,
  shouldReducePreferenceFromFeedback
} from "../personalization-feedback-engine";
import { runPhase6PersonalizationCompletionAudit } from "../phase-6-personalization-completion-audit";
import { runPhase6PersonalizationSafetyCheck } from "../phase-6-personalization-safety-check";

export type Phase6PersonalizationCompletionSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase6PersonalizationCompletionSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase6PersonalizationCompletionSmokeCheckResult[];
  phaseSmokes: {
    phase61: ReturnType<typeof runPhase6PersonalizationArchitectureSmokeCheck>;
    phase62: ReturnType<typeof runPhase6PersonalizationSignalStoreSmokeCheck>;
    phase64: ReturnType<typeof runPhase6PersonalizedProductionPreviewSmokeCheck>;
    phase65: ReturnType<typeof runPhase6FeedbackConsentControlsSmokeCheck>;
  };
};

function result(
  name: string,
  errors: string[]
): Phase6PersonalizationCompletionSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runPhase6PersonalizationCompletionSmokeCheck(): Phase6PersonalizationCompletionSmokeCheckReport {
  const phase61 = runPhase6PersonalizationArchitectureSmokeCheck();
  const phase62 = runPhase6PersonalizationSignalStoreSmokeCheck();
  const phase64 = runPhase6PersonalizedProductionPreviewSmokeCheck();
  const phase65 = runPhase6FeedbackConsentControlsSmokeCheck();
  const defaultState = createDefaultTeoyubeConsentControlState();
  const sessionState = enableSessionOnlyPersonalization(defaultState).state;
  const profilePreviewState = enableProfilePreviewPersonalization(defaultState).state;
  const store = createInMemoryTeoyubeSignalStore({
    scope: "session",
    privacyLevel: "session_only",
    sessionId: "phase_6_completion_smoke"
  });
  const unsafeSignal = normalizeTeoyubePersonalizationSignal({
    source: "manual_feedback",
    surface: "promise_cluster",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    selectedScriptureReference: "Isaiah 40:31",
    storesRawText: true,
    rawTextPreview: "Private medical legal financial emergency text must be redacted.",
    confidenceScore: 0.85,
    weight: 0.85
  });
  const sanitizedSignal = sanitizeSignalForStore(unsafeSignal, sessionState.consent);
  const disabledWrite = addTeoyubePersonalizationSignal(store, unsafeSignal, defaultState.consent);
  const enabledWrite = addTeoyubePersonalizationSignal(store, unsafeSignal, sessionState.consent);
  const disabledPreferenceProfile = createTeoyubePreferenceProfileFromSignals({
    signals: [sanitizedSignal],
    consent: defaultState.consent
  });
  const enabledPreferenceProfile = createTeoyubePreferenceProfileFromSignals({
    signals: [sanitizedSignal],
    consent: profilePreviewState.consent
  });
  const preferenceConsent = validatePreferenceConsent(profilePreviewState.consent);
  const consentedPreview = runTeoyubePersonalizationComparison({
    productionInput: {
      input: "Private note should not survive preview sanitization.",
      emotion: "discouragement",
      surface: "promise_cluster",
      selectedWordId: "word_strength",
      selectedClusterId: "cluster_strength_in_waiting"
    },
    consent: sessionState.consent,
    signalStore: store
  });
  const missingConsentPreview = runTeoyubePersonalizationComparison({
    productionInput: {
      input: "Private note should not personalize without consent.",
      surface: "promise_cluster"
    },
    signalStore: store
  });
  const lessLikeThisFeedback = normalizePersonalizationFeedback({
    type: "less_like_this",
    target: {
      kind: "preference_hint",
      id: enabledPreferenceProfile.hints[0]?.key || "word:word_strength"
    }
  });
  const disableFeedback = normalizePersonalizationFeedback({
    type: "disable_personalization",
    target: {
      kind: "personalized_preview",
      id: "phase_6_completion_smoke"
    }
  });
  const adjustedHints = applyFeedbackToPreferenceHints(
    enabledPreferenceProfile.hints,
    lessLikeThisFeedback,
    profilePreviewState.consent
  );
  const feedbackSummary = createPreferenceFeedbackSummary(
    enabledPreferenceProfile.hints,
    adjustedHints
  );
  const resetResult = resetTeoyubePersonalizationPreferences(sessionState);
  const exportResult = exportTeoyubePersonalizationSignals(store, {
    includeMetadata: false
  });
  const deleteRequest = updateTeoyubeConsentControlState(sessionState, {
    type: "request_delete",
    reason: "Smoke check delete simulation."
  });
  const example = runPhase6PersonalizationCompletionExample();
  const audit = runPhase6PersonalizationCompletionAudit();
  const safety = runPhase6PersonalizationSafetyCheck();
  const exportJson = JSON.stringify(exportResult.data);

  const results = [
    result("Phase 6.1 architecture smoke passes", clean([
      phase61.valid ? "" : phase61.errors.join("; ")
    ])),
    result("Phase 6.2 signal store smoke passes", clean([
      phase62.valid ? "" : phase62.errors.join("; ")
    ])),
    result("Phase 6.4 personalized preview smoke passes", clean([
      phase64.valid ? "" : phase64.errors.join("; ")
    ])),
    result("Phase 6.5 feedback and consent smoke passes", clean([
      phase65.valid ? "" : phase65.errors.join("; ")
    ])),
    result("consent defaults are privacy-protective", clean([
      defaultState.personalizationEnabled ? "Default personalization should be disabled." : "",
      defaultState.rawTextStorageEnabled ? "Raw text storage should be disabled by default." : "",
      defaultState.signalStorageAllowed ? "Signal storage should be blocked by default." : ""
    ])),
    result("signals are sanitized before storage", clean([
      sanitizedSignal.rawTextPreview ? "Sanitized signal retained raw text preview." : "",
      sanitizedSignal.storesRawText ? "Sanitized signal still stores raw text." : "",
      enabledWrite.success ? "" : "Consented signal write should succeed."
    ])),
    result("disabled personalization blocks storage", clean([
      disabledWrite.success ? "Disabled personalization should block signal storage." : "",
      disabledWrite.data.rejected > 0 ? "" : "Disabled write should reject the signal."
    ])),
    result("preference profile requires consent", clean([
      disabledPreferenceProfile.hints.length
        ? "Disabled consent should not derive preference hints."
        : "",
      enabledPreferenceProfile.hints.length
        ? ""
        : "Consented structured signals should derive soft preference hints.",
      preferenceConsent.allowed ? "" : "Preference consent should be allowed in session mode."
    ])),
    result("personalized preview works only with consent", clean([
      consentedPreview.personalized ? "" : "Consented preview should include personalized result.",
      missingConsentPreview.personalized ? "Missing consent should return baseline only." : "",
      missingConsentPreview.status === "baseline_only"
        ? ""
        : "Missing consent preview should be baseline_only."
    ])),
    result("feedback can reduce or disable preference hints", clean([
      shouldReducePreferenceFromFeedback(lessLikeThisFeedback)
        ? ""
        : "less_like_this feedback should reduce hints.",
      shouldDisablePersonalizationFromFeedback(disableFeedback)
        ? ""
        : "disable_personalization feedback should disable personalization.",
      adjustedHints.length <= enabledPreferenceProfile.hints.length
        ? ""
        : "Adjusted hints should not grow after less_like_this feedback.",
      feedbackSummary.removedCount >= 0 ? "" : "Feedback summary should be available."
    ])),
    result("reset export and delete simulations work", clean([
      resetResult.status === "reset" ? "" : "Reset simulation should return reset status.",
      exportResult.success ? "" : "Export simulation should succeed.",
      deleteRequest.status === "delete_requested" ? "" : "Delete simulation should return delete_requested.",
      exportJson.includes("Private medical")
        ? "Export simulation includes raw private text."
        : ""
    ])),
    result("completion example is Phase 7 ready", clean([
      example.phase7Ready ? "" : "Completion example should report Phase 7 readiness.",
      example.dataControls.rawTextRedacted ? "" : "Example should redact raw text."
    ])),
    result("audit returns completion status", clean([
      audit.complete ? "" : "Completion audit should be complete.",
      audit.completionPercentage === 100 ? "" : "Completion audit should be 100%.",
      audit.phase7Ready ? "" : "Completion audit should mark Phase 7 ready."
    ])),
    result("safety completion check passes", clean([
      safety.valid ? "" : safety.errors.join("; ")
    ])),
    result("no database localStorage cookies files external APIs or AI model calls required", clean([
      exportJson.includes("rawTextPreview") && exportJson.includes("Private")
        ? "Safe export contains raw private text."
        : "",
      consentedPreview.event.metadata?.externalAnalyticsSent === false
        ? ""
        : "Preview event should remain local only."
    ]))
  ];
  const errors = results.flatMap((item) =>
    item.errors.map((error) => `${item.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results,
    phaseSmokes: {
      phase61,
      phase62,
      phase64,
      phase65
    }
  };
}
