export type TeoyubeBetaSafetyTheologyBoundaryInput = Partial<{
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsHumble: boolean;
  divineCertaintyClaimsPresent: boolean;
  professionalAdviceClaimsPresent: boolean;
  devotionalLanguageEncouraging: boolean;
}>;

export type TeoyubeBetaSafetyTheologyBoundaryRule = {
  id: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeBetaSafetyTheologyBoundaryReport = {
  valid: boolean;
  rules: TeoyubeBetaSafetyTheologyBoundaryRule[];
  blockers: string[];
  warnings: string[];
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsHumble: boolean;
  noDivineCertaintyClaims: boolean;
  noProfessionalAdviceClaims: boolean;
  devotionalLanguageEncouragementOnly: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

function rule(id: string, label: string, passed: boolean, details: string): TeoyubeBetaSafetyTheologyBoundaryRule {
  return { id, label, passed, details };
}

export function validateBetaScriptureAnchoringBoundary(input: TeoyubeBetaSafetyTheologyBoundaryInput = {}): TeoyubeBetaSafetyTheologyBoundaryRule {
  return rule("scripture_anchors_visible", "Scripture anchors remain visible", input.scriptureAnchorsVisible !== false, "Scripture anchors must remain visible where available.");
}

export function validateBetaExplanationTraceBoundary(input: TeoyubeBetaSafetyTheologyBoundaryInput = {}): TeoyubeBetaSafetyTheologyBoundaryRule {
  return rule("explanation_traces_visible", "Explanation traces remain visible", input.explanationTracesVisible !== false, "Explanation traces must remain visible.");
}

export function validateBetaFallbackSafetyBoundary(input: TeoyubeBetaSafetyTheologyBoundaryInput = {}): TeoyubeBetaSafetyTheologyBoundaryRule {
  return rule("fallback_safe", "Fallback remains safe", input.fallbackSafe !== false, "Fallback must remain humble, bounded, and non-empty.");
}

export function validateBetaConfidenceBoundary(input: TeoyubeBetaSafetyTheologyBoundaryInput = {}): TeoyubeBetaSafetyTheologyBoundaryRule {
  return rule("confidence_labels_humble", "Confidence labels remain humble", input.confidenceLabelsHumble !== false, "Confidence labels must avoid overclaiming certainty.");
}

export function validateBetaNoDivineCertaintyBoundary(input: TeoyubeBetaSafetyTheologyBoundaryInput = {}): TeoyubeBetaSafetyTheologyBoundaryRule {
  return rule("no_divine_certainty", "No divine-certainty claims", !input.divineCertaintyClaimsPresent, "Teoyube must not claim God guarantees or directly told the user a result.");
}

export function validateBetaNoProfessionalAdviceBoundary(input: TeoyubeBetaSafetyTheologyBoundaryInput = {}): TeoyubeBetaSafetyTheologyBoundaryRule {
  return rule("no_professional_advice", "No professional advice claims", !input.professionalAdviceClaimsPresent, "Teoyube must not provide medical, legal, financial, emergency, or clinical advice.");
}

export function createBetaSafetyTheologyBoundaryRules(input: TeoyubeBetaSafetyTheologyBoundaryInput = {}): TeoyubeBetaSafetyTheologyBoundaryRule[] {
  return [
    validateBetaScriptureAnchoringBoundary(input),
    validateBetaExplanationTraceBoundary(input),
    validateBetaFallbackSafetyBoundary(input),
    validateBetaConfidenceBoundary(input),
    validateBetaNoDivineCertaintyBoundary(input),
    validateBetaNoProfessionalAdviceBoundary(input),
    rule("devotional_encouragement_only", "Devotional language remains encouragement", input.devotionalLanguageEncouraging !== false, "Devotional language supports reflection without certainty or advice claims.")
  ];
}

export function createBetaSafetyTheologyBoundaryReport(input: TeoyubeBetaSafetyTheologyBoundaryInput = {}): TeoyubeBetaSafetyTheologyBoundaryReport {
  const rules = createBetaSafetyTheologyBoundaryRules(input);
  const failed = rules.filter((entry) => !entry.passed);
  return {
    valid: failed.length === 0,
    rules,
    blockers: failed.map((entry) => `${entry.label}: ${entry.details}`),
    warnings: ["Safety/theology boundaries must be reviewed again during Phase 6.2 dry-run simulation."],
    scriptureAnchorsVisible: input.scriptureAnchorsVisible !== false,
    explanationTracesVisible: input.explanationTracesVisible !== false,
    fallbackSafe: input.fallbackSafe !== false,
    confidenceLabelsHumble: input.confidenceLabelsHumble !== false,
    noDivineCertaintyClaims: !input.divineCertaintyClaimsPresent,
    noProfessionalAdviceClaims: !input.professionalAdviceClaimsPresent,
    devotionalLanguageEncouragementOnly: input.devotionalLanguageEncouraging !== false,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

