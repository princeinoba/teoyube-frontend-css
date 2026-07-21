export type ScriptureBookId = string;
export type ScriptureTranslationId = string;
export type ScriptureCorpusVersion = string;

export type ScriptureDisplayPolicy =
  | "FULL_TEXT_ALLOWED"
  | "REFERENCE_ONLY"
  | "EXCERPT_LIMITED"
  | "DISPLAY_BLOCKED_LICENSE_UNKNOWN";

export type ScriptureCitationValidationStatus = "validated" | "unresolved" | "invalid";

export type ScriptureValidationErrorCode =
  | "unknown_book"
  | "ambiguous_abbreviation"
  | "invalid_chapter"
  | "invalid_verse"
  | "reversed_range"
  | "unsupported_cross_chapter_range"
  | "missing_corpus_coverage"
  | "translation_mismatch"
  | "unresolved_source"
  | "display_blocked_by_license"
  | "quote_mismatch"
  | "query_too_large"
  | "result_limit_exceeded"
  | "index_unavailable";

export type ScriptureValidationError = Readonly<{
  code: ScriptureValidationErrorCode;
  message: string;
  candidates?: readonly ScriptureBookId[];
}>;

export type ScriptureReference = Readonly<{
  book: ScriptureBookId;
  chapterStart: number;
  verseStart?: number;
  chapterEnd?: number;
  verseEnd?: number;
}>;

export type ScriptureReferenceParseResult =
  | Readonly<{
      valid: true;
      originalInput: string;
      reference: ScriptureReference;
      canonicalLabel: string;
      errors: readonly ScriptureValidationError[];
    }>
  | Readonly<{
      valid: false;
      originalInput: string;
      errors: readonly ScriptureValidationError[];
    }>;

export type ScriptureCitation = Readonly<{
  reference: ScriptureReference;
  canonicalLabel: string;
  translationId: ScriptureTranslationId;
  corpusVersion: ScriptureCorpusVersion;
  sourceId: string;
  validationStatus: ScriptureCitationValidationStatus;
}>;

export type ScriptureVerse = Readonly<{
  book: ScriptureBookId;
  chapter: number;
  verse: number;
  text: string;
}>;

export type ScripturePassage = Readonly<{
  citation: ScriptureCitation;
  verses: readonly ScriptureVerse[];
  displayPolicy: ScriptureDisplayPolicy;
  attribution?: string;
  copyrightNotice?: string;
  corpusChecksum: string;
}>;

export type ScriptureContext = Readonly<{
  requested: ScripturePassage;
  before: readonly ScriptureVerse[];
  after: readonly ScriptureVerse[];
  contextKind: "source_defined_passage" | "paragraph" | "chapter_window" | "chapter";
  boundarySource: "corpus_metadata" | "curated_metadata" | "deterministic_fallback";
  limitations: readonly string[];
}>;

export type ScriptureSearchQuery = Readonly<{
  text: string;
  translationId?: ScriptureTranslationId;
  limit?: number;
}>;

export type ScriptureSearchResult = Readonly<{
  citation: ScriptureCitation;
  excerpt?: string;
  score: number;
  matchedTerms: readonly string[];
  limitations: readonly string[];
}>;

export type CitationValidationResult = Readonly<{
  valid: boolean;
  normalizedCitation?: ScriptureCitation;
  exactTextMatch?: boolean;
  errors: readonly ScriptureValidationError[];
}>;

export type ScriptureCorpusAsset = Readonly<{
  path: string;
  sha256: string;
  bytes: number;
  role:
    | "reference_index"
    | "duplicate_reference_index"
    | "interpretation_metadata"
    | "media_metadata_sample"
    | "full_text_excerpt"
    | "source_archive"
    | "normalized_corpus"
    | "lexical_index"
    | "corpus_manifest";
}>;

export type ScriptureCorpusInfo = Readonly<{
  id: string;
  name: string;
  translationId: ScriptureTranslationId;
  translationName: string;
  language: string;
  corpusVersion: ScriptureCorpusVersion;
  source: string;
  sourceVersion: string;
  corpusChecksum: string;
  canonCoverage: string;
  verseCoverage: number;
  referenceCoverage: number;
  attributionRequirements: string;
  copyrightStatus: "public_domain" | "licensed" | "permission_granted" | "unknown" | "not_applicable_reference_only";
  displayPolicy: ScriptureDisplayPolicy;
  fullTextDisplayApproved: boolean;
  readiness: "READY" | "BLOCKED_NO_COMPLETE_APPROVED_FULL_TEXT_CORPUS";
  assets: readonly ScriptureCorpusAsset[];
  limitations: readonly string[];
}>;

export type ScriptureRetrievalOptions = Readonly<{
  translationId?: ScriptureTranslationId;
}>;

export type ScriptureContextOptions = ScriptureRetrievalOptions & Readonly<{
  versesBefore?: number;
  versesAfter?: number;
}>;

export type ScriptureCanonEntry = Readonly<{
  id: string;
  word: string;
  meaning: string;
  category: string;
  scriptureReferences: readonly string[];
  promiseStatement: string;
}>;

export interface ScriptureRepository {
  getCorpusInfo(): Promise<ScriptureCorpusInfo>;
  parseReferences(input: string): readonly ScriptureReferenceParseResult[];
  getByReference(reference: ScriptureReference, options?: ScriptureRetrievalOptions): Promise<ScripturePassage | null>;
  getContext(reference: ScriptureReference, options?: ScriptureContextOptions): Promise<ScriptureContext | null>;
  search(query: ScriptureSearchQuery): Promise<readonly ScriptureSearchResult[]>;
  validateCitation(citation: ScriptureCitation, displayedText?: string): Promise<CitationValidationResult>;

  // Compatibility surface for the approved Canon view. It remains reference-only.
  listCanonEntries(): readonly ScriptureCanonEntry[];
  findCanonEntryById(id: string): ScriptureCanonEntry | undefined;
  findCanonEntriesByReference(reference: string): readonly ScriptureCanonEntry[];
  hasReference(reference: string): boolean;
}
