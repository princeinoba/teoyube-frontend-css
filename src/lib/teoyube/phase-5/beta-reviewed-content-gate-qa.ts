import { createReviewedContentIntegrationGateReport } from "../phase-4/reviewed-content-integration-gate";

export type TeoyubeBetaReviewedContentGateQaInput = {
  gateReport?: ReturnType<typeof createReviewedContentIntegrationGateReport>;
  reviewOnlyContentLive?: boolean;
  releaseCandidateAutoPublished?: boolean;
  unsupportedReviewedContentClaims?: boolean;
};

export type TeoyubeBetaReviewedContentGateQaCheck = {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  details: string;
};

export type TeoyubeBetaReviewedContentGateQaReport = {
  valid: boolean;
  checks: TeoyubeBetaReviewedContentGateQaCheck[];
  blockers: string[];
  warnings: string[];
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, label: string, passed: boolean, details: string, required = true): TeoyubeBetaReviewedContentGateQaCheck {
  return { id, label, passed, required, details };
}

export function validateBetaReviewedContentGate(input: TeoyubeBetaReviewedContentGateQaInput = {}): TeoyubeBetaReviewedContentGateQaCheck {
  const report = input.gateReport || createReviewedContentIntegrationGateReport();
  return check("beta_reviewed_content_gate_valid", "Reviewed content gate remains valid", report.valid, `${report.eligibleItems.length} eligible item(s), ${report.blockers.length} blocker(s).`);
}

export function validateBetaReviewOnlyContentExcluded(input: TeoyubeBetaReviewedContentGateQaInput = {}): TeoyubeBetaReviewedContentGateQaCheck {
  const report = input.gateReport || createReviewedContentIntegrationGateReport();
  return check("beta_review_only_excluded", "Review-only content is excluded from live surfaces", report.reviewOnlyDraftsBlocked && !input.reviewOnlyContentLive, "Review-only content must not appear in live beta recommendation data.");
}

export function validateBetaProductionEligibleContentOnly(input: TeoyubeBetaReviewedContentGateQaInput = {}): TeoyubeBetaReviewedContentGateQaCheck {
  const report = input.gateReport || createReviewedContentIntegrationGateReport();
  return check("beta_production_eligible_only", "Only production-eligible content is allowed", report.blockedItems.length === 0, "Scripture, theology, copy, and owner review gates must be enforced.");
}

export function validateBetaReleaseCandidateNotAutoPublished(input: TeoyubeBetaReviewedContentGateQaInput = {}): TeoyubeBetaReviewedContentGateQaCheck {
  const report = input.gateReport || createReviewedContentIntegrationGateReport();
  return check("beta_release_candidate_not_auto_published", "Release candidates are not automatically published", report.noAutomaticPublishing && !input.releaseCandidateAutoPublished, "Release candidates remain manual and in-memory.");
}

export function validateBetaNoUnsupportedReviewedContentClaims(input: TeoyubeBetaReviewedContentGateQaInput = {}): TeoyubeBetaReviewedContentGateQaCheck {
  const report = input.gateReport || createReviewedContentIntegrationGateReport();
  return check("beta_no_unsupported_reviewed_claims", "No unsupported Scripture or promise claims are introduced", report.blockers.every((entry) => !/unsupported|scripture|promise/i.test(entry.message)) && !input.unsupportedReviewedContentClaims, "Unsupported Scripture references and promises stay blocked.");
}

export function createBetaReviewedContentGateChecklist(input: TeoyubeBetaReviewedContentGateQaInput = {}): TeoyubeBetaReviewedContentGateQaCheck[] {
  return [
    validateBetaReviewedContentGate(input),
    validateBetaReviewOnlyContentExcluded(input),
    validateBetaProductionEligibleContentOnly(input),
    validateBetaReleaseCandidateNotAutoPublished(input),
    validateBetaNoUnsupportedReviewedContentClaims(input)
  ];
}

export function getBetaReviewedContentGateQaBlockers(input: TeoyubeBetaReviewedContentGateQaInput = {}): string[] {
  const report = input.gateReport || createReviewedContentIntegrationGateReport();
  return [
    ...createBetaReviewedContentGateChecklist({ ...input, gateReport: report })
      .filter((entry) => entry.required && !entry.passed)
      .map((entry) => `${entry.label}: ${entry.details}`),
    ...report.blockers.map((entry) => entry.message)
  ];
}

export function getBetaReviewedContentGateQaWarnings(input: TeoyubeBetaReviewedContentGateQaInput = {}): string[] {
  const report = input.gateReport || createReviewedContentIntegrationGateReport();
  return [
    ...report.warnings.map((entry) => entry.message),
    "Manual owner review remains required before any future production content release."
  ];
}

export function createBetaReviewedContentGateQaReport(input: TeoyubeBetaReviewedContentGateQaInput = {}): TeoyubeBetaReviewedContentGateQaReport {
  const blockers = getBetaReviewedContentGateQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checks: createBetaReviewedContentGateChecklist(input),
    blockers,
    warnings: getBetaReviewedContentGateQaWarnings(input),
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
