import type {
  TeoyubeControlledPublicLaunchActivationBlocker,
  TeoyubeControlledPublicLaunchActivationCheck,
  TeoyubeControlledPublicLaunchActivationWarning,
  TeoyubeControlledPublicLaunchWindow
} from "./controlled-public-launch-activation-contracts";

function item(id: string, label: string): TeoyubeControlledPublicLaunchActivationCheck {
  return { id, label, phase: "environment_confirmation", required: true, complete: true, launchCritical: true, details: label };
}

function blocker(id: string, reason: string): TeoyubeControlledPublicLaunchActivationBlocker {
  return { id, label: id.replace(/_/g, " "), phase: "environment_confirmation", severity: "critical", reason, requiredAction: "Update the manual public launch window plan before activation." };
}

export function getControlledPublicLaunchWindowChecklist(): TeoyubeControlledPublicLaunchActivationCheck[] {
  return [
    item("proposed_start_manual", "Proposed start time entered manually"),
    item("proposed_duration_manual", "Proposed public launch duration entered manually"),
    item("owner_available", "Owner availability confirmed"),
    item("support_available", "Support availability confirmed"),
    item("issue_triage_available", "Issue triage availability confirmed"),
    item("rollback_decision_available", "Rollback decision availability confirmed"),
    item("public_communication_timing_ready", "Public communication timing identified"),
    item("public_qa_check_timing_ready", "Public QA check timing identified"),
    item("first_hour_monitoring_timing_ready", "First-hour monitoring timing identified"),
    item("daily_review_timing_ready", "Daily review timing identified"),
    item("known_limitations_ready", "Known limitations available"),
    item("pause_criteria_ready", "Pause criteria available"),
    item("rollback_criteria_ready", "Rollback criteria available")
  ];
}

export function createControlledPublicLaunchWindowPlan(input: Partial<TeoyubeControlledPublicLaunchWindow> = {}): TeoyubeControlledPublicLaunchWindow {
  return {
    id: input.id || "controlled_public_launch_window_6_1",
    label: input.label || "Controlled Public Launch Window Plan",
    proposedStartTime: input.proposedStartTime || "Manual owner-entered public launch start time required",
    proposedPublicLaunchDuration: input.proposedPublicLaunchDuration || "Manual owner-entered public launch duration required",
    ownerAvailable: input.ownerAvailable ?? true,
    supportAvailable: input.supportAvailable ?? true,
    issueTriageAvailable: input.issueTriageAvailable ?? true,
    rollbackDecisionAvailable: input.rollbackDecisionAvailable ?? true,
    publicCommunicationTiming: input.publicCommunicationTiming || "Manual public communication timing required",
    publicQaCheckTiming: input.publicQaCheckTiming || "Manual public QA timing required",
    firstHourMonitoringTiming: input.firstHourMonitoringTiming || "Manual first-hour monitoring timing required",
    dailyReviewTiming: input.dailyReviewTiming || "Manual daily public launch review timing required",
    knownLimitations: input.knownLimitations || ["Public users must not submit sensitive personal information."],
    pauseCriteria: input.pauseCriteria || ["Pause if Scripture anchors, explanation paths, fallback, consent, privacy, mobile, accessibility, or service safety is compromised."],
    rollbackCriteria: input.rollbackCriteria || ["Rollback review if a public-launch-critical issue remains unresolved after owner review."],
    manualEntryOnly: true,
    scheduledByCode: false,
    calendarInvitesSent: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getControlledPublicLaunchWindowBlockers(plan: TeoyubeControlledPublicLaunchWindow): TeoyubeControlledPublicLaunchActivationBlocker[] {
  return [
    !plan.ownerAvailable ? blocker("controlled_public_window_owner_unavailable", "Owner must be available during the public launch window.") : undefined,
    !plan.supportAvailable ? blocker("controlled_public_window_support_unavailable", "Support must be available during the public launch window.") : undefined,
    !plan.issueTriageAvailable ? blocker("controlled_public_window_triage_unavailable", "Issue triage must be available during the public launch window.") : undefined,
    !plan.rollbackDecisionAvailable ? blocker("controlled_public_window_rollback_unavailable", "Rollback decision owner must be available.") : undefined,
    plan.knownLimitations.length === 0 ? blocker("controlled_public_window_limitations_missing", "Known limitations must be included.") : undefined,
    plan.pauseCriteria.length === 0 ? blocker("controlled_public_window_pause_missing", "Pause criteria must be included.") : undefined,
    plan.rollbackCriteria.length === 0 ? blocker("controlled_public_window_rollback_missing", "Rollback criteria must be included.") : undefined,
    plan.scheduledByCode ? blocker("controlled_public_window_scheduled_by_code", "Launch window module must not schedule anything.") : undefined,
    plan.calendarInvitesSent ? blocker("controlled_public_window_calendar_sent", "Launch window module must not send calendar invites.") : undefined,
    plan.usersContacted ? blocker("controlled_public_window_users_contacted", "Launch window module must not contact users.") : undefined
  ].filter(Boolean) as TeoyubeControlledPublicLaunchActivationBlocker[];
}

export function getControlledPublicLaunchWindowWarnings(plan: TeoyubeControlledPublicLaunchWindow): TeoyubeControlledPublicLaunchActivationWarning[] {
  return [
    {
      id: "controlled_public_window_manual_times",
      label: "Manual times required",
      phase: "environment_confirmation",
      severity: "medium",
      message: `${plan.proposedStartTime}; ${plan.proposedPublicLaunchDuration}.`,
      recommendedAction: "Owner should enter final times manually outside code."
    }
  ];
}

export function validateControlledPublicLaunchWindow(plan: TeoyubeControlledPublicLaunchWindow) {
  const blockers = getControlledPublicLaunchWindowBlockers(plan);
  return { valid: blockers.length === 0, blockers, warnings: getControlledPublicLaunchWindowWarnings(plan) };
}

export function createControlledPublicLaunchWindowReport(plan: TeoyubeControlledPublicLaunchWindow = createControlledPublicLaunchWindowPlan()) {
  const validation = validateControlledPublicLaunchWindow(plan);
  return { valid: validation.valid, ready: validation.valid, plan, blockers: validation.blockers, warnings: validation.warnings, noSchedulingPerformed: true, noCalendarInvitesSent: true, noUsersContacted: true, generatedAt: new Date().toISOString() };
}
