import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { createPromiseTable } from "../promises/promise-table";

export type TeoyubePhase32UiValidationSection = {
  id: string;
  valid: boolean;
  details: string;
  blockers: string[];
  warnings: string[];
};

export type TeoyubePhase32UiIntegrationReport = {
  valid: boolean;
  status: "ready" | "ready_with_warnings" | "blocked";
  sections: TeoyubePhase32UiValidationSection[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceRequired: true;
  noAnalyticsRequired: true;
  noLiveAiRequired: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function section(
  id: string,
  valid: boolean,
  details: string,
  blockers: string[] = [],
  warnings: string[] = []
): TeoyubePhase32UiValidationSection {
  return { id, valid, details, blockers, warnings };
}

export function validateWordCardEngineConnection(): TeoyubePhase32UiValidationSection {
  const adapter = createWordCardAdapterProps("Benor");
  const fallback = createWordCardAdapterProps("__missing_word__");
  const blockers = [
    !adapter.word.word ? "WordCard adapter did not expose a word title." : undefined,
    adapter.context.scriptureAnchors.length === 0 ? "WordCard context is missing Scripture anchors." : undefined,
    adapter.context.explanationPath.length === 0 ? "WordCard context is missing explanation path." : undefined,
    !fallback.word.word ? "WordCard missing-data fallback did not return a safe word." : undefined
  ].filter(Boolean) as string[];

  return section(
    "word_card_engine_connection",
    blockers.length === 0,
    `WordCard can receive ${adapter.word.word} with ${adapter.context.scriptureAnchors.length} Scripture anchor(s).`,
    blockers,
    adapter.context.warnings
  );
}

export function validatePrayerCompanionEngineConnection(): TeoyubePhase32UiValidationSection {
  const adapter = createPrayerCompanionAdapterContext({ message: "I need purpose and prayer." });
  const blockers = [
    !adapter.safeDisplayData.prayer ? "PrayerCompanion adapter did not expose fallback-safe prayer text." : undefined,
    !adapter.safeDisplayData.scriptureAnchor ? "PrayerCompanion context is missing a Scripture anchor." : undefined,
    adapter.noExternalCall !== true ? "PrayerCompanion context should not require external calls." : undefined
  ].filter(Boolean) as string[];

  return section(
    "prayer_companion_engine_connection",
    blockers.length === 0,
    `PrayerCompanion can receive ${adapter.safeDisplayData.cluster} with confidence ${adapter.safeDisplayData.confidenceLabel}.`,
    blockers,
    adapter.recommendation.warnings
  );
}

export function validateCompassExperienceEngineConnection(): TeoyubePhase32UiValidationSection {
  const adapter = createCompassExperienceAdapterContext({ query: "calling purpose builder" });
  const blockers = [
    !adapter.callingPath.archetype.name ? "CompassExperience context is missing a calling archetype." : undefined,
    adapter.callingPath.explanationPath.length === 0 ? "CompassExperience context is missing explanation path." : undefined,
    adapter.callingPath.scriptureAnchors.length === 0 ? "CompassExperience context is missing Scripture anchors." : undefined,
    adapter.noYoutubeFetchPerformed !== true ? "CompassExperience context should not require YouTube fetches." : undefined
  ].filter(Boolean) as string[];

  return section(
    "compass_experience_engine_connection",
    blockers.length === 0,
    `CompassExperience can receive ${adapter.callingPath.archetype.name} with ${adapter.callingPath.confidenceLabel} confidence.`,
    blockers,
    adapter.validation.warnings
  );
}

export function validateTigResponsePanelEngineConnection(): TeoyubePhase32UiValidationSection {
  const adapter = createTigResponsePanelAdapterContext({
    query: "calling",
    wordId: "Benor",
    mode: "promise"
  });
  const blockers = [
    adapter.panelData.explanationPath.length === 0 ? "TIGResponsePanel context is missing explanation path." : undefined,
    adapter.panelData.scriptureAnchors.length === 0 ? "TIGResponsePanel context is missing Scripture anchors." : undefined,
    adapter.noLiveAiOrchestration !== true ? "TIGResponsePanel context should not require live AI orchestration." : undefined
  ].filter(Boolean) as string[];

  return section(
    "tig_response_panel_engine_connection",
    blockers.length === 0,
    `TIGResponsePanel can receive ${adapter.panelData.scriptureAnchors.length} Scripture anchor(s) and integrated explanation path data.`,
    blockers,
    adapter.promiseContext.warnings
  );
}

export function validateTigGraphExplorerEngineConnection(): TeoyubePhase32UiValidationSection {
  const adapter = createTigGraphExplorerAdapterContext();
  const blockers = [
    adapter.graphSummary.nodeCount === 0 ? "TIGGraphExplorer context is missing graph nodes." : undefined,
    adapter.promiseTablePreviewRows.length === 0 ? "TIGGraphExplorer context is missing Promise Table preview rows." : undefined,
    adapter.noExternalFetch !== true ? "TIGGraphExplorer context should not require external graph fetches." : undefined
  ].filter(Boolean) as string[];

  return section(
    "tig_graph_explorer_engine_connection",
    blockers.length === 0,
    `TIGGraphExplorer can receive ${adapter.graphSummary.nodeCount} TIG node(s) and ${adapter.promiseTablePreviewRows.length} Promise Table preview row(s).`,
    blockers,
    []
  );
}

export function validatePromiseTableUiConnection(): TeoyubePhase32UiValidationSection {
  const table = createPromiseTable();
  const blockers = [
    table.rowCount === 0 ? "Promise Table has no rows for UI preview." : undefined,
    !table.valid ? "Promise Table has rows missing Scripture anchors." : undefined
  ].filter(Boolean) as string[];

  return section(
    "promise_table_ui_connection",
    blockers.length === 0,
    `Promise Table preview can receive ${table.rowCount} row(s).`,
    blockers,
    table.warnings
  );
}

export function validatePhase32UiIntegration(): TeoyubePhase32UiValidationSection[] {
  return [
    validateWordCardEngineConnection(),
    validatePrayerCompanionEngineConnection(),
    validateCompassExperienceEngineConnection(),
    validateTigResponsePanelEngineConnection(),
    validateTigGraphExplorerEngineConnection(),
    validatePromiseTableUiConnection()
  ];
}

export function createPhase32UiIntegrationReport(): TeoyubePhase32UiIntegrationReport {
  const sections = validatePhase32UiIntegration();
  const blockers = sections.flatMap((entry) => entry.blockers);
  const warnings = sections.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    sections,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceRequired: true,
    noAnalyticsRequired: true,
    noLiveAiRequired: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
