import OpenAI from "openai";
import type {
  EmbedDocumentsRequest,
  EmbeddingBatchResult,
  EmbeddingGateway,
  EmbeddingGatewayHealth,
  EmbeddingInput,
  EmbeddingResult,
  EmbeddingUsage,
  EmbedQueryRequest
} from "../../domain/retrieval/retrieval-contracts";
import { estimateTokens, hashNormalizedContent } from "./content-hashing";
import {
  EMBEDDING_ADAPTER_VERSION,
  EMBEDDING_MODELS,
  openAiEmbeddingCredentials,
  readRetrievalRuntimeConfiguration,
  RETRIEVAL_LIMITS
} from "./retrieval-config";

type EmbeddingTransportResponse = Readonly<{
  data: readonly Readonly<{ embedding: readonly number[]; index: number }>[];
  usage: Readonly<{ prompt_tokens: number; total_tokens: number }>;
  _request_id?: string | null;
}>;

type EmbeddingTransport = Readonly<{
  embeddings: Readonly<{
    create(input: Readonly<{
      model: string;
      input: string[];
      encoding_format: "float";
      dimensions: number;
    }>): Promise<EmbeddingTransportResponse>;
  }>;
}>;

export class EmbeddingGatewayError extends Error {
  constructor(
    readonly code:
      | "disabled"
      | "invalid_input"
      | "budget_exceeded"
      | "provider_unavailable"
      | "provider_response_invalid",
    message: string
  ) {
    super(message);
    this.name = "EmbeddingGatewayError";
  }
}

export type OpenAiEmbeddingGatewayOptions = Readonly<{
  environment?: NodeJS.ProcessEnv;
  clientFactory?: (apiKey: string, organization?: string) => EmbeddingTransport;
  maximumAttempts?: 1 | 2;
}>;

function emptyUsage(providerCalls = 0): EmbeddingUsage {
  return Object.freeze({
    inputTokens: 0,
    estimatedCostUsd: 0,
    requestIds: Object.freeze([]),
    cacheHits: 0,
    providerCalls
  });
}

function validateInput(input: EmbeddingInput): void {
  if (!input.id || !input.content.trim()) {
    throw new EmbeddingGatewayError("invalid_input", "Embedding input identifiers and content are required.");
  }
  if (input.content.length > RETRIEVAL_LIMITS.documentCharacters) {
    throw new EmbeddingGatewayError("invalid_input", "Embedding input exceeds the configured character limit.");
  }
  if (input.sensitivity === "sensitive_spiritual" || input.sensitivity === "security_identity") {
    throw new EmbeddingGatewayError("invalid_input", "Raw sensitive or identity content cannot be embedded.");
  }
  if (hashNormalizedContent(input.content) !== input.normalizedContentHash) {
    throw new EmbeddingGatewayError("invalid_input", "Embedding content does not match its normalized hash.");
  }
}

function ensureBudget(
  request: EmbedDocumentsRequest | EmbedQueryRequest,
  inputs: readonly EmbeddingInput[]
): void {
  const estimatedTokens = inputs.reduce((sum, input) => sum + estimateTokens(input.content), 0);
  const conservativeTokens = Math.ceil(estimatedTokens * 1.2);
  const projectedCost =
    request.budget.spentCostUsd +
    (conservativeTokens / 1_000_000) * request.budget.pricePerMillionInputTokensUsd;
  if (
    conservativeTokens > request.budget.maximumInputTokens ||
    projectedCost > request.budget.maximumCostUsd
  ) {
    throw new EmbeddingGatewayError("budget_exceeded", "The embedding request would exceed its approved budget.");
  }
}

function validateModel(model: string, dimension: number): void {
  const allowed = Object.values(EMBEDDING_MODELS).find((entry) => entry.id === model);
  if (!allowed || allowed.dimension !== dimension) {
    throw new EmbeddingGatewayError("invalid_input", "The requested embedding model or dimension is not approved.");
  }
}

export class OpenAiEmbeddingGateway implements EmbeddingGateway {
  readonly #environment: NodeJS.ProcessEnv;
  readonly #clientFactory: (apiKey: string, organization?: string) => EmbeddingTransport;
  readonly #maximumAttempts: 1 | 2;
  #client?: EmbeddingTransport;

  constructor(options: OpenAiEmbeddingGatewayOptions = {}) {
    this.#environment = options.environment || process.env;
    this.#clientFactory =
      options.clientFactory ||
      ((apiKey, organization) =>
        new OpenAI({
          apiKey,
          ...(organization ? { organization } : {}),
          maxRetries: 0,
          timeout: RETRIEVAL_LIMITS.providerTimeoutMs
        }));
    this.#maximumAttempts = options.maximumAttempts || 2;
  }

  #transport(): EmbeddingTransport {
    const configuration = readRetrievalRuntimeConfiguration(this.#environment);
    const credentials = openAiEmbeddingCredentials(this.#environment);
    if (!configuration.embeddingEnabled || !credentials.apiKey) {
      throw new EmbeddingGatewayError("disabled", "The embedding provider is disabled.");
    }
    if (!this.#client) this.#client = this.#clientFactory(credentials.apiKey, credentials.organization);
    return this.#client;
  }

  async #embed(request: EmbedDocumentsRequest, inputs: readonly EmbeddingInput[]): Promise<EmbeddingBatchResult> {
    validateModel(request.model, request.dimension);
    if (
      inputs.length === 0 ||
      inputs.length > RETRIEVAL_LIMITS.maximumBatchInputs ||
      inputs.reduce((sum, item) => sum + estimateTokens(item.content), 0) >
        RETRIEVAL_LIMITS.maximumBatchEstimatedTokens
    ) {
      throw new EmbeddingGatewayError("invalid_input", "The embedding batch exceeds the configured limits.");
    }
    inputs.forEach(validateInput);
    ensureBudget(request, inputs);
    const transport = this.#transport();
    let response: EmbeddingTransportResponse | undefined;
    let providerCalls = 0;
    for (let attempt = 0; attempt < this.#maximumAttempts; attempt += 1) {
      providerCalls += 1;
      try {
        response = await transport.embeddings.create({
          model: request.model,
          input: inputs.map((item) => item.content),
          encoding_format: "float",
          dimensions: request.dimension
        });
        break;
      } catch (error) {
        const retryable =
          error instanceof OpenAI.RateLimitError ||
          error instanceof OpenAI.InternalServerError ||
          error instanceof OpenAI.APIConnectionError;
        if (!retryable || attempt === this.#maximumAttempts - 1) {
          throw new EmbeddingGatewayError("provider_unavailable", "The embedding provider request failed safely.");
        }
      }
    }
    if (!response || response.data.length !== inputs.length) {
      throw new EmbeddingGatewayError("provider_response_invalid", "The embedding provider returned an invalid result count.");
    }
    const inputTokens = response.usage.total_tokens || response.usage.prompt_tokens;
    const estimatedCostUsd =
      (inputTokens / 1_000_000) * request.budget.pricePerMillionInputTokensUsd;
    if (request.budget.spentCostUsd + estimatedCostUsd > request.budget.maximumCostUsd) {
      throw new EmbeddingGatewayError("budget_exceeded", "The provider usage exceeded the approved request budget.");
    }
    const requestIds = Object.freeze(response._request_id ? [response._request_id] : []);
    const usage = Object.freeze({
      inputTokens,
      estimatedCostUsd,
      requestIds,
      cacheHits: 0,
      providerCalls
    });
    const ordered = [...response.data].sort((left, right) => left.index - right.index);
    const results = ordered.map((item, index) => {
      if (
        item.embedding.length !== request.dimension ||
        item.embedding.some((value) => !Number.isFinite(value))
      ) {
        throw new EmbeddingGatewayError("provider_response_invalid", "The embedding vector dimension is invalid.");
      }
      return Object.freeze({
        id: inputs[index].id,
        vector: Object.freeze([...item.embedding]),
        model: request.model,
        dimension: request.dimension,
        normalizedContentHash: inputs[index].normalizedContentHash,
        adapterVersion: EMBEDDING_ADAPTER_VERSION,
        usage: index === 0 ? usage : emptyUsage()
      });
    });
    return Object.freeze({
      results: Object.freeze(results),
      model: request.model,
      dimension: request.dimension,
      adapterVersion: EMBEDDING_ADAPTER_VERSION,
      usage
    });
  }

  embedDocuments(request: EmbedDocumentsRequest): Promise<EmbeddingBatchResult> {
    return this.#embed(request, request.inputs);
  }

  async embedQuery(request: EmbedQueryRequest): Promise<EmbeddingResult> {
    const result = await this.#embed(
      Object.freeze({ ...request, inputs: Object.freeze([request.input]) }),
      Object.freeze([request.input])
    );
    return result.results[0];
  }

  async health(): Promise<EmbeddingGatewayHealth> {
    const configuration = readRetrievalRuntimeConfiguration(this.#environment);
    return Object.freeze({
      status: configuration.embeddingEnabled ? "ready" : "disabled",
      provider: "openai",
      configuredModel: configuration.model,
      configuredDimension: configuration.dimension,
      limitations: Object.freeze([
        "Embedding generation is server-only.",
        "Raw sensitive user text is never embedded.",
        "No provider request is made while the embedding kill switch is disabled."
      ])
    });
  }
}

export const OPENAI_EMBEDDING_SECURITY_INVARIANTS = Object.freeze({
  sdkVersion: "6.48.0",
  serverOnly: true,
  maxRetriesOwnedBySdk: 0,
  boundedApplicationAttempts: 2,
  rawSensitiveText: false,
  providerHostedVectorStore: false,
  providerFileSearch: false,
  providerWebSearch: false
});
