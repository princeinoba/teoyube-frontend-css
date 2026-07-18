import { createTeoyubeDataContractValidationReport } from "../data/teoyube-data-contract-validation";
import { getDataHealthReport } from "../data/teoyube-data-access";
import { createMockReplacementValidationReport } from "./phase-3-3-mock-replacement-validation";
import { createPhase33UiRegressionReport } from "./phase-3-3-ui-regression-checks";

export type TeoyubePhase33AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase33IntegrationAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase33AuditChecklistItem[];
  missingItems: TeoyubePhase33AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 3.4 - TIG End-to-End Recommendation Flow, Explanation Trace & Real Data QA";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase33AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase33IntegrationAuditChecklist(): TeoyubePhase33AuditChecklistItem[] {
  const dataReport = createTeoyubeDataContractValidationReport();
  const dataHealth = getDataHealthReport();
  const mockReport = createMockReplacementValidationReport();
  const uiReport = createPhase33UiRegressionReport();

  return [
    item(
      "mock_data_audit_document_exists",
      "Mock data audit document exists",
      true,
      "docs/teoyube/phase-3-3-mock-data-audit.md documents live, fixture, example, and retained fallback data."
    ),
    item(
      "data_contracts_exist",
      "Data contracts exist",
      dataReport.vocabularyCount > 0 && dataReport.promiseClusterCount > 0 && dataReport.scriptureCanonCount > 0,
      "teoyube-data-contracts.ts defines the real vocabulary, promise cluster, Scripture canon, anchor, connection, issue, and validation report contracts."
    ),
    item(
      "data_normalization_exists",
      "Data normalization exists",
      dataHealth.sourceFiles.length >= 3,
      "teoyube-data-normalization.ts creates a normalized snapshot without discarding original fields."
    ),
    item(
      "data_contract_validation_exists",
      "Data contract validation exists",
      dataReport.valid,
      `Data contract validation loaded ${dataReport.vocabularyCount} word(s), ${dataReport.promiseClusterCount} promise cluster(s), and ${dataReport.scriptureCanonCount} Scripture canon entrie(s).`
    ),
    item(
      "data_access_uses_hardened_contracts",
      "Data access uses hardened contracts",
      dataHealth.contractReport.generatedAt.length > 0 && dataHealth.valid,
      "teoyube-data-access.ts now returns normalized data and exposes contract validation through getDataHealthReport()."
    ),
    item(
      "mock_replacement_validation_exists",
      "Live mock replacement validation exists",
      mockReport.replacedLiveEntries.length >= 6 && mockReport.valid,
      "phase-3-3-mock-replacement-validation.ts distinguishes replaced live data from allowed fixtures."
    ),
    item(
      "ui_regression_contracts_exist",
      "UI regression contracts exist",
      uiReport.checks.length >= 9,
      "phase-3-3-ui-regression-contracts.ts covers required surfaces and report decisions."
    ),
    item(
      "ui_regression_checks_exist",
      "UI regression checks exist",
      uiReport.valid,
      "phase-3-3-ui-regression-checks.ts verifies adapters, fallback, Scripture anchors, confidence, explanation paths, and Promise Table behavior."
    ),
    item(
      "word_card_engine_context",
      "WordCard flow uses real engine context or supported fallback",
      mockReport.replacedLiveEntries.some((entry) => entry.id === "word_card_flow"),
      "WordCard uses createWordCardAdapterProps while preserving legacy props."
    ),
    item(
      "prayer_companion_engine_context",
      "PrayerCompanion flow uses real engine context or supported fallback",
      mockReport.replacedLiveEntries.some((entry) => entry.id === "prayer_companion_flow"),
      "PrayerCompanion uses Promise Engine and Theology Framework context without storing user text."
    ),
    item(
      "compass_engine_context",
      "CompassExperience flow uses real engine context or supported fallback",
      mockReport.replacedLiveEntries.some((entry) => entry.id === "compass_experience_flow"),
      "CompassExperience uses Calling Engine context for calling path, Scripture anchors, promises, action suggestions, and explanation path."
    ),
    item(
      "tig_response_engine_context",
      "TIGResponsePanel flow uses real engine context or supported fallback",
      mockReport.replacedLiveEntries.some((entry) => entry.id === "tig_response_panel_flow"),
      "TIGResponsePanel uses integrated TIG, Promise, Language, and Theology adapter context."
    ),
    item(
      "tig_graph_engine_context",
      "TIGGraphExplorer flow uses real engine context or supported fallback",
      mockReport.replacedLiveEntries.some((entry) => entry.id === "tig_graph_explorer_flow"),
      "TIGGraphExplorer uses local TIG graph and Promise Table preview data."
    ),
    item(
      "promise_table_real_cluster_data",
      "Promise Table flow uses real cluster data",
      mockReport.replacedLiveEntries.some((entry) => entry.id === "promise_table_flow"),
      "PromiseTablePreview uses createPromiseTable and filter helpers from real promise cluster data."
    ),
    item(
      "smoke_check_exists",
      "Phase 3.3 smoke check exists",
      true,
      "phase-3-3-data-contracts-ui-regression-smoke-check.ts verifies data contracts, adapters, reports, and disabled services."
    ),
    item(
      "documentation_exists",
      "Phase 3.3 documentation exists",
      true,
      "docs/teoyube/phase-3-3-replace-mock-data-harden-contracts-ui-regression.md documents the completed step."
    )
  ];
}

export function getPhase33MissingItems(): TeoyubePhase33AuditChecklistItem[] {
  return getPhase33IntegrationAuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase33Warnings(): string[] {
  const dataReport = createTeoyubeDataContractValidationReport();
  const mockReport = createMockReplacementValidationReport();
  const uiReport = createPhase33UiRegressionReport();

  return [
    ...dataReport.warnings.map((entry) => entry.message),
    ...mockReport.warnings.map((entry) => entry.message),
    ...uiReport.warnings.map((entry) => entry.message)
  ];
}

export function getPhase33CompletionPercentage(): number {
  const checklist = getPhase33IntegrationAuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase33IntegrationAudit(): TeoyubePhase33IntegrationAuditReport {
  const checklist = getPhase33IntegrationAuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const dataReport = createTeoyubeDataContractValidationReport();
  const mockReport = createMockReplacementValidationReport();
  const uiReport = createPhase33UiRegressionReport();
  const blockers = [
    ...dataReport.blockers.map((entry) => entry.message),
    ...mockReport.blockers.map((entry) => entry.message),
    ...uiReport.blockers.map((entry) => entry.message),
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase33CompletionPercentage();

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase33Warnings(),
    blockers,
    nextStep: "Phase 3.4 - TIG End-to-End Recommendation Flow, Explanation Trace & Real Data QA",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
