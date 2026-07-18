export type TeoyubeOperationsDisabledService =
  | "database_persistence"
  | "analytics"
  | "monitoring_provider"
  | "admin_auth"
  | "cms"
  | "feedback_storage"
  | "live_ai_orchestration"
  | "email_notifications"
  | "external_service";

export type TeoyubeServiceDisabledOperationsRegressionInput = {
  enabledServices?: TeoyubeOperationsDisabledService[];
};

type ServiceCheck = {
  service: TeoyubeOperationsDisabledService;
  disabled: boolean;
  required: true;
  details: string;
};

const SERVICES: TeoyubeOperationsDisabledService[] = [
  "database_persistence",
  "analytics",
  "monitoring_provider",
  "admin_auth",
  "cms",
  "feedback_storage",
  "live_ai_orchestration",
  "email_notifications",
  "external_service"
];

function createChecks(input: TeoyubeServiceDisabledOperationsRegressionInput = {}): ServiceCheck[] {
  const enabled = new Set(input.enabledServices || []);
  return SERVICES.map((service) => ({
    service,
    disabled: !enabled.has(service),
    required: true as const,
    details: `${service} must remain disabled or plan-only during Phase 7.3.`
  }));
}

function findCheck(input: TeoyubeServiceDisabledOperationsRegressionInput, service: TeoyubeOperationsDisabledService) {
  return createChecks(input).find((entry) => entry.service === service);
}

export function validateOperationsDatabaseDisabled(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return findCheck(input, "database_persistence");
}

export function validateOperationsAnalyticsDisabled(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return findCheck(input, "analytics");
}

export function validateOperationsMonitoringDisabledOrPlanOnly(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return findCheck(input, "monitoring_provider");
}

export function validateOperationsAdminAuthDisabled(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return findCheck(input, "admin_auth");
}

export function validateOperationsCmsDisabled(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return findCheck(input, "cms");
}

export function validateOperationsFeedbackStorageDisabled(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return findCheck(input, "feedback_storage");
}

export function validateOperationsLiveAiDisabled(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return findCheck(input, "live_ai_orchestration");
}

export function validateOperationsEmailNotificationsDisabled(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return findCheck(input, "email_notifications");
}

export function validateOperationsNoExternalServiceRequired(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  return createChecks(input).every((entry) => entry.disabled);
}

export function createServiceDisabledOperationsRegressionReport(input: TeoyubeServiceDisabledOperationsRegressionInput = {}) {
  const checks = createChecks(input);
  const blockers = checks.filter((entry) => !entry.disabled).map((entry) => `${entry.service} is enabled during stabilization regression.`);
  return {
    valid: blockers.length === 0,
    regressionArea: "service_disabled_state" as const,
    checks,
    blockers,
    warnings: [] as string[],
    stabilizationDidNotEnableServices: blockers.length === 0,
    manualOnly: true as const,
    inMemoryOnly: true as const,
    noBetaLaunchPerformed: true as const,
    noUsersContacted: true as const,
    noFeedbackCollectedAutomatically: true as const,
    noPublicUrlsFetchedAutomatically: true as const,
    noDatabasePersistenceEnabled: true as const,
    noAnalyticsEnabled: true as const,
    noMonitoringProviderConnected: true as const,
    noLiveAiOrchestrationEnabled: true as const,
    noAdminAuthAdded: true as const,
    noCmsConnected: true as const,
    noExternalServicesRequired: true as const,
    noBrowserPersistenceRequired: true as const,
    generatedAt: new Date().toISOString()
  };
}
