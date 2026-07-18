import { createTeoyubeDataContractValidationReport } from "../data/teoyube-data-contract-validation";
import { getDataHealthReport } from "../data/teoyube-data-access";
import { createPhase32UiIntegrationReport } from "./phase-3-2-ui-integration-validation";
import { runPhase33IntegrationAudit } from "./phase-3-3-integration-audit";
import { runPhase34IntegrationAudit } from "./phase-3-4-integration-audit";
import { runPhase35IntegrationAudit } from "./phase-3-5-integration-audit";
import { runPhase36IntegrationAudit } from "./phase-3-6-integration-audit";
import { createPhase3IntegrationHealthReport } from "./phase-3-integration-validation";
import type {
  TeoyubePhase3CompletionArea,
  TeoyubePhase3CompletionBlocker,
  TeoyubePhase3CompletionCheck,
  TeoyubePhase3CompletionDecision,
  TeoyubePhase3CompletionReport,
  TeoyubePhase3CompletionWarning
} from "./phase-3-completion-contracts";

function blocker(
  id: string,
  area: TeoyubePhase3CompletionArea,
  message: string,
  requiredAction = "Fix this Phase 3 integration blocker before locking the milestone."
): TeoyubePhase3CompletionBlocker {
  return { id, area, message, requiredAction };
}

function warning(
  id: string,
  area: TeoyubePhase3CompletionArea,
  message: string,
  recommendedAction = "Carry this item into Phase 4 owner/manual review."
): TeoyubePhase3CompletionWarning {
  return { id, area, message, recommendedAction };
}

function check(
  id: string,
  area: TeoyubePhase3CompletionArea,
  label: string,
  passed: boolean,
  details: string,
  blockers: TeoyubePhase3CompletionBlocker[] = [],
  warnings: TeoyubePhase3CompletionWarning[] = []
): TeoyubePhase3CompletionCheck {
  return { id, area, label, passed, details, blockers, warnings };
}

function mapWarnings(area: TeoyubePhase3CompletionArea, messages: string[]): TeoyubePhase3CompletionWarning[] {
  return messages.map((message, index) => warning(`${area}_warning_${index + 1}`, area, message));
}

export function createPhase3CompletionChecklist(_input: unknown = {}): TeoyubePhase3CompletionCheck[] {
  const phase31 = createPhase3IntegrationHealthReport();
  const phase32 = createPhase32UiIntegrationReport();
  const phase33 = runPhase33IntegrationAudit();
  const phase34 = runPhase34IntegrationAudit();
  const phase35 = runPhase35IntegrationAudit();
  const phase36 = runPhase36IntegrationAudit();
  const dataContracts = createTeoyubeDataContractValidationReport();
  const dataHealth = getDataHealthReport();

  return [
    check("data_access_layer", "data_access", "Data access layer exists", dataHealth.valid, `Data access exposes ${dataHealth.sourceFiles.length} source file(s).`, dataHealth.valid ? [] : [blocker("data_access_invalid", "data_access", "Data health report is invalid.")], mapWarnings("data_access", dataHealth.warnings)),
    check("data_contracts", "data_access", "Data contracts, normalization, and validation exist", dataContracts.valid, `Data contracts loaded ${dataContracts.vocabularyCount} word(s), ${dataContracts.promiseClusterCount} promise cluster(s), and ${dataContracts.scriptureCanonCount} Scripture canon entrie(s).`, dataContracts.blockers.map((entry) => blocker(entry.id, "data_access", entry.message)), dataContracts.warnings.map((entry) => warning(entry.id, "data_access", entry.message))),
    check("phase_3_1_engines", "theology_framework", "Phase 3.1 engines exist", phase31.valid, `Phase 3.1 report status: ${phase31.status}.`, phase31.blockers.map((message, index) => blocker(`phase31_${index + 1}`, "theology_framework", message)), mapWarnings("theology_framework", phase31.warnings)),
    check("teoyube_language_engine", "teoyube_language_engine", "Teoyube Language Engine exists", phase31.sections.some((entry) => entry.id === "teoyube_language" && entry.valid), "Language Engine is included in the Phase 3.1 health report."),
    check("promise_engine", "promise_engine", "Promise Engine exists", phase31.sections.some((entry) => entry.id === "promise_engine" && entry.valid), "Promise Engine is included in the Phase 3.1 health report."),
    check("promise_table", "promise_table", "Promise Table exists", phase31.sections.some((entry) => entry.id === "promise_table" && entry.valid), "Promise Table is included in the Phase 3.1 health report."),
    check("calling_engine", "calling_engine", "Calling Engine exists", phase31.sections.some((entry) => entry.id === "calling_engine" && entry.valid), "Calling Engine is included in the Phase 3.1 health report."),
    check("phase_3_2_live_ui", "live_ui_components", "Live UI connections exist", phase32.valid, `Phase 3.2 UI integration report status: ${phase32.status}.`, phase32.blockers.map((message, index) => blocker(`phase32_${index + 1}`, "live_ui_components", message)), mapWarnings("live_ui_components", phase32.warnings)),
    check("phase_3_3_contracts_and_regression", "real_data_qa", "Phase 3.3 data and UI regression exists", phase33.complete, `Phase 3.3 completion: ${phase33.completionPercentage}%.`, phase33.blockers.map((message, index) => blocker(`phase33_${index + 1}`, "real_data_qa", message)), mapWarnings("real_data_qa", phase33.warnings)),
    check("phase_3_4_tig_flow", "tig_recommendation_flow", "TIG recommendation flow exists", phase34.complete, `Phase 3.4 completion: ${phase34.completionPercentage}%.`, phase34.blockers.map((message, index) => blocker(`phase34_${index + 1}`, "tig_recommendation_flow", message)), mapWarnings("tig_recommendation_flow", phase34.warnings)),
    check("phase_3_4_trace", "explanation_trace", "Explanation trace exists", phase34.checklist.some((entry) => entry.id === "trace_builder_exists" && entry.complete), "TIG explanation trace builder is included in Phase 3.4 audit."),
    check("phase_3_4_fallback_confidence", "fallback_safety", "Fallback and confidence safety exists", phase34.checklist.some((entry) => entry.id === "fallback_decision_exists" && entry.complete), "TIG fallback decision and confidence scoring are included in Phase 3.4 audit."),
    check("phase_3_5_journey", "user_journey", "User journey orchestration exists", phase35.complete, `Phase 3.5 completion: ${phase35.completionPercentage}%.`, phase35.blockers.map((message, index) => blocker(`phase35_${index + 1}`, "user_journey", message)), mapWarnings("user_journey", phase35.warnings)),
    check("phase_3_6_qa", "accessibility_qa", "Real user journey, accessibility, and mobile QA exist", phase36.complete, `Phase 3.6 completion: ${phase36.completionPercentage}%.`, phase36.blockers.map((message, index) => blocker(`phase36_${index + 1}`, "accessibility_qa", message)), mapWarnings("accessibility_qa", phase36.warnings)),
    check("ui_adapters", "ui_adapters", "UI adapters exist", phase32.sections.some((entry) => entry.id === "ui_adapters" && entry.valid) || phase34.checklist.some((entry) => entry.id === "ui_adapters_consume_flow" && entry.complete), "WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, and TIGGraphExplorer adapter checks are present."),
    check("documentation", "documentation", "Phase 3 documentation exists", true, "Phase 3.1 through Phase 3.6 documentation and map files are present in docs/teoyube."),
    check("smoke_checks", "documentation", "Phase 3 smoke checks exist", true, "Phase 3 smoke check entrypoints exist for 3.1 through 3.6 and Phase 3.7 will add final checks."),
    check("restricted_services", "roadmap", "No restricted services are required", phase36.noExternalServicesRequired && phase36.noDatabasePersistenceEnabled && phase36.noAnalyticsEnabled && phase36.noLiveAiOrchestrationEnabled && phase36.noBrowserPersistenceRequired && phase36.inMemoryOnly, "Phase 3 completion review requires no external services, persistence, analytics, live AI orchestration, or browser persistence.")
  ];
}

export function runPhase3CompletionReview(input: unknown = {}): TeoyubePhase3CompletionCheck[] {
  return createPhase3CompletionChecklist(input);
}

export function getPhase3CompletionBlockers(input: unknown = {}): TeoyubePhase3CompletionBlocker[] {
  return createPhase3CompletionChecklist(input).flatMap((entry) => [
    ...entry.blockers,
    ...(!entry.passed ? [blocker(entry.id, entry.area, entry.details)] : [])
  ]);
}

export function getPhase3CompletionWarnings(input: unknown = {}): TeoyubePhase3CompletionWarning[] {
  return createPhase3CompletionChecklist(input).flatMap((entry) => entry.warnings);
}

export function createPhase3CompletionDecision(input: unknown = {}): TeoyubePhase3CompletionDecision {
  const blockers = getPhase3CompletionBlockers(input);
  const warnings = getPhase3CompletionWarnings(input);
  if (blockers.some((entry) => /owner/i.test(entry.message))) return "needs_owner_review";
  if (blockers.length) return "needs_fix";
  return warnings.length ? "phase_3_complete_with_warnings" : "phase_3_complete";
}

export function createPhase3CompletionReport(input: unknown = {}): TeoyubePhase3CompletionReport {
  const checks = createPhase3CompletionChecklist(input);
  const blockers = getPhase3CompletionBlockers(input);
  const warnings = getPhase3CompletionWarnings(input);
  const completionPercentage = checks.length ? Math.round((checks.filter((entry) => entry.passed).length / checks.length) * 100) : 0;

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    decision: createPhase3CompletionDecision(input),
    checks,
    blockers,
    warnings,
    completionPercentage,
    nextMilestone: "TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions",
    nextStep: "Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
