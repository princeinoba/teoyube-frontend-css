import type { TeoyubePostLaunchRiskCategory } from "./public-launch-completion-contracts";

export type TeoyubePostLaunchKnownLimitation = {
  id: string;
  category: TeoyubePostLaunchRiskCategory;
  surface: string;
  label: string;
  message: string;
};

const LIMITATIONS: TeoyubePostLaunchKnownLimitation[] = [
  {
    id: "completion_review_not_future_service_connection",
    category: "production_services",
    surface: "Launch",
    label: "Completion review does not connect all future services",
    message: "Public launch completion review does not mean all future production services are connected."
  },
  {
    id: "production_persistence_requires_explicit_connection",
    category: "production_services",
    surface: "Persistence",
    label: "Production persistence still requires explicit connection",
    message: "Production database persistence may still require explicit connection later."
  },
  {
    id: "external_analytics_requires_explicit_connection",
    category: "production_services",
    surface: "Analytics",
    label: "External analytics still requires explicit connection",
    message: "External analytics may still require explicit connection later after consent and payload review."
  },
  {
    id: "live_ai_requires_explicit_connection",
    category: "ai_companion",
    surface: "AI Companion",
    label: "Live AI orchestration still requires explicit connection",
    message: "Live AI orchestration may still require explicit connection later after grounding, safety, and fallback review."
  },
  {
    id: "personalization_consent_aware",
    category: "personalization",
    surface: "Personalization",
    label: "Personalization remains consent-aware",
    message: "Personalization remains visible, reversible, and consent-aware."
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
    message: "Scripture anchors and explanation paths remain required after public launch completion review."
  },
  {
    id: "fallback_paths_enabled",
    category: "fallback",
    surface: "Fallback",
    label: "Fallback paths remain enabled",
    message: "Fallback paths remain enabled and Scripture-anchored."
  },
  {
    id: "features_limited_until_post_launch_improvements",
    category: "unknown",
    surface: "Product",
    label: "Some features may remain limited",
    message: "Some features may remain limited until post-launch improvements are complete."
  }
];

export function getPostLaunchKnownLimitations(): TeoyubePostLaunchKnownLimitation[] {
  return LIMITATIONS;
}

export function getPostLaunchKnownLimitationsByCategory(category: TeoyubePostLaunchRiskCategory): TeoyubePostLaunchKnownLimitation[] {
  return LIMITATIONS.filter((entry) => entry.category === category);
}

export function getPostLaunchKnownLimitationsBySurface(surface: string): TeoyubePostLaunchKnownLimitation[] {
  return LIMITATIONS.filter((entry) => entry.surface.toLowerCase() === surface.toLowerCase());
}

export function createPostLaunchKnownLimitationsNotice(): string {
  return LIMITATIONS.map((entry) => entry.message).join(" ");
}

export function createPostLaunchKnownLimitationsReport() {
  return {
    valid: LIMITATIONS.length >= 8,
    ready: LIMITATIONS.length >= 8,
    limitations: LIMITATIONS,
    limitationCount: LIMITATIONS.length,
    notice: createPostLaunchKnownLimitationsNotice(),
    noUsersContacted: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
