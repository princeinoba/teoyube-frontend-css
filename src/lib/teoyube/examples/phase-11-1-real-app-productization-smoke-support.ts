import {
  getAllPromiseClusters,
  getAllScriptures,
  getAllTeoyubeWords,
  getDailyWord
} from "../data-access";
import {
  clearTIGJournalEntries,
  clearTIGUserActivities,
  getTIGJournalEntries,
  getTIGUserActivities,
  hasCompletedTIGOnboarding,
  markTIGOnboardingCompleted,
  resetTIGOnboarding,
  runCallingCompassTigProduction,
  runCanonTigProduction,
  runDailyWordTigProduction,
  runPrayerTigProduction,
  runPromiseClusterTigProduction,
  saveTIGJournalEntry,
  saveTIGUserActivity,
  toTigExplanationPanelProps,
  toTigGraphPanelProps,
  toTigResponsePanelProps,
  type TigProductionResponse
} from "../../tig";

export type Phase11SmokeSurface =
  | "canon"
  | "daily_word"
  | "promise_search"
  | "prayer"
  | "calling_compass"
  | "tig_graph";

export function getPhase11RoutePaths(): string[] {
  return [
    "#today",
    "#roadmap",
    "#search",
    "#canon",
    "#table",
    "#calling",
    "#book",
    "#lexicon",
    "#testimony",
    "#guide",
    "#ui-elements",
    "#teoyube-tables"
  ];
}

export function getPhase11ButtonLabels(): string[] {
  return [
    "Home",
    "Dashboard",
    "Canon",
    "Daily Word",
    "Promise Search",
    "Prayer",
    "Calling Compass",
    "Journey",
    "Journal",
    "Book",
    "TIG Graph",
    "Personalization",
    "Settings",
    "Generate Today's Word",
    "Refresh Word",
    "Pray This Word",
    "Save Word",
    "Add Reflection",
    "Search Promise",
    "Generate Prayer",
    "View Graph",
    "Save Scripture",
    "Add to Book",
    "Complete Action",
    "More Like This",
    "Less Like This",
    "Not Relevant",
    "Reset Search",
    "Copy Prayer",
    "Save Prayer",
    "Mark Prayer Completed",
    "Add Journal Reflection",
    "Start Compass",
    "Next Question",
    "Back",
    "View Result",
    "Save Calling Reflection",
    "View Supporting Scripture",
    "View Journey",
    "Reset Compass",
    "Start Journey",
    "Complete Stage",
    "Complete Reflection",
    "Mark Milestone",
    "Reset Journey",
    "Save Entry",
    "Clear Draft",
    "Export Journal",
    "Clear Session Entries",
    "Save Response",
    "Filter Saved Items",
    "Export Book",
    "Clear Book",
    "Generate Graph",
    "Toggle Layout",
    "Highlight Path",
    "Show Explanation",
    "Show Confidence",
    "Reset Graph",
    "Enable Session Only",
    "Enable Profile Preview",
    "Disable Personalization",
    "Reset Preferences",
    "Export Signals",
    "Delete Signals"
  ];
}

function runSurface(surface: Phase11SmokeSurface): TigProductionResponse {
  const params = {
    input: "I feel stuck and need purpose.",
    userState: "local smoke check",
    selectedWordId: getDailyWord().id,
    selectedClusterId: getAllPromiseClusters()[0]?.id,
    context: { phase: "11.1", localOnly: true }
  };

  if (surface === "canon") return runCanonTigProduction(params);
  if (surface === "daily_word") return runDailyWordTigProduction(params);
  if (surface === "prayer") return runPrayerTigProduction(params);
  if (surface === "calling_compass") return runCallingCompassTigProduction(params);
  return runPromiseClusterTigProduction(params);
}

export function runPhase11SmokeTigSurface(surface: Phase11SmokeSurface) {
  const production = runSurface(surface);
  return {
    production,
    responsePanel: toTigResponsePanelProps(production),
    graphPanel: toTigGraphPanelProps(production),
    explanationPanel: toTigExplanationPanelProps(production),
    noExternalServicesRequired: true
  };
}

export function createPhase11PersonalizationPreview(enabled: boolean) {
  const baseline = runPhase11SmokeTigSurface("promise_search");
  const preview = enabled ? runPhase11SmokeTigSurface("promise_search") : baseline;
  return {
    enabled,
    baseline,
    preview,
    noRawPrivateTextStored: true
  };
}

export function createPhase11DailyWordContext() {
  clearTIGJournalEntries();
  clearTIGUserActivities();
  resetTIGOnboarding();

  const dailyWord = getDailyWord();
  const scriptures = getAllScriptures();
  const words = getAllTeoyubeWords();

  saveTIGJournalEntry({
    id: "phase_11_1_journal",
    entry: "Session-only smoke reflection.",
    scriptureReferences: dailyWord.scriptureReferences,
    teoyubeWords: [dailyWord.word],
    promiseClusters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  saveTIGUserActivity({
    id: "phase_11_1_activity",
    type: "response_saved",
    scriptureReferences: dailyWord.scriptureReferences,
    teoyubeWords: [dailyWord.word],
    promiseClusters: [],
    createdAt: new Date().toISOString()
  });
  markTIGOnboardingCompleted();

  const sessionHelpersValid =
    getTIGJournalEntries().length === 1 &&
    getTIGUserActivities().length === 1 &&
    hasCompletedTIGOnboarding();

  clearTIGJournalEntries();
  clearTIGUserActivities();
  resetTIGOnboarding();

  return {
    dailyWord,
    words,
    scriptures,
    sessionHelpersValid
  };
}
