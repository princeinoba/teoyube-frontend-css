export type TeoyubeBetaOperationsKnownLimitationArea =
  | "manual_operations"
  | "manual_feedback"
  | "manual_support"
  | "service_disabled"
  | "admin_prototype"
  | "privacy_consent"
  | "safety_theology"
  | "professional_advice"
  | "unknown";

export type TeoyubeBetaOperationsKnownLimitation = {
  id: string;
  area: TeoyubeBetaOperationsKnownLimitationArea;
  label: string;
  details: string;
  visibleToOwner: true;
};

export type TeoyubeBetaOperationsKnownLimitationsReport = {
  valid: boolean;
  limitations: TeoyubeBetaOperationsKnownLimitation[];
  notice: string;
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

function limitation(id: string, area: TeoyubeBetaOperationsKnownLimitationArea, label: string, details: string): TeoyubeBetaOperationsKnownLimitation {
  return { id, area, label, details, visibleToOwner: true };
}

export function getBetaOperationsKnownLimitations(): TeoyubeBetaOperationsKnownLimitation[] {
  return [
    limitation("manual_beta_operations", "manual_operations", "Beta operations remain manual", "Code does not launch or operate beta sessions automatically."),
    limitation("manual_feedback_review", "manual_feedback", "Feedback review is manual", "Feedback is manually reviewed and not collected automatically."),
    limitation("manual_support_workflow", "manual_support", "Support workflow is manual", "Support requests are manually reviewed and no messages are sent by code."),
    limitation("services_disabled", "service_disabled", "Services remain disabled", "Services remain disabled unless future owner/privacy/security/cost/rollback approval exists."),
    limitation("admin_prototype_only", "admin_prototype", "Admin workflow remains prototype-only", "No production CMS, admin authentication, or admin persistence is enabled."),
    limitation("database_disabled", "service_disabled", "No database persistence", "No database persistence is enabled."),
    limitation("analytics_disabled", "service_disabled", "No analytics", "No external analytics are enabled."),
    limitation("live_ai_disabled", "service_disabled", "No live AI orchestration", "No live AI orchestration is enabled."),
    limitation("monitoring_disabled", "service_disabled", "No production monitoring provider", "No production monitoring provider is connected."),
    limitation("sensitive_info_warning", "privacy_consent", "Avoid sensitive personal information", "Users should not submit sensitive personal information."),
    limitation("no_divine_certainty", "safety_theology", "No divine certainty", "Teoyube does not claim divine certainty or direct commands from God."),
    limitation("no_professional_advice", "professional_advice", "No professional advice", "Teoyube is not medical, legal, financial, emergency, or professional counseling advice.")
  ];
}

export function getBetaOperationsKnownLimitationsByArea(area: TeoyubeBetaOperationsKnownLimitationArea): TeoyubeBetaOperationsKnownLimitation[] {
  return getBetaOperationsKnownLimitations().filter((entry) => entry.area === area);
}

export function createBetaOperationsKnownLimitationsNotice(): string {
  return "Controlled beta operations remain manual. Feedback and support review are manual, services remain disabled unless future approval exists, users should avoid sensitive personal information, and Teoyube does not claim divine certainty or provide professional advice.";
}

export function createBetaOperationsKnownLimitationsReport(): TeoyubeBetaOperationsKnownLimitationsReport {
  const limitations = getBetaOperationsKnownLimitations();
  return {
    valid: limitations.length > 0,
    limitations,
    notice: createBetaOperationsKnownLimitationsNotice(),
    warnings: ["Known limitations should be reviewed with the owner before any real controlled beta operation."],
    manualOnly: true,
    inMemoryOnly: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
