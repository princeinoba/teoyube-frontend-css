export type TeoyubePhase5Status =
  | "in_progress"
  | "ready_with_warnings"
  | "blocked"
  | "complete"
  | "unknown";

export type TeoyubePhase5Area =
  | "controlled_beta_preparation"
  | "manual_beta_qa"
  | "service_gate_review"
  | "privacy_security_review"
  | "reviewed_content_release_process"
  | "admin_workflow_decision"
  | "performance_hardening"
  | "mobile_accessibility_hardening"
  | "issue_intake"
  | "feedback_readiness"
  | "operational_readiness"
  | "owner_review"
  | "unknown";

export type TeoyubePhase5Priority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase5Decision =
  | "phase_5_1_complete"
  | "phase_5_1_complete_with_warnings"
  | "phase_5_2_complete"
  | "phase_5_2_complete_with_warnings"
  | "phase_5_3_complete"
  | "phase_5_3_complete_with_warnings"
  | "phase_5_4_complete"
  | "phase_5_4_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_service_gate_review"
  | "needs_privacy_security_review"
  | "unknown";

export type TeoyubePhase5NextAction =
  | "Phase 5.2 - Manual Beta QA Execution, Issue Triage & Readiness Score"
  | "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA"
  | "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff"
  | "Phase 5.5 - Phase 5 Completion Review, Beta Readiness Lock & Phase 6 Roadmap"
  | "Resolve blockers before Phase 5.2"
  | "Resolve blockers before Phase 5.3"
  | "Resolve blockers before Phase 5.4"
  | "Resolve blockers before Phase 5.5"
  | "Owner review required before Phase 5.2";

export type TeoyubePhase5Blocker = {
  id: string;
  area: TeoyubePhase5Area;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase5Warning = {
  id: string;
  area: TeoyubePhase5Area;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase5Check = {
  id: string;
  area: TeoyubePhase5Area;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase5Blocker[];
  warnings: TeoyubePhase5Warning[];
};

export type TeoyubePhase5Risk = {
  id: string;
  area: TeoyubePhase5Area;
  priority: TeoyubePhase5Priority;
  status: "open" | "accepted" | "mitigated";
  message: string;
  mitigation: string;
};

export type TeoyubePhase5Report = {
  valid: boolean;
  status: TeoyubePhase5Status;
  decision: TeoyubePhase5Decision;
  checks: TeoyubePhase5Check[];
  blockers: TeoyubePhase5Blocker[];
  warnings: TeoyubePhase5Warning[];
  risks: TeoyubePhase5Risk[];
  nextAction: TeoyubePhase5NextAction;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
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
