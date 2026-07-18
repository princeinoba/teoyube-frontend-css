import type { JourneyNode, JourneyStage } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as JourneyNode["sourceStatus"];

type JourneySeedStage = JourneyStage & {
  description: string;
  promiseIds: string[];
  wordIds: string[];
  prayerSequenceIds?: string[];
};

type JourneySeedNode = Omit<JourneyNode, "stages"> & {
  journeyName: string;
  startState: string;
  endState: string;
  estimatedDurationDays: number;
  stages: JourneySeedStage[];
  relatedScriptures: string[];
  relatedPromises: string[];
  relatedEmotions: string[];
  relatedCallings: string[];
  relatedWords: string[];
  relatedMilestones: string[];
};

const JOURNEY_SEED_DATA: JourneySeedNode[] = [
  {
    id: "journey_waiting_to_renewal",
    type: "JOURNEY",
    slug: "waiting-to-renewal",
    title: "Waiting to Renewal",
    description:
      "A journey for users who feel delayed, tired, or discouraged and need to rediscover strength through waiting on God.",
    summary: "A seven-day formation path from delay and weariness into renewed strength and trust.",
    tags: ["waiting", "renewal", "strength", "hope", "endurance"],
    aliases: ["waiting season", "renewed strength", "weakness to strength"],
    scriptureReferences: ["Isaiah 40:31", "Romans 8:28"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "INTERCESSOR"],
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.8,
    confidenceScore: 0.94,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    journeyKey: "waiting-to-renewal",
    journeyName: "Waiting to Renewal",
    fromState: "waiting",
    toState: "renewal",
    startState: "waiting",
    endState: "renewal",
    estimatedDurationDays: 7,
    estimatedDuration: { value: 7, unit: "days" },
    stages: [
      {
        id: "stage_waiting_to_renewal_name_the_waiting",
        title: "Name the Waiting",
        summary: "Recognize the area where you feel delayed or tired.",
        description: "Recognize the area where you feel delayed or tired.",
        order: 1,
        scriptureIds: ["scripture_isaiah_40_31"],
        promiseCategoryIds: ["promise_strength", "promise_hope"],
        promiseIds: ["promise_strength", "promise_hope"],
        wordIds: ["wait", "renew"],
        reflectionPromptIds: ["reflection_name_the_waiting"],
        actionStepIds: ["action_write_the_delay"],
        milestoneIds: ["milestone_waiting_named"]
      },
      {
        id: "stage_waiting_to_renewal_receive_strength",
        title: "Receive Strength",
        summary: "Allow Scripture to reframe waiting as a place of renewal, not abandonment.",
        description: "Allow Scripture to reframe waiting as a place of renewal, not abandonment.",
        order: 2,
        scriptureIds: ["scripture_isaiah_40_31"],
        promiseCategoryIds: ["promise_strength"],
        promiseIds: ["promise_strength"],
        wordIds: ["strength", "renew"],
        reflectionPromptIds: [],
        prayerSequenceIds: ["prayer_waiting_with_hope"],
        actionStepIds: ["action_pray_for_strength"],
        milestoneIds: ["milestone_strength_received"]
      },
      {
        id: "stage_waiting_to_renewal_walk_renewed",
        title: "Walk Renewed",
        summary: "Take one faithful step forward with renewed trust.",
        description: "Take one faithful step forward with renewed trust.",
        order: 3,
        scriptureIds: ["scripture_romans_8_28"],
        promiseCategoryIds: ["promise_purpose", "promise_hope"],
        promiseIds: ["promise_purpose", "promise_hope"],
        wordIds: ["faithful", "promise"],
        reflectionPromptIds: [],
        actionStepIds: ["action_take_one_obedient_step"],
        milestoneIds: []
      }
    ],
    relatedScriptureIds: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedPromiseCategoryIds: ["promise_strength", "promise_hope", "promise_purpose"],
    relatedEmotionIds: ["waiting", "discouragement", "weariness"],
    relatedCallingIds: ["servant", "teacher", "intercessor"],
    relatedTeoyubeWordIds: ["wait", "renew", "strength", "promise"],
    milestoneIds: ["milestone_waiting_named", "milestone_strength_received"],
    relatedScriptures: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedPromises: ["promise_strength", "promise_hope", "promise_purpose"],
    relatedEmotions: ["waiting", "discouragement", "weariness"],
    relatedCallings: ["servant", "teacher", "intercessor"],
    relatedWords: ["wait", "renew", "strength", "promise"],
    relatedMilestones: ["milestone_waiting_named", "milestone_strength_received"]
  },
  {
    id: "journey_fear_to_courage",
    type: "JOURNEY",
    slug: "fear-to-courage",
    title: "Fear to Courage",
    description:
      "A journey for users who feel afraid, anxious, or uncertain and need to move into courage through God's presence.",
    summary: "A five-day formation path from fear into courageous obedience anchored in God's presence.",
    tags: ["fear", "courage", "presence", "obedience", "guidance"],
    aliases: ["move through fear", "courage journey", "presence and courage"],
    scriptureReferences: ["Joshua 1:9", "Isaiah 40:31"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "LEADER"],
    theologicalWeight: 0.93,
    pastoralSensitivity: 0.85,
    confidenceScore: 0.95,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    journeyKey: "fear-to-courage",
    journeyName: "Fear to Courage",
    fromState: "fear",
    toState: "courage",
    startState: "fear",
    endState: "courage",
    estimatedDurationDays: 5,
    estimatedDuration: { value: 5, unit: "days" },
    stages: [
      {
        id: "stage_fear_to_courage_bring_fear_into_light",
        title: "Bring Fear Into the Light",
        summary: "Name the fear honestly before God.",
        description: "Name the fear honestly before God.",
        order: 1,
        scriptureIds: ["scripture_joshua_1_9"],
        promiseCategoryIds: ["promise_courage", "promise_strength"],
        promiseIds: ["promise_courage", "promise_strength"],
        wordIds: ["courage", "presence"],
        reflectionPromptIds: ["reflection_name_the_fear"],
        actionStepIds: ["action_write_the_fear"],
        milestoneIds: ["milestone_fear_named"]
      },
      {
        id: "stage_fear_to_courage_remember_gods_presence",
        title: "Remember God's Presence",
        summary: "Anchor courage in the promise that God is with you.",
        description: "Anchor courage in the promise that God is with you.",
        order: 2,
        scriptureIds: ["scripture_joshua_1_9"],
        promiseCategoryIds: ["promise_courage"],
        promiseIds: ["promise_courage"],
        wordIds: ["presence", "stand"],
        reflectionPromptIds: [],
        prayerSequenceIds: ["prayer_courage_and_presence"],
        actionStepIds: ["action_pray_for_guidance"],
        milestoneIds: []
      },
      {
        id: "stage_fear_to_courage_step_forward_in_obedience",
        title: "Step Forward in Obedience",
        summary: "Take one courageous step, not because fear is gone, but because God is present.",
        description: "Take one courageous step, not because fear is gone, but because God is present.",
        order: 3,
        scriptureIds: ["scripture_joshua_1_9"],
        promiseCategoryIds: ["promise_courage", "promise_guidance"],
        promiseIds: ["promise_courage", "promise_guidance"],
        wordIds: ["obey", "stand"],
        reflectionPromptIds: [],
        actionStepIds: ["action_take_one_obedient_step"],
        milestoneIds: ["milestone_courage_step_taken"]
      }
    ],
    relatedScriptureIds: ["scripture_joshua_1_9", "scripture_isaiah_40_31"],
    relatedPromiseCategoryIds: ["promise_courage", "promise_strength", "promise_guidance"],
    relatedEmotionIds: ["fear", "anxiety", "uncertainty"],
    relatedCallingIds: ["leader", "watchman", "builder"],
    relatedTeoyubeWordIds: ["courage", "stand", "presence", "obey"],
    milestoneIds: ["milestone_fear_named", "milestone_courage_step_taken"],
    relatedScriptures: ["scripture_joshua_1_9", "scripture_isaiah_40_31"],
    relatedPromises: ["promise_courage", "promise_strength", "promise_guidance"],
    relatedEmotions: ["fear", "anxiety", "uncertainty"],
    relatedCallings: ["leader", "watchman", "builder"],
    relatedWords: ["courage", "stand", "presence", "obey"],
    relatedMilestones: ["milestone_fear_named", "milestone_courage_step_taken"]
  },
  {
    id: "journey_purpose_to_calling",
    type: "JOURNEY",
    slug: "purpose-to-calling",
    title: "Purpose to Calling",
    description:
      "A journey for users who want to understand their purpose and begin walking in their kingdom calling.",
    summary: "A ten-day formation path from purpose recognition into a first faithful calling step.",
    tags: ["purpose", "calling", "discernment", "obedience", "faithfulness"],
    aliases: ["calling journey", "discover purpose", "purpose discernment"],
    scriptureReferences: ["Romans 8:28", "Joshua 1:9"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "LEADER"],
    theologicalWeight: 0.94,
    pastoralSensitivity: 0.7,
    confidenceScore: 0.94,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    journeyKey: "purpose-to-calling",
    journeyName: "Purpose to Calling",
    fromState: "purpose",
    toState: "calling",
    startState: "purpose",
    endState: "calling",
    estimatedDurationDays: 10,
    estimatedDuration: { value: 10, unit: "days" },
    stages: [
      {
        id: "stage_purpose_to_calling_recognize_gods_work",
        title: "Recognize God's Work",
        summary: "Begin with the truth that God works through all things for His purpose.",
        description: "Begin with the truth that God works through all things for His purpose.",
        order: 1,
        scriptureIds: ["scripture_romans_8_28"],
        promiseCategoryIds: ["promise_purpose", "promise_hope"],
        promiseIds: ["promise_purpose", "promise_hope"],
        wordIds: ["purpose", "faithful"],
        reflectionPromptIds: ["reflection_where_is_god_working"],
        actionStepIds: ["action_write_the_vision"],
        milestoneIds: ["milestone_purpose_recognized"]
      },
      {
        id: "stage_purpose_to_calling_discern_the_pattern",
        title: "Discern the Pattern",
        summary: "Notice repeated desires, gifts, burdens, and opportunities.",
        description: "Notice repeated desires, gifts, burdens, and opportunities.",
        order: 2,
        scriptureIds: ["scripture_romans_8_28"],
        promiseCategoryIds: ["promise_purpose"],
        promiseIds: ["promise_purpose"],
        wordIds: ["calling", "promise"],
        reflectionPromptIds: ["reflection_notice_patterns"],
        actionStepIds: ["action_list_gifts_and_burdens"],
        milestoneIds: []
      },
      {
        id: "stage_purpose_to_calling_take_first_faithful_step",
        title: "Take the First Faithful Step",
        summary: "Move from discovery into obedience through one clear action.",
        description: "Move from discovery into obedience through one clear action.",
        order: 3,
        scriptureIds: ["scripture_joshua_1_9"],
        promiseCategoryIds: ["promise_courage", "promise_purpose"],
        promiseIds: ["promise_courage", "promise_purpose"],
        wordIds: ["obey", "stand"],
        reflectionPromptIds: [],
        actionStepIds: ["action_take_one_obedient_step"],
        milestoneIds: ["milestone_first_calling_step"]
      }
    ],
    relatedScriptureIds: ["scripture_romans_8_28", "scripture_joshua_1_9"],
    relatedPromiseCategoryIds: ["promise_purpose", "promise_courage", "promise_hope"],
    relatedEmotionIds: ["uncertainty", "waiting", "discouragement"],
    relatedCallingIds: ["builder", "teacher", "servant", "leader", "watchman"],
    relatedTeoyubeWordIds: ["purpose", "calling", "faithful", "obey"],
    milestoneIds: ["milestone_purpose_recognized", "milestone_first_calling_step"],
    relatedScriptures: ["scripture_romans_8_28", "scripture_joshua_1_9"],
    relatedPromises: ["promise_purpose", "promise_courage", "promise_hope"],
    relatedEmotions: ["uncertainty", "waiting", "discouragement"],
    relatedCallings: ["builder", "teacher", "servant", "leader", "watchman"],
    relatedWords: ["purpose", "calling", "faithful", "obey"],
    relatedMilestones: ["milestone_purpose_recognized", "milestone_first_calling_step"]
  }
];

export const TIG_JOURNEY_SEEDS: JourneyNode[] = JOURNEY_SEED_DATA;

export function getJourneySeedById(id: string): JourneyNode | undefined {
  return TIG_JOURNEY_SEEDS.find((journey) => journey.id === id);
}

export function getJourneySeedByKey(journeyKey: string): JourneyNode | undefined {
  const normalizedKey = journeyKey.trim().toLowerCase();
  return TIG_JOURNEY_SEEDS.find((journey) => journey.journeyKey.toLowerCase() === normalizedKey);
}
