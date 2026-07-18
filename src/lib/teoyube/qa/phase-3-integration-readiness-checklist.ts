import { createTeoyubeDataContractValidationReport } from "../data/teoyube-data-contract-validation";
import { createPhase34TigEndToEndValidationReport } from "../integration/phase-3-4-tig-end-to-end-validation";
import { runPhase34IntegrationAudit } from "../integration/phase-3-4-integration-audit";
import { createPhase35JourneyIntegrationReport } from "../integration/phase-3-5-journey-integration-validation";
import { runPhase35IntegrationAudit } from "../integration/phase-3-5-integration-audit";
import { createMockReplacementValidationReport } from "../integration/phase-3-3-mock-replacement-validation";
import { createPhase33UiRegressionReport } from "../integration/phase-3-3-ui-regression-checks";
import type { TeoyubeUserJourneyInput } from "../journey/user-journey-contracts";
import { createTeoyubeAccessibilityQaReport } from "./accessibility-qa-runner";
import { createMobileJourneyQaReport } from "./mobile-journey-qa-runner";
import { runRealUserJourneyQa } from "./real-user-journey-qa-runner";
import { createScriptureExplanationConfidenceQaReport } from "./scripture-explanation-confidence-qa";

export type TeoyubePhase3IntegrationReadinessStatus = "ready" | "ready_with_warnings" | "blocked";

export type TeoyubePhase3IntegrationReadinessDecision =
  | "ready_for_phase_3_7"
  | "ready_with_manual_review"
  | "needs_accessibility_fix"
  | "needs_mobile_fix"
  | "needs_scripture_or_trace_fix"
  | "blocked";

export type TeoyubePhase3IntegrationReadinessChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
  blockers: string[];
  warnings: string[];
};

export type TeoyubePhase3IntegrationReadinessReport = {
  valid: boolean;
  status: TeoyubePhase3IntegrationReadinessStatus;
  decision: TeoyubePhase3IntegrationReadinessDecision;
  checklist: TeoyubePhase3IntegrationReadinessChecklistItem[];
  blockers: string[];
  warnings: string[];
  nextStep: "Phase 3.7 - Phase 3 Completion Review, Integration Lock & Phase 4 Roadmap";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(
  id: string,
  label: string,
  complete: boolean,
  details: string,
  blockers: string[] = [],
  warnings: string[] = []
): TeoyubePhase3IntegrationReadinessChecklistItem {
  return { id, label, complete, details, blockers, warnings };
}

export function getPhase3IntegrationReadinessChecklist(
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase3IntegrationReadinessChecklistItem[] {
  const dataContracts = createTeoyubeDataContractValidationReport();
  const mockReplacement = createMockReplacementValidationReport();
  const uiRegression = createPhase33UiRegressionReport();
  const phase34Validation = createPhase34TigEndToEndValidationReport();
  const phase34Audit = runPhase34IntegrationAudit();
  const phase35Validation = createPhase35JourneyIntegrationReport();
  const phase35Audit = runPhase35IntegrationAudit();
  const realJourneyQa = runRealUserJourneyQa();
  const accessibilityQa = createTeoyubeAccessibilityQaReport(input);
  const mobileQa = createMobileJourneyQaReport(input);
  const scriptureQa = createScriptureExplanationConfidenceQaReport(input);

  return [
    item("data_contracts", "Real data contracts remain valid", dataContracts.valid, `Loaded ${dataContracts.vocabularyCount} word(s), ${dataContracts.promiseClusterCount} promise cluster(s), and ${dataContracts.scriptureCanonCount} Scripture canon entrie(s).`, dataContracts.blockers.map((entry) => entry.message), dataContracts.warnings.map((entry) => entry.message)),
    item("mock_replacement", "Live mock replacement remains valid", mockReplacement.valid, `Validated ${mockReplacement.replacedLiveEntries.length} replaced live surface(s).`, mockReplacement.blockers.map((entry) => entry.message), mockReplacement.warnings.map((entry) => entry.message)),
    item("ui_regression", "Phase 3.3 UI regression remains valid", uiRegression.valid, `Ran ${uiRegression.checks.length} UI regression check(s).`, uiRegression.blockers.map((entry) => entry.message), uiRegression.warnings.map((entry) => entry.message)),
    item("tig_end_to_end", "Phase 3.4 TIG flow remains valid", phase34Validation.valid && phase34Audit.complete, `Phase 3.4 validation status: ${phase34Validation.status}.`, [...phase34Validation.blockers, ...phase34Audit.blockers], [...phase34Validation.warnings, ...phase34Audit.warnings]),
    item("journey_state_flow", "Phase 3.5 journey flow remains valid", phase35Validation.valid && phase35Audit.complete, `Phase 3.5 validation status: ${phase35Validation.status}.`, [...phase35Validation.blockers, ...phase35Audit.blockers], [...phase35Validation.warnings, ...phase35Audit.warnings]),
    item("real_user_journey_qa", "Real user journey QA passes", realJourneyQa.valid, `Ran ${realJourneyQa.scenarioCount} real user journey scenario(s).`, realJourneyQa.blockers.map((entry) => entry.message), realJourneyQa.warnings.map((entry) => entry.message)),
    item("accessibility_qa", "Accessibility QA basics pass", accessibilityQa.valid, `Accessibility QA checked ${accessibilityQa.results.length} surface(s).`, accessibilityQa.blockers.map((entry) => entry.message), accessibilityQa.warnings.map((entry) => entry.message)),
    item("mobile_qa", "Mobile journey QA basics pass", mobileQa.valid, `Mobile QA checked ${mobileQa.results.length} surface(s).`, mobileQa.blockers.map((entry) => entry.message), mobileQa.warnings.map((entry) => entry.message)),
    item("scripture_trace_confidence", "Scripture, trace, confidence, and fallback QA passes", scriptureQa.valid, `Ran ${scriptureQa.checks.length} Scripture/explanation/confidence check(s).`, scriptureQa.blockers.map((entry) => entry.message), scriptureQa.warnings.map((entry) => entry.message)),
    item("restricted_services_disabled", "Restricted services remain disabled", realJourneyQa.noExternalServicesRequired && realJourneyQa.noDatabasePersistenceEnabled && realJourneyQa.noAnalyticsEnabled && realJourneyQa.noLiveAiOrchestrationEnabled && realJourneyQa.noBrowserPersistenceRequired && realJourneyQa.inMemoryOnly, "QA confirms local-only in-memory behavior with no external services, persistence, analytics, live AI orchestration, or browser persistence."),
    item("manual_review_ready", "Manual browser/device review is ready", accessibilityQa.valid && mobileQa.valid, "Reports surface manual accessibility/mobile follow-up without blocking local integration readiness.", [], [...accessibilityQa.warnings.map((entry) => entry.message), ...mobileQa.warnings.map((entry) => entry.message)])
  ];
}

export function validatePhase3IntegrationReadiness(
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase3IntegrationReadinessChecklistItem[] {
  return getPhase3IntegrationReadinessChecklist(input);
}

export function getPhase3IntegrationReadinessBlockers(input: TeoyubeUserJourneyInput = {}): string[] {
  return getPhase3IntegrationReadinessChecklist(input).flatMap((entry) => entry.blockers);
}

export function getPhase3IntegrationReadinessWarnings(input: TeoyubeUserJourneyInput = {}): string[] {
  return getPhase3IntegrationReadinessChecklist(input).flatMap((entry) => entry.warnings);
}

export function createPhase3IntegrationReadinessDecision(
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase3IntegrationReadinessDecision {
  const blockers = getPhase3IntegrationReadinessBlockers(input);
  const warnings = getPhase3IntegrationReadinessWarnings(input);
  if (blockers.some((entry) => /accessibility/i.test(entry))) return "needs_accessibility_fix";
  if (blockers.some((entry) => /mobile|graph/i.test(entry))) return "needs_mobile_fix";
  if (blockers.some((entry) => /scripture|trace|confidence|fallback/i.test(entry))) return "needs_scripture_or_trace_fix";
  if (blockers.length) return "blocked";
  return warnings.length ? "ready_with_manual_review" : "ready_for_phase_3_7";
}

export function createPhase3IntegrationReadinessReport(
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase3IntegrationReadinessReport {
  const checklist = getPhase3IntegrationReadinessChecklist(input);
  const blockers = checklist.flatMap((entry) => entry.blockers);
  const warnings = checklist.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision: createPhase3IntegrationReadinessDecision(input),
    checklist,
    blockers,
    warnings,
    nextStep: "Phase 3.7 - Phase 3 Completion Review, Integration Lock & Phase 4 Roadmap",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
