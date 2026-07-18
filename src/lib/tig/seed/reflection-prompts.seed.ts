import type { ReflectionPromptNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as ReflectionPromptNode["sourceStatus"];

type PromptType = "journal" | "self_examination" | "calling" | "growth";
type SuggestedFrequency = "daily" | "weekly" | "journey_stage" | "as_needed";

type ReflectionPromptSeedNode = ReflectionPromptNode & {
  promptKey: string;
  promptType: PromptType;
  suggestedFrequency: SuggestedFrequency;
  relatedScriptures: string[];
  relatedPromises: string[];
  relatedEmotions: string[];
  relatedJourneys: string[];
  relatedWords: string[];
  intendedFruit: string[];
};

type ReflectionPromptSeedInput = {
  id: string;
  slug: string;
  title: string;
  promptKey: string;
  prompt: string;
  promptType: PromptType;
  suggestedFrequency: SuggestedFrequency;
  relatedScriptures: string[];
  relatedPromises: string[];
  relatedEmotions: string[];
  relatedJourneys: string[];
  relatedWords: string[];
  theologicalWeight: number;
  pastoralSensitivity: number;
  confidenceScore: number;
  tags: string[];
};

function createReflectionPromptSeed(input: ReflectionPromptSeedInput): ReflectionPromptSeedNode {
  return {
    id: input.id,
    type: "REFLECTION_PROMPT",
    slug: input.slug,
    title: input.title,
    description: input.prompt,
    summary: input.prompt,
    tags: input.tags,
    aliases: [input.promptKey, ...input.relatedWords],
    scriptureReferences: input.relatedScriptures,
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE"],
    theologicalWeight: input.theologicalWeight,
    pastoralSensitivity: input.pastoralSensitivity,
    confidenceScore: input.confidenceScore,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    prompt: input.prompt,
    followUpQuestions: [],
    scriptureAnchorIds: input.relatedScriptures,
    emotionIds: input.relatedEmotions,
    journeyIds: input.relatedJourneys,
    intendedFruit: input.relatedWords,
    promptKey: input.promptKey,
    promptType: input.promptType,
    suggestedFrequency: input.suggestedFrequency,
    relatedScriptures: input.relatedScriptures,
    relatedPromises: input.relatedPromises,
    relatedEmotions: input.relatedEmotions,
    relatedJourneys: input.relatedJourneys,
    relatedWords: input.relatedWords
  };
}

export const TIG_REFLECTION_PROMPT_SEEDS: ReflectionPromptNode[] = [
  createReflectionPromptSeed({
    id: "reflection_name_the_waiting",
    slug: "name-the-waiting",
    title: "Name the Waiting",
    promptKey: "name-the-waiting",
    prompt:
      "Where do I feel delayed, tired, or uncertain, and what would it look like to wait on God with trust today?",
    promptType: "journal",
    suggestedFrequency: "journey_stage",
    relatedScriptures: ["scripture_isaiah_40_31"],
    relatedPromises: ["promise_strength", "promise_hope"],
    relatedEmotions: ["waiting", "discouragement"],
    relatedJourneys: ["journey_waiting_to_renewal"],
    relatedWords: ["wait", "renew", "strength", "hope"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.82,
    confidenceScore: 0.94,
    tags: ["waiting", "journal", "strength", "hope"]
  }),
  createReflectionPromptSeed({
    id: "reflection_name_the_fear",
    slug: "name-the-fear",
    title: "Name the Fear",
    promptKey: "name-the-fear",
    prompt: "What fear am I carrying right now, and how does God's presence change the way I face it?",
    promptType: "self_examination",
    suggestedFrequency: "as_needed",
    relatedScriptures: ["scripture_joshua_1_9"],
    relatedPromises: ["promise_courage", "promise_strength"],
    relatedEmotions: ["fear", "anxiety", "uncertainty"],
    relatedJourneys: ["journey_fear_to_courage"],
    relatedWords: ["courage", "presence", "stand", "obey"],
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.86,
    confidenceScore: 0.94,
    tags: ["fear", "courage", "presence", "self-examination"]
  }),
  createReflectionPromptSeed({
    id: "reflection_where_is_god_working",
    slug: "where-is-god-working",
    title: "Where Is God Working",
    promptKey: "where-is-god-working",
    prompt: "Where might God be working for good, even in a situation I do not fully understand yet?",
    promptType: "journal",
    suggestedFrequency: "weekly",
    relatedScriptures: ["scripture_romans_8_28"],
    relatedPromises: ["promise_purpose", "promise_hope"],
    relatedEmotions: ["discouragement", "waiting", "uncertainty"],
    relatedJourneys: ["journey_purpose_to_calling"],
    relatedWords: ["purpose", "faithful", "promise", "calling"],
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.74,
    confidenceScore: 0.93,
    tags: ["purpose", "providence", "journal", "calling"]
  }),
  createReflectionPromptSeed({
    id: "reflection_notice_patterns",
    slug: "notice-patterns",
    title: "Notice Patterns",
    promptKey: "notice-patterns",
    prompt: "What gifts, burdens, opportunities, or repeated desires might be pointing toward my calling?",
    promptType: "calling",
    suggestedFrequency: "weekly",
    relatedScriptures: ["scripture_romans_8_28", "scripture_joshua_1_9"],
    relatedPromises: ["promise_purpose", "promise_courage"],
    relatedEmotions: ["uncertainty", "waiting"],
    relatedJourneys: ["journey_purpose_to_calling"],
    relatedWords: ["calling", "purpose", "obey", "stand"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.68,
    confidenceScore: 0.92,
    tags: ["calling", "patterns", "gifts", "purpose"]
  }),
  createReflectionPromptSeed({
    id: "reflection_promise_for_current_season",
    slug: "promise-for-current-season",
    title: "Promise for Current Season",
    promptKey: "promise-for-current-season",
    prompt:
      "Which promise from Scripture speaks most clearly to my current season, and how can I hold onto it today?",
    promptType: "journal",
    suggestedFrequency: "daily",
    relatedScriptures: [
      "scripture_romans_8_28",
      "scripture_isaiah_40_31",
      "scripture_joshua_1_9"
    ],
    relatedPromises: ["promise_purpose", "promise_strength", "promise_courage", "promise_hope"],
    relatedEmotions: ["fear", "discouragement", "waiting", "uncertainty"],
    relatedJourneys: [
      "journey_waiting_to_renewal",
      "journey_fear_to_courage",
      "journey_purpose_to_calling"
    ],
    relatedWords: ["promise", "faithful", "hope", "stand"],
    theologicalWeight: 0.93,
    pastoralSensitivity: 0.8,
    confidenceScore: 0.95,
    tags: ["promise", "daily", "Scripture", "season"]
  }),
  createReflectionPromptSeed({
    id: "reflection_next_faithful_step",
    slug: "next-faithful-step",
    title: "Next Faithful Step",
    promptKey: "next-faithful-step",
    prompt: "What is one faithful step I can take today in response to God's Word?",
    promptType: "growth",
    suggestedFrequency: "daily",
    relatedScriptures: ["scripture_joshua_1_9", "scripture_romans_8_28"],
    relatedPromises: ["promise_courage", "promise_purpose"],
    relatedEmotions: ["fear", "waiting", "uncertainty"],
    relatedJourneys: ["journey_fear_to_courage", "journey_purpose_to_calling"],
    relatedWords: ["obey", "stand", "courage", "purpose"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.72,
    confidenceScore: 0.93,
    tags: ["growth", "obedience", "next-step", "action"]
  })
];

export function getReflectionPromptSeedById(id: string): ReflectionPromptNode | undefined {
  return TIG_REFLECTION_PROMPT_SEEDS.find((prompt) => prompt.id === id);
}

export function getReflectionPromptSeedByKey(promptKey: string): ReflectionPromptNode | undefined {
  const normalizedKey = promptKey.trim().toLowerCase();
  return TIG_REFLECTION_PROMPT_SEEDS.find((prompt) => {
    const seedPrompt = prompt as ReflectionPromptSeedNode;
    return seedPrompt.promptKey.toLowerCase() === normalizedKey;
  });
}

export function getReflectionPromptsForEmotion(emotionKey: string): ReflectionPromptNode[] {
  const normalizedKey = emotionKey.trim().toLowerCase();
  return TIG_REFLECTION_PROMPT_SEEDS.filter((prompt) =>
    prompt.emotionIds.some((emotion) => emotion.toLowerCase() === normalizedKey)
  );
}

export function getReflectionPromptsForPromise(promiseId: string): ReflectionPromptNode[] {
  return TIG_REFLECTION_PROMPT_SEEDS.filter((prompt) => {
    const seedPrompt = prompt as ReflectionPromptSeedNode;
    return seedPrompt.relatedPromises.includes(promiseId);
  });
}

export function getReflectionPromptsForJourney(journeyId: string): ReflectionPromptNode[] {
  return TIG_REFLECTION_PROMPT_SEEDS.filter((prompt) => prompt.journeyIds.includes(journeyId));
}
