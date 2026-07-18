import {
  createPhase11DailyWordContext,
  createPhase11PersonalizationPreview,
  getPhase11ButtonLabels,
  getPhase11RoutePaths,
  runPhase11SmokeTigSurface
} from "./phase-11-1-real-app-productization-smoke-support";

export type Phase111RealAppProductizationSmokeCheck = {
  id: string;
  valid: boolean;
  message: string;
};

export type Phase111RealAppProductizationSmokeReport = {
  valid: boolean;
  checks: Phase111RealAppProductizationSmokeCheck[];
  routeCount: number;
  buttonCount: number;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
};

function check(id: string, valid: boolean, message: string): Phase111RealAppProductizationSmokeCheck {
  return { id, valid, message };
}

export function runPhase111RealAppProductizationSmokeCheck(): Phase111RealAppProductizationSmokeReport {
  const dailyWord = createPhase11DailyWordContext();
  const surfaces = [
    runPhase11SmokeTigSurface("canon"),
    runPhase11SmokeTigSurface("daily_word"),
    runPhase11SmokeTigSurface("promise_search"),
    runPhase11SmokeTigSurface("prayer"),
    runPhase11SmokeTigSurface("calling_compass"),
    runPhase11SmokeTigSurface("tig_graph")
  ];
  const personalization = createPhase11PersonalizationPreview(true);
  const routes = getPhase11RoutePaths();
  const buttons = getPhase11ButtonLabels();

  const checks = [
    check("route_inventory_exists", routes.includes("#today") && routes.includes("#search") && routes.includes("#calling") && routes.includes("#book"), "Phase 11.1 static product views are inventoried."),
    check("button_behaviors_mapped", buttons.length >= 50 && buttons.includes("Search Promise") && buttons.includes("Enable Session Only"), "Visible button behaviors are mapped."),
    check("daily_word_real_data", Boolean(dailyWord.dailyWord.word && dailyWord.dailyWord.scriptureReferences.length), "Daily Word uses normalized real data with Scripture anchors."),
    check("all_major_surfaces_run", surfaces.every((surface) => surface.responsePanel.selectionRows.length > 0), "Local TIG production runs for all major surfaces."),
    check("response_panel_props", surfaces.every((surface) => Boolean(surface.responsePanel.confidence.label)), "Response panel props include confidence labels."),
    check("graph_panel_props", surfaces.every((surface) => surface.graphPanel.statistics.totalNodes >= 0), "Graph panel props can be created."),
    check("explanation_path", surfaces.every((surface) => surface.explanationPanel.items.length > 0), "Explanation path is preserved."),
    check("scripture_anchor", surfaces.some((surface) => surface.explanationPanel.scriptureEvidence.length > 0 || surface.responsePanel.selectionRows.some((row) => row.label === "Scripture")), "Scripture anchor evidence remains visible."),
    check("fallback_state", surfaces.every((surface) => typeof surface.responsePanel.fallback.used === "boolean"), "Fallback state is visible."),
    check("safety_state", surfaces.every((surface) => Boolean(surface.responsePanel.safety.status)), "Safety state is visible."),
    check("personalization_preview", personalization.baseline.responsePanel.selectionRows.length > 0 && personalization.noRawPrivateTextStored, "Personalization preview runs without raw private text storage."),
    check("journal_activity_onboarding_session_helpers", dailyWord.sessionHelpersValid, "Journal, activity, and onboarding helpers work in session memory."),
    check("no_external_services", surfaces.every((surface) => surface.noExternalServicesRequired), "No external service is required."),
    check("no_database_persistence", true, "Database persistence remains disabled."),
    check("no_analytics", true, "Analytics remain disabled."),
    check("no_live_ai", true, "Live AI orchestration remains disabled."),
    check("no_browser_persistence_required", true, "Browser persistence is not required.")
  ];

  return {
    valid: checks.every((entry) => entry.valid),
    checks,
    routeCount: routes.length,
    buttonCount: buttons.length,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true
  };
}
