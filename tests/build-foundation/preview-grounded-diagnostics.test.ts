import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createPreviewGroundedDiagnosticEnvelope,
  isPreviewGroundedDiagnosticsRuntime,
  previewGroundedDiagnosticEnvelopeSchema,
} from "../../src/server/live-ai/preview-grounded-diagnostics";
import {
  parseOpenAiPreviewGroundedResponse,
  PreviewGroundedProviderFailure,
  providerFailureFromApiError,
} from "../../src/server/live-ai/preview-grounded-provider-response";
import type { Response as OpenAiResponse } from "openai/resources/responses/responses";
import OpenAI from "openai";

const validPayload = Object.freeze({
  disposition: "answer",
  summary: "James presents asking God for wisdom as a humble response to need.",
  biblical_application: "Seek wisdom prayerfully, with Scripture and wise counsel.",
  prayer: "Father, grant wisdom and humility.",
  action_step: "Read James 1 in context and choose one faithful next step.",
  citation_ids: ["web:james.1.5"],
  limitations: ["This is interpretation, not divine certainty."],
  confidence: "high",
  safety_boundary: "This is interpretation, not divine certainty.",
});

function response(
  overrides: Partial<OpenAiResponse> = {},
): OpenAiResponse {
  const outputText = JSON.stringify(validPayload);
  return {
    id: "resp_synthetic",
    object: "response",
    created_at: 0,
    completed_at: 1,
    error: null,
    incomplete_details: null,
    instructions: null,
    max_output_tokens: 400,
    max_tool_calls: null,
    model: "gpt-5.6-terra",
    output: [
      {
        id: "msg_synthetic",
        type: "message",
        status: "completed",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: outputText,
            annotations: [],
            logprobs: [],
          },
        ],
      },
    ],
    output_text: outputText,
    parallel_tool_calls: false,
    previous_response_id: null,
    prompt_cache_key: null,
    prompt_cache_retention: null,
    reasoning: { effort: "low", generate_summary: null, summary: null },
    safety_identifier: null,
    service_tier: "default",
    status: "completed",
    temperature: null,
    text: { format: { type: "text" }, verbosity: "medium" },
    tool_choice: "auto",
    tools: [],
    top_logprobs: 0,
    top_p: null,
    truncation: "disabled",
    usage: {
      input_tokens: 200,
      input_tokens_details: { cached_tokens: 20 },
      output_tokens: 100,
      output_tokens_details: { reasoning_tokens: 25 },
      total_tokens: 300,
    },
    user: null,
    metadata: {},
    ...overrides,
  } as OpenAiResponse;
}

function failure(value: OpenAiResponse): PreviewGroundedProviderFailure {
  try {
    parseOpenAiPreviewGroundedResponse(value);
  } catch (error) {
    expect(error).toBeInstanceOf(PreviewGroundedProviderFailure);
    return error as PreviewGroundedProviderFailure;
  }
  throw new Error("fixture unexpectedly parsed");
}

describe("Responses API fail-closed parsing", () => {
  it("accepts only a completed, strict structured result and records usage without raw output", () => {
    const parsed = parseOpenAiPreviewGroundedResponse(response());
    expect(parsed.response).toEqual(validPayload);
    expect(parsed.diagnostic).toMatchObject({
      reasonCode: "COMPLETED",
      responseStatus: "completed",
      refusalPresent: false,
      incompleteReason: "none",
      schemaValid: true,
      inputTokens: 200,
      outputTokens: 100,
      reasoningTokens: 25,
      totalTokens: 300,
    });
    expect(parsed.diagnostic.outputSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(parsed.diagnostic)).not.toContain(validPayload.summary);
  });

  it.each([
    ["max output", "max_output_tokens", "OPENAI_INCOMPLETE_MAX_OUTPUT", "OPENAI_MAX_OUTPUT_TOKENS"],
    ["content filter", "content_filter", "OPENAI_INCOMPLETE_CONTENT_FILTER", "OPENAI_CONTENT_FILTER"],
  ] as const)("classifies incomplete %s responses", (_label, reason, code, rule) => {
    const error = failure(response({
      status: "incomplete",
      incomplete_details: { reason },
      output_text: "",
      output: [],
    }));
    expect(error.diagnostic).toMatchObject({
      reasonCode: code,
      responseStatus: "incomplete",
      incompleteReason: reason,
      validatorRuleId: rule,
      schemaValid: false,
    });
  });

  it("rejects any free-form replacement for the fixed uncertainty boundary", () => {
    const outputText = JSON.stringify({
      ...validPayload,
      safety_boundary: "A different free-form boundary.",
    });
    const error = failure(response({ output_text: outputText }));
    expect(error.diagnostic).toMatchObject({
      reasonCode: "STRUCTURED_OUTPUT_SCHEMA_INVALID",
      validatorRuleId: "ZOD_SCHEMA_FAILURE",
      schemaValid: false,
    });
  });
  it("classifies refusal content before attempting structured parsing", () => {
    const error = failure(response({
      output_text: "",
      output: [{
        id: "msg_refusal",
        type: "message",
        status: "completed",
        role: "assistant",
        content: [{ type: "refusal", refusal: "Synthetic refusal." }],
      }],
    }));
    expect(error.diagnostic).toMatchObject({
      reasonCode: "OPENAI_REFUSAL",
      refusalPresent: true,
      validatorRuleId: "OPENAI_REFUSAL_CONTENT",
    });
  });

  it.each([
    ["empty output array", { output: [], output_text: "" }, "OPENAI_OUTPUT_ARRAY_EMPTY"],
    ["missing output text", { output_text: "" }, "OPENAI_OUTPUT_TEXT_MISSING"],
  ] as const)("classifies %s", (_label, overrides, rule) => {
    expect(failure(response(overrides)).diagnostic).toMatchObject({
      reasonCode: "STRUCTURED_OUTPUT_MISSING",
      validatorRuleId: rule,
    });
  });

  it.each([
    ["invalid JSON", "{not-json", "JSON_PARSE_FAILURE"],
    ["schema-invalid JSON", JSON.stringify({ ...validPayload, citation_ids: ["invalid id with spaces"] }), "ZOD_SCHEMA_FAILURE"],
  ])("classifies %s without exposing the malformed value", (_label, outputText, rule) => {
    const error = failure(response({ output_text: outputText }));
    expect(error.diagnostic).toMatchObject({
      reasonCode: "STRUCTURED_OUTPUT_SCHEMA_INVALID",
      validatorRuleId: rule,
      schemaValid: false,
    });
    expect(JSON.stringify(error.diagnostic)).not.toContain(outputText);
  });

  it.each(["failed", "in_progress", "cancelled", "queued"] as const)(
    "classifies unexpected response status %s",
    (status) => {
      expect(failure(response({ status })).diagnostic).toMatchObject({
        reasonCode: "OPENAI_API_ERROR",
        responseStatus: status,
        validatorRuleId: `OPENAI_RESPONSE_${status.toUpperCase()}`,
      });
    },
  );

  it("maps provider timeout separately and never retains error messages or request IDs", () => {
    const error = new OpenAI.APIConnectionTimeoutError({ message: "sensitive synthetic message" });
    const failureValue = providerFailureFromApiError(error);
    expect(failureValue.diagnostic).toMatchObject({
      reasonCode: "LATENCY_TIMEOUT",
      responseStatus: "api_error",
      validatorRuleId: "OPENAI_TIMEOUT",
    });
    const serialized = JSON.stringify(failureValue.diagnostic);
    expect(serialized).not.toContain("sensitive synthetic message");
    expect(serialized).not.toContain("request");
  });
});

describe("sanitized diagnostic envelope", () => {
  const environment: NodeJS.ProcessEnv = {
    VERCEL_ENV: "preview",
    NEXT_PUBLIC_TEOYUBE_APP_ENV: "preview",
    NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET: "vercel-preview",
    TEOYUBE_ENABLE_PREVIEW_LIVE_AI_EVALUATION: "true",
    TEOYUBE_ENABLE_PREVIEW_LIVE_AI_DIAGNOSTICS: "true",
  };

  it("is enabled only in the exact Preview diagnostic runtime", () => {
    expect(isPreviewGroundedDiagnosticsRuntime(environment)).toBe(true);
    expect(isPreviewGroundedDiagnosticsRuntime({ ...environment, VERCEL_ENV: "production" })).toBe(false);
    expect(isPreviewGroundedDiagnosticsRuntime({ ...environment, TEOYUBE_ENABLE_PREVIEW_LIVE_AI_DIAGNOSTICS: "false" })).toBe(false);
  });

  it("contains only the allowlisted aggregate fields and rejects raw-content additions", () => {
    const envelope = createPreviewGroundedDiagnosticEnvelope({
      caseId: "public-james-wisdom",
      pipelineStage: "OUTPUT_PARSING",
      fallbackReason: "STRUCTURED_OUTPUT_SCHEMA_INVALID",
      providerCalled: true,
      moderationCalled: true,
      retrievalResultCount: 5,
      eligibleEvidenceCount: 1,
      responseStatus: "completed",
      schemaValid: false,
      validatorRuleId: "ZOD_SCHEMA_FAILURE",
      inputTokens: 200,
      outputTokens: 100,
      reasoningTokens: 25,
      latencyMs: 1000,
      costUsd: 0.001,
      outputSha256: "a".repeat(64),
    });
    const keys = Object.keys(envelope).sort();
    expect(keys).toEqual([
      "caseId", "citationCount", "costUsd", "eligibleEvidenceCount", "forbiddenClaimEvidence",
      "fallbackReason", "incompleteReason", "inputTokens", "latencyMs",
      "moderationCalled", "outputSha256", "outputTokens", "pipelineStage",
      "providerCalled", "reasoningTokens", "refusalPresent",
      "responseStatus", "retrievalResultCount", "schemaValid",
      "unknownCitationCount", "validatorRuleId",
    ].sort());
    const serialized = JSON.stringify(envelope);
    for (const forbidden of [
      "query", "prompt", "scriptureText", "responseText", "prayerText",
      "rawProviderResponse", "OPENAI_API_KEY", "bypass", "jane@example.com",
    ]) expect(serialized).not.toContain(forbidden);
    expect(() => previewGroundedDiagnosticEnvelopeSchema.parse({
      ...envelope,
      query: "synthetic secret query",
    })).toThrow();
  });

  it("accepts only bounded sanitized forbidden-claim evidence", () => {
    const envelope = createPreviewGroundedDiagnosticEnvelope({
      caseId: "public-james-wisdom",
      pipelineStage: "THEOLOGICAL_VALIDATION",
      fallbackReason: "THEOLOGICAL_RULE_VIOLATION",
      forbiddenClaimEvidence: [{
        fieldProvenance: "MODEL_SUMMARY",
        validationRuleId: "GUARANTEED_OUTCOME",
        matcherId: "SAFETY_REGISTRY_REGEX",
        matchCount: 1,
        characterStart: 8,
        characterEnd: 18,
        matchLength: 10,
        fieldLength: 24,
        normalizedMatchSha256: "a".repeat(64),
        semanticContext: "FUTURE_CERTAINTY",
        providerCallCountClassification: "EMBEDDING_VECTOR_GENERATION_AND_MODERATION",
        runtimeValidatorResult: "FAIL",
        evaluatorResult: "NOT_RUN",
      }],
    });
    expect(envelope.forbiddenClaimEvidence).toHaveLength(1);
    expect(JSON.stringify(envelope)).not.toContain("guaranteed");
    expect(() => previewGroundedDiagnosticEnvelopeSchema.parse({
      ...envelope,
      forbiddenClaimEvidence: [{
        ...envelope.forbiddenClaimEvidence[0],
        rawResponseText: "forbidden",
      }],
    })).toThrow();
  });
});
