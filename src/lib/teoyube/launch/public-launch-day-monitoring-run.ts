import type {
  TeoyubePublicLaunchDayBlocker,
  TeoyubePublicLaunchDayDecision,
  TeoyubePublicLaunchDayMonitoringCheck,
  TeoyubePublicLaunchDayMonitoringResult,
  TeoyubePublicLaunchDayPhase,
  TeoyubePublicLaunchDayStatus,
  TeoyubePublicLaunchDayWarning
} from "./public-launch-day-monitoring-feedback-contracts";

export type TeoyubePublicLaunchDayMonitoringRun = {
  id: string;
  label: string;
  checks: TeoyubePublicLaunchDayMonitoringCheck[];
  results: TeoyubePublicLaunchDayMonitoringResult[];
  manualOnly: true;
  inMemoryOnly: true;
  publicLaunchPerformedByCode: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicUrlFetched: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  fileWritten: false;
  generatedAt: string;
};

const publicLaunchDayChecks: Array<[string, string, TeoyubePublicLaunchDayPhase]> = [
  ["public_app_load_manual_check", "Public app load manually checked", "public_launch_observation"],
  ["home_route_manual_check", "Home route manually checked", "public_surface_monitoring"],
  ["canon_route_manual_check", "Canon route manually checked", "public_surface_monitoring"],
  ["daily_word_route_manual_check", "Daily Word route manually checked", "public_surface_monitoring"],
  ["prayer_route_manual_check", "Prayer route manually checked", "public_surface_monitoring"],
  ["calling_compass_route_manual_check", "Calling Compass route manually checked", "public_surface_monitoring"],
  ["tig_route_manual_check", "TIG route manually checked", "public_surface_monitoring"],
  ["privacy_terms_consent_visible", "Privacy, terms, and consent notices visible", "privacy_consent_review"],
  ["sensitive_information_warning_visible", "Sensitive information warning visible", "privacy_consent_review"],
  ["ai_tig_transparency_visible", "AI/TIG transparency visible", "public_communication_review"],
  ["known_limitations_visible", "Known limitations visible", "public_communication_review"],
  ["feedback_instructions_visible", "Feedback instructions visible", "public_feedback_intake"],
  ["scripture_anchors_present", "Scripture anchors present", "public_surface_monitoring"],
  ["explanation_paths_present", "Explanation paths present", "public_surface_monitoring"],
  ["fallback_behavior_safe", "Fallback behavior safe", "public_surface_monitoring"],
  ["debug_payloads_hidden", "Debug payloads hidden", "public_surface_monitoring"],
  ["mobile_layout_usable", "Mobile layout usable", "public_surface_monitoring"],
  ["accessibility_blockers_absent", "Accessibility blockers absent", "public_surface_monitoring"],
  ["disabled_services_remain_disabled", "Disabled services remain disabled", "production_service_review"],
  ["pause_rollback_owner_available", "Owner available for pause/rollback decisions", "pause_rollback_review"]
];

export function getPublicLaunchDayMonitoringChecklist(): TeoyubePublicLaunchDayMonitoringCheck[] {
  return publicLaunchDayChecks.map(([id, label, phase]) => ({
    id,
    label,
    phase,
    required: true,
    publicLaunchCritical: true,
    details: label
  }));
}

export function createPublicLaunchDayMonitoringRun(input: Partial<TeoyubePublicLaunchDayMonitoringRun> = {}): TeoyubePublicLaunchDayMonitoringRun {
  return {
    id: input.id || "public_launch_day_monitoring_run_6_2",
    label: input.label || "Public Launch Day Monitoring Run",
    checks: input.checks || getPublicLaunchDayMonitoringChecklist(),
    results: input.results || [],
    manualOnly: true,
    inMemoryOnly: true,
    publicLaunchPerformedByCode: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    fileWritten: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function recordPublicLaunchDayMonitoringResult(
  run: TeoyubePublicLaunchDayMonitoringRun,
  result: Partial<TeoyubePublicLaunchDayMonitoringResult> & { checkId: string }
): TeoyubePublicLaunchDayMonitoringRun {
  const check = run.checks.find((entry) => entry.id === result.checkId);
  const status = result.status || "pass";
  return {
    ...run,
    results: [
      ...run.results,
      {
        id: result.id || `public_launch_day_result_${run.results.length + 1}`,
        checkId: result.checkId,
        phase: result.phase || check?.phase || "unknown",
        status,
        notes: result.notes || [],
        blocker: result.blocker ?? status === "fail",
        warning: result.warning ?? status === "warning",
        recordedManually: true,
        generatedAt: result.generatedAt || new Date().toISOString()
      }
    ]
  };
}

function blocker(id: string, label: string, phase: TeoyubePublicLaunchDayPhase, reason: string): TeoyubePublicLaunchDayBlocker {
  return { id, label, phase, severity: "critical", reason, requiredAction: "Pause public launch expansion and complete manual owner review." };
}

export function getPublicLaunchDayMonitoringBlockers(run: TeoyubePublicLaunchDayMonitoringRun): TeoyubePublicLaunchDayBlocker[] {
  return [
    ...run.results.filter((entry) => entry.blocker).map((entry) => blocker(`public_launch_day_${entry.checkId}`, entry.checkId.replace(/_/g, " "), entry.phase, entry.notes.join(" ") || "Public launch day monitoring check failed.")),
    run.publicLaunchPerformedByCode ? blocker("public_launch_day_code_launched", "Public launch performed by code", "public_launch_observation", "6.2 must not perform public launch.") : undefined,
    run.usersContacted ? blocker("public_launch_day_users_contacted", "Users contacted by code", "public_launch_observation", "6.2 must not contact users.") : undefined,
    run.feedbackCollectedAutomatically ? blocker("public_launch_day_feedback_auto_collected", "Feedback collected automatically", "public_feedback_intake", "Public launch feedback intake must remain manual or explicitly controlled.") : undefined,
    run.publicUrlFetched ? blocker("public_launch_day_url_fetched", "Public URL fetched", "public_surface_monitoring", "Public launch day monitoring must not fetch public URLs.") : undefined,
    run.databaseWritten ? blocker("public_launch_day_database_written", "Database written", "production_service_review", "6.2 must not write databases.") : undefined,
    run.analyticsSent ? blocker("public_launch_day_analytics_sent", "Analytics sent", "production_service_review", "6.2 must not send analytics.") : undefined,
    run.externalServicesCalled ? blocker("public_launch_day_external_service_called", "External service called", "production_service_review", "6.2 must not call external services.") : undefined,
    run.fileWritten ? blocker("public_launch_day_file_written", "File written", "daily_summary", "Monitoring run must remain in memory.") : undefined
  ].filter(Boolean) as TeoyubePublicLaunchDayBlocker[];
}

export function getPublicLaunchDayMonitoringWarnings(run: TeoyubePublicLaunchDayMonitoringRun): TeoyubePublicLaunchDayWarning[] {
  return run.results.filter((entry) => entry.warning).map((entry) => ({
    id: `public_launch_day_warning_${entry.checkId}`,
    label: entry.checkId.replace(/_/g, " "),
    phase: entry.phase,
    severity: "medium",
    message: entry.notes.join(" ") || "Manual public launch day monitoring warning.",
    recommendedAction: "Keep controlled public launch monitoring active and review with owner."
  }));
}

export function createPublicLaunchDayMonitoringDecision(run: TeoyubePublicLaunchDayMonitoringRun): TeoyubePublicLaunchDayDecision {
  const blockers = getPublicLaunchDayMonitoringBlockers(run);
  if (blockers.some((entry) => /rollback|analytics|database|unsafe|url fetched/i.test(`${entry.label} ${entry.reason}`))) return "rollback_recommended";
  if (blockers.length > 0) return "pause_public_promotion";
  if (getPublicLaunchDayMonitoringWarnings(run).length > 0) return "continue_with_warnings";
  return "continue_controlled_public_launch";
}

export function createPublicLaunchDayMonitoringReport(run: TeoyubePublicLaunchDayMonitoringRun = createPublicLaunchDayMonitoringRun()) {
  const blockers = getPublicLaunchDayMonitoringBlockers(run);
  const warnings = getPublicLaunchDayMonitoringWarnings(run);
  const decision = createPublicLaunchDayMonitoringDecision(run);
  const status: TeoyubePublicLaunchDayStatus = blockers.length > 0 ? "blocked" : warnings.length > 0 ? "ready_with_warnings" : "ready";
  return {
    status,
    ready: blockers.length === 0,
    decision,
    run,
    checkCount: run.checks.length,
    resultCount: run.results.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
