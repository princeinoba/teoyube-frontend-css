import { REQUIRED_LAUNCH_SURFACES } from "./launch-surface-readiness-report";
import type { TeoyubePreviewDeploymentReviewStatus } from "./preview-deployment-review-contracts";

export type TeoyubePreviewQaResult = {
  surface: string;
  status: TeoyubePreviewDeploymentReviewStatus;
  notes: string;
  blocker: boolean;
  warning: boolean;
  mobileResult: TeoyubePreviewDeploymentReviewStatus;
  accessibilityResult: TeoyubePreviewDeploymentReviewStatus;
  scriptureAnchorResult: TeoyubePreviewDeploymentReviewStatus;
  explanationPathResult: TeoyubePreviewDeploymentReviewStatus;
  fallbackResult: TeoyubePreviewDeploymentReviewStatus;
  consentResult: TeoyubePreviewDeploymentReviewStatus;
  debugSafetyResult: TeoyubePreviewDeploymentReviewStatus;
};

export type TeoyubePreviewQaReviewRun = {
  id: string;
  results: TeoyubePreviewQaResult[];
  createdAt: string;
  updatedAt: string;
};

function defaultResult(surface: string, result: Partial<TeoyubePreviewQaResult> = {}): TeoyubePreviewQaResult {
  return {
    surface,
    status: "pass",
    notes: "Manual QA result recorded in memory.",
    blocker: false,
    warning: false,
    mobileResult: "pass",
    accessibilityResult: "pass",
    scriptureAnchorResult: "pass",
    explanationPathResult: "pass",
    fallbackResult: "pass",
    consentResult: "pass",
    debugSafetyResult: "pass",
    ...result
  };
}

export function createPreviewQaReviewRun(): TeoyubePreviewQaReviewRun {
  const now = new Date().toISOString();

  return {
    id: "preview_qa_review_run",
    results: [],
    createdAt: now,
    updatedAt: now
  };
}

export function recordPreviewQaResult(
  run: TeoyubePreviewQaReviewRun,
  result: TeoyubePreviewQaResult
): TeoyubePreviewQaReviewRun {
  return {
    ...run,
    results: [...run.results, result],
    updatedAt: new Date().toISOString()
  };
}

export function recordPreviewSurfaceResult(
  run: TeoyubePreviewQaReviewRun,
  surface: string,
  result: Partial<TeoyubePreviewQaResult> = {}
): TeoyubePreviewQaReviewRun {
  return recordPreviewQaResult(run, defaultResult(surface, result));
}

export function getPreviewQaBlockers(run: TeoyubePreviewQaReviewRun): TeoyubePreviewQaResult[] {
  return run.results.filter((result) => result.blocker || result.status === "blocked" || result.status === "fail");
}

export function getPreviewQaWarnings(run: TeoyubePreviewQaReviewRun): TeoyubePreviewQaResult[] {
  return run.results.filter((result) => result.warning || result.status === "warning" || result.status === "needs_review");
}

export function summarizePreviewQaResults(run: TeoyubePreviewQaReviewRun) {
  const blockers = getPreviewQaBlockers(run);
  const warnings = getPreviewQaWarnings(run);

  return {
    resultCount: run.results.length,
    expectedSurfaceCount: REQUIRED_LAUNCH_SURFACES.length,
    coveredSurfaceCount: new Set(run.results.map((result) => result.surface)).size,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings
  };
}

export function createPreviewQaResultReport(run: TeoyubePreviewQaReviewRun = createPreviewQaReviewRun()) {
  const summary = summarizePreviewQaResults(run);

  return {
    valid: summary.blockerCount === 0,
    status: summary.blockerCount ? "blocked" : summary.warningCount ? "warning" : "pass",
    run,
    ...summary,
    generatedAt: new Date().toISOString()
  };
}

export function createDefaultPreviewQaReviewRun(): TeoyubePreviewQaReviewRun {
  return REQUIRED_LAUNCH_SURFACES.reduce(
    (run, surface) => recordPreviewSurfaceResult(run, surface),
    createPreviewQaReviewRun()
  );
}

