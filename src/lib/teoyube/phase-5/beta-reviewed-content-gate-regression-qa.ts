import {
  createBetaReviewedContentGateQaReport,
  validateBetaNoUnsupportedReviewedContentClaims,
  validateBetaReleaseCandidateNotAutoPublished,
  validateBetaReviewedContentGate,
  validateBetaReviewOnlyContentExcluded,
  type TeoyubeBetaReviewedContentGateQaInput
} from "./beta-reviewed-content-gate-qa";

export function validateBetaRegressionReviewedContentGate(input: TeoyubeBetaReviewedContentGateQaInput = {}) {
  return validateBetaReviewedContentGate(input);
}

export function validateBetaRegressionReviewOnlyContentExcluded(input: TeoyubeBetaReviewedContentGateQaInput = {}) {
  return validateBetaReviewOnlyContentExcluded(input);
}

export function validateBetaRegressionReleaseCandidatesNotAutoPublished(input: TeoyubeBetaReviewedContentGateQaInput = {}) {
  return validateBetaReleaseCandidateNotAutoPublished(input);
}

export function validateBetaRegressionNoUnsupportedReviewedContent(input: TeoyubeBetaReviewedContentGateQaInput = {}) {
  return validateBetaNoUnsupportedReviewedContentClaims(input);
}

export function createBetaReviewedContentGateRegressionQaReport(input: TeoyubeBetaReviewedContentGateQaInput = {}) {
  return {
    ...createBetaReviewedContentGateQaReport(input),
    regressionArea: "reviewed_content_gate" as const,
    remediationDidNotPublishReviewOnlyContent: true
  };
}
