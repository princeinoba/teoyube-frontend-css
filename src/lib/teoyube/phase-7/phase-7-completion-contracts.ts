export type TeoyubePhase7CompletionStatus =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubePhase7CompletionArea =
  | "controlled_beta_operations_runbook"
  | "manual_feedback_review"
  | "beta_support_workflow"
  | "manual_operational_monitoring"
  | "issue_escalation"
  | "support_to_issue_conversion"
  | "pause_rollback_review"
  | "known_limitations"
  | "feedback_review_simulation"
  | "support_issue_triage"
  | "product_stabilization_queue"
  | "stabilization_safety"
  | "stabilization_planner"
  | "product_stabilization_pass"
  | "regression_qa"
  | "beta_operations_readiness_score"
  | "service_disabled_state"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "mobile_accessibility"
  | "owner_review"
  | "documentation"
  | "roadmap"
  | "unknown";

export type TeoyubePhase7CompletionDecision =
  | "phase_7_complete"
  | "phase_7_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_operations_fix"
  | "needs_stabilization_fix"
  | "needs_documentation_fix"
  | "unknown";

export type TeoyubePhase7CompletionBlocker = {
  id: string;
  area: TeoyubePhase7CompletionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase7CompletionWarning = {
  id: string;
  area: TeoyubePhase7CompletionArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase7CompletionCheck = {
  id: string;
  area: TeoyubePhase7CompletionArea;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase7CompletionBlocker[];
  warnings: TeoyubePhase7CompletionWarning[];
};

export type TeoyubePhase7RemainingRisk = {
  id: string;
  area:
    | "manual_operations"
    | "manual_feedback_review"
    | "support_workflow"
    | "issue_triage"
    | "product_stabilization"
    | "regression_qa"
    | "readiness_score"
    | "service_disabled_state"
    | "privacy_consent"
    | "scripture_anchor"
    | "explanation_trace"
    | "fallback"
    | "confidence_label"
    | "reviewed_content_gate"
    | "controlled_admin"
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

export type TeoyubePhase7LockedOperationsItem = {
  id: string;
  area: TeoyubePhase7CompletionArea;
  label: string;
  locked: boolean;
  rules: string[];
  sourceFiles: string[];
};

export type TeoyubePhase8RoadmapItem = {
  id: string;
  theme:
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
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  summary: string;
  blockedBy: string[];
  doesNotLaunchPublicly: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase7CompletionReport = {
  valid: boolean;
  status: TeoyubePhase7CompletionStatus;
  decision: TeoyubePhase7CompletionDecision;
  checks: TeoyubePhase7CompletionCheck[];
  blockers: TeoyubePhase7CompletionBlocker[];
  warnings: TeoyubePhase7CompletionWarning[];
  completionPercentage: number;
  lockedOperationsItems: TeoyubePhase7LockedOperationsItem[];
  remainingRisks: TeoyubePhase7RemainingRisk[];
  phase8RoadmapItems: TeoyubePhase8RoadmapItem[];
  nextMilestone: "TEOYUBE Phase 8 - Post-Beta Readiness, Product Hardening & Controlled Service Reassessment";
  nextStep: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate";
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
  noReviewedContentAutoPublished: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase7CompletionPackage = {
  id: string;
  completionReport: TeoyubePhase7CompletionReport;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate";
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
  noUserAccountsAdded: true;
  noReviewedContentAutoPublished: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
