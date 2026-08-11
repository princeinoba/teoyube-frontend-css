import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { InfoResult } from "@upstash/vector";
import type { RetrievalChunk, VectorSearchRequest } from "../../src/domain/retrieval/retrieval-contracts";
import { managedVectorContentNamespace, UpstashContentVectorRepository } from "../../src/server/retrieval/upstash-content-vector-repository";
import {
  MANAGED_VECTOR_CORPUS_HASH, MANAGED_VECTOR_DIMENSION, MANAGED_VECTOR_INDEX_VERSION
} from "../../src/server/retrieval/upstash-vector-repository";

const chunk = Object.freeze({
  chunkId: "promise:wisdom:0", documentId: "promise:wisdom", partition: "promise_clusters",
  trustLevel: "REVIEWED_TEOYUBE_CONTENT", sourceId: "src/data/promiseClusters.json",
  sourceVersion: "sha256:test", sourceChecksum: "a".repeat(64),
  chunkerVersion: "teoyube-deterministic-chunker-2026-07-23.1", title: "Wisdom",
  content: "Public reviewed promise content.", chunkRole: "reviewed_promise_cluster", ordinal: 0,
  tokenCount: 5, normalizedContentHash: "b".repeat(64), matchedTextHash: "c".repeat(64),
  language: "en-US", scriptureCitations: Object.freeze([]), sensitivity: "public",
  evaluationContentType: "PROMISE"
}) satisfies RetrievalChunk & Readonly<{ evaluationContentType: string }>;

const request = Object.freeze({
  queryVector: Object.freeze(Array.from({ length: MANAGED_VECTOR_DIMENSION }, () => 0)),
  partitions: Object.freeze(["promise_clusters"]),
  trustLevels: Object.freeze(["REVIEWED_TEOYUBE_CONTENT"]),
  documentIdPrefixes: Object.freeze(["promise:"]),
  limit: 5, language: "en-US", activeIndexVersion: MANAGED_VECTOR_INDEX_VERSION,
  now: "2026-08-09T00:00:00.000Z"
}) satisfies VectorSearchRequest;

describe("Upstash content vector repository", () => {
  it("routes selective Promise searches to the isolated Promise namespace", async () => {
    const namespaces: string[] = [];
    const repository = new UpstashContentVectorRepository({
      inventory: [chunk],
      client: {
        async query(input) {
          namespaces.push(input.namespace);
          return [{
            id: chunk.chunkId, score: 0.9,
            metadata: {
              canonicalId: chunk.documentId, contentType: "PROMISE", scriptureReferences: [],
              sourceId: chunk.sourceId, sourceVersion: chunk.sourceVersion, sourceChecksum: chunk.sourceChecksum,
              partition: chunk.partition, trustLevel: chunk.trustLevel, language: chunk.language,
              corpusHash: MANAGED_VECTOR_CORPUS_HASH, indexVersion: MANAGED_VECTOR_INDEX_VERSION
            }
          }];
        },
        async info() {
          return { dimension: MANAGED_VECTOR_DIMENSION, similarityFunction: "COSINE", indexSize: 1,
            vectorCount: 1, pendingVectorCount: 0, namespaces: {} } as unknown as InfoResult;
        }
      }
    });
    const results = await repository.search(request);
    expect(namespaces).toEqual([managedVectorContentNamespace("PROMISE")]);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ recordId: chunk.chunkId, score: 0.8 });
  });

  it("rejects remote metadata that crosses the requested content type", async () => {
    const repository = new UpstashContentVectorRepository({
      inventory: [chunk],
      client: {
        async query() { return [{ id: chunk.chunkId, score: 1, metadata: { contentType: "SCRIPTURE" } as never }]; },
        async info() { return {} as InfoResult; }
      }
    });
    await expect(repository.search(request)).resolves.toEqual([]);
  });
});
