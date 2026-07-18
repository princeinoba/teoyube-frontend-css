import type {
  TeoyubeBetaQaArea,
  TeoyubeBetaQaBlocker,
  TeoyubeBetaQaChecklistItem,
  TeoyubeBetaQaDecision,
  TeoyubeBetaQaReport,
  TeoyubeBetaQaRun,
  TeoyubeBetaQaScenario,
  TeoyubeBetaQaWarning
} from "./beta-qa-plan-contracts";

function scenario(area: TeoyubeBetaQaArea, id: string, title: string, protects: string[], critical = true): TeoyubeBetaQaScenario {
  return {
    id,
    area,
    title,
    critical,
    manual: true,
    expectedResult: "Reviewer can confirm the surface remains Scripture-anchored, explainable, safe on fallback, and service-disabled.",
    protects
  };
}

function checklist(area: TeoyubeBetaQaArea, id: string, label: string, details: string): TeoyubeBetaQaChecklistItem {
  return { id, area, label, required: true, complete: false, details };
}

export function getBetaQaScenarios(): TeoyubeBetaQaScenario[] {
  return [
    scenario("home", "home_real_data", "Home loads real Teoyube summaries without demo-only data.", ["real data loading", "fallback"]),
    scenario("word_card", "word_card_anchor_trace", "WordCard shows Scripture anchors, related promises, and safe missing-data fallback.", ["Scripture anchors", "fallback"]),
    scenario("promise_table", "promise_table_filters", "Promise Table filters by theme, word, and Scripture with real cluster rows.", ["Promise Table", "mobile"]),
    scenario("prayer_companion", "prayer_companion_boundary", "PrayerCompanion preserves devotional boundary, explanation path, and no persistence.", ["prayer", "privacy"]),
    scenario("compass_experience", "compass_calling_humility", "CompassExperience avoids certainty claims while showing calling context and fallback.", ["calling", "confidence"]),
    scenario("tig_response_panel", "tig_response_trace", "TIGResponsePanel keeps confidence label, explanation trace, fallback reason, and anchors visible.", ["TIG", "explanation trace"]),
    scenario("tig_graph_explorer", "tig_graph_mobile_list", "TIGGraphExplorer remains readable with graph/list fallback on mobile.", ["TIG graph", "mobile"]),
    scenario("reviewed_content_gate", "reviewed_content_gate_blocks_drafts", "Reviewed content gate blocks review-only drafts from live recommendation flow.", ["review gates", "draft exclusion"]),
    scenario("admin_workflow_prototype", "admin_prototype_in_memory", "Admin workflow prototype is in-memory, prototype-only, and cannot publish content.", ["admin prototype", "no persistence"]),
    scenario("mobile", "mobile_core_surfaces", "Core surfaces remain readable without horizontal overflow on mobile.", ["mobile"]),
    scenario("accessibility", "accessibility_basics", "Headings, labels, focus states, and semantic grouping are manually checked.", ["accessibility"]),
    scenario("fallback", "fallback_safe_empty_states", "Fallbacks are non-empty, safe, and do not invent promises.", ["fallback"]),
    scenario("scripture_anchor", "scripture_anchor_visibility", "Recommendations and release candidates expose available Scripture anchors.", ["Scripture anchors"]),
    scenario("explanation_trace", "explanation_trace_visibility", "TIG, prayer, calling, and action steps expose explanation paths.", ["explanation trace"]),
    scenario("privacy_consent", "privacy_consent_copy", "Privacy and consent copy remains visible where sensitive input appears.", ["privacy", "consent"]),
    scenario("service_disabled_state", "service_disabled_state", "Disabled services remain clearly disconnected.", ["database disabled", "analytics disabled", "live AI disabled"])
  ];
}

export function getBetaQaChecklistByArea(area: TeoyubeBetaQaArea): TeoyubeBetaQaChecklistItem[] {
  return [
    checklist(area, `${area}_real_data`, "Real data or safe empty state", "Confirm the surface uses real data where available and safe fallback otherwise."),
    checklist(area, `${area}_scripture`, "Scripture anchors visible", "Confirm available anchors are visible and missing anchors are flagged."),
    checklist(area, `${area}_trace`, "Explanation trace visible", "Confirm explanation path or fallback reason is visible."),
    checklist(area, `${area}_confidence`, "Confidence boundary visible", "Confirm confidence labels or boundaries are not hidden."),
    checklist(area, `${area}_mobile`, "Mobile readability", "Confirm the surface is readable on mobile."),
    checklist(area, `${area}_disabled_services`, "Services disabled", "Confirm no database, analytics, monitoring, live AI, admin auth, CMS, or browser persistence is required.")
  ];
}

export function getCriticalBetaQaScenarios(): TeoyubeBetaQaScenario[] {
  return getBetaQaScenarios().filter((entry) => entry.critical);
}

export function getMobileBetaQaScenarios(): TeoyubeBetaQaScenario[] {
  return getBetaQaScenarios().filter((entry) => entry.area === "mobile" || entry.protects.includes("mobile"));
}

export function getAccessibilityBetaQaScenarios(): TeoyubeBetaQaScenario[] {
  return getBetaQaScenarios().filter((entry) => entry.area === "accessibility" || entry.protects.includes("accessibility"));
}

export function getScriptureExplanationBetaQaScenarios(): TeoyubeBetaQaScenario[] {
  return getBetaQaScenarios().filter((entry) => entry.protects.some((value) => value.toLowerCase().includes("scripture") || value.toLowerCase().includes("explanation")));
}

export function getServiceDisabledStateQaScenarios(): TeoyubeBetaQaScenario[] {
  return getBetaQaScenarios().filter((entry) => entry.area === "service_disabled_state" || entry.protects.some((value) => value.toLowerCase().includes("disabled")));
}

export function createBetaQaPlan(input: {
  scenarios?: TeoyubeBetaQaScenario[];
  checklist?: TeoyubeBetaQaChecklistItem[];
} = {}): TeoyubeBetaQaRun {
  const scenarios = input.scenarios || getBetaQaScenarios();
  const checklistItems = input.checklist || [...new Set(scenarios.map((entry) => entry.area))]
    .flatMap((area) => getBetaQaChecklistByArea(area));
  return {
    id: "phase_4_5_beta_qa_plan",
    status: "manual_execution_required",
    scenarios,
    checklist: checklistItems,
    manualOnly: true,
    inMemoryOnly: true,
    noUsersContacted: true,
    noScheduleCreated: true,
    createdAt: new Date().toISOString()
  };
}

export function createBetaQaPlanDecision(input: TeoyubeBetaQaRun = createBetaQaPlan()): TeoyubeBetaQaDecision {
  const missing = input.checklist.filter((entry) => entry.required && !entry.complete);
  if (!input.scenarios.length) return "blocked";
  return missing.length ? "manual_execution_required" : "beta_qa_plan_ready";
}

function blockersForRun(run: TeoyubeBetaQaRun): TeoyubeBetaQaBlocker[] {
  return [
    !run.inMemoryOnly
      ? { id: "beta_qa_not_in_memory", area: "unknown" as const, message: "Beta QA plan must remain in-memory only.", requiredAction: "Remove persistence from the QA plan." }
      : undefined,
    !run.scenarios.length
      ? { id: "beta_qa_scenarios_missing", area: "unknown" as const, message: "Beta QA scenarios are missing.", requiredAction: "Add beta QA scenarios before Phase 4.6." }
      : undefined
  ].filter(Boolean) as TeoyubeBetaQaBlocker[];
}

function warningsForRun(run: TeoyubeBetaQaRun): TeoyubeBetaQaWarning[] {
  return run.checklist
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => ({
      id: `${entry.id}_manual_pending`,
      area: entry.area,
      message: `${entry.label} requires manual beta QA execution.`,
      recommendedAction: entry.details
    }));
}

export function createBetaQaPlanReport(input: TeoyubeBetaQaRun = createBetaQaPlan()): TeoyubeBetaQaReport {
  const blockers = blockersForRun(input);
  const warnings = warningsForRun(input);
  const decision = createBetaQaPlanDecision(input);
  return {
    valid: blockers.length === 0,
    decision,
    run: input,
    criticalScenarios: input.scenarios.filter((entry) => entry.critical),
    blockers,
    warnings,
    scenarioCount: input.scenarios.length,
    checklistCount: input.checklist.length,
    manualOnly: true,
    noUsersContacted: true,
    noScheduleCreated: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
