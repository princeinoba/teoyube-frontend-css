export type TeoyubePublicServiceDisabledFinalInput = Partial<{
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
}>;

export function confirmFinalPublicDatabaseDisabled(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.databasePersistenceEnabled;
}

export function confirmFinalPublicAnalyticsDisabled(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.analyticsEnabled;
}

export function confirmFinalPublicMonitoringDisabledOrPlanOnly(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.monitoringProviderConnected && input.monitoringPlanOnly !== false;
}

export function confirmFinalPublicAdminAuthDisabled(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.adminAuthEnabled;
}

export function confirmFinalPublicCmsDisabled(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.cmsEnabled;
}

export function confirmFinalPublicFeedbackStorageDisabled(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.feedbackStorageEnabled;
}

export function confirmFinalPublicUserAccountsDisabled(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.userAccountsEnabled;
}

export function confirmFinalPublicLiveAiDisabled(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.liveAiEnabled;
}

export function confirmFinalPublicEmailNotificationsDisabled(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.emailNotificationsEnabled;
}

export function confirmFinalPublicNoExternalServiceRequired(input: TeoyubePublicServiceDisabledFinalInput = {}): boolean {
  return !input.externalServiceRequiredForSafeRender;
}

export function createPublicServiceDisabledFinalConfirmationDecision(input: TeoyubePublicServiceDisabledFinalInput = {}): "service_disabled_confirmed" | "service_lock_review_required" {
  return createPublicServiceDisabledFinalConfirmationReport(input).valid ? "service_disabled_confirmed" : "service_lock_review_required";
}

export function createPublicServiceDisabledFinalConfirmationReport(input: TeoyubePublicServiceDisabledFinalInput = {}) {
  const checks = [
    { id: "database_disabled", passed: confirmFinalPublicDatabaseDisabled(input), details: "Database persistence disabled." },
    { id: "analytics_disabled", passed: confirmFinalPublicAnalyticsDisabled(input), details: "Analytics disabled." },
    { id: "monitoring_disabled_or_plan_only", passed: confirmFinalPublicMonitoringDisabledOrPlanOnly(input), details: "Monitoring disabled or plan-only." },
    { id: "admin_auth_disabled", passed: confirmFinalPublicAdminAuthDisabled(input), details: "Admin auth disabled." },
    { id: "cms_disabled", passed: confirmFinalPublicCmsDisabled(input), details: "CMS disabled." },
    { id: "feedback_storage_disabled", passed: confirmFinalPublicFeedbackStorageDisabled(input), details: "Feedback storage disabled." },
    { id: "user_accounts_disabled", passed: confirmFinalPublicUserAccountsDisabled(input), details: "User accounts disabled." },
    { id: "live_ai_disabled", passed: confirmFinalPublicLiveAiDisabled(input), details: "Live AI orchestration disabled." },
    { id: "email_notifications_disabled", passed: confirmFinalPublicEmailNotificationsDisabled(input), details: "Email notifications disabled." },
    { id: "no_external_service_required", passed: confirmFinalPublicNoExternalServiceRequired(input), details: "No external service required for safe rendering." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Service-disabled final confirmation is manual and in-memory."],
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noFeedbackStorageEnabled: true,
    noUserAccountsAdded: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailNotificationsEnabled: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
