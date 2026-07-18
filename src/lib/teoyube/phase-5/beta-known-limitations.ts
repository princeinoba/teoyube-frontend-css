export type TeoyubeControlledBetaKnownLimitationArea =
  | "beta_scope"
  | "services"
  | "feedback"
  | "content_gate"
  | "admin"
  | "privacy"
  | "spiritual_safety"
  | "professional_advice"
  | "unknown";

export type TeoyubeControlledBetaKnownLimitation = {
  id: string;
  area: TeoyubeControlledBetaKnownLimitationArea;
  label: string;
  details: string;
};

export type TeoyubeControlledBetaKnownLimitationsReport = {
  limitations: TeoyubeControlledBetaKnownLimitation[];
  notice: string;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function limitation(id: string, area: TeoyubeControlledBetaKnownLimitationArea, label: string, details: string): TeoyubeControlledBetaKnownLimitation {
  return { id, area, label, details };
}

export function getControlledBetaKnownLimitations(): TeoyubeControlledBetaKnownLimitation[] {
  return [
    limitation("controlled_manual_beta", "beta_scope", "Controlled manual beta only", "Beta remains controlled, limited, and manually coordinated; no beta is launched from code."),
    limitation("services_disabled", "services", "Services remain disabled", "Database persistence, analytics, production monitoring, admin auth, CMS, user accounts, email notifications, and live AI remain disabled unless future approval exists."),
    limitation("manual_feedback_only", "feedback", "Feedback collection is manual", "No automatic feedback collection, event stream, external form, or background collection is enabled unless future approval exists."),
    limitation("reviewed_content_gates_active", "content_gate", "Reviewed content gates stay active", "Review-only content must not appear in live flows and reviewed content is not published automatically."),
    limitation("admin_prototype_only", "admin", "Admin workflow is prototype-only", "Controlled admin workflow remains in-memory and does not authenticate, persist, publish, or modify production data."),
    limitation("no_database_persistence", "services", "No database persistence", "No database persistence is enabled for beta readiness or user personalization."),
    limitation("no_analytics", "services", "No analytics", "No external analytics are enabled."),
    limitation("no_live_ai", "services", "No live AI orchestration", "Live AI orchestration remains disabled; surfaces depend on existing local data and safe fallbacks."),
    limitation("no_monitoring_provider", "services", "No production monitoring provider", "Production monitoring providers remain unconnected and plan-only."),
    limitation("no_sensitive_information", "privacy", "Do not submit sensitive personal information", "Users and reviewers should not submit sensitive prayer, calling, medical, legal, financial, emergency, or identifying information."),
    limitation("no_divine_certainty", "spiritual_safety", "No divine certainty", "Teoyube does not claim divine certainty and keeps confidence labels and explanations visible."),
    limitation("not_professional_advice", "professional_advice", "Not professional advice", "Teoyube is not medical, legal, financial, emergency, or professional counseling advice.")
  ];
}

export function getControlledBetaKnownLimitationsByArea(area: TeoyubeControlledBetaKnownLimitationArea): TeoyubeControlledBetaKnownLimitation[] {
  return getControlledBetaKnownLimitations().filter((entry) => entry.area === area);
}

export function createControlledBetaKnownLimitationsNotice(): string {
  return [
    "Teoyube controlled beta readiness is manual, service-disabled, and preparation-only.",
    "Do not submit sensitive personal information.",
    "Teoyube does not claim divine certainty and is not medical, legal, financial, emergency, or professional counseling advice."
  ].join(" ");
}

export function createControlledBetaKnownLimitationsReport(): TeoyubeControlledBetaKnownLimitationsReport {
  return {
    limitations: getControlledBetaKnownLimitations(),
    notice: createControlledBetaKnownLimitationsNotice(),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
