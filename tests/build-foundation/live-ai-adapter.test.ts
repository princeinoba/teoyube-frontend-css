import { describe, expect, it } from "vitest";
import type { LiveStructuredGenerationRequest, SafeModelInput } from "../../src/domain/live-ai/model-gateway";
import { TEO_GUIDE_LIVE_RESPONSE_SCHEMA_VERSION } from "../../src/domain/live-ai/teo-guide-structured-response";
import { OpenAiResponsesAdapter } from "../../src/server/live-ai/openai-responses-adapter";

const safeInput: SafeModelInput = Object.freeze({
  sanitizedUserMessage: "Help me understand James 1:5.",
  safety: Object.freeze({ mode: "ordinary", topic: "ordinary", allowedResponsePolicy: Object.freeze(["Remain humble."]) }),
  sources: Object.freeze([Object.freeze({ id: "src-1", kind: "scripture", authority: "Scripture", label: "James 1:5", version: "web-test", canonicalLabel: "James 1:5", translation: "WEB", exactText: "But if any of you lacks wisdom, let him ask of God." })]),
  toolResults: Object.freeze([]),
  memory: Object.freeze([]),
  versions: Object.freeze({ safetyPolicy: "safety", orchestration: "orchestration", toolRegistry: "tools", scriptureCorpus: "web-test", tigDataset: "tig", tigRuleset: "rules" }),
  limits: Object.freeze({ messageCharacters: 28, sourceCount: 1, toolResultCharacters: 0, memoryRecordCount: 0, estimatedInputTokens: 200, truncated: false, removedContext: Object.freeze([]) })
});

function request(signal?: AbortSignal): LiveStructuredGenerationRequest {
  return Object.freeze({
    requestId: "live-adapter-test",
    modelRoute: "light",
    modelId: "gpt-5.4-mini-2026-03-17",
    snapshotId: "gpt-5.4-mini-2026-03-17",
    modelConfigurationVersion: "models",
    promptVersion: "prompt",
    promptChecksum: "checksum",
    systemPrompt: "Return the strict source-bound response.",
    responseSchemaVersion: TEO_GUIDE_LIVE_RESPONSE_SCHEMA_VERSION,
    safetyPolicyVersion: "safety",
    orchestrationVersion: "orchestration",
    input: safeInput,
    allowedTools: Object.freeze([]),
    maximumToolRounds: 0,
    maximumOutputTokens: 1200,
    timeoutMs: 1000,
    store: false,
    metadata: Object.freeze({ traceId: "trace", route: "/teo-guide", modelRoute: "light", consentIds: Object.freeze(["consent"]), consentPurposes: Object.freeze(["external_ai_processing"]), memoryIncluded: false, sensitiveContentIncluded: false, rawContentStored: false }),
    ...(signal ? { abortSignal: signal } : {})
  });
}

const validStructured = Object.freeze({
  schemaVersion: TEO_GUIDE_LIVE_RESPONSE_SCHEMA_VERSION,
  acknowledgement: "Let us examine the exact Scripture source with humility.",
  sections: Object.freeze([Object.freeze({ kind: "interpretation", label: "Teoyube interpretation", body: "This passage encourages asking God for wisdom without making a guaranteed outcome claim.", sourceIds: Object.freeze(["src-1"]) })]),
  citations: Object.freeze([Object.freeze({ sourceId: "src-1", canonicalLabel: "James 1:5", translation: "WEB", corpusVersion: "web-test" })]),
  whyThis: Object.freeze(["The deterministic source matched the request."]),
  limitations: Object.freeze(["This is a devotional aid, not divine certainty."]),
  followUp: Object.freeze({ question: null, reason: null }),
  actionProposalIds: Object.freeze([])
});

function completedResponse(output: unknown = validStructured) {
  return {
    id: "resp-safe",
    status: "completed",
    output: [],
    output_text: JSON.stringify(output),
    usage: { input_tokens: 200, input_tokens_details: { cached_tokens: 0 }, output_tokens: 100, output_tokens_details: { reasoning_tokens: 0 }, total_tokens: 300 }
  };
}

function clientFor(events: readonly unknown[], capture?: (body: Readonly<Record<string, unknown>>) => void) {
  return () => ({ responses: { create: async (body: Readonly<Record<string, unknown>>) => {
    capture?.(body);
    return (async function* () { for (const event of events) yield event; })();
  } } }) as never;
}

describe("OpenAI Responses adapter", () => {
  it("binds the server-only organization when constructing the official client", async () => {
    let receivedOrganization: string | undefined;
    const adapter = new OpenAiResponsesAdapter({
      environment: { OPENAI_API_KEY: "test", OPENAI_ORG_ID: "org-funded-test" },
      clientFactory: (_apiKey, organization) => {
        receivedOrganization = organization;
        return clientFor([
          { type: "response.completed", response: completedResponse() }
        ])() as never;
      }
    });
    expect((await adapter.generateStructured(request())).status).toBe("completed");
    expect(receivedOrganization).toBe("org-funded-test");
  });

  it("uses streaming Responses API with store:false and validates before completion", async () => {
    let body: Readonly<Record<string, unknown>> | undefined;
    const adapter = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: clientFor([
      { type: "response.created" },
      { type: "response.completed", response: completedResponse() }
    ], (value) => { body = value; }), monotonicNow: () => 10 });
    const result = await adapter.generateStructured(request());
    expect(result).toMatchObject({ status: "completed", modelId: "gpt-5.4-mini-2026-03-17", toolRequests: [] });
    expect(result.structuredResponse).toEqual(validStructured);
    expect(body).toMatchObject({ store: false, stream: true, parallel_tool_calls: false, max_output_tokens: 1200 });
    expect(body?.tools).toEqual([]);
    expect(JSON.stringify(body)).not.toContain("OPENAI_API_KEY");
  });

  it("extracts strict JSON from streamed message output items without exposing raw deltas", async () => {
    const streamedResponse = {
      ...completedResponse(),
      output_text: undefined,
      output: [{
        type: "message",
        id: "message-safe",
        status: "completed",
        role: "assistant",
        content: [{
          type: "output_text",
          text: JSON.stringify(validStructured),
          annotations: []
        }]
      }]
    };
    const adapter = new OpenAiResponsesAdapter({
      environment: { OPENAI_API_KEY: "test" },
      clientFactory: clientFor([
        { type: "response.output_text.delta", delta: "RAW-UNVALIDATED-TEXT" },
        { type: "response.completed", response: streamedResponse }
      ])
    });
    const result = await adapter.generateStructured(request());
    expect(result).toMatchObject({ status: "completed", structuredResponse: validStructured });
    expect(JSON.stringify(result)).not.toContain("RAW-UNVALIDATED-TEXT");
  });

  it("fails closed for a missing key and invalid structured output", async () => {
    const absent = await new OpenAiResponsesAdapter({ environment: {} }).generateStructured(request());
    expect(absent).toMatchObject({ status: "provider_error", safeErrorCode: "provider_not_configured" });
    const invalid = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: clientFor([{ type: "response.completed", response: completedResponse({ unexpected: true }) }]) });
    expect(await invalid.generateStructured(request())).toMatchObject({ status: "schema_invalid", safeErrorCode: "structured_response_schema_invalid" });
  });

  it("withholds raw deltas and emits only typed lifecycle events", async () => {
    const adapter = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: clientFor([
      { type: "response.output_text.delta", delta: "RAW-UNVALIDATED-TEXT" },
      { type: "response.completed", response: completedResponse() }
    ]) });
    const events = [];
    for await (const event of adapter.streamStructured(request())) events.push(event);
    expect(JSON.stringify(events)).not.toContain("RAW-UNVALIDATED-TEXT");
    expect(events.map((event) => event.type)).toContain("structured_response_ready");
    expect(events.at(-1)?.type).toBe("completed");
  });

  it("maps cancellation to a typed fallback without retry or content", async () => {
    const controller = new AbortController();
    const clientFactory = () => ({
      responses: {
        create: async (_body: unknown, options?: Readonly<{ signal?: AbortSignal }>) => {
          async function* stream() {
            if (options?.signal?.aborted) throw new DOMException("aborted", "AbortError");
            await new Promise<void>((_resolve, reject) => options?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true }));
          }
          return stream();
        }
      }
    }) as never;
    const adapter = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory });
    const pending = adapter.generateStructured(request(controller.signal));
    controller.abort();
    expect(await pending).toMatchObject({ status: "cancelled", safeErrorCode: "client_cancelled" });
  });

  it("submits only one authorized prepared read-only tool result", async () => {
    const calls = [{
      type: "function_call",
      call_id: "call-1",
      name: "searchScripture",
      arguments: JSON.stringify({ query: "James 1:5", limit: 1 })
    }];
    const bodies: Readonly<Record<string, unknown>>[] = [];
    let invocation = 0;
    const adapter = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: clientFor([], (body) => { bodies.push(body); }) });
    const transport = {
      responses: {
        create: async (body: Readonly<Record<string, unknown>>) => {
          bodies.push(body);
          invocation += 1;
          const response = invocation === 1 ? { ...completedResponse(), output: calls } : completedResponse();
          return (async function* () { yield { type: "response.completed", response }; })();
        }
      }
    };
    const instrumented = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: () => transport as never });
    const prepared = Object.freeze({ tool: "searchScripture", status: "complete" as const, summary: "Exact WEB result prepared.", sourceIds: Object.freeze(["src-1"]), limitations: Object.freeze([]), resultHash: "a".repeat(64) });
    const authorizedRequest = Object.freeze({
      ...request(),
      input: Object.freeze({ ...safeInput, toolResults: Object.freeze([prepared]) }),
      allowedTools: Object.freeze([Object.freeze({ name: "searchScripture", description: "Read prepared Scripture.", strict: true as const, parameters: Object.freeze({ type: "object", additionalProperties: false, required: Object.freeze(["query", "limit"]), properties: Object.freeze({ query: Object.freeze({ type: "string" }), limit: Object.freeze({ type: "integer" }) }) }), outputSchemaVersion: "1", stateMutation: false as const })]),
      maximumToolRounds: 1
    });
    const result = await instrumented.generateStructured(authorizedRequest);
    expect(result).toMatchObject({ status: "completed", usage: { providerCalls: 2, toolRounds: 1 } });
    expect(result.toolRequests).toEqual([expect.objectContaining({ name: "searchScripture", authorized: true, resultHash: prepared.resultHash })]);
    expect(JSON.stringify(bodies[1])).toContain("function_call_output");
    expect(adapter).toBeInstanceOf(OpenAiResponsesAdapter);
  });

  it("blocks unapproved and parallel function calls without execution", async () => {
    const unapproved = { type: "function_call", call_id: "bad-1", name: "deleteMemory", arguments: "{}" };
    const toolCapableRequest = Object.freeze({ ...request(), maximumToolRounds: 1 });
    const adapter = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: clientFor([{ type: "response.completed", response: { ...completedResponse(), output: [unapproved] } }]) });
    expect(await adapter.generateStructured(toolCapableRequest)).toMatchObject({ status: "safety_blocked", safeErrorCode: "unapproved_tool_request", toolRequests: [] });
    const parallel = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: clientFor([{ type: "response.completed", response: { ...completedResponse(), output: [unapproved, { ...unapproved, call_id: "bad-2" }] } }]) });
    expect(await parallel.generateStructured(toolCapableRequest)).toMatchObject({ status: "safety_blocked", safeErrorCode: "parallel_tool_call_blocked", toolRequests: [] });
  });

  it("turns provider refusal and outage into typed non-content results", async () => {
    const refusalResponse = { ...completedResponse(), output: [{ type: "message", content: [{ type: "refusal", refusal: "provider detail withheld" }] }], output_text: "" };
    const refused = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: clientFor([{ type: "response.completed", response: refusalResponse }]) });
    expect(await refused.generateStructured(request())).toMatchObject({ status: "refused", refusal: { code: "provider_refusal" } });
    expect(JSON.stringify(await refused.generateStructured(request()))).not.toContain("provider detail withheld");
    const outage = new OpenAiResponsesAdapter({ environment: { OPENAI_API_KEY: "test" }, clientFactory: () => ({ responses: { create: async () => { throw new Error("synthetic private provider error"); } } }) as never });
    const failed = await outage.generateStructured(request());
    expect(failed).toMatchObject({ status: "provider_error", safeErrorCode: "provider_transport_create_error" });
    expect(JSON.stringify(failed)).not.toContain("synthetic private provider error");
  });
});
