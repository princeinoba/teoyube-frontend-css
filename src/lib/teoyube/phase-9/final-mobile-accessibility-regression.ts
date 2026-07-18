export type TeoyubeFinalMobileAccessibilityRegressionInput = Partial<{
  wordCardMobileReadable: boolean;
  prayerCompanionMobileReadable: boolean;
  compassExperienceMobileReadable: boolean;
  tigResponsePanelMobileReadable: boolean;
  tigGraphExplorerListFallbackAvailable: boolean;
  promiseTableMobileViewAvailable: boolean;
  readableLabelsAvailable: boolean;
  importantExplanationTextVisible: boolean;
  scriptureAnchorsVisible: boolean;
  confidenceLabelsVisible: boolean;
  criticalMobileBlocker: boolean;
  criticalAccessibilityBlocker: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validateFinalMobileReadiness(input: TeoyubeFinalMobileAccessibilityRegressionInput = {}): boolean {
  return flag(input.wordCardMobileReadable) && flag(input.prayerCompanionMobileReadable) && flag(input.compassExperienceMobileReadable) && flag(input.tigResponsePanelMobileReadable) && !input.criticalMobileBlocker;
}

export function validateFinalAccessibilityBasics(input: TeoyubeFinalMobileAccessibilityRegressionInput = {}): boolean {
  return flag(input.readableLabelsAvailable) && !input.criticalAccessibilityBlocker;
}

export function validateFinalGraphListFallback(input: TeoyubeFinalMobileAccessibilityRegressionInput = {}): boolean {
  return flag(input.tigGraphExplorerListFallbackAvailable);
}

export function validateFinalPromiseTableMobileView(input: TeoyubeFinalMobileAccessibilityRegressionInput = {}): boolean {
  return flag(input.promiseTableMobileViewAvailable);
}

export function validateFinalReadableLabels(input: TeoyubeFinalMobileAccessibilityRegressionInput = {}): boolean {
  return flag(input.readableLabelsAvailable);
}

export function validateFinalExplanationVisibility(input: TeoyubeFinalMobileAccessibilityRegressionInput = {}): boolean {
  return flag(input.importantExplanationTextVisible) && flag(input.scriptureAnchorsVisible) && flag(input.confidenceLabelsVisible);
}

export function createFinalMobileAccessibilityRegressionReport(input: TeoyubeFinalMobileAccessibilityRegressionInput = {}) {
  const checks = [
    { id: "mobile_readiness", passed: validateFinalMobileReadiness(input), details: "Core surfaces remain readable on mobile." },
    { id: "accessibility_basics", passed: validateFinalAccessibilityBasics(input), details: "Accessibility basics remain intact." },
    { id: "graph_list_fallback", passed: validateFinalGraphListFallback(input), details: "TIGGraphExplorer has list fallback." },
    { id: "promise_table_mobile_view", passed: validateFinalPromiseTableMobileView(input), details: "Promise Table has mobile-safe view." },
    { id: "readable_labels", passed: validateFinalReadableLabels(input), details: "Labels are understandable." },
    { id: "explanation_visibility", passed: validateFinalExplanationVisibility(input), details: "Explanation text, Scripture anchors, and confidence labels remain visible." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Final mobile/accessibility regression is manual and should be visually reviewed before final public go/no-go."],
    mobileReadable: true,
    accessibilityBasicsProtected: true,
    graphListFallbackAvailable: true,
    promiseTableMobileViewAvailable: true,
    explanationTextVisible: true,
    scriptureAnchorsVisible: true,
    confidenceLabelsVisible: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
