import { createCallingCompassTigProductionInput, createPromiseClusterTigProductionInput } from "../../tig";
import { createWordCardContext } from "../language/teoyube-language-engine";
import { createPromiseRecommendationContext } from "../promises/promise-engine";
import { runTigResponsePanelRecommendation } from "../tig/tig-end-to-end-recommendation-flow";

export function createTigResponsePanelAdapterContext(input: {
  query?: string;
  wordId?: string;
  clusterId?: string;
  mode?: "word" | "promise" | "calling";
} = {}) {
  const wordContext = input.wordId ? createWordCardContext(input.wordId) : undefined;
  const promiseContext = createPromiseRecommendationContext({
    query: input.query,
    clusterId: input.clusterId,
    theme: input.query
  });
  const productionInput = input.mode === "calling"
    ? createCallingCompassTigProductionInput({
      input: input.query,
      selectedWordId: input.wordId,
      selectedClusterId: input.clusterId
    })
    : createPromiseClusterTigProductionInput({
      input: input.query,
      selectedWordId: input.wordId,
      selectedClusterId: input.clusterId || promiseContext.clusters[0]?.id
    });
  const tigRecommendation = runTigResponsePanelRecommendation({
    query: input.query,
    wordId: input.wordId,
    clusterId: input.clusterId || promiseContext.clusters[0]?.id,
    surface: "tig_response_panel"
  });

  return {
    component: "TIGResponsePanel" as const,
    productionInput,
    wordContext,
    promiseContext,
    panelData: {
      scriptureAnchors: wordContext?.scriptureAnchors || promiseContext.scriptureAnchors,
      explanationPath: [
        ...(wordContext?.explanationPath || []),
        ...promiseContext.explanationPath
      ],
      confidenceLabel: tigRecommendation.confidence.label,
      fallbackUsed: !promiseContext.valid || tigRecommendation.fallback.used,
      fallbackReason: tigRecommendation.fallback.used ? tigRecommendation.fallback.message : undefined,
      explanationTrace: tigRecommendation.explanationTrace.steps,
      selectedCandidate: tigRecommendation.selectedCandidate.label
    },
    tigRecommendation,
    safeForClientProps: true,
    noLiveAiOrchestration: true
  };
}
