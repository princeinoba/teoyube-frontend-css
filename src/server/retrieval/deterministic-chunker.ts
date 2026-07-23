import type {
  RetrievalChunk,
  RetrievalPartition,
  RetrievalTrustLevel
} from "../../domain/retrieval/retrieval-contracts";
import type { DataSensitivity, PurposeId } from "../../domain/memory/memory-contracts";
import type { ScriptureCitation } from "../../domain/scripture/scripture-repository";
import {
  estimateTokens,
  hashNormalizedContent,
  normalizeRetrievalText,
  sha256
} from "./content-hashing";
import { RETRIEVAL_CHUNKER_VERSION } from "./retrieval-config";

export type ChunkSource = Readonly<{
  documentId: string;
  title: string;
  content: string;
  partition: RetrievalPartition;
  trustLevel: RetrievalTrustLevel;
  sourceId: string;
  sourceVersion: string;
  sourceChecksum: string;
  chunkRole: string;
  language: string;
  scriptureCitations: readonly ScriptureCitation[];
  sensitivity: DataSensitivity;
  userId?: string;
  consentRecordIds?: readonly string[];
  purposeIds?: readonly PurposeId[];
  expiresAt?: string;
}>;

const MAX_CHUNK_CHARACTERS = 2_400;

function splitBounded(content: string): readonly string[] {
  const normalized = normalizeRetrievalText(content);
  if (normalized.length <= MAX_CHUNK_CHARACTERS) return Object.freeze([normalized]);
  const sentences = normalized.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (sentence.length > MAX_CHUNK_CHARACTERS) {
      if (current) chunks.push(current);
      for (let offset = 0; offset < sentence.length; offset += MAX_CHUNK_CHARACTERS) {
        chunks.push(sentence.slice(offset, offset + MAX_CHUNK_CHARACTERS));
      }
      current = "";
      continue;
    }
    if (current && current.length + sentence.length + 1 > MAX_CHUNK_CHARACTERS) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current);
  return Object.freeze(chunks);
}

export function chunkDeterministically(source: ChunkSource): readonly RetrievalChunk[] {
  if (source.content.length > 32_000) {
    throw new Error(`Retrieval document ${source.documentId} exceeds the deterministic document limit.`);
  }
  return Object.freeze(
    splitBounded(source.content).map((content, ordinal) => {
      const contentHash = hashNormalizedContent(content);
      return Object.freeze({
        chunkId: sha256(
          `${source.partition}:${source.documentId}:${ordinal}:${contentHash}:${RETRIEVAL_CHUNKER_VERSION}`
        ),
        documentId: source.documentId,
        title: source.title,
        content,
        partition: source.partition,
        trustLevel: source.trustLevel,
        sourceId: source.sourceId,
        sourceVersion: source.sourceVersion,
        sourceChecksum: source.sourceChecksum,
        chunkerVersion: RETRIEVAL_CHUNKER_VERSION,
        chunkRole: source.chunkRole,
        ordinal,
        contentHash,
        tokenCount: estimateTokens(content),
        language: source.language,
        scriptureCitations: source.scriptureCitations,
        sensitivity: source.sensitivity,
        ...(source.userId ? { userId: source.userId } : {}),
        ...(source.consentRecordIds
          ? { consentRecordIds: Object.freeze([...source.consentRecordIds]) }
          : {}),
        ...(source.purposeIds
          ? { purposeIds: Object.freeze([...source.purposeIds]) }
          : {}),
        ...(source.expiresAt ? { expiresAt: source.expiresAt } : {})
      });
    })
  );
}
