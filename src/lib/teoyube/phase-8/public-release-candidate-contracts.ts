export type TeoyubePublicReleaseCandidateStatus =
  | "planned"
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicReleaseCandidateArea =
  | "product_hardening"
  | "mobile_accessibility"
  | "performance_review"
  | "privacy_security"
  | "controlled_service_decisions"
  | "public_copy"
  | "known_limitations"
  | "support_workflow"
  | "manual_feedback_boundaries"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "owner_review"
  | "unknown";

export type TeoyubePublicReleaseCandidateDecision =
  | "ready_for_phase_9_public_release_preparation"
  | "ready_with_warnings"
  | "blocked"
  | "needs_product_hardening"
  | "needs_privacy_security_review"
  | "needs_service_decision_review"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicReleaseCandidateRequirement = {
  id: string;
  area: TeoyubePublicReleaseCandidateArea;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubePublicReleaseCandidateBlocker = {
  id: string;
  area: TeoyubePublicReleaseCandidateArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePublicReleaseCandidateWarning = {
  id: string;
  area: TeoyubePublicReleaseCandidateArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicReleaseCandidateCheck = {
  id: string;
  area: TeoyubePublicReleaseCandidateArea;
  label: string;
  passed: boolean;
  details: string;
  requirements: TeoyubePublicReleaseCandidateRequirement[];
};

export type TeoyubePublicReleaseCandidateRisk = {
  id: string;
  area: TeoyubePublicReleaseCandidateArea;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePublicReleaseCandidateNextAction = {
  id: string;
  area: TeoyubePublicReleaseCandidateArea;
  priority: "low" | "medium" | "high" | "critical";
  label: string;
  details: string;
  ownerReviewRequired: boolean;
  doesNotLaunchPublicly: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePublicReleaseCandidatePlan = {
  id: string;
  status: TeoyubePublicReleaseCandidateStatus;
  checks: TeoyubePublicReleaseCandidateCheck[];
  risks: TeoyubePublicReleaseCandidateRisk[];
  nextActions: TeoyubePublicReleaseCandidateNextAction[];
  blockers: TeoyubePublicReleaseCandidateBlocker[];
  warnings: TeoyubePublicReleaseCandidateWarning[];
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

export type TeoyubePublicReleaseCandidateReport = {
  valid: boolean;
  status: TeoyubePublicReleaseCandidateStatus;
  decision: TeoyubePublicReleaseCandidateDecision;
  plan: TeoyubePublicReleaseCandidatePlan;
  checks: TeoyubePublicReleaseCandidateCheck[];
  blockers: TeoyubePublicReleaseCandidateBlocker[];
  warnings: TeoyubePublicReleaseCandidateWarning[];
  risks: TeoyubePublicReleaseCandidateRisk[];
  nextActions: TeoyubePublicReleaseCandidateNextAction[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
