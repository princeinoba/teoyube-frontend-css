import type { TIGConfidenceInput, TIGConfidenceScore, TIGScore } from "./types";

export const DEFAULT_TIG_CONFIDENCE_INPUT: TIGConfidenceInput = {
  intentConfidence: 0,
  emotionConfidence: 0,
  promiseConfidence: 0,
  scriptureConfidence: 0,
  callingConfidence: 0,
  journeyConfidence: 0
};

const DEFAULT_CONFIDENCE_EXPLANATION =
  "Confidence was calculated from intent, emotion, promise, Scripture, calling, and journey match strength.";

export function clampTIGConfidence(score: number): TIGScore {
  if (!Number.isFinite(score)) return 0;
  return Math.min(1, Math.max(0, score));
}

export function calculateOverallConfidence(input: TIGConfidenceInput): TIGScore {
  const safeInput = {
    ...DEFAULT_TIG_CONFIDENCE_INPUT,
    ...input
  };

  const score =
    clampTIGConfidence(safeInput.intentConfidence) * 0.18 +
    clampTIGConfidence(safeInput.emotionConfidence) * 0.16 +
    clampTIGConfidence(safeInput.promiseConfidence) * 0.18 +
    clampTIGConfidence(safeInput.scriptureConfidence) * 0.25 +
    clampTIGConfidence(safeInput.callingConfidence) * 0.1 +
    clampTIGConfidence(safeInput.journeyConfidence) * 0.13;

  return clampTIGConfidence(score);
}

export function buildTIGConfidenceScore(
  input: TIGConfidenceInput,
  explanation = DEFAULT_CONFIDENCE_EXPLANATION
): TIGConfidenceScore {
  const safeInput = {
    ...DEFAULT_TIG_CONFIDENCE_INPUT,
    ...input
  };

  return {
    overall: calculateOverallConfidence(safeInput),
    intentConfidence: clampTIGConfidence(safeInput.intentConfidence),
    emotionConfidence: clampTIGConfidence(safeInput.emotionConfidence),
    promiseConfidence: clampTIGConfidence(safeInput.promiseConfidence),
    scriptureConfidence: clampTIGConfidence(safeInput.scriptureConfidence),
    callingConfidence: clampTIGConfidence(safeInput.callingConfidence),
    journeyConfidence: clampTIGConfidence(safeInput.journeyConfidence),
    explanation
  };
}

export function getConfidenceLabel(score: TIGScore): "low" | "medium" | "high" | "very_high" {
  const safeScore = clampTIGConfidence(score);

  if (safeScore >= 0.9) return "very_high";
  if (safeScore >= 0.7) return "high";
  if (safeScore >= 0.4) return "medium";
  return "low";
}

export function isHighConfidence(score: TIGScore): boolean {
  return clampTIGConfidence(score) >= 0.7;
}

// High emotional certainty with weak Scripture grounding needs pastoral care.
export function requiresPastoralCare(input: TIGConfidenceInput): boolean {
  const safeInput = {
    ...DEFAULT_TIG_CONFIDENCE_INPUT,
    ...input
  };

  return (
    clampTIGConfidence(safeInput.emotionConfidence) >= 0.75 &&
    clampTIGConfidence(safeInput.scriptureConfidence) < 0.5
  );
}
