import { findScriptureCanonEntryByReference } from "../data/teoyube-data-access";

export type TeoyubeScriptureAnchorDraftReviewItem = {
  id: string;
  reference: string;
  proposedUse: string;
  relatedPromiseClusterId?: string;
  relatedWordId?: string;
  explanationPath: string[];
  manualVerificationRequired: boolean;
  scriptureReviewRequired: true;
  theologyReviewRequired: true;
  ownerReviewRequired: true;
  scriptureReviewed: boolean;
  theologyReviewed: boolean;
  ownerReviewed: boolean;
  noUnsupportedInterpretationIntroduced: boolean;
  noDivineCertaintyClaimIntroduced: boolean;
  reviewOnly: true;
  productionEligible: false;
  excludedFromLiveRecommendations: true;
};

export type TeoyubeScriptureAnchorDraftReviewReport = {
  valid: boolean;
  items: TeoyubeScriptureAnchorDraftReviewItem[];
  blockers: string[];
  warnings: string[];
  noUnsupportedScriptureInvented: true;
  noDivineCertaintyClaimsAllowed: true;
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

const UNSAFE_LANGUAGE = ["god told", "god guarantees", "will definitely", "must be your calling"];

export function createScriptureAnchorDraftReviewItem(
  input: Partial<TeoyubeScriptureAnchorDraftReviewItem> & { id: string; reference: string; proposedUse: string }
): TeoyubeScriptureAnchorDraftReviewItem {
  const canonEntry = findScriptureCanonEntryByReference(input.reference);
  return {
    id: input.id,
    reference: input.reference,
    proposedUse: input.proposedUse,
    relatedPromiseClusterId: input.relatedPromiseClusterId,
    relatedWordId: input.relatedWordId,
    explanationPath: input.explanationPath || ["Anchor proposed for review only.", "Scripture, theology, and owner review required before future release."],
    manualVerificationRequired: input.manualVerificationRequired ?? !canonEntry,
    scriptureReviewRequired: true,
    theologyReviewRequired: true,
    ownerReviewRequired: true,
    scriptureReviewed: input.scriptureReviewed ?? false,
    theologyReviewed: input.theologyReviewed ?? false,
    ownerReviewed: input.ownerReviewed ?? false,
    noUnsupportedInterpretationIntroduced: input.noUnsupportedInterpretationIntroduced ?? true,
    noDivineCertaintyClaimIntroduced: input.noDivineCertaintyClaimIntroduced ?? true,
    reviewOnly: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true
  };
}

export function validateScriptureAnchorDraftReviewItem(item: TeoyubeScriptureAnchorDraftReviewItem) {
  const canonEntry = findScriptureCanonEntryByReference(item.reference);
  const text = [item.reference, item.proposedUse, ...item.explanationPath].join(" ").toLowerCase();
  const unsafeMatches = UNSAFE_LANGUAGE.filter((phrase) => text.includes(phrase));
  const blockers = [
    !item.reference ? `${item.id} is missing a Scripture reference.` : "",
    !canonEntry && !item.manualVerificationRequired ? `${item.id} reference is not in Scripture Canon and is not marked for manual verification.` : "",
    !item.noUnsupportedInterpretationIntroduced ? `${item.id} introduces unsupported interpretation.` : "",
    !item.noDivineCertaintyClaimIntroduced || unsafeMatches.length ? `${item.id} includes divine-certainty or over-certain claim language.` : "",
    item.productionEligible ? `${item.id} must not be production eligible in Phase 4.3.` : "",
    !item.excludedFromLiveRecommendations ? `${item.id} must be excluded from live recommendation flows.` : ""
  ].filter(Boolean);
  const warnings = [
    !canonEntry ? `${item.id} needs manual Scripture Canon verification.` : "",
    !item.scriptureReviewed ? `${item.id} needs Scripture review.` : "",
    !item.theologyReviewed ? `${item.id} needs theology review.` : "",
    !item.ownerReviewed ? `${item.id} needs owner review before future release.` : "",
    item.explanationPath.length === 0 ? `${item.id} needs an explanation path.` : ""
  ].filter(Boolean);

  return { valid: blockers.length === 0, blockers, warnings };
}

export function getScriptureAnchorDraftReviewBlockers(items: TeoyubeScriptureAnchorDraftReviewItem[]): string[] {
  return items.flatMap((item) => validateScriptureAnchorDraftReviewItem(item).blockers);
}

export function getScriptureAnchorDraftReviewWarnings(items: TeoyubeScriptureAnchorDraftReviewItem[]): string[] {
  return items.flatMap((item) => validateScriptureAnchorDraftReviewItem(item).warnings);
}

export function createScriptureAnchorDraftReviewReport(
  items: TeoyubeScriptureAnchorDraftReviewItem[] = [
    createScriptureAnchorDraftReviewItem({
      id: "phase_4_3_sample_scripture_anchor_review",
      reference: "Romans 8:28",
      proposedUse: "Review existing anchor support before future Promise Cluster expansion."
    })
  ]
): TeoyubeScriptureAnchorDraftReviewReport {
  const blockers = getScriptureAnchorDraftReviewBlockers(items);
  const warnings = getScriptureAnchorDraftReviewWarnings(items);
  return {
    valid: blockers.length === 0,
    items,
    blockers,
    warnings,
    noUnsupportedScriptureInvented: true,
    noDivineCertaintyClaimsAllowed: true,
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
