export type TeoyubePublicLaunchCompletionStatus =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_review"
  | "needs_fix"
  | "incomplete"
  | "not_launched"
  | "unknown";

export type TeoyubePublicLaunchCompletionDecision =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_more_review"
  | "needs_fix"
  | "not_applicable_no_public_launch_recorded"
  | "unknown";

export type TeoyubePostLaunchReadinessStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_safety_review"
  | "needs_qa_review"
  | "needs_owner_review"
  | "not_applicable_no_public_launch_recorded"
  | "unknown";

export type TeoyubePostLaunchReadinessDecision =
  | "ready_for_post_launch_operations"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_more_public_stabilization"
  | "needs_safety_review"
  | "needs_qa_review"
  | "not_applicable_no_public_launch_recorded"
  | "unknown";

export type TeoyubePostLaunchRiskCategory =
  | "privacy"
  | "terms"
  | "consent"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "confidence"
  | "mobile"
  | "accessibility"
  | "performance"
  | "feedback"
  | "content_clarity"
  | "ai_companion"
  | "personalization"
  | "offline"
  | "security"
  | "production_services"
  | "unknown";

export type TeoyubePublicLaunchCompletionCheck = {
  id: string;
  label: string;
  status: TeoyubePublicLaunchCompletionStatus;
  required: boolean;
  publicLaunchCritical: boolean;
  details: string;
};

export type TeoyubePublicLaunchCompletionBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubePublicLaunchCompletionWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

export type TeoyubePublicLaunchCompletionSummary = {
  checkCount: number;
  completeCount: number;
  warningCount: number;
  blockerCount: number;
  publicLaunchCriticalIssueCount: number;
  unresolvedIssueCount: number;
  knownLimitationCount: number;
  publicLaunchRecorded: boolean;
};

export type TeoyubePublicLaunchCompletionReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicLaunchCompletionDecision;
  status: TeoyubePublicLaunchCompletionStatus;
  checks: TeoyubePublicLaunchCompletionCheck[];
  summary: TeoyubePublicLaunchCompletionSummary;
  blockers: TeoyubePublicLaunchCompletionBlocker[];
  warnings: TeoyubePublicLaunchCompletionWarning[];
  noPublicLaunchPerformedByCode: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePostLaunchReadinessRisk = {
  id: string;
  category: TeoyubePostLaunchRiskCategory;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "accepted" | "resolved" | "deferred" | "unknown";
  mitigation: string;
  ownerReviewRequired: boolean;
};

export type TeoyubePostLaunchNextAction = {
  id: string;
  label: string;
  requiredBeforePostLaunchOperations: boolean;
  owner: "owner" | "engineering" | "qa" | "privacy" | "support";
};

export type TeoyubePostLaunchReadinessPackage = {
  id: string;
  label: string;
  completionReport: unknown;
  feedbackSummaryReport: unknown;
  issueClosureReport: unknown;
  stabilityCertificationReport: unknown;
  finalSafetyPrivacyReport: unknown;
  readinessCriteriaReport: unknown;
  surfaceReadinessReport: unknown;
  productionServiceStatus: "controlled" | "disconnected" | "manual_review_required" | "unknown";
  knownLimitations: string[];
  risks: TeoyubePostLaunchReadinessRisk[];
  ownerReview: unknown;
  recommendedNextStage: "Post-Launch Operations";
  recommendedNextStep: "7.1 - Public Monitoring, Support & Growth Roadmap";
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
  generatedAt: string;
};
