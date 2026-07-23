import OpenAI from "openai";
import type {
  FunctionTool,
  Response as OpenAiResponse,
  ResponseCreateParamsStreaming,
  ResponseFunctionToolCall,
  ResponseInputItem,
  ResponseStreamEvent
} from "openai/resources/responses/responses";
import type {
  LiveModelEvent,
  LiveModelGateway,
  LiveStructuredGenerationRequest,
  LiveStructuredGenerationResult,
  ModelGatewayHealth,
  ModelToolRequest,
  SafeUsageMetadata
} from "../../domain/live-ai/model-gateway";
import {
  parseTeoGuideStructuredResponse,
  TEO_GUIDE_STRUCTURED_RESPONSE_JSON_SCHEMA
} from "../../domain/live-ai/teo-guide-structured-response";
import { validateModelToolArguments } from "./model-tool-definitions";
import {
  estimateLiveAiCost,
  LIVE_AI_GUARDRAIL_VERSION
} from "./live-ai-guardrails";
import {
  LIVE_AI_MODEL_CONFIGURATION_VERSION,
  LIVE_AI_PRICING_VERSION,
  openAiApiKey,
  openAiOrganizationId,
  readLiveAiRuntimeConfiguration
} from "./model-configuration";

export const OPENAI_RESPONSES_ADAPTER_VERSION = "teoyube-openai-responses-2026-07-23.1";

type OpenAiResponsesTransport = Readonly<{
  responses: Readonly<{
    create(
      body: ResponseCreateParamsStreaming,
      options?: Readonly<{ signal?: AbortSignal }>
    ): Promise<AsyncIterable<ResponseStreamEvent>>;
  }>;
}>;

export type OpenAiResponsesAdapterOptions = Readonly<{
  environment?: NodeJS.ProcessEnv;
  clientFactory?: (apiKey: string, organization?: string) => OpenAiResponsesTransport;
  monotonicNow?: () => number;
}>;

type EventSink = (event: LiveModelEvent) => void;

function emptyUsage(providerCalls = 0, toolRounds = 0): SafeUsageMetadata {
  return Object.freeze({
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    totalTokens: 0,
    providerCalls,
    toolRounds,
    estimatedCostUsd: 0,
    pricingVersion: LIVE_AI_PRICING_VERSION
  });
}

function addUsage(current: SafeUsageMetadata, response: OpenAiResponse, route: "light" | "standard", toolRounds: number): SafeUsageMetadata {
  const usage = response.usage;
  if (!usage) return Object.freeze({ ...current, toolRounds });
  const inputTokens = current.inputTokens + usage.input_tokens;
  const cachedInputTokens = current.cachedInputTokens + (usage.input_tokens_details?.cached_tokens || 0);
  const outputTokens = current.outputTokens + usage.output_tokens;
  const reasoningTokens = current.reasoningTokens + (usage.output_tokens_details?.reasoning_tokens || 0);
  return Object.freeze({
    inputTokens,
    cachedInputTokens,
    outputTokens,
    reasoningTokens,
    totalTokens: current.totalTokens + usage.total_tokens,
    providerCalls: current.providerCalls,
    toolRounds,
    estimatedCostUsd: estimateLiveAiCost({ route, inputTokens, cachedInputTokens, outputTokens }),
    pricingVersion: LIVE_AI_PRICING_VERSION
  });
}

function providerMetadata(request: LiveStructuredGenerationRequest): Readonly<Record<string, string>> {
  return Object.freeze({
    trace_id: request.metadata.traceId.slice(0, 64),
    route: "teo-guide",
    model_route: request.modelRoute,
    prompt_version: request.promptVersion.slice(0, 64),
    schema_version: request.responseSchemaVersion.slice(0, 64),
    safety_version: request.safetyPolicyVersion.slice(0, 64),
    memory_included: String(request.metadata.memoryIncluded),
    sensitive_content: String(request.metadata.sensitiveContentIncluded),
    raw_content_stored: "false"
  });
}

function providerTools(request: LiveStructuredGenerationRequest): FunctionTool[] {
  return request.allowedTools.map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
    strict: true
  }));
}

function initialInput(request: LiveStructuredGenerationRequest): ResponseInputItem[] {
  const safeEnvelope = Object.freeze({
    safeInputVersion: "teoyube-safe-model-input-2026-07-22.1",
    responseSchemaVersion: request.responseSchemaVersion,
    request: request.input
  });
  return [{
    type: "message",
    role: "user",
    content: [{ type: "input_text", text: JSON.stringify(safeEnvelope) }]
  }];
}

function refusalText(response: OpenAiResponse): string | undefined {
  for (const item of response.output) {
    if (item.type !== "message") continue;
    const refusal = item.content.find((content) => content.type === "refusal");
    if (refusal?.type === "refusal") return refusal.refusal;
  }
  return undefined;
}

function functionCalls(response: OpenAiResponse): readonly ResponseFunctionToolCall[] {
  return Object.freeze(response.output.filter((item): item is ResponseFunctionToolCall => item.type === "function_call"));
}

function safeErrorStatus(error: unknown, timedOut: boolean, clientCancelled: boolean): LiveStructuredGenerationResult["status"] {
  if (clientCancelled) return "cancelled";
  if (timedOut) return "timeout";
  if (error instanceof OpenAI.RateLimitError) return "rate_limited";
  return "provider_error";
}

function safeErrorCode(error: unknown, status: LiveStructuredGenerationResult["status"], stage = "unknown"): string {
  if (status === "cancelled") return "client_cancelled";
  if (status === "timeout") return "provider_timeout";
  if (status === "rate_limited") return "provider_rate_limited";
  if (error instanceof OpenAI.AuthenticationError) return "provider_authentication_unavailable";
  if (error instanceof OpenAI.NotFoundError) return "approved_model_unavailable";
  if (error instanceof OpenAI.BadRequestError) {
    const parameter = typeof error.param === "string" ? error.param : "";
    if (parameter === "model") return "approved_model_request_invalid";
    if (parameter.startsWith("text.format") || parameter.includes("schema")) return "provider_structured_schema_rejected";
    if (parameter.startsWith("tools") || parameter === "tool_choice") return "provider_tool_schema_rejected";
    return "provider_request_invalid";
  }
  if (error instanceof OpenAI.PermissionDeniedError) return "provider_project_permission_denied";
  if (error instanceof OpenAI.APIError) {
    const parameter = typeof error.param === "string" ? error.param : "";
    if (parameter === "model") return "approved_model_request_invalid";
    if (parameter.startsWith("text.format") || parameter.includes("schema")) return "provider_structured_schema_rejected";
    if (parameter.startsWith("tools") || parameter === "tool_choice") return "provider_tool_schema_rejected";
    if (error.code === "insufficient_quota") return "provider_project_quota_unavailable";
    const safeType = typeof error.type === "string" ? error.type.replace(/[^a-z0-9]/gi, "").slice(0, 32).toLowerCase() : "apierror";
    return `provider_api_${safeType || "apierror"}`;
  }
  if (error instanceof TypeError) return `provider_${stage}_type_error`;
  if (error instanceof SyntaxError) return `provider_${stage}_syntax_error`;
  if (error instanceof Error) {
    const safeMessage = error.message.toLowerCase();
    if (safeMessage.includes("schema") || safeMessage.includes("json_schema")) return "provider_structured_schema_rejected";
    if (safeMessage.includes("tool") || safeMessage.includes("function")) return "provider_tool_schema_rejected";
    if (safeMessage.includes("model")) return "approved_model_request_invalid";
    if (safeMessage.includes("permission") || safeMessage.includes("project")) return "provider_project_permission_denied";
    if (safeMessage.includes("rate limit")) return "provider_rate_limited";
    if (safeMessage.includes("400")) return "provider_request_invalid";
    if (safeMessage.includes("401")) return "provider_authentication_unavailable";
    if (safeMessage.includes("403")) return "provider_project_permission_denied";
    if (safeMessage.includes("404")) return "approved_model_unavailable";
    const safeName = error.name.replace(/[^a-z]/gi, "").slice(0, 32).toLowerCase() || "error";
    return `provider_${stage}_${safeName}`;
  }
  return new Set(["transport_create", "stream_consume", "usage", "tool_validation", "structured_parse"]).has(stage)
    ? `provider_${stage}_failed`
    : "provider_unavailable";
}

function terminalResult(input: Readonly<{
  request: LiveStructuredGenerationRequest;
  status: LiveStructuredGenerationResult["status"];
  usage: SafeUsageMetadata;
  started: number;
  monotonicNow: () => number;
  response?: OpenAiResponse;
  toolRequests?: readonly ModelToolRequest[];
  safeErrorCode?: string;
}>): LiveStructuredGenerationResult {
  return Object.freeze({
    requestId: input.request.requestId,
    provider: "openai",
    modelId: input.request.modelId,
    modelSnapshot: input.request.snapshotId,
    responseId: input.response?.id,
    toolRequests: Object.freeze([...(input.toolRequests || [])]),
    usage: input.usage,
    latencyMs: Math.max(0, input.monotonicNow() - input.started),
    status: input.status,
    safeErrorCode: input.safeErrorCode
  });
}

export class OpenAiResponsesAdapter implements LiveModelGateway {
  readonly #environment: NodeJS.ProcessEnv;
  readonly #clientFactory: (apiKey: string, organization?: string) => OpenAiResponsesTransport;
  readonly #monotonicNow: () => number;
  #client?: OpenAiResponsesTransport;

  constructor(options: OpenAiResponsesAdapterOptions = {}) {
    this.#environment = options.environment || process.env;
    this.#clientFactory = options.clientFactory || ((apiKey, organization) => new OpenAI({
      apiKey,
      ...(organization ? { organization } : {}),
      maxRetries: 0,
      timeout: 15_000
    }));
    this.#monotonicNow = options.monotonicNow || (() => performance.now());
  }

  #transport(): OpenAiResponsesTransport | null {
    const key = openAiApiKey(this.#environment);
    if (!key) return null;
    const organization = openAiOrganizationId(this.#environment);
    if (!this.#client) this.#client = this.#clientFactory(key, organization);
    return this.#client;
  }

  async health(): Promise<ModelGatewayHealth> {
    const configuration = readLiveAiRuntimeConfiguration(this.#environment);
    return Object.freeze({
      provider: "openai",
      configured: configuration.enabled,
      state: configuration.enabled ? "configured_not_probed" : "disabled",
      modelConfigurationVersion: configuration.modelConfigurationVersion,
      keyPresent: configuration.keyPresent,
      secretValuesExposed: false
    });
  }

  async #execute(request: LiveStructuredGenerationRequest, emit: EventSink = () => undefined): Promise<LiveStructuredGenerationResult> {
    const started = this.#monotonicNow();
    emit(Object.freeze({ type: "model_started", requestId: request.requestId }));
    const transport = this.#transport();
    if (!transport || request.modelRoute === "advanced") {
      const code = request.modelRoute === "advanced" ? "advanced_route_disabled" : "provider_not_configured";
      emit(Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: code }));
      return terminalResult({ request, status: "provider_error", usage: emptyUsage(), started, monotonicNow: this.#monotonicNow, safeErrorCode: code });
    }
    if (request.store !== false || request.maximumToolRounds > 2 || request.maximumOutputTokens > 1_200) {
      emit(Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: "request_policy_invalid" }));
      return terminalResult({ request, status: "safety_blocked", usage: emptyUsage(), started, monotonicNow: this.#monotonicNow, safeErrorCode: "request_policy_invalid" });
    }
    const inputItems = initialInput(request);
    const toolRequests: ModelToolRequest[] = [];
    const seenCalls = new Set<string>();
    let usage = emptyUsage();
    let toolRounds = 0;
    let response: OpenAiResponse | undefined;
    let timedOut = false;
    let clientCancelled = false;
    let stage = "transport_create";
    const controller = new AbortController();
    const onClientAbort = () => { clientCancelled = true; controller.abort(); };
    request.abortSignal?.addEventListener("abort", onClientAbort, { once: true });
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, request.timeoutMs);
    try {
      while (true) {
        const body: ResponseCreateParamsStreaming = {
          model: request.modelId,
          instructions: request.systemPrompt,
          input: inputItems,
          tools: providerTools(request),
          tool_choice: "auto",
          parallel_tool_calls: false,
          max_output_tokens: request.maximumOutputTokens,
          metadata: providerMetadata(request),
          text: {
            format: {
              type: "json_schema",
              name: "teo_guide_structured_response",
              description: "A source-bound Teo Guide response with no Scripture text generated by the model.",
              schema: TEO_GUIDE_STRUCTURED_RESPONSE_JSON_SCHEMA,
              strict: true
            }
          },
          store: false,
          stream: true
        };
        stage = "transport_create";
        const stream = await transport.responses.create(body, { signal: controller.signal });
        usage = Object.freeze({ ...usage, providerCalls: usage.providerCalls + 1 });
        let connected = false;
        response = undefined;
        stage = "stream_consume";
        for await (const event of stream) {
          if (!connected && (event.type === "response.created" || event.type === "response.in_progress")) {
            connected = true;
            emit(Object.freeze({ type: "provider_connected", requestId: request.requestId }));
          }
          if (event.type === "response.completed") response = event.response;
          if (event.type === "response.failed" || event.type === "response.incomplete") response = event.response;
        }
        if (!response || response.status !== "completed") {
          const code = response?.status === "incomplete" ? "provider_incomplete" : "provider_stream_failed";
          emit(Object.freeze({ type: "error", requestId: request.requestId, safeCode: code }));
          return terminalResult({ request, status: "provider_error", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: code });
        }
        stage = "usage";
        usage = addUsage(usage, response, request.modelRoute, toolRounds);
        const refusal = refusalText(response);
        if (refusal) {
          return Object.freeze({
            ...terminalResult({ request, status: "refused", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests }),
            refusal: Object.freeze({ code: "provider_refusal", safeSummary: "The provider declined this structured request; deterministic Teo Guide remains available." })
          });
        }
        const calls = functionCalls(response);
        if (calls.length === 0) break;
        if (calls.length !== 1 || toolRounds >= request.maximumToolRounds) {
          emit(Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: calls.length !== 1 ? "parallel_tool_call_blocked" : "tool_round_limit" }));
          return terminalResult({ request, status: "safety_blocked", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: calls.length !== 1 ? "parallel_tool_call_blocked" : "tool_round_limit" });
        }
        const call = calls[0];
        const allowed = request.allowedTools.some((tool) => tool.name === call.name && tool.stateMutation === false);
        if (!allowed) {
          emit(Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: "unapproved_tool_request" }));
          return terminalResult({ request, status: "safety_blocked", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: "unapproved_tool_request" });
        }
        stage = "tool_validation";
        let argumentsValue: unknown;
        try {
          argumentsValue = JSON.parse(call.arguments);
        } catch {
          return terminalResult({ request, status: "schema_invalid", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: "tool_arguments_invalid_json" });
        }
        let validatedArguments: Readonly<Record<string, unknown>>;
        try {
          validatedArguments = validateModelToolArguments(call.name, argumentsValue);
        } catch {
          return terminalResult({ request, status: "schema_invalid", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: "tool_arguments_schema_invalid" });
        }
        const fingerprint = `${call.name}:${JSON.stringify(validatedArguments)}`;
        if (seenCalls.has(fingerprint)) {
          emit(Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: "repeated_tool_loop_blocked" }));
          return terminalResult({ request, status: "safety_blocked", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: "repeated_tool_loop_blocked" });
        }
        seenCalls.add(fingerprint);
        const prepared = request.input.toolResults.find((item) => item.tool === call.name);
        if (!prepared) {
          emit(Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: "prepared_tool_result_unavailable" }));
          return terminalResult({ request, status: "safety_blocked", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: "prepared_tool_result_unavailable" });
        }
        toolRounds += 1;
        toolRequests.push(Object.freeze({ toolCallId: call.call_id, name: call.name, arguments: validatedArguments, round: toolRounds, authorized: true, resultHash: prepared.resultHash }));
        emit(Object.freeze({ type: "tool_request_ready", requestId: request.requestId, toolCallId: call.call_id }));
        inputItems.push(call, { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(prepared) });
        emit(Object.freeze({ type: "tool_result_submitted", requestId: request.requestId, toolCallId: call.call_id }));
      }
      if (!response) throw new Error("The provider response was unavailable.");
      stage = "structured_parse";
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(response.output_text);
      } catch {
        emit(Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: "structured_response_invalid_json" }));
        return terminalResult({ request, status: "schema_invalid", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: "structured_response_invalid_json" });
      }
      try {
        const structuredResponse = parseTeoGuideStructuredResponse(parsedJson);
        emit(Object.freeze({ type: "structured_response_ready", requestId: request.requestId }));
        return Object.freeze({
          ...terminalResult({ request, status: "completed", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests }),
          structuredResponse
        });
      } catch {
        emit(Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: "structured_response_schema_invalid" }));
        return terminalResult({ request, status: "schema_invalid", usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: "structured_response_schema_invalid" });
      }
    } catch (error) {
      const status = safeErrorStatus(error, timedOut, clientCancelled);
      const code = safeErrorCode(error, status, stage);
      emit(Object.freeze({ type: status === "cancelled" || status === "timeout" ? "fallback" : "error", requestId: request.requestId, ...(status === "cancelled" || status === "timeout" ? { reasonCode: code } : { safeCode: code }) } as LiveModelEvent));
      return terminalResult({ request, status, usage, started, monotonicNow: this.#monotonicNow, response, toolRequests, safeErrorCode: code });
    } finally {
      clearTimeout(timeout);
      request.abortSignal?.removeEventListener("abort", onClientAbort);
    }
  }

  generateStructured(request: LiveStructuredGenerationRequest): Promise<LiveStructuredGenerationResult> {
    return this.#execute(request);
  }

  async *streamStructured(request: LiveStructuredGenerationRequest): AsyncIterable<LiveModelEvent> {
    const events: LiveModelEvent[] = [];
    const result = await this.#execute(request, (event) => { events.push(event); });
    for (const event of events) yield event;
    if (result.status === "completed") yield Object.freeze({ type: "completed", requestId: request.requestId, usage: result.usage });
    else if (!events.some((event) => event.type === "fallback" || event.type === "error")) yield Object.freeze({ type: "fallback", requestId: request.requestId, reasonCode: result.safeErrorCode || result.status });
  }
}

export const openAiResponsesAdapter = new OpenAiResponsesAdapter();

export const OPENAI_RESPONSES_SECURITY_INVARIANTS = Object.freeze({
  sdkVersion: "6.48.0",
  responsesApiOnly: true,
  store: false,
  providerHostedConversationState: false,
  builtInTools: false,
  toolSearch: false,
  programmaticToolCalling: false,
  parallelToolCalls: false,
  backgroundMode: false,
  realtime: false,
  clientSdk: false,
  baseUrlUserControlled: false,
  retriesOwnedBySdk: false,
  configurationVersion: LIVE_AI_MODEL_CONFIGURATION_VERSION,
  guardrailVersion: LIVE_AI_GUARDRAIL_VERSION
});
