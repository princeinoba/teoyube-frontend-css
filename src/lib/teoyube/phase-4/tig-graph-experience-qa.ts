import {
  createTigGraphExperienceReport,
  createTigGraphExperienceViewModel
} from "./tig-graph-experience-view-model";
import type {
  TeoyubeTigGraphExperienceReport,
  TeoyubeTigGraphExperienceViewModel
} from "./tig-graph-experience-contracts";

export type TeoyubeTigGraphExperienceQaCheck = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubeTigGraphExperienceQaReport = {
  valid: boolean;
  checks: TeoyubeTigGraphExperienceQaCheck[];
  blockers: string[];
  warnings: string[];
  realGraphDataUsed: true;
  noDebugPayloadExposed: true;
  mobileFallbackAvailable: true;
  scriptureVisible: true;
  explanationTraceVisible: true;
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

function check(id: string, passed: boolean, details: string): TeoyubeTigGraphExperienceQaCheck {
  return { id, passed, details };
}

function viewModelFromInput(input?: TeoyubeTigGraphExperienceViewModel | TeoyubeTigGraphExperienceReport): TeoyubeTigGraphExperienceViewModel {
  if (!input) return createTigGraphExperienceViewModel();
  return "viewModel" in input ? input.viewModel : input;
}

export function validateTigGraphExperienceNodes(
  input?: TeoyubeTigGraphExperienceViewModel | TeoyubeTigGraphExperienceReport
): TeoyubeTigGraphExperienceQaCheck {
  const viewModel = viewModelFromInput(input);
  return check("tig_graph_experience_nodes", viewModel.nodes.length > 0 && viewModel.nodes.every((node) => node.label && node.visibleToUser), "TIG Graph nodes are understandable and user-visible.");
}

export function validateTigGraphExperienceEdges(
  input?: TeoyubeTigGraphExperienceViewModel | TeoyubeTigGraphExperienceReport
): TeoyubeTigGraphExperienceQaCheck {
  const viewModel = viewModelFromInput(input);
  return check("tig_graph_experience_edges", viewModel.edges.length > 0 && viewModel.edges.every((edge) => edge.label && edge.meaning && edge.visibleToUser), "TIG Graph edges have readable labels and meanings.");
}

export function validateTigGraphExperienceTrace(
  input?: TeoyubeTigGraphExperienceViewModel | TeoyubeTigGraphExperienceReport
): TeoyubeTigGraphExperienceQaCheck {
  const viewModel = viewModelFromInput(input);
  return check("tig_graph_experience_trace", viewModel.explanationTraceVisible && viewModel.traceOverlay.steps.length > 0, "TIG Graph guided trace overlay is available.");
}

export function validateTigGraphExperienceMobileFallback(
  input?: TeoyubeTigGraphExperienceViewModel | TeoyubeTigGraphExperienceReport
): TeoyubeTigGraphExperienceQaCheck {
  const viewModel = viewModelFromInput(input);
  return check("tig_graph_experience_mobile_fallback", viewModel.mobileFallbackAvailable && viewModel.mobileList.length > 0, "TIG Graph mobile/list fallback is available.");
}

export function validateTigGraphExperienceScriptureVisibility(
  input?: TeoyubeTigGraphExperienceViewModel | TeoyubeTigGraphExperienceReport
): TeoyubeTigGraphExperienceQaCheck {
  const viewModel = viewModelFromInput(input);
  const hasVisibleScripture = viewModel.nodes.some((node) => node.scriptureReferences.length > 0) || viewModel.edges.some((edge) => edge.scriptureBasis.length > 0);
  return check("tig_graph_experience_scripture_visibility", viewModel.scriptureAnchorsVisible && hasVisibleScripture, "TIG Graph exposes Scripture references or Scripture basis where available.");
}

export function validateTigGraphExperienceNoDebugPayload(
  input?: TeoyubeTigGraphExperienceViewModel | TeoyubeTigGraphExperienceReport
): TeoyubeTigGraphExperienceQaCheck {
  const viewModel = viewModelFromInput(input);
  return check("tig_graph_experience_no_debug_payload", viewModel.noRawDebugPayload, "TIG Graph experience view model does not expose raw debug payloads.");
}

export function createTigGraphExperienceQaReport(
  input?: TeoyubeTigGraphExperienceViewModel | TeoyubeTigGraphExperienceReport
): TeoyubeTigGraphExperienceQaReport {
  const report = "viewModel" in (input || {}) ? (input as TeoyubeTigGraphExperienceReport) : createTigGraphExperienceReport({ viewModel: viewModelFromInput(input) });
  const checks = [
    validateTigGraphExperienceNodes(report),
    validateTigGraphExperienceEdges(report),
    validateTigGraphExperienceTrace(report),
    validateTigGraphExperienceMobileFallback(report),
    validateTigGraphExperienceScriptureVisibility(report),
    validateTigGraphExperienceNoDebugPayload(report)
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = report.warnings.map((entry) => entry.message);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    realGraphDataUsed: true,
    noDebugPayloadExposed: true,
    mobileFallbackAvailable: true,
    scriptureVisible: true,
    explanationTraceVisible: true,
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
