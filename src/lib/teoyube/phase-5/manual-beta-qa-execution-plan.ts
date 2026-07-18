import type {
  TeoyubeManualBetaQaArea,
  TeoyubeManualBetaQaBlocker,
  TeoyubeManualBetaQaChecklistItem,
  TeoyubeManualBetaQaDecision,
  TeoyubeManualBetaQaReport,
  TeoyubeManualBetaQaRun,
  TeoyubeManualBetaQaScenario,
  TeoyubeManualBetaQaWarning
} from "./manual-beta-qa-contracts";

function scenario(area: TeoyubeManualBetaQaArea, id: string, title: string, protects: string[], critical = true): TeoyubeManualBetaQaScenario {
  return {
    id,
    area,
    title,
    critical,
    manualOnly: true,
    expectedResult: "Manual reviewer can confirm the surface remains Scripture-anchored, explainable, confidence-aware, fallback-safe, privacy-protective, and service-disabled.",
    protects
  };
}

function checklist(area: TeoyubeManualBetaQaArea, id: string, label: string, details: string): TeoyubeManualBetaQaChecklistItem {
  return { id, area, label, required: true, complete: false, details };
}

export function getManualBetaQaScenarios(): TeoyubeManualBetaQaScenario[] {
  return [
    scenario("real_data_loading", "real_data_loading", "Real Teoyube data loads or presents safe empty states.", ["real data", "fallback"]),
    scenario("user_journey", "user_journey_full_path", "Full user journey keeps state in memory and surfaces safe boundaries.", ["journey", "privacy"]),
    scenario("word_card", "word_card_scripture_promises", "WordCard shows available Scripture anchors, related promises, and missing-data warnings.", ["WordCard", "Scripture anchors"]),
    scenario("promise_table", "promise_table_real_filters", "Promise Table uses real clusters and supports theme, word, and Scripture filters.", ["Promise Table", "real data"]),
    scenario("prayer_companion", "prayer_companion_devotional_boundary", "PrayerCompanion preserves devotional boundary, explanation path, fallback prayer, and no persistence.", ["prayer", "privacy"]),
    scenario("compass_experience", "compass_calling_boundary", "CompassExperience shows calling context without certainty claims.", ["calling", "confidence"]),
    scenario("tig_response_panel", "tig_response_trace_confidence", "TIGResponsePanel keeps selected word, promise, anchor, action, confidence, explanation, and fallback reason visible.", ["TIG", "explanation trace"]),
    scenario("tig_graph_explorer", "tig_graph_list_mobile", "TIGGraphExplorer remains readable with graph/list fallback on mobile.", ["TIG graph", "mobile"]),
    scenario("reviewed_content_gate", "reviewed_content_gate_blocks_review_only", "Reviewed content gate blocks review-only drafts from live surfaces.", ["review gate", "draft exclusion"]),
    scenario("controlled_admin_prototype", "admin_prototype_boundaries", "Controlled admin prototype remains route-less, in-memory, and unable to publish.", ["admin prototype", "no publishing"]),
    scenario("fallback", "fallback_safe_states", "Fallback states do not invent promises or hide unsupported data.", ["fallback"]),
    scenario("scripture_anchor", "scripture_anchor_visibility", "Available Scripture anchors are visible and missing anchors are flagged.", ["Scripture anchors"]),
    scenario("explanation_trace", "explanation_trace_visibility", "Explanation paths are visible on TIG, prayer, calling, and action flows.", ["explanation trace"]),
    scenario("confidence_label", "confidence_label_visibility", "Confidence labels and boundaries remain visible.", ["confidence"]),
    scenario("mobile", "mobile_readability", "Core surfaces remain readable on small screens without dense unreadable graphs.", ["mobile"]),
    scenario("accessibility", "accessibility_basics", "Labels, headings, focus order, and keyboard basics are manually checked.", ["accessibility"]),
    scenario("privacy_consent", "privacy_consent_visibility", "Privacy and consent notices remain visible near sensitive input.", ["privacy", "consent"]),
    scenario("service_disabled_state", "disabled_services_visible", "Disabled service states remain explicit and no external service is required.", ["service gate", "privacy"])
  ];
}

export function getManualBetaQaChecklistByArea(area: TeoyubeManualBetaQaArea): TeoyubeManualBetaQaChecklistItem[] {
  return [
    checklist(area, `${area}_real_data`, "Real data or safe fallback", "Confirm real data is used where available and safe empty state appears otherwise."),
    checklist(area, `${area}_scripture_anchor`, "Scripture anchor visibility", "Confirm available Scripture anchors are visible and missing anchors are not silently hidden."),
    checklist(area, `${area}_explanation_trace`, "Explanation path visibility", "Confirm explanation trace or fallback reason is visible."),
    checklist(area, `${area}_confidence_label`, "Confidence boundary", "Confirm confidence label or uncertainty boundary is visible."),
    checklist(area, `${area}_mobile`, "Mobile readability", "Confirm the surface remains readable and usable on mobile."),
    checklist(area, `${area}_accessibility`, "Accessibility basics", "Confirm labels, headings, focus, and keyboard basics."),
    checklist(area, `${area}_privacy_consent`, "Privacy/consent notice", "Confirm sensitive input surfaces include privacy and consent copy."),
    checklist(area, `${area}_services_disabled`, "Disabled service state", "Confirm no database, analytics, monitoring, live AI, admin auth, CMS, or browser persistence is required.")
  ];
}

export function getCriticalManualBetaQaScenarios(): TeoyubeManualBetaQaScenario[] {
  return getManualBetaQaScenarios().filter((entry) => entry.critical);
}

export function getManualBetaQaExitCriteria(): string[] {
  return [
    "All critical manual QA scenarios are reviewed.",
    "No blocker remains open for Scripture anchors, explanation traces, fallback safety, confidence labels, privacy/consent, or disabled services.",
    "Owner accepts remaining warnings before beta participant invitation.",
    "No external service is required for safe render."
  ];
}

export function getManualBetaQaPauseCriteria(): string[] {
  return [
    "A surface hides Scripture anchors or explanation paths where available.",
    "A fallback invents an unsupported promise, calling, prayer, or certainty claim.",
    "A disabled service becomes required to render safely.",
    "Privacy/consent copy is missing on sensitive-input surfaces."
  ];
}

export function getManualBetaQaRollbackCriteria(): string[] {
  return [
    "Revert to last known safe UI/content package if reviewed content leaks into live surfaces.",
    "Disable beta execution if services become accidentally enabled.",
    "Return to read-only/in-memory behavior if any persistence or automatic collection appears.",
    "Pause owner invitation workflow if privacy/security review is incomplete."
  ];
}

export function createManualBetaQaExecutionPlan(input: {
  scenarios?: TeoyubeManualBetaQaScenario[];
  checklist?: TeoyubeManualBetaQaChecklistItem[];
} = {}): TeoyubeManualBetaQaRun {
  const scenarios = input.scenarios || getManualBetaQaScenarios();
  const areas = [...new Set(scenarios.map((entry) => entry.area))];
  return {
    id: "phase_5_1_manual_beta_qa_execution_plan",
    status: "manual_execution_required",
    scenarios,
    checklist: input.checklist || areas.flatMap((area) => getManualBetaQaChecklistByArea(area)),
    exitCriteria: getManualBetaQaExitCriteria(),
    pauseCriteria: getManualBetaQaPauseCriteria(),
    rollbackCriteria: getManualBetaQaRollbackCriteria(),
    manualOnly: true,
    noPublicUrlAutomation: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

function blockersForRun(run: TeoyubeManualBetaQaRun): TeoyubeManualBetaQaBlocker[] {
  return [
    !run.manualOnly ? { id: "manual_beta_qa_not_manual", area: "unknown" as const, message: "Manual beta QA plan must remain manual-only.", requiredAction: "Remove automation before Phase 5.2." } : undefined,
    !run.noPublicUrlAutomation ? { id: "public_url_automation_enabled", area: "unknown" as const, message: "Manual beta QA must not run automatically against public URLs.", requiredAction: "Remove public URL automation." } : undefined,
    !run.scenarios.length ? { id: "manual_beta_qa_scenarios_missing", area: "unknown" as const, message: "Manual beta QA scenarios are missing.", requiredAction: "Add scenarios before Phase 5.2." } : undefined
  ].filter(Boolean) as TeoyubeManualBetaQaBlocker[];
}

function warningsForRun(run: TeoyubeManualBetaQaRun): TeoyubeManualBetaQaWarning[] {
  return run.checklist
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => ({
      id: `${entry.id}_manual_pending`,
      area: entry.area,
      message: `${entry.label} requires manual beta QA execution.`,
      recommendedAction: entry.details
    }));
}

export function createManualBetaQaExecutionPlanDecision(input: TeoyubeManualBetaQaRun = createManualBetaQaExecutionPlan()): TeoyubeManualBetaQaDecision {
  const blockers = blockersForRun(input);
  if (blockers.length) return "blocked";
  return input.checklist.some((entry) => entry.required && !entry.complete) ? "manual_execution_required" : "manual_beta_qa_plan_ready";
}

export function createManualBetaQaExecutionPlanReport(input: TeoyubeManualBetaQaRun = createManualBetaQaExecutionPlan()): TeoyubeManualBetaQaReport {
  const blockers = blockersForRun(input);
  const warnings = warningsForRun(input);
  return {
    valid: blockers.length === 0,
    decision: createManualBetaQaExecutionPlanDecision(input),
    run: input,
    criticalScenarios: input.scenarios.filter((entry) => entry.critical),
    blockers,
    warnings,
    scenarioCount: input.scenarios.length,
    checklistCount: input.checklist.length,
    manualOnly: true,
    noPublicUrlAutomation: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
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
