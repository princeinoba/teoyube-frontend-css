import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createKeyRing } from "../../src/server/memory/encryption";
import { SqliteVectorRepository } from "../../src/server/retrieval/sqlite-vector-repository";
import type {
  RetrievalDocumentMetadata,
  VectorRecord
} from "../../src/domain/retrieval/retrieval-contracts";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    if (root.startsWith(tmpdir())) rmSync(root, { recursive: true, force: true });
  }
});

function location(): string {
  const root = mkdtempSync(path.join(tmpdir(), "teoyube-retrieval-"));
  roots.push(root);
  return path.join(root, "retrieval.sqlite");
}

function metadata(
  overrides: Partial<RetrievalDocumentMetadata> = {}
): RetrievalDocumentMetadata {
  return Object.freeze({
    documentId: "doc-1",
    partition: "product_help",
    trustLevel: "REVIEWED_PRODUCT_HELP",
    sourceId: "src/data/help.json",
    sourceVersion: "v1",
    sourceChecksum: "checksum",
    chunkerVersion: "chunker-v1",
    embeddingProvider: "test",
    embeddingModel: "test-model",
    embeddingDimension: 3,
    embeddingAdapterVersion: "adapter-v1",
    indexedAt: "2026-07-23T00:00:00.000Z",
    language: "en-US",
    scriptureCitations: Object.freeze([]),
    sensitivity: "public",
    ...overrides
  });
}

function record(overrides: Partial<VectorRecord> = {}): VectorRecord {
  const recordMetadata = overrides.metadata || metadata();
  return Object.freeze({
    id: "record-1",
    indexVersion: "index-v1",
    vector: Object.freeze([1, 0, 0]),
    normalizedContentHash: "content-hash",
    metadata: recordMetadata,
    title: "Product help",
    chunkRole: "reviewed_help",
    ordinal: 0,
    tokenCount: 4,
    matchedTextHash: "content-hash",
    content: "reviewed product help content",
    ...overrides
  });
}

describe("SqliteVectorRepository", () => {
  it("upserts, activates, and deterministically searches public vectors", async () => {
    const repository = new SqliteVectorRepository(location());
    await repository.upsert("product_help", [record()]);
    await repository.activateIndex("index-v1", ["product_help"], "2026-07-23T00:00:01.000Z");
    const results = await repository.search({
      queryVector: Object.freeze([1, 0, 0]),
      partitions: Object.freeze(["product_help"]),
      trustLevels: Object.freeze(["REVIEWED_PRODUCT_HELP"]),
      limit: 10,
      language: "en-US",
      activeIndexVersion: "index-v1",
      now: "2026-07-23T00:00:02.000Z"
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      recordId: "record-1",
      score: 1,
      content: "reviewed product help content"
    });
    repository.close();
  });

  it("encrypts user vectors and excludes cross-user or unauthorized results", async () => {
    const database = location();
    const ring = createKeyRing("v1", {
      v1: Buffer.alloc(32, 17).toString("base64")
    });
    const repository = new SqliteVectorRepository(database, ring);
    const userMetadata = metadata({
      documentId: "memory-1",
      partition: "journal_summaries",
      trustLevel: "USER_AUTHORED_APPROVED_SUMMARY",
      sourceId: "memory-1",
      userId: "user-alpha",
      consentRecordIds: Object.freeze(["consent-external", "consent-memory"]),
      purposeIds: Object.freeze([
        "external_ai_embedding_processing",
        "user_memory_semantic_index"
      ]),
      sensitivity: "structured_spiritual"
    });
    await repository.upsert("journal_summaries", [
      record({
        id: "user-record",
        metadata: userMetadata,
        content: "approved structured summary marker"
      })
    ]);
    await repository.activateIndex("index-v1", ["journal_summaries"], "2026-07-23T00:00:01.000Z");
    const base = {
      queryVector: Object.freeze([1, 0, 0]),
      partitions: Object.freeze(["journal_summaries"] as const),
      trustLevels: Object.freeze(["USER_AUTHORED_APPROVED_SUMMARY"] as const),
      limit: 10,
      language: "en-US",
      activeIndexVersion: "index-v1",
      consentRecordIds: Object.freeze(["consent-external", "consent-memory"]),
      purposeIds: Object.freeze([
        "external_ai_embedding_processing" as const,
        "user_memory_semantic_index" as const
      ]),
      now: "2026-07-23T00:00:02.000Z"
    };
    expect(await repository.search({ ...base, userId: "user-beta" })).toHaveLength(0);
    expect(await repository.search({ ...base, userId: "user-alpha", consentRecordIds: [] })).toHaveLength(0);
    const own = await repository.search({ ...base, userId: "user-alpha" });
    expect(own).toHaveLength(1);
    expect(own[0].content).toBe("approved structured summary marker");
    await repository.deleteByConsent({
      userId: "user-alpha",
      consentRecordId: "consent-memory",
      reason: "consent_revoked",
      now: "2026-07-23T00:00:03.000Z"
    });
    expect(await repository.search({ ...base, userId: "user-alpha" })).toHaveLength(0);
    repository.close();
    expect(readFileSync(database).includes(Buffer.from("approved structured summary marker"))).toBe(false);
  });
});
