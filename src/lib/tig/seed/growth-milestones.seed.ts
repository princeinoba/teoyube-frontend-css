import type { GrowthMilestoneNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as GrowthMilestoneNode["sourceStatus"];

type GrowthMilestoneSeedNode = GrowthMilestoneNode & {
  milestoneName: string;
  journeyId?: string;
  stageId?: string;
  requiredActions: string[];
  requiredReflections: string[];
  requiredPrayers: string[];
  unlockedWords: string[];
  celebrationMessage: string;
};

type GrowthMilestoneSeedInput = {
  id: string;
  slug: string;
  milestoneKey: string;
  milestoneName: string;
  title: string;
  description: string;
  journeyId?: string;
  stageId?: string;
  requiredActions?: string[];
  requiredReflections?: string[];
  requiredPrayers?: string[];
  unlockedWords: string[];
  celebrationMessage: string;
  theologicalWeight: number;
  pastoralSensitivity: number;
  confidenceScore: number;
  tags: string[];
};

function createGrowthMilestoneSeed(input: GrowthMilestoneSeedInput): GrowthMilestoneSeedNode {
  const requiredActions = input.requiredActions || [];
  const requiredReflections = input.requiredReflections || [];
  const requiredPrayers = input.requiredPrayers || [];
  const evidenceMarkers = [...requiredActions, ...requiredReflections, ...requiredPrayers];

  return {
    id: input.id,
    type: "GROWTH_MILESTONE",
    slug: input.slug,
    title: input.title,
    description: input.description,
    summary: input.celebrationMessage,
    tags: input.tags,
    aliases: [input.milestoneName, input.celebrationMessage, ...input.unlockedWords],
    scriptureReferences: [],
    level: "GROWTH",
    language: "en",
    audience: ["GENERAL", "DISCIPLE"],
    theologicalWeight: input.theologicalWeight,
    pastoralSensitivity: input.pastoralSensitivity,
    confidenceScore: input.confidenceScore,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    milestoneKey: input.milestoneKey,
    milestoneName: input.milestoneName,
    evidenceMarkers,
    scriptureAnchorIds: [],
    unlocksJourneyIds: input.journeyId ? [input.journeyId] : [],
    unlocksActionStepIds: requiredActions,
    journeyId: input.journeyId,
    stageId: input.stageId,
    requiredActions,
    requiredReflections,
    requiredPrayers,
    unlockedWords: input.unlockedWords,
    celebrationMessage: input.celebrationMessage
  };
}

export const TIG_GROWTH_MILESTONE_SEEDS: GrowthMilestoneNode[] = [
  createGrowthMilestoneSeed({
    id: "milestone_waiting_named",
    slug: "waiting-named",
    milestoneKey: "waiting-named",
    milestoneName: "Waiting Named",
    title: "Waiting Named",
    description: "The user has identified the area where they feel delayed, tired, or uncertain.",
    journeyId: "journey_waiting_to_renewal",
    stageId: "stage_name_the_waiting",
    requiredActions: ["action_write_the_delay"],
    requiredReflections: ["reflection_name_the_waiting"],
    unlockedWords: ["word_wait", "word_renew"],
    celebrationMessage:
      "You named the waiting season and brought it into the light of Scripture.",
    theologicalWeight: 0.88,
    pastoralSensitivity: 0.8,
    confidenceScore: 0.93,
    tags: ["waiting", "reflection", "journey", "growth"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_strength_received",
    slug: "strength-received",
    milestoneKey: "strength-received",
    milestoneName: "Strength Received",
    title: "Strength Received",
    description:
      "The user has prayed for renewed strength and anchored their waiting season in Isaiah 40:31.",
    journeyId: "journey_waiting_to_renewal",
    stageId: "stage_receive_strength",
    requiredActions: ["action_pray_for_strength"],
    requiredPrayers: ["prayer_waiting_with_hope", "prayer_strength_in_discouragement"],
    unlockedWords: ["word_strength", "word_hope"],
    celebrationMessage: "You received Scripture-backed strength for the waiting season.",
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.82,
    confidenceScore: 0.94,
    tags: ["strength", "prayer", "waiting", "renewal"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_fear_named",
    slug: "fear-named",
    milestoneKey: "fear-named",
    milestoneName: "Fear Named",
    title: "Fear Named",
    description: "The user has named the fear they are carrying before God.",
    journeyId: "journey_fear_to_courage",
    stageId: "stage_bring_fear_into_light",
    requiredActions: ["action_write_the_fear"],
    requiredReflections: ["reflection_name_the_fear"],
    unlockedWords: ["word_courage", "word_presence"],
    celebrationMessage: "You brought fear into the light of God's presence.",
    theologicalWeight: 0.89,
    pastoralSensitivity: 0.86,
    confidenceScore: 0.94,
    tags: ["fear", "courage", "reflection", "presence"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_courage_step_taken",
    slug: "courage-step-taken",
    milestoneKey: "courage-step-taken",
    milestoneName: "Courage Step Taken",
    title: "Courage Step Taken",
    description: "The user has taken one faithful step of obedience despite fear.",
    journeyId: "journey_fear_to_courage",
    stageId: "stage_step_forward_in_obedience",
    requiredActions: ["action_take_one_obedient_step", "action_stand_in_courage"],
    requiredPrayers: ["prayer_courage_and_presence"],
    unlockedWords: ["word_stand", "word_obey"],
    celebrationMessage:
      "You took a courageous step because God's presence goes with you.",
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.8,
    confidenceScore: 0.94,
    tags: ["courage", "obedience", "action", "presence"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_purpose_recognized",
    slug: "purpose-recognized",
    milestoneKey: "purpose-recognized",
    milestoneName: "Purpose Recognized",
    title: "Purpose Recognized",
    description: "The user has begun recognizing how God may be working through their season.",
    journeyId: "journey_purpose_to_calling",
    stageId: "stage_recognize_gods_work",
    requiredActions: ["action_write_the_vision"],
    requiredReflections: ["reflection_where_is_god_working"],
    unlockedWords: ["word_purpose", "word_faithful"],
    celebrationMessage:
      "You recognized that God can work through your season with purpose.",
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.72,
    confidenceScore: 0.93,
    tags: ["purpose", "calling", "reflection", "vision"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_first_calling_step",
    slug: "first-calling-step",
    milestoneKey: "first-calling-step",
    milestoneName: "First Calling Step",
    title: "First Calling Step",
    description: "The user has identified patterns of calling and taken a first faithful step.",
    journeyId: "journey_purpose_to_calling",
    stageId: "stage_take_first_faithful_step",
    requiredActions: ["action_take_one_obedient_step", "action_list_gifts_and_burdens"],
    requiredReflections: ["reflection_notice_patterns", "reflection_next_faithful_step"],
    unlockedWords: ["word_calling", "word_obey"],
    celebrationMessage: "You moved from purpose discovery into one faithful calling step.",
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.7,
    confidenceScore: 0.93,
    tags: ["calling", "obedience", "gifts", "growth"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_promise_anchored",
    slug: "promise-anchored",
    milestoneKey: "promise-anchored",
    milestoneName: "Promise Anchored",
    title: "Promise Anchored",
    description:
      "The user has selected one Scripture promise as an anchor for their current season.",
    requiredReflections: ["reflection_promise_for_current_season"],
    unlockedWords: ["word_promise", "word_hope"],
    celebrationMessage: "You anchored your current season in a Scripture-backed promise.",
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.76,
    confidenceScore: 0.92,
    tags: ["promise", "Scripture", "anchor", "hope"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_prayer_completed",
    slug: "prayer-completed",
    milestoneKey: "prayer-completed",
    milestoneName: "Prayer Completed",
    title: "Prayer Completed",
    description: "The user has completed a Scripture-grounded prayer sequence.",
    requiredPrayers: [
      "prayer_waiting_with_hope",
      "prayer_courage_and_presence",
      "prayer_strength_in_discouragement",
      "prayer_purpose_and_calling",
      "prayer_guidance_for_next_step"
    ],
    unlockedWords: ["word_faithful", "word_presence"],
    celebrationMessage: "You responded to Scripture through prayer.",
    theologicalWeight: 0.89,
    pastoralSensitivity: 0.78,
    confidenceScore: 0.92,
    tags: ["prayer", "Scripture", "faithful", "presence"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_reflection_completed",
    slug: "reflection-completed",
    milestoneKey: "reflection-completed",
    milestoneName: "Reflection Completed",
    title: "Reflection Completed",
    description: "The user has completed a Scripture-based reflection prompt.",
    requiredReflections: [
      "reflection_name_the_waiting",
      "reflection_name_the_fear",
      "reflection_where_is_god_working",
      "reflection_notice_patterns",
      "reflection_promise_for_current_season",
      "reflection_next_faithful_step"
    ],
    unlockedWords: ["word_purpose", "word_stand"],
    celebrationMessage: "You reflected on God's Word and your current season.",
    theologicalWeight: 0.88,
    pastoralSensitivity: 0.74,
    confidenceScore: 0.91,
    tags: ["reflection", "Scripture", "purpose", "stand"]
  }),
  createGrowthMilestoneSeed({
    id: "milestone_action_completed",
    slug: "action-completed",
    milestoneKey: "action-completed",
    milestoneName: "Action Completed",
    title: "Action Completed",
    description: "The user has completed a Scripture-aligned action step.",
    requiredActions: [
      "action_write_the_delay",
      "action_pray_for_strength",
      "action_take_one_obedient_step",
      "action_write_the_fear",
      "action_pray_for_guidance",
      "action_write_the_vision",
      "action_list_gifts_and_burdens",
      "action_serve_one_person",
      "action_rest_in_god",
      "action_encourage_someone",
      "action_stand_in_courage",
      "action_share_one_scripture"
    ],
    unlockedWords: ["word_obey", "word_faithful"],
    celebrationMessage: "You moved from insight into faithful action.",
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.7,
    confidenceScore: 0.92,
    tags: ["action", "obedience", "faithful", "growth"]
  })
];

export function getGrowthMilestoneSeedById(id: string): GrowthMilestoneNode | undefined {
  return TIG_GROWTH_MILESTONE_SEEDS.find((milestone) => milestone.id === id);
}

export function getGrowthMilestoneSeedByKey(milestoneKey: string): GrowthMilestoneNode | undefined {
  const normalizedKey = milestoneKey.trim().toLowerCase();
  return TIG_GROWTH_MILESTONE_SEEDS.find(
    (milestone) => milestone.milestoneKey.toLowerCase() === normalizedKey
  );
}

export function getGrowthMilestonesForJourney(journeyId: string): GrowthMilestoneNode[] {
  return TIG_GROWTH_MILESTONE_SEEDS.filter((milestone) => {
    const seedMilestone = milestone as GrowthMilestoneSeedNode;
    return seedMilestone.journeyId === journeyId;
  });
}

export function getGrowthMilestonesForStage(stageId: string): GrowthMilestoneNode[] {
  return TIG_GROWTH_MILESTONE_SEEDS.filter((milestone) => {
    const seedMilestone = milestone as GrowthMilestoneSeedNode;
    return seedMilestone.stageId === stageId;
  });
}

export function getGrowthMilestonesForAction(actionId: string): GrowthMilestoneNode[] {
  return TIG_GROWTH_MILESTONE_SEEDS.filter((milestone) => {
    const seedMilestone = milestone as GrowthMilestoneSeedNode;
    return seedMilestone.requiredActions.includes(actionId);
  });
}

export function getGrowthMilestonesForReflection(reflectionId: string): GrowthMilestoneNode[] {
  return TIG_GROWTH_MILESTONE_SEEDS.filter((milestone) => {
    const seedMilestone = milestone as GrowthMilestoneSeedNode;
    return seedMilestone.requiredReflections.includes(reflectionId);
  });
}

export function getGrowthMilestonesForPrayer(prayerId: string): GrowthMilestoneNode[] {
  return TIG_GROWTH_MILESTONE_SEEDS.filter((milestone) => {
    const seedMilestone = milestone as GrowthMilestoneSeedNode;
    return seedMilestone.requiredPrayers.includes(prayerId);
  });
}
