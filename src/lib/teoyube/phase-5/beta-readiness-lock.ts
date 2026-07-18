import type {
  TeoyubeBetaReadinessLockBlocker,
  TeoyubeBetaReadinessLockDecision,
  TeoyubeBetaReadinessLockedArea,
  TeoyubeBetaReadinessLockedItem,
  TeoyubeBetaReadinessLockReport,
  TeoyubeBetaReadinessLockRule,
  TeoyubeBetaReadinessLockStatus,
  TeoyubeBetaReadinessLockWarning
} from "./beta-readiness-lock-contracts";

export type TeoyubeBetaReadinessLock = {
  id: string;
  lockedItems: TeoyubeBetaReadinessLockedItem[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function rule(id: string, area: TeoyubeBetaReadinessLockedArea, label: string, details: string, locked = true): TeoyubeBetaReadinessLockRule {
  return { id, area, label, required: true, locked, details };
}

function item(
  id: string,
  area: TeoyubeBetaReadinessLockedArea,
  label: string,
  rules: TeoyubeBetaReadinessLockRule[],
  sourceFiles: string[]
): TeoyubeBetaReadinessLockedItem {
  return {
    id,
    area,
    label,
    locked: rules.every((entry) => entry.locked),
    rules,
    sourceFiles
  };
}

export function getBetaReadinessLockedItems(): TeoyubeBetaReadinessLockedItem[] {
  return [
    item("beta_scope_lock", "beta_scope", "Beta scope remains controlled", [
      rule("controlled_scope", "beta_scope", "Controlled limited scope", "Controlled beta remains limited and manual."),
      rule("owner_approval_required", "owner_approval", "Owner approval required", "Owner approval remains required before execution planning.")
    ], ["controlled-beta-preparation.ts", "controlled-beta-owner-approval.ts"]),
    item("manual_execution_lock", "manual_qa_plan", "Beta execution remains manual", [
      rule("manual_beta_execution", "manual_qa_plan", "Manual beta execution", "No beta launch is performed by code."),
      rule("no_user_contact", "manual_qa_plan", "No automatic user contact", "No beta users are contacted by code."),
      rule("no_feedback_collection", "manual_qa_plan", "No automatic feedback collection", "Feedback remains manual unless future approval exists."),
      rule("no_public_url_fetching", "manual_qa_plan", "No public URL fetching", "Public URLs are not fetched automatically.")
    ], ["manual-beta-qa-execution-plan.ts", "beta-launch-boundary-validator.ts"]),
    item("service_disabled_lock", "service_disabled_state", "Services remain disabled unless future approval exists", [
      rule("database_disabled", "service_disabled_state", "Database persistence disabled", "No database persistence is enabled."),
      rule("analytics_disabled", "service_disabled_state", "Analytics disabled", "No analytics are enabled."),
      rule("monitoring_plan_only", "service_disabled_state", "Monitoring disabled or plan-only", "No production monitoring provider is connected."),
      rule("admin_auth_disabled", "service_disabled_state", "Admin auth disabled", "No admin auth is added."),
      rule("cms_disabled", "service_disabled_state", "CMS disabled", "No production CMS is connected."),
      rule("user_accounts_disabled", "service_disabled_state", "User accounts disabled", "No user account system is added."),
      rule("live_ai_disabled", "service_disabled_state", "Live AI orchestration disabled", "No live AI orchestration is enabled.")
    ], ["service-gate-review.ts", "beta-disabled-service-qa.ts", "beta-launch-boundary-validator.ts"]),
    item("reviewed_content_lock", "reviewed_content_gate", "Reviewed content gates remain active", [
      rule("no_automatic_publishing", "reviewed_content_gate", "No automatic publishing", "Reviewed content is not published automatically."),
      rule("no_review_only_live_content", "reviewed_content_gate", "No review-only live content", "Review-only content remains out of live flows.")
    ], ["beta-reviewed-content-gate-qa.ts", "beta-reviewed-content-gate-regression-qa.ts"]),
    item("scripture_explanation_fallback_lock", "scripture_anchor", "Scripture, explanation, fallback, and confidence safety remains locked", [
      rule("scripture_anchors_visible", "scripture_anchor", "Scripture anchors visible", "Scripture anchors remain visible where available."),
      rule("explanation_traces_visible", "explanation_trace", "Explanation traces visible", "Explanation traces remain visible."),
      rule("fallback_safe", "fallback", "Fallback remains safe", "Fallback states remain safe, visible, and bounded."),
      rule("confidence_labels_visible", "confidence_label", "Confidence labels visible", "Confidence labels remain visible where required.")
    ], ["beta-scripture-explanation-fallback-qa.ts", "beta-scripture-explanation-fallback-regression-qa.ts"]),
    item("privacy_consent_lock", "privacy_security", "Privacy and consent remain visible", [
      rule("privacy_consent_visible", "privacy_security", "Consent/privacy visible", "Consent and privacy notices remain visible."),
      rule("no_browser_persistence", "privacy_security", "No browser persistence for sensitive personalization", "No localStorage, cookies, or IndexedDB are required.")
    ], ["privacy-security-readiness.ts", "beta-launch-boundary-validator.ts"]),
    item("mobile_accessibility_lock", "mobile_accessibility", "Mobile and accessibility readiness remains protected", [
      rule("mobile_fallbacks", "mobile_accessibility", "Mobile-safe rendering", "Mobile-safe rendering and graph/list fallbacks remain expected."),
      rule("accessibility_basics", "mobile_accessibility", "Accessibility basics", "Readable labels, focus, and keyboard basics remain part of review.")
    ], ["beta-mobile-accessibility-qa.ts", "beta-mobile-accessibility-regression-qa.ts"]),
    item("known_limitations_lock", "known_limitations", "Known limitations remain visible", [
      rule("known_limitations_notice", "known_limitations", "Known limitations notice", "Known limitations remain documented for controlled beta planning.")
    ], ["beta-known-limitations.ts"])
  ];
}

export function createBetaReadinessLock(): TeoyubeBetaReadinessLock {
  return {
    id: "phase_5_5_beta_readiness_lock",
    lockedItems: getBetaReadinessLockedItems(),
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

export function getBetaReadinessLockBlockers(input: TeoyubeBetaReadinessLock = createBetaReadinessLock()): TeoyubeBetaReadinessLockBlocker[] {
  return [
    ...input.lockedItems.flatMap((lockedItem) => lockedItem.rules
      .filter((entry) => entry.required && !entry.locked)
      .map((entry) => ({
        id: `${entry.id}_not_locked`,
        area: entry.area,
        message: `${entry.label} is not locked.`,
        requiredAction: "Restore this readiness lock before Phase 6 planning."
      }))),
    ...(!input.noBetaLaunchPerformed || !input.noUsersContacted || !input.noFeedbackCollectedAutomatically || !input.noPublicUrlsFetchedAutomatically
      ? [{
          id: "beta_execution_boundary_not_locked",
          area: "beta_scope" as const,
          message: "Beta execution boundary must remain manual with no launch/contact/feedback/URL automation.",
          requiredAction: "Restore Phase 5 readiness lock boundaries."
        }]
      : []),
    ...(!input.noDatabasePersistenceEnabled || !input.noAnalyticsEnabled || !input.noMonitoringProviderConnected || !input.noLiveAiOrchestrationEnabled || !input.noAdminAuthAdded || !input.noCmsConnected || !input.noExternalServicesRequired
      ? [{
          id: "service_disabled_boundary_not_locked",
          area: "service_disabled_state" as const,
          message: "Services must remain disabled unless future approval exists.",
          requiredAction: "Restore final disabled service lock."
        }]
      : [])
  ];
}

export function getBetaReadinessLockWarnings(input: TeoyubeBetaReadinessLock = createBetaReadinessLock()): TeoyubeBetaReadinessLockWarning[] {
  return input.lockedItems
    .filter((lockedItem) => !lockedItem.locked)
    .map((lockedItem) => ({
      id: `${lockedItem.id}_warning`,
      area: lockedItem.area,
      message: `${lockedItem.label} has an unlocked rule.`,
      recommendedAction: "Review manually before Phase 6 planning."
    }));
}

export function createBetaReadinessLockDecision(input: TeoyubeBetaReadinessLock = createBetaReadinessLock()): TeoyubeBetaReadinessLockDecision {
  const blockers = getBetaReadinessLockBlockers(input);
  const warnings = getBetaReadinessLockWarnings(input);
  if (blockers.length) return "blocked";
  return warnings.length ? "locked_with_warnings" : "locked_ready_for_phase_6_planning";
}

function statusFromDecision(decision: TeoyubeBetaReadinessLockDecision): TeoyubeBetaReadinessLockStatus {
  if (decision === "locked_ready_for_phase_6_planning") return "locked";
  if (decision === "locked_with_warnings") return "locked_with_warnings";
  if (decision === "needs_owner_review") return "needs_review";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function validateBetaReadinessLock(input: TeoyubeBetaReadinessLock = createBetaReadinessLock()): TeoyubeBetaReadinessLockReport {
  return createBetaReadinessLockReport(input);
}

export function createBetaReadinessLockReport(input: TeoyubeBetaReadinessLock = createBetaReadinessLock()): TeoyubeBetaReadinessLockReport {
  const blockers = getBetaReadinessLockBlockers(input);
  const warnings = getBetaReadinessLockWarnings(input);
  const decision = createBetaReadinessLockDecision(input);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    lockedItems: input.lockedItems,
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
