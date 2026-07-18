import type { TeoyubePhase6RoadmapItem } from "./phase-5-completion-contracts";

export type { TeoyubePhase6RoadmapItem } from "./phase-5-completion-contracts";

export type TeoyubePhase6RoadmapStatus =
  | "planned"
  | "ready_for_owner_review"
  | "blocked"
  | "unknown";

export type TeoyubePhase6RoadmapTheme = TeoyubePhase6RoadmapItem["theme"];

export type TeoyubePhase6RoadmapPriority = TeoyubePhase6RoadmapItem["priority"];

export type TeoyubePhase6RoadmapRisk = {
  id: string;
  theme: TeoyubePhase6RoadmapTheme;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  mitigation: string;
};

export type TeoyubePhase6RoadmapDecision =
  | "phase_6_roadmap_ready"
  | "phase_6_roadmap_ready_with_warnings"
  | "blocked";

export type TeoyubePhase6RoadmapReport = {
  valid: boolean;
  status: TeoyubePhase6RoadmapStatus;
  decision: TeoyubePhase6RoadmapDecision;
  milestone: "TEOYUBE Phase 6 - Controlled Beta Execution Planning, Manual Feedback Loop & Operational Stabilization";
  nextStep: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries";
  items: TeoyubePhase6RoadmapItem[];
  risks: TeoyubePhase6RoadmapRisk[];
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
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
