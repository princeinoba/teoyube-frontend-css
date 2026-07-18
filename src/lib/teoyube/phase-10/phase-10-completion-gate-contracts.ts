export type TeoyubePhase10CompletionStatus =
  | "not_started"
  | "reviewing"
  | "ready_to_complete"
  | "complete_with_warnings"
  | "needs_more_stabilization"
  | "blocked"
  | "unknown";

export type TeoyubePhase10CompletionArea =
  | "phase_10_1"
  | "phase_10_2"
  | "phase_10_3"
  | "phase_10_4"
  | "phase_10_5"
  | "phase_10_6"
  | "phase_10_7"
  | "build_verification"
  | "route_qa"
  | "public_trust"
  | "known_limitations"
  | "operations_handoff"
  | "weekly_improvement_loop"
  | "owner_approval"
  | "unknown";

export type TeoyubePhase10CompletionDecision =
  | "phase_10_complete"
  | "phase_10_complete_with_warnings"
  | "continue_stabilization"
  | "blocked"
  | "unknown";

export type TeoyubePhase10CompletionCheck = {
  id: string;
  area: TeoyubePhase10CompletionArea;
  label: string;
  passed: boolean;
  critical: boolean;
  details: string;
};

export type TeoyubePhase10CompletionRecord = {
  id: string;
  status: TeoyubePhase10CompletionStatus;
  checks: TeoyubePhase10CompletionCheck[];
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubePhase10CompletionBlocker = {
  id: string;
  area: TeoyubePhase10CompletionArea;
  message: string;
};

export type TeoyubePhase10CompletionWarning = {
  id: string;
  area: TeoyubePhase10CompletionArea;
  message: string;
};

export type TeoyubePhase10CompletionReport = {
  valid: boolean;
  decision: TeoyubePhase10CompletionDecision;
  record: TeoyubePhase10CompletionRecord;
  blockers: TeoyubePhase10CompletionBlocker[];
  warnings: TeoyubePhase10CompletionWarning[];
  noAutomaticPublicLaunch: true;
  noAutomaticDeployment: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
