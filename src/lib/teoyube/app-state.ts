import {
  createPhase112BookEntries,
  createPhase112Testimonies,
  createPromiseTableRowFromSearch,
  createPromiseTableRows,
  createTeoGuideResponse,
  generateTodayJourney,
  runCallingCompassPreview,
  type Phase112BookEntry,
  type Phase112PromiseTableRow,
  type Phase112PromiseTableStatus,
  type Phase112TeoGuideResponse,
  type Phase112TestimonyRecord,
  type Phase112TodayJourney
} from "../phase112Productization";
import {
  createPhase11PersonalizationPreview,
  createPhase11SafeExportBundle,
  runPhase11TigSurface,
  type Phase11ProductSurface
} from "../phase11Productization";

export type TeoyubeConsentChoice = "session_only" | "disabled" | "future_review_required";

export type TeoyubeConsentState = {
  personalization: TeoyubeConsentChoice;
  rawPrivateTextStorage: false;
  analytics: false;
  externalAi: false;
  automaticContact: false;
};

export type TeoyubePersonalizationSignal = {
  id: string;
  label: string;
  source: "button" | "search" | "journey" | "manual";
  scriptureAnchor?: string;
  createdAt: string;
  rawPrivateTextStored: false;
};

export type TeoyubeJournalEntry = {
  id: string;
  summary: string;
  scriptureReferences: string[];
  createdAt: string;
  rawPrivateTextStored: false;
};

export type TeoyubeVideoProgress = {
  videoId: string;
  title: string;
  progressPercent: number;
  updatedAt: string;
};

export type TeoyubeAppState = {
  selectedWord?: string;
  selectedScripture?: string;
  selectedPromiseResult?: Phase112PromiseTableRow;
  selectedJourney?: Phase112TodayJourney;
  activeTigResponse?: ReturnType<typeof runPhase11TigSurface>;
  generatedDailyJourney?: Phase112TodayJourney;
  savedPromiseTableItems: Phase112PromiseTableRow[];
  bookEntries: Phase112BookEntry[];
  journalEntries: TeoyubeJournalEntry[];
  testimonyEntries: Phase112TestimonyRecord[];
  videoProgress: Record<string, TeoyubeVideoProgress>;
  onboardingCompleted: boolean;
  consentState: TeoyubeConsentState;
  personalizationSignalStore: TeoyubePersonalizationSignal[];
  activeFilters: Record<string, string>;
  activeSearchQuery: string;
  activeRightRailItem?: string;
  teoGuideTurns: Phase112TeoGuideResponse[];
  safety: {
    noExternalServices: true;
    noDatabasePersistence: true;
    noAnalytics: true;
    noLiveAi: true;
    noBrowserPersistence: true;
    noAutomaticContact: true;
    noRawPrivateTextStored: true;
  };
};

function now(): string {
  return new Date().toISOString();
}

function makeId(prefix: string, value: string): string {
  return `${prefix}_${value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || Date.now()}`;
}

function summarizePrivateText(text: string, fallback: string): string {
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  const withoutContact = trimmed
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted phone]");
  return withoutContact.length > 180 ? `${withoutContact.slice(0, 177)}...` : withoutContact;
}

function uniqueRows(rows: Phase112PromiseTableRow[]): Phase112PromiseTableRow[] {
  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

export function createInitialTeoyubeAppState(): TeoyubeAppState {
  const generatedDailyJourney = generateTodayJourney();
  const savedPromiseTableItems = createPromiseTableRows(4);

  return {
    selectedWord: generatedDailyJourney.dailyWord.word,
    selectedScripture: generatedDailyJourney.scripture.reference,
    selectedPromiseResult: savedPromiseTableItems[0],
    selectedJourney: generatedDailyJourney,
    activeTigResponse: runPhase11TigSurface("daily_word", generatedDailyJourney.dailyWord.word),
    generatedDailyJourney,
    savedPromiseTableItems,
    bookEntries: createPhase112BookEntries(),
    journalEntries: [],
    testimonyEntries: createPhase112Testimonies(),
    videoProgress: {},
    onboardingCompleted: false,
    consentState: {
      personalization: "session_only",
      rawPrivateTextStorage: false,
      analytics: false,
      externalAi: false,
      automaticContact: false
    },
    personalizationSignalStore: [],
    activeFilters: {},
    activeSearchQuery: "",
    activeRightRailItem: "today",
    teoGuideTurns: [],
    safety: {
      noExternalServices: true,
      noDatabasePersistence: true,
      noAnalytics: true,
      noLiveAi: true,
      noBrowserPersistence: true,
      noAutomaticContact: true,
      noRawPrivateTextStored: true
    }
  };
}

export function generateDailyJourney(state: TeoyubeAppState, seedDate?: string): TeoyubeAppState {
  const journey = generateTodayJourney(seedDate);
  const tigResponse = runPhase11TigSurface("daily_word", journey.dailyWord.word, {
    scriptureAnchor: journey.scripture.reference,
    promiseCluster: journey.promiseCluster.title
  });

  return {
    ...state,
    selectedWord: journey.dailyWord.word,
    selectedScripture: journey.scripture.reference,
    selectedJourney: journey,
    generatedDailyJourney: journey,
    activeTigResponse: tigResponse,
    activeRightRailItem: "today"
  };
}

export function addPromiseTableItem(state: TeoyubeAppState, query = state.activeSearchQuery || "purpose"): TeoyubeAppState {
  const row = createPromiseTableRowFromSearch(query);
  return {
    ...state,
    selectedPromiseResult: row,
    savedPromiseTableItems: uniqueRows([row, ...state.savedPromiseTableItems]),
    activeTigResponse: runPhase11TigSurface("promise_search", query, {
      promiseRowId: row.id,
      scriptureAnchor: row.scripture
    }),
    activeRightRailItem: "promise_table"
  };
}

export function updatePromiseTableStatus(
  state: TeoyubeAppState,
  id: string,
  status: Phase112PromiseTableStatus
): TeoyubeAppState {
  return {
    ...state,
    savedPromiseTableItems: state.savedPromiseTableItems.map((item) =>
      item.id === id ? { ...item, status } : item
    )
  };
}

export function saveBookEntry(state: TeoyubeAppState, entry: Partial<Phase112BookEntry>): TeoyubeAppState {
  const scriptureReferences = entry.scriptureReferences?.length
    ? entry.scriptureReferences
    : state.selectedScripture
      ? [state.selectedScripture]
      : [];
  const nextEntry: Phase112BookEntry = {
    id: entry.id || makeId("book_entry", entry.title || "session entry"),
    type: entry.type || "reflection",
    title: entry.title || "Session reflection",
    summary: summarizePrivateText(entry.summary || "", "Session reflection recorded without hidden persistence."),
    scriptureReferences,
    tags: entry.tags || [state.selectedWord || "Teoyube"],
    createdAt: entry.createdAt || now()
  };

  return {
    ...state,
    bookEntries: [nextEntry, ...state.bookEntries],
    activeRightRailItem: "book"
  };
}

export function saveJournalEntry(
  state: TeoyubeAppState,
  text = "",
  scriptureReferences: string[] = state.selectedScripture ? [state.selectedScripture] : []
): TeoyubeAppState {
  const entry: TeoyubeJournalEntry = {
    id: makeId("journal_entry", `${scriptureReferences[0] || "reflection"}_${now()}`),
    summary: summarizePrivateText(text, "Reflection captured for this in-memory session."),
    scriptureReferences,
    createdAt: now(),
    rawPrivateTextStored: false
  };

  return {
    ...state,
    journalEntries: [entry, ...state.journalEntries],
    activeRightRailItem: "journal"
  };
}

export function saveTestimony(
  state: TeoyubeAppState,
  testimony: Partial<Phase112TestimonyRecord>
): TeoyubeAppState {
  const entry: Phase112TestimonyRecord = {
    id: testimony.id || makeId("testimony", testimony.title || "user recorded"),
    title: testimony.title || "User-recorded testimony draft",
    category: testimony.category || "Faith",
    body: summarizePrivateText(testimony.body || "", "User-recorded testimony draft. Teoyube does not certify fulfillment."),
    status: testimony.status || "Draft",
    scriptureReferences: testimony.scriptureReferences || (state.selectedScripture ? [state.selectedScripture] : []),
    createdAt: testimony.createdAt || now(),
    userRecordedOnly: true
  };

  return {
    ...state,
    testimonyEntries: [entry, ...state.testimonyEntries],
    activeRightRailItem: "testimony"
  };
}

export function createTeoGuideTurn(state: TeoyubeAppState, prompt = ""): TeoyubeAppState {
  const response = createTeoGuideResponse(prompt);
  return {
    ...state,
    selectedScripture: response.scriptureAnchor,
    activeTigResponse: runPhase11TigSurface("ai_companion", prompt, {
      scriptureAnchor: response.scriptureAnchor,
      promiseCluster: response.promiseCluster
    }),
    teoGuideTurns: [response, ...state.teoGuideTurns],
    activeRightRailItem: "teo_guide"
  };
}

export function setConsentState(state: TeoyubeAppState, personalization: TeoyubeConsentChoice): TeoyubeAppState {
  return {
    ...state,
    consentState: {
      personalization,
      rawPrivateTextStorage: false,
      analytics: false,
      externalAi: false,
      automaticContact: false
    }
  };
}

export function addPersonalizationSignal(
  state: TeoyubeAppState,
  label: string,
  source: TeoyubePersonalizationSignal["source"] = "manual"
): TeoyubeAppState {
  if (state.consentState.personalization !== "session_only") return state;
  const preview = createPhase11PersonalizationPreview(label, true);
  const signal: TeoyubePersonalizationSignal = {
    id: makeId("signal", `${source}_${label}`),
    label: summarizePrivateText(label, "Session preference signal"),
    source,
    scriptureAnchor: preview.preview.explanationPanel.scriptureEvidence[0],
    createdAt: now(),
    rawPrivateTextStored: false
  };

  return {
    ...state,
    personalizationSignalStore: [signal, ...state.personalizationSignalStore]
  };
}

export function resetPersonalization(state: TeoyubeAppState): TeoyubeAppState {
  return {
    ...state,
    personalizationSignalStore: [],
    activeFilters: {},
    activeSearchQuery: ""
  };
}

export function setActiveTigSurface(
  state: TeoyubeAppState,
  surface: Phase11ProductSurface,
  input = state.activeSearchQuery || "I need direction."
): TeoyubeAppState {
  const response = runPhase11TigSurface(surface, input);
  return {
    ...state,
    activeSearchQuery: input,
    activeTigResponse: response,
    selectedScripture: response.explanationPanel.scriptureEvidence[0],
    activeRightRailItem: surface
  };
}

export function updateVideoProgress(
  state: TeoyubeAppState,
  videoId: string,
  title: string,
  progressPercent: number
): TeoyubeAppState {
  return {
    ...state,
    videoProgress: {
      ...state.videoProgress,
      [videoId]: {
        videoId,
        title,
        progressPercent: Math.max(0, Math.min(100, progressPercent)),
        updatedAt: now()
      }
    }
  };
}

export function createSafeExportBundle(state: TeoyubeAppState) {
  const base = createPhase11SafeExportBundle();
  return {
    ...base,
    appState: {
      selectedWord: state.selectedWord,
      selectedScripture: state.selectedScripture,
      promiseTable: state.savedPromiseTableItems,
      bookEntries: state.bookEntries,
      journalEntries: state.journalEntries,
      testimonyEntries: state.testimonyEntries,
      videoProgress: Object.values(state.videoProgress),
      personalizationSignalCount: state.personalizationSignalStore.length,
      rawPrivateTextIncluded: false,
      browserPersistenceUsed: false,
      externalServicesCalled: false
    }
  };
}

export function createCallingCompassStatePreview(state: TeoyubeAppState, query = state.activeSearchQuery) {
  return runCallingCompassPreview(query || state.selectedWord || "calling purpose");
}
