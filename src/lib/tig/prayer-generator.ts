import type {
  ActionStepNode,
  CallingProfileNode,
  EmotionProfileNode,
  JourneyNode,
  PrayerSequenceNode,
  PromiseCategoryNode,
  PromiseClusterNode,
  ReflectionPromptNode,
  ScriptureNode,
  TIGAIRequest
} from "./types";
import { buildAIContext, resolveGraph } from "./graph-engine";
import { createSeedTIGQueryClient } from "./query";

export type TIGGeneratedPrayer = {
  title: string;
  opening: string;
  scriptureAnchor: string;
  confession?: string;
  petition: string;
  declaration?: string;
  surrender?: string;
  thanksgiving?: string;
  closing: string;
  fullPrayer: string;
  scriptureReferences: string[];
  relatedPromiseKeys: string[];
  relatedEmotionKeys: string[];
  relatedCallingKeys: string[];
  relatedJourneyKeys: string[];
};

type PrayerEmotionNode = EmotionProfileNode & {
  emotionName?: string;
  emotionalState?: string;
  relatedPromises?: string[];
  relatedPromiseIds?: string[];
  relatedScriptureIds?: string[];
  relatedJourneys?: string[];
  relatedJourneyIds?: string[];
};

type PrayerPromiseNode = PromiseCategoryNode & {
  categoryName?: string;
  coreScriptures?: string[];
  relatedScriptures?: string[];
  relatedCallings?: string[];
  relatedJourneys?: string[];
};

type PrayerCallingNode = CallingProfileNode & {
  callingName?: string;
  archetype?: string;
  relatedScriptures?: string[];
  relatedJourneys?: string[];
};

type PrayerJourneyNode = JourneyNode & {
  journeyName?: string;
  relatedScriptures?: string[];
  relatedPromises?: string[];
  relatedEmotions?: string[];
  relatedCallings?: string[];
};

type PrayerSequenceSeedNode = PrayerSequenceNode & {
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

type PrayerSupportNodes = {
  clusters?: PromiseClusterNode[];
  reflectionPrompts?: ReflectionPromptNode[];
  actionSteps?: ActionStepNode[];
};

function normalizePrayerText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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

function isEmotionProfileNode(node: unknown): node is EmotionProfileNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "EMOTION_PROFILE");
}

function isPromiseCategoryNode(node: unknown): node is PromiseCategoryNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "PROMISE_CATEGORY");
}

function isCallingProfileNode(node: unknown): node is CallingProfileNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "CALLING_PROFILE");
}

function isScriptureNode(node: unknown): node is ScriptureNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "SCRIPTURE");
}

function isJourneyNode(node: unknown): node is JourneyNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "JOURNEY");
}

function isPrayerSequenceNode(node: unknown): node is PrayerSequenceNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "PRAYER_SEQUENCE");
}

function promiseKeyToId(key: string): string {
  const normalizedKey = normalizePrayerText(key).replaceAll("-", "_");
  return normalizedKey.startsWith("promise_") ? normalizedKey : `promise_${normalizedKey}`;
}

function callingKeyToId(key: string): string {
  const normalizedKey = normalizePrayerText(key).replaceAll("-", "_");
  return normalizedKey.startsWith("calling_") ? normalizedKey : `calling_${normalizedKey}`;
}

function journeyKeyToId(key: string): string {
  const normalizedKey = normalizePrayerText(key).replaceAll("-", "_");
  return normalizedKey.startsWith("journey_") ? normalizedKey : `journey_${normalizedKey}`;
}

function stripKnownPrefix(value: string): string {
  return value.replace(/^(calling|emotion|journey|promise|scripture)_/, "");
}

function getValueAliases(value: string): string[] {
  const normalizedValue = normalizePrayerText(value);
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
    `emotion_${strippedValue}`,
    `promise_${strippedValue}`,
    `calling_${strippedValue}`,
    `journey_${strippedValue}`,
    `scripture_${strippedValue}`
  ]);
}

function countMatches(leftValues: string[], rightValues: string[]): number {
  const rightAliases = new Set(rightValues.flatMap(getValueAliases));

  return leftValues.reduce((total, value) => {
    const aliases = getValueAliases(value);
    return aliases.some((alias) => rightAliases.has(alias)) ? total + 1 : total;
  }, 0);
}

function getEmotionDisplayName(emotion: EmotionProfileNode): string {
  const prayerEmotion = emotion as PrayerEmotionNode;
  return prayerEmotion.emotionName || prayerEmotion.emotionalState || emotion.title || emotion.emotionKey;
}

function getPromiseDisplayName(promise: PromiseCategoryNode): string {
  const prayerPromise = promise as PrayerPromiseNode;
  return prayerPromise.categoryName || promise.title || promise.categoryKey;
}

function getCallingDisplayName(calling: CallingProfileNode): string {
  const prayerCalling = calling as PrayerCallingNode;
  return prayerCalling.callingName || calling.title || calling.callingKey;
}

function getJourneyDisplayName(journey: JourneyNode): string {
  const prayerJourney = journey as PrayerJourneyNode;
  return prayerJourney.journeyName || journey.title || journey.journeyKey;
}

function getSequenceScriptureIds(sequence: PrayerSequenceNode): string[] {
  const prayerSequence = sequence as PrayerSequenceSeedNode;
  return uniqueStrings([
    ...sequence.anchorScriptureIds,
    sequence.openingScriptureId,
    ...(prayerSequence.relatedScriptures || [])
  ]);
}

function getSequencePromiseIds(sequence: PrayerSequenceNode): string[] {
  const prayerSequence = sequence as PrayerSequenceSeedNode;
  return uniqueStrings([
    ...sequence.promiseCategoryIds,
    ...(prayerSequence.relatedPromises || [])
  ]);
}

function getJourneyRelatedValues(journey?: JourneyNode): string[] {
  if (!journey) return [];

  const prayerJourney = journey as PrayerJourneyNode;
  return uniqueStrings([
    journey.id,
    journey.slug,
    journey.journeyKey,
    prayerJourney.journeyName || "",
    ...journey.relatedScriptureIds,
    ...journey.relatedPromiseCategoryIds,
    ...journey.relatedEmotionIds,
    ...journey.relatedCallingIds,
    ...(prayerJourney.relatedScriptures || []),
    ...(prayerJourney.relatedPromises || []),
    ...(prayerJourney.relatedEmotions || []),
    ...(prayerJourney.relatedCallings || [])
  ]);
}

export function formatPrayerSequence(sequence: PrayerSequenceNode): string {
  const prayerSequence = sequence as PrayerSequenceSeedNode;
  const sections = [
    prayerSequence.opening,
    prayerSequence.scriptureAnchor,
    prayerSequence.confession,
    prayerSequence.petition,
    prayerSequence.declaration,
    prayerSequence.surrender,
    prayerSequence.thanksgiving,
    prayerSequence.closing || sequence.closingDeclaration
  ].filter(hasText);

  if (sections.length) return sections.join("\n\n").trim();
  return sequence.steps.filter(hasText).join("\n\n").trim();
}

export function scorePrayerSequence(params: {
  sequence: PrayerSequenceNode;
  emotions?: EmotionProfileNode[];
  promises?: PromiseCategoryNode[];
  callings?: CallingProfileNode[];
  journey?: JourneyNode;
  scriptures?: ScriptureNode[];
}): number {
  const sequence = params.sequence;
  const prayerSequence = sequence as PrayerSequenceSeedNode;
  const emotionValues = uniqueStrings([
    ...(prayerSequence.relatedEmotions || [])
  ]);
  const promiseValues = getSequencePromiseIds(sequence);
  const callingValues = uniqueStrings([...(prayerSequence.relatedCallings || [])]);
  const scriptureValues = getSequenceScriptureIds(sequence);
  const sequenceJourneyComparableValues = uniqueStrings([
    ...emotionValues,
    ...promiseValues,
    ...callingValues,
    ...scriptureValues,
    ...sequence.tags,
    ...sequence.aliases
  ]);

  const matchedEmotions = countMatches(
    emotionValues,
    (params.emotions || []).flatMap((emotion) => [
      emotion.id,
      emotion.slug,
      emotion.title,
      emotion.emotionKey,
      (emotion as PrayerEmotionNode).emotionalState || ""
    ])
  );
  const matchedPromises = countMatches(
    promiseValues,
    (params.promises || []).flatMap((promise) => [
      promise.id,
      promise.slug,
      promise.title,
      promise.categoryKey,
      (promise as PrayerPromiseNode).categoryName || ""
    ])
  );
  const matchedCallings = countMatches(
    callingValues,
    (params.callings || []).flatMap((calling) => [
      calling.id,
      calling.slug,
      calling.title,
      calling.callingKey,
      (calling as PrayerCallingNode).callingName || "",
      (calling as PrayerCallingNode).archetype || "",
      ...calling.archetypes
    ])
  );
  const matchedScriptures = countMatches(
    scriptureValues,
    (params.scriptures || []).flatMap((scripture) => [
      scripture.id,
      scripture.slug,
      scripture.reference,
      ...scripture.themes,
      ...scripture.promises,
      ...scripture.emotions,
      ...scripture.callings
    ])
  );
  const matchedJourneyValues = countMatches(
    sequenceJourneyComparableValues,
    getJourneyRelatedValues(params.journey)
  );

  return (
    matchedEmotions * 3 +
    matchedPromises * 3 +
    matchedCallings * 2 +
    matchedScriptures * 2 +
    matchedJourneyValues * 2 +
    sequence.theologicalWeight +
    sequence.confidenceScore
  );
}

export function selectBestPrayerSequence(params: {
  sequences: PrayerSequenceNode[];
  emotions?: EmotionProfileNode[];
  promises?: PromiseCategoryNode[];
  callings?: CallingProfileNode[];
  journey?: JourneyNode;
  scriptures?: ScriptureNode[];
}): PrayerSequenceNode | undefined {
  if (!params.sequences.length) return undefined;

  return [...params.sequences].sort((a, b) => {
    const bScore = scorePrayerSequence({ ...params, sequence: b });
    const aScore = scorePrayerSequence({ ...params, sequence: a });
    if (bScore !== aScore) return bScore - aScore;
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return b.theologicalWeight - a.theologicalWeight;
  })[0];
}

export function getPrayerSequencesFromSeedGraph(): PrayerSequenceNode[] {
  return createSeedTIGQueryClient().getNodesByType("PRAYER_SEQUENCE").filter(isPrayerSequenceNode);
}

export function buildPrayerTitle(params: {
  emotions?: EmotionProfileNode[];
  promises?: PromiseCategoryNode[];
  journey?: JourneyNode;
}): string {
  if (params.journey) return `Prayer for ${getJourneyDisplayName(params.journey)}`;
  if (params.emotions?.length) return `Prayer for ${getEmotionDisplayName(params.emotions[0])}`;
  if (params.promises?.length) return `Prayer for ${getPromiseDisplayName(params.promises[0])}`;
  return "Scripture-Grounded Prayer";
}

export function selectPrimaryScripture(scriptures: ScriptureNode[]): ScriptureNode | undefined {
  if (!scriptures.length) return undefined;

  return [...scriptures].sort((a, b) => {
    if (a.directPromise !== b.directPromise) return a.directPromise ? -1 : 1;
    return b.canonicalImportance - a.canonicalImportance;
  })[0];
}

function buildFallbackPrayer(params: {
  scriptures: ScriptureNode[];
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  callings: CallingProfileNode[];
  journey?: JourneyNode;
}): TIGGeneratedPrayer {
  const primaryScripture = selectPrimaryScripture(params.scriptures);
  const title = buildPrayerTitle({
    emotions: params.emotions,
    promises: params.promises,
    journey: params.journey
  });

  const opening = "Father, I come to You through Your Word.";
  const scriptureAnchor = primaryScripture
    ? `Your Word says in ${primaryScripture.reference}: "${primaryScripture.text}"`
    : "Anchor my heart in the truth of Your Word.";
  const confession = params.emotions.length
    ? `I bring before You the state of my heart, especially ${params.emotions.map(getEmotionDisplayName).join(", ")}.`
    : "I bring my heart before You honestly.";
  const petition = params.promises.length
    ? `Lead me into Your promises of ${params.promises.map(getPromiseDisplayName).join(", ")}.`
    : "Lead me into Your truth, wisdom, and strength.";
  const declaration = primaryScripture
    ? `I choose to trust what You have spoken in ${primaryScripture.reference}.`
    : "I choose to trust Your Word.";
  const surrender =
    "Help me surrender fear, confusion, delay, and every burden that keeps me from walking with You.";
  const thanksgiving = "Thank You for being faithful, present, and good.";
  const closing = "In Jesus' name, amen.";

  return {
    title,
    opening,
    scriptureAnchor,
    confession,
    petition,
    declaration,
    surrender,
    thanksgiving,
    closing,
    fullPrayer: [
      opening,
      scriptureAnchor,
      confession,
      petition,
      declaration,
      surrender,
      thanksgiving,
      closing
    ].join("\n"),
    scriptureReferences: uniqueStrings(params.scriptures.map((scripture) => scripture.reference)),
    relatedPromiseKeys: uniqueStrings(params.promises.map((promise) => promise.categoryKey)),
    relatedEmotionKeys: uniqueStrings(params.emotions.map((emotion) => emotion.emotionKey)),
    relatedCallingKeys: uniqueStrings(params.callings.map((calling) => calling.callingKey)),
    relatedJourneyKeys: params.journey ? [params.journey.journeyKey] : []
  };
}

function buildGeneratedPrayerFromSequence(params: {
  sequence: PrayerSequenceNode;
  scriptures: ScriptureNode[];
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  callings: CallingProfileNode[];
  journey?: JourneyNode;
}): TIGGeneratedPrayer {
  const sequence = params.sequence as PrayerSequenceSeedNode;
  const fullPrayer = formatPrayerSequence(params.sequence);

  return {
    title: params.sequence.title,
    opening: sequence.opening || params.sequence.steps[0] || "Father, I come to You through Your Word.",
    scriptureAnchor:
      sequence.scriptureAnchor ||
      params.sequence.steps[1] ||
      "Anchor my heart in the truth of Your Word.",
    confession: sequence.confession,
    petition: sequence.petition || "Lead me into Your truth, wisdom, and strength.",
    declaration: sequence.declaration,
    surrender: sequence.surrender,
    thanksgiving: sequence.thanksgiving,
    closing: sequence.closing || params.sequence.closingDeclaration || "In Jesus' name, amen.",
    fullPrayer,
    scriptureReferences: uniqueStrings([
      ...(sequence.relatedScriptures || []),
      ...params.sequence.anchorScriptureIds,
      ...params.scriptures.map((scripture) => scripture.reference)
    ]),
    relatedPromiseKeys: uniqueStrings([
      ...getSequencePromiseIds(params.sequence),
      ...params.promises.map((promise) => promise.categoryKey)
    ]),
    relatedEmotionKeys: uniqueStrings([
      ...(sequence.relatedEmotions || []),
      ...params.emotions.map((emotion) => emotion.emotionKey)
    ]),
    relatedCallingKeys: uniqueStrings([
      ...(sequence.relatedCallings || []),
      ...params.callings.map((calling) => calling.callingKey)
    ]),
    relatedJourneyKeys: uniqueStrings(params.journey ? [params.journey.journeyKey] : [])
  };
}

export function generatePrayerFromTIG(params: {
  request?: TIGAIRequest;
  scriptures: ScriptureNode[];
  emotions?: EmotionProfileNode[];
  promises?: PromiseCategoryNode[];
  callings?: CallingProfileNode[];
  journey?: JourneyNode;
} & PrayerSupportNodes): TIGGeneratedPrayer {
  const emotions = params.emotions || [];
  const promises = params.promises || [];
  const callings = params.callings || [];
  const sequences = getPrayerSequencesFromSeedGraph();
  const bestSequence = selectBestPrayerSequence({
    sequences,
    emotions,
    promises,
    callings,
    journey: params.journey,
    scriptures: params.scriptures
  });

  if (!bestSequence) {
    return buildFallbackPrayer({
      scriptures: params.scriptures,
      emotions,
      promises,
      callings,
      journey: params.journey
    });
  }

  const prayerSequence = bestSequence as PrayerSequenceSeedNode;
  const relatedPromiseKeys = uniqueStrings([
    ...getSequencePromiseIds(bestSequence),
    ...promises.map((promise) => promise.categoryKey)
  ]);
  const relatedEmotionKeys = uniqueStrings([
    ...(prayerSequence.relatedEmotions || []),
    ...emotions.map((emotion) => emotion.emotionKey)
  ]);
  const relatedCallingKeys = uniqueStrings([
    ...(prayerSequence.relatedCallings || []),
    ...callings.map((calling) => calling.callingKey)
  ]);
  const relatedJourneyKeys = uniqueStrings(params.journey ? [params.journey.journeyKey] : []);
  const scriptureReferences = uniqueStrings([
    ...(prayerSequence.relatedScriptures || []),
    ...bestSequence.anchorScriptureIds,
    ...params.scriptures.map((scripture) => scripture.reference)
  ]);

  return {
    title: bestSequence.title,
    opening: prayerSequence.opening || bestSequence.steps[0] || "Father, I come to You through Your Word.",
    scriptureAnchor:
      prayerSequence.scriptureAnchor ||
      bestSequence.steps[1] ||
      "Anchor my heart in the truth of Your Word.",
    confession: prayerSequence.confession,
    petition: prayerSequence.petition || "Lead me into Your truth, wisdom, and strength.",
    declaration: prayerSequence.declaration,
    surrender: prayerSequence.surrender,
    thanksgiving: prayerSequence.thanksgiving,
    closing: prayerSequence.closing || bestSequence.closingDeclaration || "In Jesus' name, amen.",
    fullPrayer: formatPrayerSequence(bestSequence),
    scriptureReferences,
    relatedPromiseKeys,
    relatedEmotionKeys,
    relatedCallingKeys,
    relatedJourneyKeys
  };
}

function findEmotionMatches(input: string): EmotionProfileNode[] {
  const queryClient = createSeedTIGQueryClient();
  const normalizedInput = normalizePrayerText(input);
  if (!normalizedInput) return [];

  return uniqueNodesById(
    queryClient
      .getNodesByType("EMOTION_PROFILE")
      .filter(isEmotionProfileNode)
      .filter((emotion) => {
        const prayerEmotion = emotion as PrayerEmotionNode;
        const values = [
          emotion.emotionKey,
          prayerEmotion.emotionName || "",
          prayerEmotion.emotionalState || "",
          emotion.title,
          emotion.description,
          ...emotion.tags,
          ...emotion.aliases,
          ...emotion.userPhrases,
          ...emotion.phraseMatchers
        ];

        return values.some((value) => {
          const normalizedValue = normalizePrayerText(value);
          return Boolean(
            normalizedValue &&
              (normalizedInput.includes(normalizedValue) || normalizedValue.includes(normalizedInput))
          );
        });
      })
  );
}

// Legacy seed matching helpers retained for compatibility. Prayer generation now uses resolveGraph().
function findPromisesFromEmotions(emotions: EmotionProfileNode[]): PromiseCategoryNode[] {
  const queryClient = createSeedTIGQueryClient();
  const promiseIds = uniqueStrings(
    emotions.flatMap((emotion) => {
      const prayerEmotion = emotion as PrayerEmotionNode;
      return [
        ...(prayerEmotion.relatedPromises || []),
        ...(prayerEmotion.relatedPromiseIds || []),
        ...emotion.recommendedPromiseCategoryIds
      ].map(promiseKeyToId);
    })
  );

  return uniqueNodesById(
    promiseIds
      .map((id) => queryClient.getNodeById(id))
      .filter(isPromiseCategoryNode)
  );
}

function findScripturesFromMatches(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  callings: CallingProfileNode[];
  journey?: JourneyNode;
}): ScriptureNode[] {
  const queryClient = createSeedTIGQueryClient();
  const journey = params.journey as PrayerJourneyNode | undefined;
  const scriptureIds = uniqueStrings([
    ...params.emotions.flatMap((emotion) => {
      const prayerEmotion = emotion as PrayerEmotionNode;
      return [
        ...emotion.recommendedScriptureIds,
        ...(prayerEmotion.relatedScriptureIds || [])
      ];
    }),
    ...params.promises.flatMap((promise) => {
      const prayerPromise = promise as PrayerPromiseNode;
      return [
        ...promise.anchorScriptureIds,
        ...(prayerPromise.relatedScriptures || []),
        ...(prayerPromise.coreScriptures || [])
      ];
    }),
    ...params.callings.flatMap((calling) => {
      const prayerCalling = calling as PrayerCallingNode;
      return [
        ...calling.anchorScriptureIds,
        ...(prayerCalling.relatedScriptures || [])
      ];
    }),
    ...(params.journey
      ? [
          ...params.journey.relatedScriptureIds,
          ...(journey?.relatedScriptures || [])
        ]
      : [])
  ]);

  return uniqueNodesById(
    scriptureIds
      .map((id) => queryClient.getNodeById(id))
      .filter(isScriptureNode)
  );
}

function findCallingsFromInputAndMatches(params: {
  input: string;
  promises: PromiseCategoryNode[];
  journey?: JourneyNode;
}): CallingProfileNode[] {
  const queryClient = createSeedTIGQueryClient();
  const normalizedInput = normalizePrayerText(params.input);
  const journey = params.journey as PrayerJourneyNode | undefined;
  const relatedCallingIds = uniqueStrings([
    ...params.promises.flatMap((promise) => {
      const prayerPromise = promise as PrayerPromiseNode;
      return [
        ...promise.relatedCallingIds,
        ...(prayerPromise.relatedCallings || [])
      ].map(callingKeyToId);
    }),
    ...(params.journey
      ? [
          ...params.journey.relatedCallingIds,
          ...(journey?.relatedCallings || [])
        ].map(callingKeyToId)
      : [])
  ]);
  const relatedCallings = relatedCallingIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isCallingProfileNode);
  const directMatches = queryClient
    .getNodesByType("CALLING_PROFILE")
    .filter(isCallingProfileNode)
    .filter((calling) => {
      const prayerCalling = calling as PrayerCallingNode;
      const values = [
        calling.callingKey,
        prayerCalling.callingName || "",
        prayerCalling.archetype || "",
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

      return values.some((value) => {
        const normalizedValue = normalizePrayerText(value);
        return Boolean(
          normalizedValue &&
            (normalizedInput.includes(normalizedValue) || normalizedValue.includes(normalizedInput))
        );
      });
    });

  return uniqueNodesById([...directMatches, ...relatedCallings]);
}

function findJourneyFromEmotionsPromisesAndCallings(params: {
  emotions: EmotionProfileNode[];
  promises: PromiseCategoryNode[];
  callings: CallingProfileNode[];
}): JourneyNode | undefined {
  const queryClient = createSeedTIGQueryClient();
  const journeyIds = uniqueStrings([
    ...params.emotions.flatMap((emotion) => {
      const prayerEmotion = emotion as PrayerEmotionNode;
      return [
        ...(prayerEmotion.relatedJourneys || []),
        ...(prayerEmotion.relatedJourneyIds || [])
      ].map(journeyKeyToId);
    }),
    ...params.promises.flatMap((promise) => {
      const prayerPromise = promise as PrayerPromiseNode;
      return (prayerPromise.relatedJourneys || []).map(journeyKeyToId);
    }),
    ...params.callings.flatMap((calling) => {
      const prayerCalling = calling as PrayerCallingNode;
      return (prayerCalling.relatedJourneys || []).map(journeyKeyToId);
    })
  ]);

  return journeyIds
    .map((id) => queryClient.getNodeById(id))
    .filter(isJourneyNode)
    .sort((a, b) => {
      if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
      return b.theologicalWeight - a.theologicalWeight;
    })[0];
}

export function generatePrayerFromSeedGraph(request: TIGAIRequest): TIGGeneratedPrayer {
  const result = resolveGraph(request);
  const aiContext = buildAIContext(result);
  const scriptures = result.scriptures.length
    ? result.scriptures
    : aiContext.primaryScripture
      ? [aiContext.primaryScripture]
      : [];
  const emotions = aiContext.primaryEmotion ? [aiContext.primaryEmotion] : result.detectedEmotions;
  const promises = aiContext.primaryPromise ? [aiContext.primaryPromise] : result.detectedPromises;
  const callings = aiContext.primaryCalling ? [aiContext.primaryCalling] : result.detectedCallings;

  if (aiContext.primaryPrayerSequence) {
    return buildGeneratedPrayerFromSequence({
      sequence: aiContext.primaryPrayerSequence,
      scriptures,
      emotions,
      promises,
      callings,
      journey: aiContext.primaryJourney
    });
  }

  return generatePrayerFromTIG({
    request,
    scriptures,
    emotions,
    promises,
    callings,
    journey: aiContext.primaryJourney,
    clusters: result.detectedPromiseClusters,
    reflectionPrompts: result.detectedReflectionPrompts,
    actionSteps: result.detectedActionSteps
  });
}
