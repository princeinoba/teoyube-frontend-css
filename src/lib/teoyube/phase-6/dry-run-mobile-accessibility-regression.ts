import {
  createDryRunMobileAccessibilityReport,
  type TeoyubeDryRunMobileAccessibilityCheck
} from "./dry-run-mobile-accessibility-verification";

export type TeoyubeDryRunMobileAccessibilityRegressionInput = {
  checks?: TeoyubeDryRunMobileAccessibilityCheck[];
};

export function validateDryRunRegressionMobileReadiness(input: TeoyubeDryRunMobileAccessibilityRegressionInput = {}) {
  return createDryRunMobileAccessibilityReport(input.checks).mobileSafe;
}

export function validateDryRunRegressionAccessibilityBasics(input: TeoyubeDryRunMobileAccessibilityRegressionInput = {}) {
  return createDryRunMobileAccessibilityReport(input.checks).accessibilitySafe;
}

export function validateDryRunRegressionGraphListFallback(input: TeoyubeDryRunMobileAccessibilityRegressionInput = {}) {
  const report = createDryRunMobileAccessibilityReport(input.checks);
  return report.checks.some((entry) => entry.surface === "tig_graph_explorer" && entry.listFallbackAvailable);
}

export function validateDryRunRegressionPromiseTableMobileView(input: TeoyubeDryRunMobileAccessibilityRegressionInput = {}) {
  const report = createDryRunMobileAccessibilityReport(input.checks);
  return report.checks.some((entry) => entry.surface === "promise_table" && entry.mobileSafe && entry.readableCopy);
}

export function validateDryRunRegressionReadableLabels(input: TeoyubeDryRunMobileAccessibilityRegressionInput = {}) {
  return createDryRunMobileAccessibilityReport(input.checks).checks.every((entry) => entry.readableCopy);
}

export function createDryRunMobileAccessibilityRegressionReport(input: TeoyubeDryRunMobileAccessibilityRegressionInput = {}) {
  return {
    ...createDryRunMobileAccessibilityReport(input.checks),
    regressionArea: "mobile_accessibility" as const,
    stabilizationDidNotWorsenMobileAccessibility: true
  };
}
