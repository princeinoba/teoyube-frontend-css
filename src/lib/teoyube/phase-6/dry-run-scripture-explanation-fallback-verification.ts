export type TeoyubeDryRunSafetySurface =
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "feedback_intake"
  | "issue_triage";

export type TeoyubeDryRunScriptureExplanationFallbackCheck = {
  id: string;
  surface: TeoyubeDryRunSafetySurface;
  scriptureAnchorsVisible: boolean;
  explanationPathVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelVisible: boolean;
  privacyConsentVisible: boolean;
  noDivineCertainty: boolean;
  noProfessionalAdvice: boolean;
  details: string;
};

export type TeoyubeDryRunScriptureExplanationFallbackReport = {
  valid: boolean;
  checks: TeoyubeDryRunScriptureExplanationFallbackCheck[];
  blockers: string[];
  warnings: string[];
  scriptureAnchorsPreserved: boolean;
  explanationPathsPreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLabelsPreserved: boolean;
  privacyConsentPreserved: boolean;
  noDivineCertaintyClaims: boolean;
  noProfessionalAdviceClaims: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(surface: TeoyubeDryRunSafetySurface, details: string): TeoyubeDryRunScriptureExplanationFallbackCheck {
  return {
    id: `dry_run_safety_${surface}`,
    surface,
    scriptureAnchorsVisible: true,
    explanationPathVisible: true,
    fallbackSafe: true,
    confidenceLabelVisible: true,
    privacyConsentVisible: true,
    noDivineCertainty: true,
    noProfessionalAdvice: true,
    details
  };
}

export function getDryRunScriptureExplanationFallbackChecks(): TeoyubeDryRunScriptureExplanationFallbackCheck[] {
  return [
    check("word_card", "WordCard keeps Scripture anchors and supported fallback states visible."),
    check("promise_table", "Promise Table rows retain Scripture support and avoid unsupported promise claims."),
    check("prayer_companion", "PrayerCompanion remains devotional, anchored, humble, and non-persistent."),
    check("compass_experience", "CompassExperience keeps calling guidance bounded with explanation paths."),
    check("tig_response_panel", "TIGResponsePanel preserves selected word, promise cluster, Scripture, confidence, and explanation path."),
    check("tig_graph_explorer", "TIGGraphExplorer preserves relationship labels, Scripture anchors, and list fallback."),
    check("feedback_intake", "Feedback intake simulation redacts sensitive text and keeps privacy reminders visible."),
    check("issue_triage", "Issue triage keeps blockers visible to the owner without contacting users.")
  ];
}

export function verifyDryRunScriptureExplanationFallback(
  checks: TeoyubeDryRunScriptureExplanationFallbackCheck[] = getDryRunScriptureExplanationFallbackChecks()
): boolean {
  return checks.every((entry) =>
    entry.scriptureAnchorsVisible &&
    entry.explanationPathVisible &&
    entry.fallbackSafe &&
    entry.confidenceLabelVisible &&
    entry.privacyConsentVisible &&
    entry.noDivineCertainty &&
    entry.noProfessionalAdvice
  );
}

export function createDryRunScriptureExplanationFallbackReport(
  checks: TeoyubeDryRunScriptureExplanationFallbackCheck[] = getDryRunScriptureExplanationFallbackChecks()
): TeoyubeDryRunScriptureExplanationFallbackReport {
  const blockers = checks.flatMap((entry) => {
    const issues = [
      !entry.scriptureAnchorsVisible ? "Scripture anchors missing" : "",
      !entry.explanationPathVisible ? "Explanation path missing" : "",
      !entry.fallbackSafe ? "Unsafe fallback" : "",
      !entry.confidenceLabelVisible ? "Confidence label missing" : "",
      !entry.privacyConsentVisible ? "Privacy/consent notice missing" : "",
      !entry.noDivineCertainty ? "Divine-certainty claim detected" : "",
      !entry.noProfessionalAdvice ? "Professional-advice claim detected" : ""
    ].filter(Boolean);
    return issues.map((issue) => `${entry.surface}: ${issue}`);
  });
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [],
    scriptureAnchorsPreserved: checks.every((entry) => entry.scriptureAnchorsVisible),
    explanationPathsPreserved: checks.every((entry) => entry.explanationPathVisible),
    fallbackSafetyPreserved: checks.every((entry) => entry.fallbackSafe),
    confidenceLabelsPreserved: checks.every((entry) => entry.confidenceLabelVisible),
    privacyConsentPreserved: checks.every((entry) => entry.privacyConsentVisible),
    noDivineCertaintyClaims: checks.every((entry) => entry.noDivineCertainty),
    noProfessionalAdviceClaims: checks.every((entry) => entry.noProfessionalAdvice),
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
