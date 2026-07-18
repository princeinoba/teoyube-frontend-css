import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import {
  applyTeoyubeSignalRetentionPolicy,
  createConsentBasedRetentionPolicy,
  getDefaultTeoyubeSignalRetentionPolicy
} from "./personalization-retention";
import {
  sanitizeSignalForStore,
  validateSignalStoreConsent,
  validateSignalStoreRecord
} from "./personalization-signal-store-safety";
import type {
  TeoyubeSignalDeletionRequest,
  TeoyubeSignalExportRequest,
  TeoyubeSignalPrivacyLevel,
  TeoyubeSignalRetentionPolicy,
  TeoyubeSignalStoreAdapter,
  TeoyubeSignalStoreOptions,
  TeoyubeSignalStoreQuery,
  TeoyubeSignalStoreRecord,
  TeoyubeSignalStoreResult,
  TeoyubeSignalStoreScope,
  TeoyubeSignalStoreSummary,
  TeoyubeSignalStoreWriteResult
} from "./personalization-signal-store-contracts";

function now(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function mergeRetentionPolicy(
  policy?: Partial<TeoyubeSignalRetentionPolicy>
): TeoyubeSignalRetentionPolicy {
  return {
    ...getDefaultTeoyubeSignalRetentionPolicy(),
    ...(policy || {}),
    id: policy?.id || getDefaultTeoyubeSignalRetentionPolicy().id,
    createdAt: policy?.createdAt || now()
  };
}

function countMap<TValue extends string>(values: Array<TValue | undefined>): Record<string, number> {
  return values.reduce<Record<string, number>>((map, value) => {
    if (value) map[value] = (map[value] || 0) + 1;
    return map;
  }, {});
}

function emptyPrivacyCounts(): Record<TeoyubeSignalPrivacyLevel, number> {
  return {
    anonymous: 0,
    session_only: 0,
    consented_profile: 0,
    disabled: 0
  };
}

function emptyScopeCounts(): Record<TeoyubeSignalStoreScope, number> {
  return {
    session: 0,
    surface: 0,
    profile_preview: 0,
    development: 0,
    unknown: 0
  };
}

function expiresAtFor(policy: TeoyubeSignalRetentionPolicy, createdAt: string): string | undefined {
  if (policy.maxAgeDays === undefined) return undefined;
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return undefined;
  return new Date(created + policy.maxAgeDays * 24 * 60 * 60 * 1000).toISOString();
}

function resolvePrivacyLevel(
  store: TeoyubeSignalStoreAdapter,
  consent: TeoyubePersonalizationConsent
): TeoyubeSignalPrivacyLevel {
  if (!consent.personalizationEnabled) return "disabled";
  if (store.privacyLevel === "disabled") return "disabled";
  if (store.privacyLevel === "anonymous") return "anonymous";
  if (store.privacyLevel === "consented_profile" && consent.learningEnabled) {
    return "consented_profile";
  }
  return "session_only";
}

function buildTags(signal: TeoyubePersonalizationSignal): string[] {
  return [
    signal.type,
    signal.source,
    signal.surface,
    signal.emotionTag,
    signal.intent,
    signal.selectedWordId,
    signal.selectedClusterId,
    signal.selectedScriptureReference,
    signal.journeyId,
    signal.callingId
  ].filter((tag): tag is string => Boolean(tag));
}

function queryMatches(record: TeoyubeSignalStoreRecord, query: TeoyubeSignalStoreQuery = {}): boolean {
  const signal = record.signal;

  if (query.ids?.length && !query.ids.includes(record.id) && !query.ids.includes(signal.id)) return false;
  if (query.surfaces?.length && (!signal.surface || !query.surfaces.includes(signal.surface))) return false;
  if (query.emotionTags?.length && (!signal.emotionTag || !query.emotionTags.includes(signal.emotionTag))) return false;
  if (query.intents?.length && (!signal.intent || !query.intents.includes(signal.intent))) return false;
  if (query.selectedWordIds?.length && (!signal.selectedWordId || !query.selectedWordIds.includes(signal.selectedWordId))) {
    return false;
  }
  if (
    query.selectedClusterIds?.length &&
    (!signal.selectedClusterId || !query.selectedClusterIds.includes(signal.selectedClusterId))
  ) {
    return false;
  }
  if (
    query.selectedScriptureReferences?.length &&
    (!signal.selectedScriptureReference ||
      !query.selectedScriptureReferences.includes(signal.selectedScriptureReference))
  ) {
    return false;
  }
  if (query.fallbackUsed !== undefined && signal.fallbackUsed !== query.fallbackUsed) return false;
  if (
    query.confidenceLabels?.length &&
    (!signal.confidenceLabel || !query.confidenceLabels.includes(signal.confidenceLabel))
  ) {
    return false;
  }
  if (query.privacyLevels?.length && !query.privacyLevels.includes(record.privacyLevel)) return false;
  if (query.scopes?.length && !query.scopes.includes(record.scope)) return false;
  if (query.sessionId && record.sessionId !== query.sessionId) return false;
  if (query.userId && record.userId !== query.userId) return false;
  if (query.createdAfter && record.createdAt < query.createdAfter) return false;
  if (query.createdBefore && record.createdAt > query.createdBefore) return false;

  return true;
}

function result<TData>(
  store: TeoyubeSignalStoreAdapter,
  data: TData,
  errors: string[] = [],
  warnings: string[] = []
): TeoyubeSignalStoreResult<TData> {
  return {
    success: errors.length === 0,
    status: store.status,
    data,
    errors,
    warnings
  };
}

export function createTeoyubePersonalizationSignalStore(
  options: TeoyubeSignalStoreOptions = {}
): TeoyubeSignalStoreAdapter {
  const retentionPolicy =
    options.retentionPolicy ||
    (options.privacyLevel === "consented_profile"
      ? createConsentBasedRetentionPolicy()
      : getDefaultTeoyubeSignalRetentionPolicy());

  return {
    status: options.status || (options.privacyLevel === "disabled" ? "disabled" : "ready"),
    scope: options.scope || "development",
    privacyLevel: options.privacyLevel || "session_only",
    retentionPolicy: mergeRetentionPolicy(retentionPolicy),
    records: [],
    sessionId: options.sessionId,
    userId: options.userId,
    metadata: options.metadata ? { ...options.metadata } : undefined
  };
}

export function createInMemoryTeoyubeSignalStore(
  options: TeoyubeSignalStoreOptions = {}
): TeoyubeSignalStoreAdapter {
  return createTeoyubePersonalizationSignalStore(options);
}

export function addTeoyubePersonalizationSignal(
  store: TeoyubeSignalStoreAdapter,
  signal: Partial<TeoyubePersonalizationSignal>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubeSignalStoreWriteResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (store.status !== "ready") {
    errors.push(`Signal store status is ${store.status}.`);
  }

  const consentStatus = validateSignalStoreConsent(consent);
  warnings.push(...consentStatus.warnings);
  errors.push(...consentStatus.reasons);

  const sanitizedSignal = sanitizeSignalForStore(signal, consentStatus.consent);
  const privacyLevel = resolvePrivacyLevel(store, consentStatus.consent);

  if (privacyLevel === "disabled") {
    errors.push("Signal privacy level is disabled.");
  }

  if (errors.length) {
    return {
      success: false,
      status: store.status,
      data: {
        accepted: 0,
        rejected: 1,
        records: []
      },
      errors,
      warnings
    };
  }

  const createdAt = now();
  const record: TeoyubeSignalStoreRecord = {
    id: createId("signal_record"),
    signal: sanitizedSignal,
    privacyLevel,
    scope: store.scope,
    sessionId: store.sessionId,
    userId: privacyLevel === "anonymous" ? undefined : store.userId,
    consented: true,
    sanitized: true,
    createdAt,
    updatedAt: createdAt,
    expiresAt: expiresAtFor(store.retentionPolicy, createdAt),
    tags: buildTags(sanitizedSignal),
    metadata: {
      ...store.metadata,
      storeType: "in_memory",
      persistenceConnected: false
    }
  };
  const validation = validateSignalStoreRecord(record);

  if (!validation.valid) {
    return {
      success: false,
      status: store.status,
      data: {
        accepted: 0,
        rejected: 1,
        records: []
      },
      errors: validation.errors,
      warnings: [...warnings, ...validation.warnings]
    };
  }

  store.records = applyTeoyubeSignalRetentionPolicy(
    [record, ...store.records],
    store.retentionPolicy
  );

  return {
    success: true,
    status: store.status,
    data: {
      accepted: 1,
      rejected: 0,
      records: [record]
    },
    errors: [],
    warnings: [...warnings, ...validation.warnings]
  };
}

export function addTeoyubePersonalizationSignals(
  store: TeoyubeSignalStoreAdapter,
  signals: Array<Partial<TeoyubePersonalizationSignal>>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubeSignalStoreWriteResult {
  const records: TeoyubeSignalStoreRecord[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let rejected = 0;

  signals.forEach((signal) => {
    const write = addTeoyubePersonalizationSignal(store, signal, consent);
    records.push(...write.data.records);
    warnings.push(...write.warnings);
    if (!write.success) {
      rejected += 1;
      errors.push(...write.errors);
    }
  });

  return {
    success: errors.length === 0,
    status: store.status,
    data: {
      accepted: records.length,
      rejected,
      records
    },
    errors,
    warnings
  };
}

export function queryTeoyubePersonalizationSignals(
  store: TeoyubeSignalStoreAdapter,
  query: TeoyubeSignalStoreQuery = {}
): TeoyubeSignalStoreResult<TeoyubeSignalStoreRecord[]> {
  const records = store.records
    .filter((record) => queryMatches(record, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, query.limit || store.records.length);

  return result(store, records);
}

export function getTeoyubeSignalStoreSummary(
  store: TeoyubeSignalStoreAdapter
): TeoyubeSignalStoreSummary {
  const privacyCounts = emptyPrivacyCounts();
  const scopeCounts = emptyScopeCounts();
  store.records.forEach((record) => {
    privacyCounts[record.privacyLevel] += 1;
    scopeCounts[record.scope] += 1;
  });
  const sortedDates = store.records.map((record) => record.createdAt).sort();

  return {
    status: store.status,
    recordCount: store.records.length,
    privacyCounts,
    scopeCounts,
    surfaceCounts: countMap(store.records.map((record) => record.signal.surface)),
    emotionCounts: countMap(store.records.map((record) => record.signal.emotionTag)),
    wordCounts: countMap(store.records.map((record) => record.signal.selectedWordId)),
    clusterCounts: countMap(store.records.map((record) => record.signal.selectedClusterId)),
    fallbackCount: store.records.filter((record) => record.signal.fallbackUsed).length,
    oldestRecordAt: sortedDates[0],
    newestRecordAt: sortedDates[sortedDates.length - 1],
    retentionPolicy: store.retentionPolicy
  };
}

export function clearTeoyubePersonalizationSignals(
  store: TeoyubeSignalStoreAdapter,
  scope?: TeoyubeSignalStoreScope
): TeoyubeSignalStoreResult<{ cleared: number }> {
  const before = store.records.length;
  store.records = scope
    ? store.records.filter((record) => record.scope !== scope)
    : [];

  return result(store, {
    cleared: before - store.records.length
  });
}

export function deleteTeoyubePersonalizationSignals(
  store: TeoyubeSignalStoreAdapter,
  request: TeoyubeSignalDeletionRequest
): TeoyubeSignalStoreResult<{ deleted: number; reason?: string }> {
  const before = store.records.length;
  store.records = store.records.filter((record) => {
    if (request.ids?.includes(record.id) || request.ids?.includes(record.signal.id)) return false;
    if (request.scope && record.scope !== request.scope) return true;
    if (request.sessionId && record.sessionId !== request.sessionId) return true;
    if (request.userId && record.userId !== request.userId) return true;
    if (request.query && queryMatches(record, request.query)) return false;
    if (request.scope || request.sessionId || request.userId) return false;
    return true;
  });

  return result(store, {
    deleted: before - store.records.length,
    reason: request.reason
  });
}

export function exportTeoyubePersonalizationSignals(
  store: TeoyubeSignalStoreAdapter,
  request: TeoyubeSignalExportRequest = {}
): TeoyubeSignalStoreResult<{
  exportedAt: string;
  recordCount: number;
  records: TeoyubeSignalStoreRecord[];
}> {
  const queried = queryTeoyubePersonalizationSignals(store, request.query).data;
  const records = queried.map((record) => ({
    ...record,
    signal: {
      ...record.signal,
      storesRawText: false,
      rawTextPreview: undefined
    },
    metadata: request.includeMetadata ? record.metadata : undefined
  }));

  return result(store, {
    exportedAt: request.requestedAt || now(),
    recordCount: records.length,
    records
  });
}
