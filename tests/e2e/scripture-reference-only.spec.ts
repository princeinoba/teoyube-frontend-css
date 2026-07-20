import { expect, test } from "@playwright/test";

test.describe("Scripture reference-only server boundary", () => {
  test("normalizes and searches local references without returning verse text", async ({ request }) => {
    const parsed = await request.post("/api/teoyube/scripture", {
      data: { action: "parse", reference: "Eph. 1:18; James 1:5" }
    });
    expect(parsed.status()).toBe(200);
    await expect(parsed.json()).resolves.toMatchObject({
      ok: true,
      results: [
        { valid: true, canonicalLabel: "Ephesians 1:18" },
        { valid: true, canonicalLabel: "James 1:5" }
      ]
    });

    const searched = await request.post("/api/teoyube/scripture", {
      data: { action: "search", query: "Ephesians 1:18", limit: 3 }
    });
    expect(searched.status()).toBe(200);
    const payload = await searched.json();
    expect(payload.ok).toBe(true);
    expect(payload.results[0]).toMatchObject({ citation: { canonicalLabel: "Ephesians 1:18", validationStatus: "unresolved" } });
    expect(JSON.stringify(payload)).not.toMatch(/"text"|"excerpt"|And we know that all things work together/i);
  });

  test("reports blocked readiness without paths and rejects malformed or oversized input safely", async ({ request }) => {
    const info = await request.post("/api/teoyube/scripture", { data: { action: "corpus_info" } });
    expect(info.status()).toBe(200);
    const infoPayload = await info.json();
    expect(infoPayload).toMatchObject({
      ok: true,
      corpus: {
        displayPolicy: "REFERENCE_ONLY",
        verseCoverage: 0,
        readiness: "BLOCKED_NO_COMPLETE_APPROVED_FULL_TEXT_CORPUS"
      }
    });
    expect(JSON.stringify(infoPayload)).not.toMatch(/[A-Z]:\\|src\/data|node_modules|secret|credential/i);

    const malformed = await request.post("/api/teoyube/scripture", {
      headers: { "Content-Type": "application/json" },
      data: "not-an-object"
    });
    expect(malformed.status()).toBe(400);

    const oversized = await request.post("/api/teoyube/scripture", {
      data: { action: "search", query: "x".repeat(2_000) }
    });
    expect(oversized.status()).toBe(413);
    expect(JSON.stringify(await oversized.json())).not.toMatch(/[A-Z]:\\|src\/|stack|secret/i);
  });
});
