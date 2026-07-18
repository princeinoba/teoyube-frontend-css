export type TeoyubeControlledPublicGoNoGoStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_final_remediation"
  | "needs_owner_approval"
  | "unknown";

export type TeoyubeControlledPublicGoNoGoDecision =
  | "go_for_controlled_public_release_execution_planning"
  | "go_with_warnings"
  | "no_go_blocked"
  | "needs_final_remediation"
  | "needs_privacy_security_review"
  | "needs_service_lock_review"
  | "needs_owner_approval"
  | "unknown";

export type TeoyubeControlledPublicGoNoGoArea =
  | "public_release_preparation"
  | "release_candidate_qa"
  | "final_regression_qa"
  | "readiness_score"
  | "public_copy"
  | "privacy_consent"
  | "sensitive_data_warning"
  | "known_limitations"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "support_readiness"
  | "feedback_readiness"
  | "issue_triage"
  | "manual_monitoring"
  | "mobile"
  | "accessibility"
  | "performance_manual"
  | "owner_approval"
  | "operational_handoff"
  | "unknown";

export type TeoyubeControlledPublicGoNoGoCheck = {
  id: string;
  area: TeoyubeControlledPublicGoNoGoArea;
  label: string;
  passed: boolean;
  required: boolean;
  evidence: string;
};

export type TeoyubeControlledPublicGoNoGoBlocker = {
  id: string;
  area: TeoyubeControlledPublicGoNoGoArea;
  message: string;
};

export type TeoyubeControlledPublicGoNoGoWarning = {
  id: string;
  area: TeoyubeControlledPublicGoNoGoArea;
  message: string;
};

export type TeoyubeControlledPublicGoNoGoRisk = {
  id: string;
  area: TeoyubeControlledPublicGoNoGoArea;
  level: "low" | "medium" | "high" | "critical" | "unknown";
  description: string;
  mitigation: string;
};

export type TeoyubeControlledPublicGoNoGoEvidence = {
  id: string;
  area: TeoyubeControlledPublicGoNoGoArea;
  summary: string;
  source: string;
};

export type TeoyubeControlledPublicGoNoGoNextAction = {
  id: string;
  label: string;
  requiredBeforePhase95: boolean;
  details: string;
};

export type TeoyubeControlledPublicGoNoGoReport = {
  valid: boolean;
  status: TeoyubeControlledPublicGoNoGoStatus;
  decision: TeoyubeControlledPublicGoNoGoDecision;
  checks: TeoyubeControlledPublicGoNoGoCheck[];
  blockers: TeoyubeControlledPublicGoNoGoBlocker[];
  warnings: TeoyubeControlledPublicGoNoGoWarning[];
  risks: TeoyubeControlledPublicGoNoGoRisk[];
  evidence: TeoyubeControlledPublicGoNoGoEvidence[];
  nextActions: TeoyubeControlledPublicGoNoGoNextAction[];
  noPublicLaunchPerformed: true;
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
