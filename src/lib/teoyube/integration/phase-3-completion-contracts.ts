export type TeoyubePhase3CompletionStatus =
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "needs_review";

export type TeoyubePhase3CompletionArea =
  | "data_access"
  | "theology_framework"
  | "teoyube_language_engine"
  | "promise_engine"
  | "promise_table"
  | "calling_engine"
  | "tig_recommendation_flow"
  | "explanation_trace"
  | "fallback_safety"
  | "ui_adapters"
  | "live_ui_components"
  | "user_journey"
  | "real_data_qa"
  | "accessibility_qa"
  | "mobile_qa"
  | "documentation"
  | "roadmap"
  | "unknown";

export type TeoyubePhase3CompletionBlocker = {
  id: string;
  area: TeoyubePhase3CompletionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase3CompletionWarning = {
  id: string;
  area: TeoyubePhase3CompletionArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase3CompletionCheck = {
  id: string;
  area: TeoyubePhase3CompletionArea;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase3CompletionBlocker[];
  warnings: TeoyubePhase3CompletionWarning[];
};

export type TeoyubePhase3CompletionDecision =
  | "phase_3_complete"
  | "phase_3_complete_with_warnings"
  | "blocked"
  | "needs_fix"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePhase3CompletionReport = {
  valid: boolean;
  status: TeoyubePhase3CompletionStatus;
  decision: TeoyubePhase3CompletionDecision;
  checks: TeoyubePhase3CompletionCheck[];
  blockers: TeoyubePhase3CompletionBlocker[];
  warnings: TeoyubePhase3CompletionWarning[];
  completionPercentage: number;
  nextMilestone: "TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions";
  nextStep: "Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase3LockedContract = {
  id: string;
  area: TeoyubePhase3CompletionArea;
  name: string;
  locked: boolean;
  rules: string[];
  sourceFiles: string[];
};

export type TeoyubePhase3IntegrationLock = {
  id: string;
  locked: boolean;
  contracts: TeoyubePhase3LockedContract[];
  blockers: TeoyubePhase3CompletionBlocker[];
  warnings: TeoyubePhase3CompletionWarning[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase3RemainingRisk = {
  id: string;
  category:
    | "data_contract"
    | "scripture_anchor"
    | "promise_cluster"
    | "theology_boundary"
    | "calling_engine"
    | "tig_trace"
    | "fallback"
    | "confidence_label"
    | "ui_connection"
    | "mobile"
    | "accessibility"
    | "performance"
    | "content_coverage"
    | "future_persistence"
    | "future_analytics"
    | "future_live_ai"
    | "unknown";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "accepted";
  message: string;
  mitigation: string;
  resolution?: string;
};

export type { TeoyubePhase4RoadmapItem, TeoyubePhase4RoadmapDecision } from "./phase-4-roadmap-contracts";
