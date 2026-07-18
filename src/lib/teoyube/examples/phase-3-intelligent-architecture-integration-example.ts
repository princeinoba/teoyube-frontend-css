import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { getDataHealthReport, getScriptureCanonData } from "../data/teoyube-data-access";
import { createPhase3IntegrationHealthReport } from "../integration/phase-3-integration-validation";
import { getCoreTeoyubeVocabulary } from "../language/teoyube-language-engine";
import { getPromiseClusters } from "../promises/promise-engine";
import { createPromiseTable } from "../promises/promise-table";

export function runPhase3IntelligentArchitectureIntegrationExample() {
  const vocabulary = getCoreTeoyubeVocabulary();
  const promiseClusters = getPromiseClusters();
  const scriptureCanon = getScriptureCanonData();
  const promiseTable = createPromiseTable();
  const dataHealthReport = getDataHealthReport();
  const wordCard = createWordCardAdapterProps(vocabulary[0]?.id || "Benor");
  const prayerCompanion = createPrayerCompanionAdapterContext({
    message: "I need purpose, prayer, and Scripture-grounded direction."
  });
  const compassExperience = createCompassExperienceAdapterContext({
    query: "calling purpose builder"
  });
  const tigResponsePanel = createTigResponsePanelAdapterContext({
    query: "calling",
    wordId: vocabulary[0]?.id,
    mode: "promise"
  });
  const tigGraphExplorer = createTigGraphExplorerAdapterContext();
  const healthReport = createPhase3IntegrationHealthReport();

  return {
    vocabularyCount: vocabulary.length,
    promiseClusterCount: promiseClusters.length,
    scriptureCanonCount: scriptureCanon.length,
    dataHealthReport,
    promiseTable,
    wordCard,
    prayerCompanion,
    compassExperience,
    tigResponsePanel,
    tigGraphExplorer,
    healthReport
  };
}
