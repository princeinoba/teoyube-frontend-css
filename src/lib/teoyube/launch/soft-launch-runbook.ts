import { createSoftLaunchGoNoGoReport } from "./soft-launch-go-no-go";
import type {
  TeoyubeSoftLaunchCommunicationItem,
  TeoyubeSoftLaunchCompletionDecision,
  TeoyubeSoftLaunchDailyReviewItem,
  TeoyubeSoftLaunchOperatingWindow,
  TeoyubeSoftLaunchParticipantGroup,
  TeoyubeSoftLaunchRollbackTrigger,
  TeoyubeSoftLaunchRunbookChecklist,
  TeoyubeSoftLaunchRunbookPhase,
  TeoyubeSoftLaunchRunbookReport,
  TeoyubeSoftLaunchRunbookStatus,
  TeoyubeSoftLaunchRunbookStep,
  TeoyubeSoftLaunchRisk,
  TeoyubeSoftLaunchSupportRole
} from "./soft-launch-runbook-contracts";

export type TeoyubeSoftLaunchRunbookState = {
  previewDeploymentReviewComplete?: boolean;
  softLaunchGoNoGoAcceptable?: boolean;
  manualApprovalComplete?: boolean;
  softLaunchScopeDocumented?: boolean;
  knownLimitationsDocumented?: boolean;
  rollbackCriteriaDocumented?: boolean;
  feedbackIntakeReady?: boolean;
  externalAnalyticsDisabled?: boolean;
  productionPersistenceDisabled?: boolean;
  liveAiDisabled?: boolean;
  scriptureAnchoringRequired?: boolean;
  explanationPathRequired?: boolean;
  fallbackPathEnabled?: boolean;
  consentControlsEnabled?: boolean;
  launchDayAppLoads?: boolean;
  launchDaySurfacesLoad?: boolean;
  launchDayMobileUsable?: boolean;
  launchDayScriptureVisible?: boolean;
  launchDayExplanationVisible?: boolean;
  launchDayFallbackSafe?: boolean;
  launchDayConsentAvailable?: boolean;
  launchDayFeedbackInstructionsVisible?: boolean;
  launchDaySafeErrors?: boolean;
  launchDayDebugHidden?: boolean;
  activeFeedbackManual?: boolean;
  activeIssueTriageReady?: boolean;
  activeSafetyReviewReady?: boolean;
  activeMobileAccessibilityReviewReady?: boolean;
  activeBlockerDocumentationReady?: boolean;
  activeContinuePauseRollbackDecisionReady?: boolean;
};

function value(state: TeoyubeSoftLaunchRunbookState, key: keyof TeoyubeSoftLaunchRunbookState): boolean {
  return state[key] !== false;
}

function step(
  id: string,
  label: string,
  phase: TeoyubeSoftLaunchRunbookPhase,
  complete: boolean,
  details: string,
  safetyCritical = false
): TeoyubeSoftLaunchRunbookStep {
  return {
    id,
    label,
    phase,
    status: complete ? "ready" : safetyCritical ? "blocked" : "needs_review",
    required: true,
    complete,
    manualOnly: true,
    safetyCritical,
    details,
    nextAction: complete ? undefined : "Complete this manual runbook item before soft launch."
  };
}

export function getSoftLaunchRunbookPhases(): TeoyubeSoftLaunchRunbookPhase[] {
  return [
    "pre_soft_launch",
    "launch_day",
    "active_soft_launch",
    "daily_review",
    "issue_triage",
    "rollback_review",
    "completion_review"
  ];
}

export function getSoftLaunchPreLaunchChecklist(state: TeoyubeSoftLaunchRunbookState = {}): TeoyubeSoftLaunchRunbookStep[] {
  return [
    step("preview_review_complete", "Confirm preview deployment review is complete", "pre_soft_launch", value(state, "previewDeploymentReviewComplete"), "Preview deployment review must be complete."),
    step("go_no_go_acceptable", "Confirm soft launch go/no-go decision is acceptable", "pre_soft_launch", value(state, "softLaunchGoNoGoAcceptable") && createSoftLaunchGoNoGoReport().ready, "Soft launch go/no-go should be acceptable."),
    step("manual_approval_complete", "Confirm manual approval is complete", "pre_soft_launch", value(state, "manualApprovalComplete"), "Manual approval should be recorded before actual soft launch."),
    step("scope_documented", "Confirm soft launch scope is documented", "pre_soft_launch", value(state, "softLaunchScopeDocumented"), "Soft launch scope must be documented."),
    step("known_limitations_documented", "Confirm known limitations are documented", "pre_soft_launch", value(state, "knownLimitationsDocumented"), "Known limitations must be visible to reviewers."),
    step("rollback_criteria_documented", "Confirm rollback criteria are documented", "pre_soft_launch", value(state, "rollbackCriteriaDocumented"), "Rollback criteria must be documented."),
    step("feedback_intake_ready", "Confirm feedback intake method is ready", "pre_soft_launch", value(state, "feedbackIntakeReady"), "Feedback intake remains manual and privacy-safe."),
    step("no_external_analytics", "Confirm no external analytics sending", "pre_soft_launch", value(state, "externalAnalyticsDisabled"), "External analytics sending must remain disabled.", true),
    step("no_production_persistence", "Confirm no production persistence", "pre_soft_launch", value(state, "productionPersistenceDisabled"), "Production database persistence must remain disabled.", true),
    step("no_live_ai", "Confirm no live AI orchestration", "pre_soft_launch", value(state, "liveAiDisabled"), "Live AI orchestration must remain disabled.", true),
    step("scripture_required", "Confirm Scripture anchoring required", "pre_soft_launch", value(state, "scriptureAnchoringRequired"), "Every usable response must remain Scripture anchored.", true),
    step("explanation_required", "Confirm explanation path required", "pre_soft_launch", value(state, "explanationPathRequired"), "Explanation paths must remain visible.", true),
    step("fallback_enabled", "Confirm fallback path enabled", "pre_soft_launch", value(state, "fallbackPathEnabled"), "Fallback path must remain enabled.", true),
    step("consent_enabled", "Confirm consent controls enabled", "pre_soft_launch", value(state, "consentControlsEnabled"), "Consent controls must remain available.", true)
  ];
}

export function getSoftLaunchDayChecklist(state: TeoyubeSoftLaunchRunbookState = {}): TeoyubeSoftLaunchRunbookStep[] {
  return [
    step("app_loads", "Verify app loads", "launch_day", value(state, "launchDayAppLoads"), "App availability must be checked manually."),
    step("surfaces_load", "Verify main surfaces load", "launch_day", value(state, "launchDaySurfacesLoad"), "Main surfaces should render."),
    step("mobile_layout", "Verify mobile layout", "launch_day", value(state, "launchDayMobileUsable"), "Mobile layout should be usable."),
    step("scripture_anchors", "Verify Scripture anchors", "launch_day", value(state, "launchDayScriptureVisible"), "Scripture anchors must be visible.", true),
    step("explanation_paths", "Verify explanation paths", "launch_day", value(state, "launchDayExplanationVisible"), "Explanation paths must be visible.", true),
    step("fallback_behavior", "Verify fallback behavior", "launch_day", value(state, "launchDayFallbackSafe"), "Fallback behavior must be safe.", true),
    step("consent_controls", "Verify consent controls", "launch_day", value(state, "launchDayConsentAvailable"), "Consent controls must be available.", true),
    step("feedback_instructions", "Verify feedback instructions", "launch_day", value(state, "launchDayFeedbackInstructionsVisible"), "Feedback instructions should be visible."),
    step("safe_error_states", "Verify safe error states", "launch_day", value(state, "launchDaySafeErrors"), "Error states should be safe and understandable."),
    step("debug_hidden", "Verify debug UI hidden", "launch_day", value(state, "launchDayDebugHidden"), "Debug UI must be hidden from normal users.", true)
  ];
}

export function getActiveSoftLaunchChecklist(state: TeoyubeSoftLaunchRunbookState = {}): TeoyubeSoftLaunchRunbookStep[] {
  return [
    step("collect_feedback_manually", "Collect feedback manually", "active_soft_launch", value(state, "activeFeedbackManual"), "Feedback remains manual only."),
    step("triage_issues", "Triage issues", "issue_triage", value(state, "activeIssueTriageReady"), "Issues should be triaged daily."),
    step("review_safety_concerns", "Review safety concerns", "active_soft_launch", value(state, "activeSafetyReviewReady"), "Safety concerns require manual review."),
    step("review_mobile_accessibility", "Review mobile and accessibility issues", "active_soft_launch", value(state, "activeMobileAccessibilityReviewReady"), "Mobile and accessibility concerns should be reviewed."),
    step("document_blockers", "Document blockers", "issue_triage", value(state, "activeBlockerDocumentationReady"), "Blockers should be documented without storing raw sensitive text."),
    step("continue_pause_rollback_decision", "Decide whether to continue, pause, or rollback", "rollback_review", value(state, "activeContinuePauseRollbackDecisionReady"), "Continue, pause, or rollback decisions remain manual.")
  ];
}

export function getDailySoftLaunchReviewChecklist(): TeoyubeSoftLaunchDailyReviewItem[] {
  return [
    { id: "app_availability", label: "App availability", required: true, details: "Confirm the app remains available." },
    { id: "surface_issues", label: "Surface issues", required: true, details: "Review surface-specific feedback." },
    { id: "mobile_issues", label: "Mobile issues", required: true, details: "Review mobile layout concerns." },
    { id: "accessibility_issues", label: "Accessibility issues", required: true, details: "Review accessibility concerns." },
    { id: "scripture_anchor_issues", label: "Scripture anchor issues", required: true, details: "Treat missing Scripture anchors as launch-critical." },
    { id: "explanation_path_issues", label: "Explanation path issues", required: true, details: "Treat missing explanation paths as launch-critical." },
    { id: "fallback_issues", label: "Fallback issues", required: true, details: "Review fallback safety." },
    { id: "consent_issues", label: "Consent issues", required: true, details: "Review consent control issues." }
  ];
}

export function getSoftLaunchRollbackReviewChecklist(): TeoyubeSoftLaunchRollbackTrigger[] {
  return [
    { id: "missing_scripture", label: "Missing Scripture anchors", category: "scripture_anchor", severity: "critical", requiredAction: "Pause sharing and restore Scripture anchoring before continuing." },
    { id: "missing_explanation", label: "Missing explanation paths", category: "explanation_path", severity: "high", requiredAction: "Pause affected surface and restore explanation path." },
    { id: "unsafe_fallback", label: "Unsafe fallback behavior", category: "fallback", severity: "critical", requiredAction: "Rollback affected fallback path." },
    { id: "missing_consent", label: "Missing consent controls", category: "consent", severity: "critical", requiredAction: "Pause personalization surfaces until consent controls are restored." },
    { id: "debug_exposed", label: "Debug data exposed", category: "debug", severity: "critical", requiredAction: "Stop sharing preview and hide debug output." },
    { id: "mobile_accessibility_blocker", label: "Mobile or accessibility blocker", category: "accessibility", severity: "high", requiredAction: "Pause wider sharing until reviewed." }
  ];
}

export function createSoftLaunchRunbook() {
  return {
    id: "soft_launch_runbook_1_8",
    label: "Production Launch Preparation 1.8 Soft Launch Runbook",
    phases: getSoftLaunchRunbookPhases(),
    operatingWindow: {
      id: "limited_manual_review_window",
      label: "Limited Manual Review Window",
      plannedDurationDays: 7,
      startPolicy: "manual_owner_approval_only",
      endPolicy: "manual_completion_review_only",
      notes: ["No launch is performed by this module.", "Feedback intake remains manual and privacy-safe."]
    } satisfies TeoyubeSoftLaunchOperatingWindow,
    participantGroups: [
      {
        id: "owner_internal_review",
        label: "Owner and Internal Reviewers",
        audience: "internal_reviewers",
        maxParticipants: 5,
        guidanceRequired: true,
        notes: ["Use trusted review only until final launch preparation audit is complete."]
      }
    ] satisfies TeoyubeSoftLaunchParticipantGroup[],
    supportRoles: [
      {
        id: "owner_reviewer",
        label: "Owner Reviewer",
        responsibilities: ["Review feedback", "Triage blockers", "Approve continue, pause, or rollback decisions"],
        escalationNotes: ["Escalate Scripture, consent, fallback, privacy, mobile, or accessibility issues immediately."]
      }
    ] satisfies TeoyubeSoftLaunchSupportRole[],
    communicationItems: [
      {
        id: "participant_guidance",
        label: "Participant guidance",
        channel: "manual_only",
        phase: "pre_soft_launch",
        prepared: true,
        sent: false,
        messagePurpose: "Explain preview scope, privacy boundaries, and feedback instructions."
      }
    ] satisfies TeoyubeSoftLaunchCommunicationItem[],
    risks: [
      {
        id: "sensitive_feedback_risk",
        label: "Sensitive feedback risk",
        severity: "medium",
        mitigation: "Keep feedback redacted, manual, user-controlled, and disconnected from hidden personalization."
      },
      {
        id: "missing_anchor_risk",
        label: "Missing Scripture or explanation risk",
        severity: "critical",
        mitigation: "Treat missing Scripture anchors or explanation paths as launch-critical."
      }
    ] satisfies TeoyubeSoftLaunchRisk[],
    rollbackTriggers: getSoftLaunchRollbackReviewChecklist(),
    dailyReviewItems: getDailySoftLaunchReviewChecklist()
  };
}

export function getSoftLaunchRunbookBlockers(state: TeoyubeSoftLaunchRunbookState = {}): string[] {
  return [
    ...getSoftLaunchPreLaunchChecklist(state),
    ...getSoftLaunchDayChecklist(state),
    ...getActiveSoftLaunchChecklist(state)
  ]
    .filter((entry) => entry.required && !entry.complete && entry.safetyCritical)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getSoftLaunchRunbookWarnings(state: TeoyubeSoftLaunchRunbookState = {}): string[] {
  return [
    ...getSoftLaunchPreLaunchChecklist(state),
    ...getSoftLaunchDayChecklist(state),
    ...getActiveSoftLaunchChecklist(state)
  ]
    .filter((entry) => entry.required && !entry.complete && !entry.safetyCritical)
    .map((entry) => `${entry.label}: ${entry.details}`)
    .concat([
      "This runbook does not launch Teoyube.",
      "Participant communication is prepared but not sent.",
      "Feedback intake remains manual and in-memory for this step."
    ]);
}

function decide(blockers: string[], warnings: string[]): TeoyubeSoftLaunchCompletionDecision {
  if (blockers.length > 0) return "blocked";
  return warnings.length > 0 ? "ready_for_final_launch_preparation_audit" : "ready_for_final_launch_preparation_audit";
}

export function createSoftLaunchRunbookReport(state: TeoyubeSoftLaunchRunbookState = {}): TeoyubeSoftLaunchRunbookReport {
  const runbook = createSoftLaunchRunbook();
  const checklists: TeoyubeSoftLaunchRunbookChecklist[] = [
    { id: "pre_soft_launch", label: "Pre-soft-launch checklist", phase: "pre_soft_launch", steps: getSoftLaunchPreLaunchChecklist(state) },
    { id: "launch_day", label: "Launch-day checklist", phase: "launch_day", steps: getSoftLaunchDayChecklist(state) },
    { id: "active_soft_launch", label: "Active soft launch checklist", phase: "active_soft_launch", steps: getActiveSoftLaunchChecklist(state) }
  ];
  const blockers = getSoftLaunchRunbookBlockers(state);
  const warnings = getSoftLaunchRunbookWarnings(state);
  const decision = decide(blockers, warnings);
  const status: TeoyubeSoftLaunchRunbookStatus = blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready";

  return {
    status,
    ready: blockers.length === 0,
    decision,
    phases: runbook.phases,
    checklists,
    operatingWindow: runbook.operatingWindow,
    participantGroups: runbook.participantGroups,
    supportRoles: runbook.supportRoles,
    communicationItems: runbook.communicationItems,
    risks: runbook.risks,
    rollbackTriggers: runbook.rollbackTriggers,
    dailyReviewItems: runbook.dailyReviewItems,
    blockers,
    warnings,
    actualLaunchPerformed: false,
    communicationsSent: false,
    generatedAt: new Date().toISOString()
  };
}
