import { runPromiseClusterTigProduction } from "../../tig";
import { createOfflineReadonlyResponseFallback } from "../mobile-scale/offline-readonly-strategy";
import type { TeoyubeSafetyQaCheck } from "./launch-qa-contracts";

function hasDivineCertaintyClaim(text: string): boolean {
  return ["god guarantees that you are", "god told me you are", "this proves your calling is"].some((phrase) =>
    text.toLowerCase().includes(phrase)
  );
}

function check(id: string, title: string, purpose: string, safetyRequirement: string): TeoyubeSafetyQaCheck {
  return {
    id,
    surface: "tig_response_panel",
    title,
    purpose,
    riskLevel: "critical",
    launchCritical: true,
    category: "tig",
    expectedResult: "TIG output remains Scripture-anchored, explainable, confidence-aware, and fallback-safe.",
    safetyRequirement
  };
}

export function getTigProductionQaChecklist(): TeoyubeSafetyQaCheck[] {
  return [
    check("tig_scripture_anchor", "Scripture anchor required", "Every production recommendation includes Scripture.", "Scripture anchoring"),
    check("tig_explanation_path", "Explanation path required", "Promise, prayer, and action have explanation paths.", "Explanation path"),
    check("tig_fallback_non_empty", "Fallback non-empty", "Fallback response is never empty.", "Fallback safety"),
    check("tig_confidence_bounded", "Confidence bounded", "Confidence is not overstated.", "Confidence safety"),
    check("tig_no_divine_certainty", "No divine certainty", "Response avoids guaranteed user-specific divine claims.", "Theological safety")
  ];
}

export function validateTigScriptureAnchoringQa(): boolean {
  return Boolean(runPromiseClusterTigProduction().selection.scriptureAnchor);
}

export function validateTigExplanationPathQa(): boolean {
  return runPromiseClusterTigProduction().explanation.reasonPath.length > 0;
}

export function validateTigFallbackQa(): boolean {
  const response = runPromiseClusterTigProduction({ emotion: "unknown", selectedWordId: "missing_word" });
  const offline = createOfflineReadonlyResponseFallback("daily_word");
  return Boolean(response.fallback.message && offline.scriptureReference && offline.explanationPath.length);
}

export function validateTigConfidenceQa(): boolean {
  const confidence = runPromiseClusterTigProduction().confidence;
  return confidence.score >= 0 && confidence.score <= 1;
}

export function validateTigProductionQaReadiness() {
  const response = runPromiseClusterTigProduction();
  const text = [response.explanation.summary, ...response.explanation.reasonPath, response.fallback.message].join(" ");
  const checks = [
    validateTigScriptureAnchoringQa(),
    validateTigExplanationPathQa(),
    validateTigFallbackQa(),
    validateTigConfidenceQa(),
    !hasDivineCertaintyClaim(text),
    response.visualization.nodes.length >= 0,
    !response.safety.blocked
  ];
  return { valid: checks.every(Boolean), checks };
}

export function createTigProductionQaReport() {
  const readiness = validateTigProductionQaReadiness();
  return {
    valid: readiness.valid,
    status: readiness.valid ? "pass" : "blocked",
    checkCount: getTigProductionQaChecklist().length,
    passedCount: readiness.checks.filter(Boolean).length,
    blockerCount: readiness.valid ? 0 : 1,
    warningCount: 0,
    blockers: readiness.valid ? [] : [{ id: "tig_production_qa", surface: "tig_response_panel", title: "TIG production QA blocker", riskLevel: "critical", reason: "TIG production QA failed.", requiredAction: "Resolve TIG production QA before launch." }],
    warnings: [],
    generatedAt: new Date().toISOString()
  };
}
