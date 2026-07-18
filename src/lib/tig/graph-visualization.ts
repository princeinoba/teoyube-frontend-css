import type {
  AnyTIGNode,
  TIGID,
  TIGNodeType,
  TIGRelationship,
  TIGTraversalPath,
  TIGTraversalResult
} from "./types";
import type { GraphResolutionResult } from "./graph-engine";

export type GraphVisualizationGroup =
  | "SCRIPTURE"
  | "PROMISE"
  | "PROMISE_CLUSTER"
  | "WORD"
  | "EMOTION"
  | "CALLING"
  | "JOURNEY"
  | "PRAYER"
  | "REFLECTION"
  | "ACTION"
  | "MILESTONE"
  | "AI_PATTERN"
  | "UNKNOWN";

export type GraphVisualizationNode = {
  id: TIGID;
  label: string;
  subtitle: string;
  type: TIGNodeType | "UNKNOWN";
  group: GraphVisualizationGroup;
  importance: number;
  selected: boolean;
  root: boolean;
  metadata: Record<string, unknown>;
  x?: number;
  y?: number;
};

export type GraphVisualizationEdge = {
  id: TIGID;
  source: TIGID;
  target: TIGID;
  relationshipType: string;
  strength: number;
  confidence: number;
  label: string;
  highlighted: boolean;
};

export type GraphVisualizationStatistics = {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<string, number>;
  averageRelationshipStrength: number;
  averageConfidence: number;
};

export type GraphVisualization = {
  nodes: GraphVisualizationNode[];
  edges: GraphVisualizationEdge[];
  statistics: GraphVisualizationStatistics;
};

type TraversalPathWithMetrics = TIGTraversalPath & {
  totalStrength?: number;
  averageConfidence?: number;
};

type RankedTraversalNode = TIGTraversalResult<AnyTIGNode>["rankedNodes"][number] & {
  score?: number;
  matchedRelationshipIds?: TIGID[];
};

type TraversalResultWithRuntimeData = TIGTraversalResult<AnyTIGNode> & {
  relationshipsUsed?: TIGRelationship[];
};

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function uniqueById<TItem extends { id: string }>(items: TItem[]): TItem[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getStringField(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  return typeof value === "string" ? value : "";
}

function getNodeLabel(node: AnyTIGNode): string {
  return node.title || node.slug || node.id;
}

function getNodeSubtitle(node: AnyTIGNode): string {
  const record = getRecord(node);

  return (
    getStringField(record, "reference") ||
    getStringField(record, "word") ||
    getStringField(record, "categoryKey") ||
    getStringField(record, "clusterKey") ||
    getStringField(record, "emotionKey") ||
    getStringField(record, "callingKey") ||
    getStringField(record, "journeyKey") ||
    getStringField(record, "sequenceKey") ||
    getStringField(record, "milestoneKey") ||
    node.slug
  );
}

function buildNodeMetadata(
  node: AnyTIGNode,
  extra: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id: node.id,
    slug: node.slug,
    tags: node.tags,
    aliases: node.aliases,
    scriptureReferences: node.scriptureReferences,
    theologicalWeight: node.theologicalWeight,
    pastoralSensitivity: node.pastoralSensitivity,
    confidenceScore: node.confidenceScore,
    ...extra
  };
}

function buildVisualizationNode(params: {
  node: AnyTIGNode;
  selected: boolean;
  root: boolean;
  metadata?: Record<string, unknown>;
}): GraphVisualizationNode {
  const importance = clamp(
    params.node.theologicalWeight * 0.45 +
      params.node.confidenceScore * 0.45 +
      params.node.pastoralSensitivity * 0.1
  );

  return {
    id: params.node.id,
    label: getNodeLabel(params.node),
    subtitle: getNodeSubtitle(params.node),
    type: params.node.type,
    group: groupNode(params.node),
    importance,
    selected: params.selected,
    root: params.root,
    metadata: buildNodeMetadata(params.node, params.metadata)
  };
}

function buildPlaceholderNode(params: {
  id: TIGID;
  selected?: boolean;
  root?: boolean;
}): GraphVisualizationNode {
  return {
    id: params.id,
    label: params.id,
    subtitle: "Unresolved traversal node",
    type: "UNKNOWN",
    group: "UNKNOWN",
    importance: 0,
    selected: Boolean(params.selected),
    root: Boolean(params.root),
    metadata: {
      id: params.id,
      unresolved: true
    }
  };
}

function buildEdgeFromRelationship(
  relationship: TIGRelationship,
  highlighted: boolean
): GraphVisualizationEdge {
  return {
    id: relationship.id,
    source: relationship.sourceNodeId,
    target: relationship.targetNodeId,
    relationshipType: relationship.type,
    strength: relationship.strength,
    confidence: relationship.confidenceScore,
    label: relationship.reason || relationship.type,
    highlighted
  };
}

function buildEdgeFromPath(params: {
  relationshipId: TIGID;
  source: TIGID;
  target: TIGID;
  strength: number;
  confidence: number;
  highlighted: boolean;
}): GraphVisualizationEdge {
  return {
    id: `${params.relationshipId}:${params.source}:${params.target}`,
    source: params.source,
    target: params.target,
    relationshipType: params.relationshipId,
    strength: clamp(params.strength),
    confidence: clamp(params.confidence),
    label: params.relationshipId,
    highlighted: params.highlighted
  };
}

function addNode(
  nodes: Map<TIGID, GraphVisualizationNode>,
  node: GraphVisualizationNode
): void {
  const existing = nodes.get(node.id);
  if (!existing) {
    nodes.set(node.id, node);
    return;
  }

  nodes.set(node.id, {
    ...existing,
    selected: existing.selected || node.selected,
    root: existing.root || node.root,
    importance: Math.max(existing.importance, node.importance),
    metadata: {
      ...existing.metadata,
      ...node.metadata
    }
  });
}

function sortNodes(nodes: GraphVisualizationNode[]): GraphVisualizationNode[] {
  return [...nodes].sort((a, b) => {
    if (a.root !== b.root) return a.root ? -1 : 1;
    if (a.selected !== b.selected) return a.selected ? -1 : 1;
    if (b.importance !== a.importance) return b.importance - a.importance;
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    return a.id.localeCompare(b.id);
  });
}

function sortEdges(edges: GraphVisualizationEdge[]): GraphVisualizationEdge[] {
  return [...edges].sort((a, b) => a.id.localeCompare(b.id));
}

function buildVisualization(
  nodes: GraphVisualizationNode[],
  edges: GraphVisualizationEdge[]
): GraphVisualization {
  const sortedNodes = sortNodes(uniqueById(nodes));
  const sortedEdges = sortEdges(uniqueById(edges));

  return {
    nodes: sortedNodes,
    edges: sortedEdges,
    statistics: calculateGraphStatistics({
      nodes: sortedNodes,
      edges: sortedEdges
    })
  };
}

function getPathMetric(path: TIGTraversalPath, field: "totalStrength" | "averageConfidence"): number {
  const metrics = path as TraversalPathWithMetrics;
  return metrics[field] ?? path.score;
}

function getPathEdges(params: {
  paths: TIGTraversalPath[];
  highlightedRelationshipIds: Set<TIGID>;
}): GraphVisualizationEdge[] {
  return params.paths.flatMap((path) => {
    return path.relationships.flatMap((relationshipId, index) => {
      const source = path.nodes[index];
      const target = path.nodes[index + 1];
      if (!source || !target) return [];

      return [
        buildEdgeFromPath({
          relationshipId,
          source,
          target,
          strength: getPathMetric(path, "totalStrength"),
          confidence: getPathMetric(path, "averageConfidence"),
          highlighted: params.highlightedRelationshipIds.has(relationshipId)
        })
      ];
    });
  });
}

function addReferencedPathNodes(params: {
  nodes: Map<TIGID, GraphVisualizationNode>;
  paths: TIGTraversalPath[];
  rootIds: Set<TIGID>;
  selectedIds: Set<TIGID>;
}): void {
  for (const nodeId of params.paths.flatMap((path) => path.nodes)) {
    if (params.nodes.has(nodeId)) continue;

    addNode(
      params.nodes,
      buildPlaceholderNode({
        id: nodeId,
        root: params.rootIds.has(nodeId),
        selected: params.selectedIds.has(nodeId)
      })
    );
  }
}

export function groupNode(
  node: Pick<AnyTIGNode, "type"> | Pick<GraphVisualizationNode, "type">
): GraphVisualizationGroup {
  switch (node.type) {
    case "SCRIPTURE":
      return "SCRIPTURE";
    case "PROMISE_CATEGORY":
      return "PROMISE";
    case "PROMISE_CLUSTER":
      return "PROMISE_CLUSTER";
    case "TEOYUBE_WORD":
      return "WORD";
    case "EMOTION_PROFILE":
      return "EMOTION";
    case "CALLING_PROFILE":
      return "CALLING";
    case "JOURNEY":
    case "KINGDOM_PATH":
      return "JOURNEY";
    case "PRAYER_SEQUENCE":
      return "PRAYER";
    case "REFLECTION_PROMPT":
      return "REFLECTION";
    case "ACTION_STEP":
      return "ACTION";
    case "GROWTH_MILESTONE":
      return "MILESTONE";
    case "AI_RESPONSE_PATTERN":
      return "AI_PATTERN";
    default:
      return "UNKNOWN";
  }
}

export function calculateGraphStatistics(params: {
  nodes: GraphVisualizationNode[];
  edges: GraphVisualizationEdge[];
}): GraphVisualizationStatistics {
  const nodesByType = params.nodes.reduce<Record<string, number>>((counts, node) => {
    counts[node.type] = (counts[node.type] || 0) + 1;
    return counts;
  }, {});

  return {
    totalNodes: params.nodes.length,
    totalEdges: params.edges.length,
    nodesByType,
    averageRelationshipStrength: average(params.edges.map((edge) => edge.strength)),
    averageConfidence: average(params.edges.map((edge) => edge.confidence))
  };
}

export function buildVisualizationFromTraversal(
  result: TIGTraversalResult<AnyTIGNode>
): GraphVisualization {
  const runtimeResult = result as TraversalResultWithRuntimeData;
  const rootIds = new Set(result.startNodeIds);
  const selectedIds = new Set(
    result.rankedNodes.slice(0, 3).map((rankedNode) => rankedNode.node.id)
  );
  const relationshipIdsFromPaths = new Set(result.paths.flatMap((path) => path.relationships));
  const nodes = new Map<TIGID, GraphVisualizationNode>();

  for (const rankedNode of result.rankedNodes) {
    const rankedTraversalNode = rankedNode as RankedTraversalNode;
    addNode(
      nodes,
      buildVisualizationNode({
        node: rankedNode.node,
        selected: selectedIds.has(rankedNode.node.id),
        root: rootIds.has(rankedNode.node.id),
        metadata: {
          rank: rankedNode.rank,
          score: rankedTraversalNode.score,
          reasons: rankedNode.reasons,
          matchedRelationshipIds: rankedTraversalNode.matchedRelationshipIds
        }
      })
    );
  }

  for (const rootId of rootIds) {
    if (!nodes.has(rootId)) {
      addNode(nodes, buildPlaceholderNode({ id: rootId, root: true }));
    }
  }

  addReferencedPathNodes({
    nodes,
    paths: result.paths,
    rootIds,
    selectedIds
  });

  const edges = runtimeResult.relationshipsUsed?.length
    ? runtimeResult.relationshipsUsed.map((relationship) =>
        buildEdgeFromRelationship(relationship, relationshipIdsFromPaths.has(relationship.id))
      )
    : getPathEdges({
        paths: result.paths,
        highlightedRelationshipIds: relationshipIdsFromPaths
      });

  return buildVisualization([...nodes.values()], edges);
}

export function buildVisualizationFromResolution(
  result: GraphResolutionResult
): GraphVisualization {
  const rootIds = new Set(
    result.graphTrace.traversalSteps.find((step) => step.nodeIds.length)?.nodeIds || []
  );
  const selectedIds = new Set(result.rankedNodes.slice(0, 3).map((entry) => entry.node.id));
  const highlightedRelationshipIds = new Set(result.graphTrace.selectedRelationshipIds);
  const nodes = new Map<TIGID, GraphVisualizationNode>();

  const resolutionNodes: AnyTIGNode[] = [
    ...result.detectedEmotions,
    ...result.detectedPromises,
    ...result.detectedPromiseClusters,
    ...result.scriptures,
    ...result.detectedWords,
    ...result.detectedCallings,
    ...result.detectedJourneys,
    ...result.detectedPrayerSequences,
    ...result.detectedReflectionPrompts,
    ...result.detectedActionSteps,
    ...result.detectedGrowthMilestones,
    ...result.rankedNodes.map((entry) => entry.node)
  ];

  for (const node of resolutionNodes) {
    const rankedNode = result.rankedNodes.find((entry) => entry.node.id === node.id);
    addNode(
      nodes,
      buildVisualizationNode({
        node,
        selected: selectedIds.has(node.id),
        root: rootIds.has(node.id),
        metadata: rankedNode
          ? {
              rank: rankedNode.rank,
              score: rankedNode.score,
              reasons: rankedNode.reasons,
              relationshipStrength: rankedNode.relationshipStrength
            }
          : undefined
      })
    );
  }

  for (const selectedNodeId of result.graphTrace.selectedNodeIds) {
    if (!nodes.has(selectedNodeId)) {
      addNode(
        nodes,
        buildPlaceholderNode({
          id: selectedNodeId,
          root: rootIds.has(selectedNodeId),
          selected: selectedIds.has(selectedNodeId)
        })
      );
    }
  }

  addReferencedPathNodes({
    nodes,
    paths: result.graphTrace.rankedPaths,
    rootIds,
    selectedIds
  });

  const pathEdges = getPathEdges({
    paths: result.graphTrace.rankedPaths,
    highlightedRelationshipIds
  });
  const fallbackEdges =
    pathEdges.length > 0
      ? []
      : result.graphTrace.traversalSteps.flatMap((step, index, steps) => {
          const nextStep = steps[index + 1];
          if (!nextStep) return [];

          return step.nodeIds.flatMap((source) =>
            nextStep.nodeIds.map((target) =>
              buildEdgeFromPath({
                relationshipId: `graph-step-${index}`,
                source,
                target,
                strength: result.confidence.overall,
                confidence: result.confidence.overall,
                highlighted: true
              })
            )
          );
        });

  return buildVisualization([...nodes.values()], [...pathEdges, ...fallbackEdges]);
}

export function buildRadialLayout(graph: GraphVisualization): GraphVisualization {
  const ringByGroup: Record<GraphVisualizationGroup, number> = {
    SCRIPTURE: 160,
    PROMISE: 300,
    PROMISE_CLUSTER: 300,
    WORD: 220,
    EMOTION: 120,
    CALLING: 440,
    JOURNEY: 440,
    PRAYER: 580,
    REFLECTION: 580,
    ACTION: 580,
    MILESTONE: 580,
    AI_PATTERN: 680,
    UNKNOWN: 680
  };
  const nodesByRing = graph.nodes.reduce<Record<string, GraphVisualizationNode[]>>(
    (rings, node) => {
      const radius = node.root ? 0 : ringByGroup[node.group];
      const key = String(radius);
      rings[key] = [...(rings[key] || []), node];
      return rings;
    },
    {}
  );
  const positionedNodes = Object.entries(nodesByRing).flatMap(([radiusKey, nodes]) => {
    const radius = Number(radiusKey);
    const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));

    return sortedNodes.map((node, index) => {
      if (radius === 0) return { ...node, x: 0, y: 0 };

      const angle = (Math.PI * 2 * index) / sortedNodes.length - Math.PI / 2;
      return {
        ...node,
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius)
      };
    });
  });

  return {
    ...graph,
    nodes: sortNodes(positionedNodes)
  };
}

export function buildHierarchyLayout(graph: GraphVisualization): GraphVisualization {
  const layerByGroup: Record<GraphVisualizationGroup, number> = {
    EMOTION: 0,
    PROMISE: 1,
    PROMISE_CLUSTER: 2,
    SCRIPTURE: 3,
    WORD: 4,
    JOURNEY: 5,
    CALLING: 5,
    PRAYER: 6,
    REFLECTION: 7,
    ACTION: 8,
    MILESTONE: 9,
    AI_PATTERN: 10,
    UNKNOWN: 10
  };
  const nodesByLayer = graph.nodes.reduce<Record<string, GraphVisualizationNode[]>>(
    (layers, node) => {
      const layer = node.root ? -1 : layerByGroup[node.group];
      const key = String(layer);
      layers[key] = [...(layers[key] || []), node];
      return layers;
    },
    {}
  );
  const positionedNodes = Object.entries(nodesByLayer).flatMap(([layerKey, nodes]) => {
    const layer = Number(layerKey);
    const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
    const spacing = 240;
    const startX = -((sortedNodes.length - 1) * spacing) / 2;

    return sortedNodes.map((node, index) => ({
      ...node,
      x: Math.round(startX + index * spacing),
      y: layer < 0 ? 0 : Math.round((layer + 1) * 180)
    }));
  });

  return {
    ...graph,
    nodes: sortNodes(positionedNodes)
  };
}

export function buildForceReadyGraph(graph: GraphVisualization): {
  nodes: Array<Omit<GraphVisualizationNode, "x" | "y">>;
  edges: GraphVisualizationEdge[];
} {
  return {
    nodes: graph.nodes.map(({ x: _x, y: _y, ...node }) => node),
    edges: graph.edges
  };
}
