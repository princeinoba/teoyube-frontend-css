export type TeoyubePhase10RoadmapStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase10RoadmapTheme =
  | "controlled_public_release_execution_planning"
  | "manual_launch_checklist"
  | "manual_public_monitoring"
  | "manual_support_feedback"
  | "public_issue_triage"
  | "pause_rollback_readiness"
  | "service_gate_follow_up"
  | "privacy_security_follow_up"
  | "operational_stabilization"
  | "post_release_readiness"
  | "owner_approval"
  | "unknown";

export type TeoyubePhase10RoadmapPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type TeoyubePhase10RoadmapItem = {
  id: string;
  theme: TeoyubePhase10RoadmapTheme;
  priority: TeoyubePhase10RoadmapPriority;
  label: string;
  details: string;
  ownerApprovalRequired: boolean;
  doesNotLaunchPublicly: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase10RoadmapRisk = {
  id: string;
  theme: TeoyubePhase10RoadmapTheme;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePhase10RoadmapDecision =
  | "phase_10_ready_for_planning"
  | "phase_10_ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase10RoadmapReport = {
  valid: boolean;
  status: TeoyubePhase10RoadmapStatus;
  decision: TeoyubePhase10RoadmapDecision;
  milestone: "TEOYUBE Phase 10 - Controlled Public Release Execution Planning, Manual Monitoring & Post-Release Stabilization";
  items: TeoyubePhase10RoadmapItem[];
  risks: TeoyubePhase10RoadmapRisk[];
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
