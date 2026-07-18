import type { TIGUserActivity } from "./user-activity";
import type {
  UserJourneyState,
  TIGAIRequest,
  TIGAIResponse,
  ISODateString,
  TIGID
} from "./types";

export const TIG_FIRESTORE_COLLECTIONS = {
  users: "users",
  tigActivities: "tigActivities",
  journeyStates: "journeyStates",
  savedResponses: "savedResponses",
  journalEntries: "journalEntries",
  milestones: "milestones"
} as const;

export type TIGFirestoreDocumentBase = {
  id: TIGID;
  userId: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type TIGFirestoreActivityDocument = TIGFirestoreDocumentBase & {
  activity: TIGUserActivity;
};

export type TIGFirestoreSavedResponseDocument = TIGFirestoreDocumentBase & {
  request?: TIGAIRequest;
  response: TIGAIResponse;
  title?: string;
  scriptureReferences: string[];
  journey?: string;
  tags: string[];
};

export type TIGFirestoreJourneyStateDocument = TIGFirestoreDocumentBase & {
  journeyState: UserJourneyState;
};

export type TIGFirestoreJournalEntryDocument = TIGFirestoreDocumentBase & {
  prompt?: string;
  entry: string;
  scriptureReferences: string[];
  teoyubeWords: string[];
  journey?: string;
  relatedActivityId?: string;
};

type RuntimeTIGResponse = TIGAIResponse & {
  scriptures?: unknown[];
  scriptureNodes?: unknown[];
  journey?: unknown;
};

function createFirestoreDocumentId(prefix: string): TIGID {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}` as TIGID;
}

function nowIso(): ISODateString {
  return new Date().toISOString() as ISODateString;
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getStringField(value: unknown, fields: string[]): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;

  const record = getRecord(value);
  for (const field of fields) {
    const fieldValue = record[field];
    if (typeof fieldValue === "string" && fieldValue.trim()) return fieldValue.trim();
  }

  return undefined;
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function extractArrayLabels(values: unknown, fields: string[]): string[] {
  if (!Array.isArray(values)) return [];
  return uniqueStrings(values.map((value) => getStringField(value, fields)));
}

function extractScriptureReferences(response: TIGAIResponse): string[] {
  const runtimeResponse = response as RuntimeTIGResponse;

  return uniqueStrings([
    ...extractArrayLabels(runtimeResponse.scriptures, ["reference", "title", "id"]),
    ...extractArrayLabels(runtimeResponse.scriptureNodes, ["reference", "title", "id"])
  ]);
}

function extractJourney(response: TIGAIResponse): string | undefined {
  const runtimeResponse = response as RuntimeTIGResponse;

  return getStringField(runtimeResponse.journey, [
    "journeyName",
    "journeyKey",
    "title",
    "slug",
    "id"
  ]);
}

function createDocumentBase(userId: string, prefix: string): TIGFirestoreDocumentBase {
  const createdAt = nowIso();

  return {
    id: createFirestoreDocumentId(prefix),
    userId,
    createdAt,
    updatedAt: createdAt
  };
}

export function createFirestoreActivityDocument(params: {
  userId: string;
  activity: TIGUserActivity;
}): TIGFirestoreActivityDocument {
  return {
    ...createDocumentBase(params.userId, "tig_activity"),
    activity: params.activity
  };
}

export function createFirestoreSavedResponseDocument(params: {
  userId: string;
  request?: TIGAIRequest;
  response: TIGAIResponse;
  title?: string;
  tags?: string[];
}): TIGFirestoreSavedResponseDocument {
  return {
    ...createDocumentBase(params.userId, "tig_saved_response"),
    request: params.request,
    response: params.response,
    title: params.title,
    scriptureReferences: extractScriptureReferences(params.response),
    journey: extractJourney(params.response),
    tags: params.tags || []
  };
}

export function createFirestoreJourneyStateDocument(params: {
  userId: string;
  journeyState: UserJourneyState;
}): TIGFirestoreJourneyStateDocument {
  return {
    ...createDocumentBase(params.userId, "tig_journey_state"),
    journeyState: params.journeyState
  };
}

export function createFirestoreJournalEntryDocument(params: {
  userId: string;
  entry: string;
  prompt?: string;
  scriptureReferences?: string[];
  teoyubeWords?: string[];
  journey?: string;
  relatedActivityId?: string;
}): TIGFirestoreJournalEntryDocument {
  return {
    ...createDocumentBase(params.userId, "tig_journal_entry"),
    prompt: params.prompt,
    entry: params.entry,
    scriptureReferences: params.scriptureReferences || [],
    teoyubeWords: params.teoyubeWords || [],
    journey: params.journey,
    relatedActivityId: params.relatedActivityId
  };
}
