import type {
  TeoyubePreferenceDecision,
  TeoyubePreferenceHint,
  TeoyubePreferenceProfile
} from "./personalization-preference-contracts";
import { rankPreferenceHints } from "./personalization-preference-scoring";

export function toPreferencePanelProps(profile: TeoyubePreferenceProfile) {
  return {
    id: profile.id,
    hintCount: profile.hints.length,
    dataStatus: profile.dataStatus,
    updatedAt: profile.updatedAt,
    hints: rankPreferenceHints(profile.hints).map((hint) => ({
      id: hint.id,
      type: hint.type,
      label: hint.label,
      value: hint.value,
      confidence: hint.confidence,
      score: hint.preferenceScore.score,
      rank: hint.rank,
      explanation: hint.explanation
    }))
  };
}

export function toPreferenceHintChips(hints: TeoyubePreferenceHint[]) {
  return hints.map((hint) => ({
    label: hint.label,
    value: hint.value,
    tone: hint.confidence >= 0.7 ? "strong" : hint.confidence >= 0.45 ? "moderate" : "soft"
  }));
}

export function toPreferenceDecisionProps(decision: TeoyubePreferenceDecision) {
  return {
    enabled: decision.enabled,
    applied: decision.applied,
    previewOnly: decision.previewOnly,
    hintCount: decision.hints.length,
    explanation: decision.explanation,
    warnings: decision.warnings,
    blockedReasons: decision.blockedReasons
  };
}
