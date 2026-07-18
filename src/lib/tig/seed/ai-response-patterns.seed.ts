import type { AIResponsePatternNode, TIGAIMode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as AIResponsePatternNode["sourceStatus"];

type ResponseTone = "encouraging" | "reflective" | "pastoral" | "instructional" | "gentle";

type TemplateStructure = {
  opening: string;
  scriptureBridge: string;
  promiseExplanation: string;
  prayerLeadIn: string;
  actionLeadIn: string;
};

type AIResponsePatternSeedNode = AIResponsePatternNode & {
  patternKey: string;
  patternName: string;
  supportedModes: TIGAIMode[];
  intentMatches: string[];
  emotionMatches: string[];
  promiseMatches: string[];
  callingMatches: string[];
  responseTone: ResponseTone;
  templateStructure: TemplateStructure;
};

type AIResponsePatternSeedInput = {
  id: string;
  slug: string;
  patternKey: string;
  patternName: string;
  supportedModes: TIGAIMode[];
  intentMatches: string[];
  emotionMatches: string[];
  promiseMatches: string[];
  callingMatches: string[];
  responseTone: ResponseTone;
  templateStructure: TemplateStructure;
  theologicalWeight: number;
  pastoralSensitivity: number;
  confidenceScore: number;
  tags: string[];
};

function mapTone(tone: ResponseTone): AIResponsePatternNode["tone"] {
  if (tone === "pastoral") return "PASTORAL";
  if (tone === "reflective") return "REFLECTIVE";
  if (tone === "instructional") return "TEACHING";
  if (tone === "encouraging" || tone === "gentle") return "ENCOURAGING";
  return "PASTORAL";
}

function createAIResponsePatternSeed(input: AIResponsePatternSeedInput): AIResponsePatternSeedNode {
  return {
    id: input.id,
    type: "AI_RESPONSE_PATTERN",
    slug: input.slug,
    title: input.patternName,
    description: input.templateStructure.opening,
    summary: input.templateStructure.promiseExplanation,
    tags: input.tags,
    aliases: [input.patternKey, ...input.intentMatches, ...input.emotionMatches],
    scriptureReferences: [],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE"],
    theologicalWeight: input.theologicalWeight,
    pastoralSensitivity: input.pastoralSensitivity,
    confidenceScore: input.confidenceScore,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    mode: input.supportedModes[0],
    tone: mapTone(input.responseTone),
    requiredScriptureAnchorCount: 1,
    template: [
      input.templateStructure.opening,
      input.templateStructure.scriptureBridge,
      input.templateStructure.promiseExplanation,
      input.templateStructure.prayerLeadIn,
      input.templateStructure.actionLeadIn
    ].join("\n"),
    guardrails: [
      "Every response must include at least one ScriptureNode.",
      "Emotion detection may classify state but must never define truth.",
      "Prayer, reflection, and action should remain Scripture-grounded."
    ],
    patternKey: input.patternKey,
    patternName: input.patternName,
    supportedModes: input.supportedModes,
    intentMatches: input.intentMatches,
    emotionMatches: input.emotionMatches,
    promiseMatches: input.promiseMatches,
    callingMatches: input.callingMatches,
    responseTone: input.responseTone,
    templateStructure: input.templateStructure
  };
}

export const TIG_AI_RESPONSE_PATTERN_SEEDS: AIResponsePatternNode[] = [
  createAIResponsePatternSeed({
    id: "ai_pattern_encouragement_response",
    slug: "encouragement-response",
    patternKey: "encouragement-response",
    patternName: "Encouragement Response",
    supportedModes: ["promise_search", "ai_companion"],
    intentMatches: ["seeking_encouragement", "seeking_scripture"],
    emotionMatches: ["fear", "discouragement", "waiting"],
    promiseMatches: ["promise_strength", "promise_hope", "promise_courage", "promise_purpose"],
    callingMatches: [],
    responseTone: "encouraging",
    templateStructure: {
      opening:
        "From what you shared, this sounds like a season where your heart needs Scripture-backed encouragement.",
      scriptureBridge: "The strongest Scripture connection is:",
      promiseExplanation: "This promise shows that God is present, faithful, and still working.",
      prayerLeadIn: "Here is a prayer you can pray:",
      actionLeadIn: "Here is one faithful next step:"
    },
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.86,
    confidenceScore: 0.94,
    tags: ["encouragement", "promise-search", "ai-companion", "pastoral"]
  }),
  createAIResponsePatternSeed({
    id: "ai_pattern_calling_discernment_response",
    slug: "calling-discernment-response",
    patternKey: "calling-discernment-response",
    patternName: "Calling Discernment Response",
    supportedModes: ["calling_compass", "ai_companion"],
    intentMatches: ["seeking_calling", "seeking_guidance"],
    emotionMatches: ["uncertainty", "waiting", "discouragement"],
    promiseMatches: ["promise_purpose", "promise_courage"],
    callingMatches: ["builder", "teacher", "servant", "leader", "watchman"],
    responseTone: "reflective",
    templateStructure: {
      opening: "Teoyube detected calling-related language in what you shared.",
      scriptureBridge:
        "Your calling must be discerned through Scripture, not pressure or comparison.",
      promiseExplanation:
        "God often reveals calling through repeated gifts, burdens, opportunities, and faithful obedience.",
      prayerLeadIn: "Here is a prayer for clarity and obedience:",
      actionLeadIn: "Here is one calling reflection step:"
    },
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.72,
    confidenceScore: 0.93,
    tags: ["calling", "discernment", "reflection", "compass"]
  }),
  createAIResponsePatternSeed({
    id: "ai_pattern_prayer_response",
    slug: "prayer-response",
    patternKey: "prayer-response",
    patternName: "Prayer Response",
    supportedModes: ["prayer"],
    intentMatches: ["seeking_prayer"],
    emotionMatches: ["fear", "discouragement", "waiting", "uncertainty"],
    promiseMatches: ["promise_strength", "promise_hope", "promise_courage", "promise_purpose"],
    callingMatches: [],
    responseTone: "pastoral",
    templateStructure: {
      opening: "Here is a Scripture-grounded prayer for your current season.",
      scriptureBridge: "This prayer is anchored in God's Word.",
      promiseExplanation: "The prayer responds to the promise connected to your need.",
      prayerLeadIn: "Pray this slowly and honestly:",
      actionLeadIn: "After praying, take this small step:"
    },
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.9,
    confidenceScore: 0.94,
    tags: ["prayer", "pastoral", "Scripture", "grounding"]
  }),
  createAIResponsePatternSeed({
    id: "ai_pattern_journey_guidance_response",
    slug: "journey-guidance-response",
    patternKey: "journey-guidance-response",
    patternName: "Journey Guidance Response",
    supportedModes: ["growth_journey"],
    intentMatches: ["seeking_guidance", "seeking_encouragement", "seeking_calling"],
    emotionMatches: ["waiting", "fear", "discouragement"],
    promiseMatches: ["promise_strength", "promise_courage", "promise_purpose", "promise_hope"],
    callingMatches: ["builder", "teacher", "servant", "leader", "watchman"],
    responseTone: "instructional",
    templateStructure: {
      opening: "Teoyube detected that this may be part of a growth journey.",
      scriptureBridge: "The journey must remain anchored in Scripture.",
      promiseExplanation:
        "This path connects your current state to God's promise, reflection, and faithful action.",
      prayerLeadIn: "Here is a prayer for this journey:",
      actionLeadIn: "Begin with this next step:"
    },
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.78,
    confidenceScore: 0.93,
    tags: ["journey", "guidance", "growth", "instruction"]
  }),
  createAIResponsePatternSeed({
    id: "ai_pattern_daily_word_response",
    slug: "daily-word-response",
    patternKey: "daily-word-response",
    patternName: "Daily Word Response",
    supportedModes: ["daily_word"],
    intentMatches: ["seeking_scripture", "seeking_encouragement"],
    emotionMatches: [],
    promiseMatches: [],
    callingMatches: [],
    responseTone: "gentle",
    templateStructure: {
      opening: "Today's Teoyube Word is anchored in Scripture.",
      scriptureBridge: "The Scripture foundation is:",
      promiseExplanation: "This word invites you to remember God's faithfulness today.",
      prayerLeadIn: "Here is a short prayer:",
      actionLeadIn: "Carry this word through one action today:"
    },
    theologicalWeight: 0.88,
    pastoralSensitivity: 0.8,
    confidenceScore: 0.92,
    tags: ["daily-word", "gentle", "Scripture", "formation"]
  })
];

export function getAIResponsePatternSeedById(id: string): AIResponsePatternNode | undefined {
  return TIG_AI_RESPONSE_PATTERN_SEEDS.find((pattern) => pattern.id === id);
}

export function getAIResponsePatternSeedByKey(patternKey: string): AIResponsePatternNode | undefined {
  const normalizedKey = patternKey.trim().toLowerCase();
  return TIG_AI_RESPONSE_PATTERN_SEEDS.find((pattern) => {
    const seedPattern = pattern as AIResponsePatternSeedNode;
    return seedPattern.patternKey.toLowerCase() === normalizedKey;
  });
}

export function getAIResponsePatternsForMode(mode: string): AIResponsePatternNode[] {
  return TIG_AI_RESPONSE_PATTERN_SEEDS.filter((pattern) => {
    const seedPattern = pattern as AIResponsePatternSeedNode;
    return seedPattern.supportedModes.includes(mode as TIGAIMode);
  });
}

export function getAIResponsePatternsForIntent(intent: string): AIResponsePatternNode[] {
  const normalizedIntent = intent.trim().toLowerCase();
  return TIG_AI_RESPONSE_PATTERN_SEEDS.filter((pattern) => {
    const seedPattern = pattern as AIResponsePatternSeedNode;
    return seedPattern.intentMatches.some((match) => match.toLowerCase() === normalizedIntent);
  });
}
