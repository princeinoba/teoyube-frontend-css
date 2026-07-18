import type {
  TeoyubeManualPublicMonitoringBoundaryArea,
  TeoyubeManualPublicMonitoringBoundaryBlocker,
  TeoyubeManualPublicMonitoringBoundaryDecision,
  TeoyubeManualPublicMonitoringBoundaryReport,
  TeoyubeManualPublicMonitoringBoundaryRule,
  TeoyubeManualPublicMonitoringBoundaryWarning
} from "./manual-public-monitoring-boundary-contracts";

export type TeoyubeManualPublicMonitoringBoundaryInput = Partial<{
  monitoringNotManual: boolean;
  analyticsProviderEnabled: boolean;
  monitoringProviderConnected: boolean;
  trackingScriptsEnabled: boolean;
  automaticAlertsEnabled: boolean;
  automaticUserContactEnabled: boolean;
  automaticFeedbackCollectionEnabled: boolean;
  publicUrlFetchingFromCode: boolean;
  externalServiceRequired: boolean;
  manualIssueLogMissing: boolean;
  manualPauseRollbackMissing: boolean;
  privacySecurityBoundaryMissing: boolean;
}>;

function rule(id: string, area: TeoyubeManualPublicMonitoringBoundaryArea, label: string, passed: boolean, details: string): TeoyubeManualPublicMonitoringBoundaryRule {
  return { id, area, label, required: true, passed, details };
}

export function getManualPublicMonitoringBoundaryRules(input: TeoyubeManualPublicMonitoringBoundaryInput = {}): TeoyubeManualPublicMonitoringBoundaryRule[] {
  return [
    rule("manual_observation_only", "manual_observation_only", "Monitoring is manual observation only", !input.monitoringNotManual, "No automatic monitoring workflow is connected."),
    rule("no_analytics_provider", "no_analytics", "No analytics provider", !input.analyticsProviderEnabled, "Analytics remain disabled."),
    rule("no_monitoring_provider", "no_monitoring_provider", "No production monitoring provider", !input.monitoringProviderConnected, "Monitoring provider remains disabled or plan-only."),
    rule("no_tracking_scripts", "no_tracking", "No tracking scripts", !input.trackingScriptsEnabled, "No tracking pixels/scripts are introduced."),
    rule("no_automatic_alerts", "no_automatic_alerts", "No automatic alerts", !input.automaticAlertsEnabled, "Alerts remain manual review notes only."),
    rule("no_automatic_user_contact", "no_user_contact", "No automatic user contact", !input.automaticUserContactEnabled, "No email, SMS, notification, or external contact is sent."),
    rule("no_automatic_feedback_collection", "no_feedback_collection", "No automatic feedback collection", !input.automaticFeedbackCollectionEnabled, "Feedback remains manual and user-initiated outside code."),
    rule("no_public_url_fetching", "no_public_url_fetching", "No public URL fetching from code", !input.publicUrlFetchingFromCode, "Public URL checks remain manual."),
    rule("no_external_service_dependency", "manual_observation_only", "No external service dependency", !input.externalServiceRequired, "Safe rendering does not require external services."),
    rule("manual_issue_log", "manual_issue_log", "Manual issue log is local/manual only", !input.manualIssueLogMissing, "Issue logs are not persisted by this module."),
    rule("manual_pause_rollback", "manual_pause_rollback", "Pause/rollback is manual decision support only", !input.manualPauseRollbackMissing, "This module does not execute rollback."),
    rule("privacy_security_boundary", "privacy_security", "Privacy/security boundary remains visible", !input.privacySecurityBoundaryMissing, "Privacy, consent, and sensitive data constraints remain active.")
  ];
}

export function createManualPublicMonitoringBoundaries(input: TeoyubeManualPublicMonitoringBoundaryInput = {}): TeoyubeManualPublicMonitoringBoundaryRule[] {
  return getManualPublicMonitoringBoundaryRules(input);
}

export function getManualPublicMonitoringBoundaryBlockers(input: TeoyubeManualPublicMonitoringBoundaryInput = {}): TeoyubeManualPublicMonitoringBoundaryBlocker[] {
  return getManualPublicMonitoringBoundaryRules(input)
    .filter((entry) => entry.required && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details }));
}

export function getManualPublicMonitoringBoundaryWarnings(): TeoyubeManualPublicMonitoringBoundaryWarning[] {
  return [
    { id: "manual_monitoring_capacity", area: "manual_observation_only", message: "Manual public monitoring requires owner cadence and cannot guarantee automated coverage." }
  ];
}

export function createManualPublicMonitoringBoundaryDecision(input: TeoyubeManualPublicMonitoringBoundaryInput = {}): TeoyubeManualPublicMonitoringBoundaryDecision {
  const blockers = getManualPublicMonitoringBoundaryBlockers(input);
  if (blockers.length) return "blocked";
  return getManualPublicMonitoringBoundaryWarnings().length ? "manual_monitoring_ready_with_warnings" : "manual_monitoring_ready";
}

export function validateManualPublicMonitoringBoundaries(input: TeoyubeManualPublicMonitoringBoundaryInput = {}): boolean {
  return getManualPublicMonitoringBoundaryBlockers(input).length === 0;
}

export function createManualPublicMonitoringBoundaryReport(input: TeoyubeManualPublicMonitoringBoundaryInput = {}): TeoyubeManualPublicMonitoringBoundaryReport {
  const blockers = getManualPublicMonitoringBoundaryBlockers(input);
  const warnings = getManualPublicMonitoringBoundaryWarnings();
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "valid_with_warnings" : "valid",
    decision: createManualPublicMonitoringBoundaryDecision(input),
    rules: getManualPublicMonitoringBoundaryRules(input),
    blockers,
    warnings,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noTrackingEnabled: true,
    noAutomaticAlertsEnabled: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
