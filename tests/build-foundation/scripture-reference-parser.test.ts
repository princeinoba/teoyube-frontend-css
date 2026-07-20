import { describe, expect, it } from "vitest";
import {
  formatScriptureReference,
  getApprovedScriptureBookInventory,
  parseScriptureReference,
  parseScriptureReferences
} from "../../src/domain/scripture/scripture-reference-parser";

describe("Scripture reference parser", () => {
  it("parses every approved canonical book name", () => {
    const books = getApprovedScriptureBookInventory();
    expect(books).toHaveLength(66);
    for (const book of books) {
      const result = parseScriptureReference(`${book.name} 1:1`);
      expect(result.valid, book.name).toBe(true);
      if (result.valid) expect(result.canonicalLabel).toBe(`${book.name} 1:1`);
    }
  });

  it("parses every approved common abbreviation without guessing", () => {
    for (const book of getApprovedScriptureBookInventory()) {
      for (const alias of book.aliases) {
        const result = parseScriptureReference(`${alias} 1:1`);
        expect(result.valid, `${alias} -> ${book.name}`).toBe(true);
        if (result.valid) expect(result.reference.book).toBe(book.name);
      }
    }
    expect(parseScriptureReference("First John 1:1")).toMatchObject({ valid: true, canonicalLabel: "1 John 1:1" });
    expect(parseScriptureReference("2Cor. 5:17")).toMatchObject({ valid: true, canonicalLabel: "2 Corinthians 5:17" });
  });

  it("normalizes chapter, verse, range, punctuation, dash, and whitespace forms", () => {
    expect(parseScriptureReference("  Ephesians   1  ")).toMatchObject({ valid: true, canonicalLabel: "Ephesians 1" });
    expect(parseScriptureReference("John 3.16")).toMatchObject({ valid: true, canonicalLabel: "John 3:16" });
    expect(parseScriptureReference("Proverbs 3:5–6")).toMatchObject({ valid: true, canonicalLabel: "Proverbs 3:5-6" });
    expect(parseScriptureReference("Proverbs 3:5—6")).toMatchObject({ valid: true, canonicalLabel: "Proverbs 3:5-6" });
    const crossChapter = parseScriptureReference("John 3:36-4:2", { supportsCrossChapterRanges: true });
    expect(crossChapter).toMatchObject({ valid: true, canonicalLabel: "John 3:36-4:2" });
    if (crossChapter.valid) expect(formatScriptureReference(crossChapter.reference)).toBe("John 3:36-4:2");
  });

  it("splits semicolon and book-prefixed comma lists while preserving each original part", () => {
    const results = parseScriptureReferences("Ephesians 1:18; James 1:5, Proverbs 3:5-6");
    expect(results).toHaveLength(3);
    expect(results.map((result) => result.valid ? result.canonicalLabel : "invalid")).toEqual([
      "Ephesians 1:18",
      "James 1:5",
      "Proverbs 3:5-6"
    ]);
  });

  it("returns typed failures for ambiguity, bounds, reversal, unsupported ranges, and unknown books", () => {
    expect(parseScriptureReference("Jo 1:1")).toMatchObject({
      valid: false,
      errors: [{ code: "ambiguous_abbreviation", candidates: ["Job", "Joel", "John", "Jonah", "Joshua"] }]
    });
    expect(parseScriptureReference("Unknown 1:1")).toMatchObject({ valid: false, errors: [{ code: "unknown_book" }] });
    expect(parseScriptureReference("John 0:1")).toMatchObject({ valid: false, errors: [{ code: "invalid_chapter" }] });
    expect(parseScriptureReference("John 22:1")).toMatchObject({ valid: false, errors: [{ code: "invalid_chapter" }] });
    expect(parseScriptureReference("John 3:0")).toMatchObject({ valid: false, errors: [{ code: "invalid_verse" }] });
    expect(parseScriptureReference("John 3:18-16")).toMatchObject({ valid: false, errors: [{ code: "reversed_range" }] });
    expect(parseScriptureReference("John 4:2-3:16", { supportsCrossChapterRanges: true })).toMatchObject({ valid: false, errors: [{ code: "reversed_range" }] });
    expect(parseScriptureReference("John 3:36-4:2")).toMatchObject({ valid: false, errors: [{ code: "unsupported_cross_chapter_range" }] });
  });
});
