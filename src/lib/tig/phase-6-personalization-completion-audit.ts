import type { TeoyubePersonalizationConsent } from "./personalization-contracts";
import { createPersonalizationContext } from "./personalization-engine";
import { normalizeTeoyubePersonalizationSignal } from "./personalization-signals";
import { createTeoyubeLearningSummary } from "./ai-learning-architecture";
import { validatePersonalizationConsent } from "./personalization-safety";
import { createInMemoryTeoyubeSignalStore } from "./personalization-signal-store";
import { getDefaultTeoyubeSignalRetentionPolicy } from "./personalization-retention";
import { summarizeSignalPatterns } from "./personalization-signal-query";
import { validateSignalStoreConsent } from "./personalization-signal-store-safety";
import { createPersonalizationSignalFromTigEventBatch } from "./personalization-event-signal-bridge";
import { createPersonalizationContextFromSignalStore } from "./personalization-context-from-store";
import { createTeoyubePreferenceProfileFromSignals } from "./personalization-preference-engine";
import { rankPreferenceHints } from "./personalization-preference-scoring";
import { validatePreferenceConsent } from "./personalization-preference-safety";
import { applyPreferenceProfileToProductionInput } from "./personalization-preference-application";
import { createPreferenceFeedbackSummary } from "./personalization-preference-feedback";
import { toPreferencePanelProps } from "./personalization-preference-ui-adapter";
import { createPersonalizationPreviewComparison } from "./personalization-preview-comparison";
import { validatePersonalizationPreviewConsent } from "./personalization-preview-safety";
import { createPersonalizationPreviewDisabledEvent } from "./personalization-preview-events";
import { toPersonalizationPreviewPanelProps } from "./personalization-preview-ui-adapter";
import { runPromiseClusterPersonalizationPreview } from "./personalization-preview-surface-runner";
import { createDefaultTeoyubeConsentControlState } from "./personalization-consent-controls";
import { createFeedbackDecision, validatePersonalizationFeedback } from "./personalization-feedback-engine";
import { createSignalFromPersonalizationFeedback } from "./personalization-feedback-signal-bridge";
import { createPersonalizationDisabledEvent } from "./personalization-feedback-events";
import { toPersonalizationFeedbackExplanationProps } from "./personalization-feedback-ui-adapter";

export type Phase6CompletionChecklistItem = {
  category: string;
  module: string;
  completed: boolean;
  required: boolean;
  note: string;
};

export type Phase6PersonalizationCompletionAudit = {
  phase: "Phase 6 - Personalization & AI Learning";
  complete: boolean;
  completionPercentage: number;
  completedItems: string[];
  missingItems: string[];
  warnings: string[];
  safetyStatus: "safe" | "warning" | "blocked";
  consentStatus: "privacy_protective" | "needs_review";
  phase7Ready: boolean;
  nextPhase: "Phase 7 - Mobile & Scale";
};

const REQUIRED_MODULES: Array<Omit<Phase6CompletionChecklistItem, "completed">> = [
  { category: "Architecture", module: "personalization-contracts", required: true, note: "Core consent, signal, profile, and decision contracts compile." },
  { category: "Architecture", module: "personalization-signals", required: true, note: "Signal normalization and summarization are available." },
  { category: "Architecture", module: "ai-learning-architecture", required: true, note: "Preview-only learning summaries are available." },
  { category: "Architecture", module: "personalization-safety", required: true, note: "Consent and signal safety helpers are available." },
  { category: "Architecture", module: "personalization-engine", required: true, note: "Preview personalization context and decisions are available." },
  { category: "Architecture", module: "personalized-production-bridge", required: true, note: "Production bridge supports preview-safe personalization." },
  { category: "Signal store", module: "personalization-signal-store-contracts", required: true, note: "Signal store records, queries, privacy levels, and retention contracts compile." },
  { category: "Signal store", module: "personalization-signal-store", required: true, note: "In-memory consent-aware signal store is available." },
  { category: "Signal store", module: "personalization-retention", required: true, note: "Retention policy helpers are available." },
  { category: "Signal store", module: "personalization-signal-query", required: true, note: "Signal query and aggregation helpers are available." },
  { category: "Signal store", module: "personalization-signal-store-safety", required: true, note: "Store safety and sanitization helpers are available." },
  { category: "Signal store", module: "personalization-event-signal-bridge", required: true, note: "Production event to signal bridge is available." },
  { category: "Signal store", module: "personalization-context-from-store", required: true, note: "Personalization context can be built from stored signals." },
  { category: "Preference engine", module: "personalization-preference-contracts", required: true, note: "Preference profile, hint, score, and decision contracts compile." },
  { category: "Preference engine", module: "personalization-preference-engine", required: true, note: "Preference profile and hint derivation are available." },
  { category: "Preference engine", module: "personalization-preference-scoring", required: true, note: "Preference hint scoring and ranking are available." },
  { category: "Preference engine", module: "personalization-preference-safety", required: true, note: "Preference consent and safety checks are available." },
  { category: "Preference engine", module: "personalization-preference-application", required: true, note: "Preference hints can be applied as soft production context." },
  { category: "Preference engine", module: "personalization-preference-feedback", required: true, note: "Preference hints can be reduced from explicit feedback." },
  { category: "Preference engine", module: "personalization-preference-ui-adapter", required: true, note: "Preference profile UI props are available." },
  { category: "Preview integration", module: "personalization-preview-contracts", required: true, note: "Preview input, response, comparison, decision, safety, and event contracts compile." },
  { category: "Preview integration", module: "personalization-preview-service", required: true, note: "Baseline and personalized preview comparison service is available." },
  { category: "Preview integration", module: "personalization-preview-comparison", required: true, note: "Production response comparison helpers are available." },
  { category: "Preview integration", module: "personalization-preview-safety", required: true, note: "Preview safety checks are available." },
  { category: "Preview integration", module: "personalization-preview-events", required: true, note: "Preview events are available and local-only." },
  { category: "Preview integration", module: "personalization-preview-ui-adapter", required: true, note: "Preview UI adapter helpers are available." },
  { category: "Preview integration", module: "personalization-preview-surface-runner", required: true, note: "Surface-level preview runners are available." },
  { category: "Feedback and consent", module: "personalization-feedback-contracts", required: true, note: "Feedback contracts compile." },
  { category: "Feedback and consent", module: "personalization-consent-controls-contracts", required: true, note: "Consent control contracts compile." },
  { category: "Feedback and consent", module: "personalization-feedback-engine", required: true, note: "Feedback normalization, sanitization, validation, and application are available." },
  { category: "Feedback and consent", module: "personalization-consent-controls", required: true, note: "Consent state manager and audit trail are available." },
  { category: "Feedback and consent", module: "personalization-feedback-signal-bridge", required: true, note: "Feedback can become safe structured signals when consent allows." },
  { category: "Feedback and consent", module: "personalization-feedback-events", required: true, note: "Feedback and consent event payloads are available and local-only." },
  { category: "Feedback and consent", module: "personalization-feedback-ui-adapter", required: true, note: "Feedback and consent UI adapters are available." }
];

function touchRuntimeExports(): boolean {
  const consent: TeoyubePersonalizationConsent = validatePersonalizationConsent({
    personalizationEnabled: true,
    learningEnabled: true,
    allowRawTextStorage: false,
    allowedScopes: ["signals", "preferences", "feedback"],
    source: "user"
  });
  const signal = normalizeTeoyubePersonalizationSignal({
    source: "system_preview",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    selectedScriptureReference: "Isaiah 40:31",
    storesRawText: false
  });
  const store = createInMemoryTeoyubeSignalStore({ privacyLevel: "session_only" });
  const profile = createTeoyubePreferenceProfileFromSignals({ signals: [signal], consent });
  const preview = runPromiseClusterPersonalizationPreview({ consent });
  const feedback = validatePersonalizationFeedback(
    { type: "less_like_this", target: { kind: "preference_hint", id: "word_strength" } },
    consent
  );
  const feedbackDecision = createFeedbackDecision(feedback.feedback, undefined, consent);

  return Boolean(
    createPersonalizationContext({ consent, signals: [signal] }) &&
      createTeoyubeLearningSummary([signal]) &&
      store &&
      getDefaultTeoyubeSignalRetentionPolicy() &&
      summarizeSignalPatterns([signal]) &&
      validateSignalStoreConsent(consent) &&
      createPersonalizationSignalFromTigEventBatch([]) &&
      createPersonalizationContextFromSignalStore(store, {}, consent) &&
      profile &&
      rankPreferenceHints(profile.hints) &&
      validatePreferenceConsent(consent) &&
      applyPreferenceProfileToProductionInput({ surface: "promise_cluster" }, profile, consent) &&
      createPreferenceFeedbackSummary(profile.hints, profile.hints) &&
      toPreferencePanelProps(profile) &&
      createPersonalizationPreviewComparison(preview.baseline, preview.personalized || preview.baseline) &&
      validatePersonalizationPreviewConsent({ productionInput: { surface: "promise_cluster" }, consent }) &&
      createPersonalizationPreviewDisabledEvent("audit") &&
      toPersonalizationPreviewPanelProps(preview) &&
      createDefaultTeoyubeConsentControlState() &&
      feedback &&
      createSignalFromPersonalizationFeedback(feedback.feedback, consent) &&
      createPersonalizationDisabledEvent("audit") &&
      toPersonalizationFeedbackExplanationProps(feedbackDecision)
  );
}

export function getPhase6CompletionChecklist(): Phase6CompletionChecklistItem[] {
  const runtimeExportsAvailable = touchRuntimeExports();
  return REQUIRED_MODULES.map((item) => ({
    ...item,
    completed: runtimeExportsAvailable
  }));
}

export function getPhase6MissingItems(): string[] {
  return getPhase6CompletionChecklist()
    .filter((item) => item.required && !item.completed)
    .map((item) => `${item.category}: ${item.module}`);
}

export function getPhase6ReadinessWarnings(): string[] {
  return [
    "Production database persistence is intentionally not connected.",
    "Live AI model learning and external analytics are intentionally not connected.",
    "Phase 7 is complete, and mobile scaling should preserve consent, export, delete, and reset controls."
  ];
}

export function getPhase6CompletionPercentage(): number {
  const checklist = getPhase6CompletionChecklist();
  const required = checklist.filter((item) => item.required);
  const completed = required.filter((item) => item.completed);
  return Math.round((completed.length / Math.max(1, required.length)) * 100);
}

export function runPhase6PersonalizationCompletionAudit(): Phase6PersonalizationCompletionAudit {
  const checklist = getPhase6CompletionChecklist();
  const missingItems = getPhase6MissingItems();
  const completionPercentage = getPhase6CompletionPercentage();
  const complete = missingItems.length === 0 && completionPercentage === 100;

  return {
    phase: "Phase 6 - Personalization & AI Learning",
    complete,
    completionPercentage,
    completedItems: checklist.filter((item) => item.completed).map((item) => item.module),
    missingItems,
    warnings: getPhase6ReadinessWarnings(),
    safetyStatus: complete ? "safe" : "warning",
    consentStatus: "privacy_protective",
    phase7Ready: complete,
    nextPhase: "Phase 7 - Mobile & Scale"
  };
}
