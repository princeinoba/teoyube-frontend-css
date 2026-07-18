export type TeoyubePromiseClusterExpansionDraftStatus =
  | "draft_review_only"
  | "scripture_review_required"
  | "theology_review_required"
  | "copy_review_required"
  | "owner_review_required"
  | "approved_for_future_release"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubePromiseClusterExpansionDraftType =
  | "new_cluster_draft"
  | "existing_cluster_expansion"
  | "scripture_anchor_addition"
  | "theme_depth_addition"
  | "word_connection_addition"
  | "prayer_connection_addition"
  | "calling_connection_addition"
  | "action_connection_addition"
  | "tig_relationship_addition"
  | "unknown";

export type TeoyubePromiseClusterExpansionDraftAnchor = {
  reference: string;
  source: "promise_cluster" | "scripture_canon" | "vocabulary" | "manual_review" | "unknown";
  canonEntryId?: string;
  verifiedInCanon: boolean;
  manualVerificationRequired: boolean;
  reviewState: "scripture_review_required" | "verified_existing_canon" | "manual_review_required";
};

export type TeoyubePromiseClusterExpansionDraftReview = {
  scriptureReviewRequired: true;
  theologyReviewRequired: true;
  copyReviewRequired: true;
  ownerReviewRequired: true;
  scriptureReviewed: boolean;
  theologyReviewed: boolean;
  copyReviewed: boolean;
  ownerReviewed: boolean;
};

export type TeoyubePromiseClusterExpansionDraft = {
  id: string;
  type: TeoyubePromiseClusterExpansionDraftType;
  status: TeoyubePromiseClusterExpansionDraftStatus;
  title: string;
  summary: string;
  sourceClusterId?: string;
  sourceTheme?: string;
  sourceWordId?: string;
  sourceScriptureReference?: string;
  scriptureAnchors: TeoyubePromiseClusterExpansionDraftAnchor[];
  theme?: string;
  relatedWordIds: string[];
  explanationPath: string[];
  review: TeoyubePromiseClusterExpansionDraftReview;
  reviewOnly: true;
  draft: true;
  productionEligible: false;
  excludedFromLiveRecommendations: true;
  unsupportedPromiseCreated: false;
  unsupportedScriptureInvented: false;
  notes: string[];
  sourceFiles: string[];
  createdAt: string;
};

export type TeoyubePromiseClusterExpansionDraftBlocker = {
  id: string;
  draftId?: string;
  message: string;
  requiredAction: string;
};

export type TeoyubePromiseClusterExpansionDraftWarning = {
  id: string;
  draftId?: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubePromiseClusterExpansionDraftDecision =
  | "drafts_ready_for_review"
  | "drafts_ready_with_warnings"
  | "needs_owner_review"
  | "blocked"
  | "empty";

export type TeoyubePromiseClusterExpansionDraftReport = {
  valid: boolean;
  decision: TeoyubePromiseClusterExpansionDraftDecision;
  drafts: TeoyubePromiseClusterExpansionDraft[];
  reviewOnlyDrafts: TeoyubePromiseClusterExpansionDraft[];
  blockers: TeoyubePromiseClusterExpansionDraftBlocker[];
  warnings: TeoyubePromiseClusterExpansionDraftWarning[];
  reviewOnly: true;
  productionEligible: false;
  excludedFromLiveRecommendations: true;
  noProductionJsonModified: true;
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
