import type { PrayerSequenceNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as PrayerSequenceNode["sourceStatus"];

type PrayerTone = "hopeful" | "bold" | "encouraging" | "reflective" | "surrendered";

type PrayerSequenceSeedNode = PrayerSequenceNode & {
  sequenceName: string;
  opening: string;
  scriptureAnchor: string;
  confession: string;
  petition: string;
  declaration: string;
  surrender: string;
  thanksgiving: string;
  closing: string;
  relatedScriptures: string[];
  relatedPromises: string[];
  relatedEmotions: string[];
  relatedCallings: string[];
  relatedWords: string[];
  tone: PrayerTone;
};

type PrayerSequenceSeedInput = {
  id: string;
  slug: string;
  sequenceKey: string;
  sequenceName: string;
  title: string;
  description: string;
  opening: string;
  scriptureAnchor: string;
  confession: string;
  petition: string;
  declaration: string;
  surrender: string;
  thanksgiving: string;
  closing: string;
  relatedScriptures: string[];
  relatedPromises: string[];
  relatedEmotions: string[];
  relatedCallings: string[];
  relatedWords: string[];
  tone: PrayerTone;
  theologicalWeight: number;
  pastoralSensitivity: number;
  confidenceScore: number;
  tags: string[];
};

function createPrayerSequenceSeed(input: PrayerSequenceSeedInput): PrayerSequenceSeedNode {
  const steps = [
    input.opening,
    input.scriptureAnchor,
    input.confession,
    input.petition,
    input.declaration,
    input.surrender,
    input.thanksgiving,
    input.closing
  ];

  return {
    id: input.id,
    type: "PRAYER_SEQUENCE",
    slug: input.slug,
    title: input.title,
    description: input.description,
    summary: `${input.sequenceName} is a ${input.tone} prayer sequence anchored in Scripture.`,
    tags: input.tags,
    aliases: [input.sequenceName, ...input.relatedEmotions, ...input.relatedPromises],
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
    sequenceKey: input.sequenceKey,
    sequenceName: input.sequenceName,
    steps,
    opening: input.opening,
    scriptureAnchor: input.scriptureAnchor,
    confession: input.confession,
    petition: input.petition,
    declaration: input.declaration,
    surrender: input.surrender,
    thanksgiving: input.thanksgiving,
    closingDeclaration: input.closing,
    closing: input.closing,
    openingScriptureId: input.relatedScriptures[0] || "",
    anchorScriptureIds: input.relatedScriptures,
    promiseCategoryIds: input.relatedPromises,
    relatedScriptures: input.relatedScriptures,
    relatedPromises: input.relatedPromises,
    relatedEmotions: input.relatedEmotions,
    relatedCallings: input.relatedCallings,
    relatedWords: input.relatedWords,
    tone: input.tone
  };
}

export const TIG_PRAYER_SEQUENCE_SEEDS: PrayerSequenceNode[] = [
  createPrayerSequenceSeed({
    id: "prayer_waiting_with_hope",
    slug: "waiting-with-hope",
    sequenceKey: "waiting-with-hope",
    sequenceName: "Waiting With Hope",
    title: "Waiting With Hope",
    description:
      "A prayer sequence for users who feel delayed, tired, or uncertain while waiting on God.",
    opening: "Father, I come to You in this waiting season.",
    scriptureAnchor: "Your Word says that they that wait upon the Lord shall renew their strength.",
    confession: "I confess that waiting can make me feel tired, delayed, and uncertain.",
    petition: "Renew my strength, restore my hope, and help me trust Your timing.",
    declaration: "I believe that waiting on You is not wasted.",
    surrender: "I surrender my need to control the timing and outcome.",
    thanksgiving: "Thank You for strengthening me even before I see the full answer.",
    closing: "In Jesus' name, amen.",
    relatedScriptures: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedPromises: ["promise_strength", "promise_hope", "promise_purpose"],
    relatedEmotions: ["waiting", "discouragement", "weariness"],
    relatedCallings: ["servant", "teacher", "intercessor"],
    relatedWords: ["wait", "renew", "strength", "hope"],
    tone: "hopeful",
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.82,
    confidenceScore: 0.95,
    tags: ["waiting", "hope", "renewal", "strength"]
  }),
  createPrayerSequenceSeed({
    id: "prayer_courage_and_presence",
    slug: "courage-and-presence",
    sequenceKey: "courage-and-presence",
    sequenceName: "Courage and Presence",
    title: "Courage and Presence",
    description: "A prayer sequence for users facing fear, uncertainty, or a step of obedience.",
    opening: "Father, I come to You with the fear I am carrying.",
    scriptureAnchor:
      "Your Word says, Be strong and of a good courage, for You are with me wherever I go.",
    confession: "I confess that fear has made me hesitant to move forward.",
    petition: "Give me courage rooted in Your presence and help me obey one step at a time.",
    declaration: "I am not alone, because You are with me.",
    surrender:
      "I surrender fear, hesitation, and the need to know every detail before I obey.",
    thanksgiving: "Thank You for Your presence, guidance, and strength.",
    closing: "In Jesus' name, amen.",
    relatedScriptures: ["scripture_joshua_1_9"],
    relatedPromises: ["promise_courage", "promise_strength"],
    relatedEmotions: ["fear", "anxiety", "uncertainty"],
    relatedCallings: ["leader", "watchman", "builder"],
    relatedWords: ["courage", "presence", "stand", "obey"],
    tone: "bold",
    theologicalWeight: 0.93,
    pastoralSensitivity: 0.84,
    confidenceScore: 0.95,
    tags: ["courage", "fear", "presence", "obedience"]
  }),
  createPrayerSequenceSeed({
    id: "prayer_strength_in_discouragement",
    slug: "strength-in-discouragement",
    sequenceKey: "strength-in-discouragement",
    sequenceName: "Strength in Discouragement",
    title: "Strength in Discouragement",
    description: "A prayer sequence for users who feel weary, forgotten, or ready to give up.",
    opening: "Father, I bring my discouragement before You.",
    scriptureAnchor: "Your Word promises renewal and strength to those who wait upon You.",
    confession: "I confess that I feel tired, unseen, and unsure how to keep going.",
    petition: "Strengthen my heart, renew my hope, and help me remember that You are faithful.",
    declaration: "My discouragement is not greater than Your promise.",
    surrender: "I surrender despair, heaviness, and every thought that says nothing will change.",
    thanksgiving: "Thank You for meeting me with mercy and strength.",
    closing: "In Jesus' name, amen.",
    relatedScriptures: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedPromises: ["promise_strength", "promise_hope", "promise_purpose"],
    relatedEmotions: ["discouragement", "waiting", "weariness"],
    relatedCallings: ["servant", "teacher", "intercessor"],
    relatedWords: ["renew", "strength", "faithful", "promise"],
    tone: "encouraging",
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.88,
    confidenceScore: 0.94,
    tags: ["discouragement", "strength", "hope", "faithful"]
  }),
  createPrayerSequenceSeed({
    id: "prayer_purpose_and_calling",
    slug: "purpose-and-calling",
    sequenceKey: "purpose-and-calling",
    sequenceName: "Purpose and Calling",
    title: "Purpose and Calling",
    description: "A prayer sequence for users seeking clarity about their purpose, gifts, and calling.",
    opening: "Father, I come to You seeking clarity and obedience.",
    scriptureAnchor:
      "Your Word says that all things work together for good to them who love You and are called according to Your purpose.",
    confession:
      "I confess that I do not always understand my path or recognize what You are forming in me.",
    petition:
      "Reveal the patterns of purpose, gifts, burdens, and opportunities You have placed in my life.",
    declaration: "I believe You are working through my life with purpose.",
    surrender: "I surrender comparison, confusion, and fear of starting.",
    thanksgiving: "Thank You for calling me to walk faithfully with You.",
    closing: "In Jesus' name, amen.",
    relatedScriptures: ["scripture_romans_8_28", "scripture_joshua_1_9"],
    relatedPromises: ["promise_purpose", "promise_courage", "promise_hope"],
    relatedEmotions: ["uncertainty", "waiting", "discouragement"],
    relatedCallings: ["builder", "teacher", "servant", "leader", "watchman"],
    relatedWords: ["purpose", "calling", "faithful", "obey"],
    tone: "reflective",
    theologicalWeight: 0.94,
    pastoralSensitivity: 0.74,
    confidenceScore: 0.94,
    tags: ["purpose", "calling", "gifts", "obedience"]
  }),
  createPrayerSequenceSeed({
    id: "prayer_guidance_for_next_step",
    slug: "guidance-for-next-step",
    sequenceKey: "guidance-for-next-step",
    sequenceName: "Guidance for the Next Step",
    title: "Guidance for the Next Step",
    description:
      "A prayer sequence for users who need wisdom, courage, and direction for one faithful next step.",
    opening: "Father, I come to You asking for guidance.",
    scriptureAnchor:
      "Your Word shows that courage and obedience grow when I trust Your presence.",
    confession: "I confess that I sometimes want the whole path before taking the next step.",
    petition: "Give me wisdom for today and courage to obey the next step You reveal.",
    declaration: "I can move forward because You are with me.",
    surrender: "I surrender confusion, delay, and fear of making the wrong move.",
    thanksgiving: "Thank You for leading me with patience and faithfulness.",
    closing: "In Jesus' name, amen.",
    relatedScriptures: ["scripture_joshua_1_9", "scripture_romans_8_28"],
    relatedPromises: ["promise_courage", "promise_purpose", "promise_strength"],
    relatedEmotions: ["uncertainty", "fear", "waiting"],
    relatedCallings: ["builder", "leader", "servant", "watchman"],
    relatedWords: ["obey", "stand", "courage", "purpose"],
    tone: "surrendered",
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.76,
    confidenceScore: 0.93,
    tags: ["guidance", "next-step", "obedience", "courage"]
  })
];

export function getPrayerSequenceSeedById(id: string): PrayerSequenceNode | undefined {
  return TIG_PRAYER_SEQUENCE_SEEDS.find((sequence) => sequence.id === id);
}

export function getPrayerSequenceSeedByKey(sequenceKey: string): PrayerSequenceNode | undefined {
  const normalizedKey = sequenceKey.trim().toLowerCase();
  return TIG_PRAYER_SEQUENCE_SEEDS.find((sequence) => sequence.sequenceKey.toLowerCase() === normalizedKey);
}

export function getPrayerSequencesForEmotion(emotionKey: string): PrayerSequenceNode[] {
  const normalizedKey = emotionKey.trim().toLowerCase();
  return TIG_PRAYER_SEQUENCE_SEEDS.filter((sequence) => {
    const seedSequence = sequence as PrayerSequenceSeedNode;
    return seedSequence.relatedEmotions.some((emotion) => emotion.toLowerCase() === normalizedKey);
  });
}

export function getPrayerSequencesForPromise(promiseId: string): PrayerSequenceNode[] {
  return TIG_PRAYER_SEQUENCE_SEEDS.filter((sequence) =>
    sequence.promiseCategoryIds.includes(promiseId)
  );
}

export function getPrayerSequencesForCalling(callingKey: string): PrayerSequenceNode[] {
  const normalizedKey = callingKey.trim().toLowerCase();
  return TIG_PRAYER_SEQUENCE_SEEDS.filter((sequence) => {
    const seedSequence = sequence as PrayerSequenceSeedNode;
    return seedSequence.relatedCallings.some((calling) => calling.toLowerCase() === normalizedKey);
  });
}
