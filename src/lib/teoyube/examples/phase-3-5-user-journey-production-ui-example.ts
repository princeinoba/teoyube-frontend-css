import {
  createCallingCompassPageJourney,
  createDefaultTeoyubePageJourney,
  createJourneyPageProps,
  createPrayerPageJourney
} from "../journey/journey-page-integration";
import {
  createCompassExperienceJourneyPayload,
  createFallbackJourneyPayload,
  createPrayerCompanionJourneyPayload,
  createTigGraphExplorerJourneyPayload,
  createTigResponsePanelJourneyPayload,
  createWordCardJourneyPayload
} from "../journey/journey-surface-payloads";
import { createProductionUiPolishReport } from "../journey/production-ui-polish-checklist";
import { createMobileAccessibilityJourneyQaReport } from "../journey/mobile-accessibility-journey-qa";
import {
  createJourneyFromPromiseCluster,
  createJourneyFromWord
} from "../journey/user-journey-orchestrator";
import { createInitialUserJourneyState } from "../journey/user-journey-state";
import { createPhase35JourneyIntegrationReport } from "../integration/phase-3-5-journey-integration-validation";
import { runPhase35IntegrationAudit } from "../integration/phase-3-5-integration-audit";

export function runPhase35UserJourneyProductionUiExample() {
  const initialState = createInitialUserJourneyState({
    query: "calling purpose",
    surface: "home",
    safeDisplayLabel: "Example dashboard journey"
  });
  const wordJourney = createJourneyFromWord("Benor");
  const promiseJourney = createJourneyFromPromiseCluster("PC01");
  const prayerJourney = createPrayerPageJourney({ prayerInput: "Scripture-grounded prayer" });
  const callingJourney = createCallingCompassPageJourney({ callingInput: "calling purpose builder" });
  const defaultJourney = createDefaultTeoyubePageJourney();
  const pageProps = createJourneyPageProps({ surface: "home", wordId: "Benor" });
  const validation = createPhase35JourneyIntegrationReport();
  const audit = runPhase35IntegrationAudit();

  return {
    initialState,
    wordJourney,
    promiseJourney,
    prayerJourney,
    callingJourney,
    defaultJourney,
    wordPayload: createWordCardJourneyPayload(wordJourney),
    prayerPayload: createPrayerCompanionJourneyPayload(prayerJourney),
    compassPayload: createCompassExperienceJourneyPayload(callingJourney),
    tigResponsePayload: createTigResponsePanelJourneyPayload(defaultJourney),
    tigGraphPayload: createTigGraphExplorerJourneyPayload(defaultJourney),
    fallbackPayload: createFallbackJourneyPayload(defaultJourney),
    pageProps,
    productionUiPolishReport: createProductionUiPolishReport({ surface: "home" }),
    mobileAccessibilityQaReport: createMobileAccessibilityJourneyQaReport({ surface: "home", wordId: "Benor" }),
    validation,
    audit
  };
}
