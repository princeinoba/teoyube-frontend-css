export type TeoyubeSoftLaunchFeedbackTriageStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackTriageCategory =
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "confidence"
  | "consent"
  | "privacy"
  | "mobile_ui"
  | "accessibility"
  | "content_clarity"
  | "prayer_sequence"
  | "promise_cluster"
  | "ai_companion"
  | "personalization_preview"
  | "offline_fallback"
  | "debug_safety"
  | "performance"
  | "positive_feedback"
  | "feature_request"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackTriageSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackTriageSource =
  | "manual_feedback"
  | "monitoring"
  | "surface_health"
  | "daily_review"
  | "owner_review"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackTriageDecision =
  | "continue_soft_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "prepare_rollback"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeSoftLaunchFixQueuePriority =
  | "launch_blocker"
  | "high"
  | "medium"
  | "low"
  | "defer"
  | "unknown";

export type TeoyubeSoftLaunchDailyReviewDecision =
  | "continue_soft_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "prepare_rollback"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackTriageItem = {
  id: string;
  source: TeoyubeSoftLaunchFeedbackTriageSource;
  surface: string;
  category: TeoyubeSoftLaunchFeedbackTriageCategory;
  summary: string;
  redactedNotes: string[];
  severity: TeoyubeSoftLaunchFeedbackTriageSeverity;
  launchCritical: boolean;
  safetyCritical: boolean;
  manuallyEntered: true;
  rawSensitiveTextStored: false;
  analyticsSent: false;
  databaseWritten: false;
  externalServicesCalled: false;
  hiddenPersonalizationCreated: false;
  generatedAt: string;
};

export type TeoyubeSoftLaunchFeedbackTriageResult = {
  item: TeoyubeSoftLaunchFeedbackTriageItem;
  category: TeoyubeSoftLaunchFeedbackTriageCategory;
  severity: TeoyubeSoftLaunchFeedbackTriageSeverity;
  launchCritical: boolean;
  safetyCritical: boolean;
  recommendedAction: string;
};

export type TeoyubeSoftLaunchFeedbackTriageBlocker = {
  id: string;
  label: string;
  category: TeoyubeSoftLaunchFeedbackTriageCategory;
  severity: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeSoftLaunchFeedbackTriageWarning = {
  id: string;
  label: string;
  category: TeoyubeSoftLaunchFeedbackTriageCategory;
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubeSoftLaunchFixQueueItem = {
  id: string;
  sourceFeedbackId?: string;
  title: string;
  category: TeoyubeSoftLaunchFeedbackTriageCategory;
  severity: TeoyubeSoftLaunchFeedbackTriageSeverity;
  priority: TeoyubeSoftLaunchFixQueuePriority;
  launchCritical: boolean;
  safetyCritical: boolean;
  proposedFix: string;
  verificationRequired: string[];
  status: "new" | "queued" | "planned" | "in_progress" | "fixed" | "verified" | "deferred" | "blocked" | "unknown";
  manualOnly: true;
};

export type TeoyubeSoftLaunchFeedbackTriageReport = {
  status: TeoyubeSoftLaunchFeedbackTriageStatus;
  ready: boolean;
  decision: TeoyubeSoftLaunchFeedbackTriageDecision;
  itemCount: number;
  launchCriticalCount: number;
  safetyCriticalCount: number;
  results: TeoyubeSoftLaunchFeedbackTriageResult[];
  blockers: TeoyubeSoftLaunchFeedbackTriageBlocker[];
  warnings: TeoyubeSoftLaunchFeedbackTriageWarning[];
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  generatedAt: string;
};
