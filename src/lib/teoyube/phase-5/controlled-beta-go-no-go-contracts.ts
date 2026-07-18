export type TeoyubeControlledBetaGoNoGoStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubeControlledBetaGoNoGoDecision =
  | "go_for_controlled_beta_execution_planning"
  | "go_with_warnings"
  | "no_go_blocked"
  | "needs_fix_remediation"
  | "needs_service_gate_review"
  | "needs_privacy_security_review"
  | "needs_owner_approval"
  | "unknown";

export type TeoyubeControlledBetaGoNoGoArea =
  | "controlled_beta_scope"
  | "manual_qa_execution"
  | "readiness_score"
  | "fix_queue"
  | "regression_qa"
  | "service_gates"
  | "privacy_security"
  | "reviewed_content_gate"
  | "controlled_admin_prototype"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "mobile"
  | "accessibility"
  | "issue_intake"
  | "feedback_readiness"
  | "operational_readiness"
  | "owner_approval"
  | "unknown";

export type TeoyubeControlledBetaNextAction =
  | "Proceed to manual owner approval for controlled beta execution planning."
  | "Proceed with warnings and keep owner review active before any execution."
  | "Resolve blockers before controlled beta execution planning."
  | "Route remaining issues into fix remediation."
  | "Repeat service gate review before controlled beta execution planning."
  | "Repeat privacy and security review before controlled beta execution planning."
  | "Complete owner approval before controlled beta execution planning."
  | "Unknown next action.";

export type TeoyubeControlledBetaGoNoGoBlocker = {
  id: string;
  area: TeoyubeControlledBetaGoNoGoArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledBetaGoNoGoWarning = {
  id: string;
  area: TeoyubeControlledBetaGoNoGoArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledBetaGoNoGoRisk = {
  id: string;
  area: TeoyubeControlledBetaGoNoGoArea;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubeControlledBetaGoNoGoEvidence = {
  id: string;
  area: TeoyubeControlledBetaGoNoGoArea;
  label: string;
  source: string;
  status: "confirmed" | "warning" | "blocked" | "not_reviewed" | "unknown";
  details: string;
};

export type TeoyubeControlledBetaGoNoGoCheck = {
  id: string;
  area: TeoyubeControlledBetaGoNoGoArea;
  label: string;
  passed: boolean;
  details: string;
  evidence: TeoyubeControlledBetaGoNoGoEvidence[];
  blockers: TeoyubeControlledBetaGoNoGoBlocker[];
  warnings: TeoyubeControlledBetaGoNoGoWarning[];
  risks: TeoyubeControlledBetaGoNoGoRisk[];
};

export type TeoyubeControlledBetaGoNoGoReport = {
  valid: boolean;
  status: TeoyubeControlledBetaGoNoGoStatus;
  decision: TeoyubeControlledBetaGoNoGoDecision;
  checks: TeoyubeControlledBetaGoNoGoCheck[];
  evidence: TeoyubeControlledBetaGoNoGoEvidence[];
  blockers: TeoyubeControlledBetaGoNoGoBlocker[];
  warnings: TeoyubeControlledBetaGoNoGoWarning[];
  risks: TeoyubeControlledBetaGoNoGoRisk[];
  nextActions: TeoyubeControlledBetaNextAction[];
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
