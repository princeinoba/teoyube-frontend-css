import type { CallingProfileNode } from "../types";

const CREATED_AT = "2026-07-04T00:00:00.000Z";
const UPDATED_AT = CREATED_AT;

// The current TIGSourceStatus type is stricter than this seed instruction.
const ACTIVE_SOURCE_STATUS = "active" as CallingProfileNode["sourceStatus"];

type CallingSeedNode = CallingProfileNode & {
  callingName: string;
  archetype: string;
  relatedScriptures: string[];
  relatedWords: string[];
  relatedJourneys: string[];
  relatedActionSteps: string[];
};

const CALLING_SEED_DATA: CallingSeedNode[] = [
  {
    id: "calling_builder",
    type: "CALLING_PROFILE",
    slug: "builder",
    title: "The Builder",
    description: "A calling profile for those who create, restore, organize, and build kingdom-aligned work.",
    summary: "Builders turn vision into faithful structure, restored work, and durable stewardship.",
    tags: ["builder", "vision", "stewardship", "restoration", "purpose"],
    aliases: ["restorer", "organizer", "maker", "steward"],
    scriptureReferences: ["Romans 8:28", "Joshua 1:9"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "LEADER"],
    theologicalWeight: 0.9,
    pastoralSensitivity: 0.55,
    confidenceScore: 0.92,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    callingKey: "builder",
    callingName: "Builder",
    archetype: "builder",
    archetypes: ["builder"],
    gifts: ["vision", "diligence", "stewardship", "problem solving"],
    strengths: ["creates structure", "restores what is broken", "turns vision into action"],
    challenges: ["impatience", "overworking", "discouragement when progress is slow"],
    biblicalExamples: ["Nehemiah", "Noah", "Bezalel"],
    growthPath: ["vision", "obedience", "endurance", "stewardship", "legacy"],
    anchorScriptureIds: ["scripture_romans_8_28", "scripture_joshua_1_9"],
    relatedScriptures: ["scripture_romans_8_28", "scripture_joshua_1_9"],
    relatedWords: ["purpose", "calling", "stand", "faithful"],
    relatedJourneys: ["purpose-to-calling", "courage-to-leadership"],
    relatedActionSteps: ["action_write_the_vision", "action_take_one_obedient_step"]
  },
  {
    id: "calling_teacher",
    type: "CALLING_PROFILE",
    slug: "teacher",
    title: "The Teacher",
    description: "A calling profile for those who explain truth, disciple others, and make wisdom understandable.",
    summary: "Teachers clarify Scripture, form understanding, and help wisdom become faithful practice.",
    tags: ["teacher", "wisdom", "clarity", "discipleship", "communication"],
    aliases: ["instructor", "disciple-maker", "explainer", "mentor"],
    scriptureReferences: ["Isaiah 40:31"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "LEADER"],
    theologicalWeight: 0.88,
    pastoralSensitivity: 0.5,
    confidenceScore: 0.9,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    callingKey: "teacher",
    callingName: "Teacher",
    archetype: "teacher",
    archetypes: ["teacher"],
    gifts: ["wisdom", "clarity", "communication", "discernment"],
    strengths: ["explains Scripture clearly", "helps others grow", "turns knowledge into understanding"],
    challenges: ["pride", "overexplaining", "discouragement when others do not listen"],
    biblicalExamples: ["Ezra", "Paul", "Apollos"],
    growthPath: ["learning", "understanding", "clarity", "discipleship", "multiplication"],
    anchorScriptureIds: ["scripture_isaiah_40_31"],
    relatedScriptures: ["scripture_isaiah_40_31"],
    relatedWords: ["wisdom", "promise", "renew", "faithful"],
    relatedJourneys: ["waiting-to-renewal", "purpose-to-calling"],
    relatedActionSteps: ["action_share_one_scripture", "action_write_reflection"]
  },
  {
    id: "calling_servant",
    type: "CALLING_PROFILE",
    slug: "servant",
    title: "The Servant",
    description: "A calling profile for those who express God's love through humility, service, care, and faithfulness.",
    summary: "Servants reveal God's care through faithful support, humility, and hidden acts of love.",
    tags: ["servant", "humility", "faithfulness", "care", "compassion"],
    aliases: ["helper", "caregiver", "supporter", "faithful one"],
    scriptureReferences: ["Romans 8:28", "Isaiah 40:31"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "INTERCESSOR"],
    theologicalWeight: 0.91,
    pastoralSensitivity: 0.75,
    confidenceScore: 0.93,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    callingKey: "servant",
    callingName: "Servant",
    archetype: "servant",
    archetypes: ["servant"],
    gifts: ["compassion", "humility", "faithfulness", "care"],
    strengths: ["supports others", "notices hidden needs", "serves with consistency"],
    challenges: ["burnout", "feeling unseen", "difficulty receiving help"],
    biblicalExamples: ["Ruth", "Timothy", "Stephen"],
    growthPath: ["humility", "faithfulness", "endurance", "love", "reward"],
    anchorScriptureIds: ["scripture_romans_8_28", "scripture_isaiah_40_31"],
    relatedScriptures: ["scripture_romans_8_28", "scripture_isaiah_40_31"],
    relatedWords: ["faithful", "strength", "promise", "renew"],
    relatedJourneys: ["waiting-to-renewal", "weakness-to-strength"],
    relatedActionSteps: ["action_serve_one_person", "action_rest_in_god"]
  },
  {
    id: "calling_leader",
    type: "CALLING_PROFILE",
    slug: "leader",
    title: "The Leader",
    description: "A calling profile for those who guide, organize, protect, and help others move toward God's purpose.",
    summary: "Leaders guide people with courage, obedience, responsibility, and service.",
    tags: ["leader", "courage", "responsibility", "strategy", "influence"],
    aliases: ["guide", "steward", "captain", "shepherd"],
    scriptureReferences: ["Joshua 1:9", "Romans 8:28"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "DISCIPLE", "LEADER"],
    theologicalWeight: 0.92,
    pastoralSensitivity: 0.65,
    confidenceScore: 0.94,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    callingKey: "leader",
    callingName: "Leader",
    archetype: "leader",
    archetypes: ["leader"],
    gifts: ["courage", "responsibility", "strategy", "influence"],
    strengths: ["gives direction", "carries responsibility", "helps others move forward"],
    challenges: ["fear of failure", "pressure", "isolation"],
    biblicalExamples: ["Joshua", "Moses", "Deborah"],
    growthPath: ["courage", "obedience", "wisdom", "service", "legacy"],
    anchorScriptureIds: ["scripture_joshua_1_9", "scripture_romans_8_28"],
    relatedScriptures: ["scripture_joshua_1_9", "scripture_romans_8_28"],
    relatedWords: ["courage", "stand", "purpose", "obey"],
    relatedJourneys: ["fear-to-courage", "courage-to-leadership", "purpose-to-calling"],
    relatedActionSteps: ["action_take_one_obedient_step", "action_encourage_someone"]
  },
  {
    id: "calling_watchman",
    type: "CALLING_PROFILE",
    slug: "watchman",
    title: "The Watchman",
    description: "A calling profile for those who discern, pray, protect, warn, and stand spiritually alert.",
    summary: "Watchmen carry discernment, prayer, courage, and protective spiritual attentiveness.",
    tags: ["watchman", "discernment", "intercession", "vigilance", "courage"],
    aliases: ["intercessor", "guardian", "sentinel", "protector"],
    scriptureReferences: ["Joshua 1:9", "Isaiah 40:31"],
    level: "FOUNDATION",
    language: "en",
    audience: ["GENERAL", "INTERCESSOR", "LEADER"],
    theologicalWeight: 0.89,
    pastoralSensitivity: 0.78,
    confidenceScore: 0.91,
    sourceStatus: ACTIVE_SOURCE_STATUS,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    callingKey: "watchman",
    callingName: "Watchman",
    archetype: "watchman",
    archetypes: ["watchman"],
    gifts: ["discernment", "intercession", "vigilance", "courage"],
    strengths: ["senses spiritual danger", "prays consistently", "protects others through wisdom"],
    challenges: ["anxiety", "heaviness", "feeling misunderstood"],
    biblicalExamples: ["Ezekiel", "Nehemiah", "Anna"],
    growthPath: ["awareness", "prayer", "courage", "obedience", "protection"],
    anchorScriptureIds: ["scripture_joshua_1_9", "scripture_isaiah_40_31"],
    relatedScriptures: ["scripture_joshua_1_9", "scripture_isaiah_40_31"],
    relatedWords: ["stand", "courage", "presence", "strength"],
    relatedJourneys: ["fear-to-courage", "weakness-to-strength"],
    relatedActionSteps: ["action_pray_for_guidance", "action_stand_in_courage"]
  }
];

export const TIG_CALLING_SEEDS: CallingProfileNode[] = CALLING_SEED_DATA;

export function getCallingSeedById(id: string): CallingProfileNode | undefined {
  return TIG_CALLING_SEEDS.find((calling) => calling.id === id);
}

export function getCallingSeedByKey(callingKey: string): CallingProfileNode | undefined {
  const normalizedKey = callingKey.trim().toLowerCase();
  return TIG_CALLING_SEEDS.find((calling) => calling.callingKey.toLowerCase() === normalizedKey);
}
