import path from "node:path";

export const RETRIEVAL_CONFIGURATION_VERSION = "teoyube-retrieval-config-2026-07-23.1";
export const RETRIEVAL_CHUNKER_VERSION = "teoyube-deterministic-chunker-2026-07-23.1";
export const EMBEDDING_ADAPTER_VERSION = "teoyube-openai-embeddings-2026-07-23.1";
export const RETRIEVAL_FUSION_VERSION = "teoyube-hybrid-fusion-2026-07-23.1";

export const EMBEDDING_MODELS = Object.freeze({
  default: Object.freeze({
    id: "text-embedding-3-small",
    dimension: 1536,
    pricePerMillionInputTokensUsd: 0.02,
    maximumInputTokens: 8192
  }),
  candidate: Object.freeze({
    id: "text-embedding-3-large",
    dimension: 3072,
    pricePerMillionInputTokensUsd: 0.13,
    maximumInputTokens: 8192
  })
});

export const PROMPT_20_BUDGETS = Object.freeze({
  totalUsd: 1,
  publicIndexUsd: 0.25,
  candidateEvaluationUsd: 0.5,
  queryEvaluationUsd: 0.25,
  automaticFullPublicReindexes: 1
});

export const RETRIEVAL_LIMITS = Object.freeze({
  queryCharacters: 500,
  documentCharacters: 32_000,
  maximumBatchInputs: 256,
  maximumBatchEstimatedTokens: 100_000,
  maximumTopK: 25,
  maximumCandidateRows: 50_000,
  maximumContextTokens: 4_000,
  providerTimeoutMs: 20_000,
  activePublicIndexBytes: 600 * 1024 * 1024,
  workspaceGrowthBytes: 750 * 1024 * 1024
});

export type RetrievalRuntimeConfiguration = Readonly<{
  embeddingEnabled: boolean;
  vectorRetrievalEnabled: boolean;
  broadRagEnabled: false;
  keyPresent: boolean;
  organizationPresent: boolean;
  model: string;
  dimension: number;
  databasePath: string;
}>;

function enabled(environment: NodeJS.ProcessEnv, name: string): boolean {
  return environment[name]?.trim().toLowerCase() === "true";
}

export function readRetrievalRuntimeConfiguration(
  environment: NodeJS.ProcessEnv = process.env
): RetrievalRuntimeConfiguration {
  const keyPresent = Boolean(environment.OPENAI_API_KEY?.trim());
  const organizationPresent = Boolean(environment.OPENAI_ORG_ID?.trim());
  const embeddingEnabled =
    enabled(environment, "TEOYUBE_ENABLE_EMBEDDINGS") &&
    keyPresent;
  const vectorRetrievalEnabled =
    embeddingEnabled &&
    enabled(environment, "TEOYUBE_ENABLE_VECTOR_RETRIEVAL") &&
    enabled(environment, "TEOYUBE_VECTOR_RETRIEVAL_ENABLED");
  return Object.freeze({
    embeddingEnabled,
    vectorRetrievalEnabled,
    broadRagEnabled: false,
    keyPresent,
    organizationPresent,
    model: EMBEDDING_MODELS.default.id,
    dimension: EMBEDDING_MODELS.default.dimension,
    databasePath:
      environment.TEOYUBE_RETRIEVAL_DATABASE_PATH?.trim() ||
      path.join(process.cwd(), ".var", "retrieval", "retrieval.sqlite")
  });
}

export function openAiEmbeddingCredentials(
  environment: NodeJS.ProcessEnv = process.env
): Readonly<{ apiKey?: string; organization?: string }> {
  const apiKey = environment.OPENAI_API_KEY?.trim();
  const organization = environment.OPENAI_ORG_ID?.trim();
  return Object.freeze({
    ...(apiKey ? { apiKey } : {}),
    ...(organization ? { organization } : {})
  });
}
