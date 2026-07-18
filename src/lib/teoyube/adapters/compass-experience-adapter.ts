import {
  explainCallingPath,
  recommendCallingPath,
  validateCallingPathScriptureAnchoring
} from "../calling/calling-engine";
import { runTigCallingRecommendation } from "../tig/tig-end-to-end-recommendation-flow";

export function createCompassExperienceAdapterContext(input: {
  query?: string;
  archetypeId?: string;
} = {}) {
  const path = recommendCallingPath(input);
  const validation = validateCallingPathScriptureAnchoring(path);
  const tigRecommendation = runTigCallingRecommendation({
    query: input.query || path.archetype.name,
    callingInput: input.query || path.archetype.name,
    wordId: path.words[0]?.id,
    clusterId: path.promises[0]?.id,
    surface: "compass_experience"
  });

  return {
    component: "CompassExperience" as const,
    initialSearchTerm: input.query || path.archetype.name || "TeoyubeWorld",
    callingPath: path,
    explanationPath: explainCallingPath(path),
    tigRecommendation,
    tigExplanationTrace: tigRecommendation.explanationTrace.steps,
    tigConfidenceLabel: tigRecommendation.confidence.label,
    tigFallbackReason: tigRecommendation.fallback.used ? tigRecommendation.fallback.message : undefined,
    validation,
    safeForClientProps: true,
    noYoutubeFetchPerformed: true,
    noLiveUiMutation: true
  };
}
