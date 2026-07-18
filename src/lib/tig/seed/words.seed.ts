import type { TeoyubeWordNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as TeoyubeWordNode["sourceStatus"];

type WordLevel = "beginner" | "intermediate" | "advanced";

type WordSeedNode = TeoyubeWordNode & {
  meaning: string;
  scriptureRoot: string;
  promiseRoot?: string;
  wordLevel: WordLevel;
  wordRank: number;
  categories: string[];
  promiseClusters: string[];
  relatedWords: string[];
  visualSymbol?: string;
  animationSymbol?: string;
  canonicalRelevance: number;
};

type WordSeedInput = {
  id: string;
  slug: string;
  word: string;
  meaning: string;
  scriptureRoot: string;
  promiseRoot?: string;
  wordLevel: WordLevel;
  wordRank: number;
  categories: string[];
  promiseClusters: string[];
  relatedWords: string[];
  grammarRole: TeoyubeWordNode["grammarRole"];
  visualSymbol: string;
  animationSymbol: string;
  theologicalWeight: number;
  pastoralSensitivity: number;
  confidenceScore: number;
  canonicalRelevance: number;
};

function createWordSeed(input: WordSeedInput): WordSeedNode {
  return {
    id: input.id,
    type: "TEOYUBE_WORD",
    slug: input.slug,
    title: input.word,
    description: input.meaning,
    summary: `${input.word} is a Teoyube word rooted in ${input.scriptureRoot}.`,
    tags: input.categories,
    aliases: input.relatedWords,
    scriptureReferences: [input.scriptureRoot],
    level: input.wordLevel === "intermediate" ? "GROWTH" : "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE"],
    theologicalWeight: input.theologicalWeight,
    pastoralSensitivity: input.pastoralSensitivity,
    confidenceScore: input.confidenceScore,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    word: input.word,
    meaning: input.meaning,
    scriptureRoot: input.scriptureRoot,
    promiseRoot: input.promiseRoot,
    wordLevel: input.wordLevel,
    wordRank: input.wordRank,
    rank: input.wordRank,
    categories: input.categories,
    promiseClusters: input.promiseClusters,
    promiseClusterIds: input.promiseClusters.map((cluster) =>
      cluster.startsWith("promise_") ? cluster : `promise_${cluster}`
    ),
    relatedWords: input.relatedWords,
    grammarRole: input.grammarRole,
    symbols: [input.visualSymbol, input.animationSymbol],
    visualSymbol: input.visualSymbol,
    animationSymbol: input.animationSymbol,
    visualMetadata: {
      symbol: input.visualSymbol,
      icon: input.visualSymbol
    },
    rootMeaning: input.meaning,
    canonicalRelevance: input.canonicalRelevance
  };
}

export const TIG_WORD_SEEDS: TeoyubeWordNode[] = [
  createWordSeed({
    id: "word_purpose",
    slug: "purpose",
    word: "Purpose",
    meaning: "God's intentional design and direction for a person, season, or calling.",
    scriptureRoot: "Romans 8:28",
    promiseRoot: "promise_purpose",
    wordLevel: "beginner",
    wordRank: 1,
    categories: ["calling", "identity", "direction"],
    promiseClusters: ["purpose", "hope"],
    relatedWords: ["calling", "faithful", "promise", "obey"],
    grammarRole: "calling" as TeoyubeWordNode["grammarRole"],
    visualSymbol: "path",
    animationSymbol: "glowing-road",
    theologicalWeight: 0.95,
    pastoralSensitivity: 0.64,
    confidenceScore: 0.95,
    canonicalRelevance: 0.95
  }),
  createWordSeed({
    id: "word_faithful",
    slug: "faithful",
    word: "Faithful",
    meaning: "God's dependable nature and steady commitment to His Word.",
    scriptureRoot: "Romans 8:28",
    wordLevel: "beginner",
    wordRank: 2,
    categories: ["identity", "promise", "trust"],
    promiseClusters: ["hope", "purpose"],
    relatedWords: ["promise", "stand", "hope"],
    grammarRole: "ADJECTIVE",
    visualSymbol: "anchor",
    animationSymbol: "steady-light",
    theologicalWeight: 0.93,
    pastoralSensitivity: 0.68,
    confidenceScore: 0.94,
    canonicalRelevance: 0.93
  }),
  createWordSeed({
    id: "word_promise",
    slug: "promise",
    word: "Promise",
    meaning: "A Scripture-grounded assurance of God's character, action, or covenant faithfulness.",
    scriptureRoot: "Romans 8:28",
    wordLevel: "beginner",
    wordRank: 3,
    categories: ["promise", "faith", "hope"],
    promiseClusters: ["purpose", "strength", "hope"],
    relatedWords: ["faithful", "hope", "stand"],
    grammarRole: "NOUN",
    visualSymbol: "scroll",
    animationSymbol: "unfolding-scroll",
    theologicalWeight: 0.94,
    pastoralSensitivity: 0.7,
    confidenceScore: 0.95,
    canonicalRelevance: 0.94
  }),
  createWordSeed({
    id: "word_calling",
    slug: "calling",
    word: "Calling",
    meaning: "A God-shaped direction of service, obedience, and kingdom assignment.",
    scriptureRoot: "Romans 8:28",
    wordLevel: "intermediate",
    wordRank: 4,
    categories: ["calling", "purpose", "service"],
    promiseClusters: ["purpose", "courage"],
    relatedWords: ["purpose", "obey", "stand"],
    grammarRole: "NOUN",
    visualSymbol: "compass",
    animationSymbol: "turning-compass",
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.66,
    confidenceScore: 0.93,
    canonicalRelevance: 0.92
  }),
  createWordSeed({
    id: "word_wait",
    slug: "wait",
    word: "Wait",
    meaning: "To trust God's timing while remaining spiritually attentive and faithful.",
    scriptureRoot: "Isaiah 40:31",
    wordLevel: "beginner",
    wordRank: 5,
    categories: ["waiting", "trust", "endurance"],
    promiseClusters: ["strength", "hope"],
    relatedWords: ["renew", "strength", "hope"],
    grammarRole: "VERB",
    visualSymbol: "hourglass",
    animationSymbol: "slow-rising-light",
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.8,
    confidenceScore: 0.94,
    canonicalRelevance: 0.91
  }),
  createWordSeed({
    id: "word_renew",
    slug: "renew",
    word: "Renew",
    meaning: "To receive restored strength, vision, and hope from God.",
    scriptureRoot: "Isaiah 40:31",
    wordLevel: "beginner",
    wordRank: 6,
    categories: ["renewal", "strength", "hope"],
    promiseClusters: ["strength", "hope"],
    relatedWords: ["wait", "strength", "hope"],
    grammarRole: "VERB",
    visualSymbol: "leaf",
    animationSymbol: "new-growth",
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.82,
    confidenceScore: 0.94,
    canonicalRelevance: 0.92
  }),
  createWordSeed({
    id: "word_strength",
    slug: "strength",
    word: "Strength",
    meaning: "God-given endurance, courage, and capacity to continue faithfully.",
    scriptureRoot: "Isaiah 40:31",
    wordLevel: "beginner",
    wordRank: 7,
    categories: ["strength", "endurance", "courage"],
    promiseClusters: ["strength", "courage"],
    relatedWords: ["renew", "stand", "courage"],
    grammarRole: "NOUN",
    visualSymbol: "pillar",
    animationSymbol: "rising-pillar",
    theologicalWeight: 0.94,
    pastoralSensitivity: 0.78,
    confidenceScore: 0.95,
    canonicalRelevance: 0.94
  }),
  createWordSeed({
    id: "word_courage",
    slug: "courage",
    word: "Courage",
    meaning: "Faithful boldness rooted in God's presence and command.",
    scriptureRoot: "Joshua 1:9",
    wordLevel: "beginner",
    wordRank: 8,
    categories: ["courage", "obedience", "leadership"],
    promiseClusters: ["courage", "strength"],
    relatedWords: ["stand", "presence", "obey"],
    grammarRole: "NOUN",
    visualSymbol: "shield",
    animationSymbol: "bright-shield",
    theologicalWeight: 0.93,
    pastoralSensitivity: 0.75,
    confidenceScore: 0.95,
    canonicalRelevance: 0.93
  }),
  createWordSeed({
    id: "word_stand",
    slug: "stand",
    word: "Stand",
    meaning: "To remain firm in faith, obedience, and spiritual courage.",
    scriptureRoot: "Joshua 1:9",
    wordLevel: "intermediate",
    wordRank: 9,
    categories: ["faith", "courage", "endurance"],
    promiseClusters: ["courage", "strength"],
    relatedWords: ["courage", "strength", "faithful"],
    grammarRole: "VERB",
    visualSymbol: "standard",
    animationSymbol: "unmoving-standard",
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.7,
    confidenceScore: 0.92,
    canonicalRelevance: 0.9
  }),
  createWordSeed({
    id: "word_presence",
    slug: "presence",
    word: "Presence",
    meaning: "The nearness and companionship of God with His people.",
    scriptureRoot: "Joshua 1:9",
    wordLevel: "beginner",
    wordRank: 10,
    categories: ["presence", "comfort", "courage"],
    promiseClusters: ["courage", "hope"],
    relatedWords: ["courage", "stand", "hope"],
    grammarRole: "NOUN",
    visualSymbol: "flame",
    animationSymbol: "near-flame",
    theologicalWeight: 0.94,
    pastoralSensitivity: 0.86,
    confidenceScore: 0.95,
    canonicalRelevance: 0.94
  }),
  createWordSeed({
    id: "word_obey",
    slug: "obey",
    word: "Obey",
    meaning: "To respond to God's Word with faithful action.",
    scriptureRoot: "Joshua 1:9",
    wordLevel: "intermediate",
    wordRank: 11,
    categories: ["obedience", "calling", "action"],
    promiseClusters: ["courage", "purpose"],
    relatedWords: ["calling", "stand", "courage"],
    grammarRole: "VERB",
    visualSymbol: "footstep",
    animationSymbol: "forward-step",
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.62,
    confidenceScore: 0.93,
    canonicalRelevance: 0.91
  }),
  createWordSeed({
    id: "word_hope",
    slug: "hope",
    word: "Hope",
    meaning: "Confident expectation rooted in God's promise and faithfulness.",
    scriptureRoot: "Isaiah 40:31",
    wordLevel: "beginner",
    wordRank: 12,
    categories: ["hope", "promise", "renewal"],
    promiseClusters: ["hope", "strength"],
    relatedWords: ["promise", "renew", "faithful"],
    grammarRole: "NOUN",
    visualSymbol: "sunrise",
    animationSymbol: "dawn-light",
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.84,
    confidenceScore: 0.94,
    canonicalRelevance: 0.92
  })
];

export function getWordSeedById(id: string): TeoyubeWordNode | undefined {
  return TIG_WORD_SEEDS.find((word) => word.id === id);
}

export function getWordSeedBySlug(slug: string): TeoyubeWordNode | undefined {
  const normalizedSlug = slug.trim().toLowerCase();
  return TIG_WORD_SEEDS.find((word) => word.slug.toLowerCase() === normalizedSlug);
}

export function getWordSeedByWord(word: string): TeoyubeWordNode | undefined {
  const normalizedWord = word.trim().toLowerCase();
  return TIG_WORD_SEEDS.find((seed) => seed.word.toLowerCase() === normalizedWord);
}
