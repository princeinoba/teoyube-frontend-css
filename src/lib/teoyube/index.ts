export {
  getCoreTeoyubeVocabulary as getCoreTeoyubeVocabularyData,
  getPromiseClustersData,
  getScriptureCanonData,
  findVocabularyItemById,
  findPromiseClusterById as findPromiseClusterDataById,
  findScriptureCanonEntryByReference,
  getNormalizedTeoyubeDataSnapshot,
  getDataHealthReport,
  type TeoyubeFlexibleDataRecord,
  type TeoyubeVocabularyDataItem,
  type TeoyubePromiseClusterDataItem,
  type TeoyubeScriptureCanonDataItem,
  type TeoyubeDataHealthReport
} from "./data/teoyube-data-access";
export type {
  TeoyubeTheme,
  TeoyubeScriptureAnchor,
  TeoyubeUnknownFields,
  TeoyubeVocabularyItem,
  TeoyubePromiseCluster as TeoyubeDataContractPromiseCluster,
  TeoyubeScriptureCanonEntry,
  TeoyubeWordConnection,
  TeoyubePromiseConnection,
  TeoyubeCallingConnection,
  TeoyubePrayerConnection,
  TeoyubeTigConnection,
  TeoyubeDataHealthIssue,
  TeoyubeDataContractValidationReport,
  TeoyubeNormalizedDataSnapshot
} from "./data/teoyube-data-contracts";
export * from "./data/teoyube-data-normalization";
export * from "./data/teoyube-data-contract-validation";
export * from "./data-access";
export * from "./phase-11-2-screenshot-guided-functionality";
export * from "./app-state";
export * from "./theology/theology-framework";
export * from "./promises/promise-engine";
export * from "./promises/promise-table";
export * from "./calling/calling-engine";
export * from "./language/teoyube-language-engine";
export * from "./adapters/word-card-adapter";
export * from "./adapters/prayer-companion-adapter";
export * from "./adapters/compass-experience-adapter";
export * from "./adapters/tig-response-panel-adapter";
export * from "./adapters/tig-graph-explorer-adapter";
export * from "./tig/tig-recommendation-contracts";
export * from "./tig/tig-recommendation-context";
export * from "./tig/tig-candidate-builder";
export * from "./tig/tig-recommendation-scoring";
export * from "./tig/tig-scripture-anchor-validation";
export * from "./tig/tig-explanation-trace";
export * from "./tig/tig-fallback-decision";
export * from "./tig/tig-end-to-end-recommendation-flow";
export * from "./tig/tig-real-data-qa-scenarios";
export * from "./tig/tig-real-data-qa-runner";
export * from "./journey";
export * from "./hooks/use-teoyube-word-card-context";
export * from "./hooks/use-prayer-companion-context";
export * from "./hooks/use-compass-experience-context";
export * from "./hooks/use-tig-response-panel-context";
export * from "./hooks/use-tig-graph-explorer-context";
export * from "./integration/phase-3-integration-validation";
export * from "./integration/phase-3-2-ui-integration-validation";
export * from "./integration/phase-3-3-ui-regression-contracts";
export * from "./integration/phase-3-3-ui-regression-checks";
export * from "./integration/phase-3-3-mock-replacement-validation";
export * from "./integration/phase-3-3-integration-audit";
export * from "./integration/phase-3-4-tig-end-to-end-validation";
export * from "./integration/phase-3-4-integration-audit";
export * from "./integration/phase-3-5-journey-integration-validation";
export * from "./integration/phase-3-5-integration-audit";
export * from "./qa";
export * from "./integration/phase-3-6-qa-accessibility-validation";
export * from "./integration/phase-3-6-integration-audit";
export type {
  TeoyubePhase3CompletionStatus,
  TeoyubePhase3CompletionArea,
  TeoyubePhase3CompletionCheck,
  TeoyubePhase3CompletionReport,
  TeoyubePhase3CompletionBlocker,
  TeoyubePhase3CompletionWarning,
  TeoyubePhase3CompletionDecision,
  TeoyubePhase3IntegrationLock,
  TeoyubePhase3LockedContract,
  TeoyubePhase3RemainingRisk
} from "./integration/phase-3-completion-contracts";
export * from "./integration/phase-3-completion-review";
export * from "./integration/phase-3-integration-lock";
export * from "./integration/phase-3-feature-inventory";
export * from "./integration/phase-3-remaining-risk-register";
export * from "./integration/phase-3-owner-review";
export * from "./integration/phase-3-completion-package";
export * from "./integration/phase-4-roadmap-contracts";
export * from "./integration/phase-4-roadmap-builder";
export * from "./integration/phase-3-final-integration-audit";
export * from "./phase-4";
export * from "./phase-5";
export * from "./phase-6";
export * from "./phase-7";
export * from "./phase-8";
export * from "./phase-9";
export * as phase10 from "./phase-10";
export * from "./examples/phase-3-intelligent-architecture-integration-example";
export * from "./examples/phase-3-intelligent-architecture-integration-smoke-check";
export * from "./examples/phase-3-2-live-ui-engine-connection-example";
export * from "./examples/phase-3-2-live-ui-engine-connection-smoke-check";
export * from "./examples/phase-3-3-data-contracts-ui-regression-example";
export * from "./examples/phase-3-3-data-contracts-ui-regression-smoke-check";
export * from "./examples/phase-3-4-tig-end-to-end-recommendation-example";
export * from "./examples/phase-3-4-tig-end-to-end-recommendation-smoke-check";
export * from "./examples/phase-3-5-user-journey-production-ui-example";
export * from "./examples/phase-3-5-user-journey-production-ui-smoke-check";
export * from "./examples/phase-3-6-real-user-journey-qa-example";
export * from "./examples/phase-3-6-real-user-journey-qa-smoke-check";
export * from "./examples/phase-3-7-completion-review-example";
export * from "./examples/phase-3-7-completion-review-smoke-check";
export * from "./examples/phase-4-1-product-experience-audit-example";
export * from "./examples/phase-4-1-product-experience-audit-smoke-check";
export * from "./examples/phase-4-2-product-surface-polish-example";
export * from "./examples/phase-4-2-product-surface-polish-smoke-check";
export * from "./examples/phase-4-3-content-review-queue-example";
export * from "./examples/phase-4-3-content-review-queue-smoke-check";
export * from "./examples/phase-4-4-reviewed-content-integration-example";
export * from "./examples/phase-4-4-reviewed-content-integration-smoke-check";
export * from "./examples/phase-4-5-controlled-admin-workflow-example";
export * from "./examples/phase-4-5-controlled-admin-workflow-smoke-check";
export * from "./examples/phase-4-6-beta-readiness-completion-example";
export * from "./examples/phase-4-6-beta-readiness-completion-smoke-check";
export * from "./examples/phase-5-1-controlled-beta-preparation-example";
export * from "./examples/phase-5-1-controlled-beta-preparation-smoke-check";
export * from "./examples/phase-5-2-manual-beta-qa-execution-example";
export * from "./examples/phase-5-2-manual-beta-qa-execution-smoke-check";
export * from "./examples/phase-5-3-beta-fix-queue-remediation-example";
export * from "./examples/phase-5-3-beta-fix-queue-remediation-smoke-check";
export * from "./examples/phase-5-4-controlled-beta-go-no-go-example";
export * from "./examples/phase-5-4-controlled-beta-go-no-go-smoke-check";
export * from "./examples/phase-5-5-completion-review-example";
export * from "./examples/phase-5-5-completion-review-smoke-check";
export * from "./examples/phase-6-1-controlled-beta-execution-plan-example";
export * from "./examples/phase-6-1-controlled-beta-execution-plan-smoke-check";
export * from "./examples/phase-6-2-manual-beta-dry-run-example";
export * from "./examples/phase-6-2-manual-beta-dry-run-smoke-check";
export * from "./examples/phase-6-3-dry-run-stabilization-example";
export * from "./examples/phase-6-3-dry-run-stabilization-smoke-check";
export * from "./examples/phase-6-4-completion-review-example";
export * from "./examples/phase-6-4-completion-review-smoke-check";
export * from "./examples/phase-7-1-controlled-beta-operations-example";
export * from "./examples/phase-7-1-controlled-beta-operations-smoke-check";
export * from "./examples/phase-7-2-feedback-review-stabilization-example";
export * from "./examples/phase-7-2-feedback-review-stabilization-smoke-check";
export * from "./examples/phase-7-3-product-stabilization-pass-example";
export * from "./examples/phase-7-3-product-stabilization-pass-smoke-check";
export * from "./examples/phase-7-4-completion-review-example";
export * from "./examples/phase-7-4-completion-review-smoke-check";
export * from "./examples/phase-8-1-post-beta-readiness-example";
export * from "./examples/phase-8-1-post-beta-readiness-smoke-check";
export * from "./examples/phase-8-2-product-hardening-example";
export * from "./examples/phase-8-2-product-hardening-smoke-check";
export * from "./examples/phase-8-3-privacy-security-service-decision-example";
export * from "./examples/phase-8-3-privacy-security-service-decision-smoke-check";
export * from "./examples/phase-8-4-public-release-candidate-example";
export * from "./examples/phase-8-4-public-release-candidate-smoke-check";
export * from "./examples/phase-9-1-controlled-public-release-preparation-example";
export * from "./examples/phase-9-1-controlled-public-release-preparation-smoke-check";
export * from "./examples/phase-9-2-public-release-candidate-qa-example";
export * from "./examples/phase-9-2-public-release-candidate-qa-smoke-check";
export * from "./examples/phase-9-3-release-candidate-fix-queue-example";
export * from "./examples/phase-9-3-release-candidate-fix-queue-smoke-check";
export * from "./examples/phase-9-4-controlled-public-go-no-go-example";
export * from "./examples/phase-9-4-controlled-public-go-no-go-smoke-check";
export * from "./examples/phase-9-5-completion-review-example";
export * from "./examples/phase-9-5-completion-review-smoke-check";
export * from "./examples/phase-10-1-controlled-public-release-execution-example";
export * from "./examples/phase-10-1-controlled-public-release-execution-smoke-check";
export * from "./examples/phase-10-2-route-build-smoke-check";
export * from "./examples/phase-10-3-controlled-release-smoke-check";
export * from "./examples/phase-10-4-post-release-stabilization-smoke-check";
export * from "./examples/phase-10-5-first-week-stabilization-smoke-check";
export * from "./examples/phase-10-6-controlled-expansion-readiness-smoke-check";
export * from "./examples/phase-10-7-stabilized-operations-smoke-check";
export * from "./examples/phase-11-1-real-app-functionality-smoke-check";
export * from "./examples/phase-11-1-real-app-productization-smoke-check";
export * from "./examples/phase-11-2-screenshot-guided-ui-functionality-smoke-check";
export * from "./examples/phase-11-3-runtime-consolidation-smoke-check";
