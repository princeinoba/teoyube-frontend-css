import { beforeAll, describe, expect, it, vi } from "vitest";
import type {
  EmbeddingGateway,
  VectorRepository
} from "../../src/domain/retrieval/retrieval-contracts";
import { canonicalScriptureRepository } from "../../src/server/scripture/canonical-scripture-repository";
import { canonicalTigService } from "../../src/server/tig/canonical-tig-service";
import { HybridRetrievalService } from "../../src/server/retrieval/hybrid-retrieval-service";
import { RetrievalContextAssembler } from "../../src/server/retrieval/retrieval-context-assembler";
import { buildPublicRetrievalInventory } from "../../src/server/retrieval/public-source-inventory";
import { EMBEDDING_MODELS } from "../../src/server/retrieval/retrieval-config";

const now = "2026-07-23T00:00:00.000Z";
const environment = Object.freeze({
  OPENAI_API_KEY: "test-only",
  OPENAI_ORG_ID: "org-test",
  TEOYUBE_ENABLE_EMBEDDINGS: "true",
  TEOYUBE_ENABLE_VECTOR_RETRIEVAL: "true",
  TEOYUBE_VECTOR_RETRIEVAL_ENABLED: "true"
});

let inventory: ReturnType<typeof buildPublicRetrievalInventory>;

beforeAll(() => {
  inventory = buildPublicRetrievalInventory(
    EMBEDDING_MODELS.default.id,
    EMBEDDING_MODELS.default.dimension,
    now
  );
});

function gateway(embedQuery = vi.fn()): EmbeddingGateway {
  return {
    embedDocuments: vi.fn(),
    embedQuery,
    health: vi.fn()
  };
}

function repository(search = vi.fn().mockResolvedValue([])): VectorRepository {
  return {
    upsert: vi.fn(),
    search,
    activateIndex: vi.fn(),
    rollbackIndex: vi.fn(),
    deleteBySource: vi.fn(),
    deleteByUser: vi.fn(),
    deleteByConsent: vi.fn(),
    compact: vi.fn(),
    getIndexInfo: vi.fn()
  };
}

function request(overrides: Record<string, unknown> = {}) {
  return {
    query: "Romans 8:28",
    intent: "scripture",
    safetyMode: "standard" as const,
    allowedPartitions: Object.freeze([
      "canonical_scripture" as const,
      "scripture_context" as const,
      "promise_clusters" as const
    ]),
    language: "en-US",
    topK: 5,
    enableVector: true,
    activeIndexVersion: inventory.indexVersion,
    executionKind: "user_query" as const,
    now,
    ...overrides
  };
}

describe("HybridRetrievalService", () => {
  it("resolves exact Scripture without requiring an embedding", async () => {
    const embedQuery = vi.fn();
    const vectorSearch = vi.fn();
    const service = new HybridRetrievalService({
      inventory,
      vectorRepository: repository(vectorSearch),
      embeddingGateway: gateway(embedQuery),
      scriptureRepository: canonicalScriptureRepository,
      tigService: canonicalTigService,
      environment,
      monotonicNow: () => 5
    });
    const result = await service.retrieve(request());
    expect(result.exactReferenceResolved).toBe(true);
    expect(result.pathsUsed).toContain("exact");
    expect(result.sources[0].canonicalReference?.canonicalLabel).toBe("Romans 8:28");
    expect(result.sources[0].trustLevel).toBe("CANONICAL_SCRIPTURE");
    expect(embedQuery).not.toHaveBeenCalled();
    expect(vectorSearch).not.toHaveBeenCalled();
    const context = await new RetrievalContextAssembler(canonicalScriptureRepository).assemble(result);
    expect(context.segments[0].authority).toBe("Scripture");
    expect(context.segments[0].scriptureCitation?.validationStatus).toBe("validated");
    expect(context.limitations.at(-1)).toContain("re-fetched");
  });

  it("uses deterministic exact, lexical, and TIG fallback without consent", async () => {
    const embedQuery = vi.fn();
    const service = new HybridRetrievalService({
      inventory,
      vectorRepository: repository(),
      embeddingGateway: gateway(embedQuery),
      scriptureRepository: canonicalScriptureRepository,
      tigService: canonicalTigService,
      environment,
      monotonicNow: () => 5
    });
    const result = await service.retrieve(
      request({
        query: "peace when anxious",
        intent: "life_problem",
        exactReferenceHint: undefined
      })
    );
    expect(result.exactReferenceResolved).toBe(false);
    expect(result.pathsUsed).toEqual(expect.arrayContaining(["lexical", "tig"]));
    expect(result.pathsUsed).not.toContain("vector");
    expect(result.fallback).toEqual({ used: true, reason: "no_consent" });
    expect(embedQuery).not.toHaveBeenCalled();
  });

  it("allows the locked owner evaluation path for public vectors only", async () => {
    const chunk = inventory.chunks.find((item) => item.partition === "promise_clusters")!;
    const embedQuery = vi.fn().mockResolvedValue({
      id: "query",
      vector: Object.freeze([1, 0, 0]),
      model: EMBEDDING_MODELS.default.id,
      dimension: EMBEDDING_MODELS.default.dimension,
      normalizedContentHash: "hash",
      adapterVersion: "test",
      usage: {
        inputTokens: 3,
        estimatedCostUsd: 0,
        requestIds: [],
        cacheHits: 0,
        providerCalls: 1
      }
    });
    const vectorSearch = vi.fn().mockResolvedValue([
      {
        recordId: chunk.chunkId,
        score: 0.9,
        metadata: {
          documentId: chunk.documentId,
          partition: chunk.partition,
          trustLevel: chunk.trustLevel,
          sourceId: chunk.sourceId,
          sourceVersion: chunk.sourceVersion,
          sourceChecksum: chunk.sourceChecksum,
          chunkerVersion: chunk.chunkerVersion,
          embeddingProvider: "test",
          embeddingModel: EMBEDDING_MODELS.default.id,
          embeddingDimension: EMBEDDING_MODELS.default.dimension,
          embeddingAdapterVersion: "test",
          indexedAt: now,
          language: "en-US",
          scriptureCitations: chunk.scriptureCitations,
          sensitivity: "public"
        },
        title: chunk.title,
        chunkRole: chunk.chunkRole,
        ordinal: chunk.ordinal,
        tokenCount: chunk.tokenCount,
        content: chunk.content,
        indexVersion: inventory.indexVersion
      }
    ]);
    const service = new HybridRetrievalService({
      inventory,
      vectorRepository: repository(vectorSearch),
      embeddingGateway: gateway(embedQuery),
      scriptureRepository: canonicalScriptureRepository,
      tigService: canonicalTigService,
      environment,
      monotonicNow: () => 5
    });
    const result = await service.retrieve(
      request({
        query: "a refuge for unsettled seasons",
        intent: "promise",
        exactReferenceHint: undefined,
        executionKind: "owner_evaluation"
      })
    );
    expect(embedQuery).toHaveBeenCalledTimes(1);
    expect(vectorSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        partitions: expect.not.arrayContaining([
          "journal_summaries",
          "testimonies",
          "journey_history",
          "calling_evidence"
        ])
      })
    );
    expect(result.pathsUsed).toContain("vector");
    expect(result.sources.some((source) => source.vectorScore && source.vectorScore > 0)).toBe(true);
    expect(result.sources.every((source) => source.selectionReasons.length > 0)).toBe(true);
    expect(new Set(result.sources.map((source) => source.documentId)).size).toBe(result.sources.length);
  });
});
