import type {
  AnyTIGNode,
  TIGID,
  TIGNodeType,
  TIGRelationship,
  TIGRelationshipType
} from "./types";
import { getTIGSeedGraph } from "./seed";

export type TigSeedNodeKind =
  | "scripture"
  | "teoyube_word"
  | "promise_category"
  | "promise_cluster"
  | "emotion_profile"
  | "calling_archetype"
  | "kingdom_path"
  | "prayer_sequence"
  | "kingdom_journey"
  | "reflection_prompt"
  | "action_step"
  | "growth_milestone"
  | "ai_pathway";

export type TigSeedEdgeKind = TIGRelationshipType | "RELATED_TO";

export type TigSeedNode = {
  id: TIGID;
  kind: TigSeedNodeKind;
  label: string;
  description: string;
  scriptureRefs: string[];
  clusterIds: TIGID[];
  archetypeIds: TIGID[];
  prayerSequenceIds: TIGID[];
  journeyIds: TIGID[];
  emotionTags: string[];
  weight: number;
  metadata: Record<string, unknown>;
};

export type TigSeedEdge = {
  id: TIGID;
  source: TIGID;
  target: TIGID;
  kind: TigSeedEdgeKind;
  label: string;
  weight: number;
  evidence: string[];
  metadata: Record<string, unknown>;
};

export type TigSeedRegistry = {
  nodes: TigSeedNode[];
  edges: TigSeedEdge[];
  sourceNodeCount: number;
  sourceEdgeCount: number;
};

export type TigSeedGraph = TigSeedRegistry & {
  nodeMap: Map<TIGID, TigSeedNode>;
  edgeMap: Map<TIGID, TigSeedEdge>;
  adjacency: Map<TIGID, TigSeedEdge[]>;
};

const KIND_BY_NODE_TYPE: Record<TIGNodeType, TigSeedNodeKind> = {
  SCRIPTURE: "scripture",
  TEOYUBE_WORD: "teoyube_word",
  PROMISE_CATEGORY: "promise_category",
  PROMISE_CLUSTER: "promise_cluster",
  EMOTION_PROFILE: "emotion_profile",
  CALLING_PROFILE: "calling_archetype",
  KINGDOM_PATH: "kingdom_path",
  PRAYER_SEQUENCE: "prayer_sequence",
  JOURNEY: "kingdom_journey",
  REFLECTION_PROMPT: "reflection_prompt",
  ACTION_STEP: "action_step",
  GROWTH_MILESTONE: "growth_milestone",
  AI_RESPONSE_PATTERN: "ai_pathway"
};

function clampWeight(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function getStringField(record: Record<string, unknown>, field: string): string | undefined {
  const value = record[field];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getStringArrayField(record: Record<string, unknown>, fields: string[]): string[] {
  return fields.flatMap((field) => {
    const value = record[field];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
    return typeof value === "string" && value.trim() ? [value] : [];
  });
}

function collectJourneyStageIds(record: Record<string, unknown>, field: string): string[] {
  const stages = record.stages;
  if (!Array.isArray(stages)) return [];

  return stages.flatMap((stage) => {
    const stageRecord = getRecord(stage);
    const value = stageRecord[field];
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  });
}

function getNodeLabel(node: AnyTIGNode): string {
  const record = getRecord(node);

  return (
    getStringField(record, "reference") ||
    getStringField(record, "word") ||
    getStringField(record, "categoryName") ||
    getStringField(record, "categoryKey") ||
    getStringField(record, "clusterName") ||
    getStringField(record, "clusterKey") ||
    getStringField(record, "emotionName") ||
    getStringField(record, "emotionKey") ||
    getStringField(record, "callingName") ||
    getStringField(record, "callingKey") ||
    getStringField(record, "journeyName") ||
    getStringField(record, "journeyKey") ||
    getStringField(record, "sequenceKey") ||
    getStringField(record, "patternName") ||
    node.title ||
    node.slug ||
    node.id
  );
}

function getNodeDescription(node: AnyTIGNode): string {
  return node.description || node.summary || "";
}

function getNodeWeight(node: AnyTIGNode): number {
  const record = getRecord(node);
  const canonicalImportance =
    typeof record.canonicalImportance === "number" ? record.canonicalImportance : undefined;
  const canonicalRelevance =
    typeof record.canonicalRelevance === "number" ? record.canonicalRelevance : undefined;
  const scores = [
    node.theologicalWeight,
    node.confidenceScore,
    canonicalImportance,
    canonicalRelevance
  ].filter((score): score is number => typeof score === "number");

  if (!scores.length) return 0;
  return clampWeight(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function normalizeSeedNode(node: AnyTIGNode): TigSeedNode {
  const record = getRecord(node);
  const kind = KIND_BY_NODE_TYPE[node.type];

  const scriptureRefs = uniqueStrings([
    ...node.scriptureReferences,
    getStringField(record, "reference"),
    getStringField(record, "scriptureRoot"),
    ...getStringArrayField(record, [
      "scriptureIds",
      "scriptureAnchorIds",
      "anchorScriptureIds",
      "relatedScriptures",
      "relatedScriptureIds",
      "coreScriptures",
      "recommendedScriptureIds"
    ]),
    ...collectJourneyStageIds(record, "scriptureIds")
  ]);

  const clusterIds = uniqueStrings([
    kind === "promise_cluster" ? node.id : undefined,
    getStringField(record, "clusterKey"),
    ...getStringArrayField(record, [
      "clusterIds",
      "categoryIds",
      "promiseClusterIds",
      "promiseClusters",
      "relatedPromiseClusterIds"
    ])
  ]);

  const archetypeIds = uniqueStrings([
    kind === "calling_archetype" ? node.id : undefined,
    getStringField(record, "callingKey"),
    getStringField(record, "archetype"),
    ...getStringArrayField(record, ["archetypes", "relatedCallings", "relatedCallingIds"])
  ]);

  const prayerSequenceIds = uniqueStrings([
    kind === "prayer_sequence" ? node.id : undefined,
    getStringField(record, "sequenceKey"),
    ...getStringArrayField(record, ["prayerSequenceIds", "relatedPrayerSequenceIds"]),
    ...collectJourneyStageIds(record, "prayerSequenceIds")
  ]);

  const journeyIds = uniqueStrings([
    kind === "kingdom_journey" ? node.id : undefined,
    getStringField(record, "journeyKey"),
    getStringField(record, "journeyId"),
    ...getStringArrayField(record, [
      "journeyIds",
      "relatedJourneys",
      "relatedJourneyIds",
      "milestoneIds",
      "unlocksJourneyIds"
    ])
  ]);

  const emotionTags = uniqueStrings([
    getStringField(record, "emotionKey"),
    getStringField(record, "emotionName"),
    getStringField(record, "emotionalState"),
    ...getStringArrayField(record, [
      "emotionTags",
      "emotions",
      "relatedEmotions",
      "relatedEmotionIds",
      "recommendedEmotionIds"
    ]),
    ...node.tags.filter((tag) => kind === "emotion_profile" || tag.includes("fear") || tag.includes("hope"))
  ]);

  return {
    id: node.id,
    kind,
    label: getNodeLabel(node),
    description: getNodeDescription(node),
    scriptureRefs,
    clusterIds,
    archetypeIds,
    prayerSequenceIds,
    journeyIds,
    emotionTags,
    weight: getNodeWeight(node),
    metadata: {
      sourceType: node.type,
      slug: node.slug,
      title: node.title,
      summary: node.summary,
      tags: node.tags,
      aliases: node.aliases,
      language: node.language,
      audience: node.audience,
      theologicalWeight: node.theologicalWeight,
      pastoralSensitivity: node.pastoralSensitivity,
      confidenceScore: node.confidenceScore,
      sourceStatus: node.sourceStatus
    }
  };
}

function normalizeSeedEdge(relationship: TIGRelationship): TigSeedEdge {
  return {
    id: relationship.id,
    source: relationship.sourceNodeId,
    target: relationship.targetNodeId,
    kind: relationship.type,
    label: relationship.reason || relationship.type,
    weight: clampWeight(relationship.strength),
    evidence: uniqueStrings([relationship.reason, ...relationship.scriptureBasis]),
    metadata: {
      sourceNodeType: relationship.sourceNodeType,
      targetNodeType: relationship.targetNodeType,
      confidenceScore: relationship.confidenceScore,
      direction: relationship.direction,
      tags: relationship.tags
    }
  };
}

export function getTigSeedRegistry(): TigSeedRegistry {
  const graph = getTIGSeedGraph();

  return {
    nodes: graph.nodes.map(normalizeSeedNode),
    edges: graph.relationships.map(normalizeSeedEdge),
    sourceNodeCount: graph.nodes.length,
    sourceEdgeCount: graph.relationships.length
  };
}

export function getTigSeedNodes(): TigSeedNode[] {
  return getTigSeedRegistry().nodes;
}

export function getTigSeedEdges(): TigSeedEdge[] {
  return getTigSeedRegistry().edges;
}

export function buildTigSeedGraph(): TigSeedGraph {
  const registry = getTigSeedRegistry();
  const nodeMap = new Map(registry.nodes.map((node) => [node.id, node]));
  const edgeMap = new Map(registry.edges.map((edge) => [edge.id, edge]));
  const adjacency = new Map<TIGID, TigSeedEdge[]>();

  registry.edges.forEach((edge) => {
    adjacency.set(edge.source, [...(adjacency.get(edge.source) || []), edge]);
    adjacency.set(edge.target, [...(adjacency.get(edge.target) || []), edge]);
  });

  return {
    ...registry,
    nodeMap,
    edgeMap,
    adjacency
  };
}

export function findTigSeedNodeById(id: TIGID): TigSeedNode | undefined {
  return buildTigSeedGraph().nodeMap.get(id);
}

export function findTigSeedNodesByKind(kind: TigSeedNodeKind): TigSeedNode[] {
  return getTigSeedNodes().filter((node) => node.kind === kind);
}

export function findTigSeedEdgesForNode(nodeId: TIGID): TigSeedEdge[] {
  return buildTigSeedGraph().adjacency.get(nodeId) || [];
}
