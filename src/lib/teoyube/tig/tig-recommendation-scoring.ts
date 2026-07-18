import type {
  TeoyubeTigRecommendationCandidate,
  TeoyubeTigRecommendationConfidence,
  TeoyubeTigRecommendationConfidenceLabel,
  TeoyubeTigRecommendationContext
} from "./tig-recommendation-contracts";

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenMatches(candidate: TeoyubeTigRecommendationCandidate, context: TeoyubeTigRecommendationContext): number {
  const queryTokens = normalize(context.query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
  if (!queryTokens.length) return 0;

  const searchable = normalize([
    candidate.id,
    candidate.label,
    candidate.description,
    candidate.type,
    ...candidate.relatedWordIds,
    ...candidate.relatedPromiseClusterIds,
    ...candidate.relatedCallingIds,
    ...candidate.scriptureAnchors
  ].join(" "));
  const matches = queryTokens.filter((token) => searchable.includes(token)).length;
  return clamp(matches / Math.max(1, Math.min(queryTokens.length, 6)));
}

export function createTigConfidenceLabel(
  score: number,
  candidate: TeoyubeTigRecommendationCandidate,
  context: TeoyubeTigRecommendationContext
): TeoyubeTigRecommendationConfidenceLabel {
  const normalizedScore = clamp(score);
  if (context.fallbackStatus.used || candidate.source === "safe_fallback") return "fallback_match";
  if (candidate.scriptureAnchors.length === 0) return "insufficient_data";
  if (normalizedScore >= 0.82) return "strong_scripture_match";
  if (normalizedScore >= 0.64) return "good_contextual_match";
  if (normalizedScore >= 0.42) return "partial_match";
  return "insufficient_data";
}

export function explainTigConfidence(
  candidate: TeoyubeTigRecommendationCandidate,
  context: TeoyubeTigRecommendationContext
): string {
  if (candidate.source === "safe_fallback" || context.fallbackStatus.used) {
    return "Confidence is framed as fallback support because Teoyube needed safer Scripture-grounded context.";
  }
  if (candidate.scriptureAnchors.length > 0 && candidate.explanationPath.length > 0) {
    return "Confidence reflects Scripture anchors, real Promise/Word/Calling data, and a visible explanation path. It does not imply divine certainty.";
  }
  return "Confidence is limited because some supporting data or explanation details are missing.";
}

export function scoreTigRecommendationCandidate(
  candidate: TeoyubeTigRecommendationCandidate,
  context: TeoyubeTigRecommendationContext
): TeoyubeTigRecommendationConfidence {
  const scriptureAnchorStrength = clamp(candidate.scriptureAnchors.length / 3);
  const promiseClusterRelevance = clamp(candidate.relatedPromiseClusterIds.length / 2);
  const teoyubeWordRelevance = clamp(candidate.relatedWordIds.length / 3 + (candidate.type === "word" ? 0.25 : 0));
  const callingPathRelevance = clamp(candidate.relatedCallingIds.length / 2 + (candidate.type === "calling" ? 0.25 : 0));
  const prayerActionRelevance = clamp(
    candidate.relatedPrayerIds.length / 3 +
      candidate.relatedActionIds.length / 3 +
      (candidate.type === "prayer" || candidate.type === "action_step" ? 0.2 : 0)
  );
  const explanationTraceCompleteness = clamp(candidate.explanationPath.length / 4 + candidate.reasons.length / 4);
  const fallbackPenalty = candidate.source === "safe_fallback" || context.fallbackStatus.used ? 0.18 : 0;
  const dataQualityPenalty = clamp((candidate.warnings.length + context.warnings.length * 0.25) / 8);
  const relevanceBonus = tokenMatches(candidate, context) * 0.14;
  const score = clamp(
    scriptureAnchorStrength * 0.28 +
      promiseClusterRelevance * 0.16 +
      teoyubeWordRelevance * 0.13 +
      callingPathRelevance * 0.1 +
      prayerActionRelevance * 0.09 +
      explanationTraceCompleteness * 0.16 +
      relevanceBonus -
      fallbackPenalty -
      dataQualityPenalty * 0.12
  );

  return {
    score,
    label: createTigConfidenceLabel(score, candidate, context),
    explanation: explainTigConfidence(candidate, context),
    factors: {
      scriptureAnchorStrength,
      promiseClusterRelevance,
      teoyubeWordRelevance,
      callingPathRelevance,
      prayerActionRelevance,
      explanationTraceCompleteness,
      fallbackPenalty,
      dataQualityPenalty
    }
  };
}

export function scoreTigRecommendationCandidates(
  candidates: TeoyubeTigRecommendationCandidate[],
  context: TeoyubeTigRecommendationContext
) {
  return candidates.map((candidate) => ({
    candidate,
    confidence: scoreTigRecommendationCandidate(candidate, context)
  }));
}

export function rankTigRecommendationCandidates(
  candidates: TeoyubeTigRecommendationCandidate[],
  context: TeoyubeTigRecommendationContext
): TeoyubeTigRecommendationCandidate[] {
  return scoreTigRecommendationCandidates(candidates, context)
    .sort((a, b) => {
      if (b.confidence.score !== a.confidence.score) return b.confidence.score - a.confidence.score;
      return b.candidate.scriptureAnchors.length - a.candidate.scriptureAnchors.length;
    })
    .map((entry) => entry.candidate);
}

export function validateTigConfidenceSafety(candidate: TeoyubeTigRecommendationCandidate) {
  const text = [candidate.label, candidate.description, ...candidate.explanationPath].join(" ");
  const textWithoutDisclaimers = text.replace(
    /not divine certainty|does not claim divine certainty|without claiming divine certainty/gi,
    ""
  );
  const overclaimingPattern = /god told you|must be your calling|guaranteed outcome|will definitely|this is divine certainty/i;
  const blockers = overclaimingPattern.test(textWithoutDisclaimers)
    ? ["Recommendation language appears to overclaim certainty."]
    : [];

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: candidate.scriptureAnchors.length ? [] : ["Confidence should remain low because Scripture anchors are missing."]
  };
}
