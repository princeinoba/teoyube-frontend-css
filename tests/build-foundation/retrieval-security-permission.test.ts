import { describe, expect, it, vi } from "vitest";
import type {
  ConsentGrant,
  ConsentLedger,
  UserMemoryRecord
} from "../../src/domain/memory/memory-contracts";
import type {
  EmbeddingGateway,
  VectorRepository
} from "../../src/domain/retrieval/retrieval-contracts";
import {
  ConsentVectorLifecycleService,
  UserVectorIndexService
} from "../../src/server/retrieval/user-vector-index-service";
import {
  RetrievalFeedbackService,
  retrievalCompletedEvent
} from "../../src/server/retrieval/retrieval-observability";

const now = "2026-07-23T00:00:00.000Z";

function grant(
  purposeId: ConsentGrant["purposeId"],
  id: string,
  scope: readonly string[]
): ConsentGrant {
  return Object.freeze({
    id,
    userId: "user-alpha",
    purposeId,
    scope,
    status: "granted",
    policyVersion: "v1",
    grantedAt: now,
    source: "user_ui",
    version: 1
  });
}

function consentLedger(effective: ReadonlyMap<string, ConsentGrant | null>): ConsentLedger {
  return {
    grant: vi.fn(),
    revoke: vi.fn(),
    expire: vi.fn(),
    getEffective: vi.fn((_userId, purposeId) => Promise.resolve(effective.get(purposeId) || null)),
    history: vi.fn()
  };
}

function vectorRepository(): VectorRepository & {
  upsert: ReturnType<typeof vi.fn>;
  activateIndex: ReturnType<typeof vi.fn>;
  deleteByConsent: ReturnType<typeof vi.fn>;
  deleteByUser: ReturnType<typeof vi.fn>;
} {
  return {
    upsert: vi.fn().mockResolvedValue({
      partition: "journal_summaries",
      inserted: 1,
      updated: 0,
      unchanged: 0,
      indexVersion: "index-v1"
    }),
    search: vi.fn(),
    activateIndex: vi.fn(),
    rollbackIndex: vi.fn(),
    deleteBySource: vi.fn(),
    deleteByUser: vi.fn().mockResolvedValue({
      deleted: 1,
      invalidated: 1,
      completedAt: now,
      retryableFailures: []
    }),
    deleteByConsent: vi.fn().mockResolvedValue({
      deleted: 1,
      invalidated: 1,
      completedAt: now,
      retryableFailures: []
    }),
    compact: vi.fn(),
    getIndexInfo: vi.fn()
  };
}

function embeddingGateway(): EmbeddingGateway {
  return {
    embedDocuments: vi.fn(),
    embedQuery: vi.fn().mockResolvedValue({
      id: "vector-1",
      vector: [1, 0, 0],
      model: "text-embedding-3-small",
      dimension: 3,
      normalizedContentHash: "hash",
      adapterVersion: "adapter",
      usage: {
        inputTokens: 5,
        estimatedCostUsd: 0,
        requestIds: [],
        cacheHits: 0,
        providerCalls: 1
      }
    }),
    health: vi.fn()
  };
}

function memory(): UserMemoryRecord {
  return Object.freeze({
    id: "memory-1",
    userId: "user-alpha",
    layer: "episodic",
    sensitivity: "structured_spiritual",
    purposeId: "journey_continuity",
    consentRecordId: "memory-consent",
    provenance: Object.freeze({
      sourceType: "user_confirmed_summary",
      sourceId: "journal-1",
      createdBy: "user"
    }),
    content: Object.freeze({ approved: true }),
    userApproved: true,
    status: "active",
    createdAt: now,
    updatedAt: now,
    version: 1
  });
}

describe("retrieval permission, lifecycle, and privacy contracts", () => {
  it("requires external and partition-specific consent before user indexing", async () => {
    const repository = vectorRepository();
    const embeddings = embeddingGateway();
    const service = new UserVectorIndexService(
      consentLedger(new Map()),
      repository,
      embeddings
    );
    await expect(
      service.indexApproved({
        record: memory(),
        partition: "journal_summaries",
        approvedSummary: Object.freeze({ theme: "reviewed hope" }),
        rawPrayerOrReflectionTextIncluded: false,
        externalEmbeddingConsentRecordId: "external-consent",
        partitionConsentRecordId: "partition-consent",
        activeIndexVersion: "index-v1",
        now
      })
    ).rejects.toThrow("Current external-processing");
    expect(embeddings.embedQuery).not.toHaveBeenCalled();
    expect(repository.upsert).not.toHaveBeenCalled();
  });

  it("indexes only an approved structured summary with both current grants", async () => {
    const repository = vectorRepository();
    const embeddings = embeddingGateway();
    const service = new UserVectorIndexService(
      consentLedger(
        new Map([
          [
            "external_ai_embedding_processing",
            grant("external_ai_embedding_processing", "external-consent", [
              "embedding:process"
            ])
          ],
          [
            "user_memory_semantic_index",
            grant("user_memory_semantic_index", "partition-consent", [
              "semantic_index:memory"
            ])
          ]
        ])
      ),
      repository,
      embeddings
    );
    await service.indexApproved({
      record: memory(),
      partition: "journal_summaries",
      approvedSummary: Object.freeze({
        theme: "reviewed hope",
        sourceIds: Object.freeze(["journal-1"])
      }),
      rawPrayerOrReflectionTextIncluded: false,
      externalEmbeddingConsentRecordId: "external-consent",
      partitionConsentRecordId: "partition-consent",
      activeIndexVersion: "index-v1",
      now
    });
    expect(repository.upsert).toHaveBeenCalledWith(
      "journal_summaries",
      expect.arrayContaining([
        expect.objectContaining({
          metadata: expect.objectContaining({
            userId: "user-alpha",
            consentRecordIds: ["external-consent", "partition-consent"],
            purposeIds: [
              "external_ai_embedding_processing",
              "user_memory_semantic_index"
            ],
            sensitivity: "structured_spiritual"
          })
        })
      ])
    );
    expect(repository.activateIndex).toHaveBeenCalledWith(
      "index-v1",
      ["journal_summaries"],
      now
    );
  });

  it("propagates revocation and deletion to the vector repository", async () => {
    const repository = vectorRepository();
    const lifecycle = new ConsentVectorLifecycleService(repository);
    await lifecycle.revokeConsent("user-alpha", "consent-1", now);
    await lifecycle.deleteUser("user-alpha", now);
    expect(repository.deleteByConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-alpha",
        consentRecordId: "consent-1",
        reason: "consent_revoked"
      })
    );
    expect(repository.deleteByUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-alpha", reason: "user_requested" })
    );
  });

  it("emits only bounded metadata and structured feedback", () => {
    const sink = { emit: vi.fn() };
    const feedback = new RetrievalFeedbackService(sink, () => "feedback-1");
    const signal = feedback.record({
      requestId: "request-1",
      sourceId: "source-1",
      kind: "wrong_context",
      createdAt: now
    });
    expect(signal).toEqual({
      id: "feedback-1",
      requestId: "request-1",
      sourceId: "source-1",
      kind: "wrong_context",
      createdAt: now,
      userInitiated: true,
      freeTextStored: false
    });
    const event = retrievalCompletedEvent(
      {
        requestId: "request-1",
        queryHash: "hash-only",
        intent: "promise",
        exactReferenceResolved: false,
        pathsUsed: ["lexical", "tig"],
        sources: [],
        fallback: { used: true, reason: "disabled" },
        limitations: [],
        contextTokenCount: 0,
        latencyMs: 40,
        indexVersion: "index-v1"
      },
      ["promise_clusters"],
      now
    );
    expect(event.rawContentStored).toBe(false);
    expect(JSON.stringify(event)).not.toContain("private prayer marker");
  });
});
