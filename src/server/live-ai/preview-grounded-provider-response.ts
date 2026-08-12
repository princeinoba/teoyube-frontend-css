import "server-only";

import { createHash } from "node:crypto";
import OpenAI from "openai";
import type { Response as OpenAiResponse } from "openai/resources/responses/responses";
import {
  parsePreviewGroundedResponse,
  type PreviewGroundedResponse,
} from "../../domain/live-ai/preview-grounded-response";
import type {
  PreviewGroundedIncompleteReason,
  PreviewGroundedReasonCode,
  PreviewGroundedResponseStatus,
} from "./preview-grounded-diagnostics";

export type PreviewGroundedProviderDiagnostic = Readonly<{
  reasonCode: PreviewGroundedReasonCode;
  providerCalled: boolean;
  responseStatus: PreviewGroundedResponseStatus;
  refusalPresent: boolean;
  incompleteReason: PreviewGroundedIncompleteReason;
  schemaValid: boolean;
  validatorRuleId: string;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  outputSha256: string;
}>;

export type ParsedPreviewGroundedProviderResponse = Readonly<{
  response: PreviewGroundedResponse;
  modelIdentifier: string;
  diagnostic: PreviewGroundedProviderDiagnostic;
}>;

function nonnegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0;
}

function outputHash(value: string): string {
  return value
    ? createHash("sha256").update(value).digest("hex")
    : "none";
}

function responseStatus(value: OpenAiResponse["status"]): PreviewGroundedResponseStatus {
  return value || "none";
}

function incompleteReason(
  value: OpenAiResponse["incomplete_details"],
): PreviewGroundedIncompleteReason {
  if (value?.reason === "max_output_tokens") return "max_output_tokens";
  if (value?.reason === "content_filter") return "content_filter";
  return value ? "unknown" : "none";
}

function refusalPresent(response: OpenAiResponse): boolean {
  return response.output.some(
    (item) =>
      item.type === "message" &&
      item.content.some((content) => content.type === "refusal"),
  );
}

function usageDiagnostic(response: OpenAiResponse) {
  return Object.freeze({
    inputTokens: nonnegativeInteger(response.usage?.input_tokens),
    outputTokens: nonnegativeInteger(response.usage?.output_tokens),
    reasoningTokens: nonnegativeInteger(
      response.usage?.output_tokens_details?.reasoning_tokens,
    ),
    totalTokens: nonnegativeInteger(response.usage?.total_tokens),
  });
}

function diagnostic(
  response: OpenAiResponse,
  overrides: Partial<PreviewGroundedProviderDiagnostic>,
): PreviewGroundedProviderDiagnostic {
  return Object.freeze({
    reasonCode: "COMPLETED",
    providerCalled: true,
    responseStatus: responseStatus(response.status),
    refusalPresent: refusalPresent(response),
    incompleteReason: incompleteReason(response.incomplete_details),
    schemaValid: false,
    validatorRuleId: "NONE",
    ...usageDiagnostic(response),
    outputSha256: outputHash(response.output_text || ""),
    ...overrides,
  });
}

export class PreviewGroundedProviderFailure extends Error {
  readonly diagnostic: PreviewGroundedProviderDiagnostic;

  constructor(diagnosticValue: PreviewGroundedProviderDiagnostic) {
    super(diagnosticValue.reasonCode);
    this.name = "PreviewGroundedProviderFailure";
    this.diagnostic = diagnosticValue;
  }
}

function fail(
  response: OpenAiResponse,
  reasonCode: PreviewGroundedReasonCode,
  validatorRuleId: string,
  overrides: Partial<PreviewGroundedProviderDiagnostic> = {},
): never {
  throw new PreviewGroundedProviderFailure(
    diagnostic(response, { reasonCode, validatorRuleId, ...overrides }),
  );
}

export function parseOpenAiPreviewGroundedResponse(
  response: OpenAiResponse,
): ParsedPreviewGroundedProviderResponse {
  if (response.status === "incomplete") {
    const reason = incompleteReason(response.incomplete_details);
    fail(
      response,
      reason === "max_output_tokens"
        ? "OPENAI_INCOMPLETE_MAX_OUTPUT"
        : reason === "content_filter"
          ? "OPENAI_INCOMPLETE_CONTENT_FILTER"
          : "OPENAI_API_ERROR",
      reason === "max_output_tokens"
        ? "OPENAI_MAX_OUTPUT_TOKENS"
        : reason === "content_filter"
          ? "OPENAI_CONTENT_FILTER"
          : "OPENAI_INCOMPLETE_UNKNOWN",
    );
  }
  if (refusalPresent(response)) {
    fail(response, "OPENAI_REFUSAL", "OPENAI_REFUSAL_CONTENT");
  }
  if (response.status !== "completed") {
    fail(
      response,
      "OPENAI_API_ERROR",
      `OPENAI_RESPONSE_${String(response.status || "UNKNOWN").toUpperCase()}`,
    );
  }
  if (!response.output_text?.trim()) {
    fail(
      response,
      "STRUCTURED_OUTPUT_MISSING",
      response.output.length === 0
        ? "OPENAI_OUTPUT_ARRAY_EMPTY"
        : "OPENAI_OUTPUT_TEXT_MISSING",
    );
  }
  let raw: unknown;
  try {
    raw = JSON.parse(response.output_text);
  } catch {
    fail(
      response,
      "STRUCTURED_OUTPUT_SCHEMA_INVALID",
      "JSON_PARSE_FAILURE",
    );
  }
  let parsed: PreviewGroundedResponse;
  try {
    parsed = parsePreviewGroundedResponse(raw);
  } catch {
    fail(
      response,
      "STRUCTURED_OUTPUT_SCHEMA_INVALID",
      "ZOD_SCHEMA_FAILURE",
    );
  }
  return Object.freeze({
    response: parsed,
    modelIdentifier: String(response.model),
    diagnostic: diagnostic(response, {
      reasonCode: "COMPLETED",
      schemaValid: true,
    }),
  });
}

function apiRuleId(error: unknown): string {
  if (error instanceof OpenAI.APIConnectionTimeoutError) return "OPENAI_TIMEOUT";
  if (error instanceof OpenAI.RateLimitError) return "OPENAI_RATE_LIMIT";
  if (error instanceof OpenAI.InternalServerError) return "OPENAI_SERVER_ERROR";
  if (error instanceof OpenAI.BadRequestError) {
    if (error.code === "invalid_json_schema") return "OPENAI_INVALID_JSON_SCHEMA";
    if (/text(?:\.|_)format|json_schema|schema/i.test(error.param || "")) {
      return "OPENAI_BAD_REQUEST_TEXT_FORMAT";
    }
    return "OPENAI_BAD_REQUEST";
  }
  if (error instanceof OpenAI.UnprocessableEntityError) {
    return "OPENAI_UNPROCESSABLE_ENTITY";
  }
  if (error instanceof OpenAI.APIConnectionError) return "OPENAI_CONNECTION_ERROR";
  if (error instanceof OpenAI.APIError) return "OPENAI_API_ERROR";
  return "UNKNOWN_PROVIDER_ERROR";
}

export function providerFailureFromApiError(
  error: unknown,
): PreviewGroundedProviderFailure {
  const timeout = error instanceof OpenAI.APIConnectionTimeoutError;
  const recognizedApiError = error instanceof OpenAI.APIError;
  return new PreviewGroundedProviderFailure(
    Object.freeze({
      reasonCode: timeout
        ? "LATENCY_TIMEOUT"
        : recognizedApiError
          ? "OPENAI_API_ERROR"
          : "UNKNOWN_FALLBACK",
      providerCalled: true,
      responseStatus: "api_error",
      refusalPresent: false,
      incompleteReason: "none",
      schemaValid: false,
      validatorRuleId: apiRuleId(error),
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      totalTokens: 0,
      outputSha256: "none",
    }),
  );
}
