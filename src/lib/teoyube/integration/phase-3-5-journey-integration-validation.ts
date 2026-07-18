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
import {
  attachJourneyRecommendation,
  createInitialUserJourneyState,
  createUserJourneyStateReport,
  transitionUserJourneyStage
} from "../journey/user-journey-state";
import {
  createJourneyFromCallingInput,
  createJourneyFromPrayerInput,
  createJourneyFromPromiseCluster,
  createJourneyFromWord,
  createUserJourney,
  runUserJourneyRecommendation
} from "../journey/user-journey-orchestrator";

export type TeoyubePhase35ValidationSection = {
  id: string;
  valid: boolean;
  details: string;
  blockers: string[];
  warnings: string[];
};

export type TeoyubePhase35JourneyIntegrationReport = {
  valid: boolean;
  status: "ready" | "ready_with_warnings" | "blocked";
  sections: TeoyubePhase35ValidationSection[];
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

function section(
  id: string,
  valid: boolean,
  details: string,
  blockers: string[] = [],
  warnings: string[] = []
): TeoyubePhase35ValidationSection {
  return { id, valid, details, blockers, warnings };
}

export function validateUserJourneyStateFlow(): TeoyubePhase35ValidationSection {
  const initial = createInitialUserJourneyState({ query: "calling purpose", surface: "home" });
  const result = runUserJourneyRecommendation({ query: "calling purpose", surface: "tig_response_panel" });
  const recommendation = {
    id: result.id,
    surface: "tig_response_panel" as const,
    selectedLabel: result.selectedCandidate.label,
    selectedType: result.selectedCandidate.type,
    wordId: result.selectedCandidate.relatedWordIds[0],
    clusterId: result.selectedCandidate.relatedPromiseClusterIds[0],
    scriptureAnchors: result.selectedCandidate.scriptureAnchors,
    explanationTrace: result.explanationTrace,
    explanationSteps: result.explanationTrace.steps,
    confidenceLabel: result.confidence.label,
    fallbackUsed: result.fallback.used,
    fallbackReason: result.fallback.used ? result.fallback.message : undefined,
    actionSteps: result.selectedCandidate.relatedActionIds,
    sourceResult: result
  };
  const attached = attachJourneyRecommendation(initial, recommendation);
  const transitioned = transitionUserJourneyStage(attached, "tig_response");
  const report = createUserJourneyStateReport(transitioned);

  return section(
    "user_journey_state_flow",
    report.valid && report.inMemoryOnly && report.noBrowserPersistenceRequired,
    `Journey state has ${report.stepCount} step(s), ${report.transitionCount} transition(s), and ${report.scriptureAnchorCount} Scripture anchor(s).`,
    report.blockers.map((entry) => entry.message),
    report.warnings.map((entry) => entry.message)
  );
}

export function validateJourneyOrchestrator(): TeoyubePhase35ValidationSection {
  const word = createJourneyFromWord("Benor");
  const promise = createJourneyFromPromiseCluster("PC01");
  const calling = createJourneyFromCallingInput("calling purpose");
  const prayer = createJourneyFromPrayerInput("Scripture-grounded prayer");
  const blockers = [
    !word.recommendation ? "Word journey did not attach recommendation." : undefined,
    !promise.recommendation ? "Promise journey did not attach recommendation." : undefined,
    !calling.recommendation ? "Calling journey did not attach recommendation." : undefined,
    !prayer.recommendation ? "Prayer journey did not attach recommendation." : undefined
  ].filter(Boolean) as string[];

  return section("journey_orchestrator", blockers.length === 0, "Journey orchestrator creates word, promise, calling, and prayer journeys.", blockers);
}

export function validateJourneySurfacePayloads(): TeoyubePhase35ValidationSection {
  const state = createUserJourney({ wordId: "Benor", query: "calling purpose", surface: "tig_response_panel" });
  const payloads = [
    createWordCardJourneyPayload(state),
    createPrayerCompanionJourneyPayload(state),
    createCompassExperienceJourneyPayload(state),
    createTigResponsePanelJourneyPayload(state),
    createTigGraphExplorerJourneyPayload(state),
    createPromiseTableJourneyPayload(state),
    createFallbackJourneyPayload(state)
  ];
  const blockers = [
    payloads.some((payload) => !payload.stableProps) ? "One or more journey payloads are not marked stable." : undefined,
    payloads.some((payload) => payload.noExternalServicesRequired !== true) ? "One or more payloads requires external services." : undefined,
    payloads.some((payload) => payload.noBrowserPersistenceRequired !== true) ? "One or more payloads requires browser persistence." : undefined
  ].filter(Boolean) as string[];

  return section("journey_surface_payloads", blockers.length === 0, `Created ${payloads.length} journey surface payload(s).`, blockers);
}

export function validateJourneyPageIntegration(): TeoyubePhase35ValidationSection {
  const pageProps = createJourneyPageProps({ surface: "home", wordId: "Benor" });
  const blockers = [
    !pageProps.journey.recommendation ? "Page integration did not expose journey recommendation." : undefined,
    pageProps.payloads.length === 0 ? "Page integration did not create payloads." : undefined,
    !pageProps.inMemoryOnly ? "Page integration must remain in memory only." : undefined
  ].filter(Boolean) as string[];

  return section("journey_page_integration", blockers.length === 0, `Page integration created ${pageProps.payloads.length} payload(s).`, blockers);
}

export function validateProductionUiFallbackStates(): TeoyubePhase35ValidationSection {
  const report = createProductionUiFallbackReport({ surface: "home" });
  return section("production_ui_fallback_states", report.valid, `Fallback report has ${report.fallbacks.length} fallback state(s).`, report.blockers, report.warnings);
}

export function validateProductionUiPolish(): TeoyubePhase35ValidationSection {
  const report = createProductionUiPolishReport({ surface: "tig_response_panel" });
  return section("production_ui_polish", report.valid, `Production UI polish checklist has ${report.checklist.length} item(s).`, report.blockers, report.warnings);
}

export function validateMobileAccessibilityJourneyQa(): TeoyubePhase35ValidationSection {
  const report = createMobileAccessibilityJourneyQaReport({ surface: "home", wordId: "Benor" });
  return section("mobile_accessibility_journey_qa", report.valid, `Mobile/accessibility QA ran ${report.checks.length} check(s).`, report.blockers, report.warnings);
}

export function validatePhase35JourneyIntegration(): TeoyubePhase35ValidationSection {
  const state = createUserJourney({ query: "calling purpose", wordId: "Benor", surface: "tig_response_panel" });
  const report = createUserJourneyStateReport(state);
  const blockers = [
    !state.recommendation ? "Phase 3.5 journey did not attach recommendation." : undefined,
    !state.explanationTrace?.steps.length ? "Phase 3.5 journey did not preserve explanation trace." : undefined,
    report.noExternalServicesRequired !== true ? "Phase 3.5 journey should not require external services." : undefined,
    report.noBrowserPersistenceRequired !== true ? "Phase 3.5 journey should not require browser persistence." : undefined
  ].filter(Boolean) as string[];

  return section("phase_3_5_journey_integration", blockers.length === 0 && report.valid, "Phase 3.5 journey integration preserves recommendation, trace, fallback, and local-only state.", [...blockers, ...report.blockers.map((entry) => entry.message)], report.warnings.map((entry) => entry.message));
}

export function createPhase35JourneyIntegrationReport(): TeoyubePhase35JourneyIntegrationReport {
  const sections = [
    validateUserJourneyStateFlow(),
    validateJourneyOrchestrator(),
    validateJourneySurfacePayloads(),
    validateJourneyPageIntegration(),
    validateProductionUiFallbackStates(),
    validateProductionUiPolish(),
    validateMobileAccessibilityJourneyQa(),
    validatePhase35JourneyIntegration()
  ];
  const blockers = sections.flatMap((entry) => entry.blockers);
  const warnings = sections.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    sections,
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
