import fs from "node:fs";
import path from "node:path";
import coreVocabularyPart2 from "../../data/coreTeoyubeVocabulary-part2.json";
import coreVocabulary from "../../data/coreTeoyubeVocabulary.json";
import prayerEngineTemplates from "../../data/prayerEngineTemplates.json";
import prayers from "../../data/prayers.json";
import projectStructureRoadmap from "../../data/projectStructureRoadmap.json";
import promiseClusters from "../../data/promiseClusters.json";
import scriptureCanonJson from "../../data/scriptureCanon.json";
import scriptureGraphRelationships from "../../data/scriptureGraphRelationships.json";
import scriptureLinkedArchetypes from "../../data/scriptureLinkedArchetypes.json";
import scriptureLinkedPaths from "../../data/scriptureLinkedPaths.json";
import scripturePromiseClusters from "../../data/scripturePromiseClusters.json";
import technicalArchitecture from "../../data/technicalArchitecture.json";
import teoyubeSearchFramework from "../../data/teoyubeSearchFramework.json";
import teoyubeworldMediaSample from "../../data/teoyubeworld-media-manifest.sample.json";
import tkos from "../../data/tkos.json";
import tkosEngines from "../../data/tkosEngines.json";
import words from "../../data/words.json";
import {
  formatScriptureReference,
  parseScriptureReference,
  parseScriptureReferences
} from "../../domain/scripture/scripture-reference-parser";
import type {
  CitationValidationResult,
  ScriptureCanonEntry,
  ScriptureCitation,
  ScriptureContext,
  ScriptureContextOptions,
  ScriptureCorpusAsset,
  ScriptureCorpusInfo,
  ScripturePassage,
  ScriptureReference,
  ScriptureReferenceParseResult,
  ScriptureRepository,
  ScriptureRetrievalOptions,
  ScriptureSearchQuery,
  ScriptureSearchResult,
  ScriptureValidationError,
  ScriptureValidationErrorCode,
  ScriptureVerse
} from "../../domain/scripture/scripture-repository";
import registryJson from "./corpus-registry.json";

const MAX_QUERY_LENGTH = 200;
const DEFAULT_RESULT_LIMIT = 20;
const MAX_RESULT_LIMIT = 50;
const MAX_CONTEXT_WINDOW = 20;

type SourceCanonEntry = Readonly<{
  id?: string;
  teoyubeWord?: string;
  word?: string;
  meaning?: string;
  category?: string;
  scriptureReferences?: readonly string[];
  promiseStatement?: string;
}>;

type CorpusVerseRow = Readonly<{
  key: string;
  bookId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string | null;
  textStatus: "displayable" | "source_footnote_only";
}>;

type CorpusShape = Readonly<{
  corpusId: "engwebp";
  translationId: "engwebp";
  translationName: "World English Bible";
  displayAbbreviation: "WEB";
  corpusVersion: string;
  books: readonly Readonly<{ id: string; name: string }>[];
  verses: readonly CorpusVerseRow[];
}>;

type LexicalIndexShape = Readonly<{
  corpusChecksum: string;
  corpusVersion: string;
  terms: Readonly<Record<string, readonly number[]>>;
}>;

type RegistryShape = Readonly<{
  registryVersion: string;
  readiness: "READY";
  compositeChecksum: string;
  referenceIndex: Readonly<{ assets: readonly ScriptureCorpusAsset[] }>;
  activeCorpus: Readonly<{
    id: "engwebp";
    name: string;
    translationId: "engwebp";
    translationName: "World English Bible";
    language: string;
    corpusVersion: string;
    source: string;
    sourceVersion: string;
    corpusChecksum: string;
    canonCoverage: string;
    verseCoverage: number;
    referenceCoverage: number;
    attributionRequirements: string;
    copyrightStatus: "public_domain";
    displayPolicy: "FULL_TEXT_ALLOWED";
    fullTextDisplayApproved: true;
    readiness: "READY";
    assets: readonly ScriptureCorpusAsset[];
    limitations: readonly string[];
  }>;
  blockedTextSources: readonly Readonly<{
    id: string;
    translationId: string;
    displayPolicy: "DISPLAY_BLOCKED_LICENSE_UNKNOWN";
    fullTextDisplayApproved: false;
    assets: readonly ScriptureCorpusAsset[];
  }>[];
  completeApprovedFullTextCorpus: "engwebp";
}>;

const generatedCorpusRoot = path.join(process.cwd(), "src", "server", "scripture", "corpora", "engwebp", "generated");
function readFixedGeneratedJson<T>(fileName: "corpus.json" | "lexical-index.json" | "manifest.json"): T {
  return JSON.parse(fs.readFileSync(path.join(generatedCorpusRoot, fileName), "utf8")) as T;
}
const corpus = readFixedGeneratedJson<CorpusShape>("corpus.json");
const lexicalIndex = readFixedGeneratedJson<LexicalIndexShape>("lexical-index.json");
const corpusManifest = readFixedGeneratedJson<Readonly<{ generatedChecksum: string }>>("manifest.json");
const registry = registryJson as unknown as RegistryShape;

if (corpus.corpusVersion !== registry.activeCorpus.corpusVersion || lexicalIndex.corpusVersion !== corpus.corpusVersion) {
  throw new Error("The active WEB corpus, lexical index, and registry versions do not agree.");
}
if (lexicalIndex.corpusChecksum !== registry.activeCorpus.corpusChecksum) {
  throw new Error("The active WEB lexical index is not bound to the registered corpus checksum.");
}

export class ScriptureRepositoryError extends Error {
  readonly code: ScriptureValidationErrorCode;

  constructor(code: ScriptureValidationErrorCode, message: string) {
    super(message);
    this.name = "ScriptureRepositoryError";
    this.code = code;
  }
}

const canonEntries: readonly ScriptureCanonEntry[] = Object.freeze(
  (scriptureCanonJson as readonly SourceCanonEntry[]).map((entry, index) => Object.freeze({
    id: entry.id || `scripture-canon-${index + 1}`,
    word: entry.teoyubeWord || entry.word || "",
    meaning: entry.meaning || "",
    category: entry.category || "",
    scriptureReferences: Object.freeze([...(entry.scriptureReferences || [])]),
    promiseStatement: entry.promiseStatement || ""
  }))
);

const referenceSources: readonly unknown[] = Object.freeze([
  coreVocabularyPart2, coreVocabulary, prayerEngineTemplates, prayers, projectStructureRoadmap,
  promiseClusters, scriptureCanonJson, scriptureGraphRelationships, scriptureLinkedArchetypes,
  scriptureLinkedPaths, scripturePromiseClusters, technicalArchitecture, teoyubeSearchFramework,
  teoyubeworldMediaSample, tkos, tkosEngines, words
]);

function collectReferenceLabels(value: unknown, labels: Set<string>): void {
  if (Array.isArray(value)) {
    for (const child of value) collectReferenceLabels(child, labels);
    return;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value as Readonly<Record<string, unknown>>)) collectReferenceLabels(child, labels);
    return;
  }
  if (typeof value !== "string" || value.length > 80 || !/\d/.test(value)) return;
  const parsed = parseScriptureReference(value, { supportsCrossChapterRanges: true });
  if (parsed.valid) labels.add(parsed.canonicalLabel);
}

const indexBuildStartedAt = performance.now();
const referenceLabels = new Set<string>();
for (const source of referenceSources) collectReferenceLabels(source, referenceLabels);
const bookIdByName = new Map(corpus.books.map((book) => [book.name, book.id]));
const chaptersByBook = new Map<string, Map<number, readonly CorpusVerseRow[]>>();
corpus.verses.forEach((verse) => {
  const chapters = chaptersByBook.get(verse.bookId) || new Map<number, readonly CorpusVerseRow[]>();
  const rows = chapters.get(verse.chapter) || [];
  chapters.set(verse.chapter, Object.freeze([...rows, verse]));
  chaptersByBook.set(verse.bookId, chapters);
});
const referenceIndexBuildDurationMs = performance.now() - indexBuildStartedAt;

function validationError(code: ScriptureValidationErrorCode, message: string): ScriptureValidationError {
  return Object.freeze({ code, message });
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function searchTokens(value: string): readonly string[] {
  return Object.freeze([...new Set(value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]+/g) || [])]
    .filter((token) => token.length >= 3));
}

function ensureTranslation(translationId: string | undefined): void {
  if (translationId && translationId !== corpus.translationId) {
    throw new ScriptureRepositoryError("translation_mismatch", "The requested translation is not the active owner-approved WEB corpus.");
  }
}

function citationFor(reference: ScriptureReference): ScriptureCitation {
  return Object.freeze({
    reference,
    canonicalLabel: formatScriptureReference(reference),
    translationId: corpus.translationId,
    corpusVersion: corpus.corpusVersion,
    sourceId: registry.activeCorpus.id,
    validationStatus: "validated"
  });
}

function publicVerse(row: CorpusVerseRow): ScriptureVerse | null {
  if (row.text === null || row.textStatus !== "displayable") return null;
  return Object.freeze({ book: row.book, chapter: row.chapter, verse: row.verse, text: row.text });
}

function rowsFor(reference: ScriptureReference): readonly CorpusVerseRow[] {
  const bookId = bookIdByName.get(reference.book);
  if (!bookId) return Object.freeze([]);
  const chapterEnd = reference.chapterEnd || reference.chapterStart;
  const rows: CorpusVerseRow[] = [];
  for (let chapter = reference.chapterStart; chapter <= chapterEnd; chapter += 1) {
    const chapterRows = chaptersByBook.get(bookId)?.get(chapter) || [];
    for (const row of chapterRows) {
      if (chapter === reference.chapterStart && reference.verseStart !== undefined && row.verse < reference.verseStart) continue;
      if (chapterEnd === reference.chapterStart && reference.verseStart !== undefined && reference.verseEnd === undefined && row.verse > reference.verseStart) continue;
      if (chapter === chapterEnd && reference.verseEnd !== undefined && row.verse > reference.verseEnd) continue;
      rows.push(row);
    }
  }
  if (reference.verseStart !== undefined && !rows.some((row) => row.chapter === reference.chapterStart && row.verse === reference.verseStart)) return Object.freeze([]);
  if (reference.verseEnd !== undefined && !rows.some((row) => row.chapter === chapterEnd && row.verse === reference.verseEnd)) return Object.freeze([]);
  return Object.freeze(rows);
}

function passageFor(reference: ScriptureReference): ScripturePassage | null {
  const sourceRows = rowsFor(reference);
  if (!sourceRows.length) return null;
  const verses = sourceRows.map(publicVerse).filter((verse): verse is ScriptureVerse => verse !== null);
  if (!verses.length) return null;
  return Object.freeze({
    citation: citationFor(reference),
    verses: Object.freeze(verses),
    displayPolicy: "FULL_TEXT_ALLOWED",
    attribution: "World English Bible (WEB), Public Domain",
    copyrightNotice: "World English Bible text is public domain. The name is reserved for faithful copies; Teoyube displays the corpus wording without alteration.",
    corpusChecksum: registry.activeCorpus.corpusChecksum
  });
}

function referenceForRow(row: CorpusVerseRow): ScriptureReference {
  return Object.freeze({ book: row.book, chapterStart: row.chapter, verseStart: row.verse });
}

export type CanonicalScriptureRepository = ScriptureRepository & Readonly<{
  diagnostics(): Readonly<{
    searches: number;
    cacheHits: number;
    cacheMisses: number;
    cacheEntries: number;
    referenceIndexBuildDurationMs: number;
    rawQueriesLogged: false;
    corpusVersion: string;
    generatedChecksum: string;
  }>;
}>;

export function createCanonicalScriptureRepository(): CanonicalScriptureRepository {
  const searchCache = new Map<string, readonly ScriptureSearchResult[]>();
  let searches = 0;
  let cacheHits = 0;
  let cacheMisses = 0;

  const repository: CanonicalScriptureRepository = {
    async getCorpusInfo(): Promise<ScriptureCorpusInfo> {
      return Object.freeze({
        ...registry.activeCorpus,
        assets: Object.freeze([
          ...registry.activeCorpus.assets,
          ...registry.referenceIndex.assets,
          ...registry.blockedTextSources.flatMap((source) => source.assets)
        ])
      });
    },

    parseReferences(input: string): readonly ScriptureReferenceParseResult[] {
      if (input.length > MAX_QUERY_LENGTH) {
        return Object.freeze([Object.freeze({
          valid: false as const,
          originalInput: "",
          errors: Object.freeze([validationError("query_too_large", `Scripture references are limited to ${MAX_QUERY_LENGTH} characters.`)])
        })]);
      }
      return parseScriptureReferences(input, { supportsCrossChapterRanges: true });
    },

    async getByReference(reference: ScriptureReference, options?: ScriptureRetrievalOptions): Promise<ScripturePassage | null> {
      ensureTranslation(options?.translationId);
      return passageFor(reference);
    },

    async getContext(reference: ScriptureReference, options?: ScriptureContextOptions): Promise<ScriptureContext | null> {
      ensureTranslation(options?.translationId);
      const beforeCount = options?.versesBefore ?? 3;
      const afterCount = options?.versesAfter ?? 3;
      if (!Number.isInteger(beforeCount) || !Number.isInteger(afterCount) || beforeCount < 0 || afterCount < 0 || beforeCount > MAX_CONTEXT_WINDOW || afterCount > MAX_CONTEXT_WINDOW) {
        throw new ScriptureRepositoryError("result_limit_exceeded", `Scripture context windows must be integers from 0 to ${MAX_CONTEXT_WINDOW}.`);
      }
      const requested = passageFor(reference);
      if (!requested) return null;
      const bookId = bookIdByName.get(reference.book);
      if (!bookId) return null;
      const chapterRows = chaptersByBook.get(bookId)?.get(reference.chapterStart) || [];
      const displayable = chapterRows.filter((row) => row.textStatus === "displayable");
      const firstVerse = requested.verses[0]?.verse;
      const lastVerse = requested.verses[requested.verses.length - 1]?.verse;
      const firstIndex = displayable.findIndex((row) => row.verse === firstVerse);
      const lastIndex = displayable.findIndex((row) => row.verse === lastVerse);
      const before = displayable.slice(Math.max(0, firstIndex - beforeCount), Math.max(0, firstIndex)).map(publicVerse).filter((verse): verse is ScriptureVerse => verse !== null);
      const after = displayable.slice(lastIndex + 1, lastIndex + 1 + afterCount).map(publicVerse).filter((verse): verse is ScriptureVerse => verse !== null);
      return Object.freeze({
        requested,
        before: Object.freeze(before),
        after: Object.freeze(after),
        contextKind: "chapter_window",
        boundarySource: "deterministic_fallback",
        limitations: Object.freeze(["The source USFM paragraph markers are separated from verse wording; this context is a bounded same-chapter verse window, not an inferred paragraph."])
      });
    },

    async search(query: ScriptureSearchQuery): Promise<readonly ScriptureSearchResult[]> {
      searches += 1;
      ensureTranslation(query.translationId);
      const text = query.text.trim();
      if (text.length > MAX_QUERY_LENGTH) throw new ScriptureRepositoryError("query_too_large", `Scripture search is limited to ${MAX_QUERY_LENGTH} characters.`);
      const limit = query.limit ?? DEFAULT_RESULT_LIMIT;
      if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RESULT_LIMIT) throw new ScriptureRepositoryError("result_limit_exceeded", `Scripture search limits must be between 1 and ${MAX_RESULT_LIMIT}.`);
      if (!text) return Object.freeze([]);
      const cacheKey = `${corpus.corpusVersion}:${registry.activeCorpus.corpusChecksum}:${limit}:${normalizeText(text).toLowerCase()}`;
      const cached = searchCache.get(cacheKey);
      if (cached) {
        cacheHits += 1;
        return cached;
      }
      cacheMisses += 1;

      const exact = parseScriptureReference(text, { supportsCrossChapterRanges: true });
      if (exact.valid) {
        const passage = passageFor(exact.reference);
        const results = passage ? Object.freeze([Object.freeze({
          citation: passage.citation,
          excerpt: passage.verses.map((verse) => verse.text).join(" "),
          score: 1,
          matchedTerms: Object.freeze([exact.canonicalLabel]),
          limitations: Object.freeze([])
        })]) : Object.freeze([]);
        searchCache.set(cacheKey, results);
        return results;
      }

      const tokens = searchTokens(text);
      const scores = new Map<number, number>();
      for (const token of tokens) {
        for (const index of lexicalIndex.terms[token] || []) scores.set(index, (scores.get(index) || 0) + 1);
      }
      const results = [...scores.entries()]
        .map(([index, matched]) => ({ index, matched, row: corpus.verses[index] }))
        .filter((entry): entry is { index: number; matched: number; row: CorpusVerseRow } => Boolean(entry.row?.text))
        .sort((left, right) => right.matched - left.matched || left.index - right.index)
        .slice(0, limit)
        .map<ScriptureSearchResult>((entry) => Object.freeze({
          citation: citationFor(referenceForRow(entry.row)),
          excerpt: entry.row.text || undefined,
          score: tokens.length ? entry.matched / tokens.length : 0,
          matchedTerms: Object.freeze(tokens.filter((token) => (lexicalIndex.terms[token] || []).includes(entry.index))),
          limitations: Object.freeze([])
        }));
      const frozen = Object.freeze(results);
      searchCache.set(cacheKey, frozen);
      return frozen;
    },

    async validateCitation(citation: ScriptureCitation, displayedText?: string): Promise<CitationValidationResult> {
      const canonicalLabel = formatScriptureReference(citation.reference);
      const errors: ScriptureValidationError[] = [];
      const blocked = registry.blockedTextSources.find((source) => source.id === citation.sourceId || source.translationId === citation.translationId);
      if (blocked) errors.push(validationError("display_blocked_by_license", "The legacy excerpt source remains blocked and is not WEB."));
      else {
        if (citation.sourceId !== registry.activeCorpus.id) errors.push(validationError("unresolved_source", "The citation source is not the active owner-approved WEB corpus."));
        if (citation.translationId !== corpus.translationId) errors.push(validationError("translation_mismatch", "The citation translation is not engwebp."));
        if (citation.corpusVersion !== corpus.corpusVersion) errors.push(validationError("unresolved_source", "The citation corpus version does not match the active WEB corpus."));
      }
      const passage = passageFor(citation.reference);
      if (!passage) errors.push(validationError("missing_corpus_coverage", "The cited source span has no displayable wording in the selected WEB source."));
      const expected = passage?.verses.map((verse) => verse.text).join(" ");
      const exactTextMatch = displayedText === undefined ? undefined : Boolean(expected && normalizeText(displayedText) === normalizeText(expected));
      if (displayedText !== undefined && !exactTextMatch) errors.push(validationError("quote_mismatch", "Displayed wording does not exactly match the active WEB corpus span."));
      const valid = errors.length === 0;
      return Object.freeze({
        valid,
        normalizedCitation: Object.freeze({
          ...citation,
          canonicalLabel,
          translationId: corpus.translationId,
          corpusVersion: corpus.corpusVersion,
          sourceId: registry.activeCorpus.id,
          validationStatus: valid ? "validated" : "invalid"
        }),
        ...(exactTextMatch === undefined ? {} : { exactTextMatch }),
        errors: Object.freeze(errors)
      });
    },

    listCanonEntries: () => canonEntries,
    findCanonEntryById: (id) => canonEntries.find((entry) => entry.id === id),
    findCanonEntriesByReference: (reference) => canonEntries.filter((entry) => entry.scriptureReferences.includes(reference)),
    hasReference(reference: string): boolean {
      const parsed = parseScriptureReference(reference, { supportsCrossChapterRanges: true });
      return parsed.valid && passageFor(parsed.reference) !== null;
    },
    diagnostics: () => Object.freeze({
      searches,
      cacheHits,
      cacheMisses,
      cacheEntries: searchCache.size,
      referenceIndexBuildDurationMs,
      rawQueriesLogged: false as const,
      corpusVersion: corpus.corpusVersion,
      generatedChecksum: corpusManifest.generatedChecksum
    })
  };

  if (referenceLabels.size !== registry.activeCorpus.referenceCoverage) {
    throw new Error("The registered Teoyube reference coverage does not match the deterministic local reference inventory.");
  }
  return Object.freeze(repository);
}

export const canonicalScriptureRepository = createCanonicalScriptureRepository();
