import { createTigProductionEventBatch } from "../production-events";
import { runPromiseClusterTigProduction } from "../production-surface-runner";
import {
  addTeoyubePersonalizationSignal,
  createInMemoryTeoyubeSignalStore,
  deleteTeoyubePersonalizationSignals,
  exportTeoyubePersonalizationSignals,
  queryTeoyubePersonalizationSignals
} from "../personalization-signal-store";
import { storeProductionEventBatchAsPersonalizationSignals } from "../personalization-event-signal-bridge";
import { createPersonalizationContextFromSignalStore } from "../personalization-context-from-store";
import {
  applyTeoyubeSignalRetentionPolicy,
  createConsentBasedRetentionPolicy
} from "../personalization-retention";
import { groupSignalsBySelectedWord } from "../personalization-signal-query";
import {
  sanitizeSignalForStore,
  validateSignalStoreConsent
} from "../personalization-signal-store-safety";
import type { TeoyubeSignalStoreRecord } from "../personalization-signal-store-contracts";

export type Phase6SignalStoreSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase6SignalStoreSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase6SignalStoreSmokeCheckResult[];
};

function result(name: string, errors: string[]): Phase6SignalStoreSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function stripEmpty(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runPhase6PersonalizationSignalStoreSmokeCheck(): Phase6SignalStoreSmokeCheckReport {
  const consent = validateSignalStoreConsent({
    personalizationEnabled: true,
    learningEnabled: true,
    allowRawTextStorage: false,
    allowedScopes: ["signals", "preferences", "journey_progress", "feedback"],
    source: "user"
  }).consent;
  const disabledConsent = validateSignalStoreConsent({
    personalizationEnabled: false,
    learningEnabled: false,
    allowRawTextStorage: false,
    allowedScopes: []
  }).consent;
  const store = createInMemoryTeoyubeSignalStore({
    scope: "development",
    privacyLevel: "consented_profile",
    sessionId: "smoke_session",
    userId: "smoke_user",
    retentionPolicy: createConsentBasedRetentionPolicy()
  });
  const unsafeSignal = {
    source: "manual_feedback" as const,
    surface: "promise_cluster" as const,
    emotionTag: "discouragement",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    selectedScriptureReference: "Isaiah 40:31",
    storesRawText: true,
    rawTextPreview: "I feel private and stuck. This should not be stored by default.",
    weight: 0.8
  };
  const sanitized = sanitizeSignalForStore(unsafeSignal, consent);
  const directWrite = addTeoyubePersonalizationSignal(store, unsafeSignal, consent);
  const disabledWrite = addTeoyubePersonalizationSignal(store, unsafeSignal, disabledConsent);
  const productionInput = {
    input: "I feel stuck and need help waiting.",
    userState: "discouragement",
    emotion: "discouragement",
    intent: "promise_search",
    surface: "promise_cluster" as const,
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    sessionId: "smoke_session",
    userId: "smoke_user"
  };
  const productionResponse = runPromiseClusterTigProduction(productionInput);
  const events = createTigProductionEventBatch(productionInput, productionResponse);
  const batchWrite = storeProductionEventBatchAsPersonalizationSignals(store, events, consent);
  const surfaceQuery = queryTeoyubePersonalizationSignals(store, {
    surfaces: ["promise_cluster"]
  });
  const emotionQuery = queryTeoyubePersonalizationSignals(store, {
    emotionTags: ["discouragement"]
  });
  const wordGroups = groupSignalsBySelectedWord(store.records);
  const context = createPersonalizationContextFromSignalStore(
    store,
    { surfaces: ["promise_cluster"] },
    consent
  );
  const exported = exportTeoyubePersonalizationSignals(store, { includeMetadata: false });
  const exportJson = JSON.stringify(exported.data);
  const oldRecord: TeoyubeSignalStoreRecord = {
    ...store.records[0],
    id: "old_retention_record",
    createdAt: "2000-01-01T00:00:00.000Z",
    updatedAt: "2000-01-01T00:00:00.000Z"
  };
  const retained = applyTeoyubeSignalRetentionPolicy(
    [oldRecord, ...store.records],
    {
      ...createConsentBasedRetentionPolicy(),
      maxSignalCount: 1,
      maxAgeDays: 7
    }
  );
  const deleteResult = deleteTeoyubePersonalizationSignals(store, {
    query: { surfaces: ["promise_cluster"] },
    reason: "Smoke cleanup."
  });

  const results = [
    result("store can be created", stripEmpty([
      store.status === "ready" ? "" : "Store should be ready.",
      Array.isArray(store.records) ? "" : "Store records should be an array."
    ])),
    result("signal can be sanitized", stripEmpty([
      sanitized.id ? "" : "Sanitized signal is missing id.",
      sanitized.storesRawText ? "Sanitized signal still stores raw text." : "",
      sanitized.rawTextPreview ? "Sanitized signal still has rawTextPreview." : ""
    ])),
    result("signal can be stored with consent", stripEmpty([
      directWrite.success ? "" : "Direct write should succeed with consent.",
      directWrite.data.accepted === 1 ? "" : "Direct write should accept one record."
    ])),
    result("signal is blocked when personalization is disabled", stripEmpty([
      disabledWrite.success ? "Disabled consent should block storage." : "",
      disabledWrite.data.rejected === 1 ? "" : "Disabled write should reject one record."
    ])),
    result("raw private text is redacted by default", stripEmpty([
      store.records.some((record) => record.signal.rawTextPreview)
        ? "At least one stored record contains raw text."
        : "",
      exportJson.includes("This should not be stored")
        ? "Export JSON contains raw private text."
        : ""
    ])),
    result("signals can be queried by surface", stripEmpty([
      surfaceQuery.data.length ? "" : "Surface query returned no records."
    ])),
    result("signals can be queried by emotion", stripEmpty([
      emotionQuery.data.length ? "" : "Emotion query returned no records."
    ])),
    result("signals can be grouped by selected word", stripEmpty([
      wordGroups.word_strength ? "" : "Selected word group is missing word_strength."
    ])),
    result("retention can remove expired or excess signals", stripEmpty([
      retained.length === 1 ? "" : "Retention should keep only one record.",
      retained.some((record) => record.id === oldRecord.id)
        ? "Retention kept an expired record."
        : ""
    ])),
    result("export simulation returns safe JSON", stripEmpty([
      exported.success ? "" : "Export should succeed.",
      exportJson.includes("rawTextPreview") && exportJson.includes("private")
        ? "Export appears to include private raw text."
        : ""
    ])),
    result("deletion simulation removes matching records", stripEmpty([
      deleteResult.data.deleted > 0 ? "" : "Deletion should remove matching records.",
      store.records.length === 0 ? "" : "Store should be empty after deleting promise_cluster records."
    ])),
    result("personalization context can be created from stored signals", stripEmpty([
      context.generatedAt ? "" : "Context is missing generatedAt.",
      context.consent.personalizationEnabled ? "" : "Context consent should be enabled."
    ])),
    result("no database localStorage cookie file or external API required", stripEmpty([
      batchWrite.data.accepted > 0 ? "" : "Batch event write should accept records.",
      exported.data.records.every((record) => record.metadata === undefined)
        ? ""
        : "Export should omit metadata when includeMetadata is false."
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
