import {
  createDefaultTeoyubeConsentControlState,
  enableProfilePreviewPersonalization,
  enableSessionOnlyPersonalization
} from "./personalization-consent-controls";
import { normalizePersonalizationFeedback, sanitizePersonalizationFeedback } from "./personalization-feedback-engine";
import { createSignalFromPersonalizationFeedback } from "./personalization-feedback-signal-bridge";
import { createTeoyubePreferenceProfileFromSignals, createTeoyubePreferenceDecision } from "./personalization-preference-engine";
import { validatePreferenceHintsSafety } from "./personalization-preference-safety";
import {
  addTeoyubePersonalizationSignal,
  createInMemoryTeoyubeSignalStore
} from "./personalization-signal-store";
import { sanitizeSignalForStore } from "./personalization-signal-store-safety";
import { normalizeTeoyubePersonalizationSignal } from "./personalization-signals";
import { runTeoyubePersonalizationComparison } from "./personalization-preview-service";

export type Phase6SafetyCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase6PersonalizationSafetyCheckReport = {
  valid: boolean;
  errors: string[];
  results: Phase6SafetyCheckResult[];
};

function result(name: string, errors: string[]): Phase6SafetyCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function validatePhase6ConsentSafety(): Phase6SafetyCheckResult {
  const defaultState = createDefaultTeoyubeConsentControlState();
  const sessionState = enableSessionOnlyPersonalization(defaultState).state;

  return result("consent safety", clean([
    defaultState.personalizationEnabled ? "Default personalization should be disabled." : "",
    defaultState.rawTextStorageEnabled ? "Raw text storage should be disabled." : "",
    sessionState.sessionOnlyPersonalization ? "" : "Session-only personalization should be available.",
    sessionState.consent.allowRawTextStorage ? "Session-only mode should not enable raw text." : ""
  ]));
}

export function validatePhase6SignalSafety(): Phase6SafetyCheckResult {
  const defaultState = createDefaultTeoyubeConsentControlState();
  const sessionState = enableSessionOnlyPersonalization(defaultState).state;
  const store = createInMemoryTeoyubeSignalStore({ scope: "session", privacyLevel: "session_only" });
  const rawSignal = normalizeTeoyubePersonalizationSignal({
    source: "manual_feedback",
    storesRawText: true,
    rawTextPreview: "Private medical legal financial emergency text should be redacted.",
    selectedWordId: "word_strength"
  });
  const sanitized = sanitizeSignalForStore(rawSignal, sessionState.consent);
  const disabledWrite = addTeoyubePersonalizationSignal(store, rawSignal, defaultState.consent);

  return result("signal safety", clean([
    sanitized.rawTextPreview ? "Raw signal text was not redacted." : "",
    sanitized.storesRawText ? "Sanitized signal still stores raw text." : "",
    disabledWrite.success ? "Disabled consent should block signal storage." : ""
  ]));
}

export function validatePhase6PreferenceSafety(): Phase6SafetyCheckResult {
  const profilePreviewState = enableProfilePreviewPersonalization(createDefaultTeoyubeConsentControlState()).state;
  const signal = normalizeTeoyubePersonalizationSignal({
    source: "system_preview",
    selectedScriptureReference: "Isaiah 40:31",
    selectedWordId: "word_strength",
    weight: 0.8,
    storesRawText: false
  });
  const profile = createTeoyubePreferenceProfileFromSignals({
    signals: [signal],
    consent: profilePreviewState.consent
  });
  const decision = createTeoyubePreferenceDecision(profile, profilePreviewState.consent);
  const safety = validatePreferenceHintsSafety(decision.hints, profilePreviewState.consent);

  return result("preference safety", clean([
    decision.hints.some((hint) => !hint.softHintOnly)
      ? "Preference hints must be soft hints only."
      : "",
    safety.blocked ? "Preference hints should be safe with consent." : ""
  ]));
}

export function validatePhase6PreviewSafety(): Phase6SafetyCheckResult {
  const sessionState = enableSessionOnlyPersonalization(createDefaultTeoyubeConsentControlState()).state;
  const consentedPreview = runTeoyubePersonalizationComparison({
    productionInput: {
      input: "Private text should be redacted.",
      userState: "discouragement",
      emotion: "discouragement",
      surface: "promise_cluster",
      selectedWordId: "word_strength",
      selectedClusterId: "cluster_strength_in_waiting"
    },
    consent: sessionState.consent,
    preferenceHints: ["Prefer strength language only if Scripture anchoring remains stable."]
  });
  const missingConsentPreview = runTeoyubePersonalizationComparison({
    productionInput: { surface: "promise_cluster" }
  });

  return result("preview safety", clean([
    consentedPreview.baseline ? "" : "Baseline production response should remain available.",
    consentedPreview.baseline.selection.scriptureAnchor ? "" : "Baseline Scripture anchor missing.",
    consentedPreview.personalized?.selection.scriptureAnchor ? "" : "Personalized Scripture anchor missing.",
    consentedPreview.baseline.input.input?.includes("Private text")
      ? "Preview did not redact raw input text."
      : "",
    missingConsentPreview.personalized ? "Missing consent should return baseline-only preview." : ""
  ]));
}

export function validatePhase6FeedbackSafety(): Phase6SafetyCheckResult {
  const sessionState = enableSessionOnlyPersonalization(createDefaultTeoyubeConsentControlState()).state;
  const feedback = normalizePersonalizationFeedback({
    type: "less_like_this",
    target: { kind: "preference_hint", id: "word_strength" },
    storesRawText: true,
    rawTextPreview: "Private legal emergency note should be redacted."
  });
  const sanitized = sanitizePersonalizationFeedback(feedback, sessionState.consent);
  const signal = createSignalFromPersonalizationFeedback(feedback, sessionState.consent);

  return result("feedback safety", clean([
    sanitized.rawTextPreview ? "Feedback raw text was not redacted." : "",
    signal.rawTextPreview ? "Feedback signal raw text was not redacted." : "",
    signal.storesRawText ? "Feedback signal should not store raw text." : ""
  ]));
}

export function runPhase6PersonalizationSafetyCheck(): Phase6PersonalizationSafetyCheckReport {
  const results = [
    validatePhase6ConsentSafety(),
    validatePhase6SignalSafety(),
    validatePhase6PreferenceSafety(),
    validatePhase6PreviewSafety(),
    validatePhase6FeedbackSafety()
  ];
  const errors = results.flatMap((item) =>
    item.errors.map((error) => `${item.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    results
  };
}
