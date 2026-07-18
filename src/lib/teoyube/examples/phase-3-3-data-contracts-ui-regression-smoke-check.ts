import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { getDataHealthReport, getNormalizedTeoyubeDataSnapshot } from "../data/teoyube-data-access";
import { createTeoyubeDataContractValidationReport } from "../data/teoyube-data-contract-validation";
import { createNormalizedTeoyubeDataSnapshot } from "../data/teoyube-data-normalization";
import { runPhase33IntegrationAudit } from "../integration/phase-3-3-integration-audit";
import { createMockReplacementValidationReport } from "../integration/phase-3-3-mock-replacement-validation";
import { createPhase33UiRegressionReport } from "../integration/phase-3-3-ui-regression-checks";
import { createPromiseTable } from "../promises/promise-table";
import { runPhase33DataContractsUiRegressionExample } from "./phase-3-3-data-contracts-ui-regression-example";

export type TeoyubePhase33SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase33SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase33SmokeCheckResult[];
  blockers: string[];
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase33SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase33DataContractsUiRegressionSmokeCheck(): TeoyubePhase33SmokeCheckReport {
  const snapshot = createNormalizedTeoyubeDataSnapshot();
  const accessSnapshot = getNormalizedTeoyubeDataSnapshot();
  const dataContractReport = createTeoyubeDataContractValidationReport(snapshot);
  const dataHealth = getDataHealthReport();
  const promiseTable = createPromiseTable();
  const wordCard = createWordCardAdapterProps("Benor");
  const wordFallback = createWordCardAdapterProps("__missing_word__");
  const prayer = createPrayerCompanionAdapterContext({ message: "calling purpose prayer" });
  const prayerFallback = createPrayerCompanionAdapterContext({ message: "", theme: "calling" });
  const uiRegressionReport = createPhase33UiRegressionReport();
  const mockReplacementReport = createMockReplacementValidationReport();
  const audit = runPhase33IntegrationAudit();
  const example = runPhase33DataContractsUiRegressionExample();

  const checks = [
    check(
      "data_contracts_compile",
      Boolean(snapshot.vocabulary[0]?.id && snapshot.promiseClusters[0]?.id && snapshot.scriptureCanon[0]?.id),
      "Data contract types accept normalized vocabulary, promise cluster, and Scripture canon records."
    ),
    check(
      "normalization_handles_real_data",
      snapshot.vocabulary.length > 0 && snapshot.promiseClusters.length > 0 && snapshot.scriptureCanon.length > 0,
      "Normalization handles the real JSON data files."
    ),
    check(
      "data_contract_validation_structured",
      Array.isArray(dataContractReport.blockers) && Array.isArray(dataContractReport.warnings),
      "Data contract validation returns a structured report."
    ),
    check(
      "data_access_returns_normalized_data",
      accessSnapshot.vocabulary.length === dataHealth.vocabularyCount && dataHealth.contractReport.generatedAt.length > 0,
      "Data access returns normalized data and exposes contract health."
    ),
    check(
      "promise_table_uses_real_clusters",
      promiseTable.generatedFromExistingClusters && promiseTable.rowCount > 0,
      "Promise Table rows are generated from existing promise cluster data."
    ),
    check(
      "ui_adapters_return_stable_props",
      Boolean(wordCard.word.word && prayer.safeDisplayData.prayer && example.compassExperience.callingPath.archetype.name && example.tigResponsePanel.panelData.confidenceLabel),
      "WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, and TIGGraphExplorer adapters return stable data."
    ),
    check(
      "fallback_states_safe",
      Boolean(wordFallback.word.word && prayerFallback.safeDisplayData.prayer),
      "Missing word and empty prayer inputs return safe local fallback states."
    ),
    check(
      "scripture_anchors_preserved",
      wordCard.context.scriptureAnchors.length > 0 && Boolean(prayer.safeDisplayData.scriptureAnchor) && promiseTable.rows.every((row) => row.scriptureAnchors.length > 0),
      "Scripture anchors are preserved across WordCard, PrayerCompanion, and Promise Table."
    ),
    check(
      "explanation_paths_preserved",
      wordCard.context.explanationPath.length > 0 && prayer.safeDisplayData.explanationPath.length > 0 && example.compassExperience.explanationPath.length > 0 && example.tigResponsePanel.panelData.explanationPath.length > 0,
      "Explanation paths are preserved for WordCard, prayer, calling, and TIG response surfaces."
    ),
    check(
      "mock_replacement_validation_structured",
      mockReplacementReport.replacedLiveEntries.length >= 6 && Array.isArray(mockReplacementReport.allowedFixtureMockData),
      "Mock replacement validation distinguishes live replacements from allowed fixtures."
    ),
    check(
      "ui_regression_report_structured",
      uiRegressionReport.checks.length >= 9 && Array.isArray(uiRegressionReport.results),
      "UI regression checks return a structured report."
    ),
    check(
      "phase_3_3_audit_structured",
      audit.completionPercentage === 100 && audit.nextStep === "Phase 3.4 - TIG End-to-End Recommendation Flow, Explanation Trace & Real Data QA",
      "Phase 3.3 audit returns a structured report and the correct next step."
    ),
    check(
      "restricted_services_not_required",
      uiRegressionReport.noExternalServicesRequired &&
        mockReplacementReport.noDatabasePersistenceEnabled &&
        mockReplacementReport.noAnalyticsEnabled &&
        mockReplacementReport.noLiveAiOrchestrationEnabled &&
        audit.noBrowserPersistenceRequired,
      "No external services, database persistence, analytics, live AI orchestration, or browser persistence are required."
    ),
    check(
      "example_runs",
      example.phase33Audit.completionPercentage === audit.completionPercentage && example.promiseTablePreview.rowCount > 0,
      "Phase 3.3 example runs and includes audit and Promise Table data."
    )
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    generatedAt: new Date().toISOString()
  };
}
