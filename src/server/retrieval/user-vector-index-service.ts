import type {
  ConsentLedger,
  PurposeId,
  UserMemoryRecord
} from "../../domain/memory/memory-contracts";
import type {
  EmbeddingGateway,
  RetrievalPartition,
  VectorDeletionResult,
  VectorRepository
} from "../../domain/retrieval/retrieval-contracts";
import { RETRIEVAL_PARTITION_POLICIES } from "../../domain/retrieval/retrieval-policy";
import { stableJson, hashNormalizedContent, sha256 } from "./content-hashing";
import {
  EMBEDDING_ADAPTER_VERSION,
  EMBEDDING_MODELS,
  PROMPT_20_BUDGETS,
  RETRIEVAL_CHUNKER_VERSION
} from "./retrieval-config";

export type ApprovedUserVectorInput = Readonly<{
  record: UserMemoryRecord;
  partition: Extract<
    RetrievalPartition,
    "journal_summaries" | "testimonies" | "journey_history" | "calling_evidence"
  >;
  approvedSummary: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  rawPrayerOrReflectionTextIncluded: false;
  externalEmbeddingConsentRecordId: string;
  partitionConsentRecordId: string;
  activeIndexVersion: string;
  now: string;
}>;

function requiredScope(partition: ApprovedUserVectorInput["partition"]): string {
  return {
    journal_summaries: "semantic_index:memory",
    testimonies: "semantic_index:testimony",
    journey_history: "semantic_index:journey",
    calling_evidence: "semantic_index:calling_evidence"
  }[partition];
}

export class UserVectorIndexService {
  constructor(
    private readonly consent: ConsentLedger,
    private readonly vectors: VectorRepository,
    private readonly embeddings: EmbeddingGateway
  ) {}

  async indexApproved(input: ApprovedUserVectorInput): Promise<void> {
    const policy = RETRIEVAL_PARTITION_POLICIES[input.partition];
    const partitionPurpose = policy.requiredPurposeId;
    if (
      !partitionPurpose ||
      !input.record.userApproved ||
      input.record.status !== "active" ||
      input.record.sensitivity !== "structured_spiritual" ||
      input.rawPrayerOrReflectionTextIncluded !== false
    ) {
      throw new Error("Only an approved structured user record may be semantically indexed.");
    }
    const [external, partition] = await Promise.all([
      this.consent.getEffective(
        input.record.userId,
        "external_ai_embedding_processing",
        input.now
      ),
      this.consent.getEffective(input.record.userId, partitionPurpose, input.now)
    ]);
    if (
      external?.status !== "granted" ||
      external.id !== input.externalEmbeddingConsentRecordId ||
      !external.scope.includes("embedding:process") ||
      partition?.status !== "granted" ||
      partition.id !== input.partitionConsentRecordId ||
      !partition.scope.includes(requiredScope(input.partition))
    ) {
      throw new Error("Current external-processing and partition-specific consent are required.");
    }
    const content = stableJson(input.approvedSummary);
    if (content.length > 4_000) {
      throw new Error("The approved structured summary exceeds the user-vector input limit.");
    }
    const contentHash = hashNormalizedContent(content);
    const id = sha256(
      `${input.record.userId}:${input.partition}:${input.record.id}:${input.record.version}:${contentHash}`
    );
    const embedded = await this.embeddings.embedQuery({
      input: Object.freeze({
        id,
        content,
        normalizedContentHash: contentHash,
        sourceVersion: String(input.record.version),
        chunkerVersion: RETRIEVAL_CHUNKER_VERSION,
        sensitivity: "structured_spiritual"
      }),
      model: EMBEDDING_MODELS.default.id,
      dimension: EMBEDDING_MODELS.default.dimension,
      budget: Object.freeze({
        purpose: "document_indexing",
        maximumInputTokens: 2_000,
        maximumCostUsd: PROMPT_20_BUDGETS.queryEvaluationUsd,
        spentCostUsd: 0,
        pricePerMillionInputTokensUsd:
          EMBEDDING_MODELS.default.pricePerMillionInputTokensUsd
      })
    });
    const purposes = Object.freeze([
      "external_ai_embedding_processing" as PurposeId,
      partitionPurpose
    ]);
    const consentRecordIds = Object.freeze([external.id, partition.id]);
    await this.vectors.upsert(input.partition, [
      Object.freeze({
        id,
        indexVersion: input.activeIndexVersion,
        vector: embedded.vector,
        normalizedContentHash: contentHash,
        metadata: Object.freeze({
          documentId: input.record.id,
          partition: input.partition,
          trustLevel:
            input.partition === "journal_summaries"
              ? "USER_AUTHORED_APPROVED_SUMMARY"
              : input.partition === "testimonies"
                ? "USER_CONFIRMED_TESTIMONY"
                : input.partition === "journey_history"
                  ? "USER_APPROVED_JOURNEY_STATE"
                  : "USER_APPROVED_CALLING_EVIDENCE",
          sourceId: input.record.provenance.sourceId || input.record.id,
          sourceVersion: String(input.record.version),
          sourceChecksum: sha256(
            stableJson({
              id: input.record.id,
              version: input.record.version,
              provenance: input.record.provenance
            })
          ),
          chunkerVersion: RETRIEVAL_CHUNKER_VERSION,
          embeddingProvider: "openai",
          embeddingModel: embedded.model,
          embeddingDimension: embedded.dimension,
          embeddingAdapterVersion: EMBEDDING_ADAPTER_VERSION,
          indexedAt: input.now,
          language: "en-US",
          scriptureCitations: Object.freeze([
            ...(input.record.provenance.scriptureCitations || [])
          ]),
          userId: input.record.userId,
          consentRecordIds,
          purposeIds: purposes,
          sensitivity: "structured_spiritual",
          ...(input.record.expiresAt ? { expiresAt: input.record.expiresAt } : {})
        }),
        title: `User-approved ${input.partition.replaceAll("_", " ")}`,
        chunkRole: "user_approved_structured_summary",
        ordinal: 0,
        tokenCount: embedded.usage.inputTokens,
        matchedTextHash: contentHash,
        content
      })
    ]);
    await this.vectors.activateIndex(input.activeIndexVersion, [input.partition], input.now);
  }
}

export class ConsentVectorLifecycleService {
  constructor(private readonly vectors: VectorRepository) {}

  revokeConsent(
    userId: string,
    consentRecordId: string,
    now: string
  ): Promise<VectorDeletionResult> {
    return this.vectors.deleteByConsent({
      userId,
      consentRecordId,
      reason: "consent_revoked",
      now
    });
  }

  deleteUser(userId: string, now: string): Promise<VectorDeletionResult> {
    return this.vectors.deleteByUser({
      userId,
      reason: "user_requested",
      now
    });
  }

  invalidateSource(
    sourceId: string,
    sourceVersion: string,
    userId: string,
    now: string
  ): Promise<VectorDeletionResult> {
    return this.vectors.deleteBySource({
      sourceId,
      sourceVersion,
      userId,
      reason: "source_changed",
      now
    });
  }
}
