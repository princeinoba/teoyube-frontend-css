import type { AnyTIGNode, TIGNodeType, TIGRelationship } from "../types";
import { TIG_SCRIPTURE_SEEDS } from "./scriptures.seed";
import { TIG_EMOTION_SEEDS } from "./emotions.seed";
import { TIG_PROMISE_SEEDS } from "./promises.seed";
import { TIG_PROMISE_CLUSTER_SEEDS } from "./promise-clusters.seed";
import { TIG_CALLING_SEEDS } from "./callings.seed";
import { TIG_JOURNEY_SEEDS } from "./journeys.seed";
import { TIG_WORD_SEEDS } from "./words.seed";
import { TIG_PRAYER_SEQUENCE_SEEDS } from "./prayer-sequences.seed";
import { TIG_REFLECTION_PROMPT_SEEDS } from "./reflection-prompts.seed";
import { TIG_ACTION_STEP_SEEDS } from "./action-steps.seed";
import { TIG_GROWTH_MILESTONE_SEEDS } from "./growth-milestones.seed";
import { TIG_AI_RESPONSE_PATTERN_SEEDS } from "./ai-response-patterns.seed";
import { TIG_RELATIONSHIP_SEEDS } from "./relationships.seed";

export * from "./scriptures.seed";
export * from "./emotions.seed";
export * from "./promises.seed";
export * from "./promise-clusters.seed";
export * from "./callings.seed";
export * from "./journeys.seed";
export * from "./words.seed";
export * from "./prayer-sequences.seed";
export * from "./reflection-prompts.seed";
export * from "./action-steps.seed";
export * from "./growth-milestones.seed";
export * from "./ai-response-patterns.seed";
export * from "./relationships.seed";

export const TIG_ALL_NODE_SEEDS: AnyTIGNode[] = [
  ...TIG_SCRIPTURE_SEEDS,
  ...TIG_EMOTION_SEEDS,
  ...TIG_PROMISE_SEEDS,
  ...TIG_PROMISE_CLUSTER_SEEDS,
  ...TIG_CALLING_SEEDS,
  ...TIG_JOURNEY_SEEDS,
  ...TIG_WORD_SEEDS,
  ...TIG_PRAYER_SEQUENCE_SEEDS,
  ...TIG_REFLECTION_PROMPT_SEEDS,
  ...TIG_ACTION_STEP_SEEDS,
  ...TIG_GROWTH_MILESTONE_SEEDS,
  ...TIG_AI_RESPONSE_PATTERN_SEEDS
];

export const TIG_ALL_RELATIONSHIP_SEEDS: TIGRelationship[] = TIG_RELATIONSHIP_SEEDS;

export function getTIGSeedNodeById(id: string): AnyTIGNode | undefined {
  return TIG_ALL_NODE_SEEDS.find((node) => node.id === id);
}

export function getTIGSeedNodesByType(type: TIGNodeType): AnyTIGNode[] {
  return TIG_ALL_NODE_SEEDS.filter((node) => node.type === type);
}

export function getTIGSeedRelationshipsForNode(nodeId: string): TIGRelationship[] {
  return TIG_ALL_RELATIONSHIP_SEEDS.filter(
    (relationship) => relationship.sourceNodeId === nodeId || relationship.targetNodeId === nodeId
  );
}

export function getTIGSeedGraph(): {
  nodes: AnyTIGNode[];
  relationships: TIGRelationship[];
} {
  return {
    nodes: TIG_ALL_NODE_SEEDS,
    relationships: TIG_ALL_RELATIONSHIP_SEEDS
  };
}

export function getTIGSeedSummary(): {
  nodeCount: number;
  relationshipCount: number;
  nodeCountsByType: Record<TIGNodeType, number>;
} {
  const nodeCountsByType = TIG_ALL_NODE_SEEDS.reduce(
    (counts, node) => {
      counts[node.type] += 1;
      return counts;
    },
    {
      SCRIPTURE: 0,
      TEOYUBE_WORD: 0,
      PROMISE_CATEGORY: 0,
      PROMISE_CLUSTER: 0,
      EMOTION_PROFILE: 0,
      CALLING_PROFILE: 0,
      KINGDOM_PATH: 0,
      PRAYER_SEQUENCE: 0,
      JOURNEY: 0,
      REFLECTION_PROMPT: 0,
      ACTION_STEP: 0,
      GROWTH_MILESTONE: 0,
      AI_RESPONSE_PATTERN: 0
    } satisfies Record<TIGNodeType, number>
  );

  return {
    nodeCount: TIG_ALL_NODE_SEEDS.length,
    relationshipCount: TIG_ALL_RELATIONSHIP_SEEDS.length,
    nodeCountsByType
  };
}
