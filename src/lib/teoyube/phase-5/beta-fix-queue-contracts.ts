export type TeoyubeBetaFixQueueStatus =
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

export type TeoyubeBetaFixQueueItemSource =
  | "phase_5_2_issue_triage"
  | "phase_5_2_readiness_score"
  | "phase_5_2_qa_warning"
  | "manual_owner_review"
  | "regression_qa"
  | "documentation"
  | "unknown";

export type TeoyubeBetaFixQueueCategory =
  | "real_data"
  | "user_journey"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "controlled_admin"
  | "disabled_service"
  | "privacy_consent"
  | "mobile"
  | "accessibility"
  | "promise_table"
  | "tig_graph_explorer"
  | "tig_response_panel"
  | "word_card"
  | "prayer_companion"
  | "compass_experience"
  | "documentation"
  | "unknown";

export type TeoyubeBetaFixQueuePriority =
  | "beta_blocker"
  | "high"
  | "medium"
  | "low"
  | "defer"
  | "unknown";

export type TeoyubeBetaFixQueueRiskLevel = "low" | "medium" | "high" | "blocked" | "unknown";

export type TeoyubeBetaFixQueueDecision =
  | "ready_for_remediation"
  | "ready_with_warnings"
  | "owner_review_required"
  | "blocked"
  | "empty"
  | "unknown";

export type TeoyubeBetaFixVerificationRequirement = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeBetaFixQueueItem = {
  id: string;
  title: string;
  description: string;
  source: TeoyubeBetaFixQueueItemSource;
  sourceId?: string;
  category: TeoyubeBetaFixQueueCategory;
  priority: TeoyubeBetaFixQueuePriority;
  riskLevel: TeoyubeBetaFixQueueRiskLevel;
  status: TeoyubeBetaFixQueueStatus;
  safeLocalFixAllowed: boolean;
  ownerReviewRequired: boolean;
  blockedReason?: string;
  deferredReason?: string;
  proposedFix: string;
  verificationRequirements: TeoyubeBetaFixVerificationRequirement[];
  noProductionDataWrite: true;
  noServiceConnection: true;
  noUserContact: true;
  noAutomaticPublishing: true;
  createdAt: string;
  updatedAt?: string;
};

export type TeoyubeBetaFixQueue = {
  id: string;
  status: TeoyubeBetaFixQueueStatus;
  items: TeoyubeBetaFixQueueItem[];
  manualOnly: true;
  inMemoryOnly: true;
  noFilesWritten: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  noUsersContacted: true;
  noAutomaticPublishing: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeBetaFixQueueBlocker = {
  id: string;
  itemId?: string;
  category: TeoyubeBetaFixQueueCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaFixQueueWarning = {
  id: string;
  itemId?: string;
  category: TeoyubeBetaFixQueueCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaFixQueueReport = {
  valid: boolean;
  decision: TeoyubeBetaFixQueueDecision;
  queue: TeoyubeBetaFixQueue;
  blockers: TeoyubeBetaFixQueueBlocker[];
  warnings: TeoyubeBetaFixQueueWarning[];
  itemCount: number;
  betaBlockerCount: number;
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
  noAutomaticPublishing: true;
  generatedAt: string;
};
