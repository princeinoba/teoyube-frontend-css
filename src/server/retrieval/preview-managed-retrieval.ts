import "server-only";

import type {
  EmbeddingBatchResult,
  EmbeddingGateway,
  EmbeddingGatewayHealth,
  EmbeddingResult,
  EmbedQueryRequest,
  HybridRetrievalResult,
} from "../../domain/retrieval/retrieval-contracts";
import { assessSafety } from "../../domain/safety/safety-engine";
import { canonicalScriptureRepository } from "../scripture/canonical-scripture-repository";
import { canonicalTigService } from "../tig/canonical-tig-service";
import { buildManagedVectorRuntimeInventory } from "./managed-vector-runtime-inventory";
import { HybridRetrievalService } from "./hybrid-retrieval-service";
import {
  EmbeddingGatewayError,
  OpenAiEmbeddingGateway,
} from "./openai-embedding-gateway";
import { deterministicQueryDisposition } from "./retrieval-query-policy";
import { RETRIEVAL_LIMITS } from "./retrieval-config";
import {
  MANAGED_VECTOR_CORPUS_HASH,
  MANAGED_VECTOR_DIMENSION,
  MANAGED_VECTOR_INDEX_VERSION,
  MANAGED_VECTOR_MODEL,
} from "./upstash-vector-repository";
import { UpstashContentVectorRepository } from "./upstash-content-vector-repository";

export const MANAGED_VECTOR_PREVIEW_LIMITS = Object.freeze({
  queryCharacters: RETRIEVAL_LIMITS.queryCharacters,
  topK: 5,
  maximumConcurrentQueries: 4,
  maximumProviderCallsPerRuntime: 1_000,
  maximumEmbeddingCostUsdPerRuntime: 0.01,
  providerAttempts: 1,
  embeddingProviderTimeoutMs: 6_000,
  vectorProviderTimeoutMs: 2_000,
});

const OFF_FLAGS = Object.freeze([
  "TEOYUBE_ENABLE_LIVE_AI",
  "TEOYUBE_LIVE_AI_ENABLED",
  "TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER",
  "TEOYUBE_ENABLE_BROAD_RAG",
  "TEOYUBE_ENABLE_DATABASE_PERSISTENCE",
  "TEOYUBE_ENABLE_DURABLE_MEMORY",
  "TEOYUBE_ENABLE_MANAGED_MEMORY",
  "TEOYUBE_ENABLE_SERVER_MEMORY",
  "TEOYUBE_ENABLE_RESEARCH_COLLECTION",
] as const);

function isTrue(environment: NodeJS.ProcessEnv, name: string): boolean {
  return environment[name]?.trim().toLowerCase() === "true";
}

export function isManagedVectorPreviewRuntime(
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    environment.VERCEL_ENV === "preview" &&
    environment.NEXT_PUBLIC_TEOYUBE_APP_ENV === "preview" &&
    environment.NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET === "vercel-preview" &&
    isTrue(environment, "TEOYUBE_ENABLE_EMBEDDINGS") &&
    isTrue(environment, "TEOYUBE_ENABLE_VECTOR_RETRIEVAL") &&
    isTrue(environment, "TEOYUBE_VECTOR_RETRIEVAL_ENABLED") &&
    environment.TEOYUBE_VECTOR_PROVIDER === "upstash" &&
    environment.TEOYUBE_EMBEDDING_PROVIDER === "openai" &&
    environment.TEOYUBE_EMBEDDING_MODEL === MANAGED_VECTOR_MODEL &&
    Boolean(environment.OPENAI_API_KEY?.trim()) &&
    Boolean(environment.UPSTASH_VECTOR_REST_URL?.trim()) &&
    Boolean(environment.UPSTASH_VECTOR_REST_TOKEN?.trim()) &&
    OFF_FLAGS.every((name) => !isTrue(environment, name))
  );
}

export type ManagedVectorPreviewQueryPolicy = Readonly<{
  accepted: boolean;
  reason:
    | "accepted"
    | "external_processing_consent_required"
    | "query_limit"
    | "sensitive_or_private_query"
    | "unsafe_or_unsupported_query";
}>;

export function evaluateManagedVectorPreviewQueryPolicy(
  input: Readonly<{
    query: string;
    intent: string;
    externalProcessingConsent: boolean;
  }>,
): ManagedVectorPreviewQueryPolicy {
  if (!input.externalProcessingConsent) {
    return Object.freeze({
      accepted: false,
      reason: "external_processing_consent_required",
    });
  }
  const query = input.query.trim();
  if (!query || query.length > MANAGED_VECTOR_PREVIEW_LIMITS.queryCharacters) {
    return Object.freeze({ accepted: false, reason: "query_limit" });
  }
  const safety = assessSafety(query);
  if (
    safety.sensitive ||
    safety.prohibitedRequest ||
    safety.inputLimitReached
  ) {
    return Object.freeze({
      accepted: false,
      reason: "sensitive_or_private_query",
    });
  }
  const disposition = deterministicQueryDisposition(query, input.intent);
  if (!disposition.acceptedForRetrieval) {
    return Object.freeze({
      accepted: false,
      reason:
        disposition.reason === "private_content_request"
          ? "sensitive_or_private_query"
          : "unsafe_or_unsupported_query",
    });
  }
  return Object.freeze({ accepted: true, reason: "accepted" });
}

class CostBoundEmbeddingGateway implements EmbeddingGateway {
  #spentCostUsd = 0;
  #providerCalls = 0;

  constructor(private readonly delegate: EmbeddingGateway) {}

  embedDocuments(): Promise<EmbeddingBatchResult> {
    throw new EmbeddingGatewayError(
      "invalid_input",
      "Runtime corpus embedding is disabled.",
    );
  }

  async embedQuery(request: EmbedQueryRequest): Promise<EmbeddingResult> {
    const remainingCostUsd =
      MANAGED_VECTOR_PREVIEW_LIMITS.maximumEmbeddingCostUsdPerRuntime -
      this.#spentCostUsd;
    if (
      remainingCostUsd <= 0 ||
      this.#providerCalls >=
        MANAGED_VECTOR_PREVIEW_LIMITS.maximumProviderCallsPerRuntime
    ) {
      throw new EmbeddingGatewayError(
        "budget_exceeded",
        "The Preview embedding ceiling was reached.",
      );
    }
    const result = await this.delegate.embedQuery(
      Object.freeze({
        ...request,
        budget: Object.freeze({
          ...request.budget,
          maximumCostUsd: Math.min(
            request.budget.maximumCostUsd,
            remainingCostUsd,
          ),
          spentCostUsd: 0,
        }),
      }),
    );
    this.#spentCostUsd += result.usage.estimatedCostUsd;
    this.#providerCalls += result.usage.providerCalls;
    if (
      this.#spentCostUsd >
        MANAGED_VECTOR_PREVIEW_LIMITS.maximumEmbeddingCostUsdPerRuntime ||
      this.#providerCalls >
        MANAGED_VECTOR_PREVIEW_LIMITS.maximumProviderCallsPerRuntime
    ) {
      throw new EmbeddingGatewayError(
        "budget_exceeded",
        "The Preview embedding ceiling was exceeded.",
      );
    }
    return result;
  }

  health(): Promise<EmbeddingGatewayHealth> {
    return this.delegate.health();
  }
}

type Runtime = Readonly<{
  retrieve(
    input: Readonly<{ query: string; intent: string }>,
  ): Promise<HybridRetrievalResult>;
}>;

let runtime: Runtime | undefined;

function createRuntime(environment: NodeJS.ProcessEnv): Runtime {
  if (!isManagedVectorPreviewRuntime(environment)) {
    throw new Error(
      "Managed vector retrieval is disabled outside the authenticated Preview canary.",
    );
  }
  const inventory = buildManagedVectorRuntimeInventory(
    MANAGED_VECTOR_MODEL,
    MANAGED_VECTOR_DIMENSION,
    "2026-08-09T00:00:00.000Z",
  );
  if (
    inventory.compositeSourceHash !== MANAGED_VECTOR_CORPUS_HASH ||
    inventory.totalDocuments !== 32_515 ||
    inventory.totalChunks !== 33_656 ||
    inventory.indexVersion !== MANAGED_VECTOR_INDEX_VERSION
  ) {
    throw new Error("Managed vector runtime inventory identity mismatch.");
  }
  const vectors = new UpstashContentVectorRepository({
    inventory: inventory.chunks,
    environment,
    timeoutMs: MANAGED_VECTOR_PREVIEW_LIMITS.vectorProviderTimeoutMs,
  });
  const embeddings = new CostBoundEmbeddingGateway(
    new OpenAiEmbeddingGateway({
      environment,
      maximumAttempts: MANAGED_VECTOR_PREVIEW_LIMITS.providerAttempts,
      providerTimeoutMs: MANAGED_VECTOR_PREVIEW_LIMITS.embeddingProviderTimeoutMs,
    }),
  );
  const service = new HybridRetrievalService({
    inventory,
    vectorRepository: vectors,
    embeddingGateway: embeddings,
    scriptureRepository: canonicalScriptureRepository,
    tigService: canonicalTigService,
    environment,
  });
  let inFlight = 0;
  return Object.freeze({
    async retrieve(input) {
      if (inFlight >= MANAGED_VECTOR_PREVIEW_LIMITS.maximumConcurrentQueries) {
        throw new Error(
          "Managed vector retrieval concurrency limit was reached.",
        );
      }
      inFlight += 1;
      try {
        return await service.retrieve({
          query: input.query,
          intent: input.intent,
          safetyMode: "standard",
          allowedPartitions: Object.freeze([
            "canonical_scripture",
            "scripture_context",
            "promise_clusters",
            "lexicon",
          ]),
          language: "en-US",
          topK: MANAGED_VECTOR_PREVIEW_LIMITS.topK,
          enableVector: true,
          activeIndexVersion: MANAGED_VECTOR_INDEX_VERSION,
          executionKind: "user_query",
          authorization: Object.freeze({
            userId: "authenticated-preview-canary",
            effectivePurposeIds: Object.freeze([
              "external_ai_embedding_processing",
            ] as const),
            consentRecordIds: Object.freeze([
              "request-explicit-preview-canary",
            ]),
          }),
          now: new Date().toISOString(),
        });
      } finally {
        inFlight -= 1;
      }
    },
  });
}

export function managedVectorPreviewRuntime(
  environment: NodeJS.ProcessEnv = process.env,
): Runtime {
  if (!runtime) runtime = createRuntime(environment);
  return runtime;
}

export const MANAGED_VECTOR_PREVIEW_SECURITY_INVARIANTS = Object.freeze({
  previewOnly: true,
  vercelAuthenticationPreserved: true,
  sameOriginRequired: true,
  externalProcessingConsentRequired: true,
  sensitiveQueryProviderCalls: 0,
  privateQueryProviderCalls: 0,
  generationEnabled: false,
  corpusEmbeddingEnabled: false,
  queryPersistence: false,
  resultPersistence: false,
  rawQueryLogging: false,
  vectorLogging: false,
  providerRetries: 0,
  deterministicFallback: true,
});
