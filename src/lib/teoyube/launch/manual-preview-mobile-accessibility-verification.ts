import type { TeoyubePostDeploymentQaSurface } from "./manual-preview-postdeployment-qa-contracts";

export type TeoyubePreviewViewport = "small_mobile" | "large_mobile" | "tablet" | "desktop";

export type TeoyubePreviewMobileAccessibilityResult = {
  id: string;
  surface: TeoyubePostDeploymentQaSurface;
  viewport: TeoyubePreviewViewport;
  noMajorHorizontalOverflow?: boolean;
  cardsStackCorrectly?: boolean;
  scripturePrayerTextWraps?: boolean;
  buttonsTouchFriendly?: boolean;
  graphPreviewReadable?: boolean;
  explanationPathReadable?: boolean;
  consentFeedbackControlsUsable?: boolean;
  debugHiddenByDefault?: boolean;
  focusLabelBasicsAcceptable?: boolean;
  notes?: string;
};

function blockersFor(result: TeoyubePreviewMobileAccessibilityResult): string[] {
  return [
    result.noMajorHorizontalOverflow === false ? `${result.surface}/${result.viewport}: major horizontal overflow.` : "",
    result.scripturePrayerTextWraps === false ? `${result.surface}/${result.viewport}: Scripture or prayer text does not wrap.` : "",
    result.buttonsTouchFriendly === false ? `${result.surface}/${result.viewport}: buttons are not touch-friendly.` : "",
    result.graphPreviewReadable === false ? `${result.surface}/${result.viewport}: graph preview requires tiny labels.` : "",
    result.explanationPathReadable === false ? `${result.surface}/${result.viewport}: explanation path is not readable.` : "",
    result.consentFeedbackControlsUsable === false ? `${result.surface}/${result.viewport}: consent or feedback controls are hard to use.` : "",
    result.debugHiddenByDefault === false ? `${result.surface}/${result.viewport}: debug information is visible by default.` : "",
    result.focusLabelBasicsAcceptable === false ? `${result.surface}/${result.viewport}: focus or label basics are not acceptable.` : ""
  ].filter(Boolean);
}

export function getPreviewMobileAccessibilityChecklist(): string[] {
  return [
    "No major horizontal overflow.",
    "Cards stack correctly.",
    "Scripture and prayer text wraps.",
    "Buttons are touch-friendly.",
    "Graph preview does not require tiny labels.",
    "Explanation path remains readable.",
    "Consent and feedback controls are easy to use.",
    "Debug information is hidden by default.",
    "Focus and label basics are acceptable for launch review."
  ];
}

export function getPreviewViewportManualTestPlan() {
  return [
    { id: "small_mobile" as const, label: "Small mobile", width: 360, height: 740 },
    { id: "large_mobile" as const, label: "Large mobile", width: 430, height: 932 },
    { id: "tablet" as const, label: "Tablet", width: 768, height: 1024 },
    { id: "desktop" as const, label: "Desktop", width: 1440, height: 900 }
  ];
}

export function validatePreviewMobileResult(result: TeoyubePreviewMobileAccessibilityResult): boolean {
  return result.noMajorHorizontalOverflow !== false &&
    result.cardsStackCorrectly !== false &&
    result.scripturePrayerTextWraps !== false &&
    result.buttonsTouchFriendly !== false &&
    result.graphPreviewReadable !== false &&
    result.explanationPathReadable !== false;
}

export function validatePreviewAccessibilityResult(result: TeoyubePreviewMobileAccessibilityResult): boolean {
  return result.focusLabelBasicsAcceptable !== false &&
    result.consentFeedbackControlsUsable !== false &&
    result.debugHiddenByDefault !== false;
}

export function getPreviewMobileAccessibilityBlockers(
  results: TeoyubePreviewMobileAccessibilityResult[] = []
): string[] {
  return results.flatMap(blockersFor);
}

export function getPreviewMobileAccessibilityWarnings(
  results: TeoyubePreviewMobileAccessibilityResult[] = []
): string[] {
  return [
    results.length === 0 ? "Mobile/accessibility verification results have not been recorded yet." : "",
    ...results
      .filter((result) => result.cardsStackCorrectly === false)
      .map((result) => `${result.surface}/${result.viewport}: card stacking needs review.`)
  ].filter(Boolean);
}

export function createPreviewMobileAccessibilityReport(
  results: TeoyubePreviewMobileAccessibilityResult[] = []
) {
  const blockers = getPreviewMobileAccessibilityBlockers(results);
  const warnings = getPreviewMobileAccessibilityWarnings(results);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "needs_review" : "ready",
    checklist: getPreviewMobileAccessibilityChecklist(),
    viewportPlan: getPreviewViewportManualTestPlan(),
    resultCount: results.length,
    blockers,
    warnings,
    results,
    generatedAt: new Date().toISOString()
  };
}
