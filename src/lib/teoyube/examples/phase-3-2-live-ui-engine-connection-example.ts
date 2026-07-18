import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { createPhase32UiIntegrationReport } from "../integration/phase-3-2-ui-integration-validation";
import { createPromiseTable } from "../promises/promise-table";

export function runPhase32LiveUiEngineConnectionExample() {
  const wordCard = createWordCardAdapterProps("Benor");
  const prayerCompanion = createPrayerCompanionAdapterContext({
    message: "I need peace and direction today."
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
  const uiIntegrationReport = createPhase32UiIntegrationReport();

  return {
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
    uiIntegrationReport
  };
}
