export type TeoyubeTigGraphExperienceStatus =
  | "ready"
  | "ready_with_warnings"
  | "fallback_list"
  | "empty"
  | "blocked"
  | "unknown";

export type TeoyubeTigGraphViewMode =
  | "graph"
  | "guided_trace"
  | "relationship_list"
  | "mobile_list"
  | "scripture_focus"
  | "promise_focus"
  | "calling_focus"
  | "empty_state"
  | "unknown";

export type TeoyubeTigGraphNode = {
  id: string;
  type: string;
  label: string;
  summary: string;
  scriptureReferences: string[];
  confidenceLabel: string;
  relationshipCount: number;
  visibleToUser: true;
};

export type TeoyubeTigGraphEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
  meaning: string;
  scriptureBasis: string[];
  confidenceLabel: string;
  visibleToUser: true;
};

export type TeoyubeTigGraphLegendItem = {
  id: string;
  label: string;
  description: string;
};

export type TeoyubeTigGraphTraceOverlay = {
  id: string;
  title: string;
  steps: Array<{
    id: string;
    label: string;
    summary: string;
    scriptureAnchors: string[];
  }>;
  fallbackReason?: string;
};

export type TeoyubeTigGraphExperienceBlocker = {
  id: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeTigGraphExperienceWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeTigGraphExperienceDecision =
  | "tig_graph_experience_ready"
  | "tig_graph_experience_ready_with_warnings"
  | "fallback_list_ready"
  | "empty_state"
  | "blocked";

export type TeoyubeTigGraphExperienceViewModel = {
  id: string;
  viewMode: TeoyubeTigGraphViewMode;
  nodes: TeoyubeTigGraphNode[];
  edges: TeoyubeTigGraphEdge[];
  relationshipList: TeoyubeTigGraphEdge[];
  mobileList: TeoyubeTigGraphNode[];
  legend: TeoyubeTigGraphLegendItem[];
  traceOverlay: TeoyubeTigGraphTraceOverlay;
  emptyState: string;
  fallbackReason?: string;
  generatedFromRealTigRelationships: true;
  noRawDebugPayload: true;
  scriptureAnchorsVisible: true;
  explanationTraceVisible: true;
  mobileFallbackAvailable: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeTigGraphExperienceReport = {
  valid: boolean;
  decision: TeoyubeTigGraphExperienceDecision;
  status: TeoyubeTigGraphExperienceStatus;
  viewModel: TeoyubeTigGraphExperienceViewModel;
  blockers: TeoyubeTigGraphExperienceBlocker[];
  warnings: TeoyubeTigGraphExperienceWarning[];
  generatedFromRealTigRelationships: true;
  noRawDebugPayload: true;
  scriptureAnchorsVisible: true;
  explanationTraceVisible: true;
  mobileFallbackAvailable: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
