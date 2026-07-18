import type {
  TigProductionEvent,
  TigProductionInput,
  TigProductionResponse
} from "./production-response-contracts";

function getScriptureReference(response: TigProductionResponse): string | undefined {
  const scripture = response.selection.scriptureAnchor;
  if (!scripture) return undefined;

  const reference = scripture.metadata.reference;
  return typeof reference === "string" ? reference : scripture.label;
}

function createBaseEvent(params: {
  eventName: string;
  input: TigProductionInput;
  response: TigProductionResponse;
  metadata?: Record<string, unknown>;
}): TigProductionEvent {
  const metadata = {
    externalAnalyticsSent: false,
    ...(params.metadata || {})
  };

  return {
    eventName: params.eventName,
    timestamp: new Date().toISOString(),
    surface: params.input.surface || "unknown",
    intent: params.input.intent,
    sessionId: params.input.sessionId,
    userId: params.input.userId,
    selectedWordId: params.response.selection.teoyubeWord?.id,
    selectedPromiseClusterId: params.response.selection.promiseCluster?.id,
    selectedScriptureReference: getScriptureReference(params.response),
    selectedPrayerSequenceId: params.response.selection.prayerSequence?.id,
    selectedActionStepId: params.response.selection.actionStep?.id,
    confidenceScore: params.response.confidence.score,
    confidenceLabel: params.response.confidence.label,
    fallbackUsed: params.response.fallback.used,
    fallbackReason: params.response.fallback.reasons[0],
    fallbackReasons: params.response.fallback.reasons,
    safetyStatus: params.response.safety.status,
    blocked: params.response.safety.blocked,
    explanationPathLength: params.response.explanation.reasonPath.length,
    graphNodeCount: params.response.visualization.statistics.totalNodes,
    graphEdgeCount: params.response.visualization.statistics.totalEdges,
    metadata
  };
}

export function createTigProductionEvent(
  input: TigProductionInput,
  response: TigProductionResponse
): TigProductionEvent {
  return createBaseEvent({
    eventName: "tig.production.response.created",
    input,
    response
  });
}

export function createTigRecommendationSelectedEvent(
  response: TigProductionResponse
): TigProductionEvent {
  return createBaseEvent({
    eventName: "tig.production.recommendation.selected",
    input: response.input,
    response,
    metadata: {
      selectedNodeIds: response.explanation.selectedNodeIds,
      selectedEdgeIds: response.explanation.selectedEdgeIds
    }
  });
}

export function createTigFallbackUsedEvent(
  response: TigProductionResponse
): TigProductionEvent {
  return createBaseEvent({
    eventName: "tig.production.fallback.used",
    input: response.input,
    response,
    metadata: {
      fallbackReasons: response.fallback.reasons,
      appliedNodeIds: response.fallback.appliedNodeIds
    }
  });
}

export function createTigLowConfidenceEvent(
  response: TigProductionResponse
): TigProductionEvent {
  return createBaseEvent({
    eventName: "tig.production.confidence.low",
    input: response.input,
    response,
    metadata: {
      confidenceBreakdown: response.confidence.breakdown
    }
  });
}

export function createTigBlockedResponseEvent(
  response: TigProductionResponse
): TigProductionEvent {
  return createBaseEvent({
    eventName: "tig.production.response.blocked",
    input: response.input,
    response,
    metadata: {
      violations: response.safety.violations,
      fallbackReasons: response.fallback.reasons,
      selectedNodeIds: response.explanation.selectedNodeIds
    }
  });
}

export function createTigSurfaceViewedEvent(
  surface: TigProductionInput["surface"],
  response: TigProductionResponse
): TigProductionEvent {
  return createBaseEvent({
    eventName: "tig.production.surface.viewed",
    input: {
      ...response.input,
      surface: surface || response.input.surface || "unknown"
    },
    response,
    metadata: {
      sourceSurface: surface || response.input.surface || "unknown"
    }
  });
}

export function createTigProductionEventBatch(
  input: TigProductionInput,
  response: TigProductionResponse
): TigProductionEvent[] {
  const events = [
    createTigProductionEvent(input, response),
    createTigRecommendationSelectedEvent(response)
  ];

  if (response.fallback.used) {
    events.push(createTigFallbackUsedEvent(response));
  }

  if (response.confidence.label === "weak" || response.confidence.score < 0.45) {
    events.push(createTigLowConfidenceEvent(response));
  }

  if (response.safety.blocked || response.fallback.reasons.includes("blocked_response")) {
    events.push(createTigBlockedResponseEvent(response));
  }

  events.push(createTigSurfaceViewedEvent(input.surface || response.input.surface, response));

  return events;
}
