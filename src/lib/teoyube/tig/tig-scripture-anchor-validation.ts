import { getScriptureCanonData } from "../data/teoyube-data-access";
import type {
  TeoyubeTigRecommendationCandidate,
  TeoyubeTigRecommendationResult,
  TeoyubeTigScriptureAnchorCheck
} from "./tig-recommendation-contracts";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function getKnownAnchors(): string[] {
  return getScriptureCanonData().flatMap((entry) => entry.scriptureReferences);
}

function isAnchorKnown(anchor: string, knownAnchors: string[]): boolean {
  const normalizedAnchor = normalize(anchor);
  return knownAnchors.some((known) => {
    const normalizedKnown = normalize(known);
    return normalizedAnchor === normalizedKnown || normalizedAnchor.includes(normalizedKnown) || normalizedKnown.includes(normalizedAnchor);
  });
}

export function validateTigCandidateScriptureAnchors(
  candidate: TeoyubeTigRecommendationCandidate
): TeoyubeTigScriptureAnchorCheck {
  const knownAnchors = getKnownAnchors();
  const missingAnchors = candidate.scriptureAnchors.length ? [] : [candidate.id];
  const unsupportedAnchors = candidate.scriptureAnchors.filter((anchor) => !isAnchorKnown(anchor, knownAnchors));
  const blockers = [
    candidate.type === "promise" && missingAnchors.length ? `Promise candidate ${candidate.id} is missing Scripture support.` : undefined
  ].filter(Boolean) as string[];
  const warnings = [
    candidate.type === "prayer" && missingAnchors.length ? `Prayer candidate ${candidate.id} should expose Scripture support or fallback framing.` : undefined,
    candidate.type === "calling" && missingAnchors.length ? `Calling candidate ${candidate.id} should expose Scripture support or explanation path.` : undefined,
    candidate.type === "action_step" && missingAnchors.length ? `Action candidate ${candidate.id} should expose Scripture support or explanation path.` : undefined,
    ...unsupportedAnchors.map((anchor) => `Scripture anchor ${anchor} was not found directly in Scripture Canon references.`)
  ].filter(Boolean) as string[];

  return {
    valid: blockers.length === 0,
    candidateId: candidate.id,
    scriptureAnchors: candidate.scriptureAnchors,
    missingAnchors,
    unsupportedAnchors,
    blockers,
    warnings
  };
}

export function validateTigResultScriptureAnchors(
  result: TeoyubeTigRecommendationResult
): TeoyubeTigScriptureAnchorCheck {
  return validateTigCandidateScriptureAnchors(result.selectedCandidate);
}

export function validateTigRecommendationScriptureCoverage(
  results: TeoyubeTigRecommendationResult[]
) {
  const checks = results.map(validateTigResultScriptureAnchors);
  const blockers = checks.flatMap((check) => check.blockers);
  const warnings = checks.flatMap((check) => check.warnings);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings
  };
}

export function getMissingTigScriptureAnchorWarnings(
  results: TeoyubeTigRecommendationResult[]
): string[] {
  return validateTigRecommendationScriptureCoverage(results).warnings;
}

export function getTigScriptureAnchorBlockers(
  results: TeoyubeTigRecommendationResult[]
): string[] {
  return validateTigRecommendationScriptureCoverage(results).blockers;
}

export function createTigScriptureAnchorValidationReport(
  results: TeoyubeTigRecommendationResult[]
) {
  const coverage = validateTigRecommendationScriptureCoverage(results);
  return {
    ...coverage,
    resultCount: results.length,
    generatedAt: new Date().toISOString()
  };
}
