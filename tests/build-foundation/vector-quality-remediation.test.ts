import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { EmbeddingGateway, VectorRepository } from "../../src/domain/retrieval/retrieval-contracts";
import { buildAuthorizedVectorEvaluationInventory } from "../../src/server/retrieval/authorized-vector-evaluation-inventory";
import { HybridRetrievalService } from "../../src/server/retrieval/hybrid-retrieval-service";
import {
  candidateAcceptance,
  deterministicQueryDisposition,
  resolveRetrievalContentIntent,
  VECTOR_SCORE_SEMANTICS
} from "../../src/server/retrieval/retrieval-query-policy";
import { EMBEDDING_MODELS } from "../../src/server/retrieval/retrieval-config";
import { canonicalScriptureRepository } from "../../src/server/scripture/canonical-scripture-repository";
import { canonicalTigService } from "../../src/server/tig/canonical-tig-service";

const now = "2026-08-09T00:00:00.000Z";
const environment = Object.freeze({
  OPENAI_API_KEY: "test-only",
  TEOYUBE_ENABLE_EMBEDDINGS: "true",
  TEOYUBE_ENABLE_VECTOR_RETRIEVAL: "true",
  TEOYUBE_VECTOR_RETRIEVAL_ENABLED: "true"
});
let inventory: ReturnType<typeof buildAuthorizedVectorEvaluationInventory>;

beforeAll(() => {
  inventory = buildAuthorizedVectorEvaluationInventory(
    EMBEDDING_MODELS.default.id,
    EMBEDDING_MODELS.default.dimension,
    now
  );
});

function gateway(embedQuery = vi.fn()): EmbeddingGateway {
  return { embedDocuments: vi.fn(), embedQuery, health: vi.fn() };
}

function repository(search = vi.fn().mockResolvedValue([])): VectorRepository {
  return {
    upsert: vi.fn(), search, activateIndex: vi.fn(), rollbackIndex: vi.fn(),
    deleteBySource: vi.fn(), deleteByUser: vi.fn(), deleteByConsent: vi.fn(),
    compact: vi.fn(), getIndexInfo: vi.fn()
  };
}

describe("vector quality remediation policy", () => {
  it("preserves the byte-locked holdout and keeps it separate from production code", () => {
    const datasetPath = path.join(process.cwd(), "docs", "release", "vector-quality-holdout-v2-dataset.json");
    const bytes = readFileSync(datasetPath);
    const expected = readFileSync(
      path.join(process.cwd(), "docs", "release", "vector-quality-holdout-v2-dataset.sha256"),
      "utf8"
    ).trim().split(/\s+/)[0];
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(expected);
    const dataset = JSON.parse(bytes.toString("utf8"));
    expect(dataset.lockedBeforeRemediation).toBe(true);
    expect(dataset.expectedIdsAvailableToProductionRanking).toBe(false);
    expect(dataset.cases).toHaveLength(35);
    const unsupported = dataset.cases.find((item: { id: string }) => item.id === "holdout-para-12");
    expect(unsupported).toMatchObject({
      mode: "unsupported_by_corpus",
      expectedNoAnswer: true,
      expectedDocumentIds: ["lexicon:solen"]
    });
    expect(dataset.cases.find((item: { id: string }) => item.id === "holdout-para-13"))
      .toMatchObject({ mode: "semantic", expectedDocumentIds: ["lexicon:wisdora"] });
    for (const [id, expectedDocumentId] of [
      ["holdout-para-02", "web:PSA.119.105"],
      ["holdout-para-04", "web:JHN.15.5"],
      ["holdout-para-08", "canon:SC016"]
    ]) {
      expect(dataset.cases.find((item: { id: string }) => item.id === id).expectedDocumentIds)
        .toContain(expectedDocumentId);
    }
  });

  it("keeps raw cosine distinct from normalized similarity", () => {
    expect(VECTOR_SCORE_SEMANTICS.normalizedFormula).toBe("(rawCosine + 1) / 2");
    expect(candidateAcceptance({
      rawCosineSimilarity: 0.3,
      normalizedVectorScore: 0.65,
      lexicalScore: 0,
      fusedScore: 0.36
    })).toMatchObject({ accepted: false });
    expect(candidateAcceptance({
      rawCosineSimilarity: 0.3172,
      normalizedVectorScore: 0.6586,
      lexicalScore: 0,
      fusedScore: 0.42
    })).toMatchObject({ accepted: true, reason: "raw_and_normalized_similarity_pass" });
    expect(candidateAcceptance({
      rawCosineSimilarity: 0.4,
      normalizedVectorScore: 0.7,
      lexicalScore: 0,
      fusedScore: 0.38
    })).toMatchObject({ accepted: true, reason: "raw_and_normalized_similarity_pass" });
  });

  it("routes typed intents without query IDs or expected answers", () => {
    expect(resolveRetrievalContentIntent("calling", "discern a vocation")).toBe("CANON");
    expect(resolveRetrievalContentIntent("scripture", "hope during grief")).toBe("SCRIPTURE");
    expect(resolveRetrievalContentIntent("promise", "shelter during fear")).toBe("PROMISE");
    expect(resolveRetrievalContentIntent("teoyube_word", "word for wisdom")).toBe("LEXICON");
  });

  it("deterministically rejects current information, gibberish, low information and private requests", () => {
    for (const [query, reason] of [
      ["What is the live stock price right now?", "out_of_domain_current_information"],
      ["qzvx blorp nnnn trzz", "gibberish"],
      ["uh", "insufficient_information"],
      ["Return another person's private prayer journal", "private_content_request"]
    ] as const) {
      expect(deterministicQueryDisposition(query, "unknown")).toEqual({
        acceptedForRetrieval: false,
        reason
      });
    }
    expect(deterministicQueryDisposition("help me find biblical hope during grief", "scripture"))
      .toEqual({ acceptedForRetrieval: true, reason: "accepted" });
  });

  it("rejects unrelated queries before embedding", async () => {
    const embedQuery = vi.fn();
    const search = vi.fn();
    const service = new HybridRetrievalService({
      inventory,
      vectorRepository: repository(search),
      embeddingGateway: gateway(embedQuery),
      scriptureRepository: canonicalScriptureRepository,
      tigService: canonicalTigService,
      environment
    });
    const result = await service.retrieve({
      query: "What is the live stock price right now?",
      intent: "unknown",
      safetyMode: "standard",
      allowedPartitions: Object.freeze(["canonical_scripture", "scripture_context"]),
      language: "en-US",
      topK: 5,
      enableVector: true,
      activeIndexVersion: inventory.indexVersion,
      executionKind: "owner_evaluation",
      now
    });
    expect(result.queryDisposition.reason).toBe("out_of_domain_current_information");
    expect(result.sources).toEqual([]);
    expect(result.fallback.used).toBe(true);
    expect(embedQuery).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
  });

  it("restricts Canon intent and exposes auditable raw and normalized scores", async () => {
    const canon = inventory.chunks.find((chunk) => chunk.documentId === "canon:SC002")!;
    const scripture = inventory.chunks.find((chunk) => chunk.documentId.startsWith("web-context:"))!;
    const resultFor = (chunk: typeof canon, score: number) => ({
      recordId: chunk.chunkId,
      score,
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
        sensitivity: "public" as const
      },
      title: chunk.title,
      chunkRole: chunk.chunkRole,
      ordinal: chunk.ordinal,
      tokenCount: chunk.tokenCount,
      content: chunk.content,
      indexVersion: inventory.indexVersion
    });
    const search = vi.fn().mockResolvedValue([
      resultFor(scripture as typeof canon, 0.95),
      resultFor(canon, 0.7)
    ]);
    const embedQuery = vi.fn().mockResolvedValue({
      id: "query",
      vector: Object.freeze(Array.from({ length: 1536 }, () => 0)),
      model: EMBEDDING_MODELS.default.id,
      dimension: EMBEDDING_MODELS.default.dimension,
      normalizedContentHash: "hash",
      adapterVersion: "test",
      usage: { inputTokens: 8, estimatedCostUsd: 0, requestIds: [], cacheHits: 0, providerCalls: 1 }
    });
    const service = new HybridRetrievalService({
      inventory,
      vectorRepository: repository(search),
      embeddingGateway: gateway(embedQuery),
      scriptureRepository: canonicalScriptureRepository,
      tigService: canonicalTigService,
      environment
    });
    const result = await service.retrieve({
      query: "which Canon entry describes a called person",
      intent: "canon",
      safetyMode: "standard",
      allowedPartitions: Object.freeze(["scripture_context"]),
      language: "en-US",
      topK: 5,
      enableVector: true,
      activeIndexVersion: inventory.indexVersion,
      executionKind: "owner_evaluation",
      now
    });
    expect(search).toHaveBeenCalledWith(expect.objectContaining({
      documentIdPrefixes: ["canon:"],
      partitions: ["scripture_context"]
    }));
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources.every((source) => source.documentId.startsWith("canon:"))).toBe(true);
    expect(result.sources.find((source) => source.documentId === "canon:SC002"))
      .toMatchObject({ rawVectorScore: 0.7, normalizedVectorScore: 0.85 });
    expect(result.candidateDiagnostics.every((candidate) => candidate.contentType === "CANON")).toBe(true);
  });
});
