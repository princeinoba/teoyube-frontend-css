export type TeoyubePublicLaunchQaSurface =
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
  | "privacy_terms"
  | "sensitive_information_warnings"
  | "error_fallback_states"
  | "mobile_navigation"
  | "offline_fallback"
  | "all"
  | "unknown";

export type TeoyubePublicLaunchQaDecision =
  | "ready_for_public_qa"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_privacy_copy_review"
  | "needs_accessibility_review"
  | "needs_safety_review"
  | "unknown";

export type TeoyubePublicLaunchQaStatus = "pass" | "warning" | "fail" | "blocked" | "needs_review" | "not_tested" | "unknown";

export type TeoyubePublicLaunchQaCheck = {
  id: string;
  surface: TeoyubePublicLaunchQaSurface;
  label: string;
  category: "surface" | "privacy" | "consent" | "accessibility" | "safety" | "mobile" | "copy" | "fallback";
  required: boolean;
  launchCritical: boolean;
  expectedResult: string;
};

export type TeoyubePublicLaunchQaResult = {
  checkId: string;
  surface: TeoyubePublicLaunchQaSurface;
  status: TeoyubePublicLaunchQaStatus;
  notes?: string;
  testedAt?: string;
};

export type TeoyubePublicLaunchQaRun = {
  id: string;
  label: string;
  checklist: TeoyubePublicLaunchQaCheck[];
  results: TeoyubePublicLaunchQaResult[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  createdAt: string;
};

export type TeoyubePublicLaunchQaBlocker = {
  id: string;
  surface: TeoyubePublicLaunchQaSurface;
  label: string;
  reason: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubePublicLaunchQaWarning = {
  id: string;
  surface: TeoyubePublicLaunchQaSurface;
  label: string;
  message: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

export type TeoyubePublicLaunchQaReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicLaunchQaDecision;
  run: TeoyubePublicLaunchQaRun;
  resultCount: number;
  passedCount: number;
  warningCount: number;
  blockerCount: number;
  blockers: TeoyubePublicLaunchQaBlocker[];
  warnings: TeoyubePublicLaunchQaWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  generatedAt: string;
};
