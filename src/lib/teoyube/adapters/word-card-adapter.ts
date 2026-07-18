import { createWordCardContext } from "../language/teoyube-language-engine";
import { runTigWordRecommendation } from "../tig/tig-end-to-end-recommendation-flow";

export function createWordCardAdapterProps(wordId: string) {
  const context = createWordCardContext(wordId);
  const tigRecommendation = runTigWordRecommendation({
    wordId,
    query: context.word.word,
    surface: "word_card"
  });
  return {
    word: {
      id: context.word.id,
      word: context.word.word,
      teoyubeWord: context.word.word,
      meaning: context.word.meaning,
      category: context.word.category,
      scriptureReferences: context.scriptureAnchors,
      promiseStatement: context.promiseConnections[0]?.declaration,
      promiseConnections: context.promiseConnections.map((cluster) => ({
        id: cluster.id,
        title: cluster.title,
        theme: cluster.theme
      })),
      prayerUse: context.prayerUse,
      explanationPath: context.explanationPath,
      tigExplanationTrace: tigRecommendation.explanationTrace.steps,
      tigConfidenceLabel: tigRecommendation.confidence.label,
      tigFallbackReason: tigRecommendation.fallback.used ? tigRecommendation.fallback.message : undefined
    },
    context,
    tigRecommendation,
    component: "WordCard" as const,
    safeForClientProps: true
  };
}
