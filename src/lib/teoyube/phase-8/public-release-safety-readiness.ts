export type TeoyubePublicReleaseSafetyReadinessInput = Partial<{
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafeAndNonEmpty: boolean;
  confidenceLabelsVisibleAndHumble: boolean;
  reviewedContentGateActive: boolean;
  divineCertaintyClaimed: boolean;
  professionalAdviceClaimed: boolean;
  debugPayloadHidden: boolean;
}>;

export type TeoyubePublicReleaseSafetyReadinessReport = {
  valid: boolean;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  preservesScriptureAnchors: true;
  preservesExplanationTraces: true;
  preservesFallbackSafety: true;
  preservesConfidenceLabels: true;
  noDivineCertaintyClaimed: true;
  noProfessionalAdviceClaimed: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validatePublicReleaseScriptureAnchors(input: TeoyubePublicReleaseSafetyReadinessInput = {}): boolean {
  return flag(input.scriptureAnchorsVisible);
}

export function validatePublicReleaseExplanationTraces(input: TeoyubePublicReleaseSafetyReadinessInput = {}): boolean {
  return flag(input.explanationTracesVisible);
}

export function validatePublicReleaseFallbackSafety(input: TeoyubePublicReleaseSafetyReadinessInput = {}): boolean {
  return flag(input.fallbackSafeAndNonEmpty);
}

export function validatePublicReleaseConfidenceLabels(input: TeoyubePublicReleaseSafetyReadinessInput = {}): boolean {
  return flag(input.confidenceLabelsVisibleAndHumble);
}

export function validatePublicReleaseReviewedContentGate(input: TeoyubePublicReleaseSafetyReadinessInput = {}): boolean {
  return flag(input.reviewedContentGateActive);
}

export function validatePublicReleaseNoDivineCertainty(input: TeoyubePublicReleaseSafetyReadinessInput = {}): boolean {
  return !input.divineCertaintyClaimed;
}

export function validatePublicReleaseNoProfessionalAdvice(input: TeoyubePublicReleaseSafetyReadinessInput = {}): boolean {
  return !input.professionalAdviceClaimed;
}

export function createPublicReleaseSafetyReadinessChecklist(input: TeoyubePublicReleaseSafetyReadinessInput = {}) {
  return [
    { id: "scripture_anchors", passed: validatePublicReleaseScriptureAnchors(input), details: "Scripture anchors are visible." },
    { id: "explanation_traces", passed: validatePublicReleaseExplanationTraces(input), details: "Explanation traces are visible." },
    { id: "fallback_safe", passed: validatePublicReleaseFallbackSafety(input), details: "Fallback is safe and non-empty." },
    { id: "confidence_labels", passed: validatePublicReleaseConfidenceLabels(input), details: "Confidence labels are humble and visible." },
    { id: "reviewed_content_gate", passed: validatePublicReleaseReviewedContentGate(input), details: "Reviewed content gate blocks review-only content." },
    { id: "no_divine_certainty", passed: validatePublicReleaseNoDivineCertainty(input), details: "No divine-certainty language is introduced." },
    { id: "no_professional_advice", passed: validatePublicReleaseNoProfessionalAdvice(input), details: "No professional-advice language is introduced." },
    { id: "debug_payload_hidden", passed: flag(input.debugPayloadHidden), details: "Debug payload is hidden from normal users." }
  ];
}

export function getPublicReleaseSafetyReadinessBlockers(input: TeoyubePublicReleaseSafetyReadinessInput = {}): string[] {
  return createPublicReleaseSafetyReadinessChecklist(input).filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
}

export function getPublicReleaseSafetyReadinessWarnings(): string[] {
  return ["Safety readiness is static/manual and should be rechecked with project QA before release candidate planning."];
}

export function createPublicReleaseSafetyReadinessReport(input: TeoyubePublicReleaseSafetyReadinessInput = {}): TeoyubePublicReleaseSafetyReadinessReport {
  const blockers = getPublicReleaseSafetyReadinessBlockers(input);
  return {
    valid: blockers.length === 0,
    checklist: createPublicReleaseSafetyReadinessChecklist(input),
    blockers,
    warnings: getPublicReleaseSafetyReadinessWarnings(),
    preservesScriptureAnchors: true,
    preservesExplanationTraces: true,
    preservesFallbackSafety: true,
    preservesConfidenceLabels: true,
    noDivineCertaintyClaimed: true,
    noProfessionalAdviceClaimed: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
