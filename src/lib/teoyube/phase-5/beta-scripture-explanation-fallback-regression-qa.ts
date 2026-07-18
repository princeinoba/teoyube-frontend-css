import {
  createBetaScriptureExplanationFallbackQaReport,
  validateBetaConfidenceLabelVisibility,
  validateBetaExplanationTraceVisibility,
  validateBetaFallbackSafety,
  validateBetaNoDivineCertaintyLanguage,
  validateBetaNoProfessionalAdviceLanguage,
  validateBetaScriptureAnchorVisibility,
  type TeoyubeBetaScriptureExplanationFallbackQaInput
} from "./beta-scripture-explanation-fallback-qa";

export function validateBetaRegressionScriptureAnchors(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}) {
  return validateBetaScriptureAnchorVisibility(input);
}

export function validateBetaRegressionExplanationTraces(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}) {
  return validateBetaExplanationTraceVisibility(input);
}

export function validateBetaRegressionFallbackSafety(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}) {
  return validateBetaFallbackSafety(input);
}

export function validateBetaRegressionConfidenceLabels(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}) {
  return validateBetaConfidenceLabelVisibility(input);
}

export function validateBetaRegressionNoDivineCertainty(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}) {
  return validateBetaNoDivineCertaintyLanguage(input);
}

export function validateBetaRegressionNoProfessionalAdvice(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}) {
  return validateBetaNoProfessionalAdviceLanguage(input);
}

export function createBetaScriptureExplanationFallbackRegressionQaReport(input: TeoyubeBetaScriptureExplanationFallbackQaInput = {}) {
  return {
    ...createBetaScriptureExplanationFallbackQaReport(input),
    regressionArea: "scripture_explanation_fallback" as const,
    remediationDidNotWeakenSpiritualSafety: true
  };
}
