import {
  createDefaultReviewedContentItems,
  isReviewedContentProductionEligible,
  validateReviewedContentItem
} from "./reviewed-content-integration-gate";
import type {
  TeoyubeReviewedContentItem,
  TeoyubeReviewedContentItemType,
  TeoyubeReviewedContentReleaseCandidate
} from "./reviewed-content-integration-contracts";

export type TeoyubeReviewedContentReleaseCandidateReport = {
  valid: boolean;
  candidates: TeoyubeReviewedContentReleaseCandidate[];
  releaseCandidates: TeoyubeReviewedContentReleaseCandidate[];
  blockedCandidates: TeoyubeReviewedContentReleaseCandidate[];
  deferredCandidates: TeoyubeReviewedContentReleaseCandidate[];
  blockers: string[];
  warnings: string[];
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noDraftContentPublished: true;
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

export function createReleaseCandidateFromReviewedItem(
  item: TeoyubeReviewedContentItem
): TeoyubeReviewedContentReleaseCandidate {
  const validation = validateReviewedContentItem(item);
  const productionEligible = isReviewedContentProductionEligible(item);
  const status = productionEligible ? "release_candidate" : item.status === "deferred" ? "deferred" : "blocked";

  return {
    id: `candidate_${item.id}`,
    itemId: item.id,
    type: item.type,
    title: item.title,
    status,
    productionEligible,
    autoPublished: false,
    addedToLiveRecommendations: false,
    reviewMetadata: {
      scriptureReviewed: item.scriptureReviewed,
      theologyReviewed: item.theologyReviewed,
      copyReviewed: item.copyReviewed,
      ownerReviewed: item.ownerReviewed,
      sourceReviewEvidence: item.source.reviewEvidence
    },
    scriptureAnchors: item.scriptureAnchors,
    explanationPath: item.explanationPath,
    source: item.source,
    blockers: validation.blockers.map((entry) => entry.message),
    warnings: validation.warnings.map((entry) => entry.message),
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function createReviewedContentReleaseCandidates(input: {
  items?: TeoyubeReviewedContentItem[];
  includeBlocked?: boolean;
} = {}): TeoyubeReviewedContentReleaseCandidate[] {
  const items = input.items || createDefaultReviewedContentItems();
  const candidates = items.map(createReleaseCandidateFromReviewedItem);
  return input.includeBlocked ? candidates : candidates.filter((candidate) => candidate.status === "release_candidate");
}

export function getReleaseCandidatesByType(
  candidates: TeoyubeReviewedContentReleaseCandidate[],
  type: TeoyubeReviewedContentItemType
): TeoyubeReviewedContentReleaseCandidate[] {
  return candidates.filter((candidate) => candidate.type === type);
}

export function getBlockedReleaseCandidateItems(
  items: TeoyubeReviewedContentItem[]
): TeoyubeReviewedContentItem[] {
  return items.filter((item) => !isReviewedContentProductionEligible(item) && item.status !== "deferred");
}

export function getDeferredReleaseCandidateItems(
  items: TeoyubeReviewedContentItem[]
): TeoyubeReviewedContentItem[] {
  return items.filter((item) => item.status === "deferred" || item.reviewState === "deferred");
}

export function validateReviewedContentReleaseCandidate(
  candidate: TeoyubeReviewedContentReleaseCandidate
) {
  const blockers = [
    candidate.autoPublished ? `${candidate.id} must not auto-publish.` : "",
    candidate.addedToLiveRecommendations ? `${candidate.id} must not be added to live recommendations automatically.` : "",
    !candidate.productionEligible ? `${candidate.id} is not production eligible.` : "",
    candidate.blockers.length ? `${candidate.id} carries blockers: ${candidate.blockers.join("; ")}` : "",
    candidate.scriptureAnchors.length === 0 ? `${candidate.id} has no Scripture anchors.` : "",
    candidate.explanationPath.length === 0 ? `${candidate.id} has no explanation path.` : ""
  ].filter(Boolean);
  const warnings = [
    !candidate.reviewMetadata.ownerReviewed ? `${candidate.id} lacks owner review metadata.` : "",
    !candidate.reviewMetadata.scriptureReviewed ? `${candidate.id} lacks Scripture review metadata.` : "",
    !candidate.reviewMetadata.theologyReviewed ? `${candidate.id} lacks theology review metadata.` : "",
    candidate.warnings.length ? `${candidate.id} carries warnings: ${candidate.warnings.join("; ")}` : ""
  ].filter(Boolean);

  return { valid: blockers.length === 0, blockers, warnings };
}

export function createReviewedContentReleaseCandidateReport(
  candidates: TeoyubeReviewedContentReleaseCandidate[] = createReviewedContentReleaseCandidates()
): TeoyubeReviewedContentReleaseCandidateReport {
  const validations = candidates.map(validateReviewedContentReleaseCandidate);
  const blockers = validations.flatMap((entry) => entry.blockers);
  const warnings = validations.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    candidates,
    releaseCandidates: candidates.filter((entry) => entry.status === "release_candidate"),
    blockedCandidates: candidates.filter((entry) => entry.status === "blocked"),
    deferredCandidates: candidates.filter((entry) => entry.status === "deferred"),
    blockers,
    warnings,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noDraftContentPublished: true,
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
