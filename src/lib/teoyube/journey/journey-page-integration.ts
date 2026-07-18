import {
  createJourneyFromCallingInput,
  createJourneyFromPrayerInput,
  createJourneyFromPromiseCluster,
  createJourneyFromWord,
  createJourneySurfacePayload,
  createUserJourney,
  createUserJourneyReport
} from "./user-journey-orchestrator";
import type {
  TeoyubeUserJourneyInput,
  TeoyubeUserJourneyState,
  TeoyubeUserJourneySurface
} from "./user-journey-contracts";

function pageProps(state: TeoyubeUserJourneyState, surfaces: TeoyubeUserJourneySurface[]) {
  return {
    journey: state,
    report: createUserJourneyReport(state),
    payloads: surfaces.map((surface) => createJourneySurfacePayload(state, surface)),
    noExternalServicesRequired: true as const,
    noBrowserPersistenceRequired: true as const,
    inMemoryOnly: true as const
  };
}

export function createDefaultTeoyubePageJourney() {
  return createUserJourney({
    wordId: "Benor",
    query: "daily word calling purpose",
    surface: "home",
    stage: "entry",
    safeDisplayLabel: "Default Teoyube dashboard journey"
  });
}

export function createDailyWordPageJourney(input: TeoyubeUserJourneyInput = {}) {
  return createJourneyFromWord(input.wordId || input.query || "Benor");
}

export function createPrayerPageJourney(input: TeoyubeUserJourneyInput = {}) {
  return createJourneyFromPrayerInput(input.prayerInput || input.query || "Scripture-grounded prayer");
}

export function createCallingCompassPageJourney(input: TeoyubeUserJourneyInput = {}) {
  return createJourneyFromCallingInput(input.callingInput || input.query || "calling purpose builder");
}

export function createCanonPageJourney(input: TeoyubeUserJourneyInput = {}) {
  if (input.clusterId) return createJourneyFromPromiseCluster(input.clusterId);
  return createUserJourney({
    ...input,
    query: input.query || input.wordId || "Teoyube canon exploration",
    surface: "canon",
    stage: "daily_word"
  });
}

export function createTigPageJourney(input: TeoyubeUserJourneyInput = {}) {
  return createUserJourney({
    ...input,
    query: input.query || "Teoyube Scripture Intelligence",
    surface: input.surface || "tig_response_panel",
    stage: input.stage || "tig_response"
  });
}

export function createJourneyPageProps(input: TeoyubeUserJourneyInput = {}) {
  const surface = input.surface || "home";
  const state =
    surface === "home" ? createDefaultTeoyubePageJourney() :
      surface === "daily_word" || surface === "word_card" ? createDailyWordPageJourney(input) :
        surface === "prayer_companion" ? createPrayerPageJourney(input) :
          surface === "compass_experience" ? createCallingCompassPageJourney(input) :
            surface === "canon" || surface === "promise_table" ? createCanonPageJourney(input) :
              surface === "tig_graph_explorer" || surface === "tig_response_panel" ? createTigPageJourney(input) :
                createUserJourney(input);
  const surfaces: TeoyubeUserJourneySurface[] =
    surface === "home" ? ["daily_word", "promise_table", "prayer_companion", "tig_response_panel"] :
      surface === "canon" ? ["word_card", "promise_table", "tig_response_panel"] :
        surface === "prayer_companion" ? ["prayer_companion", "tig_response_panel"] :
          surface === "compass_experience" ? ["compass_experience", "tig_response_panel"] :
            surface === "tig_graph_explorer" ? ["tig_graph_explorer", "promise_table"] :
              [surface];

  return pageProps(state, surfaces);
}
