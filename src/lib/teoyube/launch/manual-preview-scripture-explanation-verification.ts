import type { TeoyubePostDeploymentQaSurface } from "./manual-preview-postdeployment-qa-contracts";

export type TeoyubePreviewScriptureExplanationResult = {
  id: string;
  surface: TeoyubePostDeploymentQaSurface;
  scriptureAnchorVisible?: boolean;
  explanationPathVisible?: boolean;
  promiseHasScriptureSupport?: boolean;
  prayerHasExplanationPath?: boolean;
  actionStepHasExplanationPath?: boolean;
  fallbackHasScriptureAnchoredExplanation?: boolean;
  confidenceLabelHasReason?: boolean;
  divineCertaintyClaimed?: boolean;
  notes?: string;
};

function blockerMessage(result: TeoyubePreviewScriptureExplanationResult): string[] {
  return [
    result.scriptureAnchorVisible === false ? `${result.surface}: missing Scripture anchor.` : "",
    result.explanationPathVisible === false ? `${result.surface}: missing explanation path.` : "",
    result.promiseHasScriptureSupport === false ? `${result.surface}: promise displayed without Scripture support.` : "",
    result.prayerHasExplanationPath === false ? `${result.surface}: prayer displayed without explanation path.` : "",
    result.actionStepHasExplanationPath === false ? `${result.surface}: action step displayed without explanation path.` : "",
    result.fallbackHasScriptureAnchoredExplanation === false ? `${result.surface}: fallback lacks Scripture-anchored explanation.` : "",
    result.confidenceLabelHasReason === false ? `${result.surface}: confidence label lacks reason or context.` : "",
    result.divineCertaintyClaimed ? `${result.surface}: divine certainty language detected.` : ""
  ].filter(Boolean);
}

export function getPreviewScriptureExplanationChecklist(): string[] {
  return [
    "Scripture anchor is visible or accessible.",
    "Explanation path is visible or accessible.",
    "Promises are displayed with Scripture support.",
    "Prayers include or follow an explanation path.",
    "Action steps include or follow an explanation path.",
    "Fallbacks include Scripture-anchored explanation.",
    "Confidence labels include reason or context.",
    "No response claims divine certainty."
  ];
}

export function validatePreviewScriptureAnchorResult(result: TeoyubePreviewScriptureExplanationResult): boolean {
  return result.scriptureAnchorVisible !== false && result.promiseHasScriptureSupport !== false && !result.divineCertaintyClaimed;
}

export function validatePreviewExplanationPathResult(result: TeoyubePreviewScriptureExplanationResult): boolean {
  return result.explanationPathVisible !== false &&
    result.prayerHasExplanationPath !== false &&
    result.actionStepHasExplanationPath !== false &&
    result.fallbackHasScriptureAnchoredExplanation !== false &&
    result.confidenceLabelHasReason !== false;
}

export function getPreviewScriptureExplanationBlockers(
  results: TeoyubePreviewScriptureExplanationResult[] = []
): string[] {
  return results.flatMap(blockerMessage);
}

export function getPreviewScriptureExplanationWarnings(
  results: TeoyubePreviewScriptureExplanationResult[] = []
): string[] {
  return [
    results.length === 0 ? "Scripture/explanation verification results have not been recorded yet." : "",
    ...results
      .filter((result) => !result.notes)
      .map((result) => `${result.surface}: add brief manual QA notes before preview review.`)
  ].filter(Boolean);
}

export function createPreviewScriptureExplanationReport(
  results: TeoyubePreviewScriptureExplanationResult[] = []
) {
  const blockers = getPreviewScriptureExplanationBlockers(results);
  const warnings = getPreviewScriptureExplanationWarnings(results);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "needs_review" : "ready",
    checklist: getPreviewScriptureExplanationChecklist(),
    resultCount: results.length,
    blockers,
    warnings,
    results,
    launchCritical: true,
    generatedAt: new Date().toISOString()
  };
}
