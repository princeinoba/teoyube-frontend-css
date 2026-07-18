import type { ActionStepNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as ActionStepNode["sourceStatus"];

type ActionType = "write" | "pray" | "obey" | "reflect" | "serve" | "rest" | "encourage" | "share";
type ActionDifficultyInput = "easy" | "moderate" | "challenging";

type ActionStepSeedNode = ActionStepNode & {
  actionKey: string;
  actionText: string;
  actionType: ActionType;
  estimatedMinutes: number;
  relatedScriptures: string[];
  relatedPromises: string[];
  relatedEmotions: string[];
  relatedCallings: string[];
  relatedJourneys: string[];
};

type ActionStepSeedInput = {
  id: string;
  slug: string;
  title: string;
  actionKey: string;
  actionText: string;
  actionType: ActionType;
  difficulty: ActionDifficultyInput;
  estimatedMinutes: number;
  relatedScriptures: string[];
  relatedPromises: string[];
  relatedEmotions: string[];
  relatedCallings: string[];
  relatedJourneys: string[];
  theologicalWeight: number;
  pastoralSensitivity: number;
  confidenceScore: number;
  tags: string[];
  expectedFruit: string[];
};

function mapDifficulty(difficulty: ActionDifficultyInput): ActionStepNode["difficulty"] {
  if (difficulty === "challenging") return "STRETCH";
  if (difficulty === "moderate") return "MODERATE";
  return "GENTLE";
}

function createActionStepSeed(input: ActionStepSeedInput): ActionStepSeedNode {
  return {
    id: input.id,
    type: "ACTION_STEP",
    slug: input.slug,
    title: input.title,
    description: input.actionText,
    summary: input.actionText,
    tags: input.tags,
    aliases: [input.actionKey, input.actionType, ...input.relatedEmotions, ...input.relatedCallings],
    scriptureReferences: input.relatedScriptures,
    level: input.difficulty === "challenging" ? "GROWTH" : "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE"],
    theologicalWeight: input.theologicalWeight,
    pastoralSensitivity: input.pastoralSensitivity,
    confidenceScore: input.confidenceScore,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    action: input.actionText,
    difficulty: mapDifficulty(input.difficulty),
    scriptureAnchorIds: input.relatedScriptures,
    promiseCategoryIds: input.relatedPromises,
    expectedFruit: input.expectedFruit,
    actionKey: input.actionKey,
    actionText: input.actionText,
    actionType: input.actionType,
    estimatedMinutes: input.estimatedMinutes,
    relatedScriptures: input.relatedScriptures,
    relatedPromises: input.relatedPromises,
    relatedEmotions: input.relatedEmotions,
    relatedCallings: input.relatedCallings,
    relatedJourneys: input.relatedJourneys
  };
}

export const TIG_ACTION_STEP_SEEDS: ActionStepNode[] = [
  createActionStepSeed({
    id: "action_write_the_delay",
    slug: "write-the-delay",
    title: "Write the Delay",
    actionKey: "write-the-delay",
    actionText:
      "Write down the area where you feel delayed, then place Isaiah 40:31 beside it as your Scripture anchor.",
    actionType: "write",
    difficulty: "easy",
    estimatedMinutes: 10,
    relatedScriptures: ["scripture_isaiah_40_31"],
    relatedPromises: ["promise_strength", "promise_hope"],
    relatedEmotions: ["waiting", "discouragement"],
    relatedCallings: ["servant", "teacher", "intercessor"],
    relatedJourneys: ["journey_waiting_to_renewal"],
    theologicalWeight: 0.88,
    pastoralSensitivity: 0.78,
    confidenceScore: 0.93,
    tags: ["waiting", "write", "strength", "hope"],
    expectedFruit: ["clarity", "trust", "renewed hope"]
  }),
  createActionStepSeed({
    id: "action_pray_for_strength",
    slug: "pray-for-strength",
    title: "Pray for Strength",
    actionKey: "pray-for-strength",
    actionText: "Pray Isaiah 40:31 slowly and ask God to renew your strength today.",
    actionType: "pray",
    difficulty: "easy",
    estimatedMinutes: 5,
    relatedScriptures: ["scripture_isaiah_40_31"],
    relatedPromises: ["promise_strength", "promise_hope"],
    relatedEmotions: ["waiting", "discouragement", "weariness"],
    relatedCallings: ["servant", "teacher", "intercessor"],
    relatedJourneys: ["journey_waiting_to_renewal"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.82,
    confidenceScore: 0.94,
    tags: ["prayer", "strength", "waiting", "renewal"],
    expectedFruit: ["renewed strength", "hope", "patient trust"]
  }),
  createActionStepSeed({
    id: "action_take_one_obedient_step",
    slug: "take-one-obedient-step",
    title: "Take One Obedient Step",
    actionKey: "take-one-obedient-step",
    actionText:
      "Choose one small step of obedience you can take today, even if you do not see the full path yet.",
    actionType: "obey",
    difficulty: "moderate",
    estimatedMinutes: 15,
    relatedScriptures: ["scripture_joshua_1_9", "scripture_romans_8_28"],
    relatedPromises: ["promise_courage", "promise_purpose"],
    relatedEmotions: ["fear", "uncertainty", "waiting"],
    relatedCallings: ["builder", "leader", "servant", "watchman"],
    relatedJourneys: ["journey_fear_to_courage", "journey_purpose_to_calling"],
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.76,
    confidenceScore: 0.95,
    tags: ["obedience", "courage", "purpose", "next-step"],
    expectedFruit: ["obedience", "movement", "courage"]
  }),
  createActionStepSeed({
    id: "action_write_the_fear",
    slug: "write-the-fear",
    title: "Write the Fear",
    actionKey: "write-the-fear",
    actionText: "Write the fear you are carrying, then write Joshua 1:9 under it as God's answer.",
    actionType: "write",
    difficulty: "easy",
    estimatedMinutes: 10,
    relatedScriptures: ["scripture_joshua_1_9"],
    relatedPromises: ["promise_courage", "promise_strength"],
    relatedEmotions: ["fear", "anxiety", "uncertainty"],
    relatedCallings: ["leader", "watchman", "builder"],
    relatedJourneys: ["journey_fear_to_courage"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.86,
    confidenceScore: 0.94,
    tags: ["fear", "write", "courage", "presence"],
    expectedFruit: ["honesty", "courage", "Scripture anchoring"]
  }),
  createActionStepSeed({
    id: "action_pray_for_guidance",
    slug: "pray-for-guidance",
    title: "Pray for Guidance",
    actionKey: "pray-for-guidance",
    actionText: "Ask God to show you the next faithful step, not the whole path at once.",
    actionType: "pray",
    difficulty: "easy",
    estimatedMinutes: 5,
    relatedScriptures: ["scripture_joshua_1_9", "scripture_romans_8_28"],
    relatedPromises: ["promise_courage", "promise_purpose"],
    relatedEmotions: ["fear", "uncertainty", "waiting"],
    relatedCallings: ["builder", "leader", "watchman", "servant"],
    relatedJourneys: ["journey_fear_to_courage", "journey_purpose_to_calling"],
    theologicalWeight: 0.89,
    pastoralSensitivity: 0.78,
    confidenceScore: 0.93,
    tags: ["guidance", "prayer", "next-step", "courage"],
    expectedFruit: ["wisdom", "peace", "clarity"]
  }),
  createActionStepSeed({
    id: "action_write_the_vision",
    slug: "write-the-vision",
    title: "Write the Vision",
    actionKey: "write-the-vision",
    actionText: "Write what you believe God may be forming in you, even if it is not complete yet.",
    actionType: "write",
    difficulty: "moderate",
    estimatedMinutes: 15,
    relatedScriptures: ["scripture_romans_8_28"],
    relatedPromises: ["promise_purpose", "promise_hope"],
    relatedEmotions: ["uncertainty", "waiting", "discouragement"],
    relatedCallings: ["builder", "teacher", "leader", "creator"],
    relatedJourneys: ["journey_purpose_to_calling"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.68,
    confidenceScore: 0.93,
    tags: ["vision", "purpose", "calling", "write"],
    expectedFruit: ["clarity", "purpose", "discernment"]
  }),
  createActionStepSeed({
    id: "action_list_gifts_and_burdens",
    slug: "list-gifts-and-burdens",
    title: "List Gifts and Burdens",
    actionKey: "list-gifts-and-burdens",
    actionText: "List three gifts, three burdens, and three opportunities that keep appearing in your life.",
    actionType: "reflect",
    difficulty: "moderate",
    estimatedMinutes: 20,
    relatedScriptures: ["scripture_romans_8_28"],
    relatedPromises: ["promise_purpose"],
    relatedEmotions: ["uncertainty", "waiting"],
    relatedCallings: ["builder", "teacher", "servant", "leader", "watchman"],
    relatedJourneys: ["journey_purpose_to_calling"],
    theologicalWeight: 0.88,
    pastoralSensitivity: 0.64,
    confidenceScore: 0.92,
    tags: ["calling", "gifts", "burdens", "reflection"],
    expectedFruit: ["self-awareness", "calling clarity", "discernment"]
  }),
  createActionStepSeed({
    id: "action_serve_one_person",
    slug: "serve-one-person",
    title: "Serve One Person",
    actionKey: "serve-one-person",
    actionText: "Choose one person you can serve quietly today as an act of faithfulness.",
    actionType: "serve",
    difficulty: "easy",
    estimatedMinutes: 15,
    relatedScriptures: ["scripture_romans_8_28", "scripture_isaiah_40_31"],
    relatedPromises: ["promise_purpose", "promise_strength"],
    relatedEmotions: ["discouragement", "waiting"],
    relatedCallings: ["servant"],
    relatedJourneys: ["journey_waiting_to_renewal", "journey_purpose_to_calling"],
    theologicalWeight: 0.87,
    pastoralSensitivity: 0.74,
    confidenceScore: 0.92,
    tags: ["service", "faithfulness", "purpose", "care"],
    expectedFruit: ["love", "faithfulness", "humility"]
  }),
  createActionStepSeed({
    id: "action_rest_in_god",
    slug: "rest-in-god",
    title: "Rest in God",
    actionKey: "rest-in-god",
    actionText: "Set aside a few quiet minutes today to stop striving and receive God's presence.",
    actionType: "rest",
    difficulty: "easy",
    estimatedMinutes: 10,
    relatedScriptures: ["scripture_isaiah_40_31"],
    relatedPromises: ["promise_strength", "promise_hope"],
    relatedEmotions: ["waiting", "discouragement", "weariness"],
    relatedCallings: ["servant", "intercessor"],
    relatedJourneys: ["journey_waiting_to_renewal"],
    theologicalWeight: 0.88,
    pastoralSensitivity: 0.86,
    confidenceScore: 0.93,
    tags: ["rest", "presence", "renewal", "waiting"],
    expectedFruit: ["rest", "peace", "renewed trust"]
  }),
  createActionStepSeed({
    id: "action_encourage_someone",
    slug: "encourage-someone",
    title: "Encourage Someone",
    actionKey: "encourage-someone",
    actionText: "Send one Scripture-based encouragement to someone who may need strength today.",
    actionType: "encourage",
    difficulty: "easy",
    estimatedMinutes: 10,
    relatedScriptures: ["scripture_isaiah_40_31", "scripture_joshua_1_9"],
    relatedPromises: ["promise_strength", "promise_courage", "promise_hope"],
    relatedEmotions: ["discouragement", "fear", "waiting"],
    relatedCallings: ["teacher", "servant", "leader"],
    relatedJourneys: ["journey_waiting_to_renewal", "journey_fear_to_courage"],
    theologicalWeight: 0.86,
    pastoralSensitivity: 0.72,
    confidenceScore: 0.91,
    tags: ["encouragement", "Scripture", "strength", "service"],
    expectedFruit: ["encouragement", "love", "shared strength"]
  }),
  createActionStepSeed({
    id: "action_stand_in_courage",
    slug: "stand-in-courage",
    title: "Stand in Courage",
    actionKey: "stand-in-courage",
    actionText:
      "Identify one place where fear has made you step back, then choose one faithful way to stand today.",
    actionType: "obey",
    difficulty: "challenging",
    estimatedMinutes: 20,
    relatedScriptures: ["scripture_joshua_1_9"],
    relatedPromises: ["promise_courage", "promise_strength"],
    relatedEmotions: ["fear", "anxiety", "uncertainty"],
    relatedCallings: ["leader", "watchman", "builder"],
    relatedJourneys: ["journey_fear_to_courage"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.84,
    confidenceScore: 0.93,
    tags: ["courage", "stand", "obedience", "fear"],
    expectedFruit: ["courage", "obedience", "steadfastness"]
  }),
  createActionStepSeed({
    id: "action_share_one_scripture",
    slug: "share-one-scripture",
    title: "Share One Scripture",
    actionKey: "share-one-scripture",
    actionText: "Share one Scripture that strengthened you with someone else today.",
    actionType: "share",
    difficulty: "easy",
    estimatedMinutes: 10,
    relatedScriptures: ["scripture_romans_8_28", "scripture_isaiah_40_31", "scripture_joshua_1_9"],
    relatedPromises: ["promise_purpose", "promise_strength", "promise_courage", "promise_hope"],
    relatedEmotions: ["discouragement", "waiting", "fear"],
    relatedCallings: ["teacher", "servant", "messenger"],
    relatedJourneys: ["journey_waiting_to_renewal", "journey_fear_to_courage", "journey_purpose_to_calling"],
    theologicalWeight: 0.87,
    pastoralSensitivity: 0.7,
    confidenceScore: 0.92,
    tags: ["share", "Scripture", "encouragement", "teaching"],
    expectedFruit: ["boldness", "encouragement", "multiplication"]
  })
];

export function getActionStepSeedById(id: string): ActionStepNode | undefined {
  return TIG_ACTION_STEP_SEEDS.find((actionStep) => actionStep.id === id);
}

export function getActionStepSeedByKey(actionKey: string): ActionStepNode | undefined {
  const normalizedKey = actionKey.trim().toLowerCase();
  return TIG_ACTION_STEP_SEEDS.find((actionStep) => {
    const seedActionStep = actionStep as ActionStepSeedNode;
    return seedActionStep.actionKey.toLowerCase() === normalizedKey;
  });
}

export function getActionStepsForEmotion(emotionKey: string): ActionStepNode[] {
  const normalizedKey = emotionKey.trim().toLowerCase();
  return TIG_ACTION_STEP_SEEDS.filter((actionStep) => {
    const seedActionStep = actionStep as ActionStepSeedNode;
    return seedActionStep.relatedEmotions.some((emotion) => emotion.toLowerCase() === normalizedKey);
  });
}

export function getActionStepsForPromise(promiseId: string): ActionStepNode[] {
  return TIG_ACTION_STEP_SEEDS.filter((actionStep) =>
    actionStep.promiseCategoryIds.includes(promiseId)
  );
}

export function getActionStepsForJourney(journeyId: string): ActionStepNode[] {
  return TIG_ACTION_STEP_SEEDS.filter((actionStep) => {
    const seedActionStep = actionStep as ActionStepSeedNode;
    return seedActionStep.relatedJourneys.includes(journeyId);
  });
}

export function getActionStepsForCalling(callingKey: string): ActionStepNode[] {
  const normalizedKey = callingKey.trim().toLowerCase();
  return TIG_ACTION_STEP_SEEDS.filter((actionStep) => {
    const seedActionStep = actionStep as ActionStepSeedNode;
    return seedActionStep.relatedCallings.some((calling) => calling.toLowerCase() === normalizedKey);
  });
}
