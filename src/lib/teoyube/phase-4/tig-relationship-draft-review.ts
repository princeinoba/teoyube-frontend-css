export type TeoyubeTigRelationshipDraftReviewType =
  | "word_to_promise"
  | "promise_to_scripture"
  | "word_to_calling"
  | "calling_to_action"
  | "prayer_to_scripture"
  | "action_to_scripture"
  | "fallback_to_scripture"
  | "confidence_rule"
  | "explanation_trace_step";

export type TeoyubeTigRelationshipDraftReviewItem = {
  id: string;
  type: TeoyubeTigRelationshipDraftReviewType;
  sourceId: string;
  targetId: string;
  label: string;
  scriptureAnchors: string[];
  explanationPath: string[];
  confidenceBoundaryVisible: boolean;
  noUnsupportedRelationshipIntroduced: boolean;
  noHiddenPersonalization: boolean;
  noDivineCertaintyClaim: boolean;
  scriptureReviewRequired: true;
  theologyReviewRequired: true;
  ownerReviewRequired: true;
  reviewOnly: true;
  productionEligible: false;
  excludedFromLiveRecommendations: true;
};

export type TeoyubeTigRelationshipDraftReviewReport = {
  valid: boolean;
  items: TeoyubeTigRelationshipDraftReviewItem[];
  blockers: string[];
  warnings: string[];
  noUnsupportedRelationships: true;
  noHiddenPersonalization: true;
  noDivineCertaintyClaimsAllowed: true;
  explanationTraceRequired: true;
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

const SCRIPTURE_REQUIRED_TYPES: TeoyubeTigRelationshipDraftReviewType[] = [
  "promise_to_scripture",
  "prayer_to_scripture",
  "action_to_scripture",
  "fallback_to_scripture"
];

const UNSAFE_LANGUAGE = ["god told", "god guarantees", "will definitely", "must be your calling"];

export function createTigRelationshipDraftReviewItem(
  input: Partial<TeoyubeTigRelationshipDraftReviewItem> & {
    id: string;
    type: TeoyubeTigRelationshipDraftReviewType;
    sourceId: string;
    targetId: string;
    label: string;
  }
): TeoyubeTigRelationshipDraftReviewItem {
  return {
    id: input.id,
    type: input.type,
    sourceId: input.sourceId,
    targetId: input.targetId,
    label: input.label,
    scriptureAnchors: input.scriptureAnchors || [],
    explanationPath: input.explanationPath || ["TIG relationship proposed for review only.", "Explanation trace compatibility required before future release."],
    confidenceBoundaryVisible: input.confidenceBoundaryVisible ?? true,
    noUnsupportedRelationshipIntroduced: input.noUnsupportedRelationshipIntroduced ?? true,
    noHiddenPersonalization: input.noHiddenPersonalization ?? true,
    noDivineCertaintyClaim: input.noDivineCertaintyClaim ?? true,
    scriptureReviewRequired: true,
    theologyReviewRequired: true,
    ownerReviewRequired: true,
    reviewOnly: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true
  };
}

export function validateTigRelationshipDraftReviewItem(item: TeoyubeTigRelationshipDraftReviewItem) {
  const text = [item.label, ...item.explanationPath].join(" ").toLowerCase();
  const unsafeMatches = UNSAFE_LANGUAGE.filter((phrase) => text.includes(phrase));
  const blockers = [
    !item.sourceId || !item.targetId ? `${item.id} needs stable source and target ids.` : "",
    !item.explanationPath.length ? `${item.id} needs explanation trace compatibility.` : "",
    SCRIPTURE_REQUIRED_TYPES.includes(item.type) && item.scriptureAnchors.length === 0 ? `${item.id} needs a Scripture anchor for ${item.type}.` : "",
    !item.confidenceBoundaryVisible ? `${item.id} must preserve a visible confidence boundary.` : "",
    !item.noUnsupportedRelationshipIntroduced ? `${item.id} introduces an unsupported relationship.` : "",
    !item.noHiddenPersonalization ? `${item.id} creates hidden personalization.` : "",
    !item.noDivineCertaintyClaim || unsafeMatches.length ? `${item.id} includes divine-certainty or over-certain language.` : "",
    item.productionEligible ? `${item.id} must not be production eligible in Phase 4.3.` : "",
    !item.excludedFromLiveRecommendations ? `${item.id} must be excluded from live recommendation flows.` : ""
  ].filter(Boolean);
  const warnings = [
    item.scriptureAnchors.length === 0 ? `${item.id} should receive Scripture review where applicable.` : "",
    !item.reviewOnly ? `${item.id} should be marked review-only.` : ""
  ].filter(Boolean);

  return { valid: blockers.length === 0, blockers, warnings };
}

export function getTigRelationshipDraftReviewBlockers(items: TeoyubeTigRelationshipDraftReviewItem[]): string[] {
  return items.flatMap((item) => validateTigRelationshipDraftReviewItem(item).blockers);
}

export function getTigRelationshipDraftReviewWarnings(items: TeoyubeTigRelationshipDraftReviewItem[]): string[] {
  return items.flatMap((item) => validateTigRelationshipDraftReviewItem(item).warnings);
}

export function createTigRelationshipDraftReviewReport(
  items: TeoyubeTigRelationshipDraftReviewItem[] = [
    createTigRelationshipDraftReviewItem({
      id: "phase_4_3_tig_word_to_promise_review",
      type: "word_to_promise",
      sourceId: "Benor",
      targetId: "promise_cluster_review",
      label: "Review-only TIG word to Promise Cluster relationship",
      scriptureAnchors: ["Romans 8:28"]
    })
  ]
): TeoyubeTigRelationshipDraftReviewReport {
  const blockers = getTigRelationshipDraftReviewBlockers(items);
  const warnings = getTigRelationshipDraftReviewWarnings(items);
  return {
    valid: blockers.length === 0,
    items,
    blockers,
    warnings,
    noUnsupportedRelationships: true,
    noHiddenPersonalization: true,
    noDivineCertaintyClaimsAllowed: true,
    explanationTraceRequired: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
