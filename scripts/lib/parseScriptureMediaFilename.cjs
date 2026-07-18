const path = require("path");

const CANONICAL_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Songs", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
  "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
  "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const ALIASES = new Map();

function normalizeWords(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\bfirst\b/g, "1")
    .replace(/\bsecond\b/g, "2")
    .replace(/\bthird\b/g, "3")
    .replace(/\bto\b/g, " ")
    .replace(/[_:-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function addAlias(alias, canonical) {
  ALIASES.set(normalizeWords(alias), canonical);
}

for (const book of CANONICAL_BOOKS) addAlias(book, book);

[
  ["Psalm", "Psalms"], ["Psalms", "Psalms"],
  ["Song of Solomon", "Song of Songs"], ["Canticles", "Song of Songs"],
  ["Revelations", "Revelation"],
  ["First Samuel", "1 Samuel"], ["Second Samuel", "2 Samuel"],
  ["First Kings", "1 Kings"], ["Second Kings", "2 Kings"],
  ["First Chronicles", "1 Chronicles"], ["Second Chronicles", "2 Chronicles"],
  ["First Corinthians", "1 Corinthians"], ["Second Corinthians", "2 Corinthians"],
  ["First Thessalonians", "1 Thessalonians"], ["Second Thessalonians", "2 Thessalonians"],
  ["First Timothy", "1 Timothy"], ["Second Timothy", "2 Timothy"],
  ["First Peter", "1 Peter"], ["Second Peter", "2 Peter"],
  ["First John", "1 John"], ["Second John", "2 John"], ["Third John", "3 John"],
  ["Gen", "Genesis"], ["Exod", "Exodus"], ["Lev", "Leviticus"], ["Num", "Numbers"],
  ["Deut", "Deuteronomy"], ["Josh", "Joshua"], ["Judg", "Judges"], ["Ps", "Psalms"],
  ["Prov", "Proverbs"], ["Eccl", "Ecclesiastes"], ["Isa", "Isaiah"], ["Jer", "Jeremiah"],
  ["Lam", "Lamentations"], ["Ezek", "Ezekiel"], ["Dan", "Daniel"], ["Hos", "Hosea"],
  ["Obad", "Obadiah"], ["Jon", "Jonah"], ["Mic", "Micah"], ["Nah", "Nahum"],
  ["Hab", "Habakkuk"], ["Zeph", "Zephaniah"], ["Hag", "Haggai"], ["Zech", "Zechariah"],
  ["Mal", "Malachi"], ["Matt", "Matthew"], ["Mk", "Mark"], ["Lk", "Luke"],
  ["Jn", "John"], ["Rom", "Romans"], ["Gal", "Galatians"], ["Eph", "Ephesians"],
  ["Phil", "Philippians"], ["Col", "Colossians"], ["Phlm", "Philemon"], ["Heb", "Hebrews"],
  ["Jas", "James"], ["Rev", "Revelation"]
].forEach(([alias, canonical]) => addAlias(alias, canonical));

const AMBIGUOUS_ALIASES = new Set(["job", "mark", "acts", "john", "jude"]);

function normalizeBookName(value) {
  return ALIASES.get(normalizeWords(value)) || "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^$()|[\]{}\\]/g, "\\$&");
}

function findBookCandidate(normalizedSource) {
  const candidates = [...ALIASES.entries()]
    .filter(([alias]) => {
      const escaped = escapeRegExp(alias).replace(/\s+/g, "\\s+");
      return new RegExp(`(?:^|\\s)${escaped}(?=\\s|$)`, "i").test(normalizedSource);
    })
    .sort((left, right) => right[0].length - left[0].length);
  if (!candidates.length) return null;
  const [alias, book] = candidates[0];
  const escaped = escapeRegExp(alias).replace(/\s+/g, "\\s+");
  const match = new RegExp(`(?:^|\\s)(${escaped})(?=\\s|$)`, "i").exec(normalizedSource);
  return { alias, book, index: match ? match.index + match[0].indexOf(match[1]) : 0 };
}

function extractReference(normalizedSource, candidate) {
  const escaped = escapeRegExp(candidate.alias).replace(/\s+/g, "\\s+");
  const afterBook = normalizedSource.slice(candidate.index).replace(new RegExp(`^${escaped}\\s*`, "i"), "");
  const match = afterBook.match(/^(\d{1,3})(?:\s+(\d{1,3})(?:\s+(\d{1,3}))?)?/);
  if (!match) return { chapter: null, verseStart: null, verseEnd: null };
  return {
    chapter: Number(match[1]),
    verseStart: match[2] ? Number(match[2]) : null,
    verseEnd: match[3] ? Number(match[3]) : null
  };
}

function titleFromStem(stem) {
  return stem.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function parseScriptureMediaFilename(fileName, context = {}) {
  const sourceFileName = path.basename(String(fileName || ""));
  const extension = path.extname(sourceFileName).toLowerCase();
  const stem = path.basename(sourceFileName, extension);
  const parentFolders = Array.isArray(context.parentFolders) ? context.parentFolders.filter(Boolean) : [];
  const sidecar = context.sidecarMetadata && typeof context.sidecarMetadata === "object" ? context.sidecarMetadata : null;
  const sources = [
    { kind: "filename", value: stem },
    ...parentFolders.slice(0, 2).map((value, index) => ({ kind: index ? "grandparent_folder" : "parent_folder", value }))
  ];
  const warnings = [];
  const parserReasons = [];
  const inferredTags = [];

  for (const tag of ["short", "animation", "location", "audio", "devotional", "worship", "background", "portrait", "landscape", "long form"]) {
    if (sources.some((source) => normalizeWords(source.value).includes(tag))) inferredTags.push(tag.replace(" ", "-"));
  }

  let detected = null;
  for (const source of sources) {
    const normalized = normalizeWords(source.value);
    const candidate = findBookCandidate(normalized);
    if (!candidate) continue;
    const referenceParts = extractReference(normalized, candidate);
    detected = { ...candidate, ...referenceParts, source: source.kind };
    if (referenceParts.chapter || source.kind === "filename") break;
  }

  const sidecarBook = normalizeBookName(sidecar?.BibleBook || sidecar?.bibleBook || sidecar?.book);
  if (sidecarBook) {
    detected = {
      alias: normalizeWords(sidecarBook),
      book: sidecarBook,
      chapter: Number(sidecar.chapter) || null,
      verseStart: Number(sidecar.verseStart) || null,
      verseEnd: Number(sidecar.verseEnd) || null,
      source: "sidecar_metadata"
    };
    parserReasons.push("Explicit adjacent sidecar metadata supplied the Bible mapping.");
  }

  if (!detected) {
    warnings.push("Bible book was not detected from the filename or adjacent folders.");
    return {
      sourceFileName,
      detectedBook: "",
      normalizedBook: "",
      book: "",
      chapter: null,
      verseStart: null,
      verseEnd: null,
      reference: "",
      probableTitle: titleFromStem(stem),
      inferredTags: [...new Set(inferredTags)],
      parserConfidence: "unknown",
      confidence: "unknown",
      parserReasons,
      warnings
    };
  }

  const { book, chapter, verseStart, verseEnd } = detected;
  if (!chapter) warnings.push("A Bible book was detected, but no chapter was found.");
  if (verseEnd != null && verseStart != null && verseEnd < verseStart) warnings.push("The detected verse range is reversed.");
  if (AMBIGUOUS_ALIASES.has(detected.alias) && detected.source !== "sidecar_metadata" && !chapter) {
    warnings.push("The detected book name is also a common word and requires review.");
  }

  const reference = chapter
    ? `${book} ${chapter}${verseStart ? `:${verseStart}${verseEnd ? `-${verseEnd}` : ""}` : ""}`
    : book;
  let parserConfidence = "needs_review";
  if (detected.source === "sidecar_metadata" && chapter && verseStart) parserConfidence = "confirmed";
  else if (detected.source === "filename" && chapter && verseStart && !(verseEnd != null && verseEnd < verseStart)) parserConfidence = "probable";

  parserReasons.push(
    detected.source === "filename"
      ? "Bible metadata was parsed from the source filename."
      : detected.source === "sidecar_metadata"
        ? "Bible metadata was read from explicit sidecar fields."
        : "Bible metadata was parsed from an adjacent folder name."
  );
  if (parserConfidence !== "confirmed") warnings.push("Owner review is required before this Scripture mapping can be confirmed.");

  return {
    sourceFileName,
    detectedBook: book,
    normalizedBook: book,
    book,
    chapter,
    verseStart,
    verseEnd,
    reference,
    probableTitle: titleFromStem(stem),
    inferredTags: [...new Set(inferredTags)],
    parserConfidence,
    confidence: parserConfidence,
    parserReasons,
    warnings
  };
}

module.exports = {
  CANONICAL_BOOKS,
  normalizeBookName,
  normalizeWords,
  parseScriptureMediaFilename
};
