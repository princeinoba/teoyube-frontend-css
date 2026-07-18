import type {
  TeoyubeLearningSignal,
  TeoyubeLearningSignalType,
  TeoyubePersonalizationContext,
  TeoyubePersonalizationDecision,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import type {
  TigProductionInput,
  TigProductionResponse
} from "./production-response-contracts";
import {
  createSignalFromProductionInput,
  createSignalFromProductionResponse,
  mergeTeoyubePersonalizationSignals,
  summarizeTeoyubePersonalizationSignals
} from "./personalization-signals";

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function firstValue(items: Array<{ value: string; count: number }>): string | undefined {
  return items[0]?.value;
}

export function createTeoyubeLearningSignal(
  input: TigProductionInput,
  response: TigProductionResponse
): TeoyubeLearningSignal {
  const sourceSignals = [
    createSignalFromProductionInput(input),
    createSignalFromProductionResponse(response)
  ];
  const summary = summarizeTeoyubePersonalizationSignals(sourceSignals);
  const selectedCluster = firstValue(summary.topClusterIds);
  const selectedWord = firstValue(summary.topWordIds);
  const selectedScripture = firstValue(summary.topScriptureReferences);
  const type = selectedCluster
    ? "theme_affinity"
    : response.fallback.used
      ? "fallback_reduction"
      : "scripture_relevance";

  return {
    id: createId("learning_signal"),
    type,
    sourceSignalIds: sourceSignals.map((signal) => signal.id),
    patternKey: selectedCluster || selectedWord || selectedScripture || "general_scripture_support",
    score: scoreTeoyubeLearningRelevance(sourceSignals[1]),
    explanation:
      "This learning signal summarizes a production recommendation without storing raw private text.",
    suggestedAdjustment: response.fallback.used
      ? "reduce_repeated_fallback"
      : selectedCluster
        ? "prioritize_promise_cluster"
        : "surface_scripture_anchor",
    scriptureAnchored: Boolean(response.selection.scriptureAnchor),
    createdAt: new Date().toISOString()
  };
}

export function classifyTeoyubeLearningSignal(
  signal: TeoyubePersonalizationSignal
): TeoyubeLearningSignalType {
  if (signal.fallbackUsed) return "fallback_reduction";
  if (signal.selectedClusterId) return "theme_affinity";
  if (signal.selectedPrayerSequenceId) return "prayer_familiarity";
  if (signal.selectedScriptureReference) return "scripture_relevance";
  if (signal.surface) return "surface_preference";
  if (signal.callingId) return "calling_alignment";
  if (signal.journeyId) return "journey_continuity";
  return "confidence_adjustment";
}

export function scoreTeoyubeLearningRelevance(
  signal: TeoyubePersonalizationSignal
): number {
  let score = signal.weight * 0.35;

  if (signal.selectedScriptureReference) score += 0.2;
  if (signal.selectedClusterId) score += 0.15;
  if (signal.selectedWordId) score += 0.1;
  if (signal.selectedPrayerSequenceId) score += 0.08;
  if (signal.selectedActionStepId) score += 0.08;
  if (signal.confidenceLabel === "strong") score += 0.12;
  if (signal.confidenceLabel === "good") score += 0.08;
  if (signal.fallbackUsed) score -= 0.12;

  return clampScore(score);
}

export function groupLearningSignalsByPattern(
  signals: TeoyubePersonalizationSignal[]
): Record<string, TeoyubeLearningSignal[]> {
  const normalized = mergeTeoyubePersonalizationSignals(signals);

  return normalized.reduce<Record<string, TeoyubeLearningSignal[]>>((groups, signal) => {
    const type = classifyTeoyubeLearningSignal(signal);
    const patternKey =
      signal.selectedClusterId ||
      signal.selectedWordId ||
      signal.selectedScriptureReference ||
      signal.surface ||
      signal.intent ||
      "general";
    const learningSignal: TeoyubeLearningSignal = {
      id: createId("learning_signal"),
      type,
      sourceSignalIds: [signal.id],
      patternKey,
      score: scoreTeoyubeLearningRelevance(signal),
      explanation:
        "Grouped from a safe structured personalization signal for future explainable learning.",
      suggestedAdjustment:
        type === "fallback_reduction"
          ? "reduce_repeated_fallback"
          : type === "prayer_familiarity"
            ? "recommend_familiar_prayer"
            : type === "journey_continuity"
              ? "continue_journey"
              : type === "calling_alignment"
                ? "support_calling_pattern"
                : type === "surface_preference"
                  ? "prefer_word_theme"
                  : type === "scripture_relevance"
                    ? "surface_scripture_anchor"
                    : "prioritize_promise_cluster",
      scriptureAnchored: Boolean(signal.selectedScriptureReference),
      createdAt: new Date().toISOString()
    };

    groups[patternKey] = [...(groups[patternKey] || []), learningSignal];
    return groups;
  }, {});
}

export function createTeoyubeLearningSummary(
  signals: TeoyubePersonalizationSignal[]
): {
  signalCount: number;
  learningSignalCount: number;
  topPatterns: Array<{ patternKey: string; count: number; averageScore: number }>;
  fallbackCount: number;
  explanation: string;
} {
  const groups = groupLearningSignalsByPattern(signals);
  const topPatterns = Object.entries(groups)
    .map(([patternKey, items]) => ({
      patternKey,
      count: items.length,
      averageScore:
        items.reduce((sum, item) => sum + item.score, 0) / Math.max(1, items.length)
    }))
    .sort((a, b) => b.count - a.count || b.averageScore - a.averageScore)
    .slice(0, 6);
  const summary = summarizeTeoyubePersonalizationSignals(signals);

  return {
    signalCount: summary.signalCount,
    learningSignalCount: Object.values(groups).flat().length,
    topPatterns,
    fallbackCount: summary.fallbackCount,
    explanation:
      "This summary is a preview-only learning architecture output. It suggests patterns without storing private text or changing Scripture anchors."
  };
}

export function recommendPersonalizationAdjustments(
  context: TeoyubePersonalizationContext
): TeoyubePersonalizationDecision["adjustments"] {
  const summary = summarizeTeoyubePersonalizationSignals(context.signals);
  const learningSummary = createTeoyubeLearningSummary(context.signals);
  const adjustments: TeoyubePersonalizationDecision["adjustments"] = [];
  const topWord = firstValue(summary.topWordIds);
  const topCluster = firstValue(summary.topClusterIds);
  const topScripture = firstValue(summary.topScriptureReferences);

  if (topWord) {
    adjustments.push({
      type: "prefer_word_theme",
      value: topWord,
      explanation: "Repeated safe signals suggest this Teoyube word theme may be familiar.",
      confidence: 0.65
    });
  }

  if (topCluster) {
    adjustments.push({
      type: "prioritize_promise_cluster",
      value: topCluster,
      explanation:
        "Repeated safe signals suggest this promise cluster may support continuity.",
      confidence: 0.68
    });
  }

  if (topScripture) {
    adjustments.push({
      type: "surface_scripture_anchor",
      value: topScripture,
      explanation:
        "Repeated safe signals suggest this Scripture anchor may be useful to surface again.",
      confidence: 0.7
    });
  }

  if (learningSummary.fallbackCount > 1) {
    adjustments.push({
      type: "reduce_repeated_fallback",
      value: "fallback_frequency",
      explanation:
        "Fallback appeared repeatedly, so future recommendations should ask for clearer non-sensitive context or use broader Scripture anchors.",
      confidence: 0.6
    });
  }

  return adjustments;
}
