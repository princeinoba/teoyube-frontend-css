import type {
  ScriptureReference,
  ScriptureReferenceParseResult,
  ScriptureValidationError
} from "./scripture-repository";

export type ScriptureBookMetadata = Readonly<{
  id: string;
  name: string;
  chapters: number;
  aliases: readonly string[];
}>;

const BOOKS: readonly ScriptureBookMetadata[] = Object.freeze([
  { id: "genesis", name: "Genesis", chapters: 50, aliases: ["Gen", "Ge", "Gn"] },
  { id: "exodus", name: "Exodus", chapters: 40, aliases: ["Exod", "Ex", "Exo"] },
  { id: "leviticus", name: "Leviticus", chapters: 27, aliases: ["Lev", "Le"] },
  { id: "numbers", name: "Numbers", chapters: 36, aliases: ["Num", "Nu"] },
  { id: "deuteronomy", name: "Deuteronomy", chapters: 34, aliases: ["Deut", "Dt"] },
  { id: "joshua", name: "Joshua", chapters: 24, aliases: ["Josh"] },
  { id: "judges", name: "Judges", chapters: 21, aliases: ["Judg", "Jdg"] },
  { id: "ruth", name: "Ruth", chapters: 4, aliases: ["Ru"] },
  { id: "1-samuel", name: "1 Samuel", chapters: 31, aliases: ["1 Sam", "1Sam", "First Samuel"] },
  { id: "2-samuel", name: "2 Samuel", chapters: 24, aliases: ["2 Sam", "2Sam", "Second Samuel"] },
  { id: "1-kings", name: "1 Kings", chapters: 22, aliases: ["1 Kgs", "1Kgs", "First Kings"] },
  { id: "2-kings", name: "2 Kings", chapters: 25, aliases: ["2 Kgs", "2Kgs", "Second Kings"] },
  { id: "1-chronicles", name: "1 Chronicles", chapters: 29, aliases: ["1 Chr", "1 Chron", "1Chr", "First Chronicles"] },
  { id: "2-chronicles", name: "2 Chronicles", chapters: 36, aliases: ["2 Chr", "2 Chron", "2Chr", "Second Chronicles"] },
  { id: "ezra", name: "Ezra", chapters: 10, aliases: ["Ezr"] },
  { id: "nehemiah", name: "Nehemiah", chapters: 13, aliases: ["Neh"] },
  { id: "esther", name: "Esther", chapters: 10, aliases: ["Esth", "Est"] },
  { id: "job", name: "Job", chapters: 42, aliases: [] },
  { id: "psalms", name: "Psalms", chapters: 150, aliases: ["Psalm", "Ps", "Psa"] },
  { id: "proverbs", name: "Proverbs", chapters: 31, aliases: ["Prov", "Pr"] },
  { id: "ecclesiastes", name: "Ecclesiastes", chapters: 12, aliases: ["Eccl", "Ecc"] },
  { id: "song-of-songs", name: "Song of Songs", chapters: 8, aliases: ["Song of Solomon", "Canticles", "Song"] },
  { id: "isaiah", name: "Isaiah", chapters: 66, aliases: ["Isa"] },
  { id: "jeremiah", name: "Jeremiah", chapters: 52, aliases: ["Jer"] },
  { id: "lamentations", name: "Lamentations", chapters: 5, aliases: ["Lam"] },
  { id: "ezekiel", name: "Ezekiel", chapters: 48, aliases: ["Ezek"] },
  { id: "daniel", name: "Daniel", chapters: 12, aliases: ["Dan"] },
  { id: "hosea", name: "Hosea", chapters: 14, aliases: ["Hos"] },
  { id: "joel", name: "Joel", chapters: 3, aliases: [] },
  { id: "amos", name: "Amos", chapters: 9, aliases: [] },
  { id: "obadiah", name: "Obadiah", chapters: 1, aliases: ["Obad"] },
  { id: "jonah", name: "Jonah", chapters: 4, aliases: ["Jon"] },
  { id: "micah", name: "Micah", chapters: 7, aliases: ["Mic"] },
  { id: "nahum", name: "Nahum", chapters: 3, aliases: ["Nah"] },
  { id: "habakkuk", name: "Habakkuk", chapters: 3, aliases: ["Hab"] },
  { id: "zephaniah", name: "Zephaniah", chapters: 3, aliases: ["Zeph"] },
  { id: "haggai", name: "Haggai", chapters: 2, aliases: ["Hag"] },
  { id: "zechariah", name: "Zechariah", chapters: 14, aliases: ["Zech"] },
  { id: "malachi", name: "Malachi", chapters: 4, aliases: ["Mal"] },
  { id: "matthew", name: "Matthew", chapters: 28, aliases: ["Matt", "Mt"] },
  { id: "mark", name: "Mark", chapters: 16, aliases: ["Mk", "Mrk"] },
  { id: "luke", name: "Luke", chapters: 24, aliases: ["Lk"] },
  { id: "john", name: "John", chapters: 21, aliases: ["Jn"] },
  { id: "acts", name: "Acts", chapters: 28, aliases: ["Ac"] },
  { id: "romans", name: "Romans", chapters: 16, aliases: ["Rom", "Ro"] },
  { id: "1-corinthians", name: "1 Corinthians", chapters: 16, aliases: ["1 Cor", "1Cor", "First Corinthians"] },
  { id: "2-corinthians", name: "2 Corinthians", chapters: 13, aliases: ["2 Cor", "2Cor", "Second Corinthians"] },
  { id: "galatians", name: "Galatians", chapters: 6, aliases: ["Gal"] },
  { id: "ephesians", name: "Ephesians", chapters: 6, aliases: ["Eph"] },
  { id: "philippians", name: "Philippians", chapters: 4, aliases: ["Phil", "Php"] },
  { id: "colossians", name: "Colossians", chapters: 4, aliases: ["Col"] },
  { id: "1-thessalonians", name: "1 Thessalonians", chapters: 5, aliases: ["1 Thess", "1 Thes", "1Thess", "First Thessalonians"] },
  { id: "2-thessalonians", name: "2 Thessalonians", chapters: 3, aliases: ["2 Thess", "2 Thes", "2Thess", "Second Thessalonians"] },
  { id: "1-timothy", name: "1 Timothy", chapters: 6, aliases: ["1 Tim", "1Tim", "First Timothy"] },
  { id: "2-timothy", name: "2 Timothy", chapters: 4, aliases: ["2 Tim", "2Tim", "Second Timothy"] },
  { id: "titus", name: "Titus", chapters: 3, aliases: ["Tit"] },
  { id: "philemon", name: "Philemon", chapters: 1, aliases: ["Phlm", "Phm"] },
  { id: "hebrews", name: "Hebrews", chapters: 13, aliases: ["Heb"] },
  { id: "james", name: "James", chapters: 5, aliases: ["Jas"] },
  { id: "1-peter", name: "1 Peter", chapters: 5, aliases: ["1 Pet", "1Pet", "First Peter"] },
  { id: "2-peter", name: "2 Peter", chapters: 3, aliases: ["2 Pet", "2Pet", "Second Peter"] },
  { id: "1-john", name: "1 John", chapters: 5, aliases: ["1 Jn", "1Jn", "First John"] },
  { id: "2-john", name: "2 John", chapters: 1, aliases: ["2 Jn", "2Jn", "Second John"] },
  { id: "3-john", name: "3 John", chapters: 1, aliases: ["3 Jn", "3Jn", "Third John"] },
  { id: "jude", name: "Jude", chapters: 1, aliases: [] },
  { id: "revelation", name: "Revelation", chapters: 22, aliases: ["Rev", "Revelations"] }
]);

const AMBIGUOUS_ALIASES = new Map<string, readonly string[]>([
  ["jo", Object.freeze(["Job", "Joel", "John", "Jonah", "Joshua"])],
  ["j", Object.freeze(["James", "Jeremiah", "Job", "Joel", "John", "Jonah", "Joshua", "Jude", "Judges"])]
]);

function normalizeBookKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bfirst\b/g, "1")
    .replace(/\bsecond\b/g, "2")
    .replace(/\bthird\b/g, "3")
    .replace(/[.]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const BOOK_BY_ALIAS = new Map<string, ScriptureBookMetadata>();
for (const book of BOOKS) {
  for (const alias of [book.name, ...book.aliases]) BOOK_BY_ALIAS.set(normalizeBookKey(alias), book);
}

function error(code: ScriptureValidationError["code"], message: string, candidates?: readonly string[]): ScriptureValidationError {
  return Object.freeze({ code, message, ...(candidates ? { candidates: Object.freeze([...candidates]) } : {}) });
}

function canonicalLabel(reference: ScriptureReference): string {
  if (reference.verseStart === undefined) return `${reference.book} ${reference.chapterStart}`;
  const start = `${reference.book} ${reference.chapterStart}:${reference.verseStart}`;
  if (reference.verseEnd === undefined) return start;
  if ((reference.chapterEnd || reference.chapterStart) === reference.chapterStart) return `${start}-${reference.verseEnd}`;
  return `${start}-${reference.chapterEnd}:${reference.verseEnd}`;
}

export function getApprovedScriptureBookInventory(): readonly ScriptureBookMetadata[] {
  return BOOKS;
}

export function formatScriptureReference(reference: ScriptureReference): string {
  return canonicalLabel(reference);
}

export function splitScriptureReferenceList(input: string): readonly string[] {
  return Object.freeze(input
    .split(/\s*;\s*|\s*,\s*(?=(?:[123]\s*)?[A-Za-z])/)
    .map((part) => part.trim())
    .filter(Boolean));
}

export function parseScriptureReference(
  originalInput: string,
  options: Readonly<{ supportsCrossChapterRanges?: boolean }> = {}
): ScriptureReferenceParseResult {
  const normalized = originalInput
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[;,]+$/, "");

  const match = /^(.+?)\s+(\d{1,3})(?:\s*[:.]\s*(\d{1,3}))?(?:\s*-\s*(?:(\d{1,3})\s*[:.]\s*)?(\d{1,3}))?$/.exec(normalized);
  if (!match) {
    return Object.freeze({ valid: false, originalInput, errors: Object.freeze([error("unknown_book", "The reference does not match the approved book-and-chapter grammar.")]) });
  }

  const bookKey = normalizeBookKey(match[1]);
  const ambiguity = AMBIGUOUS_ALIASES.get(bookKey);
  if (ambiguity) {
    return Object.freeze({ valid: false, originalInput, errors: Object.freeze([error("ambiguous_abbreviation", "The book abbreviation is ambiguous and will not be guessed.", ambiguity)]) });
  }

  const book = BOOK_BY_ALIAS.get(bookKey);
  if (!book) {
    return Object.freeze({ valid: false, originalInput, errors: Object.freeze([error("unknown_book", "The book is not in the approved 66-book inventory.")]) });
  }

  const chapterStart = Number(match[2]);
  const verseStart = match[3] === undefined ? undefined : Number(match[3]);
  const explicitChapterEnd = match[4] === undefined ? undefined : Number(match[4]);
  const verseEnd = match[5] === undefined ? undefined : Number(match[5]);
  const chapterEnd = explicitChapterEnd ?? (verseEnd === undefined ? undefined : chapterStart);
  const errors: ScriptureValidationError[] = [];

  if (chapterStart < 1 || chapterStart > book.chapters) errors.push(error("invalid_chapter", `${book.name} has chapters 1-${book.chapters}.`));
  if (chapterEnd !== undefined && (chapterEnd < 1 || chapterEnd > book.chapters)) errors.push(error("invalid_chapter", `${book.name} has chapters 1-${book.chapters}.`));
  if (verseStart !== undefined && verseStart < 1) errors.push(error("invalid_verse", "Verse numbers must be greater than zero."));
  if (verseEnd !== undefined && verseEnd < 1) errors.push(error("invalid_verse", "Verse numbers must be greater than zero."));
  if (verseEnd !== undefined && verseStart === undefined) errors.push(error("invalid_verse", "A verse range requires a starting verse."));
  if (chapterEnd !== undefined && chapterEnd < chapterStart) errors.push(error("reversed_range", "The ending chapter precedes the starting chapter."));
  if (chapterEnd === chapterStart && verseEnd !== undefined && verseStart !== undefined && verseEnd < verseStart) errors.push(error("reversed_range", "The ending verse precedes the starting verse."));
  if (explicitChapterEnd !== undefined && explicitChapterEnd !== chapterStart && options.supportsCrossChapterRanges !== true) {
    errors.push(error("unsupported_cross_chapter_range", "The active local corpus does not support cross-chapter retrieval."));
  }

  if (errors.length) return Object.freeze({ valid: false, originalInput, errors: Object.freeze(errors) });

  const reference: ScriptureReference = Object.freeze({
    book: book.name,
    chapterStart,
    ...(verseStart === undefined ? {} : { verseStart }),
    ...(chapterEnd === undefined ? {} : { chapterEnd }),
    ...(verseEnd === undefined ? {} : { verseEnd })
  });
  return Object.freeze({ valid: true, originalInput, reference, canonicalLabel: canonicalLabel(reference), errors: Object.freeze([]) });
}

export function parseScriptureReferences(
  input: string,
  options: Readonly<{ supportsCrossChapterRanges?: boolean }> = {}
): readonly ScriptureReferenceParseResult[] {
  const parts = splitScriptureReferenceList(input);
  if (!parts.length) return Object.freeze([parseScriptureReference(input, options)]);
  return Object.freeze(parts.map((part) => parseScriptureReference(part, options)));
}
