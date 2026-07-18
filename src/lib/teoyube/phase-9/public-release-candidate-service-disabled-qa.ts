export type TeoyubePublicReleaseCandidateServiceDisabledQaInput = Partial<{
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

export type TeoyubePublicReleaseCandidateServiceDisabledQaReport = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noServiceEnabled: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noFeedbackStorageEnabled: true;
  noUserAccountsAdded: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailNotificationsEnabled: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function validatePublicCandidateDatabaseDisabled(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.databasePersistenceEnabled;
}

export function validatePublicCandidateAnalyticsDisabled(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.analyticsEnabled;
}

export function validatePublicCandidateMonitoringDisabledOrPlanOnly(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.monitoringProviderConnected && input.monitoringPlanOnly !== false;
}

export function validatePublicCandidateAdminAuthDisabled(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.adminAuthEnabled;
}

export function validatePublicCandidateCmsDisabled(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.cmsEnabled;
}

export function validatePublicCandidateFeedbackStorageDisabled(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.feedbackStorageEnabled;
}

export function validatePublicCandidateUserAccountsDisabled(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.userAccountsEnabled;
}

export function validatePublicCandidateLiveAiDisabled(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.liveAiEnabled;
}

export function validatePublicCandidateEmailNotificationsDisabled(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.emailNotificationsEnabled;
}

export function validatePublicCandidateNoExternalServiceRequired(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): boolean {
  return !input.externalServiceRequiredForSafeRender && !input.hiddenServiceDependencyIntroduced;
}

function createPublicReleaseCandidateServiceDisabledQaChecks(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}) {
  return [
    check("database_disabled", validatePublicCandidateDatabaseDisabled(input), "Database persistence remains disabled."),
    check("analytics_disabled", validatePublicCandidateAnalyticsDisabled(input), "Analytics remain disabled."),
    check("monitoring_disabled_or_plan_only", validatePublicCandidateMonitoringDisabledOrPlanOnly(input), "Production monitoring provider remains disconnected or plan-only."),
    check("admin_auth_disabled", validatePublicCandidateAdminAuthDisabled(input), "Admin authentication remains disabled."),
    check("cms_disabled", validatePublicCandidateCmsDisabled(input), "Production CMS remains disabled."),
    check("feedback_storage_disabled", validatePublicCandidateFeedbackStorageDisabled(input), "Feedback storage remains disabled."),
    check("user_accounts_disabled", validatePublicCandidateUserAccountsDisabled(input), "User accounts remain disabled."),
    check("live_ai_disabled", validatePublicCandidateLiveAiDisabled(input), "Live AI orchestration remains disabled."),
    check("email_notifications_disabled", validatePublicCandidateEmailNotificationsDisabled(input), "Email, SMS, and notifications remain disabled."),
    check("no_external_service_required", validatePublicCandidateNoExternalServiceRequired(input), "No external service is required for safe render.")
  ];
}

export function createPublicReleaseCandidateServiceDisabledQaReport(input: TeoyubePublicReleaseCandidateServiceDisabledQaInput = {}): TeoyubePublicReleaseCandidateServiceDisabledQaReport {
  const checks = createPublicReleaseCandidateServiceDisabledQaChecks(input);
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Service-disabled QA is manual and in-memory; it confirms disabled services but does not connect any provider."],
    noServiceEnabled: true,
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
