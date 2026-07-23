import type { PurposeId } from "../memory/memory-contracts";
import type {
  RetrievalDocumentMetadata,
  RetrievalPartition,
  RetrievalTrustLevel
} from "./retrieval-contracts";

export type RetrievalPartitionPolicy = Readonly<{
  partition: RetrievalPartition;
  allowedTrustLevels: readonly RetrievalTrustLevel[];
  userOwned: boolean;
  requiredPurposeId?: PurposeId;
  rawSensitiveTextAllowed: false;
}>;

function trustLevels(...levels: RetrievalTrustLevel[]): readonly RetrievalTrustLevel[] {
  return Object.freeze(levels);
}

export const RETRIEVAL_PARTITION_POLICIES: Readonly<Record<RetrievalPartition, RetrievalPartitionPolicy>> = Object.freeze({
  canonical_scripture: Object.freeze({ partition: "canonical_scripture", allowedTrustLevels: trustLevels("CANONICAL_SCRIPTURE"), userOwned: false, rawSensitiveTextAllowed: false }),
  scripture_context: Object.freeze({ partition: "scripture_context", allowedTrustLevels: trustLevels("REVIEWED_SCRIPTURE_CONTEXT"), userOwned: false, rawSensitiveTextAllowed: false }),
  promise_clusters: Object.freeze({ partition: "promise_clusters", allowedTrustLevels: trustLevels("REVIEWED_TEOYUBE_CONTENT"), userOwned: false, rawSensitiveTextAllowed: false }),
  lexicon: Object.freeze({ partition: "lexicon", allowedTrustLevels: trustLevels("REVIEWED_TEOYUBE_CONTENT"), userOwned: false, rawSensitiveTextAllowed: false }),
  prayer_resources: Object.freeze({ partition: "prayer_resources", allowedTrustLevels: trustLevels("REVIEWED_TEOYUBE_CONTENT"), userOwned: false, rawSensitiveTextAllowed: false }),
  theology_safety: Object.freeze({ partition: "theology_safety", allowedTrustLevels: trustLevels("SYSTEM_POLICY_REFERENCE"), userOwned: false, rawSensitiveTextAllowed: false }),
  journal_summaries: Object.freeze({ partition: "journal_summaries", allowedTrustLevels: trustLevels("USER_AUTHORED_APPROVED_SUMMARY"), userOwned: true, requiredPurposeId: "user_memory_semantic_index", rawSensitiveTextAllowed: false }),
  testimonies: Object.freeze({ partition: "testimonies", allowedTrustLevels: trustLevels("USER_CONFIRMED_TESTIMONY"), userOwned: true, requiredPurposeId: "user_testimony_semantic_index", rawSensitiveTextAllowed: false }),
  journey_history: Object.freeze({ partition: "journey_history", allowedTrustLevels: trustLevels("USER_APPROVED_JOURNEY_STATE"), userOwned: true, requiredPurposeId: "user_journey_semantic_index", rawSensitiveTextAllowed: false }),
  calling_evidence: Object.freeze({ partition: "calling_evidence", allowedTrustLevels: trustLevels("USER_APPROVED_CALLING_EVIDENCE"), userOwned: true, requiredPurposeId: "user_calling_evidence_semantic_index", rawSensitiveTextAllowed: false }),
  product_help: Object.freeze({ partition: "product_help", allowedTrustLevels: trustLevels("REVIEWED_PRODUCT_HELP"), userOwned: false, rawSensitiveTextAllowed: false })
});

export type RetrievalMetadataValidation = Readonly<{
  valid: boolean;
  errors: readonly string[];
}>;

export function validateRetrievalMetadata(metadata: RetrievalDocumentMetadata): RetrievalMetadataValidation {
  const policy = RETRIEVAL_PARTITION_POLICIES[metadata.partition];
  const errors: string[] = [];
  for (const [label, value] of Object.entries({
    documentId: metadata.documentId,
    sourceId: metadata.sourceId,
    sourceVersion: metadata.sourceVersion,
    sourceChecksum: metadata.sourceChecksum,
    chunkerVersion: metadata.chunkerVersion,
    embeddingProvider: metadata.embeddingProvider,
    embeddingModel: metadata.embeddingModel,
    embeddingAdapterVersion: metadata.embeddingAdapterVersion,
    indexedAt: metadata.indexedAt,
    language: metadata.language
  })) {
    if (!value.trim()) errors.push(`${label} is required`);
  }
  if (!Number.isInteger(metadata.embeddingDimension) || metadata.embeddingDimension <= 0) {
    errors.push("embeddingDimension must be a positive integer");
  }
  if (!policy.allowedTrustLevels.includes(metadata.trustLevel)) errors.push("trustLevel is not allowed for this partition");
  if (metadata.sensitivity === "sensitive_spiritual") errors.push("raw Class 3 sensitive spiritual content cannot be embedded");
  if (policy.userOwned) {
    if (!metadata.userId) errors.push("userId is required for a user-owned partition");
    if (!metadata.consentRecordIds?.length) errors.push("consentRecordIds are required for a user-owned partition");
    if (!metadata.purposeIds?.includes("external_ai_embedding_processing")) errors.push("external embedding consent is required");
    if (policy.requiredPurposeId && !metadata.purposeIds?.includes(policy.requiredPurposeId)) {
      errors.push(`purpose ${policy.requiredPurposeId} is required`);
    }
  } else if (metadata.userId) {
    errors.push("public partitions may not include a user owner");
  }
  if (metadata.partition === "canonical_scripture" && metadata.scriptureCitations.length === 0) {
    errors.push("canonical Scripture vectors require an exact citation");
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function isUserRetrievalPartition(partition: RetrievalPartition): boolean {
  return RETRIEVAL_PARTITION_POLICIES[partition].userOwned;
}
