import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationProfile,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import type { TigProductionInput } from "./production-response-contracts";

export type TeoyubePreferenceHintType =
  | "word_theme"
  | "promise_cluster"
  | "scripture_anchor"
  | "surface"
  | "prayer_sequence"
  | "action_step"
  | "journey"
  | "calling"
  | "fallback_reduction";

export type TeoyubePreferenceHint = {
  id: string;
  type: TeoyubePreferenceHintType;
  key: string;
  value: string;
  label: string;
  confidence: number;
  sourceSignalIds: string[];
  softHintOnly: true;
  explanation: string;
  createdAt: string;
};

export type TeoyubePreferenceProfile = {
  id: string;
  userId?: string;
  consent: TeoyubePersonalizationConsent;
  hints: TeoyubePreferenceHint[];
  sourceSignalIds: string[];
  dataStatus: "preview_only" | "local_only" | "persistence_pending";
  updatedAt: string;
};

export type TeoyubePreferenceScore = {
  hintId: string;
  score: number;
  factors: {
    recurrence: number;
    confidence: number;
    scriptureAnchored: number;
    recency: number;
    feedbackAdjustment: number;
  };
  explanation: string;
};

export type TeoyubePreferenceDecision = {
  enabled: boolean;
  applied: boolean;
  previewOnly: true;
  hints: TeoyubePreferenceHint[];
  blockedReasons: string[];
  warnings: string[];
  explanation: string;
  createdAt: string;
};

export type TeoyubePreferenceApplicationResult = {
  input: TigProductionInput;
  decision: TeoyubePreferenceDecision;
  appliedHintCount: number;
};

export type TeoyubePreferenceSafetyStatus = {
  safe: boolean;
  blocked: boolean;
  status: "safe" | "warning" | "blocked";
  reasons: string[];
  warnings: string[];
  guardrails: string[];
};

export type TeoyubePreferenceSourceInput =
  | TeoyubePersonalizationSignal[]
  | TeoyubePersonalizationProfile
  | TeoyubePreferenceProfile;
