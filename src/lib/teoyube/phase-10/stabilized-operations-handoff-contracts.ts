export type TeoyubeStabilizedOperationsHandoffStatus =
  | "not_started"
  | "reviewing"
  | "ready_for_handoff"
  | "ready_with_conditions"
  | "needs_more_stabilization"
  | "blocked"
  | "unknown";

export type TeoyubeStabilizedOperationsHandoffArea =
  | "release_owner"
  | "manual_monitoring"
  | "feedback_review"
  | "issue_triage"
  | "known_issue_register"
  | "safe_fix_process"
  | "rollback_process"
  | "weekly_improvement_loop"
  | "public_trust_review"
  | "documentation"
  | "roadmap"
  | "unknown";

export type TeoyubeStabilizedOperationsHandoffDecision =
  | "handoff_ready"
  | "handoff_ready_with_conditions"
  | "continue_stabilization"
  | "block_handoff"
  | "unknown";

export type TeoyubeStabilizedOperationsHandoffCheck = {
  id: string;
  area: TeoyubeStabilizedOperationsHandoffArea;
  label: string;
  passed: boolean;
  critical: boolean;
  details: string;
};

export type TeoyubeStabilizedOperationsHandoffRecord = {
  id: string;
  status: TeoyubeStabilizedOperationsHandoffStatus;
  checks: TeoyubeStabilizedOperationsHandoffCheck[];
  releaseOwner: string;
  conditions: string[];
  notes: string[];
  reviewedAt: string;
};

export type TeoyubeStabilizedOperationsHandoffBlocker = {
  id: string;
  area: TeoyubeStabilizedOperationsHandoffArea;
  message: string;
};

export type TeoyubeStabilizedOperationsHandoffWarning = {
  id: string;
  area: TeoyubeStabilizedOperationsHandoffArea;
  message: string;
};

export type TeoyubeStabilizedOperationsHandoffReport = {
  valid: boolean;
  decision: TeoyubeStabilizedOperationsHandoffDecision;
  record: TeoyubeStabilizedOperationsHandoffRecord;
  blockers: TeoyubeStabilizedOperationsHandoffBlocker[];
  warnings: TeoyubeStabilizedOperationsHandoffWarning[];
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
