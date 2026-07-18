export type TeoyubePublicFeedbackTriageStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "unknown";

export type TeoyubePublicFeedbackTriageCategory =
  | "privacy"
  | "terms"
  | "consent"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "confidence"
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
  | "public_copy"
  | "positive_feedback"
  | "feature_request"
  | "unknown";

export type TeoyubePublicFeedbackTriageSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubePublicFeedbackTriageSource =
  | "manual_feedback"
  | "public_feedback"
  | "monitoring"
  | "surface_health"
  | "daily_review"
  | "owner_review"
  | "support_note"
  | "unknown";

export type TeoyubePublicFeedbackTriageDecision =
  | "continue_public_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "prepare_rollback"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicFixQueuePriority =
  | "public_launch_blocker"
  | "high"
  | "medium"
  | "low"
  | "defer"
  | "unknown";

export type TeoyubePublicDailyReviewDecision =
  | "continue_public_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "prepare_rollback"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicFeedbackTriageItem = {
  id: string;
  source: TeoyubePublicFeedbackTriageSource;
  surface: string;
  category: TeoyubePublicFeedbackTriageCategory;
  summary: string;
  redactedNotes: string[];
  severity: TeoyubePublicFeedbackTriageSeverity;
  publicLaunchCritical: boolean;
  publicSafetyCritical: boolean;
  manuallyEntered: true;
  rawSensitiveTextStored: false;
  analyticsSent: false;
  databaseWritten: false;
  externalServicesCalled: false;
  hiddenPersonalizationCreated: false;
  liveAiOrchestrationEnabled: false;
  publicUrlFetched: false;
  usersContacted: false;
  legalApprovalClaimedWithoutRecord: false;
  generatedAt: string;
};

export type TeoyubePublicFeedbackTriageResult = {
  item: TeoyubePublicFeedbackTriageItem;
  category: TeoyubePublicFeedbackTriageCategory;
  severity: TeoyubePublicFeedbackTriageSeverity;
  publicLaunchCritical: boolean;
  publicSafetyCritical: boolean;
  recommendedAction: string;
};

export type TeoyubePublicFeedbackTriageBlocker = {
  id: string;
  label: string;
  category: TeoyubePublicFeedbackTriageCategory;
  severity: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicFeedbackTriageWarning = {
  id: string;
  label: string;
  category: TeoyubePublicFeedbackTriageCategory;
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicFixQueueItem = {
  id: string;
  sourceFeedbackId?: string;
  title: string;
  category: TeoyubePublicFeedbackTriageCategory;
  severity: TeoyubePublicFeedbackTriageSeverity;
  priority: TeoyubePublicFixQueuePriority;
  publicLaunchCritical: boolean;
  publicSafetyCritical: boolean;
  proposedFix: string;
  verificationRequired: string[];
  status: "new" | "queued" | "planned" | "in_progress" | "fixed" | "verified" | "deferred" | "blocked" | "unknown";
  manualOnly: true;
};

export type TeoyubePublicFeedbackTriageReport = {
  status: TeoyubePublicFeedbackTriageStatus;
  ready: boolean;
  decision: TeoyubePublicFeedbackTriageDecision;
  itemCount: number;
  publicLaunchCriticalCount: number;
  publicSafetyCriticalCount: number;
  results: TeoyubePublicFeedbackTriageResult[];
  blockers: TeoyubePublicFeedbackTriageBlocker[];
  warnings: TeoyubePublicFeedbackTriageWarning[];
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noAnalyticsSent: true;
  noDatabaseWrites: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};
