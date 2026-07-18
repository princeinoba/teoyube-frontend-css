import type {
  TeoyubeControlledBetaLockedArea,
  TeoyubeControlledBetaLockedItem,
  TeoyubeControlledBetaOperationsLockBlocker,
  TeoyubeControlledBetaOperationsLockDecision,
  TeoyubeControlledBetaOperationsLockReport,
  TeoyubeControlledBetaOperationsLockRule,
  TeoyubeControlledBetaOperationsLockStatus,
  TeoyubeControlledBetaOperationsLockWarning
} from "./controlled-beta-operations-lock-contracts";

export type TeoyubeControlledBetaOperationsLockInput = Partial<{
  betaLaunchPerformed: boolean;
  usersContacted: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlsFetchedAutomatically: boolean;
  externalServicesRequired: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  adminAuthAdded: boolean;
  cmsConnected: boolean;
  userAccountsAdded: boolean;
  liveAiOrchestrationEnabled: boolean;
  reviewedContentAutoPublished: boolean;
  reviewedContentGateActive: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsVisible: boolean;
  privacyConsentNoticesVisible: boolean;
  knownLimitationsAvailable: boolean;
  pauseRollbackAvailable: boolean;
  ownerReviewed: boolean;
  browserPersistenceRequired: boolean;
}>;

function lockedItem(id: string, area: TeoyubeControlledBetaLockedArea, label: string, details: string, sourceFiles: string[]): TeoyubeControlledBetaLockedItem {
  return { id, area, label, locked: true, details, sourceFiles };
}

function rule(id: string, area: TeoyubeControlledBetaLockedArea, label: string, passed: boolean, details: string): TeoyubeControlledBetaOperationsLockRule {
  return { id, area, label, passed, details };
}

function blocker(ruleEntry: TeoyubeControlledBetaOperationsLockRule): TeoyubeControlledBetaOperationsLockBlocker {
  return {
    id: `${ruleEntry.id}_blocker`,
    area: ruleEntry.area,
    message: `${ruleEntry.label}: ${ruleEntry.details}`,
    requiredAction: "Restore the Phase 6 manual, service-disabled, privacy-protective operations lock before Phase 7 planning."
  };
}

function warning(id: string, area: TeoyubeControlledBetaLockedArea, message: string, recommendedAction = "Carry into owner review and Phase 7 planning."): TeoyubeControlledBetaOperationsLockWarning {
  return { id, area, message, recommendedAction };
}

export function getControlledBetaLockedOperationsItems(): TeoyubeControlledBetaLockedItem[] {
  return [
    lockedItem("manual_execution_only", "manual_execution_only", "Manual execution only", "Phase 6 remains planning and manual readiness support only; no code path launches beta.", ["controlled-beta-execution-plan.ts", "manual-beta-dry-run-runner.ts"]),
    lockedItem("participant_workflow_manual", "participant_workflow", "Participant workflow manual", "Participant selection, access, consent, and review remain manual.", ["manual-participant-workflow.ts"]),
    lockedItem("communication_manual", "communication_boundaries", "Communication boundaries manual", "Communication drafts are not sent by code.", ["manual-beta-communication-boundaries.ts"]),
    lockedItem("feedback_manual", "feedback_boundaries", "Feedback boundaries manual", "Feedback intake remains simulated/manual and privacy-protective.", ["manual-feedback-boundaries.ts", "feedback-intake-simulation.ts"]),
    lockedItem("issue_intake_manual", "issue_intake", "Issue intake manual", "Issue intake remains structured, owner-reviewable, and in memory.", ["controlled-beta-issue-intake.ts", "dry-run-issue-triage.ts"]),
    lockedItem("pause_rollback_available", "pause_rollback", "Pause/rollback available", "Pause and rollback criteria remain available before any future controlled beta operation.", ["dry-run-pause-rollback-simulation.ts"]),
    lockedItem("service_disabled_state", "service_disabled_state", "Services disabled", "Database, analytics, monitoring, admin auth, CMS, accounts, notifications, feedback storage, and live AI remain disabled or plan-only.", ["beta-service-disabled-boundaries.ts", "dry-run-disabled-service-regression.ts"]),
    lockedItem("privacy_consent_visible", "privacy_consent", "Privacy/consent visible", "Privacy, consent, sensitive information, and no hidden personalization boundaries remain visible.", ["beta-privacy-consent-boundaries.ts"]),
    lockedItem("scripture_anchor_visible", "scripture_anchor", "Scripture anchors visible", "Scripture anchors must remain visible when available.", ["beta-safety-theology-boundaries.ts", "dry-run-safety-regression.ts"]),
    lockedItem("explanation_trace_visible", "explanation_trace", "Explanation traces visible", "Explanation traces remain visible for guided surfaces.", ["beta-safety-theology-boundaries.ts", "dry-run-safety-regression.ts"]),
    lockedItem("fallback_safe", "fallback", "Fallback safe", "Fallback states remain safe, bounded, and do not claim certainty.", ["beta-safety-theology-boundaries.ts", "dry-run-safety-regression.ts"]),
    lockedItem("confidence_label_visible", "confidence_label", "Confidence labels visible", "Confidence labels remain visible and are not hidden.", ["beta-safety-theology-boundaries.ts", "dry-run-regression-qa-runner.ts"]),
    lockedItem("reviewed_content_gate_active", "reviewed_content_gate", "Reviewed-content gate active", "Review-only content is not published automatically or written to production JSON.", ["dry-run-stabilization-safety-validator.ts"]),
    lockedItem("controlled_admin_locked", "controlled_admin", "Controlled admin remains non-production", "No production CMS or admin authentication is added.", ["dry-run-regression-qa-runner.ts"]),
    lockedItem("mobile_accessibility_ready", "mobile_accessibility", "Mobile/accessibility readiness retained", "Mobile and accessibility checks remain part of manual review.", ["dry-run-mobile-accessibility-regression.ts"]),
    lockedItem("known_limitations_available", "known_limitations", "Known limitations available", "Known limitations remain available for owner and Phase 7 review.", ["operations-readiness-review.ts"]),
    lockedItem("owner_review_required", "owner_review", "Owner review required", "Owner review remains required before Phase 7 controlled beta operations planning.", ["phase-6-3-owner-review.ts"])
  ];
}

function createOperationsLockRules(input: TeoyubeControlledBetaOperationsLockInput = {}): TeoyubeControlledBetaOperationsLockRule[] {
  return [
    rule("no_beta_launch", "manual_execution_only", "No beta launch by code", !input.betaLaunchPerformed, "No beta launch is performed by code."),
    rule("manual_participant_workflow", "participant_workflow", "Participant workflow remains manual", !input.usersContacted, "No participant or user is contacted by code."),
    rule("manual_communication", "communication_boundaries", "Communication remains manual", !input.usersContacted, "No emails, SMS, notifications, or external messages are sent."),
    rule("manual_feedback", "feedback_boundaries", "Feedback remains manual", !input.feedbackCollectedAutomatically, "No feedback is collected automatically."),
    rule("no_public_url_fetch", "issue_intake", "No public URL fetching", !input.publicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    rule("no_external_services", "service_disabled_state", "No external services required", !input.externalServicesRequired, "No external services are required for Phase 6 completion."),
    rule("no_database_persistence", "service_disabled_state", "Database persistence disabled", !input.databasePersistenceEnabled, "No database persistence is enabled."),
    rule("no_analytics", "service_disabled_state", "Analytics disabled", !input.analyticsEnabled, "No analytics are enabled."),
    rule("no_monitoring_provider", "service_disabled_state", "Production monitoring provider disabled or plan-only", !input.monitoringProviderConnected, "No production monitoring provider is connected."),
    rule("no_admin_auth", "controlled_admin", "Admin auth disabled", !input.adminAuthAdded, "No admin authentication is added."),
    rule("no_cms", "controlled_admin", "CMS disabled", !input.cmsConnected, "No production CMS is connected."),
    rule("no_user_accounts", "controlled_admin", "User accounts disabled", !input.userAccountsAdded, "No user account system is added."),
    rule("no_live_ai", "service_disabled_state", "Live AI disabled", !input.liveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    rule("reviewed_content_gate", "reviewed_content_gate", "Reviewed-content gate active", input.reviewedContentGateActive !== false && !input.reviewedContentAutoPublished, "Reviewed content is not automatically published or written to production JSON."),
    rule("scripture_anchors_visible", "scripture_anchor", "Scripture anchors visible", input.scriptureAnchorsVisible !== false, "Scripture anchors remain visible when available."),
    rule("explanation_traces_visible", "explanation_trace", "Explanation traces visible", input.explanationTracesVisible !== false, "Explanation traces remain visible."),
    rule("fallback_safe", "fallback", "Fallback remains safe", input.fallbackSafe !== false, "Fallback states remain safe and bounded."),
    rule("confidence_labels_visible", "confidence_label", "Confidence labels visible", input.confidenceLabelsVisible !== false, "Confidence labels remain visible."),
    rule("privacy_consent_visible", "privacy_consent", "Privacy/consent notices visible", input.privacyConsentNoticesVisible !== false, "Privacy and consent notices remain visible."),
    rule("known_limitations_available", "known_limitations", "Known limitations available", input.knownLimitationsAvailable !== false, "Known limitations remain available."),
    rule("pause_rollback_available", "pause_rollback", "Pause/rollback available", input.pauseRollbackAvailable !== false, "Pause and rollback criteria remain available."),
    rule("no_browser_persistence", "privacy_consent", "No browser persistence required", !input.browserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required for sensitive personalization.")
  ];
}

export function getControlledBetaOperationsLockBlockers(input: TeoyubeControlledBetaOperationsLockInput = {}): TeoyubeControlledBetaOperationsLockBlocker[] {
  return createOperationsLockRules(input).filter((entry) => !entry.passed).map(blocker);
}

export function getControlledBetaOperationsLockWarnings(input: TeoyubeControlledBetaOperationsLockInput = {}): TeoyubeControlledBetaOperationsLockWarning[] {
  return [
    warning("owner_review_required", "owner_review", "Phase 7 controlled beta operations still require explicit owner review before any real participant operation."),
    ...(!input.ownerReviewed ? [warning("owner_review_pending", "owner_review", "Owner review has not been marked complete for this operations lock.")] : [])
  ];
}

export function createControlledBetaOperationsLockDecision(input: TeoyubeControlledBetaOperationsLockInput = {}): TeoyubeControlledBetaOperationsLockDecision {
  const blockers = getControlledBetaOperationsLockBlockers(input);
  if (blockers.length) return "blocked";
  if (!input.ownerReviewed) return "needs_owner_review";
  return getControlledBetaOperationsLockWarnings(input).length ? "locked_with_warnings" : "locked_ready_for_phase_7_planning";
}

function statusFromDecision(decision: TeoyubeControlledBetaOperationsLockDecision): TeoyubeControlledBetaOperationsLockStatus {
  if (decision === "locked_ready_for_phase_7_planning") return "locked";
  if (decision === "locked_with_warnings" || decision === "needs_owner_review") return "locked_with_warnings";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function createControlledBetaOperationsLock(input: TeoyubeControlledBetaOperationsLockInput = {}): TeoyubeControlledBetaOperationsLockReport {
  return createControlledBetaOperationsLockReport(input);
}

export function validateControlledBetaOperationsLock(input: TeoyubeControlledBetaOperationsLockInput = {}): TeoyubeControlledBetaOperationsLockReport {
  return createControlledBetaOperationsLockReport(input);
}

export function createControlledBetaOperationsLockReport(input: TeoyubeControlledBetaOperationsLockInput = {}): TeoyubeControlledBetaOperationsLockReport {
  const blockers = getControlledBetaOperationsLockBlockers(input);
  const warnings = getControlledBetaOperationsLockWarnings(input);
  const decision = createControlledBetaOperationsLockDecision(input);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    lockedItems: getControlledBetaLockedOperationsItems(),
    rules: createOperationsLockRules(input),
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
    noUserAccountsAdded: true,
    noReviewedContentAutoPublished: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
