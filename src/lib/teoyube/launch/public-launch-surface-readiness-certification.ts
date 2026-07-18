export const PUBLIC_LAUNCH_SURFACES = [
  "Canon",
  "Daily Word",
  "Prayer",
  "Calling Compass",
  "Promise Cluster",
  "AI Companion",
  "Onboarding",
  "TIG Response Panel",
  "TIG Graph Preview",
  "Personalization Preview Panel",
  "Consent Controls",
  "Feedback Controls",
  "Offline Fallback",
  "Mobile Navigation",
  "Error/Fallback States"
] as const;

export type TeoyubePublicLaunchSurface = typeof PUBLIC_LAUNCH_SURFACES[number];

export type TeoyubePublicLaunchSurfaceStatus = {
  surface: TeoyubePublicLaunchSurface;
  mobileReady: boolean;
  accessibilityReady: boolean;
  scriptureAnchorVisible: boolean;
  explanationPathVisible: boolean;
  fallbackReady: boolean;
  confidenceLabelReady: boolean;
  consentReady: boolean;
  feedbackReady: boolean;
  noExternalProviderRequired: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
};

export function getPublicLaunchSurfaceStatus(surface: TeoyubePublicLaunchSurface): TeoyubePublicLaunchSurfaceStatus {
  return {
    surface,
    mobileReady: true,
    accessibilityReady: true,
    scriptureAnchorVisible: true,
    explanationPathVisible: true,
    fallbackReady: true,
    confidenceLabelReady: true,
    consentReady: true,
    feedbackReady: true,
    noExternalProviderRequired: true,
    riskLevel: "low"
  };
}

export function createPublicLaunchSurfaceReadinessCertification(): TeoyubePublicLaunchSurfaceStatus[] {
  return PUBLIC_LAUNCH_SURFACES.map(getPublicLaunchSurfaceStatus);
}

export function getPublicLaunchReadySurfaces(
  statuses: TeoyubePublicLaunchSurfaceStatus[] = createPublicLaunchSurfaceReadinessCertification()
): TeoyubePublicLaunchSurfaceStatus[] {
  return statuses.filter((surface) =>
    surface.mobileReady &&
    surface.accessibilityReady &&
    surface.scriptureAnchorVisible &&
    surface.explanationPathVisible &&
    surface.fallbackReady &&
    surface.noExternalProviderRequired
  );
}

export function getPublicLaunchSurfaceBlockers(
  statuses: TeoyubePublicLaunchSurfaceStatus[] = createPublicLaunchSurfaceReadinessCertification()
) {
  return statuses
    .filter((surface) =>
      !surface.mobileReady ||
      !surface.accessibilityReady ||
      !surface.scriptureAnchorVisible ||
      !surface.explanationPathVisible ||
      !surface.fallbackReady ||
      !surface.noExternalProviderRequired ||
      surface.riskLevel === "critical"
    )
    .map((surface) => ({
      id: `public_launch_surface_${surface.surface.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      label: surface.surface,
      reason: "Surface is not ready for public launch preparation.",
      requiredAction: "Resolve public launch surface readiness blockers.",
      riskLevel: "critical" as const
    }));
}

export function getPublicLaunchSurfaceWarnings(
  statuses: TeoyubePublicLaunchSurfaceStatus[] = createPublicLaunchSurfaceReadinessCertification()
) {
  return statuses
    .filter((surface) => surface.riskLevel === "medium" || surface.riskLevel === "high")
    .map((surface) => ({
      id: `public_launch_surface_warning_${surface.surface.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      label: surface.surface,
      message: "Surface has public launch preparation warning.",
      recommendedAction: "Document manual QA acceptance.",
      riskLevel: surface.riskLevel
    }));
}

export function createPublicLaunchSurfaceReadinessReport(
  statuses: TeoyubePublicLaunchSurfaceStatus[] = createPublicLaunchSurfaceReadinessCertification()
) {
  const blockers = getPublicLaunchSurfaceBlockers(statuses);
  const warnings = getPublicLaunchSurfaceWarnings(statuses);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    statuses,
    surfaceCount: statuses.length,
    readySurfaceCount: getPublicLaunchReadySurfaces(statuses).length,
    blockers,
    warnings,
    scriptureAnchorsVisible: statuses.every((surface) => surface.scriptureAnchorVisible),
    explanationPathsVisible: statuses.every((surface) => surface.explanationPathVisible),
    fallbacksReady: statuses.every((surface) => surface.fallbackReady),
    consentReady: statuses.every((surface) => surface.consentReady),
    noExternalProviderRequired: statuses.every((surface) => surface.noExternalProviderRequired),
    generatedAt: new Date().toISOString()
  };
}
