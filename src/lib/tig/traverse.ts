import type {
  AnyTIGNode,
  TIGID,
  TIGRankedNode,
  TIGRelationship,
  TIGScore,
  TIGTraversalOptions,
  TIGTraversalPath,
  TIGTraversalResult
} from "./types";

type TIGTraversalDirection = "outgoing" | "incoming" | "both";

type TIGTraversalRuntimeOptions = TIGTraversalOptions & {
  includeStartNodes: boolean;
  direction: TIGTraversalDirection;
  limit: number;
};

type TIGTraversalPathWithMetrics = TIGTraversalPath & {
  totalStrength: TIGScore;
  averageConfidence: TIGScore;
};

type TIGRankedTraversalNode<TNode extends AnyTIGNode> = TIGRankedNode<TNode> & {
  score: TIGScore;
  matchedRelationshipIds: TIGID[];
};

type TIGTraversalResultWithMetadata<TNode extends AnyTIGNode> = TIGTraversalResult<TNode> & {
  relationshipsUsed: TIGRelationship[];
  paths: TIGTraversalPathWithMetrics[];
  metadata: {
    maxDepth: number;
    resultCount: number;
    relationshipCount: number;
    generatedAt: string;
  };
};

export const DEFAULT_TIG_TRAVERSAL_OPTIONS = {
  maxDepth: 2,
  minStrength: 0,
  minConfidence: 0,
  includeStartNodes: false,
  direction: "outgoing",
  limit: 25
} satisfies Omit<TIGTraversalRuntimeOptions, "startNodeIds">;

function clampTraversalScore(score: number): TIGScore {
  if (!Number.isFinite(score)) return 0;
  return Math.min(1, Math.max(0, score));
}

function average(values: number[]): TIGScore {
  if (!values.length) return 0;
  return clampTraversalScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function isRelationshipAllowed(
  relationship: TIGRelationship,
  options: TIGTraversalOptions
): boolean {
  if (relationship.strength < (options.minStrength ?? 0)) return false;
  if (relationship.confidenceScore < (options.minConfidence ?? 0)) return false;

  if (
    options.allowedRelationshipTypes?.length &&
    !options.allowedRelationshipTypes.includes(relationship.type)
  ) {
    return false;
  }

  return true;
}

export function getConnectedNodeIds(
  relationship: TIGRelationship,
  currentNodeId: TIGID,
  direction: TIGTraversalDirection
): TIGID[] {
  const isTwoWay =
    relationship.direction === "BIDIRECTIONAL" ||
    (relationship.direction as string).toLowerCase() === "two_way";

  if (direction === "both") {
    if (relationship.sourceNodeId === currentNodeId) return [relationship.targetNodeId];
    if (relationship.targetNodeId === currentNodeId) return [relationship.sourceNodeId];
    return [];
  }

  if (direction === "outgoing") {
    if (relationship.sourceNodeId === currentNodeId) return [relationship.targetNodeId];
    if (isTwoWay && relationship.targetNodeId === currentNodeId) return [relationship.sourceNodeId];
    return [];
  }

  if (relationship.targetNodeId === currentNodeId) return [relationship.sourceNodeId];
  if (isTwoWay && relationship.sourceNodeId === currentNodeId) return [relationship.targetNodeId];
  return [];
}

export function calculatePathStrength(relationships: TIGRelationship[]): TIGScore {
  return average(relationships.map((relationship) => relationship.strength));
}

export function calculatePathConfidence(relationships: TIGRelationship[]): TIGScore {
  return average(relationships.map((relationship) => relationship.confidenceScore));
}

export function traverseTIGGraph<TNode extends AnyTIGNode>(params: {
  nodes: TNode[];
  relationships: TIGRelationship[];
  options: TIGTraversalOptions;
}): TIGTraversalResult<TNode> {
  const options: TIGTraversalRuntimeOptions = {
    ...DEFAULT_TIG_TRAVERSAL_OPTIONS,
    ...params.options
  };

  const generatedAt = new Date().toISOString();
  const nodeById = new Map<TIGID, TNode>(params.nodes.map((node) => [node.id, node]));
  const startNodeIds = options.startNodeIds;
  const startNodeSet = new Set(startNodeIds);
  const relationshipsUsed = new Map<TIGID, TIGRelationship>();
  const bestNodeResults = new Map<TIGID, TIGRankedTraversalNode<TNode>>();
  const traversalPaths: TIGTraversalPathWithMetrics[] = [];

  const queue: Array<{
    nodeId: TIGID;
    depth: number;
    pathNodeIds: TIGID[];
    pathRelationships: TIGRelationship[];
    reasons: string[];
  }> = startNodeIds.map((nodeId) => ({
    nodeId,
    depth: 0,
    pathNodeIds: [nodeId],
    pathRelationships: [],
    reasons: []
  }));

  const visited = new Set<string>();

  while (queue.length) {
    const current = queue.shift();
    if (!current || current.depth >= options.maxDepth) continue;

    for (const relationship of params.relationships) {
      if (!isRelationshipAllowed(relationship, options)) continue;

      const connectedNodeIds = getConnectedNodeIds(relationship, current.nodeId, options.direction);

      for (const nextNodeId of connectedNodeIds) {
        const nextNode = nodeById.get(nextNodeId);
        if (!nextNode) continue;
        if (options.allowedNodeTypes?.length && !options.allowedNodeTypes.includes(nextNode.type)) continue;

        const nextDepth = current.depth + 1;
        const visitKey = `${nextNodeId}:${relationship.id}:${nextDepth}`;
        if (visited.has(visitKey) || current.pathNodeIds.includes(nextNodeId)) continue;
        visited.add(visitKey);

        const nextRelationships = [...current.pathRelationships, relationship];
        const nextPathNodeIds = [...current.pathNodeIds, nextNodeId];
        const nextReasons = [...current.reasons, relationship.reason];
        const totalStrength = calculatePathStrength(nextRelationships);
        const averageConfidence = calculatePathConfidence(nextRelationships);
        const score = clampTraversalScore(totalStrength * 0.6 + averageConfidence * 0.4);

        relationshipsUsed.set(relationship.id, relationship);

        const path: TIGTraversalPathWithMetrics = {
          nodes: nextPathNodeIds,
          relationships: nextRelationships.map((item) => item.id),
          depth: nextDepth,
          score,
          reasons: nextReasons,
          totalStrength,
          averageConfidence
        };
        traversalPaths.push(path);

        if (options.includeStartNodes || !startNodeSet.has(nextNodeId)) {
          const existing = bestNodeResults.get(nextNodeId);
          if (!existing || score > existing.score) {
            bestNodeResults.set(nextNodeId, {
              node: nextNode,
              rank: 0,
              score,
              rankingInput: {
                intentScore: 0,
                emotionScore: 0,
                promiseScore: 0,
                scriptureRelevance: 0,
                callingRelevance: 0,
                journeyRelevance: 0,
                userHistoryRelevance: 0,
                theologicalWeight: nextNode.theologicalWeight,
                pastoralSensitivity: nextNode.pastoralSensitivity
              },
              reasons: nextReasons,
              matchedRelationshipIds: nextRelationships.map((item) => item.id)
            });
          }
        }

        queue.push({
          nodeId: nextNodeId,
          depth: nextDepth,
          pathNodeIds: nextPathNodeIds,
          pathRelationships: nextRelationships,
          reasons: nextReasons
        });
      }
    }
  }

  const rankedNodes = [...bestNodeResults.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  const result: TIGTraversalResultWithMetadata<TNode> = {
    startNodeIds,
    rankedNodes,
    paths: traversalPaths,
    visitedNodeIds: [...new Set(traversalPaths.flatMap((path) => path.nodes))],
    generatedAt,
    relationshipsUsed: [...relationshipsUsed.values()],
    metadata: {
      maxDepth: options.maxDepth,
      resultCount: rankedNodes.length,
      relationshipCount: relationshipsUsed.size,
      generatedAt
    }
  };

  return result;
}
