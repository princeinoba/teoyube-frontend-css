export type TeoyubeLimitedSoftLaunchRunbookStep = {
  id: string;
  label: string;
  phase: "preflight" | "launch_day" | "active_monitoring" | "daily_review" | "pause_rollback" | "completion_review";
  required: boolean;
  manualOnly: true;
  complete: boolean;
  details: string;
};

export type TeoyubeLimitedSoftLaunchDayRunbook = {
  id: string;
  label: string;
  preflightChecklist: TeoyubeLimitedSoftLaunchRunbookStep[];
  launchDayChecklist: TeoyubeLimitedSoftLaunchRunbookStep[];
  activeMonitoringChecklist: TeoyubeLimitedSoftLaunchRunbookStep[];
  dailyReviewChecklist: TeoyubeLimitedSoftLaunchRunbookStep[];
  pauseRollbackChecklist: TeoyubeLimitedSoftLaunchRunbookStep[];
  completionReviewChecklist: TeoyubeLimitedSoftLaunchRunbookStep[];
  actionsPerformed: false;
  previewUrlFetched: false;
  messagesSent: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchDayRunbookReport = {
  valid: boolean;
  runbook: TeoyubeLimitedSoftLaunchDayRunbook;
  stepCount: number;
  blockers: string[];
  warnings: string[];
  noActionsPerformed: true;
  noPreviewUrlFetched: true;
  noMessagesSent: true;
  generatedAt: string;
};

function step(id: string, label: string, phase: TeoyubeLimitedSoftLaunchRunbookStep["phase"], details: string): TeoyubeLimitedSoftLaunchRunbookStep {
  return {
    id,
    label,
    phase,
    required: true,
    manualOnly: true,
    complete: true,
    details
  };
}

export function getLimitedSoftLaunchPreflightChecklist(): TeoyubeLimitedSoftLaunchRunbookStep[] {
  return [
    step("owner_approval", "Confirm owner approval", "preflight", "Owner approval must be complete before inviting users."),
    step("environment_safety", "Confirm environment safety", "preflight", "Safe flags remain enabled or disabled as required."),
    step("preview_url_manual_check", "Check preview URL manually", "preflight", "Preview URL checks are manual only; code does not fetch URLs."),
    step("surface_smoke_checks", "Run surface smoke checks manually", "preflight", "Review surfaces before any invitation."),
    step("feedback_workflow_check", "Confirm feedback workflow", "preflight", "Feedback workflow remains manual and privacy-safe.")
  ];
}

export function getLimitedSoftLaunchLaunchDayChecklist(): TeoyubeLimitedSoftLaunchRunbookStep[] {
  return [
    step("launch_day_owner_review", "Owner launch-day review", "launch_day", "Owner confirms no launch-critical blockers."),
    step("scripture_explanation_check", "Verify Scripture and explanation visibility", "launch_day", "Scripture anchors and explanation paths remain visible."),
    step("fallback_consent_check", "Verify fallback and consent states", "launch_day", "Fallback and consent controls remain safe."),
    step("mobile_accessibility_check", "Verify mobile and accessibility", "launch_day", "Manual mobile and accessibility checks pass before invitation.")
  ];
}

export function getLimitedSoftLaunchActiveMonitoringChecklist(): TeoyubeLimitedSoftLaunchRunbookStep[] {
  return [
    step("manual_feedback_review", "Review manual feedback", "active_monitoring", "Review redacted feedback manually."),
    step("issue_triage_check", "Triage issues", "active_monitoring", "Triage Scripture, fallback, consent, privacy, mobile, and accessibility issues."),
    step("safety_review_loop", "Run safety review loop", "active_monitoring", "Review safety concerns daily.")
  ];
}

export function getLimitedSoftLaunchDailyReviewChecklist(): TeoyubeLimitedSoftLaunchRunbookStep[] {
  return [
    step("daily_surface_review", "Daily surface review", "daily_review", "Review surfaces and blockers daily."),
    step("daily_feedback_summary", "Daily feedback summary", "daily_review", "Summarize feedback without raw sensitive text."),
    step("daily_continue_pause_decision", "Daily continue/pause decision", "daily_review", "Owner decides continue, pause, or rollback.")
  ];
}

export function getLimitedSoftLaunchPauseRollbackChecklist(): TeoyubeLimitedSoftLaunchRunbookStep[] {
  return [
    step("pause_if_scripture_missing", "Pause if Scripture anchor is missing", "pause_rollback", "Missing Scripture anchors trigger pause."),
    step("rollback_if_privacy_concern", "Rollback if privacy concern appears", "pause_rollback", "Privacy or debug exposure can trigger rollback."),
    step("pause_mobile_accessibility_blockers", "Pause for mobile/accessibility blockers", "pause_rollback", "Critical usability blockers should stop wider sharing.")
  ];
}

function getCompletionReviewChecklist(): TeoyubeLimitedSoftLaunchRunbookStep[] {
  return [
    step("completion_summary", "Prepare completion summary", "completion_review", "Summarize findings before moving beyond limited soft launch."),
    step("owner_completion_review", "Owner completion review", "completion_review", "Owner confirms whether to continue, pause, or prepare next stage.")
  ];
}

export function createLimitedSoftLaunchDayRunbook(): TeoyubeLimitedSoftLaunchDayRunbook {
  return {
    id: "limited_soft_launch_day_runbook",
    label: "Limited Soft Launch Day Runbook",
    preflightChecklist: getLimitedSoftLaunchPreflightChecklist(),
    launchDayChecklist: getLimitedSoftLaunchLaunchDayChecklist(),
    activeMonitoringChecklist: getLimitedSoftLaunchActiveMonitoringChecklist(),
    dailyReviewChecklist: getLimitedSoftLaunchDailyReviewChecklist(),
    pauseRollbackChecklist: getLimitedSoftLaunchPauseRollbackChecklist(),
    completionReviewChecklist: getCompletionReviewChecklist(),
    actionsPerformed: false,
    previewUrlFetched: false,
    messagesSent: false,
    generatedAt: new Date().toISOString()
  };
}

export function createLimitedSoftLaunchDayRunbookReport(): TeoyubeLimitedSoftLaunchDayRunbookReport {
  const runbook = createLimitedSoftLaunchDayRunbook();
  const steps = [
    ...runbook.preflightChecklist,
    ...runbook.launchDayChecklist,
    ...runbook.activeMonitoringChecklist,
    ...runbook.dailyReviewChecklist,
    ...runbook.pauseRollbackChecklist,
    ...runbook.completionReviewChecklist
  ];
  const blockers = [
    runbook.actionsPerformed ? "Runbook must not perform actions." : "",
    runbook.previewUrlFetched ? "Runbook must not fetch preview URLs." : "",
    runbook.messagesSent ? "Runbook must not send messages." : ""
  ].filter(Boolean);

  return {
    valid: blockers.length === 0 && steps.length > 0,
    runbook,
    stepCount: steps.length,
    blockers,
    warnings: ["This runbook is manual-only and performs no soft launch actions."],
    noActionsPerformed: true,
    noPreviewUrlFetched: true,
    noMessagesSent: true,
    generatedAt: new Date().toISOString()
  };
}
