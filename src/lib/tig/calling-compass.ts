import type {
  ActionStepNode,
  CallingProfileNode,
  GrowthMilestoneNode,
  JourneyNode,
  PrayerSequenceNode,
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
import { buildCallingCompassResponse } from "./response-builder";

type SearchableCallingNode = CallingProfileNode & {
  callingName?: string;
  archetype?: string;
  relatedScriptures?: string[];
  relatedJourneys?: string[];
  relatedWords?: string[];
  relatedActionSteps?: string[];
};

type SearchableJourneyNode = JourneyNode & {
  journeyName?: string;
  relatedCallings?: string[];
  relatedWords?: string[];
  relatedMilestones?: string[];
};

type SearchablePrayerSequenceNode = PrayerSequenceNode & {
  relatedCallings?: string[];
  relatedWords?: string[];
};

type SearchableReflectionPromptNode = ReflectionPromptNode & {
  promptType?: string;
  relatedJourneys?: string[];
  relatedWords?: string[];
};

type SearchableActionStepNode = ActionStepNode & {
  actionText?: string;
  relatedCallings?: string[];
  relatedJourneys?: string[];
};

type SearchableGrowthMilestoneNode = GrowthMilestoneNode & {
  milestoneName?: string;
  journeyId?: string;
  requiredActions?: string[];
};

type CallingCompassResponse = Omit<
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
  detectedEmotions: [];
  detectedPromiseCategories: [];
  detectedCallingProfiles: CallingProfileNode[];
  scriptures: ScriptureNode[];
  teoyubeWords: string[];
  reflectionPrompt: string;
  actionStep: string;
  confidence: TIGConfidenceScore;
};

type ScoredNode<TNode> = {
  node: TNode;
  score: number;
};

const DEFAULT_PRAYER =
  "Father, reveal the calling You are forming in me. Help me recognize the gifts, burdens, and opportunities You have placed in my life, and give me courage to obey one step at a time.";
const DEFAULT_REFLECTION_PROMPT =
  "What repeated desire, gift, burden, or opportunity might God be using to shape my calling?";
const DEFAULT_ACTION_STEP =
  "Write down three things you consistently care about, three ways you naturally help others, and one faithful step you can take this week.";

function isCallingProfileNode(node: unknown): node is CallingProfileNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "CALLING_PROFILE");
}

function isScriptureNode(node: unknown): node is ScriptureNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "SCRIPTURE");
}

function isJourneyNode(node: unknown): node is JourneyNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "JOURNEY");
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

function normalizeComparable(value: string): string {
  return normalizeCallingInput(value).replaceAll("-", "_");
}

function stripKnownPrefix(value: string): string {
  return value.replace(/^(action|calling|journey|milestone|word)_/, "");
}

function getComparableValues(value: string): string[] {
  const normalized = normalizeComparable(value);
  const stripped = stripKnownPrefix(normalized);

  return uniqueStrings([
    normalized,
    stripped,
    stripped.replaceAll("_", "-"),
    `action_${stripped}`,
    `calling_${stripped}`,
    `journey_${stripped}`,
    `milestone_${stripped}`,
    `word_${stripped}`
  ]);
}

function countOverlap(left: string[], right: string[]): number {
  const rightValues = new Set(right.flatMap(getComparableValues));
  return left.reduce((total, value) => {
    return getComparableValues(value).some((candidate) => rightValues.has(candidate))
      ? total + 1
      : total;
  }, 0);
}

function sortScoredNodes<TNode extends { confidenceScore: number; theologicalWeight: number }>(
  nodes: ScoredNode<TNode>[]
): TNode[] {
  return nodes
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

function wordKeyToId(key: string): string {
  const normalizedKey = normalizeComparable(key);
  return normalizedKey.startsWith("word_") ? normalizedKey : `word_${normalizedKey}`;
}

function journeyKeyToId(key: string): string {
  const normalizedKey = normalizeComparable(key);
  return normalizedKey.startsWith("journey_") ? normalizedKey : `journey_${normalizedKey}`;
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

function getCallingDisplayName(calling?: CallingProfileNode): string {
  if (!calling) return "Calling";
  const searchableCalling = calling as SearchableCallingNode;
  return searchableCalling.callingName || calling.title || calling.callingKey;
}

function getJourneyDisplayName(journey?: JourneyNode): string {
  if (!journey) return "";
  const searchableJourney = journey as SearchableJourneyNode;
  return searchableJourney.journeyName || journey.title || journey.journeyKey;
}

function getWordLabel(word: TeoyubeWordNode): string {
  return word.slug || word.word || word.title || word.id;
}

export function normalizeCallingInput(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function detectCallingIntent(input: string): TIGIntent {
  const normalizedInput = normalizeCallingInput(input);
  const callingTerms = [
    "purpose",
    "calling",
    "called",
    "gift",
    "gifts",
    "mission",
    "serve",
    "lead",
    "teach",
    "build",
    "create",
    "watch"
  ];

  if (callingTerms.some((term) => normalizedInput.includes(term))) {
    return "seeking_calling" as TIGIntent;
  }

  return "seeking_guidance" as TIGIntent;
}

// Legacy helpers retained for compatibility. Main Calling Compass uses resolveGraph().
export function detectCallingMatches(input: string): CallingProfileNode[] {
  const queryClient = createSeedTIGQueryClient();
  const normalizedInput = normalizeCallingInput(input);
  if (!normalizedInput) return [];

  const callings = queryClient.getNodesByType("CALLING_PROFILE").filter(isCallingProfileNode);
  const matches = callings.map((calling) => {
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
      ...calling.biblicalExamples,
      ...calling.growthPath
    ];
    const score = values.reduce((total, value) => {
      const normalizedValue = normalizeCallingInput(value);
      return normalizedValue &&
        (normalizedInput.includes(normalizedValue) || normalizedValue.includes(normalizedInput))
        ? total + 1
        : total;
    }, 0);

    return { node: calling, score };
  });

  return uniqueNodesById(sortScoredNodes(matches));
}

export function getScripturesFromCallings(callings: CallingProfileNode[]): ScriptureNode[] {
  const queryClient = createSeedTIGQueryClient();
  const scriptureIds = uniqueStrings(
    callings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return [
        ...(searchableCalling.relatedScriptures || []),
        ...calling.anchorScriptureIds
      ];
    })
  );

  return uniqueNodesById(
    scriptureIds
      .map((id) => queryClient.getNodeById(id))
      .filter(isScriptureNode)
  );
}

export function getJourneysFromCallings(callings: CallingProfileNode[]): JourneyNode[] {
  const queryClient = createSeedTIGQueryClient();
  const callingValues = uniqueStrings(
    callings.flatMap((calling) => [
      calling.id,
      calling.callingKey,
      calling.title,
      ...(calling as SearchableCallingNode).callingName ? [(calling as SearchableCallingNode).callingName || ""] : []
    ])
  );
  const directJourneyIds = uniqueStrings(
    callings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return (searchableCalling.relatedJourneys || []).map(journeyKeyToId);
    })
  );
  const directMatches = directJourneyIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isJourneyNode);
  const overlapMatches = queryClient
    .getNodesByType("JOURNEY")
    .filter(isJourneyNode)
    .map((journey) => {
      const searchableJourney = journey as SearchableJourneyNode;
      const values = [
        ...journey.relatedCallingIds,
        ...(searchableJourney.relatedCallings || [])
      ];

      return {
        node: journey,
        score: countOverlap(values, callingValues)
      };
    });

  return uniqueNodesById([...directMatches, ...sortScoredNodes(overlapMatches)]).sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return b.theologicalWeight - a.theologicalWeight;
  });
}

export function getWordsFromCallings(callings: CallingProfileNode[]): TeoyubeWordNode[] {
  const wordRefs = uniqueStrings(
    callings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return searchableCalling.relatedWords || [];
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

export function getPrayerSequencesFromCallings(callings: CallingProfileNode[]): PrayerSequenceNode[] {
  const queryClient = createSeedTIGQueryClient();
  const callingValues = uniqueStrings(
    callings.flatMap((calling) => [
      calling.id,
      calling.callingKey,
      calling.title,
      ...(calling as SearchableCallingNode).callingName ? [(calling as SearchableCallingNode).callingName || ""] : []
    ])
  );

  return uniqueNodesById(
    sortScoredNodes(
      queryClient
        .getNodesByType("PRAYER_SEQUENCE")
        .filter(isPrayerSequenceNode)
        .map((sequence) => {
          const searchableSequence = sequence as SearchablePrayerSequenceNode;
          return {
            node: sequence,
            score: countOverlap(searchableSequence.relatedCallings || [], callingValues)
          };
        })
    )
  );
}

export function getReflectionPromptsFromCallings(
  callings: CallingProfileNode[]
): ReflectionPromptNode[] {
  const queryClient = createSeedTIGQueryClient();
  const callingData = uniqueStrings(
    callings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return [
        calling.id,
        calling.callingKey,
        calling.title,
        searchableCalling.callingName || "",
        ...(searchableCalling.relatedWords || []),
        ...(searchableCalling.relatedJourneys || []),
        ...calling.gifts,
        ...calling.strengths,
        ...calling.growthPath
      ];
    })
  );

  return uniqueNodesById(
    sortScoredNodes(
      queryClient
        .getNodesByType("REFLECTION_PROMPT")
        .filter(isReflectionPromptNode)
        .map((prompt) => {
          const searchablePrompt = prompt as SearchableReflectionPromptNode;
          const promptValues = [
            ...(searchablePrompt.relatedWords || []),
            ...(searchablePrompt.relatedJourneys || []),
            ...prompt.journeyIds,
            ...prompt.tags,
            ...prompt.aliases
          ];
          const promptTypeBonus = searchablePrompt.promptType === "calling" ? 2 : 0;

          return {
            node: prompt,
            score: countOverlap(promptValues, callingData) + promptTypeBonus
          };
        })
    )
  );
}

export function getActionStepsFromCallings(callings: CallingProfileNode[]): ActionStepNode[] {
  const queryClient = createSeedTIGQueryClient();
  const callingValues = uniqueStrings(
    callings.flatMap((calling) => [
      calling.id,
      calling.callingKey,
      calling.title,
      ...(calling as SearchableCallingNode).callingName ? [(calling as SearchableCallingNode).callingName || ""] : []
    ])
  );
  const directActionIds = uniqueStrings(
    callings.flatMap((calling) => {
      const searchableCalling = calling as SearchableCallingNode;
      return searchableCalling.relatedActionSteps || [];
    })
  );
  const directMatches = directActionIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isActionStepNode);
  const overlapMatches = sortScoredNodes(
    queryClient
      .getNodesByType("ACTION_STEP")
      .filter(isActionStepNode)
      .map((actionStep) => {
        const searchableActionStep = actionStep as SearchableActionStepNode;
        return {
          node: actionStep,
          score: countOverlap(searchableActionStep.relatedCallings || [], callingValues)
        };
      })
  );

  return uniqueNodesById([...directMatches, ...overlapMatches]).sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return b.theologicalWeight - a.theologicalWeight;
  });
}

export function getGrowthMilestonesFromCallings(params: {
  callings: CallingProfileNode[];
  journeys: JourneyNode[];
  actions: ActionStepNode[];
}): GrowthMilestoneNode[] {
  const queryClient = createSeedTIGQueryClient();
  const journeyIds = new Set(params.journeys.map((journey) => journey.id));
  const actionIds = new Set(params.actions.map((action) => action.id));

  return uniqueNodesById(
    queryClient
      .getNodesByType("GROWTH_MILESTONE")
      .filter(isGrowthMilestoneNode)
      .filter((milestone) => {
        const searchableMilestone = milestone as SearchableGrowthMilestoneNode;
        const journeyMatch = Boolean(
          searchableMilestone.journeyId && journeyIds.has(searchableMilestone.journeyId)
        );
        const actionMatch = [
          ...milestone.unlocksActionStepIds,
          ...(searchableMilestone.requiredActions || [])
        ].some((actionId) => actionIds.has(actionId));

        return journeyMatch || actionMatch;
      })
      .sort((a, b) => {
        if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
        return b.theologicalWeight - a.theologicalWeight;
      })
  );
}

export function buildCallingCompassConfidence(params: {
  callings: CallingProfileNode[];
  scriptures: ScriptureNode[];
  journeys: JourneyNode[];
  words?: TeoyubeWordNode[];
  prayerSequences?: PrayerSequenceNode[];
  reflectionPrompts?: ReflectionPromptNode[];
  actionSteps?: ActionStepNode[];
  growthMilestones?: GrowthMilestoneNode[];
}): TIGConfidenceScore {
  const graphSupportCount =
    (params.words?.length || 0) +
    (params.prayerSequences?.length || 0) +
    (params.reflectionPrompts?.length || 0) +
    (params.actionSteps?.length || 0) +
    (params.growthMilestones?.length || 0);

  return buildTIGConfidenceScore({
    intentConfidence: 0.75,
    emotionConfidence: 0.2,
    promiseConfidence: 0.45,
    scriptureConfidence: params.scriptures.length ? 0.95 : 0,
    callingConfidence: params.callings.length ? (graphSupportCount ? 0.92 : 0.9) : 0.25,
    journeyConfidence: params.journeys.length ? 0.82 : 0.25,
    explanation:
      "Calling Compass confidence was calculated from calling matches, Scripture anchors, journeys, Teoyube words, prayer, reflection, action, and milestone support."
  });
}

function getFallbackScriptures(): ScriptureNode[] {
  const queryClient = createSeedTIGQueryClient();
  const firstScripture = queryClient.getNodesByType("SCRIPTURE").find(isScriptureNode);
  return firstScripture ? [firstScripture] : [];
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

function buildCallingMessage(params: {
  calling?: CallingProfileNode;
  journey?: JourneyNode;
}): string {
  if (!params.calling) {
    return "Teoyube detected calling-related language in what you shared. These Scripture connections can help you begin discerning the pattern of gifts, burdens, and faithful steps in your life.";
  }

  const journeySentence = params.journey
    ? ` The recommended journey is ${getJourneyDisplayName(params.journey)}.`
    : "";

  return `Teoyube detected calling-related language in what you shared. The strongest calling pattern is ${getCallingDisplayName(params.calling)}. This should be tested through Scripture, prayer, repeated gifts, burdens, opportunities, and faithful obedience.${journeySentence}`;
}

function buildCallingGraphTrace(params: {
  calling?: CallingProfileNode;
  scriptures: ScriptureNode[];
  journey?: JourneyNode;
  words: TeoyubeWordNode[];
  prayerSequence?: PrayerSequenceNode;
  reflectionPrompt?: ReflectionPromptNode;
  actionStep?: ActionStepNode;
  milestone?: GrowthMilestoneNode;
  confidence: TIGConfidenceScore;
}): TIGTraversalPath[] {
  const nodes = uniqueStrings([
    params.calling?.id || "",
    ...params.scriptures.map((scripture) => scripture.id),
    params.journey?.id || "",
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
      depth: params.calling ? 1 : 0,
      score: params.confidence.overall,
      reasons: uniqueStrings([
        params.calling ? `selectedCalling:${params.calling.id}` : "",
        ...params.scriptures.map((scripture) => `scripture:${scripture.id}`),
        params.journey ? `journey:${params.journey.id}` : "",
        ...params.words.map((word) => `word:${word.id}`),
        params.prayerSequence ? `prayer:${params.prayerSequence.id}` : "",
        params.reflectionPrompt ? `reflection:${params.reflectionPrompt.id}` : "",
        params.actionStep ? `action:${params.actionStep.id}` : "",
        params.milestone ? `milestone:${params.milestone.id}` : ""
      ])
    }
  ];
}

export function runCallingCompass(request: TIGAIRequest): TIGAIResponse {
  const callingRequest: TIGAIRequest = {
    ...request,
    mode: "calling_compass"
  };
  const result = resolveGraph(callingRequest);

  return buildCallingCompassResponse(callingRequest, result);
}
