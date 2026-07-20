"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  TeoyubeAppState,
  TeoyubeConsentChoice,
  TeoyubePersonalizationSignal
} from "@/lib/teoyube/app-state";
import type {
  Phase112BookEntry,
  Phase112PromiseTableStatus,
  Phase112TestimonyRecord
} from "@/lib/phase112Productization";
import type { Phase11ProductSurface } from "@/lib/phase11Productization";

type TeoyubeAppStateContextValue = {
  state: TeoyubeAppState;
  initialSearchResult: Record<string, unknown>;
  generateDailyJourney: (seedDate?: string) => void;
  addPromiseTableItem: (query?: string) => void;
  updatePromiseTableStatus: (id: string, status: Phase112PromiseTableStatus) => void;
  saveBookEntry: (entry: Partial<Phase112BookEntry>) => void;
  saveJournalEntry: (text?: string, scriptureReferences?: string[]) => void;
  saveTestimony: (testimony: Partial<Phase112TestimonyRecord>) => void;
  createTeoGuideTurn: (prompt?: string) => void;
  setConsentState: (personalization: TeoyubeConsentChoice) => void;
  addPersonalizationSignal: (label: string, source?: TeoyubePersonalizationSignal["source"]) => void;
  resetPersonalization: () => void;
  setActiveTigSurface: (surface: Phase11ProductSurface, input?: string) => void;
  createSafeExportBundle: () => Record<string, unknown>;
};

const TeoyubeAppStateContext = createContext<TeoyubeAppStateContextValue | undefined>(undefined);

type LegacyAppStateAction =
  | "generateDailyJourney"
  | "addPromiseTableItem"
  | "updatePromiseTableStatus"
  | "saveBookEntry"
  | "saveJournalEntry"
  | "saveTestimony"
  | "createTeoGuideTurn"
  | "setConsentState"
  | "addPersonalizationSignal"
  | "resetPersonalization"
  | "setActiveTigSurface";

export function TeoyubeAppStateProvider({ children, initialSearchResult, initialState, safeExportBase }: {
  children: ReactNode;
  initialSearchResult: Record<string, unknown>;
  initialState: TeoyubeAppState;
  safeExportBase: Record<string, unknown>;
}) {
  const [state, setState] = useState<TeoyubeAppState>(initialState);
  const stateRef = useRef(state);

  const transition = useCallback(async (action: LegacyAppStateAction, payload: Record<string, unknown> = {}) => {
    try {
      const response = await fetch("/api/teoyube/app-state", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, state: stateRef.current, payload })
      });
      if (!response.ok) return;
      const nextState = await response.json() as TeoyubeAppState;
      stateRef.current = nextState;
      setState(nextState);
    } catch {
      // Keep the existing in-memory state when the local preview route is unavailable.
    }
  }, []);

  const clientSafeExportBundle = useCallback(() => ({
    ...safeExportBase,
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
  }), [safeExportBase, state]);

  const value = useMemo<TeoyubeAppStateContextValue>(
    () => ({
      state,
      initialSearchResult,
      generateDailyJourney: (seedDate) => { void transition("generateDailyJourney", { seedDate }); },
      addPromiseTableItem: (query) => { void transition("addPromiseTableItem", { query }); },
      updatePromiseTableStatus: (id, status) => { void transition("updatePromiseTableStatus", { id, status }); },
      saveBookEntry: (entry) => { void transition("saveBookEntry", { entry }); },
      saveJournalEntry: (text, scriptureReferences) => { void transition("saveJournalEntry", { text, scriptureReferences }); },
      saveTestimony: (testimony) => { void transition("saveTestimony", { testimony }); },
      createTeoGuideTurn: (prompt) => { void transition("createTeoGuideTurn", { prompt }); },
      setConsentState: (personalization) => { void transition("setConsentState", { personalization }); },
      addPersonalizationSignal: (label, source) => { void transition("addPersonalizationSignal", { label, source }); },
      resetPersonalization: () => { void transition("resetPersonalization"); },
      setActiveTigSurface: (surface, input) => { void transition("setActiveTigSurface", { surface, input }); },
      createSafeExportBundle: clientSafeExportBundle
    }),
    [clientSafeExportBundle, initialSearchResult, state, transition]
  );

  return <TeoyubeAppStateContext.Provider value={value}>{children}</TeoyubeAppStateContext.Provider>;
}

export function useTeoyubeAppState() {
  const context = useContext(TeoyubeAppStateContext);
  if (!context) {
    throw new Error("useTeoyubeAppState must be used inside TeoyubeAppStateProvider.");
  }
  return context;
}

export function useDailyJourney() {
  const context = useTeoyubeAppState();
  return {
    journey: context.state.generatedDailyJourney,
    selectedJourney: context.state.selectedJourney,
    generateDailyJourney: context.generateDailyJourney
  };
}

export function usePromiseTable() {
  const context = useTeoyubeAppState();
  return {
    rows: context.state.savedPromiseTableItems,
    selectedPromiseResult: context.state.selectedPromiseResult,
    addPromiseTableItem: context.addPromiseTableItem,
    updatePromiseTableStatus: context.updatePromiseTableStatus
  };
}

export function useBookOfTheSaint() {
  const context = useTeoyubeAppState();
  return {
    entries: context.state.bookEntries,
    saveBookEntry: context.saveBookEntry,
    createSafeExportBundle: context.createSafeExportBundle
  };
}

export function useJournal() {
  const context = useTeoyubeAppState();
  return {
    entries: context.state.journalEntries,
    saveJournalEntry: context.saveJournalEntry
  };
}

export function useTestimonies() {
  const context = useTeoyubeAppState();
  return {
    entries: context.state.testimonyEntries,
    saveTestimony: context.saveTestimony
  };
}

export function useTeoGuide() {
  const context = useTeoyubeAppState();
  return {
    turns: context.state.teoGuideTurns,
    createTeoGuideTurn: context.createTeoGuideTurn
  };
}

export function usePersonalizationControls() {
  const context = useTeoyubeAppState();
  return {
    consentState: context.state.consentState,
    signals: context.state.personalizationSignalStore,
    setConsentState: context.setConsentState,
    addPersonalizationSignal: context.addPersonalizationSignal,
    resetPersonalization: context.resetPersonalization
  };
}
