import type {
  TeoyubeLimitedSoftLaunchBlocker,
  TeoyubeLimitedSoftLaunchChecklistItem,
  TeoyubeLimitedSoftLaunchDecision,
  TeoyubeLimitedSoftLaunchExecutionPlan,
  TeoyubeLimitedSoftLaunchExecutionReport,
  TeoyubeLimitedSoftLaunchNextAction,
  TeoyubeLimitedSoftLaunchPhase,
  TeoyubeLimitedSoftLaunchWarning
} from "./limited-soft-launch-execution-contracts";
import { createParticipantScopePlan } from "./limited-soft-launch-participant-scope";
import { getExcludedSoftLaunchSurfaces, getIncludedSoftLaunchSurfaces } from "./limited-soft-launch-surface-scope";

function checklistItem(
  id: string,
  label: string,
  phase: TeoyubeLimitedSoftLaunchPhase,
  complete: boolean,
  details: string,
  launchCritical = false
): TeoyubeLimitedSoftLaunchChecklistItem {
  return {
    id,
    label,
    phase,
    required: true,
    complete,
    launchCritical,
    details,
    nextAction: complete ? undefined : "Complete this item before limited soft launch plan review."
  };
}

export function getLimitedSoftLaunchPhases(): TeoyubeLimitedSoftLaunchPhase[] {
  return [
    "pre_launch_review",
    "limited_access_setup",
    "launch_day_review",
    "active_soft_launch",
    "feedback_review",
    "issue_triage",
    "pause_or_rollback_review",
    "completion_review"
  ];
}

export function getLimitedSoftLaunchExecutionChecklist(
  plan?: Pick<TeoyubeLimitedSoftLaunchExecutionPlan, "scope" | "includedSurfaces" | "ownerReviewRequired">
): TeoyubeLimitedSoftLaunchChecklistItem[] {
  const scope = plan?.scope || createParticipantScopePlan();
  const includedSurfaces = plan?.includedSurfaces || getIncludedSoftLaunchSurfaces();

  return [
    checklistItem("purpose_defined", "Soft launch purpose defined", "pre_launch_review", true, "Purpose is documented."),
    checklistItem("participant_scope_defined", "Participant scope defined", "limited_access_setup", scope.publicLaunchExcluded && scope.automatedInvitationsDisabled, "Participant scope excludes public launch and automated invitations.", true),
    checklistItem("surface_scope_defined", "Surface scope defined", "pre_launch_review", includedSurfaces.length >= 13, "Included surfaces are documented.", true),
    checklistItem("known_limitations_documented", "Known limitations documented", "pre_launch_review", true, "Known limitations are listed."),
    checklistItem("launch_window_planned", "Launch window planned", "launch_day_review", true, "Start, end, and owner approval policies are documented."),
    checklistItem("participant_guidance_prepared", "Participant guidance prepared", "limited_access_setup", true, "Participant guidance is drafted but not sent."),
    checklistItem("feedback_workflow_defined", "Manual feedback workflow defined", "feedback_review", true, "Feedback remains manual and privacy-safe.", true),
    checklistItem("issue_triage_defined", "Issue triage process defined", "issue_triage", true, "Issue triage prioritizes launch-critical categories.", true),
    checklistItem("safety_loop_defined", "Safety review loop defined", "active_soft_launch", true, "Safety review loop is documented.", true),
    checklistItem("pause_criteria_defined", "Pause criteria defined", "pause_or_rollback_review", true, "Pause criteria are documented.", true),
    checklistItem("rollback_criteria_defined", "Rollback criteria defined", "pause_or_rollback_review", true, "Rollback criteria are documented.", true),
    checklistItem("completion_criteria_defined", "Completion criteria defined", "completion_review", true, "Completion criteria are documented."),
    checklistItem("owner_review_required", "Owner review required", "pre_launch_review", plan?.ownerReviewRequired ?? true, "Owner review remains required.", true),
    checklistItem("no_launch_actions_performed", "No launch actions performed", "pre_launch_review", true, "This planning module performs no launch actions.", true)
  ];
}

export function createLimitedSoftLaunchExecutionPlan(): TeoyubeLimitedSoftLaunchExecutionPlan {
  const scope = createParticipantScopePlan({
    includedSurfaceIds: getIncludedSoftLaunchSurfaces().map((entry) => entry.id),
    excludedSurfaceIds: getExcludedSoftLaunchSurfaces().map((entry) => entry.id)
  });
  const includedSurfaces = getIncludedSoftLaunchSurfaces();
  const excludedSurfaces = getExcludedSoftLaunchSurfaces();

  return {
    id: "limited_soft_launch_execution_plan_3_1",
    label: "Soft Launch Preparation 3.1 - Limited Soft Launch Execution Plan",
    purpose: "Prepare a controlled, safe, Scripture-anchored, consent-aware, manually reviewed limited soft launch plan without launching.",
    status: "ready",
    scope,
    phases: getLimitedSoftLaunchPhases(),
    includedSurfaces,
    excludedSurfaces,
    knownLimitations: [
      "Actual soft launch is not performed in this step.",
      "No real users are contacted in this step.",
      "Real feedback is not collected in this step.",
      "Production database persistence, external analytics, live AI orchestration, service workers, native mobile builds, paid infrastructure, and monitoring providers remain disconnected."
    ],
    launchWindowPlan: {
      plannedDurationDays: 7,
      startPolicy: "manual_owner_approval_only",
      endPolicy: "manual_completion_review_only",
      ownerApprovalRequired: true
    },
    participantGuidance: [
      "Invite only owner-approved participants in a later step.",
      "Tell participants not to submit sensitive personal information.",
      "Tell participants to focus on Scripture anchors, explanation paths, fallback, consent, mobile, accessibility, and clarity."
    ],
    manualFeedbackWorkflow: [
      "Collect feedback manually only after owner approval.",
      "Use redacted notes.",
      "Do not send analytics or write feedback to a production database."
    ],
    issueTriageProcess: [
      "Treat Scripture anchor, explanation path, fallback, consent, privacy, debug exposure, mobile, and accessibility issues as high priority.",
      "Pause or rollback on launch-critical safety issues."
    ],
    safetyReviewLoop: [
      "Review safety feedback daily.",
      "Keep Scripture anchoring, explanation paths, fallback, consent, and confidence labels visible.",
      "Avoid divine certainty claims."
    ],
    pauseCriteria: [
      "Missing Scripture anchor",
      "Missing explanation path",
      "Unsafe fallback",
      "Missing consent controls",
      "Debug payload exposed",
      "Critical mobile or accessibility blocker",
      "Privacy concern"
    ],
    rollbackCriteria: [
      "App unavailable",
      "Privacy concern",
      "Debug payload exposed",
      "Unsafe fallback",
      "Consent controls missing",
      "Scripture anchors missing"
    ],
    completionCriteria: [
      "No launch-critical blockers remain.",
      "Feedback is reviewed and redacted.",
      "Owner review confirms continue, pause, rollback, or next-step readiness.",
      "Scripture, explanation, fallback, consent, mobile, accessibility, and privacy boundaries remain stable."
    ],
    risks: [
      {
        id: "spiritual_guidance_confusion",
        label: "Confusing spiritual guidance",
        severity: "high",
        mitigation: "Keep responses Scripture-anchored, confidence-aware, and owner reviewed."
      },
      {
        id: "privacy_feedback_risk",
        label: "Sensitive feedback risk",
        severity: "critical",
        mitigation: "Do not request sensitive personal information; redact notes and avoid raw text storage."
      }
    ],
    checklist: getLimitedSoftLaunchExecutionChecklist({ scope, includedSurfaces, ownerReviewRequired: true }),
    ownerReviewRequired: true,
    actualLaunchPerformed: false,
    usersContacted: false,
    realFeedbackCollected: false,
    previewUrlFetched: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    generatedAt: new Date().toISOString()
  };
}

export function getLimitedSoftLaunchBlockers(plan: TeoyubeLimitedSoftLaunchExecutionPlan): TeoyubeLimitedSoftLaunchBlocker[] {
  const checklistBlockers = plan.checklist
    .filter((entry) => entry.required && entry.launchCritical && !entry.complete)
    .map((entry) => ({
      id: `limited_soft_launch_plan_${entry.id}`,
      label: entry.label,
      phase: entry.phase,
      reason: entry.details,
      requiredAction: entry.nextAction || "Complete this limited soft launch planning item.",
      severity: "critical" as const
    }));
  const actionBlockers = [
    plan.actualLaunchPerformed ? "Actual launch must not be performed in 3.1." : "",
    plan.usersContacted ? "Users must not be contacted in 3.1." : "",
    plan.realFeedbackCollected ? "Real feedback must not be collected in 3.1." : "",
    plan.previewUrlFetched ? "Code must not fetch preview URLs in 3.1." : "",
    plan.databaseWritten ? "Production database writes must remain disabled." : "",
    plan.analyticsSent ? "External analytics must not be sent." : "",
    plan.externalServicesCalled ? "External services must not be called." : ""
  ].filter(Boolean).map((reason, index) => ({
    id: `limited_soft_launch_plan_action_blocker_${index + 1}`,
    label: "Restricted action attempted",
    phase: "pre_launch_review" as const,
    reason,
    requiredAction: "Remove restricted action before proceeding.",
    severity: "critical" as const
  }));

  return [...checklistBlockers, ...actionBlockers];
}

export function getLimitedSoftLaunchWarnings(plan: TeoyubeLimitedSoftLaunchExecutionPlan): TeoyubeLimitedSoftLaunchWarning[] {
  return [
    {
      id: "limited_soft_launch_manual_qa_required",
      label: "Manual QA required",
      phase: "pre_launch_review",
      message: "This plan prepares soft launch execution but does not complete manual QA.",
      recommendedAction: "Complete owner review and manual QA before inviting real users."
    },
    ...plan.includedSurfaces.map((surface) => ({
      id: `limited_soft_launch_surface_${surface.id}_qa`,
      label: `${surface.label} manual QA`,
      phase: "pre_launch_review" as const,
      message: `${surface.label} needs final manual QA before actual invitation.`,
      recommendedAction: "Review mobile, accessibility, Scripture, explanation, fallback, consent, and privacy states."
    }))
  ];
}

export function createLimitedSoftLaunchExecutionDecision(
  plan: TeoyubeLimitedSoftLaunchExecutionPlan
): TeoyubeLimitedSoftLaunchDecision {
  const blockers = getLimitedSoftLaunchBlockers(plan);
  const warnings = getLimitedSoftLaunchWarnings(plan);

  if (blockers.some((entry) => entry.reason.toLowerCase().includes("scripture") || entry.reason.toLowerCase().includes("fallback") || entry.reason.toLowerCase().includes("consent"))) {
    return "needs_safety_review";
  }
  if (blockers.some((entry) => entry.reason.toLowerCase().includes("surface") || entry.reason.toLowerCase().includes("qa"))) {
    return "needs_qa_review";
  }
  if (blockers.length > 0) return "blocked";
  if (warnings.length > 0 || plan.ownerReviewRequired) return "ready_after_owner_review";
  return "ready_for_limited_soft_launch_plan_review";
}

export function createLimitedSoftLaunchExecutionReport(
  plan: TeoyubeLimitedSoftLaunchExecutionPlan = createLimitedSoftLaunchExecutionPlan()
): TeoyubeLimitedSoftLaunchExecutionReport {
  const blockers = getLimitedSoftLaunchBlockers(plan);
  const warnings = getLimitedSoftLaunchWarnings(plan);
  const decision = createLimitedSoftLaunchExecutionDecision(plan);
  const checklistCount = plan.checklist.length;
  const completedChecklistCount = plan.checklist.filter((entry) => entry.complete).length;
  const nextActions: TeoyubeLimitedSoftLaunchNextAction[] = [
    {
      id: "owner_review",
      label: "Complete owner review before inviting users",
      phase: "pre_launch_review",
      requiredBeforeActualSoftLaunch: true,
      ownerReviewRequired: true
    },
    {
      id: "final_soft_launch_readiness_package",
      label: "Prepare Soft Launch Preparation 3.3 final readiness package and go/no-go",
      phase: "completion_review",
      requiredBeforeActualSoftLaunch: true,
      ownerReviewRequired: true
    }
  ];

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0,
    decision,
    plan,
    checklistCount,
    completedChecklistCount,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    nextActions,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollected: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
