import type { TeoyubePreviewDeploymentIssue } from "./preview-deployment-execution-contracts";

export type TeoyubePreviewDeploymentReviewStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "needs_review"
  | "not_reviewed"
  | "unknown";

export type TeoyubeSoftLaunchGoNoGoStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubePreviewDeploymentReviewDecision =
  | "ready_for_soft_launch_review"
  | "ready_after_manual_review"
  | "blocked"
  | "needs_preview_fix"
  | "needs_safety_fix"
  | "needs_qa_fix"
  | "unknown";

export type TeoyubeSoftLaunchGoNoGoDecision =
  | "go_for_soft_launch_candidate"
  | "go_after_manual_review"
  | "no_go_blocked"
  | "needs_preview_fix"
  | "needs_qa_fix"
  | "needs_safety_fix"
  | "unknown";

export type TeoyubePreviewDeploymentReviewInput = {
  deploymentOccurred?: boolean;
  previewUrlCaptured?: boolean;
  previewEnvironmentDocumented?: boolean;
  deploymentTargetDocumented?: boolean;
  buildVerificationDocumented?: boolean;
  postCheckDocumented?: boolean;
  issueLogReviewed?: boolean;
  rollbackPlanAvailable?: boolean;
  scriptureAnchorsVisible?: boolean;
  explanationPathsVisible?: boolean;
  fallbackBehaviorSafe?: boolean;
  confidenceLabelsVisible?: boolean;
  consentControlsAvailable?: boolean;
  feedbackControlsAvailable?: boolean;
  mobileLayoutUsable?: boolean;
  accessibilityBasicsReviewed?: boolean;
  debugUiHidden?: boolean;
  externalAnalyticsNotSending?: boolean;
  productionPersistenceDisabled?: boolean;
  liveAiDisabled?: boolean;
  rawTextStorageDisabled?: boolean;
  offlineFallbackSafe?: boolean;
};

export type TeoyubePreviewDeploymentReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  status: TeoyubePreviewDeploymentReviewStatus;
  passed: boolean;
  details: string;
  safetyCritical?: boolean;
};

export type TeoyubePreviewDeploymentReviewFinding = {
  id: string;
  status: TeoyubePreviewDeploymentReviewStatus;
  message: string;
  recommendedAction: string;
};

export type TeoyubePreviewDeploymentReviewRisk = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  label: string;
  mitigation: string;
};

export type TeoyubePreviewDeploymentReviewResult = {
  valid: boolean;
  decision: TeoyubePreviewDeploymentReviewDecision;
  checklist: TeoyubePreviewDeploymentReviewChecklistItem[];
  findings: TeoyubePreviewDeploymentReviewFinding[];
  risks: TeoyubePreviewDeploymentReviewRisk[];
};

export type TeoyubePreviewDeploymentReviewReport = TeoyubePreviewDeploymentReviewResult & {
  status: TeoyubePreviewDeploymentReviewStatus;
  checklistCount: number;
  passedChecklistCount: number;
  blockerCount: number;
  warningCount: number;
  generatedAt: string;
};

export type TeoyubeSoftLaunchBlocker = {
  id: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubeSoftLaunchWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeSoftLaunchManualApproval = {
  id: string;
  approved: boolean;
  approvedBy?: string;
  checklistItemIds: string[];
  notes: string[];
  createdAt: string;
};

export type TeoyubeSoftLaunchGoNoGoReport = {
  status: TeoyubeSoftLaunchGoNoGoStatus;
  decision: TeoyubeSoftLaunchGoNoGoDecision;
  ready: boolean;
  blockers: TeoyubeSoftLaunchBlocker[];
  warnings: TeoyubeSoftLaunchWarning[];
  reasons: string[];
  nextActions: string[];
  relatedIssues: TeoyubePreviewDeploymentIssue[];
  manualApproval?: TeoyubeSoftLaunchManualApproval;
  actualSoftLaunchPerformed: false;
  generatedAt: string;
};

