export type TeoyubePublicReleaseServiceLockConfirmationInput = Partial<{
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  monitoringPlanOnly: boolean;
  adminAuthEnabled: boolean;
  cmsEnabled: boolean;
  feedbackStorageEnabled: boolean;
  userAccountsEnabled: boolean;
  liveAiEnabled: boolean;
  emailNotificationsEnabled: boolean;
  externalServiceRequiredForSafeRender: boolean;
  hiddenServiceDependencyIntroduced: boolean;
}>;

export type TeoyubePublicReleaseServiceLockConfirmationDecision =
  | "services_locked_disabled_or_plan_only"
  | "blocked"
  | "unknown";

export type TeoyubePublicReleaseServiceLockConfirmationReport = {
  valid: boolean;
  decision: TeoyubePublicReleaseServiceLockConfirmationDecision;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noServiceEnabled: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noFeedbackStorageEnabled: true;
  noUserAccountsAdded: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailNotificationsEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function confirmPublicReleaseDatabasePersistenceDisabled(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.databasePersistenceEnabled;
}

export function confirmPublicReleaseAnalyticsDisabled(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.analyticsEnabled;
}

export function confirmPublicReleaseMonitoringDisabledOrPlanOnly(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.monitoringProviderConnected && input.monitoringPlanOnly !== false;
}

export function confirmPublicReleaseAdminAuthDisabled(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.adminAuthEnabled;
}

export function confirmPublicReleaseCmsDisabled(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.cmsEnabled;
}

export function confirmPublicReleaseFeedbackStorageDisabled(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.feedbackStorageEnabled;
}

export function confirmPublicReleaseUserAccountsDisabled(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.userAccountsEnabled;
}

export function confirmPublicReleaseLiveAiDisabled(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.liveAiEnabled;
}

export function confirmPublicReleaseEmailNotificationsDisabled(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.emailNotificationsEnabled;
}

export function confirmNoExternalServiceRequiredForPublicReleasePrep(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): boolean {
  return !input.externalServiceRequiredForSafeRender && !input.hiddenServiceDependencyIntroduced;
}

function checks(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}) {
  return [
    check("database_disabled", confirmPublicReleaseDatabasePersistenceDisabled(input), "Database persistence remains disabled."),
    check("analytics_disabled", confirmPublicReleaseAnalyticsDisabled(input), "Analytics remain disabled."),
    check("monitoring_disabled_or_plan_only", confirmPublicReleaseMonitoringDisabledOrPlanOnly(input), "Monitoring remains disconnected or plan-only."),
    check("admin_auth_disabled", confirmPublicReleaseAdminAuthDisabled(input), "Admin authentication remains disabled."),
    check("cms_disabled", confirmPublicReleaseCmsDisabled(input), "Production CMS remains disabled."),
    check("feedback_storage_disabled", confirmPublicReleaseFeedbackStorageDisabled(input), "Feedback storage remains disabled."),
    check("user_accounts_disabled", confirmPublicReleaseUserAccountsDisabled(input), "User accounts remain disabled."),
    check("live_ai_disabled", confirmPublicReleaseLiveAiDisabled(input), "Live AI orchestration remains disabled."),
    check("email_notifications_disabled", confirmPublicReleaseEmailNotificationsDisabled(input), "Email/SMS/notifications remain disabled."),
    check("no_external_service_required", confirmNoExternalServiceRequiredForPublicReleasePrep(input), "No external service or hidden dependency is required for safe render.")
  ];
}

export function createPublicReleaseServiceLockConfirmationDecision(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): TeoyubePublicReleaseServiceLockConfirmationDecision {
  return checks(input).some((entry) => !entry.passed) ? "blocked" : "services_locked_disabled_or_plan_only";
}

export function createPublicReleaseServiceLockConfirmationReport(input: TeoyubePublicReleaseServiceLockConfirmationInput = {}): TeoyubePublicReleaseServiceLockConfirmationReport {
  const entries = checks(input);
  const blockers = entries.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    decision: createPublicReleaseServiceLockConfirmationDecision(input),
    checks: entries,
    blockers,
    warnings: ["Service lock confirmation is manual and in-memory; future-review-only does not mean service activation approval."],
    noServiceEnabled: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noFeedbackStorageEnabled: true,
    noUserAccountsAdded: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailNotificationsEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
