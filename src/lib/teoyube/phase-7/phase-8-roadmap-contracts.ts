export type TeoyubePhase8RoadmapStatus =
  | "planned"
  | "planned_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase8RoadmapTheme =
  | "post_beta_readiness"
  | "manual_operations_review"
  | "product_hardening"
  | "content_review_follow_up"
  | "public_release_preparation"
  | "service_gate_reassessment"
  | "privacy_security_review"
  | "performance_hardening"
  | "mobile_accessibility_hardening"
  | "controlled_service_decisions"
  | "owner_approval"
  | "unknown";

export type TeoyubePhase8RoadmapPriority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase8RoadmapItem = {
  id: string;
  theme: TeoyubePhase8RoadmapTheme;
  title: string;
  priority: TeoyubePhase8RoadmapPriority;
  summary: string;
  blockedBy: string[];
  doesNotLaunchPublicly: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase8RoadmapRisk = {
  id: string;
  theme: TeoyubePhase8RoadmapTheme;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePhase8RoadmapDecision =
  | "phase_8_roadmap_ready"
  | "phase_8_roadmap_ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase8RoadmapReport = {
  valid: boolean;
  status: TeoyubePhase8RoadmapStatus;
  decision: TeoyubePhase8RoadmapDecision;
  milestone: "TEOYUBE Phase 8 - Post-Beta Readiness, Product Hardening & Controlled Service Reassessment";
  nextStep: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate";
  items: TeoyubePhase8RoadmapItem[];
  risks: TeoyubePhase8RoadmapRisk[];
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
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
