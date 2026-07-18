export type TeoyubeControlledServiceDecisionPackageStatus =
  | "disabled"
  | "plan_only"
  | "future_review_only"
  | "blocked"
  | "unknown";

export type TeoyubeControlledServiceDecisionKind =
  | "database_persistence"
  | "external_analytics"
  | "production_monitoring"
  | "admin_auth"
  | "admin_cms"
  | "feedback_storage"
  | "user_accounts"
  | "live_ai_orchestration"
  | "email_notifications"
  | "file_storage"
  | "search_index"
  | "public_release_support"
  | "unknown";

export type TeoyubeControlledServiceDecisionDecision =
  | "remain_disabled"
  | "remain_plan_only"
  | "defer_to_future_phase"
  | "eligible_for_future_design_review"
  | "requires_owner_review"
  | "requires_privacy_review"
  | "requires_security_review"
  | "requires_cost_review"
  | "blocked"
  | "unknown";

export type TeoyubeControlledServiceDecisionRequirement = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeControlledServiceDecisionRisk = {
  id: string;
  kind: TeoyubeControlledServiceDecisionKind;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubeControlledServiceDecisionGate = {
  id: string;
  label: string;
  required: boolean;
  satisfied: boolean;
  details: string;
};

export type TeoyubeControlledServiceDecisionItem = {
  id: string;
  kind: TeoyubeControlledServiceDecisionKind;
  label: string;
  currentStatus: TeoyubeControlledServiceDecisionPackageStatus;
  decision: TeoyubeControlledServiceDecisionDecision;
  reasonForNotEnablingNow: string;
  futureEvidenceRequired: string[];
  ownerReviewRequirements: TeoyubeControlledServiceDecisionRequirement[];
  privacyReviewRequirements: TeoyubeControlledServiceDecisionRequirement[];
  securityReviewRequirements: TeoyubeControlledServiceDecisionRequirement[];
  costReviewRequirements: TeoyubeControlledServiceDecisionRequirement[];
  rollbackRequirements: TeoyubeControlledServiceDecisionRequirement[];
  dataProtectionRequirements: TeoyubeControlledServiceDecisionRequirement[];
  safetyTheologyRequirements: TeoyubeControlledServiceDecisionRequirement[];
  gates: TeoyubeControlledServiceDecisionGate[];
  risks: TeoyubeControlledServiceDecisionRisk[];
  currentCodeProhibition: string;
  noServiceConnected: true;
  noExternalWrite: true;
  noProductionDataMutation: true;
};

export type TeoyubeControlledServiceDecisionBlocker = {
  id: string;
  kind: TeoyubeControlledServiceDecisionKind;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledServiceDecisionWarning = {
  id: string;
  kind: TeoyubeControlledServiceDecisionKind;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledServiceDecisionReport = {
  valid: boolean;
  decision: TeoyubeControlledServiceDecisionDecision;
  items: TeoyubeControlledServiceDecisionItem[];
  blockers: TeoyubeControlledServiceDecisionBlocker[];
  warnings: TeoyubeControlledServiceDecisionWarning[];
  servicesRemainingDisabled: TeoyubeControlledServiceDecisionItem[];
  servicesEligibleForFutureReview: TeoyubeControlledServiceDecisionItem[];
  noServiceConnected: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noUserAccountsAdded: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailNotificationsEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};
