import { runPhase32LiveUiEngineConnectionExample } from "./phase-3-2-live-ui-engine-connection-example";
import {
  createPhase32UiIntegrationReport,
  validatePhase32UiIntegration
} from "../integration/phase-3-2-ui-integration-validation";

export type TeoyubePhase32UiSmokeCheck = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string) {
  return { id, passed, details };
}

export function runPhase32LiveUiEngineConnectionSmokeCheck(): TeoyubePhase32UiSmokeCheck {
  const example = runPhase32LiveUiEngineConnectionExample();
  const sections = validatePhase32UiIntegration();
  const report = createPhase32UiIntegrationReport();

  const checks = [
    check(
      "word_card_context_stable",
      Boolean(example.wordCard.word.word) && example.wordCard.context.scriptureAnchors.length > 0,
      "WordCard context exposes word/title data and Scripture anchors."
    ),
    check(
      "prayer_companion_context_stable",
      Boolean(example.prayerCompanion.safeDisplayData.prayer) && Boolean(example.prayerCompanion.safeDisplayData.scriptureAnchor),
      "PrayerCompanion context exposes prayer text and Scripture anchor."
    ),
    check(
      "compass_context_explainable",
      example.compassExperience.callingPath.explanationPath.length > 0 && example.compassExperience.callingPath.scriptureAnchors.length > 0,
      "CompassExperience context has an explainable Scripture-anchored path."
    ),
    check(
      "tig_response_panel_explanation",
      example.tigResponsePanel.panelData.explanationPath.length > 0,
      "TIGResponsePanel context has explanation path data."
    ),
    check(
      "tig_graph_explorer_data",
      example.tigGraphExplorer.graphSummary.nodeCount > 0 && example.tigGraphExplorer.promiseTablePreviewRows.length > 0,
      "TIGGraphExplorer context has graph and Promise Table preview data."
    ),
    check(
      "promise_table_preview_rows",
      example.promiseTablePreview.rowCount > 0 && example.promiseTablePreview.valid,
      "Promise Table preview returns usable rows."
    ),
    check(
      "ui_validation_sections_pass",
      sections.every((section) => section.valid),
      "All Phase 3.2 UI integration validation sections pass."
    ),
    check(
      "no_external_services_required",
      report.noExternalServicesRequired && report.noDatabasePersistenceRequired && report.noAnalyticsRequired && report.noLiveAiRequired && report.noBrowserPersistenceRequired,
      "UI integration report requires no external services, persistence, telemetry, live AI, or browser storage APIs."
    )
  ];

  return {
    valid: checks.every((entry) => entry.passed),
    checks,
    generatedAt: new Date().toISOString()
  };
}
