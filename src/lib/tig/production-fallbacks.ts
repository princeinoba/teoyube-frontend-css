import type { TigRecommendationPath } from "./intelligence-graph-engine";
import { selectBestTigPath } from "./intelligence-graph-engine";
import { findTigSeedNodeById, findTigSeedNodesByKind } from "./intelligence-graph-seeds";
import {
  getMissingTigProductionFields,
  validateTigProductionResponseShape
} from "./production-response-validation";
import type {
  TigProductionFallback,
  TigProductionFallbackReason,
  TigProductionInput,
  TigProductionResponse
} from "./production-response-contracts";

const DEFAULT_PRODUCTION_FALLBACK_INPUT =
  "I need Scripture-grounded encouragement, a safe prayer, and one faithful next step.";

function uniqueValues<TValue extends string>(values: TValue[]): TValue[] {
  return [...new Set(values.filter(Boolean))];
}

function normalizeValue(value?: string): string {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function hasUsefulInput(input: TigProductionInput): boolean {
  return Boolean(
    normalizeValue(input.input) ||
      normalizeValue(input.userState) ||
      normalizeValue(input.emotion) ||
      normalizeValue(input.intent)
  );
}

function isKnownEmotion(emotion?: string): boolean {
  const normalizedEmotion = normalizeValue(emotion);
  if (!normalizedEmotion) return false;

  return findTigSeedNodesByKind("emotion_profile").some((node) => {
    const values = [
      node.id,
      node.label,
      node.description,
      ...node.emotionTags,
      ...((node.metadata.tags as string[] | undefined) || []),
      ...((node.metadata.aliases as string[] | undefined) || [])
    ].map(normalizeValue);

    return values.some((value) => value === normalizedEmotion || value.includes(normalizedEmotion));
  });
}

function seedNodeExists(idOrLabel?: string): boolean {
  const normalized = normalizeValue(idOrLabel);
  if (!normalized) return false;
  if (findTigSeedNodeById(idOrLabel || "")) return true;

  return findTigSeedNodesByKind("teoyube_word")
    .concat(findTigSeedNodesByKind("promise_cluster"))
    .some((node) => {
      const values = [
        node.id,
        node.label,
        ...(node.clusterIds || []),
        ...((node.metadata.tags as string[] | undefined) || []),
        ...((node.metadata.aliases as string[] | undefined) || [])
      ].map(normalizeValue);

      return values.some((value) => value === normalized || value.includes(normalized));
    });
}

function removeReasons(
  reasons: TigProductionFallbackReason[],
  removableReasons: TigProductionFallbackReason[]
): TigProductionFallbackReason[] {
  return reasons.filter((reason) => !removableReasons.includes(reason));
}

function normalizeResponseAwareReasons(
  reasons: TigProductionFallbackReason[],
  response: TigProductionResponse
): TigProductionFallbackReason[] {
  let normalizedReasons = [...reasons];

  if (response.selection.teoyubeWord) {
    normalizedReasons = removeReasons(normalizedReasons, [
      "no_selected_word",
      "no_matching_word_found"
    ]);
  }

  if (response.selection.promiseCluster) {
    normalizedReasons = removeReasons(normalizedReasons, [
      "no_matching_promise_cluster_found"
    ]);
  }

  return normalizedReasons;
}

export function getDefaultTigProductionPath(): TigRecommendationPath {
  return selectBestTigPath({
    input: DEFAULT_PRODUCTION_FALLBACK_INPUT,
    mode: "promise_search",
    userState: "encouragement",
    emotionTags: ["discouragement", "waiting", "fear"]
  });
}

export function resolveTigProductionFallback(input: TigProductionInput): TigProductionFallback {
  const reasons: TigProductionFallbackReason[] = [];

  if (!input || typeof input !== "object" || !hasUsefulInput(input)) {
    reasons.push("malformed_input");
  }

  if (!input.userState) {
    reasons.push("missing_user_state");
  }

  if (!input.emotion) {
    reasons.push("missing_emotion");
    reasons.push("no_user_emotion_provided");
  }

  if (input.emotion && !isKnownEmotion(input.emotion)) {
    reasons.push("unknown_emotion");
  }

  if (!input.selectedWordId) {
    reasons.push("no_selected_word");
    reasons.push("no_matching_word_found");
  } else if (!seedNodeExists(input.selectedWordId)) {
    reasons.push("selected_word_not_found");
  }

  if (!input.selectedClusterId) {
    reasons.push("no_matching_promise_cluster_found");
  }

  return {
    used: false,
    reasons: uniqueValues(reasons),
    message: "No production fallback was required.",
    appliedNodeIds: []
  };
}

export function getTigFallbackReason(
  input: TigProductionInput,
  response?: TigProductionResponse
): TigProductionFallbackReason[] {
  let reasons = [...resolveTigProductionFallback(input).reasons];

  if (!response) return uniqueValues(reasons);

  reasons = normalizeResponseAwareReasons(reasons, response);

  if (!response.selection.teoyubeWord) reasons.push("no_matching_word_found");
  if (!response.selection.promiseCluster) reasons.push("no_matching_promise_cluster_found");
  if (
    response.selection.promiseCluster &&
    !response.selection.promiseCluster.scriptureRefs.length &&
    !response.selection.edges.some((edge) =>
      [edge.source, edge.target].includes(response.selection.promiseCluster?.id || "")
    )
  ) {
    reasons.push("promise_cluster_missing_scripture_anchor");
  }
  if (!response.selection.scriptureAnchor) reasons.push("missing_scripture_anchor");
  if (!response.selection.prayerSequence) reasons.push("missing_prayer_sequence");
  if (!response.selection.actionStep) reasons.push("missing_action_step");
  if (!response.explanation.reasonPath.length) reasons.push("missing_graph_path");
  if (response.confidence.score < 0.45) reasons.push("weak_confidence_score");
  if (response.safety.blocked) reasons.push("blocked_response");
  if (response.safety.violations.some((violation) => violation.toLowerCase().includes("action"))) {
    reasons.push("unsafe_action_step");
  }
  if (response.safety.warnings.length || response.safety.violations.length) {
    reasons.push("validation_warning");
  }

  const shapeValidation = validateTigProductionResponseShape(response);
  if (!shapeValidation.valid) {
    reasons.push("incomplete_production_response");
  }

  return uniqueValues(reasons);
}

export function isTigProductionFallbackRequired(response: TigProductionResponse): boolean {
  const reasons = getTigFallbackReason(response.input, response);
  return reasons.length > 0;
}

export function applyTigProductionFallback(
  response: TigProductionResponse
): TigProductionResponse {
  const fallbackReasons: TigProductionFallbackReason[] = normalizeResponseAwareReasons([
    ...response.fallback.reasons,
    ...getTigFallbackReason(response.input, response)
  ], response);

  if (response.confidence.score < 0.45) fallbackReasons.push("weak_confidence_score");
  if (!response.selection.teoyubeWord) fallbackReasons.push("no_matching_word_found");
  if (!response.selection.promiseCluster) fallbackReasons.push("no_matching_promise_cluster_found");
  if (!response.selection.scriptureAnchor) fallbackReasons.push("missing_scripture_anchor");
  if (!response.selection.prayerSequence) fallbackReasons.push("missing_prayer_sequence");
  if (!response.selection.actionStep) fallbackReasons.push("missing_action_step");
  if (!response.explanation.reasonPath.length) fallbackReasons.push("missing_graph_path");
  if (getMissingTigProductionFields(response).length) {
    fallbackReasons.push("incomplete_production_response");
  }
  if (response.safety.warnings.length) fallbackReasons.push("validation_warning");
  if (response.safety.blocked || response.safety.violations.length) {
    fallbackReasons.push("unsafe_or_incomplete_recommendation");
  }

  const uniqueReasons = uniqueValues(fallbackReasons);
  if (!uniqueReasons.length) {
    return {
      ...response,
      fallback: {
        ...response.fallback,
      used: false,
      message: "No production fallback was required."
      }
    };
  }

  const defaultPath = getDefaultTigProductionPath();
  const selectedNodes = defaultPath.selectedNodes;
  const fallbackNodes = defaultPath.nodes.filter(
    (node) => !response.selection.nodes.some((existingNode) => existingNode.id === node.id)
  );
  const fallbackEdges = defaultPath.edges.filter(
    (edge) => !response.selection.edges.some((existingEdge) => existingEdge.id === edge.id)
  );

  return {
    ...response,
    selection: {
      ...response.selection,
      teoyubeWord: response.selection.teoyubeWord || selectedNodes.word,
      promiseCluster: response.selection.promiseCluster || selectedNodes.promiseCluster,
      scriptureAnchor: response.selection.scriptureAnchor || selectedNodes.scripture,
      prayerSequence: response.selection.prayerSequence || selectedNodes.prayerSequence,
      actionStep: response.selection.actionStep || selectedNodes.actionStep,
      callingArchetype: response.selection.callingArchetype || selectedNodes.callingArchetype,
      kingdomJourney: response.selection.kingdomJourney || selectedNodes.kingdomJourney,
      aiPathway: response.selection.aiPathway || selectedNodes.aiPathway,
      nodes: [...response.selection.nodes, ...fallbackNodes],
      edges: [...response.selection.edges, ...fallbackEdges]
    },
    explanation: {
      ...response.explanation,
      summary:
        response.explanation.summary ||
        "Teoyube used a safe Scripture-grounded fallback path because the original graph result was incomplete.",
      reasonPath: uniqueValues([...response.explanation.reasonPath, ...defaultPath.reasonPath]),
      scriptureEvidence: uniqueValues([
        ...response.explanation.scriptureEvidence,
        ...defaultPath.scriptureEvidence
      ]),
      warnings: uniqueValues([
        ...response.explanation.warnings,
        "Using a safe Scripture-grounded fallback path."
      ])
    },
    fallback: {
      used: true,
      reasons: uniqueReasons,
      message:
        "Using a safe fallback path so this response remains Scripture-anchored, complete, and explainable.",
      appliedNodeIds: defaultPath.nodes.map((node) => node.id)
    }
  };
}
