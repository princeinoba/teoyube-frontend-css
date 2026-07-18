import { getScriptureCanonData } from "../data/teoyube-data-access";
import type {
  TeoyubeTigRecommendationCandidate,
  TeoyubeTigRecommendationContext,
  TeoyubeTigRecommendationFallback
} from "./tig-recommendation-contracts";
import { rankTigRecommendationCandidates, scoreTigRecommendationCandidate } from "./tig-recommendation-scoring";

function firstCanonAnchor(): string | undefined {
  return getScriptureCanonData().find((entry) => entry.scriptureReferences.length)?.scriptureReferences[0];
}

export function shouldUseTigFallback(
  context: TeoyubeTigRecommendationContext,
  candidates: TeoyubeTigRecommendationCandidate[]
): boolean {
  const ranked = rankTigRecommendationCandidates(candidates, context);
  const best = ranked[0];
  if (!best) return true;
  const confidence = scoreTigRecommendationCandidate(best, context);

  return (
    context.blockers.length > 0 ||
    !candidates.some((candidate) => candidate.scriptureAnchors.length > 0) ||
    !candidates.some((candidate) => candidate.type === "promise" && candidate.scriptureAnchors.length > 0) ||
    confidence.score < 0.38 ||
    best.explanationPath.length === 0 ||
    context.fallbackStatus.used
  );
}

export function createTigFallbackExplanation(context: TeoyubeTigRecommendationContext): string[] {
  return [
    "Teoyube used fallback framing because the real-data recommendation needed safer support.",
    context.scriptureAnchors.length
      ? `The fallback remains anchored to ${context.scriptureAnchors[0]}.`
      : "The fallback used the first available Scripture Canon anchor.",
    "This is reflective guidance and does not claim divine certainty."
  ];
}

export function createTigFallbackRecommendation(
  context: TeoyubeTigRecommendationContext
): TeoyubeTigRecommendationCandidate {
  const anchor = context.scriptureAnchors[0] || firstCanonAnchor();
  return {
    id: "fallback:scripture_grounded_encouragement",
    type: "prayer",
    label: "Scripture-grounded fallback encouragement",
    description: "Use a humble Scripture-grounded reflection, prayer, and one gentle faithful next step.",
    scriptureAnchors: anchor ? [anchor] : [],
    relatedWordIds: context.wordContext ? [context.wordContext.word.id] : [],
    relatedPromiseClusterIds: context.promiseContext.clusters.map((cluster) => cluster.id),
    relatedCallingIds: context.callingPath ? [context.callingPath.archetype.id] : [],
    relatedPrayerIds: [context.prayerContext.title],
    relatedActionIds: context.actionSteps.slice(0, 1),
    tigNodeIds: context.tigGraphReferences.nodeIds,
    tigRelationshipIds: context.tigGraphReferences.relationshipIds,
    source: "safe_fallback",
    reasons: [
      {
        id: "fallback_safe_scripture",
        label: "Fallback selected",
        detail: "Fallback was selected to preserve Scripture anchoring, humility, and safe explanation.",
        source: "fallback",
        scriptureAnchors: anchor ? [anchor] : [],
        visibleToUser: true
      }
    ],
    explanationPath: createTigFallbackExplanation(context),
    warnings: anchor ? [] : ["Fallback could not find a Scripture Canon anchor."],
    fallbackEligible: false
  };
}

export function validateTigFallbackSafety(fallback: TeoyubeTigRecommendationFallback) {
  const blockers = [
    !fallback.message ? "Fallback message is empty." : undefined,
    !fallback.safe ? "Fallback is not marked safe." : undefined
  ].filter(Boolean) as string[];
  const warnings = [
    fallback.scriptureAnchors.length === 0 ? "Fallback has no Scripture anchor." : undefined,
    fallback.reasons.length === 0 ? "Fallback has no visible reason." : undefined
  ].filter(Boolean) as string[];

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createTigFallbackReport(
  context: TeoyubeTigRecommendationContext,
  candidates: TeoyubeTigRecommendationCandidate[]
) {
  const used = shouldUseTigFallback(context, candidates);
  const candidate = used ? createTigFallbackRecommendation(context) : undefined;
  const fallback: TeoyubeTigRecommendationFallback = {
    used,
    reasons: used
      ? [
        ...context.fallbackStatus.reasons,
        !candidates.length ? "no_candidates" : "",
        !candidates.some((entry) => entry.scriptureAnchors.length) ? "missing_scripture_anchored_candidate" : ""
      ].filter(Boolean)
      : [],
    message: used
      ? "Using a safe Scripture-grounded fallback because the recommendation needs more complete support."
      : "No fallback was required.",
    scriptureAnchors: candidate?.scriptureAnchors || context.scriptureAnchors,
    safe: context.blockers.length === 0
  };
  const validation = validateTigFallbackSafety(fallback);

  return {
    used,
    candidate,
    fallback,
    valid: validation.valid,
    blockers: validation.blockers,
    warnings: validation.warnings
  };
}
