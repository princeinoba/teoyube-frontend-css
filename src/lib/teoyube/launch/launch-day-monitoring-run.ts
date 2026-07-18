import type {
  TeoyubeLaunchDayMonitoringBlocker,
  TeoyubeLaunchDayMonitoringCheck,
  TeoyubeLaunchDayMonitoringDecision,
  TeoyubeLaunchDayMonitoringPhase,
  TeoyubeLaunchDayMonitoringReport,
  TeoyubeLaunchDayMonitoringResult,
  TeoyubeLaunchDayMonitoringRun,
  TeoyubeLaunchDayMonitoringWarning
} from "./launch-day-monitoring-contracts";

export type TeoyubeLaunchDayMonitoringRunInput = Partial<Pick<TeoyubeLaunchDayMonitoringRun, "id" | "label" | "checks" | "results">>;

function check(id: string, label: string, phase: TeoyubeLaunchDayMonitoringPhase): TeoyubeLaunchDayMonitoringCheck {
  return { id, label, phase, required: true, launchCritical: true, details: label };
}

export function getDefaultLaunchDayMonitoringChecks(): TeoyubeLaunchDayMonitoringCheck[] {
  return [
    check("pre_launch_manual_check", "Pre-launch manual check", "pre_launch_manual_check"),
    check("activation_observation", "Activation observation", "activation_observation"),
    check("first_hour_review", "First-hour review", "first_hour_review"),
    check("surface_health_review", "Surface health review", "surface_health_review"),
    check("feedback_intake_review", "Feedback intake review", "feedback_intake_review"),
    check("issue_escalation_review", "Issue escalation review", "issue_escalation_review"),
    check("pause_rollback_review", "Pause/rollback review", "pause_rollback_review"),
    check("daily_summary", "Daily summary", "daily_summary")
  ];
}

export function createLaunchDayMonitoringRun(input: TeoyubeLaunchDayMonitoringRunInput = {}): TeoyubeLaunchDayMonitoringRun {
  return {
    id: input.id || "launch_day_monitoring_run_4_2",
    label: input.label || "Launch Day Monitoring Run",
    checks: input.checks || getDefaultLaunchDayMonitoringChecks(),
    results: input.results || [],
    manualOnly: true,
    inMemoryOnly: true,
    launchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    previewUrlFetched: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    fileWritten: false,
    generatedAt: new Date().toISOString()
  };
}

export function recordLaunchDayMonitoringResult(
  run: TeoyubeLaunchDayMonitoringRun,
  result: Partial<TeoyubeLaunchDayMonitoringResult> & Pick<TeoyubeLaunchDayMonitoringResult, "checkId" | "phase">
): TeoyubeLaunchDayMonitoringRun {
  const normalized: TeoyubeLaunchDayMonitoringResult = {
    id: result.id || `launch_day_result_${run.results.length + 1}`,
    checkId: result.checkId,
    phase: result.phase,
    status: result.status || "pass",
    notes: result.notes || [],
    blocker: result.blocker ?? result.status === "fail",
    warning: result.warning ?? result.status === "warning",
    recordedManually: true,
    generatedAt: result.generatedAt || new Date().toISOString()
  };

  return { ...run, results: [...run.results, normalized] };
}

export function recordLaunchDayMonitoringPhaseResult(
  run: TeoyubeLaunchDayMonitoringRun,
  phase: TeoyubeLaunchDayMonitoringPhase,
  result: Partial<TeoyubeLaunchDayMonitoringResult> = {}
): TeoyubeLaunchDayMonitoringRun {
  return recordLaunchDayMonitoringResult(run, {
    ...result,
    checkId: result.checkId || phase,
    phase
  });
}

export function summarizeLaunchDayMonitoringRun(run: TeoyubeLaunchDayMonitoringRun) {
  return {
    checkCount: run.checks.length,
    resultCount: run.results.length,
    passedCount: run.results.filter((entry) => entry.status === "pass").length,
    warningCount: run.results.filter((entry) => entry.warning || entry.status === "warning").length,
    blockerCount: run.results.filter((entry) => entry.blocker || entry.status === "fail").length,
    manualOnly: run.manualOnly,
    inMemoryOnly: run.inMemoryOnly
  };
}

export function getLaunchDayMonitoringBlockers(run: TeoyubeLaunchDayMonitoringRun): TeoyubeLaunchDayMonitoringBlocker[] {
  return [
    ...run.results
      .filter((entry) => entry.blocker || entry.status === "fail")
      .map((entry) => ({
        id: `launch_day_monitoring_${entry.id}`,
        label: entry.checkId.replace(/_/g, " "),
        phase: entry.phase,
        severity: "critical" as const,
        reason: entry.notes.join(" ") || "Manual monitoring result failed.",
        requiredAction: "Pause for owner review before continuing limited soft launch monitoring."
      })),
    run.launchPerformed ? {
      id: "launch_day_monitoring_launch_performed",
      label: "Launch performed by code",
      phase: "activation_observation",
      severity: "critical" as const,
      reason: "Monitoring run must not perform launch.",
      requiredAction: "Remove launch execution behavior."
    } : undefined,
    run.usersContacted ? {
      id: "launch_day_monitoring_users_contacted",
      label: "Users contacted by code",
      phase: "activation_observation",
      severity: "critical" as const,
      reason: "Monitoring run must not contact users.",
      requiredAction: "Keep user contact manual and outside code."
    } : undefined,
    run.feedbackCollectedAutomatically ? {
      id: "launch_day_monitoring_feedback_auto_collected",
      label: "Feedback collected automatically",
      phase: "feedback_intake_review",
      severity: "critical" as const,
      reason: "Feedback must not be collected automatically.",
      requiredAction: "Use manual feedback intake only."
    } : undefined
  ].filter(Boolean) as TeoyubeLaunchDayMonitoringBlocker[];
}

export function getLaunchDayMonitoringWarnings(run: TeoyubeLaunchDayMonitoringRun): TeoyubeLaunchDayMonitoringWarning[] {
  return [
    {
      id: "launch_day_monitoring_manual_only",
      label: "Monitoring is manual only",
      phase: "daily_summary",
      severity: "medium",
      message: "Launch-day monitoring records human-observed results only and performs no monitoring automatically.",
      recommendedAction: "Have the owner or launch reviewer enter results manually."
    },
    ...run.results
      .filter((entry) => entry.warning || entry.status === "warning")
      .map((entry) => ({
        id: `launch_day_monitoring_warning_${entry.id}`,
        label: entry.checkId.replace(/_/g, " "),
        phase: entry.phase,
        severity: "medium" as const,
        message: entry.notes.join(" ") || "Manual monitoring result raised a warning.",
        recommendedAction: "Document and review during daily launch review."
      }))
  ];
}

export function createLaunchDayMonitoringDecision(run: TeoyubeLaunchDayMonitoringRun): TeoyubeLaunchDayMonitoringDecision {
  const blockers = getLaunchDayMonitoringBlockers(run);
  const warnings = getLaunchDayMonitoringWarnings(run).filter((entry) => entry.id !== "launch_day_monitoring_manual_only");

  if (blockers.some((entry) => /rollback|analytics|persistence|live ai|unsafe/i.test(`${entry.label} ${entry.reason}`))) return "rollback_recommended";
  if (blockers.length > 0) return "pause_for_review";
  if (warnings.length > 0) return "continue_with_warnings";
  return "continue_soft_launch";
}

export function createLaunchDayMonitoringReport(run: TeoyubeLaunchDayMonitoringRun = createLaunchDayMonitoringRun()): TeoyubeLaunchDayMonitoringReport {
  const blockers = getLaunchDayMonitoringBlockers(run);
  const warnings = getLaunchDayMonitoringWarnings(run);
  const decision = createLaunchDayMonitoringDecision(run);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0,
    decision,
    run,
    checkCount: run.checks.length,
    resultCount: run.results.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    noLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
