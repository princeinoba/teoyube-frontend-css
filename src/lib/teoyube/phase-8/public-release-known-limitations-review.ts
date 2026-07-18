export type TeoyubePublicReleaseKnownLimitationArea =
  | "release_status"
  | "services"
  | "feedback"
  | "support"
  | "admin"
  | "privacy"
  | "safety"
  | "unknown";

export type TeoyubePublicReleaseKnownLimitation = {
  id: string;
  area: TeoyubePublicReleaseKnownLimitationArea;
  message: string;
};

export type TeoyubePublicReleaseKnownLimitationsReport = {
  valid: boolean;
  limitations: TeoyubePublicReleaseKnownLimitation[];
  notice: string;
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function getPublicReleaseKnownLimitations(): TeoyubePublicReleaseKnownLimitation[] {
  return [
    { id: "not_publicly_launched", area: "release_status", message: "Public release is not launched by this step." },
    { id: "services_disabled", area: "services", message: "Services remain disabled unless future approval exists." },
    { id: "feedback_manual", area: "feedback", message: "Feedback review is manual unless future approval exists." },
    { id: "support_manual", area: "support", message: "Support workflow is manual unless future approval exists." },
    { id: "admin_prototype_only", area: "admin", message: "Admin workflow remains prototype-only unless future approval exists." },
    { id: "database_disabled", area: "services", message: "No database persistence is enabled." },
    { id: "analytics_disabled", area: "services", message: "No analytics are enabled." },
    { id: "live_ai_disabled", area: "services", message: "No live AI orchestration is enabled." },
    { id: "monitoring_disabled", area: "services", message: "No production monitoring provider is connected." },
    { id: "avoid_sensitive_info", area: "privacy", message: "Users should not submit sensitive personal information." },
    { id: "no_divine_certainty", area: "safety", message: "Teoyube does not claim divine certainty." },
    { id: "not_professional_advice", area: "safety", message: "Teoyube is not medical, legal, financial, emergency, or professional counseling advice." }
  ];
}

export function getPublicReleaseKnownLimitationsByArea(area: TeoyubePublicReleaseKnownLimitationArea): TeoyubePublicReleaseKnownLimitation[] {
  return getPublicReleaseKnownLimitations().filter((entry) => entry.area === area);
}

export function createPublicReleaseKnownLimitationsNotice(): string {
  return getPublicReleaseKnownLimitations().map((entry) => entry.message).join(" ");
}

export function validatePublicReleaseKnownLimitations(input: {
  limitations?: TeoyubePublicReleaseKnownLimitation[];
} = {}): boolean {
  const limitations = input.limitations || getPublicReleaseKnownLimitations();
  const ids = new Set(limitations.map((entry) => entry.id));
  return [
    "not_publicly_launched",
    "services_disabled",
    "feedback_manual",
    "support_manual",
    "admin_prototype_only",
    "database_disabled",
    "analytics_disabled",
    "live_ai_disabled",
    "monitoring_disabled",
    "avoid_sensitive_info",
    "no_divine_certainty",
    "not_professional_advice"
  ].every((id) => ids.has(id));
}

export function createPublicReleaseKnownLimitationsReport(input: {
  limitations?: TeoyubePublicReleaseKnownLimitation[];
} = {}): TeoyubePublicReleaseKnownLimitationsReport {
  const limitations = input.limitations || getPublicReleaseKnownLimitations();
  const valid = validatePublicReleaseKnownLimitations({ limitations });
  return {
    valid,
    limitations,
    notice: createPublicReleaseKnownLimitationsNotice(),
    blockers: valid ? [] : ["Required public release known limitations are missing."],
    warnings: ["Known limitations are review copy only and do not launch or publish public release materials."],
    noPublicLaunchPerformed: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
