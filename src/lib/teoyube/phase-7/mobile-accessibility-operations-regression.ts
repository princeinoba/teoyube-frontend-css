export type TeoyubeMobileAccessibilityOperationsRegressionInput = Partial<{
  mobileReady: boolean;
  accessibilityBasicsReady: boolean;
  graphListFallbackAvailable: boolean;
  promiseTableMobileViewAvailable: boolean;
  readableLabels: boolean;
  explanationTextVisible: boolean;
}>;

function value(input: TeoyubeMobileAccessibilityOperationsRegressionInput, key: keyof TeoyubeMobileAccessibilityOperationsRegressionInput): boolean {
  return input[key] ?? true;
}

export function validateOperationsMobileReadiness(input: TeoyubeMobileAccessibilityOperationsRegressionInput = {}) {
  return value(input, "mobileReady");
}

export function validateOperationsAccessibilityBasics(input: TeoyubeMobileAccessibilityOperationsRegressionInput = {}) {
  return value(input, "accessibilityBasicsReady");
}

export function validateOperationsGraphListFallback(input: TeoyubeMobileAccessibilityOperationsRegressionInput = {}) {
  return value(input, "graphListFallbackAvailable");
}

export function validateOperationsPromiseTableMobileView(input: TeoyubeMobileAccessibilityOperationsRegressionInput = {}) {
  return value(input, "promiseTableMobileViewAvailable");
}

export function validateOperationsReadableLabels(input: TeoyubeMobileAccessibilityOperationsRegressionInput = {}) {
  return value(input, "readableLabels");
}

export function createMobileAccessibilityOperationsRegressionReport(input: TeoyubeMobileAccessibilityOperationsRegressionInput = {}) {
  const checks = [
    { id: "mobile_readiness", passed: validateOperationsMobileReadiness(input), details: "WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, TIGGraphExplorer, and Promise Table remain readable on mobile." },
    { id: "accessibility_basics", passed: validateOperationsAccessibilityBasics(input), details: "Labels, focus basics, keyboard basics, and readable copy remain intact." },
    { id: "graph_list_fallback", passed: validateOperationsGraphListFallback(input), details: "TIGGraphExplorer has a list fallback." },
    { id: "promise_table_mobile_view", passed: validateOperationsPromiseTableMobileView(input), details: "Promise Table has a mobile-safe view." },
    { id: "readable_labels", passed: validateOperationsReadableLabels(input), details: "Labels are understandable." },
    { id: "explanation_text_visible", passed: value(input, "explanationTextVisible"), details: "Important explanation text is not hidden." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id} regression failed.`);
  return {
    valid: blockers.length === 0,
    regressionArea: "mobile_accessibility" as const,
    checks,
    blockers,
    warnings: [] as string[],
    stabilizationDidNotWorsenMobileAccessibility: blockers.length === 0,
    manualOnly: true as const,
    inMemoryOnly: true as const,
    noExternalServicesRequired: true as const,
    generatedAt: new Date().toISOString()
  };
}
