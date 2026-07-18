import type { TeoyubeLaunchDayMonitoringBlocker, TeoyubeLaunchDayMonitoringCheck, TeoyubeLaunchDayMonitoringDecision, TeoyubeLaunchDayMonitoringResult, TeoyubeLaunchDayMonitoringWarning } from "./launch-day-monitoring-contracts";

export type TeoyubeFirstHourMonitoringPlan = {
  id: string;
  label: string;
  checklist: TeoyubeLaunchDayMonitoringCheck[];
  results: TeoyubeLaunchDayMonitoringResult[];
  manualOnly: true;
  fetchesPreviewUrls: false;
  automatedMonitoringPerformed: false;
  generatedAt: string;
};

function item(id: string, label: string): TeoyubeLaunchDayMonitoringCheck {
  return { id, label, phase: "first_hour_review", required: true, launchCritical: true, details: label };
}

export function getLaunchDayFirstHourChecklist(): TeoyubeLaunchDayMonitoringCheck[] {
  return [
    item("app_loads", "App loads"),
    item("canon_loads", "Canon loads"),
    item("daily_word_loads", "Daily Word loads"),
    item("prayer_loads", "Prayer loads"),
    item("calling_compass_loads", "Calling Compass loads"),
    item("promise_cluster_loads", "Promise Cluster loads"),
    item("ai_companion_loads", "AI Companion loads"),
    item("onboarding_loads", "Onboarding loads"),
    item("tig_response_panel_loads", "TIG Response Panel loads"),
    item("tig_graph_preview_loads", "TIG Graph Preview loads"),
    item("scripture_anchors_visible", "Scripture anchors are visible"),
    item("explanation_paths_visible", "Explanation paths are visible"),
    item("fallback_behavior_safe", "Fallback behavior is safe"),
    item("confidence_labels_visible", "Confidence labels are visible where applicable"),
    item("consent_controls_visible", "Consent controls are visible where applicable"),
    item("feedback_instructions_visible", "Feedback instructions are visible or available"),
    item("mobile_layout_usable", "Mobile layout is usable"),
    item("accessibility_basics_acceptable", "Accessibility basics are acceptable"),
    item("debug_payload_hidden", "Debug payload is hidden"),
    item("no_external_analytics_enabled", "No external analytics are enabled"),
    item("no_production_persistence_enabled", "No production persistence is enabled"),
    item("no_live_ai_orchestration_enabled", "No live AI orchestration is enabled")
  ];
}

export function createFirstHourMonitoringPlan(input: Partial<TeoyubeFirstHourMonitoringPlan> = {}): TeoyubeFirstHourMonitoringPlan {
  return {
    id: input.id || "launch_day_first_hour_monitoring_4_2",
    label: input.label || "Launch Day First-Hour Monitoring Plan",
    checklist: input.checklist || getLaunchDayFirstHourChecklist(),
    results: input.results || [],
    manualOnly: true,
    fetchesPreviewUrls: false,
    automatedMonitoringPerformed: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function recordFirstHourMonitoringResult(
  plan: TeoyubeFirstHourMonitoringPlan,
  result: Partial<TeoyubeLaunchDayMonitoringResult> & Pick<TeoyubeLaunchDayMonitoringResult, "checkId">
): TeoyubeFirstHourMonitoringPlan {
  return {
    ...plan,
    results: [
      ...plan.results,
      {
        id: result.id || `first_hour_result_${plan.results.length + 1}`,
        checkId: result.checkId,
        phase: "first_hour_review",
        status: result.status || "pass",
        notes: result.notes || [],
        blocker: result.blocker ?? result.status === "fail",
        warning: result.warning ?? result.status === "warning",
        recordedManually: true,
        generatedAt: result.generatedAt || new Date().toISOString()
      }
    ]
  };
}

export function getFirstHourMonitoringBlockers(plan: TeoyubeFirstHourMonitoringPlan): TeoyubeLaunchDayMonitoringBlocker[] {
  return [
    ...plan.results
      .filter((entry) => entry.blocker || entry.status === "fail")
      .map((entry) => ({
        id: `first_hour_${entry.checkId}`,
        label: entry.checkId.replace(/_/g, " "),
        phase: "first_hour_review" as const,
        severity: "critical" as const,
        reason: entry.notes.join(" ") || "First-hour manual check failed.",
        requiredAction: "Pause for owner review before continuing the limited soft launch."
      })),
    plan.fetchesPreviewUrls ? {
      id: "first_hour_fetches_preview_urls",
      label: "First-hour monitoring fetched URLs",
      phase: "first_hour_review" as const,
      severity: "critical" as const,
      reason: "First-hour monitoring must not fetch preview URLs.",
      requiredAction: "Keep first-hour monitoring manual."
    } : undefined
  ].filter(Boolean) as TeoyubeLaunchDayMonitoringBlocker[];
}

export function getFirstHourMonitoringWarnings(plan: TeoyubeFirstHourMonitoringPlan): TeoyubeLaunchDayMonitoringWarning[] {
  return [
    {
      id: "first_hour_manual_only",
      label: "First-hour monitoring is manual only",
      phase: "first_hour_review",
      severity: "medium",
      message: "The first-hour plan records human checks and performs no automated monitoring.",
      recommendedAction: "Enter results manually during launch-day review."
    },
    ...plan.results
      .filter((entry) => entry.warning || entry.status === "warning")
      .map((entry) => ({
        id: `first_hour_warning_${entry.checkId}`,
        label: entry.checkId.replace(/_/g, " "),
        phase: "first_hour_review" as const,
        severity: "medium" as const,
        message: entry.notes.join(" ") || "First-hour manual check raised a warning.",
        recommendedAction: "Document in daily review."
      }))
  ];
}

export function createFirstHourMonitoringDecision(plan: TeoyubeFirstHourMonitoringPlan): TeoyubeLaunchDayMonitoringDecision {
  const blockers = getFirstHourMonitoringBlockers(plan);
  if (blockers.some((entry) => /scripture|explanation|fallback|consent|privacy|debug|analytics|persistence|live ai/i.test(`${entry.label} ${entry.reason}`))) return "pause_for_review";
  if (blockers.length > 0) return "pause_for_review";
  if (plan.results.some((entry) => entry.warning || entry.status === "warning")) return "continue_with_warnings";
  return "continue_soft_launch";
}

export function createFirstHourMonitoringReport(plan: TeoyubeFirstHourMonitoringPlan = createFirstHourMonitoringPlan()) {
  const blockers = getFirstHourMonitoringBlockers(plan);
  const warnings = getFirstHourMonitoringWarnings(plan);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createFirstHourMonitoringDecision(plan),
    plan,
    checklistCount: plan.checklist.length,
    resultCount: plan.results.length,
    blockers,
    warnings,
    noPreviewUrlFetched: true,
    noAutomatedMonitoringPerformed: true,
    generatedAt: new Date().toISOString()
  };
}
