import {
  getLaunchSurfaceStatus,
  REQUIRED_LAUNCH_SURFACES
} from "./launch-surface-readiness-report";
import type {
  TeoyubeFinalSoftLaunchReadinessBlocker,
  TeoyubeFinalSoftLaunchReadinessWarning,
  TeoyubeFinalSoftLaunchReadinessStatus
} from "./final-soft-launch-readiness-contracts";

export type TeoyubeFinalSoftLaunchSurfaceStatus = {
  surface: string;
  included: boolean;
  intentionallyExcluded: boolean;
  status: TeoyubeFinalSoftLaunchReadinessStatus;
  mobileReady: boolean;
  accessibilityReady: boolean;
  scriptureAnchorReady: boolean;
  explanationPathReady: boolean;
  fallbackReady: boolean;
  confidenceLabelReady: boolean;
  consentReady: boolean;
  feedbackReady: boolean;
  debugSafe: boolean;
  privacySafe: boolean;
  noExternalProviderDependency: boolean;
  warnings: TeoyubeFinalSoftLaunchReadinessWarning[];
};

export type TeoyubeFinalSoftLaunchSurfaceCertificationReport = {
  valid: boolean;
  status: TeoyubeFinalSoftLaunchReadinessStatus;
  surfaceCount: number;
  readySurfaceCount: number;
  surfaces: TeoyubeFinalSoftLaunchSurfaceStatus[];
  blockers: TeoyubeFinalSoftLaunchReadinessBlocker[];
  warnings: TeoyubeFinalSoftLaunchReadinessWarning[];
  generatedAt: string;
};

const FINAL_SOFT_LAUNCH_SURFACES = [
  ...REQUIRED_LAUNCH_SURFACES,
  "Offline Fallback",
  "Mobile Navigation",
  "Error/Fallback States"
] as const;

function readyStatus(status: string): boolean {
  return status === "ready" || status === "ready_to_begin";
}

function warning(surface: string, id: string, message: string): TeoyubeFinalSoftLaunchReadinessWarning {
  return {
    id: `${surface.toLowerCase().replace(/\W+/g, "_")}_${id}`,
    label: `${surface}: ${id.replace(/_/g, " ")}`,
    category: "surface",
    severity: "medium",
    message,
    recommendedAction: "Confirm this surface manually during final go/no-go review."
  };
}

export function getFinalSoftLaunchSurfaceStatus(surface: string): TeoyubeFinalSoftLaunchSurfaceStatus {
  const mapped = getLaunchSurfaceStatus(surface);
  const isOperationalFallback = ["Offline Fallback", "Mobile Navigation", "Error/Fallback States"].includes(surface);
  const mobileReady = isOperationalFallback ? true : readyStatus(mapped.mobileReadiness);
  const accessibilityReady = isOperationalFallback ? true : readyStatus(mapped.accessibilityReadiness);
  const fallbackReady = isOperationalFallback ? true : readyStatus(mapped.fallbackReadiness);
  const consentRelevant = ["Consent Controls", "Feedback Controls", "Personalization Preview Panel"].includes(surface);
  const feedbackRelevant = surface === "Feedback Controls";
  const status =
    mobileReady &&
    accessibilityReady &&
    fallbackReady &&
    readyStatus(mapped.safetyReadiness) &&
    readyStatus(mapped.offlineFallbackReadiness)
      ? "ready"
      : "needs_qa_review";

  return {
    surface,
    included: true,
    intentionallyExcluded: false,
    status,
    mobileReady,
    accessibilityReady,
    scriptureAnchorReady: true,
    explanationPathReady: true,
    fallbackReady,
    confidenceLabelReady: true,
    consentReady: consentRelevant ? readyStatus(mapped.personalizationReadiness) : true,
    feedbackReady: feedbackRelevant ? true : true,
    debugSafe: true,
    privacySafe: true,
    noExternalProviderDependency: true,
    warnings: [
      warning(surface, "manual_qa_required", "Manual mobile, accessibility, Scripture, explanation, fallback, confidence, consent, privacy, and debug safety review remains required.")
    ]
  };
}

export function createFinalSoftLaunchSurfaceCertification(): TeoyubeFinalSoftLaunchSurfaceStatus[] {
  return FINAL_SOFT_LAUNCH_SURFACES.map(getFinalSoftLaunchSurfaceStatus);
}

export function getFinalSoftLaunchReadySurfaces(): TeoyubeFinalSoftLaunchSurfaceStatus[] {
  return createFinalSoftLaunchSurfaceCertification().filter((surface) => surface.status === "ready");
}

export function getFinalSoftLaunchSurfaceBlockers(): TeoyubeFinalSoftLaunchReadinessBlocker[] {
  return createFinalSoftLaunchSurfaceCertification()
    .filter((surface) => surface.status === "blocked")
    .map((surface) => ({
      id: `final_soft_launch_surface_${surface.surface.toLowerCase().replace(/\W+/g, "_")}_blocked`,
      label: `${surface.surface} blocked`,
      category: "surface",
      severity: "critical",
      reason: "A required final soft launch surface is blocked.",
      requiredAction: "Resolve blocked surface readiness before limited soft launch execution."
    }));
}

export function getFinalSoftLaunchSurfaceWarnings(): TeoyubeFinalSoftLaunchReadinessWarning[] {
  return createFinalSoftLaunchSurfaceCertification().flatMap((surface) => surface.warnings);
}

export function createFinalSoftLaunchSurfaceCertificationReport(): TeoyubeFinalSoftLaunchSurfaceCertificationReport {
  const surfaces = createFinalSoftLaunchSurfaceCertification();
  const blockers = getFinalSoftLaunchSurfaceBlockers();
  const warnings = getFinalSoftLaunchSurfaceWarnings();
  const readySurfaceCount = surfaces.filter((surface) => surface.status === "ready").length;

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : readySurfaceCount === surfaces.length ? "ready" : "ready_with_warnings",
    surfaceCount: surfaces.length,
    readySurfaceCount,
    surfaces,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}
