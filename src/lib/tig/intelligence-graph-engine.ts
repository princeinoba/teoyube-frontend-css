import type { TIGID } from "./types";
import {
  buildTigSeedGraph,
  findTigSeedEdgesForNode,
  findTigSeedNodeById,
  type TigSeedEdge,
  type TigSeedGraph,
  type TigSeedNode,
  type TigSeedNodeKind
} from "./intelligence-graph-seeds";
import {
  calculateTigConfidenceScore,
  getTigConfidenceBreakdown,
  getTigConfidenceLabel,
  type TigConfidenceBreakdown
} from "./intelligence-confidence";

export type TigRecommendationInput = {
  input: string;
  mode?: string;
  userState?: string;
  emotionTags?: string[];
  limit?: number;
};

export type TigGraphQuery = string | TigRecommendationInput;

export type TigScoredSeedNode = {
  node: TigSeedNode;
  score: number;
  reasons: string[];
};

export type TigNodeContext = {
  node?: TigSeedNode;
  edges: TigSeedEdge[];
  connectedNodes: TigSeedNode[];
  scriptureRefs: string[];
};

export type TigRecommendationPath = {
  input: string;
  mode?: string;
  selectedNodes: {
    emotion?: TigSeedNode;
    word?: TigSeedNode;
    promiseCluster?: TigSeedNode;
    scripture?: TigSeedNode;
    prayerSequence?: TigSeedNode;
    actionStep?: TigSeedNode;
    callingArchetype?: TigSeedNode;
    kingdomJourney?: TigSeedNode;
    aiPathway?: TigSeedNode;
  };
  nodes: TigSeedNode[];
  edges: TigSeedEdge[];
  reasonPath: string[];
  scriptureEvidence: string[];
  confidence: number;
  confidenceLabel: ReturnType<typeof getTigConfidenceLabel>;
  confidenceBreakdown: TigConfidenceBreakdown;
};

export type TigRecommendationContext = {
  graph: TigSeedGraph;
  path: TigRecommendationPath;
  primaryScripture?: TigSeedNode;
  primaryPromiseCluster?: TigSeedNode;
  primaryPrayerSequence?: TigSeedNode;
  primaryActionStep?: TigSeedNode;
};

export type TigSelectionExplanation = {
  summary: string;
  confidence: number;
  confidenceLabel: TigRecommendationPath["confidenceLabel"];
  reasonPath: string[];
  scriptureEvidence: string[];
};

type SelectionCandidate = {
  node: TigSeedNode;
  score: number;
  edges: TigSeedEdge[];
  reasons: string[];
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.replace(/[^a-z0-9_-]/g, ""))
    .filter((token) => token.length > 2);
}

function uniqueById<TItem extends { id: string }>(items: TItem[]): TItem[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(1, Math.max(0, score));
}

function parseInput(query: TigGraphQuery): TigRecommendationInput {
  if (typeof query === "string") {
    return {
      input: query
    };
  }

  return query;
}

function metadataText(metadata: Record<string, unknown>): string {
  return Object.values(metadata)
    .flatMap((value) => {
      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
      }
      return typeof value === "string" ? [value] : [];
    })
    .join(" ");
}

function searchableNodeText(node: TigSeedNode): string {
  return normalizeText(
    [
      node.id,
      node.kind,
      node.label,
      node.description,
      ...node.scriptureRefs,
      ...node.clusterIds,
      ...node.archetypeIds,
      ...node.prayerSequenceIds,
      ...node.journeyIds,
      ...node.emotionTags,
      metadataText(node.metadata)
    ].join(" ")
  );
}

function scoreNodeForInput(node: TigSeedNode, input: TigRecommendationInput): TigScoredSeedNode {
  const query = normalizeText([input.input, input.userState, ...(input.emotionTags || [])].join(" "));
  const tokens = tokenize(query);
  const text = searchableNodeText(node);
  const reasons: string[] = [];
  let score = node.weight * 0.25;

  if (query && text.includes(query)) {
    score += 0.45;
    reasons.push("Direct phrase match");
  }

  const tokenMatches = tokens.filter((token) => text.includes(token));
  if (tokenMatches.length) {
    score += Math.min(0.35, tokenMatches.length * 0.08);
    reasons.push(`Matched terms: ${tokenMatches.slice(0, 5).join(", ")}`);
  }

  if (input.mode && text.includes(input.mode)) {
    score += 0.12;
    reasons.push(`Matched mode ${input.mode}`);
  }

  return {
    node,
    score: clampScore(score),
    reasons
  };
}

function getEdgeConfidence(edge: TigSeedEdge): number {
  const confidence = edge.metadata.confidenceScore;
  return typeof confidence === "number" ? clampScore(confidence) : edge.weight;
}

function getOppositeNodeId(edge: TigSeedEdge, nodeId: TIGID): TIGID | undefined {
  if (edge.source === nodeId) return edge.target;
  if (edge.target === nodeId) return edge.source;
  return undefined;
}

function buildConnectedCandidates(params: {
  graph: TigSeedGraph;
  anchors: TigSeedNode[];
  kinds: TigSeedNodeKind[];
  input: TigRecommendationInput;
}): SelectionCandidate[] {
  const candidates = new Map<TIGID, SelectionCandidate>();

  params.anchors.forEach((anchor) => {
    (params.graph.adjacency.get(anchor.id) || []).forEach((edge) => {
      const nodeId = getOppositeNodeId(edge, anchor.id);
      const node = nodeId ? params.graph.nodeMap.get(nodeId) : undefined;
      if (!node || !params.kinds.includes(node.kind)) return;

      const scoredNode = scoreNodeForInput(node, params.input);
      const score = clampScore(edge.weight * 0.4 + getEdgeConfidence(edge) * 0.15 + node.weight * 0.3 + scoredNode.score * 0.15);
      const existing = candidates.get(node.id);
      const reason = `${anchor.label} ${edge.kind} ${node.label}: ${edge.label}`;

      if (!existing || score > existing.score) {
        candidates.set(node.id, {
          node,
          score,
          edges: [edge],
          reasons: [reason, ...scoredNode.reasons]
        });
      }
    });
  });

  return [...candidates.values()];
}

function selectBestNode(params: {
  graph: TigSeedGraph;
  input: TigRecommendationInput;
  kinds: TigSeedNodeKind[];
  anchors?: TigSeedNode[];
  allowFallback?: boolean;
}): SelectionCandidate | undefined {
  const connected = buildConnectedCandidates({
    graph: params.graph,
    anchors: params.anchors || [],
    kinds: params.kinds,
    input: params.input
  });

  const direct = params.graph.nodes
    .filter((node) => params.kinds.includes(node.kind))
    .map((node) => {
      const scoredNode = scoreNodeForInput(node, params.input);
      return {
        node,
        score: clampScore(scoredNode.score * 0.7 + node.weight * 0.3),
        edges: [] as TigSeedEdge[],
        reasons: scoredNode.reasons.length
          ? scoredNode.reasons
          : [`${node.label} was available as a ${node.kind.replace(/_/g, " ")} seed.`]
      };
    })
    .filter((candidate) => candidate.score > 0.18);

  const candidates = [...connected, ...direct].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.node.weight - a.node.weight;
  });

  if (candidates.length) return candidates[0];

  if (!params.allowFallback) return undefined;

  const fallback = params.graph.nodes
    .filter((node) => params.kinds.includes(node.kind))
    .sort((a, b) => b.weight - a.weight)[0];

  if (!fallback) return undefined;

  return {
    node: fallback,
    score: fallback.weight * 0.5,
    edges: [],
    reasons: [`Fallback ${fallback.kind.replace(/_/g, " ")} selected from the seed graph: ${fallback.label}.`]
  };
}

function addSelection(
  selected: Array<SelectionCandidate | undefined>,
  candidate: SelectionCandidate | undefined
): void {
  if (candidate) selected.push(candidate);
}

function buildReasonPath(selections: SelectionCandidate[]): string[] {
  return uniqueStrings(
    selections.flatMap((selection) => [
      `${selection.node.label} selected as ${selection.node.kind.replace(/_/g, " ")}.`,
      ...selection.reasons,
      ...selection.edges.map((edge) => edge.label)
    ])
  );
}

function collectScriptureEvidence(selections: SelectionCandidate[]): string[] {
  return uniqueStrings([
    ...selections.flatMap((selection) => selection.node.scriptureRefs),
    ...selections.flatMap((selection) => selection.edges.flatMap((edge) => edge.evidence))
  ]);
}

export function buildTeoyubeIntelligenceGraph(): TigSeedGraph {
  return buildTigSeedGraph();
}

export function queryTeoyubeIntelligenceGraph(query: TigGraphQuery): {
  query: TigRecommendationInput;
  matches: TigScoredSeedNode[];
  graph: TigSeedGraph;
} {
  const parsedQuery = parseInput(query);
  const graph = buildTeoyubeIntelligenceGraph();
  const limit = parsedQuery.limit || 25;
  const matches = graph.nodes
    .map((node) => scoreNodeForInput(node, parsedQuery))
    .filter((match) => match.score > 0.12)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.node.weight - a.node.weight;
    })
    .slice(0, limit);

  return {
    query: parsedQuery,
    matches,
    graph
  };
}

export function getTigNodeContext(nodeId: TIGID): TigNodeContext {
  const graph = buildTeoyubeIntelligenceGraph();
  const node = findTigSeedNodeById(nodeId);
  const edges = findTigSeedEdgesForNode(nodeId);
  const connectedNodes = uniqueById(
    edges
      .map((edge) => {
        const connectedId = getOppositeNodeId(edge, nodeId);
        return connectedId ? graph.nodeMap.get(connectedId) : undefined;
      })
      .filter((connectedNode): connectedNode is TigSeedNode => Boolean(connectedNode))
  );

  return {
    node,
    edges,
    connectedNodes,
    scriptureRefs: uniqueStrings([...(node?.scriptureRefs || []), ...edges.flatMap((edge) => edge.evidence)])
  };
}

export function selectBestTigPath(input: TigGraphQuery): TigRecommendationPath {
  const parsedInput = parseInput(input);
  const graph = buildTeoyubeIntelligenceGraph();
  const selections: SelectionCandidate[] = [];

  const emotion = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["emotion_profile"],
    allowFallback: false
  });
  addSelection(selections, emotion);

  const word = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["teoyube_word"],
    anchors: emotion ? [emotion.node] : [],
    allowFallback: true
  });
  addSelection(selections, word);

  const promiseCluster = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["promise_cluster"],
    anchors: [emotion?.node, word?.node].filter((node): node is TigSeedNode => Boolean(node)),
    allowFallback: true
  });
  addSelection(selections, promiseCluster);

  const scripture = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["scripture"],
    anchors: [promiseCluster?.node, word?.node, emotion?.node].filter((node): node is TigSeedNode => Boolean(node)),
    allowFallback: true
  });
  addSelection(selections, scripture);

  const prayerSequence = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["prayer_sequence"],
    anchors: [emotion?.node, promiseCluster?.node, scripture?.node].filter((node): node is TigSeedNode => Boolean(node)),
    allowFallback: true
  });
  addSelection(selections, prayerSequence);

  const kingdomJourney = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["kingdom_journey"],
    anchors: [emotion?.node, promiseCluster?.node, scripture?.node, prayerSequence?.node].filter(
      (node): node is TigSeedNode => Boolean(node)
    ),
    allowFallback: true
  });
  addSelection(selections, kingdomJourney);

  const actionStep = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["action_step"],
    anchors: [kingdomJourney?.node, promiseCluster?.node, scripture?.node, prayerSequence?.node].filter(
      (node): node is TigSeedNode => Boolean(node)
    ),
    allowFallback: true
  });
  addSelection(selections, actionStep);

  const callingArchetype = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["calling_archetype"],
    anchors: [word?.node, promiseCluster?.node, kingdomJourney?.node, actionStep?.node].filter(
      (node): node is TigSeedNode => Boolean(node)
    ),
    allowFallback: true
  });
  addSelection(selections, callingArchetype);

  const aiPathway = selectBestNode({
    graph,
    input: parsedInput,
    kinds: ["ai_pathway"],
    anchors: selections.map((selection) => selection.node),
    allowFallback: true
  });
  addSelection(selections, aiPathway);

  const nodes = uniqueById(selections.map((selection) => selection.node));
  const edges = uniqueById(selections.flatMap((selection) => selection.edges));
  const reasonPath = buildReasonPath(selections);
  const scriptureEvidence = collectScriptureEvidence(selections);
  const confidenceBreakdown = getTigConfidenceBreakdown({
    scriptureAnchorStrength: scripture ? scripture.node.weight : 0,
    promiseClusterMatch: promiseCluster ? promiseCluster.node.weight : 0,
    emotionStateMatch: emotion ? emotion.node.weight : 0,
    teoyubeWordRelevance: word ? word.node.weight : 0,
    prayerSequenceRelevance: prayerSequence ? prayerSequence.node.weight : 0,
    journeyCallingAlignment: Math.max(kingdomJourney?.node.weight || 0, callingArchetype?.node.weight || 0),
    supportingEdgeCount: edges.length,
    guardrailSafety: scripture ? 1 : 0.2
  });
  const confidence = calculateTigConfidenceScore({
    scriptureAnchorStrength: scripture ? scripture.node.weight : 0,
    promiseClusterMatch: promiseCluster ? promiseCluster.node.weight : 0,
    emotionStateMatch: emotion ? emotion.node.weight : 0,
    teoyubeWordRelevance: word ? word.node.weight : 0,
    prayerSequenceRelevance: prayerSequence ? prayerSequence.node.weight : 0,
    journeyCallingAlignment: Math.max(kingdomJourney?.node.weight || 0, callingArchetype?.node.weight || 0),
    supportingEdgeCount: edges.length,
    guardrailSafety: scripture ? 1 : 0.2
  });

  return {
    input: parsedInput.input,
    mode: parsedInput.mode,
    selectedNodes: {
      emotion: emotion?.node,
      word: word?.node,
      promiseCluster: promiseCluster?.node,
      scripture: scripture?.node,
      prayerSequence: prayerSequence?.node,
      actionStep: actionStep?.node,
      callingArchetype: callingArchetype?.node,
      kingdomJourney: kingdomJourney?.node,
      aiPathway: aiPathway?.node
    },
    nodes,
    edges,
    reasonPath,
    scriptureEvidence,
    confidence,
    confidenceLabel: getTigConfidenceLabel(confidence),
    confidenceBreakdown
  };
}

export function getTigRecommendationContext(input: TigGraphQuery): TigRecommendationContext {
  const graph = buildTeoyubeIntelligenceGraph();
  const path = selectBestTigPath(input);

  return {
    graph,
    path,
    primaryScripture: path.selectedNodes.scripture,
    primaryPromiseCluster: path.selectedNodes.promiseCluster,
    primaryPrayerSequence: path.selectedNodes.prayerSequence,
    primaryActionStep: path.selectedNodes.actionStep
  };
}

export function scoreTigRecommendation(input: TigGraphQuery): number {
  return selectBestTigPath(input).confidence;
}

export function explainTigSelection(input: TigGraphQuery): TigSelectionExplanation {
  const path = selectBestTigPath(input);
  const scriptureLabel = path.selectedNodes.scripture?.label || "a Scripture anchor";
  const clusterLabel = path.selectedNodes.promiseCluster?.label || "a Scripture-backed promise pattern";

  return {
    summary: `Teoyube selected ${clusterLabel} and anchored the response in ${scriptureLabel}.`,
    confidence: path.confidence,
    confidenceLabel: path.confidenceLabel,
    reasonPath: path.reasonPath,
    scriptureEvidence: path.scriptureEvidence
  };
}
