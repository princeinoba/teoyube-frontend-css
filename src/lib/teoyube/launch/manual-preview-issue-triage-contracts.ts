export type TeoyubeManualPreviewIssueCategory =
  | "build"
  | "environment"
  | "route"
  | "mobile_ui"
  | "accessibility"
  | "tig_response"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "confidence"
  | "consent"
  | "feedback_controls"
  | "personalization"
  | "offline"
  | "privacy"
  | "debug_safety"
  | "security"
  | "content_clarity"
  | "performance"
  | "unknown";

export type TeoyubeManualPreviewIssueSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeManualPreviewIssueStatus =
  | "new"
  | "triaged"
  | "planned"
  | "in_progress"
  | "fixed"
  | "verified"
  | "deferred"
  | "blocked"
  | "wont_fix"
  | "unknown";

export type TeoyubeManualPreviewIssueSource =
  | "postdeployment_qa"
  | "surface_checklist"
  | "scripture_explanation_verification"
  | "consent_privacy_verification"
  | "mobile_accessibility_verification"
  | "fallback_offline_verification"
  | "launch_quality_gate"
  | "manual_owner_review"
  | "smoke_check"
  | "unknown";

export type TeoyubeManualPreviewIssueResolutionDecision =
  | "ready_for_safe_fix_implementation"
  | "ready_after_owner_review"
  | "blocked_by_unresolved_issue"
  | "defer_to_later"
  | "wont_fix"
  | "unknown";

export type TeoyubeManualPreviewIssue = {
  id: string;
  title: string;
  details: string;
  category?: TeoyubeManualPreviewIssueCategory;
  severity?: TeoyubeManualPreviewIssueSeverity;
  status?: TeoyubeManualPreviewIssueStatus;
  source?: TeoyubeManualPreviewIssueSource;
  surface?: string;
  route?: string;
  evidence?: string[];
  recommendedAction?: string;
  scriptureBasis?: string;
  launchCritical?: boolean;
  safetyCritical?: boolean;
  softLaunchBlocking?: boolean;
  deferrable?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TeoyubeManualPreviewIssueTriageResult = {
  issueId: string;
  issue: TeoyubeManualPreviewIssue;
  normalizedIssue: TeoyubeManualPreviewIssue;
  category: TeoyubeManualPreviewIssueCategory;
  severity: TeoyubeManualPreviewIssueSeverity;
  launchCritical: boolean;
  safetyCritical: boolean;
  softLaunchBlocking: boolean;
  deferrable: boolean;
  priority: number;
  reasons: string[];
  recommendedAction: string;
};

export type TeoyubeManualPreviewIssueRegressionCheck = {
  id: string;
  label: string;
  category: TeoyubeManualPreviewIssueCategory;
  required: boolean;
  launchCritical: boolean;
  verificationModule: string;
  details: string;
};

export type TeoyubeManualPreviewIssueFixStep = {
  id: string;
  label: string;
  details: string;
  required: boolean;
  owner: "developer" | "owner" | "qa" | "manual_reviewer";
  status: "planned" | "complete" | "blocked";
};

export type TeoyubeManualPreviewIssueFixPlan = {
  id: string;
  issueId: string;
  issueCategory: TeoyubeManualPreviewIssueCategory;
  severity: TeoyubeManualPreviewIssueSeverity;
  affectedSurface?: string;
  recommendedFixSummary: string;
  safeImplementationNotes: string[];
  steps: TeoyubeManualPreviewIssueFixStep[];
  riskLevel: Exclude<TeoyubeManualPreviewIssueSeverity, "unknown">;
  regressionChecks: TeoyubeManualPreviewIssueRegressionCheck[];
  ownerReviewRequired: boolean;
  launchImpact: "none" | "low" | "medium" | "high" | "critical";
  softLaunchBlocker: boolean;
  status: "draft" | "ready_for_owner_review" | "ready_for_safe_fix" | "blocked";
  createdAt: string;
};

export type TeoyubeManualPreviewIssueTriageReport = {
  valid: boolean;
  issueCount: number;
  criticalCount: number;
  blockerCount: number;
  warningCount: number;
  deferrableCount: number;
  triagedIssues: TeoyubeManualPreviewIssueTriageResult[];
  groupedByCategory: Record<string, TeoyubeManualPreviewIssueTriageResult[]>;
  groupedBySurface: Record<string, TeoyubeManualPreviewIssueTriageResult[]>;
  blockers: TeoyubeManualPreviewIssueTriageResult[];
  warnings: TeoyubeManualPreviewIssueTriageResult[];
  safetyCriticalIssues: TeoyubeManualPreviewIssueTriageResult[];
  softLaunchBlockers: TeoyubeManualPreviewIssueTriageResult[];
  deferrableIssues: TeoyubeManualPreviewIssueTriageResult[];
  priorityOrder: TeoyubeManualPreviewIssueTriageResult[];
  noExternalWrite: true;
  noPreviewUrlFetched: true;
  generatedAt: string;
};

export type TeoyubeManualPreviewIssueOwnerReview = {
  id: string;
  reviewerName?: string;
  criticalBlockersReviewed: boolean;
  scriptureAnchorIssuesReviewed: boolean;
  explanationPathIssuesReviewed: boolean;
  fallbackSafetyIssuesReviewed: boolean;
  consentPrivacyIssuesReviewed: boolean;
  mobileAccessibilityIssuesReviewed: boolean;
  fixPrioritiesAccepted: boolean;
  deferredIssuesAccepted: boolean;
  softLaunchBlockerListAccepted: boolean;
  nextFixStepApproved: boolean;
  notes?: string;
  createdAt: string;
};
