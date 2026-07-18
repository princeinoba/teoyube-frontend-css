import { createJourneyPageProps } from "../journey/journey-page-integration";
import { createMobileAccessibilityJourneyQaReport } from "../journey/mobile-accessibility-journey-qa";
import { createProductionUiFallbackReport } from "../journey/production-ui-fallback-states";
import { createProductionUiPolishReport } from "../journey/production-ui-polish-checklist";
import {
  createCompassExperienceJourneyPayload,
  createFallbackJourneyPayload,
  createPrayerCompanionJourneyPayload,
  createPromiseTableJourneyPayload,
  createTigGraphExplorerJourneyPayload,
  createTigResponsePanelJourneyPayload,
  createWordCardJourneyPayload
} from "../journey/journey-surface-payloads";
import { createInitialUserJourneyState } from "../journey/user-journey-state";
import { createJourneyFromWord, createUserJourney } from "../journey/user-journey-orchestrator";
import { createPhase35JourneyIntegrationReport } from "../integration/phase-3-5-journey-integration-validation";
import { runPhase35IntegrationAudit } from "../integration/phase-3-5-integration-audit";
import { runPhase35UserJourneyProductionUiExample } from "./phase-3-5-user-journey-production-ui-example";

export type TeoyubePhase35SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase35SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase35SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase35SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase35UserJourneyProductionUiSmokeCheck(): TeoyubePhase35SmokeCheckReport {
  const initial = createInitialUserJourneyState({ query: "calling purpose", surface: "home" });
  const journey = createUserJourney({ query: "calling purpose", wordId: "Benor", surface: "tig_response_panel" });
  const wordJourney = createJourneyFromWord("Benor");
  const payloads = [
    createWordCardJourneyPayload(journey),
    createPrayerCompanionJourneyPayload(journey),
    createCompassExperienceJourneyPayload(journey),
    createTigResponsePanelJourneyPayload(journey),
    createTigGraphExplorerJourneyPayload(journey),
    createPromiseTableJourneyPayload(journey),
    createFallbackJourneyPayload(journey)
  ];
  const pageProps = createJourneyPageProps({ surface: "home", wordId: "Benor" });
  const fallbackReport = createProductionUiFallbackReport({ surface: "home" });
  const polishReport = createProductionUiPolishReport({ surface: "home" });
  const mobileQa = createMobileAccessibilityJourneyQaReport({ surface: "home", wordId: "Benor" });
  const validation = createPhase35JourneyIntegrationReport();
  const audit = runPhase35IntegrationAudit();
  const example = runPhase35UserJourneyProductionUiExample();
  const disabledServiceFlags =
    journey.noExternalServicesRequired &&
    journey.noDatabasePersistenceEnabled &&
    journey.noAnalyticsEnabled &&
    journey.noLiveAiOrchestrationEnabled &&
    journey.noBrowserPersistenceRequired &&
    journey.inMemoryOnly;
  const checks = [
    check("contracts_compile", Boolean(initial.id && initial.stage && initial.surface), "Journey contracts support structured in-memory state."),
    check("state_in_memory_only", initial.inMemoryOnly && initial.sensitiveInputCleared, "Journey state is in memory only and raw input is cleared."),
    check("orchestrator_structured_state", Boolean(journey.recommendation && journey.explanationTrace?.steps.length), "Journey orchestrator returns recommendation and explanation trace."),
    check("word_journey", Boolean(wordJourney.recommendation?.scriptureAnchors.length), "Word journey preserves Scripture anchors."),
    check("payloads_stable", payloads.every((payload) => payload.stableProps), "Journey payloads return stable props."),
    check("fallback_states_safe", fallbackReport.valid && fallbackReport.fallbacks.every((fallback) => fallback.message && fallback.safe), "Fallback states are safe and non-empty."),
    check("polish_report", polishReport.valid && polishReport.checklist.length > 0, "Production UI polish checklist returns structured report."),
    check("mobile_accessibility_qa", mobileQa.valid && mobileQa.checks.length > 0, "Mobile/accessibility QA returns structured report."),
    check("page_integration", pageProps.inMemoryOnly && pageProps.payloads.length > 0, "Page integration returns journey payloads."),
    check("phase_3_5_validation", validation.valid, "Phase 3.5 validation report passes."),
    check("phase_3_5_audit", audit.completionPercentage === 100 && audit.nextStep === "Phase 3.6 - Real User Journey QA, Accessibility Pass & Integration Readiness", "Phase 3.5 audit returns structured completion report."),
    check("disabled_services", disabledServiceFlags, "No external services, database persistence, analytics, live AI orchestration, or browser persistence are required."),
    check("example_runs", example.audit.completionPercentage === audit.completionPercentage, "Phase 3.5 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [...validation.warnings, ...mobileQa.warnings, ...fallbackReport.warnings];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
