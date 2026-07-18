import type { PromiseCategoryNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as PromiseCategoryNode["sourceStatus"];

type PromiseNature = "calling" | "comfort" | "guidance" | "restoration";

type PromiseSeedNode = PromiseCategoryNode & {
  categoryName: string;
  promiseNature: PromiseNature;
  coreScriptures: string[];
  relatedScriptures: string[];
  relatedEmotions: string[];
  relatedCallings: string[];
  relatedJourneys: string[];
  relatedWords: string[];
  conditions: string[];
};

const PROMISE_SEED_DATA: PromiseSeedNode[] = [
  {
    id: "promise_purpose",
    type: "PROMISE_CATEGORY",
    slug: "purpose",
    title: "God Works Through Purpose",
    description: "God works through purpose, calling, providence, and faithful alignment with His will.",
    summary: "Purpose anchors the user's calling in God's active work and faithful promise.",
    tags: ["purpose", "calling", "providence", "hope", "restoration"],
    aliases: ["calling", "divine purpose", "God's plan", "providence"],
    scriptureReferences: ["Romans 8:28"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "LEADER"],
    theologicalWeight: 0.95,
    pastoralSensitivity: 0.65,
    confidenceScore: 0.95,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    categoryKey: "purpose",
    categoryName: "Purpose",
    promiseNature: "calling",
    anchorScriptureIds: ["scripture_romans_8_28"],
    relatedEmotionIds: ["discouragement", "waiting", "uncertainty"],
    relatedCallingIds: ["builder", "leader", "servant"],
    coreScriptures: ["scripture_romans_8_28"],
    relatedScriptures: ["scripture_romans_8_28"],
    relatedEmotions: ["discouragement", "waiting", "uncertainty"],
    relatedCallings: ["builder", "leader", "servant"],
    relatedJourneys: ["purpose-to-calling", "waiting-to-purpose"],
    relatedWords: ["purpose", "calling", "faithful", "promise"],
    conditions: ["love God", "walk according to His purpose"]
  },
  {
    id: "promise_strength",
    type: "PROMISE_CATEGORY",
    slug: "strength",
    title: "God Renews Strength",
    description: "God renews strength for those who wait on Him and trust Him in weakness.",
    summary: "Strength meets fear, weariness, discouragement, and waiting with renewal from God.",
    tags: ["strength", "renewal", "comfort", "endurance", "waiting"],
    aliases: ["renewed strength", "endurance", "stand", "be strong"],
    scriptureReferences: ["Isaiah 40:31", "Joshua 1:9"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "INTERCESSOR"],
    theologicalWeight: 0.94,
    pastoralSensitivity: 0.8,
    confidenceScore: 0.95,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    categoryKey: "strength",
    categoryName: "Strength",
    promiseNature: "comfort",
    anchorScriptureIds: ["scripture_isaiah_40_31"],
    relatedEmotionIds: ["fear", "discouragement", "waiting", "weariness"],
    relatedCallingIds: ["servant", "leader", "watchman"],
    coreScriptures: ["scripture_isaiah_40_31"],
    relatedScriptures: ["scripture_isaiah_40_31", "scripture_joshua_1_9"],
    relatedEmotions: ["fear", "discouragement", "waiting", "weariness"],
    relatedCallings: ["servant", "leader", "watchman"],
    relatedJourneys: ["waiting-to-renewal", "weakness-to-strength", "fear-to-courage"],
    relatedWords: ["strength", "renew", "stand", "courage"],
    conditions: ["wait upon the Lord", "trust God in weakness"]
  },
  {
    id: "promise_courage",
    type: "PROMISE_CATEGORY",
    slug: "courage",
    title: "God Commands Courage Through His Presence",
    description: "God commands courage and grounds it in His presence, guidance, and faithful command.",
    summary: "Courage answers fear and uncertainty by calling the user to trust God's presence.",
    tags: ["courage", "presence", "guidance", "obedience", "leadership"],
    aliases: ["be strong", "good courage", "do not fear", "obey"],
    scriptureReferences: ["Joshua 1:9"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "LEADER"],
    theologicalWeight: 0.93,
    pastoralSensitivity: 0.75,
    confidenceScore: 0.94,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    categoryKey: "courage",
    categoryName: "Courage",
    promiseNature: "guidance",
    anchorScriptureIds: ["scripture_joshua_1_9"],
    relatedEmotionIds: ["fear", "anxiety", "uncertainty"],
    relatedCallingIds: ["leader", "watchman", "builder"],
    coreScriptures: ["scripture_joshua_1_9"],
    relatedScriptures: ["scripture_joshua_1_9"],
    relatedEmotions: ["fear", "anxiety", "uncertainty"],
    relatedCallings: ["leader", "watchman", "builder"],
    relatedJourneys: ["fear-to-courage", "courage-to-leadership"],
    relatedWords: ["courage", "stand", "presence", "obey"],
    conditions: ["be strong", "obey God's command", "trust God's presence"]
  },
  {
    id: "promise_hope",
    type: "PROMISE_CATEGORY",
    slug: "hope",
    title: "God Gives Hope in Waiting",
    description: "God gives hope during delay, weariness, uncertainty, and waiting seasons.",
    summary: "Hope connects waiting and discouragement to God's renewal, purpose, and timing.",
    tags: ["hope", "waiting", "restoration", "renewal", "purpose"],
    aliases: ["renewed hope", "hope in waiting", "God's timing", "restoration"],
    scriptureReferences: ["Isaiah 40:31", "Romans 8:28"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "INTERCESSOR"],
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.85,
    confidenceScore: 0.94,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    categoryKey: "hope",
    categoryName: "Hope",
    promiseNature: "restoration",
    anchorScriptureIds: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedEmotionIds: ["discouragement", "waiting", "uncertainty", "weariness"],
    relatedCallingIds: ["servant", "teacher", "intercessor"],
    coreScriptures: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedScriptures: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    relatedEmotions: ["discouragement", "waiting", "uncertainty", "weariness"],
    relatedCallings: ["servant", "teacher", "intercessor"],
    relatedJourneys: ["waiting-to-renewal", "waiting-to-purpose", "purpose-to-calling"],
    relatedWords: ["hope", "renew", "promise", "faithful"],
    conditions: ["wait upon the Lord", "trust God's timing"]
  }
];

export const TIG_PROMISE_SEEDS: PromiseCategoryNode[] = PROMISE_SEED_DATA;

export function getPromiseSeedById(id: string): PromiseCategoryNode | undefined {
  return TIG_PROMISE_SEEDS.find((promise) => promise.id === id);
}

export function getPromiseSeedByKey(categoryKey: string): PromiseCategoryNode | undefined {
  const normalizedKey = categoryKey.trim().toLowerCase();
  return TIG_PROMISE_SEEDS.find((promise) => promise.categoryKey.toLowerCase() === normalizedKey);
}
