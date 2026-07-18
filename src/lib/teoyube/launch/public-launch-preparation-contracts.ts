import type { TeoyubeProductionServiceConnectionPlan } from "./production-service-connection-contracts";

export type TeoyubePublicLaunchPreparationStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "incomplete"
  | "unknown";

export type TeoyubePublicLaunchPreparationStage =
  | "readiness_audit"
  | "production_service_planning"
  | "privacy_review"
  | "public_qa"
  | "public_launch_go_no_go"
  | "unknown";

export type TeoyubePublicLaunchRiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

export type TeoyubePublicLaunchDecision =
  | "ready_for_service_connection_planning"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_privacy_review"
  | "needs_qa_review"
  | "needs_safety_review"
  | "unknown";

export type TeoyubeProductionServiceConnectionStatus =
  | "not_connected"
  | "planning_only"
  | "ready_for_owner_review"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubeProductionServiceConnectionType =
  | "database_persistence"
  | "analytics"
  | "live_ai_orchestration"
  | "monitoring"
  | "email_or_notifications"
  | "storage"
  | "authentication"
  | "search"
  | "unknown";

export type { TeoyubeProductionServiceConnectionPlan };

export type TeoyubePublicLaunchReadinessCheck = {
  id: string;
  label: string;
  stage: TeoyubePublicLaunchPreparationStage;
  status: TeoyubePublicLaunchPreparationStatus;
  required: boolean;
  launchCritical: boolean;
  details: string;
};

export type TeoyubePublicLaunchBlocker = {
  id: string;
  label: string;
  stage: TeoyubePublicLaunchPreparationStage;
  reason: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubePublicLaunchWarning = {
  id: string;
  label: string;
  stage: TeoyubePublicLaunchPreparationStage;
  message: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

export type TeoyubePublicLaunchNextAction = {
  id: string;
  label: string;
  stage: TeoyubePublicLaunchPreparationStage;
  requiredBeforePublicLaunch: boolean;
  owner: "owner" | "engineering" | "qa" | "privacy" | "support";
};

export type TeoyubePublicLaunchReadinessReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicLaunchDecision;
  stage: "readiness_audit";
  checks: TeoyubePublicLaunchReadinessCheck[];
  blockers: TeoyubePublicLaunchBlocker[];
  warnings: TeoyubePublicLaunchWarning[];
  readinessPercentage: number;
  nextActions: TeoyubePublicLaunchNextAction[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noProductionPersistenceConnected: true;
  noExternalAnalyticsConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};
