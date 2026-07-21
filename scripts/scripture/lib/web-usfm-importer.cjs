/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");

const IMPORTER_VERSION = "teoyube-web-usfm-importer-1.0.0";
const CORPUS_VERSION = "engwebp-2020-stable-2026-07-10.p15b.1";
const EXPECTED_ARCHIVE_SHA256 = "4253589697dc6b5e92695655f2f28792d50e7be7b9c8e212af4f4bd18e866c3b";

const BOOKS = Object.freeze([
  ["GEN", "genesis", "Genesis"], ["EXO", "exodus", "Exodus"], ["LEV", "leviticus", "Leviticus"], ["NUM", "numbers", "Numbers"], ["DEU", "deuteronomy", "Deuteronomy"],
  ["JOS", "joshua", "Joshua"], ["JDG", "judges", "Judges"], ["RUT", "ruth", "Ruth"], ["1SA", "1-samuel", "1 Samuel"], ["2SA", "2-samuel", "2 Samuel"],
  ["1KI", "1-kings", "1 Kings"], ["2KI", "2-kings", "2 Kings"], ["1CH", "1-chronicles", "1 Chronicles"], ["2CH", "2-chronicles", "2 Chronicles"], ["EZR", "ezra", "Ezra"],
  ["NEH", "nehemiah", "Nehemiah"], ["EST", "esther", "Esther"], ["JOB", "job", "Job"], ["PSA", "psalms", "Psalms"], ["PRO", "proverbs", "Proverbs"],
  ["ECC", "ecclesiastes", "Ecclesiastes"], ["SNG", "song-of-songs", "Song of Songs"], ["ISA", "isaiah", "Isaiah"], ["JER", "jeremiah", "Jeremiah"], ["LAM", "lamentations", "Lamentations"],
  ["EZK", "ezekiel", "Ezekiel"], ["DAN", "daniel", "Daniel"], ["HOS", "hosea", "Hosea"], ["JOL", "joel", "Joel"], ["AMO", "amos", "Amos"],
  ["OBA", "obadiah", "Obadiah"], ["JON", "jonah", "Jonah"], ["MIC", "micah", "Micah"], ["NAM", "nahum", "Nahum"], ["HAB", "habakkuk", "Habakkuk"],
  ["ZEP", "zephaniah", "Zephaniah"], ["HAG", "haggai", "Haggai"], ["ZEC", "zechariah", "Zechariah"], ["MAL", "malachi", "Malachi"], ["MAT", "matthew", "Matthew"],
  ["MRK", "mark", "Mark"], ["LUK", "luke", "Luke"], ["JHN", "john", "John"], ["ACT", "acts", "Acts"], ["ROM", "romans", "Romans"],
  ["1CO", "1-corinthians", "1 Corinthians"], ["2CO", "2-corinthians", "2 Corinthians"], ["GAL", "galatians", "Galatians"], ["EPH", "ephesians", "Ephesians"], ["PHP", "philippians", "Philippians"],
  ["COL", "colossians", "Colossians"], ["1TH", "1-thessalonians", "1 Thessalonians"], ["2TH", "2-thessalonians", "2 Thessalonians"], ["1TI", "1-timothy", "1 Timothy"], ["2TI", "2-timothy", "2 Timothy"],
  ["TIT", "titus", "Titus"], ["PHM", "philemon", "Philemon"], ["HEB", "hebrews", "Hebrews"], ["JAS", "james", "James"], ["1PE", "1-peter", "1 Peter"],
  ["2PE", "2-peter", "2 Peter"], ["1JN", "1-john", "1 John"], ["2JN", "2-john", "2 John"], ["3JN", "3-john", "3 John"], ["JUD", "jude", "Jude"], ["REV", "revelation", "Revelation"]
].map(([usfmId, id, name]) => Object.freeze({ usfmId, id, name })));

const BOOK_BY_USFM = new Map(BOOKS.map((book) => [book.usfmId, book]));
const APPENDABLE_MARKERS = new Set(["b", "m", "mi", "nb", "p", "pi", "pi1", "q", "q1", "q2", "q3", "q4"]);
const NON_VERSE_MARKERS = new Set(["c", "cl", "d", "h", "id", "ide", "li1", "ms1", "mt1", "mt2", "mt3", "s", "s1", "s2", "sp", "toc1", "toc2", "toc3"]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function stripInlineUsfm(input, warnings, location) {
  let output = input;
  for (const marker of ["f", "x"]) {
    const pattern = new RegExp(`\\\\${marker}\\s[\\s\\S]*?\\\\${marker}\\*`, "g");
    output = output.replace(pattern, "");
    if (new RegExp(`\\\\${marker}(?:\\s|\\*)`).test(output)) warnings.push(`${location}: malformed \\${marker} inline block`);
  }
  output = output.replace(/\\\+?w\s+([^|\\]*?)(?:\|[^\\]*)?\\\+?w\*/g, "$1");
  output = output.replace(/\\(?:wj|qs|bk)\*/g, "").replace(/\\(?:wj|qs|bk)(?:\s+)?/g, "");
  const remaining = [...output.matchAll(/\\([+a-z][+a-z0-9-]*)(\*)?/gi)].map((match) => match[0]);
  if (remaining.length) warnings.push(`${location}: unsupported inline markers ${[...new Set(remaining)].join(", ")}`);
  output = output.replace(/\\[+a-z][+a-z0-9-]*(?:\*)?(?:\s+)?/gi, "");
  return normalizeWhitespace(output);
}

function parseUsfmBook(sourceName, content) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(content);
  if (text.includes("\0")) throw new Error(`${sourceName}: NUL byte detected`);
  const lines = text.replace(/^\ufeff/, "").split(/\r?\n/);
  const idMatch = /^\\id\s+([0-9A-Z]{3})\b/.exec(lines[0] || "");
  if (!idMatch) throw new Error(`${sourceName}: missing first-line USFM id`);
  const book = BOOK_BY_USFM.get(idMatch[1]);
  if (!book) throw new Error(`${sourceName}: ${idMatch[1]} is not in the approved 66-book map`);
  const warnings = [];
  const verses = [];
  const chapters = new Set();
  let chapter = 0;
  let current = null;

  function append(value, lineNumber) {
    if (!value) return;
    if (!current) throw new Error(`${sourceName}:${lineNumber}: verse continuation appears before a verse marker`);
    current.parts.push(value);
  }

  for (let index = 1; index < lines.length; index += 1) {
    const raw = lines[index];
    const lineNumber = index + 1;
    if (!raw.trim()) continue;
    const chapterMatch = /^\\c\s+(\d+)\s*$/.exec(raw.trim());
    if (chapterMatch) {
      chapter = Number(chapterMatch[1]);
      if (chapter < 1) throw new Error(`${sourceName}:${lineNumber}: invalid chapter marker`);
      chapters.add(chapter);
      current = null;
      continue;
    }
    const verseMatch = /^\\v\s+(\d+)\s+([\s\S]*)$/.exec(raw.trim());
    if (verseMatch) {
      if (!chapter) throw new Error(`${sourceName}:${lineNumber}: verse marker appears before a chapter marker`);
      const verse = Number(verseMatch[1]);
      current = { bookId: book.id, book: book.name, usfmBookId: book.usfmId, chapter, verse, parts: [], rawParts: [verseMatch[2]] };
      current.parts.push(stripInlineUsfm(verseMatch[2], warnings, `${sourceName}:${lineNumber}`));
      verses.push(current);
      continue;
    }
    const markerMatch = /^\\([+a-z][+a-z0-9-]*)(?:\s+([\s\S]*))?$/i.exec(raw.trim());
    if (!markerMatch) {
      append(stripInlineUsfm(raw, warnings, `${sourceName}:${lineNumber}`), lineNumber);
      continue;
    }
    const marker = markerMatch[1];
    const markerBody = markerMatch[2] || "";
    if (APPENDABLE_MARKERS.has(marker)) append(stripInlineUsfm(markerBody, warnings, `${sourceName}:${lineNumber}`), lineNumber);
    else if (!NON_VERSE_MARKERS.has(marker)) warnings.push(`${sourceName}:${lineNumber}: unsupported structural marker \\${marker}`);
  }

  const normalized = verses.map((verse) => {
    const verseText = normalizeWhitespace(verse.parts.filter(Boolean).join(" "));
    const sourceFootnoteOnly = !verseText && verse.rawParts.some((part) => /\\f\s/.test(part));
    if (!verseText && !sourceFootnoteOnly) throw new Error(`${sourceName}: importer-created empty verse at ${book.name} ${verse.chapter}:${verse.verse}`);
    return Object.freeze({
      key: `${book.id}.${verse.chapter}.${verse.verse}`,
      bookId: book.id,
      book: book.name,
      usfmBookId: book.usfmId,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verseText || null,
      textStatus: verseText ? "displayable" : "source_footnote_only"
    });
  });
  return Object.freeze({ book, chapters: Object.freeze([...chapters]), verses: Object.freeze(normalized), warnings: Object.freeze(warnings) });
}

function tokenize(value) {
  return [...new Set(value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]+/g) || [])]
    .filter((token) => token.length >= 3);
}

function importWebUsfm(zip, archiveBuffer) {
  const archiveSha256 = sha256(archiveBuffer);
  if (archiveSha256 !== EXPECTED_ARCHIVE_SHA256) throw new Error(`WEB archive SHA-256 mismatch: ${archiveSha256}`);
  const sourceEntries = zip.entries.filter((entry) => /\.usfm$/i.test(entry.name));
  const canonicalEntries = sourceEntries.filter((entry) => !/^(?:00-FRT|106-GLO)/.test(entry.name));
  if (sourceEntries.length !== 68 || canonicalEntries.length !== 66) throw new Error(`Expected 68 USFM sources and 66 canonical books; received ${sourceEntries.length} and ${canonicalEntries.length}`);

  const parsedBooks = canonicalEntries.map((entry) => parseUsfmBook(entry.name, entry.content));
  const seenBooks = new Set(parsedBooks.map((parsed) => parsed.book.usfmId));
  for (const book of BOOKS) if (!seenBooks.has(book.usfmId)) throw new Error(`Missing canonical WEB source book ${book.usfmId}`);
  const verses = parsedBooks.flatMap((parsed) => parsed.verses);
  const keys = new Set();
  for (const verse of verses) {
    if (keys.has(verse.key)) throw new Error(`Duplicate normalized verse key ${verse.key}`);
    keys.add(verse.key);
  }

  const chapterRows = [];
  for (const parsed of parsedBooks) {
    for (const chapter of parsed.chapters) {
      const indexes = verses.map((verse, index) => verse.bookId === parsed.book.id && verse.chapter === chapter ? index : -1).filter((index) => index >= 0);
      if (!indexes.length) throw new Error(`${parsed.book.name} ${chapter}: chapter marker has no verses`);
      chapterRows.push(Object.freeze({ bookId: parsed.book.id, book: parsed.book.name, chapter, startIndex: indexes[0], endIndex: indexes[indexes.length - 1], verseCount: indexes.length }));
    }
  }

  const termMap = new Map();
  verses.forEach((verse, index) => {
    for (const term of tokenize(`${verse.book} ${verse.chapter} ${verse.verse} ${verse.text || ""}`)) {
      const indexes = termMap.get(term) || [];
      indexes.push(index);
      termMap.set(term, indexes);
    }
  });
  const terms = Object.fromEntries([...termMap.entries()].sort(([left], [right]) => left.localeCompare(right)));
  const warnings = parsedBooks.flatMap((parsed) => parsed.warnings);
  const corpus = {
    schemaVersion: 1,
    corpusId: "engwebp",
    translationId: "engwebp",
    translationName: "World English Bible",
    displayAbbreviation: "WEB",
    edition: "Protestant Edition, 2020 stable text",
    language: "en-US",
    canon: "66-book Protestant Old and New Testaments",
    importerVersion: IMPORTER_VERSION,
    corpusVersion: CORPUS_VERSION,
    archiveSha256,
    sourceDate: "2026-07-10",
    generatedAt: "2026-07-20",
    books: BOOKS,
    chapters: chapterRows,
    verses
  };
  const corpusBytes = Buffer.from(`${JSON.stringify(corpus)}\n`, "utf8");
  const corpusChecksum = sha256(corpusBytes);
  const lexicalIndex = {
    schemaVersion: 1,
    corpusId: "engwebp",
    translationId: "engwebp",
    importerVersion: IMPORTER_VERSION,
    corpusVersion: CORPUS_VERSION,
    corpusChecksum,
    generatedAt: "2026-07-20",
    tokenPolicy: "lowercase NFKD ASCII alphanumeric tokens of at least three characters; one posting per verse",
    terms
  };
  const lexicalBytes = Buffer.from(`${JSON.stringify(lexicalIndex)}\n`, "utf8");
  return Object.freeze({
    archiveSha256,
    corpus,
    corpusBytes,
    corpusChecksum,
    lexicalIndex,
    lexicalBytes,
    lexicalChecksum: sha256(lexicalBytes),
    sourceEntries,
    counts: Object.freeze({
      books: parsedBooks.length,
      chapters: chapterRows.length,
      verseMarkers: verses.length,
      displayableVerses: verses.filter((verse) => verse.textStatus === "displayable").length,
      sourceFootnoteOnlyVerseMarkers: verses.filter((verse) => verse.textStatus === "source_footnote_only").length,
      sourceUsfmFiles: sourceEntries.length,
      lexicalTerms: termMap.size
    }),
    warnings: Object.freeze(warnings)
  });
}

module.exports = { BOOKS, CORPUS_VERSION, EXPECTED_ARCHIVE_SHA256, IMPORTER_VERSION, importWebUsfm, parseUsfmBook, sha256 };
