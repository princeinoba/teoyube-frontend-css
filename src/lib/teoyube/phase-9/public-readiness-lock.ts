import type {
  TeoyubePublicReadinessLockedArea,
  TeoyubePublicReadinessLockedItem,
  TeoyubePublicReadinessLockBlocker,
  TeoyubePublicReadinessLockDecision,
  TeoyubePublicReadinessLockReport,
  TeoyubePublicReadinessLockRule,
  TeoyubePublicReadinessLockWarning
} from "./public-readiness-lock-contracts";

export type TeoyubePublicReadinessLockInput = Partial<{
  ownerApprovalMissing: boolean;
  publicReleaseFromCode: boolean;
  automaticUserContact: boolean;
  automaticFeedbackCollection: boolean;
  publicUrlFetching: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  adminAuthEnabled: boolean;
  cmsEnabled: boolean;
  userAccountsEnabled: boolean;
  liveAiEnabled: boolean;
  automaticReviewedContentPublishing: boolean;
  reviewedContentGateInactive: boolean;
  scriptureAnchorsMissing: boolean;
  explanationTracesMissing: boolean;
  fallbackUnsafe: boolean;
  confidenceLabelsMissing: boolean;
  privacyConsentMissing: boolean;
  sensitiveDataWarningMissing: boolean;
  knownLimitationsMissing: boolean;
  pauseRollbackCriteriaMissing: boolean;
}>;

function lockedItem(id: string, area: TeoyubePublicReadinessLockedArea, label: string, details: string): TeoyubePublicReadinessLockedItem {
  return { id, area, label, locked: true, details };
}

function rule(id: string, area: TeoyubePublicReadinessLockedArea, passed: boolean, details: string): TeoyubePublicReadinessLockRule {
  return { id, area, required: true, passed, details };
}

export function getPublicReadinessLockedItems(): TeoyubePublicReadinessLockedItem[] {
  return [
    lockedItem("manual_public_release", "manual_public_release_only", "Public release remains manual", "No public release is performed from code."),
    lockedItem("owner_approval", "owner_approval_required", "Owner approval required", "Future release execution planning requires owner approval."),
    lockedItem("privacy_consent", "privacy_consent", "Privacy and consent visible", "Privacy/consent notices remain visible."),
    lockedItem("sensitive_data_warning", "sensitive_data_warning", "Sensitive data warnings visible", "Users are not asked for sensitive personal information."),
    lockedItem("known_limitations", "known_limitations", "Known limitations available", "Known limitations remain available."),
    lockedItem("manual_support", "manual_support", "Manual support", "Support remains manual."),
    lockedItem("manual_feedback", "manual_feedback", "Manual feedback", "Feedback remains manual."),
    lockedItem("manual_issue_triage", "manual_issue_triage", "Manual issue triage", "Issue triage remains manual."),
    lockedItem("manual_monitoring", "manual_monitoring", "Manual monitoring", "Monitoring remains manual or plan-only."),
    lockedItem("pause_rollback", "pause_rollback", "Pause/rollback criteria", "Pause/rollback criteria remain available as decision support."),
    lockedItem("service_disabled", "service_disabled_state", "Services disabled", "Persistence, analytics, monitoring provider, admin auth, CMS, accounts, live AI, and notifications remain disabled."),
    lockedItem("scripture_anchor", "scripture_anchor", "Scripture anchors visible", "Scripture anchors remain visible."),
    lockedItem("explanation_trace", "explanation_trace", "Explanation traces visible", "Explanation traces remain visible."),
    lockedItem("fallback", "fallback", "Fallback safe", "Fallback remains safe."),
    lockedItem("confidence_label", "confidence_label", "Confidence labels visible", "Confidence labels remain visible."),
    lockedItem("reviewed_content_gate", "reviewed_content_gate", "Reviewed content gate active", "Reviewed content gate remains active."),
    lockedItem("mobile_accessibility", "mobile_accessibility", "Mobile/accessibility ready", "Mobile/accessibility readiness remains part of public planning."),
    lockedItem("operational_handoff", "operational_handoff", "Operational handoff ready", "Operational handoff remains manual and owner-reviewed.")
  ];
}

export function createPublicReadinessLock(input: TeoyubePublicReadinessLockInput = {}): TeoyubePublicReadinessLockRule[] {
  return [
    rule("no_public_release_from_code", "manual_public_release_only", !input.publicReleaseFromCode, "Public release must remain manual and owner-approved."),
    rule("owner_approval_required", "owner_approval_required", !input.ownerApprovalMissing, "Owner approval is required."),
    rule("no_automatic_user_contact", "manual_support", !input.automaticUserContact, "No automatic user contact."),
    rule("no_automatic_feedback", "manual_feedback", !input.automaticFeedbackCollection, "No automatic feedback collection."),
    rule("no_public_url_fetching", "manual_monitoring", !input.publicUrlFetching, "No public URL fetching."),
    rule("services_disabled", "service_disabled_state", !input.databasePersistenceEnabled && !input.analyticsEnabled && !input.monitoringProviderConnected && !input.adminAuthEnabled && !input.cmsEnabled && !input.userAccountsEnabled && !input.liveAiEnabled, "Services remain disabled unless future approval exists."),
    rule("no_automatic_publishing", "reviewed_content_gate", !input.automaticReviewedContentPublishing && !input.reviewedContentGateInactive, "Reviewed content gates remain active."),
    rule("scripture_anchors_visible", "scripture_anchor", !input.scriptureAnchorsMissing, "Scripture anchors remain visible."),
    rule("explanation_traces_visible", "explanation_trace", !input.explanationTracesMissing, "Explanation traces remain visible."),
    rule("fallback_safe", "fallback", !input.fallbackUnsafe, "Fallback remains safe."),
    rule("confidence_labels_visible", "confidence_label", !input.confidenceLabelsMissing, "Confidence labels remain visible."),
    rule("privacy_consent_visible", "privacy_consent", !input.privacyConsentMissing, "Privacy/consent notices remain visible."),
    rule("sensitive_data_warning_visible", "sensitive_data_warning", !input.sensitiveDataWarningMissing, "Sensitive data warnings remain visible."),
    rule("known_limitations_available", "known_limitations", !input.knownLimitationsMissing, "Known limitations remain available."),
    rule("pause_rollback_available", "pause_rollback", !input.pauseRollbackCriteriaMissing, "Pause/rollback criteria remain available.")
  ];
}

export function getPublicReadinessLockBlockers(input: TeoyubePublicReadinessLockInput = {}): TeoyubePublicReadinessLockBlocker[] {
  return createPublicReadinessLock(input)
    .filter((entry) => entry.required && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details }));
}

export function getPublicReadinessLockWarnings(): TeoyubePublicReadinessLockWarning[] {
  return [
    { id: "public_readiness_lock_manual", area: "unknown", message: "Public readiness lock is manual and in-memory; it does not launch, contact, collect, fetch, persist, publish, or connect services." }
  ];
}

export function createPublicReadinessLockDecision(input: TeoyubePublicReadinessLockInput = {}): TeoyubePublicReadinessLockDecision {
  const blockers = getPublicReadinessLockBlockers(input);
  if (blockers.some((entry) => entry.area === "owner_approval_required")) return "needs_owner_review";
  if (blockers.length) return "blocked";
  return getPublicReadinessLockWarnings().length ? "locked_with_warnings" : "locked_ready_for_phase_10_planning";
}

export function validatePublicReadinessLock(input: TeoyubePublicReadinessLockInput = {}): boolean {
  return getPublicReadinessLockBlockers(input).length === 0;
}

export function createPublicReadinessLockReport(input: TeoyubePublicReadinessLockInput = {}): TeoyubePublicReadinessLockReport {
  const blockers = getPublicReadinessLockBlockers(input);
  const warnings = getPublicReadinessLockWarnings();
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "locked_with_warnings" : "locked",
    decision: createPublicReadinessLockDecision(input),
    lockedItems: getPublicReadinessLockedItems(),
    rules: createPublicReadinessLock(input),
    blockers,
    warnings,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
