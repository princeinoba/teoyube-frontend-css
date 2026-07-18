import type {
  TIGUserActivity,
  TIGUserActivityType
} from "./user-activity";
import {
  createTIGUserActivity,
  saveTIGUserActivity,
  getTIGUserActivities,
  clearTIGUserActivities
} from "./user-activity";
import type { TIGAIRequest, TIGAIResponse, UserJourneyState } from "./types";
import type { TIGJourneyProgressSummary } from "./journey-progress";
import {
  getLocalJourneyProgressSummaries,
  buildUserJourneyStateFromSummary
} from "./journey-progress";
import type { TIGJournalEntry } from "./journal";
import {
  createTIGJournalEntry,
  saveTIGJournalEntry,
  getTIGJournalEntries,
  clearTIGJournalEntries
} from "./journal";

export type TIGPersistenceProvider = "local" | "firestore_pending";

export type TIGPersistenceSaveParams = {
  request?: TIGAIRequest;
  response: TIGAIResponse;
  userId?: string;
  type?: TIGUserActivityType;
  provider?: TIGPersistenceProvider;
};

export type TIGPersistenceJournalSaveParams = {
  entry: string;
  prompt?: string;
  request?: TIGAIRequest;
  response?: TIGAIResponse;
  userId?: string;
  provider?: TIGPersistenceProvider;
};

export type TIGPersistenceResult<T> = {
  success: boolean;
  provider: TIGPersistenceProvider;
  data?: T;
  error?: string;
};

const FIRESTORE_PENDING_ERROR = "Firestore persistence is not connected yet.";
const FIRESTORE_JOURNAL_PENDING_ERROR = "Firestore journal persistence is not connected yet.";

function getProvider(provider?: TIGPersistenceProvider): TIGPersistenceProvider {
  return provider || "local";
}

function createPendingResult<T>(): TIGPersistenceResult<T> {
  return {
    success: false,
    provider: "firestore_pending",
    error: FIRESTORE_PENDING_ERROR
  };
}

function createJournalPendingResult<T>(): TIGPersistenceResult<T> {
  return {
    success: false,
    provider: "firestore_pending",
    error: FIRESTORE_JOURNAL_PENDING_ERROR
  };
}

export function saveTIGActivity(
  params: TIGPersistenceSaveParams
): TIGPersistenceResult<TIGUserActivity> {
  const provider = getProvider(params.provider);

  if (provider === "firestore_pending") {
    return createPendingResult<TIGUserActivity>();
  }

  try {
    const activity = createTIGUserActivity({
      request: params.request,
      response: params.response,
      userId: params.userId,
      type: params.type
    });

    saveTIGUserActivity(activity);

    return {
      success: true,
      provider,
      data: activity
    };
  } catch (error) {
    return {
      success: false,
      provider,
      error: error instanceof Error ? error.message : "Failed to save TIG activity."
    };
  }
}

export function loadTIGActivities(params?: {
  provider?: TIGPersistenceProvider;
}): TIGPersistenceResult<TIGUserActivity[]> {
  const provider = getProvider(params?.provider);

  if (provider === "firestore_pending") {
    return createPendingResult<TIGUserActivity[]>();
  }

  try {
    return {
      success: true,
      provider,
      data: getTIGUserActivities()
    };
  } catch (error) {
    return {
      success: false,
      provider,
      error: error instanceof Error ? error.message : "Failed to load TIG activities."
    };
  }
}

export function clearTIGActivityStore(params?: {
  provider?: TIGPersistenceProvider;
}): TIGPersistenceResult<boolean> {
  const provider = getProvider(params?.provider);

  if (provider === "firestore_pending") {
    return createPendingResult<boolean>();
  }

  try {
    clearTIGUserActivities();

    return {
      success: true,
      provider,
      data: true
    };
  } catch (error) {
    return {
      success: false,
      provider,
      data: false,
      error: error instanceof Error ? error.message : "Failed to clear TIG activities."
    };
  }
}

export function loadTIGJourneyProgress(params?: {
  provider?: TIGPersistenceProvider;
}): TIGPersistenceResult<TIGJourneyProgressSummary[]> {
  const provider = getProvider(params?.provider);

  if (provider === "firestore_pending") {
    return createPendingResult<TIGJourneyProgressSummary[]>();
  }

  try {
    return {
      success: true,
      provider,
      data: getLocalJourneyProgressSummaries()
    };
  } catch (error) {
    return {
      success: false,
      provider,
      error: error instanceof Error ? error.message : "Failed to load TIG journey progress."
    };
  }
}

export function buildUserJourneyStatesFromLocalProgress(userId: string): UserJourneyState[] {
  return getLocalJourneyProgressSummaries().map((summary) =>
    buildUserJourneyStateFromSummary({ userId, summary })
  );
}

export function saveTIGJournal(
  params: TIGPersistenceJournalSaveParams
): TIGPersistenceResult<TIGJournalEntry> {
  const provider = getProvider(params.provider);

  if (provider === "firestore_pending") {
    return createJournalPendingResult<TIGJournalEntry>();
  }

  try {
    const journalEntry = createTIGJournalEntry({
      entry: params.entry,
      prompt: params.prompt,
      request: params.request,
      response: params.response,
      userId: params.userId
    });

    saveTIGJournalEntry(journalEntry);

    return {
      success: true,
      provider,
      data: journalEntry
    };
  } catch (error) {
    return {
      success: false,
      provider,
      error: error instanceof Error ? error.message : "Failed to save TIG journal entry."
    };
  }
}

export function loadTIGJournalEntries(params?: {
  provider?: TIGPersistenceProvider;
}): TIGPersistenceResult<TIGJournalEntry[]> {
  const provider = getProvider(params?.provider);

  if (provider === "firestore_pending") {
    return createJournalPendingResult<TIGJournalEntry[]>();
  }

  try {
    return {
      success: true,
      provider,
      data: getTIGJournalEntries()
    };
  } catch (error) {
    return {
      success: false,
      provider,
      error: error instanceof Error ? error.message : "Failed to load TIG journal entries."
    };
  }
}

export function clearTIGJournalStore(params?: {
  provider?: TIGPersistenceProvider;
}): TIGPersistenceResult<boolean> {
  const provider = getProvider(params?.provider);

  if (provider === "firestore_pending") {
    return createJournalPendingResult<boolean>();
  }

  try {
    clearTIGJournalEntries();

    return {
      success: true,
      provider,
      data: true
    };
  } catch (error) {
    return {
      success: false,
      provider,
      data: false,
      error: error instanceof Error ? error.message : "Failed to clear TIG journal entries."
    };
  }
}
