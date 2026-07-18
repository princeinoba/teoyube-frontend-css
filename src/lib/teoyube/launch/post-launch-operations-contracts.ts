export type TeoyubePostLaunchOperationsStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_monitoring_review"
  | "needs_support_review"
  | "needs_growth_review"
  | "incomplete"
  | "unknown";

export type TeoyubePostLaunchOperationsDecision =
  | "ready_for_public_monitoring_support_growth"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_public_monitoring_review"
  | "needs_support_workflow_review"
  | "needs_growth_roadmap_review"
  | "not_applicable_no_public_launch_recorded"
  | "unknown";

export type TeoyubePostLaunchOperationsRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TeoyubePostLaunchOperationsCheck = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
  riskLevel: TeoyubePostLaunchOperationsRiskLevel;
};

export type TeoyubePostLaunchOperationsBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubePostLaunchOperationsWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

export type TeoyubePostLaunchMonitoringArea =
  | "public_surface_health"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "confidence"
  | "privacy_terms_consent"
  | "manual_feedback"
  | "support"
  | "mobile"
  | "accessibility"
  | "performance"
  | "offline"
  | "production_services"
  | "unknown";

export type TeoyubePostLaunchMonitoringCadence =
  | "daily"
  | "weekly"
  | "owner_review"
  | "incident_driven";

export type TeoyubePostLaunchMonitoringItem = {
  id: string;
  label: string;
  area: TeoyubePostLaunchMonitoringArea;
  cadence: TeoyubePostLaunchMonitoringCadence;
  owner: "owner" | "engineering" | "support" | "qa" | "privacy";
  manualOnly: true;
  required: boolean;
};

export type TeoyubePostLaunchSupportCategory =
  | "privacy"
  | "terms"
  | "consent"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "mobile"
  | "accessibility"
  | "content_clarity"
  | "ai_companion"
  | "personalization"
  | "technical"
  | "unknown";

export type TeoyubePostLaunchSupportStep = {
  id: string;
  label: string;
  category: TeoyubePostLaunchSupportCategory;
  required: boolean;
  complete: boolean;
  manualOnly: true;
};

export type TeoyubePostLaunchGrowthRoadmapCategory =
  | "monitoring"
  | "support"
  | "content_clarity"
  | "mobile"
  | "accessibility"
  | "performance"
  | "privacy"
  | "consent"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "ai_companion"
  | "personalization"
  | "production_services"
  | "unknown";

export type TeoyubePostLaunchGrowthRoadmapItem = {
  id: string;
  label: string;
  category: TeoyubePostLaunchGrowthRoadmapCategory;
  priority: "now" | "next" | "later" | "blocked";
  ownerReviewRequired: boolean;
  requiresSeparateServiceApproval: boolean;
};

export type TeoyubePostLaunchOperationsPackage = {
  id: string;
  label: string;
  publicMonitoringReport: unknown;
  supportWorkflowReport: unknown;
  growthRoadmapReport: unknown;
  readinessPackageReport: unknown;
  recommendedNextStage: "Post-Launch Operations";
  recommendedNextStep: "7.2 - Support Desk, Feedback Review & Weekly Improvement Loop";
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicUrlFetched: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  productionPersistenceEnabled: false;
  externalAnalyticsEnabled: false;
  liveAiOrchestrationEnabled: false;
  serviceWorkerRegistered: false;
  rawSensitiveTextStored: false;
  hiddenPersonalizationCreated: false;
  generatedAt: string;
};
