import type {
  TigProductionInput,
  TigProductionSurface
} from "../production-response-contracts";

export type TigRuntimeFixtureMutation =
  | "none"
  | "weak_confidence"
  | "missing_scripture_anchor"
  | "missing_explanation_path"
  | "unsafe_action_step";

export type TigProductionRuntimeTestFixture = {
  name: string;
  input: TigProductionInput;
  expectedBehavior: string;
  fallbackExpected: boolean;
  blockedExpected: boolean;
  minimumExpectedConfidenceLabel: "weak" | "partial" | "good" | "strong";
  requiredResponseFields: string[];
  mutation?: TigRuntimeFixtureMutation;
};

const REQUIRED_PRODUCTION_FIELDS = [
  "selection.teoyubeWord",
  "selection.promiseCluster",
  "selection.scriptureAnchor",
  "selection.prayerSequence",
  "selection.actionStep",
  "confidence.score",
  "confidence.label",
  "explanation.reasonPath",
  "fallback",
  "safety",
  "event",
  "visualization"
];

function surfaceFixture(surface: TigProductionSurface): TigProductionRuntimeTestFixture {
  return {
    name: `${surface} surface input`,
    input: {
      input: `Give me a Scripture-grounded response for the ${surface} surface.`,
      userState: "I need Scripture-grounded encouragement.",
      emotion: "waiting",
      intent: "receive_promise",
      surface
    },
    expectedBehavior: `Returns a complete production response for the ${surface} surface.`,
    fallbackExpected: false,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  };
}

export const TIG_PHASE_5B3_RUNTIME_TEST_FIXTURES: TigProductionRuntimeTestFixture[] = [
  {
    name: "normal input with clear emotion",
    input: {
      input: "I feel discouraged and need strength from Scripture.",
      userState: "discouragement",
      emotion: "discouragement",
      intent: "seeking_encouragement",
      surface: "promise_cluster"
    },
    expectedBehavior: "Returns a complete Scripture-anchored production response.",
    fallbackExpected: false,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  },
  {
    name: "missing emotion",
    input: {
      input: "I need a promise for today.",
      userState: "I need help trusting God today.",
      intent: "receive_promise",
      surface: "canon"
    },
    expectedBehavior: "Uses a safe fallback reason for missing emotion without crashing.",
    fallbackExpected: true,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  },
  {
    name: "unknown emotion",
    input: {
      input: "I feel a strange inner fog and need Scripture.",
      userState: "inner fog",
      emotion: "glimmerfog",
      intent: "receive_promise",
      surface: "ai_companion"
    },
    expectedBehavior: "Uses fallback support for unknown emotion and still anchors in Scripture.",
    fallbackExpected: true,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  },
  {
    name: "selected word not found",
    input: {
      input: "Connect this to a word if possible.",
      userState: "waiting",
      emotion: "waiting",
      selectedWordId: "word_not_real",
      intent: "receive_promise",
      surface: "canon"
    },
    expectedBehavior: "Uses a default Teoyube word when the selected word cannot be found.",
    fallbackExpected: true,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  },
  {
    name: "weak confidence",
    input: {
      input: "Unclear request.",
      surface: "unknown"
    },
    expectedBehavior: "Weak confidence simulation triggers fallback.",
    fallbackExpected: true,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS,
    mutation: "weak_confidence"
  },
  {
    name: "missing Scripture anchor simulation",
    input: {
      input: "I need courage.",
      userState: "fear",
      emotion: "fear",
      surface: "promise_cluster"
    },
    expectedBehavior: "Missing Scripture anchor simulation is repaired by fallback.",
    fallbackExpected: true,
    blockedExpected: true,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS,
    mutation: "missing_scripture_anchor"
  },
  {
    name: "missing explanation path simulation",
    input: {
      input: "Help me understand what to do next.",
      userState: "waiting",
      emotion: "waiting",
      surface: "ai_companion"
    },
    expectedBehavior: "Missing explanation path simulation is repaired by fallback.",
    fallbackExpected: true,
    blockedExpected: true,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS,
    mutation: "missing_explanation_path"
  },
  {
    name: "unsafe action step simulation",
    input: {
      input: "I feel angry and need a next step.",
      userState: "fear",
      emotion: "fear",
      surface: "ai_companion"
    },
    expectedBehavior: "Unsafe action simulation is blocked or replaced by guardrails.",
    fallbackExpected: true,
    blockedExpected: true,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS,
    mutation: "unsafe_action_step"
  },
  {
    name: "malformed input",
    input: {
      input: "   ",
      surface: "unknown"
    },
    expectedBehavior: "Malformed input uses safe default production input and fallback support.",
    fallbackExpected: true,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  },
  {
    name: "empty input",
    input: {},
    expectedBehavior: "Empty input does not crash and returns a safe fallback path.",
    fallbackExpected: true,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  },
  {
    name: "fallback response",
    input: {
      input: "",
      userState: "",
      emotion: "",
      selectedWordId: "unknown_word",
      selectedClusterId: "unknown_cluster",
      surface: "unknown"
    },
    expectedBehavior: "Explicit fallback-heavy input returns complete fallback response.",
    fallbackExpected: true,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  },
  {
    name: "cacheable response",
    input: {
      input: "I am waiting and need hope.",
      userState: "waiting",
      emotion: "waiting",
      intent: "receive_promise",
      surface: "daily_word"
    },
    expectedBehavior: "Cache key is stable and cached response can be retrieved.",
    fallbackExpected: false,
    blockedExpected: false,
    minimumExpectedConfidenceLabel: "weak",
    requiredResponseFields: REQUIRED_PRODUCTION_FIELDS
  },
  surfaceFixture("canon"),
  surfaceFixture("daily_word"),
  surfaceFixture("prayer"),
  surfaceFixture("calling_compass"),
  surfaceFixture("ai_companion")
];
