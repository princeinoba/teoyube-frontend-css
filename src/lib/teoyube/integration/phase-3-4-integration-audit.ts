import { createPhase34TigEndToEndValidationReport } from "./phase-3-4-tig-end-to-end-validation";
import { runTigRealDataQa } from "../tig/tig-real-data-qa-runner";

export type TeoyubePhase34AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase34IntegrationAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase34AuditChecklistItem[];
  missingItems: TeoyubePhase34AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 3.5 - User Journey Integration, State Flow & Production UI Polish";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase34AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase34IntegrationAuditChecklist(): TeoyubePhase34AuditChecklistItem[] {
  const validation = createPhase34TigEndToEndValidationReport();
  const qa = runTigRealDataQa();

  return [
    item("contracts_exist", "TIG recommendation contracts exist", true, "tig-recommendation-contracts.ts defines Phase 3.4 input, context, candidate, result, confidence, fallback, trace, QA, and report contracts."),
    item("context_builder_exists", "Context builder exists", validation.sections.some((entry) => entry.id === "tig_context_builder" && entry.valid), "tig-recommendation-context.ts builds real-data context from words, promises, calling, prayer, Scripture Canon, and TIG graph references."),
    item("candidate_builder_exists", "Candidate builder exists", validation.sections.some((entry) => entry.id === "tig_candidate_builder" && entry.valid), "tig-candidate-builder.ts builds word, promise, Scripture, prayer, calling, and action candidates."),
    item("scoring_confidence_exists", "Scoring and confidence exists", validation.sections.some((entry) => entry.id === "tig_scoring_confidence" && entry.valid), "tig-recommendation-scoring.ts returns humble bounded confidence labels."),
    item("scripture_validation_exists", "Scripture anchor validation exists", validation.sections.some((entry) => entry.id === "tig_scripture_anchor_validation" && entry.valid), "tig-scripture-anchor-validation.ts flags missing or unsupported anchors."),
    item("trace_builder_exists", "Explanation trace builder exists", validation.sections.some((entry) => entry.id === "tig_explanation_trace" && entry.valid), "tig-explanation-trace.ts creates normal-user visible trace steps."),
    item("fallback_decision_exists", "Fallback decision exists", validation.sections.some((entry) => entry.id === "tig_fallback_decision" && entry.valid), "tig-fallback-decision.ts provides safe Scripture-grounded fallback framing."),
    item("end_to_end_flow_exists", "End-to-end recommendation flow exists", validation.sections.some((entry) => entry.id === "phase_3_4_tig_end_to_end_flow" && entry.valid), "tig-end-to-end-recommendation-flow.ts runs context, candidates, scoring, anchors, trace, fallback, and theology validation."),
    item("ui_adapters_consume_flow", "UI adapters consume TIG flow", validation.sections.some((entry) => entry.id === "tig_ui_adapter_connection" && entry.valid), "WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, and TIGGraphExplorer adapters expose Phase 3.4 trace data."),
    item("qa_scenarios_exist", "Real data QA scenarios exist", qa.scenarioCount >= 5, "tig-real-data-qa-scenarios.ts defines real word, cluster, calling, prayer, and fallback scenarios."),
    item("qa_runner_exists", "Real data QA runner exists", qa.valid, "tig-real-data-qa-runner.ts runs real data QA and adapter stability checks."),
    item("phase_3_4_validation_exists", "Phase 3.4 validation exists", validation.valid, "phase-3-4-tig-end-to-end-validation.ts validates all Phase 3.4 modules."),
    item("smoke_check_exists", "Smoke check exists", true, "phase-3-4-tig-end-to-end-recommendation-smoke-check.ts verifies the local-only Phase 3.4 path."),
    item("documentation_exists", "Documentation exists", true, "docs/teoyube/phase-3-4-tig-end-to-end-recommendation-flow-explanation-trace-real-data-qa.md documents this step.")
  ];
}

export function getPhase34MissingItems(): TeoyubePhase34AuditChecklistItem[] {
  return getPhase34IntegrationAuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase34Warnings(): string[] {
  const validation = createPhase34TigEndToEndValidationReport();
  const qa = runTigRealDataQa();
  return [...validation.warnings, ...qa.warnings];
}

export function getPhase34CompletionPercentage(): number {
  const checklist = getPhase34IntegrationAuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase34IntegrationAudit(): TeoyubePhase34IntegrationAuditReport {
  const checklist = getPhase34IntegrationAuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const validation = createPhase34TigEndToEndValidationReport();
  const qa = runTigRealDataQa();
  const blockers = [
    ...validation.blockers,
    ...qa.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase34CompletionPercentage();

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase34Warnings(),
    blockers,
    nextStep: "Phase 3.5 - User Journey Integration, State Flow & Production UI Polish",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
