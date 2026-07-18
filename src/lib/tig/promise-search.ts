import type {
  ActionStepNode,
  AnyTIGNode,
  EmotionProfileNode,
  JourneyNode,
  PrayerSequenceNode,
  PromiseCategoryNode,
  PromiseClusterNode,
  ReflectionPromptNode,
  ScriptureNode,
  TeoyubeWordNode,
  TIGAIRequest,
  TIGAIResponse,
  TIGConfidenceScore,
  TIGIntent,
  TIGScore
} from "./types";
import { buildTIGConfidenceScore } from "./confidence";
import { resolveGraph } from "./graph-engine";
import { createSeedTIGQueryClient } from "./query";
import { buildPromiseSearchResponse } from "./response-builder";

type SearchableEmotionNode = EmotionProfileNode & {
  emotionName?: string;
  emotionalState?: string;
  relatedEmotions?: string[];
  relatedPromises?: string[];
  relatedPromiseIds?: string[];
  relatedScriptureIds?: string[];
  relatedJourneys?: string[];
  relatedJourneyIds?: string[];
  relatedWords?: string[];
  relatedTeoyubeWordIds?: string[];
};

type SearchablePromiseNode = PromiseCategoryNode & {
  categoryName?: string;
  coreScriptures?: string[];
  relatedScriptures?: string[];
  relatedEmotions?: string[];
  relatedJourneys?: string[];
  relatedWords?: string[];
};

type SearchablePromiseClusterNode = PromiseClusterNode & {
  clusterKey?: string;
  clusterName?: string;
  scriptureIds?: string[];
  wordIds?: string[];
  journeyIds?: string[];
  primaryPromise?: string;
  supportingPromises?: string[];
};

type SearchablePrayerSequenceNode = PrayerSequenceNode & {
  sequenceName?: string;
  opening?: string;
  scriptureAnchor?: string;
  confession?: string;
  petition?: string;
  declaration?: string;
  surrender?: string;
  thanksgiving?: string;
  closing?: string;
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
  relatedWords?: string[];
};

type SearchableReflectionPromptNode = ReflectionPromptNode & {
  promptKey?: string;
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedJourneys?: string[];
  relatedWords?: string[];
};

type SearchableActionStepNode = ActionStepNode & {
  actionKey?: string;
  actionText?: string;
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
  relatedJourneys?: string[];
};

type SearchableJourneyNode = JourneyNode & {
  journeyName?: string;
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
  relatedWords?: string[];
};

type PromiseSearchResponse = Omit<
  TIGAIResponse,
  | "detectedIntent"
  | "detectedEmotions"
  | "detectedPromiseCategories"
  | "detectedCallingProfiles"
  | "teoyubeWords"
  | "promiseClusters"
  | "journey"
  | "reflectionPrompt"
  | "actionStep"
> & {
  detectedIntent: TIGIntent;
  detectedEmotions: string[];
  detectedPromiseCategories: string[];
  detectedCallingProfiles: [];
  scriptures: ScriptureNode[];
  teoyubeWords: string[];
  promiseClusters: string[];
  journey?: string;
  prayer: string;
  reflectionPrompt: string;
  actionStep: string;
  confidence: TIGConfidenceScore;
};

type MatchTerms = {
  emotions: Set<string>;
  promises: Set<string>;
  words: Set<string>;
  scriptures: Set<string>;
  journeys: Set<string>;
  callings: Set<string>;
};

type ScoredNode<TNode> = {
  node: TNode;
  score: TIGScore;
};

const DEFAULT_PRAYER =
  "Father, guide me through Your promises. Help me receive Your Word with faith, courage, and obedience today.";
const DEFAULT_REFLECTION_PROMPT =
  "What promise from Scripture speaks most directly to my current season?";
const DEFAULT_ACTION_STEP =
  "Choose one Scripture from this response and write one sentence about how you can trust God with it today.";

function isScriptureNode(node: AnyTIGNode | undefined): node is ScriptureNode {
  return node?.type === "SCRIPTURE";
}

function isEmotionProfileNode(node: AnyTIGNode): node is EmotionProfileNode {
  return node.type === "EMOTION_PROFILE";
}

function isPromiseCategoryNode(node: AnyTIGNode | undefined): node is PromiseCategoryNode {
  return node?.type === "PROMISE_CATEGORY";
}

function isPromiseClusterNode(node: AnyTIGNode): node is PromiseClusterNode {
  return node.type === "PROMISE_CLUSTER";
}

function isTeoyubeWordNode(node: AnyTIGNode | undefined): node is TeoyubeWordNode {
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

function isJourneyNode(node: AnyTIGNode | undefined): node is JourneyNode {
  return node?.type === "JOURNEY";
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(hasText))];
}

function uniqueNodesById<TNode extends { id: string }>(nodes: TNode[]): TNode[] {
  return [...new Map(nodes.map((node) => [node.id, node])).values()];
}

function promiseKeyToId(key: string): string {
  const normalizedKey = normalizeSearchInput(key).replaceAll("-", "_");
  return normalizedKey.startsWith("promise_") ? normalizedKey : `promise_${normalizedKey}`;
}

function journeyKeyToId(key: string): string {
  const normalizedKey = normalizeSearchInput(key).replaceAll("-", "_");
  return normalizedKey.startsWith("journey_") ? normalizedKey : `journey_${normalizedKey}`;
}

function wordKeyToId(key: string): string {
  const normalizedKey = normalizeSearchInput(key).replaceAll("-", "_");
  return normalizedKey.startsWith("word_") ? normalizedKey : `word_${normalizedKey}`;
}

function stripKnownPrefix(value: string): string {
  return value.replace(
    /^(action|calling|cluster|emotion|journey|milestone|prayer|promise|reflection|scripture|word)_/,
    ""
  );
}

function getValueAliases(value: string): string[] {
  const normalizedValue = normalizeSearchInput(value);
  if (!normalizedValue) return [];

  const underscoreValue = normalizedValue.replaceAll("-", "_");
  const hyphenValue = normalizedValue.replaceAll("_", "-");
  const strippedValue = stripKnownPrefix(underscoreValue);
  const strippedHyphenValue = strippedValue.replaceAll("_", "-");

  return uniqueStrings([
    normalizedValue,
    underscoreValue,
    hyphenValue,
    strippedValue,
    strippedHyphenValue,
    `promise_${strippedValue}`,
    `emotion_${strippedValue}`,
    `word_${strippedValue}`,
    `journey_${strippedValue}`,
    `calling_${strippedValue}`
  ]);
}

function addTerms(target: Set<string>, values: string[]): void {
  for (const value of values) {
    for (const alias of getValueAliases(value)) {
      target.add(alias);
    }
  }
}

function countOverlap(termSet: Set<string>, values: string[]): TIGScore {
  let score = 0;

  for (const value of values) {
    const aliases = getValueAliases(value);
    if (aliases.some((alias) => termSet.has(alias))) score += 1;
  }

  return score;
}

function rankByOverlap<TNode extends { confidenceScore: number; theologicalWeight: number }>(
  nodes: TNode[],
  termSet: Set<string>,
  getValues: (node: TNode) => string[]
): TNode[] {
  const scoredNodes: ScoredNode<TNode>[] = nodes.map((node) => ({
    node,
    score: countOverlap(termSet, uniqueStrings(getValues(node)))
  }));

  return scoredNodes
    .filter((match) => match.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.node.confidenceScore !== a.node.confidenceScore) {
        return b.node.confidenceScore - a.node.confidenceScore;
      }
      return b.node.theologicalWeight - a.node.theologicalWeight;
    })
    .map((match) => match.node);
}

function getEmotionDisplayName(emotion: EmotionProfileNode): string {
  const searchableEmotion = emotion as SearchableEmotionNode;
  return searchableEmotion.emotionName || searchableEmotion.emotionalState || emotion.title || emotion.emotionKey;
}

function getPromiseDisplayName(promise: PromiseCategoryNode): string {
  const searchablePromise = promise as SearchablePromiseNode;
  return searchablePromise.categoryName || promise.title || promise.categoryKey;
}

function getPromiseClusterDisplayName(cluster: PromiseClusterNode): string {
  const searchableCluster = cluster as SearchablePromiseClusterNode;
  return searchableCluster.clusterName || cluster.title || searchableCluster.clusterKey || cluster.slug;
}

function getPromiseClusterKey(cluster: PromiseClusterNode): string {
  const searchableCluster = cluster as SearchablePromiseClusterNode;
  return searchableCluster.clusterKey || cluster.slug || cluster.id;
}

function getJourneyKey(journey: JourneyNode): string {
  return journey.journeyKey || journey.slug || journey.id;
}

function getWordLabel(word: TeoyubeWordNode): string {
  return word.slug || word.word || word.title || word.id;
}

function collectWordRefs(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  clusters: PromiseClusterNode[];
  scriptures: ScriptureNode[];
  journeys: JourneyNode[];
}): string[] {
  return uniqueStrings([
    ...params.emotions.flatMap((emotion) => {
      const searchableEmotion = emotion as SearchableEmotionNode;
      return [
        ...(searchableEmotion.relatedWords || []),
        ...(searchableEmotion.relatedTeoyubeWordIds || [])
      ];
    }),
    ...params.promises.flatMap((promise) => {
      const searchablePromise = promise as SearchablePromiseNode;
      return searchablePromise.relatedWords || [];
    }),
    ...params.clusters.flatMap((cluster) => {
      const searchableCluster = cluster as SearchablePromiseClusterNode;
      return [
        ...cluster.teoyubeWordIds,
        ...(searchableCluster.wordIds || [])
      ];
    }),
    ...params.scriptures.flatMap((scripture) => scripture.teoyubeWords),
    ...params.journeys.flatMap((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      return [
        ...journey.relatedTeoyubeWordIds,
        ...(searchableJourney.relatedWords || []),
        ...journey.stages.flatMap((stage) => (stage as JourneyNode["stages"][number] & { wordIds?: string[] }).wordIds || [])
      ];
    })
  ]);
}

function collectMatchTerms(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  clusters: PromiseClusterNode[];
  journey?: JourneyNode;
}): MatchTerms {
  const terms: MatchTerms = {
    emotions: new Set<string>(),
    promises: new Set<string>(),
    words: new Set<string>(),
    scriptures: new Set<string>(),
    journeys: new Set<string>(),
    callings: new Set<string>()
  };

  addTerms(
    terms.emotions,
    params.emotions.flatMap((emotion) => {
      const searchableEmotion = emotion as SearchableEmotionNode;
      return [
        emotion.id,
        emotion.slug,
        emotion.title,
        emotion.emotionKey,
        searchableEmotion.emotionalState || "",
        ...(searchableEmotion.relatedEmotions || [])
      ];
    })
  );
  addTerms(
    terms.promises,
    params.promises.flatMap((promise) => [
      promise.id,
      promise.slug,
      promise.title,
      promise.categoryKey,
      (promise as SearchablePromiseNode).categoryName || ""
    ])
  );
  addTerms(
    terms.words,
    collectWordRefs({
      emotions: params.emotions,
      promises: params.promises,
      clusters: params.clusters,
      scriptures: [],
      journeys: params.journey ? [params.journey] : []
    })
  );
  addTerms(
    terms.scriptures,
    uniqueStrings([
      ...params.emotions.flatMap((emotion) => {
        const searchableEmotion = emotion as SearchableEmotionNode;
        return [...emotion.recommendedScriptureIds, ...(searchableEmotion.relatedScriptureIds || [])];
      }),
      ...params.promises.flatMap((promise) => {
        const searchablePromise = promise as SearchablePromiseNode;
        return [
          ...promise.anchorScriptureIds,
          ...(searchablePromise.coreScriptures || []),
          ...(searchablePromise.relatedScriptures || [])
        ];
      }),
      ...params.clusters.flatMap((cluster) => {
        const searchableCluster = cluster as SearchablePromiseClusterNode;
        return [
          ...cluster.anchorScriptureIds,
          ...(searchableCluster.scriptureIds || [])
        ];
      }),
      ...(params.journey
        ? [
            ...params.journey.relatedScriptureIds,
            ...((params.journey as SearchableJourneyNode).relatedScriptures || [])
          ]
        : [])
    ])
  );
  addTerms(
    terms.journeys,
    uniqueStrings([
      ...params.clusters.flatMap((cluster) => {
        const searchableCluster = cluster as SearchablePromiseClusterNode;
        return searchableCluster.journeyIds || [];
      }),
      ...(params.journey
        ? [
            params.journey.id,
            params.journey.slug,
            params.journey.journeyKey,
            (params.journey as SearchableJourneyNode).journeyName || ""
          ]
        : [])
    ])
  );
  addTerms(
    terms.callings,
    uniqueStrings(
      params.journey
        ? [
            ...params.journey.relatedCallingIds,
            ...((params.journey as SearchableJourneyNode).relatedCallings || [])
          ]
        : []
    )
  );

  return terms;
}

function combineTermSets(...sets: Set<string>[]): Set<string> {
  const combined = new Set<string>();
  for (const set of sets) {
    for (const value of set) combined.add(value);
  }
  return combined;
}

function resolveWordNode(value: string): TeoyubeWordNode | undefined {
  const queryClient = createSeedTIGQueryClient();
  const normalizedValue = normalizeSearchInput(value);
  const candidateIds = uniqueStrings([normalizedValue, wordKeyToId(normalizedValue)]);

  for (const candidateId of candidateIds) {
    const node = queryClient.getNodeById(candidateId);
    if (isTeoyubeWordNode(node)) return node;
  }

  const slugMatch = queryClient.getNodeBySlug(normalizedValue);
  if (isTeoyubeWordNode(slugMatch)) return slugMatch;

  return queryClient
    .getNodesByType("TEOYUBE_WORD")
    .filter(isTeoyubeWordNode)
    .find((word) => normalizeSearchInput(word.word) === normalizedValue);
}

export function normalizeSearchInput(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function detectSimpleIntent(input: string): TIGIntent {
  const normalizedInput = normalizeSearchInput(input);

  if (normalizedInput.includes("pray")) return "seeking_prayer" as TIGIntent;
  if (
    normalizedInput.includes("purpose") ||
    normalizedInput.includes("calling") ||
    normalizedInput.includes("called")
  ) {
    return "seeking_calling" as TIGIntent;
  }
  if (normalizedInput.includes("who am i") || normalizedInput.includes("identity")) {
    return "seeking_identity" as TIGIntent;
  }
  if (
    normalizedInput.includes("wisdom") ||
    normalizedInput.includes("decision") ||
    normalizedInput.includes("choose")
  ) {
    return "seeking_wisdom" as TIGIntent;
  }
  if (
    normalizedInput.includes("help") ||
    normalizedInput.includes("stuck") ||
    normalizedInput.includes("tired") ||
    normalizedInput.includes("discouraged") ||
    normalizedInput.includes("afraid")
  ) {
    return "seeking_encouragement" as TIGIntent;
  }

  return "seeking_scripture" as TIGIntent;
}

// Legacy helpers retained for compatibility. Main Promise Search uses resolveGraph().
export function detectEmotionMatches(input: string): EmotionProfileNode[] {
  const queryClient = createSeedTIGQueryClient();
  const normalizedInput = normalizeSearchInput(input);
  if (!normalizedInput) return [];

  const emotionNodes = queryClient.getNodesByType("EMOTION_PROFILE").filter(isEmotionProfileNode);
  const matches = emotionNodes.filter((emotion) => {
    const searchableEmotion = emotion as SearchableEmotionNode;
    const values = [
      emotion.emotionKey,
      searchableEmotion.emotionName || "",
      searchableEmotion.emotionalState || "",
      emotion.title,
      ...emotion.tags,
      ...emotion.aliases,
      ...emotion.userPhrases,
      ...emotion.phraseMatchers
    ];

    return values.some((value) => {
      const normalizedValue = normalizeSearchInput(value);
      return Boolean(
        normalizedValue &&
          (normalizedInput.includes(normalizedValue) || normalizedValue.includes(normalizedInput))
      );
    });
  });

  return uniqueNodesById(matches);
}

export function getPromiseMatchesFromEmotions(
  emotions: EmotionProfileNode[]
): PromiseCategoryNode[] {
  const queryClient = createSeedTIGQueryClient();
  const promiseIds = uniqueStrings(
    emotions.flatMap((emotion) => {
      const searchableEmotion = emotion as SearchableEmotionNode;
      return [
        ...emotion.recommendedPromiseCategoryIds,
        ...(searchableEmotion.relatedPromises || []),
        ...(searchableEmotion.relatedPromiseIds || [])
      ].map(promiseKeyToId);
    })
  );

  return uniqueNodesById(
    promiseIds
      .map((id) => queryClient.getNodeById(id))
      .filter(isPromiseCategoryNode)
  );
}

export function getPromiseClustersFromPromises(
  promises: PromiseCategoryNode[]
): PromiseClusterNode[] {
  const queryClient = createSeedTIGQueryClient();
  const promiseIds = new Set(promises.map((promise) => promise.id));
  if (!promiseIds.size) return [];

  return uniqueNodesById(
    queryClient
      .getNodesByType("PROMISE_CLUSTER")
      .filter(isPromiseClusterNode)
      .filter((cluster) => cluster.categoryIds.some((categoryId) => promiseIds.has(categoryId)))
      .sort((a, b) => {
        if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
        return b.theologicalWeight - a.theologicalWeight;
      })
  );
}

export function getScripturesFromPromises(
  promises: PromiseCategoryNode[],
  clusters: PromiseClusterNode[] = []
): ScriptureNode[] {
  const queryClient = createSeedTIGQueryClient();
  const scriptureIds = uniqueStrings([
    ...promises.flatMap((promise) => {
      const searchablePromise = promise as SearchablePromiseNode;
      return [
        ...promise.anchorScriptureIds,
        ...(searchablePromise.relatedScriptures || []),
        ...(searchablePromise.coreScriptures || [])
      ];
    }),
    ...clusters.flatMap((cluster) => {
      const searchableCluster = cluster as SearchablePromiseClusterNode;
      return [
        ...cluster.anchorScriptureIds,
        ...(searchableCluster.scriptureIds || [])
      ];
    })
  ]);

  return uniqueNodesById(
    scriptureIds
      .map((id) => queryClient.getNodeById(id))
      .filter(isScriptureNode)
  );
}

export function getJourneysFromEmotionsAndPromises(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  clusters?: PromiseClusterNode[];
}): JourneyNode[] {
  const queryClient = createSeedTIGQueryClient();
  const journeyIds = uniqueStrings([
    ...params.emotions.flatMap((emotion) => {
      const searchableEmotion = emotion as SearchableEmotionNode;
      return [
        ...(searchableEmotion.relatedJourneys || []),
        ...(searchableEmotion.relatedJourneyIds || [])
      ].map(journeyKeyToId);
    }),
    ...params.promises.flatMap((promise) => {
      const searchablePromise = promise as SearchablePromiseNode;
      return (searchablePromise.relatedJourneys || []).map(journeyKeyToId);
    }),
    ...(params.clusters || []).flatMap((cluster) => {
      const searchableCluster = cluster as SearchablePromiseClusterNode;
      return (searchableCluster.journeyIds || []).map(journeyKeyToId);
    })
  ]);

  return uniqueNodesById(
    journeyIds
      .map((id) => queryClient.getNodeById(id))
      .filter(isJourneyNode)
      .sort((a, b) => {
        if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
        return b.theologicalWeight - a.theologicalWeight;
      })
  );
}

export function getWordsFromMatches(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  clusters: PromiseClusterNode[];
  scriptures: ScriptureNode[];
  journeys: JourneyNode[];
}): TeoyubeWordNode[] {
  const words = collectWordRefs(params)
    .flatMap((value) => {
      const word = resolveWordNode(value);
      return word ? [word] : [];
    })
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.confidenceScore - a.confidenceScore;
    });

  return uniqueNodesById(words);
}

export function getPrayerSequencesFromMatches(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  clusters: PromiseClusterNode[];
  journey?: JourneyNode;
}): PrayerSequenceNode[] {
  const queryClient = createSeedTIGQueryClient();
  const terms = collectMatchTerms(params);
  const allTerms = combineTermSets(terms.emotions, terms.promises, terms.words, terms.scriptures);

  return rankByOverlap(
    queryClient.getNodesByType("PRAYER_SEQUENCE").filter(isPrayerSequenceNode),
    allTerms,
    (sequence) => {
      const searchableSequence = sequence as SearchablePrayerSequenceNode;
      return [
        ...sequence.promiseCategoryIds,
        ...sequence.anchorScriptureIds,
        ...(searchableSequence.relatedEmotions || []),
        ...(searchableSequence.relatedPromises || []),
        ...(searchableSequence.relatedWords || []),
        ...(searchableSequence.relatedScriptures || [])
      ];
    }
  );
}

export function getReflectionPromptsFromMatches(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  clusters: PromiseClusterNode[];
  journey?: JourneyNode;
}): ReflectionPromptNode[] {
  const queryClient = createSeedTIGQueryClient();
  const terms = collectMatchTerms(params);
  const allTerms = combineTermSets(terms.emotions, terms.promises, terms.words, terms.journeys);

  return rankByOverlap(
    queryClient.getNodesByType("REFLECTION_PROMPT").filter(isReflectionPromptNode),
    allTerms,
    (prompt) => {
      const searchablePrompt = prompt as SearchableReflectionPromptNode;
      return [
        ...prompt.emotionIds,
        ...prompt.journeyIds,
        ...(searchablePrompt.relatedEmotions || []),
        ...(searchablePrompt.relatedPromises || []),
        ...(searchablePrompt.relatedJourneys || []),
        ...(searchablePrompt.relatedWords || [])
      ];
    }
  );
}

export function getActionStepsFromMatches(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  clusters: PromiseClusterNode[];
  journey?: JourneyNode;
}): ActionStepNode[] {
  const queryClient = createSeedTIGQueryClient();
  const terms = collectMatchTerms(params);
  const allTerms = combineTermSets(terms.emotions, terms.promises, terms.journeys, terms.callings);

  return rankByOverlap(
    queryClient.getNodesByType("ACTION_STEP").filter(isActionStepNode),
    allTerms,
    (actionStep) => {
      const searchableActionStep = actionStep as SearchableActionStepNode;
      return [
        ...actionStep.promiseCategoryIds,
        ...(searchableActionStep.relatedEmotions || []),
        ...(searchableActionStep.relatedPromises || []),
        ...(searchableActionStep.relatedJourneys || []),
        ...(searchableActionStep.relatedCallings || [])
      ];
    }
  );
}

export function buildPromiseSearchConfidence(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  scriptures: ScriptureNode[];
  journeys: JourneyNode[];
  clusters?: PromiseClusterNode[];
  prayerSequences?: PrayerSequenceNode[];
  reflectionPrompts?: ReflectionPromptNode[];
  actionSteps?: ActionStepNode[];
}): TIGConfidenceScore {
  const hasJourneySupport =
    params.journeys.length ||
    (params.prayerSequences?.length || 0) ||
    (params.reflectionPrompts?.length || 0) ||
    (params.actionSteps?.length || 0);

  return buildTIGConfidenceScore({
    intentConfidence: 0.7,
    emotionConfidence: params.emotions.length ? 0.85 : 0.25,
    promiseConfidence: params.clusters?.length ? 0.9 : params.promises.length ? 0.85 : 0.25,
    scriptureConfidence: params.scriptures.length ? 0.95 : 0,
    callingConfidence: 0.25,
    journeyConfidence: hasJourneySupport ? 0.82 : 0.25,
    explanation:
      "Promise Search confidence was calculated from emotion matches, promise categories, promise clusters, Scripture anchors, and growth support nodes."
  });
}

function getFallbackScriptures(): ScriptureNode[] {
  const queryClient = createSeedTIGQueryClient();
  const firstScripture = queryClient.getNodesByType("SCRIPTURE").find(isScriptureNode);
  return firstScripture ? [firstScripture] : [];
}

function buildPrayerFromSequence(sequence: PrayerSequenceNode | undefined): string {
  if (!sequence) return DEFAULT_PRAYER;

  const searchableSequence = sequence as SearchablePrayerSequenceNode;
  const sections = [
    searchableSequence.opening,
    searchableSequence.scriptureAnchor,
    searchableSequence.confession,
    searchableSequence.petition,
    searchableSequence.declaration,
    searchableSequence.surrender,
    searchableSequence.thanksgiving,
    searchableSequence.closing || sequence.closingDeclaration
  ].filter(hasText);

  if (sections.length) return sections.join("\n\n");
  if (sequence.steps.length) return sequence.steps.join("\n\n");
  return DEFAULT_PRAYER;
}

function buildPromiseSearchMessage(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  clusters: PromiseClusterNode[];
}): string {
  if (!params.emotions.length) {
    return "Teoyube searched for Scripture-backed promises connected to your request. These passages can serve as an anchor for prayer, reflection, and faithful action.";
  }

  const emotionNames = params.emotions.map(getEmotionDisplayName).join(", ");
  const promisePatternNames = (
    params.clusters.length
      ? params.clusters.map(getPromiseClusterDisplayName)
      : params.promises.map(getPromiseDisplayName)
  ).slice(0, 3);
  const promisePattern =
    promisePatternNames.length > 0 ? promisePatternNames.join(", ") : "Scripture-backed promise";

  return `From what you shared, Teoyube detected a spiritual state connected to ${emotionNames}. The strongest Scripture-backed promise pattern is ${promisePattern}. These Scriptures anchor the response and can guide your next step.`;
}

function getReflectionPromptText(prompt: ReflectionPromptNode | undefined): string {
  return prompt?.prompt || DEFAULT_REFLECTION_PROMPT;
}

function getActionStepText(actionStep: ActionStepNode | undefined): string {
  const searchableActionStep = actionStep as SearchableActionStepNode | undefined;
  return searchableActionStep?.actionText || actionStep?.action || DEFAULT_ACTION_STEP;
}

export function searchPromises(request: TIGAIRequest): TIGAIResponse {
  const promiseSearchRequest: TIGAIRequest = {
    ...request,
    mode: "promise_search"
  };
  const result = resolveGraph(promiseSearchRequest);

  return buildPromiseSearchResponse(promiseSearchRequest, result);
}
