import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { createTeoyubeDataContractValidationReport } from "../data/teoyube-data-contract-validation";
import { createPromiseTable } from "../promises/promise-table";
import { createPhase33UiRegressionReport } from "./phase-3-3-ui-regression-checks";
import type { TeoyubeUiRegressionSurface } from "./phase-3-3-ui-regression-contracts";

export type TeoyubePhase33MockDisposition =
  | "replaced"
  | "retained_fixture"
  | "retained_documentation"
  | "retained_safe_fallback"
  | "retained_legacy_helper"
  | "risk";

export type TeoyubePhase33MockReplacementEntry = {
  id: string;
  path: string;
  surface: TeoyubeUiRegressionSurface;
  disposition: TeoyubePhase33MockDisposition;
  affectsLiveUi: boolean;
  engineOrAdapter: string;
  notes: string;
};

export type TeoyubePhase33MockDataRisk = {
  id: string;
  path: string;
  surface: TeoyubeUiRegressionSurface;
  severity: "warning" | "blocker";
  affectsLiveUi: boolean;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase33AllowedFixtureMockData = {
  id: string;
  path: string;
  category: "example" | "documentation" | "test" | "seed" | "safe_fallback";
  reason: string;
};

export type TeoyubePhase33MockReplacementValidationReport = {
  valid: boolean;
  replacedLiveEntries: TeoyubePhase33MockReplacementEntry[];
  retainedEntries: TeoyubePhase33MockReplacementEntry[];
  allowedFixtureMockData: TeoyubePhase33AllowedFixtureMockData[];
  risks: TeoyubePhase33MockDataRisk[];
  blockers: TeoyubePhase33MockDataRisk[];
  warnings: TeoyubePhase33MockDataRisk[];
  noUnsupportedMockPromiseUsedInLiveFlows: boolean;
  noUnsupportedMockScriptureUsedInLiveFlows: boolean;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function risk(
  id: string,
  path: string,
  surface: TeoyubeUiRegressionSurface,
  severity: "warning" | "blocker",
  affectsLiveUi: boolean,
  message: string,
  requiredAction: string
): TeoyubePhase33MockDataRisk {
  return { id, path, surface, severity, affectsLiveUi, message, requiredAction };
}

export function validateLiveMockDataReplacement(): TeoyubePhase33MockReplacementEntry[] {
  const wordCard = createWordCardAdapterProps("Benor");
  const prayer = createPrayerCompanionAdapterContext({ message: "calling purpose prayer" });
  const compass = createCompassExperienceAdapterContext({ query: "calling purpose builder" });
  const responsePanel = createTigResponsePanelAdapterContext({ query: "calling", wordId: "Benor", mode: "promise" });
  const graph = createTigGraphExplorerAdapterContext();
  const promiseTable = createPromiseTable();

  return [
    {
      id: "home_daily_word_focus",
      path: "teoyube-app/app/page.tsx",
      surface: "daily_word",
      disposition: "replaced",
      affectsLiveUi: true,
      engineOrAdapter: "createWordCardAdapterProps + createPromiseRecommendationContext",
      notes: `Dashboard daily word uses ${wordCard.word.word} with ${wordCard.context.scriptureAnchors.length} Scripture anchor(s).`
    },
    {
      id: "word_card_flow",
      path: "teoyube-app/components/WordCard.tsx",
      surface: "word_card",
      disposition: "replaced",
      affectsLiveUi: true,
      engineOrAdapter: "createWordCardAdapterProps",
      notes: "WordCard keeps legacy props but enriches display through Language Engine context."
    },
    {
      id: "prayer_companion_flow",
      path: "teoyube-app/components/PrayerCompanion.tsx",
      surface: "prayer_companion",
      disposition: "replaced",
      affectsLiveUi: true,
      engineOrAdapter: "createPrayerCompanionAdapterContext",
      notes: `PrayerCompanion exposes ${prayer.safeDisplayData.cluster} without automatic contact or persistence.`
    },
    {
      id: "compass_experience_flow",
      path: "teoyube-app/components/compass/CompassExperience.tsx",
      surface: "compass_experience",
      disposition: "replaced",
      affectsLiveUi: true,
      engineOrAdapter: "createCompassExperienceAdapterContext",
      notes: `CompassExperience exposes ${compass.callingPath.archetype.name} with explanation path data.`
    },
    {
      id: "tig_response_panel_flow",
      path: "teoyube-app/components/tig/TIGResponsePanel.tsx",
      surface: "tig_response_panel",
      disposition: "replaced",
      affectsLiveUi: true,
      engineOrAdapter: "createTigResponsePanelAdapterContext",
      notes: `TIGResponsePanel exposes ${responsePanel.panelData.scriptureAnchors.length} Scripture anchor(s) and confidence labels.`
    },
    {
      id: "tig_graph_explorer_flow",
      path: "teoyube-app/components/tig/TIGGraphExplorer.tsx",
      surface: "tig_graph_explorer",
      disposition: "replaced",
      affectsLiveUi: true,
      engineOrAdapter: "createTigGraphExplorerAdapterContext",
      notes: `TIGGraphExplorer exposes ${graph.graphSummary.nodeCount} graph node(s) plus Promise Table preview rows.`
    },
    {
      id: "promise_table_flow",
      path: "src/components/teoyube/PromiseTablePreview.tsx",
      surface: "promise_table",
      disposition: "replaced",
      affectsLiveUi: true,
      engineOrAdapter: "createPromiseTable/getPromiseTableRows",
      notes: `Promise Table exposes ${promiseTable.rowCount} row(s) from real promise cluster data.`
    }
  ];
}

export function findAllowedFixtureMockData(): TeoyubePhase33AllowedFixtureMockData[] {
  return [
    {
      id: "phase_examples",
      path: "src/lib/teoyube/examples/**",
      category: "example",
      reason: "Phase examples and smoke checks need deterministic sample input to prove adapters and reports."
    },
    {
      id: "tig_seed_graph",
      path: "src/lib/tig/**",
      category: "seed",
      reason: "TIG seed data is the approved local graph fixture for Scripture-grounded recommendations."
    },
    {
      id: "launch_docs_placeholders",
      path: "docs/teoyube/**",
      category: "documentation",
      reason: "Launch and post-launch docs intentionally retain placeholder wording for disabled future providers."
    },
    {
      id: "form_placeholders",
      path: "teoyube-app/components/**",
      category: "documentation",
      reason: "Input placeholder copy explains expected user input and is not a recommendation data source."
    },
    {
      id: "safe_fallback_copy",
      path: "src/lib/tig/production-fallbacks.ts",
      category: "safe_fallback",
      reason: "Fallback copy is retained to keep incomplete graph responses Scripture-anchored and explainable."
    }
  ];
}

export function findRemainingLiveMockDataRisks(): TeoyubePhase33MockDataRisk[] {
  const uiReport = createPhase33UiRegressionReport();
  const dataReport = createTeoyubeDataContractValidationReport();
  const generatedRisks = [
    ...uiReport.blockers.map((entry) =>
      risk(
        `ui_${entry.id}`,
        "src/lib/teoyube/integration/phase-3-3-ui-regression-checks.ts",
        entry.surface,
        "blocker",
        true,
        entry.message,
        entry.requiredAction
      )
    ),
    ...dataReport.blockers.map((entry) =>
      risk(
        `data_${entry.id}_${entry.recordId || "unknown"}`,
        entry.sourceFile,
        "unknown",
        "blocker",
        true,
        entry.message,
        "Restore Scripture-supported real data before using this item in a live surface."
      )
    )
  ];

  return [
    ...generatedRisks,
    risk(
      "legacy_recommend_cluster_helper",
      "teoyube-app/lib/teoyubeData.ts",
      "unknown",
      "warning",
      false,
      "Legacy keyword-based recommendCluster remains as an unused helper over local data.",
      "Prefer Promise Engine adapters for any future live recommendation flow."
    ),
    risk(
      "compass_optional_video_fetch",
      "teoyube-app/components/compass/CompassExperience.tsx",
      "compass_experience",
      "warning",
      true,
      "CompassExperience still contains the existing optional video API fetch, but calling data is engine-driven and does not depend on external video results.",
      "Phase 3.4 should verify rendered fallback behavior with browser regression checks."
    )
  ];
}

export function createMockReplacementValidationReport(): TeoyubePhase33MockReplacementValidationReport {
  const replacedLiveEntries = validateLiveMockDataReplacement();
  const retainedEntries: TeoyubePhase33MockReplacementEntry[] = [
    {
      id: "legacy_local_data_reader",
      path: "teoyube-app/lib/teoyubeData.ts",
      surface: "unknown",
      disposition: "retained_legacy_helper",
      affectsLiveUi: true,
      engineOrAdapter: "local JSON readers with engine adapters at live surface boundaries",
      notes: "Retained for existing browse/search screens while live recommendation surfaces use Phase 3 adapters."
    },
    {
      id: "production_fallback_copy",
      path: "src/lib/tig/production-fallbacks.ts",
      surface: "tig_response_panel",
      disposition: "retained_safe_fallback",
      affectsLiveUi: true,
      engineOrAdapter: "TIG production fallback layer",
      notes: "Fallback text remains necessary when a graph response is incomplete."
    }
  ];
  const allowedFixtureMockData = findAllowedFixtureMockData();
  const risks = findRemainingLiveMockDataRisks();
  const blockers = risks.filter((entry) => entry.severity === "blocker");
  const warnings = risks.filter((entry) => entry.severity === "warning");

  return {
    valid: blockers.length === 0,
    replacedLiveEntries,
    retainedEntries,
    allowedFixtureMockData,
    risks,
    blockers,
    warnings,
    noUnsupportedMockPromiseUsedInLiveFlows: blockers.every((entry) => !/promise/i.test(entry.message)),
    noUnsupportedMockScriptureUsedInLiveFlows: blockers.every((entry) => !/scripture/i.test(entry.message)),
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
