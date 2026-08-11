import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { VectorRecord, VectorSearchRequest } from "../../src/domain/retrieval/retrieval-contracts";
import {
  MANAGED_VECTOR_CORPUS_HASH, MANAGED_VECTOR_DIMENSION, MANAGED_VECTOR_INDEX_VERSION,
  MANAGED_VECTOR_NAMESPACE, type ManagedVectorClient, type ManagedVectorInventoryChunk,
  UpstashVectorRepository
} from "../../src/server/retrieval/upstash-vector-repository";

const citation = Object.freeze({
  reference: Object.freeze({ bookId: "JHN", chapterStart: 3, verseStart: 16 }),
  canonicalLabel: "John 3:16", translationId: "engwebp", corpusVersion: "engwebp-2022",
  sourceId: "engwebp", validationStatus: "validated" as const
});
const chunk: ManagedVectorInventoryChunk = Object.freeze({
  chunkId: "scripture:JHN:3:16:0", documentId: "scripture:JHN:3:16", title: "John 3:16",
  content: "For God so loved the world.", partition: "canonical_scripture",
  trustLevel: "CANONICAL_SCRIPTURE", sourceId: "engwebp", sourceVersion: "engwebp-2022",
  sourceChecksum: "a".repeat(64), chunkerVersion: "teoyube-deterministic-chunker-2026-07-23.1",
  chunkRole: "verse", ordinal: 0, contentHash: "b".repeat(64), tokenCount: 7,
  language: "en-US", scriptureCitations: Object.freeze([citation]), sensitivity: "public",
  evaluationContentType: "SCRIPTURE"
});

function client(overrides: Partial<ManagedVectorClient> = {}): ManagedVectorClient {
  return Object.freeze({
    upsert: vi.fn(async () => "Success"), query: vi.fn(async () => []), fetch: vi.fn(async () => []),
    info: vi.fn(async () => ({
      vectorCount: 33_656, pendingVectorCount: 0, indexSize: 220_000_000,
      dimension: MANAGED_VECTOR_DIMENSION, similarityFunction: "COSINE" as const,
      namespaces: { [MANAGED_VECTOR_NAMESPACE]: { vectorCount: 33_656, pendingVectorCount: 0 } }
    })), ...overrides
  });
}

function searchRequest(): VectorSearchRequest {
  return Object.freeze({
    queryVector: Object.freeze(Array.from({ length: MANAGED_VECTOR_DIMENSION }, () => 0.01)),
    partitions: Object.freeze([chunk.partition]), trustLevels: Object.freeze([chunk.trustLevel]),
    limit: 5, language: chunk.language, activeIndexVersion: MANAGED_VECTOR_INDEX_VERSION,
    now: "2026-08-09T00:00:00.000Z"
  });
}

function record(sensitivity: "public" | "structured_spiritual" = "public"): VectorRecord {
  return Object.freeze({
    id: chunk.chunkId, indexVersion: MANAGED_VECTOR_INDEX_VERSION,
    vector: Object.freeze(Array.from({ length: MANAGED_VECTOR_DIMENSION }, () => 0.01)),
    normalizedContentHash: chunk.contentHash,
    metadata: Object.freeze({
      documentId: chunk.documentId, partition: chunk.partition, trustLevel: chunk.trustLevel,
      sourceId: chunk.sourceId, sourceVersion: chunk.sourceVersion, sourceChecksum: chunk.sourceChecksum,
      chunkerVersion: chunk.chunkerVersion, embeddingProvider: "openai", embeddingModel: "text-embedding-3-small",
      embeddingDimension: MANAGED_VECTOR_DIMENSION, embeddingAdapterVersion: "teoyube-openai-embeddings-2026-07-23.1",
      indexedAt: "2026-08-09T14:11:21.881Z", language: chunk.language,
      scriptureCitations: chunk.scriptureCitations, sensitivity
    }), title: chunk.title, chunkRole: chunk.chunkRole, ordinal: chunk.ordinal,
    tokenCount: chunk.tokenCount, matchedTextHash: chunk.contentHash, content: chunk.content
  });
}

describe("UpstashVectorRepository", () => {
  it("uses the corpus namespace, minimal filters, and existing cosine calibration", async () => {
    const query = vi.fn(async () => [{
      id: chunk.chunkId, score: 0.8,
      metadata: {
        canonicalId: chunk.documentId, contentType: chunk.evaluationContentType,
        scriptureReferences: [citation.canonicalLabel], sourceId: chunk.sourceId,
        sourceVersion: chunk.sourceVersion, sourceChecksum: chunk.sourceChecksum,
        partition: chunk.partition, trustLevel: chunk.trustLevel, language: chunk.language,
        corpusHash: MANAGED_VECTOR_CORPUS_HASH, indexVersion: MANAGED_VECTOR_INDEX_VERSION
      }
    }]);
    const repository = new UpstashVectorRepository({ inventory: [chunk], client: client({ query }) });
    const results = await repository.search(searchRequest());
    expect(results).toHaveLength(1);
    expect(results[0].score).toBeCloseTo(0.6, 10);
    expect(results[0].content).toBe(chunk.content);
    expect(query).toHaveBeenCalledWith(expect.objectContaining({
      namespace: MANAGED_VECTOR_NAMESPACE, topK: 5, filter: expect.stringContaining(MANAGED_VECTOR_CORPUS_HASH)
    }));
  });

  it("upserts only authorized public checkpoint records", async () => {
    const upsert = vi.fn(async () => "Success");
    const repository = new UpstashVectorRepository({ inventory: [chunk], client: client({ upsert }) });
    await expect(repository.upsert(chunk.partition, [record()])).resolves.toMatchObject({ inserted: 1 });
    expect(upsert).toHaveBeenCalledWith([
      expect.objectContaining({ id: chunk.chunkId, metadata: expect.objectContaining({
        canonicalId: chunk.documentId, corpusHash: MANAGED_VECTOR_CORPUS_HASH
      }) })
    ], MANAGED_VECTOR_NAMESPACE);
    await expect(repository.upsert(chunk.partition, [record("structured_spiritual")]))
      .rejects.toThrow("only validated public checkpoint records");
  });

  it("fails closed on identity mismatch and exposes provider failure only to the deterministic caller", async () => {
    const repository = new UpstashVectorRepository({
      inventory: [chunk], client: client({ query: vi.fn(async () => { throw new Error("provider unavailable"); }) })
    });
    await expect(repository.search({ ...searchRequest(), activeIndexVersion: "wrong" })).resolves.toEqual([]);
    await expect(repository.search(searchRequest())).rejects.toThrow("provider unavailable");
  });
});
