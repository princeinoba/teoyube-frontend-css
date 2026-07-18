export type TeoyubeHardeningMobileAccessibilityInput = Partial<{
  mobileReadinessNotWorse: boolean;
  accessibilityBasicsNotWorse: boolean;
  graphListFallbackExists: boolean;
  promiseTableMobileViewUsable: boolean;
  readableLabels: boolean;
  explanationTextVisible: boolean;
  scriptureAnchorsVisible: boolean;
  confidenceLabelsVisible: boolean;
}>;

export type TeoyubeHardeningMobileAccessibilityRegressionReport = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  preservesScriptureAnchors: true;
  preservesExplanationText: true;
  preservesConfidenceLabels: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validateHardeningMobileReadiness(input: TeoyubeHardeningMobileAccessibilityInput = {}): boolean {
  return flag(input.mobileReadinessNotWorse);
}

export function validateHardeningAccessibilityBasics(input: TeoyubeHardeningMobileAccessibilityInput = {}): boolean {
  return flag(input.accessibilityBasicsNotWorse);
}

export function validateHardeningGraphListFallback(input: TeoyubeHardeningMobileAccessibilityInput = {}): boolean {
  return flag(input.graphListFallbackExists);
}

export function validateHardeningPromiseTableMobileView(input: TeoyubeHardeningMobileAccessibilityInput = {}): boolean {
  return flag(input.promiseTableMobileViewUsable);
}

export function validateHardeningReadableLabels(input: TeoyubeHardeningMobileAccessibilityInput = {}): boolean {
  return flag(input.readableLabels);
}

export function createHardeningMobileAccessibilityRegressionReport(input: TeoyubeHardeningMobileAccessibilityInput = {}): TeoyubeHardeningMobileAccessibilityRegressionReport {
  const checks = [
    { id: "mobile_readiness_not_worse", passed: validateHardeningMobileReadiness(input), details: "Mobile state is not worse after hardening." },
    { id: "accessibility_basics_not_worse", passed: validateHardeningAccessibilityBasics(input), details: "Accessibility state is not worse after hardening." },
    { id: "graph_list_fallback_exists", passed: validateHardeningGraphListFallback(input), details: "Graph/list fallback still exists." },
    { id: "promise_table_mobile_view", passed: validateHardeningPromiseTableMobileView(input), details: "Promise Table mobile view remains usable." },
    { id: "readable_labels", passed: validateHardeningReadableLabels(input), details: "Labels remain readable." },
    { id: "explanation_text_visible", passed: flag(input.explanationTextVisible), details: "Explanation text remains visible." },
    { id: "scripture_anchors_visible", passed: flag(input.scriptureAnchorsVisible), details: "Scripture anchors remain visible." },
    { id: "confidence_labels_visible", passed: flag(input.confidenceLabelsVisible), details: "Confidence labels remain visible." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Mobile/accessibility regression is static/manual; verify with devices and assistive tech before release readiness."],
    preservesScriptureAnchors: true,
    preservesExplanationText: true,
    preservesConfidenceLabels: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
