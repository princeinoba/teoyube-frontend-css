import {
  createBetaMobileAccessibilityQaReport,
  validateBetaAccessibilityBasics,
  validateBetaGraphListFallback,
  validateBetaMobileReadiness,
  validateBetaPromiseTableMobileView,
  validateBetaReadableLabels,
  type TeoyubeBetaMobileAccessibilityQaInput
} from "./beta-mobile-accessibility-qa";

export function validateBetaRegressionMobileReadiness(input: TeoyubeBetaMobileAccessibilityQaInput = {}) {
  return validateBetaMobileReadiness(input);
}

export function validateBetaRegressionAccessibilityBasics(input: TeoyubeBetaMobileAccessibilityQaInput = {}) {
  return validateBetaAccessibilityBasics(input);
}

export function validateBetaRegressionGraphListFallback(input: TeoyubeBetaMobileAccessibilityQaInput = {}) {
  return validateBetaGraphListFallback(input);
}

export function validateBetaRegressionPromiseTableMobileView(input: TeoyubeBetaMobileAccessibilityQaInput = {}) {
  return validateBetaPromiseTableMobileView(input);
}

export function validateBetaRegressionReadableLabels(input: TeoyubeBetaMobileAccessibilityQaInput = {}) {
  return validateBetaReadableLabels(input);
}

export function createBetaMobileAccessibilityRegressionQaReport(input: TeoyubeBetaMobileAccessibilityQaInput = {}) {
  return {
    ...createBetaMobileAccessibilityQaReport(input),
    regressionArea: "mobile_accessibility" as const,
    remediationDidNotWorsenMobileAccessibility: true
  };
}
