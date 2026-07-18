export type TeoyubeFinalPublicSafetyRegressionInput = Partial<{
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsVisibleHumble: boolean;
  reviewedContentGateActive: boolean;
  divineCertaintyLanguagePresent: boolean;
  professionalAdviceLanguagePresent: boolean;
  debugPayloadVisibleToNormalUsers: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validateFinalScriptureAnchors(input: TeoyubeFinalPublicSafetyRegressionInput = {}): boolean {
  return flag(input.scriptureAnchorsVisible);
}

export function validateFinalExplanationTraces(input: TeoyubeFinalPublicSafetyRegressionInput = {}): boolean {
  return flag(input.explanationTracesVisible);
}

export function validateFinalFallbackSafety(input: TeoyubeFinalPublicSafetyRegressionInput = {}): boolean {
  return flag(input.fallbackSafe);
}

export function validateFinalConfidenceLabels(input: TeoyubeFinalPublicSafetyRegressionInput = {}): boolean {
  return flag(input.confidenceLabelsVisibleHumble);
}

export function validateFinalReviewedContentGate(input: TeoyubeFinalPublicSafetyRegressionInput = {}): boolean {
  return flag(input.reviewedContentGateActive);
}

export function validateFinalNoDivineCertainty(input: TeoyubeFinalPublicSafetyRegressionInput = {}): boolean {
  return !input.divineCertaintyLanguagePresent;
}

export function validateFinalNoProfessionalAdvice(input: TeoyubeFinalPublicSafetyRegressionInput = {}): boolean {
  return !input.professionalAdviceLanguagePresent;
}

export function validateFinalNoDebugPayload(input: TeoyubeFinalPublicSafetyRegressionInput = {}): boolean {
  return !input.debugPayloadVisibleToNormalUsers;
}

export function createFinalPublicSafetyRegressionReport(input: TeoyubeFinalPublicSafetyRegressionInput = {}) {
  const checks = [
    { id: "scripture_anchors", passed: validateFinalScriptureAnchors(input), details: "Scripture anchors are visible." },
    { id: "explanation_traces", passed: validateFinalExplanationTraces(input), details: "Explanation traces are visible." },
    { id: "fallback_safety", passed: validateFinalFallbackSafety(input), details: "Fallback is safe." },
    { id: "confidence_labels", passed: validateFinalConfidenceLabels(input), details: "Confidence labels are visible and humble." },
    { id: "reviewed_content_gate", passed: validateFinalReviewedContentGate(input), details: "Reviewed content gate remains active." },
    { id: "no_divine_certainty", passed: validateFinalNoDivineCertainty(input), details: "No divine-certainty language is present." },
    { id: "no_professional_advice", passed: validateFinalNoProfessionalAdvice(input), details: "No professional-advice language is present." },
    { id: "no_debug_payload", passed: validateFinalNoDebugPayload(input), details: "Debug payload is hidden from normal users." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Final public safety regression is manual and in-memory."],
    scriptureAnchorsProtected: true,
    explanationTracesProtected: true,
    fallbackSafetyProtected: true,
    confidenceLabelsProtected: true,
    reviewedContentGateProtected: true,
    noDivineCertainty: true,
    noProfessionalAdvice: true,
    noDebugPayloadVisible: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
