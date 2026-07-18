import { createFinalAnalyticsGoNoGoReport, type TeoyubeFinalAnalyticsInput } from "./final-analytics-go-no-go";
import { createFinalDatabasePersistenceGoNoGoReport, type TeoyubeFinalDatabasePersistenceInput } from "./final-database-persistence-go-no-go";
import { createFinalLiveAiGoNoGoReport, type TeoyubeFinalLiveAiInput } from "./final-live-ai-go-no-go";
import type {
  TeoyubeFinalProductionServiceDecision,
  TeoyubeFinalPublicGoNoGoCheck,
  TeoyubeFinalPublicGoNoGoDecision,
  TeoyubeFinalPublicLaunchBlocker,
  TeoyubeFinalPublicLaunchWarning
} from "./final-public-go-no-go-contracts";

export type TeoyubeFinalProductionServiceDecisionInput = {
  database?: TeoyubeFinalDatabasePersistenceInput;
  analytics?: TeoyubeFinalAnalyticsInput;
  liveAi?: TeoyubeFinalLiveAiInput;
  monitoringRequired?: boolean;
  monitoringConnected?: boolean;
  emailNotificationsRequired?: boolean;
  emailNotificationsConnected?: boolean;
  storageRequired?: boolean;
  storageConnected?: boolean;
  authenticationRequired?: boolean;
  authenticationConnected?: boolean;
  consentControlsEnabled?: boolean;
  scriptureAnchoringRequired?: boolean;
  explanationPathsRequired?: boolean;
  deterministicTigEnabled?: boolean;
  publicLaunchPerformed?: boolean;
  externalServicesCalled?: boolean;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeFinalPublicGoNoGoCheck {
  return { id, label, category: "security", required: true, complete, status: complete ? "ready" : "blocked", launchCritical: true, details };
}

function blocker(id: string, reason: string): TeoyubeFinalPublicLaunchBlocker {
  return { id, label: id.replace(/_/g, " "), category: "security", riskLevel: "critical", reason, requiredAction: "Resolve the production service decision before public launch execution preparation." };
}

function serviceDecision(input: TeoyubeFinalProductionServiceDecision): TeoyubeFinalProductionServiceDecision {
  return input;
}

export function createFinalProductionServiceDecisionChecklist(input: TeoyubeFinalProductionServiceDecisionInput = {}): TeoyubeFinalPublicGoNoGoCheck[] {
  return [
    check("final_services_database_disabled", "Database persistence decision reviewed", !input.database?.databaseConnected, "Production persistence remains disabled unless explicitly reviewed later."),
    check("final_services_analytics_disabled", "Analytics decision reviewed", !input.analytics?.analyticsConnected && !input.analytics?.analyticsSent, "External analytics remain disabled and unsent."),
    check("final_services_live_ai_disabled", "Live AI decision reviewed", !input.liveAi?.liveAiEnabled && !input.liveAi?.openAiApiCalled, "Live AI orchestration remains disabled."),
    check("final_services_deterministic_tig_enabled", "Deterministic TIG enabled", input.deterministicTigEnabled !== false, "Deterministic TIG production layer remains the safe default."),
    check("final_services_consent_enabled", "Consent controls enabled", input.consentControlsEnabled !== false, "Consent controls remain available."),
    check("final_services_scripture_required", "Scripture anchoring required", input.scriptureAnchoringRequired !== false, "Scripture anchoring remains required."),
    check("final_services_explanation_required", "Explanation paths required", input.explanationPathsRequired !== false, "Explanation paths remain required."),
    check("final_services_no_public_launch", "No public launch performed", !input.publicLaunchPerformed, "5.4 is decision readiness only.")
  ];
}

export function createFinalProductionServiceDecisionRecords(input: TeoyubeFinalProductionServiceDecisionInput = {}): TeoyubeFinalProductionServiceDecision[] {
  return [
    serviceDecision({ id: "final_service_database", service: "database_persistence", label: "Database persistence", status: "disabled_for_public_launch", requiredForPublicLaunch: false, approvedForPublicLaunch: false, connected: Boolean(input.database?.databaseConnected), deferred: true, requiresFutureSetup: true, details: "Production persistence remains disabled unless explicitly reviewed in a later setup step." }),
    serviceDecision({ id: "final_service_analytics", service: "external_analytics", label: "External analytics", status: "disabled_for_public_launch", requiredForPublicLaunch: false, approvedForPublicLaunch: false, connected: Boolean(input.analytics?.analyticsConnected), deferred: true, requiresFutureSetup: true, details: "External analytics remain disabled and unsent." }),
    serviceDecision({ id: "final_service_live_ai", service: "live_ai_orchestration", label: "Live AI orchestration", status: "disabled_for_public_launch", requiredForPublicLaunch: false, approvedForPublicLaunch: false, connected: Boolean(input.liveAi?.liveAiEnabled), deferred: true, requiresFutureSetup: true, details: "Live AI remains disabled; deterministic TIG remains the safe default." }),
    serviceDecision({ id: "final_service_monitoring", service: "monitoring", label: "Production monitoring", status: input.monitoringRequired ? "requires_future_setup" : "deferred_for_later_setup", requiredForPublicLaunch: Boolean(input.monitoringRequired), approvedForPublicLaunch: Boolean(input.monitoringConnected), connected: Boolean(input.monitoringConnected), deferred: !input.monitoringConnected, requiresFutureSetup: true, details: "Production monitoring is documented for a later controlled setup step." }),
    serviceDecision({ id: "final_service_email_notifications", service: "email_notifications", label: "Email/notification service", status: input.emailNotificationsRequired ? "requires_future_setup" : "deferred_for_later_setup", requiredForPublicLaunch: Boolean(input.emailNotificationsRequired), approvedForPublicLaunch: Boolean(input.emailNotificationsConnected), connected: Boolean(input.emailNotificationsConnected), deferred: !input.emailNotificationsConnected, requiresFutureSetup: true, details: "Email and notification services remain disconnected by this step." }),
    serviceDecision({ id: "final_service_storage", service: "storage", label: "File/object storage", status: input.storageRequired ? "requires_future_setup" : "deferred_for_later_setup", requiredForPublicLaunch: Boolean(input.storageRequired), approvedForPublicLaunch: Boolean(input.storageConnected), connected: Boolean(input.storageConnected), deferred: !input.storageConnected, requiresFutureSetup: true, details: "Storage remains disconnected unless separately approved later." }),
    serviceDecision({ id: "final_service_authentication", service: "authentication", label: "Authentication", status: input.authenticationRequired ? "requires_future_setup" : "deferred_for_later_setup", requiredForPublicLaunch: Boolean(input.authenticationRequired), approvedForPublicLaunch: Boolean(input.authenticationConnected), connected: Boolean(input.authenticationConnected), deferred: !input.authenticationConnected, requiresFutureSetup: true, details: "Authentication is treated as future setup unless already reviewed." }),
    serviceDecision({ id: "final_service_deterministic_tig", service: "deterministic_tig", label: "Deterministic TIG production layer", status: "enabled_required_safe_default", requiredForPublicLaunch: true, approvedForPublicLaunch: true, connected: false, deferred: false, requiresFutureSetup: false, details: "Deterministic TIG remains the safe default and requires no external provider." }),
    serviceDecision({ id: "final_service_consent_controls", service: "consent_controls", label: "Consent controls", status: "enabled_required_safe_default", requiredForPublicLaunch: true, approvedForPublicLaunch: true, connected: false, deferred: false, requiresFutureSetup: false, details: "Consent controls remain enabled and visible." })
  ];
}

export function getFinalProductionServiceBlockers(input: TeoyubeFinalProductionServiceDecisionInput = {}): TeoyubeFinalPublicLaunchBlocker[] {
  return [
    ...createFinalDatabasePersistenceGoNoGoReport(input.database).blockers,
    ...createFinalAnalyticsGoNoGoReport(input.analytics).blockers,
    ...createFinalLiveAiGoNoGoReport(input.liveAi).blockers,
    input.deterministicTigEnabled === false ? blocker("final_services_deterministic_tig_disabled", "Deterministic TIG production layer is disabled.") : undefined,
    input.consentControlsEnabled === false ? blocker("final_services_consent_disabled", "Consent controls are disabled.") : undefined,
    input.scriptureAnchoringRequired === false ? blocker("final_services_scripture_not_required", "Scripture anchoring is not required.") : undefined,
    input.explanationPathsRequired === false ? blocker("final_services_explanation_not_required", "Explanation paths are not required.") : undefined,
    input.publicLaunchPerformed ? blocker("final_services_public_launch_performed", "A public launch action was performed by the decision module.") : undefined,
    input.externalServicesCalled ? blocker("final_services_external_call", "An external service call was performed by the decision module.") : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getFinalProductionServiceWarnings(input: TeoyubeFinalProductionServiceDecisionInput = {}): TeoyubeFinalPublicLaunchWarning[] {
  return [
    ...createFinalDatabasePersistenceGoNoGoReport(input.database).warnings,
    ...createFinalAnalyticsGoNoGoReport(input.analytics).warnings,
    ...createFinalLiveAiGoNoGoReport(input.liveAi).warnings,
    { id: "final_services_future_setup", label: "Future service setup required", category: "security", riskLevel: "medium", message: "Monitoring, notifications, storage, authentication, analytics, persistence, and live AI remain deferred unless separately reviewed.", recommendedAction: "Use later controlled setup steps for any production provider connection." }
  ];
}

export function createFinalProductionServiceDecision(input: TeoyubeFinalProductionServiceDecisionInput = {}): TeoyubeFinalPublicGoNoGoDecision {
  const blockers = getFinalProductionServiceBlockers(input);
  if (blockers.length > 0) return "needs_service_decision";
  return "go_for_public_launch_execution_preparation";
}

export function evaluateFinalProductionServiceDecision(input: TeoyubeFinalProductionServiceDecisionInput = {}) {
  const blockers = getFinalProductionServiceBlockers(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createFinalProductionServiceDecision(input),
    checklist: createFinalProductionServiceDecisionChecklist(input),
    serviceDecisions: createFinalProductionServiceDecisionRecords(input),
    blockers,
    warnings: getFinalProductionServiceWarnings(input)
  };
}

export function createFinalProductionServiceDecisionReport(input: TeoyubeFinalProductionServiceDecisionInput = {}) {
  const evaluation = evaluateFinalProductionServiceDecision(input);
  return {
    ...evaluation,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    deterministicTigPreserved: true,
    consentControlsEnabled: true,
    scriptureAnchoringRequired: true,
    explanationPathsRequired: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
