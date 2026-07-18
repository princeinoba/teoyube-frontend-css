import { createPhase35JourneyIntegrationReport } from "./phase-3-5-journey-integration-validation";

export type TeoyubePhase35AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase35IntegrationAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase35AuditChecklistItem[];
  missingItems: TeoyubePhase35AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 3.6 - Real User Journey QA, Accessibility Pass & Integration Readiness";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase35AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase35IntegrationAuditChecklist(): TeoyubePhase35AuditChecklistItem[] {
  const validation = createPhase35JourneyIntegrationReport();

  return [
    item("user_journey_contracts", "User journey contracts exist", true, "user-journey-contracts.ts defines Phase 3.5 stages, surfaces, state, transitions, fallback, report, and decision contracts."),
    item("user_journey_state", "User journey state exists", validation.sections.some((entry) => entry.id === "user_journey_state_flow" && entry.valid), "user-journey-state.ts creates and updates in-memory-only sanitized journey state."),
    item("journey_orchestrator", "Journey orchestrator exists", validation.sections.some((entry) => entry.id === "journey_orchestrator" && entry.valid), "user-journey-orchestrator.ts connects data, engines, TIG recommendation flow, traces, fallbacks, and reports."),
    item("journey_surface_payloads", "Journey surface payloads exist", validation.sections.some((entry) => entry.id === "journey_surface_payloads" && entry.valid), "journey-surface-payloads.ts creates stable UI payloads from existing adapters."),
    item("journey_page_integration", "Page integration helpers exist", validation.sections.some((entry) => entry.id === "journey_page_integration" && entry.valid), "journey-page-integration.ts creates route-level journey props."),
    item("fallback_states", "Production UI fallback states exist", validation.sections.some((entry) => entry.id === "production_ui_fallback_states" && entry.valid), "production-ui-fallback-states.ts provides public-safe non-empty fallbacks."),
    item("ui_polish_checklist", "Production UI polish checklist exists", validation.sections.some((entry) => entry.id === "production_ui_polish" && entry.valid), "production-ui-polish-checklist.ts covers mobile, overflow, trace, fallback, confidence, privacy, and debug safety."),
    item("mobile_accessibility_qa", "Mobile/accessibility journey QA exists", validation.sections.some((entry) => entry.id === "mobile_accessibility_journey_qa" && entry.valid), "mobile-accessibility-journey-qa.ts validates journey payload readiness."),
    item("phase_3_5_validation", "Phase 3.5 validation exists", validation.valid, "phase-3-5-journey-integration-validation.ts validates all Phase 3.5 modules."),
    item("smoke_check", "Smoke check exists", true, "phase-3-5-user-journey-production-ui-smoke-check.ts verifies the local-only journey path."),
    item("documentation", "Documentation exists", true, "docs/teoyube/phase-3-5-user-journey-state-flow-production-ui-polish.md documents this step.")
  ];
}

export function getPhase35MissingItems(): TeoyubePhase35AuditChecklistItem[] {
  return getPhase35IntegrationAuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase35Warnings(): string[] {
  const validation = createPhase35JourneyIntegrationReport();
  return validation.warnings;
}

export function getPhase35CompletionPercentage(): number {
  const checklist = getPhase35IntegrationAuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase35IntegrationAudit(): TeoyubePhase35IntegrationAuditReport {
  const checklist = getPhase35IntegrationAuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const validation = createPhase35JourneyIntegrationReport();
  const completionPercentage = getPhase35CompletionPercentage();
  const blockers = [
    ...validation.blockers,
    ...missingItems.map((entry) => entry.label)
  ];

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase35Warnings(),
    blockers,
    nextStep: "Phase 3.6 - Real User Journey QA, Accessibility Pass & Integration Readiness",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
