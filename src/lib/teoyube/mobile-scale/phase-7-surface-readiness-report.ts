import {
  getTeoyubeRouteScaleInventory
} from "./route-scale-readiness";
import type {
  TeoyubeDeploymentReadinessStatus,
  TeoyubeRouteScaleProfile
} from "./scale-readiness-contracts";

export type Phase7SurfaceReadiness = {
  id: string;
  surface: string;
  route: string;
  mobileReadiness: TeoyubeDeploymentReadinessStatus;
  performanceReadiness: TeoyubeDeploymentReadinessStatus;
  cacheReadiness: TeoyubeDeploymentReadinessStatus;
  offlineFallbackReadiness: TeoyubeDeploymentReadinessStatus;
  safetyReadiness: TeoyubeDeploymentReadinessStatus;
  consentReadiness: TeoyubeDeploymentReadinessStatus;
  eventReadiness: TeoyubeDeploymentReadinessStatus;
  deploymentReadiness: TeoyubeDeploymentReadinessStatus;
  followUpItems: string[];
};

export type Phase7SurfaceReadinessReport = {
  phase: "Phase 7.5 - Final Mobile & Scale Completion Audit";
  complete: boolean;
  surfaceCount: number;
  optimizedSurfaceCount: number;
  surfaces: Phase7SurfaceReadiness[];
  followUpItems: string[];
  generatedAt: string;
};

function toSurfaceReadiness(profile: TeoyubeRouteScaleProfile): Phase7SurfaceReadiness {
  return {
    id: profile.id,
    surface: profile.surface,
    route: profile.route,
    mobileReadiness: profile.mobileReadiness,
    performanceReadiness: profile.performanceReadiness,
    cacheReadiness: profile.cacheReadiness,
    offlineFallbackReadiness: profile.offlineFallbackReadiness,
    safetyReadiness: profile.personalizationSafetyReadiness,
    consentReadiness: profile.personalizationSafetyReadiness,
    eventReadiness: profile.eventReadiness,
    deploymentReadiness: profile.deploymentRiskLevel === "low" ? "ready" : "planned",
    followUpItems: [profile.recommendedFollowUp]
  };
}

export function createPhase7SurfaceReadinessReport(): Phase7SurfaceReadinessReport {
  const surfaces = getTeoyubeRouteScaleInventory().map(toSurfaceReadiness);
  const optimized = getPhase7MobileOptimizedSurfaces();

  return {
    phase: "Phase 7.5 - Final Mobile & Scale Completion Audit",
    complete: surfaces.length >= 12 && optimized.length >= 12,
    surfaceCount: surfaces.length,
    optimizedSurfaceCount: optimized.length,
    surfaces,
    followUpItems: getPhase7SurfaceFollowUpItems(),
    generatedAt: new Date().toISOString()
  };
}

export function getPhase7SurfaceReadinessBySurface(
  surface: string
): Phase7SurfaceReadiness | undefined {
  const normalized = surface.trim().toLowerCase();
  return createPhase7SurfaceReadinessReport().surfaces.find(
    (entry) =>
      entry.id === normalized ||
      entry.surface.toLowerCase() === normalized ||
      entry.surface.toLowerCase().replace(/\s+/g, "_") === normalized
  );
}

export function getPhase7MobileOptimizedSurfaces(): Phase7SurfaceReadiness[] {
  return getTeoyubeRouteScaleInventory()
    .map(toSurfaceReadiness)
    .filter(
      (entry) =>
        entry.mobileReadiness === "ready" &&
        entry.performanceReadiness === "ready" &&
        entry.safetyReadiness === "ready"
    );
}

export function getPhase7SurfaceFollowUpItems(): string[] {
  return getTeoyubeRouteScaleInventory().map(
    (profile) => `${profile.surface}: ${profile.recommendedFollowUp}`
  );
}
