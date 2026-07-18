export type TeoyubeSoftLaunchCompletionStatus =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_review"
  | "needs_fix"
  | "incomplete"
  | "unknown";

export type TeoyubeSoftLaunchCompletionDecision =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_more_review"
  | "needs_fix"
  | "unknown";

export type TeoyubePublicLaunchReadinessStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_safety_review"
  | "needs_qa_review"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicLaunchReadinessDecision =
  | "ready_for_public_launch_preparation"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_more_soft_launch_stabilization"
  | "needs_safety_review"
  | "needs_qa_review"
  | "unknown";

export type TeoyubePublicLaunchRiskCategory =
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "consent"
  | "privacy"
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

export type TeoyubeSoftLaunchCompletionCheck = {
  id: string;
  label: string;
  status: TeoyubeSoftLaunchCompletionStatus;
  required: boolean;
  launchCritical: boolean;
  details: string;
};

export type TeoyubeSoftLaunchCompletionBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubeSoftLaunchCompletionWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

export type TeoyubeSoftLaunchCompletionSummary = {
  checkCount: number;
  completeCount: number;
  warningCount: number;
  blockerCount: number;
  launchCriticalIssueCount: number;
  unresolvedIssueCount: number;
  knownLimitationCount: number;
};

export type TeoyubeSoftLaunchCompletionReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeSoftLaunchCompletionDecision;
  status: TeoyubeSoftLaunchCompletionStatus;
  checks: TeoyubeSoftLaunchCompletionCheck[];
  summary: TeoyubeSoftLaunchCompletionSummary;
  blockers: TeoyubeSoftLaunchCompletionBlocker[];
  warnings: TeoyubeSoftLaunchCompletionWarning[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePublicLaunchReadinessRisk = {
  id: string;
  category: TeoyubePublicLaunchRiskCategory;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "accepted" | "resolved" | "deferred" | "unknown";
  mitigation: string;
  ownerReviewRequired: boolean;
};

export type TeoyubePublicLaunchReadinessNextAction = {
  id: string;
  label: string;
  requiredBeforePublicLaunch: boolean;
  owner: "owner" | "engineering" | "qa" | "privacy" | "support";
};

export type TeoyubePublicLaunchReadinessPackage = {
  id: string;
  label: string;
  completionReport: unknown;
  feedbackSummaryReport: unknown;
  issueClosureReport: unknown;
  stabilityCertificationReport: unknown;
  finalSafetyPrivacyReport: unknown;
  readinessCriteriaReport: unknown;
  surfaceReadinessReport: unknown;
  knownLimitations: string[];
  risks: TeoyubePublicLaunchReadinessRisk[];
  ownerReview: unknown;
  recommendedNextStage: "Public Launch Preparation";
  recommendedNextStep: "5.1 - Public Launch Readiness Audit & Production Service Connection Plan";
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  generatedAt: string;
};
