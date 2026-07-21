import { expect, test } from "@playwright/test";

test.describe("Scripture WEB server boundary", () => {
  test("retrieves, searches, contextualizes, and validates exact local WEB text", async ({ request }) => {
    const parsed = await request.post("/api/teoyube/scripture", { data: { action: "parse", reference: "Eph. 1:18; James 1:5" } });
    expect(parsed.status()).toBe(200);
    await expect(parsed.json()).resolves.toMatchObject({ ok: true, results: [{ valid: true, canonicalLabel: "Ephesians 1:18" }, { valid: true, canonicalLabel: "James 1:5" }] });

    const retrieved = await request.post("/api/teoyube/scripture", { data: { action: "get", reference: "Ephesians 1:18" } });
    expect(retrieved.status()).toBe(200);
    const passage = (await retrieved.json()).passage;
    expect(passage).toMatchObject({ citation: { translationId: "engwebp", sourceId: "engwebp", validationStatus: "validated" }, displayPolicy: "FULL_TEXT_ALLOWED" });
    expect(passage.verses[0].text).toBe("having the eyes of your hearts enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints,");

    const searched = await request.post("/api/teoyube/scripture", { data: { action: "search", query: "lamp feet path", limit: 3 } });
    expect(searched.status()).toBe(200);
    expect((await searched.json()).results[0]).toMatchObject({ citation: { translationId: "engwebp", validationStatus: "validated" }, excerpt: expect.any(String) });

    const context = await request.post("/api/teoyube/scripture", { data: { action: "context", reference: "Psalm 121:7", versesBefore: 2, versesAfter: 1 } });
    expect(context.status()).toBe(200);
    expect(await context.json()).toMatchObject({ ok: true, context: { contextKind: "chapter_window", boundarySource: "deterministic_fallback" } });

    const validated = await request.post("/api/teoyube/scripture", { data: { action: "validate", reference: "Ephesians 1:18", displayedText: passage.verses[0].text } });
    expect(validated.status()).toBe(200);
    expect(await validated.json()).toMatchObject({ ok: true, validation: { valid: true, exactTextMatch: true } });
  });

  test("reports ready corpus metadata without paths and rejects malformed or oversized input safely", async ({ request }) => {
    const info = await request.post("/api/teoyube/scripture", { data: { action: "corpus_info" } });
    expect(info.status()).toBe(200);
    const payload = await info.json();
    expect(payload).toMatchObject({ ok: true, corpus: { id: "engwebp", translationId: "engwebp", displayPolicy: "FULL_TEXT_ALLOWED", verseCoverage: 31098, readiness: "READY" } });
    expect(JSON.stringify(payload)).not.toMatch(/[A-Z]:\\|src\/|node_modules|secret|credential/i);

    const malformed = await request.post("/api/teoyube/scripture", { headers: { "Content-Type": "application/json" }, data: "not-an-object" });
    expect(malformed.status()).toBe(400);
    const oversized = await request.post("/api/teoyube/scripture", { data: { action: "search", query: "x".repeat(2_000) } });
    expect(oversized.status()).toBe(413);
    expect(JSON.stringify(await oversized.json())).not.toMatch(/[A-Z]:\\|src\/|stack|secret/i);
  });
});
