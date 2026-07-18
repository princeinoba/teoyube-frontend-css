export type TeoyubeReleaseCandidateFixQueueStatus =
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

export type TeoyubeReleaseCandidateFixCategory =
  | "public_copy"
  | "privacy_consent"
  | "sensitive_data_warning"
  | "known_limitations"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "support_readiness"
  | "feedback_readiness"
  | "issue_triage"
  | "manual_monitoring"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "mobile"
  | "accessibility"
  | "performance_manual"
  | "documentation"
  | "unknown";

export type TeoyubeReleaseCandidateFixPriority =
  | "public_release_blocker"
  | "high"
  | "medium"
  | "low"
  | "defer"
  | "unknown";

export type TeoyubeReleaseCandidateFixRiskLevel =
  | "safe_local"
  | "owner_review"
  | "blocked"
  | "defer"
  | "unknown";

export type TeoyubeReleaseCandidateFixQueueItemSource =
  | "phase_9_2_qa"
  | "public_issue_triage"
  | "manual_monitoring"
  | "support_readiness"
  | "feedback_readiness"
  | "readiness_score"
  | "owner_review"
  | "documentation"
  | "unknown";

export type TeoyubeReleaseCandidateFixVerificationRequirement = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeReleaseCandidateFixQueueItem = {
  id: string;
  title: string;
  category: TeoyubeReleaseCandidateFixCategory;
  priority: TeoyubeReleaseCandidateFixPriority;
  status: TeoyubeReleaseCandidateFixQueueStatus;
  riskLevel: TeoyubeReleaseCandidateFixRiskLevel;
  source: TeoyubeReleaseCandidateFixQueueItemSource;
  details: string;
  safeLocalFixAllowed: boolean;
  ownerReviewRequired: boolean;
  verificationRequirements: TeoyubeReleaseCandidateFixVerificationRequirement[];
  createdAt: string;
};

export type TeoyubeReleaseCandidateFixQueue = {
  id: string;
  items: TeoyubeReleaseCandidateFixQueueItem[];
  manualOnly: true;
  noExternalWrite: true;
  noDatabasePersistence: true;
  noAnalytics: true;
  noExternalServices: true;
  noUserContact: true;
  noPublishing: true;
  noProductionJsonWrite: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeReleaseCandidateFixDecision =
  | "fix_queue_ready"
  | "fix_queue_ready_with_warnings"
  | "fix_queue_has_blockers"
  | "fix_queue_blocked"
  | "unknown";

export type TeoyubeReleaseCandidateFixQueueBlocker = {
  id: string;
  itemId?: string;
  category: TeoyubeReleaseCandidateFixCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeReleaseCandidateFixQueueWarning = {
  id: string;
  itemId?: string;
  category: TeoyubeReleaseCandidateFixCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeReleaseCandidateFixQueueReport = {
  valid: boolean;
  decision: TeoyubeReleaseCandidateFixDecision;
  queue: TeoyubeReleaseCandidateFixQueue;
  blockers: TeoyubeReleaseCandidateFixQueueBlocker[];
  warnings: TeoyubeReleaseCandidateFixQueueWarning[];
  summary: {
    totalItems: number;
    blockingItems: number;
    safeLocalItems: number;
    ownerReviewItems: number;
    blockedItems: number;
    deferredItems: number;
    verifiedItems: number;
  };
  manualOnly: true;
  noExternalWrite: true;
  noExternalServices: true;
  inMemoryOnly: true;
  generatedAt: string;
};
