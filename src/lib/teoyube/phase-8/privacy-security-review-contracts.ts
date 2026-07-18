export type TeoyubePrivacySecurityReviewStatus =
  | "planned"
  | "reviewed"
  | "reviewed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePrivacySecurityReviewArea =
  | "privacy_notice"
  | "consent_notice"
  | "sensitive_data_warning"
  | "manual_feedback_boundaries"
  | "support_boundaries"
  | "hidden_personalization"
  | "browser_persistence"
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
  | "public_copy"
  | "known_limitations"
  | "unknown";

export type TeoyubePrivacySecurityReviewDecision =
  | "ready_for_public_release_readiness_gate"
  | "ready_with_warnings"
  | "blocked"
  | "needs_privacy_review"
  | "needs_security_review"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePrivacySecurityRequirement = {
  id: string;
  area: TeoyubePrivacySecurityReviewArea;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubePrivacySecurityRisk = {
  id: string;
  area: TeoyubePrivacySecurityReviewArea;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePrivacySecurityReviewCheck = {
  id: string;
  area: TeoyubePrivacySecurityReviewArea;
  label: string;
  passed: boolean;
  details: string;
  requirements: TeoyubePrivacySecurityRequirement[];
};

export type TeoyubePrivacySecurityReviewResult = {
  id: string;
  checkId: string;
  area: TeoyubePrivacySecurityReviewArea;
  status: TeoyubePrivacySecurityReviewStatus;
  passed: boolean;
  notes: string[];
};

export type TeoyubePrivacySecurityReviewBlocker = {
  id: string;
  area: TeoyubePrivacySecurityReviewArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePrivacySecurityReviewWarning = {
  id: string;
  area: TeoyubePrivacySecurityReviewArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePrivacySecurityReviewReport = {
  valid: boolean;
  decision: TeoyubePrivacySecurityReviewDecision;
  checks: TeoyubePrivacySecurityReviewCheck[];
  results: TeoyubePrivacySecurityReviewResult[];
  blockers: TeoyubePrivacySecurityReviewBlocker[];
  warnings: TeoyubePrivacySecurityReviewWarning[];
  risks: TeoyubePrivacySecurityRisk[];
  noLegalApprovalClaimed: true;
  noSecretsExposed: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noUserAccountsAdded: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailNotificationsEnabled: true;
  noBrowserPersistenceRequired: true;
  noHiddenPersonalization: true;
  inMemoryOnly: true;
  generatedAt: string;
};
