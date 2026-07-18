export type TeoyubeFinalPublicGoNoGoStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "deferred"
  | "unknown";

export type TeoyubeFinalPublicGoNoGoDecision =
  | "go_for_public_launch_execution_preparation"
  | "go_after_owner_review"
  | "no_go_blocked"
  | "needs_privacy_review"
  | "needs_qa_review"
  | "needs_safety_review"
  | "needs_service_decision"
  | "unknown";

export type TeoyubeFinalPublicLaunchRiskCategory =
  | "privacy"
  | "terms"
  | "consent"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "confidence"
  | "mobile"
  | "accessibility"
  | "analytics"
  | "database"
  | "live_ai"
  | "personalization"
  | "feedback"
  | "public_copy"
  | "security"
  | "unknown";

export type TeoyubeFinalPublicLaunchRiskLevel = "low" | "medium" | "high" | "critical";

export type TeoyubeFinalPublicGoNoGoCheck = {
  id: string;
  label: string;
  category: TeoyubeFinalPublicLaunchRiskCategory;
  required: boolean;
  complete: boolean;
  status: TeoyubeFinalPublicGoNoGoStatus;
  launchCritical: boolean;
  details: string;
};

export type TeoyubeFinalPublicLaunchBlocker = {
  id: string;
  label: string;
  category: TeoyubeFinalPublicLaunchRiskCategory;
  riskLevel: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeFinalPublicLaunchWarning = {
  id: string;
  label: string;
  category: TeoyubeFinalPublicLaunchRiskCategory;
  riskLevel: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubeFinalPublicLaunchRisk = {
  id: string;
  category: TeoyubeFinalPublicLaunchRiskCategory;
  label: string;
  severity: TeoyubeFinalPublicLaunchRiskLevel;
  status: "open" | "accepted" | "mitigated" | "resolved";
  details: string;
  mitigation: string;
  ownerReviewRequired: boolean;
  resolvedAt?: string;
  resolution?: string;
};

export type TeoyubeFinalPublicLaunchNextAction = {
  id: string;
  label: string;
  requiredBeforePublicLaunchExecution: boolean;
  ownerActionRequired: boolean;
  details: string;
};

export type TeoyubeFinalProductionServiceType =
  | "database_persistence"
  | "external_analytics"
  | "live_ai_orchestration"
  | "monitoring"
  | "email_notifications"
  | "storage"
  | "authentication"
  | "deterministic_tig"
  | "consent_controls"
  | "unknown";

export type TeoyubeFinalProductionServiceDecisionStatus =
  | "enabled_required_safe_default"
  | "disabled_for_public_launch"
  | "deferred_for_later_setup"
  | "approved_for_later_setup"
  | "requires_future_setup"
  | "blocked"
  | "unknown";

export type TeoyubeFinalProductionServiceDecision = {
  id: string;
  service: TeoyubeFinalProductionServiceType;
  label: string;
  status: TeoyubeFinalProductionServiceDecisionStatus;
  requiredForPublicLaunch: boolean;
  approvedForPublicLaunch: boolean;
  connected: boolean;
  deferred: boolean;
  requiresFutureSetup: boolean;
  details: string;
};

export type TeoyubeFinalPublicOwnerApproval = {
  id: string;
  label: string;
  reviewedChecklistIds: string[];
  accepted: boolean;
  blocked: boolean;
  approvedForPublicLaunchExecutionPreparation: boolean;
  legalReviewRequired: boolean;
  legalApprovalRecorded: boolean;
  legalFinalApprovalClaimed: boolean;
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  generatedAt: string;
};

export type TeoyubeFinalPublicLaunchPackage = {
  id: string;
  label: string;
  status: TeoyubeFinalPublicGoNoGoStatus;
  decision: TeoyubeFinalPublicGoNoGoDecision;
  evidence: Record<string, unknown>;
  blockers: TeoyubeFinalPublicLaunchBlocker[];
  warnings: TeoyubeFinalPublicLaunchWarning[];
  nextActionRecommendation: "Public Launch Execution 6.1 - Controlled Public Launch Activation Checklist";
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  analyticsSent: false;
  databaseWritten: false;
  externalServicesCalled: false;
  generatedAt: string;
};

export type TeoyubeFinalPublicGoNoGoReport = {
  valid: boolean;
  ready: boolean;
  status: TeoyubeFinalPublicGoNoGoStatus;
  decision: TeoyubeFinalPublicGoNoGoDecision;
  checklist: TeoyubeFinalPublicGoNoGoCheck[];
  blockers: TeoyubeFinalPublicLaunchBlocker[];
  warnings: TeoyubeFinalPublicLaunchWarning[];
  nextActions: TeoyubeFinalPublicLaunchNextAction[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalAnalyticsSent: true;
  noProductionPersistenceEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};
