import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { getDataHealthReport, getScriptureCanonData } from "../data/teoyube-data-access";
import {
  createPhase3IntegrationHealthReport,
  validateDataAccessIntegration,
  validateCallingEngineIntegration,
  validatePromiseEngineIntegration,
  validatePromiseTableIntegration,
  validateTeoyubeLanguageIntegration,
  validateTheologyFrameworkIntegration,
  validateUiAdapterIntegration
} from "../integration/phase-3-integration-validation";
import { getCoreTeoyubeVocabulary } from "../language/teoyube-language-engine";
import {
  createPromiseRecommendationContext,
  getPromiseClusters
} from "../promises/promise-engine";
import { createPromiseTable } from "../promises/promise-table";
import { runPhase3IntelligentArchitectureIntegrationExample } from "./phase-3-intelligent-architecture-integration-example";

export type TeoyubePhase3IntegrationSmokeCheck = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string) {
  return { id, passed, details };
}

export function runPhase3IntelligentArchitectureIntegrationSmokeCheck(): TeoyubePhase3IntegrationSmokeCheck {
  const vocabulary = getCoreTeoyubeVocabulary();
  const promiseClusters = getPromiseClusters();
  const scriptureCanon = getScriptureCanonData();
  const dataHealthReport = getDataHealthReport();
  const promiseContext = createPromiseRecommendationContext({ query: "calling" });
  const promiseTable = createPromiseTable();
  const wordCard = createWordCardAdapterProps(vocabulary[0]?.id || "Benor");
  const prayer = createPrayerCompanionAdapterContext({ message: "I need prayer and direction." });
  const compass = createCompassExperienceAdapterContext({ query: "calling purpose" });
  const responsePanel = createTigResponsePanelAdapterContext({ query: "calling", wordId: vocabulary[0]?.id });
  const graphExplorer = createTigGraphExplorerAdapterContext();
  const healthReport = createPhase3IntegrationHealthReport();
  const example = runPhase3IntelligentArchitectureIntegrationExample();

  const sections = [
    validateDataAccessIntegration(),
    validateTheologyFrameworkIntegration(),
    validatePromiseEngineIntegration(),
    validateCallingEngineIntegration(),
    validateTeoyubeLanguageIntegration(),
    validatePromiseTableIntegration(),
    validateUiAdapterIntegration()
  ];

  const checks = [
    check("vocabulary_loads", vocabulary.length >= 72, "Vocabulary data can be imported and adapted."),
    check("promise_clusters_load", promiseClusters.length >= 12, "Promise cluster data can be imported and adapted."),
    check("scripture_canon_loads", scriptureCanon.length >= 108 && dataHealthReport.scriptureCanonWithReferencesCount > 0, "Scripture canon data can be imported and adapted."),
    check("scripture_canon_adapted", wordCard.context.scriptureAnchors.length > 0, "Scripture canon can be adapted through WordCard context."),
    check("promise_engine_scripture_anchored", promiseContext.clusters.length > 0 && promiseContext.scriptureAnchors.length > 0 && promiseContext.valid, "Promise Engine returns Scripture-anchored clusters."),
    check("calling_engine_explainable", compass.callingPath.explanationPath.length > 0 && compass.validation.valid, "Calling Engine returns an explainable path."),
    check("language_engine_word_card_context", wordCard.context.valid && Boolean(wordCard.word.word), "Language Engine returns WordCard context."),
    check("promise_table_rows", promiseTable.rowCount >= 12 && promiseTable.valid, "Promise Table returns rows."),
    check("ui_adapters_stable", prayer.noExternalCall && responsePanel.noLiveAiOrchestration && graphExplorer.noExternalFetch, "UI adapters return stable props/data without external calls."),
    check("integration_validation_structured", healthReport.sections.length >= 6 && healthReport.valid, "Integration validation returns a structured health report."),
    check("validation_sections_pass", sections.every((section) => section.valid), "All Phase 3 integration validation sections pass."),
    check("example_runs", example.healthReport.valid && example.promiseTable.rowCount >= 12, "Phase 3 integration example runs.")
  ];

  return {
    valid: checks.every((entry) => entry.passed),
    checks,
    generatedAt: new Date().toISOString()
  };
}
