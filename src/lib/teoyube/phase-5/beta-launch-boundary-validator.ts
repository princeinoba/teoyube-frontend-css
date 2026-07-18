import type {
  TeoyubeBetaLaunchBoundaryBlocker,
  TeoyubeBetaLaunchBoundaryCheck,
  TeoyubeBetaLaunchBoundaryDecision,
  TeoyubeBetaLaunchBoundaryReport,
  TeoyubeBetaLaunchBoundaryRule,
  TeoyubeBetaLaunchBoundaryStatus,
  TeoyubeBetaLaunchBoundaryWarning
} from "./beta-launch-boundary-contracts";

export type TeoyubeBetaLaunchBoundaryInput = {
  automaticBetaLaunchEnabled?: boolean;
  automaticUserContactEnabled?: boolean;
  automaticFeedbackCollectionEnabled?: boolean;
  publicUrlFetchingEnabled?: boolean;
  externalServiceConnectionEnabled?: boolean;
  databasePersistenceEnabled?: boolean;
  analyticsEnabled?: boolean;
  productionMonitoringProviderConnected?: boolean;
  adminAuthAdded?: boolean;
  cmsConnected?: boolean;
  userAccountsAdded?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  serviceDependencyForSafeRender?: boolean;
  automaticReviewedContentPublishingEnabled?: boolean;
  reviewOnlyContentInLiveFlows?: boolean;
  hiddenPersonalizationEnabled?: boolean;
  divineCertaintyClaimsPresent?: boolean;
};

function blocker(rule: TeoyubeBetaLaunchBoundaryRule, message: string, requiredAction: string): TeoyubeBetaLaunchBoundaryBlocker {
  return { id: `${rule}_blocker`, rule, message, requiredAction };
}

function warning(rule: TeoyubeBetaLaunchBoundaryRule, message: string, recommendedAction: string): TeoyubeBetaLaunchBoundaryWarning {
  return { id: `${rule}_warning`, rule, message, recommendedAction };
}

function check(rule: TeoyubeBetaLaunchBoundaryRule, label: string, passed: boolean, details: string): TeoyubeBetaLaunchBoundaryCheck {
  return {
    id: rule,
    rule,
    label,
    passed,
    details,
    blockers: passed ? [] : [blocker(rule, `${label} boundary is violated.`, "Return Phase 5.4 to preparation-only before any controlled beta execution planning.")],
    warnings: passed ? [] : [warning(rule, `${label} requires manual owner review.`, "Document the boundary violation and resolve it before owner approval.")]
  };
}

export function createBetaLaunchBoundaryRules(): TeoyubeBetaLaunchBoundaryRule[] {
  return [
    "no_automatic_beta_launch",
    "no_automatic_user_contact",
    "no_automatic_feedback_collection",
    "no_public_url_fetching",
    "no_database_persistence",
    "no_external_analytics",
    "no_production_monitoring_provider",
    "no_admin_auth",
    "no_cms",
    "no_user_accounts",
    "no_live_ai_orchestration",
    "no_email_notifications",
    "no_service_dependency_for_safe_render",
    "no_publishing_reviewed_content_automatically",
    "no_review_only_content_in_live_flows",
    "no_hidden_personalization",
    "no_divine_certainty_claims"
  ];
}

export function validateNoAutomaticBetaLaunch(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck {
  return check("no_automatic_beta_launch", "No automatic beta launch", !input.automaticBetaLaunchEnabled, "Phase 5.4 creates decision support only.");
}

export function validateNoAutomaticUserContact(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck {
  return check("no_automatic_user_contact", "No automatic user contact", !input.automaticUserContactEnabled, "Participant contact remains outside code.");
}

export function validateNoAutomaticFeedbackCollection(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck {
  return check("no_automatic_feedback_collection", "No automatic feedback collection", !input.automaticFeedbackCollectionEnabled, "Feedback remains manual unless future approval exists.");
}

export function validateNoPublicUrlFetching(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck {
  return check("no_public_url_fetching", "No public URL fetching", !input.publicUrlFetchingEnabled, "No public URL is fetched automatically.");
}

export function validateNoExternalServiceConnection(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck[] {
  return [
    check("no_database_persistence", "No database persistence", !input.databasePersistenceEnabled, "No database persistence is enabled."),
    check("no_external_analytics", "No external analytics", !input.analyticsEnabled, "Analytics remain disabled."),
    check("no_production_monitoring_provider", "No production monitoring provider", !input.productionMonitoringProviderConnected, "Monitoring remains plan-only."),
    check("no_admin_auth", "No admin auth", !input.adminAuthAdded, "Controlled admin remains prototype-only."),
    check("no_cms", "No CMS", !input.cmsConnected, "No production CMS is connected."),
    check("no_user_accounts", "No user accounts", !input.userAccountsAdded, "No user account system is added."),
    check("no_live_ai_orchestration", "No live AI orchestration", !input.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    check("no_email_notifications", "No email notifications", !input.emailNotificationsEnabled, "No email, SMS, or notification system is enabled."),
    check("no_service_dependency_for_safe_render", "No service dependency for safe render", !input.externalServiceConnectionEnabled && !input.serviceDependencyForSafeRender, "Safe render must not require external providers.")
  ];
}

export function validateNoReviewOnlyContentPublished(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck[] {
  return [
    check("no_publishing_reviewed_content_automatically", "No automatic reviewed content publishing", !input.automaticReviewedContentPublishingEnabled, "Review-only content is never published automatically."),
    check("no_review_only_content_in_live_flows", "No review-only content in live flows", !input.reviewOnlyContentInLiveFlows, "Live flows must use reviewed production data only.")
  ];
}

export function validateNoHiddenPersonalization(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck {
  return check("no_hidden_personalization", "No hidden personalization", !input.hiddenPersonalizationEnabled, "No localStorage, cookies, IndexedDB, or hidden sensitive personalization is required.");
}

export function validateNoDivineCertaintyClaims(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck {
  return check("no_divine_certainty_claims", "No divine-certainty claims", !input.divineCertaintyClaimsPresent, "Teoyube keeps devotional language confidence-aware and bounded.");
}

export function validateBetaLaunchBoundary(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryCheck[] {
  return [
    validateNoAutomaticBetaLaunch(input),
    validateNoAutomaticUserContact(input),
    validateNoAutomaticFeedbackCollection(input),
    validateNoPublicUrlFetching(input),
    ...validateNoExternalServiceConnection(input),
    ...validateNoReviewOnlyContentPublished(input),
    validateNoHiddenPersonalization(input),
    validateNoDivineCertaintyClaims(input)
  ];
}

export function createBetaLaunchBoundaryDecision(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryDecision {
  const checks = validateBetaLaunchBoundary(input);
  const blockers = checks.flatMap((entry) => entry.blockers);
  const warnings = checks.flatMap((entry) => entry.warnings);
  if (blockers.length) return "blocked_by_boundary_violation";
  return warnings.length ? "preparation_only_with_warnings" : "preparation_only_boundary_clear";
}

function statusFromDecision(decision: TeoyubeBetaLaunchBoundaryDecision): TeoyubeBetaLaunchBoundaryStatus {
  if (decision === "preparation_only_boundary_clear") return "boundary_clear";
  if (decision === "preparation_only_with_warnings") return "clear_with_warnings";
  if (decision === "blocked_by_boundary_violation") return "blocked";
  return "unknown";
}

export function createBetaLaunchBoundaryReport(input: TeoyubeBetaLaunchBoundaryInput = {}): TeoyubeBetaLaunchBoundaryReport {
  const checks = validateBetaLaunchBoundary(input);
  const blockers = checks.flatMap((entry) => entry.blockers);
  const warnings = checks.flatMap((entry) => entry.warnings);
  const decision = createBetaLaunchBoundaryDecision(input);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    checks,
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
    noEmailNotificationsSent: true,
    noReviewedContentPublishedAutomatically: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
