export type TigConfidenceLabel = "strong" | "good" | "partial" | "weak";

export type TigConfidenceInput = {
  scriptureAnchorStrength?: number;
  promiseClusterMatch?: number;
  emotionStateMatch?: number;
  teoyubeWordRelevance?: number;
  prayerSequenceRelevance?: number;
  journeyCallingAlignment?: number;
  supportingEdgeCount?: number;
  guardrailSafety?: number;
};

export type TigConfidenceBreakdown = {
  scriptureAnchorStrength: number;
  promiseClusterMatch: number;
  emotionStateMatch: number;
  teoyubeWordRelevance: number;
  prayerSequenceRelevance: number;
  journeyCallingAlignment: number;
  supportingGraphEdges: number;
  guardrailSafety: number;
  overall: number;
  label: TigConfidenceLabel;
  explanation: string;
};

const TIG_CONFIDENCE_WEIGHTS = {
  scriptureAnchorStrength: 0.24,
  promiseClusterMatch: 0.16,
  emotionStateMatch: 0.14,
  teoyubeWordRelevance: 0.12,
  prayerSequenceRelevance: 0.1,
  journeyCallingAlignment: 0.12,
  supportingGraphEdges: 0.07,
  guardrailSafety: 0.05
};

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(1, Math.max(0, score));
}

function normalizeEdgeSupport(edgeCount?: number): number {
  if (!edgeCount || edgeCount <= 0) return 0;
  return clampScore(edgeCount / 6);
}

function normalizeInput(input: TigConfidenceInput): Omit<TigConfidenceBreakdown, "overall" | "label" | "explanation"> {
  return {
    scriptureAnchorStrength: clampScore(input.scriptureAnchorStrength ?? 0),
    promiseClusterMatch: clampScore(input.promiseClusterMatch ?? 0),
    emotionStateMatch: clampScore(input.emotionStateMatch ?? 0),
    teoyubeWordRelevance: clampScore(input.teoyubeWordRelevance ?? 0),
    prayerSequenceRelevance: clampScore(input.prayerSequenceRelevance ?? 0),
    journeyCallingAlignment: clampScore(input.journeyCallingAlignment ?? 0),
    supportingGraphEdges: normalizeEdgeSupport(input.supportingEdgeCount),
    guardrailSafety: clampScore(input.guardrailSafety ?? 0.7)
  };
}

export function calculateTigConfidenceScore(input: TigConfidenceInput): number {
  const normalized = normalizeInput(input);

  return clampScore(
    normalized.scriptureAnchorStrength * TIG_CONFIDENCE_WEIGHTS.scriptureAnchorStrength +
      normalized.promiseClusterMatch * TIG_CONFIDENCE_WEIGHTS.promiseClusterMatch +
      normalized.emotionStateMatch * TIG_CONFIDENCE_WEIGHTS.emotionStateMatch +
      normalized.teoyubeWordRelevance * TIG_CONFIDENCE_WEIGHTS.teoyubeWordRelevance +
      normalized.prayerSequenceRelevance * TIG_CONFIDENCE_WEIGHTS.prayerSequenceRelevance +
      normalized.journeyCallingAlignment * TIG_CONFIDENCE_WEIGHTS.journeyCallingAlignment +
      normalized.supportingGraphEdges * TIG_CONFIDENCE_WEIGHTS.supportingGraphEdges +
      normalized.guardrailSafety * TIG_CONFIDENCE_WEIGHTS.guardrailSafety
  );
}

export function getTigConfidenceLabel(score: number): TigConfidenceLabel {
  const normalized = clampScore(score);
  if (normalized >= 0.85) return "strong";
  if (normalized >= 0.68) return "good";
  if (normalized >= 0.45) return "partial";
  return "weak";
}

export function getTigConfidenceBreakdown(input: TigConfidenceInput): TigConfidenceBreakdown {
  const normalized = normalizeInput(input);
  const overall = calculateTigConfidenceScore(input);
  const label = getTigConfidenceLabel(overall);

  return {
    ...normalized,
    overall,
    label,
    explanation:
      "Confidence combines Scripture anchoring, promise cluster fit, emotion state match, Teoyube word relevance, prayer sequence fit, journey or calling alignment, supporting graph edges, and guardrail safety."
  };
}
