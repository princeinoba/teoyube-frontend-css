import {
  getCoreTeoyubeVocabulary,
  getPromiseClustersData,
  getScriptureCanonData
} from "../data/teoyube-data-access";
import type { TeoyubeTigRecommendationInput } from "./tig-recommendation-contracts";

export type TeoyubeTigRealDataQaScenario = {
  id: string;
  label: string;
  input: TeoyubeTigRecommendationInput;
  expectedScriptureAnchor?: string;
  expectedRealDataSource: "vocabulary" | "promise_cluster" | "scripture_canon" | "calling_input" | "fallback";
};

function firstWordId(): string {
  const word = getCoreTeoyubeVocabulary()[0];
  return word?.word || word?.id || "Benor";
}

function firstClusterId(): string {
  return getPromiseClustersData()[0]?.id || "PC01";
}

function firstScriptureRef(): string | undefined {
  return getScriptureCanonData()[0]?.scriptureReferences?.[0];
}

export function createTigRealDataQaScenarioFromWord(wordId: string): TeoyubeTigRealDataQaScenario {
  return {
    id: `word_${wordId}`,
    label: `Real word scenario: ${wordId}`,
    input: {
      wordId,
      query: wordId,
      surface: "word_card"
    },
    expectedScriptureAnchor: firstScriptureRef(),
    expectedRealDataSource: "vocabulary"
  };
}

export function createTigRealDataQaScenarioFromPromiseCluster(clusterId: string): TeoyubeTigRealDataQaScenario {
  return {
    id: `promise_${clusterId}`,
    label: `Real Promise Cluster scenario: ${clusterId}`,
    input: {
      clusterId,
      query: clusterId,
      surface: "promise_table"
    },
    expectedScriptureAnchor: getPromiseClustersData()[0]?.scriptureReferences?.[0],
    expectedRealDataSource: "promise_cluster"
  };
}

export function createTigRealDataQaScenarioFromCallingInput(input: string): TeoyubeTigRealDataQaScenario {
  return {
    id: `calling_${input.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "input"}`,
    label: `Calling input scenario: ${input}`,
    input: {
      query: input,
      callingInput: input,
      surface: "calling"
    },
    expectedScriptureAnchor: firstScriptureRef(),
    expectedRealDataSource: "calling_input"
  };
}

export function getTigRealDataQaScenarios(): TeoyubeTigRealDataQaScenario[] {
  const wordId = firstWordId();
  const clusterId = firstClusterId();

  return [
    createTigRealDataQaScenarioFromWord(wordId),
    createTigRealDataQaScenarioFromPromiseCluster(clusterId),
    createTigRealDataQaScenarioFromCallingInput("calling purpose builder"),
    {
      id: "prayer_real_data",
      label: "Prayer scenario from real Promise Cluster data",
      input: {
        query: "calling purpose prayer",
        prayerInput: "calling purpose prayer",
        surface: "prayer"
      },
      expectedScriptureAnchor: firstScriptureRef(),
      expectedRealDataSource: "promise_cluster"
    },
    {
      id: "ambiguous_fallback",
      label: "Ambiguous fallback scenario",
      input: {
        query: "zzzz unsupported ambiguous request",
        surface: "unknown"
      },
      expectedScriptureAnchor: firstScriptureRef(),
      expectedRealDataSource: "fallback"
    }
  ];
}

export function getTigRealDataQaScenarioById(id: string): TeoyubeTigRealDataQaScenario | undefined {
  return getTigRealDataQaScenarios().find((scenario) => scenario.id === id);
}
