import type { TeoyubePostDeploymentQaSurface } from "./manual-preview-postdeployment-qa-contracts";
import { MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES } from "./manual-preview-surface-postdeployment-checks";
import type {
  TeoyubeManualPreviewRegressionCheck,
  TeoyubeManualPreviewRegressionCheckType,
  TeoyubeManualPreviewRegressionResult
} from "./manual-preview-regression-verification-contracts";

export type TeoyubeManualPreviewPostFixSurfaceRegressionReport = {
  valid: boolean;
  surfaceCount: number;
  checkCount: number;
  resultCount: number;
  blockerCount: number;
  warningCount: number;
  surfaces: TeoyubePostDeploymentQaSurface[];
  checks: TeoyubeManualPreviewRegressionCheck[];
  blockers: string[];
  warnings: string[];
  noExternalWrite: true;
  noPreviewUrlFetched: true;
  generatedAt: string;
};

type SurfaceRegressionTemplate = {
  suffix: string;
  label: string;
  type: TeoyubeManualPreviewRegressionCheckType;
  launchCritical: boolean;
  details: string;
};

const SURFACE_REGRESSION_TEMPLATES: SurfaceRegressionTemplate[] = [
  { suffix: "loads", label: "Surface still loads", type: "surface_qa", launchCritical: true, details: "Confirm the surface renders without a blank state or crash." },
  { suffix: "scripture_anchor", label: "Scripture anchor still appears", type: "scripture_anchor", launchCritical: true, details: "Confirm Scripture reference or Scripture-grounded anchor remains visible where applicable." },
  { suffix: "explanation_path", label: "Explanation path still appears", type: "explanation_path", launchCritical: true, details: "Confirm users can understand why content was selected." },
  { suffix: "fallback", label: "Fallback state still works", type: "fallback", launchCritical: true, details: "Confirm empty/error states use safe fallback language." },
  { suffix: "confidence", label: "Confidence label still appears", type: "confidence", launchCritical: false, details: "Confirm confidence labels remain bounded where applicable." },
  { suffix: "consent", label: "Consent controls still appear", type: "consent", launchCritical: true, details: "Confirm personalization and feedback remain consent-aware where applicable." },
  { suffix: "debug_hidden", label: "Debug info remains hidden", type: "debug_safety", launchCritical: true, details: "Confirm normal users do not see debug internals." },
  { suffix: "mobile_usable", label: "Mobile layout remains usable", type: "mobile", launchCritical: true, details: "Confirm narrow viewport layout remains readable and operable." },
  { suffix: "accessibility", label: "Accessibility basics remain acceptable", type: "accessibility", launchCritical: true, details: "Confirm labels, keyboard access, focus, and contrast basics." }
];

function id(surface: TeoyubePostDeploymentQaSurface, suffix: string): string {
  return `post_fix_surface_${surface}_${suffix}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function getPostFixSurfaceRegressionChecks(
  surface: TeoyubePostDeploymentQaSurface
): TeoyubeManualPreviewRegressionCheck[] {
  return SURFACE_REGRESSION_TEMPLATES.map((template) => ({
    id: id(surface, template.suffix),
    label: `${surface}: ${template.label}`,
    type: template.type,
    required: true,
    launchCritical: template.launchCritical,
    verificationModule: "manual-preview-post-fix-surface-regression",
    details: template.details
  }));
}

export function getPostFixSurfaceRegressionChecklist(): TeoyubeManualPreviewRegressionCheck[] {
  return MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES.flatMap(getPostFixSurfaceRegressionChecks);
}

function passingResultForCheck(results: TeoyubeManualPreviewRegressionResult[], check: TeoyubeManualPreviewRegressionCheck): boolean {
  return results.some((result) =>
    result.checkId === check.id &&
    (result.status === "pass" || result.status === "warning")
  );
}

export function getPostFixSurfaceRegressionBlockers(
  results: TeoyubeManualPreviewRegressionResult[]
): string[] {
  return getPostFixSurfaceRegressionChecklist()
    .filter((check) => check.required && check.launchCritical)
    .filter((check) => !passingResultForCheck(results, check))
    .map((check) => `${check.label} is not verified.`);
}

export function getPostFixSurfaceRegressionWarnings(
  results: TeoyubeManualPreviewRegressionResult[]
): string[] {
  return getPostFixSurfaceRegressionChecklist()
    .filter((check) => check.required && !check.launchCritical)
    .filter((check) => !passingResultForCheck(results, check))
    .map((check) => `${check.label} should be reviewed before soft launch.`);
}

export function createPostFixSurfaceRegressionReport(
  results: TeoyubeManualPreviewRegressionResult[]
): TeoyubeManualPreviewPostFixSurfaceRegressionReport {
  const checks = getPostFixSurfaceRegressionChecklist();
  const blockers = getPostFixSurfaceRegressionBlockers(results);
  const warnings = getPostFixSurfaceRegressionWarnings(results);

  return {
    valid: blockers.length === 0,
    surfaceCount: MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES.length,
    checkCount: checks.length,
    resultCount: results.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    surfaces: MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES,
    checks,
    blockers,
    warnings,
    noExternalWrite: true,
    noPreviewUrlFetched: true,
    generatedAt: new Date().toISOString()
  };
}
