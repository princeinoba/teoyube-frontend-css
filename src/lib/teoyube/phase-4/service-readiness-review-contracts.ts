export type TeoyubeServiceReadinessStatus =
  | "disabled"
  | "not_ready"
  | "plan_only"
  | "requires_privacy_review"
  | "requires_security_review"
  | "requires_cost_review"
  | "requires_owner_review"
  | "approved_for_future_phase"
  | "blocked"
  | "unknown";

export type TeoyubeServiceReadinessKind =
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

export type TeoyubeServiceReadinessRequirement = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubeServiceReadinessRisk = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  mitigation: string;
};

export type TeoyubeServiceReadinessReview = {
  kind: TeoyubeServiceReadinessKind;
  status: TeoyubeServiceReadinessStatus;
  whyUsefulLater: string;
  requirements: TeoyubeServiceReadinessRequirement[];
  risks: TeoyubeServiceReadinessRisk[];
  dataProtectionRequirements: string[];
  rollbackRequirements: string[];
  mustNotHappenYet: string[];
  serviceConnected: false;
};

export type TeoyubeServiceReadinessDecision =
  | "all_services_disabled"
  | "plan_only_with_reviews_required"
  | "approved_for_future_phase"
  | "blocked";

export type TeoyubeServiceReadinessBlocker = {
  id: string;
  kind: TeoyubeServiceReadinessKind;
  message: string;
  requiredAction: string;
};

export type TeoyubeServiceReadinessWarning = {
  id: string;
  kind: TeoyubeServiceReadinessKind;
  message: string;
  recommendedAction: string;
};

export type TeoyubeServiceReadinessReport = {
  valid: boolean;
  decision: TeoyubeServiceReadinessDecision;
  reviews: TeoyubeServiceReadinessReview[];
  blockers: TeoyubeServiceReadinessBlocker[];
  warnings: TeoyubeServiceReadinessWarning[];
  serviceConnectedCount: number;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noEmailsOrNotificationsSent: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
