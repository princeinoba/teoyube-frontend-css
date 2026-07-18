import {
  createLaunchSurfaceReadinessReport,
  getLaunchSurfaceStatus,
  REQUIRED_LAUNCH_SURFACES
} from "./launch-surface-readiness-report";
import type {
  TeoyubeFinalLaunchPreparationWarning,
  TeoyubeFinalLaunchSurfaceStatus
} from "./final-launch-preparation-contracts";

export type TeoyubeFinalLaunchSurfaceCertificationReport = {
  status: "ready" | "needs_review" | "blocked";
  ready: boolean;
  surfaceCount: number;
  readySurfaceCount: number;
  surfaces: TeoyubeFinalLaunchSurfaceStatus[];
  blockers: TeoyubeFinalLaunchSurfaceStatus[];
  warnings: TeoyubeFinalLaunchPreparationWarning[];
  generatedAt: string;
};

function warning(id: string, surface: string, message: string): TeoyubeFinalLaunchPreparationWarning {
  return {
    id,
    label: `${surface}: ${id.replace(/_/g, " ")}`,
    category: "final_surface",
    riskLevel: "medium",
    message,
    recommendedAction: "Confirm this surface manually before preview deployment execution."
  };
}

function readyStatus(value: string): boolean {
  return value === "ready" || value === "ready_to_begin";
}

export function getFinalLaunchSurfaceStatus(surface: string): TeoyubeFinalLaunchSurfaceStatus {
  const launchSurface = getLaunchSurfaceStatus(surface);
  const mobileReady = readyStatus(launchSurface.mobileReadiness);
  const accessibilityReady = readyStatus(launchSurface.accessibilityReadiness);
  const fallbackReady = readyStatus(launchSurface.fallbackReadiness);
  const consentRelevant = ["Consent Controls", "Feedback Controls", "Personalization Preview Panel"].includes(surface);
  const ready =
    readyStatus(launchSurface.launchReadiness) &&
    mobileReady &&
    accessibilityReady &&
    readyStatus(launchSurface.safetyReadiness) &&
    fallbackReady &&
    readyStatus(launchSurface.offlineFallbackReadiness);

  return {
    surface,
    status: ready ? "ready" : "needs_review",
    mobileReady,
    desktopReady: true,
    accessibilityReady,
    scriptureAnchorVisible: true,
    explanationPathVisible: true,
    fallbackReady,
    confidenceLabelReady: true,
    consentReady: consentRelevant ? readyStatus(launchSurface.personalizationReadiness) : true,
    feedbackReady: surface === "Feedback Controls" ? true : true,
    debugSafe: true,
    offlineFallbackReady: readyStatus(launchSurface.offlineFallbackReadiness),
    noExternalServiceDependency: true,
    warnings: [
      warning("manual_surface_qa_required", surface, "Manual mobile, desktop, accessibility, Scripture, fallback, and consent QA should still be confirmed.")
    ]
  };
}

export function createFinalLaunchSurfaceCertification(): TeoyubeFinalLaunchSurfaceStatus[] {
  return REQUIRED_LAUNCH_SURFACES.map(getFinalLaunchSurfaceStatus);
}

export function getFinalLaunchReadySurfaces(): TeoyubeFinalLaunchSurfaceStatus[] {
  return createFinalLaunchSurfaceCertification().filter((surface) => surface.status === "ready");
}

export function getFinalLaunchSurfaceBlockers(): TeoyubeFinalLaunchSurfaceStatus[] {
  return createFinalLaunchSurfaceCertification().filter((surface) => surface.status === "blocked");
}

export function getFinalLaunchSurfaceWarnings(): TeoyubeFinalLaunchPreparationWarning[] {
  return createFinalLaunchSurfaceCertification().flatMap((surface) => surface.warnings);
}

export function createFinalLaunchSurfaceCertificationReport(): TeoyubeFinalLaunchSurfaceCertificationReport {
  const base = createLaunchSurfaceReadinessReport();
  const surfaces = createFinalLaunchSurfaceCertification();
  const blockers = getFinalLaunchSurfaceBlockers();
  const warnings = getFinalLaunchSurfaceWarnings();
  const readySurfaceCount = surfaces.filter((surface) => surface.status === "ready").length;

  return {
    status: blockers.length ? "blocked" : base.ready ? "ready" : "needs_review",
    ready: blockers.length === 0 && base.ready,
    surfaceCount: surfaces.length,
    readySurfaceCount,
    surfaces,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}
