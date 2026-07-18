import type {
  TeoyubePersonalizationSignal,
  TeoyubePersonalizationSignalType,
  TeoyubePersonalizationSummary,
  TeoyubePersonalizationSource
} from "./personalization-contracts";
import type {
  TigProductionEvent,
  TigProductionInput,
  TigProductionResponse,
  TigProductionSurface
} from "./production-response-contracts";

function createSignalId(prefix = "personalization_signal"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function cleanText(value?: string): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || undefined;
}

function clampWeight(value?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

function getScriptureReference(response: TigProductionResponse): string | undefined {
  const scripture = response.selection.scriptureAnchor;
  if (!scripture) return undefined;

  const reference = scripture.metadata.reference;
  return typeof reference === "string" ? reference : scripture.label;
}

function normalizeFallbackReasons(reasons?: string[]): string[] {
  return Array.isArray(reasons)
    ? reasons.map((reason) => cleanText(reason)).filter((reason): reason is string => Boolean(reason))
    : [];
}

function getSignalType(params: {
  selectedWordId?: string;
  selectedClusterId?: string;
  selectedScriptureReference?: string;
  fallbackUsed?: boolean;
  surface?: TigProductionSurface;
  emotionTag?: string;
  intent?: string;
}): TeoyubePersonalizationSignalType {
  if (params.fallbackUsed) return "fallback_frequency";
  if (params.selectedScriptureReference) return "scripture_saved";
  if (params.selectedClusterId) return "promise_cluster_selected";
  if (params.selectedWordId) return "word_selected";
  if (params.surface) return "surface_preferred";
  if (params.emotionTag) return "emotion_repeated";
  if (params.intent) return "intent_repeated";
  return "confidence_feedback";
}

export function normalizeTeoyubePersonalizationSignal(
  signal: Partial<TeoyubePersonalizationSignal>
): TeoyubePersonalizationSignal {
  const surface = signal.surface;
  const emotionTag = cleanText(signal.emotionTag)?.toLowerCase();
  const intent = cleanText(signal.intent);
  const selectedWordId = cleanText(signal.selectedWordId);
  const selectedClusterId = cleanText(signal.selectedClusterId);
  const selectedScriptureReference = cleanText(signal.selectedScriptureReference);
  const fallbackUsed = Boolean(signal.fallbackUsed);

  return {
    id: cleanText(signal.id) || createSignalId(),
    type:
      signal.type ||
      getSignalType({
        selectedWordId,
        selectedClusterId,
        selectedScriptureReference,
        fallbackUsed,
        surface,
        emotionTag,
        intent
      }),
    source: signal.source || "system_preview",
    timestamp: cleanText(signal.timestamp) || now(),
    surface,
    emotionTag,
    intent,
    selectedWordId,
    selectedClusterId,
    selectedScriptureReference,
    selectedPrayerSequenceId: cleanText(signal.selectedPrayerSequenceId),
    selectedActionStepId: cleanText(signal.selectedActionStepId),
    confidenceLabel: signal.confidenceLabel,
    confidenceScore:
      typeof signal.confidenceScore === "number" && Number.isFinite(signal.confidenceScore)
        ? Math.min(1, Math.max(0, signal.confidenceScore))
        : undefined,
    fallbackUsed,
    fallbackReasons: normalizeFallbackReasons(signal.fallbackReasons),
    journeyId: cleanText(signal.journeyId),
    callingId: cleanText(signal.callingId),
    count: typeof signal.count === "number" && signal.count > 0 ? signal.count : 1,
    weight: clampWeight(signal.weight),
    storesRawText: Boolean(signal.storesRawText && signal.rawTextPreview),
    rawTextPreview: signal.storesRawText ? cleanText(signal.rawTextPreview) : undefined,
    metadata: signal.metadata ? { ...signal.metadata } : undefined
  };
}

export function createSignalFromProductionInput(
  input: TigProductionInput,
  options?: { allowRawText?: boolean }
): TeoyubePersonalizationSignal {
  return normalizeTeoyubePersonalizationSignal({
    source: "production_input",
    surface: input.surface || "unknown",
    emotionTag: input.emotion || input.userState,
    intent: input.intent,
    selectedWordId: input.selectedWordId,
    selectedClusterId: input.selectedClusterId,
    storesRawText: Boolean(options?.allowRawText),
    rawTextPreview: options?.allowRawText ? input.input || input.userState : undefined,
    metadata: {
      hasInputText: Boolean(input.input),
      hasUserState: Boolean(input.userState),
      sessionIdPresent: Boolean(input.sessionId),
      userIdPresent: Boolean(input.userId)
    }
  });
}

export function createSignalFromProductionResponse(
  response: TigProductionResponse
): TeoyubePersonalizationSignal {
  return normalizeTeoyubePersonalizationSignal({
    source: "production_response",
    surface: response.input.surface || "unknown",
    emotionTag: response.input.emotion || response.input.userState,
    intent: response.input.intent,
    selectedWordId: response.selection.teoyubeWord?.id,
    selectedClusterId: response.selection.promiseCluster?.id,
    selectedScriptureReference: getScriptureReference(response),
    selectedPrayerSequenceId: response.selection.prayerSequence?.id,
    selectedActionStepId: response.selection.actionStep?.id,
    confidenceLabel: response.confidence.label,
    confidenceScore: response.confidence.score,
    fallbackUsed: response.fallback.used,
    fallbackReasons: response.fallback.reasons,
    journeyId: response.selection.kingdomJourney?.id,
    callingId: response.selection.callingArchetype?.id,
    weight: response.confidence.score,
    storesRawText: false,
    metadata: {
      responseId: response.id,
      explanationPathLength: response.explanation.reasonPath.length,
      graphNodeCount: response.visualization.statistics.totalNodes,
      graphEdgeCount: response.visualization.statistics.totalEdges
    }
  });
}

export function createSignalFromSurfaceEvent(
  event: TigProductionEvent
): TeoyubePersonalizationSignal {
  return normalizeTeoyubePersonalizationSignal({
    source: "production_event",
    surface: event.surface,
    intent: event.intent,
    selectedWordId: event.selectedWordId,
    selectedClusterId: event.selectedPromiseClusterId,
    selectedScriptureReference: event.selectedScriptureReference,
    selectedPrayerSequenceId: event.selectedPrayerSequenceId,
    selectedActionStepId: event.selectedActionStepId,
    confidenceLabel: event.confidenceLabel,
    confidenceScore: event.confidenceScore,
    fallbackUsed: event.fallbackUsed,
    fallbackReasons: event.fallbackReasons,
    weight: event.confidenceScore,
    storesRawText: false,
    metadata: {
      eventName: event.eventName,
      safetyStatus: event.safetyStatus,
      blocked: event.blocked,
      graphNodeCount: event.graphNodeCount,
      graphEdgeCount: event.graphEdgeCount
    }
  });
}

function signalKey(signal: TeoyubePersonalizationSignal): string {
  return [
    signal.type,
    signal.source,
    signal.surface,
    signal.emotionTag,
    signal.intent,
    signal.selectedWordId,
    signal.selectedClusterId,
    signal.selectedScriptureReference,
    signal.selectedPrayerSequenceId,
    signal.selectedActionStepId,
    signal.fallbackUsed ? "fallback" : "direct"
  ]
    .filter(Boolean)
    .join("|");
}

export function mergeTeoyubePersonalizationSignals(
  signals: Array<Partial<TeoyubePersonalizationSignal>>
): TeoyubePersonalizationSignal[] {
  const merged = new Map<string, TeoyubePersonalizationSignal>();

  signals.map(normalizeTeoyubePersonalizationSignal).forEach((signal) => {
    const key = signalKey(signal);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, signal);
      return;
    }

    merged.set(key, {
      ...existing,
      count: (existing.count || 1) + (signal.count || 1),
      weight: Math.min(1, Math.max(existing.weight, signal.weight)),
      timestamp: signal.timestamp > existing.timestamp ? signal.timestamp : existing.timestamp,
      fallbackReasons: [...new Set([...existing.fallbackReasons || [], ...signal.fallbackReasons || []])]
    });
  });

  return [...merged.values()].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function topCounts<TValue extends string>(
  values: Array<TValue | undefined>,
  limit = 5
): Array<{ value: TValue; count: number }> {
  const counts = values.reduce<Map<TValue, number>>((map, value) => {
    if (value) map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map<TValue, number>());

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit);
}

export function summarizeTeoyubePersonalizationSignals(
  signals: TeoyubePersonalizationSignal[]
): TeoyubePersonalizationSummary {
  const normalized = mergeTeoyubePersonalizationSignals(signals);

  return {
    signalCount: normalized.reduce((sum, signal) => sum + (signal.count || 1), 0),
    topEmotionTags: topCounts(normalized.flatMap((signal) => Array(signal.count || 1).fill(signal.emotionTag))),
    topWordIds: topCounts(normalized.flatMap((signal) => Array(signal.count || 1).fill(signal.selectedWordId))),
    topClusterIds: topCounts(
      normalized.flatMap((signal) => Array(signal.count || 1).fill(signal.selectedClusterId))
    ),
    topScriptureReferences: topCounts(
      normalized.flatMap((signal) =>
        Array(signal.count || 1).fill(signal.selectedScriptureReference)
      )
    ),
    fallbackCount: normalized
      .filter((signal) => signal.fallbackUsed)
      .reduce((sum, signal) => sum + (signal.count || 1), 0),
    surfaces: topCounts(
      normalized.flatMap((signal) => Array(signal.count || 1).fill(signal.surface))
    )
  };
}

export function getSignalSourceLabel(source: TeoyubePersonalizationSource): string {
  return source.replace(/_/g, " ");
}
