import "server-only";

import { Index, type InfoResult, type QueryResult, type Vector } from "@upstash/vector";
import type {
  DeleteConsentVectorsRequest,
  DeleteUserVectorsRequest,
  DeleteVectorsBySourceRequest,
  RetrievalChunk,
  RetrievalDocumentMetadata,
  RetrievalPartition,
  VectorCompactionResult,
  VectorDeletionResult,
  VectorIndexInfo,
  VectorRecord,
  VectorRepository,
  VectorSearchRequest,
  VectorSearchResult,
  VectorUpsertResult
} from "../../domain/retrieval/retrieval-contracts";
import { validateRetrievalMetadata } from "../../domain/retrieval/retrieval-policy";
import { RETRIEVAL_LIMITS } from "./retrieval-config";

export const MANAGED_VECTOR_CORPUS_HASH =
  "7a3dc3e3adc2c9d0a94f527b6c5ff8ce4ee5243ca5281ab505d189ce82a4267f";
export const MANAGED_VECTOR_INDEX_VERSION =
  "evaluation:text-embedding-3-small:1536:teoyube-deterministic-chunker-2026-07-23.1:7a3dc3e3adc2c9d0a94f";
export const MANAGED_VECTOR_NAMESPACE = `teoyube-public-${MANAGED_VECTOR_CORPUS_HASH.slice(0, 32)}`;
export const MANAGED_VECTOR_DIMENSION = 1536;
export const MANAGED_VECTOR_MODEL = "text-embedding-3-small";

export type ManagedVectorMetadata = Readonly<{
  canonicalId: string;
  contentType: string;
  scriptureReferences: readonly string[];
  sourceId: string;
  sourceVersion: string;
  sourceChecksum: string;
  partition: RetrievalPartition;
  trustLevel: RetrievalDocumentMetadata["trustLevel"];
  language: string;
  corpusHash: string;
  indexVersion: string;
}>;

type ManagedVectorUpsert = Readonly<{
  id: string;
  vector: number[];
  metadata: ManagedVectorMetadata;
}>;
type ManagedQueryResult = Pick<QueryResult<ManagedVectorMetadata>, "id" | "score" | "metadata">;

export type ManagedVectorClient = Readonly<{
  upsert(records: readonly ManagedVectorUpsert[], namespace: string): Promise<string>;
  query(input: Readonly<{
    vector: readonly number[];
    topK: number;
    filter: string;
    namespace: string;
  }>): Promise<readonly ManagedQueryResult[]>;
  fetch(
    ids: readonly string[],
    options: Readonly<{ includeVectors: boolean; includeMetadata: boolean; namespace: string }>
  ): Promise<readonly (Vector<ManagedVectorMetadata> | null)[]>;
  info(): Promise<InfoResult>;
}>;

export type ManagedVectorInventoryChunk = RetrievalChunk &
  Readonly<{ evaluationContentType: string }>;

function requiredCredential(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`Managed vector credential ${name} is unavailable.`);
  return value;
}

function sdkClient(environment: NodeJS.ProcessEnv, timeoutMs: number): ManagedVectorClient {
  const index = new Index<ManagedVectorMetadata>({
    url: requiredCredential(environment, "UPSTASH_VECTOR_REST_URL"),
    token: requiredCredential(environment, "UPSTASH_VECTOR_REST_TOKEN"),
    retry: false,
    enableTelemetry: false,
    signal: () => AbortSignal.timeout(timeoutMs)
  });
  return Object.freeze({
    upsert(records, namespace) { return index.upsert([...records], { namespace }); },
    query(input) {
      return index.query({
        vector: [...input.vector], topK: input.topK, filter: input.filter,
        includeMetadata: true, includeVectors: false, includeData: false
      }, { namespace: input.namespace });
    },
    fetch(ids, options) { return index.fetch([...ids], options); },
    info() { return index.info(); }
  });
}

function quote(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function inFilter(field: string, values: readonly string[]): string {
  return `${field} IN (${values.map(quote).join(", ")})`;
}

function metadataMatches(
  value: unknown,
  recordId: string,
  request: VectorSearchRequest,
  inventory: ReadonlyMap<string, ManagedVectorInventoryChunk>
): value is ManagedVectorMetadata {
  if (!value || typeof value !== "object") return false;
  const metadata = value as Partial<ManagedVectorMetadata>;
  if (
    typeof metadata.canonicalId !== "string" || typeof metadata.partition !== "string" ||
    typeof metadata.trustLevel !== "string" || typeof metadata.language !== "string" ||
    metadata.corpusHash !== MANAGED_VECTOR_CORPUS_HASH || metadata.indexVersion !== request.activeIndexVersion ||
    !request.partitions.includes(metadata.partition as RetrievalPartition) ||
    !request.trustLevels.includes(metadata.trustLevel as RetrievalDocumentMetadata["trustLevel"]) ||
    metadata.language !== request.language
  ) return false;
  const chunk = inventory.get(recordId);
  return Boolean(chunk && chunk.documentId === metadata.canonicalId &&
    chunk.partition === metadata.partition && chunk.trustLevel === metadata.trustLevel);
}

export function managedMetadataFor(record: VectorRecord, chunk: ManagedVectorInventoryChunk): ManagedVectorMetadata {
  if (record.id !== chunk.chunkId || record.metadata.documentId !== chunk.documentId) {
    throw new Error("Managed vector inventory identity mismatch.");
  }
  return Object.freeze({
    canonicalId: chunk.documentId,
    contentType: chunk.evaluationContentType,
    scriptureReferences: Object.freeze(chunk.scriptureCitations.map((citation) => citation.canonicalLabel)),
    sourceId: chunk.sourceId,
    sourceVersion: chunk.sourceVersion,
    sourceChecksum: chunk.sourceChecksum,
    partition: chunk.partition,
    trustLevel: chunk.trustLevel,
    language: chunk.language,
    corpusHash: MANAGED_VECTOR_CORPUS_HASH,
    indexVersion: record.indexVersion
  });
}

function emptyDeletion(now: string): VectorDeletionResult {
  return Object.freeze({ deleted: 0, invalidated: 0, completedAt: now, retryableFailures: Object.freeze([]) });
}

export type UpstashVectorRepositoryOptions = Readonly<{
  inventory: readonly ManagedVectorInventoryChunk[];
  environment?: NodeJS.ProcessEnv;
  client?: ManagedVectorClient;
  namespace?: string;
  timeoutMs?: number;
  maximumConcurrentRequests?: number;
}>;

export class UpstashVectorRepository implements VectorRepository {
  readonly #inventory: ReadonlyMap<string, ManagedVectorInventoryChunk>;
  readonly #client: ManagedVectorClient;
  readonly #namespace: string;
  readonly #maximumConcurrentRequests: number;
  #inFlight = 0;

  constructor(options: UpstashVectorRepositoryOptions) {
    this.#inventory = new Map(options.inventory.map((chunk) => [chunk.chunkId, chunk]));
    this.#namespace = options.namespace || MANAGED_VECTOR_NAMESPACE;
    this.#maximumConcurrentRequests = options.maximumConcurrentRequests || 4;
    const timeoutMs = Math.min(Math.max(options.timeoutMs || 2_000, 250), RETRIEVAL_LIMITS.providerTimeoutMs);
    this.#client = options.client || sdkClient(options.environment || process.env, timeoutMs);
  }

  async #bounded<T>(operation: () => Promise<T>): Promise<T> {
    if (this.#inFlight >= this.#maximumConcurrentRequests) throw new Error("Managed vector concurrency ceiling reached.");
    this.#inFlight += 1;
    try { return await operation(); } finally { this.#inFlight -= 1; }
  }

  async upsert(partition: RetrievalPartition, records: readonly VectorRecord[]): Promise<VectorUpsertResult> {
    if (!records.length) return Object.freeze({ partition, inserted: 0, updated: 0, unchanged: 0, indexVersion: "" });
    if (records.some((record) =>
      record.metadata.userId || record.metadata.sensitivity !== "public" ||
      record.metadata.partition !== partition || record.indexVersion !== MANAGED_VECTOR_INDEX_VERSION ||
      record.vector.length !== MANAGED_VECTOR_DIMENSION || record.vector.some((value) => !Number.isFinite(value)) ||
      !validateRetrievalMetadata(record.metadata).valid
    )) throw new Error("Managed vector upsert accepts only validated public checkpoint records.");
    const payload = records.map((record) => {
      const chunk = this.#inventory.get(record.id);
      if (!chunk) throw new Error("Managed vector upsert record is absent from the authorized inventory.");
      return Object.freeze({ id: record.id, vector: [...record.vector], metadata: managedMetadataFor(record, chunk) });
    });
    const result = await this.#bounded(() => this.#client.upsert(payload, this.#namespace));
    if (result.toLowerCase() !== "success") throw new Error("Managed vector upsert was not acknowledged.");
    return Object.freeze({ partition, inserted: records.length, updated: 0, unchanged: 0, indexVersion: records[0].indexVersion });
  }

  async search(request: VectorSearchRequest): Promise<readonly VectorSearchResult[]> {
    if (!request.partitions.length || !request.trustLevels.length ||
      request.queryVector.length !== MANAGED_VECTOR_DIMENSION || request.queryVector.some((value) => !Number.isFinite(value)) ||
      request.activeIndexVersion !== MANAGED_VECTOR_INDEX_VERSION) return Object.freeze([]);
    const filter = [
      `corpusHash = ${quote(MANAGED_VECTOR_CORPUS_HASH)}`,
      `indexVersion = ${quote(request.activeIndexVersion)}`,
      `language = ${quote(request.language)}`,
      inFilter("partition", request.partitions),
      inFilter("trustLevel", request.trustLevels),
      ...(request.documentIdPrefixes?.length ? [
        `(${request.documentIdPrefixes.map((prefix) => `canonicalId GLOB ${quote(`${prefix}*`)}`).join(" OR ")})`
      ] : [])
    ].join(" AND ");
    const results = await this.#bounded(() => this.#client.query({
      vector: request.queryVector,
      topK: Math.min(Math.max(request.limit, 1), RETRIEVAL_LIMITS.maximumTopK),
      filter,
      namespace: this.#namespace
    }));
    return Object.freeze(results.flatMap((result) => {
      const recordId = String(result.id);
      const chunk = this.#inventory.get(recordId);
      if (!chunk || !metadataMatches(result.metadata, recordId, request, this.#inventory)) return [];
      return [Object.freeze({
        recordId,
        score: Math.max(-1, Math.min(1, result.score * 2 - 1)),
        metadata: Object.freeze({
          documentId: chunk.documentId, partition: chunk.partition, trustLevel: chunk.trustLevel,
          sourceId: chunk.sourceId, sourceVersion: chunk.sourceVersion, sourceChecksum: chunk.sourceChecksum,
          chunkerVersion: chunk.chunkerVersion, embeddingProvider: "openai", embeddingModel: MANAGED_VECTOR_MODEL,
          embeddingDimension: MANAGED_VECTOR_DIMENSION, embeddingAdapterVersion: "teoyube-openai-embeddings-2026-07-23.1",
          indexedAt: "2026-08-09T14:11:21.881Z", language: chunk.language,
          scriptureCitations: chunk.scriptureCitations, sensitivity: "public"
        }),
        title: chunk.title, chunkRole: chunk.chunkRole, ordinal: chunk.ordinal,
        tokenCount: chunk.tokenCount, content: chunk.content, indexVersion: request.activeIndexVersion
      })];
    }));
  }

  async activateIndex(indexVersion: string, partitions: readonly RetrievalPartition[]): Promise<void> {
    if (indexVersion !== MANAGED_VECTOR_INDEX_VERSION || !partitions.length) throw new Error("Managed vector activation identity is invalid.");
  }
  async rollbackIndex(): Promise<void> { throw new Error("Managed vector namespace rollback requires an explicit release operation."); }
  deleteBySource(request: DeleteVectorsBySourceRequest): Promise<VectorDeletionResult> { return Promise.resolve(emptyDeletion(request.now)); }
  deleteByUser(request: DeleteUserVectorsRequest): Promise<VectorDeletionResult> { return Promise.resolve(emptyDeletion(request.now)); }
  deleteByConsent(request: DeleteConsentVectorsRequest): Promise<VectorDeletionResult> { return Promise.resolve(emptyDeletion(request.now)); }
  async compact(): Promise<VectorCompactionResult> {
    return Object.freeze({ removedRecords: 0, bytesBefore: 0, bytesAfter: 0, completedAt: new Date().toISOString() });
  }
  async getIndexInfo(partition: RetrievalPartition): Promise<VectorIndexInfo> {
    const info = await this.#bounded(() => this.#client.info());
    const namespaceCount = info.namespaces[this.#namespace]?.vectorCount || 0;
    const chunks = [...this.#inventory.values()].filter((chunk) => chunk.partition === partition);
    return Object.freeze({
      partition, activeIndexVersion: namespaceCount ? MANAGED_VECTOR_INDEX_VERSION : null,
      recordCount: namespaceCount ? chunks.length : 0, dimension: info.dimension,
      embeddingModel: MANAGED_VECTOR_MODEL,
      sourceVersions: Object.freeze([...new Set(chunks.map((chunk) => chunk.sourceVersion))].sort()),
      bytes: info.indexSize, generatedAt: namespaceCount ? "2026-08-09T14:11:21.881Z" : null
    });
  }
  fetch(ids: readonly string[], includeVectors = false): Promise<readonly (Vector<ManagedVectorMetadata> | null)[]> {
    return this.#bounded(() => this.#client.fetch(ids, { includeVectors, includeMetadata: true, namespace: this.#namespace }));
  }
  info(): Promise<InfoResult> { return this.#bounded(() => this.#client.info()); }
}

export const MANAGED_VECTOR_SECURITY_INVARIANTS = Object.freeze({
  serverOnly: true, namespace: MANAGED_VECTOR_NAMESPACE, corpusHash: MANAGED_VECTOR_CORPUS_HASH,
  publicCorpusOnly: true, userDataAccepted: false, queryPersistence: false, resultPersistence: false,
  sdkRetries: 0, providerTimeoutMs: 2_000, maximumConcurrentRequests: 4, telemetry: false
});
