import type {
  TeoyubeControlledBetaOperationsFinalLockBlocker,
  TeoyubeControlledBetaOperationsFinalLockDecision,
  TeoyubeControlledBetaOperationsFinalLockReport,
  TeoyubeControlledBetaOperationsFinalLockRule,
  TeoyubeControlledBetaOperationsFinalLockStatus,
  TeoyubeControlledBetaOperationsFinalLockWarning,
  TeoyubeControlledBetaOperationsLockedArea,
  TeoyubeControlledBetaOperationsLockedItem
} from "./controlled-beta-operations-final-lock-contracts";

export type TeoyubeControlledBetaOperationsFinalLockInput = Partial<{
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

function lockedItem(id: string, area: TeoyubeControlledBetaOperationsLockedArea, label: string, details: string, sourceFiles: string[]): TeoyubeControlledBetaOperationsLockedItem {
  return { id, area, label, locked: true, details, sourceFiles };
}

function rule(id: string, area: TeoyubeControlledBetaOperationsLockedArea, label: string, passed: boolean, details: string): TeoyubeControlledBetaOperationsFinalLockRule {
  return { id, area, label, passed, details };
}

function blocker(ruleEntry: TeoyubeControlledBetaOperationsFinalLockRule): TeoyubeControlledBetaOperationsFinalLockBlocker {
  return {
    id: `${ruleEntry.id}_blocker`,
    area: ruleEntry.area,
    message: `${ruleEntry.label}: ${ruleEntry.details}`,
    requiredAction: "Restore the Phase 7 manual, service-disabled, privacy-protective operations lock before Phase 8 planning."
  };
}

function warning(id: string, area: TeoyubeControlledBetaOperationsLockedArea, message: string, recommendedAction = "Carry into owner review and Phase 8 planning."): TeoyubeControlledBetaOperationsFinalLockWarning {
  return { id, area, message, recommendedAction };
}

export function getControlledBetaOperationsFinalLockedItems(): TeoyubeControlledBetaOperationsLockedItem[] {
  return [
    lockedItem("manual_operations_only", "manual_operations_only", "Manual operations only", "Phase 7 remains a manual controlled beta operations layer; no code launches beta.", ["controlled-beta-operations-runbook.ts", "phase-7-completion-review.ts"]),
    lockedItem("manual_feedback_review", "manual_feedback_review", "Manual feedback review", "Feedback review remains manual, redacted, owner-reviewable, and in memory.", ["manual-beta-feedback-review.ts", "manual-feedback-review-simulation.ts"]),
    lockedItem("manual_support_workflow", "manual_support_workflow", "Manual support workflow", "Support workflows send no automatic messages and remain boundary-safe.", ["beta-support-workflow.ts", "feedback-support-operations-regression.ts"]),
    lockedItem("manual_issue_triage", "manual_issue_triage", "Manual issue triage", "Support issue triage and product stabilization remain manual/in-memory.", ["support-issue-triage.ts", "product-stabilization-queue-manager.ts"]),
    lockedItem("manual_monitoring", "manual_monitoring", "Manual monitoring", "Operational monitoring remains checklist-based and does not connect production monitoring providers.", ["manual-operational-monitoring.ts"]),
    lockedItem("product_stabilization", "product_stabilization", "Product stabilization gated", "Stabilization work remains safe-local only, regression-checked, and owner-reviewable.", ["product-stabilization-pass-runner.ts", "stabilization-regression-qa-runner.ts"]),
    lockedItem("pause_rollback", "pause_rollback", "Pause/rollback retained", "Pause and rollback criteria remain available before any future operation.", ["beta-operations-pause-rollback-review.ts"]),
    lockedItem("service_disabled_state", "service_disabled_state", "Services disabled", "Database, analytics, monitoring, admin auth, CMS, accounts, notifications, feedback storage, and live AI remain disabled or plan-only.", ["service-disabled-operations-regression.ts", "final-phase-7-service-disabled-lock.ts"]),
    lockedItem("privacy_consent", "privacy_consent", "Privacy/consent retained", "Privacy, consent, sensitive information, and no-hidden-personalization boundaries remain visible.", ["scripture-explanation-fallback-operations-regression.ts"]),
    lockedItem("scripture_anchor", "scripture_anchor", "Scripture anchors visible", "Scripture anchors remain visible when available.", ["scripture-explanation-fallback-operations-regression.ts"]),
    lockedItem("explanation_trace", "explanation_trace", "Explanation traces visible", "Explanation traces remain visible for guided surfaces.", ["scripture-explanation-fallback-operations-regression.ts"]),
    lockedItem("fallback", "fallback", "Fallback safe", "Fallback states remain safe, bounded, and do not claim certainty.", ["scripture-explanation-fallback-operations-regression.ts"]),
    lockedItem("confidence_label", "confidence_label", "Confidence labels visible", "Confidence labels remain visible and are not hidden.", ["stabilization-regression-qa-runner.ts"]),
    lockedItem("reviewed_content_gate", "reviewed_content_gate", "Reviewed-content gate active", "Review-only content is not automatically published or written to production JSON.", ["reviewed-content-admin-operations-regression.ts"]),
    lockedItem("controlled_admin", "controlled_admin", "Controlled admin remains non-production", "No production CMS or admin authentication is added.", ["reviewed-content-admin-operations-regression.ts"]),
    lockedItem("mobile_accessibility", "mobile_accessibility", "Mobile/accessibility retained", "Mobile and accessibility checks remain part of manual review.", ["mobile-accessibility-operations-regression.ts"]),
    lockedItem("known_limitations", "known_limitations", "Known limitations available", "Known limitations remain available for owner and Phase 8 review.", ["beta-operations-known-limitations.ts"]),
    lockedItem("owner_review", "owner_review", "Owner review required", "Owner completion review remains required before Phase 7 is considered complete.", ["phase-7-owner-completion-review.ts"])
  ];
}

function createOperationsFinalLockRules(input: TeoyubeControlledBetaOperationsFinalLockInput = {}): TeoyubeControlledBetaOperationsFinalLockRule[] {
  return [
    rule("no_beta_launch", "manual_operations_only", "No beta launch by code", !input.betaLaunchPerformed, "No beta launch is performed by code."),
    rule("no_automatic_user_contact", "manual_support_workflow", "No automatic user contact", !input.usersContacted, "No emails, SMS, notifications, or external messages are sent."),
    rule("manual_feedback_review", "manual_feedback_review", "Feedback review remains manual", !input.feedbackCollectedAutomatically, "No feedback is collected automatically."),
    rule("manual_issue_triage", "manual_issue_triage", "Issue triage remains manual", !input.feedbackCollectedAutomatically, "No automatic triage or contact occurs."),
    rule("manual_monitoring", "manual_monitoring", "Monitoring remains manual", !input.monitoringProviderConnected, "No production monitoring provider is connected."),
    rule("no_public_url_fetch", "manual_operations_only", "No public URL fetching", !input.publicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    rule("no_external_services", "service_disabled_state", "No external services required", !input.externalServicesRequired, "No external services are required for Phase 7 completion."),
    rule("no_database_persistence", "service_disabled_state", "Database persistence disabled", !input.databasePersistenceEnabled, "No database persistence is enabled."),
    rule("no_analytics", "service_disabled_state", "Analytics disabled", !input.analyticsEnabled, "No analytics are enabled."),
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

export function getControlledBetaOperationsFinalLockBlockers(input: TeoyubeControlledBetaOperationsFinalLockInput = {}): TeoyubeControlledBetaOperationsFinalLockBlocker[] {
  return createOperationsFinalLockRules(input).filter((entry) => !entry.passed).map(blocker);
}

export function getControlledBetaOperationsFinalLockWarnings(input: TeoyubeControlledBetaOperationsFinalLockInput = {}): TeoyubeControlledBetaOperationsFinalLockWarning[] {
  return [
    warning("phase_8_owner_review_required", "owner_review", "Phase 8 planning still requires explicit owner review before any public release or service connection."),
    ...(!input.ownerReviewed ? [warning("owner_review_pending", "owner_review", "Owner completion review has not been marked complete for this final operations lock.")] : [])
  ];
}

export function createControlledBetaOperationsFinalLockDecision(input: TeoyubeControlledBetaOperationsFinalLockInput = {}): TeoyubeControlledBetaOperationsFinalLockDecision {
  const blockers = getControlledBetaOperationsFinalLockBlockers(input);
  if (blockers.length) return "blocked";
  if (!input.ownerReviewed) return "needs_owner_review";
  return getControlledBetaOperationsFinalLockWarnings(input).length ? "locked_with_warnings" : "locked_ready_for_phase_8_planning";
}

function statusFromDecision(decision: TeoyubeControlledBetaOperationsFinalLockDecision): TeoyubeControlledBetaOperationsFinalLockStatus {
  if (decision === "locked_ready_for_phase_8_planning") return "locked";
  if (decision === "locked_with_warnings" || decision === "needs_owner_review") return "locked_with_warnings";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function createControlledBetaOperationsFinalLock(input: TeoyubeControlledBetaOperationsFinalLockInput = {}): TeoyubeControlledBetaOperationsFinalLockReport {
  return createControlledBetaOperationsFinalLockReport(input);
}

export function validateControlledBetaOperationsFinalLock(input: TeoyubeControlledBetaOperationsFinalLockInput = {}): TeoyubeControlledBetaOperationsFinalLockReport {
  return createControlledBetaOperationsFinalLockReport(input);
}

export function createControlledBetaOperationsFinalLockReport(input: TeoyubeControlledBetaOperationsFinalLockInput = {}): TeoyubeControlledBetaOperationsFinalLockReport {
  const blockers = getControlledBetaOperationsFinalLockBlockers(input);
  const warnings = getControlledBetaOperationsFinalLockWarnings(input);
  const decision = createControlledBetaOperationsFinalLockDecision(input);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    lockedItems: getControlledBetaOperationsFinalLockedItems(),
    rules: createOperationsFinalLockRules(input),
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
