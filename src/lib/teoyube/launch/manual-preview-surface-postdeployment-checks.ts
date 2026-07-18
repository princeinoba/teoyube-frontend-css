import type {
  TeoyubePostDeploymentQaCheck,
  TeoyubePostDeploymentQaSurface
} from "./manual-preview-postdeployment-qa-contracts";

export const MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES: TeoyubePostDeploymentQaSurface[] = [
  "canon",
  "daily_word",
  "prayer",
  "calling_compass",
  "promise_cluster",
  "ai_companion",
  "onboarding",
  "tig_response_panel",
  "tig_graph_preview",
  "personalization_preview_panel",
  "consent_controls",
  "feedback_controls",
  "offline_fallback",
  "mobile_navigation",
  "error_fallback_states"
];

const BASE_SURFACE_CHECKS: Array<Omit<TeoyubePostDeploymentQaCheck, "id" | "surface">> = [
  { label: "Surface loads in preview", required: true, category: "load", details: "Verify the surface loads manually on the preview URL.", launchCritical: true },
  { label: "Mobile layout is usable", required: true, category: "mobile", details: "Verify the surface is usable on mobile viewport sizes.", launchCritical: true },
  { label: "Desktop layout is usable", required: true, category: "desktop", details: "Verify the surface remains usable on desktop.", launchCritical: false },
  { label: "Scripture anchor is visible or accessible", required: true, category: "scripture", details: "Verify Scripture reference or Scripture-grounded anchor is visible where applicable.", launchCritical: true },
  { label: "Explanation path is visible or accessible", required: true, category: "explanation", details: "Verify the user can understand why content was selected.", launchCritical: true },
  { label: "Fallback state is safe and non-empty", required: true, category: "fallback", details: "Verify empty/error states use safe Scripture-anchored fallback language.", launchCritical: true },
  { label: "Confidence label is visible where applicable", required: true, category: "confidence", details: "Verify confidence labels are bounded and not overstated.", launchCritical: true },
  { label: "Consent controls are visible where personalization appears", required: true, category: "consent", details: "Verify personalization remains visibly consent-aware.", launchCritical: true },
  { label: "Feedback controls are usable where applicable", required: true, category: "feedback", details: "Verify feedback controls are visible and understandable.", launchCritical: false },
  { label: "Debug payload is hidden from normal users", required: true, category: "debug", details: "Verify debug internals are not visible to public preview users.", launchCritical: true },
  { label: "No raw sensitive data appears", required: true, category: "privacy", details: "Verify no raw sensitive personalization or journal text is exposed unexpectedly.", launchCritical: true },
  { label: "No external provider is required for safe render", required: true, category: "provider", details: "Verify safe render does not require analytics, persistence, live AI, or provider calls.", launchCritical: true },
  { label: "Error state uses safe fallback language", required: true, category: "fallback", details: "Verify errors avoid divine certainty claims and stay pastorally safe.", launchCritical: true },
  { label: "Accessibility basics reviewed", required: true, category: "accessibility", details: "Verify labels, focus order, keyboard use, and contrast basics.", launchCritical: true }
];

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function getManualPreviewSurfaceChecklist(
  surface: TeoyubePostDeploymentQaSurface
): TeoyubePostDeploymentQaCheck[] {
  return BASE_SURFACE_CHECKS.map((check) => ({
    ...check,
    id: `${surface}_${slug(check.label)}`,
    surface
  }));
}

export function getManualPreviewSurfacePostDeploymentChecklist(): TeoyubePostDeploymentQaCheck[] {
  return MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES.flatMap(getManualPreviewSurfaceChecklist);
}

export function getCriticalManualPreviewSurfaceChecks(): TeoyubePostDeploymentQaCheck[] {
  return getManualPreviewSurfacePostDeploymentChecklist().filter((check) => check.launchCritical);
}

export function getMobileManualPreviewSurfaceChecks(): TeoyubePostDeploymentQaCheck[] {
  return getManualPreviewSurfacePostDeploymentChecklist().filter((check) => check.category === "mobile");
}

export function getAccessibilityManualPreviewSurfaceChecks(): TeoyubePostDeploymentQaCheck[] {
  return getManualPreviewSurfacePostDeploymentChecklist().filter((check) => check.category === "accessibility");
}

export function getSafetyManualPreviewSurfaceChecks(): TeoyubePostDeploymentQaCheck[] {
  return getManualPreviewSurfacePostDeploymentChecklist().filter((check) =>
    ["scripture", "explanation", "fallback", "confidence", "consent", "debug", "privacy", "provider"].includes(check.category)
  );
}

export function createManualPreviewSurfaceChecklistReport() {
  const checklist = getManualPreviewSurfacePostDeploymentChecklist();

  return {
    valid: checklist.length > 0 && MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES.every((surface) =>
      checklist.some((check) => check.surface === surface)
    ),
    surfaceCount: MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES.length,
    checkCount: checklist.length,
    criticalCheckCount: getCriticalManualPreviewSurfaceChecks().length,
    mobileCheckCount: getMobileManualPreviewSurfaceChecks().length,
    accessibilityCheckCount: getAccessibilityManualPreviewSurfaceChecks().length,
    safetyCheckCount: getSafetyManualPreviewSurfaceChecks().length,
    checklist,
    generatedAt: new Date().toISOString()
  };
}
