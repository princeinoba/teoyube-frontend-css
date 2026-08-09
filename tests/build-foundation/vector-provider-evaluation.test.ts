import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  AUTHORIZED_VECTOR_CONTENT_TYPES,
  buildAuthorizedVectorEvaluationInventory,
  PREPARED_PUBLIC_INVENTORY_HASH,
  VECTOR_EVALUATION_AUTHORIZATION_ID
} from "../../src/server/retrieval/authorized-vector-evaluation-inventory";
import { estimateTokens } from "../../src/server/retrieval/content-hashing";
import { EMBEDDING_MODELS } from "../../src/server/retrieval/retrieval-config";

const dataset = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "docs", "release", "vector-evaluation-dataset.json"),
    "utf8"
  )
) as {
  authorizationId: string;
  lockedBeforeProviderEvaluation: boolean;
  thresholdsLockedBeforeEvaluation: boolean;
  containsRealUserContent: boolean;
  cases: readonly Readonly<{
    id: string;
    category: string;
    query: string;
    mode: string;
    expectedDocumentIds: readonly string[];
    expectedContentTypes: readonly string[];
  }>[];
};

describe("authorized vector provider evaluation", () => {
  it("builds only the explicitly authorized public corpus", () => {
    const inventory = buildAuthorizedVectorEvaluationInventory(
      EMBEDDING_MODELS.default.id,
      EMBEDDING_MODELS.default.dimension,
      "2026-08-09T00:00:00.000Z"
    );
    expect(inventory.authorizationId).toBe(VECTOR_EVALUATION_AUTHORIZATION_ID);
    expect(inventory.preparedPublicInventoryHash).toBe(PREPARED_PUBLIC_INVENTORY_HASH);
    expect(inventory.sources.map((source) => source.sourceId)).toEqual(
      expect.arrayContaining([
        "src/server/scripture/corpora/engwebp/generated/corpus.json",
        "src/data/promiseClusters.json",
        "src/data/coreTeoyubeVocabulary.json",
        "src/data/scriptureCanon.json"
      ])
    );
    expect(inventory.excludedPreparedSources).toEqual([
      "src/data/prayerEngineTemplates.json",
      "src/data/projectStructureRoadmap.json",
      "src/data/technicalArchitecture.json",
      "src/data/teoyubeSearchFramework.json",
      "src/data/theologyConstitution.json"
    ]);
    expect(new Set(inventory.chunks.map((chunk) => chunk.partition))).toEqual(
      new Set(["canonical_scripture", "scripture_context", "promise_clusters", "lexicon"])
    );
    expect(inventory.chunks.every((chunk) => chunk.sensitivity === "public")).toBe(true);
    expect(inventory.chunks.some((chunk) => chunk.userId)).toBe(false);
    expect(inventory.contentTypeCounts.CANON).toBe(108);
    expect(inventory.contentTypeCounts.TIG_EXPLANATION).toBe(0);
    expect(Object.keys(inventory.contentTypeCounts).sort()).toEqual(
      [...AUTHORIZED_VECTOR_CONTENT_TYPES].sort()
    );
  });

  it("locks every required evaluation category before provider use", () => {
    expect(dataset.authorizationId).toBe(VECTOR_EVALUATION_AUTHORIZATION_ID);
    expect(dataset.lockedBeforeProviderEvaluation).toBe(true);
    expect(dataset.thresholdsLockedBeforeEvaluation).toBe(true);
    expect(dataset.containsRealUserContent).toBe(false);
    const categories = new Set(dataset.cases.map((item) => item.category));
    for (const required of [
      "exact_scripture_reference",
      "promise_theme",
      "lexicon",
      "canon",
      "calling_support",
      "prayer_support",
      "ambiguous",
      "no_answer",
      "prompt_injection",
      "private_exclusion",
      "cross_translation_corruption",
      "citation_trap",
      "interpretation_as_scripture",
      "divine_authority"
    ]) {
      expect(categories.has(required), required).toBe(true);
    }
    expect(dataset.cases.every((item) => Array.isArray(item.expectedDocumentIds))).toBe(true);
    expect(dataset.cases.every((item) => Array.isArray(item.expectedContentTypes))).toBe(true);
  });

  it("keeps the worst-case single-attempt task cost below the owner ceiling", () => {
    const inventory = buildAuthorizedVectorEvaluationInventory(
      EMBEDDING_MODELS.default.id,
      EMBEDDING_MODELS.default.dimension,
      "2026-08-09T00:00:00.000Z"
    );
    const queryTokens = dataset.cases
      .filter((item) => ["semantic", "no_answer", "semantic_safety"].includes(item.mode))
      .reduce((sum, item) => sum + estimateTokens(item.query), 0);
    const conservativeCost =
      (inventory.totalEstimatedTokens + queryTokens) *
      1.2 /
      1_000_000 *
      EMBEDDING_MODELS.default.pricePerMillionInputTokensUsd;
    expect(conservativeCost).toBeLessThanOrEqual(0.25);
  });
});
