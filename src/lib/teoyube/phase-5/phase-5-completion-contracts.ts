export type TeoyubePhase5CompletionStatus =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubePhase5CompletionArea =
  | "controlled_beta_preparation"
  | "manual_beta_qa"
  | "service_gate_review"
  | "privacy_security_readiness"
  | "issue_intake"
  | "feedback_readiness"
  | "operational_readiness"
  | "beta_qa_execution"
  | "issue_triage"
  | "readiness_score"
  | "fix_queue"
  | "remediation"
  | "regression_qa"
  | "go_no_go"
  | "owner_approval"
  | "operational_handoff"
  | "launch_boundary"
  | "known_limitations"
  | "documentation"
  | "roadmap"
  | "unknown";

export type TeoyubePhase5CompletionDecision =
  | "phase_5_complete"
  | "phase_5_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_beta_readiness_fix"
  | "needs_service_gate_fix"
  | "needs_documentation_fix"
  | "unknown";

export type TeoyubePhase5CompletionBlocker = {
  id: string;
  area: TeoyubePhase5CompletionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase5CompletionWarning = {
  id: string;
  area: TeoyubePhase5CompletionArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase5CompletionCheck = {
  id: string;
  area: TeoyubePhase5CompletionArea;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase5CompletionBlocker[];
  warnings: TeoyubePhase5CompletionWarning[];
};

export type TeoyubePhase5RemainingRisk = {
  id: string;
  area:
    | "beta_scope"
    | "manual_qa"
    | "readiness_score"
    | "fix_queue"
    | "remediation"
    | "regression_qa"
    | "go_no_go"
    | "owner_approval"
    | "service_gate"
    | "privacy_security"
    | "reviewed_content_gate"
    | "controlled_admin"
    | "scripture_anchor"
    | "explanation_trace"
    | "fallback"
    | "confidence_label"
    | "mobile"
    | "accessibility"
    | "future_persistence"
    | "future_analytics"
    | "future_monitoring"
    | "future_live_ai"
    | "unknown";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
  resolution?: string;
};

export type TeoyubePhase5LockedReadinessItem = {
  id: string;
  area: TeoyubePhase5CompletionArea;
  label: string;
  locked: boolean;
  rules: string[];
  sourceFiles: string[];
};

export type TeoyubePhase6RoadmapItem = {
  id: string;
  theme:
    | "controlled_beta_execution_planning"
    | "manual_participant_workflow"
    | "manual_feedback_intake"
    | "beta_issue_triage"
    | "beta_operations"
    | "beta_readiness_monitoring"
    | "service_gate_follow_up"
    | "privacy_security_follow_up"
    | "performance_hardening"
    | "mobile_accessibility_hardening"
    | "content_review_follow_up"
    | "operational_readiness"
    | "unknown";
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  summary: string;
  blockedBy: string[];
  doesNotLaunchBeta: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase5CompletionReport = {
  valid: boolean;
  status: TeoyubePhase5CompletionStatus;
  decision: TeoyubePhase5CompletionDecision;
  checks: TeoyubePhase5CompletionCheck[];
  blockers: TeoyubePhase5CompletionBlocker[];
  warnings: TeoyubePhase5CompletionWarning[];
  completionPercentage: number;
  lockedReadinessItems: TeoyubePhase5LockedReadinessItem[];
  remainingRisks: TeoyubePhase5RemainingRisk[];
  phase6RoadmapItems: TeoyubePhase6RoadmapItem[];
  nextMilestone: "TEOYUBE Phase 6 - Controlled Beta Execution Planning, Manual Feedback Loop & Operational Stabilization";
  nextStep: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries";
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

export type TeoyubePhase5CompletionPackage = {
  id: string;
  completionReport: TeoyubePhase5CompletionReport;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries";
  noExternalSend: true;
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
