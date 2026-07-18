"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  addPersonalizationSignal,
  addPromiseTableItem,
  createInitialTeoyubeAppState,
  createSafeExportBundle,
  createTeoGuideTurn,
  generateDailyJourney,
  resetPersonalization,
  saveBookEntry,
  saveJournalEntry,
  saveTestimony,
  setActiveTigSurface,
  setConsentState,
  updatePromiseTableStatus,
  type TeoyubeAppState,
  type TeoyubeConsentChoice
} from "@/lib/teoyube/app-state";
import type { Phase112PromiseTableStatus } from "@/lib/phase112Productization";
import type { Phase11ProductSurface } from "@/lib/phase11Productization";

type TeoyubeAppStateContextValue = {
  state: TeoyubeAppState;
  generateDailyJourney: (seedDate?: string) => void;
  addPromiseTableItem: (query?: string) => void;
  updatePromiseTableStatus: (id: string, status: Phase112PromiseTableStatus) => void;
  saveBookEntry: (entry: Parameters<typeof saveBookEntry>[1]) => void;
  saveJournalEntry: (text?: string, scriptureReferences?: string[]) => void;
  saveTestimony: (testimony: Parameters<typeof saveTestimony>[1]) => void;
  createTeoGuideTurn: (prompt?: string) => void;
  setConsentState: (personalization: TeoyubeConsentChoice) => void;
  addPersonalizationSignal: (label: string, source?: Parameters<typeof addPersonalizationSignal>[2]) => void;
  resetPersonalization: () => void;
  setActiveTigSurface: (surface: Phase11ProductSurface, input?: string) => void;
  createSafeExportBundle: () => ReturnType<typeof createSafeExportBundle>;
};

const TeoyubeAppStateContext = createContext<TeoyubeAppStateContextValue | undefined>(undefined);

export function TeoyubeAppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TeoyubeAppState>(() => createInitialTeoyubeAppState());

  const value = useMemo<TeoyubeAppStateContextValue>(
    () => ({
      state,
      generateDailyJourney: (seedDate) => setState((current) => generateDailyJourney(current, seedDate)),
      addPromiseTableItem: (query) => setState((current) => addPromiseTableItem(current, query)),
      updatePromiseTableStatus: (id, status) =>
        setState((current) => updatePromiseTableStatus(current, id, status)),
      saveBookEntry: (entry) => setState((current) => saveBookEntry(current, entry)),
      saveJournalEntry: (text, scriptureReferences) =>
        setState((current) => saveJournalEntry(current, text, scriptureReferences)),
      saveTestimony: (testimony) => setState((current) => saveTestimony(current, testimony)),
      createTeoGuideTurn: (prompt) => setState((current) => createTeoGuideTurn(current, prompt)),
      setConsentState: (personalization) => setState((current) => setConsentState(current, personalization)),
      addPersonalizationSignal: (label, source) =>
        setState((current) => addPersonalizationSignal(current, label, source)),
      resetPersonalization: () => setState((current) => resetPersonalization(current)),
      setActiveTigSurface: (surface, input) =>
        setState((current) => setActiveTigSurface(current, surface, input)),
      createSafeExportBundle: () => createSafeExportBundle(state)
    }),
    [state]
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
