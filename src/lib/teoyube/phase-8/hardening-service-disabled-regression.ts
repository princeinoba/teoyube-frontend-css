export type TeoyubeHardeningServiceDisabledInput = Partial<{
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  adminAuthEnabled: boolean;
  cmsEnabled: boolean;
  feedbackStorageEnabled: boolean;
  liveAiEnabled: boolean;
  emailNotificationsEnabled: boolean;
  externalServiceRequired: boolean;
}>;

export type TeoyubeHardeningServiceDisabledRegressionReport = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noServiceConnected: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function validateHardeningDatabaseDisabled(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.databasePersistenceEnabled;
}

export function validateHardeningAnalyticsDisabled(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.analyticsEnabled;
}

export function validateHardeningMonitoringDisabledOrPlanOnly(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.monitoringProviderConnected;
}

export function validateHardeningAdminAuthDisabled(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.adminAuthEnabled;
}

export function validateHardeningCmsDisabled(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.cmsEnabled;
}

export function validateHardeningFeedbackStorageDisabled(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.feedbackStorageEnabled;
}

export function validateHardeningLiveAiDisabled(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.liveAiEnabled;
}

export function validateHardeningEmailNotificationsDisabled(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.emailNotificationsEnabled;
}

export function validateHardeningNoExternalServiceRequired(input: TeoyubeHardeningServiceDisabledInput = {}): boolean {
  return !input.externalServiceRequired;
}

export function createHardeningServiceDisabledRegressionReport(input: TeoyubeHardeningServiceDisabledInput = {}): TeoyubeHardeningServiceDisabledRegressionReport {
  const checks = [
    { id: "database_disabled", passed: validateHardeningDatabaseDisabled(input), details: "Database persistence remains disabled." },
    { id: "analytics_disabled", passed: validateHardeningAnalyticsDisabled(input), details: "Analytics remain disabled." },
    { id: "monitoring_disabled_or_plan_only", passed: validateHardeningMonitoringDisabledOrPlanOnly(input), details: "Production monitoring remains disabled or plan-only." },
    { id: "admin_auth_disabled", passed: validateHardeningAdminAuthDisabled(input), details: "Admin auth remains disabled." },
    { id: "cms_disabled", passed: validateHardeningCmsDisabled(input), details: "CMS remains disabled." },
    { id: "feedback_storage_disabled", passed: validateHardeningFeedbackStorageDisabled(input), details: "Feedback storage remains disabled." },
    { id: "live_ai_disabled", passed: validateHardeningLiveAiDisabled(input), details: "Live AI orchestration remains disabled." },
    { id: "email_notifications_disabled", passed: validateHardeningEmailNotificationsDisabled(input), details: "Email/SMS/notifications remain disabled." },
    { id: "no_external_service_required", passed: validateHardeningNoExternalServiceRequired(input), details: "No external service is required by hardening." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Hardening service-disabled regression is manual/in-memory and connects no services."],
    noServiceConnected: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
