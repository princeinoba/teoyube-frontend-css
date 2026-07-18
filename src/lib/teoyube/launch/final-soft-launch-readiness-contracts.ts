export type TeoyubeFinalSoftLaunchReadinessStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_safety_review"
  | "needs_qa_review"
  | "incomplete"
  | "unknown";

export type TeoyubeFinalSoftLaunchGoNoGoDecision =
  | "go_for_limited_soft_launch_execution"
  | "go_after_owner_review"
  | "no_go_blocked"
  | "needs_safety_fix"
  | "needs_qa_fix"
  | "needs_environment_fix"
  | "unknown";

export type TeoyubeFinalSoftLaunchOwnerApprovalStatus =
  | "approved"
  | "blocked"
  | "needs_review"
  | "not_started"
  | "unknown";

export type TeoyubeFinalSoftLaunchRiskCategory =
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "consent"
  | "privacy"
  | "mobile"
  | "accessibility"
  | "feedback"
  | "support"
  | "rollback"
  | "environment"
  | "debug_safety"
  | "content_clarity"
  | "performance"
  | "unknown";

export type TeoyubeFinalSoftLaunchRiskSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TeoyubeFinalSoftLaunchReadinessCheck = {
  id: string;
  label: string;
  category:
    | "readiness_package"
    | "safety"
    | "surface"
    | "quality_gate"
    | "risk"
    | "known_limitation"
    | "owner_go_no_go"
    | "execution_handoff"
    | "audit";
  required: boolean;
  complete: boolean;
  status: TeoyubeFinalSoftLaunchReadinessStatus;
  riskLevel: TeoyubeFinalSoftLaunchRiskSeverity;
  details: string;
  nextAction?: string;
};

export type TeoyubeFinalSoftLaunchReadinessBlocker = {
  id: string;
  label: string;
  category: TeoyubeFinalSoftLaunchReadinessCheck["category"] | TeoyubeFinalSoftLaunchRiskCategory;
  severity: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeFinalSoftLaunchReadinessWarning = {
  id: string;
  label: string;
  category: TeoyubeFinalSoftLaunchReadinessCheck["category"] | TeoyubeFinalSoftLaunchRiskCategory;
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubeFinalSoftLaunchDecisionReason = {
  id: string;
  label: string;
  supportsDecision: boolean;
  details: string;
};

export type TeoyubeFinalSoftLaunchNextAction = {
  id: string;
  label: string;
  requiredBeforeLaunchExecution: boolean;
  ownerActionRequired: boolean;
  details: string;
};

export type TeoyubeFinalSoftLaunchKnownLimitation = {
  id: string;
  label: string;
  category:
    | "scope"
    | "persistence"
    | "analytics"
    | "live_ai"
    | "feedback"
    | "personalization"
    | "privacy"
    | "feature_scope"
    | "owner_review";
  surfaces: string[];
  message: string;
  ownerAcknowledgementRequired: boolean;
};

export type TeoyubeFinalSoftLaunchRisk = {
  id: string;
  label: string;
  category: TeoyubeFinalSoftLaunchRiskCategory;
  severity: TeoyubeFinalSoftLaunchRiskSeverity;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high" | "critical";
  mitigation: string;
  ownerReviewRequired: boolean;
  resolved: boolean;
  resolution?: string;
};

export type TeoyubeFinalSoftLaunchRiskRegister = {
  id: string;
  label: string;
  risks: TeoyubeFinalSoftLaunchRisk[];
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  generatedAt: string;
  updatedAt: string;
};

export type TeoyubeFinalSoftLaunchReadinessReport = {
  valid: boolean;
  status: TeoyubeFinalSoftLaunchReadinessStatus;
  ready: boolean;
  decision: TeoyubeFinalSoftLaunchGoNoGoDecision;
  checkCount: number;
  completedCheckCount: number;
  blockerCount: number;
  warningCount: number;
  checks: TeoyubeFinalSoftLaunchReadinessCheck[];
  blockers: TeoyubeFinalSoftLaunchReadinessBlocker[];
  warnings: TeoyubeFinalSoftLaunchReadinessWarning[];
  noLaunchPerformed: true;
  noUsersContacted: true;
  noRealFeedbackCollected: true;
  noPreviewUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeFinalSoftLaunchReadinessPackage = {
  id: string;
  label: string;
  status: TeoyubeFinalSoftLaunchReadinessStatus;
  decisionRecommendation: TeoyubeFinalSoftLaunchGoNoGoDecision;
  readinessEvidence: Record<string, unknown>;
  knownLimitations: TeoyubeFinalSoftLaunchKnownLimitation[];
  riskRegister: TeoyubeFinalSoftLaunchRiskRegister;
  blockers: TeoyubeFinalSoftLaunchReadinessBlocker[];
  warnings: TeoyubeFinalSoftLaunchReadinessWarning[];
  finalDecisionGuidance: string;
  inMemoryOnly: true;
  sentExternally: false;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  launchPerformed: false;
  usersContacted: false;
  realFeedbackCollected: false;
  previewUrlFetched: false;
  generatedAt: string;
};
