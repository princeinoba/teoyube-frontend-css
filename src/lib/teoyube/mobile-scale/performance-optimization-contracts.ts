import type { GraphVisualization, TigProductionResponse } from "../../tig";

export type TeoyubePerformanceStatus =
  | "ready"
  | "within_budget"
  | "warning"
  | "over_budget"
  | "blocked"
  | "unknown";

export type TeoyubePerformanceRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubePerformanceCheck = {
  id: string;
  label: string;
  status: TeoyubePerformanceStatus;
  riskLevel: TeoyubePerformanceRiskLevel;
  passed: boolean;
  metric?: number;
  budget?: number;
  unit?: string;
  details: string;
  warnings: string[];
  suggestions: string[];
};

export type TeoyubeResponseSizeBudget = {
  maxSerializedKb: number;
  maxEventPayloadKb: number;
  maxDebugPayloadKb: number;
  maxRenderedCards: number;
  maxExplanationSteps: number;
  maxPersonalizationComparisonItems: number;
};

export type TeoyubeGraphRenderBudget = {
  maxNodes: number;
  maxEdges: number;
  maxHighlightedNodes: number;
  maxRenderedLabels: number;
  deferAboveNodes: number;
  deferAboveEdges: number;
};

export type TeoyubeMobileRenderBudget = {
  maxCardsBeforeCollapse: number;
  maxPrimarySections: number;
  maxDeferredSections: number;
  minTouchTargetPx: number;
  debugHiddenByDefault: boolean;
  graphDeferredByDefault: boolean;
};

export type TeoyubeCacheReadinessStatus =
  | "cache_safe"
  | "cache_with_sanitization"
  | "blocked_by_consent"
  | "blocked_sensitive"
  | "not_cacheable"
  | "unknown";

export type TeoyubeOfflineReadinessStatus =
  | "offline_safe"
  | "read_only_only"
  | "fallback_required"
  | "blocked"
  | "unknown";

export type TeoyubeRuntimeCostEstimate = {
  responseId?: string;
  estimatedSerializedKb: number;
  eventPayloadKb: number;
  debugPayloadKb: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  explanationPathLength: number;
  renderedCardCount: number;
  personalizationComparisonItemCount: number;
  estimatedRenderUnits: number;
  mobileRenderRisk: TeoyubePerformanceRiskLevel;
  warnings: string[];
};

export type TeoyubeDeferredRenderPlan = {
  section:
    | "scripture_anchor"
    | "selected_word"
    | "promise_cluster"
    | "prayer_sequence"
    | "action_step"
    | "explanation_path"
    | "graph_preview"
    | "debug_info"
    | "event_payload_preview"
    | "personalization_preview";
  priority: "highest" | "high" | "medium" | "low" | "debug";
  defer: boolean;
  collapse: boolean;
  defaultOpen: boolean;
  reason: string;
};

export type TeoyubePerformanceOptimizationReport = {
  phase: "Phase 7.3 - Performance, Cache & Offline Readiness";
  status: TeoyubePerformanceStatus;
  riskLevel: TeoyubePerformanceRiskLevel;
  responseId?: string;
  complete: boolean;
  checks: TeoyubePerformanceCheck[];
  estimate: TeoyubeRuntimeCostEstimate;
  budgets: {
    response: TeoyubeResponseSizeBudget;
    graph: TeoyubeGraphRenderBudget;
    mobile: TeoyubeMobileRenderBudget;
  };
  deferredRenderPlan: TeoyubeDeferredRenderPlan[];
  warnings: string[];
  recommendations: string[];
  generatedAt: string;
};

export type TeoyubePerformanceInspectableResponse = Pick<
  TigProductionResponse,
  "id" | "selection" | "explanation" | "visualization" | "event" | "eventBatch" | "fallback" | "safety"
>;

export type TeoyubePerformanceInspectableGraph = Pick<
  GraphVisualization,
  "nodes" | "edges" | "statistics"
>;
