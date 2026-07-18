import type { TeoyubePublicLaunchRiskCategory } from "./soft-launch-completion-contracts";

export type TeoyubePublicLaunchKnownLimitation = {
  id: string;
  category: TeoyubePublicLaunchRiskCategory;
  surface: string;
  label: string;
  message: string;
};

const LIMITATIONS: TeoyubePublicLaunchKnownLimitation[] = [
  {
    id: "public_launch_not_performed",
    category: "production_services",
    surface: "Launch",
    label: "Public launch has not occurred",
    message: "This stage confirms readiness for public launch preparation, not public launch execution."
  },
  {
    id: "production_persistence_requires_explicit_connection",
    category: "production_services",
    surface: "Persistence",
    label: "Production persistence still requires explicit connection",
    message: "Production database persistence remains disabled until a later controlled service-connection step."
  },
  {
    id: "external_analytics_requires_explicit_connection",
    category: "production_services",
    surface: "Analytics",
    label: "External analytics still requires explicit connection",
    message: "External analytics remains disabled until payload, consent, and provider review are complete."
  },
  {
    id: "live_ai_requires_explicit_connection",
    category: "ai_companion",
    surface: "AI Companion",
    label: "Live AI orchestration still requires explicit connection",
    message: "Live AI orchestration remains disabled until grounding, safety, fallback, and provider controls are reviewed."
  },
  {
    id: "personalization_consent_aware",
    category: "personalization",
    surface: "Personalization",
    label: "Personalization remains consent-aware",
    message: "Personalization must remain visible, reversible, and consent-aware."
  },
  {
    id: "sensitive_information_not_requested",
    category: "privacy",
    surface: "Feedback",
    label: "Sensitive personal information should not be submitted",
    message: "Users should not submit sensitive personal information unless future privacy terms and storage rules are finalized."
  },
  {
    id: "scripture_explanation_required",
    category: "scripture_anchor",
    surface: "TIG",
    label: "Scripture anchors and explanation paths remain required",
    message: "Public launch preparation must preserve Scripture anchoring and explanation paths."
  },
  {
    id: "fallback_paths_enabled",
    category: "fallback",
    surface: "Fallback",
    label: "Fallback paths remain enabled",
    message: "Fallback and offline paths remain enabled and Scripture-anchored."
  },
  {
    id: "features_limited_until_public_launch_preparation",
    category: "unknown",
    surface: "Product",
    label: "Some features may remain limited",
    message: "Some features may remain limited until public launch preparation is complete."
  }
];

export function getPublicLaunchKnownLimitations(): TeoyubePublicLaunchKnownLimitation[] {
  return LIMITATIONS;
}

export function getPublicLaunchKnownLimitationsByCategory(category: TeoyubePublicLaunchRiskCategory): TeoyubePublicLaunchKnownLimitation[] {
  return LIMITATIONS.filter((entry) => entry.category === category);
}

export function getPublicLaunchKnownLimitationsBySurface(surface: string): TeoyubePublicLaunchKnownLimitation[] {
  return LIMITATIONS.filter((entry) => entry.surface.toLowerCase() === surface.toLowerCase());
}

export function createPublicLaunchKnownLimitationsNotice(): string {
  return LIMITATIONS.map((entry) => entry.message).join(" ");
}

export function createPublicLaunchKnownLimitationsReport() {
  return {
    valid: LIMITATIONS.length >= 8,
    ready: LIMITATIONS.length >= 8,
    limitations: LIMITATIONS,
    limitationCount: LIMITATIONS.length,
    notice: createPublicLaunchKnownLimitationsNotice(),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
