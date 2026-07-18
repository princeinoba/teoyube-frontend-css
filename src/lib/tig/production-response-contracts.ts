import type { GraphVisualization } from "./graph-visualization";
import type { TigConfidenceBreakdown, TigConfidenceLabel } from "./intelligence-confidence";
import type { TigSeedEdge, TigSeedNode } from "./intelligence-graph-seeds";

export type TigProductionSurface =
  | "canon"
  | "daily_word"
  | "prayer"
  | "calling_compass"
  | "promise_cluster"
  | "ai_companion"
  | "onboarding"
  | "unknown";

export type TigProductionInput = {
  input?: string;
  userState?: string;
  emotion?: string;
  intent?: string;
  selectedWordId?: string;
  selectedClusterId?: string;
  context?: Record<string, unknown>;
  surface?: TigProductionSurface;
  sessionId?: string;
  userId?: string;
};

export type TigProductionSelection = {
  teoyubeWord?: TigSeedNode;
  promiseCluster?: TigSeedNode;
  scriptureAnchor?: TigSeedNode;
  prayerSequence?: TigSeedNode;
  actionStep?: TigSeedNode;
  callingArchetype?: TigSeedNode;
  kingdomJourney?: TigSeedNode;
  aiPathway?: TigSeedNode;
  nodes: TigSeedNode[];
  edges: TigSeedEdge[];
};

export type TigProductionExplanation = {
  summary: string;
  reasonPath: string[];
  scriptureEvidence: string[];
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  warnings: string[];
};

export type TigProductionFallbackReason =
  | "missing_user_state"
  | "missing_emotion"
  | "unknown_emotion"
  | "no_selected_word"
  | "selected_word_not_found"
  | "no_user_emotion_provided"
  | "no_matching_word_found"
  | "no_matching_promise_cluster_found"
  | "promise_cluster_missing_scripture_anchor"
  | "weak_confidence_score"
  | "missing_scripture_anchor"
  | "missing_prayer_sequence"
  | "missing_action_step"
  | "missing_graph_path"
  | "failed_graph_validation"
  | "unsafe_action_step"
  | "blocked_response"
  | "incomplete_production_response"
  | "cache_miss"
  | "malformed_input"
  | "validation_warning"
  | "unsafe_or_incomplete_recommendation";

export type TigProductionFallback = {
  used: boolean;
  reasons: TigProductionFallbackReason[];
  message: string;
  appliedNodeIds: string[];
};

export type TigProductionSafetyStatus = {
  safe: boolean;
  blocked: boolean;
  status: "safe" | "warning" | "blocked";
  warnings: string[];
  violations: string[];
  guardrails: string[];
};

export type TigProductionEvent = {
  eventName: string;
  timestamp: string;
  surface: TigProductionSurface;
  intent?: string;
  sessionId?: string;
  userId?: string;
  selectedWordId?: string;
  selectedPromiseClusterId?: string;
  selectedScriptureReference?: string;
  selectedPrayerSequenceId?: string;
  selectedActionStepId?: string;
  confidenceScore: number;
  confidenceLabel: TigConfidenceLabel;
  fallbackUsed: boolean;
  fallbackReason?: TigProductionFallbackReason;
  fallbackReasons: TigProductionFallbackReason[];
  safetyStatus: TigProductionSafetyStatus["status"];
  blocked: boolean;
  explanationPathLength: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  metadata?: Record<string, unknown>;
};

export type TigProductionResponse = {
  id: string;
  version: "5B.3";
  input: TigProductionInput;
  selection: TigProductionSelection;
  confidence: {
    score: number;
    label: TigConfidenceLabel;
    breakdown: TigConfidenceBreakdown;
  };
  explanation: TigProductionExplanation;
  visualization: GraphVisualization;
  fallback: TigProductionFallback;
  safety: TigProductionSafetyStatus;
  event: TigProductionEvent;
  eventBatch?: TigProductionEvent[];
  cacheKey?: string;
  generatedAt: string;
};
