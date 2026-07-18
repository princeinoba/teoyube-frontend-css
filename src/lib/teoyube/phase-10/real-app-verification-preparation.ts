export type TeoyubeRealAppVerificationPreparationInput = Partial<{
  localStartPlanMissing: boolean;
  buildPlanMissing: boolean;
  routePlanMissing: boolean;
  componentPlanMissing: boolean;
  dataPlanMissing: boolean;
  mobilePlanMissing: boolean;
  accessibilityPlanMissing: boolean;
}>;

export type TeoyubeRealAppVerificationPreparationItem = {
  id: string;
  label: string;
  details: string;
  required: boolean;
};

function item(id: string, label: string, details: string): TeoyubeRealAppVerificationPreparationItem {
  return { id, label, details, required: true };
}

export function getRealAppRouteVerificationChecklist(): TeoyubeRealAppVerificationPreparationItem[] {
  return [
    item("app_starts_locally", "App starts locally", "Start the app locally with available scripts and verify no immediate crash."),
    item("routes_render", "Routes render", "Verify public pages and app routes render without blank screens."),
    item("no_hydration_crash", "No hydration/runtime crash", "Check browser console and terminal output during route QA."),
    item("no_debug_payload_visible", "No debug payload visible", "Confirm normal users do not see internal payloads.")
  ];
}

export function getRealAppComponentVerificationChecklist(): TeoyubeRealAppVerificationPreparationItem[] {
  return [
    item("word_card_renders", "WordCard renders", "Verify real data, Scripture anchor, promise, and fallback rendering."),
    item("prayer_companion_renders", "PrayerCompanion renders", "Verify prayer companion preserves Scripture, privacy, explanation, and safe fallback."),
    item("compass_experience_renders", "CompassExperience renders", "Verify calling path, action suggestion, explanation, and fallback."),
    item("tig_response_panel_renders", "TIGResponsePanel renders", "Verify selected word, promise, Scripture, confidence, explanation, and fallback reason."),
    item("tig_graph_explorer_renders", "TIGGraphExplorer renders or safe fallback renders", "Verify graph or list fallback remains usable."),
    item("promise_table_renders", "Promise Table renders", "Verify promise cluster rows and Scripture anchors render.")
  ];
}

export function getRealAppDataVerificationChecklist(): TeoyubeRealAppVerificationPreparationItem[] {
  return [
    item("real_json_loads", "Real JSON data loads", "Verify coreTeoyubeVocabulary, promiseClusters, and scriptureCanon load."),
    item("no_missing_imports", "No missing import/export breaks build", "Run type/build checks where dependencies exist."),
    item("scripture_anchors_preserved", "Scripture anchors preserved", "Verify anchors remain visible in relevant flows."),
    item("explanation_paths_preserved", "Explanation paths preserved", "Verify explanation traces remain visible.")
  ];
}

export function getRealAppBuildVerificationChecklist(): TeoyubeRealAppVerificationPreparationItem[] {
  return [
    item("typecheck", "Typecheck succeeds", "Run npm run typecheck where available."),
    item("lint", "Lint succeeds", "Run npm run lint where available."),
    item("build", "Build succeeds", "Run npm run build where available."),
    item("test", "Tests succeed", "Run npm run test where available.")
  ];
}

export function createRealAppVerificationPreparationChecklist(): TeoyubeRealAppVerificationPreparationItem[] {
  return [
    ...getRealAppRouteVerificationChecklist(),
    ...getRealAppComponentVerificationChecklist(),
    ...getRealAppDataVerificationChecklist(),
    ...getRealAppBuildVerificationChecklist(),
    item("mobile_layout_usable", "Mobile layout is usable", "Verify narrow viewport layout, text wrapping, and touch targets."),
    item("accessibility_basics", "Accessibility basics acceptable", "Verify labels, headings, keyboard path, contrast, and non-overlap.")
  ];
}

export function createRealAppVerificationPreparationDecision(input: TeoyubeRealAppVerificationPreparationInput = {}): "ready_for_phase_10_2" | "blocked" {
  return Object.values(input).some(Boolean) ? "blocked" : "ready_for_phase_10_2";
}

export function createRealAppVerificationPreparationReport(input: TeoyubeRealAppVerificationPreparationInput = {}) {
  const blockers = Object.entries(input)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => `${key} is missing for real app verification preparation.`);
  return {
    valid: blockers.length === 0,
    decision: createRealAppVerificationPreparationDecision(input),
    checklist: createRealAppVerificationPreparationChecklist(),
    routeChecklist: getRealAppRouteVerificationChecklist(),
    componentChecklist: getRealAppComponentVerificationChecklist(),
    dataChecklist: getRealAppDataVerificationChecklist(),
    buildChecklist: getRealAppBuildVerificationChecklist(),
    blockers,
    warnings: ["Phase 10.1 prepares real app verification; actual route/build/runtime proof belongs to Phase 10.2."],
    noDeployPerformed: true,
    noPublicLaunchPerformed: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
