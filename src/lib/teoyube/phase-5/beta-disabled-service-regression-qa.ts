import { createBetaDisabledServiceQaReport, type TeoyubeBetaDisabledServiceQaInput } from "./beta-disabled-service-qa";

export function validateBetaRegressionDatabasePersistenceDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_database_disabled");
}

export function validateBetaRegressionAnalyticsDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_analytics_disabled");
}

export function validateBetaRegressionMonitoringDisabledOrPlanOnly(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_monitoring_plan_only");
}

export function validateBetaRegressionAdminAuthDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_admin_auth_disabled");
}

export function validateBetaRegressionCmsDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_cms_disabled");
}

export function validateBetaRegressionFeedbackStorageDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_feedback_storage_disabled");
}

export function validateBetaRegressionLiveAiDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_live_ai_disabled");
}

export function validateBetaRegressionEmailNotificationsDisabled(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_email_notifications_disabled");
}

export function validateBetaRegressionNoExternalServiceRequired(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return createBetaDisabledServiceQaReport(input).checks.find((entry) => entry.id === "beta_no_external_service_required");
}

export function createBetaDisabledServiceRegressionQaReport(input: TeoyubeBetaDisabledServiceQaInput = {}) {
  return {
    ...createBetaDisabledServiceQaReport(input),
    regressionArea: "disabled_services" as const,
    remediationDidNotEnableServices: true
  };
}
