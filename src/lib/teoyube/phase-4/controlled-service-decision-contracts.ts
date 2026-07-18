export type TeoyubeControlledServiceKind =
  | "database_persistence"
  | "external_analytics"
  | "production_monitoring"
  | "admin_content_workflow"
  | "feedback_storage"
  | "user_accounts"
  | "live_ai_orchestration"
  | "email_notifications"
  | "file_storage"
  | "search_index"
  | "unknown";

export type TeoyubeControlledServiceDecisionStatus =
  | "disabled"
  | "defer"
  | "plan_only"
  | "requires_owner_review"
  | "requires_privacy_review"
  | "requires_security_review"
  | "requires_cost_review"
  | "approved_for_future_phase"
  | "blocked"
  | "unknown";

export type TeoyubeControlledServiceRequirement = {
  id: string;
  label: string;
  requiredBeforeImplementation: boolean;
  details: string;
};

export type TeoyubeControlledServiceRisk = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubeControlledServiceDecision = {
  kind: TeoyubeControlledServiceKind;
  status: TeoyubeControlledServiceDecisionStatus;
  whyNeededLater: string;
  privacyReviewRequired: string;
  securityReviewRequired: string;
  costReviewRequired: string;
  ownerApprovalRequired: string;
  requirements: TeoyubeControlledServiceRequirement[];
  risks: TeoyubeControlledServiceRisk[];
  mustNotDoYet: string[];
  serviceConnected: false;
};

export type TeoyubeControlledServiceReview = {
  id: string;
  decisions: TeoyubeControlledServiceDecision[];
  ownerReviewed: boolean;
  privacyReviewed: boolean;
  securityReviewed: boolean;
  costReviewed: boolean;
};

export type TeoyubeControlledServiceDecisionReport = {
  valid: boolean;
  decisions: TeoyubeControlledServiceDecision[];
  blockers: string[];
  warnings: string[];
  noServicesConnected: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
