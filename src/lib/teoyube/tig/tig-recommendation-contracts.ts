import type { TeoyubeCallingPath } from "../calling/calling-engine";
import type { TeoyubeWordCardContext } from "../language/teoyube-language-engine";
import type { TeoyubePromiseRecommendationContext } from "../promises/promise-engine";

export type TeoyubeTigRecommendationSurface =
  | "word_card"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "promise_table"
  | "daily_word"
  | "canon"
  | "prayer"
  | "calling"
  | "unknown";

export type TeoyubeTigRecommendationInput = {
  query?: string;
  wordId?: string;
  clusterId?: string;
  callingInput?: string;
  prayerInput?: string;
  actionInput?: string;
  surface?: TeoyubeTigRecommendationSurface;
  context?: Record<string, unknown>;
  limit?: number;
};

export type TeoyubeTigRecommendationReason = {
  id: string;
  label: string;
  detail: string;
  source:
    | "teoyube_language_engine"
    | "promise_engine"
    | "calling_engine"
    | "theology_framework"
    | "scripture_canon"
    | "tig_graph"
    | "fallback"
    | "qa";
  scriptureAnchors: string[];
  visibleToUser: boolean;
};

export type TeoyubeTigRecommendationConfidenceLabel =
  | "strong_scripture_match"
  | "good_contextual_match"
  | "partial_match"
  | "fallback_match"
  | "insufficient_data";

export type TeoyubeTigRecommendationConfidence = {
  score: number;
  label: TeoyubeTigRecommendationConfidenceLabel;
  explanation: string;
  factors: {
    scriptureAnchorStrength: number;
    promiseClusterRelevance: number;
    teoyubeWordRelevance: number;
    callingPathRelevance: number;
    prayerActionRelevance: number;
    explanationTraceCompleteness: number;
    fallbackPenalty: number;
    dataQualityPenalty: number;
  };
};

export type TeoyubeTigRecommendationFallback = {
  used: boolean;
  reasons: string[];
  message: string;
  scriptureAnchors: string[];
  safe: boolean;
};

export type TeoyubeTigRecommendationCandidateType =
  | "word"
  | "promise"
  | "scripture"
  | "prayer"
  | "calling"
  | "action_step";

export type TeoyubeTigRecommendationCandidate = {
  id: string;
  type: TeoyubeTigRecommendationCandidateType;
  label: string;
  description: string;
  scriptureAnchors: string[];
  relatedWordIds: string[];
  relatedPromiseClusterIds: string[];
  relatedCallingIds: string[];
  relatedPrayerIds: string[];
  relatedActionIds: string[];
  tigNodeIds: string[];
  tigRelationshipIds: string[];
  source:
    | "real_vocabulary"
    | "real_promise_cluster"
    | "real_scripture_canon"
    | "calling_engine"
    | "promise_engine"
    | "teoyube_language_engine"
    | "tig_graph"
    | "safe_fallback";
  reasons: TeoyubeTigRecommendationReason[];
  explanationPath: string[];
  warnings: string[];
  fallbackEligible: boolean;
  original?: unknown;
};

export type TeoyubeTigScriptureAnchorCheck = {
  valid: boolean;
  candidateId?: string;
  scriptureAnchors: string[];
  missingAnchors: string[];
  unsupportedAnchors: string[];
  blockers: string[];
  warnings: string[];
};

export type TeoyubeTigExplanationTraceStep = {
  id: string;
  label: string;
  summary: string;
  source: TeoyubeTigRecommendationReason["source"];
  relatedIds: string[];
  scriptureAnchors: string[];
  fallbackRelated: boolean;
  visibleToUser: true;
};

export type TeoyubeTigExplanationTrace = {
  id: string;
  surface: TeoyubeTigRecommendationSurface;
  summary: string;
  steps: TeoyubeTigExplanationTraceStep[];
  scriptureAnchors: string[];
  fallbackUsed: boolean;
  confidenceLabel: TeoyubeTigRecommendationConfidenceLabel;
  safeForNormalUsers: true;
};

export type TeoyubeTigRecommendationContext = {
  input: TeoyubeTigRecommendationInput;
  surface: TeoyubeTigRecommendationSurface;
  query: string;
  wordContext?: TeoyubeWordCardContext;
  promiseContext: TeoyubePromiseRecommendationContext;
  callingPath?: TeoyubeCallingPath;
  prayerContext: {
    title: string;
    prayer: string;
    scriptureAnchor?: string;
    explanationPath: string[];
    fallbackUsed: boolean;
  };
  actionSteps: string[];
  scriptureAnchors: string[];
  scriptureCanonReferences: string[];
  tigGraphReferences: {
    nodeIds: string[];
    relationshipIds: string[];
    summary: string;
  };
  explanationPath: string[];
  confidenceLabel: "anchored" | "needs_review" | "fallback";
  fallbackStatus: TeoyubeTigRecommendationFallback;
  warnings: string[];
  blockers: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
};

export type TeoyubeTigRecommendationResult = {
  id: string;
  input: TeoyubeTigRecommendationInput;
  surface: TeoyubeTigRecommendationSurface;
  context: TeoyubeTigRecommendationContext;
  selectedCandidate: TeoyubeTigRecommendationCandidate;
  candidates: TeoyubeTigRecommendationCandidate[];
  confidence: TeoyubeTigRecommendationConfidence;
  scriptureAnchorCheck: TeoyubeTigScriptureAnchorCheck;
  explanationTrace: TeoyubeTigExplanationTrace;
  fallback: TeoyubeTigRecommendationFallback;
  valid: boolean;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

export type TeoyubeTigRealDataQaResult = {
  id: string;
  label: string;
  valid: boolean;
  result?: TeoyubeTigRecommendationResult;
  blockers: string[];
  warnings: string[];
};

export type TeoyubeTigEndToEndReport = {
  valid: boolean;
  results: TeoyubeTigRecommendationResult[];
  qaResults: TeoyubeTigRealDataQaResult[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};
