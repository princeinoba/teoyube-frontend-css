import type { TeoGuideStructuredResponse } from "./teo-guide-structured-response";

export type ModelProviderId = "openai";
export type LiveModelRequestId = string;
export type ModelConfigurationVersion = string;
export type PromptVersion = string;
export type ModelRoute = "light" | "standard" | "advanced";

export type SafeProviderMetadata = Readonly<{
  traceId: string;
  subjectHash?: string;
  route: "/teo-guide";
  modelRoute: ModelRoute;
  consentIds: readonly string[];
  consentPurposes: readonly string[];
  memoryIncluded: boolean;
  sensitiveContentIncluded: boolean;
  rawContentStored: false;
}>;

export type SafeModelSource = Readonly<{
  id: string;
  kind: "scripture" | "scripture_context" | "promise_cluster" | "tig" | "journey" | "approved_memory" | "safety_policy";
  authority: "Scripture" | "Teoyube interpretation" | "User-approved record" | "Safety policy";
  label: string;
  version: string;
  canonicalLabel?: string;
  translation?: "WEB";
  exactText?: string;
}>;

export type SafeModelToolResult = Readonly<{
  tool: string;
  status: "complete" | "fallback";
  summary: string;
  sourceIds: readonly string[];
  limitations: readonly string[];
  resultHash: string;
}>;

export type SafeModelMemoryRecord = Readonly<{
  recordId: string;
  purposeId: string;
  layer: "journey_state" | "semantic_preference" | "episodic";
  fields: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  sourceIds: readonly string[];
}>;

export type SafeModelInput = Readonly<{
  sanitizedUserMessage: string;
  safety: Readonly<{
    mode: "ordinary" | "sensitive";
    topic: string;
    allowedResponsePolicy: readonly string[];
  }>;
  sources: readonly SafeModelSource[];
  toolResults: readonly SafeModelToolResult[];
  journey?: Readonly<{
    journeyId: string;
    stage: string;
    revision: number;
    status: "active" | "completed";
    scriptureReferences: readonly string[];
  }>;
  memory: readonly SafeModelMemoryRecord[];
  versions: Readonly<{
    safetyPolicy: string;
    orchestration: string;
    toolRegistry: string;
    scriptureCorpus: string;
    tigDataset: string;
    tigRuleset: string;
  }>;
  limits: Readonly<{
    messageCharacters: number;
    sourceCount: number;
    toolResultCharacters: number;
    memoryRecordCount: number;
    estimatedInputTokens: number;
    truncated: boolean;
    removedContext: readonly string[];
  }>;
}>;

export type StrictFunctionToolDefinition = Readonly<{
  name: string;
  description: string;
  strict: true;
  parameters: Readonly<Record<string, unknown>>;
  outputSchemaVersion: string;
  stateMutation: false;
}>;

export type ModelToolRequest = Readonly<{
  toolCallId: string;
  name: string;
  arguments: Readonly<Record<string, unknown>>;
  round: number;
  authorized: boolean;
  resultHash?: string;
}>;

export type SafeModelRefusal = Readonly<{
  code: "provider_refusal";
  safeSummary: string;
}>;

export type SafeUsageMetadata = Readonly<{
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  providerCalls: number;
  toolRounds: number;
  estimatedCostUsd?: number;
  pricingVersion: string;
}>;

export type LiveStructuredGenerationRequest = Readonly<{
  requestId: LiveModelRequestId;
  modelRoute: ModelRoute;
  modelId: string;
  snapshotId?: string;
  modelConfigurationVersion: ModelConfigurationVersion;
  promptVersion: PromptVersion;
  promptChecksum: string;
  systemPrompt: string;
  responseSchemaVersion: string;
  safetyPolicyVersion: string;
  orchestrationVersion: string;
  input: SafeModelInput;
  allowedTools: readonly StrictFunctionToolDefinition[];
  maximumToolRounds: number;
  maximumOutputTokens: number;
  timeoutMs: number;
  store: false;
  metadata: SafeProviderMetadata;
  abortSignal?: AbortSignal;
}>;

export type LiveStructuredGenerationStatus =
  | "completed"
  | "refused"
  | "timeout"
  | "cancelled"
  | "rate_limited"
  | "budget_blocked"
  | "provider_error"
  | "schema_invalid"
  | "safety_blocked";

export type LiveStructuredGenerationResult = Readonly<{
  requestId: LiveModelRequestId;
  provider: ModelProviderId;
  modelId: string;
  modelSnapshot?: string;
  responseId?: string;
  structuredResponse?: TeoGuideStructuredResponse;
  refusal?: SafeModelRefusal;
  toolRequests: readonly ModelToolRequest[];
  usage: SafeUsageMetadata;
  latencyMs: number;
  providerRequestId?: string;
  status: LiveStructuredGenerationStatus;
  safeErrorCode?: string;
}>;

export type ApprovedSection = Readonly<{
  kind: TeoGuideStructuredResponse["sections"][number]["kind"];
  label: string;
  body: string;
  sourceIds: readonly string[];
}>;

export type LiveModelEvent =
  | Readonly<{ type: "model_started"; requestId: string }>
  | Readonly<{ type: "provider_connected"; requestId: string }>
  | Readonly<{ type: "tool_request_ready"; requestId: string; toolCallId: string }>
  | Readonly<{ type: "tool_result_submitted"; requestId: string; toolCallId: string }>
  | Readonly<{ type: "structured_response_ready"; requestId: string }>
  | Readonly<{ type: "approved_section"; requestId: string; section: ApprovedSection }>
  | Readonly<{ type: "completed"; requestId: string; usage: SafeUsageMetadata }>
  | Readonly<{ type: "fallback"; requestId: string; reasonCode: string }>
  | Readonly<{ type: "error"; requestId: string; safeCode: string }>;

export type ModelGatewayHealth = Readonly<{
  provider: ModelProviderId;
  configured: boolean;
  state: "disabled" | "configured_not_probed" | "available" | "unavailable";
  modelConfigurationVersion: string;
  keyPresent: boolean;
  secretValuesExposed: false;
}>;

export interface LiveModelGateway {
  generateStructured(request: LiveStructuredGenerationRequest): Promise<LiveStructuredGenerationResult>;
  streamStructured(request: LiveStructuredGenerationRequest): AsyncIterable<LiveModelEvent>;
  health(): Promise<ModelGatewayHealth>;
}
