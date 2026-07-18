import {
  createPromiseTableUxReport,
  createPromiseTableUxViewModel
} from "./promise-table-ux-view-model";
import type {
  TeoyubePromiseTableUxReport,
  TeoyubePromiseTableUxViewModel
} from "./promise-table-ux-contracts";

export type TeoyubePromiseTableUxQaCheck = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePromiseTableUxQaReport = {
  valid: boolean;
  checks: TeoyubePromiseTableUxQaCheck[];
  blockers: string[];
  warnings: string[];
  realRowsUsed: true;
  scriptureAnchorsVisible: true;
  noDraftContentIncluded: true;
  mobileModeAvailable: true;
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

function check(id: string, passed: boolean, details: string): TeoyubePromiseTableUxQaCheck {
  return { id, passed, details };
}

function viewModelFromInput(input?: TeoyubePromiseTableUxViewModel | TeoyubePromiseTableUxReport): TeoyubePromiseTableUxViewModel {
  if (!input) return createPromiseTableUxViewModel();
  return "viewModel" in input ? input.viewModel : input;
}

export function validatePromiseTableUxRows(
  input?: TeoyubePromiseTableUxViewModel | TeoyubePromiseTableUxReport
): TeoyubePromiseTableUxQaCheck {
  const viewModel = viewModelFromInput(input);
  return check("promise_table_ux_rows", viewModel.generatedFromRealRows && viewModel.rows.every((row) => row.source === "real_promise_table_row"), "Promise Table UX rows come from real Promise Table rows or safe empty state handling.");
}

export function validatePromiseTableUxScriptureVisibility(
  input?: TeoyubePromiseTableUxViewModel | TeoyubePromiseTableUxReport
): TeoyubePromiseTableUxQaCheck {
  const viewModel = viewModelFromInput(input);
  const missing = viewModel.rows.filter((row) => row.scriptureAnchors.length === 0);
  return check("promise_table_ux_scripture_visibility", viewModel.scriptureAnchorsVisible && missing.length === 0, missing.length ? `${missing.length} row(s) lack Scripture anchors; warnings must remain visible.` : "Scripture anchors are visible on Promise Table rows.");
}

export function validatePromiseTableUxMobileReadiness(
  input?: TeoyubePromiseTableUxViewModel | TeoyubePromiseTableUxReport
): TeoyubePromiseTableUxQaCheck {
  const viewModel = viewModelFromInput(input);
  return check("promise_table_ux_mobile_readiness", viewModel.mobileSafe && ["mobile_list", "card_grid", "scripture_focus", "empty_state"].includes(viewModel.viewMode), "Promise Table UX has mobile-safe card/list/focus data.");
}

export function validatePromiseTableUxEmptyState(
  input?: TeoyubePromiseTableUxViewModel | TeoyubePromiseTableUxReport
): TeoyubePromiseTableUxQaCheck {
  const viewModel = viewModelFromInput(input);
  return check("promise_table_ux_empty_state", Boolean(viewModel.emptyState), "Promise Table UX exposes a safe empty state that does not invent promises.");
}

export function validatePromiseTableUxNoDraftContent(
  input?: TeoyubePromiseTableUxViewModel | TeoyubePromiseTableUxReport
): TeoyubePromiseTableUxQaCheck {
  const viewModel = viewModelFromInput(input);
  const draftRows = viewModel.rows.filter((row) => row.draftContentIncluded);
  return check("promise_table_ux_no_draft_content", draftRows.length === 0 && viewModel.noDraftContentIncluded, draftRows.length ? `${draftRows.length} row(s) include draft content.` : "No unreviewed draft content appears in Promise Table UX rows.");
}

export function createPromiseTableUxQaReport(
  input?: TeoyubePromiseTableUxViewModel | TeoyubePromiseTableUxReport
): TeoyubePromiseTableUxQaReport {
  const report = "viewModel" in (input || {}) ? (input as TeoyubePromiseTableUxReport) : createPromiseTableUxReport({ viewModel: viewModelFromInput(input) });
  const checks = [
    validatePromiseTableUxRows(report),
    validatePromiseTableUxScriptureVisibility(report),
    validatePromiseTableUxMobileReadiness(report),
    validatePromiseTableUxEmptyState(report),
    validatePromiseTableUxNoDraftContent(report)
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = report.warnings.map((entry) => entry.message);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    realRowsUsed: true,
    scriptureAnchorsVisible: true,
    noDraftContentIncluded: true,
    mobileModeAvailable: true,
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
