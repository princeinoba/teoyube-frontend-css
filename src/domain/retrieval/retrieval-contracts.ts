import type { DataSensitivity, PurposeId } from "../memory/memory-contracts";
import type { ScriptureCitation } from "../scripture/scripture-repository";

export const RETRIEVAL_PARTITIONS = Object.freeze([
  "canonical_scripture",
  "scripture_context",
  "promise_clusters",
  "lexicon",
  "prayer_resources",
  "theology_safety",
  "journal_summaries",
  "testimonies",
  "journey_history",
  "calling_evidence",
  "product_help"
] as const);

export type RetrievalPartition = (typeof RETRIEVAL_PARTITIONS)[number];

export const RETRIEVAL_TRUST_LEVELS = Object.freeze([
  "CANONICAL_SCRIPTURE",
  "REVIEWED_SCRIPTURE_CONTEXT",
  "REVIEWED_TEOYUBE_CONTENT",
  "SYSTEM_POLICY_REFERENCE",
  "USER_AUTHORED_APPROVED_SUMMARY",
  "USER_CONFIRMED_TESTIMONY",
  "USER_APPROVED_JOURNEY_STATE",
  "USER_APPROVED_CALLING_EVIDENCE",
  "REVIEWED_PRODUCT_HELP"
] as const);

export type RetrievalTrustLevel = (typeof RETRIEVAL_TRUST_LEVELS)[number];

export type RetrievalDocumentMetadata = Readonly<{
  documentId: string;
  partition: RetrievalPartition;
  trustLevel: RetrievalTrustLevel;
  sourceId: string;
  sourceVersion: string;
  sourceChecksum: string;
  chunkerVersion: string;
  embeddingProvider: string;
  embeddingModel: string;
  embeddingDimension: number;
  embeddingAdapterVersion: string;
  indexedAt: string;
  language: string;
  scriptureCitations: readonly ScriptureCitation[];
  userId?: string;
  consentRecordIds?: readonly string[];
  purposeIds?: readonly PurposeId[];
  sensitivity: DataSensitivity;
  expiresAt?: string;
  deletedAt?: string;
}>;

export type RetrievalChunk = Readonly<{
  chunkId: string;
  documentId: string;
  title: string;
  content: string;
  partition: RetrievalPartition;
  trustLevel: RetrievalTrustLevel;
  sourceId: string;
  sourceVersion: string;
  sourceChecksum: string;
  chunkerVersion: string;
  chunkRole: string;
  ordinal: number;
  contentHash: string;
  tokenCount: number;
  language: string;
  scriptureCitations: readonly ScriptureCitation[];
  sensitivity: DataSensitivity;
  userId?: string;
  consentRecordIds?: readonly string[];
  purposeIds?: readonly PurposeId[];
  expiresAt?: string;
  deletedAt?: string;
}>;

export type EmbeddingPurpose = "document_indexing" | "query" | "candidate_evaluation";

export type EmbeddingInput = Readonly<{
  id: string;
  content: string;
  normalizedContentHash: string;
  sourceVersion: string;
  chunkerVersion: string;
  sensitivity: DataSensitivity;
}>;

export type EmbeddingBudget = Readonly<{
  purpose: EmbeddingPurpose;
  maximumInputTokens: number;
  maximumCostUsd: number;
  spentCostUsd: number;
  pricePerMillionInputTokensUsd: number;
}>;

export type EmbedDocumentsRequest = Readonly<{
  inputs: readonly EmbeddingInput[];
  model: string;
  dimension: number;
  budget: EmbeddingBudget;
}>;

export type EmbedQueryRequest = Readonly<{
  input: EmbeddingInput;
  model: string;
  dimension: number;
  budget: EmbeddingBudget;
}>;

export type EmbeddingUsage = Readonly<{
  inputTokens: number;
  estimatedCostUsd: number;
  requestIds: readonly string[];
  cacheHits: number;
  providerCalls: number;
}>;

export type EmbeddingResult = Readonly<{
  id: string;
  vector: readonly number[];
  model: string;
  dimension: number;
  normalizedContentHash: string;
  adapterVersion: string;
  usage: EmbeddingUsage;
}>;

export type EmbeddingBatchResult = Readonly<{
  results: readonly EmbeddingResult[];
  model: string;
  dimension: number;
  adapterVersion: string;
  usage: EmbeddingUsage;
}>;

export type EmbeddingGatewayHealth = Readonly<{
  status: "ready" | "disabled" | "unavailable";
  provider: string;
  configuredModel: string;
  configuredDimension: number;
  limitations: readonly string[];
}>;

export interface EmbeddingGateway {
  embedDocuments(request: EmbedDocumentsRequest): Promise<EmbeddingBatchResult>;
  embedQuery(request: EmbedQueryRequest): Promise<EmbeddingResult>;
  health(): Promise<EmbeddingGatewayHealth>;
}

export type VectorRecord = Readonly<{
  id: string;
  indexVersion: string;
  vector: readonly number[];
  normalizedContentHash: string;
  metadata: RetrievalDocumentMetadata;
  title: string;
  chunkRole: string;
  ordinal: number;
  tokenCount: number;
  matchedTextHash: string;
  content: string;
}>;

export type VectorSearchRequest = Readonly<{
  queryVector: readonly number[];
  partitions: readonly RetrievalPartition[];
  trustLevels: readonly RetrievalTrustLevel[];
  limit: number;
  language: string;
  activeIndexVersion: string;
  userId?: string;
  consentRecordIds?: readonly string[];
  purposeIds?: readonly PurposeId[];
  now: string;
}>;

export type VectorSearchResult = Readonly<{
  recordId: string;
  score: number;
  metadata: RetrievalDocumentMetadata;
  title: string;
  chunkRole: string;
  ordinal: number;
  tokenCount: number;
  content: string;
  indexVersion: string;
}>;

export type VectorUpsertResult = Readonly<{
  partition: RetrievalPartition;
  inserted: number;
  updated: number;
  unchanged: number;
  indexVersion: string;
}>;

export type DeleteVectorsBySourceRequest = Readonly<{
  sourceId: string;
  sourceVersion?: string;
  userId?: string;
  reason: "source_deleted" | "source_changed" | "source_reclassified" | "expired";
  now: string;
}>;

export type DeleteUserVectorsRequest = Readonly<{
  userId: string;
  reason: "account_deleted" | "user_requested";
  now: string;
}>;

export type DeleteConsentVectorsRequest = Readonly<{
  userId: string;
  consentRecordId: string;
  reason: "consent_revoked" | "consent_expired";
  now: string;
}>;

export type VectorDeletionResult = Readonly<{
  deleted: number;
  invalidated: number;
  completedAt: string;
  retryableFailures: readonly string[];
}>;

export type VectorCompactionResult = Readonly<{
  removedRecords: number;
  bytesBefore: number;
  bytesAfter: number;
  completedAt: string;
}>;

export type VectorIndexInfo = Readonly<{
  partition: RetrievalPartition;
  activeIndexVersion: string | null;
  recordCount: number;
  dimension: number | null;
  embeddingModel: string | null;
  sourceVersions: readonly string[];
  bytes: number;
  generatedAt: string | null;
}>;

export interface VectorRepository {
  upsert(partition: RetrievalPartition, records: readonly VectorRecord[]): Promise<VectorUpsertResult>;
  search(request: VectorSearchRequest): Promise<readonly VectorSearchResult[]>;
  activateIndex(indexVersion: string, partitions: readonly RetrievalPartition[], activatedAt: string): Promise<void>;
  rollbackIndex(indexVersion: string, partitions: readonly RetrievalPartition[], rolledBackAt: string): Promise<void>;
  deleteBySource(request: DeleteVectorsBySourceRequest): Promise<VectorDeletionResult>;
  deleteByUser(request: DeleteUserVectorsRequest): Promise<VectorDeletionResult>;
  deleteByConsent(request: DeleteConsentVectorsRequest): Promise<VectorDeletionResult>;
  compact(): Promise<VectorCompactionResult>;
  getIndexInfo(partition: RetrievalPartition): Promise<VectorIndexInfo>;
}

export type RetrievalAuthorization = Readonly<{
  userId: string;
  effectivePurposeIds: readonly PurposeId[];
  consentRecordIds: readonly string[];
}>;

export type HybridRetrievalRequest = Readonly<{
  query: string;
  intent: string;
  safetyMode: "standard" | "sensitive" | "critical";
  allowedPartitions: readonly RetrievalPartition[];
  language: string;
  topK: number;
  enableVector: boolean;
  activeIndexVersion: string;
  executionKind: "user_query" | "owner_evaluation";
  authorization?: RetrievalAuthorization;
  exactReferenceHint?: string;
  currentJourneySourceIds?: readonly string[];
  now: string;
}>;

export type RetrievalScoreBreakdown = Readonly<{
  exactReference: number;
  lexical: number;
  vector: number;
  graph: number;
  trust: number;
  journey: number;
  memory: number;
  recency: number;
  category: number;
  diversity: number;
}>;

export type HybridSourceResult = Readonly<{
  recordId: string;
  sourceId: string;
  documentId: string;
  partition: RetrievalPartition;
  trustLevel: RetrievalTrustLevel;
  title: string;
  canonicalReference?: ScriptureCitation;
  scriptureCitations: readonly ScriptureCitation[];
  sourceVersion: string;
  sourceChecksum: string;
  lexicalScore?: number;
  vectorScore?: number;
  graphScore?: number;
  fusedScore: number;
  scoreBreakdown: RetrievalScoreBreakdown;
  rank: number;
  matchedTerms: readonly string[];
  matchedConcepts: readonly string[];
  graphPath?: readonly string[];
  selectionReasons: readonly string[];
  limitations: readonly string[];
  userOwned: boolean;
  consentScopes?: readonly string[];
  indexVersion: string;
  content: string;
}>;

export type HybridRetrievalResult = Readonly<{
  requestId: string;
  queryHash: string;
  intent: string;
  exactReferenceResolved: boolean;
  pathsUsed: readonly ("exact" | "lexical" | "vector" | "tig")[];
  sources: readonly HybridSourceResult[];
  fallback: Readonly<{
    used: boolean;
    reason?: "disabled" | "not_useful" | "no_consent" | "critical_safety" | "budget" | "provider_unavailable" | "index_unavailable";
  }>;
  limitations: readonly string[];
  contextTokenCount: number;
  latencyMs: number;
  indexVersion: string;
}>;

export interface HybridRetriever {
  retrieve(request: HybridRetrievalRequest): Promise<HybridRetrievalResult>;
}

export type RetrievalContext = Readonly<{
  sourceIds: readonly string[];
  segments: readonly Readonly<{
    sourceId: string;
    recordId: string;
    authority:
      | "Scripture"
      | "Reviewed context"
      | "Reviewed Teoyube content"
      | "System policy"
      | "User-approved record"
      | "Product help";
    content: string;
    sourceVersion: string;
    scriptureCitation?: ScriptureCitation;
    userOwned: boolean;
  }>[];
  scriptureSources: readonly HybridSourceResult[];
  interpretiveSources: readonly HybridSourceResult[];
  userSources: readonly HybridSourceResult[];
  totalTokens: number;
  limitations: readonly string[];
}>;

export type RetrievalEvaluationMetrics = Readonly<{
  exactReferenceAccuracy: number;
  recallAt5: number;
  recallAt10: number;
  mrrAt10: number;
  ndcgAt10: number;
  sourcePrecision: number;
  citationValidity: number;
  trustFilterAccuracy: number;
  consentFilterAccuracy: number;
  crossUserLeakage: number;
  deletedOrRevokedLeakage: number;
  sourceInspectability: number;
  promptInjectionBypass: number;
  meanLatencyMs: number;
  contextTokenCount: number;
}>;

export type RetrievalFeedbackSignal = Readonly<{
  id: string;
  requestId: string;
  sourceId?: string;
  kind:
    | "result_helpful"
    | "result_not_helpful"
    | "wrong_scripture"
    | "wrong_context"
    | "wrong_category"
    | "source_missing"
    | "unsafe_or_inappropriate";
  createdAt: string;
  userInitiated: true;
  freeTextStored: false;
}>;
