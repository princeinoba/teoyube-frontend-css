import { createServiceGateReviewReport } from "./service-gate-review";

export type TeoyubeBetaDisabledServiceQaInput = {
  databasePersistenceEnabled?: boolean;
  analyticsEnabled?: boolean;
  monitoringProviderConnected?: boolean;
  adminAuthAdded?: boolean;
  cmsConnected?: boolean;
  feedbackStorageEnabled?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  externalServicesRequired?: boolean;
  serviceGateReport?: ReturnType<typeof createServiceGateReviewReport>;
};

export type TeoyubeBetaDisabledServiceQaCheck = {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  details: string;
};

export type TeoyubeBetaDisabledServiceQaReport = {
  valid: boolean;
  checks: TeoyubeBetaDisabledServiceQaCheck[];
  blockers: string[];
  warnings: string[];
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, label: string, passed: boolean, details: string, required = true): TeoyubeBetaDisabledServiceQaCheck {
  return { id, label, passed, required, details };
}

export function validateBetaDatabasePersistenceDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  return check("beta_database_disabled", "Database persistence is disabled", !input.databasePersistenceEnabled, "No database persistence may be required for Phase 5.2.");
}

export function validateBetaAnalyticsDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  return check("beta_analytics_disabled", "Analytics are disabled", !input.analyticsEnabled, "No analytics events or scripts may be sent.");
}

export function validateBetaMonitoringDisabledOrPlanOnly(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  return check("beta_monitoring_plan_only", "Monitoring provider is disconnected or plan-only", !input.monitoringProviderConnected, "Production monitoring providers remain disconnected.");
}

export function validateBetaAdminAuthDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  return check("beta_admin_auth_disabled", "Admin authentication is disabled", !input.adminAuthAdded, "Admin auth is a future service gate.");
}

export function validateBetaCmsDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  return check("beta_cms_disabled", "CMS is disabled", !input.cmsConnected, "Production CMS remains future work.");
}

export function validateBetaFeedbackStorageDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  return check("beta_feedback_storage_disabled", "Feedback storage is disabled", !input.feedbackStorageEnabled, "Feedback intake remains manual and not automatically collected.");
}

export function validateBetaLiveAiDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  return check("beta_live_ai_disabled", "Live AI orchestration is disabled", !input.liveAiOrchestrationEnabled, "No model APIs or live orchestration are connected.");
}

export function validateBetaEmailNotificationsDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  return check("beta_email_notifications_disabled", "Email and notifications are disabled", !input.emailNotificationsEnabled, "Code must not contact beta users.");
}

export function validateBetaNoExternalServiceRequired(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck {
  const report = input.serviceGateReport || createServiceGateReviewReport();
  return check("beta_no_external_service_required", "No external service is required for safe render", !input.externalServicesRequired && report.serviceConnectedCount === 0, "Safe render must remain local and in-memory.");
}

export function createBetaDisabledServiceChecklist(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaCheck[] {
  return [
    validateBetaDatabasePersistenceDisabled(input),
    validateBetaAnalyticsDisabled(input),
    validateBetaMonitoringDisabledOrPlanOnly(input),
    validateBetaAdminAuthDisabled(input),
    validateBetaCmsDisabled(input),
    validateBetaFeedbackStorageDisabled(input),
    validateBetaLiveAiDisabled(input),
    validateBetaEmailNotificationsDisabled(input),
    validateBetaNoExternalServiceRequired(input)
  ];
}

export function getBetaDisabledServiceQaBlockers(input: TeoyubeBetaDisabledServiceQaInput = {}): string[] {
  const report = input.serviceGateReport || createServiceGateReviewReport();
  return [
    ...createBetaDisabledServiceChecklist({ ...input, serviceGateReport: report })
      .filter((entry) => entry.required && !entry.passed)
      .map((entry) => `${entry.label}: ${entry.details}`),
    ...report.blockers.map((entry) => entry.message)
  ];
}

export function getBetaDisabledServiceQaWarnings(input: TeoyubeBetaDisabledServiceQaInput = {}): string[] {
  const report = input.serviceGateReport || createServiceGateReviewReport();
  return [
    ...report.warnings.map((entry) => entry.message),
    "All disabled services require owner, privacy, security, cost, and rollback review before future implementation."
  ];
}

export function createBetaDisabledServiceQaReport(input: TeoyubeBetaDisabledServiceQaInput = {}): TeoyubeBetaDisabledServiceQaReport {
  const blockers = getBetaDisabledServiceQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checks: createBetaDisabledServiceChecklist(input),
    blockers,
    warnings: getBetaDisabledServiceQaWarnings(input),
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
