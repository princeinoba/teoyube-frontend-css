export type TeoyubeControlledAdminPrototypeStatus =
  | "empty"
  | "needs_review"
  | "ready_for_review"
  | "ready_for_future_release"
  | "blocked"
  | "disabled"
  | "unknown";

export type TeoyubeControlledAdminPrototypeMode =
  | "in_memory_only"
  | "dev_only"
  | "documentation_only"
  | "disabled"
  | "unknown";

export type TeoyubeControlledAdminPrototypeSurface =
  | "content_review_queue"
  | "promise_cluster_drafts"
  | "scripture_anchor_review"
  | "prayer_calling_action_review"
  | "tig_relationship_review"
  | "release_candidate_review"
  | "service_readiness_review"
  | "beta_qa_plan"
  | "unknown";

export type TeoyubeControlledAdminReviewDecision =
  | "request_scripture_review"
  | "request_theology_review"
  | "request_copy_review"
  | "approve_for_future_release"
  | "block"
  | "defer"
  | "no_action"
  | "unknown";

export type TeoyubeControlledAdminReviewItem = {
  id: string;
  title: string;
  surface: TeoyubeControlledAdminPrototypeSurface;
  status: TeoyubeControlledAdminPrototypeStatus;
  summary: string;
  sourceId?: string;
  sourceType: "review_queue" | "release_candidate" | "service_readiness" | "beta_qa" | "manual" | "unknown";
  requiredReviews: string[];
  completedReviews: string[];
  scriptureAnchors: string[];
  explanationPath: string[];
  blockers: string[];
  warnings: string[];
  reviewOnly: boolean;
  productionEligible: boolean;
  productionPublished: false;
  addedToLiveRecommendations: false;
  fallbackSafetyPreserved: true;
  confidenceBoundariesPreserved: true;
  inMemoryOnly: true;
  updatedAt: string;
};

export type TeoyubeControlledAdminReviewAction = {
  id: string;
  itemId: string;
  decision: TeoyubeControlledAdminReviewDecision;
  actorRole: "owner" | "reviewer" | "developer" | "system" | "unknown";
  reason: string;
  simulatedOnly: true;
  createdAt: string;
};

export type TeoyubeControlledAdminReviewPanel = {
  id: string;
  title: string;
  surface: TeoyubeControlledAdminPrototypeSurface;
  status: TeoyubeControlledAdminPrototypeStatus;
  summary: string;
  items: TeoyubeControlledAdminReviewItem[];
  requiredReviewCount: number;
  blockerCount: number;
  warningCount: number;
  prototypeOnly: true;
};

export type TeoyubeControlledAdminWorkspace = {
  id: string;
  mode: TeoyubeControlledAdminPrototypeMode;
  status: TeoyubeControlledAdminPrototypeStatus;
  items: TeoyubeControlledAdminReviewItem[];
  actions: TeoyubeControlledAdminReviewAction[];
  prototypeOnly: true;
  noProductionCms: true;
  noAdminAuthAdded: true;
  noUserAccountsAdded: true;
  noDatabasePersistenceEnabled: true;
  noExternalServicesRequired: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailsOrNotificationsSent: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt?: string;
};

export type TeoyubeControlledAdminPrototypeBlocker = {
  id: string;
  itemId?: string;
  surface: TeoyubeControlledAdminPrototypeSurface;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledAdminPrototypeWarning = {
  id: string;
  itemId?: string;
  surface: TeoyubeControlledAdminPrototypeSurface;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledAdminPrototypeReport = {
  valid: boolean;
  status: TeoyubeControlledAdminPrototypeStatus;
  mode: TeoyubeControlledAdminPrototypeMode;
  workspace: TeoyubeControlledAdminWorkspace;
  panels?: TeoyubeControlledAdminReviewPanel[];
  blockers: TeoyubeControlledAdminPrototypeBlocker[];
  warnings: TeoyubeControlledAdminPrototypeWarning[];
  reviewItemCount: number;
  reviewOnlyItemCount: number;
  releaseCandidateCount: number;
  noProductionCms: true;
  noAdminAuthAdded: true;
  noUserAccountsAdded: true;
  noDatabasePersistenceEnabled: true;
  noExternalServicesRequired: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailsOrNotificationsSent: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
