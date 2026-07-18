import { createPromiseRecommendationContext } from "../promises/promise-engine";
import { runTigPrayerRecommendation } from "../tig/tig-end-to-end-recommendation-flow";

export function createPrayerCompanionAdapterContext(input: {
  message?: string;
  theme?: string;
} = {}) {
  const recommendation = createPromiseRecommendationContext({
    query: input.message || input.theme || "prayer",
    theme: input.theme
  });
  const cluster = recommendation.clusters[0];
  const tigRecommendation = runTigPrayerRecommendation({
    query: input.message || input.theme || "prayer",
    prayerInput: input.message,
    clusterId: cluster?.id,
    surface: "prayer_companion"
  });

  return {
    component: "PrayerCompanion" as const,
    request: {
      message: input.message || "I need Scripture-grounded prayer and direction."
    },
    safeDisplayData: {
      cluster: cluster?.title || "Scripture-Grounded Encouragement",
      response: cluster?.description || "Use a Scripture-anchored promise cluster before generating a prayer response.",
      scriptureAnchor: recommendation.scriptureAnchors[0],
      prayer: cluster?.prayerSequence.length
        ? `Pray through: ${cluster.prayerSequence.join(" -> ")}.`
        : "Father, guide this prayer through Scripture, humility, and one faithful next step.",
      journalPrompt: "Which Scripture anchor speaks most clearly to this need today?",
      confidenceLabel: recommendation.valid ? "anchored" : "needs_review",
      fallbackUsed: !recommendation.valid,
      fallbackReason: tigRecommendation.fallback.used ? tigRecommendation.fallback.message : undefined,
      safetyStatus: recommendation.valid ? "safe" : "needs_owner_review",
      explanationPath: recommendation.explanationPath,
      tigExplanationTrace: tigRecommendation.explanationTrace.steps,
      tigConfidenceLabel: tigRecommendation.confidence.label
    },
    recommendation,
    tigRecommendation,
    noAutomaticUserContact: true,
    noExternalCall: true
  };
}
