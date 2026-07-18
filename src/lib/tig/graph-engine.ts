import type {
  ActionStepNode,
  AnyTIGNode,
  CallingProfileNode,
  EmotionProfileNode,
  GrowthMilestoneNode,
  JourneyNode,
  PrayerSequenceNode,
  PromiseCategoryNode,
  PromiseClusterNode,
  ReflectionPromptNode,
  ScriptureNode,
  TeoyubeWordNode,
  TIGAIRequest,
  TIGConfidenceScore,
  TIGIntent,
  TIGNodeType,
  TIGRelationship,
  TIGRelationshipType,
  TIGTraversalPath
} from "./types";
import { buildTIGConfidenceScore } from "./confidence";
import { createSeedTIGQueryClient } from "./query";
import { calculateTIGRank } from "./rank";
import { traverseTIGGraph } from "./traverse";

type TIGQueryClient = ReturnType<typeof createSeedTIGQueryClient>;

type SearchableEmotionNode = EmotionProfileNode & {
  emotionalState?: string;
  relatedPromiseIds?: string[];
  relatedScriptureIds?: string[];
  relatedTeoyubeWordIds?: string[];
  relatedJourneyIds?: string[];
};

type SearchablePromiseNode = PromiseCategoryNode & {
  categoryName?: string;
  coreScriptures?: string[];
  relatedScriptures?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
  relatedJourneys?: string[];
  relatedWords?: string[];
};

type SearchablePromiseClusterNode = PromiseClusterNode & {
  clusterKey?: string;
  clusterName?: string;
  scriptureIds?: string[];
  wordIds?: string[];
  journeyIds?: string[];
};

type SearchableCallingNode = CallingProfileNode & {
  callingName?: string;
  archetype?: string;
  relatedScriptures?: string[];
  relatedWords?: string[];
  relatedJourneys?: string[];
  relatedActionSteps?: string[];
};

type SearchableJourneyStage = JourneyNode["stages"][number] & {
  description?: string;
  promiseIds?: string[];
  wordIds?: string[];
  prayerSequenceIds?: string[];
};

type SearchableJourneyNode = Omit<JourneyNode, "stages"> & {
  journeyName?: string;
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
  relatedWords?: string[];
  relatedMilestones?: string[];
  stages: SearchableJourneyStage[];
};

type SearchablePrayerSequenceNode = PrayerSequenceNode & {
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
  relatedWords?: string[];
};

type SearchableReflectionPromptNode = ReflectionPromptNode & {
  promptType?: string;
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedJourneys?: string[];
  relatedWords?: string[];
};

type SearchableActionStepNode = ActionStepNode & {
  actionText?: string;
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
  relatedJourneys?: string[];
};

type SearchableGrowthMilestoneNode = GrowthMilestoneNode & {
  milestoneName?: string;
  journeyId?: string;
  requiredActions?: string[];
  requiredReflections?: string[];
  requiredPrayers?: string[];
};

export type GraphRankedNode<TNode extends AnyTIGNode = AnyTIGNode> = {
  node: TNode;
  rank: number;
  score: number;
  relationshipStrength: number;
  reasons: string[];
};

export type GraphTraceStep = {
  step: string;
  label: string;
  nodeIds: string[];
};

export type GraphResolutionTrace = {
  traversalSteps: GraphTraceStep[];
  selectedNodeIds: string[];
  selectedRelationshipIds: string[];
  rankedPaths: TIGTraversalPath[];
};

export interface GraphResolutionResult {
  request: TIGAIRequest;
  detectedIntent: TIGIntent;
  detectedEmotions: EmotionProfileNode[];
  detectedPromises: PromiseCategoryNode[];
  detectedPromiseClusters: PromiseClusterNode[];
  detectedCallings: CallingProfileNode[];
  detectedJourneys: JourneyNode[];
  detectedWords: TeoyubeWordNode[];
  detectedPrayerSequences: PrayerSequenceNode[];
  detectedReflectionPrompts: ReflectionPromptNode[];
  detectedActionSteps: ActionStepNode[];
  detectedGrowthMilestones: GrowthMilestoneNode[];
  scriptures: ScriptureNode[];
  rankedNodes: Array<GraphRankedNode<AnyTIGNode>>;
  confidence: TIGConfidenceScore;
  graphTrace: GraphResolutionTrace;
}

export type TIGAIResolvedContext = {
  primaryEmotion?: EmotionProfileNode;
  primaryPromise?: PromiseCategoryNode;
  primaryCluster?: PromiseClusterNode;
  primaryScripture?: ScriptureNode;
  primaryJourney?: JourneyNode;
  primaryCalling?: CallingProfileNode;
  primaryPrayerSequence?: PrayerSequenceNode;
  primaryReflectionPrompt?: ReflectionPromptNode;
  primaryActionStep?: ActionStepNode;
  primaryMilestone?: GrowthMilestoneNode;
};

export type GraphResolverContext = {
  request: TIGAIRequest;
  input: string;
  queryClient: TIGQueryClient;
  nodes: AnyTIGNode[];
  relationships: TIGRelationship[];
  detectedIntent: TIGIntent;
  detectedEmotions: EmotionProfileNode[];
  detectedPromises: PromiseCategoryNode[];
  detectedPromiseClusters: PromiseClusterNode[];
  scriptures: ScriptureNode[];
  detectedWords: TeoyubeWordNode[];
  detectedCallings: CallingProfileNode[];
  detectedJourneys: JourneyNode[];
  detectedPrayerSequences: PrayerSequenceNode[];
  detectedReflectionPrompts: ReflectionPromptNode[];
  detectedActionSteps: ActionStepNode[];
  detectedGrowthMilestones: GrowthMilestoneNode[];
};

type ScoredNode<TNode> = {
  node: TNode;
  score: number;
  reasons: string[];
};

const TIG_NODE_TYPES: TIGNodeType[] = [
  "SCRIPTURE",
  "TEOYUBE_WORD",
  "PROMISE_CATEGORY",
  "PROMISE_CLUSTER",
  "EMOTION_PROFILE",
  "CALLING_PROFILE",
  "KINGDOM_PATH",
  "PRAYER_SEQUENCE",
  "JOURNEY",
  "REFLECTION_PROMPT",
  "ACTION_STEP",
  "GROWTH_MILESTONE",
  "AI_RESPONSE_PATTERN"
];

const TIG_RELATIONSHIP_TYPES: TIGRelationshipType[] = [
  "CONNECTS_TO",
  "FULFILLS",
  "REVEALS",
  "STRENGTHENS",
  "HEALS",
  "GUIDES",
  "LEADS_TO",
  "PRECEDES",
  "FOLLOWS",
  "SUPPORTS",
  "ILLUSTRATES",
  "WARNS_AGAINST",
  "ACTIVATES",
  "ANCHORS",
  "GENERATES",
  "BELONGS_TO",
  "MATCHES_INTENT",
  "MATCHES_EMOTION",
  "MATCHES_CALLING"
];

function normalizeInput(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function uniqueNodesById<TNode extends { id: string }>(nodes: TNode[]): TNode[] {
  return [...new Map(nodes.map((node) => [node.id, node])).values()];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(1, Math.max(0, score));
}

function keyToId(prefix: string, key: string): string {
  const normalized = normalizeInput(key).replaceAll("-", "_");
  return normalized.startsWith(`${prefix}_`) ? normalized : `${prefix}_${normalized}`;
}

function comparableValues(value: string): string[] {
  const normalized = normalizeInput(value).replaceAll("-", "_");
  const stripped = normalized.replace(
    /^(action|calling|cluster|emotion|journey|milestone|prayer|promise|reflection|scripture|word)_/,
    ""
  );

  return uniqueStrings([
    normalized,
    normalized.replaceAll("_", "-"),
    stripped,
    stripped.replaceAll("_", "-"),
    `action_${stripped}`,
    `calling_${stripped}`,
    `cluster_${stripped}`,
    `emotion_${stripped}`,
    `journey_${stripped}`,
    `milestone_${stripped}`,
    `prayer_${stripped}`,
    `promise_${stripped}`,
    `reflection_${stripped}`,
    `scripture_${stripped}`,
    `word_${stripped}`
  ]);
}

function countOverlap(left: string[], right: string[]): number {
  const rightValues = new Set(right.flatMap(comparableValues));

  return left.reduce((count, value) => {
    return comparableValues(value).some((candidate) => rightValues.has(candidate))
      ? count + 1
      : count;
  }, 0);
}

function textScore(input: string, values: string[]): number {
  if (!input) return 0;

  return values.reduce((score, value) => {
    const normalizedValue = normalizeInput(value);
    if (!normalizedValue) return score;
    if (input.includes(normalizedValue)) return score + 2;
    if (normalizedValue.includes(input)) return score + 1;
    return score;
  }, 0);
}

function sortScoredNodes<
  TNode extends { id: string; confidenceScore: number; theologicalWeight: number }
>(
  matches: Array<ScoredNode<TNode>>
): TNode[] {
  return uniqueNodesById(
    matches
      .filter((match) => match.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.node.confidenceScore !== a.node.confidenceScore) {
          return b.node.confidenceScore - a.node.confidenceScore;
        }
        return b.node.theologicalWeight - a.node.theologicalWeight;
      })
      .map((match) => match.node)
  );
}

function getAllNodes(queryClient: TIGQueryClient): AnyTIGNode[] {
  return uniqueNodesById(TIG_NODE_TYPES.flatMap((type) => queryClient.getNodesByType(type)));
}

function getAllRelationships(queryClient: TIGQueryClient): TIGRelationship[] {
  return uniqueNodesById(
    TIG_RELATIONSHIP_TYPES.flatMap((type) => queryClient.getRelationshipsByType(type))
  );
}

function isScriptureNode(node: AnyTIGNode | undefined): node is ScriptureNode {
  return node?.type === "SCRIPTURE";
}

function isEmotionNode(node: AnyTIGNode): node is EmotionProfileNode {
  return node.type === "EMOTION_PROFILE";
}

function isPromiseNode(node: AnyTIGNode | undefined): node is PromiseCategoryNode {
  return node?.type === "PROMISE_CATEGORY";
}

function isPromiseClusterNode(node: AnyTIGNode): node is PromiseClusterNode {
  return node.type === "PROMISE_CLUSTER";
}

function isCallingNode(node: AnyTIGNode | undefined): node is CallingProfileNode {
  return node?.type === "CALLING_PROFILE";
}

function isJourneyNode(node: AnyTIGNode | undefined): node is JourneyNode {
  return node?.type === "JOURNEY";
}

function isWordNode(node: AnyTIGNode | undefined): node is TeoyubeWordNode {
  return node?.type === "TEOYUBE_WORD";
}

function isPrayerSequenceNode(node: AnyTIGNode): node is PrayerSequenceNode {
  return node.type === "PRAYER_SEQUENCE";
}

function isReflectionPromptNode(node: AnyTIGNode): node is ReflectionPromptNode {
  return node.type === "REFLECTION_PROMPT";
}

function isActionStepNode(node: AnyTIGNode): node is ActionStepNode {
  return node.type === "ACTION_STEP";
}

function isGrowthMilestoneNode(node: AnyTIGNode): node is GrowthMilestoneNode {
  return node.type === "GROWTH_MILESTONE";
}

function resolveNodeByIdOrKey<TNode extends AnyTIGNode>(
  queryClient: TIGQueryClient,
  refs: string[],
  prefix: string,
  guard: (node: AnyTIGNode | undefined) => node is TNode
): TNode[] {
  return uniqueNodesById(
    refs.flatMap((ref) => {
      const ids = uniqueStrings([ref, keyToId(prefix, ref)]);

      for (const id of ids) {
        const node = queryClient.getNodeById(id);
        if (guard(node)) return [node];
      }

      const slugMatch = queryClient.getNodeBySlug(normalizeInput(ref).replaceAll("_", "-"));
      return guard(slugMatch) ? [slugMatch] : [];
    })
  );
}

function getFallbackScripture(context: GraphResolverContext): ScriptureNode[] {
  const firstScripture = context.queryClient.getNodesByType("SCRIPTURE").find(isScriptureNode);
  return firstScripture ? [firstScripture] : [];
}

function detectIntent(input: string): TIGIntent {
  if (input.includes("pray")) return "seeking_prayer" as TIGIntent;
  if (
    input.includes("purpose") ||
    input.includes("calling") ||
    input.includes("called") ||
    input.includes("gift") ||
    input.includes("serve") ||
    input.includes("lead") ||
    input.includes("teach") ||
    input.includes("build")
  ) {
    return "seeking_calling" as TIGIntent;
  }
  if (
    input.includes("journey") ||
    input.includes("grow") ||
    input.includes("growth") ||
    input.includes("season") ||
    input.includes("next step")
  ) {
    return "seeking_guidance" as TIGIntent;
  }
  if (
    input.includes("help") ||
    input.includes("stuck") ||
    input.includes("tired") ||
    input.includes("discouraged") ||
    input.includes("afraid")
  ) {
    return "seeking_encouragement" as TIGIntent;
  }

  return "seeking_scripture" as TIGIntent;
}

export function resolveEmotions(context: GraphResolverContext): EmotionProfileNode[] {
  return sortScoredNodes(
    context.queryClient
      .getNodesByType("EMOTION_PROFILE")
      .filter(isEmotionNode)
      .map((emotion) => {
        const searchableEmotion = emotion as SearchableEmotionNode;
        const values = [
          emotion.emotionKey,
          searchableEmotion.emotionalState || "",
          emotion.title,
          emotion.description,
          emotion.summary,
          ...emotion.tags,
          ...emotion.aliases,
          ...emotion.userPhrases,
          ...emotion.phraseMatchers
        ];

        return {
          node: emotion,
          score: textScore(context.input, values),
          reasons: ["emotion-text-match"]
        };
      })
  );
}

export function resolvePromises(context: GraphResolverContext): PromiseCategoryNode[] {
  const promiseRefs = uniqueStrings(
    context.detectedEmotions.flatMap((emotion) => {
      const searchableEmotion = emotion as SearchableEmotionNode;
      return [
        ...emotion.recommendedPromiseCategoryIds,
        ...(searchableEmotion.relatedPromiseIds || [])
      ];
    })
  );
  const fromRefs = resolveNodeByIdOrKey(
    context.queryClient,
    promiseRefs,
    "promise",
    isPromiseNode
  );
  const fromText = sortScoredNodes(
    context.queryClient
      .getNodesByType("PROMISE_CATEGORY")
      .filter(isPromiseNode)
      .map((promise) => {
        const searchablePromise = promise as SearchablePromiseNode;
        const values = [
          promise.categoryKey,
          searchablePromise.categoryName || "",
          promise.title,
          promise.description,
          ...promise.tags,
          ...promise.aliases
        ];

        return {
          node: promise,
          score: textScore(context.input, values),
          reasons: ["promise-text-match"]
        };
      })
  );

  return uniqueNodesById([...fromRefs, ...fromText]);
}

export function resolvePromiseClusters(context: GraphResolverContext): PromiseClusterNode[] {
  const promiseIds = context.detectedPromises.map((promise) => promise.id);

  return sortScoredNodes(
    context.queryClient
      .getNodesByType("PROMISE_CLUSTER")
      .filter(isPromiseClusterNode)
      .map((cluster) => {
        const searchableCluster = cluster as SearchablePromiseClusterNode;
        const overlap = countOverlap(cluster.categoryIds, promiseIds);
        const text = textScore(context.input, [
          searchableCluster.clusterKey || "",
          searchableCluster.clusterName || "",
          cluster.title,
          cluster.description,
          ...cluster.tags,
          ...cluster.aliases
        ]);

        return {
          node: cluster,
          score: overlap * 3 + text,
          reasons: ["promise-cluster-match"]
        };
      })
  );
}

export function resolveScriptures(context: GraphResolverContext): ScriptureNode[] {
  const scriptureRefs = uniqueStrings([
    ...context.detectedEmotions.flatMap((emotion) => {
      const searchableEmotion = emotion as SearchableEmotionNode;
      return [...emotion.recommendedScriptureIds, ...(searchableEmotion.relatedScriptureIds || [])];
    }),
    ...context.detectedPromises.flatMap((promise) => {
      const searchablePromise = promise as SearchablePromiseNode;
      return [
        ...promise.anchorScriptureIds,
        ...(searchablePromise.coreScriptures || []),
        ...(searchablePromise.relatedScriptures || [])
      ];
    }),
    ...context.detectedPromiseClusters.flatMap((cluster) => {
      const searchableCluster = cluster as SearchablePromiseClusterNode;
      return [
        ...cluster.anchorScriptureIds,
        ...(searchableCluster.scriptureIds || [])
      ];
    }),
    ...context.detectedCallings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return [
        ...calling.anchorScriptureIds,
        ...(searchableCalling.relatedScriptures || [])
      ];
    }),
    ...context.detectedJourneys.flatMap((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      return [
        ...journey.relatedScriptureIds,
        ...(searchableJourney.relatedScriptures || []),
        ...searchableJourney.stages.flatMap((stage) => stage.scriptureIds)
      ];
    })
  ]);
  const scriptures = resolveNodeByIdOrKey(
    context.queryClient,
    scriptureRefs,
    "scripture",
    isScriptureNode
  );

  return scriptures.length ? scriptures : getFallbackScripture(context);
}

export function resolveWords(context: GraphResolverContext): TeoyubeWordNode[] {
  const wordRefs = uniqueStrings([
    ...context.detectedEmotions.flatMap((emotion) => {
      const searchableEmotion = emotion as SearchableEmotionNode;
      return searchableEmotion.relatedTeoyubeWordIds || [];
    }),
    ...context.detectedPromises.flatMap((promise) => {
      const searchablePromise = promise as SearchablePromiseNode;
      return searchablePromise.relatedWords || [];
    }),
    ...context.detectedPromiseClusters.flatMap((cluster) => {
      const searchableCluster = cluster as SearchablePromiseClusterNode;
      return [...cluster.teoyubeWordIds, ...(searchableCluster.wordIds || [])];
    }),
    ...context.detectedCallings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return searchableCalling.relatedWords || [];
    }),
    ...context.detectedJourneys.flatMap((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      return [
        ...journey.relatedTeoyubeWordIds,
        ...(searchableJourney.relatedWords || []),
        ...searchableJourney.stages.flatMap((stage) => stage.wordIds || [])
      ];
    }),
    ...context.scriptures.flatMap((scripture) => scripture.teoyubeWords)
  ]);

  return resolveNodeByIdOrKey(context.queryClient, wordRefs, "word", isWordNode).sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return b.confidenceScore - a.confidenceScore;
  });
}

export function resolveCallings(context: GraphResolverContext): CallingProfileNode[] {
  const callingRefs = uniqueStrings([
    ...context.detectedPromises.flatMap((promise) => {
      const searchablePromise = promise as SearchablePromiseNode;
      return [...promise.relatedCallingIds, ...(searchablePromise.relatedCallings || [])];
    }),
    ...context.scriptures.flatMap((scripture) => scripture.callings)
  ]);
  const fromRefs = resolveNodeByIdOrKey(
    context.queryClient,
    callingRefs,
    "calling",
    isCallingNode
  );
  const fromText = sortScoredNodes(
    context.queryClient
      .getNodesByType("CALLING_PROFILE")
      .filter(isCallingNode)
      .map((calling) => {
        const searchableCalling = calling as SearchableCallingNode;
        const values = [
          calling.callingKey,
          searchableCalling.callingName || "",
          searchableCalling.archetype || "",
          calling.title,
          calling.description,
          ...calling.tags,
          ...calling.aliases,
          ...calling.archetypes,
          ...calling.gifts,
          ...calling.strengths,
          ...calling.challenges,
          ...calling.biblicalExamples
        ];

        return {
          node: calling,
          score: textScore(context.input, values),
          reasons: ["calling-text-match"]
        };
      })
  );

  return uniqueNodesById([...fromText, ...fromRefs]);
}

export function resolveJourneys(context: GraphResolverContext): JourneyNode[] {
  const journeyRefs = uniqueStrings([
    ...context.detectedEmotions.flatMap((emotion) => {
      const searchableEmotion = emotion as SearchableEmotionNode;
      return searchableEmotion.relatedJourneyIds || [];
    }),
    ...context.detectedPromises.flatMap((promise) => {
      const searchablePromise = promise as SearchablePromiseNode;
      return searchablePromise.relatedJourneys || [];
    }),
    ...context.detectedPromiseClusters.flatMap((cluster) => {
      const searchableCluster = cluster as SearchablePromiseClusterNode;
      return searchableCluster.journeyIds || [];
    }),
    ...context.detectedCallings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return searchableCalling.relatedJourneys || [];
    })
  ]);
  const fromRefs = resolveNodeByIdOrKey(
    context.queryClient,
    journeyRefs,
    "journey",
    isJourneyNode
  );
  const contextValues = uniqueStrings([
    ...context.detectedEmotions.flatMap((emotion) => [emotion.id, emotion.emotionKey]),
    ...context.detectedPromises.flatMap((promise) => [promise.id, promise.categoryKey]),
    ...context.detectedCallings.flatMap((calling) => [calling.id, calling.callingKey])
  ]);
  const fromTextOrContext = sortScoredNodes(
    context.queryClient
      .getNodesByType("JOURNEY")
      .filter(isJourneyNode)
      .map((journey) => {
        const searchableJourney = journey as SearchableJourneyNode;
        const values = [
          journey.journeyKey,
          searchableJourney.journeyName || "",
          journey.title,
          journey.description,
          ...journey.tags,
          ...journey.aliases,
          ...(searchableJourney.relatedEmotions || journey.relatedEmotionIds),
          ...(searchableJourney.relatedPromises || journey.relatedPromiseCategoryIds),
          ...(searchableJourney.relatedCallings || journey.relatedCallingIds)
        ];

        return {
          node: journey,
          score: textScore(context.input, values) + countOverlap(values, contextValues) * 2,
          reasons: ["journey-context-match"]
        };
      })
  );

  return uniqueNodesById([...fromRefs, ...fromTextOrContext]);
}

export function resolvePrayerSequences(context: GraphResolverContext): PrayerSequenceNode[] {
  const contextValues = uniqueStrings([
    ...context.detectedEmotions.flatMap((emotion) => [emotion.id, emotion.emotionKey]),
    ...context.detectedPromises.flatMap((promise) => [promise.id, promise.categoryKey]),
    ...context.detectedCallings.flatMap((calling) => [calling.id, calling.callingKey]),
    ...context.scriptures.map((scripture) => scripture.id),
    ...context.detectedWords.flatMap((word) => [word.id, word.slug, word.word]),
    ...context.detectedJourneys.flatMap((journey) =>
      (journey as SearchableJourneyNode).stages.flatMap((stage) => stage.prayerSequenceIds || [])
    )
  ]);

  return sortScoredNodes(
    context.queryClient
      .getNodesByType("PRAYER_SEQUENCE")
      .filter(isPrayerSequenceNode)
      .map((sequence) => {
        const searchableSequence = sequence as SearchablePrayerSequenceNode;
        const values = [
          sequence.id,
          sequence.sequenceKey,
          ...sequence.anchorScriptureIds,
          ...sequence.promiseCategoryIds,
          ...(searchableSequence.relatedScriptures || []),
          ...(searchableSequence.relatedPromises || []),
          ...(searchableSequence.relatedEmotions || []),
          ...(searchableSequence.relatedCallings || []),
          ...(searchableSequence.relatedWords || [])
        ];

        return {
          node: sequence,
          score: countOverlap(values, contextValues),
          reasons: ["prayer-sequence-overlap"]
        };
      })
  );
}

export function resolveReflectionPrompts(context: GraphResolverContext): ReflectionPromptNode[] {
  const contextValues = uniqueStrings([
    ...context.detectedEmotions.flatMap((emotion) => [emotion.id, emotion.emotionKey]),
    ...context.detectedPromises.flatMap((promise) => [promise.id, promise.categoryKey]),
    ...context.detectedJourneys.flatMap((journey) => [journey.id, journey.journeyKey]),
    ...context.detectedWords.flatMap((word) => [word.id, word.slug, word.word]),
    ...context.detectedJourneys.flatMap((journey) =>
      (journey as SearchableJourneyNode).stages.flatMap((stage) => stage.reflectionPromptIds)
    )
  ]);

  return sortScoredNodes(
    context.queryClient
      .getNodesByType("REFLECTION_PROMPT")
      .filter(isReflectionPromptNode)
      .map((prompt) => {
        const searchablePrompt = prompt as SearchableReflectionPromptNode;
        const values = [
          prompt.id,
          ...prompt.emotionIds,
          ...prompt.journeyIds,
          ...(searchablePrompt.relatedScriptures || []),
          ...(searchablePrompt.relatedPromises || []),
          ...(searchablePrompt.relatedEmotions || []),
          ...(searchablePrompt.relatedJourneys || []),
          ...(searchablePrompt.relatedWords || [])
        ];

        return {
          node: prompt,
          score: countOverlap(values, contextValues),
          reasons: ["reflection-prompt-overlap"]
        };
      })
  );
}

export function resolveActionSteps(context: GraphResolverContext): ActionStepNode[] {
  const contextValues = uniqueStrings([
    ...context.detectedEmotions.flatMap((emotion) => [emotion.id, emotion.emotionKey]),
    ...context.detectedPromises.flatMap((promise) => [promise.id, promise.categoryKey]),
    ...context.detectedCallings.flatMap((calling) => [calling.id, calling.callingKey]),
    ...context.detectedJourneys.flatMap((journey) => [journey.id, journey.journeyKey]),
    ...context.detectedJourneys.flatMap((journey) =>
      (journey as SearchableJourneyNode).stages.flatMap((stage) => stage.actionStepIds)
    ),
    ...context.detectedCallings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return searchableCalling.relatedActionSteps || [];
    })
  ]);

  return sortScoredNodes(
    context.queryClient
      .getNodesByType("ACTION_STEP")
      .filter(isActionStepNode)
      .map((actionStep) => {
        const searchableActionStep = actionStep as SearchableActionStepNode;
        const values = [
          actionStep.id,
          ...actionStep.promiseCategoryIds,
          ...(searchableActionStep.relatedScriptures || []),
          ...(searchableActionStep.relatedPromises || []),
          ...(searchableActionStep.relatedEmotions || []),
          ...(searchableActionStep.relatedCallings || []),
          ...(searchableActionStep.relatedJourneys || [])
        ];

        return {
          node: actionStep,
          score: countOverlap(values, contextValues),
          reasons: ["action-step-overlap"]
        };
      })
  );
}

export function resolveGrowthMilestones(context: GraphResolverContext): GrowthMilestoneNode[] {
  const contextValues = uniqueStrings([
    ...context.detectedJourneys.flatMap((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      return [
        journey.id,
        journey.journeyKey,
        ...journey.milestoneIds,
        ...(searchableJourney.relatedMilestones || []),
        ...searchableJourney.stages.flatMap((stage) => stage.milestoneIds)
      ];
    }),
    ...context.detectedActionSteps.map((action) => action.id),
    ...context.detectedPrayerSequences.map((prayer) => prayer.id),
    ...context.detectedReflectionPrompts.map((prompt) => prompt.id)
  ]);

  return sortScoredNodes(
    context.queryClient
      .getNodesByType("GROWTH_MILESTONE")
      .filter(isGrowthMilestoneNode)
      .map((milestone) => {
        const searchableMilestone = milestone as SearchableGrowthMilestoneNode;
        const values = [
          milestone.id,
          milestone.milestoneKey,
          searchableMilestone.milestoneName || "",
          searchableMilestone.journeyId || "",
          ...milestone.evidenceMarkers,
          ...milestone.unlocksJourneyIds,
          ...milestone.unlocksActionStepIds,
          ...(searchableMilestone.requiredActions || []),
          ...(searchableMilestone.requiredReflections || []),
          ...(searchableMilestone.requiredPrayers || [])
        ];

        return {
          node: milestone,
          score: countOverlap(values, contextValues),
          reasons: ["growth-milestone-overlap"]
        };
      })
  );
}

function calculateRelationshipStrength(
  node: AnyTIGNode,
  selectedNodeIds: Set<string>,
  relationships: TIGRelationship[]
): number {
  const matchedRelationships = relationships.filter((relationship) => {
    if (relationship.sourceNodeId === node.id) return selectedNodeIds.has(relationship.targetNodeId);
    if (relationship.targetNodeId === node.id) return selectedNodeIds.has(relationship.sourceNodeId);
    return false;
  });

  if (!matchedRelationships.length) return 0;
  return clampScore(
    matchedRelationships.reduce((sum, relationship) => sum + relationship.strength, 0) /
      matchedRelationships.length
  );
}

function calculateUnifiedNodeScore(params: {
  node: AnyTIGNode;
  relationshipStrength: number;
}): number {
  const { node, relationshipStrength } = params;
  const scriptureRelevance = node.type === "SCRIPTURE" ? 1 : 0;
  const promiseRelevance =
    node.type === "PROMISE_CATEGORY" || node.type === "PROMISE_CLUSTER" ? 1 : 0;
  const emotionRelevance = node.type === "EMOTION_PROFILE" ? 1 : 0;
  const journeyRelevance = node.type === "JOURNEY" ? 1 : 0;
  const callingRelevance = node.type === "CALLING_PROFILE" ? 1 : 0;

  return calculateTIGRank(
    {
      intentScore: 0,
      emotionScore: emotionRelevance,
      promiseScore: promiseRelevance,
      scriptureRelevance,
      callingRelevance,
      journeyRelevance,
      userHistoryRelevance: relationshipStrength,
      theologicalWeight: node.theologicalWeight,
      pastoralSensitivity: 0
    },
    {
      intentScore: 0,
      emotionScore: 0.15,
      promiseScore: 0.2,
      scriptureRelevance: 0.35,
      callingRelevance: 0.1,
      journeyRelevance: 0.1,
      userHistoryRelevance: 0.05,
      theologicalWeight: 0.05,
      pastoralSensitivity: 0
    }
  );
}

function rankGraphNodes(
  context: GraphResolverContext,
  traversedNodes: AnyTIGNode[]
): GraphRankedNode[] {
  const selectedNodes = uniqueNodesById([
    ...context.detectedEmotions,
    ...context.detectedPromises,
    ...context.detectedPromiseClusters,
    ...context.detectedCallings,
    ...context.detectedJourneys,
    ...context.detectedWords,
    ...context.detectedPrayerSequences,
    ...context.detectedReflectionPrompts,
    ...context.detectedActionSteps,
    ...context.detectedGrowthMilestones,
    ...context.scriptures,
    ...traversedNodes
  ]);
  const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));

  return selectedNodes
    .map((node) => {
      const relationshipStrength = calculateRelationshipStrength(
        node,
        selectedNodeIds,
        context.relationships
      );

      return {
        node,
        rank: 0,
        score: calculateUnifiedNodeScore({ node, relationshipStrength }),
        relationshipStrength,
        reasons: [`type:${node.type}`]
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.node.confidenceScore - a.node.confidenceScore;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
}

function buildGraphConfidence(context: GraphResolverContext): TIGConfidenceScore {
  return buildTIGConfidenceScore(
    {
      intentConfidence: 0.72,
      emotionConfidence: context.detectedEmotions.length ? 0.85 : 0.25,
      promiseConfidence:
        context.detectedPromises.length || context.detectedPromiseClusters.length ? 0.88 : 0.25,
      scriptureConfidence: context.scriptures.length ? 0.95 : 0,
      callingConfidence: context.detectedCallings.length ? 0.82 : 0.25,
      journeyConfidence: context.detectedJourneys.length ? 0.86 : 0.25
    },
    "Graph confidence was calculated from the shared TIG resolver across intent, emotion, promise, Scripture, calling, and journey signals."
  );
}

function buildGraphTrace(params: {
  context: GraphResolverContext;
  rankedPaths: TIGTraversalPath[];
  selectedRelationshipIds: string[];
}): GraphResolutionTrace {
  const { context } = params;
  const steps: GraphTraceStep[] = [
    { step: "input", label: context.request.input, nodeIds: [] },
    {
      step: "emotion",
      label: context.detectedEmotions[0]?.title || "",
      nodeIds: context.detectedEmotions.map((node) => node.id)
    },
    {
      step: "promise",
      label: context.detectedPromises[0]?.title || "",
      nodeIds: context.detectedPromises.map((node) => node.id)
    },
    {
      step: "cluster",
      label: context.detectedPromiseClusters[0]?.title || "",
      nodeIds: context.detectedPromiseClusters.map((node) => node.id)
    },
    {
      step: "scripture",
      label: context.scriptures[0]?.reference || "",
      nodeIds: context.scriptures.map((node) => node.id)
    },
    {
      step: "word",
      label: context.detectedWords[0]?.word || "",
      nodeIds: context.detectedWords.map((node) => node.id)
    },
    {
      step: "calling",
      label: context.detectedCallings[0]?.title || "",
      nodeIds: context.detectedCallings.map((node) => node.id)
    },
    {
      step: "journey",
      label: context.detectedJourneys[0]?.title || "",
      nodeIds: context.detectedJourneys.map((node) => node.id)
    },
    {
      step: "prayer",
      label: context.detectedPrayerSequences[0]?.title || "",
      nodeIds: context.detectedPrayerSequences.map((node) => node.id)
    },
    {
      step: "reflection",
      label: context.detectedReflectionPrompts[0]?.title || "",
      nodeIds: context.detectedReflectionPrompts.map((node) => node.id)
    },
    {
      step: "action",
      label: context.detectedActionSteps[0]?.title || "",
      nodeIds: context.detectedActionSteps.map((node) => node.id)
    },
    {
      step: "milestone",
      label: context.detectedGrowthMilestones[0]?.title || "",
      nodeIds: context.detectedGrowthMilestones.map((node) => node.id)
    }
  ];

  return {
    traversalSteps: steps.filter((step) => step.step === "input" || step.nodeIds.length > 0),
    selectedNodeIds: uniqueStrings(steps.flatMap((step) => step.nodeIds)),
    selectedRelationshipIds: params.selectedRelationshipIds,
    rankedPaths: params.rankedPaths
  };
}

export function resolveGraph(request: TIGAIRequest): GraphResolutionResult {
  const queryClient = createSeedTIGQueryClient();
  const input = normalizeInput(request.input);
  const context: GraphResolverContext = {
    request,
    input,
    queryClient,
    nodes: getAllNodes(queryClient),
    relationships: getAllRelationships(queryClient),
    detectedIntent: detectIntent(input),
    detectedEmotions: [],
    detectedPromises: [],
    detectedPromiseClusters: [],
    scriptures: [],
    detectedWords: [],
    detectedCallings: [],
    detectedJourneys: [],
    detectedPrayerSequences: [],
    detectedReflectionPrompts: [],
    detectedActionSteps: [],
    detectedGrowthMilestones: []
  };

  context.detectedEmotions = resolveEmotions(context);
  context.detectedPromises = resolvePromises(context);
  context.detectedPromiseClusters = resolvePromiseClusters(context);
  context.scriptures = resolveScriptures(context);
  context.detectedWords = resolveWords(context);
  context.detectedCallings = resolveCallings(context);
  context.detectedJourneys = resolveJourneys(context);
  context.scriptures = resolveScriptures(context);
  context.detectedWords = resolveWords(context);
  context.detectedPrayerSequences = resolvePrayerSequences(context);
  context.detectedReflectionPrompts = resolveReflectionPrompts(context);
  context.detectedActionSteps = resolveActionSteps(context);
  context.detectedGrowthMilestones = resolveGrowthMilestones(context);

  const startNodeIds = uniqueStrings([
    ...context.detectedEmotions.map((node) => node.id),
    ...context.detectedPromises.map((node) => node.id),
    ...context.detectedPromiseClusters.map((node) => node.id),
    ...context.scriptures.map((node) => node.id),
    ...context.detectedCallings.map((node) => node.id),
    ...context.detectedJourneys.map((node) => node.id)
  ]);
  const traversal = startNodeIds.length
    ? traverseTIGGraph({
        nodes: context.nodes,
        relationships: context.relationships,
        options: {
          startNodeIds,
          maxDepth: 2,
          minStrength: 0.7,
          minConfidence: 0.75
        }
      })
    : undefined;
  const traversedNodes = traversal?.rankedNodes.map((rankedNode) => rankedNode.node) || [];
  const rankedNodes = rankGraphNodes(context, traversedNodes);
  const confidence = buildGraphConfidence(context);
  const selectedRelationshipIds = uniqueStrings(
    traversal?.paths.flatMap((path) => path.relationships) || []
  );
  const graphTrace = buildGraphTrace({
    context,
    selectedRelationshipIds,
    rankedPaths: traversal?.paths || []
  });

  return {
    request,
    detectedIntent: context.detectedIntent,
    detectedEmotions: context.detectedEmotions,
    detectedPromises: context.detectedPromises,
    detectedPromiseClusters: context.detectedPromiseClusters,
    detectedCallings: context.detectedCallings,
    detectedJourneys: context.detectedJourneys,
    detectedWords: context.detectedWords,
    detectedPrayerSequences: context.detectedPrayerSequences,
    detectedReflectionPrompts: context.detectedReflectionPrompts,
    detectedActionSteps: context.detectedActionSteps,
    detectedGrowthMilestones: context.detectedGrowthMilestones,
    scriptures: context.scriptures,
    rankedNodes,
    confidence,
    graphTrace
  };
}

export function buildAIContext(result: GraphResolutionResult): TIGAIResolvedContext {
  return {
    primaryEmotion: result.detectedEmotions[0],
    primaryPromise: result.detectedPromises[0],
    primaryCluster: result.detectedPromiseClusters[0],
    primaryScripture: result.scriptures[0],
    primaryJourney: result.detectedJourneys[0],
    primaryCalling: result.detectedCallings[0],
    primaryPrayerSequence: result.detectedPrayerSequences[0],
    primaryReflectionPrompt: result.detectedReflectionPrompts[0],
    primaryActionStep: result.detectedActionSteps[0],
    primaryMilestone: result.detectedGrowthMilestones[0]
  };
}
