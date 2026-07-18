import type { TIGRelationship } from "../types";

const CREATED_AT = new Date().toISOString();
const UPDATED_AT = new Date().toISOString();

// The current TIGDirection type is stricter than this seed instruction.
const ONE_WAY = "one_way" as TIGRelationship["direction"];

type RelationshipSeedInput = Omit<TIGRelationship, "createdAt" | "updatedAt" | "direction"> & {
  direction?: TIGRelationship["direction"];
};

function createRelationship(input: RelationshipSeedInput): TIGRelationship {
  return {
    ...input,
    direction: input.direction || ONE_WAY,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT
  };
}

type RelationshipGroupPair = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceNodeType?: TIGRelationship["sourceNodeType"];
  targetNodeType?: TIGRelationship["targetNodeType"];
  type?: TIGRelationship["type"];
  strength: number;
  confidenceScore: number;
  reason?: string;
  scriptureBasis?: string[];
  tags?: string[];
};

type RelationshipGroupInput = {
  sourceNodeType?: TIGRelationship["sourceNodeType"];
  targetNodeType?: TIGRelationship["targetNodeType"];
  type?: TIGRelationship["type"];
  reason: string;
  scriptureBasis: string[];
  tags: string[];
  pairs: RelationshipGroupPair[];
};

function createRelationshipGroup(input: RelationshipGroupInput): TIGRelationship[] {
  return input.pairs.map((pair) => {
    const sourceNodeType = pair.sourceNodeType || input.sourceNodeType;
    const targetNodeType = pair.targetNodeType || input.targetNodeType;
    const type = pair.type || input.type;

    if (!sourceNodeType || !targetNodeType || !type) {
      throw new Error(`Relationship seed ${pair.id} is missing a node type or relationship type.`);
    }

    return createRelationship({
      id: pair.id,
      sourceNodeId: pair.sourceNodeId,
      targetNodeId: pair.targetNodeId,
      sourceNodeType,
      targetNodeType,
      type,
      strength: pair.strength,
      confidenceScore: pair.confidenceScore,
      reason: pair.reason || input.reason,
      scriptureBasis: pair.scriptureBasis || input.scriptureBasis,
      tags: pair.tags || input.tags
    });
  });
}

export const TIG_RELATIONSHIP_SEEDS: TIGRelationship[] = [
  // Emotion -> Promise relationships
  createRelationship({
    id: "rel_emotion_fear_to_promise_courage",
    sourceNodeId: "emotion_fear",
    targetNodeId: "promise_courage",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "PROMISE_CATEGORY",
    type: "HEALS",
    strength: 0.95,
    confidenceScore: 0.95,
    reason: "Fear is pastorally answered by God's command and promise of courage.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["emotion", "promise", "fear", "courage"]
  }),
  createRelationship({
    id: "rel_emotion_fear_to_promise_strength",
    sourceNodeId: "emotion_fear",
    targetNodeId: "promise_strength",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "PROMISE_CATEGORY",
    type: "STRENGTHENS",
    strength: 0.88,
    confidenceScore: 0.9,
    reason: "Fear often needs strengthening through God's presence and renewal.",
    scriptureBasis: ["Joshua 1:9", "Isaiah 40:31"],
    tags: ["emotion", "promise", "fear", "strength"]
  }),
  createRelationship({
    id: "rel_emotion_discouragement_to_promise_hope",
    sourceNodeId: "emotion_discouragement",
    targetNodeId: "promise_hope",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "PROMISE_CATEGORY",
    type: "HEALS",
    strength: 0.92,
    confidenceScore: 0.93,
    reason: "Discouragement is met by hope, renewal, and God's faithful purpose.",
    scriptureBasis: ["Isaiah 40:31", "Romans 8:28"],
    tags: ["emotion", "promise", "discouragement", "hope"]
  }),
  createRelationship({
    id: "rel_emotion_discouragement_to_promise_strength",
    sourceNodeId: "emotion_discouragement",
    targetNodeId: "promise_strength",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "PROMISE_CATEGORY",
    type: "STRENGTHENS",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "Discouragement needs renewed strength from the Lord.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["emotion", "promise", "discouragement", "strength"]
  }),
  createRelationship({
    id: "rel_emotion_waiting_to_promise_strength",
    sourceNodeId: "emotion_waiting",
    targetNodeId: "promise_strength",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "PROMISE_CATEGORY",
    type: "STRENGTHENS",
    strength: 0.94,
    confidenceScore: 0.95,
    reason: "Waiting on the Lord is directly connected to renewed strength.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["emotion", "promise", "waiting", "strength"]
  }),
  createRelationship({
    id: "rel_emotion_waiting_to_promise_purpose",
    sourceNodeId: "emotion_waiting",
    targetNodeId: "promise_purpose",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "PROMISE_CATEGORY",
    type: "GUIDES",
    strength: 0.86,
    confidenceScore: 0.88,
    reason: "Waiting can be guided by God's purpose and providence.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["emotion", "promise", "waiting", "purpose"]
  }),

  // Promise -> Scripture relationships
  createRelationship({
    id: "rel_promise_purpose_to_scripture_romans_8_28",
    sourceNodeId: "promise_purpose",
    targetNodeId: "scripture_romans_8_28",
    sourceNodeType: "PROMISE_CATEGORY",
    targetNodeType: "SCRIPTURE",
    type: "ANCHORS",
    strength: 0.96,
    confidenceScore: 0.98,
    reason: "Romans 8:28 anchors the promise of purpose in God's providential work.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["promise", "scripture", "purpose", "anchor"]
  }),
  createRelationship({
    id: "rel_promise_strength_to_scripture_isaiah_40_31",
    sourceNodeId: "promise_strength",
    targetNodeId: "scripture_isaiah_40_31",
    sourceNodeType: "PROMISE_CATEGORY",
    targetNodeType: "SCRIPTURE",
    type: "ANCHORS",
    strength: 0.96,
    confidenceScore: 0.98,
    reason: "Isaiah 40:31 directly anchors the promise of renewed strength.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["promise", "scripture", "strength", "anchor"]
  }),
  createRelationship({
    id: "rel_promise_strength_to_scripture_joshua_1_9",
    sourceNodeId: "promise_strength",
    targetNodeId: "scripture_joshua_1_9",
    sourceNodeType: "PROMISE_CATEGORY",
    targetNodeType: "SCRIPTURE",
    type: "SUPPORTS",
    strength: 0.85,
    confidenceScore: 0.9,
    reason: "Joshua 1:9 supports strength through God's command and presence.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["promise", "scripture", "strength", "support"]
  }),
  createRelationship({
    id: "rel_promise_courage_to_scripture_joshua_1_9",
    sourceNodeId: "promise_courage",
    targetNodeId: "scripture_joshua_1_9",
    sourceNodeType: "PROMISE_CATEGORY",
    targetNodeType: "SCRIPTURE",
    type: "ANCHORS",
    strength: 0.97,
    confidenceScore: 0.98,
    reason: "Joshua 1:9 directly anchors courage in God's presence.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["promise", "scripture", "courage", "anchor"]
  }),
  createRelationship({
    id: "rel_promise_hope_to_scripture_isaiah_40_31",
    sourceNodeId: "promise_hope",
    targetNodeId: "scripture_isaiah_40_31",
    sourceNodeType: "PROMISE_CATEGORY",
    targetNodeType: "SCRIPTURE",
    type: "ANCHORS",
    strength: 0.9,
    confidenceScore: 0.94,
    reason: "Isaiah 40:31 anchors hope during waiting and weariness.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["promise", "scripture", "hope", "anchor"]
  }),
  createRelationship({
    id: "rel_promise_hope_to_scripture_romans_8_28",
    sourceNodeId: "promise_hope",
    targetNodeId: "scripture_romans_8_28",
    sourceNodeType: "PROMISE_CATEGORY",
    targetNodeType: "SCRIPTURE",
    type: "SUPPORTS",
    strength: 0.88,
    confidenceScore: 0.92,
    reason: "Romans 8:28 supports hope through God's purpose and providence.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["promise", "scripture", "hope", "support"]
  }),

  // Scripture -> Teoyube Word relationships
  createRelationship({
    id: "rel_scripture_romans_8_28_to_word_purpose",
    sourceNodeId: "scripture_romans_8_28",
    targetNodeId: "word_purpose",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.95,
    confidenceScore: 0.95,
    reason: "Romans 8:28 reveals purpose as a core Teoyube word.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["scripture", "word", "purpose"]
  }),
  createRelationship({
    id: "rel_scripture_romans_8_28_to_word_faithful",
    sourceNodeId: "scripture_romans_8_28",
    targetNodeId: "word_faithful",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.88,
    confidenceScore: 0.9,
    reason: "Romans 8:28 reveals God's faithful work across all things.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["scripture", "word", "faithful"]
  }),
  createRelationship({
    id: "rel_scripture_romans_8_28_to_word_promise",
    sourceNodeId: "scripture_romans_8_28",
    targetNodeId: "word_promise",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "Romans 8:28 reveals promise through providence and calling.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["scripture", "word", "promise"]
  }),
  createRelationship({
    id: "rel_scripture_isaiah_40_31_to_word_wait",
    sourceNodeId: "scripture_isaiah_40_31",
    targetNodeId: "word_wait",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.94,
    confidenceScore: 0.95,
    reason: "Isaiah 40:31 reveals waiting as a place of renewal.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["scripture", "word", "wait"]
  }),
  createRelationship({
    id: "rel_scripture_isaiah_40_31_to_word_renew",
    sourceNodeId: "scripture_isaiah_40_31",
    targetNodeId: "word_renew",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.95,
    confidenceScore: 0.95,
    reason: "Isaiah 40:31 directly reveals renewal from the Lord.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["scripture", "word", "renew"]
  }),
  createRelationship({
    id: "rel_scripture_isaiah_40_31_to_word_strength",
    sourceNodeId: "scripture_isaiah_40_31",
    targetNodeId: "word_strength",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.95,
    confidenceScore: 0.95,
    reason: "Isaiah 40:31 directly reveals strength as a promise.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["scripture", "word", "strength"]
  }),
  createRelationship({
    id: "rel_scripture_joshua_1_9_to_word_courage",
    sourceNodeId: "scripture_joshua_1_9",
    targetNodeId: "word_courage",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.95,
    confidenceScore: 0.95,
    reason: "Joshua 1:9 directly reveals courage through God's command.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["scripture", "word", "courage"]
  }),
  createRelationship({
    id: "rel_scripture_joshua_1_9_to_word_stand",
    sourceNodeId: "scripture_joshua_1_9",
    targetNodeId: "word_stand",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.86,
    confidenceScore: 0.88,
    reason: "Joshua 1:9 reveals standing firm through obedient courage.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["scripture", "word", "stand"]
  }),
  createRelationship({
    id: "rel_scripture_joshua_1_9_to_word_presence",
    sourceNodeId: "scripture_joshua_1_9",
    targetNodeId: "word_presence",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.92,
    confidenceScore: 0.94,
    reason: "Joshua 1:9 reveals God's presence as the basis for courage.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["scripture", "word", "presence"]
  }),
  createRelationship({
    id: "rel_scripture_joshua_1_9_to_word_obey",
    sourceNodeId: "scripture_joshua_1_9",
    targetNodeId: "word_obey",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    strength: 0.82,
    confidenceScore: 0.85,
    reason: "Joshua 1:9 reveals obedience as courage in motion.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["scripture", "word", "obey"]
  }),

  // Emotion -> Journey relationships
  createRelationship({
    id: "rel_emotion_waiting_to_journey_waiting_to_renewal",
    sourceNodeId: "emotion_waiting",
    targetNodeId: "journey_waiting_to_renewal",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "JOURNEY",
    type: "LEADS_TO",
    strength: 0.95,
    confidenceScore: 0.95,
    reason: "Waiting naturally leads to a renewal journey anchored in Isaiah 40:31.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["emotion", "journey", "waiting", "renewal"]
  }),
  createRelationship({
    id: "rel_emotion_fear_to_journey_fear_to_courage",
    sourceNodeId: "emotion_fear",
    targetNodeId: "journey_fear_to_courage",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "JOURNEY",
    type: "LEADS_TO",
    strength: 0.95,
    confidenceScore: 0.95,
    reason: "Fear naturally leads to a courage journey anchored in Joshua 1:9.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["emotion", "journey", "fear", "courage"]
  }),
  createRelationship({
    id: "rel_emotion_discouragement_to_journey_waiting_to_renewal",
    sourceNodeId: "emotion_discouragement",
    targetNodeId: "journey_waiting_to_renewal",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "JOURNEY",
    type: "LEADS_TO",
    strength: 0.88,
    confidenceScore: 0.9,
    reason: "Discouragement can be guided into renewal through waiting on the Lord.",
    scriptureBasis: ["Isaiah 40:31", "Romans 8:28"],
    tags: ["emotion", "journey", "discouragement", "renewal"]
  }),
  createRelationship({
    id: "rel_emotion_discouragement_to_journey_purpose_to_calling",
    sourceNodeId: "emotion_discouragement",
    targetNodeId: "journey_purpose_to_calling",
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "JOURNEY",
    type: "GUIDES",
    strength: 0.8,
    confidenceScore: 0.84,
    reason: "Discouragement may need renewed purpose and a clear calling step.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["emotion", "journey", "discouragement", "purpose"]
  }),

  // Journey -> Action Step relationships
  createRelationship({
    id: "rel_journey_waiting_to_renewal_to_action_write_the_delay",
    sourceNodeId: "journey_waiting_to_renewal",
    targetNodeId: "action_write_the_delay",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "The waiting journey begins by naming the delay.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["journey", "action", "waiting"]
  }),
  createRelationship({
    id: "rel_journey_waiting_to_renewal_to_action_pray_for_strength",
    sourceNodeId: "journey_waiting_to_renewal",
    targetNodeId: "action_pray_for_strength",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.92,
    confidenceScore: 0.94,
    reason: "The waiting journey generates prayer for renewed strength.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["journey", "action", "strength"]
  }),
  createRelationship({
    id: "rel_journey_waiting_to_renewal_to_action_take_one_obedient_step",
    sourceNodeId: "journey_waiting_to_renewal",
    targetNodeId: "action_take_one_obedient_step",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.84,
    confidenceScore: 0.86,
    reason: "Renewal should lead to one faithful step forward.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["journey", "action", "obedience"]
  }),
  createRelationship({
    id: "rel_journey_fear_to_courage_to_action_write_the_fear",
    sourceNodeId: "journey_fear_to_courage",
    targetNodeId: "action_write_the_fear",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "The courage journey begins by bringing fear into the light.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["journey", "action", "fear"]
  }),
  createRelationship({
    id: "rel_journey_fear_to_courage_to_action_pray_for_guidance",
    sourceNodeId: "journey_fear_to_courage",
    targetNodeId: "action_pray_for_guidance",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.88,
    confidenceScore: 0.9,
    reason: "The courage journey generates prayer for guidance and God's presence.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["journey", "action", "guidance"]
  }),
  createRelationship({
    id: "rel_journey_fear_to_courage_to_action_take_one_obedient_step",
    sourceNodeId: "journey_fear_to_courage",
    targetNodeId: "action_take_one_obedient_step",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.92,
    confidenceScore: 0.94,
    reason: "The courage journey culminates in one obedient step.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["journey", "action", "courage"]
  }),
  createRelationship({
    id: "rel_journey_purpose_to_calling_to_action_write_the_vision",
    sourceNodeId: "journey_purpose_to_calling",
    targetNodeId: "action_write_the_vision",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "The purpose journey begins by recognizing and writing the vision.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["journey", "action", "purpose"]
  }),
  createRelationship({
    id: "rel_journey_purpose_to_calling_to_action_list_gifts_and_burdens",
    sourceNodeId: "journey_purpose_to_calling",
    targetNodeId: "action_list_gifts_and_burdens",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.86,
    confidenceScore: 0.88,
    reason: "The purpose journey discerns patterns through gifts, burdens, and opportunities.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["journey", "action", "calling"]
  }),
  createRelationship({
    id: "rel_journey_purpose_to_calling_to_action_take_one_obedient_step",
    sourceNodeId: "journey_purpose_to_calling",
    targetNodeId: "action_take_one_obedient_step",
    sourceNodeType: "JOURNEY",
    targetNodeType: "ACTION_STEP",
    type: "GENERATES",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "Purpose becomes calling through a first faithful step.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["journey", "action", "obedience"]
  }),

  // Calling -> Journey relationships
  createRelationship({
    id: "rel_calling_builder_to_journey_purpose_to_calling",
    sourceNodeId: "calling_builder",
    targetNodeId: "journey_purpose_to_calling",
    sourceNodeType: "CALLING_PROFILE",
    targetNodeType: "JOURNEY",
    type: "GUIDES",
    strength: 0.93,
    confidenceScore: 0.94,
    reason: "Builders are strongly guided by the purpose-to-calling journey.",
    scriptureBasis: ["Romans 8:28", "Joshua 1:9"],
    tags: ["calling", "journey", "builder"]
  }),
  createRelationship({
    id: "rel_calling_teacher_to_journey_purpose_to_calling",
    sourceNodeId: "calling_teacher",
    targetNodeId: "journey_purpose_to_calling",
    sourceNodeType: "CALLING_PROFILE",
    targetNodeType: "JOURNEY",
    type: "GUIDES",
    strength: 0.84,
    confidenceScore: 0.88,
    reason: "Teachers are guided by purpose as they clarify truth for others.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["calling", "journey", "teacher"]
  }),
  createRelationship({
    id: "rel_calling_servant_to_journey_waiting_to_renewal",
    sourceNodeId: "calling_servant",
    targetNodeId: "journey_waiting_to_renewal",
    sourceNodeType: "CALLING_PROFILE",
    targetNodeType: "JOURNEY",
    type: "GUIDES",
    strength: 0.86,
    confidenceScore: 0.9,
    reason: "Servants often need renewal through waiting and strength.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["calling", "journey", "servant"]
  }),
  createRelationship({
    id: "rel_calling_leader_to_journey_fear_to_courage",
    sourceNodeId: "calling_leader",
    targetNodeId: "journey_fear_to_courage",
    sourceNodeType: "CALLING_PROFILE",
    targetNodeType: "JOURNEY",
    type: "GUIDES",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "Leaders need courage grounded in God's presence.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["calling", "journey", "leader"]
  }),
  createRelationship({
    id: "rel_calling_watchman_to_journey_fear_to_courage",
    sourceNodeId: "calling_watchman",
    targetNodeId: "journey_fear_to_courage",
    sourceNodeType: "CALLING_PROFILE",
    targetNodeType: "JOURNEY",
    type: "GUIDES",
    strength: 0.88,
    confidenceScore: 0.9,
    reason: "Watchmen need courage and presence while standing alert.",
    scriptureBasis: ["Joshua 1:9", "Isaiah 40:31"],
    tags: ["calling", "journey", "watchman"]
  }),

  // Scripture -> Calling relationships
  createRelationship({
    id: "rel_scripture_romans_8_28_to_calling_builder",
    sourceNodeId: "scripture_romans_8_28",
    targetNodeId: "calling_builder",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "CALLING_PROFILE",
    type: "SUPPORTS",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "Romans 8:28 supports builders by anchoring work in God's purpose.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["scripture", "calling", "builder"]
  }),
  createRelationship({
    id: "rel_scripture_romans_8_28_to_calling_servant",
    sourceNodeId: "scripture_romans_8_28",
    targetNodeId: "calling_servant",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "CALLING_PROFILE",
    type: "SUPPORTS",
    strength: 0.8,
    confidenceScore: 0.84,
    reason: "Romans 8:28 supports servants by placing faithful service within God's purpose.",
    scriptureBasis: ["Romans 8:28"],
    tags: ["scripture", "calling", "servant"]
  }),
  createRelationship({
    id: "rel_scripture_joshua_1_9_to_calling_leader",
    sourceNodeId: "scripture_joshua_1_9",
    targetNodeId: "calling_leader",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "CALLING_PROFILE",
    type: "SUPPORTS",
    strength: 0.9,
    confidenceScore: 0.92,
    reason: "Joshua 1:9 supports leaders with courage and God's presence.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["scripture", "calling", "leader"]
  }),
  createRelationship({
    id: "rel_scripture_joshua_1_9_to_calling_watchman",
    sourceNodeId: "scripture_joshua_1_9",
    targetNodeId: "calling_watchman",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "CALLING_PROFILE",
    type: "SUPPORTS",
    strength: 0.82,
    confidenceScore: 0.86,
    reason: "Joshua 1:9 supports watchmen with courage and steadfast presence.",
    scriptureBasis: ["Joshua 1:9"],
    tags: ["scripture", "calling", "watchman"]
  }),
  createRelationship({
    id: "rel_scripture_isaiah_40_31_to_calling_teacher",
    sourceNodeId: "scripture_isaiah_40_31",
    targetNodeId: "calling_teacher",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "CALLING_PROFILE",
    type: "SUPPORTS",
    strength: 0.78,
    confidenceScore: 0.82,
    reason: "Isaiah 40:31 supports teachers with renewal and endurance.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["scripture", "calling", "teacher"]
  }),
  createRelationship({
    id: "rel_scripture_isaiah_40_31_to_calling_servant",
    sourceNodeId: "scripture_isaiah_40_31",
    targetNodeId: "calling_servant",
    sourceNodeType: "SCRIPTURE",
    targetNodeType: "CALLING_PROFILE",
    type: "SUPPORTS",
    strength: 0.85,
    confidenceScore: 0.88,
    reason: "Isaiah 40:31 supports servants with renewed strength in faithful service.",
    scriptureBasis: ["Isaiah 40:31"],
    tags: ["scripture", "calling", "servant"]
  }),

  // Promise Category -> Promise Cluster relationships
  ...createRelationshipGroup({
    sourceNodeType: "PROMISE_CATEGORY",
    targetNodeType: "PROMISE_CLUSTER",
    type: "BELONGS_TO",
    reason: "Promise categories organize matching promise clusters for Scripture-grounded discovery.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["promise", "cluster", "category"],
    pairs: [
      {
        id: "rel_promise_strength_to_cluster_strength_in_waiting",
        sourceNodeId: "promise_strength",
        targetNodeId: "cluster_strength_in_waiting",
        strength: 0.96,
        confidenceScore: 0.96,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_promise_purpose_to_cluster_purpose_in_delay",
        sourceNodeId: "promise_purpose",
        targetNodeId: "cluster_purpose_in_delay",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_promise_courage_to_cluster_courage_through_presence",
        sourceNodeId: "promise_courage",
        targetNodeId: "cluster_courage_through_presence",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_promise_hope_to_cluster_hope_in_discouragement",
        sourceNodeId: "promise_hope",
        targetNodeId: "cluster_hope_in_discouragement",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Isaiah 40:31", "Romans 8:28"]
      },
      {
        id: "rel_promise_courage_to_cluster_guidance_for_next_step",
        sourceNodeId: "promise_courage",
        targetNodeId: "cluster_guidance_for_next_step",
        type: "SUPPORTS",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_promise_purpose_to_cluster_guidance_for_next_step",
        sourceNodeId: "promise_purpose",
        targetNodeId: "cluster_guidance_for_next_step",
        type: "SUPPORTS",
        strength: 0.86,
        confidenceScore: 0.88,
        scriptureBasis: ["Romans 8:28"]
      }
    ]
  }),

  // Promise Cluster -> Scripture relationships
  ...createRelationshipGroup({
    sourceNodeType: "PROMISE_CLUSTER",
    targetNodeType: "SCRIPTURE",
    type: "ANCHORS",
    reason: "Promise clusters anchor directly to the Scripture passages that govern their meaning.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["cluster", "scripture", "anchor"],
    pairs: [
      {
        id: "rel_cluster_strength_in_waiting_to_scripture_isaiah_40_31",
        sourceNodeId: "cluster_strength_in_waiting",
        targetNodeId: "scripture_isaiah_40_31",
        strength: 0.98,
        confidenceScore: 0.98,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_cluster_purpose_in_delay_to_scripture_romans_8_28",
        sourceNodeId: "cluster_purpose_in_delay",
        targetNodeId: "scripture_romans_8_28",
        strength: 0.97,
        confidenceScore: 0.98,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_courage_through_presence_to_scripture_joshua_1_9",
        sourceNodeId: "cluster_courage_through_presence",
        targetNodeId: "scripture_joshua_1_9",
        strength: 0.98,
        confidenceScore: 0.98,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_hope_in_discouragement_to_scripture_isaiah_40_31",
        sourceNodeId: "cluster_hope_in_discouragement",
        targetNodeId: "scripture_isaiah_40_31",
        strength: 0.94,
        confidenceScore: 0.96,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_cluster_hope_in_discouragement_to_scripture_romans_8_28",
        sourceNodeId: "cluster_hope_in_discouragement",
        targetNodeId: "scripture_romans_8_28",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_guidance_for_next_step_to_scripture_joshua_1_9",
        sourceNodeId: "cluster_guidance_for_next_step",
        targetNodeId: "scripture_joshua_1_9",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_guidance_for_next_step_to_scripture_romans_8_28",
        sourceNodeId: "cluster_guidance_for_next_step",
        targetNodeId: "scripture_romans_8_28",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Romans 8:28"]
      }
    ]
  }),

  // Promise Cluster -> Teoyube Word relationships
  ...createRelationshipGroup({
    sourceNodeType: "PROMISE_CLUSTER",
    targetNodeType: "TEOYUBE_WORD",
    type: "REVEALS",
    reason: "Promise clusters reveal Teoyube words that help users remember the Scripture-backed theme.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["cluster", "word", "teoyube"],
    pairs: [
      {
        id: "rel_cluster_strength_in_waiting_to_word_wait",
        sourceNodeId: "cluster_strength_in_waiting",
        targetNodeId: "word_wait",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_cluster_strength_in_waiting_to_word_renew",
        sourceNodeId: "cluster_strength_in_waiting",
        targetNodeId: "word_renew",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_cluster_strength_in_waiting_to_word_strength",
        sourceNodeId: "cluster_strength_in_waiting",
        targetNodeId: "word_strength",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_cluster_strength_in_waiting_to_word_hope",
        sourceNodeId: "cluster_strength_in_waiting",
        targetNodeId: "word_hope",
        strength: 0.86,
        confidenceScore: 0.9,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_cluster_purpose_in_delay_to_word_purpose",
        sourceNodeId: "cluster_purpose_in_delay",
        targetNodeId: "word_purpose",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_purpose_in_delay_to_word_faithful",
        sourceNodeId: "cluster_purpose_in_delay",
        targetNodeId: "word_faithful",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_purpose_in_delay_to_word_promise",
        sourceNodeId: "cluster_purpose_in_delay",
        targetNodeId: "word_promise",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_purpose_in_delay_to_word_wait",
        sourceNodeId: "cluster_purpose_in_delay",
        targetNodeId: "word_wait",
        strength: 0.82,
        confidenceScore: 0.86,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_courage_through_presence_to_word_courage",
        sourceNodeId: "cluster_courage_through_presence",
        targetNodeId: "word_courage",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_courage_through_presence_to_word_presence",
        sourceNodeId: "cluster_courage_through_presence",
        targetNodeId: "word_presence",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_courage_through_presence_to_word_stand",
        sourceNodeId: "cluster_courage_through_presence",
        targetNodeId: "word_stand",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_courage_through_presence_to_word_obey",
        sourceNodeId: "cluster_courage_through_presence",
        targetNodeId: "word_obey",
        strength: 0.84,
        confidenceScore: 0.88,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_hope_in_discouragement_to_word_hope",
        sourceNodeId: "cluster_hope_in_discouragement",
        targetNodeId: "word_hope",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Isaiah 40:31", "Romans 8:28"]
      },
      {
        id: "rel_cluster_hope_in_discouragement_to_word_renew",
        sourceNodeId: "cluster_hope_in_discouragement",
        targetNodeId: "word_renew",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_cluster_hope_in_discouragement_to_word_faithful",
        sourceNodeId: "cluster_hope_in_discouragement",
        targetNodeId: "word_faithful",
        strength: 0.86,
        confidenceScore: 0.9,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_hope_in_discouragement_to_word_promise",
        sourceNodeId: "cluster_hope_in_discouragement",
        targetNodeId: "word_promise",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_guidance_for_next_step_to_word_obey",
        sourceNodeId: "cluster_guidance_for_next_step",
        targetNodeId: "word_obey",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_guidance_for_next_step_to_word_stand",
        sourceNodeId: "cluster_guidance_for_next_step",
        targetNodeId: "word_stand",
        strength: 0.86,
        confidenceScore: 0.88,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_guidance_for_next_step_to_word_calling",
        sourceNodeId: "cluster_guidance_for_next_step",
        targetNodeId: "word_calling",
        strength: 0.82,
        confidenceScore: 0.86,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_guidance_for_next_step_to_word_purpose",
        sourceNodeId: "cluster_guidance_for_next_step",
        targetNodeId: "word_purpose",
        strength: 0.84,
        confidenceScore: 0.88,
        scriptureBasis: ["Romans 8:28"]
      }
    ]
  }),

  // Promise Cluster -> Journey relationships
  ...createRelationshipGroup({
    sourceNodeType: "PROMISE_CLUSTER",
    targetNodeType: "JOURNEY",
    type: "LEADS_TO",
    reason: "Promise clusters lead users into growth journeys that turn Scripture-backed truth into practice.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["cluster", "journey", "growth"],
    pairs: [
      {
        id: "rel_cluster_strength_in_waiting_to_journey_waiting_to_renewal",
        sourceNodeId: "cluster_strength_in_waiting",
        targetNodeId: "journey_waiting_to_renewal",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_cluster_purpose_in_delay_to_journey_waiting_to_renewal",
        sourceNodeId: "cluster_purpose_in_delay",
        targetNodeId: "journey_waiting_to_renewal",
        strength: 0.86,
        confidenceScore: 0.88,
        scriptureBasis: ["Romans 8:28", "Isaiah 40:31"]
      },
      {
        id: "rel_cluster_purpose_in_delay_to_journey_purpose_to_calling",
        sourceNodeId: "cluster_purpose_in_delay",
        targetNodeId: "journey_purpose_to_calling",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_cluster_courage_through_presence_to_journey_fear_to_courage",
        sourceNodeId: "cluster_courage_through_presence",
        targetNodeId: "journey_fear_to_courage",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_hope_in_discouragement_to_journey_waiting_to_renewal",
        sourceNodeId: "cluster_hope_in_discouragement",
        targetNodeId: "journey_waiting_to_renewal",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Isaiah 40:31", "Romans 8:28"]
      },
      {
        id: "rel_cluster_guidance_for_next_step_to_journey_fear_to_courage",
        sourceNodeId: "cluster_guidance_for_next_step",
        targetNodeId: "journey_fear_to_courage",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_cluster_guidance_for_next_step_to_journey_purpose_to_calling",
        sourceNodeId: "cluster_guidance_for_next_step",
        targetNodeId: "journey_purpose_to_calling",
        strength: 0.86,
        confidenceScore: 0.88,
        scriptureBasis: ["Romans 8:28"]
      }
    ]
  }),

  // Emotion -> Prayer Sequence relationships
  ...createRelationshipGroup({
    sourceNodeType: "EMOTION_PROFILE",
    targetNodeType: "PRAYER_SEQUENCE",
    type: "GENERATES",
    reason: "Emotion profiles generate prayer sequences without letting emotion define truth.",
    scriptureBasis: ["Isaiah 40:31", "Joshua 1:9", "Romans 8:28"],
    tags: ["emotion", "prayer", "sequence"],
    pairs: [
      {
        id: "rel_emotion_waiting_to_prayer_waiting_with_hope",
        sourceNodeId: "emotion_waiting",
        targetNodeId: "prayer_waiting_with_hope",
        strength: 0.96,
        confidenceScore: 0.96,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_emotion_discouragement_to_prayer_strength_in_discouragement",
        sourceNodeId: "emotion_discouragement",
        targetNodeId: "prayer_strength_in_discouragement",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Isaiah 40:31", "Romans 8:28"]
      },
      {
        id: "rel_emotion_fear_to_prayer_courage_and_presence",
        sourceNodeId: "emotion_fear",
        targetNodeId: "prayer_courage_and_presence",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_emotion_waiting_to_prayer_guidance_for_next_step",
        sourceNodeId: "emotion_waiting",
        targetNodeId: "prayer_guidance_for_next_step",
        strength: 0.84,
        confidenceScore: 0.86,
        scriptureBasis: ["Isaiah 40:31", "Romans 8:28"]
      },
      {
        id: "rel_emotion_fear_to_prayer_guidance_for_next_step",
        sourceNodeId: "emotion_fear",
        targetNodeId: "prayer_guidance_for_next_step",
        strength: 0.82,
        confidenceScore: 0.84,
        scriptureBasis: ["Joshua 1:9"]
      }
    ]
  }),

  // Promise -> Prayer Sequence relationships
  ...createRelationshipGroup({
    sourceNodeType: "PROMISE_CATEGORY",
    targetNodeType: "PRAYER_SEQUENCE",
    type: "GENERATES",
    reason: "Promise categories generate prayer sequences that respond to Scripture-backed promise themes.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["promise", "prayer", "sequence"],
    pairs: [
      {
        id: "rel_promise_strength_to_prayer_waiting_with_hope",
        sourceNodeId: "promise_strength",
        targetNodeId: "prayer_waiting_with_hope",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_promise_strength_to_prayer_strength_in_discouragement",
        sourceNodeId: "promise_strength",
        targetNodeId: "prayer_strength_in_discouragement",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_promise_courage_to_prayer_courage_and_presence",
        sourceNodeId: "promise_courage",
        targetNodeId: "prayer_courage_and_presence",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_promise_purpose_to_prayer_purpose_and_calling",
        sourceNodeId: "promise_purpose",
        targetNodeId: "prayer_purpose_and_calling",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_promise_courage_to_prayer_guidance_for_next_step",
        sourceNodeId: "promise_courage",
        targetNodeId: "prayer_guidance_for_next_step",
        strength: 0.86,
        confidenceScore: 0.88,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_promise_purpose_to_prayer_guidance_for_next_step",
        sourceNodeId: "promise_purpose",
        targetNodeId: "prayer_guidance_for_next_step",
        strength: 0.84,
        confidenceScore: 0.86,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_promise_hope_to_prayer_waiting_with_hope",
        sourceNodeId: "promise_hope",
        targetNodeId: "prayer_waiting_with_hope",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_promise_hope_to_prayer_strength_in_discouragement",
        sourceNodeId: "promise_hope",
        targetNodeId: "prayer_strength_in_discouragement",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Romans 8:28", "Isaiah 40:31"]
      }
    ]
  }),

  // Journey -> Reflection Prompt relationships
  ...createRelationshipGroup({
    sourceNodeType: "JOURNEY",
    targetNodeType: "REFLECTION_PROMPT",
    type: "GENERATES",
    reason: "Journeys generate reflection prompts that help users discern the next faithful step.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["journey", "reflection", "prompt"],
    pairs: [
      {
        id: "rel_journey_waiting_to_renewal_to_reflection_name_the_waiting",
        sourceNodeId: "journey_waiting_to_renewal",
        targetNodeId: "reflection_name_the_waiting",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_journey_waiting_to_renewal_to_reflection_promise_for_current_season",
        sourceNodeId: "journey_waiting_to_renewal",
        targetNodeId: "reflection_promise_for_current_season",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Isaiah 40:31", "Romans 8:28"]
      },
      {
        id: "rel_journey_fear_to_courage_to_reflection_name_the_fear",
        sourceNodeId: "journey_fear_to_courage",
        targetNodeId: "reflection_name_the_fear",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_journey_fear_to_courage_to_reflection_next_faithful_step",
        sourceNodeId: "journey_fear_to_courage",
        targetNodeId: "reflection_next_faithful_step",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_journey_purpose_to_calling_to_reflection_where_is_god_working",
        sourceNodeId: "journey_purpose_to_calling",
        targetNodeId: "reflection_where_is_god_working",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_journey_purpose_to_calling_to_reflection_notice_patterns",
        sourceNodeId: "journey_purpose_to_calling",
        targetNodeId: "reflection_notice_patterns",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_journey_purpose_to_calling_to_reflection_next_faithful_step",
        sourceNodeId: "journey_purpose_to_calling",
        targetNodeId: "reflection_next_faithful_step",
        strength: 0.86,
        confidenceScore: 0.88,
        scriptureBasis: ["Joshua 1:9", "Romans 8:28"]
      }
    ]
  }),

  // Journey -> Growth Milestone relationships
  ...createRelationshipGroup({
    sourceNodeType: "JOURNEY",
    targetNodeType: "GROWTH_MILESTONE",
    type: "LEADS_TO",
    reason: "Journeys lead to growth milestones that can be tracked as transformation markers.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["journey", "growth", "milestone"],
    pairs: [
      {
        id: "rel_journey_waiting_to_renewal_to_milestone_waiting_named",
        sourceNodeId: "journey_waiting_to_renewal",
        targetNodeId: "milestone_waiting_named",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_journey_waiting_to_renewal_to_milestone_strength_received",
        sourceNodeId: "journey_waiting_to_renewal",
        targetNodeId: "milestone_strength_received",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_journey_fear_to_courage_to_milestone_fear_named",
        sourceNodeId: "journey_fear_to_courage",
        targetNodeId: "milestone_fear_named",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_journey_fear_to_courage_to_milestone_courage_step_taken",
        sourceNodeId: "journey_fear_to_courage",
        targetNodeId: "milestone_courage_step_taken",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_journey_purpose_to_calling_to_milestone_purpose_recognized",
        sourceNodeId: "journey_purpose_to_calling",
        targetNodeId: "milestone_purpose_recognized",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_journey_purpose_to_calling_to_milestone_first_calling_step",
        sourceNodeId: "journey_purpose_to_calling",
        targetNodeId: "milestone_first_calling_step",
        strength: 0.95,
        confidenceScore: 0.96,
        scriptureBasis: ["Romans 8:28", "Joshua 1:9"]
      }
    ]
  }),

  // Action Step -> Growth Milestone relationships
  ...createRelationshipGroup({
    sourceNodeType: "ACTION_STEP",
    targetNodeType: "GROWTH_MILESTONE",
    type: "ACTIVATES",
    reason: "Action steps activate measurable milestones inside a user's growth journey.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["action", "growth", "milestone"],
    pairs: [
      {
        id: "rel_action_write_the_delay_to_milestone_waiting_named",
        sourceNodeId: "action_write_the_delay",
        targetNodeId: "milestone_waiting_named",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_action_pray_for_strength_to_milestone_strength_received",
        sourceNodeId: "action_pray_for_strength",
        targetNodeId: "milestone_strength_received",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_action_write_the_fear_to_milestone_fear_named",
        sourceNodeId: "action_write_the_fear",
        targetNodeId: "milestone_fear_named",
        strength: 0.94,
        confidenceScore: 0.95,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_action_stand_in_courage_to_milestone_courage_step_taken",
        sourceNodeId: "action_stand_in_courage",
        targetNodeId: "milestone_courage_step_taken",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_action_take_one_obedient_step_to_milestone_courage_step_taken",
        sourceNodeId: "action_take_one_obedient_step",
        targetNodeId: "milestone_courage_step_taken",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_action_write_the_vision_to_milestone_purpose_recognized",
        sourceNodeId: "action_write_the_vision",
        targetNodeId: "milestone_purpose_recognized",
        strength: 0.92,
        confidenceScore: 0.94,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_action_list_gifts_and_burdens_to_milestone_first_calling_step",
        sourceNodeId: "action_list_gifts_and_burdens",
        targetNodeId: "milestone_first_calling_step",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_action_take_one_obedient_step_to_milestone_first_calling_step",
        sourceNodeId: "action_take_one_obedient_step",
        targetNodeId: "milestone_first_calling_step",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Joshua 1:9", "Romans 8:28"]
      }
    ]
  }),

  // AI Response Pattern relationships
  ...createRelationshipGroup({
    sourceNodeType: "AI_RESPONSE_PATTERN",
    type: "SUPPORTS",
    reason: "AI response patterns support the graph concepts they can safely use in Scripture-anchored responses.",
    scriptureBasis: ["Romans 8:28", "Isaiah 40:31", "Joshua 1:9"],
    tags: ["ai-pattern", "response", "support"],
    pairs: [
      {
        id: "rel_ai_pattern_encouragement_response_to_promise_strength",
        sourceNodeId: "ai_pattern_encouragement_response",
        targetNodeId: "promise_strength",
        targetNodeType: "PROMISE_CATEGORY",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_ai_pattern_encouragement_response_to_promise_hope",
        sourceNodeId: "ai_pattern_encouragement_response",
        targetNodeId: "promise_hope",
        targetNodeType: "PROMISE_CATEGORY",
        strength: 0.88,
        confidenceScore: 0.9,
        scriptureBasis: ["Romans 8:28", "Isaiah 40:31"]
      },
      {
        id: "rel_ai_pattern_calling_discernment_response_to_promise_purpose",
        sourceNodeId: "ai_pattern_calling_discernment_response",
        targetNodeId: "promise_purpose",
        targetNodeType: "PROMISE_CATEGORY",
        strength: 0.9,
        confidenceScore: 0.92,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_ai_pattern_calling_discernment_response_to_calling_builder",
        sourceNodeId: "ai_pattern_calling_discernment_response",
        targetNodeId: "calling_builder",
        targetNodeType: "CALLING_PROFILE",
        strength: 0.82,
        confidenceScore: 0.86,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_ai_pattern_calling_discernment_response_to_calling_leader",
        sourceNodeId: "ai_pattern_calling_discernment_response",
        targetNodeId: "calling_leader",
        targetNodeType: "CALLING_PROFILE",
        strength: 0.82,
        confidenceScore: 0.86,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_ai_pattern_prayer_response_to_prayer_waiting_with_hope",
        sourceNodeId: "ai_pattern_prayer_response",
        targetNodeId: "prayer_waiting_with_hope",
        targetNodeType: "PRAYER_SEQUENCE",
        strength: 0.86,
        confidenceScore: 0.88,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_ai_pattern_prayer_response_to_prayer_courage_and_presence",
        sourceNodeId: "ai_pattern_prayer_response",
        targetNodeId: "prayer_courage_and_presence",
        targetNodeType: "PRAYER_SEQUENCE",
        strength: 0.84,
        confidenceScore: 0.86,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_ai_pattern_journey_guidance_response_to_journey_waiting_to_renewal",
        sourceNodeId: "ai_pattern_journey_guidance_response",
        targetNodeId: "journey_waiting_to_renewal",
        targetNodeType: "JOURNEY",
        strength: 0.86,
        confidenceScore: 0.88,
        scriptureBasis: ["Isaiah 40:31"]
      },
      {
        id: "rel_ai_pattern_journey_guidance_response_to_journey_fear_to_courage",
        sourceNodeId: "ai_pattern_journey_guidance_response",
        targetNodeId: "journey_fear_to_courage",
        targetNodeType: "JOURNEY",
        strength: 0.84,
        confidenceScore: 0.86,
        scriptureBasis: ["Joshua 1:9"]
      },
      {
        id: "rel_ai_pattern_daily_word_response_to_word_promise",
        sourceNodeId: "ai_pattern_daily_word_response",
        targetNodeId: "word_promise",
        targetNodeType: "TEOYUBE_WORD",
        strength: 0.78,
        confidenceScore: 0.82,
        scriptureBasis: ["Romans 8:28"]
      },
      {
        id: "rel_ai_pattern_daily_word_response_to_word_faithful",
        sourceNodeId: "ai_pattern_daily_word_response",
        targetNodeId: "word_faithful",
        targetNodeType: "TEOYUBE_WORD",
        strength: 0.76,
        confidenceScore: 0.8,
        scriptureBasis: ["Romans 8:28"]
      }
    ]
  })
];

export function getRelationshipSeedById(id: string): TIGRelationship | undefined {
  return TIG_RELATIONSHIP_SEEDS.find((relationship) => relationship.id === id);
}

export function getRelationshipsFromNode(sourceNodeId: string): TIGRelationship[] {
  return TIG_RELATIONSHIP_SEEDS.filter((relationship) => relationship.sourceNodeId === sourceNodeId);
}

export function getRelationshipsToNode(targetNodeId: string): TIGRelationship[] {
  return TIG_RELATIONSHIP_SEEDS.filter((relationship) => relationship.targetNodeId === targetNodeId);
}

export function getRelationshipsForNode(nodeId: string): TIGRelationship[] {
  return TIG_RELATIONSHIP_SEEDS.filter(
    (relationship) => relationship.sourceNodeId === nodeId || relationship.targetNodeId === nodeId
  );
}
