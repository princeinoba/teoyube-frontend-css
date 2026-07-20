import { describe, expect, it } from "vitest";

function percentile(values: readonly number[], fraction: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] || 0;
}

async function samples(iterations: number, operation: () => Promise<unknown>): Promise<readonly number[]> {
  const values: number[] = [];
  for (let index = 0; index < iterations; index += 1) {
    const startedAt = performance.now();
    await operation();
    values.push(performance.now() - startedAt);
  }
  return values;
}

describe("Scripture reference-only performance budgets", () => {
  it("records bounded local corpus/index, reference, context, search, and cache timings", async () => {
    const moduleStartedAt = performance.now();
    const { createCanonicalScriptureRepository } = await import("../../src/server/scripture/canonical-scripture-repository");
    const corpusModuleLoadMs = performance.now() - moduleStartedAt;
    const repository = createCanonicalScriptureRepository();
    const parsed = repository.parseReferences("Ephesians 1:18")[0];
    expect(parsed?.valid).toBe(true);
    if (!parsed?.valid) return;

    const exact = await samples(100, () => repository.getByReference(parsed.reference));
    const context = await samples(100, () => repository.getContext(parsed.reference));
    const coldSearch = await samples(50, () => createCanonicalScriptureRepository().search({ text: "Ephesians 1:18", limit: 10 }));
    await repository.search({ text: "Romans 8:28", limit: 10 });
    const cachedSearch = await samples(100, () => repository.search({ text: "Romans 8:28", limit: 10 }));
    const metrics = {
      corpusModuleLoadMs,
      referenceIndexBuildMs: repository.diagnostics().referenceIndexBuildDurationMs,
      exactReference: { p50: percentile(exact, 0.5), p95: percentile(exact, 0.95) },
      context: { p50: percentile(context, 0.5), p95: percentile(context, 0.95) },
      lexicalSearchMiss: { p50: percentile(coldSearch, 0.5), p95: percentile(coldSearch, 0.95) },
      lexicalSearchHit: { p50: percentile(cachedSearch, 0.5), p95: percentile(cachedSearch, 0.95) }
    };
    console.info(`SCRIPTURE_REFERENCE_ONLY_PERFORMANCE ${JSON.stringify(metrics)}`);

    expect(metrics.corpusModuleLoadMs).toBeLessThan(5_000);
    expect(metrics.referenceIndexBuildMs).toBeLessThan(250);
    expect(metrics.exactReference.p95).toBeLessThan(25);
    expect(metrics.context.p95).toBeLessThan(25);
    expect(metrics.lexicalSearchMiss.p95).toBeLessThan(100);
    expect(metrics.lexicalSearchHit.p95).toBeLessThan(25);
  });
});
