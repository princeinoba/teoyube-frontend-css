export type TeoyubePhase7RoadmapStatus =
  | "planned"
  | "planned_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase7RoadmapTheme =
  | "controlled_beta_operations"
  | "manual_feedback_review"
  | "manual_issue_triage"
  | "beta_support_workflow"
  | "operational_monitoring_manual"
  | "content_review_follow_up"
  | "product_stabilization"
  | "mobile_accessibility_hardening"
  | "performance_hardening"
  | "service_gate_follow_up"
  | "privacy_security_follow_up"
  | "post_beta_readiness"
  | "unknown";

export type TeoyubePhase7RoadmapPriority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase7RoadmapItem = {
  id: string;
  theme: TeoyubePhase7RoadmapTheme;
  title: string;
  priority: TeoyubePhase7RoadmapPriority;
  summary: string;
  blockedBy: string[];
  doesNotLaunchBeta: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase7RoadmapRisk = {
  id: string;
  theme: TeoyubePhase7RoadmapTheme;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePhase7RoadmapDecision =
  | "phase_7_roadmap_ready"
  | "phase_7_roadmap_ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase7RoadmapReport = {
  valid: boolean;
  status: TeoyubePhase7RoadmapStatus;
  decision: TeoyubePhase7RoadmapDecision;
  milestone: "TEOYUBE Phase 7 - Controlled Beta Operations, Manual Feedback Review & Product Stabilization";
  nextStep: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow";
  items: TeoyubePhase7RoadmapItem[];
  risks: TeoyubePhase7RoadmapRisk[];
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noUserAccountsAdded: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
