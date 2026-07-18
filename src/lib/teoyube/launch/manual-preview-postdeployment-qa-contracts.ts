import type { TeoyubeManualPreviewUrlRecord } from "./manual-preview-url-verification-contracts";

export type TeoyubePostDeploymentQaStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "not_tested"
  | "not_applicable"
  | "unknown";

export type TeoyubePostDeploymentQaSurface =
  | "canon"
  | "daily_word"
  | "prayer"
  | "calling_compass"
  | "promise_cluster"
  | "ai_companion"
  | "onboarding"
  | "tig_response_panel"
  | "tig_graph_preview"
  | "personalization_preview_panel"
  | "consent_controls"
  | "feedback_controls"
  | "offline_fallback"
  | "mobile_navigation"
  | "error_fallback_states";

export type TeoyubePostDeploymentQaDecision =
  | "ready_for_preview_review"
  | "ready_after_manual_review"
  | "blocked_by_critical_issue"
  | "needs_mobile_fix"
  | "needs_accessibility_fix"
  | "needs_safety_fix"
  | "unknown";

export type TeoyubePostDeploymentQaCheck = {
  id: string;
  surface: TeoyubePostDeploymentQaSurface;
  label: string;
  required: boolean;
  category:
    | "load"
    | "mobile"
    | "desktop"
    | "scripture"
    | "explanation"
    | "fallback"
    | "confidence"
    | "consent"
    | "feedback"
    | "debug"
    | "privacy"
    | "accessibility"
    | "provider";
  details: string;
  launchCritical: boolean;
};

export type TeoyubePostDeploymentQaResult = {
  id: string;
  surface: TeoyubePostDeploymentQaSurface;
  checkId: string;
  status: TeoyubePostDeploymentQaStatus;
  notes?: string;
  notesRedacted: boolean;
  blocker: boolean;
  warning: boolean;
  mobileResult?: TeoyubePostDeploymentQaStatus;
  accessibilityResult?: TeoyubePostDeploymentQaStatus;
  scriptureAnchorResult?: TeoyubePostDeploymentQaStatus;
  explanationPathResult?: TeoyubePostDeploymentQaStatus;
  fallbackResult?: TeoyubePostDeploymentQaStatus;
  confidenceLabelResult?: TeoyubePostDeploymentQaStatus;
  consentResult?: TeoyubePostDeploymentQaStatus;
  debugSafetyResult?: TeoyubePostDeploymentQaStatus;
  privacyResult?: TeoyubePostDeploymentQaStatus;
  checkedAt: string;
};

export type TeoyubePostDeploymentQaRun = {
  id: string;
  label: string;
  previewUrlRecord?: TeoyubeManualPreviewUrlRecord;
  surfaces: TeoyubePostDeploymentQaSurface[];
  checks: TeoyubePostDeploymentQaCheck[];
  results: TeoyubePostDeploymentQaResult[];
  inMemoryOnly: true;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  filesWritten: false;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubePostDeploymentQaBlocker = {
  id: string;
  surface: TeoyubePostDeploymentQaSurface;
  checkId: string;
  reason: string;
  requiredAction: string;
  severity: "high" | "critical";
};

export type TeoyubePostDeploymentQaWarning = {
  id: string;
  surface?: TeoyubePostDeploymentQaSurface;
  checkId?: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubePostDeploymentQaReport = {
  status: TeoyubePostDeploymentQaStatus;
  decision: TeoyubePostDeploymentQaDecision;
  ready: boolean;
  run: TeoyubePostDeploymentQaRun;
  surfaceCount: number;
  checkCount: number;
  resultCount: number;
  passCount: number;
  warningCount: number;
  failCount: number;
  blockerCount: number;
  blockers: TeoyubePostDeploymentQaBlocker[];
  warnings: TeoyubePostDeploymentQaWarning[];
  noUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};
