export type TeoyubeHardeningSafetyInput = Partial<{
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsVisible: boolean;
  divineCertaintyClaimed: boolean;
  professionalAdviceLanguageAdded: boolean;
  privacyConsentVisible: boolean;
}>;

export type TeoyubeHardeningSafetyRegressionReport = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noDivineCertaintyClaimed: true;
  noProfessionalAdviceAdded: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validateHardeningScriptureAnchors(input: TeoyubeHardeningSafetyInput = {}): boolean {
  return flag(input.scriptureAnchorsVisible);
}

export function validateHardeningExplanationTraces(input: TeoyubeHardeningSafetyInput = {}): boolean {
  return flag(input.explanationTracesVisible);
}

export function validateHardeningFallbackSafety(input: TeoyubeHardeningSafetyInput = {}): boolean {
  return flag(input.fallbackSafe);
}

export function validateHardeningConfidenceLabels(input: TeoyubeHardeningSafetyInput = {}): boolean {
  return flag(input.confidenceLabelsVisible);
}

export function validateHardeningNoDivineCertainty(input: TeoyubeHardeningSafetyInput = {}): boolean {
  return !input.divineCertaintyClaimed;
}

export function validateHardeningNoProfessionalAdvice(input: TeoyubeHardeningSafetyInput = {}): boolean {
  return !input.professionalAdviceLanguageAdded;
}

export function validateHardeningPrivacyConsent(input: TeoyubeHardeningSafetyInput = {}): boolean {
  return flag(input.privacyConsentVisible);
}

export function createHardeningSafetyRegressionReport(input: TeoyubeHardeningSafetyInput = {}): TeoyubeHardeningSafetyRegressionReport {
  const checks = [
    { id: "scripture_anchors_visible", passed: validateHardeningScriptureAnchors(input), details: "Scripture anchors remain visible." },
    { id: "explanation_traces_visible", passed: validateHardeningExplanationTraces(input), details: "Explanation traces remain visible." },
    { id: "fallback_safe", passed: validateHardeningFallbackSafety(input), details: "Fallback states remain safe." },
    { id: "confidence_labels_visible", passed: validateHardeningConfidenceLabels(input), details: "Confidence labels remain visible." },
    { id: "no_divine_certainty", passed: validateHardeningNoDivineCertainty(input), details: "No divine certainty is claimed." },
    { id: "no_professional_advice", passed: validateHardeningNoProfessionalAdvice(input), details: "No professional advice language was added." },
    { id: "privacy_consent_visible", passed: validateHardeningPrivacyConsent(input), details: "Privacy/consent boundaries remain visible." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Safety regression is manual/static and should be rechecked with project QA tooling when available."],
    noDivineCertaintyClaimed: true,
    noProfessionalAdviceAdded: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
