import type { TeoyubeLaunchDayMonitoringBlocker, TeoyubeLaunchDayMonitoringCheck, TeoyubeLaunchDayMonitoringResult, TeoyubeLaunchDayMonitoringRun, TeoyubeLaunchDayMonitoringWarning } from "./launch-day-monitoring-contracts";

const CRITICAL_PATTERNS = [
  "scripture_anchor_missing",
  "explanation_path_missing",
  "promise_without_scripture",
  "prayer_without_explanation",
  "action_step_without_explanation",
  "fallback_empty",
  "fallback_not_scripture_anchored",
  "confidence_overstated",
  "divine_certainty_claim",
  "unsafe_spiritual_guidance"
];

function item(id: string, label: string): TeoyubeLaunchDayMonitoringCheck {
  return { id, label, phase: "surface_health_review", required: true, launchCritical: true, details: label };
}

export function getScriptureExplanationFallbackWatchChecklist(): TeoyubeLaunchDayMonitoringCheck[] {
  return [
    item("scripture_anchor_visible", "Scripture anchor visible"),
    item("explanation_path_visible", "Explanation path visible"),
    item("promise_has_scripture_support", "Promise has Scripture support"),
    item("prayer_has_explanation_path", "Prayer has explanation path"),
    item("action_step_has_explanation_path", "Action step has explanation path"),
    item("fallback_non_empty", "Fallback response is non-empty"),
    item("fallback_scripture_anchored", "Fallback response is Scripture-anchored"),
    item("confidence_label_not_overstated", "Confidence label is not overstated"),
    item("no_divine_certainty_claim", "No claim of divine certainty"),
    item("spiritual_guidance_safe", "Spiritual guidance is safe")
  ];
}

export function recordScriptureExplanationFallbackWatchResult(
  run: Pick<TeoyubeLaunchDayMonitoringRun, "results">,
  result: Partial<TeoyubeLaunchDayMonitoringResult> & Pick<TeoyubeLaunchDayMonitoringResult, "checkId">
) {
  const critical = CRITICAL_PATTERNS.includes(result.checkId);
  return {
    ...run,
    results: [
      ...run.results,
      {
        id: result.id || `scripture_watch_${run.results.length + 1}`,
        checkId: result.checkId,
        phase: "surface_health_review" as const,
        status: result.status || (critical ? "fail" : "pass"),
        notes: result.notes || [],
        blocker: result.blocker ?? (critical || result.status === "fail"),
        warning: result.warning ?? (result.status === "warning"),
        recordedManually: true as const,
        generatedAt: result.generatedAt || new Date().toISOString()
      }
    ]
  };
}

export function getScriptureExplanationFallbackWatchBlockers(results: TeoyubeLaunchDayMonitoringResult[]): TeoyubeLaunchDayMonitoringBlocker[] {
  return results
    .filter((entry) => entry.blocker || entry.status === "fail" || CRITICAL_PATTERNS.includes(entry.checkId))
    .map((entry) => ({
      id: `scripture_watch_${entry.checkId}`,
      label: entry.checkId.replace(/_/g, " "),
      phase: "surface_health_review",
      severity: "critical",
      reason: entry.notes.join(" ") || "Scripture, explanation, fallback, confidence, certainty, or safety watch failed.",
      requiredAction: "Pause for owner review before continuing launch-day monitoring."
    }));
}

export function getScriptureExplanationFallbackWatchWarnings(results: TeoyubeLaunchDayMonitoringResult[]): TeoyubeLaunchDayMonitoringWarning[] {
  return results
    .filter((entry) => entry.warning || entry.status === "warning")
    .map((entry) => ({
      id: `scripture_watch_warning_${entry.checkId}`,
      label: entry.checkId.replace(/_/g, " "),
      phase: "surface_health_review",
      severity: "medium",
      message: entry.notes.join(" ") || "Scripture/explanation/fallback watch warning recorded.",
      recommendedAction: "Document and review during daily launch review."
    }));
}

export function createScriptureExplanationFallbackWatchReport(results: TeoyubeLaunchDayMonitoringResult[] = []) {
  const blockers = getScriptureExplanationFallbackWatchBlockers(results);
  const warnings = getScriptureExplanationFallbackWatchWarnings(results);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    checklist: getScriptureExplanationFallbackWatchChecklist(),
    resultCount: results.length,
    blockers,
    warnings,
    launchCriticalRules: CRITICAL_PATTERNS,
    generatedAt: new Date().toISOString()
  };
}
