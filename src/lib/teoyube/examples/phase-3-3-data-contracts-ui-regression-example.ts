import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { getDataHealthReport } from "../data/teoyube-data-access";
import { createTeoyubeDataContractValidationReport } from "../data/teoyube-data-contract-validation";
import { createNormalizedTeoyubeDataSnapshot } from "../data/teoyube-data-normalization";
import { runPhase33IntegrationAudit } from "../integration/phase-3-3-integration-audit";
import { createMockReplacementValidationReport } from "../integration/phase-3-3-mock-replacement-validation";
import { createPhase33UiRegressionReport } from "../integration/phase-3-3-ui-regression-checks";
import { createPromiseTable } from "../promises/promise-table";

export function runPhase33DataContractsUiRegressionExample() {
  const normalizedDataSnapshot = createNormalizedTeoyubeDataSnapshot();
  const dataContractReport = createTeoyubeDataContractValidationReport(normalizedDataSnapshot);
  const dataHealthReport = getDataHealthReport();
  const wordCard = createWordCardAdapterProps("Benor");
  const prayerCompanion = createPrayerCompanionAdapterContext({
    message: "calling purpose prayer"
  });
  const compassExperience = createCompassExperienceAdapterContext({
    query: "calling purpose builder"
  });
  const tigResponsePanel = createTigResponsePanelAdapterContext({
    query: "calling",
    wordId: "Benor",
    mode: "promise"
  });
  const tigGraphExplorer = createTigGraphExplorerAdapterContext();
  const promiseTable = createPromiseTable();
  const uiRegressionReport = createPhase33UiRegressionReport();
  const mockReplacementValidationReport = createMockReplacementValidationReport();
  const phase33Audit = runPhase33IntegrationAudit();

  return {
    normalizedDataSnapshot: {
      vocabularyCount: normalizedDataSnapshot.vocabulary.length,
      promiseClusterCount: normalizedDataSnapshot.promiseClusters.length,
      scriptureCanonCount: normalizedDataSnapshot.scriptureCanon.length,
      sourceFiles: normalizedDataSnapshot.sourceFiles
    },
    dataContractReport,
    dataHealthReport,
    wordCard,
    prayerCompanion,
    compassExperience,
    tigResponsePanel,
    tigGraphExplorer,
    promiseTablePreview: {
      rowCount: promiseTable.rowCount,
      rows: promiseTable.rows.slice(0, 6),
      valid: promiseTable.valid,
      warnings: promiseTable.warnings
    },
    uiRegressionReport,
    mockReplacementValidationReport,
    phase33Audit
  };
}
