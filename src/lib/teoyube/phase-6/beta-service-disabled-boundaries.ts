import { createFinalDisabledServiceLockReport } from "../phase-5/final-disabled-service-lock";

export type TeoyubeBetaServiceDisabledBoundaryInput = Partial<{
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  adminAuthEnabled: boolean;
  cmsEnabled: boolean;
  feedbackStorageEnabled: boolean;
  liveAiEnabled: boolean;
  emailNotificationsEnabled: boolean;
  userAccountsEnabled: boolean;
}>;

export type TeoyubeBetaServiceDisabledBoundaryRule = {
  id: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeBetaServiceDisabledBoundaryReport = {
  valid: boolean;
  rules: TeoyubeBetaServiceDisabledBoundaryRule[];
  blockers: string[];
  warnings: string[];
  databasePersistenceDisabled: boolean;
  analyticsDisabled: boolean;
  monitoringProviderDisabledOrPlanOnly: boolean;
  adminAuthDisabled: boolean;
  cmsDisabled: boolean;
  feedbackStorageDisabled: boolean;
  liveAiDisabled: boolean;
  emailNotificationsDisabled: boolean;
  userAccountsDisabled: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

function rule(id: string, label: string, passed: boolean, details: string): TeoyubeBetaServiceDisabledBoundaryRule {
  return { id, label, passed, details };
}

export function validateBetaDatabaseDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("database_disabled", "Database persistence disabled", !input.databasePersistenceEnabled, "No database persistence is enabled.");
}

export function validateBetaAnalyticsDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("analytics_disabled", "Analytics disabled", !input.analyticsEnabled, "No analytics are enabled.");
}

export function validateBetaMonitoringDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("monitoring_disabled", "Monitoring provider disabled or plan-only", !input.monitoringProviderConnected, "No production monitoring provider is connected.");
}

export function validateBetaAdminAuthDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("admin_auth_disabled", "Admin auth disabled", !input.adminAuthEnabled, "No admin authentication is added.");
}

export function validateBetaCmsDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("cms_disabled", "CMS disabled", !input.cmsEnabled, "No production CMS is connected.");
}

export function validateBetaFeedbackStorageDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("feedback_storage_disabled", "Feedback storage disabled", !input.feedbackStorageEnabled, "Feedback storage remains disabled.");
}

export function validateBetaLiveAiDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("live_ai_disabled", "Live AI disabled", !input.liveAiEnabled, "No live AI orchestration is enabled.");
}

export function validateBetaEmailDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("email_disabled", "Email notifications disabled", !input.emailNotificationsEnabled, "No email, SMS, or notification sending is enabled.");
}

export function validateBetaUserAccountsDisabledBoundary(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule {
  return rule("user_accounts_disabled", "User accounts disabled", !input.userAccountsEnabled, "No user accounts are enabled.");
}

export function createBetaServiceDisabledBoundaryRules(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryRule[] {
  const finalLock = createFinalDisabledServiceLockReport();
  return [
    validateBetaDatabaseDisabledBoundary(input),
    validateBetaAnalyticsDisabledBoundary(input),
    validateBetaMonitoringDisabledBoundary(input),
    validateBetaAdminAuthDisabledBoundary(input),
    validateBetaCmsDisabledBoundary(input),
    validateBetaFeedbackStorageDisabledBoundary(input),
    validateBetaLiveAiDisabledBoundary(input),
    validateBetaEmailDisabledBoundary(input),
    validateBetaUserAccountsDisabledBoundary(input),
    rule("phase_5_final_service_lock_valid", "Phase 5 final disabled service lock valid", finalLock.valid, "Phase 5.5 final disabled service lock must remain valid.")
  ];
}

export function createBetaServiceDisabledBoundaryReport(input: TeoyubeBetaServiceDisabledBoundaryInput = {}): TeoyubeBetaServiceDisabledBoundaryReport {
  const rules = createBetaServiceDisabledBoundaryRules(input);
  const failed = rules.filter((entry) => !entry.passed);
  return {
    valid: failed.length === 0,
    rules,
    blockers: failed.map((entry) => `${entry.label}: ${entry.details}`),
    warnings: ["Any future service enablement requires owner, privacy, security, cost, rollback, and data-protection review."],
    databasePersistenceDisabled: !input.databasePersistenceEnabled,
    analyticsDisabled: !input.analyticsEnabled,
    monitoringProviderDisabledOrPlanOnly: !input.monitoringProviderConnected,
    adminAuthDisabled: !input.adminAuthEnabled,
    cmsDisabled: !input.cmsEnabled,
    feedbackStorageDisabled: !input.feedbackStorageEnabled,
    liveAiDisabled: !input.liveAiEnabled,
    emailNotificationsDisabled: !input.emailNotificationsEnabled,
    userAccountsDisabled: !input.userAccountsEnabled,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
