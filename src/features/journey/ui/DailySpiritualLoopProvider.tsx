"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyDailySpiritualLoopAction as reduceDailySpiritualLoop,
  createDailySpiritualLoopState,
  type DailySpiritualLoopAction,
  type DailySpiritualLoopSeed,
  type DailySpiritualLoopState
} from "../../../domain/journey/daily-spiritual-loop";

type DailySpiritualLoopActionInput = Omit<DailySpiritualLoopAction, "createdAt"> & Readonly<{ createdAt?: string }>;

type DailySpiritualLoopContextValue = Readonly<{
  state: DailySpiritualLoopState | null;
  start(): void;
  act(action: DailySpiritualLoopActionInput): void;
}>;

const DailySpiritualLoopContext = createContext<DailySpiritualLoopContextValue | null>(null);

export function DailySpiritualLoopProvider({
  children,
  seed
}: {
  children: ReactNode;
  seed: DailySpiritualLoopSeed;
}) {
  const [state, setState] = useState<DailySpiritualLoopState | null>(null);

  useEffect(() => {
    if (!state) {
      delete document.body.dataset.dailyJourneyStage;
      delete document.body.dataset.dailyJourneyStatus;
      return;
    }
    document.body.dataset.dailyJourneyStage = state.currentStage;
    document.body.dataset.dailyJourneyStatus = state.active ? "active" : "complete";
    return () => {
      delete document.body.dataset.dailyJourneyStage;
      delete document.body.dataset.dailyJourneyStatus;
    };
  }, [state]);

  const value = useMemo<DailySpiritualLoopContextValue>(() => Object.freeze({
    state,
    start: () => setState(createDailySpiritualLoopState(seed, new Date().toISOString())),
    act: (action: DailySpiritualLoopActionInput) => setState((current) => current
      ? reduceDailySpiritualLoop(current, { ...action, createdAt: action.createdAt || new Date().toISOString() })
      : current)
  }), [seed, state]);

  return <DailySpiritualLoopContext.Provider value={value}>{children}</DailySpiritualLoopContext.Provider>;
}

export function useDailySpiritualLoop() {
  const context = useContext(DailySpiritualLoopContext);
  if (!context) throw new Error("useDailySpiritualLoop must be used inside DailySpiritualLoopProvider.");
  return context;
}
