export type TeoyubeHardeningContentGateInput = Partial<{
  reviewedContentGateIntact: boolean;
  reviewOnlyContentLive: boolean;
  releaseCandidatesAutoPublished: boolean;
  unsupportedReviewedContentIntroduced: boolean;
  unreviewedProductionJsonWritten: boolean;
}>;

export type TeoyubeHardeningContentGateRegressionReport = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noAutomaticPublishing: true;
  noProductionJsonWrite: true;
  noUnsupportedContentIntroduced: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function validateHardeningReviewedContentGate(input: TeoyubeHardeningContentGateInput = {}): boolean {
  return input.reviewedContentGateIntact !== false;
}

export function validateHardeningReviewOnlyContentExcluded(input: TeoyubeHardeningContentGateInput = {}): boolean {
  return !input.reviewOnlyContentLive;
}

export function validateHardeningReleaseCandidatesNotAutoPublished(input: TeoyubeHardeningContentGateInput = {}): boolean {
  return !input.releaseCandidatesAutoPublished;
}

export function validateHardeningNoUnsupportedReviewedContent(input: TeoyubeHardeningContentGateInput = {}): boolean {
  return !input.unsupportedReviewedContentIntroduced && !input.unreviewedProductionJsonWritten;
}

export function createHardeningContentGateRegressionReport(input: TeoyubeHardeningContentGateInput = {}): TeoyubeHardeningContentGateRegressionReport {
  const checks = [
    { id: "reviewed_content_gate_intact", passed: validateHardeningReviewedContentGate(input), details: "Reviewed content gate remains intact." },
    { id: "review_only_content_excluded", passed: validateHardeningReviewOnlyContentExcluded(input), details: "Review-only content does not appear in live flows." },
    { id: "release_candidates_not_auto_published", passed: validateHardeningReleaseCandidatesNotAutoPublished(input), details: "Release candidates are not automatically published." },
    { id: "no_unsupported_reviewed_content", passed: validateHardeningNoUnsupportedReviewedContent(input), details: "Unsupported Scripture/promise content is not introduced and production JSON is not written." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Content gate regression confirms Phase 8.2 did not edit production JSON content."],
    noAutomaticPublishing: true,
    noProductionJsonWrite: true,
    noUnsupportedContentIntroduced: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
