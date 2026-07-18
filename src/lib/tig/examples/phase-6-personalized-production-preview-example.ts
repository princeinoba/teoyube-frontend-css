import type { TeoyubePersonalizationProfile } from "../personalization-contracts";
import { createPersonalizationContextFromSignalStore } from "../personalization-context-from-store";
import {
  createInMemoryTeoyubeSignalStore,
  queryTeoyubePersonalizationSignals
} from "../personalization-signal-store";
import {
  sanitizeSignalForStore,
  validateSignalStoreConsent
} from "../personalization-signal-store-safety";
import { storeProductionEventBatchAsPersonalizationSignals } from "../personalization-event-signal-bridge";
import { runTeoyubePersonalizationComparison } from "../personalization-preview-service";
import {
  createPersonalizationPreviewComparedEvent,
  createPersonalizationPreviewPreferenceUsedEvent
} from "../personalization-preview-events";
import {
  toPersonalizationComparisonPanelProps,
  toPersonalizationPreviewDebugProps,
  toPersonalizationPreviewExplanationProps,
  toPersonalizationPreviewPanelProps
} from "../personalization-preview-ui-adapter";
import { createTigProductionEventBatch } from "../production-events";
import { runTeoyubeProductionIntelligence } from "../production-intelligence-service";

export function runPhase6PersonalizedProductionPreviewExample() {
  const consent = validateSignalStoreConsent({
    personalizationEnabled: true,
    learningEnabled: true,
    allowRawTextStorage: false,
    allowedScopes: ["signals", "preferences", "journey_progress", "feedback"],
    source: "user",
    updatedAt: new Date().toISOString()
  }).consent;
  const store = createInMemoryTeoyubeSignalStore({
    scope: "development",
    privacyLevel: "consented_profile",
    userId: "preview_demo_user",
    sessionId: "preview_demo_session"
  });
  const productionInput = {
    input: "I feel discouraged and need strength while waiting.",
    userState: "discouragement in waiting",
    emotion: "discouragement",
    intent: "promise_search",
    surface: "promise_cluster" as const,
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    userId: "preview_demo_user",
    sessionId: "preview_demo_session"
  };
  const baseline = runTeoyubeProductionIntelligence(productionInput);
  const events = createTigProductionEventBatch(productionInput, baseline);
  const storedSignals = storeProductionEventBatchAsPersonalizationSignals(store, events, consent);
  const sanitizedSignals = storedSignals.data.records.map((record) =>
    sanitizeSignalForStore(record.signal, consent)
  );
  const profile: TeoyubePersonalizationProfile = {
    userId: "preview_demo_user",
    consent,
    preferences: [
      {
        key: "preferred_word_theme",
        value: "word_strength",
        source: "system_preview",
        confidence: 0.68,
        updatedAt: new Date().toISOString()
      }
    ],
    surfacePreferences: [
      {
        surface: "promise_cluster",
        usageCount: 3,
        preferred: true,
        lastUsedAt: new Date().toISOString()
      }
    ],
    growthPatterns: [],
    recommendationHistory: [],
    updatedAt: new Date().toISOString(),
    dataStatus: "preview_only"
  };
  const context = createPersonalizationContextFromSignalStore(
    store,
    { surfaces: ["promise_cluster"] },
    consent
  );
  const preview = runTeoyubePersonalizationComparison({
    productionInput,
    consent,
    context,
    profile,
    signalStore: store,
    preferenceHints: ["Prefer familiar strength language when Scripture anchoring remains stable."]
  });
  const comparedEvent = createPersonalizationPreviewComparedEvent(preview);
  const preferenceUsedEvent = createPersonalizationPreviewPreferenceUsedEvent(preview);
  const panelProps = toPersonalizationPreviewPanelProps(preview);
  const comparisonProps = toPersonalizationComparisonPanelProps(preview);
  const explanationProps = toPersonalizationPreviewExplanationProps(preview);
  const debugProps = toPersonalizationPreviewDebugProps(preview);
  const storedQuery = queryTeoyubePersonalizationSignals(store, {
    surfaces: ["promise_cluster"]
  });

  return {
    consent,
    store,
    productionInput,
    baseline,
    storedSignals,
    sanitizedSignals,
    profile,
    context,
    preview,
    events: {
      comparedEvent,
      preferenceUsedEvent
    },
    ui: {
      panelProps,
      comparisonProps,
      explanationProps,
      debugProps
    },
    storedQuery
  };
}
