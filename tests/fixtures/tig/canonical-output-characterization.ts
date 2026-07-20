import type { TigRecommendationInput } from "../../../src/domain/tig/tig-service";
import type { TeoyubeTigRecommendationInput } from "../../../src/lib/teoyube/tig/tig-recommendation-contracts";

type TigCharacterizationFixture = Readonly<{
  id: string;
  legacyInput: TeoyubeTigRecommendationInput;
  serviceInput: TigRecommendationInput;
  expected: Readonly<{
    selectedId: string;
    selectedType: string;
    selectedLabel: string;
    source: string;
    candidateCount: number;
    firstCandidateIds: readonly string[];
    confidenceScore: number;
    confidenceLabel: string;
    scriptureAnchorCount: number;
    firstScriptureAnchor: string;
    lastScriptureAnchor: string;
    selectedNodeCount: number;
    selectedRelationshipCount: number;
    fallbackUsed: boolean;
    fallbackReasons: readonly string[];
    explanationStepLabels: readonly string[];
  }>;
}>;

export const TIG_CHARACTERIZATION_FIXTURES: readonly TigCharacterizationFixture[] = Object.freeze([
  {
    id: "daily-loop",
    legacyInput: { query: "calling purpose faithful next step", wordId: "TIDUILOVP", clusterId: "calling-purpose", surface: "daily_word" },
    serviceInput: { query: "calling purpose faithful next step", intent: "daily_journey", selectedWordId: "TIDUILOVP", selectedPromiseClusterId: "calling-purpose", surface: "daily_word" },
    expected: {
      selectedId: "fallback:scripture_grounded_encouragement",
      selectedType: "prayer",
      selectedLabel: "Scripture-grounded fallback encouragement",
      source: "safe_fallback",
      candidateCount: 19,
      firstCandidateIds: ["calling:calling_builder", "action:1", "action:2", "action:3", "action:4", "word:teoyube"],
      confidenceScore: 0.3491666666666666,
      confidenceLabel: "fallback_match",
      scriptureAnchorCount: 1,
      firstScriptureAnchor: "Ephesians 1:18",
      lastScriptureAnchor: "Ephesians 1:18",
      selectedNodeCount: 60,
      selectedRelationshipCount: 131,
      fallbackUsed: true,
      fallbackReasons: [
        "Requested word TIDUILOVP was not found directly; WordCard context used a safe fallback word.",
        "No Promise Cluster matched the request directly."
      ],
      explanationStepLabels: ["Received local context", "Matched Teoyube word", "Checked Scripture anchor", "Prepared prayer support", "Connected calling path", "Suggested next step", "Checked TIG graph relationships", "Applied confidence label", "Fallback framing used"]
    }
  },
  {
    id: "prayer",
    legacyInput: { query: "wisdom and surrender", prayerInput: "wisdom and surrender", surface: "prayer" },
    serviceInput: { query: "wisdom and surrender", prayerInput: "wisdom and surrender", intent: "prayer", surface: "prayer" },
    expected: {
      selectedId: "calling:A09",
      selectedType: "calling",
      selectedLabel: "The Teacher",
      source: "calling_engine",
      candidateCount: 64,
      firstCandidateIds: ["calling:A09", "promise:PC05", "word:SC001", "action:1", "action:2", "action:3"],
      confidenceScore: 0.9883333333333334,
      confidenceLabel: "strong_scripture_match",
      scriptureAnchorCount: 5,
      firstScriptureAnchor: "Isaiah 40:31",
      lastScriptureAnchor: "Romans 8:28-30",
      selectedNodeCount: 34,
      selectedRelationshipCount: 124,
      fallbackUsed: false,
      fallbackReasons: [],
      explanationStepLabels: ["Received local context", "Matched Teoyube word", "Matched Promise Cluster", "Checked Scripture anchor", "Prepared prayer support", "Connected calling path", "Suggested next step", "Checked TIG graph relationships", "Applied confidence label"]
    }
  },
  {
    id: "calling",
    legacyInput: { query: "calling purpose", callingInput: "calling purpose", surface: "calling" },
    serviceInput: { query: "calling purpose", callingInput: "calling purpose", intent: "calling", surface: "calling" },
    expected: {
      selectedId: "calling:calling_builder",
      selectedType: "calling",
      selectedLabel: "The Builder",
      source: "calling_engine",
      candidateCount: 65,
      firstCandidateIds: ["calling:calling_builder", "word:SC001", "promise:PC05", "action:1", "action:2", "action:3"],
      confidenceScore: 1,
      confidenceLabel: "strong_scripture_match",
      scriptureAnchorCount: 7,
      firstScriptureAnchor: "Romans 8:28",
      lastScriptureAnchor: "Psalm 119:105",
      selectedNodeCount: 53,
      selectedRelationshipCount: 131,
      fallbackUsed: false,
      fallbackReasons: [],
      explanationStepLabels: ["Received local context", "Matched Teoyube word", "Matched Promise Cluster", "Checked Scripture anchor", "Prepared prayer support", "Connected calling path", "Suggested next step", "Checked TIG graph relationships", "Applied confidence label"]
    }
  },
  {
    id: "promise",
    legacyInput: { query: "hope strength", clusterId: "hope", surface: "promise_table" },
    serviceInput: { query: "hope strength", selectedPromiseClusterId: "hope", intent: "promise", surface: "promise_table" },
    expected: {
      selectedId: "fallback:scripture_grounded_encouragement",
      selectedType: "prayer",
      selectedLabel: "Scripture-grounded fallback encouragement",
      source: "safe_fallback",
      candidateCount: 36,
      firstCandidateIds: ["calling:calling_servant", "word:SC001", "action:1", "action:2", "action:3", "action:4"],
      confidenceScore: 0.24091666666666664,
      confidenceLabel: "fallback_match",
      scriptureAnchorCount: 1,
      firstScriptureAnchor: "Ephesians 1:4",
      lastScriptureAnchor: "Ephesians 1:4",
      selectedNodeCount: 54,
      selectedRelationshipCount: 131,
      fallbackUsed: true,
      fallbackReasons: ["No Promise Cluster matched the request directly."],
      explanationStepLabels: ["Received local context", "Matched Teoyube word", "Checked Scripture anchor", "Prepared prayer support", "Connected calling path", "Suggested next step", "Checked TIG graph relationships", "Applied confidence label", "Fallback framing used"]
    }
  },
  {
    id: "fallback-characterization",
    legacyInput: { query: "zzzz-no-match", surface: "tig_response_panel" },
    serviceInput: { query: "zzzz-no-match", intent: "unknown", surface: "tig_response_panel" },
    expected: {
      selectedId: "promise:PC05",
      selectedType: "promise",
      selectedLabel: "Sonship & Belonging",
      source: "real_promise_cluster",
      candidateCount: 59,
      firstCandidateIds: ["promise:PC05", "word:SC001", "calling:A01", "action:1", "action:2", "action:3"],
      confidenceScore: 0.8400000000000001,
      confidenceLabel: "strong_scripture_match",
      scriptureAnchorCount: 36,
      firstScriptureAnchor: "Romans 8:15-17",
      lastScriptureAnchor: "Galatians 3:26",
      selectedNodeCount: 25,
      selectedRelationshipCount: 82,
      fallbackUsed: false,
      fallbackReasons: [],
      explanationStepLabels: ["Received local context", "Matched Teoyube word", "Matched Promise Cluster", "Checked Scripture anchor", "Prepared prayer support", "Connected calling path", "Suggested next step", "Checked TIG graph relationships", "Applied confidence label"]
    }
  }
]);
