import type {
  TeoyubePersonalizationPreviewComparison,
  TeoyubePersonalizationPreviewComparisonItem
} from "./personalization-preview-contracts";
import type { TigProductionResponse } from "./production-response-contracts";

function nodeId(node?: { id: string }): string | undefined {
  return node?.id;
}

function scriptureReference(response: TigProductionResponse): string | undefined {
  const scripture = response.selection.scriptureAnchor;
  if (!scripture) return undefined;
  const reference = scripture.metadata.reference;
  return typeof reference === "string" ? reference : scripture.label;
}

function comparisonItem(
  label: string,
  baselineValue: string | undefined,
  personalizedValue: string | undefined,
  explanation: string
): TeoyubePersonalizationPreviewComparisonItem {
  return {
    label,
    baselineValue,
    personalizedValue,
    changed: baselineValue !== personalizedValue,
    explanation
  };
}

export function compareSelectedWord(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse
): TeoyubePersonalizationPreviewComparisonItem {
  return comparisonItem(
    "Teoyube Word",
    nodeId(baseline.selection.teoyubeWord),
    nodeId(personalized.selection.teoyubeWord),
    "Compares the selected Teoyube word theme."
  );
}

export function compareSelectedPromiseCluster(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse
): TeoyubePersonalizationPreviewComparisonItem {
  return comparisonItem(
    "Promise Cluster",
    nodeId(baseline.selection.promiseCluster),
    nodeId(personalized.selection.promiseCluster),
    "Compares the selected Scripture-backed promise cluster."
  );
}

export function compareSelectedScriptureAnchor(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse
): TeoyubePersonalizationPreviewComparisonItem {
  return comparisonItem(
    "Scripture Anchor",
    scriptureReference(baseline),
    scriptureReference(personalized),
    "Confirms whether the Scripture anchor stayed present and grounded."
  );
}

export function compareSelectedPrayerSequence(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse
): TeoyubePersonalizationPreviewComparisonItem {
  return comparisonItem(
    "Prayer Sequence",
    nodeId(baseline.selection.prayerSequence),
    nodeId(personalized.selection.prayerSequence),
    "Compares the selected prayer sequence."
  );
}

export function compareSelectedActionStep(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse
): TeoyubePersonalizationPreviewComparisonItem {
  return comparisonItem(
    "Action Step",
    nodeId(baseline.selection.actionStep),
    nodeId(personalized.selection.actionStep),
    "Compares the selected faithful next step."
  );
}

export function compareConfidenceScores(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse
): {
  baselineScore: number;
  personalizedScore: number;
  delta: number;
  improved: boolean;
} {
  const baselineScore = baseline.confidence.score;
  const personalizedScore = personalized.confidence.score;
  const delta = Number((personalizedScore - baselineScore).toFixed(4));

  return {
    baselineScore,
    personalizedScore,
    delta,
    improved: delta > 0
  };
}

export function compareExplanationPaths(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse
): {
  baselineLength: number;
  personalizedLength: number;
  preserved: boolean;
  improved: boolean;
} {
  const baselineLength = baseline.explanation.reasonPath.length;
  const personalizedLength = personalized.explanation.reasonPath.length;

  return {
    baselineLength,
    personalizedLength,
    preserved: personalizedLength > 0,
    improved: personalizedLength >= baselineLength
  };
}

export function createPersonalizationPreviewComparison(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse,
  preferenceHintsUsed: string[] = []
): TeoyubePersonalizationPreviewComparison {
  const items = [
    compareSelectedWord(baseline, personalized),
    compareSelectedPromiseCluster(baseline, personalized),
    compareSelectedScriptureAnchor(baseline, personalized),
    compareSelectedPrayerSequence(baseline, personalized),
    compareSelectedActionStep(baseline, personalized)
  ];
  const confidence = compareConfidenceScores(baseline, personalized);
  const explanationPath = compareExplanationPaths(baseline, personalized);
  const fallbackAvoided = baseline.fallback.used && !personalized.fallback.used;
  const scriptureAnchorPreserved = Boolean(
    scriptureReference(baseline) && scriptureReference(personalized)
  );
  const changed = items.some((item) => item.changed) || confidence.delta !== 0 || fallbackAvoided;

  return {
    changed,
    items,
    confidenceDelta: confidence.delta,
    confidenceImproved: confidence.improved,
    fallbackAvoided,
    scriptureAnchorPreserved,
    explanationPathPreserved: explanationPath.preserved,
    preferenceHintsUsed,
    summary: changed
      ? "The personalized preview changed one or more recommendation details while preserving the baseline response."
      : "The personalized preview kept the same recommendation path as the baseline response."
  };
}
