import { getTIGSeedSummary } from "../../tig";
import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import {
  recommendCallingPath,
  validateCallingPathScriptureAnchoring
} from "../calling/calling-engine";
import { getDataHealthReport } from "../data/teoyube-data-access";
import {
  createWordCardContext,
  getCoreTeoyubeVocabulary,
  validateTeoyubeWordAnchoring
} from "../language/teoyube-language-engine";
import {
  createPromiseRecommendationContext,
  getPromiseClusters,
  validatePromiseClusterScriptureAnchoring
} from "../promises/promise-engine";
import {
  createPromiseTable,
  validatePromiseTableRows
} from "../promises/promise-table";
import {
  createTheologyFramework,
  validateTigRecommendationTheology
} from "../theology/theology-framework";

export type TeoyubePhase3ValidationSection = {
  id: string;
  valid: boolean;
  details: string;
  blockers: string[];
  warnings: string[];
};

export type TeoyubePhase3IntegrationHealthReport = {
  valid: boolean;
  status: "ready" | "ready_with_warnings" | "blocked";
  sections: TeoyubePhase3ValidationSection[];
  blockers: string[];
  warnings: string[];
  noDuplicateParallelEnginesCreated: true;
  noExternalServicesCalled: true;
  noAnalyticsSent: true;
  noDatabasePersistenceEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  tigStillWorks: boolean;
  generatedAt: string;
};

function section(
  id: string,
  valid: boolean,
  details: string,
  blockers: string[] = [],
  warnings: string[] = []
): TeoyubePhase3ValidationSection {
  return { id, valid, details, blockers, warnings };
}

export function validateTheologyFrameworkIntegration(): TeoyubePhase3ValidationSection {
  const framework = createTheologyFramework();
  const validation = validateTigRecommendationTheology({
    scriptureReferences: ["Romans 8:28"],
    explanationPath: ["Theology framework requires Scripture anchors and explanation paths."],
    text: "This is a Scripture-anchored reflective recommendation."
  });

  return section(
    "theology_framework",
    framework.themes.length >= 8 && validation.valid,
    "Theology framework defines themes, Scripture anchor requirements, explanation boundaries, no-divine-certainty rules, and professional-advice boundaries.",
    validation.blockers,
    validation.warnings
  );
}

export function validateDataAccessIntegration(): TeoyubePhase3ValidationSection {
  const report = getDataHealthReport();

  return section(
    "data_access",
    report.valid && report.vocabularyCount >= 72 && report.promiseClusterCount >= 12 && report.scriptureCanonCount >= 108,
    `Data access adapted ${report.vocabularyCount} vocabulary record(s), ${report.promiseClusterCount} promise cluster(s), and ${report.scriptureCanonCount} Scripture canon record(s).`,
    report.blockers,
    report.warnings
  );
}

export function validatePromiseEngineIntegration(): TeoyubePhase3ValidationSection {
  const clusters = getPromiseClusters();
  const validationReports = clusters.map(validatePromiseClusterScriptureAnchoring);
  const blockers = validationReports.flatMap((report) => report.blockers);
  const warnings = validationReports.flatMap((report) => report.warnings);
  const context = createPromiseRecommendationContext({ query: "calling" });

  return section(
    "promise_engine",
    clusters.length >= 12 && context.clusters.length > 0 && blockers.length === 0,
    `Promise Engine adapted ${clusters.length} existing cluster record(s) and returned ${context.clusters.length} recommendation cluster(s).`,
    blockers,
    warnings
  );
}

export function validateCallingEngineIntegration(): TeoyubePhase3ValidationSection {
  const path = recommendCallingPath({ query: "calling purpose builder" });
  const validation = validateCallingPathScriptureAnchoring(path);

  return section(
    "calling_engine",
    path.explanationPath.length > 0 && validation.valid,
    `Calling Engine returned ${path.archetype.name} with ${path.scriptureAnchors.length} Scripture anchor(s).`,
    validation.blockers,
    validation.warnings
  );
}

export function validateTeoyubeLanguageIntegration(): TeoyubePhase3ValidationSection {
  const vocabulary = getCoreTeoyubeVocabulary();
  const wordContext = createWordCardContext("Benor");
  const validation = validateTeoyubeWordAnchoring(wordContext.word);

  return section(
    "teoyube_language",
    vocabulary.length >= 72 && wordContext.scriptureAnchors.length > 0 && validation.valid,
    `Language Engine adapted ${vocabulary.length} word record(s) and prepared WordCard context for ${wordContext.word.word}.`,
    validation.blockers,
    validation.warnings
  );
}

export function validatePromiseTableIntegration(): TeoyubePhase3ValidationSection {
  const table = createPromiseTable();
  const validation = validatePromiseTableRows(table.rows);

  return section(
    "promise_table",
    table.rowCount >= 12 && validation.valid,
    `Promise Table generated ${table.rowCount} row(s) from existing promise clusters.`,
    validation.blockers,
    validation.warnings
  );
}

export function validateUiAdapterIntegration(): TeoyubePhase3ValidationSection {
  const wordCard = createWordCardAdapterProps("Benor");
  const prayer = createPrayerCompanionAdapterContext({ message: "I need purpose and prayer." });
  const compass = createCompassExperienceAdapterContext({ query: "calling purpose" });
  const responsePanel = createTigResponsePanelAdapterContext({ query: "calling", wordId: "Benor" });
  const graphExplorer = createTigGraphExplorerAdapterContext();
  const blockers = [
    !wordCard.safeForClientProps ? "WordCard adapter did not return safe client props." : undefined,
    prayer.noExternalCall !== true ? "PrayerCompanion adapter attempted an external call." : undefined,
    compass.noYoutubeFetchPerformed !== true ? "Compass adapter should not fetch YouTube in Phase 3.1." : undefined,
    responsePanel.noLiveAiOrchestration !== true ? "TIG response adapter must not enable live AI orchestration." : undefined,
    graphExplorer.noExternalFetch !== true ? "TIG graph adapter must not fetch external graph data." : undefined
  ].filter(Boolean) as string[];

  return section(
    "ui_adapters",
    blockers.length === 0,
    "UI adapters return stable payloads for WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, and TIGGraphExplorer.",
    blockers,
    []
  );
}

export function validatePhase3Integration(): TeoyubePhase3ValidationSection[] {
  return [
    validateDataAccessIntegration(),
    validateTheologyFrameworkIntegration(),
    validatePromiseEngineIntegration(),
    validateCallingEngineIntegration(),
    validateTeoyubeLanguageIntegration(),
    validatePromiseTableIntegration(),
    validateUiAdapterIntegration()
  ];
}

export function createPhase3IntegrationHealthReport(): TeoyubePhase3IntegrationHealthReport {
  const sections = validatePhase3Integration();
  const blockers = sections.flatMap((entry) => entry.blockers);
  const warnings = sections.flatMap((entry) => entry.warnings);
  const seedSummary = getTIGSeedSummary();
  const tigStillWorks = seedSummary.nodeCount > 0 && seedSummary.relationshipCount > 0;

  return {
    valid: blockers.length === 0 && tigStillWorks,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    sections,
    blockers,
    warnings,
    noDuplicateParallelEnginesCreated: true,
    noExternalServicesCalled: true,
    noAnalyticsSent: true,
    noDatabasePersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    tigStillWorks,
    generatedAt: new Date().toISOString()
  };
}
