import type { TigConfidenceLabel } from "./intelligence-confidence";
import type {
  TigProductionEvent,
  TigProductionInput,
  TigProductionResponse,
  TigProductionSurface
} from "./production-response-contracts";

export type TeoyubePersonalizationSource =
  | "production_input"
  | "production_response"
  | "production_event"
  | "user_preference"
  | "saved_activity"
  | "journal_entry"
  | "manual_feedback"
  | "system_preview";

export type TeoyubePersonalizationSignalType =
  | "emotion_repeated"
  | "intent_repeated"
  | "word_selected"
  | "promise_cluster_selected"
  | "scripture_saved"
  | "prayer_theme_repeated"
  | "action_completed"
  | "surface_preferred"
  | "confidence_feedback"
  | "fallback_frequency"
  | "journey_pattern"
  | "calling_pattern";

export type TeoyubeLearningSignalType =
  | "theme_affinity"
  | "journey_continuity"
  | "prayer_familiarity"
  | "scripture_relevance"
  | "fallback_reduction"
  | "surface_preference"
  | "calling_alignment"
  | "confidence_adjustment";

export type TeoyubeConsentScope =
  | "signals"
  | "preferences"
  | "journey_progress"
  | "feedback"
  | "raw_text";

export type TeoyubePersonalizationConsent = {
  personalizationEnabled: boolean;
  learningEnabled: boolean;
  allowRawTextStorage: boolean;
  allowedScopes: TeoyubeConsentScope[];
  updatedAt?: string;
  source?: "user" | "system_default";
};

export type TeoyubePersonalizationSignal = {
  id: string;
  type: TeoyubePersonalizationSignalType;
  source: TeoyubePersonalizationSource;
  timestamp: string;
  surface?: TigProductionSurface;
  emotionTag?: string;
  intent?: string;
  selectedWordId?: string;
  selectedClusterId?: string;
  selectedScriptureReference?: string;
  selectedPrayerSequenceId?: string;
  selectedActionStepId?: string;
  confidenceLabel?: TigConfidenceLabel;
  confidenceScore?: number;
  fallbackUsed?: boolean;
  fallbackReasons?: string[];
  journeyId?: string;
  callingId?: string;
  count?: number;
  weight: number;
  storesRawText: boolean;
  rawTextPreview?: string;
  metadata?: Record<string, unknown>;
};

export type TeoyubeLearningSignal = {
  id: string;
  type: TeoyubeLearningSignalType;
  sourceSignalIds: string[];
  patternKey: string;
  score: number;
  explanation: string;
  suggestedAdjustment:
    | "prefer_word_theme"
    | "prioritize_promise_cluster"
    | "recommend_familiar_prayer"
    | "reduce_repeated_fallback"
    | "surface_scripture_anchor"
    | "continue_journey"
    | "support_calling_pattern";
  scriptureAnchored: boolean;
  createdAt: string;
};

export type TeoyubeUserPreference = {
  key: string;
  value: string | number | boolean | string[];
  source: TeoyubePersonalizationSource;
  confidence: number;
  updatedAt: string;
};

export type TeoyubeSurfacePreference = {
  surface: TigProductionSurface;
  usageCount: number;
  lastUsedAt?: string;
  preferred: boolean;
};

export type TeoyubeSpiritualGrowthPattern = {
  patternKey: string;
  label: string;
  relatedEmotionTags: string[];
  relatedWordIds: string[];
  relatedClusterIds: string[];
  relatedScriptureReferences: string[];
  relatedJourneyIds: string[];
  relatedCallingIds: string[];
  evidenceSignalIds: string[];
  confidence: number;
  explanation: string;
};

export type TeoyubeRecommendationHistoryItem = {
  id: string;
  responseId?: string;
  surface?: TigProductionSurface;
  selectedWordId?: string;
  selectedClusterId?: string;
  selectedScriptureReference?: string;
  selectedPrayerSequenceId?: string;
  selectedActionStepId?: string;
  confidenceLabel?: TigConfidenceLabel;
  fallbackUsed?: boolean;
  createdAt: string;
};

export type TeoyubePersonalizationProfile = {
  userId?: string;
  consent: TeoyubePersonalizationConsent;
  preferences: TeoyubeUserPreference[];
  surfacePreferences: TeoyubeSurfacePreference[];
  growthPatterns: TeoyubeSpiritualGrowthPattern[];
  recommendationHistory: TeoyubeRecommendationHistoryItem[];
  updatedAt?: string;
  dataStatus: "preview_only" | "local_only" | "persistence_pending";
};

export type TeoyubePersonalizationContext = {
  profile?: TeoyubePersonalizationProfile;
  consent: TeoyubePersonalizationConsent;
  signals: TeoyubePersonalizationSignal[];
  learningSignals: TeoyubeLearningSignal[];
  growthPatterns: TeoyubeSpiritualGrowthPattern[];
  surfacePreferences: TeoyubeSurfacePreference[];
  recommendationHistory: TeoyubeRecommendationHistoryItem[];
  source: "preview" | "local" | "future_persistent";
  generatedAt: string;
};

export type TeoyubePersonalizationDecision = {
  id: string;
  enabled: boolean;
  applied: boolean;
  previewOnly: boolean;
  scriptureAnchored: boolean;
  input?: TigProductionInput;
  response?: TigProductionResponse;
  hints: string[];
  adjustments: Array<{
    type: TeoyubeLearningSignal["suggestedAdjustment"];
    value: string;
    explanation: string;
    confidence: number;
  }>;
  explanation: string;
  warnings: string[];
  createdAt: string;
};

export type TeoyubePersonalizationSafetyStatus = {
  safe: boolean;
  disabled: boolean;
  status: "safe" | "warning" | "disabled";
  reasons: string[];
  warnings: string[];
  guardrails: string[];
};

export type TeoyubePersonalizationSummary = {
  signalCount: number;
  topEmotionTags: Array<{ value: string; count: number }>;
  topWordIds: Array<{ value: string; count: number }>;
  topClusterIds: Array<{ value: string; count: number }>;
  topScriptureReferences: Array<{ value: string; count: number }>;
  fallbackCount: number;
  surfaces: Array<{ value: TigProductionSurface; count: number }>;
};

export type TeoyubePersonalizationSignalInput =
  | TeoyubePersonalizationSignal
  | TigProductionInput
  | TigProductionResponse
  | TigProductionEvent;
