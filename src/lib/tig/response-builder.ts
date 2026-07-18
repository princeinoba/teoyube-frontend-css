import type {
  ActionStepNode,
  AnyTIGNode,
  GrowthMilestoneNode,
  JourneyNode,
  PrayerSequenceNode,
  ReflectionPromptNode,
  ScriptureNode,
  TIGAIRequest,
  TIGAIResponse,
  TIGConfidenceScore,
  TIGDecisionSummary,
  TIGDecisionSummaryItem,
  TIGTraversalPath
} from "./types";
import type { GraphResolutionResult } from "./graph-engine";
import { createScriptureAnchoredFallbackResponse, validateTIGAIResponse } from "./ai-interface";
import { buildTIGConfidenceScore } from "./confidence";
import { buildAIContext } from "./graph-engine";

type PrayerSequenceWithSections = PrayerSequenceNode & {
  opening?: string;
  scriptureAnchor?: string;
  confession?: string;
  petition?: string;
  declaration?: string;
  surrender?: string;
  thanksgiving?: string;
  closing?: string;
};

type ActionStepWithText = ActionStepNode & {
  actionText?: string;
};

type NamedJourneyNode = JourneyNode & {
  journeyName?: string;
};

type NamedGrowthMilestoneNode = GrowthMilestoneNode & {
  milestoneName?: string;
};

type TIGResponseText = {
  aiMessage: string;
  prayer: string;
  reflectionPrompt: string;
  actionStep: string;
};

type TIGResponseShape = Omit<
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
  detectedIntent: unknown;
  detectedEmotions: string[];
  detectedPromiseCategories: string[];
  detectedCallingProfiles: string[];
  scriptures: ScriptureNode[];
  teoyubeWords: string[];
  promiseClusters: string[];
  journey?: string;
  confidence: TIGConfidenceScore;
  reflectionPrompt: string;
  actionStep: string;
};

type ResponseGraphTracePath = TIGTraversalPath & {
  startNodeIds: string[];
  selectedNodeIds: string[];
  selectedRelationshipIds: string[];
  traversalDepth: number;
};

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(hasText))];
}

function getEmotionLabel(emotion: GraphResolutionResult["detectedEmotions"][number]): string {
  return emotion.emotionKey || emotion.title || emotion.slug || emotion.id;
}

function getPromiseLabel(promise: GraphResolutionResult["detectedPromises"][number]): string {
  return promise.categoryKey || promise.title || promise.slug || promise.id;
}

function getPromiseClusterLabel(
  cluster: GraphResolutionResult["detectedPromiseClusters"][number]
): string {
  const namedCluster = cluster as typeof cluster & {
    clusterKey?: string;
    clusterName?: string;
  };

  return namedCluster.clusterKey || namedCluster.clusterName || cluster.title || cluster.slug || cluster.id;
}

function getCallingLabel(calling: GraphResolutionResult["detectedCallings"][number]): string {
  const namedCalling = calling as typeof calling & {
    callingName?: string;
  };

  return namedCalling.callingName || calling.callingKey || calling.title || calling.slug || calling.id;
}

function getJourneyLabel(journey?: JourneyNode): string {
  if (!journey) return "";

  const namedJourney = journey as NamedJourneyNode;
  return namedJourney.journeyName || journey.journeyKey || journey.title || journey.slug || journey.id;
}

function getMilestoneLabel(milestone?: GrowthMilestoneNode): string {
  if (!milestone) return "";

  const namedMilestone = milestone as NamedGrowthMilestoneNode;
  return (
    namedMilestone.milestoneName ||
    milestone.milestoneKey ||
    milestone.title ||
    milestone.slug ||
    milestone.id
  );
}

function getWordLabel(word: GraphResolutionResult["detectedWords"][number]): string {
  return word.slug || word.word || word.title || word.id;
}

function getReflectionPromptText(prompt?: ReflectionPromptNode): string {
  return prompt?.prompt || "";
}

function getActionStepText(actionStep?: ActionStepNode): string {
  const actionWithText = actionStep as ActionStepWithText | undefined;
  return actionWithText?.actionText || actionStep?.action || "";
}

function getNodeDecisionLabel(node?: AnyTIGNode): string {
  if (!node) return "";

  switch (node.type) {
    case "SCRIPTURE":
      return node.reference || node.title || node.slug || node.id;
    case "TEOYUBE_WORD":
      return node.word || node.title || node.slug || node.id;
    case "PROMISE_CATEGORY":
      return getPromiseLabel(node);
    case "PROMISE_CLUSTER":
      return getPromiseClusterLabel(node);
    case "EMOTION_PROFILE":
      return getEmotionLabel(node);
    case "CALLING_PROFILE":
      return getCallingLabel(node);
    case "JOURNEY":
      return getJourneyLabel(node);
    case "PRAYER_SEQUENCE":
      return node.title || node.sequenceKey || node.slug || node.id;
    case "REFLECTION_PROMPT":
      return node.title || node.prompt || node.slug || node.id;
    case "ACTION_STEP":
      return node.title || getActionStepText(node) || node.slug || node.id;
    case "GROWTH_MILESTONE":
      return getMilestoneLabel(node);
    default:
      return node.title || node.slug || node.id;
  }
}

function buildDecisionSummaryItem(params: {
  label: string;
  node?: AnyTIGNode;
  explanation: string;
}): TIGDecisionSummaryItem | undefined {
  const value = getNodeDecisionLabel(params.node);
  if (!value || !params.node) return undefined;

  return {
    label: params.label,
    value,
    nodeId: params.node.id,
    nodeType: params.node.type,
    explanation: params.explanation,
    confidence: params.node.confidenceScore
  };
}

function getOverrideText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return undefined;
  if ("prompt" in value && typeof value.prompt === "string") return value.prompt;
  if ("actionText" in value && typeof value.actionText === "string") return value.actionText;
  if ("action" in value && typeof value.action === "string") return value.action;
  return undefined;
}

function buildSafeFallbackConfidence(): TIGConfidenceScore {
  return buildTIGConfidenceScore(
    {
      intentConfidence: 0.45,
      emotionConfidence: 0.25,
      promiseConfidence: 0.35,
      scriptureConfidence: 0.5,
      callingConfidence: 0.2,
      journeyConfidence: 0.25
    },
    "Fallback response confidence was used because the graph result did not include a complete confidence score."
  );
}

export function formatPrayerSequence(sequence?: PrayerSequenceNode): string {
  if (!sequence) return "";

  const sequenceWithSections = sequence as PrayerSequenceWithSections;
  const sections = [
    sequenceWithSections.opening,
    sequenceWithSections.scriptureAnchor,
    sequenceWithSections.confession,
    sequenceWithSections.petition,
    sequenceWithSections.declaration,
    sequenceWithSections.surrender,
    sequenceWithSections.thanksgiving,
    sequenceWithSections.closing || sequence.closingDeclaration
  ].filter(hasText);

  if (sections.length) return sections.join("\n").trim();
  return sequence.steps.filter(hasText).join("\n").trim();
}

export function getPrimaryScriptureFromResult(
  result: GraphResolutionResult
): ScriptureNode | undefined {
  const aiContext = buildAIContext(result);
  if (aiContext.primaryScripture) return aiContext.primaryScripture;
  if (result.scriptures[0]) return result.scriptures[0];

  const rankedScripture = result.rankedNodes.find(
    (rankedNode) => rankedNode.node.type === "SCRIPTURE"
  )?.node;

  return rankedScripture?.type === "SCRIPTURE" ? rankedScripture : undefined;
}

export function buildDefaultFallbackText(mode: TIGAIRequest["mode"]): TIGResponseText {
  switch (mode) {
    case "promise_search":
      return {
        aiMessage: "Teoyube searched for Scripture-backed promises connected to your request.",
        prayer: "Father, guide me through Your promises and help me receive Your Word with faith.",
        reflectionPrompt: "What promise from Scripture speaks most directly to my current season?",
        actionStep:
          "Choose one Scripture and write one sentence about how you can trust God with it today."
      };
    case "calling_compass":
      return {
        aiMessage:
          "Teoyube searched for calling patterns connected to Scripture, gifts, burdens, and faithful obedience.",
        prayer: "Father, reveal the calling You are forming in me and give me courage to obey.",
        reflectionPrompt:
          "What repeated desire, gift, burden, or opportunity might God be using to shape my calling?",
        actionStep:
          "Write down three gifts, three burdens, and one faithful step you can take this week."
      };
    case "growth_journey":
      return {
        aiMessage: "Teoyube searched for a growth journey connected to your current season.",
        prayer: "Father, guide me through this journey with patience, wisdom, and courage.",
        reflectionPrompt: "What stage of this journey best describes where I am right now?",
        actionStep: "Choose one small action connected to this journey and complete it today."
      };
    case "prayer":
      return {
        aiMessage: "Teoyube generated a Scripture-grounded prayer for your current season.",
        prayer: "Father, guide me through Your Word and help me pray with faith and surrender.",
        reflectionPrompt: "Which part of this prayer speaks most directly to my current season?",
        actionStep:
          "Pray this slowly once today, then write down one Scripture promise you want to remember."
      };
    case "journal":
      return {
        aiMessage: "Teoyube prepared a Scripture-grounded journal reflection.",
        prayer: "Father, search my heart through Your Word and lead me in truth.",
        reflectionPrompt: "What is God showing me through this Scripture today?",
        actionStep: "Write one honest paragraph in response to this Scripture."
      };
    case "daily_word":
      return {
        aiMessage: "Today's Teoyube Word is anchored in Scripture.",
        prayer: "Father, help me carry this word with faith today.",
        reflectionPrompt: "How does this word connect to my current season?",
        actionStep: "Practice this word through one faithful action today."
      };
    case "ai_companion":
    default:
      return {
        aiMessage:
          "Teoyube listened for the spiritual state behind your question and connected it to Scripture-backed guidance.",
        prayer:
          "Father, guide me with Your Word, strengthen my heart, and lead me into faithful action.",
        reflectionPrompt: "What part of this response should I bring before God today?",
        actionStep: "Take one small Scripture-aligned step today."
      };
  }
}

function buildContextualAIMessage(params: {
  request: TIGAIRequest;
  result: GraphResolutionResult;
  primaryScripture: ScriptureNode;
}): string {
  const aiContext = buildAIContext(params.result);
  const scriptureReference = params.primaryScripture.reference;
  const defaultText = buildDefaultFallbackText(params.request.mode);

  switch (params.request.mode) {
    case "promise_search": {
      const emotion = aiContext.primaryEmotion ? getEmotionLabel(aiContext.primaryEmotion) : "";
      const promisePattern = aiContext.primaryCluster
        ? getPromiseClusterLabel(aiContext.primaryCluster)
        : aiContext.primaryPromise
          ? getPromiseLabel(aiContext.primaryPromise)
          : "";

      if (emotion && promisePattern) {
        return `Teoyube detected a spiritual state connected to ${emotion}. The strongest Scripture-backed promise pattern is ${promisePattern}, anchored in ${scriptureReference}.`;
      }

      return defaultText.aiMessage;
    }
    case "calling_compass": {
      const calling = aiContext.primaryCalling ? getCallingLabel(aiContext.primaryCalling) : "";
      const journey = getJourneyLabel(aiContext.primaryJourney);

      if (calling) {
        const journeyText = journey ? ` The recommended journey is ${journey}.` : "";
        return `Teoyube detected a calling pattern connected to ${calling}, tested through Scripture in ${scriptureReference}.${journeyText}`;
      }

      return defaultText.aiMessage;
    }
    case "growth_journey": {
      const journey = getJourneyLabel(aiContext.primaryJourney);
      const milestone = getMilestoneLabel(aiContext.primaryMilestone);

      if (journey) {
        const milestoneText = milestone ? ` The next growth milestone is ${milestone}.` : "";
        return `Teoyube detected the ${journey} journey, anchored in ${scriptureReference}.${milestoneText}`;
      }

      return defaultText.aiMessage;
    }
    case "prayer":
      return `Teoyube generated a Scripture-grounded prayer anchored in ${scriptureReference} and connected to your current season.`;
    default:
      return defaultText.aiMessage;
  }
}

function buildResponseGraphTrace(result: GraphResolutionResult): ResponseGraphTracePath[] {
  const selectedNodeIds = result.graphTrace.selectedNodeIds;
  const selectedRelationshipIds = result.graphTrace.selectedRelationshipIds;
  const startNodeIds = uniqueStrings(
    result.graphTrace.traversalSteps.find((step) => step.nodeIds.length > 0)?.nodeIds ||
      selectedNodeIds.slice(0, 1)
  );
  const traversalDepth =
    result.graphTrace.rankedPaths.reduce((maxDepth, path) => Math.max(maxDepth, path.depth), 0) ||
    Math.max(0, result.graphTrace.traversalSteps.length - 1);

  if (result.graphTrace.rankedPaths.length) {
    return result.graphTrace.rankedPaths.map((path) => ({
      ...path,
      startNodeIds,
      selectedNodeIds,
      selectedRelationshipIds,
      traversalDepth
    }));
  }

  return [
    {
      startNodeIds,
      selectedNodeIds,
      selectedRelationshipIds,
      traversalDepth,
      nodes: selectedNodeIds,
      relationships: selectedRelationshipIds,
      depth: traversalDepth,
      score: result.confidence?.overall || 0,
      reasons: result.graphTrace.traversalSteps.map((step) => `graph:${step.step}`)
    }
  ];
}

function buildModeOverrideMessage(params: {
  mode: TIGAIRequest["mode"];
  request: TIGAIRequest;
  result: GraphResolutionResult;
}): string | undefined {
  const primaryScripture = getPrimaryScriptureFromResult(params.result);
  if (!primaryScripture) return undefined;

  return buildContextualAIMessage({
    request: { ...params.request, mode: params.mode },
    result: params.result,
    primaryScripture
  });
}

export function buildDecisionSummary(params: {
  request: TIGAIRequest;
  result: GraphResolutionResult;
}): TIGDecisionSummary {
  const { request, result } = params;
  const aiContext = buildAIContext(result);
  const items = [
    buildDecisionSummaryItem({
      label: "Emotion",
      node: aiContext.primaryEmotion,
      explanation:
        "Teoyube detected this emotional or spiritual state from the user's input and matched it to the graph."
    }),
    buildDecisionSummaryItem({
      label: "Promise",
      node: aiContext.primaryPromise,
      explanation:
        "This promise category was selected because it is connected to the detected state and Scripture anchors."
    }),
    buildDecisionSummaryItem({
      label: "Promise Cluster",
      node: aiContext.primaryCluster,
      explanation:
        "This promise cluster groups related Scripture-backed promises for the user's current season."
    }),
    buildDecisionSummaryItem({
      label: "Scripture",
      node: aiContext.primaryScripture,
      explanation:
        "This Scripture anchors the response so the answer remains grounded in God's Word."
    }),
    buildDecisionSummaryItem({
      label: "Calling",
      node: aiContext.primaryCalling,
      explanation:
        "This calling pattern was selected from related gifts, burdens, Scripture, and journey connections."
    }),
    buildDecisionSummaryItem({
      label: "Journey",
      node: aiContext.primaryJourney,
      explanation:
        "This journey was selected because it connects the user's current state to growth, prayer, reflection, and action."
    }),
    buildDecisionSummaryItem({
      label: "Prayer",
      node: aiContext.primaryPrayerSequence,
      explanation:
        "This prayer sequence was selected because it matches the detected emotion, promise, and Scripture."
    }),
    buildDecisionSummaryItem({
      label: "Reflection",
      node: aiContext.primaryReflectionPrompt,
      explanation:
        "This reflection prompt helps the user process the Scripture and promise personally."
    }),
    buildDecisionSummaryItem({
      label: "Action",
      node: aiContext.primaryActionStep,
      explanation:
        "This action step helps the user respond faithfully today."
    }),
    buildDecisionSummaryItem({
      label: "Growth Milestone",
      node: aiContext.primaryMilestone,
      explanation:
        "This milestone shows the next marker of spiritual growth connected to the journey."
    })
  ].filter((item): item is TIGDecisionSummaryItem => Boolean(item));

  return {
    title: "Why Teoyube Chose This",
    input: request.input,
    items,
    overallExplanation:
      "Teoyube connected the user's input to Scripture through the Intelligence Graph, moving from spiritual state to promise, Scripture, prayer, reflection, action, and growth."
  };
}

export function buildTIGResponseFromGraph(params: {
  request: TIGAIRequest;
  result: GraphResolutionResult;
  override?: Partial<Pick<TIGAIResponse, "aiMessage" | "prayer" | "reflectionPrompt" | "actionStep">>;
}): TIGAIResponse {
  const { request, result, override } = params;
  const aiContext = buildAIContext(result);
  const primaryScripture = getPrimaryScriptureFromResult(result);

  if (!primaryScripture) {
    throw new Error("TIG response building failed because no Scripture anchor could be found.");
  }

  const rankedScriptureFallback =
    result.scriptures.length === 0
      ? createScriptureAnchoredFallbackResponse({ request, scripture: primaryScripture })
      : undefined;
  const fallbackText = buildDefaultFallbackText(request.mode);
  const prayerFromSequence = formatPrayerSequence(aiContext.primaryPrayerSequence);
  const reflectionPrompt = getReflectionPromptText(aiContext.primaryReflectionPrompt);
  const actionStep = getActionStepText(aiContext.primaryActionStep);
  const confidence = result.confidence || buildSafeFallbackConfidence();
  const scriptures = result.scriptures.length ? result.scriptures : [primaryScripture];
  const defaultAIMessage = buildContextualAIMessage({
    request,
    result,
    primaryScripture
  });

  const response: TIGResponseShape = {
    requestId: request.id,
    mode: request.mode,
    detectedIntent: result.detectedIntent,
    detectedEmotions: result.detectedEmotions.map(getEmotionLabel),
    detectedPromiseCategories: result.detectedPromises.map(getPromiseLabel),
    detectedCallingProfiles: result.detectedCallings.map(getCallingLabel),
    scriptures,
    scriptureNodes: scriptures,
    teoyubeWords: result.detectedWords.map(getWordLabel),
    promiseClusters: result.detectedPromiseClusters.map(getPromiseClusterLabel),
    journey: aiContext.primaryJourney ? getJourneyLabel(aiContext.primaryJourney) : undefined,
    aiMessage:
      getOverrideText(override?.aiMessage) ||
      defaultAIMessage ||
      rankedScriptureFallback?.aiMessage ||
      fallbackText.aiMessage,
    prayer:
      getOverrideText(override?.prayer) ||
      prayerFromSequence ||
      rankedScriptureFallback?.prayer ||
      fallbackText.prayer,
    reflectionPrompt:
      getOverrideText(override?.reflectionPrompt) ||
      reflectionPrompt ||
      getOverrideText(rankedScriptureFallback?.reflectionPrompt) ||
      fallbackText.reflectionPrompt,
    actionStep:
      getOverrideText(override?.actionStep) ||
      actionStep ||
      getOverrideText(rankedScriptureFallback?.actionStep) ||
      fallbackText.actionStep,
    confidence,
    confidenceScore: confidence,
    graphTrace: buildResponseGraphTrace(result),
    decisionSummary: buildDecisionSummary({ request, result }),
    generatedAt: new Date().toISOString()
  };

  return validateTIGAIResponse(response as unknown as TIGAIResponse);
}

export function buildPromiseSearchResponse(
  request: TIGAIRequest,
  result: GraphResolutionResult
): TIGAIResponse {
  return buildTIGResponseFromGraph({
    request,
    result,
    override: {
      aiMessage: buildModeOverrideMessage({ mode: "promise_search", request, result })
    }
  });
}

export function buildCallingCompassResponse(
  request: TIGAIRequest,
  result: GraphResolutionResult
): TIGAIResponse {
  return buildTIGResponseFromGraph({
    request,
    result,
    override: {
      aiMessage: buildModeOverrideMessage({ mode: "calling_compass", request, result })
    }
  });
}

export function buildJourneyResponse(
  request: TIGAIRequest,
  result: GraphResolutionResult
): TIGAIResponse {
  return buildTIGResponseFromGraph({
    request,
    result,
    override: {
      aiMessage: buildModeOverrideMessage({ mode: "growth_journey", request, result })
    }
  });
}

export function buildPrayerResponse(
  request: TIGAIRequest,
  result: GraphResolutionResult
): TIGAIResponse {
  return buildTIGResponseFromGraph({
    request,
    result,
    override: {
      aiMessage: buildModeOverrideMessage({ mode: "prayer", request, result })
    }
  });
}

export function buildDailyWordResponse(
  request: TIGAIRequest,
  result: GraphResolutionResult
): TIGAIResponse {
  return buildTIGResponseFromGraph({
    request,
    result,
    override: {
      aiMessage: buildDefaultFallbackText("daily_word").aiMessage
    }
  });
}

export function buildJournalResponse(
  request: TIGAIRequest,
  result: GraphResolutionResult
): TIGAIResponse {
  return buildTIGResponseFromGraph({
    request,
    result,
    override: {
      aiMessage: buildDefaultFallbackText("journal").aiMessage
    }
  });
}
