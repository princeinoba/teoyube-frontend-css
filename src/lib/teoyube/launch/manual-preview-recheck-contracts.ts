import type { TeoyubePostDeploymentQaSurface } from "./manual-preview-postdeployment-qa-contracts";

export type TeoyubeManualPreviewRecheckStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "not_run"
  | "not_applicable"
  | "unknown";

export type TeoyubeManualPreviewRecheckScope =
  | "issue_resolution"
  | "safe_fix"
  | "regression"
  | "scripture_explanation"
  | "fallback_offline"
  | "consent_privacy"
  | "mobile_accessibility"
  | "surface_qa"
  | "soft_launch_readiness"
  | "provider_boundary"
  | "unknown";

export type TeoyubeManualPreviewRecheckDecision =
  | "ready_for_soft_launch_candidate_confirmation"
  | "ready_after_manual_review"
  | "blocked_by_regression"
  | "blocked_by_unresolved_issue"
  | "needs_more_testing"
  | "unknown";

export type TeoyubeSoftLaunchCandidateConfirmationStatus =
  | "confirmed"
  | "confirmed_with_manual_review"
  | "not_confirmed"
  | "needs_review"
  | "blocked"
  | "unknown";

export type TeoyubeSoftLaunchCandidateConfirmationDecision =
  | "confirmed_soft_launch_candidate"
  | "confirmed_after_owner_review"
  | "not_confirmed_blocked"
  | "needs_preview_recheck"
  | "needs_safety_review"
  | "needs_qa_review"
  | "unknown";

export type TeoyubeManualPreviewRecheckItem = {
  id: string;
  label: string;
  scope: TeoyubeManualPreviewRecheckScope;
  surface?: TeoyubePostDeploymentQaSurface;
  required: boolean;
  launchCritical: boolean;
  details: string;
};

export type TeoyubeManualPreviewRecheckResult = {
  id: string;
  itemId: string;
  status: TeoyubeManualPreviewRecheckStatus;
  scope: TeoyubeManualPreviewRecheckScope;
  surface?: TeoyubePostDeploymentQaSurface;
  summary: string;
  required: boolean;
  launchCritical: boolean;
  ownerReviewed?: boolean;
  checkedAt: string;
};

export type TeoyubeManualPreviewRecheckRun = {
  id: string;
  label: string;
  items: TeoyubeManualPreviewRecheckItem[];
  results: TeoyubeManualPreviewRecheckResult[];
  inMemoryOnly: true;
  databaseWritten: false;
  analyticsSent: false;
  filesWritten: false;
  externalServicesCalled: false;
  previewUrlFetched: false;
  softLaunchPerformed: false;
  usersContacted: false;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeManualPreviewRecheckBlocker = {
  id: string;
  itemId?: string;
  scope?: TeoyubeManualPreviewRecheckScope;
  surface?: TeoyubePostDeploymentQaSurface;
  message: string;
  requiredAction: string;
  severity: "high" | "critical";
};

export type TeoyubeManualPreviewRecheckWarning = {
  id: string;
  itemId?: string;
  scope?: TeoyubeManualPreviewRecheckScope;
  surface?: TeoyubePostDeploymentQaSurface;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualPreviewRecheckReport = {
  valid: boolean;
  decision: TeoyubeManualPreviewRecheckDecision;
  run: TeoyubeManualPreviewRecheckRun;
  itemCount: number;
  resultCount: number;
  passCount: number;
  warningCount: number;
  failCount: number;
  blockerCount: number;
  notRunCount: number;
  blockers: TeoyubeManualPreviewRecheckBlocker[];
  warnings: TeoyubeManualPreviewRecheckWarning[];
  noExternalWrite: true;
  noPreviewUrlFetched: true;
  noSoftLaunchPerformed: true;
  generatedAt: string;
};

export type TeoyubeSoftLaunchCandidateConfirmationReport = {
  status: TeoyubeSoftLaunchCandidateConfirmationStatus;
  decision: TeoyubeSoftLaunchCandidateConfirmationDecision;
  ready: boolean;
  blockerCount: number;
  warningCount: number;
  blockers: string[];
  warnings: string[];
  noSoftLaunchPerformed: true;
  noUsersContacted: true;
  noExternalWrite: true;
  generatedAt: string;
};
