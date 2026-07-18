export type TeoyubeDryRunFixQueueStatus =
  | "new"
  | "queued"
  | "planned"
  | "safe_to_fix"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "fixed"
  | "verified"
  | "unknown";

export type TeoyubeDryRunFixQueueItemSource =
  | "phase_6_2_dry_run_issue"
  | "phase_6_2_simulated_feedback"
  | "phase_6_2_readiness_score"
  | "phase_6_2_warning"
  | "owner_observation"
  | "operations_readiness"
  | "regression_qa"
  | "documentation"
  | "unknown";

export type TeoyubeDryRunFixQueueCategory =
  | "participant_workflow"
  | "communication_boundary"
  | "feedback_boundary"
  | "issue_intake"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "reviewed_content_gate"
  | "controlled_admin"
  | "mobile"
  | "accessibility"
  | "promise_table"
  | "tig_graph_explorer"
  | "tig_response_panel"
  | "word_card"
  | "prayer_companion"
  | "compass_experience"
  | "operations_checklist"
  | "documentation"
  | "unknown";

export type TeoyubeDryRunFixQueuePriority =
  | "dry_run_blocker"
  | "high"
  | "medium"
  | "low"
  | "defer"
  | "unknown";

export type TeoyubeDryRunFixQueueRiskLevel = "low" | "medium" | "high" | "blocked" | "unknown";

export type TeoyubeDryRunFixQueueDecision =
  | "ready_for_stabilization"
  | "ready_with_warnings"
  | "owner_review_required"
  | "blocked"
  | "empty"
  | "unknown";

export type TeoyubeDryRunFixVerificationRequirement = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeDryRunFixQueueItem = {
  id: string;
  title: string;
  description: string;
  source: TeoyubeDryRunFixQueueItemSource;
  sourceId?: string;
  category: TeoyubeDryRunFixQueueCategory;
  priority: TeoyubeDryRunFixQueuePriority;
  riskLevel: TeoyubeDryRunFixQueueRiskLevel;
  status: TeoyubeDryRunFixQueueStatus;
  safeLocalFixAllowed: boolean;
  ownerReviewRequired: boolean;
  blockedReason?: string;
  deferredReason?: string;
  proposedFix: string;
  verificationRequirements: TeoyubeDryRunFixVerificationRequirement[];
  noProductionDataWrite: true;
  noServiceConnection: true;
  noUserContact: true;
  noAutomaticPublishing: true;
  noFeedbackCollection: true;
  createdAt: string;
  updatedAt?: string;
};

export type TeoyubeDryRunFixQueue = {
  id: string;
  status: TeoyubeDryRunFixQueueStatus;
  items: TeoyubeDryRunFixQueueItem[];
  manualOnly: true;
  inMemoryOnly: true;
  noFilesWritten: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAutomaticPublishing: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeDryRunFixQueueBlocker = {
  id: string;
  itemId?: string;
  category: TeoyubeDryRunFixQueueCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeDryRunFixQueueWarning = {
  id: string;
  itemId?: string;
  category: TeoyubeDryRunFixQueueCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeDryRunFixQueueReport = {
  valid: boolean;
  decision: TeoyubeDryRunFixQueueDecision;
  queue: TeoyubeDryRunFixQueue;
  blockers: TeoyubeDryRunFixQueueBlocker[];
  warnings: TeoyubeDryRunFixQueueWarning[];
  itemCount: number;
  dryRunBlockerCount: number;
  ownerReviewRequiredCount: number;
  deferredCount: number;
  safeToFixCount: number;
  manualOnly: true;
  inMemoryOnly: true;
  noFilesWritten: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAutomaticPublishing: true;
  generatedAt: string;
};
