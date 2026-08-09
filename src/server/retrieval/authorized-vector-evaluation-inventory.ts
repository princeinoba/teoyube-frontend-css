import { readFileSync } from "node:fs";
import path from "node:path";
import type { RetrievalChunk } from "../../domain/retrieval/retrieval-contracts";
import { parseScriptureReference } from "../../domain/scripture/scripture-reference-parser";
import type { ScriptureCitation } from "../../domain/scripture/scripture-repository";
import { chunkDeterministically } from "./deterministic-chunker";
import { sha256, stableJson } from "./content-hashing";
import {
  EMBEDDING_ADAPTER_VERSION,
  RETRIEVAL_CHUNKER_VERSION
} from "./retrieval-config";
import {
  buildPublicRetrievalInventory,
  type PublicRetrievalInventory,
  type RetrievalInventorySource
} from "./public-source-inventory";

export const VECTOR_EVALUATION_AUTHORIZATION_ID =
  "TEOYUBE-AUG21-VECTOR-EVALUATION-2026-08-09-001";
export const PREPARED_PUBLIC_INVENTORY_HASH =
  "f0669e6f0c1974fc4be742b301e7b3efefdbb0ea367d33b5c7a86ccfeccc7fbe";

export const AUTHORIZED_VECTOR_CONTENT_TYPES = Object.freeze([
  "SCRIPTURE",
  "INTERPRETATION",
  "PROMISE",
  "LEXICON",
  "CANON",
  "TIG_EXPLANATION"
] as const);
export type AuthorizedVectorContentType =
  (typeof AUTHORIZED_VECTOR_CONTENT_TYPES)[number];

export type AuthorizedEvaluationChunk = RetrievalChunk &
  Readonly<{ evaluationContentType: AuthorizedVectorContentType }>;

export type AuthorizedVectorEvaluationInventory = Omit<
  PublicRetrievalInventory,
  "chunks"
> &
  Readonly<{
    authorizationId: string;
    preparedPublicInventoryHash: string;
    chunks: readonly AuthorizedEvaluationChunk[];
    contentTypeCounts: Readonly<Record<AuthorizedVectorContentType, number>>;
    excludedPreparedSources: readonly string[];
  }>;

type CanonRecord = Readonly<{
  id: string;
  scriptureReferences?: readonly string[];
  [key: string]: unknown;
}>;

type Corpus = Readonly<{
  corpusVersion: string;
  translationId: string;
}>;

function citationFromLabel(
  label: string,
  corpus: Corpus
): ScriptureCitation | null {
  const parsed = parseScriptureReference(label, {
    supportsCrossChapterRanges: true
  });
  if (!parsed.valid) return null;
  return Object.freeze({
    reference: parsed.reference,
    canonicalLabel: parsed.canonicalLabel,
    translationId: corpus.translationId,
    corpusVersion: corpus.corpusVersion,
    sourceId: "engwebp",
    validationStatus: "validated"
  });
}

function sourceSummary(
  chunks: readonly AuthorizedEvaluationChunk[]
): readonly RetrievalInventorySource[] {
  const grouped = new Map<string, AuthorizedEvaluationChunk[]>();
  for (const chunk of chunks) {
    const values = grouped.get(chunk.sourceId) || [];
    values.push(chunk);
    grouped.set(chunk.sourceId, values);
  }
  return Object.freeze(
    [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([sourceId, items]) =>
        Object.freeze({
          sourceId,
          sourceVersion: items[0].sourceVersion,
          sourceChecksum: items[0].sourceChecksum,
          partitions: Object.freeze(
            [...new Set(items.map((item) => item.partition))].sort()
          ),
          documentCount: new Set(items.map((item) => item.documentId)).size,
          chunkCount: items.length,
          estimatedTokens: items.reduce((sum, item) => sum + item.tokenCount, 0)
        })
      )
  );
}

function contentTypeForPreparedChunk(
  chunk: RetrievalChunk
): AuthorizedVectorContentType | null {
  if (
    chunk.partition === "canonical_scripture" ||
    chunk.partition === "scripture_context"
  ) {
    return "SCRIPTURE";
  }
  if (chunk.partition === "promise_clusters") return "PROMISE";
  if (chunk.partition === "lexicon") return "LEXICON";
  return null;
}

export function buildAuthorizedVectorEvaluationInventory(
  model: string,
  dimension: number,
  generatedAt: string
): AuthorizedVectorEvaluationInventory {
  const root = process.cwd();
  const prepared = buildPublicRetrievalInventory(model, dimension, generatedAt);
  if (prepared.compositeSourceHash !== PREPARED_PUBLIC_INVENTORY_HASH) {
    throw new Error("The prepared public inventory hash does not match the owner-authorized reference.");
  }

  const chunks: AuthorizedEvaluationChunk[] = prepared.chunks.flatMap((chunk) => {
    const evaluationContentType = contentTypeForPreparedChunk(chunk);
    return evaluationContentType
      ? [Object.freeze({ ...chunk, evaluationContentType })]
      : [];
  });

  const corpusPath = path.join(
    root,
    "src",
    "server",
    "scripture",
    "corpora",
    "engwebp",
    "generated",
    "corpus.json"
  );
  const corpus = JSON.parse(readFileSync(corpusPath, "utf8")) as Corpus;
  const canonRelativePath = "src/data/scriptureCanon.json";
  const canonPath = path.join(root, canonRelativePath);
  const canonBytes = readFileSync(canonPath);
  const canonChecksum = sha256(canonBytes);
  const canon = JSON.parse(canonBytes.toString("utf8")) as readonly CanonRecord[];
  for (const record of canon) {
    const citations = Object.freeze(
      (record.scriptureReferences || []).flatMap((label) => {
        const resolved = citationFromLabel(label, corpus);
        return resolved ? [resolved] : [];
      })
    );
    const generated = chunkDeterministically({
      documentId: `canon:${record.id}`,
      title: String(record.teoyubeWord || record.id),
      content: stableJson(record),
      partition: "scripture_context",
      trustLevel: "REVIEWED_SCRIPTURE_CONTEXT",
      sourceId: canonRelativePath,
      sourceVersion: `sha256:${canonChecksum}`,
      sourceChecksum: canonChecksum,
      chunkRole: "reviewed_canon_entry",
      scriptureCitations: citations,
      sensitivity: "public",
      language: "en-US"
    });
    chunks.push(
      ...generated.map((chunk) =>
        Object.freeze({ ...chunk, evaluationContentType: "CANON" as const })
      )
    );
  }

  const ordered = Object.freeze(
    chunks.sort(
      (left, right) =>
        left.partition.localeCompare(right.partition) ||
        left.documentId.localeCompare(right.documentId) ||
        left.ordinal - right.ordinal
    )
  );
  const sources = sourceSummary(ordered);
  const compositeSourceHash = sha256(
    stableJson(
      sources.map((source) => ({
        id: source.sourceId,
        version: source.sourceVersion,
        checksum: source.sourceChecksum
      }))
    )
  );
  const contentTypeCounts = Object.freeze(
    Object.fromEntries(
      AUTHORIZED_VECTOR_CONTENT_TYPES.map((contentType) => [
        contentType,
        ordered.filter((chunk) => chunk.evaluationContentType === contentType).length
      ])
    ) as Record<AuthorizedVectorContentType, number>
  );
  const authorizedPreparedSourceIds = new Set([
    "src/server/scripture/corpora/engwebp/generated/corpus.json",
    "src/data/promiseClusters.json",
    "src/data/coreTeoyubeVocabulary.json",
    "src/data/coreTeoyubeVocabulary-part2.json",
    "src/data/coreTeoyubeVocabulary-part3.json"
  ]);
  const excludedPreparedSources = Object.freeze(
    prepared.sources
      .map((source) => source.sourceId)
      .filter((sourceId) => !authorizedPreparedSourceIds.has(sourceId))
      .sort()
  );

  return Object.freeze({
    authorizationId: VECTOR_EVALUATION_AUTHORIZATION_ID,
    preparedPublicInventoryHash: PREPARED_PUBLIC_INVENTORY_HASH,
    inventoryVersion: "teoyube-authorized-vector-evaluation-2026-08-09.1",
    generatedAt,
    model,
    dimension,
    chunkerVersion: RETRIEVAL_CHUNKER_VERSION,
    embeddingAdapterVersion: EMBEDDING_ADAPTER_VERSION,
    indexVersion: `evaluation:${model}:${dimension}:${RETRIEVAL_CHUNKER_VERSION}:${compositeSourceHash.slice(0, 20)}`,
    compositeSourceHash,
    sources,
    chunks: ordered,
    totalDocuments: new Set(ordered.map((chunk) => chunk.documentId)).size,
    totalChunks: ordered.length,
    duplicateChunksExcluded: prepared.duplicateChunksExcluded,
    totalEstimatedTokens: ordered.reduce((sum, chunk) => sum + chunk.tokenCount, 0),
    contentTypeCounts,
    excludedPreparedSources
  });
}
