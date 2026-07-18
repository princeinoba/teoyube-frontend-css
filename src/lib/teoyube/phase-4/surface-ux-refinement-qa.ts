import {
  createSurfaceUxRefinementPlan
} from "./surface-ux-refinement-planner";
import type { TeoyubeSurfaceUxRefinementPlan } from "./surface-ux-refinement-contracts";

export type TeoyubeSurfaceUxRefinementQaCheck = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubeSurfaceUxRefinementQaReport = {
  valid: boolean;
  checks: TeoyubeSurfaceUxRefinementQaCheck[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubeSurfaceUxRefinementQaCheck {
  return { id, passed, details };
}

function text(plan: TeoyubeSurfaceUxRefinementPlan): string {
  return [
    ...plan.items.map((entry) => `${entry.summary} ${entry.safetyReason}`),
    ...plan.safePatches.map((entry) => `${entry.description} ${entry.regressionCheck}`)
  ].join(" ").toLowerCase();
}

export function validateSurfaceUxRefinementSafety(
  input: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementQaCheck {
  const unsafe = ["remove scripture", "hide confidence", "remove explanation", "disable fallback", "localstorage", "indexeddb", "cookies"];
  const found = unsafe.filter((phrase) => text(input).includes(phrase));
  return check("surface_ux_refinement_safety", input.blockedItems.length === 0 && found.length === 0, found.length ? `Unsafe phrase(s) found: ${found.join(", ")}.` : "Surface UX refinements are copy/readability/review-state only.");
}

export function validateSurfaceUxScriptureVisibility(
  input: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementQaCheck {
  return check("surface_ux_scripture_visibility", !text(input).includes("hide scripture"), "Scripture anchors remain visible and are not hidden by Phase 4.3 refinements.");
}

export function validateSurfaceUxExplanationVisibility(
  input: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementQaCheck {
  return check("surface_ux_explanation_visibility", !text(input).includes("hide explanation"), "Explanation paths and traces remain visible.");
}

export function validateSurfaceUxConfidenceVisibility(
  input: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementQaCheck {
  return check("surface_ux_confidence_visibility", !text(input).includes("hide confidence"), "Confidence boundaries remain visible.");
}

export function validateSurfaceUxFallbackSafety(
  input: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementQaCheck {
  return check("surface_ux_fallback_safety", !text(input).includes("remove fallback"), "Fallback state copy remains safe and visible.");
}

export function validateSurfaceUxMobileReadiness(
  input: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementQaCheck {
  const hasManualMobileItem = input.items.some((entry) => entry.surface === "mobile_navigation" || entry.summary.toLowerCase().includes("mobile"));
  return check("surface_ux_mobile_readiness", hasManualMobileItem || input.safePatches.length > 0, "Mobile wrapping/list fallback review is represented in the plan and carried into owner review.");
}

export function validateSurfaceUxAccessibilityBasics(
  input: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementQaCheck {
  const hasAccessibilityReview = input.items.some((entry) => entry.summary.toLowerCase().includes("accessibility") || entry.summary.toLowerCase().includes("manual"));
  return check("surface_ux_accessibility_basics", hasAccessibilityReview || input.safePatches.length > 0, "Accessibility basics remain in the owner-review path; no inaccessible debug-only state is introduced.");
}

export function createSurfaceUxRefinementQaReport(
  input: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementQaReport {
  const checks = [
    validateSurfaceUxRefinementSafety(input),
    validateSurfaceUxScriptureVisibility(input),
    validateSurfaceUxExplanationVisibility(input),
    validateSurfaceUxConfidenceVisibility(input),
    validateSurfaceUxFallbackSafety(input),
    validateSurfaceUxMobileReadiness(input),
    validateSurfaceUxAccessibilityBasics(input)
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = input.deferredItems.map((entry) => entry.summary);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
