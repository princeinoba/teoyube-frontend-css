import { createTeoyubeDataContractValidationReport } from "../data/teoyube-data-contract-validation";
import { createMockReplacementValidationReport } from "../integration/phase-3-3-mock-replacement-validation";
import { createReviewedContentIntegrationGateReport } from "../phase-4/reviewed-content-integration-gate";

export type TeoyubeBetaRealDataQaStatus = "passed" | "warning" | "blocked" | "manual_review_required";

export type TeoyubeBetaRealDataQaArea =
  | "vocabulary"
  | "promise_clusters"
  | "scripture_canon"
  | "cross_data_connections"
  | "mock_replacement"
  | "reviewed_content_gate";

export type TeoyubeBetaRealDataQaCheck = {
  id: string;
  area: TeoyubeBetaRealDataQaArea;
  label: string;
  required: boolean;
  passed: boolean;
  details: string;
};

export type TeoyubeBetaRealDataQaResult = {
  id: string;
  area: TeoyubeBetaRealDataQaArea;
  status: TeoyubeBetaRealDataQaStatus;
  notes: string;
  capturedManually: true;
  containsSensitiveText: false;
  recordedAt: string;
};

export type TeoyubeBetaRealDataQaInput = {
  results?: TeoyubeBetaRealDataQaResult[];
  dataContractReport?: ReturnType<typeof createTeoyubeDataContractValidationReport>;
  mockReplacementReport?: ReturnType<typeof createMockReplacementValidationReport>;
  reviewedContentGateReport?: ReturnType<typeof createReviewedContentIntegrationGateReport>;
  reviewedOnlyDraftContentLive?: boolean;
  unsupportedMockContentLive?: boolean;
};

export type TeoyubeBetaRealDataQaReport = {
  valid: boolean;
  checks: TeoyubeBetaRealDataQaCheck[];
  results: TeoyubeBetaRealDataQaResult[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noReviewedOnlyDraftContentLive: boolean;
  noUnsupportedMockContentLive: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(
  id: string,
  area: TeoyubeBetaRealDataQaArea,
  label: string,
  passed: boolean,
  details: string,
  required = true
): TeoyubeBetaRealDataQaCheck {
  return { id, area, label, required, passed, details };
}

export function recordBetaRealDataQaResult(input: Omit<TeoyubeBetaRealDataQaResult, "capturedManually" | "containsSensitiveText" | "recordedAt"> & { recordedAt?: string }): TeoyubeBetaRealDataQaResult {
  return {
    ...input,
    capturedManually: true,
    containsSensitiveText: false,
    recordedAt: input.recordedAt || new Date().toISOString()
  };
}

export function validateBetaVocabularyDataQa(input: TeoyubeBetaRealDataQaInput = {}): TeoyubeBetaRealDataQaCheck {
  const report = input.dataContractReport || createTeoyubeDataContractValidationReport();
  return check("beta_vocabulary_data_loads", "vocabulary", "Vocabulary data loads and validates", report.vocabularyCount > 0 && !report.blockers.some((entry) => entry.sourceFile.includes("coreTeoyubeVocabulary")), `${report.vocabularyCount} vocabulary item(s) loaded.`);
}

export function validateBetaPromiseClusterDataQa(input: TeoyubeBetaRealDataQaInput = {}): TeoyubeBetaRealDataQaCheck {
  const report = input.dataContractReport || createTeoyubeDataContractValidationReport();
  return check("beta_promise_clusters_scripture_anchored", "promise_clusters", "Promise Clusters load and remain Scripture-anchored", report.promiseClusterCount > 0 && !report.blockers.some((entry) => entry.sourceFile.includes("promiseClusters")), `${report.promiseClusterCount} Promise Cluster(s) loaded.`);
}

export function validateBetaScriptureCanonDataQa(input: TeoyubeBetaRealDataQaInput = {}): TeoyubeBetaRealDataQaCheck {
  const report = input.dataContractReport || createTeoyubeDataContractValidationReport();
  return check("beta_scripture_canon_loads", "scripture_canon", "Scripture Canon loads and validates", report.scriptureCanonCount > 0 && !report.blockers.some((entry) => entry.sourceFile.includes("scriptureCanon")), `${report.scriptureCanonCount} Scripture Canon entrie(s) loaded.`);
}

export function validateBetaCrossDataConnectionQa(input: TeoyubeBetaRealDataQaInput = {}): TeoyubeBetaRealDataQaCheck {
  const dataReport = input.dataContractReport || createTeoyubeDataContractValidationReport();
  const mockReport = input.mockReplacementReport || createMockReplacementValidationReport();
  const reviewedReport = input.reviewedContentGateReport || createReviewedContentIntegrationGateReport();
  const passed = dataReport.valid && mockReport.valid && reviewedReport.valid && !input.reviewedOnlyDraftContentLive && !input.unsupportedMockContentLive;
  return check("beta_cross_data_connections_safe", "cross_data_connections", "Real data connections avoid unsupported mock and review-only content", passed, "Data contracts, mock replacement validation, and reviewed content gate were checked together.");
}

export function createBetaRealDataQaChecklist(input: TeoyubeBetaRealDataQaInput = {}): TeoyubeBetaRealDataQaCheck[] {
  const mockReport = input.mockReplacementReport || createMockReplacementValidationReport();
  const reviewedReport = input.reviewedContentGateReport || createReviewedContentIntegrationGateReport();
  return [
    validateBetaVocabularyDataQa(input),
    validateBetaPromiseClusterDataQa(input),
    validateBetaScriptureCanonDataQa(input),
    validateBetaCrossDataConnectionQa(input),
    check("beta_live_mock_replacement", "mock_replacement", "No unsupported mock content appears in live flows", mockReport.valid && !input.unsupportedMockContentLive, `${mockReport.replacedLiveEntries.length} live replacement entrie(s) recorded.`),
    check("beta_reviewed_content_gate", "reviewed_content_gate", "Review-only drafts do not appear in production recommendation data", reviewedReport.valid && !input.reviewedOnlyDraftContentLive, `${reviewedReport.eligibleItems.length} eligible reviewed item(s) available.`)
  ];
}

export function getBetaRealDataQaBlockers(input: TeoyubeBetaRealDataQaInput = {}): string[] {
  const dataReport = input.dataContractReport || createTeoyubeDataContractValidationReport();
  const mockReport = input.mockReplacementReport || createMockReplacementValidationReport();
  const reviewedReport = input.reviewedContentGateReport || createReviewedContentIntegrationGateReport();
  return [
    ...createBetaRealDataQaChecklist({ ...input, dataContractReport: dataReport, mockReplacementReport: mockReport, reviewedContentGateReport: reviewedReport })
      .filter((entry) => entry.required && !entry.passed)
      .map((entry) => `${entry.label}: ${entry.details}`),
    ...dataReport.blockers.map((entry) => entry.message),
    ...mockReport.blockers.map((entry) => entry.message),
    ...reviewedReport.blockers.map((entry) => entry.message)
  ];
}

export function getBetaRealDataQaWarnings(input: TeoyubeBetaRealDataQaInput = {}): string[] {
  const dataReport = input.dataContractReport || createTeoyubeDataContractValidationReport();
  const mockReport = input.mockReplacementReport || createMockReplacementValidationReport();
  const reviewedReport = input.reviewedContentGateReport || createReviewedContentIntegrationGateReport();
  return [
    ...dataReport.warnings.map((entry) => entry.message),
    ...mockReport.warnings.map((entry) => entry.message),
    ...reviewedReport.warnings.map((entry) => entry.message),
    "Human reviewer should manually confirm production recommendation surfaces do not show review-only draft content."
  ];
}

export function createBetaRealDataQaReport(input: TeoyubeBetaRealDataQaInput = {}): TeoyubeBetaRealDataQaReport {
  const blockers = getBetaRealDataQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checks: createBetaRealDataQaChecklist(input),
    results: input.results || [],
    blockers,
    warnings: getBetaRealDataQaWarnings(input),
    noExternalServicesRequired: true,
    noReviewedOnlyDraftContentLive: !input.reviewedOnlyDraftContentLive,
    noUnsupportedMockContentLive: !input.unsupportedMockContentLive,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
