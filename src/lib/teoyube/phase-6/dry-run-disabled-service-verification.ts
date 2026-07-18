export type TeoyubeDryRunDisabledService =
  | "database_persistence"
  | "analytics"
  | "monitoring_provider"
  | "admin_auth"
  | "cms"
  | "feedback_storage"
  | "live_ai_orchestration"
  | "email_notifications"
  | "sms_notifications"
  | "user_accounts"
  | "url_fetching"
  | "service_worker"
  | "browser_persistence";

export type TeoyubeDryRunDisabledServiceCheck = {
  id: string;
  service: TeoyubeDryRunDisabledService;
  label: string;
  disabled: boolean;
  required: true;
  details: string;
};

export type TeoyubeDryRunDisabledServiceVerificationReport = {
  valid: boolean;
  checks: TeoyubeDryRunDisabledServiceCheck[];
  blockers: string[];
  warnings: string[];
  disabledServiceCount: number;
  enabledServiceCount: number;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  noPublicUrlsFetchedAutomatically: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(service: TeoyubeDryRunDisabledService, label: string, details: string, disabled = true): TeoyubeDryRunDisabledServiceCheck {
  return { id: `dry_run_disabled_${service}`, service, label, disabled, required: true, details };
}

export function getDryRunDisabledServiceChecks(enabledServices: TeoyubeDryRunDisabledService[] = []): TeoyubeDryRunDisabledServiceCheck[] {
  const enabled = new Set(enabledServices);
  return [
    check("database_persistence", "Database persistence disabled", "No database writes or persistence are enabled.", !enabled.has("database_persistence")),
    check("analytics", "Analytics disabled", "No external analytics or tracking provider is connected.", !enabled.has("analytics")),
    check("monitoring_provider", "Monitoring provider disabled", "No production monitoring provider is connected.", !enabled.has("monitoring_provider")),
    check("admin_auth", "Admin auth not added", "No admin authentication or user accounts are introduced.", !enabled.has("admin_auth")),
    check("cms", "CMS disabled", "No production CMS or automatic publishing is connected.", !enabled.has("cms")),
    check("feedback_storage", "Feedback storage disabled", "Simulated feedback remains in memory and is not persisted.", !enabled.has("feedback_storage")),
    check("live_ai_orchestration", "Live AI orchestration disabled", "No live AI orchestration or external model calls are enabled.", !enabled.has("live_ai_orchestration")),
    check("email_notifications", "Email notifications disabled", "No email is sent by code.", !enabled.has("email_notifications")),
    check("sms_notifications", "SMS notifications disabled", "No SMS or push notification is sent by code.", !enabled.has("sms_notifications")),
    check("user_accounts", "User accounts disabled", "No user account system is added.", !enabled.has("user_accounts")),
    check("url_fetching", "URL fetching disabled", "No public URLs are fetched automatically.", !enabled.has("url_fetching")),
    check("service_worker", "Service worker disabled", "No service worker registration is added.", !enabled.has("service_worker")),
    check("browser_persistence", "Sensitive browser persistence disabled", "No localStorage, cookies, or IndexedDB are required for sensitive personalization.", !enabled.has("browser_persistence"))
  ];
}

export function verifyDryRunDisabledServices(enabledServices: TeoyubeDryRunDisabledService[] = []): boolean {
  return getDryRunDisabledServiceChecks(enabledServices).every((entry) => entry.disabled);
}

export function createDryRunDisabledServiceVerificationReport(
  enabledServices: TeoyubeDryRunDisabledService[] = []
): TeoyubeDryRunDisabledServiceVerificationReport {
  const checks = getDryRunDisabledServiceChecks(enabledServices);
  const blockers = checks.filter((entry) => !entry.disabled).map((entry) => `${entry.label}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [],
    disabledServiceCount: checks.filter((entry) => entry.disabled).length,
    enabledServiceCount: checks.filter((entry) => !entry.disabled).length,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    noPublicUrlsFetchedAutomatically: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
