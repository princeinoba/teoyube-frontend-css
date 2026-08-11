import "server-only";

import { Index, type InfoResult, type QueryResult } from "@upstash/vector";
import type {
  DeleteConsentVectorsRequest,
  DeleteUserVectorsRequest,
  DeleteVectorsBySourceRequest,
  RetrievalDocumentMetadata,
  RetrievalPartition,
  VectorCompactionResult,
  VectorDeletionResult,
  VectorIndexInfo,
  VectorRepository,
  VectorSearchRequest,
  VectorSearchResult,
  VectorUpsertResult,
} from "../../domain/retrieval/retrieval-contracts";
import {
  MANAGED_VECTOR_DIMENSION,
  MANAGED_VECTOR_INDEX_VERSION,
  MANAGED_VECTOR_MODEL,
  MANAGED_VECTOR_NAMESPACE,
  type ManagedVectorInventoryChunk,
  type ManagedVectorMetadata,
} from "./upstash-vector-repository";
import { RETRIEVAL_LIMITS } from "./retrieval-config";

export const MANAGED_VECTOR_CONTENT_TYPES = Object.freeze([
  "SCRIPTURE",
  "CANON",
  "PROMISE",
  "LEXICON",
] as const);
export type ManagedVectorContentType =
  (typeof MANAGED_VECTOR_CONTENT_TYPES)[number];

export function managedVectorContentNamespace(
  contentType: ManagedVectorContentType,
): string {
  return `${MANAGED_VECTOR_NAMESPACE}-${contentType.toLowerCase()}`;
}

type SearchTransport = Readonly<{
  query(
    input: Readonly<{
      vector: readonly number[];
      topK: number;
      namespace: string;
    }>,
  ): Promise<
    readonly Pick<
      QueryResult<ManagedVectorMetadata>,
      "id" | "score" | "metadata"
    >[]
  >;
  info(): Promise<InfoResult>;
}>;

function transport(
  environment: NodeJS.ProcessEnv,
  timeoutMs: number,
): SearchTransport {
  const url = environment.UPSTASH_VECTOR_REST_URL?.trim();
  const token = environment.UPSTASH_VECTOR_REST_TOKEN?.trim();
  if (!url || !token)
    throw new Error("Managed content-vector credentials are unavailable.");
  const index = new Index<ManagedVectorMetadata>({
    url,
    token,
    retry: false,
    enableTelemetry: false,
    signal: () => AbortSignal.timeout(timeoutMs),
  });
  return Object.freeze({
    query(input) {
      return index.query(
        {
          vector: [...input.vector],
          topK: input.topK,
          includeMetadata: true,
          includeVectors: false,
          includeData: false,
        },
        { namespace: input.namespace },
      );
    },
    info() {
      return index.info();
    },
  });
}

function contentTypesFor(
  request: VectorSearchRequest,
): readonly ManagedVectorContentType[] {
  const prefixes = request.documentIdPrefixes || [];
  if (prefixes.length) {
    return Object.freeze([
      ...(prefixes.some(
        (prefix) => prefix === "web:" || prefix === "web-context:",
      )
        ? ["SCRIPTURE" as const]
        : []),
      ...(prefixes.includes("canon:") ? ["CANON" as const] : []),
      ...(prefixes.includes("promise:") ? ["PROMISE" as const] : []),
      ...(prefixes.includes("lexicon:") ? ["LEXICON" as const] : []),
    ]);
  }
  const values = new Set<ManagedVectorContentType>();
  for (const partition of request.partitions) {
    if (partition === "canonical_scripture") values.add("SCRIPTURE");
    if (partition === "scripture_context") {
      values.add("SCRIPTURE");
      values.add("CANON");
    }
    if (partition === "promise_clusters") values.add("PROMISE");
    if (partition === "lexicon") values.add("LEXICON");
  }
  return Object.freeze([...values]);
}

function validMetadata(
  value: unknown,
  recordId: string,
  contentType: ManagedVectorContentType,
  request: VectorSearchRequest,
  inventory: ReadonlyMap<string, ManagedVectorInventoryChunk>,
): value is ManagedVectorMetadata {
  if (!value || typeof value !== "object") return false;
  const metadata = value as Partial<ManagedVectorMetadata>;
  const chunk = inventory.get(recordId);
  return Boolean(
    chunk &&
    metadata.contentType === contentType &&
    metadata.canonicalId === chunk.documentId &&
    metadata.partition === chunk.partition &&
    metadata.trustLevel === chunk.trustLevel &&
    metadata.language === request.language &&
    metadata.indexVersion === request.activeIndexVersion &&
    request.partitions.includes(chunk.partition) &&
    request.trustLevels.includes(chunk.trustLevel) &&
    (!request.documentIdPrefixes?.length ||
      request.documentIdPrefixes.some((prefix) =>
        chunk.documentId.startsWith(prefix),
      )),
  );
}

function emptyDeletion(now: string): VectorDeletionResult {
  return Object.freeze({
    deleted: 0,
    invalidated: 0,
    completedAt: now,
    retryableFailures: Object.freeze([]),
  });
}

export type UpstashContentVectorRepositoryOptions = Readonly<{
  inventory: readonly ManagedVectorInventoryChunk[];
  environment?: NodeJS.ProcessEnv;
  client?: SearchTransport;
  timeoutMs?: number;
}>;

export class UpstashContentVectorRepository implements VectorRepository {
  readonly #inventory: ReadonlyMap<string, ManagedVectorInventoryChunk>;
  readonly #client: SearchTransport;

  constructor(options: UpstashContentVectorRepositoryOptions) {
    this.#inventory = new Map(
      options.inventory.map((chunk) => [chunk.chunkId, chunk]),
    );
    const timeoutMs = Math.min(
      Math.max(options.timeoutMs || 2_000, 250),
      RETRIEVAL_LIMITS.providerTimeoutMs,
    );
    this.#client =
      options.client ||
      transport(options.environment || process.env, timeoutMs);
  }

  async search(
    request: VectorSearchRequest,
  ): Promise<readonly VectorSearchResult[]> {
    if (
      !request.partitions.length ||
      !request.trustLevels.length ||
      request.queryVector.length !== MANAGED_VECTOR_DIMENSION ||
      request.queryVector.some((value) => !Number.isFinite(value)) ||
      request.activeIndexVersion !== MANAGED_VECTOR_INDEX_VERSION
    )
      return Object.freeze([]);
    const contentTypes = contentTypesFor(request);
    if (!contentTypes.length) return Object.freeze([]);
    const topK = Math.min(Math.max(request.limit, 25), 1_000);
    const pages = await Promise.all(
      contentTypes.map(async (contentType) => ({
        contentType,
        results: await this.#client.query({
          vector: request.queryVector,
          topK,
          namespace: managedVectorContentNamespace(contentType),
        }),
      })),
    );
    const candidates = pages.flatMap(({ contentType, results }) =>
      results.flatMap((result) => {
        const recordId = String(result.id);
        const chunk = this.#inventory.get(recordId);
        if (
          !chunk ||
          !validMetadata(
            result.metadata,
            recordId,
            contentType,
            request,
            this.#inventory,
          )
        )
          return [];
        return [
          Object.freeze({
            recordId,
            score: Math.max(-1, Math.min(1, result.score * 2 - 1)),
            metadata: Object.freeze({
              documentId: chunk.documentId,
              partition: chunk.partition,
              trustLevel: chunk.trustLevel,
              sourceId: chunk.sourceId,
              sourceVersion: chunk.sourceVersion,
              sourceChecksum: chunk.sourceChecksum,
              chunkerVersion: chunk.chunkerVersion,
              embeddingProvider: "openai",
              embeddingModel: MANAGED_VECTOR_MODEL,
              embeddingDimension: MANAGED_VECTOR_DIMENSION,
              embeddingAdapterVersion: "teoyube-openai-embeddings-2026-07-23.1",
              indexedAt: "2026-08-09T14:11:21.881Z",
              language: chunk.language,
              scriptureCitations: chunk.scriptureCitations,
              sensitivity: "public",
            } satisfies RetrievalDocumentMetadata),
            title: chunk.title,
            chunkRole: chunk.chunkRole,
            ordinal: chunk.ordinal,
            tokenCount: chunk.tokenCount,
            content: chunk.content,
            indexVersion: request.activeIndexVersion,
          }),
        ];
      }),
    );
    return Object.freeze(
      candidates
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.recordId.localeCompare(right.recordId),
        )
        .slice(
          0,
          Math.min(Math.max(request.limit, 1), RETRIEVAL_LIMITS.maximumTopK),
        ),
    );
  }

  async upsert(): Promise<VectorUpsertResult> {
    throw new Error(
      "Managed content namespaces are populated only by the authorized checkpoint runner.",
    );
  }

  async activateIndex(
    indexVersion: string,
    partitions: readonly RetrievalPartition[],
  ): Promise<void> {
    if (indexVersion !== MANAGED_VECTOR_INDEX_VERSION || !partitions.length) {
      throw new Error("Managed content-vector activation identity is invalid.");
    }
  }

  async rollbackIndex(): Promise<void> {
    throw new Error(
      "Managed content-vector rollback requires an explicit release operation.",
    );
  }

  deleteBySource(
    request: DeleteVectorsBySourceRequest,
  ): Promise<VectorDeletionResult> {
    return Promise.resolve(emptyDeletion(request.now));
  }

  deleteByUser(
    request: DeleteUserVectorsRequest,
  ): Promise<VectorDeletionResult> {
    return Promise.resolve(emptyDeletion(request.now));
  }

  deleteByConsent(
    request: DeleteConsentVectorsRequest,
  ): Promise<VectorDeletionResult> {
    return Promise.resolve(emptyDeletion(request.now));
  }

  async compact(): Promise<VectorCompactionResult> {
    return Object.freeze({
      removedRecords: 0,
      bytesBefore: 0,
      bytesAfter: 0,
      completedAt: new Date().toISOString(),
    });
  }

  async getIndexInfo(partition: RetrievalPartition): Promise<VectorIndexInfo> {
    const info = await this.#client.info();
    const contentTypes = contentTypesFor({
      queryVector: [0],
      partitions: [partition],
      trustLevels: ["CANONICAL_SCRIPTURE"],
      limit: 1,
      language: "en-US",
      activeIndexVersion: MANAGED_VECTOR_INDEX_VERSION,
      now: "",
    });
    const remoteCount = contentTypes.reduce(
      (sum, type) =>
        sum +
        (info.namespaces[managedVectorContentNamespace(type)]?.vectorCount ||
          0),
      0,
    );
    const chunks = [...this.#inventory.values()].filter(
      (chunk) => chunk.partition === partition,
    );
    return Object.freeze({
      partition,
      activeIndexVersion: remoteCount ? MANAGED_VECTOR_INDEX_VERSION : null,
      recordCount: remoteCount ? chunks.length : 0,
      dimension: info.dimension,
      embeddingModel: MANAGED_VECTOR_MODEL,
      sourceVersions: Object.freeze(
        [...new Set(chunks.map((chunk) => chunk.sourceVersion))].sort(),
      ),
      bytes: info.indexSize,
      generatedAt: remoteCount ? "2026-08-09T14:11:21.881Z" : null,
    });
  }
}

export const MANAGED_CONTENT_VECTOR_SECURITY_INVARIANTS = Object.freeze({
  serverOnly: true,
  publicCorpusOnly: true,
  namespaceIsolation: "corpus-hash-and-content-type",
  queryPersistence: false,
  resultPersistence: false,
  sdkRetries: 0,
  providerTimeoutMs: 2_000,
  maximumParallelNamespaces: MANAGED_VECTOR_CONTENT_TYPES.length,
});
