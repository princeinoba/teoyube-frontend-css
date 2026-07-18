import { REQUIRED_LAUNCH_SURFACES, createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import type { TeoyubePreviewDeploymentStatus } from "./preview-deployment-contracts";

export type TeoyubePreviewSurfaceLaunchStatus = {
  surface: string;
  route?: string;
  previewReadiness: TeoyubePreviewDeploymentStatus;
  mobileReadiness: TeoyubePreviewDeploymentStatus;
  accessibilityReadiness: TeoyubePreviewDeploymentStatus;
  scriptureAnchoringReadiness: TeoyubePreviewDeploymentStatus;
  explanationPathReadiness: TeoyubePreviewDeploymentStatus;
  fallbackReadiness: TeoyubePreviewDeploymentStatus;
  personalizationConsentReadiness: TeoyubePreviewDeploymentStatus;
  offlineFallbackReadiness: TeoyubePreviewDeploymentStatus;
  debugSafetyReadiness: TeoyubePreviewDeploymentStatus;
  knownBlockers: string[];
  knownWarnings: string[];
  manualQaNotes: string[];
};

function readyStatus(value: string): TeoyubePreviewDeploymentStatus {
  return value === "ready" || value === "ready_to_begin" ? "ready" : value === "blocked" ? "blocked" : "needs_review";
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "_");
}

export function getPreviewSurfaceLaunchStatus(surface: string): TeoyubePreviewSurfaceLaunchStatus {
  const launch = createLaunchSurfaceReadinessReport();
  const match = launch.surfaces.find((entry) => entry.surface === surface);

  if (!match) {
    return {
      surface,
      previewReadiness: "needs_review",
      mobileReadiness: "needs_review",
      accessibilityReadiness: "needs_review",
      scriptureAnchoringReadiness: "needs_review",
      explanationPathReadiness: "needs_review",
      fallbackReadiness: "needs_review",
      personalizationConsentReadiness: "needs_review",
      offlineFallbackReadiness: "needs_review",
      debugSafetyReadiness: "needs_review",
      knownBlockers: [],
      knownWarnings: ["Surface is not mapped in the launch surface readiness report."],
      manualQaNotes: ["Map this surface manually before preview deployment."]
    };
  }

  const statuses = [
    match.launchReadiness,
    match.mobileReadiness,
    match.accessibilityReadiness,
    match.safetyReadiness,
    match.fallbackReadiness,
    match.personalizationReadiness,
    match.offlineFallbackReadiness
  ];
  const hasBlocked = statuses.includes("blocked");
  const hasNeedsReview = statuses.includes("needs_review");

  return {
    surface,
    route: match.route,
    previewReadiness: hasBlocked ? "blocked" : hasNeedsReview ? "needs_review" : "ready",
    mobileReadiness: readyStatus(match.mobileReadiness),
    accessibilityReadiness: readyStatus(match.accessibilityReadiness),
    scriptureAnchoringReadiness: "ready",
    explanationPathReadiness: "ready",
    fallbackReadiness: readyStatus(match.fallbackReadiness),
    personalizationConsentReadiness: readyStatus(match.personalizationReadiness),
    offlineFallbackReadiness: readyStatus(match.offlineFallbackReadiness),
    debugSafetyReadiness: "ready",
    knownBlockers: hasBlocked ? [`${surface} has a blocked launch-readiness dimension.`] : [],
    knownWarnings: match.knownWarnings.map((entry) => entry.message),
    manualQaNotes: [
      "Confirm mobile and desktop rendering.",
      "Confirm Scripture anchor, explanation path, fallback, confidence, consent, and debug visibility.",
      "Record manual QA before public preview sharing."
    ]
  };
}

export function createPreviewSurfaceLaunchReport() {
  const surfaces = REQUIRED_LAUNCH_SURFACES.map(getPreviewSurfaceLaunchStatus);
  const blockers = getPreviewSurfaceBlockers(surfaces);
  const warnings = getPreviewSurfaceWarnings(surfaces);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    surfaceCount: surfaces.length,
    readySurfaceCount: surfaces.filter((entry) => entry.previewReadiness === "ready").length,
    surfaces,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}

export function getPreviewReadySurfaces(
  surfaces: TeoyubePreviewSurfaceLaunchStatus[] = createPreviewSurfaceLaunchReport().surfaces
): TeoyubePreviewSurfaceLaunchStatus[] {
  return surfaces.filter((entry) => entry.previewReadiness === "ready");
}

export function getPreviewSurfaceBlockers(
  surfaces: TeoyubePreviewSurfaceLaunchStatus[] = REQUIRED_LAUNCH_SURFACES.map(getPreviewSurfaceLaunchStatus)
): string[] {
  return surfaces.flatMap((entry) => entry.knownBlockers.map((blocker) => `${normalize(entry.surface)}: ${blocker}`));
}

export function getPreviewSurfaceWarnings(
  surfaces: TeoyubePreviewSurfaceLaunchStatus[] = REQUIRED_LAUNCH_SURFACES.map(getPreviewSurfaceLaunchStatus)
): string[] {
  return surfaces.flatMap((entry) => entry.knownWarnings.map((warning) => `${normalize(entry.surface)}: ${warning}`));
}

