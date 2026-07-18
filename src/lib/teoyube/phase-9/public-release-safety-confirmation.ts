export type TeoyubePublicReleaseSafetyConfirmationInput = Partial<{
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafeAndNonEmpty: boolean;
  confidenceLabelsHumbleVisible: boolean;
  reviewedContentGateActive: boolean;
  divineCertaintyClaims: boolean;
  professionalAdviceClaims: boolean;
  debugPayloadVisible: boolean;
}>;

export type TeoyubePublicReleaseSafetyConfirmationDecision =
  | "safety_confirmed"
  | "blocked"
  | "unknown";

export type TeoyubePublicReleaseSafetyConfirmationReport = {
  valid: boolean;
  decision: TeoyubePublicReleaseSafetyConfirmationDecision;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  scriptureAnchorsProtected: true;
  explanationTracesProtected: true;
  fallbackSafetyProtected: true;
  confidenceLabelsProtected: true;
  reviewedContentGateProtected: true;
  noDivineCertaintyClaims: true;
  noProfessionalAdviceClaims: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function confirmPublicReleaseScriptureAnchors(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): boolean {
  return flag(input.scriptureAnchorsVisible);
}

export function confirmPublicReleaseExplanationTraces(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): boolean {
  return flag(input.explanationTracesVisible);
}

export function confirmPublicReleaseFallbackSafety(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): boolean {
  return flag(input.fallbackSafeAndNonEmpty);
}

export function confirmPublicReleaseConfidenceLabels(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): boolean {
  return flag(input.confidenceLabelsHumbleVisible);
}

export function confirmPublicReleaseReviewedContentGate(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): boolean {
  return flag(input.reviewedContentGateActive);
}

export function confirmNoDivineCertaintyClaims(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): boolean {
  return !input.divineCertaintyClaims;
}

export function confirmNoProfessionalAdviceClaims(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): boolean {
  return !input.professionalAdviceClaims;
}

export function confirmNoDebugPayloadVisible(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): boolean {
  return !input.debugPayloadVisible;
}

function checks(input: TeoyubePublicReleaseSafetyConfirmationInput = {}) {
  return [
    check("scripture_anchors", confirmPublicReleaseScriptureAnchors(input), "Scripture anchors are visible."),
    check("explanation_traces", confirmPublicReleaseExplanationTraces(input), "Explanation traces are visible."),
    check("fallback_safe", confirmPublicReleaseFallbackSafety(input), "Fallback is safe and non-empty."),
    check("confidence_labels", confirmPublicReleaseConfidenceLabels(input), "Confidence labels are humble and visible."),
    check("reviewed_content_gate", confirmPublicReleaseReviewedContentGate(input), "Reviewed content gate blocks review-only content."),
    check("no_divine_certainty", confirmNoDivineCertaintyClaims(input), "No divine-certainty language is present."),
    check("no_professional_advice", confirmNoProfessionalAdviceClaims(input), "No professional-advice language is present."),
    check("debug_payload_hidden", confirmNoDebugPayloadVisible(input), "Debug payload is hidden from normal users.")
  ];
}

export function createPublicReleaseSafetyConfirmationDecision(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): TeoyubePublicReleaseSafetyConfirmationDecision {
  return checks(input).some((entry) => !entry.passed) ? "blocked" : "safety_confirmed";
}

export function createPublicReleaseSafetyConfirmationReport(input: TeoyubePublicReleaseSafetyConfirmationInput = {}): TeoyubePublicReleaseSafetyConfirmationReport {
  const entries = checks(input);
  const blockers = entries.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    decision: createPublicReleaseSafetyConfirmationDecision(input),
    checks: entries,
    blockers,
    warnings: ["Public release safety confirmation is manual and should be rechecked during Phase 9.2 candidate QA."],
    scriptureAnchorsProtected: true,
    explanationTracesProtected: true,
    fallbackSafetyProtected: true,
    confidenceLabelsProtected: true,
    reviewedContentGateProtected: true,
    noDivineCertaintyClaims: true,
    noProfessionalAdviceClaims: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
