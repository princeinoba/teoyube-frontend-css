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
  ScriptureValidationErrorCode
} from "../../domain/scripture/scripture-repository";
import registryJson from "./corpus-registry.json";

const MAX_QUERY_LENGTH = 200;
const DEFAULT_RESULT_LIMIT = 20;
const MAX_RESULT_LIMIT = 50;

type SourceCanonEntry = Readonly<{
  id?: string;
  teoyubeWord?: string;
  word?: string;
  meaning?: string;
  category?: string;
  scriptureReferences?: readonly string[];
  promiseStatement?: string;
}>;

type RegistryShape = Readonly<{
  registryVersion: string;
  readiness: "BLOCKED_NO_COMPLETE_APPROVED_FULL_TEXT_CORPUS";
  compositeChecksum: string;
  referenceIndex: Readonly<{
    id: string;
    name: string;
    translationId: string;
    translationName: string;
    language: string;
    corpusVersion: string;
    source: string;
    sourceVersion: string;
    referenceCoverage: number;
    verseCoverage: number;
    canonCoverage: string;
    attributionRequirements: string;
    copyrightStatus: "not_applicable_reference_only";
    displayPolicy: "REFERENCE_ONLY";
    fullTextDisplayApproved: false;
    assets: readonly ScriptureCorpusAsset[];
  }>;
  blockedTextSources: readonly Readonly<{
    id: string;
    translationId: string;
    displayPolicy: "DISPLAY_BLOCKED_LICENSE_UNKNOWN";
  }>[];
  completeApprovedFullTextCorpus: null;
}>;

const registry = registryJson as RegistryShape;

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
  coreVocabularyPart2,
  coreVocabulary,
  prayerEngineTemplates,
  prayers,
  projectStructureRoadmap,
  promiseClusters,
  scriptureCanonJson,
  scriptureGraphRelationships,
  scriptureLinkedArchetypes,
  scriptureLinkedPaths,
  scripturePromiseClusters,
  technicalArchitecture,
  teoyubeSearchFramework,
  teoyubeworldMediaSample,
  tkos,
  tkosEngines,
  words
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

const referenceIndexBuildStartedAt = performance.now();
const referenceLabels = new Set<string>();
for (const source of referenceSources) collectReferenceLabels(source, referenceLabels);
const sortedReferenceLabels = Object.freeze([...referenceLabels].sort((left, right) => left.localeCompare(right)));
const referenceIndexBuildDurationMs = performance.now() - referenceIndexBuildStartedAt;

if (sortedReferenceLabels.length !== registry.referenceIndex.referenceCoverage) {
  throw new Error("The Scripture reference registry coverage does not match the checked local datasets.");
}

function validationError(code: ScriptureValidationErrorCode, message: string): ScriptureValidationError {
  return Object.freeze({ code, message });
}

function citationFor(reference: ScriptureReference): ScriptureCitation {
  return Object.freeze({
    reference,
    canonicalLabel: formatScriptureReference(reference),
    translationId: registry.referenceIndex.translationId,
    corpusVersion: registry.referenceIndex.corpusVersion,
    sourceId: registry.referenceIndex.id,
    validationStatus: "unresolved"
  });
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[\u2013\u2014]/g, "-").replace(/[^a-z0-9]+/g, " ").trim();
}

function searchScore(label: string, query: string, tokens: readonly string[]): number {
  const normalizedLabel = normalizeSearchText(label);
  if (normalizedLabel === query) return 1;
  if (normalizedLabel.includes(query)) return 0.9;
  const matched = tokens.filter((token) => normalizedLabel.includes(token)).length;
  return tokens.length ? matched / tokens.length * 0.8 : 0;
}

export type CanonicalScriptureRepository = ScriptureRepository & Readonly<{
  diagnostics(): Readonly<{
    searches: number;
    cacheHits: number;
    cacheMisses: number;
    cacheEntries: number;
    referenceIndexBuildDurationMs: number;
    rawQueriesLogged: false;
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
        ...registry.referenceIndex,
        corpusChecksum: registry.compositeChecksum,
        assets: Object.freeze([
          ...registry.referenceIndex.assets,
          ...registryJson.blockedTextSources.flatMap((source) => source.assets)
        ] as ScriptureCorpusAsset[]),
        readiness: registry.readiness,
        limitations: Object.freeze([
          "No complete approved local full-text Scripture corpus exists.",
          "The three legacy KJV excerpts are blocked because source-version and display-rights evidence are not recorded.",
          "Positive verse bounds, exact quotation matching, context retrieval, and excerpt search remain unavailable until an approved corpus is supplied."
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
      return parseScriptureReferences(input, { supportsCrossChapterRanges: false });
    },

    async getByReference(reference: ScriptureReference, options?: ScriptureRetrievalOptions): Promise<ScripturePassage | null> {
      void reference;
      void options;
      return null;
    },

    async getContext(reference: ScriptureReference, options?: ScriptureContextOptions): Promise<ScriptureContext | null> {
      void reference;
      void options;
      return null;
    },

    async search(query: ScriptureSearchQuery): Promise<readonly ScriptureSearchResult[]> {
      searches += 1;
      const text = query.text.trim();
      if (text.length > MAX_QUERY_LENGTH) throw new ScriptureRepositoryError("query_too_large", `Scripture search is limited to ${MAX_QUERY_LENGTH} characters.`);
      const limit = query.limit ?? DEFAULT_RESULT_LIMIT;
      if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RESULT_LIMIT) throw new ScriptureRepositoryError("result_limit_exceeded", `Scripture search limits must be between 1 and ${MAX_RESULT_LIMIT}.`);
      if (query.translationId && query.translationId !== registry.referenceIndex.translationId) {
        throw new ScriptureRepositoryError("translation_mismatch", "No approved local text corpus exists for the requested translation.");
      }
      if (!text) return Object.freeze([]);

      const normalizedQuery = normalizeSearchText(text);
      const tokens = Object.freeze(normalizedQuery.split(/\s+/).filter(Boolean));
      const cacheKey = `${registry.referenceIndex.corpusVersion}:${registry.referenceIndex.translationId}:${limit}:${normalizedQuery}`;
      const cached = searchCache.get(cacheKey);
      if (cached) {
        cacheHits += 1;
        return cached;
      }
      cacheMisses += 1;

      const results = sortedReferenceLabels
        .map((label) => ({ label, score: searchScore(label, normalizedQuery, tokens) }))
        .filter((result) => result.score > 0)
        .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label))
        .slice(0, limit)
        .flatMap<ScriptureSearchResult>((result) => {
          const parsed = parseScriptureReference(result.label, { supportsCrossChapterRanges: true });
          if (!parsed.valid) return [];
          return [Object.freeze({
            citation: citationFor(parsed.reference),
            score: result.score,
            matchedTerms: Object.freeze(tokens.filter((token) => normalizeSearchText(result.label).includes(token))),
            limitations: Object.freeze(["Reference-only result. No Scripture text is available for display from an approved local corpus."])
          })];
        });
      const frozen = Object.freeze(results);
      searchCache.set(cacheKey, frozen);
      return frozen;
    },

    async validateCitation(citation: ScriptureCitation, displayedText?: string): Promise<CitationValidationResult> {
      const canonicalLabel = formatScriptureReference(citation.reference);
      const errors: ScriptureValidationError[] = [];
      if (!referenceLabels.has(canonicalLabel)) errors.push(validationError("missing_corpus_coverage", "The reference is not present in the local reference index."));

      const blockedSource = registry.blockedTextSources.find((source) => source.id === citation.sourceId || source.translationId === citation.translationId);
      if (blockedSource) errors.push(validationError("display_blocked_by_license", "The local excerpt source has unknown provenance or display rights and cannot validate rendered text."));
      else if (citation.sourceId !== registry.referenceIndex.id) errors.push(validationError("unresolved_source", "The citation source is not registered."));

      if (citation.translationId !== registry.referenceIndex.translationId && !blockedSource) {
        errors.push(validationError("translation_mismatch", "The citation translation does not match an approved local corpus."));
      }
      if (displayedText !== undefined) {
        errors.push(validationError("quote_mismatch", "Displayed Scripture text cannot be validated because no approved full-text corpus exists."));
      } else {
        errors.push(validationError("missing_corpus_coverage", "Reference metadata exists, but exact verse text and verse-bound metadata are unavailable."));
      }

      return Object.freeze({
        valid: false,
        normalizedCitation: Object.freeze({
          ...citation,
          canonicalLabel,
          validationStatus: "unresolved"
        }),
        ...(displayedText === undefined ? {} : { exactTextMatch: false }),
        errors: Object.freeze([...new Map(errors.map((item) => [item.code, item])).values()])
      });
    },

    listCanonEntries: () => canonEntries,
    findCanonEntryById: (id) => canonEntries.find((entry) => entry.id === id),
    findCanonEntriesByReference: (reference) => canonEntries.filter((entry) => entry.scriptureReferences.includes(reference)),
    hasReference(reference: string): boolean {
      const parsed = parseScriptureReference(reference, { supportsCrossChapterRanges: true });
      return parsed.valid && referenceLabels.has(parsed.canonicalLabel);
    },
    diagnostics: () => Object.freeze({
      searches,
      cacheHits,
      cacheMisses,
      cacheEntries: searchCache.size,
      referenceIndexBuildDurationMs,
      rawQueriesLogged: false as const
    })
  };

  return Object.freeze(repository);
}

export const canonicalScriptureRepository = createCanonicalScriptureRepository();
