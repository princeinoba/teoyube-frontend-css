import type {
  TIGID,
  ISODateString,
  TIGAIRequest,
  TIGAIResponse
} from "./types";

export type TIGJournalEntry = {
  id: TIGID;
  userId?: string;
  prompt?: string;
  entry: string;
  requestInput?: string;
  requestMode?: TIGAIRequest["mode"];
  scriptureReferences: string[];
  teoyubeWords: string[];
  promiseClusters: string[];
  journey?: string;
  relatedResponseIntent?: string;
  relatedDecisionSummaryItems?: Array<{
    label: string;
    value: string;
    nodeId?: string;
    nodeType?: string;
  }>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

type RuntimeResponse = TIGAIResponse & {
  scriptures?: unknown[];
  scriptureNodes?: unknown[];
  teoyubeWords?: unknown;
  promiseClusters?: unknown;
  journey?: unknown;
};

export const TIG_LOCAL_JOURNAL_STORAGE_KEY = "teoyube:tig:journal-entries";

let sessionJournalEntries: TIGJournalEntry[] = [];

function createLocalJournalEntryId(): TIGID {
  return `tig_journal_${Date.now()}_${Math.random().toString(36).slice(2, 10)}` as TIGID;
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

function extractScriptureReferences(response: RuntimeResponse | undefined): string[] {
  if (!response) return [];

  return uniqueStrings([
    ...extractArrayLabels(response.scriptures, ["reference", "title", "id"]),
    ...extractArrayLabels(response.scriptureNodes, ["reference", "title", "id"])
  ]);
}

function extractIntentLabel(response: TIGAIResponse | undefined): string | undefined {
  if (!response) return undefined;
  return getStringField(response.detectedIntent, ["intent", "label", "value", "id"]);
}

function extractDecisionSummaryItems(
  response: TIGAIResponse | undefined
): TIGJournalEntry["relatedDecisionSummaryItems"] {
  const items = response?.decisionSummary?.items || [];
  if (!items.length) return undefined;

  return items.map((item) => ({
    label: item.label,
    value: item.value,
    nodeId: item.nodeId,
    nodeType: item.nodeType
  }));
}

function readStoredJournalEntries(): TIGJournalEntry[] {
  return sessionJournalEntries;
}

export function createTIGJournalEntry(params: {
  entry: string;
  prompt?: string;
  request?: TIGAIRequest;
  response?: TIGAIResponse;
  userId?: string;
}): TIGJournalEntry {
  const runtimeResponse = params.response as RuntimeResponse | undefined;
  const timestamp = new Date().toISOString() as ISODateString;

  return {
    id: createLocalJournalEntryId(),
    userId: params.userId || params.request?.context?.userId,
    prompt: params.prompt,
    entry: params.entry,
    requestInput: params.request?.input,
    requestMode: params.request?.mode,
    scriptureReferences: extractScriptureReferences(runtimeResponse),
    teoyubeWords: extractArrayLabels(runtimeResponse?.teoyubeWords, [
      "word",
      "title",
      "slug",
      "id"
    ]),
    promiseClusters: extractArrayLabels(runtimeResponse?.promiseClusters, [
      "clusterName",
      "clusterKey",
      "title",
      "slug",
      "id"
    ]),
    journey: getStringField(runtimeResponse?.journey, [
      "journeyName",
      "journeyKey",
      "title",
      "slug",
      "id"
    ]),
    relatedResponseIntent: extractIntentLabel(params.response),
    relatedDecisionSummaryItems: extractDecisionSummaryItems(params.response),
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function saveTIGJournalEntry(entry: TIGJournalEntry): void {
  sessionJournalEntries = [entry, ...readStoredJournalEntries()].slice(0, 200);
}

export function getTIGJournalEntries(): TIGJournalEntry[] {
  return readStoredJournalEntries();
}

export function clearTIGJournalEntries(): void {
  sessionJournalEntries = [];
}

export function saveTIGReflectionAsJournalEntry(params: {
  entry: string;
  prompt?: string;
  request?: TIGAIRequest;
  response?: TIGAIResponse;
  userId?: string;
}): TIGJournalEntry {
  const journalEntry = createTIGJournalEntry(params);
  saveTIGJournalEntry(journalEntry);
  return journalEntry;
}
