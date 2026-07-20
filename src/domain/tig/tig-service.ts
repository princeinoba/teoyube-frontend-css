export type TigQueryIntent =
  | "promise"
  | "scripture"
  | "life_problem"
  | "calling"
  | "prayer"
  | "teoyube_word"
  | "testimony"
  | "daily_journey"
  | "unknown";

export type TigRecommendationSurface =
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

export type TigConfidenceLabel =
  | "strong_scripture_match"
  | "good_contextual_match"
  | "partial_match"
  | "fallback_match"
  | "insufficient_data";

export type TigCandidateType = "word" | "promise" | "scripture" | "prayer" | "calling" | "action_step";

export type TigDatasetVersion = string;
export type TigRulesetVersion = string;

export type TigVersionSet = Readonly<{
  dataset: TigDatasetVersion;
  ruleset: TigRulesetVersion;
}>;

export type TigSafeConfiguration = Readonly<{
  scriptureAuthority: "primary";
  liveModelEnabled: false;
  personalizationEnabled: boolean;
  locale: string;
}>;

export type TigComplexityLimits = Readonly<{
  inputLength: number;
  candidateCount: number;
  traversalDepth: number;
  expandedNodes: number;
  executionDurationMs: number;
}>;

export type TigRecommendationInput = Readonly<{
  query: string;
  intent: TigQueryIntent;
  surface?: TigRecommendationSurface;
  context?: Readonly<Record<string, unknown>>;
  selectedWordId?: string;
  selectedPromiseClusterId?: string;
  callingInput?: string;
  prayerInput?: string;
  actionInput?: string;
  safeConfiguration?: Partial<TigSafeConfiguration>;
  limits?: Partial<TigComplexityLimits>;
  privacy?: Readonly<{
    containsPrivatePrayerText?: boolean;
    containsPrivateReflectionText?: boolean;
  }>;
}>;

export type TigNormalizedUserContext = Readonly<{
  query: string;
  intent: TigQueryIntent;
  surface: TigRecommendationSurface;
  tokens: readonly string[];
  safeSignals: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  privateTextPresent: boolean;
}>;

export type TigScoreBreakdown = Readonly<{
  scriptureAnchorStrength: number;
  promiseClusterRelevance: number;
  teoyubeWordRelevance: number;
  callingPathRelevance: number;
  prayerActionRelevance: number;
  explanationTraceCompleteness: number;
  fallbackPenalty: number;
  dataQualityPenalty: number;
}>;

export type TigConfidence = Readonly<{
  score: number;
  label: TigConfidenceLabel;
  explanation: string;
  breakdown: TigScoreBreakdown;
}>;

export type TigScriptureAnchor = Readonly<{
  reference: string;
  validation: "verified" | "unsupported" | "missing" | "unverified";
  primaryAuthority: true;
}>;

export type TigGraphPath = Readonly<{
  id: string;
  candidateId: string;
  nodeIds: readonly string[];
  relationshipIds: readonly string[];
  depth: number;
  explanation: readonly string[];
}>;

export type TigCandidate = Readonly<{
  id: string;
  type: TigCandidateType;
  label: string;
  description: string;
  source: string;
  scriptureAnchors: readonly TigScriptureAnchor[];
  relatedWordIds: readonly string[];
  relatedPromiseClusterIds: readonly string[];
  relatedCallingIds: readonly string[];
  relatedPrayerIds: readonly string[];
  relatedActionIds: readonly string[];
  graphPath: TigGraphPath;
  confidence: TigConfidence;
  explanationPath: readonly string[];
  warnings: readonly string[];
  fallbackEligible: boolean;
}>;

export type TigExplanationStep = Readonly<{
  id: string;
  label: string;
  summary: string;
  source: string;
  relatedIds: readonly string[];
  scriptureAnchors: readonly string[];
  fallbackRelated: boolean;
  visibleToUser: true;
}>;

export type TigExplanation = Readonly<{
  recommendationId: string;
  summary: string;
  steps: readonly TigExplanationStep[];
  scriptureAnchors: readonly TigScriptureAnchor[];
  sourcePaths: readonly TigGraphPath[];
  confidence: TigConfidence;
  limitations: readonly string[];
  versions: TigVersionSet;
}>;

export type TigFallbackReasonCode =
  | "legacy_fallback"
  | "input_length_limit"
  | "candidate_count_limit"
  | "traversal_depth_limit"
  | "expanded_nodes_limit"
  | "execution_duration_limit";

export type TigFallbackReason = Readonly<{
  code: TigFallbackReasonCode;
  detail: string;
}>;

export type TigFallback = Readonly<{
  used: boolean;
  reasons: readonly TigFallbackReason[];
  message: string;
  scriptureAnchors: readonly TigScriptureAnchor[];
  safe: true;
}>;

export type SourceValidationResult = Readonly<{
  valid: boolean;
  recommendationId: string;
  verified: readonly string[];
  unsupported: readonly string[];
  missing: readonly string[];
  warnings: readonly string[];
  blockers: readonly string[];
}>;

export type TigRecommendationResult = Readonly<{
  recommendationId: string;
  versions: TigVersionSet;
  normalizedContext: TigNormalizedUserContext;
  selectedCandidate: TigCandidate;
  candidates: readonly TigCandidate[];
  confidence: TigConfidence;
  explanation: TigExplanation;
  limitations: readonly string[];
  fallback: TigFallback;
  sourceValidation: SourceValidationResult;
  complexity: Readonly<{
    limits: TigComplexityLimits;
    candidateCount: number;
    traversalDepth: number;
    expandedNodes: number;
    executionDurationMs: number;
  }>;
  cache: Readonly<{
    cacheable: boolean;
    key: string | null;
    rawPrivateTextStored: false;
  }>;
  safety: Readonly<{
    deterministic: true;
    readOnly: true;
    externalModelUsed: false;
    journeyStateMutated: false;
    journalStateMutated: false;
    testimonyStateMutated: false;
    promiseStateMutated: false;
    bookStateMutated: false;
    callingDeclaredAsFact: false;
    promiseFulfillmentDeclared: false;
    testimonyPublished: false;
  }>;
  valid: boolean;
}>;

export interface TigService {
  recommend(input: TigRecommendationInput): Promise<TigRecommendationResult>;
  explain(recommendationId: string): Promise<TigExplanation>;
  validateSources(result: TigRecommendationResult): Promise<SourceValidationResult>;
}
