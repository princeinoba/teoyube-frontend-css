import {
  createReviewedContentIntegrationGateReport,
  validateReviewedContentItem
} from "./reviewed-content-integration-gate";
import type {
  TeoyubeReviewedContentIntegrationReport,
  TeoyubeReviewedContentItem
} from "./reviewed-content-integration-contracts";

export type TeoyubeReviewedContentIntegrationQaCheck = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubeReviewedContentIntegrationQaReport = {
  valid: boolean;
  checks: TeoyubeReviewedContentIntegrationQaCheck[];
  blockers: string[];
  warnings: string[];
  draftContentExcluded: true;
  productionCandidatesRequireReviews: true;
  scriptureAnchorsRequired: true;
  noUnsupportedClaims: true;
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

function check(id: string, passed: boolean, details: string): TeoyubeReviewedContentIntegrationQaCheck {
  return { id, passed, details };
}

function itemsFromInput(input?: TeoyubeReviewedContentItem[] | TeoyubeReviewedContentIntegrationReport): TeoyubeReviewedContentItem[] {
  if (!input) return createReviewedContentIntegrationGateReport().items;
  return Array.isArray(input) ? input : input.items;
}

export function validateReviewedContentIntegrationSafety(
  input?: TeoyubeReviewedContentItem[] | TeoyubeReviewedContentIntegrationReport
): TeoyubeReviewedContentIntegrationQaCheck {
  const items = itemsFromInput(input);
  const invalid = items.filter((item) => validateReviewedContentItem(item).blockers.length > 0);
  return check("reviewed_content_integration_safety", invalid.length === 0, invalid.length ? `${invalid.length} reviewed content item(s) have blockers.` : "Reviewed content gate has no blockers.");
}

export function validateReviewedContentScriptureAnchors(
  input?: TeoyubeReviewedContentItem[] | TeoyubeReviewedContentIntegrationReport
): TeoyubeReviewedContentIntegrationQaCheck {
  const items = itemsFromInput(input);
  const missing = items.filter((item) => item.scriptureReviewRequired && item.scriptureAnchors.length === 0);
  return check("reviewed_content_scripture_anchors", missing.length === 0, missing.length ? `${missing.length} item(s) lack required Scripture anchors.` : "Required Scripture anchors are present.");
}

export function validateReviewedContentTheologyBoundaries(
  input?: TeoyubeReviewedContentItem[] | TeoyubeReviewedContentIntegrationReport
): TeoyubeReviewedContentIntegrationQaCheck {
  const items = itemsFromInput(input);
  const missing = items.filter((item) => item.theologyReviewRequired && !item.theologyReviewed);
  return check("reviewed_content_theology_boundaries", missing.length === 0, missing.length ? `${missing.length} item(s) lack theology review.` : "Theology review is recorded where required.");
}

export function validateReviewedContentProductionEligibility(
  input?: TeoyubeReviewedContentItem[] | TeoyubeReviewedContentIntegrationReport
): TeoyubeReviewedContentIntegrationQaCheck {
  const items = itemsFromInput(input);
  const unsafe = items.filter((item) => item.productionEligible && (item.reviewOnly || !item.ownerReviewed || !item.scriptureReviewed || !item.theologyReviewed));
  return check("reviewed_content_production_eligibility", unsafe.length === 0, unsafe.length ? `${unsafe.length} production candidate(s) lack required review metadata.` : "Production candidates have required review metadata.");
}

export function validateReviewedContentExclusionOfDrafts(
  input?: TeoyubeReviewedContentItem[] | TeoyubeReviewedContentIntegrationReport
): TeoyubeReviewedContentIntegrationQaCheck {
  const items = itemsFromInput(input);
  const leaked = items.filter((item) => item.reviewOnly && !item.excludedFromLiveRecommendations);
  return check("reviewed_content_exclusion_of_drafts", leaked.length === 0, leaked.length ? `${leaked.length} review-only draft(s) are not excluded.` : "Review-only drafts remain excluded from live recommendation flows.");
}

export function validateReviewedContentNoUnsupportedClaims(
  input?: TeoyubeReviewedContentItem[] | TeoyubeReviewedContentIntegrationReport
): TeoyubeReviewedContentIntegrationQaCheck {
  const items = itemsFromInput(input);
  const unsafe = items.filter((item) =>
    item.unsupportedPromiseIntroduced ||
    item.unsupportedScriptureInvented ||
    item.divineCertaintyLanguagePresent ||
    item.professionalAdviceLanguagePresent
  );
  return check("reviewed_content_no_unsupported_claims", unsafe.length === 0, unsafe.length ? `${unsafe.length} item(s) include unsupported or unsafe claims.` : "No unsupported promises, unsupported Scripture, divine-certainty language, or professional advice claims are present.");
}

export function createReviewedContentIntegrationQaReport(
  input?: TeoyubeReviewedContentItem[] | TeoyubeReviewedContentIntegrationReport
): TeoyubeReviewedContentIntegrationQaReport {
  const gateReport = Array.isArray(input) || !input ? createReviewedContentIntegrationGateReport(itemsFromInput(input)) : input;
  const checks = [
    validateReviewedContentIntegrationSafety(gateReport),
    validateReviewedContentScriptureAnchors(gateReport),
    validateReviewedContentTheologyBoundaries(gateReport),
    validateReviewedContentProductionEligibility(gateReport),
    validateReviewedContentExclusionOfDrafts(gateReport),
    validateReviewedContentNoUnsupportedClaims(gateReport)
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = gateReport.warnings.map((entry) => entry.message);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    draftContentExcluded: true,
    productionCandidatesRequireReviews: true,
    scriptureAnchorsRequired: true,
    noUnsupportedClaims: true,
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
