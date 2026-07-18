import { createTigProductionEventBatch } from "../production-events";
import { runPromiseClusterTigProduction } from "../production-surface-runner";
import {
  createInMemoryTeoyubeSignalStore,
  deleteTeoyubePersonalizationSignals,
  exportTeoyubePersonalizationSignals,
  queryTeoyubePersonalizationSignals
} from "../personalization-signal-store";
import {
  createPersonalizationSignalFromTigEventBatch,
  storeProductionEventBatchAsPersonalizationSignals
} from "../personalization-event-signal-bridge";
import {
  createPersonalizationContextFromSignalStore,
  summarizeUserPatternPreviewFromSignalStore
} from "../personalization-context-from-store";
import {
  applyTeoyubeSignalRetentionPolicy,
  createConsentBasedRetentionPolicy
} from "../personalization-retention";
import { summarizeSignalPatterns } from "../personalization-signal-query";
import {
  sanitizeSignalForStore,
  validateSignalStoreConsent
} from "../personalization-signal-store-safety";

export function runPhase6PersonalizationSignalStoreExample() {
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
    userId: "demo_user",
    sessionId: "demo_session",
    retentionPolicy: createConsentBasedRetentionPolicy()
  });
  const productionInput = {
    input: "I feel stuck and need a Scripture-backed promise.",
    userState: "discouragement",
    emotion: "discouragement",
    intent: "promise_search",
    surface: "promise_cluster" as const,
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    userId: "demo_user",
    sessionId: "demo_session"
  };
  const productionResponse = runPromiseClusterTigProduction(productionInput);
  const events = createTigProductionEventBatch(productionInput, productionResponse);
  const eventSignals = createPersonalizationSignalFromTigEventBatch(events);
  const sanitizedPreview = eventSignals.map((signal) => sanitizeSignalForStore(signal, consent));
  const writeResult = storeProductionEventBatchAsPersonalizationSignals(store, events, consent);
  const queryResult = queryTeoyubePersonalizationSignals(store, {
    surfaces: ["promise_cluster"],
    emotionTags: ["discouragement"]
  });
  const patternSummary = summarizeSignalPatterns(queryResult.data);
  const context = createPersonalizationContextFromSignalStore(
    store,
    { surfaces: ["promise_cluster"] },
    consent
  );
  const userPatternPreview = summarizeUserPatternPreviewFromSignalStore(
    store,
    { surfaces: ["promise_cluster"] },
    consent
  );
  const exportResult = exportTeoyubePersonalizationSignals(store, {
    query: { surfaces: ["promise_cluster"] },
    includeMetadata: false
  });
  const retainedRecords = applyTeoyubeSignalRetentionPolicy(
    store.records,
    store.retentionPolicy
  );
  const deleteResult = deleteTeoyubePersonalizationSignals(store, {
    query: { fallbackUsed: true },
    reason: "Demo cleanup of fallback signals."
  });

  return {
    store,
    consent,
    productionInput,
    productionResponse,
    events,
    eventSignals,
    sanitizedPreview,
    writeResult,
    queryResult,
    patternSummary,
    context,
    userPatternPreview,
    exportResult,
    retainedRecords,
    deleteResult
  };
}
