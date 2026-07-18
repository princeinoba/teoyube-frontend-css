export type TeoyubeBetaLaunchBoundaryStatus =
  | "boundary_clear"
  | "clear_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeBetaLaunchBoundaryRule =
  | "no_automatic_beta_launch"
  | "no_automatic_user_contact"
  | "no_automatic_feedback_collection"
  | "no_public_url_fetching"
  | "no_database_persistence"
  | "no_external_analytics"
  | "no_production_monitoring_provider"
  | "no_admin_auth"
  | "no_cms"
  | "no_user_accounts"
  | "no_live_ai_orchestration"
  | "no_email_notifications"
  | "no_service_dependency_for_safe_render"
  | "no_publishing_reviewed_content_automatically"
  | "no_review_only_content_in_live_flows"
  | "no_hidden_personalization"
  | "no_divine_certainty_claims";

export type TeoyubeBetaLaunchBoundaryDecision =
  | "preparation_only_boundary_clear"
  | "preparation_only_with_warnings"
  | "blocked_by_boundary_violation"
  | "unknown";

export type TeoyubeBetaLaunchBoundaryBlocker = {
  id: string;
  rule: TeoyubeBetaLaunchBoundaryRule;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaLaunchBoundaryWarning = {
  id: string;
  rule: TeoyubeBetaLaunchBoundaryRule;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaLaunchBoundaryCheck = {
  id: string;
  rule: TeoyubeBetaLaunchBoundaryRule;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubeBetaLaunchBoundaryBlocker[];
  warnings: TeoyubeBetaLaunchBoundaryWarning[];
};

export type TeoyubeBetaLaunchBoundaryReport = {
  valid: boolean;
  status: TeoyubeBetaLaunchBoundaryStatus;
  decision: TeoyubeBetaLaunchBoundaryDecision;
  checks: TeoyubeBetaLaunchBoundaryCheck[];
  blockers: TeoyubeBetaLaunchBoundaryBlocker[];
  warnings: TeoyubeBetaLaunchBoundaryWarning[];
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
  noEmailNotificationsSent: true;
  noReviewedContentPublishedAutomatically: true;
  inMemoryOnly: true;
  generatedAt: string;
};
