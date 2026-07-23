import { describe, expect, it } from "vitest";
import { readServerFeatureAvailability } from "../../src/config/environment";
import {
  RETRIEVAL_PARTITIONS,
  RETRIEVAL_PARTITION_POLICIES,
  RETRIEVAL_TRUST_LEVELS,
  validateRetrievalMetadata
} from "../../src/domain/retrieval";
import {
  CONSENT_SCOPE_REGISTRY,
  MEMORY_PURPOSE_REGISTRY,
  validateConsentScopes
} from "../../src/domain/memory/data-classification-registry";

describe("retrieval contracts and default-off controls", () => {
  it("defines all eleven isolated partitions with explicit trust policies", () => {
    expect(RETRIEVAL_PARTITIONS).toHaveLength(11);
    expect(new Set(RETRIEVAL_PARTITIONS).size).toBe(11);
    expect(Object.keys(RETRIEVAL_PARTITION_POLICIES).sort()).toEqual([...RETRIEVAL_PARTITIONS].sort());
    expect(RETRIEVAL_PARTITION_POLICIES.canonical_scripture.allowedTrustLevels).toEqual(["CANONICAL_SCRIPTURE"]);
    expect(RETRIEVAL_PARTITION_POLICIES.theology_safety.allowedTrustLevels).toEqual(["SYSTEM_POLICY_REFERENCE"]);
    expect(RETRIEVAL_PARTITION_POLICIES.journey_history).toMatchObject({
      userOwned: true,
      requiredPurposeId: "user_journey_semantic_index",
      rawSensitiveTextAllowed: false
    });
    expect(RETRIEVAL_TRUST_LEVELS).toHaveLength(9);
  });

  it("adds distinct default-off embedding and semantic-index purposes", () => {
    const purposes = [
      ["external_ai_embedding_processing", "embedding:process"],
      ["user_memory_semantic_index", "semantic_index:memory"],
      ["user_testimony_semantic_index", "semantic_index:testimony"],
      ["user_journey_semantic_index", "semantic_index:journey"],
      ["user_calling_evidence_semantic_index", "semantic_index:calling_evidence"]
    ] as const;
    for (const [purposeId, scope] of purposes) {
      expect(MEMORY_PURPOSE_REGISTRY[purposeId]).toMatchObject({
        id: purposeId,
        defaultGranted: false,
        explicitUserAction: true
      });
      expect(CONSENT_SCOPE_REGISTRY[purposeId]).toContain(scope);
      expect(validateConsentScopes(purposeId, [scope])).toBe(true);
    }
  });

  it("rejects user vectors without owner, dual consent, or safe sensitivity", () => {
    const base = {
      documentId: "journey-1",
      partition: "journey_history" as const,
      trustLevel: "USER_APPROVED_JOURNEY_STATE" as const,
      sourceId: "journey-1",
      sourceVersion: "1",
      sourceChecksum: "a".repeat(64),
      chunkerVersion: "journey-v1",
      embeddingProvider: "openai",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
      embeddingAdapterVersion: "embedding-v1",
      indexedAt: "2026-07-23T12:00:00.000Z",
      language: "en",
      scriptureCitations: [],
      sensitivity: "structured_spiritual" as const
    };
    expect(validateRetrievalMetadata(base).valid).toBe(false);
    expect(validateRetrievalMetadata({
      ...base,
      userId: "user-1",
      consentRecordIds: ["consent-external", "consent-journey"],
      purposeIds: ["external_ai_embedding_processing", "user_journey_semantic_index"]
    })).toEqual({ valid: true, errors: [] });
    expect(validateRetrievalMetadata({
      ...base,
      userId: "user-1",
      consentRecordIds: ["consent-external", "consent-journey"],
      purposeIds: ["external_ai_embedding_processing", "user_journey_semantic_index"],
      sensitivity: "sensitive_spiritual"
    }).valid).toBe(false);
  });

  it("requires both server kill switches and funded credentials", () => {
    const enabled = readServerFeatureAvailability({
      TEOYUBE_ENABLE_EMBEDDINGS: "true",
      TEOYUBE_ENABLE_VECTOR_RETRIEVAL: "true",
      TEOYUBE_VECTOR_RETRIEVAL_ENABLED: "true",
      OPENAI_API_KEY: "server-secret-placeholder",
      OPENAI_ORG_ID: "org-funded"
    });
    expect(enabled).toMatchObject({ embeddings: true, vectorRetrieval: true });
    expect(readServerFeatureAvailability({
      TEOYUBE_ENABLE_EMBEDDINGS: "true",
      TEOYUBE_ENABLE_VECTOR_RETRIEVAL: "true",
      TEOYUBE_VECTOR_RETRIEVAL_ENABLED: "false",
      OPENAI_API_KEY: "server-secret-placeholder",
      OPENAI_ORG_ID: "org-funded"
    }).vectorRetrieval).toBe(false);
    expect(readServerFeatureAvailability({}).vectorRetrieval).toBe(false);
  });
});
