import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import {
  runTigEndToEndRecommendation,
  runTigCallingRecommendation,
  runTigPromiseRecommendation,
  runTigWordRecommendation
} from "./tig-end-to-end-recommendation-flow";
import type {
  TeoyubeTigRealDataQaResult,
  TeoyubeTigRecommendationInput
} from "./tig-recommendation-contracts";
import {
  createTigRealDataQaScenarioFromCallingInput,
  createTigRealDataQaScenarioFromPromiseCluster,
  createTigRealDataQaScenarioFromWord,
  getTigRealDataQaScenarios,
  type TeoyubeTigRealDataQaScenario
} from "./tig-real-data-qa-scenarios";

function result(
  scenario: TeoyubeTigRealDataQaScenario,
  input: TeoyubeTigRecommendationInput
): TeoyubeTigRealDataQaResult {
  const recommendation = runTigEndToEndRecommendation(input);
  const adapterWarnings = [
    !createWordCardAdapterProps(input.wordId || input.query || "Benor").word.word ? "WordCard adapter did not return stable props." : undefined,
    !createPrayerCompanionAdapterContext({ message: input.prayerInput || input.query || "calling" }).safeDisplayData.prayer ? "Prayer adapter did not return stable props." : undefined,
    !createCompassExperienceAdapterContext({ query: input.callingInput || input.query || "calling" }).callingPath.archetype.name ? "Compass adapter did not return stable props." : undefined,
    !createTigResponsePanelAdapterContext({ query: input.query, wordId: input.wordId, clusterId: input.clusterId }).panelData.explanationPath.length ? "TIG response adapter has no explanation path." : undefined,
    !createTigGraphExplorerAdapterContext({ searchQuery: input.query }).promiseTablePreviewRows.length ? "TIG graph adapter has no Promise Table rows." : undefined
  ].filter(Boolean) as string[];
  const blockers = [
    !recommendation.selectedCandidate ? "Recommendation flow did not select a candidate." : undefined,
    recommendation.explanationTrace.steps.length === 0 ? "Recommendation flow did not create an explanation trace." : undefined,
    recommendation.confidence.label === "insufficient_data" && !recommendation.fallback.used ? "Insufficient data should use fallback framing." : undefined,
    recommendation.selectedCandidate.type === "promise" && recommendation.selectedCandidate.scriptureAnchors.length === 0 ? "Promise recommendation is missing Scripture anchors." : undefined,
    recommendation.noExternalServicesRequired !== true ? "Recommendation flow should not require external services." : undefined
  ].filter(Boolean) as string[];
  const warnings = [
    ...recommendation.warnings,
    ...adapterWarnings,
    scenario.expectedScriptureAnchor && !recommendation.selectedCandidate.scriptureAnchors.length
      ? `Expected a Scripture anchor such as ${scenario.expectedScriptureAnchor}.`
      : undefined
  ].filter(Boolean) as string[];

  return {
    id: scenario.id,
    label: scenario.label,
    valid: blockers.length === 0,
    result: recommendation,
    blockers,
    warnings
  };
}

export function runTigRealDataQaScenario(
  scenario: TeoyubeTigRealDataQaScenario
): TeoyubeTigRealDataQaResult {
  return result(scenario, scenario.input);
}

export function runTigRealDataQa() {
  return createTigRealDataQaReport(getTigRealDataQaScenarios().map(runTigRealDataQaScenario));
}

export function runTigRealDataQaForWord(wordId: string) {
  return runTigRealDataQaScenario(createTigRealDataQaScenarioFromWord(wordId));
}

export function runTigRealDataQaForPromiseCluster(clusterId: string) {
  return runTigRealDataQaScenario(createTigRealDataQaScenarioFromPromiseCluster(clusterId));
}

export function runTigRealDataQaForCallingInput(input: string) {
  return runTigRealDataQaScenario(createTigRealDataQaScenarioFromCallingInput(input));
}

export function getTigRealDataQaBlockers(results: TeoyubeTigRealDataQaResult[]): string[] {
  return results.flatMap((entry) => entry.blockers);
}

export function getTigRealDataQaWarnings(results: TeoyubeTigRealDataQaResult[]): string[] {
  return results.flatMap((entry) => entry.warnings);
}

export function createTigRealDataQaReport(results: TeoyubeTigRealDataQaResult[]) {
  const blockers = getTigRealDataQaBlockers(results);
  const warnings = getTigRealDataQaWarnings(results);

  return {
    valid: blockers.length === 0,
    scenarioCount: results.length,
    results,
    blockers,
    warnings,
    noUnsupportedMockDataUsed: true,
    noExternalServicesRequired: true as const,
    noDatabasePersistenceEnabled: true as const,
    noAnalyticsEnabled: true as const,
    noLiveAiOrchestrationEnabled: true as const,
    noBrowserPersistenceRequired: true as const,
    generatedAt: new Date().toISOString()
  };
}

export function runTigRealDataQaSmokeInputs() {
  return [
    runTigWordRecommendation({ wordId: "Benor", query: "Benor" }),
    runTigPromiseRecommendation({ clusterId: "PC01", query: "Calling & Purpose" }),
    runTigCallingRecommendation({ query: "calling purpose builder" })
  ];
}
