import {
  createPhase7SurfaceReadinessReport,
  getPhase7SurfaceReadinessBySurface
} from "../mobile-scale/phase-7-surface-readiness-report";
import type { TeoyubeDeploymentReadinessStatus } from "../mobile-scale/scale-readiness-contracts";
import type {
  TeoyubeLaunchBlocker,
  TeoyubeLaunchReadinessStatus,
  TeoyubeLaunchSurfaceStatus,
  TeoyubeLaunchWarning
} from "./production-launch-contracts";

export type TeoyubeLaunchSurfaceReadinessReport = {
  status: TeoyubeLaunchReadinessStatus;
  ready: boolean;
  surfaceCount: number;
  readySurfaceCount: number;
  surfaces: TeoyubeLaunchSurfaceStatus[];
  blockers: TeoyubeLaunchBlocker[];
  warnings: TeoyubeLaunchWarning[];
  generatedAt: string;
};

export const REQUIRED_LAUNCH_SURFACES = [
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
  "Feedback Controls"
] as const;

function toLaunchStatus(status: TeoyubeDeploymentReadinessStatus): TeoyubeLaunchReadinessStatus {
  if (status === "ready") {
    return "ready";
  }
  if (status === "planned") {
    return "ready_to_begin";
  }
  if (status === "needs_work") {
    return "needs_review";
  }
  return "blocked";
}

function warning(
  id: string,
  surface: string,
  message: string,
  recommendedAction: string
): TeoyubeLaunchWarning {
  return {
    id,
    label: `${surface}: ${id.replace(/_/g, " ")}`,
    riskLevel: "medium",
    message,
    recommendedAction
  };
}

function normalizeSurfaceName(surface: string): string {
  return surface
    .toLowerCase()
    .replace(/^tig /, "")
    .replace(/ panel$/, "")
    .replace(/\s+/g, "_");
}

function isSurfaceReady(surface: TeoyubeLaunchSurfaceStatus): boolean {
  return [
    surface.launchReadiness,
    surface.mobileReadiness,
    surface.accessibilityReadiness,
    surface.safetyReadiness,
    surface.fallbackReadiness,
    surface.personalizationReadiness,
    surface.offlineFallbackReadiness
  ].every((status) => status === "ready" || status === "ready_to_begin");
}

export function getLaunchSurfaceStatus(surface: string): TeoyubeLaunchSurfaceStatus {
  const mapped =
    getPhase7SurfaceReadinessBySurface(surface) ||
    getPhase7SurfaceReadinessBySurface(normalizeSurfaceName(surface));
  const knownWarnings = [
    warning(
      "manual_qa_pending",
      surface,
      "Manual responsive, accessibility, and theology QA should still be completed before soft launch.",
      "Run the launch QA checklist on this surface."
    )
  ];

  if (!mapped) {
    return {
      surface,
      launchReadiness: "needs_review",
      mobileReadiness: "needs_review",
      accessibilityReadiness: "needs_review",
      safetyReadiness: "needs_review",
      fallbackReadiness: "needs_review",
      personalizationReadiness: "needs_review",
      offlineFallbackReadiness: "needs_review",
      knownWarnings: [
        ...knownWarnings,
        warning(
          "phase7_mapping_missing",
          surface,
          "This launch surface does not have a direct Phase 7 route mapping.",
          "Confirm the route/component manually before soft launch."
        )
      ],
      recommendedFixes: [
        "Map this surface to its route or component.",
        "Run mobile, accessibility, fallback, Scripture anchor, and debug visibility QA."
      ]
    };
  }

  const status: TeoyubeLaunchSurfaceStatus = {
    surface,
    route: mapped.route,
    launchReadiness: "ready_to_begin",
    mobileReadiness: toLaunchStatus(mapped.mobileReadiness),
    accessibilityReadiness: "ready_to_begin",
    safetyReadiness: toLaunchStatus(mapped.safetyReadiness),
    fallbackReadiness: toLaunchStatus(mapped.offlineFallbackReadiness),
    personalizationReadiness: toLaunchStatus(mapped.consentReadiness),
    offlineFallbackReadiness: toLaunchStatus(mapped.offlineFallbackReadiness),
    knownWarnings,
    recommendedFixes: [
      "Confirm no debug surfaces are exposed to normal users.",
      "Run mobile and desktop QA.",
      "Confirm Scripture anchor, explanation path, confidence, fallback, consent, and empty states."
    ]
  };

  return {
    ...status,
    launchReadiness: isSurfaceReady(status) ? "ready" : "needs_review"
  };
}

export function getLaunchSurfaceBlockers(
  surfaces: TeoyubeLaunchSurfaceStatus[] = REQUIRED_LAUNCH_SURFACES.map(getLaunchSurfaceStatus)
): TeoyubeLaunchBlocker[] {
  return surfaces
    .filter((surface) =>
      [
        surface.mobileReadiness,
        surface.safetyReadiness,
        surface.fallbackReadiness,
        surface.personalizationReadiness,
        surface.offlineFallbackReadiness
      ].includes("blocked")
    )
    .map((surface) => ({
      id: `surface_${normalizeSurfaceName(surface.surface)}_blocked`,
      label: `${surface.surface} blocked`,
      riskLevel: "critical",
      reason: "One or more required launch readiness dimensions is blocked.",
      requiredAction: "Resolve blocked surface readiness before launch preparation can advance."
    }));
}

export function getLaunchSurfaceWarnings(
  surfaces: TeoyubeLaunchSurfaceStatus[] = REQUIRED_LAUNCH_SURFACES.map(getLaunchSurfaceStatus)
): TeoyubeLaunchWarning[] {
  return surfaces.flatMap((surface) => surface.knownWarnings);
}

export function createLaunchSurfaceReadinessReport(): TeoyubeLaunchSurfaceReadinessReport {
  const phase7 = createPhase7SurfaceReadinessReport();
  const surfaces = REQUIRED_LAUNCH_SURFACES.map(getLaunchSurfaceStatus);
  const blockers = getLaunchSurfaceBlockers(surfaces);
  const warnings = getLaunchSurfaceWarnings(surfaces);
  const readySurfaceCount = surfaces.filter(isSurfaceReady).length;

  return {
    status: blockers.length === 0 && phase7.complete ? "ready" : "needs_review",
    ready: blockers.length === 0 && phase7.complete,
    surfaceCount: surfaces.length,
    readySurfaceCount,
    surfaces,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}

export function getLaunchReadySurfaces(): TeoyubeLaunchSurfaceStatus[] {
  return createLaunchSurfaceReadinessReport().surfaces.filter(isSurfaceReady);
}

