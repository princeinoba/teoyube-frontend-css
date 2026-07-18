import type { TeoyubePersonalizationSignal } from "./personalization-contracts";
import type {
  TeoyubePreferenceHint,
  TeoyubePreferenceScore
} from "./personalization-preference-contracts";

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function scorePreferenceSignal(signal: TeoyubePersonalizationSignal): number {
  let score = signal.weight * 0.35;
  if (signal.selectedScriptureReference) score += 0.2;
  if (signal.selectedWordId) score += 0.12;
  if (signal.selectedClusterId) score += 0.12;
  if (signal.selectedPrayerSequenceId) score += 0.08;
  if (signal.selectedActionStepId) score += 0.08;
  if (signal.confidenceLabel === "strong") score += 0.12;
  if (signal.confidenceLabel === "good") score += 0.08;
  if (signal.fallbackUsed) score -= 0.1;
  return clamp(score);
}

export function scorePreferenceHint(
  hint: TeoyubePreferenceHint,
  options: { recurrence?: number; feedbackAdjustment?: number } = {}
): TeoyubePreferenceScore {
  const recurrence = clamp((options.recurrence || hint.sourceSignalIds.length) / 5);
  const confidence = clamp(hint.confidence);
  const scriptureAnchored = hint.type === "scripture_anchor" || hint.key.includes("scripture")
    ? 1
    : 0.65;
  const recency = 0.7;
  const feedbackAdjustment = clamp(options.feedbackAdjustment ?? 0.5);
  const score = clamp(
    recurrence * 0.25 +
      confidence * 0.3 +
      scriptureAnchored * 0.25 +
      recency * 0.1 +
      feedbackAdjustment * 0.1
  );

  return {
    hintId: hint.id,
    score,
    factors: {
      recurrence,
      confidence,
      scriptureAnchored,
      recency,
      feedbackAdjustment
    },
    explanation:
      "Preference hint score combines recurrence, confidence, Scripture anchoring, recency, and feedback adjustment."
  };
}

export function rankPreferenceHints(
  hints: TeoyubePreferenceHint[]
): Array<TeoyubePreferenceHint & { preferenceScore: TeoyubePreferenceScore; rank: number }> {
  return hints
    .map((hint) => ({
      ...hint,
      preferenceScore: scorePreferenceHint(hint)
    }))
    .sort((a, b) => b.preferenceScore.score - a.preferenceScore.score || a.key.localeCompare(b.key))
    .map((hint, index) => ({
      ...hint,
      rank: index + 1
    }));
}
