import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { createPromiseTable } from "../promises/promise-table";
import type {
  TeoyubeUiRegressionBlocker,
  TeoyubeUiRegressionCheck,
  TeoyubeUiRegressionReport,
  TeoyubeUiRegressionResult,
  TeoyubeUiRegressionSurface,
  TeoyubeUiRegressionWarning
} from "./phase-3-3-ui-regression-contracts";

function check(id: string, surface: TeoyubeUiRegressionSurface, label: string, required = true): TeoyubeUiRegressionCheck {
  return { id, surface, label, required };
}

function blocker(id: string, surface: TeoyubeUiRegressionSurface, message: string, requiredAction: string): TeoyubeUiRegressionBlocker {
  return { id, surface, message, requiredAction };
}

function warning(id: string, surface: TeoyubeUiRegressionSurface, message: string, recommendedAction: string): TeoyubeUiRegressionWarning {
  return { id, surface, message, recommendedAction };
}

function result(
  regressionCheck: TeoyubeUiRegressionCheck,
  details: string,
  blockers: TeoyubeUiRegressionBlocker[] = [],
  warnings: TeoyubeUiRegressionWarning[] = []
): TeoyubeUiRegressionResult {
  return {
    check: regressionCheck,
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "passed",
    details,
    blockers,
    warnings
  };
}

export function validateWordCardRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("word_card_engine_context", "word_card", "WordCard receives engine-driven word context");
  const adapter = createWordCardAdapterProps("Benor");
  const missing = createWordCardAdapterProps("__missing_word__");
  const blockers = [
    !adapter.word.word ? blocker("word_card_missing_word", "word_card", "WordCard adapter did not expose word data.", "Restore Language Engine word context.") : undefined,
    !adapter.context.scriptureAnchors.length ? blocker("word_card_missing_scripture", "word_card", "WordCard context has no Scripture anchors.", "Restore Scripture anchors or show review warning.") : undefined,
    !missing.word.word ? blocker("word_card_fallback_crash", "word_card", "WordCard missing-data fallback failed.", "Return safe fallback word context.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];

  return result(regressionCheck, `WordCard exposes ${adapter.word.word}.`, blockers, adapter.context.warnings.map((message) => warning("word_card_warning", "word_card", message, "Review WordCard context.")));
}

export function validatePrayerCompanionRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("prayer_companion_engine_context", "prayer_companion", "PrayerCompanion receives Promise/Theology context");
  const adapter = createPrayerCompanionAdapterContext({ message: "calling purpose prayer" });
  const blockers = [
    !adapter.safeDisplayData.prayer ? blocker("prayer_missing_text", "prayer_companion", "PrayerCompanion has no prayer text.", "Restore fallback-safe prayer text.") : undefined,
    !adapter.safeDisplayData.scriptureAnchor ? blocker("prayer_missing_scripture", "prayer_companion", "PrayerCompanion has no Scripture anchor.", "Restore Promise Engine Scripture anchor.") : undefined,
    adapter.noExternalCall !== true ? blocker("prayer_external_dependency", "prayer_companion", "PrayerCompanion requires external service.", "Keep Phase 3.3 local adapter path.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];

  return result(regressionCheck, `PrayerCompanion exposes ${adapter.safeDisplayData.cluster}.`, blockers);
}

export function validateCompassExperienceRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("compass_engine_context", "compass_experience", "CompassExperience receives Calling Engine path");
  const adapter = createCompassExperienceAdapterContext({ query: "calling purpose builder" });
  const blockers = [
    !adapter.callingPath.archetype.name ? blocker("compass_missing_archetype", "compass_experience", "Compass path has no archetype.", "Restore Calling Engine archetype mapping.") : undefined,
    !adapter.callingPath.scriptureAnchors.length ? blocker("compass_missing_scripture", "compass_experience", "Compass path has no Scripture anchor.", "Restore Calling Engine Scripture anchors.") : undefined,
    !adapter.callingPath.explanationPath.length ? blocker("compass_missing_explanation", "compass_experience", "Compass path has no explanation path.", "Restore Calling Engine explanation path.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];

  return result(regressionCheck, `CompassExperience exposes ${adapter.callingPath.archetype.name}.`, blockers);
}

export function validateTigResponsePanelRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("tig_response_integrated_context", "tig_response_panel", "TIGResponsePanel receives integrated explanation context");
  const adapter = createTigResponsePanelAdapterContext({ query: "calling", wordId: "Benor", mode: "promise" });
  const blockers = [
    !adapter.panelData.scriptureAnchors.length ? blocker("tig_response_missing_scripture", "tig_response_panel", "TIGResponsePanel has no Scripture anchor context.", "Restore adapter Scripture anchors.") : undefined,
    !adapter.panelData.explanationPath.length ? blocker("tig_response_missing_explanation", "tig_response_panel", "TIGResponsePanel has no explanation path.", "Restore adapter explanation path.") : undefined,
    adapter.noLiveAiOrchestration !== true ? blocker("tig_response_live_ai", "tig_response_panel", "TIGResponsePanel requires live AI.", "Keep Phase 3.3 local adapter context.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];

  return result(regressionCheck, "TIGResponsePanel integrated context is available.", blockers);
}

export function validateTigGraphExplorerRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("tig_graph_explorer_real_data", "tig_graph_explorer", "TIGGraphExplorer receives graph and Promise Table data");
  const adapter = createTigGraphExplorerAdapterContext();
  const blockers = [
    !adapter.graphSummary.nodeCount ? blocker("tig_graph_missing_nodes", "tig_graph_explorer", "TIG graph has no nodes.", "Restore TIG seed graph.") : undefined,
    !adapter.promiseTablePreviewRows.length ? blocker("tig_graph_missing_table", "tig_graph_explorer", "Promise Table preview has no rows.", "Restore Promise Table data source.") : undefined,
    adapter.noExternalFetch !== true ? blocker("tig_graph_external_fetch", "tig_graph_explorer", "TIG graph explorer requires external fetch.", "Use local TIG graph and Promise Table context.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];

  return result(regressionCheck, `TIGGraphExplorer exposes ${adapter.graphSummary.nodeCount} graph node(s).`, blockers);
}

export function validatePromiseTableRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("promise_table_real_clusters", "promise_table", "Promise Table uses real cluster data");
  const table = createPromiseTable();
  const blockers = [
    !table.rowCount ? blocker("promise_table_empty", "promise_table", "Promise Table has no rows.", "Restore Promise Cluster data.") : undefined,
    !table.valid ? blocker("promise_table_missing_scripture", "promise_table", "Promise Table contains rows without Scripture anchors.", "Restore Promise Cluster Scripture anchors.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];
  const warnings = table.warnings.map((message) => warning("promise_table_warning", "promise_table", message, "Review Promise Table row mapping."));

  return result(regressionCheck, `Promise Table exposes ${table.rowCount} row(s).`, blockers, warnings);
}

export function validateFallbackStateRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("fallback_states_safe", "unknown", "Fallback states remain safe");
  const wordFallback = createWordCardAdapterProps("__missing_word__");
  const prayerFallback = createPrayerCompanionAdapterContext({ message: "", theme: "calling" });
  const blockers = [
    !wordFallback.word.word ? blocker("fallback_word_missing", "word_card", "Word fallback is unavailable.", "Return safe WordCard fallback.") : undefined,
    !prayerFallback.safeDisplayData.prayer ? blocker("fallback_prayer_missing", "prayer_companion", "Prayer fallback is unavailable.", "Return safe PrayerCompanion fallback.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];

  return result(regressionCheck, "Fallback states return stable local data.", blockers);
}

export function validateScriptureAnchorRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("scripture_anchors_visible", "unknown", "Scripture anchors remain visible when available");
  const word = createWordCardAdapterProps("Benor");
  const prayer = createPrayerCompanionAdapterContext({ message: "calling purpose prayer" });
  const compass = createCompassExperienceAdapterContext({ query: "calling" });
  const blockers = [
    !word.context.scriptureAnchors.length ? blocker("scripture_word_missing", "word_card", "WordCard has no Scripture anchors.", "Restore Language Engine anchors.") : undefined,
    !prayer.safeDisplayData.scriptureAnchor ? blocker("scripture_prayer_missing", "prayer_companion", "PrayerCompanion has no Scripture anchor.", "Restore Promise Engine anchor.") : undefined,
    !compass.callingPath.scriptureAnchors.length ? blocker("scripture_compass_missing", "compass_experience", "Compass has no Scripture anchor.", "Restore Calling Engine anchor.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];

  return result(regressionCheck, "Scripture anchors are available across connected surfaces.", blockers);
}

export function validateExplanationPathRegression(): TeoyubeUiRegressionResult {
  const regressionCheck = check("explanation_paths_visible", "unknown", "Explanation paths remain available");
  const prayer = createPrayerCompanionAdapterContext({ message: "calling purpose prayer" });
  const compass = createCompassExperienceAdapterContext({ query: "calling" });
  const response = createTigResponsePanelAdapterContext({ query: "calling", wordId: "Benor" });
  const blockers = [
    !prayer.safeDisplayData.explanationPath.length ? blocker("explanation_prayer_missing", "prayer_companion", "Prayer explanation path missing.", "Restore PrayerCompanion explanation path.") : undefined,
    !compass.explanationPath.length ? blocker("explanation_compass_missing", "compass_experience", "Compass explanation path missing.", "Restore Compass explanation path.") : undefined,
    !response.panelData.explanationPath.length ? blocker("explanation_tig_missing", "tig_response_panel", "TIG response explanation path missing.", "Restore TIG adapter explanation path.") : undefined
  ].filter(Boolean) as TeoyubeUiRegressionBlocker[];

  return result(regressionCheck, "Explanation paths are available across connected surfaces.", blockers);
}

export function runPhase33UiRegressionChecks(): TeoyubeUiRegressionResult[] {
  return [
    validateWordCardRegression(),
    validatePrayerCompanionRegression(),
    validateCompassExperienceRegression(),
    validateTigResponsePanelRegression(),
    validateTigGraphExplorerRegression(),
    validatePromiseTableRegression(),
    validateFallbackStateRegression(),
    validateScriptureAnchorRegression(),
    validateExplanationPathRegression()
  ];
}

export function createPhase33UiRegressionReport(): TeoyubeUiRegressionReport {
  const results = runPhase33UiRegressionChecks();
  const blockers = results.flatMap((entry) => entry.blockers);
  const warnings = results.flatMap((entry) => entry.warnings);

  return {
    decision: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    valid: blockers.length === 0,
    checks: results.map((entry) => entry.check),
    results,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
