import type {
  TeoyubeControlledBetaOperationsRunbook,
  TeoyubeControlledBetaOperationsRunbookBlocker,
  TeoyubeControlledBetaOperationsRunbookBoundary,
  TeoyubeControlledBetaOperationsRunbookChecklistItem,
  TeoyubeControlledBetaOperationsRunbookDecision,
  TeoyubeControlledBetaOperationsRunbookReport,
  TeoyubeControlledBetaOperationsRunbookSection,
  TeoyubeControlledBetaOperationsRunbookStatus,
  TeoyubeControlledBetaOperationsRunbookWarning
} from "./controlled-beta-operations-runbook-contracts";

export type TeoyubeControlledBetaOperationsRunbookInput = Partial<{
  ownerApproved: boolean;
  betaLaunchPerformed: boolean;
  usersContacted: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlsFetchedAutomatically: boolean;
  externalServicesRequired: boolean;
  servicesEnabled: boolean;
  reviewedContentGateActive: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsVisible: boolean;
  privacyConsentNoticesVisible: boolean;
  knownLimitationsAvailable: boolean;
  pauseRollbackAvailable: boolean;
  browserPersistenceRequired: boolean;
}>;

function checklistItem(id: string, section: TeoyubeControlledBetaOperationsRunbookSection, label: string, details: string): TeoyubeControlledBetaOperationsRunbookChecklistItem {
  return { id, section, label, required: true, complete: true, manualOnly: true, details };
}

function boundary(id: string, section: TeoyubeControlledBetaOperationsRunbookSection, label: string, details: string): TeoyubeControlledBetaOperationsRunbookBoundary {
  return { id, section, label, protected: true, details };
}

function blocker(id: string, section: TeoyubeControlledBetaOperationsRunbookSection, message: string, requiredAction = "Restore the manual controlled beta operations boundary before use."): TeoyubeControlledBetaOperationsRunbookBlocker {
  return { id, section, message, requiredAction };
}

function warning(id: string, section: TeoyubeControlledBetaOperationsRunbookSection, message: string, recommendedAction = "Carry into owner review before any real controlled beta operations."): TeoyubeControlledBetaOperationsRunbookWarning {
  return { id, section, message, recommendedAction };
}

export function getControlledBetaOperationsRunbookSections(): TeoyubeControlledBetaOperationsRunbookSection[] {
  return [
    "pre_session_manual_check",
    "participant_instruction_review",
    "privacy_consent_reminder",
    "known_limitations_review",
    "manual_feedback_review",
    "manual_issue_triage",
    "support_response",
    "pause_rollback_review",
    "service_disabled_check",
    "scripture_explanation_fallback_check",
    "mobile_accessibility_check",
    "post_session_review",
    "owner_review"
  ];
}

export function getPreSessionManualChecklist(): TeoyubeControlledBetaOperationsRunbookChecklistItem[] {
  return [
    checklistItem("owner_approval_before_session", "pre_session_manual_check", "Owner approval confirmed manually", "Owner approval is required before any real controlled beta operation."),
    checklistItem("participant_instructions_reviewed", "participant_instruction_review", "Participant instructions reviewed manually", "Participant instructions remain reviewed and provided manually."),
    checklistItem("privacy_consent_reminder_ready", "privacy_consent_reminder", "Privacy/consent reminder ready", "Consent, privacy, and sensitive information reminders remain visible."),
    checklistItem("known_limitations_ready", "known_limitations_review", "Known limitations ready", "Known limitations are available before any session."),
    checklistItem("service_disabled_check_ready", "service_disabled_check", "Service-disabled check ready", "Database, analytics, monitoring, auth, CMS, accounts, notifications, feedback storage, and live AI remain disabled or plan-only.")
  ];
}

export function getDuringSessionManualChecklist(): TeoyubeControlledBetaOperationsRunbookChecklistItem[] {
  return [
    checklistItem("manual_feedback_review_ready", "manual_feedback_review", "Manual feedback review ready", "Feedback review is manual only and does not collect automatically."),
    checklistItem("manual_issue_triage_ready", "manual_issue_triage", "Manual issue triage ready", "Issues are manually categorized and reviewed."),
    checklistItem("support_response_boundaries_ready", "support_response", "Support response boundaries ready", "Support does not provide professional advice, claim divine certainty, or contact users automatically."),
    checklistItem("scripture_explanation_fallback_ready", "scripture_explanation_fallback_check", "Scripture/explanation/fallback check ready", "Scripture anchors, explanation traces, safe fallback, and confidence labels remain visible."),
    checklistItem("mobile_accessibility_ready", "mobile_accessibility_check", "Mobile/accessibility check ready", "Mobile and accessibility observations remain manual.")
  ];
}

export function getPostSessionManualChecklist(): TeoyubeControlledBetaOperationsRunbookChecklistItem[] {
  return [
    checklistItem("pause_rollback_review_ready", "pause_rollback_review", "Pause/rollback review ready", "Pause and rollback decisions remain manual decision support only."),
    checklistItem("post_session_owner_review_ready", "post_session_review", "Post-session owner review ready", "Owner review summarizes manual feedback, issue triage, support risks, and limitations."),
    checklistItem("owner_review_record_ready", "owner_review", "Owner review record ready", "Owner review is prepared before Phase 7.2 simulation.")
  ];
}

export function getControlledBetaOperationsBoundaries(): TeoyubeControlledBetaOperationsRunbookBoundary[] {
  return [
    boundary("manual_operations_only", "pre_session_manual_check", "Operations remain manual", "No code launches beta or operates participant workflows automatically."),
    boundary("no_automatic_user_contact", "participant_instruction_review", "No automatic user contact", "No email, SMS, notification, or external message is sent by code."),
    boundary("manual_feedback_only", "manual_feedback_review", "Manual feedback only", "No feedback is collected automatically."),
    boundary("manual_issue_triage_only", "manual_issue_triage", "Manual issue triage only", "Issue triage remains in memory and owner-reviewable."),
    boundary("service_disabled", "service_disabled_check", "Services remain disabled", "No external services, database persistence, analytics, monitoring provider, admin auth, CMS, accounts, or live AI are enabled."),
    boundary("reviewed_content_gate", "support_response", "Reviewed content gates remain active", "Reviewed content is not published automatically or written to production JSON."),
    boundary("scripture_explanation_fallback", "scripture_explanation_fallback_check", "Scripture/explanation/fallback preserved", "Scripture anchors, explanation traces, fallback safety, and confidence labels remain visible."),
    boundary("privacy_consent_visible", "privacy_consent_reminder", "Privacy/consent visible", "Privacy, consent, and sensitive information notices remain visible."),
    boundary("pause_rollback_manual", "pause_rollback_review", "Pause/rollback manual", "Pause and rollback are decision support only and are not performed by code.")
  ];
}

export function createControlledBetaOperationsRunbook(input: TeoyubeControlledBetaOperationsRunbookInput = {}): TeoyubeControlledBetaOperationsRunbook {
  return {
    id: "phase_7_1_controlled_beta_operations_runbook",
    label: "Phase 7.1 Controlled Beta Operations Runbook",
    sections: getControlledBetaOperationsRunbookSections(),
    checklist: [
      ...getPreSessionManualChecklist(),
      ...getDuringSessionManualChecklist(),
      ...getPostSessionManualChecklist()
    ],
    boundaries: getControlledBetaOperationsBoundaries(),
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}

export function getControlledBetaOperationsRunbookBlockers(input: TeoyubeControlledBetaOperationsRunbookInput = {}): TeoyubeControlledBetaOperationsRunbookBlocker[] {
  return [
    input.betaLaunchPerformed ? blocker("beta_launch_performed", "pre_session_manual_check", "Beta launch must not be performed by code.") : undefined,
    input.usersContacted ? blocker("users_contacted", "participant_instruction_review", "Users must not be contacted by code.") : undefined,
    input.feedbackCollectedAutomatically ? blocker("feedback_collected_automatically", "manual_feedback_review", "Feedback must not be collected automatically.") : undefined,
    input.publicUrlsFetchedAutomatically ? blocker("public_urls_fetched", "pre_session_manual_check", "Public URLs must not be fetched automatically.") : undefined,
    input.externalServicesRequired || input.servicesEnabled ? blocker("services_enabled", "service_disabled_check", "External services and beta services must remain disabled.") : undefined,
    input.reviewedContentGateActive === false ? blocker("reviewed_content_gate_inactive", "support_response", "Reviewed content gates must remain active.") : undefined,
    input.scriptureAnchorsVisible === false ? blocker("scripture_anchors_hidden", "scripture_explanation_fallback_check", "Scripture anchors must remain visible when available.") : undefined,
    input.explanationTracesVisible === false ? blocker("explanation_traces_hidden", "scripture_explanation_fallback_check", "Explanation traces must remain visible.") : undefined,
    input.fallbackSafe === false ? blocker("fallback_unsafe", "scripture_explanation_fallback_check", "Fallback states must remain safe.") : undefined,
    input.confidenceLabelsVisible === false ? blocker("confidence_labels_hidden", "scripture_explanation_fallback_check", "Confidence labels must remain visible.") : undefined,
    input.privacyConsentNoticesVisible === false ? blocker("privacy_consent_hidden", "privacy_consent_reminder", "Privacy and consent notices must remain visible.") : undefined,
    input.browserPersistenceRequired ? blocker("browser_persistence_required", "privacy_consent_reminder", "Browser persistence must not be required for sensitive personalization.") : undefined
  ].filter(Boolean) as TeoyubeControlledBetaOperationsRunbookBlocker[];
}

export function getControlledBetaOperationsRunbookWarnings(input: TeoyubeControlledBetaOperationsRunbookInput = {}): TeoyubeControlledBetaOperationsRunbookWarning[] {
  return [
    !input.ownerApproved ? warning("owner_approval_pending", "owner_review", "Owner approval has not been marked complete.") : undefined,
    input.knownLimitationsAvailable === false ? warning("known_limitations_missing", "known_limitations_review", "Known limitations should be available before operations.") : undefined,
    input.pauseRollbackAvailable === false ? warning("pause_rollback_missing", "pause_rollback_review", "Pause/rollback criteria should be available before operations.") : undefined
  ].filter(Boolean) as TeoyubeControlledBetaOperationsRunbookWarning[];
}

export function createControlledBetaOperationsRunbookDecision(input: TeoyubeControlledBetaOperationsRunbookInput = {}): TeoyubeControlledBetaOperationsRunbookDecision {
  const blockers = getControlledBetaOperationsRunbookBlockers(input);
  const warnings = getControlledBetaOperationsRunbookWarnings(input);
  if (blockers.length) return "blocked";
  if (!input.ownerApproved) return "needs_owner_review";
  return warnings.length ? "runbook_ready_with_warnings" : "runbook_ready";
}

function statusFromDecision(decision: TeoyubeControlledBetaOperationsRunbookDecision): TeoyubeControlledBetaOperationsRunbookStatus {
  if (decision === "runbook_ready") return "ready";
  if (decision === "runbook_ready_with_warnings" || decision === "needs_owner_review") return "ready_with_warnings";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function validateControlledBetaOperationsRunbook(input: TeoyubeControlledBetaOperationsRunbookInput = {}): TeoyubeControlledBetaOperationsRunbookReport {
  return createControlledBetaOperationsRunbookReport(input);
}

export function createControlledBetaOperationsRunbookReport(input: TeoyubeControlledBetaOperationsRunbookInput = {}): TeoyubeControlledBetaOperationsRunbookReport {
  const blockers = getControlledBetaOperationsRunbookBlockers(input);
  const warnings = getControlledBetaOperationsRunbookWarnings(input);
  const decision = createControlledBetaOperationsRunbookDecision(input);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    runbook: createControlledBetaOperationsRunbook(input),
    blockers,
    warnings,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
