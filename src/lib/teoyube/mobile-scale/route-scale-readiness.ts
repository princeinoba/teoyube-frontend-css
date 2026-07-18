import type {
  TeoyubeRouteScaleProfile,
  TeoyubeScaleReadinessCheck,
  TeoyubeScaleReadinessReport,
  TeoyubeSurfaceScaleProfile
} from "./scale-readiness-contracts";

const ROUTE_SCALE_INVENTORY: TeoyubeRouteScaleProfile[] = [
  {
    id: "canon",
    route: "/explore",
    surface: "Canon",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "planned",
    offlineFallbackReadiness: "planned",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "medium",
    recommendedFollowUp: "Add production route metrics only after privacy-safe analytics connection."
  },
  {
    id: "daily_word",
    route: "/",
    surface: "Daily Word",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "ready",
    offlineFallbackReadiness: "ready",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "low",
    recommendedFollowUp: "Keep read-only Scripture fallback available for slow or offline sessions."
  },
  {
    id: "prayer",
    route: "/prayer",
    surface: "Prayer",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "planned",
    offlineFallbackReadiness: "ready",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "medium",
    recommendedFollowUp: "Connect saved prayers only through a future consent-aware persistence adapter."
  },
  {
    id: "calling_compass",
    route: "/compass",
    surface: "Calling Compass",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "planned",
    offlineFallbackReadiness: "planned",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "medium",
    recommendedFollowUp: "Keep calling language soft, Scripture-tested, and explainable."
  },
  {
    id: "promise_cluster",
    route: "/tig",
    surface: "Promise Cluster",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "ready",
    offlineFallbackReadiness: "ready",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "low",
    recommendedFollowUp: "Keep graph preview capped and defer expanded visual maps on mobile."
  },
  {
    id: "ai_companion",
    route: "/tig",
    surface: "AI Companion",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "ready",
    offlineFallbackReadiness: "ready",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "medium",
    recommendedFollowUp: "Do not add live AI orchestration until graph grounding remains stable in production."
  },
  {
    id: "onboarding",
    route: "/tig/onboarding",
    surface: "Onboarding",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "ready",
    offlineFallbackReadiness: "ready",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "low",
    recommendedFollowUp: "Keep local onboarding controls reversible from the privacy page."
  },
  {
    id: "personalization_controls",
    route: "/profile",
    surface: "Personalization Consent Controls",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "planned",
    offlineFallbackReadiness: "planned",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "medium",
    recommendedFollowUp: "Preserve consent reset/export/delete controls before persistence."
  },
  {
    id: "feedback_controls",
    route: "/tig",
    surface: "Feedback Controls",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "planned",
    offlineFallbackReadiness: "planned",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "medium",
    recommendedFollowUp: "Keep feedback explicit and reversible."
  },
  {
    id: "tig_response_panel",
    route: "/tig",
    surface: "TIG Response Panel",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "ready",
    offlineFallbackReadiness: "ready",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "low",
    recommendedFollowUp: "Keep Scripture first and graph details deferred when response payloads grow."
  },
  {
    id: "tig_graph_preview",
    route: "/tig/graph",
    surface: "TIG Graph Preview",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "ready",
    offlineFallbackReadiness: "ready",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "medium",
    recommendedFollowUp: "Keep full graph rendering bounded by node and edge budgets."
  },
  {
    id: "personalization_preview",
    route: "/profile",
    surface: "Personalization Preview Panel",
    mobileReadiness: "ready",
    performanceReadiness: "ready",
    cacheReadiness: "planned",
    offlineFallbackReadiness: "planned",
    personalizationSafetyReadiness: "ready",
    eventReadiness: "planned",
    deploymentRiskLevel: "medium",
    recommendedFollowUp: "Keep preview-only personalization separate from production response selection."
  }
];

function asSurfaceProfile(profile: TeoyubeRouteScaleProfile): TeoyubeSurfaceScaleProfile {
  const { route: _route, ...surfaceProfile } = profile;
  return surfaceProfile;
}

export function getTeoyubeRouteScaleInventory(): TeoyubeRouteScaleProfile[] {
  return ROUTE_SCALE_INVENTORY.map((profile) => ({ ...profile }));
}

export function getRouteScaleProfile(route: string): TeoyubeRouteScaleProfile | undefined {
  const normalized = route.trim().toLowerCase();
  const profile = ROUTE_SCALE_INVENTORY.find(
    (item) => item.id === normalized || item.route.toLowerCase() === normalized
  );
  return profile ? { ...profile } : undefined;
}

export function getSurfaceScaleProfile(surface: string): TeoyubeSurfaceScaleProfile | undefined {
  const normalized = surface.trim().toLowerCase();
  const profile = ROUTE_SCALE_INVENTORY.find(
    (item) =>
      item.id === normalized ||
      item.surface.toLowerCase() === normalized ||
      item.surface.toLowerCase().replace(/\s+/g, "_") === normalized
  );
  return profile ? asSurfaceProfile(profile) : undefined;
}

export function validateRouteScaleReadiness(route: string) {
  const profile = getRouteScaleProfile(route) || getSurfaceScaleProfile(route);
  const errors = profile
    ? []
    : [`No route or surface scale profile found for ${route || "unknown route"}.`];

  return {
    valid: errors.length === 0,
    profile,
    errors,
    warnings: profile
      ? [profile.recommendedFollowUp]
      : ["Add the route to the Phase 7.4 route scale inventory before deployment."]
  };
}

function routeCheck(profile: TeoyubeRouteScaleProfile): TeoyubeScaleReadinessCheck {
  const statuses = [
    profile.mobileReadiness,
    profile.performanceReadiness,
    profile.cacheReadiness,
    profile.offlineFallbackReadiness,
    profile.personalizationSafetyReadiness,
    profile.eventReadiness
  ];
  const blocked = statuses.some((status) => status === "blocked" || status === "needs_work");

  return {
    id: profile.id,
    label: `${profile.surface} scale readiness`,
    status: blocked ? "needs_work" : "ready",
    required: true,
    riskLevel: profile.deploymentRiskLevel,
    details: profile.recommendedFollowUp
  };
}

export function createRouteScaleReadinessReport(): TeoyubeScaleReadinessReport {
  const checks = ROUTE_SCALE_INVENTORY.map(routeCheck);
  const complete = checks.filter((item) => item.status === "ready");
  const warnings = ROUTE_SCALE_INVENTORY.map((profile) => profile.recommendedFollowUp);

  return {
    id: "phase_7_4_route_scale_readiness",
    title: "Route and Surface Scale Readiness",
    status: complete.length === checks.length ? "ready" : "needs_work",
    target: "preview",
    complete: complete.length === checks.length,
    completionPercentage: Math.round((complete.length / Math.max(1, checks.length)) * 100),
    checks,
    warnings,
    generatedAt: new Date().toISOString()
  };
}

