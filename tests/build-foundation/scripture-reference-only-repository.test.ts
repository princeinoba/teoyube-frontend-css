import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { ScriptureCitation } from "../../src/domain/scripture/scripture-repository";
import {
  createCanonicalScriptureRepository,
  ScriptureRepositoryError
} from "../../src/server/scripture/canonical-scripture-repository";

const root = process.cwd();
const inventory = JSON.parse(fs.readFileSync(path.join(root, "docs/scripture/legacy-quotation-owner-review.json"), "utf8")) as {
  visibleProductRecords: readonly { id: string; reference: string; exactWebText: string; currentText: string }[];
};

function webCitation(overrides: Partial<ScriptureCitation> = {}): ScriptureCitation {
  return {
    reference: { book: "Ephesians", chapterStart: 1, verseStart: 18 },
    canonicalLabel: "Ephesians 1:18",
    translationId: "engwebp",
    corpusVersion: "engwebp-2020-stable-2026-07-10.p15b.1",
    sourceId: "engwebp",
    validationStatus: "validated",
    ...overrides
  };
}

describe("canonical WEB Scripture repository", () => {
  it("reports the verified full-text corpus and licensing decision", async () => {
    const info = await createCanonicalScriptureRepository().getCorpusInfo();
    expect(info).toMatchObject({
      id: "engwebp",
      translationId: "engwebp",
      translationName: "World English Bible",
      corpusVersion: "engwebp-2020-stable-2026-07-10.p15b.1",
      corpusChecksum: "6e6b3f95b5d61c83c06534ee4281f10b6e4e02c878b75141dcdd4403bf42d77f",
      referenceCoverage: 356,
      verseCoverage: 31098,
      displayPolicy: "FULL_TEXT_ALLOWED",
      fullTextDisplayApproved: true,
      readiness: "READY",
      copyrightStatus: "public_domain"
    });
    expect(info.assets).toHaveLength(22);
    expect(info.limitations.join(" ")).toContain("PGP signature verification was not performed");
  });

  it("retrieves exact verses, ranges, chapters, and supported cross-chapter ranges", async () => {
    const repository = createCanonicalScriptureRepository();
    const ephesians = repository.parseReferences("Eph. 1:18")[0];
    expect(ephesians?.valid).toBe(true);
    if (!ephesians?.valid) return;
    await expect(repository.getByReference(ephesians.reference)).resolves.toMatchObject({
      citation: { canonicalLabel: "Ephesians 1:18", translationId: "engwebp", sourceId: "engwebp", validationStatus: "validated" },
      verses: [{ text: "having the eyes of your hearts enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints," }],
      displayPolicy: "FULL_TEXT_ALLOWED"
    });
    const range = repository.parseReferences("Proverbs 3:5-6")[0];
    const chapter = repository.parseReferences("Psalm 117")[0];
    const crossChapter = repository.parseReferences("John 3:36-4:2")[0];
    expect(range?.valid && (await repository.getByReference(range.reference))?.verses).toHaveLength(2);
    expect(chapter?.valid && (await repository.getByReference(chapter.reference))?.verses).toHaveLength(2);
    expect(crossChapter?.valid && (await repository.getByReference(crossChapter.reference))?.verses).toHaveLength(3);
  });

  it("returns honest bounded same-chapter context", async () => {
    const repository = createCanonicalScriptureRepository();
    const parsed = repository.parseReferences("Psalm 121:7")[0];
    if (!parsed?.valid) throw new Error("test reference did not parse");
    const context = await repository.getContext(parsed.reference, { versesBefore: 2, versesAfter: 1 });
    expect(context).toMatchObject({ contextKind: "chapter_window", boundarySource: "deterministic_fallback" });
    expect(context?.before).toHaveLength(2);
    expect(context?.after).toHaveLength(1);
    expect(context?.limitations.join(" ")).toContain("not an inferred paragraph");
  });

  it("provides deterministic version-aware exact-reference and lexical search", async () => {
    const repository = createCanonicalScriptureRepository();
    const exact = await repository.search({ text: "Ephesians 1:18", limit: 5 });
    const lexical = await repository.search({ text: "lamp feet path", limit: 5 });
    expect(exact[0]).toMatchObject({ citation: { canonicalLabel: "Ephesians 1:18", validationStatus: "validated" }, score: 1 });
    expect(exact[0]?.excerpt).toContain("eyes of your hearts enlightened");
    expect(lexical.some((result) => result.citation.canonicalLabel === "Psalms 119:105" || result.citation.canonicalLabel === "Psalm 119:105")).toBe(true);
    expect(await repository.search({ text: "lamp feet path", limit: 5 })).toEqual(lexical);
    expect(repository.diagnostics()).toMatchObject({ searches: 3, cacheHits: 1, cacheMisses: 2, rawQueriesLogged: false });
  });

  it("validates exact WEB wording and blocks mismatch or unknown legacy sources", async () => {
    const repository = createCanonicalScriptureRepository();
    const exactText = inventory.visibleProductRecords.find((record) => record.id === "UI-CANON-001")?.exactWebText || "";
    await expect(repository.validateCitation(webCitation(), exactText)).resolves.toMatchObject({ valid: true, exactTextMatch: true, errors: [] });
    const mismatch = await repository.validateCitation(webCitation(), "legacy wording");
    expect(mismatch).toMatchObject({ valid: false, exactTextMatch: false });
    expect(mismatch.errors.map((error) => error.code)).toContain("quote_mismatch");
    const legacy = await repository.validateCitation(webCitation({ translationId: "KJV", sourceId: "legacy-tig-kjv-excerpts", corpusVersion: "unknown" }), "legacy wording");
    expect(legacy.errors.map((error) => error.code)).toEqual(expect.arrayContaining(["display_blocked_by_license", "quote_mismatch"]));
  });

  it("resolves and hash-binds all 17 owner decisions to exact corpus wording", async () => {
    const repository = createCanonicalScriptureRepository();
    expect(inventory.visibleProductRecords).toHaveLength(17);
    for (const record of inventory.visibleProductRecords) {
      const parsed = repository.parseReferences(record.reference)[0];
      expect(parsed?.valid, record.id).toBe(true);
      if (!parsed?.valid) continue;
      const passage = await repository.getByReference(parsed.reference);
      const text = passage?.verses.map((verse) => verse.text).join(" ");
      expect(text, record.id).toBe(record.exactWebText);
      expect(crypto.createHash("sha256").update(text || "").digest("hex"), record.id).not.toBe(crypto.createHash("sha256").update(record.currentText).digest("hex"));
      await expect(repository.validateCitation(passage!.citation, record.exactWebText), record.id).resolves.toMatchObject({ valid: true, exactTextMatch: true });
    }
  });

  it("bounds inputs and requires no network, model, or persistence", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network forbidden"));
    try {
      const repository = createCanonicalScriptureRepository();
      expect(repository.parseReferences("x".repeat(201))).toMatchObject([{ valid: false, errors: [{ code: "query_too_large" }] }]);
      await expect(repository.search({ text: "x".repeat(201) })).rejects.toMatchObject<Partial<ScriptureRepositoryError>>({ code: "query_too_large" });
      await expect(repository.search({ text: "John", limit: 51 })).rejects.toMatchObject<Partial<ScriptureRepositoryError>>({ code: "result_limit_exceeded" });
      await expect(repository.search({ text: "John", translationId: "KJV" })).rejects.toMatchObject<Partial<ScriptureRepositoryError>>({ code: "translation_mismatch" });
      expect((await repository.search({ text: "Romans 8:28" }))[0]?.citation.canonicalLabel).toBe("Romans 8:28");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
