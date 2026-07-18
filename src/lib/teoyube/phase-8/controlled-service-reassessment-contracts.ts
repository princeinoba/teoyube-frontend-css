export type TeoyubeControlledServiceReassessmentStatus =
  | "disabled"
  | "plan_only"
  | "eligible_for_future_design_review"
  | "blocked"
  | "unknown";

export type TeoyubeControlledServiceReassessmentKind =
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
  | "unknown";

export type TeoyubeControlledServiceReassessmentDecision =
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

export type TeoyubeControlledServiceReassessmentRequirement = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeControlledServiceReassessmentRisk = {
  id: string;
  kind: TeoyubeControlledServiceReassessmentKind;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubeControlledServiceReassessmentItem = {
  id: string;
  kind: TeoyubeControlledServiceReassessmentKind;
  label: string;
  currentStatus: TeoyubeControlledServiceReassessmentStatus;
  decision: TeoyubeControlledServiceReassessmentDecision;
  rationale: string;
  evidenceNeeded: string[];
  requirements: TeoyubeControlledServiceReassessmentRequirement[];
  risks: TeoyubeControlledServiceReassessmentRisk[];
  noServiceConnected: true;
  noExternalWrite: true;
  noProductionDataMutation: true;
};

export type TeoyubeControlledServiceReassessmentBlocker = {
  id: string;
  kind: TeoyubeControlledServiceReassessmentKind;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledServiceReassessmentWarning = {
  id: string;
  kind: TeoyubeControlledServiceReassessmentKind;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledServiceReassessmentReport = {
  valid: boolean;
  decision: TeoyubeControlledServiceReassessmentDecision;
  items: TeoyubeControlledServiceReassessmentItem[];
  blockers: TeoyubeControlledServiceReassessmentBlocker[];
  warnings: TeoyubeControlledServiceReassessmentWarning[];
  noServiceConnected: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noUserAccountsAdded: true;
  inMemoryOnly: true;
  generatedAt: string;
};
