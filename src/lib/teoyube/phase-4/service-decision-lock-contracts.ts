export type TeoyubeServiceDecisionLockStatus =
  | "locked_disabled"
  | "locked_plan_only"
  | "locked_deferred"
  | "locked_requires_owner_review"
  | "locked_requires_privacy_review"
  | "locked_requires_security_review"
  | "locked_requires_cost_review"
  | "approved_for_future_phase_only"
  | "blocked"
  | "unknown";

export type TeoyubeLockedServiceKind =
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

export type TeoyubeLockedServiceRequirement = {
  id: string;
  label: string;
  requiredBeforeFutureImplementation: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubeLockedServiceRisk = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  mitigation: string;
};

export type TeoyubeLockedServiceDecision = {
  kind: TeoyubeLockedServiceKind;
  status: TeoyubeServiceDecisionLockStatus;
  whyDisabled: string;
  futurePhaseOnly: true;
  serviceConnected: false;
  requiredOwnerReview: true;
  requiredPrivacyReview: true;
  requiredSecurityReview: true;
  requiredCostReview: true;
  rollbackRequirements: string[];
  dataProtectionRequirements: string[];
  mustNotHappenInCurrentCode: string[];
};

export type TeoyubeLockedServiceReview = TeoyubeLockedServiceDecision & {
  requirements: TeoyubeLockedServiceRequirement[];
  risks: TeoyubeLockedServiceRisk[];
};

export type TeoyubeServiceDecisionLockBlocker = {
  id: string;
  kind: TeoyubeLockedServiceKind;
  message: string;
  requiredAction: string;
};

export type TeoyubeServiceDecisionLockWarning = {
  id: string;
  kind: TeoyubeLockedServiceKind;
  message: string;
  recommendedAction: string;
};

export type TeoyubeServiceDecisionLockDecision =
  | "service_decisions_locked"
  | "service_decisions_locked_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeServiceDecisionLockReport = {
  valid: boolean;
  decision: TeoyubeServiceDecisionLockDecision;
  locks: TeoyubeLockedServiceReview[];
  blockers: TeoyubeServiceDecisionLockBlocker[];
  warnings: TeoyubeServiceDecisionLockWarning[];
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
