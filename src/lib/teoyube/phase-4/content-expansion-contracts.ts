export type TeoyubeContentExpansionStatus =
  | "draft_needed"
  | "owner_review_required"
  | "scripture_review_required"
  | "theology_review_required"
  | "copy_review_required"
  | "ready_for_future_phase"
  | "blocked"
  | "unknown";

export type TeoyubeContentExpansionArea =
  | "teoyube_vocabulary"
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
  | "canon_copy"
  | "daily_word_copy"
  | "unknown";

export type TeoyubeContentExpansionPriority = "critical" | "high" | "medium" | "low";

export type TeoyubeContentExpansionReviewStatus =
  | "draft_needed"
  | "owner_review_required"
  | "scripture_review_required"
  | "theology_review_required"
  | "copy_review_required"
  | "ready_for_future_phase"
  | "blocked"
  | "unknown";

export type TeoyubeContentExpansionCandidate = {
  id: string;
  area: TeoyubeContentExpansionArea;
  sourceId: string;
  sourceLabel: string;
  reason: string;
  requiredReviews: TeoyubeContentExpansionReviewStatus[];
  priority: TeoyubeContentExpansionPriority;
};

export type TeoyubeContentExpansionBacklogItem = {
  id: string;
  area: TeoyubeContentExpansionArea;
  title: string;
  sourceIds: string[];
  priority: TeoyubeContentExpansionPriority;
  status: TeoyubeContentExpansionStatus;
  requiredReviews: TeoyubeContentExpansionReviewStatus[];
  summary: string;
  doesNotCreateProductionContent: true;
};

export type TeoyubeContentExpansionBlocker = {
  id: string;
  area: TeoyubeContentExpansionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeContentExpansionWarning = {
  id: string;
  area: TeoyubeContentExpansionArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeContentExpansionReport = {
  valid: boolean;
  items: TeoyubeContentExpansionBacklogItem[];
  highPriorityItems: TeoyubeContentExpansionBacklogItem[];
  scriptureAnchorItems: TeoyubeContentExpansionBacklogItem[];
  promiseClusterItems: TeoyubeContentExpansionBacklogItem[];
  prayerItems: TeoyubeContentExpansionBacklogItem[];
  callingItems: TeoyubeContentExpansionBacklogItem[];
  tigRelationshipItems: TeoyubeContentExpansionBacklogItem[];
  blockers: TeoyubeContentExpansionBlocker[];
  warnings: TeoyubeContentExpansionWarning[];
  noProductionContentCreated: true;
  noUnsupportedScriptureInvented: true;
  noUnsupportedPromisesInvented: true;
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
