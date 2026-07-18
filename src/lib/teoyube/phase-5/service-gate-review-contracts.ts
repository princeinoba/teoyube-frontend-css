export type TeoyubeServiceGateStatus =
  | "disabled"
  | "plan_only"
  | "deferred"
  | "blocked"
  | "unknown";

export type TeoyubeServiceGateKind =
  | "database_persistence"
  | "admin_auth"
  | "admin_cms"
  | "feedback_storage"
  | "external_analytics"
  | "production_monitoring"
  | "live_ai_orchestration"
  | "email_notifications"
  | "file_storage"
  | "search_index"
  | "user_accounts"
  | "unknown";

export type TeoyubeServiceGateDecision =
  | "remain_disabled"
  | "plan_only"
  | "defer_to_future_phase"
  | "requires_owner_review"
  | "requires_privacy_review"
  | "requires_security_review"
  | "requires_cost_review"
  | "approved_for_future_phase_only"
  | "blocked"
  | "unknown";

export type TeoyubeServiceGateRequirement = {
  id: string;
  label: string;
  requiredBeforeFutureImplementation: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubeServiceGateRisk = {
  id: string;
  kind: TeoyubeServiceGateKind;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  mitigation: string;
};

export type TeoyubeServiceGateReview = {
  kind: TeoyubeServiceGateKind;
  status: TeoyubeServiceGateStatus;
  decision: TeoyubeServiceGateDecision;
  currentStatus: string;
  whyNotEnabledYet: string;
  futureImplementationRequirements: string[];
  privacyReviewRequirements: string[];
  securityReviewRequirements: string[];
  costReviewRequirements: string[];
  ownerApprovalRequirements: string[];
  rollbackRequirements: string[];
  dataProtectionRequirements: string[];
  betaImpact: string;
  currentStepProhibition: string[];
  serviceConnected: false;
  futurePhaseOnly: true;
  requirements: TeoyubeServiceGateRequirement[];
  risks: TeoyubeServiceGateRisk[];
};

export type TeoyubeServiceGateBlocker = {
  id: string;
  kind: TeoyubeServiceGateKind;
  message: string;
  requiredAction: string;
};

export type TeoyubeServiceGateWarning = {
  id: string;
  kind: TeoyubeServiceGateKind;
  message: string;
  recommendedAction: string;
};

export type TeoyubeServiceGateReport = {
  valid: boolean;
  decision: TeoyubeServiceGateDecision;
  reviews: TeoyubeServiceGateReview[];
  blockers: TeoyubeServiceGateBlocker[];
  warnings: TeoyubeServiceGateWarning[];
  serviceConnectedCount: number;
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
