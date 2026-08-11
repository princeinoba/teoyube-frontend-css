import type { RetrievalChunk } from "../../domain/retrieval/retrieval-contracts";
import { parseScriptureReference } from "../../domain/scripture/scripture-reference-parser";
import type {
  ScriptureCitation,
  ScriptureReference,
} from "../../domain/scripture/scripture-repository";
import canonJson from "../../data/scriptureCanon.json";
import promisesJson from "../../data/promiseClusters.json";
import vocabulary1Json from "../../data/coreTeoyubeVocabulary.json";
import vocabulary2Json from "../../data/coreTeoyubeVocabulary-part2.json";
import vocabulary3Json from "../../data/coreTeoyubeVocabulary-part3.json";
import corpusJson from "../scripture/corpora/engwebp/generated/corpus.json";
import {
  chunkDeterministically,
  type ChunkSource,
} from "./deterministic-chunker";
import { sha256, stableJson } from "./content-hashing";
import {
  EMBEDDING_ADAPTER_VERSION,
  RETRIEVAL_CHUNKER_VERSION,
} from "./retrieval-config";
import type {
  AuthorizedEvaluationChunk,
  AuthorizedVectorContentType,
  AuthorizedVectorEvaluationInventory,
} from "./authorized-vector-evaluation-inventory";

type CorpusVerse = Readonly<{
  key: string;
  bookId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string | null;
  textStatus: "displayable" | "source_footnote_only";
}>;

type Corpus = Readonly<{
  corpusVersion: string;
  translationId: string;
  language: string;
  verses: readonly CorpusVerse[];
}>;

type CanonRecord = Readonly<{
  id: string;
  scriptureReferences?: readonly string[];
  [key: string]: unknown;
}>;

type JsonRecord = Readonly<Record<string, unknown>>;

const corpus = corpusJson as Corpus;
const SOURCE_CHECKSUMS = Object.freeze({
  "src/server/scripture/corpora/engwebp/generated/corpus.json":
    "6e6b3f95b5d61c83c06534ee4281f10b6e4e02c878b75141dcdd4403bf42d77f",
  "src/data/promiseClusters.json":
    "a65b247ec433e3e73a3754666191a1657035a1cc9d90494ab25722c71470da25",
  "src/data/coreTeoyubeVocabulary.json":
    "0ef30991efc07ad19cf995aa39ee633ab0d3b6d1d7b1ed703362c7cb890ab4f6",
  "src/data/coreTeoyubeVocabulary-part2.json":
    "ac0fa14c85a609b65f53627502fd089f3804182c3c6dcd61056708f25c9db033",
  "src/data/coreTeoyubeVocabulary-part3.json":
    "ce2e83eed123e1610013d88013ce6fe7760d751fcc42ea620d349b4a3e421794",
  "src/data/scriptureCanon.json":
    "3bb4157f9a022bc080f270e67e846ba92adccbe73ce362213606241a47457205",
});

function citation(
  reference: ScriptureReference,
  label: string,
): ScriptureCitation {
  return Object.freeze({
    reference,
    canonicalLabel: label,
    translationId: corpus.translationId,
    corpusVersion: corpus.corpusVersion,
    sourceId: "engwebp",
    validationStatus: "validated",
  });
}

function citationsFromLabels(
  labels: readonly string[],
): readonly ScriptureCitation[] {
  return Object.freeze(
    labels.flatMap((label) => {
      const parsed = parseScriptureReference(label, {
        supportsCrossChapterRanges: true,
      });
      return parsed.valid
        ? [citation(parsed.reference, parsed.canonicalLabel)]
        : [];
    }),
  );
}

function publicSource(
  input: Omit<ChunkSource, "sensitivity" | "language">,
): ChunkSource {
  return Object.freeze({ ...input, sensitivity: "public", language: "en-US" });
}

function typedChunks(
  source: ChunkSource,
  contentType: AuthorizedVectorContentType,
): readonly AuthorizedEvaluationChunk[] {
  return Object.freeze(
    chunkDeterministically(source).map((chunk) =>
      Object.freeze({ ...chunk, evaluationContentType: contentType }),
    ),
  );
}

function sourceSummary(chunks: readonly RetrievalChunk[]) {
  const grouped = new Map<string, RetrievalChunk[]>();
  for (const chunk of chunks) {
    const items = grouped.get(chunk.sourceId) || [];
    items.push(chunk);
    grouped.set(chunk.sourceId, items);
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
            [...new Set(items.map((item) => item.partition))].sort(),
          ),
          documentCount: new Set(items.map((item) => item.documentId)).size,
          chunkCount: items.length,
          estimatedTokens: items.reduce(
            (sum, item) => sum + item.tokenCount,
            0,
          ),
        }),
      ),
  );
}

export function buildManagedVectorRuntimeInventory(
  model: string,
  dimension: number,
  generatedAt: string,
): AuthorizedVectorEvaluationInventory {
  const chunks: AuthorizedEvaluationChunk[] = [];
  const corpusSourceId =
    "src/server/scripture/corpora/engwebp/generated/corpus.json";
  const corpusChecksum = SOURCE_CHECKSUMS[corpusSourceId];
  const verseGroups = new Map<string, CorpusVerse[]>();

  for (const verse of corpus.verses) {
    if (verse.textStatus !== "displayable" || !verse.text) continue;
    const reference = Object.freeze({
      book: verse.bookId,
      chapterStart: verse.chapter,
      verseStart: verse.verse,
    });
    const label = `${verse.book} ${verse.chapter}:${verse.verse}`;
    chunks.push(
      ...typedChunks(
        publicSource({
          documentId: `web:${verse.key}`,
          title: `${label} (WEB)`,
          content: verse.text,
          partition: "canonical_scripture",
          trustLevel: "CANONICAL_SCRIPTURE",
          sourceId: corpusSourceId,
          sourceVersion: corpus.corpusVersion,
          sourceChecksum: corpusChecksum,
          chunkRole: "exact_verse",
          scriptureCitations: Object.freeze([citation(reference, label)]),
        }),
        "SCRIPTURE",
      ),
    );
    const chapterKey = `${verse.bookId}.${verse.chapter}`;
    const verses = verseGroups.get(chapterKey) || [];
    verses.push(verse);
    verseGroups.set(chapterKey, verses);
  }

  for (const [chapterKey, verses] of [...verseGroups.entries()].sort(
    ([left], [right]) => left.localeCompare(right),
  )) {
    const first = verses[0];
    const last = verses[verses.length - 1];
    const reference = Object.freeze({
      book: first.bookId,
      chapterStart: first.chapter,
      verseStart: first.verse,
      verseEnd: last.verse,
    });
    const label = `${first.book} ${first.chapter}:${first.verse}-${last.verse}`;
    chunks.push(
      ...typedChunks(
        publicSource({
          documentId: `web-context:${chapterKey}`,
          title: `${first.book} ${first.chapter} context (WEB)`,
          content: verses
            .map((verse) => `${verse.verse}. ${verse.text}`)
            .join(" "),
          partition: "scripture_context",
          trustLevel: "REVIEWED_SCRIPTURE_CONTEXT",
          sourceId: corpusSourceId,
          sourceVersion: corpus.corpusVersion,
          sourceChecksum: corpusChecksum,
          chunkRole: "source_defined_chapter",
          scriptureCitations: Object.freeze([citation(reference, label)]),
        }),
        "SCRIPTURE",
      ),
    );
  }

  const promisePath = "src/data/promiseClusters.json";
  for (const promise of promisesJson as readonly JsonRecord[]) {
    const id = String(promise.id || promise.cluster_id);
    const labels = Array.isArray(promise.scripture_references)
      ? promise.scripture_references.filter(
          (item): item is string => typeof item === "string",
        )
      : [];
    chunks.push(
      ...typedChunks(
        publicSource({
          documentId: `promise:${id}`,
          title: String(promise.title || promise.name || id),
          content: stableJson(promise),
          partition: "promise_clusters",
          trustLevel: "REVIEWED_TEOYUBE_CONTENT",
          sourceId: promisePath,
          sourceVersion: `sha256:${SOURCE_CHECKSUMS[promisePath]}`,
          sourceChecksum: SOURCE_CHECKSUMS[promisePath],
          chunkRole: "reviewed_promise_cluster",
          scriptureCitations: citationsFromLabels(labels),
        }),
        "PROMISE",
      ),
    );
  }

  const vocabularies = [
    ["src/data/coreTeoyubeVocabulary.json", vocabulary1Json],
    ["src/data/coreTeoyubeVocabulary-part2.json", vocabulary2Json],
    ["src/data/coreTeoyubeVocabulary-part3.json", vocabulary3Json],
  ] as const;
  for (const [vocabularyPath, vocabulary] of vocabularies) {
    for (const word of vocabulary as readonly JsonRecord[]) {
      const labels = Array.isArray(word.scripture_sources)
        ? word.scripture_sources.filter(
            (item): item is string => typeof item === "string",
          )
        : [];
      const wordId = String(word.word || word.lexicon_number);
      chunks.push(
        ...typedChunks(
          publicSource({
            documentId: `lexicon:${wordId.toLowerCase()}`,
            title: wordId,
            content: stableJson(word),
            partition: "lexicon",
            trustLevel: "REVIEWED_TEOYUBE_CONTENT",
            sourceId: vocabularyPath,
            sourceVersion: `sha256:${SOURCE_CHECKSUMS[vocabularyPath]}`,
            sourceChecksum: SOURCE_CHECKSUMS[vocabularyPath],
            chunkRole: "reviewed_lexicon_entry",
            scriptureCitations: citationsFromLabels(labels),
          }),
          "LEXICON",
        ),
      );
    }
  }

  const canonPath = "src/data/scriptureCanon.json";
  for (const record of canonJson as readonly CanonRecord[]) {
    chunks.push(
      ...typedChunks(
        publicSource({
          documentId: `canon:${record.id}`,
          title: String(record.teoyubeWord || record.id),
          content: stableJson(record),
          partition: "scripture_context",
          trustLevel: "REVIEWED_SCRIPTURE_CONTEXT",
          sourceId: canonPath,
          sourceVersion: `sha256:${SOURCE_CHECKSUMS[canonPath]}`,
          sourceChecksum: SOURCE_CHECKSUMS[canonPath],
          chunkRole: "reviewed_canon_entry",
          scriptureCitations: citationsFromLabels(
            record.scriptureReferences || [],
          ),
        }),
        "CANON",
      ),
    );
  }

  const uniqueById = new Map<string, AuthorizedEvaluationChunk>();
  for (const chunk of chunks) {
    const existing = uniqueById.get(chunk.chunkId);
    if (existing) {
      if (
        existing.contentHash !== chunk.contentHash ||
        existing.documentId !== chunk.documentId ||
        existing.partition !== chunk.partition
      ) {
        throw new Error(
          `Managed runtime chunk identifier collision: ${chunk.chunkId}.`,
        );
      }
      continue;
    }
    uniqueById.set(chunk.chunkId, chunk);
  }
  const ordered = Object.freeze(
    [...uniqueById.values()].sort(
      (left, right) =>
        left.partition.localeCompare(right.partition) ||
        left.documentId.localeCompare(right.documentId) ||
        left.ordinal - right.ordinal,
    ),
  );
  const sources = sourceSummary(ordered);
  const compositeSourceHash = sha256(
    stableJson(
      sources.map((source) => ({
        id: source.sourceId,
        version: source.sourceVersion,
        checksum: source.sourceChecksum,
      })),
    ),
  );
  const contentTypes = [
    "SCRIPTURE",
    "INTERPRETATION",
    "PROMISE",
    "LEXICON",
    "CANON",
    "TIG_EXPLANATION",
  ] as const;
  const contentTypeCounts = Object.freeze(
    Object.fromEntries(
      contentTypes.map((contentType) => [
        contentType,
        ordered.filter((chunk) => chunk.evaluationContentType === contentType)
          .length,
      ]),
    ) as Record<AuthorizedVectorContentType, number>,
  );
  return Object.freeze({
    authorizationId: "TEOYUBE-AUG21-VECTOR-EVALUATION-2026-08-09-001",
    preparedPublicInventoryHash:
      "f0669e6f0c1974fc4be742b301e7b3efefdbb0ea367d33b5c7a86ccfeccc7fbe",
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
    duplicateChunksExcluded: chunks.length - ordered.length,
    totalEstimatedTokens: ordered.reduce(
      (sum, chunk) => sum + chunk.tokenCount,
      0,
    ),
    contentTypeCounts,
    excludedPreparedSources: Object.freeze([
      "src/data/prayerEngineTemplates.json",
      "src/data/projectStructureRoadmap.json",
      "src/data/technicalArchitecture.json",
      "src/data/teoyubeSearchFramework.json",
      "src/data/theologyConstitution.json",
    ]),
  });
}

export const MANAGED_VECTOR_STATIC_SOURCE_IDENTITIES = SOURCE_CHECKSUMS;
