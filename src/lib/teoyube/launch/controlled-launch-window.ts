import type { TeoyubeControlledLaunchActivationBlocker, TeoyubeControlledLaunchActivationCheck, TeoyubeControlledLaunchActivationWarning, TeoyubeControlledLaunchWindow } from "./controlled-launch-activation-contracts";

function item(id: string, label: string): TeoyubeControlledLaunchActivationCheck {
  return { id, label, phase: "environment_confirmation", required: true, complete: true, launchCritical: true, details: label };
}

function blocker(id: string, reason: string): TeoyubeControlledLaunchActivationBlocker {
  return { id, label: id.replace(/_/g, " "), phase: "environment_confirmation", severity: "critical", reason, requiredAction: "Update the manual launch window plan before activation." };
}

export function getControlledLaunchWindowChecklist(): TeoyubeControlledLaunchActivationCheck[] {
  return [
    item("proposed_start_manual", "Proposed start time entered manually"),
    item("proposed_end_manual", "Proposed end time entered manually"),
    item("owner_available", "Owner availability confirmed"),
    item("support_available", "Support availability confirmed"),
    item("issue_triage_available", "Issue triage availability confirmed"),
    item("rollback_decision_available", "Rollback decision availability confirmed"),
    item("daily_review_time_ready", "Daily review time identified"),
    item("communication_readiness_confirmed", "Communication readiness confirmed"),
    item("known_limitations_ready", "Known limitations available"),
    item("pause_criteria_ready", "Pause criteria available")
  ];
}

export function createControlledLaunchWindowPlan(input: Partial<TeoyubeControlledLaunchWindow> = {}): TeoyubeControlledLaunchWindow {
  return {
    id: input.id || "controlled_launch_window_4_1",
    label: input.label || "Controlled Launch Window Plan",
    proposedStartTime: input.proposedStartTime || "Manual owner-entered start time required",
    proposedEndTime: input.proposedEndTime || "Manual owner-entered end time required",
    ownerAvailable: input.ownerAvailable ?? true,
    supportAvailable: input.supportAvailable ?? true,
    issueTriageAvailable: input.issueTriageAvailable ?? true,
    rollbackDecisionAvailable: input.rollbackDecisionAvailable ?? true,
    dailyReviewTime: input.dailyReviewTime || "Manual daily review time required",
    communicationReady: input.communicationReady ?? true,
    knownLimitations: input.knownLimitations || ["Preview participants must not submit sensitive personal information."],
    pauseCriteria: input.pauseCriteria || ["Pause if Scripture anchors, explanation paths, fallback, consent, privacy, mobile, or accessibility safety is compromised."],
    manualEntryOnly: true,
    scheduledByCode: false,
    calendarInvitesSent: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getControlledLaunchWindowBlockers(plan: TeoyubeControlledLaunchWindow): TeoyubeControlledLaunchActivationBlocker[] {
  return [
    !plan.ownerAvailable ? blocker("controlled_launch_window_owner_unavailable", "Owner must be available during the launch window.") : undefined,
    !plan.supportAvailable ? blocker("controlled_launch_window_support_unavailable", "Support must be available during the launch window.") : undefined,
    !plan.issueTriageAvailable ? blocker("controlled_launch_window_triage_unavailable", "Issue triage must be available during the launch window.") : undefined,
    !plan.rollbackDecisionAvailable ? blocker("controlled_launch_window_rollback_unavailable", "Rollback decision owner must be available.") : undefined,
    !plan.communicationReady ? blocker("controlled_launch_window_communication_not_ready", "Communication readiness must be confirmed.") : undefined,
    plan.scheduledByCode ? blocker("controlled_launch_window_scheduled_by_code", "Launch window module must not schedule anything.") : undefined,
    plan.calendarInvitesSent ? blocker("controlled_launch_window_calendar_sent", "Launch window module must not send calendar invites.") : undefined,
    plan.usersContacted ? blocker("controlled_launch_window_users_contacted", "Launch window module must not contact users.") : undefined
  ].filter(Boolean) as TeoyubeControlledLaunchActivationBlocker[];
}

export function getControlledLaunchWindowWarnings(plan: TeoyubeControlledLaunchWindow): TeoyubeControlledLaunchActivationWarning[] {
  return [
    {
      id: "controlled_launch_window_manual_times",
      label: "Manual times required",
      phase: "environment_confirmation",
      severity: "medium",
      message: `${plan.proposedStartTime}; ${plan.proposedEndTime}.`,
      recommendedAction: "Owner should enter final times manually outside code."
    }
  ];
}

export function validateControlledLaunchWindow(plan: TeoyubeControlledLaunchWindow) {
  const blockers = getControlledLaunchWindowBlockers(plan);
  return { valid: blockers.length === 0, blockers, warnings: getControlledLaunchWindowWarnings(plan) };
}

export function createControlledLaunchWindowReport(plan: TeoyubeControlledLaunchWindow = createControlledLaunchWindowPlan()) {
  const validation = validateControlledLaunchWindow(plan);
  return { valid: validation.valid, ready: validation.valid, plan, blockers: validation.blockers, warnings: validation.warnings, noSchedulingPerformed: true, noCalendarInvitesSent: true, noUsersContacted: true, generatedAt: new Date().toISOString() };
}
