import { describe, expect, it, vi } from "vitest";
import type { ScriptureCitation } from "../../src/domain/scripture/scripture-repository";
import {
  createCanonicalScriptureRepository,
  ScriptureRepositoryError
} from "../../src/server/scripture/canonical-scripture-repository";

function ephesiansCitation(overrides: Partial<ScriptureCitation> = {}): ScriptureCitation {
  return {
    reference: { book: "Ephesians", chapterStart: 1, verseStart: 18 },
    canonicalLabel: "Ephesians 1:18",
    translationId: "UNSPECIFIED_REFERENCE_ONLY",
    corpusVersion: "teoyube-reference-index-2026-07-20.1",
    sourceId: "teoyube-local-reference-index",
    validationStatus: "unresolved",
    ...overrides
  };
}

describe("canonical reference-only Scripture repository", () => {
  it("reports the corpus and licensing blocker explicitly", async () => {
    const repository = createCanonicalScriptureRepository();
    const info = await repository.getCorpusInfo();
    expect(info).toMatchObject({
      translationId: "UNSPECIFIED_REFERENCE_ONLY",
      corpusVersion: "teoyube-reference-index-2026-07-20.1",
      corpusChecksum: "45dbec709a49fd5fe8a0c115c451ecf56ec5b2b538b72e31563606faa823bdf6",
      referenceCoverage: 356,
      verseCoverage: 0,
      displayPolicy: "REFERENCE_ONLY",
      fullTextDisplayApproved: false,
      readiness: "BLOCKED_NO_COMPLETE_APPROVED_FULL_TEXT_CORPUS"
    });
    expect(info.assets).toHaveLength(18);
    expect(info.limitations.join(" ")).toContain("No complete approved local full-text Scripture corpus exists");
  });

  it("normalizes known references but never fabricates exact text or context", async () => {
    const repository = createCanonicalScriptureRepository();
    const parsed = repository.parseReferences("Eph. 1:18");
    expect(parsed).toEqual([expect.objectContaining({ valid: true, canonicalLabel: "Ephesians 1:18" })]);
    const reference = parsed[0]?.valid ? parsed[0].reference : undefined;
    expect(reference).toBeDefined();
    if (!reference) return;
    expect(repository.hasReference("Ephesians 1:18")).toBe(true);
    expect(await repository.getByReference(reference)).toBeNull();
    expect(await repository.getContext(reference)).toBeNull();
  });

  it("provides deterministic, version-aware reference-only lexical search", async () => {
    const repository = createCanonicalScriptureRepository();
    const first = await repository.search({ text: "Ephesians 1:18", limit: 5 });
    const second = await repository.search({ text: "Ephesians 1:18", limit: 5 });
    expect(first).toEqual(second);
    expect(first[0]).toMatchObject({
      citation: {
        canonicalLabel: "Ephesians 1:18",
        translationId: "UNSPECIFIED_REFERENCE_ONLY",
        validationStatus: "unresolved"
      },
      score: 1
    });
    expect(first[0]?.excerpt).toBeUndefined();
    expect(repository.diagnostics()).toMatchObject({ searches: 2, cacheHits: 1, cacheMisses: 1, cacheEntries: 1, rawQueriesLogged: false });
    expect(repository.diagnostics().referenceIndexBuildDurationMs).toBeGreaterThanOrEqual(0);
  });

  it("bounds queries and result counts with typed failures", async () => {
    const repository = createCanonicalScriptureRepository();
    expect(repository.parseReferences("x".repeat(201))).toMatchObject([{ valid: false, errors: [{ code: "query_too_large" }] }]);
    await expect(repository.search({ text: "x".repeat(201) })).rejects.toMatchObject<Partial<ScriptureRepositoryError>>({ code: "query_too_large" });
    await expect(repository.search({ text: "John", limit: 51 })).rejects.toMatchObject<Partial<ScriptureRepositoryError>>({ code: "result_limit_exceeded" });
    await expect(repository.search({ text: "John", translationId: "KJV" })).rejects.toMatchObject<Partial<ScriptureRepositoryError>>({ code: "translation_mismatch" });
  });

  it("blocks unapproved quotations, unknown sources, and legacy KJV excerpts", async () => {
    const repository = createCanonicalScriptureRepository();
    const referenceOnly = await repository.validateCitation(ephesiansCitation(), "displayed wording");
    expect(referenceOnly).toMatchObject({ valid: false, exactTextMatch: false });
    expect(referenceOnly.errors.map((item) => item.code)).toContain("quote_mismatch");

    const kjv = await repository.validateCitation(ephesiansCitation({ translationId: "KJV", sourceId: "legacy-tig-kjv-excerpts" }), "legacy wording");
    expect(kjv.errors.map((item) => item.code)).toEqual(expect.arrayContaining(["display_blocked_by_license", "quote_mismatch"]));

    const unknown = await repository.validateCitation(ephesiansCitation({ translationId: "OTHER", sourceId: "not-registered" }));
    expect(unknown.errors.map((item) => item.code)).toEqual(expect.arrayContaining(["unresolved_source", "translation_mismatch", "missing_corpus_coverage"]));
  });

  it("requires no external network or model call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network forbidden"));
    try {
      const repository = createCanonicalScriptureRepository();
      expect((await repository.search({ text: "Romans 8:28" }))[0]?.citation.canonicalLabel).toBe("Romans 8:28");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
