export type TeoyubePhase9RoadmapStatus =
  | "planned"
  | "ready_for_planning"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase9RoadmapTheme =
  | "controlled_public_release_preparation"
  | "public_release_candidate_review"
  | "owner_approval"
  | "final_public_copy_review"
  | "support_feedback_readiness"
  | "manual_public_monitoring"
  | "service_gate_follow_up"
  | "privacy_security_final_review"
  | "performance_mobile_accessibility_final_review"
  | "operational_readiness"
  | "unknown";

export type TeoyubePhase9RoadmapPriority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase9RoadmapItem = {
  id: string;
  theme: TeoyubePhase9RoadmapTheme;
  priority: TeoyubePhase9RoadmapPriority;
  label: string;
  details: string;
  ownerReviewRequired: boolean;
  doesNotLaunchPublicly: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase9RoadmapRisk = {
  id: string;
  theme: TeoyubePhase9RoadmapTheme;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePhase9RoadmapDecision =
  | "phase_9_ready_for_planning"
  | "phase_9_ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase9RoadmapReport = {
  valid: boolean;
  status: TeoyubePhase9RoadmapStatus;
  decision: TeoyubePhase9RoadmapDecision;
  milestone: "TEOYUBE Phase 9 - Controlled Public Release Preparation, Final Owner Approval & Operational Readiness";
  items: TeoyubePhase9RoadmapItem[];
  risks: TeoyubePhase9RoadmapRisk[];
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
