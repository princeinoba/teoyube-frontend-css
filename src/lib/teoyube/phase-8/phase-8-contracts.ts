export type TeoyubePhase8Status =
  | "planned"
  | "in_progress"
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase8Area =
  | "post_beta_readiness"
  | "manual_operations_review"
  | "product_hardening"
  | "content_review_follow_up"
  | "public_release_preparation"
  | "controlled_service_reassessment"
  | "privacy_security_review"
  | "performance_hardening"
  | "mobile_accessibility_hardening"
  | "owner_approval"
  | "operational_readiness"
  | "unknown";

export type TeoyubePhase8Priority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase8Decision =
  | "ready_for_phase_8_2"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_product_hardening_review"
  | "needs_service_reassessment_review"
  | "needs_privacy_security_review"
  | "unknown";

export type TeoyubePhase8Blocker = {
  id: string;
  area: TeoyubePhase8Area;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase8Warning = {
  id: string;
  area: TeoyubePhase8Area;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase8Check = {
  id: string;
  area: TeoyubePhase8Area;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase8Blocker[];
  warnings: TeoyubePhase8Warning[];
};

export type TeoyubePhase8Risk = {
  id: string;
  area: TeoyubePhase8Area;
  priority: TeoyubePhase8Priority;
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
};

export type TeoyubePhase8NextAction = {
  id: string;
  area: TeoyubePhase8Area;
  priority: TeoyubePhase8Priority;
  label: string;
  details: string;
  ownerReviewRequired: boolean;
  doesNotLaunchPublicly: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase8Report = {
  valid: boolean;
  status: TeoyubePhase8Status;
  decision: TeoyubePhase8Decision;
  checks: TeoyubePhase8Check[];
  blockers: TeoyubePhase8Blocker[];
  warnings: TeoyubePhase8Warning[];
  risks: TeoyubePhase8Risk[];
  nextActions: TeoyubePhase8NextAction[];
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
  noUserAccountsAdded: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
