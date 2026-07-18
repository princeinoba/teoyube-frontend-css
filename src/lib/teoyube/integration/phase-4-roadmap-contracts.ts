export type TeoyubePhase4RoadmapStatus =
  | "planned"
  | "ready_for_owner_review"
  | "blocked"
  | "deferred"
  | "complete";

export type TeoyubePhase4RoadmapTheme =
  | "production_ui_hardening"
  | "content_expansion"
  | "promise_cluster_growth"
  | "calling_compass_depth"
  | "prayer_companion_depth"
  | "tig_graph_ux"
  | "personalization_consent_design"
  | "future_persistence_decision"
  | "future_analytics_decision"
  | "future_live_ai_decision"
  | "admin_content_workflow"
  | "public_beta_readiness"
  | "performance"
  | "accessibility"
  | "mobile"
  | "unknown";

export type TeoyubePhase4RoadmapPriority = "high" | "medium" | "low";

export type TeoyubePhase4RoadmapRisk = {
  id: string;
  theme: TeoyubePhase4RoadmapTheme;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePhase4RoadmapItem = {
  id: string;
  theme: TeoyubePhase4RoadmapTheme;
  title: string;
  priority: TeoyubePhase4RoadmapPriority;
  status: TeoyubePhase4RoadmapStatus;
  summary: string;
  protects: string[];
  blockedBy: string[];
  doesNotConnectServices: true;
};

export type TeoyubePhase4RoadmapDecision =
  | "ready_for_phase_4_1"
  | "ready_with_owner_review"
  | "blocked"
  | "unknown";

export type TeoyubePhase4RoadmapReport = {
  milestone: "TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions";
  valid: boolean;
  decision: TeoyubePhase4RoadmapDecision;
  items: TeoyubePhase4RoadmapItem[];
  risks: TeoyubePhase4RoadmapRisk[];
  highPriorityItems: TeoyubePhase4RoadmapItem[];
  nextStep: "Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
