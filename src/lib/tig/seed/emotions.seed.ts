import type { EmotionProfileNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as EmotionProfileNode["sourceStatus"];

type EmotionSensitivityLevel = "low" | "medium" | "high";
type EmotionPastoralResponseTone = "strengthening" | "encouraging" | "hopeful";

type EmotionSeedNode = EmotionProfileNode & {
  emotionalState: string;
  sensitivityLevel: EmotionSensitivityLevel;
  pastoralResponseTone: EmotionPastoralResponseTone;
  relatedPromiseIds: string[];
  relatedScriptureIds: string[];
  relatedTeoyubeWordIds: string[];
  relatedJourneyIds: string[];
  relatedPrayerSequenceIds: string[];
};

const EMOTION_SEED_DATA: EmotionSeedNode[] = [
  {
    id: "emotion_fear",
    type: "EMOTION_PROFILE",
    slug: "fear",
    title: "Fear",
    description: "A user state marked by fear, worry, anxiety, or hesitation before an uncertain next step.",
    summary: "Fear is treated as an emotional signal that should be answered with Scripture, courage, presence, and strength.",
    tags: ["fear", "anxiety", "courage", "presence", "strength"],
    aliases: ["afraid", "scared", "worried", "anxious"],
    scriptureReferences: ["Joshua 1:9", "Isaiah 40:31"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "LEADER"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.85,
    confidenceScore: 0.95,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    emotionKey: "fear",
    emotionalState: "fear",
    sensitivityLevel: "medium",
    pastoralResponseTone: "strengthening",
    userPhrases: [
      "I am afraid",
      "I feel scared",
      "I am worried",
      "I feel anxious",
      "I do not know what will happen",
      "I am afraid to start"
    ],
    phraseMatchers: [
      "afraid",
      "scared",
      "worried",
      "anxious",
      "do not know what will happen",
      "afraid to start"
    ],
    pastoralFrame: "Strengthen the user with God's presence and a Scripture-grounded next step.",
    truthBoundary: "CLASSIFIES_STATE_DOES_NOT_DEFINE_TRUTH",
    recommendedPromiseCategoryIds: ["courage", "presence", "strength", "guidance"],
    recommendedScriptureIds: ["scripture_joshua_1_9", "scripture_isaiah_40_31"],
    relatedPromiseIds: ["courage", "presence", "strength", "guidance"],
    relatedScriptureIds: ["scripture_joshua_1_9", "scripture_isaiah_40_31"],
    relatedTeoyubeWordIds: ["courage", "stand", "presence", "obey"],
    relatedJourneyIds: ["fear-to-courage"],
    relatedPrayerSequenceIds: ["prayer_courage_and_presence"]
  },
  {
    id: "emotion_discouragement",
    type: "EMOTION_PROFILE",
    slug: "discouragement",
    title: "Discouragement",
    description: "A user state marked by reduced hope, weariness, feeling stuck, or wanting to give up.",
    summary: "Discouragement is met with encouragement, renewed strength, restoration, and purpose anchored in Scripture.",
    tags: ["discouragement", "hope", "strength", "restoration", "purpose"],
    aliases: ["stuck", "tired", "forgotten", "give up"],
    scriptureReferences: ["Isaiah 40:31", "Romans 8:28"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "INTERCESSOR"],
    theologicalWeight: 0.88,
    pastoralSensitivity: 0.8,
    confidenceScore: 0.94,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    emotionKey: "discouragement",
    emotionalState: "discouragement",
    sensitivityLevel: "medium",
    pastoralResponseTone: "encouraging",
    userPhrases: [
      "I feel discouraged",
      "I feel stuck",
      "I want to give up",
      "Nothing is changing",
      "I feel tired",
      "I feel forgotten"
    ],
    phraseMatchers: [
      "discouraged",
      "stuck",
      "give up",
      "nothing is changing",
      "tired",
      "forgotten"
    ],
    pastoralFrame: "Encourage the user with hope, renewed strength, and God's faithful purpose.",
    truthBoundary: "CLASSIFIES_STATE_DOES_NOT_DEFINE_TRUTH",
    recommendedPromiseCategoryIds: ["hope", "strength", "restoration", "purpose"],
    recommendedScriptureIds: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedPromiseIds: ["hope", "strength", "restoration", "purpose"],
    relatedScriptureIds: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedTeoyubeWordIds: ["renew", "faithful", "promise", "stand"],
    relatedJourneyIds: ["waiting-to-renewal", "purpose-to-calling"],
    relatedPrayerSequenceIds: ["prayer_strength_in_discouragement"]
  },
  {
    id: "emotion_waiting",
    type: "EMOTION_PROFILE",
    slug: "waiting",
    title: "Waiting",
    description: "A user state marked by delay, longing, unfinished transition, or the need for patience.",
    summary: "Waiting is guided toward hope, endurance, renewal, and purpose through Scripture.",
    tags: ["waiting", "renewal", "endurance", "hope", "purpose"],
    aliases: ["delayed", "waiting season", "need patience", "no progress"],
    scriptureReferences: ["Isaiah 40:31", "Romans 8:28"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "INTERCESSOR"],
    theologicalWeight: 0.87,
    pastoralSensitivity: 0.75,
    confidenceScore: 0.93,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    emotionKey: "waiting",
    emotionalState: "waiting",
    sensitivityLevel: "low",
    pastoralResponseTone: "hopeful",
    userPhrases: [
      "I am waiting",
      "I feel delayed",
      "God is taking too long",
      "I do not see progress",
      "I am in a waiting season",
      "I need patience"
    ],
    phraseMatchers: [
      "waiting",
      "delayed",
      "taking too long",
      "do not see progress",
      "waiting season",
      "need patience"
    ],
    pastoralFrame: "Help the user wait with hope, endurance, prayer, and readiness for renewal.",
    truthBoundary: "CLASSIFIES_STATE_DOES_NOT_DEFINE_TRUTH",
    recommendedPromiseCategoryIds: ["renewal", "endurance", "hope", "purpose"],
    recommendedScriptureIds: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedPromiseIds: ["renewal", "endurance", "hope", "purpose"],
    relatedScriptureIds: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedTeoyubeWordIds: ["wait", "renew", "strength", "promise"],
    relatedJourneyIds: ["waiting-to-renewal", "waiting-to-purpose"],
    relatedPrayerSequenceIds: ["prayer_waiting_with_hope"]
  }
];

export const TIG_EMOTION_SEEDS: EmotionProfileNode[] = EMOTION_SEED_DATA;

export function getEmotionSeedById(id: string): EmotionProfileNode | undefined {
  return TIG_EMOTION_SEEDS.find((emotion) => emotion.id === id);
}

export function getEmotionSeedByKey(emotionKey: string): EmotionProfileNode | undefined {
  const normalizedKey = emotionKey.trim().toLowerCase();
  return TIG_EMOTION_SEEDS.find((emotion) => emotion.emotionKey.toLowerCase() === normalizedKey);
}
