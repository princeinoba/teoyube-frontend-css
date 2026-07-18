import { getCoreTeoyubeVocabulary, getPromiseClustersData, getScriptureCanonData } from "../data/teoyube-data-access";
import type { TeoyubeRealUserJourneyQaScenario } from "./real-user-journey-qa-contracts";

function firstWordId(): string {
  return getScriptureCanonData()[0]?.word || getCoreTeoyubeVocabulary()[0]?.word || "Benor";
}

function firstClusterId(): string {
  return getPromiseClustersData()[0]?.id || getPromiseClustersData()[0]?.cluster_id || "PC01";
}

export function createWordJourneyQaScenario(wordId: string): TeoyubeRealUserJourneyQaScenario {
  return {
    id: `word_journey_${wordId}`,
    label: `Word journey QA: ${wordId}`,
    surface: "word_card",
    input: { wordId, query: wordId, surface: "word_card", stage: "word_card", safeDisplayLabel: `Word ${wordId}` },
    expectedSurfaces: ["word_card", "tig_response_panel"],
    source: "real_vocabulary",
    realDataOnly: true
  };
}

export function createPromiseJourneyQaScenario(clusterId: string): TeoyubeRealUserJourneyQaScenario {
  return {
    id: `promise_journey_${clusterId}`,
    label: `Promise Cluster journey QA: ${clusterId}`,
    surface: "promise_table",
    input: { clusterId, query: clusterId, surface: "promise_table", stage: "promise_cluster", safeDisplayLabel: `Promise Cluster ${clusterId}` },
    expectedSurfaces: ["promise_table", "tig_response_panel"],
    source: "real_promise_cluster",
    realDataOnly: true
  };
}

export function createPrayerJourneyQaScenario(input: string): TeoyubeRealUserJourneyQaScenario {
  return {
    id: "prayer_journey_scripture_grounded",
    label: "Prayer Companion journey QA",
    surface: "prayer_companion",
    input: { prayerInput: input, query: input, surface: "prayer_companion", stage: "prayer_companion", safeDisplayLabel: "Prayer Companion QA" },
    expectedSurfaces: ["prayer_companion", "tig_response_panel"],
    source: "journey_orchestrator",
    realDataOnly: true
  };
}

export function createCallingJourneyQaScenario(input: string): TeoyubeRealUserJourneyQaScenario {
  return {
    id: "calling_journey_scripture_grounded",
    label: "Calling Compass journey QA",
    surface: "compass_experience",
    input: { callingInput: input, query: input, surface: "compass_experience", stage: "calling_compass", safeDisplayLabel: "Calling Compass QA" },
    expectedSurfaces: ["compass_experience", "tig_response_panel"],
    source: "journey_orchestrator",
    realDataOnly: true
  };
}

export function createFallbackJourneyQaScenario(input: string): TeoyubeRealUserJourneyQaScenario {
  return {
    id: "fallback_journey_review",
    label: "Fallback journey QA",
    surface: "fallback_state",
    input: { query: input, surface: "unknown", stage: "fallback", safeDisplayLabel: "Fallback QA" },
    expectedSurfaces: ["unknown"],
    source: "safe_fallback",
    realDataOnly: true
  };
}

export function createTigTraceJourneyQaScenario(input: string): TeoyubeRealUserJourneyQaScenario {
  return {
    id: "tig_trace_journey",
    label: "TIG trace journey QA",
    surface: "tig_response_panel",
    input: { query: input, wordId: firstWordId(), clusterId: firstClusterId(), surface: "tig_response_panel", stage: "tig_response", safeDisplayLabel: "TIG trace QA" },
    expectedSurfaces: ["tig_response_panel", "tig_graph_explorer"],
    source: "tig_flow",
    realDataOnly: true
  };
}

export function getRealUserJourneyQaScenarios(): TeoyubeRealUserJourneyQaScenario[] {
  return [
    createWordJourneyQaScenario(firstWordId()),
    createPromiseJourneyQaScenario(firstClusterId()),
    createPrayerJourneyQaScenario("Scripture-grounded prayer and direction"),
    createCallingJourneyQaScenario("calling purpose builder"),
    createFallbackJourneyQaScenario("unsupported ambiguous request"),
    createTigTraceJourneyQaScenario("calling purpose")
  ];
}
