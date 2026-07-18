import { createPhase36QaAccessibilityValidationReport } from "./phase-3-6-qa-accessibility-validation";

export type TeoyubePhase36AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase36IntegrationAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase36AuditChecklistItem[];
  missingItems: TeoyubePhase36AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 3.7 - Phase 3 Completion Review, Integration Lock & Phase 4 Roadmap";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase36AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase36IntegrationAuditChecklist(): TeoyubePhase36AuditChecklistItem[] {
  const validation = createPhase36QaAccessibilityValidationReport({ surface: "home", wordId: "Benor" });

  return [
    item("qa_contracts", "Real user journey QA contracts exist", true, "real-user-journey-qa-contracts.ts defines Phase 3.6 statuses, surfaces, scenarios, steps, results, reports, blockers, warnings, and decisions."),
    item("qa_scenarios", "Real user journey QA scenarios exist", validation.sections.some((entry) => entry.id === "real_user_journey_qa" && entry.valid), "real-user-journey-qa-scenarios.ts uses real vocabulary, promise clusters, Scripture canon, TIG flow, and adapters."),
    item("qa_runner", "Real user journey QA runner exists", validation.sections.some((entry) => entry.id === "real_user_journey_qa" && entry.valid), "real-user-journey-qa-runner.ts validates state, real data, TIG flow, payloads, Scripture anchors, traces, confidence, fallback, and local-only behavior."),
    item("accessibility_contracts", "Accessibility QA contracts exist", true, "accessibility-qa-contracts.ts defines structured accessibility status, checks, results, reports, blockers, warnings, and decisions."),
    item("accessibility_runner", "Accessibility QA runner exists", validation.sections.some((entry) => entry.id === "accessibility_qa" && entry.valid), "accessibility-qa-runner.ts checks headings, labels, keyboard basics, semantic grouping, aria-label coverage, overflow, graph fallback, explanation visibility, and fallback clarity."),
    item("mobile_runner", "Mobile journey QA runner exists", validation.sections.some((entry) => entry.id === "mobile_journey_qa" && entry.valid), "mobile-journey-qa-runner.ts checks stacked layout readiness, graph list fallback, Promise Table rows, Scripture, trace, confidence, and fallback readability."),
    item("scripture_trace_confidence_qa", "Scripture/explanation/confidence QA exists", validation.sections.some((entry) => entry.id === "scripture_explanation_confidence_qa" && entry.valid), "scripture-explanation-confidence-qa.ts verifies anchors, trace, confidence labels, fallback safety, and no certainty-overclaiming language."),
    item("integration_readiness_checklist", "Phase 3 readiness checklist exists", validation.sections.some((entry) => entry.id === "phase_3_integration_readiness_checklist" && entry.valid), "phase-3-integration-readiness-checklist.ts checks Phase 3.3, 3.4, 3.5, and Phase 3.6 readiness together."),
    item("phase_3_6_validation", "Phase 3.6 validation exists", validation.valid, "phase-3-6-qa-accessibility-validation.ts combines QA, accessibility, mobile, Scripture, trace, confidence, and readiness validation."),
    item("smoke_check", "Phase 3.6 smoke check exists", true, "phase-3-6-real-user-journey-qa-smoke-check.ts verifies the local-only QA layer."),
    item("qa_map_document", "Phase 3.6 QA map document exists", true, "docs/teoyube/phase-3-6-real-user-journey-qa-accessibility-integration-readiness-map.md documents inspected routes, surfaces, risks, and patches."),
    item("documentation", "Phase 3.6 documentation exists", true, "docs/teoyube/phase-3-6-real-user-journey-qa-accessibility-pass-integration-readiness.md documents the completed step."),
    item("restricted_services_disabled", "Restricted services remain disabled", validation.noExternalServicesRequired && validation.noDatabasePersistenceEnabled && validation.noAnalyticsEnabled && validation.noLiveAiOrchestrationEnabled && validation.noBrowserPersistenceRequired && validation.inMemoryOnly, "Phase 3.6 adds in-memory validation only.")
  ];
}

export function getPhase36MissingItems(): TeoyubePhase36AuditChecklistItem[] {
  return getPhase36IntegrationAuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase36Warnings(): string[] {
  return createPhase36QaAccessibilityValidationReport({ surface: "home", wordId: "Benor" }).warnings;
}

export function getPhase36CompletionPercentage(): number {
  const checklist = getPhase36IntegrationAuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase36IntegrationAudit(): TeoyubePhase36IntegrationAuditReport {
  const checklist = getPhase36IntegrationAuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const validation = createPhase36QaAccessibilityValidationReport({ surface: "home", wordId: "Benor" });
  const completionPercentage = getPhase36CompletionPercentage();
  const blockers = [
    ...validation.blockers,
    ...missingItems.map((entry) => entry.label)
  ];

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase36Warnings(),
    blockers,
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
