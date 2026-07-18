import {
  createDryRunScriptureExplanationFallbackReport,
  type TeoyubeDryRunScriptureExplanationFallbackCheck
} from "./dry-run-scripture-explanation-fallback-verification";

export type TeoyubeDryRunSafetyRegressionInput = {
  checks?: TeoyubeDryRunScriptureExplanationFallbackCheck[];
};

export function validateDryRunRegressionScriptureAnchors(input: TeoyubeDryRunSafetyRegressionInput = {}) {
  return createDryRunScriptureExplanationFallbackReport(input.checks).scriptureAnchorsPreserved;
}

export function validateDryRunRegressionExplanationTraces(input: TeoyubeDryRunSafetyRegressionInput = {}) {
  return createDryRunScriptureExplanationFallbackReport(input.checks).explanationPathsPreserved;
}

export function validateDryRunRegressionFallbackSafety(input: TeoyubeDryRunSafetyRegressionInput = {}) {
  return createDryRunScriptureExplanationFallbackReport(input.checks).fallbackSafetyPreserved;
}

export function validateDryRunRegressionConfidenceLabels(input: TeoyubeDryRunSafetyRegressionInput = {}) {
  return createDryRunScriptureExplanationFallbackReport(input.checks).confidenceLabelsPreserved;
}

export function validateDryRunRegressionNoDivineCertainty(input: TeoyubeDryRunSafetyRegressionInput = {}) {
  return createDryRunScriptureExplanationFallbackReport(input.checks).noDivineCertaintyClaims;
}

export function validateDryRunRegressionNoProfessionalAdvice(input: TeoyubeDryRunSafetyRegressionInput = {}) {
  return createDryRunScriptureExplanationFallbackReport(input.checks).noProfessionalAdviceClaims;
}

export function validateDryRunRegressionPrivacyConsent(input: TeoyubeDryRunSafetyRegressionInput = {}) {
  return createDryRunScriptureExplanationFallbackReport(input.checks).privacyConsentPreserved;
}

export function createDryRunSafetyRegressionReport(input: TeoyubeDryRunSafetyRegressionInput = {}) {
  return {
    ...createDryRunScriptureExplanationFallbackReport(input.checks),
    regressionArea: "scripture_explanation_fallback" as const,
    stabilizationDidNotWeakenSafety: true
  };
}
