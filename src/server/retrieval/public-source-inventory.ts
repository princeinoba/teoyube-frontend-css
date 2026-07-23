import { readFileSync } from "node:fs";
import path from "node:path";
import type { RetrievalChunk } from "../../domain/retrieval/retrieval-contracts";
import type {
  ScriptureCitation,
  ScriptureReference
} from "../../domain/scripture/scripture-repository";
import { parseScriptureReference } from "../../domain/scripture/scripture-reference-parser";
import { chunkDeterministically, type ChunkSource } from "./deterministic-chunker";
import { sha256, stableJson } from "./content-hashing";
import {
  EMBEDDING_ADAPTER_VERSION,
  RETRIEVAL_CHUNKER_VERSION
} from "./retrieval-config";

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

type CorpusManifest = Readonly<{
  generatedChecksum: string;
  generated: Readonly<{ corpus: Readonly<{ sha256: string }> }>;
}>;

export type RetrievalInventorySource = Readonly<{
  sourceId: string;
  sourceVersion: string;
  sourceChecksum: string;
  partitions: readonly string[];
  documentCount: number;
  chunkCount: number;
  estimatedTokens: number;
}>;

export type PublicRetrievalInventory = Readonly<{
  inventoryVersion: string;
  generatedAt: string;
  model: string;
  dimension: number;
  chunkerVersion: string;
  embeddingAdapterVersion: string;
  indexVersion: string;
  compositeSourceHash: string;
  sources: readonly RetrievalInventorySource[];
  chunks: readonly RetrievalChunk[];
  totalDocuments: number;
  totalChunks: number;
  totalEstimatedTokens: number;
}>;

const generatedRoot = path.join(
  process.cwd(),
  "src",
  "server",
  "scripture",
  "corpora",
  "engwebp",
  "generated"
);

function readJson<T>(relative: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), relative), "utf8")) as T;
}

function fileChecksum(relative: string): string {
  return sha256(readFileSync(path.join(process.cwd(), relative)));
}

function citation(
  reference: ScriptureReference,
  label: string,
  corpusVersion: string,
  translationId = "engwebp"
): ScriptureCitation {
  return Object.freeze({
    reference,
    canonicalLabel: label,
    translationId,
    corpusVersion,
    sourceId: "engwebp",
    validationStatus: "validated"
  });
}

function citationsFromLabels(
  labels: readonly string[],
  corpusVersion: string
): readonly ScriptureCitation[] {
  return Object.freeze(
    labels.flatMap((label) => {
      const parsed = parseScriptureReference(label, { supportsCrossChapterRanges: true });
      return parsed.valid
        ? [citation(parsed.reference, parsed.canonicalLabel, corpusVersion)]
        : [];
    })
  );
}

function publicSource(
  input: Omit<ChunkSource, "sensitivity" | "language">
): ChunkSource {
  return Object.freeze({ ...input, sensitivity: "public", language: "en-US" });
}

function jsonSections(
  value: unknown,
  prefix: string
): readonly Readonly<{ id: string; value: unknown }>[] {
  const serialized = stableJson(value);
  if (serialized.length <= 24_000) return Object.freeze([Object.freeze({ id: prefix, value })]);
  if (Array.isArray(value)) {
    return Object.freeze(value.flatMap((item, index) => jsonSections(item, `${prefix}.${index + 1}`)));
  }
  if (value && typeof value === "object") {
    return Object.freeze(
      Object.entries(value as Readonly<Record<string, unknown>>).flatMap(([key, item]) =>
        jsonSections(item, `${prefix}.${key}`)
      )
    );
  }
  return Object.freeze([
    Object.freeze({ id: prefix, value: String(value).slice(0, 24_000) })
  ]);
}

function sourceSummary(chunks: readonly RetrievalChunk[]): readonly RetrievalInventorySource[] {
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
          partitions: Object.freeze([...new Set(items.map((item) => item.partition))].sort()),
          documentCount: new Set(items.map((item) => item.documentId)).size,
          chunkCount: items.length,
          estimatedTokens: items.reduce((sum, item) => sum + item.tokenCount, 0)
        })
      )
  );
}

export function buildPublicRetrievalInventory(
  model: string,
  dimension: number,
  generatedAt: string
): PublicRetrievalInventory {
  const corpus = JSON.parse(
    readFileSync(path.join(generatedRoot, "corpus.json"), "utf8")
  ) as Corpus;
  const manifest = JSON.parse(
    readFileSync(path.join(generatedRoot, "manifest.json"), "utf8")
  ) as CorpusManifest;
  const chunks: RetrievalChunk[] = [];
  const corpusSourceId =
    "src/server/scripture/corpora/engwebp/generated/corpus.json";
  const corpusChecksum = manifest.generated.corpus.sha256;
  const verseGroups = new Map<string, CorpusVerse[]>();

  for (const verse of corpus.verses) {
    if (verse.textStatus !== "displayable" || !verse.text) continue;
    const reference = Object.freeze({
      book: verse.bookId,
      chapterStart: verse.chapter,
      verseStart: verse.verse
    });
    const label = `${verse.book} ${verse.chapter}:${verse.verse}`;
    chunks.push(
      ...chunkDeterministically(
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
          scriptureCitations: Object.freeze([
            citation(reference, label, corpus.corpusVersion, corpus.translationId)
          ])
        })
      )
    );
    const chapterKey = `${verse.bookId}.${verse.chapter}`;
    const verses = verseGroups.get(chapterKey) || [];
    verses.push(verse);
    verseGroups.set(chapterKey, verses);
  }

  for (const [chapterKey, verses] of [...verseGroups.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const first = verses[0];
    const last = verses[verses.length - 1];
    const reference = Object.freeze({
      book: first.bookId,
      chapterStart: first.chapter,
      verseStart: first.verse,
      verseEnd: last.verse
    });
    const label = `${first.book} ${first.chapter}:${first.verse}-${last.verse}`;
    chunks.push(
      ...chunkDeterministically(
        publicSource({
          documentId: `web-context:${chapterKey}`,
          title: `${first.book} ${first.chapter} context (WEB)`,
          content: verses.map((verse) => `${verse.verse}. ${verse.text}`).join(" "),
          partition: "scripture_context",
          trustLevel: "REVIEWED_SCRIPTURE_CONTEXT",
          sourceId: corpusSourceId,
          sourceVersion: corpus.corpusVersion,
          sourceChecksum: corpusChecksum,
          chunkRole: "source_defined_chapter",
          scriptureCitations: Object.freeze([
            citation(reference, label, corpus.corpusVersion, corpus.translationId)
          ])
        })
      )
    );
  }

  const promisePath = "src/data/promiseClusters.json";
  const promiseChecksum = fileChecksum(promisePath);
  const promises = readJson<readonly Readonly<Record<string, unknown>>[]>(promisePath);
  for (const promise of promises) {
    const id = String(promise.id || promise.cluster_id);
    const labels = Array.isArray(promise.scripture_references)
      ? promise.scripture_references.filter((item): item is string => typeof item === "string")
      : [];
    chunks.push(
      ...chunkDeterministically(
        publicSource({
          documentId: `promise:${id}`,
          title: String(promise.title || promise.name || id),
          content: stableJson(promise),
          partition: "promise_clusters",
          trustLevel: "REVIEWED_TEOYUBE_CONTENT",
          sourceId: promisePath,
          sourceVersion: `sha256:${promiseChecksum}`,
          sourceChecksum: promiseChecksum,
          chunkRole: "reviewed_promise_cluster",
          scriptureCitations: citationsFromLabels(labels, corpus.corpusVersion)
        })
      )
    );
  }

  const vocabularyPaths = [
    "src/data/coreTeoyubeVocabulary.json",
    "src/data/coreTeoyubeVocabulary-part2.json",
    "src/data/coreTeoyubeVocabulary-part3.json"
  ] as const;
  for (const vocabularyPath of vocabularyPaths) {
    const checksum = fileChecksum(vocabularyPath);
    const vocabulary = readJson<readonly Readonly<Record<string, unknown>>[]>(vocabularyPath);
    for (const word of vocabulary) {
      const labels = Array.isArray(word.scripture_sources)
        ? word.scripture_sources.filter((item): item is string => typeof item === "string")
        : [];
      const wordId = String(word.word || word.lexicon_number);
      chunks.push(
        ...chunkDeterministically(
          publicSource({
            documentId: `lexicon:${wordId.toLowerCase()}`,
            title: wordId,
            content: stableJson(word),
            partition: "lexicon",
            trustLevel: "REVIEWED_TEOYUBE_CONTENT",
            sourceId: vocabularyPath,
            sourceVersion: `sha256:${checksum}`,
            sourceChecksum: checksum,
            chunkRole: "reviewed_lexicon_entry",
            scriptureCitations: citationsFromLabels(labels, corpus.corpusVersion)
          })
        )
      );
    }
  }

  const prayerPath = "src/data/prayerEngineTemplates.json";
  const prayerChecksum = fileChecksum(prayerPath);
  const prayers = readJson<readonly Readonly<Record<string, unknown>>[]>(prayerPath);
  for (const prayer of prayers) {
    const anchor = typeof prayer.scriptureAnchor === "string" ? [prayer.scriptureAnchor] : [];
    chunks.push(
      ...chunkDeterministically(
        publicSource({
          documentId: `prayer:${String(prayer.id)}`,
          title: String(prayer.name || prayer.id),
          content: stableJson(prayer),
          partition: "prayer_resources",
          trustLevel: "REVIEWED_TEOYUBE_CONTENT",
          sourceId: prayerPath,
          sourceVersion: `sha256:${prayerChecksum}`,
          sourceChecksum: prayerChecksum,
          chunkRole: "reviewed_prayer_template",
          scriptureCitations: citationsFromLabels(anchor, corpus.corpusVersion)
        })
      )
    );
  }

  const theologyPath = "src/data/theologyConstitution.json";
  const theologyChecksum = fileChecksum(theologyPath);
  const theology = readJson<Readonly<Record<string, unknown>>>(theologyPath);
  for (const section of jsonSections(theology, "theology")) {
    chunks.push(
      ...chunkDeterministically(
        publicSource({
          documentId: section.id,
          title: section.id.replaceAll(".", " / "),
          content: stableJson(section.value),
          partition: "theology_safety",
          trustLevel: "SYSTEM_POLICY_REFERENCE",
          sourceId: theologyPath,
          sourceVersion: `sha256:${theologyChecksum}`,
          sourceChecksum: theologyChecksum,
          chunkRole: "reviewed_theology_policy",
          scriptureCitations: Object.freeze([])
        })
      )
    );
  }

  for (const productPath of [
    "src/data/teoyubeSearchFramework.json",
    "src/data/technicalArchitecture.json",
    "src/data/projectStructureRoadmap.json"
  ]) {
    const checksum = fileChecksum(productPath);
    const product = readJson<unknown>(productPath);
    for (const section of jsonSections(product, `product-help:${path.basename(productPath, ".json")}`)) {
      chunks.push(
        ...chunkDeterministically(
          publicSource({
            documentId: section.id,
            title: section.id.replaceAll(".", " / "),
            content: stableJson(section.value),
            partition: "product_help",
            trustLevel: "REVIEWED_PRODUCT_HELP",
            sourceId: productPath,
            sourceVersion: `sha256:${checksum}`,
            sourceChecksum: checksum,
            chunkRole: "reviewed_product_help",
            scriptureCitations: Object.freeze([])
          })
        )
      );
    }
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
  const indexVersion = `public:${model}:${dimension}:${RETRIEVAL_CHUNKER_VERSION}:${compositeSourceHash.slice(0, 20)}`;
  return Object.freeze({
    inventoryVersion: "teoyube-public-retrieval-inventory-2026-07-23.1",
    generatedAt,
    model,
    dimension,
    chunkerVersion: RETRIEVAL_CHUNKER_VERSION,
    embeddingAdapterVersion: EMBEDDING_ADAPTER_VERSION,
    indexVersion,
    compositeSourceHash,
    sources,
    chunks: ordered,
    totalDocuments: new Set(ordered.map((chunk) => chunk.documentId)).size,
    totalChunks: ordered.length,
    totalEstimatedTokens: ordered.reduce((sum, chunk) => sum + chunk.tokenCount, 0)
  });
}
