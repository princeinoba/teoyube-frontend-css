import type {
  GraphVisualization,
  GraphVisualizationEdge,
  GraphVisualizationGroup,
  GraphVisualizationNode
} from "./graph-visualization";
import type {
  TigRecommendationInput,
  TigRecommendationPath
} from "./intelligence-graph-engine";
import { selectBestTigPath } from "./intelligence-graph-engine";
import type { TigSeedEdge, TigSeedNode } from "./intelligence-graph-seeds";
import {
  getCachedTigProductionResponse,
  getTigProductionCacheKey,
  setCachedTigProductionResponse
} from "./production-cache";
import {
  createTigProductionEvent,
  createTigProductionEventBatch
} from "./production-events";
import {
  applyTigProductionFallback,
  resolveTigProductionFallback
} from "./production-fallbacks";
import {
  getSafeGeneralEncouragementPath,
  getTigProductionSafetyStatus,
  sanitizeTigProductionResponse,
  shouldBlockTigProductionResponse
} from "./production-guardrails";
import {
  assertTigProductionResponseComplete,
  validateTigProductionResponseShape
} from "./production-response-validation";
import type {
  TigProductionEvent,
  TigProductionFallback,
  TigProductionInput,
  TigProductionResponse,
  TigProductionSafetyStatus,
  TigProductionSurface
} from "./production-response-contracts";

const PRODUCTION_SERVICE_VERSION = "5B.3" as const;

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function uniqueById<TItem extends { id: string }>(items: TItem[]): TItem[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function createResponseId(): string {
  return `tig_production_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function contextToText(context?: Record<string, unknown>): string {
  if (!context) return "";

  return Object.values(context)
    .flatMap((value) => {
      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
      }
      return typeof value === "string" || typeof value === "number" ? [String(value)] : [];
    })
    .join(" ");
}

function normalizeProductionInput(input: TigProductionInput): TigProductionInput {
  const safeInput = input && typeof input === "object" ? input : {};
  const primaryInput = normalizeText(
    safeInput.input ||
      safeInput.userState ||
      safeInput.emotion ||
      safeInput.intent ||
      "I need Scripture-grounded encouragement."
  );

  return {
    ...safeInput,
    input: primaryInput,
    surface: safeInput.surface || "unknown"
  };
}

function surfaceToMode(surface?: TigProductionSurface): string {
  if (surface === "daily_word") return "daily_word";
  if (surface === "prayer") return "prayer";
  if (surface === "calling_compass") return "calling_compass";
  if (surface === "promise_cluster" || surface === "canon") return "promise_search";
  if (surface === "ai_companion") return "ai_companion";
  return "promise_search";
}

function toRecommendationInput(input: TigProductionInput): TigRecommendationInput {
  return {
    input: normalizeText(
      [
        input.input,
        input.userState,
        input.emotion,
        input.intent,
        input.selectedWordId,
        input.selectedClusterId,
        contextToText(input.context)
      ]
        .filter(Boolean)
        .join(" ")
    ),
    mode: surfaceToMode(input.surface),
    userState: input.userState || input.emotion,
    emotionTags: uniqueStrings([input.emotion, input.userState])
  };
}

function groupFromNodeKind(kind: string): GraphVisualizationGroup {
  if (kind === "scripture") return "SCRIPTURE";
  if (kind === "promise_category") return "PROMISE";
  if (kind === "promise_cluster") return "PROMISE_CLUSTER";
  if (kind === "teoyube_word") return "WORD";
  if (kind === "emotion_profile") return "EMOTION";
  if (kind === "calling_archetype") return "CALLING";
  if (kind === "kingdom_journey" || kind === "kingdom_path") return "JOURNEY";
  if (kind === "prayer_sequence") return "PRAYER";
  if (kind === "reflection_prompt") return "REFLECTION";
  if (kind === "action_step") return "ACTION";
  if (kind === "growth_milestone") return "MILESTONE";
  if (kind === "ai_pathway") return "AI_PATTERN";
  return "UNKNOWN";
}

function getVisualizationNodeType(node: TigSeedNode): GraphVisualizationNode["type"] {
  const sourceType = node.metadata.sourceType;
  return typeof sourceType === "string"
    ? (sourceType as GraphVisualizationNode["type"])
    : "UNKNOWN";
}

function getEdgeConfidence(edge: TigSeedEdge): number {
  const confidence = edge.metadata.confidenceScore;
  return typeof confidence === "number" ? confidence : edge.weight;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildVisualization(params: {
  nodes: TigSeedNode[];
  edges: TigSeedEdge[];
  rootNodeId?: string;
}): GraphVisualization {
  const nodes = uniqueById(params.nodes).map<GraphVisualizationNode>((node) => ({
    id: node.id,
    label: node.label,
    subtitle: node.kind,
    type: getVisualizationNodeType(node),
    group: groupFromNodeKind(node.kind),
    importance: node.weight,
    selected: true,
    root: node.id === params.rootNodeId,
    metadata: {
      kind: node.kind,
      scriptureRefs: node.scriptureRefs,
      clusterIds: node.clusterIds,
      journeyIds: node.journeyIds,
      emotionTags: node.emotionTags
    }
  }));
  const edges = uniqueById(params.edges).map<GraphVisualizationEdge>((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    relationshipType: edge.kind,
    strength: edge.weight,
    confidence: getEdgeConfidence(edge),
    label: edge.label,
    highlighted: true
  }));

  return {
    nodes,
    edges,
    statistics: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType: nodes.reduce<Record<string, number>>((counts, node) => {
        counts[node.group] = (counts[node.group] || 0) + 1;
        return counts;
      }, {}),
      averageRelationshipStrength: average(edges.map((edge) => edge.strength)),
      averageConfidence: average(edges.map((edge) => edge.confidence))
    }
  };
}

function placeholderSafety(): TigProductionSafetyStatus {
  return {
    safe: true,
    blocked: false,
    status: "safe",
    warnings: [],
    violations: [],
    guardrails: []
  };
}

function placeholderEvent(input: TigProductionInput): TigProductionEvent {
  return {
    eventName: "tig.production.response.pending",
    timestamp: new Date().toISOString(),
    surface: input.surface || "unknown",
    intent: input.intent,
    sessionId: input.sessionId,
    userId: input.userId,
    confidenceScore: 0,
    confidenceLabel: "weak",
    fallbackUsed: false,
    fallbackReasons: [],
    safetyStatus: "safe",
    blocked: false,
    explanationPathLength: 0,
    graphNodeCount: 0,
    graphEdgeCount: 0,
    metadata: {
      externalAnalyticsSent: false
    }
  };
}

function buildProductionResponseFromPath(params: {
  input: TigProductionInput;
  path: TigRecommendationPath;
  fallback: TigProductionFallback;
  summary?: string;
}): TigProductionResponse {
  const selected = params.path.selectedNodes;
  const selectedNodes = uniqueById(params.path.nodes);
  const selectedEdges = uniqueById(params.path.edges);
  const selectedNodeIds = selectedNodes.map((node) => node.id);
  const selectedEdgeIds = selectedEdges.map((edge) => edge.id);
  const scriptureLabel = selected.scripture?.label || "Scripture";
  const clusterLabel = selected.promiseCluster?.label || "a Scripture-backed promise";

  return {
    id: createResponseId(),
    version: PRODUCTION_SERVICE_VERSION,
    input: params.input,
    selection: {
      teoyubeWord: selected.word,
      promiseCluster: selected.promiseCluster,
      scriptureAnchor: selected.scripture,
      prayerSequence: selected.prayerSequence,
      actionStep: selected.actionStep,
      callingArchetype: selected.callingArchetype,
      kingdomJourney: selected.kingdomJourney,
      aiPathway: selected.aiPathway,
      nodes: selectedNodes,
      edges: selectedEdges
    },
    confidence: {
      score: params.path.confidence,
      label: params.path.confidenceLabel,
      breakdown: params.path.confidenceBreakdown
    },
    explanation: {
      summary:
        params.summary ||
        `Teoyube selected ${clusterLabel} and anchored the response in ${scriptureLabel}.`,
      reasonPath: params.path.reasonPath,
      scriptureEvidence: params.path.scriptureEvidence,
      selectedNodeIds,
      selectedEdgeIds,
      warnings: []
    },
    visualization: buildVisualization({
      nodes: selectedNodes,
      edges: selectedEdges,
      rootNodeId: selected.emotion?.id || selected.scripture?.id
    }),
    fallback: params.fallback,
    safety: placeholderSafety(),
    event: placeholderEvent(params.input),
    generatedAt: new Date().toISOString()
  };
}

function refreshDerivedResponseFields(response: TigProductionResponse): TigProductionResponse {
  const nodes = uniqueById(response.selection.nodes);
  const edges = uniqueById(response.selection.edges);

  return {
    ...response,
    selection: {
      ...response.selection,
      nodes,
      edges
    },
    explanation: {
      ...response.explanation,
      selectedNodeIds: nodes.map((node) => node.id),
      selectedEdgeIds: edges.map((edge) => edge.id)
    },
    visualization: buildVisualization({
      nodes,
      edges,
      rootNodeId: response.selection.scriptureAnchor?.id
    })
  };
}

function finalizeProductionResponse(
  response: TigProductionResponse,
  cacheKey: string
): TigProductionResponse {
  const withSafety = {
    ...response,
    safety: getTigProductionSafetyStatus(response)
  };
  const withFallback = refreshDerivedResponseFields(applyTigProductionFallback(withSafety));
  const sanitized = refreshDerivedResponseFields(sanitizeTigProductionResponse(withFallback));
  const finalSafety = getTigProductionSafetyStatus(sanitized);
  const safeResponse = {
    ...sanitized,
    safety: finalSafety
  };
  const shapeValidation = validateTigProductionResponseShape(safeResponse);

  if (shouldBlockTigProductionResponse(safeResponse) || !shapeValidation.valid) {
    const safePath = getSafeGeneralEncouragementPath();
    const fallbackResponse = buildProductionResponseFromPath({
      input: response.input,
      path: safePath,
      fallback: {
        used: true,
        reasons: [
          shouldBlockTigProductionResponse(safeResponse)
            ? "blocked_response"
            : "incomplete_production_response",
          "unsafe_or_incomplete_recommendation"
        ],
        message:
          "Using a safe fallback path so this response remains Scripture-anchored, complete, and explainable.",
        appliedNodeIds: safePath.nodes.map((node) => node.id)
      },
      summary:
        "Teoyube used a safe Scripture-grounded fallback path because the original recommendation needed additional guardrail support."
    });
    const safeFallback = refreshDerivedResponseFields(sanitizeTigProductionResponse(fallbackResponse));
    const completeSafeFallback = {
      ...safeFallback,
      safety: getTigProductionSafetyStatus(safeFallback),
      cacheKey
    };
    assertTigProductionResponseComplete(completeSafeFallback);

    const eventBatch = createTigProductionEventBatch(response.input, completeSafeFallback);

    return {
      ...completeSafeFallback,
      event: eventBatch[0] || createTigProductionEvent(response.input, completeSafeFallback),
      eventBatch
    };
  }

  const responseWithCacheKey = {
    ...safeResponse,
    cacheKey
  };
  assertTigProductionResponseComplete(responseWithCacheKey);

  const eventBatch = createTigProductionEventBatch(response.input, responseWithCacheKey);

  return {
    ...responseWithCacheKey,
    event: eventBatch[0] || createTigProductionEvent(response.input, responseWithCacheKey),
    eventBatch
  };
}

export function runTeoyubeProductionIntelligence(
  input: TigProductionInput
): TigProductionResponse {
  const normalizedInput = normalizeProductionInput(input);
  const cacheKey = getTigProductionCacheKey(normalizedInput);
  const cachedResponse = getCachedTigProductionResponse(cacheKey);
  if (cachedResponse && validateTigProductionResponseShape(cachedResponse).valid) {
    return cachedResponse;
  }

  const path = selectBestTigPath(toRecommendationInput(normalizedInput));
  const fallback = resolveTigProductionFallback(normalizedInput);
  const response = buildProductionResponseFromPath({
    input: normalizedInput,
    path,
    fallback
  });
  const finalResponse = finalizeProductionResponse(response, cacheKey);

  setCachedTigProductionResponse(cacheKey, finalResponse);
  return finalResponse;
}
