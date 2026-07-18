export type TeoyubeContentReviewQueueStatus =
  | "empty"
  | "needs_review"
  | "ready_for_owner_review"
  | "blocked"
  | "complete"
  | "unknown";

export type TeoyubeContentReviewQueueItemType =
  | "teoyube_word"
  | "promise_cluster"
  | "scripture_anchor"
  | "prayer_prompt"
  | "calling_path"
  | "action_step"
  | "tig_relationship"
  | "word_card_copy"
  | "promise_table_copy"
  | "prayer_companion_copy"
  | "calling_compass_copy"
  | "tig_response_copy"
  | "fallback_copy"
  | "surface_ux"
  | "unknown";

export type TeoyubeContentReviewQueuePriority = "critical" | "high" | "medium" | "low";

export type TeoyubeContentReviewQueueReviewState =
  | "draft_needed"
  | "draft_created"
  | "scripture_review_required"
  | "theology_review_required"
  | "copy_review_required"
  | "owner_review_required"
  | "approved_for_future_release"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubeContentReviewQueueDecision =
  | "queue_ready_for_review"
  | "queue_ready_with_warnings"
  | "needs_owner_review"
  | "blocked"
  | "empty";

export type TeoyubeContentReviewRequirement = {
  id: string;
  label: string;
  reviewState: TeoyubeContentReviewQueueReviewState;
  required: boolean;
  complete: boolean;
  description: string;
};

export type TeoyubeContentReviewNote = {
  id: string;
  authorRole: "system" | "owner" | "reviewer" | "unknown";
  message: string;
  createdAt: string;
};

export type TeoyubeContentReviewQueueItem = {
  id: string;
  type: TeoyubeContentReviewQueueItemType;
  title: string;
  priority: TeoyubeContentReviewQueuePriority;
  reviewState: TeoyubeContentReviewQueueReviewState;
  sourceIds: string[];
  sourceSurface?: string;
  contentArea?: string;
  summary: string;
  reviewRequirements: TeoyubeContentReviewRequirement[];
  notes: TeoyubeContentReviewNote[];
  reviewOnly: true;
  productionExcluded: true;
  productionEligible: false;
  excludedFromLiveRecommendations: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt?: string;
};

export type TeoyubeContentReviewQueue = {
  id: string;
  status: TeoyubeContentReviewQueueStatus;
  items: TeoyubeContentReviewQueueItem[];
  reviewOnly: true;
  productionExcluded: true;
  excludedFromLiveRecommendations: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt?: string;
};

export type TeoyubeContentReviewQueueBlocker = {
  id: string;
  itemId?: string;
  type: TeoyubeContentReviewQueueItemType | "queue";
  message: string;
  requiredAction: string;
};

export type TeoyubeContentReviewQueueWarning = {
  id: string;
  itemId?: string;
  type: TeoyubeContentReviewQueueItemType | "queue";
  message: string;
  recommendedAction: string;
};

export type TeoyubeContentReviewQueueReport = {
  valid: boolean;
  status: TeoyubeContentReviewQueueStatus;
  decision: TeoyubeContentReviewQueueDecision;
  items: TeoyubeContentReviewQueueItem[];
  highPriorityItems: TeoyubeContentReviewQueueItem[];
  reviewRequiredItems: TeoyubeContentReviewQueueItem[];
  blockers: TeoyubeContentReviewQueueBlocker[];
  warnings: TeoyubeContentReviewQueueWarning[];
  reviewOnly: true;
  productionExcluded: true;
  excludedFromLiveRecommendations: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
