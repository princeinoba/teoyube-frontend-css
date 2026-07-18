export type TeoyubeReviewedContentStatus =
  | "ready_for_future_integration"
  | "needs_scripture_review"
  | "needs_theology_review"
  | "needs_owner_review"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubeReviewedContentItemType =
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

export type TeoyubeReviewedContentReviewState =
  | "draft_review_only"
  | "scripture_review_required"
  | "theology_review_required"
  | "copy_review_required"
  | "owner_review_required"
  | "approved_for_future_release"
  | "production_candidate"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubeReviewedContentSource = {
  sourceId: string;
  sourceType: "production_data" | "phase_4_3_queue" | "phase_4_3_draft" | "manual_review" | "unknown";
  sourceFile?: string;
  reviewEvidence: string;
};

export type TeoyubeReviewedContentItem = {
  id: string;
  type: TeoyubeReviewedContentItemType;
  status: TeoyubeReviewedContentStatus;
  reviewState: TeoyubeReviewedContentReviewState;
  title: string;
  summary: string;
  source: TeoyubeReviewedContentSource;
  scriptureAnchors: string[];
  explanationPath: string[];
  relatedWordIds: string[];
  relatedPromiseClusterIds: string[];
  reviewOnly: boolean;
  scriptureReviewRequired: boolean;
  theologyReviewRequired: boolean;
  copyReviewRequired: boolean;
  ownerReviewRequired: boolean;
  scriptureReviewed: boolean;
  theologyReviewed: boolean;
  copyReviewed: boolean;
  ownerReviewed: boolean;
  productionEligible: boolean;
  excludedFromLiveRecommendations: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceBoundariesPreserved: boolean;
  hiddenPersonalizationIntroduced: boolean;
  unsupportedScriptureInvented: boolean;
  unsupportedPromiseIntroduced: boolean;
  divineCertaintyLanguagePresent: boolean;
  professionalAdviceLanguagePresent: boolean;
  createdAt: string;
};

export type TeoyubeReviewedContentIntegrationGate = {
  id: string;
  items: TeoyubeReviewedContentItem[];
  reviewOnlyDraftsBlocked: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
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
};

export type TeoyubeReviewedContentReleaseCandidate = {
  id: string;
  itemId: string;
  type: TeoyubeReviewedContentItemType;
  title: string;
  status: "release_candidate" | "blocked" | "deferred";
  productionEligible: boolean;
  autoPublished: false;
  addedToLiveRecommendations: false;
  reviewMetadata: {
    scriptureReviewed: boolean;
    theologyReviewed: boolean;
    copyReviewed: boolean;
    ownerReviewed: boolean;
    sourceReviewEvidence: string;
  };
  scriptureAnchors: string[];
  explanationPath: string[];
  source: TeoyubeReviewedContentSource;
  blockers: string[];
  warnings: string[];
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeReviewedContentIntegrationDecision =
  | "ready_for_future_integration"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "empty";

export type TeoyubeReviewedContentIntegrationBlocker = {
  id: string;
  itemId?: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeReviewedContentIntegrationWarning = {
  id: string;
  itemId?: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeReviewedContentIntegrationReport = {
  valid: boolean;
  decision: TeoyubeReviewedContentIntegrationDecision;
  gate: TeoyubeReviewedContentIntegrationGate;
  items: TeoyubeReviewedContentItem[];
  eligibleItems: TeoyubeReviewedContentItem[];
  blockedItems: TeoyubeReviewedContentItem[];
  deferredItems: TeoyubeReviewedContentItem[];
  blockers: TeoyubeReviewedContentIntegrationBlocker[];
  warnings: TeoyubeReviewedContentIntegrationWarning[];
  reviewOnlyDraftsBlocked: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
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
