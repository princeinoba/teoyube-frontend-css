import type {
  ActionStepNode,
  CallingProfileNode,
  EmotionProfileNode,
  GrowthMilestoneNode,
  JourneyNode,
  PrayerSequenceNode,
  PromiseCategoryNode,
  ReflectionPromptNode,
  ScriptureNode,
  TeoyubeWordNode,
  TIGAIRequest,
  TIGAIResponse,
  TIGConfidenceScore,
  TIGIntent,
  TIGTraversalPath
} from "./types";
import { buildTIGConfidenceScore } from "./confidence";
import { resolveGraph } from "./graph-engine";
import { formatPrayerSequence } from "./prayer-generator";
import { createSeedTIGQueryClient } from "./query";
import { buildJourneyResponse } from "./response-builder";

type SearchableJourneyStage = JourneyNode["stages"][number] & {
  description?: string;
  promiseIds?: string[];
  wordIds?: string[];
  prayerSequenceIds?: string[];
};

type SearchableJourneyNode = Omit<JourneyNode, "stages"> & {
  journeyName?: string;
  startState?: string;
  endState?: string;
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
};

type SearchableReflectionPromptNode = ReflectionPromptNode & {
  relatedJourneys?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedWords?: string[];
};

type SearchableActionStepNode = ActionStepNode & {
  actionText?: string;
  relatedJourneys?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
};

type SearchableGrowthMilestoneNode = GrowthMilestoneNode & {
  milestoneName?: string;
  journeyId?: string;
  stageId?: string;
  relatedJourneys?: string[];
};

type JourneyEngineResponse = Omit<
  TIGAIResponse,
  | "detectedIntent"
  | "detectedEmotions"
  | "detectedPromiseCategories"
  | "detectedCallingProfiles"
  | "teoyubeWords"
  | "reflectionPrompt"
  | "actionStep"
> & {
  detectedIntent: TIGIntent;
  detectedEmotions: EmotionProfileNode[];
  detectedPromiseCategories: PromiseCategoryNode[];
  detectedCallingProfiles: CallingProfileNode[];
  scriptures: ScriptureNode[];
  teoyubeWords: string[];
  reflectionPrompt: string;
  actionStep: string;
  confidence: TIGConfidenceScore;
};

const DEFAULT_AI_MESSAGE =
  "Teoyube detected that you may be in a growth season. This journey connects your current state to Scripture, promises, reflection, and one faithful next step.";
const DEFAULT_PRAYER =
  "Father, guide me through this journey with patience, wisdom, and courage. Help me walk faithfully through each stage and trust Your Word as my anchor.";
const DEFAULT_REFLECTION_PROMPT =
  "What stage of this journey best describes where I am right now?";
const DEFAULT_ACTION_STEP =
  "Choose the first stage of this journey and complete one small action connected to it today.";

function isJourneyNode(node: unknown): node is JourneyNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "JOURNEY");
}

function isScriptureNode(node: unknown): node is ScriptureNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "SCRIPTURE");
}

function isEmotionProfileNode(node: unknown): node is EmotionProfileNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "EMOTION_PROFILE");
}

function isPromiseCategoryNode(node: unknown): node is PromiseCategoryNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "PROMISE_CATEGORY");
}

function isCallingProfileNode(node: unknown): node is CallingProfileNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "CALLING_PROFILE");
}

function isTeoyubeWordNode(node: unknown): node is TeoyubeWordNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "TEOYUBE_WORD");
}

function isPrayerSequenceNode(node: unknown): node is PrayerSequenceNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "PRAYER_SEQUENCE");
}

function isReflectionPromptNode(node: unknown): node is ReflectionPromptNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "REFLECTION_PROMPT");
}

function isActionStepNode(node: unknown): node is ActionStepNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "ACTION_STEP");
}

function isGrowthMilestoneNode(node: unknown): node is GrowthMilestoneNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "GROWTH_MILESTONE");
}

function uniqueNodesById<TNode extends { id: string }>(nodes: TNode[]): TNode[] {
  return [...new Map(nodes.map((node) => [node.id, node])).values()];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function emotionKeyToId(key: string): string {
  return key.startsWith("emotion_") ? key : `emotion_${key}`;
}

function promiseKeyToId(key: string): string {
  return key.startsWith("promise_") ? key : `promise_${key}`;
}

function callingKeyToId(key: string): string {
  return key.startsWith("calling_") ? key : `calling_${key}`;
}

function wordKeyToId(key: string): string {
  return key.startsWith("word_") ? key : `word_${key.replaceAll("-", "_")}`;
}

function normalizeComparable(value: string): string {
  return normalizeJourneyInput(value).replaceAll("-", "_");
}

function stripKnownPrefix(value: string): string {
  return value.replace(/^(calling|emotion|journey|promise|scripture|word)_/, "");
}

function getComparableValues(value: string): string[] {
  const normalized = normalizeComparable(value);
  const stripped = stripKnownPrefix(normalized);

  return uniqueStrings([
    normalized,
    stripped,
    stripped.replaceAll("_", "-"),
    `calling_${stripped}`,
    `emotion_${stripped}`,
    `journey_${stripped}`,
    `promise_${stripped}`,
    `scripture_${stripped}`,
    `word_${stripped}`
  ]);
}

function hasOverlap(left: string[], right: string[]): boolean {
  const rightValues = new Set(right.flatMap(getComparableValues));
  return left.some((value) => getComparableValues(value).some((candidate) => rightValues.has(candidate)));
}

function getJourneyDisplayName(journey?: JourneyNode): string {
  if (!journey) return "Growth Journey";
  const searchableJourney = journey as SearchableJourneyNode;
  return searchableJourney.journeyName || journey.title || journey.journeyKey;
}

function getMilestoneDisplayName(milestone?: GrowthMilestoneNode): string {
  if (!milestone) return "";
  const searchableMilestone = milestone as SearchableGrowthMilestoneNode;
  return searchableMilestone.milestoneName || milestone.title || milestone.milestoneKey;
}

function resolveWordNode(value: string): TeoyubeWordNode | undefined {
  const queryClient = createSeedTIGQueryClient();
  const normalizedValue = normalizeComparable(value);
  const candidateIds = uniqueStrings([normalizedValue, wordKeyToId(normalizedValue)]);

  for (const candidateId of candidateIds) {
    const node = queryClient.getNodeById(candidateId);
    if (isTeoyubeWordNode(node)) return node;
  }

  const slugMatch = queryClient.getNodeBySlug(normalizedValue.replaceAll("_", "-"));
  if (isTeoyubeWordNode(slugMatch)) return slugMatch;

  return queryClient
    .getNodesByType("TEOYUBE_WORD")
    .filter(isTeoyubeWordNode)
    .find((word) => normalizeComparable(word.word) === normalizedValue);
}

export function normalizeJourneyInput(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function detectJourneyIntent(input: string): TIGIntent {
  const normalizedInput = normalizeJourneyInput(input);

  if (
    normalizedInput.includes("journey") ||
    normalizedInput.includes("grow") ||
    normalizedInput.includes("growth") ||
    normalizedInput.includes("path") ||
    normalizedInput.includes("process") ||
    normalizedInput.includes("season") ||
    normalizedInput.includes("next step") ||
    normalizedInput.includes("what should i do")
  ) {
    return "seeking_guidance" as TIGIntent;
  }
  if (
    normalizedInput.includes("purpose") ||
    normalizedInput.includes("calling") ||
    normalizedInput.includes("called")
  ) {
    return "seeking_calling" as TIGIntent;
  }
  if (normalizedInput.includes("pray")) return "seeking_prayer" as TIGIntent;

  return "seeking_encouragement" as TIGIntent;
}

// Legacy helpers retained for compatibility. Main Journey Engine uses resolveGraph().
export function detectJourneyMatches(input: string): JourneyNode[] {
  const queryClient = createSeedTIGQueryClient();
  const normalizedInput = normalizeJourneyInput(input);
  if (!normalizedInput) return [];

  const journeys = queryClient.getNodesByType("JOURNEY").filter(isJourneyNode);
  const matches = journeys.filter((journey) => {
    const searchableJourney = journey as SearchableJourneyNode;
    const values = [
      journey.journeyKey,
      searchableJourney.journeyName || "",
      searchableJourney.startState || journey.fromState,
      searchableJourney.endState || journey.toState,
      journey.title,
      journey.description,
      ...journey.tags,
      ...journey.aliases,
      ...(searchableJourney.relatedEmotions || journey.relatedEmotionIds),
      ...(searchableJourney.relatedPromises || journey.relatedPromiseCategoryIds),
      ...(searchableJourney.relatedCallings || journey.relatedCallingIds),
      ...(searchableJourney.relatedWords || journey.relatedTeoyubeWordIds),
      ...searchableJourney.stages.flatMap((stage) => [
        stage.title,
        stage.description || stage.summary,
        ...(stage.wordIds || []),
        ...stage.reflectionPromptIds,
        ...stage.actionStepIds,
        ...stage.milestoneIds,
        ...(stage.prayerSequenceIds || [])
      ])
    ];

    return values.some((value) => {
      const normalizedValue = normalizeJourneyInput(value);
      return normalizedInput.includes(normalizedValue) || normalizedValue.includes(normalizedInput);
    });
  });

  return uniqueNodesById(matches);
}

export function getScripturesFromJourneys(journeys: JourneyNode[]): ScriptureNode[] {
  const queryClient = createSeedTIGQueryClient();
  const scriptureIds = uniqueStrings(
    journeys.flatMap((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      return [
        ...(searchableJourney.relatedScriptures || journey.relatedScriptureIds),
        ...searchableJourney.stages.flatMap((stage) => stage.scriptureIds)
      ];
    })
  );

  return uniqueNodesById(
    scriptureIds
      .map((id) => queryClient.getNodeById(id))
      .filter(isScriptureNode)
  );
}

export function getWordsFromJourneys(journeys: JourneyNode[]): TeoyubeWordNode[] {
  const wordRefs = uniqueStrings(
    journeys.flatMap((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      return [
        ...(searchableJourney.relatedWords || journey.relatedTeoyubeWordIds),
        ...searchableJourney.stages.flatMap((stage) => stage.wordIds || [])
      ];
    })
  );

  return uniqueNodesById(
    wordRefs
      .map(resolveWordNode)
      .filter(isTeoyubeWordNode)
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return b.confidenceScore - a.confidenceScore;
      })
  );
}

export function getPrayerSequencesFromJourneys(journeys: JourneyNode[]): PrayerSequenceNode[] {
  const queryClient = createSeedTIGQueryClient();
  const directPrayerIds = uniqueStrings(
    journeys.flatMap((journey) =>
      (journey as SearchableJourneyNode).stages.flatMap((stage) => stage.prayerSequenceIds || [])
    )
  );
  const journeyValues = uniqueStrings(
    journeys.flatMap((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      return [
        ...journey.relatedScriptureIds,
        ...journey.relatedPromiseCategoryIds,
        ...journey.relatedEmotionIds,
        ...journey.relatedCallingIds,
        ...(searchableJourney.relatedScriptures || []),
        ...(searchableJourney.relatedPromises || []),
        ...(searchableJourney.relatedEmotions || []),
        ...(searchableJourney.relatedCallings || [])
      ];
    })
  );
  const directMatches = directPrayerIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isPrayerSequenceNode);
  const overlapMatches = queryClient
    .getNodesByType("PRAYER_SEQUENCE")
    .filter(isPrayerSequenceNode)
    .filter((sequence) => {
      const searchableSequence = sequence as SearchablePrayerSequenceNode;
      const sequenceValues = [
        ...sequence.anchorScriptureIds,
        ...sequence.promiseCategoryIds,
        ...(searchableSequence.relatedScriptures || []),
        ...(searchableSequence.relatedPromises || []),
        ...(searchableSequence.relatedEmotions || []),
        ...(searchableSequence.relatedCallings || [])
      ];

      return hasOverlap(sequenceValues, journeyValues);
    });

  return uniqueNodesById([...directMatches, ...overlapMatches]).sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return b.theologicalWeight - a.theologicalWeight;
  });
}

export function getReflectionPromptsFromJourneys(journeys: JourneyNode[]): ReflectionPromptNode[] {
  const queryClient = createSeedTIGQueryClient();
  const journeyIds = uniqueStrings(journeys.flatMap((journey) => [journey.id, journey.journeyKey]));
  const directPromptIds = uniqueStrings(
    journeys.flatMap((journey) =>
      (journey as SearchableJourneyNode).stages.flatMap((stage) => stage.reflectionPromptIds)
    )
  );
  const directMatches = directPromptIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isReflectionPromptNode);
  const journeyMatches = queryClient
    .getNodesByType("REFLECTION_PROMPT")
    .filter(isReflectionPromptNode)
    .filter((prompt) => {
      const searchablePrompt = prompt as SearchableReflectionPromptNode;
      return hasOverlap([...prompt.journeyIds, ...(searchablePrompt.relatedJourneys || [])], journeyIds);
    });

  return uniqueNodesById([...directMatches, ...journeyMatches]).sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return b.theologicalWeight - a.theologicalWeight;
  });
}

export function getActionStepsFromJourneys(journeys: JourneyNode[]): ActionStepNode[] {
  const queryClient = createSeedTIGQueryClient();
  const journeyIds = uniqueStrings(journeys.flatMap((journey) => [journey.id, journey.journeyKey]));
  const directActionIds = uniqueStrings(
    journeys.flatMap((journey) =>
      (journey as SearchableJourneyNode).stages.flatMap((stage) => stage.actionStepIds)
    )
  );
  const directMatches = directActionIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isActionStepNode);
  const journeyMatches = queryClient
    .getNodesByType("ACTION_STEP")
    .filter(isActionStepNode)
    .filter((actionStep) => {
      const searchableActionStep = actionStep as SearchableActionStepNode;
      return hasOverlap(searchableActionStep.relatedJourneys || [], journeyIds);
    });

  return uniqueNodesById([...directMatches, ...journeyMatches]).sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return b.theologicalWeight - a.theologicalWeight;
  });
}

export function getGrowthMilestonesFromJourneys(journeys: JourneyNode[]): GrowthMilestoneNode[] {
  const queryClient = createSeedTIGQueryClient();
  const journeyIds = new Set(journeys.map((journey) => journey.id));
  const milestoneIds = uniqueStrings(
    journeys.flatMap((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      return [
        ...journey.milestoneIds,
        ...(searchableJourney.relatedMilestones || []),
        ...searchableJourney.stages.flatMap((stage) => stage.milestoneIds)
      ];
    })
  );
  const directMatches = milestoneIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isGrowthMilestoneNode);
  const journeyMatches = queryClient
    .getNodesByType("GROWTH_MILESTONE")
    .filter(isGrowthMilestoneNode)
    .filter((milestone) => {
      const searchableMilestone = milestone as SearchableGrowthMilestoneNode;
      return Boolean(searchableMilestone.journeyId && journeyIds.has(searchableMilestone.journeyId));
    });

  return uniqueNodesById([...directMatches, ...journeyMatches]).sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return b.theologicalWeight - a.theologicalWeight;
  });
}

export function getPrimaryJourney(journeys: JourneyNode[]): JourneyNode | undefined {
  return [...journeys].sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return b.theologicalWeight - a.theologicalWeight;
  })[0];
}

export function buildJourneyConfidence(params: {
  journeys: JourneyNode[];
  scriptures: ScriptureNode[];
  words?: TeoyubeWordNode[];
  prayerSequences?: PrayerSequenceNode[];
  reflectionPrompts?: ReflectionPromptNode[];
  actionSteps?: ActionStepNode[];
  growthMilestones?: GrowthMilestoneNode[];
}): TIGConfidenceScore {
  const journeySupportCount =
    (params.words?.length || 0) +
    (params.prayerSequences?.length || 0) +
    (params.reflectionPrompts?.length || 0) +
    (params.actionSteps?.length || 0) +
    (params.growthMilestones?.length || 0);

  return buildTIGConfidenceScore({
    intentConfidence: 0.7,
    emotionConfidence: 0.35,
    promiseConfidence: 0.55,
    scriptureConfidence: params.scriptures.length ? 0.95 : 0,
    callingConfidence: 0.35,
    journeyConfidence: params.journeys.length ? (journeySupportCount ? 0.92 : 0.85) : 0.25,
    explanation:
      "Journey confidence was calculated from journey matches, Scripture anchors, Teoyube words, prayer sequences, reflection prompts, action steps, and growth milestones."
  });
}

function getFallbackScriptures(): ScriptureNode[] {
  const queryClient = createSeedTIGQueryClient();
  const firstScripture = queryClient.getNodesByType("SCRIPTURE").find(isScriptureNode);
  return firstScripture ? [firstScripture] : [];
}

function getRelatedEmotionsFromJourney(journey?: JourneyNode): EmotionProfileNode[] {
  if (!journey) return [];

  const queryClient = createSeedTIGQueryClient();
  const searchableJourney = journey as SearchableJourneyNode;
  const emotionIds = uniqueStrings(
    (searchableJourney.relatedEmotions || journey.relatedEmotionIds).map(emotionKeyToId)
  );

  return emotionIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isEmotionProfileNode);
}

function getRelatedPromisesFromJourney(journey?: JourneyNode): PromiseCategoryNode[] {
  if (!journey) return [];

  const queryClient = createSeedTIGQueryClient();
  const searchableJourney = journey as SearchableJourneyNode;
  const promiseIds = uniqueStrings(
    (searchableJourney.relatedPromises || journey.relatedPromiseCategoryIds).map(promiseKeyToId)
  );

  return promiseIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isPromiseCategoryNode);
}

function getRelatedCallingsFromJourney(journey?: JourneyNode): CallingProfileNode[] {
  if (!journey) return [];

  const queryClient = createSeedTIGQueryClient();
  const searchableJourney = journey as SearchableJourneyNode;
  const callingIds = uniqueStrings(
    (searchableJourney.relatedCallings || journey.relatedCallingIds).map(callingKeyToId)
  );

  return callingIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isCallingProfileNode);
}

function getWordLabel(word: TeoyubeWordNode): string {
  return word.slug || word.word || word.title || word.id;
}

function getPrayerText(sequence?: PrayerSequenceNode): string {
  return sequence ? formatPrayerSequence(sequence) || DEFAULT_PRAYER : DEFAULT_PRAYER;
}

function getReflectionPromptText(prompt?: ReflectionPromptNode): string {
  return prompt?.prompt || DEFAULT_REFLECTION_PROMPT;
}

function getActionStepText(actionStep?: ActionStepNode): string {
  const searchableActionStep = actionStep as SearchableActionStepNode | undefined;
  return searchableActionStep?.actionText || actionStep?.action || DEFAULT_ACTION_STEP;
}

function buildJourneyMessage(params: {
  journey?: JourneyNode;
  milestone?: GrowthMilestoneNode;
}): string {
  if (!params.journey) return DEFAULT_AI_MESSAGE;

  const milestoneMessage = params.milestone
    ? ` The next growth milestone is ${getMilestoneDisplayName(params.milestone)}.`
    : "";

  return `Teoyube detected that you may be in the ${getJourneyDisplayName(params.journey)} journey. This path connects your current season to Scripture, promise, reflection, prayer, and one faithful action step.${milestoneMessage}`;
}

function buildJourneyGraphTrace(params: {
  journey?: JourneyNode;
  scriptures: ScriptureNode[];
  words: TeoyubeWordNode[];
  prayerSequence?: PrayerSequenceNode;
  reflectionPrompt?: ReflectionPromptNode;
  actionStep?: ActionStepNode;
  milestone?: GrowthMilestoneNode;
  confidence: TIGConfidenceScore;
}): TIGTraversalPath[] {
  const nodes = uniqueStrings([
    params.journey?.id || "",
    ...params.scriptures.map((scripture) => scripture.id),
    ...params.words.map((word) => word.id),
    params.prayerSequence?.id || "",
    params.reflectionPrompt?.id || "",
    params.actionStep?.id || "",
    params.milestone?.id || ""
  ]);

  if (!nodes.length) return [];

  return [
    {
      nodes,
      relationships: [],
      depth: params.journey ? 1 : 0,
      score: params.confidence.overall,
      reasons: uniqueStrings([
        params.journey ? `selectedJourney:${params.journey.id}` : "",
        ...params.scriptures.map((scripture) => `scripture:${scripture.id}`),
        ...params.words.map((word) => `word:${word.id}`),
        params.prayerSequence ? `prayer:${params.prayerSequence.id}` : "",
        params.reflectionPrompt ? `reflection:${params.reflectionPrompt.id}` : "",
        params.actionStep ? `action:${params.actionStep.id}` : "",
        params.milestone ? `milestone:${params.milestone.id}` : ""
      ])
    }
  ];
}

export function runJourneyEngine(request: TIGAIRequest): TIGAIResponse {
  const journeyRequest: TIGAIRequest = {
    ...request,
    mode: "growth_journey"
  };
  const result = resolveGraph(journeyRequest);

  return buildJourneyResponse(journeyRequest, result);
}
