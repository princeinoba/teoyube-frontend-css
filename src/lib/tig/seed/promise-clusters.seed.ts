import type { PromiseClusterNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as PromiseClusterNode["sourceStatus"];

type PromiseClusterSeedNode = PromiseClusterNode & {
  clusterKey: string;
  clusterName: string;
  scriptureIds: string[];
  wordIds: string[];
  journeyIds: string[];
  primaryPromise: string;
  supportingPromises: string[];
  userNeed: string;
  spiritualOutcome: string;
};

type PromiseClusterSeedInput = {
  id: string;
  slug: string;
  clusterKey: string;
  clusterName: string;
  title: string;
  description: string;
  categoryIds: string[];
  scriptureIds: string[];
  wordIds: string[];
  journeyIds: string[];
  primaryPromise: string;
  supportingPromises: string[];
  userNeed: string;
  spiritualOutcome: string;
  theologicalWeight: number;
  pastoralSensitivity: number;
  confidenceScore: number;
  tags: string[];
};

function createPromiseClusterSeed(input: PromiseClusterSeedInput): PromiseClusterSeedNode {
  return {
    id: input.id,
    type: "PROMISE_CLUSTER",
    slug: input.slug,
    title: input.title,
    description: input.description,
    summary: input.spiritualOutcome,
    tags: input.tags,
    aliases: [input.clusterName, input.userNeed, ...input.supportingPromises],
    scriptureReferences: input.scriptureIds,
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE"],
    theologicalWeight: input.theologicalWeight,
    pastoralSensitivity: input.pastoralSensitivity,
    confidenceScore: input.confidenceScore,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    clusterKey: input.clusterKey,
    clusterName: input.clusterName,
    categoryIds: input.categoryIds,
    scriptureIds: input.scriptureIds,
    anchorScriptureIds: input.scriptureIds,
    wordIds: input.wordIds,
    teoyubeWordIds: input.wordIds,
    journeyIds: input.journeyIds,
    primaryPromise: input.primaryPromise,
    supportingPromises: input.supportingPromises,
    userNeed: input.userNeed,
    spiritualOutcome: input.spiritualOutcome,
    declaration: input.primaryPromise,
    activationPrompts: input.supportingPromises
  };
}

export const TIG_PROMISE_CLUSTER_SEEDS: PromiseClusterNode[] = [
  createPromiseClusterSeed({
    id: "cluster_strength_in_waiting",
    slug: "strength-in-waiting",
    clusterKey: "strength-in-waiting",
    clusterName: "Strength in Waiting",
    title: "Strength in Waiting",
    description:
      "A promise cluster for users who feel tired, delayed, or spiritually weary while waiting on God.",
    categoryIds: ["promise_strength", "promise_hope"],
    scriptureIds: ["scripture_isaiah_40_31"],
    wordIds: ["word_wait", "word_renew", "word_strength", "word_hope"],
    journeyIds: ["journey_waiting_to_renewal"],
    primaryPromise: "God renews the strength of those who wait upon Him.",
    supportingPromises: [
      "Waiting on God is not wasted.",
      "God gives endurance when human strength is exhausted.",
      "Renewal can begin before the situation changes."
    ],
    userNeed: "I feel tired, delayed, or unsure if anything is changing.",
    spiritualOutcome: "Renewed strength, endurance, and hope.",
    theologicalWeight: 0.94,
    pastoralSensitivity: 0.82,
    confidenceScore: 0.95,
    tags: ["waiting", "strength", "renewal", "hope"]
  }),
  createPromiseClusterSeed({
    id: "cluster_purpose_in_delay",
    slug: "purpose-in-delay",
    clusterKey: "purpose-in-delay",
    clusterName: "Purpose in Delay",
    title: "Purpose in Delay",
    description:
      "A promise cluster for users who feel stuck but need to see that God can still work through delay.",
    categoryIds: ["promise_purpose", "promise_hope"],
    scriptureIds: ["scripture_romans_8_28", "scripture_isaiah_40_31"],
    wordIds: ["word_purpose", "word_faithful", "word_promise", "word_wait"],
    journeyIds: ["journey_purpose_to_calling", "journey_waiting_to_renewal"],
    primaryPromise:
      "God works through all things for good for those who love Him and are called according to His purpose.",
    supportingPromises: [
      "Delay does not cancel calling.",
      "God can turn hidden seasons into preparation.",
      "Purpose can still be active when progress feels slow."
    ],
    userNeed: "I feel stuck, delayed, or unsure why this season is taking so long.",
    spiritualOutcome: "Trust, purpose, and renewed perspective.",
    theologicalWeight: 0.95,
    pastoralSensitivity: 0.78,
    confidenceScore: 0.95,
    tags: ["purpose", "delay", "calling", "hope"]
  }),
  createPromiseClusterSeed({
    id: "cluster_courage_through_presence",
    slug: "courage-through-presence",
    clusterKey: "courage-through-presence",
    clusterName: "Courage Through Presence",
    title: "Courage Through Presence",
    description:
      "A promise cluster for users facing fear, uncertainty, or a difficult step of obedience.",
    categoryIds: ["promise_courage", "promise_strength"],
    scriptureIds: ["scripture_joshua_1_9"],
    wordIds: ["word_courage", "word_presence", "word_stand", "word_obey"],
    journeyIds: ["journey_fear_to_courage"],
    primaryPromise: "God commands courage because He promises His presence.",
    supportingPromises: [
      "Courage is rooted in God being with you.",
      "Fear does not have to lead your next step.",
      "Obedience can begin while you still feel afraid."
    ],
    userNeed: "I feel afraid to move forward or obey what God is asking.",
    spiritualOutcome: "Courage, obedience, and confidence in God's presence.",
    theologicalWeight: 0.93,
    pastoralSensitivity: 0.84,
    confidenceScore: 0.94,
    tags: ["courage", "fear", "presence", "obedience"]
  }),
  createPromiseClusterSeed({
    id: "cluster_hope_in_discouragement",
    slug: "hope-in-discouragement",
    clusterKey: "hope-in-discouragement",
    clusterName: "Hope in Discouragement",
    title: "Hope in Discouragement",
    description: "A promise cluster for users who feel weary, forgotten, or discouraged.",
    categoryIds: ["promise_hope", "promise_strength", "promise_purpose"],
    scriptureIds: ["scripture_isaiah_40_31", "scripture_romans_8_28"],
    wordIds: ["word_hope", "word_renew", "word_faithful", "word_promise"],
    journeyIds: ["journey_waiting_to_renewal", "journey_purpose_to_calling"],
    primaryPromise: "God gives hope and renewal to the weary.",
    supportingPromises: [
      "Discouragement is not the end of the story.",
      "God remains faithful when strength feels low.",
      "Hope can rise again through God's Word."
    ],
    userNeed: "I feel discouraged, forgotten, or ready to give up.",
    spiritualOutcome: "Hope, comfort, renewed strength, and restored trust.",
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.88,
    confidenceScore: 0.94,
    tags: ["discouragement", "hope", "renewal", "faithful"]
  }),
  createPromiseClusterSeed({
    id: "cluster_guidance_for_next_step",
    slug: "guidance-for-next-step",
    clusterKey: "guidance-for-next-step",
    clusterName: "Guidance for the Next Step",
    title: "Guidance for the Next Step",
    description:
      "A promise cluster for users who need clarity, direction, and courage to take one faithful step.",
    categoryIds: ["promise_courage", "promise_purpose", "promise_strength"],
    scriptureIds: ["scripture_joshua_1_9", "scripture_romans_8_28"],
    wordIds: ["word_obey", "word_stand", "word_calling", "word_purpose"],
    journeyIds: ["journey_fear_to_courage", "journey_purpose_to_calling"],
    primaryPromise: "God gives courage and direction for faithful obedience.",
    supportingPromises: [
      "The next step does not require seeing the whole path.",
      "God's presence goes with obedient action.",
      "Purpose becomes clearer through faithful steps."
    ],
    userNeed: "I do not know what to do next.",
    spiritualOutcome: "Clarity, courage, obedience, and movement.",
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.76,
    confidenceScore: 0.93,
    tags: ["guidance", "next-step", "obedience", "calling"]
  })
];

export function getPromiseClusterSeedById(id: string): PromiseClusterNode | undefined {
  return TIG_PROMISE_CLUSTER_SEEDS.find((cluster) => cluster.id === id);
}

export function getPromiseClusterSeedByKey(clusterKey: string): PromiseClusterNode | undefined {
  const normalizedKey = clusterKey.trim().toLowerCase();
  return TIG_PROMISE_CLUSTER_SEEDS.find((cluster) => {
    const seedCluster = cluster as PromiseClusterSeedNode;
    return seedCluster.clusterKey.toLowerCase() === normalizedKey;
  });
}

export function getPromiseClustersForPromiseCategory(categoryId: string): PromiseClusterNode[] {
  return TIG_PROMISE_CLUSTER_SEEDS.filter((cluster) => cluster.categoryIds.includes(categoryId));
}

export function getPromiseClustersForScripture(scriptureId: string): PromiseClusterNode[] {
  return TIG_PROMISE_CLUSTER_SEEDS.filter((cluster) =>
    cluster.anchorScriptureIds.includes(scriptureId)
  );
}
