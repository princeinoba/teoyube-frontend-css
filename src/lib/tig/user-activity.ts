import type {
  ISODateString,
  TIGAIRequest,
  TIGAIResponse,
  TIGID
} from "./types";

export type TIGUserActivityType =
  | "promise_saved"
  | "prayer_saved"
  | "reflection_saved"
  | "action_saved"
  | "journey_started"
  | "milestone_reached"
  | "response_saved";

export type TIGUserActivity = {
  id: TIGID;
  userId?: string;
  type: TIGUserActivityType;
  requestInput?: string;
  requestMode?: TIGAIRequest["mode"];
  responseIntent?: string;
  scriptureReferences: string[];
  teoyubeWords: string[];
  promiseClusters: string[];
  journey?: string;
  prayer?: string;
  reflectionPrompt?: string;
  actionStep?: string;
  decisionSummaryTitle?: string;
  decisionSummaryItems?: Array<{
    label: string;
    value: string;
    nodeId?: string;
    nodeType?: string;
  }>;
  createdAt: ISODateString;
};

type RuntimeResponse = TIGAIResponse & {
  scriptures?: unknown[];
  confidence?: unknown;
};

export const TIG_LOCAL_ACTIVITY_STORAGE_KEY = "teoyube:tig:user-activity";

let sessionActivities: TIGUserActivity[] = [];

function createLocalActivityId(): TIGID {
  return `tig_activity_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

function extractScriptureReferences(response: RuntimeResponse): string[] {
  return uniqueStrings([
    ...extractArrayLabels(response.scriptures, ["reference", "title", "id"]),
    ...extractArrayLabels(response.scriptureNodes, ["reference", "title", "id"])
  ]);
}

function extractIntentLabel(response: TIGAIResponse): string | undefined {
  return getStringField(response.detectedIntent, ["intent", "label", "value", "id"]);
}

function extractDecisionSummaryItems(response: TIGAIResponse): TIGUserActivity["decisionSummaryItems"] {
  const items = response.decisionSummary?.items || [];
  if (!items.length) return undefined;

  return items.map((item) => ({
    label: item.label,
    value: item.value,
    nodeId: item.nodeId,
    nodeType: item.nodeType
  }));
}

function readStoredActivities(): TIGUserActivity[] {
  return sessionActivities;
}

export function createTIGUserActivity(params: {
  request?: TIGAIRequest;
  response: TIGAIResponse;
  userId?: string;
  type?: TIGUserActivityType;
}): TIGUserActivity {
  const runtimeResponse = params.response as RuntimeResponse;

  return {
    id: createLocalActivityId(),
    userId: params.userId || params.request?.context?.userId,
    type: params.type || "response_saved",
    requestInput: params.request?.input,
    requestMode: params.request?.mode,
    responseIntent: extractIntentLabel(params.response),
    scriptureReferences: extractScriptureReferences(runtimeResponse),
    teoyubeWords: extractArrayLabels(runtimeResponse.teoyubeWords, [
      "word",
      "title",
      "slug",
      "id"
    ]),
    promiseClusters: extractArrayLabels(runtimeResponse.promiseClusters, [
      "clusterName",
      "clusterKey",
      "title",
      "slug",
      "id"
    ]),
    journey: getStringField(runtimeResponse.journey, [
      "journeyName",
      "journeyKey",
      "title",
      "slug",
      "id"
    ]),
    prayer: getStringField(runtimeResponse.prayer, ["prayer"]),
    reflectionPrompt: getStringField(runtimeResponse.reflectionPrompt, [
      "prompt",
      "title",
      "id"
    ]),
    actionStep: getStringField(runtimeResponse.actionStep, [
      "actionText",
      "action",
      "title",
      "id"
    ]),
    decisionSummaryTitle: params.response.decisionSummary?.title,
    decisionSummaryItems: extractDecisionSummaryItems(params.response),
    createdAt: new Date().toISOString()
  };
}

export function saveTIGUserActivity(activity: TIGUserActivity): void {
  sessionActivities = [activity, ...readStoredActivities()].slice(0, 100);
}

export function getTIGUserActivities(): TIGUserActivity[] {
  return readStoredActivities();
}

export function clearTIGUserActivities(): void {
  sessionActivities = [];
}

export function saveTIGResponseAsActivity(params: {
  request?: TIGAIRequest;
  response: TIGAIResponse;
  userId?: string;
  type?: TIGUserActivityType;
}): TIGUserActivity {
  const activity = createTIGUserActivity(params);
  saveTIGUserActivity(activity);
  return activity;
}
