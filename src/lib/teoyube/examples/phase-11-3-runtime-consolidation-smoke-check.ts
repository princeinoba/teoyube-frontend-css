import {
  createPhase11DailyWordContext,
  createPhase11PersonalizationPreview,
  createPhase11ProductizationSummary,
  createPhase11SafeExportBundle,
  getPhase11ButtonBehaviorMap,
  getPhase11RouteInventory,
  runPhase11TigSurface
} from "../../phase11Productization";
import {
  addPromiseTableItem,
  createInitialTeoyubeAppState,
  createSafeExportBundle,
  createTeoGuideTurn,
  generateDailyJourney,
  saveJournalEntry,
  setConsentState
} from "../app-state";

export type Phase113RuntimeSmokeCheck = {
  phase: "11.3";
  primaryRuntime: "static-node-app";
  nextRuntimeDeferred: true;
  valid: boolean;
  checks: Array<{
    id: string;
    passed: boolean;
    details: string;
  }>;
  nextStep: "Phase 11.4 - End-to-End User Acceptance Testing, Mobile QA, Accessibility Audit & Beta-Ready Polish";
};

function check(id: string, passed: boolean, details: string) {
  return { id, passed, details };
}

export function runPhase113RuntimeConsolidationSmokeCheck(): Phase113RuntimeSmokeCheck {
  const initial = createInitialTeoyubeAppState();
  const generated = generateDailyJourney(initial);
  const promiseState = addPromiseTableItem(generated, "purpose");
  const journalState = saveJournalEntry(promiseState, "I need wisdom for one faithful step.");
  const guideState = createTeoGuideTurn(journalState, "Help me understand my next step.");
  const consentState = setConsentState(guideState, "session_only");
  const stateExport = createSafeExportBundle(consentState);
  const daily = createPhase11DailyWordContext();
  const tig = runPhase11TigSurface("promise_search", "I need direction.");
  const personalization = createPhase11PersonalizationPreview("I need direction.", true);
  const productSummary = createPhase11ProductizationSummary();
  const staticExport = createPhase11SafeExportBundle();
  const routes = getPhase11RouteInventory();
  const buttons = getPhase11ButtonBehaviorMap();

  const checks = [
    check("static_primary_runtime", productSummary.primaryRuntime === "static-node-app", "Static Node remains primary."),
    check("next_migration_deferred", productSummary.nextRuntimeDeferred === true, "Next source is repaired but not primary."),
    check("route_inventory_available", routes.length >= 10, `${routes.length} route records available.`),
    check("button_map_available", buttons.length >= 10, `${buttons.length} button behaviors mapped.`),
    check("daily_word_scripture_anchor", Boolean(daily.scripture?.reference), "Daily word keeps a Scripture anchor."),
    check("tig_confidence_visible", Boolean(tig.responsePanel.confidence.label), "TIG response exposes confidence label."),
    check("tig_explanation_visible", tig.explanationPanel.items.length > 0, "TIG explanation path is visible."),
    check("tig_graph_list_fallback", tig.graphPanel.listFallbackAvailable === true, "TIG graph has list fallback."),
    check("state_generates_journey", Boolean(generated.generatedDailyJourney?.scripture), "State layer generates daily journey."),
    check("state_saves_promise_table", promiseState.savedPromiseTableItems.length > initial.savedPromiseTableItems.length, "Promise Table accepts local rows."),
    check("state_saves_journal_safely", journalState.journalEntries[0]?.rawPrivateTextStored === false, "Journal entry stores sanitized summary only."),
    check("teo_guide_local_turn", guideState.teoGuideTurns.length > 0, "Teo Guide turn created from local rules."),
    check("consent_session_only", consentState.consentState.personalization === "session_only", "Consent is session-only."),
    check("personalization_no_raw_private_text", personalization.noRawPrivateTextStored === true, "Personalization preview stores no raw private text."),
    check("safe_state_export", stateExport.appState.rawPrivateTextIncluded === false, "State export excludes raw private text."),
    check("safe_static_export", staticExport.rawPrivateTextIncluded === false, "Static export excludes raw private text."),
    check("no_external_services", consentState.safety.noExternalServices === true, "No external services required."),
    check("no_database_persistence", consentState.safety.noDatabasePersistence === true, "No database persistence enabled."),
    check("no_analytics", consentState.safety.noAnalytics === true, "No analytics enabled."),
    check("no_live_ai", consentState.safety.noLiveAi === true, "No live AI orchestration enabled."),
    check("no_browser_persistence", consentState.safety.noBrowserPersistence === true, "No browser persistence required."),
    check("no_automatic_contact", consentState.safety.noAutomaticContact === true, "No automatic contact enabled.")
  ];

  return {
    phase: "11.3",
    primaryRuntime: "static-node-app",
    nextRuntimeDeferred: true,
    valid: checks.every((item) => item.passed),
    checks,
    nextStep: "Phase 11.4 - End-to-End User Acceptance Testing, Mobile QA, Accessibility Audit & Beta-Ready Polish"
  };
}
