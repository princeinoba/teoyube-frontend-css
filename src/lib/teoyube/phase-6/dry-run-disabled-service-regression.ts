import {
  createDryRunDisabledServiceVerificationReport,
  type TeoyubeDryRunDisabledService
} from "./dry-run-disabled-service-verification";

export type TeoyubeDryRunDisabledServiceRegressionInput = {
  enabledServices?: TeoyubeDryRunDisabledService[];
};

export function validateDryRunRegressionDatabaseDisabled(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).checks.find((entry) => entry.service === "database_persistence");
}

export function validateDryRunRegressionAnalyticsDisabled(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).checks.find((entry) => entry.service === "analytics");
}

export function validateDryRunRegressionMonitoringDisabledOrPlanOnly(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).checks.find((entry) => entry.service === "monitoring_provider");
}

export function validateDryRunRegressionAdminAuthDisabled(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).checks.find((entry) => entry.service === "admin_auth");
}

export function validateDryRunRegressionCmsDisabled(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).checks.find((entry) => entry.service === "cms");
}

export function validateDryRunRegressionFeedbackStorageDisabled(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).checks.find((entry) => entry.service === "feedback_storage");
}

export function validateDryRunRegressionLiveAiDisabled(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).checks.find((entry) => entry.service === "live_ai_orchestration");
}

export function validateDryRunRegressionEmailNotificationsDisabled(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).checks.find((entry) => entry.service === "email_notifications");
}

export function validateDryRunRegressionNoExternalServiceRequired(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return createDryRunDisabledServiceVerificationReport(input.enabledServices).valid;
}

export function createDryRunDisabledServiceRegressionReport(input: TeoyubeDryRunDisabledServiceRegressionInput = {}) {
  return {
    ...createDryRunDisabledServiceVerificationReport(input.enabledServices),
    regressionArea: "service_disabled_state" as const,
    stabilizationDidNotEnableServices: true
  };
}
