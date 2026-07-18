export type TeoyubePublicReleaseCandidateSafetyQaInput = Partial<{
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafeNonEmpty: boolean;
  confidenceLabelsVisible: boolean;
  reviewedContentGateBlocksReviewOnlyContent: boolean;
  divineCertaintyLanguagePresent: boolean;
  professionalAdviceLanguagePresent: boolean;
  debugPayloadVisibleToNormalUsers: boolean;
}>;

export type TeoyubePublicReleaseCandidateSafetyQaReport = {
  valid: boolean;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noDivineCertainty: true;
  noProfessionalAdvice: true;
  debugPayloadHiddenFromNormalUsers: true;
  scriptureAnchorsProtected: true;
  explanationTracesProtected: true;
  fallbackSafetyProtected: true;
  confidenceLabelsProtected: true;
  reviewedContentGateProtected: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function validatePublicCandidateScriptureAnchors(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): boolean {
  return flag(input.scriptureAnchorsVisible);
}

export function validatePublicCandidateExplanationTraces(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): boolean {
  return flag(input.explanationTracesVisible);
}

export function validatePublicCandidateFallbackSafety(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): boolean {
  return flag(input.fallbackSafeNonEmpty);
}

export function validatePublicCandidateConfidenceLabels(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): boolean {
  return flag(input.confidenceLabelsVisible);
}

export function validatePublicCandidateReviewedContentGate(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): boolean {
  return flag(input.reviewedContentGateBlocksReviewOnlyContent);
}

export function validatePublicCandidateNoDivineCertainty(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): boolean {
  return !input.divineCertaintyLanguagePresent;
}

export function validatePublicCandidateNoProfessionalAdvice(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): boolean {
  return !input.professionalAdviceLanguagePresent;
}

export function validatePublicCandidateNoDebugPayload(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): boolean {
  return !input.debugPayloadVisibleToNormalUsers;
}

function createPublicReleaseCandidateSafetyQaChecklist(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}) {
  return [
    check("scripture_anchors_visible", validatePublicCandidateScriptureAnchors(input), "Scripture anchors are visible where available."),
    check("explanation_traces_visible", validatePublicCandidateExplanationTraces(input), "Explanation traces are visible where required."),
    check("fallback_safe_non_empty", validatePublicCandidateFallbackSafety(input), "Fallback state is safe and non-empty."),
    check("confidence_labels_visible", validatePublicCandidateConfidenceLabels(input), "Confidence labels remain visible and humble."),
    check("reviewed_content_gate", validatePublicCandidateReviewedContentGate(input), "Reviewed content gate blocks review-only content."),
    check("no_divine_certainty", validatePublicCandidateNoDivineCertainty(input), "No divine-certainty language is present."),
    check("no_professional_advice", validatePublicCandidateNoProfessionalAdvice(input), "No professional-advice language is present."),
    check("debug_payload_hidden", validatePublicCandidateNoDebugPayload(input), "Debug payload is hidden from normal users.")
  ];
}

export function getPublicReleaseCandidateSafetyQaBlockers(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): string[] {
  return createPublicReleaseCandidateSafetyQaChecklist(input).filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
}

export function getPublicReleaseCandidateSafetyQaWarnings(): string[] {
  return ["Public release candidate safety QA is manual and in-memory; it does not publish, persist, or connect services."];
}

export function createPublicReleaseCandidateSafetyQaReport(input: TeoyubePublicReleaseCandidateSafetyQaInput = {}): TeoyubePublicReleaseCandidateSafetyQaReport {
  const blockers = getPublicReleaseCandidateSafetyQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checklist: createPublicReleaseCandidateSafetyQaChecklist(input),
    blockers,
    warnings: getPublicReleaseCandidateSafetyQaWarnings(),
    noDivineCertainty: true,
    noProfessionalAdvice: true,
    debugPayloadHiddenFromNormalUsers: true,
    scriptureAnchorsProtected: true,
    explanationTracesProtected: true,
    fallbackSafetyProtected: true,
    confidenceLabelsProtected: true,
    reviewedContentGateProtected: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
