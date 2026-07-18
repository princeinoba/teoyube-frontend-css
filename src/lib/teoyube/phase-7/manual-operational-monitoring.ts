import type {
  TeoyubeManualOperationalMonitoringArea,
  TeoyubeManualOperationalMonitoringBlocker,
  TeoyubeManualOperationalMonitoringCheck,
  TeoyubeManualOperationalMonitoringDecision,
  TeoyubeManualOperationalMonitoringReport,
  TeoyubeManualOperationalMonitoringResult,
  TeoyubeManualOperationalMonitoringRun,
  TeoyubeManualOperationalMonitoringWarning
} from "./manual-operational-monitoring-contracts";

export type TeoyubeManualOperationalMonitoringRunInput = Partial<{
  id: string;
  results: TeoyubeManualOperationalMonitoringResult[];
  publicUrlsFetchedAutomatically: boolean;
  monitoringProviderConnected: boolean;
  alertsSent: boolean;
  analyticsSent: boolean;
  externalWrite: boolean;
}>;

function check(id: string, area: TeoyubeManualOperationalMonitoringArea, label: string, details: string): TeoyubeManualOperationalMonitoringCheck {
  return { id, area, label, required: true, manualOnly: true, details };
}

function result(checkEntry: TeoyubeManualOperationalMonitoringCheck, status: TeoyubeManualOperationalMonitoringResult["status"] = "not_checked", notes = "Manual monitoring result not recorded."): TeoyubeManualOperationalMonitoringResult {
  return {
    checkId: checkEntry.id,
    area: checkEntry.area,
    status,
    notes,
    blocker: status === "blocked",
    warning: status === "warning" || status === "not_checked",
    recordedAt: new Date().toISOString()
  };
}

export function getManualOperationalMonitoringChecklist(): TeoyubeManualOperationalMonitoringCheck[] {
  return [
    check("app_load_manual", "app_load_manual", "App load checked manually", "Owner manually checks app load without automatic URL fetching."),
    check("real_data_loading", "real_data_loading", "Real data loading checked manually", "Owner manually verifies real data surfaces render."),
    check("user_journey", "user_journey", "User journey checked manually", "Owner manually walks key user journey surfaces."),
    check("scripture_anchor", "scripture_anchor", "Scripture anchors checked manually", "Scripture anchors remain visible when available."),
    check("explanation_trace", "explanation_trace", "Explanation traces checked manually", "Explanation traces remain visible."),
    check("fallback", "fallback", "Fallback checked manually", "Fallback states remain safe and bounded."),
    check("confidence_label", "confidence_label", "Confidence labels checked manually", "Confidence labels remain visible."),
    check("reviewed_content_gate", "reviewed_content_gate", "Reviewed-content gate checked manually", "Review-only content remains gated."),
    check("service_disabled_state", "service_disabled_state", "Service-disabled state checked manually", "Services remain disabled or plan-only."),
    check("privacy_consent", "privacy_consent", "Privacy/consent checked manually", "Privacy, consent, and sensitive information notices remain visible."),
    check("manual_feedback_review", "manual_feedback_review", "Manual feedback review checked", "Feedback review remains manual and in memory."),
    check("manual_issue_triage", "manual_issue_triage", "Manual issue triage checked", "Issue triage remains manual."),
    check("mobile", "mobile", "Mobile checked manually", "Mobile surfaces remain usable."),
    check("accessibility", "accessibility", "Accessibility checked manually", "Keyboard, focus, labels, and readable states remain available.")
  ];
}

export function createManualOperationalMonitoringRun(input: TeoyubeManualOperationalMonitoringRunInput = {}): TeoyubeManualOperationalMonitoringRun {
  const checks = getManualOperationalMonitoringChecklist();
  const results = input.results || [];
  return {
    id: input.id || "phase_7_1_manual_operational_monitoring_run",
    checks,
    results,
    manualOnly: true,
    inMemoryOnly: true,
    publicUrlsFetchedAutomatically: false,
    monitoringProviderConnected: false,
    alertsSent: false,
    analyticsSent: false,
    externalWrite: false,
    generatedAt: new Date().toISOString()
  };
}

export function recordManualOperationalMonitoringResult(run: TeoyubeManualOperationalMonitoringRun, monitoringResult: TeoyubeManualOperationalMonitoringResult): TeoyubeManualOperationalMonitoringRun {
  return {
    ...run,
    results: [...run.results.filter((entry) => entry.checkId !== monitoringResult.checkId), monitoringResult],
    generatedAt: new Date().toISOString()
  };
}

export function recordManualOperationalMonitoringAreaResult(run: TeoyubeManualOperationalMonitoringRun, area: TeoyubeManualOperationalMonitoringArea, monitoringResult: Partial<TeoyubeManualOperationalMonitoringResult>): TeoyubeManualOperationalMonitoringRun {
  const checkEntry = run.checks.find((entry) => entry.area === area) || check("manual_monitoring_unknown", area, "Manual monitoring result", "Manual monitoring result recorded.");
  return recordManualOperationalMonitoringResult(run, {
    ...result(checkEntry, monitoringResult.status || "passed", monitoringResult.notes || "Manual monitoring check passed."),
    ...monitoringResult,
    checkId: checkEntry.id,
    area
  });
}

export function summarizeManualOperationalMonitoringRun(run: TeoyubeManualOperationalMonitoringRun) {
  const blockers = getManualOperationalMonitoringBlockers(run);
  const warnings = getManualOperationalMonitoringWarnings(run);
  return {
    totalCheckCount: run.checks.length,
    completedCheckCount: run.results.filter((entry) => entry.status === "passed" || entry.status === "warning" || entry.status === "blocked").length,
    blockerCount: blockers.length,
    warningCount: warnings.length
  };
}

export function getManualOperationalMonitoringBlockers(run: TeoyubeManualOperationalMonitoringRun): TeoyubeManualOperationalMonitoringBlocker[] {
  return [
    ...run.results.filter((entry) => entry.blocker || entry.status === "blocked").map((entry) => ({
      id: `${entry.checkId}_blocker`,
      area: entry.area,
      message: entry.notes || `${entry.area} is blocked.`,
      requiredAction: "Pause controlled beta operations and review manually."
    }))
  ];
}

export function getManualOperationalMonitoringWarnings(run: TeoyubeManualOperationalMonitoringRun): TeoyubeManualOperationalMonitoringWarning[] {
  const resultIds = new Set(run.results.map((entry) => entry.checkId));
  return [
    ...run.results.filter((entry) => entry.warning || entry.status === "warning").map((entry) => ({
      id: `${entry.checkId}_warning`,
      area: entry.area,
      message: entry.notes || `${entry.area} needs manual follow-up.`,
      recommendedAction: "Review during manual monitoring and owner review."
    })),
    ...run.checks.filter((entry) => !resultIds.has(entry.id)).map((entry) => ({
      id: `${entry.id}_not_checked`,
      area: entry.area,
      message: `${entry.label} has not been manually recorded.`,
      recommendedAction: "Record this check before treating monitoring as complete."
    }))
  ];
}

export function createManualOperationalMonitoringDecision(run: TeoyubeManualOperationalMonitoringRun): TeoyubeManualOperationalMonitoringDecision {
  const blockers = getManualOperationalMonitoringBlockers(run);
  const warnings = getManualOperationalMonitoringWarnings(run);
  if (blockers.length) return "blocked";
  if (!run.results.length) return "needs_manual_checks";
  return warnings.length ? "monitoring_ready_with_warnings" : "monitoring_ready";
}

export function createManualOperationalMonitoringReport(run: TeoyubeManualOperationalMonitoringRun = createManualOperationalMonitoringRun()): TeoyubeManualOperationalMonitoringReport {
  const blockers = getManualOperationalMonitoringBlockers(run);
  const warnings = getManualOperationalMonitoringWarnings(run);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : run.results.length ? "ready" : "not_started",
    decision: createManualOperationalMonitoringDecision(run),
    run,
    summary: summarizeManualOperationalMonitoringRun(run),
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicUrlsFetchedAutomatically: true,
    noMonitoringProviderConnected: true,
    noAlertsSent: true,
    noAnalyticsSent: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function createPassingManualOperationalMonitoringRun(): TeoyubeManualOperationalMonitoringRun {
  const run = createManualOperationalMonitoringRun();
  return createManualOperationalMonitoringRun({
    results: run.checks.map((entry) => result(entry, "passed", "Manual monitoring smoke check passed in memory."))
  });
}
