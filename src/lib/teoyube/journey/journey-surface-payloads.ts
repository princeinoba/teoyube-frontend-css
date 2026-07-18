import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import {
  createPromiseTable,
  filterPromiseTableByScripture,
  filterPromiseTableByTheme,
  filterPromiseTableByWord
} from "../promises/promise-table";
import { createMissingScriptureFallbackState, createProductionUiFallbackReport } from "./production-ui-fallback-states";
import type { TeoyubeUserJourneyState } from "./user-journey-contracts";

function first<T>(values: T[]): T | undefined {
  return values[0];
}

function queryForState(state: TeoyubeUserJourneyState): string {
  return (
    state.recommendation?.selectedLabel ||
    state.input.wordId ||
    state.input.clusterId ||
    state.input.safeDisplayLabel ||
    state.inputSummary ||
    "Scripture-grounded Teoyube journey"
  );
}

function wordIdForState(state: TeoyubeUserJourneyState): string {
  return state.input.wordId || state.recommendation?.wordId || state.recommendation?.selectedLabel || "Benor";
}

function clusterIdForState(state: TeoyubeUserJourneyState): string | undefined {
  return state.input.clusterId || state.recommendation?.clusterId;
}

function shared(state: TeoyubeUserJourneyState) {
  return {
    journeyId: state.id,
    journeyStage: state.stage,
    journeySurface: state.surface,
    inputSummary: state.inputSummary,
    scriptureAnchors: state.scriptureAnchors,
    explanationTrace: state.explanationTrace?.steps || [],
    confidenceLabel: state.confidenceLabel,
    fallbackReason: state.fallback?.reason || state.recommendation?.fallbackReason,
    noExternalServicesRequired: true as const,
    noBrowserPersistenceRequired: true as const,
    inMemoryOnly: true as const
  };
}

export function createWordCardJourneyPayload(state: TeoyubeUserJourneyState) {
  const adapter = createWordCardAdapterProps(wordIdForState(state));
  return {
    ...shared(state),
    component: "WordCard" as const,
    props: adapter,
    word: adapter.word,
    stableProps: true
  };
}

export function createPrayerCompanionJourneyPayload(state: TeoyubeUserJourneyState) {
  const adapter = createPrayerCompanionAdapterContext({
    message: `${queryForState(state)} Scripture-grounded prayer`,
    theme: clusterIdForState(state)
  });
  return {
    ...shared(state),
    component: "PrayerCompanion" as const,
    props: adapter,
    safeDisplayData: adapter.safeDisplayData,
    stableProps: true
  };
}

export function createCompassExperienceJourneyPayload(state: TeoyubeUserJourneyState) {
  const adapter = createCompassExperienceAdapterContext({
    query: queryForState(state)
  });
  return {
    ...shared(state),
    component: "CompassExperience" as const,
    props: adapter,
    callingPath: adapter.callingPath,
    stableProps: true
  };
}

export function createTigResponsePanelJourneyPayload(state: TeoyubeUserJourneyState) {
  const adapter = createTigResponsePanelAdapterContext({
    query: queryForState(state),
    wordId: wordIdForState(state),
    clusterId: clusterIdForState(state),
    mode: state.stage === "calling_compass" ? "calling" : "promise"
  });
  return {
    ...shared(state),
    component: "TIGResponsePanel" as const,
    props: adapter,
    panelData: adapter.panelData,
    stableProps: true
  };
}

export function createTigGraphExplorerJourneyPayload(state: TeoyubeUserJourneyState) {
  const adapter = createTigGraphExplorerAdapterContext({
    searchQuery: queryForState(state)
  });
  return {
    ...shared(state),
    component: "TIGGraphExplorer" as const,
    props: adapter,
    graphSummary: adapter.graphSummary,
    fallbackListMode: adapter.fallbackListMode,
    stableProps: true
  };
}

export function createPromiseTableJourneyPayload(state: TeoyubeUserJourneyState) {
  const query = queryForState(state);
  const rows = [
    ...filterPromiseTableByTheme(query),
    ...filterPromiseTableByWord(query),
    ...filterPromiseTableByScripture(first(state.scriptureAnchors) || query)
  ];
  const uniqueRows = [...new Map(rows.map((row) => [row.promiseId, row])).values()];
  const table = createPromiseTable();

  return {
    ...shared(state),
    component: "PromiseTable" as const,
    rows: uniqueRows.length ? uniqueRows : table.rows.slice(0, 8),
    rowCount: uniqueRows.length || Math.min(table.rowCount, 8),
    tableValid: table.valid,
    stableProps: true
  };
}

export function createFallbackJourneyPayload(state: TeoyubeUserJourneyState) {
  const fallback = state.fallback || createMissingScriptureFallbackState();
  return {
    ...shared(state),
    component: "FallbackState" as const,
    fallback,
    fallbackReport: createProductionUiFallbackReport(state.input),
    stableProps: true
  };
}
