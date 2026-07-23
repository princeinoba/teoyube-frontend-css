import { describe, expect, it } from "vitest";
import { buildPublicRetrievalInventory } from "../../src/server/retrieval/public-source-inventory";
import {
  EMBEDDING_MODELS,
  PROMPT_20_BUDGETS,
  RETRIEVAL_LIMITS
} from "../../src/server/retrieval/retrieval-config";
import { PublicIndexPipeline } from "../../src/server/retrieval/public-index-pipeline";

describe("public retrieval inventory", () => {
  it("is deterministic, partition-complete, and bounded", () => {
    const first = buildPublicRetrievalInventory(
      EMBEDDING_MODELS.default.id,
      EMBEDDING_MODELS.default.dimension,
      "2026-07-23T00:00:00.000Z"
    );
    const second = buildPublicRetrievalInventory(
      EMBEDDING_MODELS.default.id,
      EMBEDDING_MODELS.default.dimension,
      "2026-07-23T00:00:01.000Z"
    );
    expect(first.indexVersion).toBe(second.indexVersion);
    expect(first.chunks.map((chunk) => chunk.chunkId)).toEqual(
      second.chunks.map((chunk) => chunk.chunkId)
    );
    expect(new Set(first.chunks.map((chunk) => chunk.partition))).toEqual(
      new Set([
        "canonical_scripture",
        "scripture_context",
        "promise_clusters",
        "lexicon",
        "prayer_resources",
        "theology_safety",
        "product_help"
      ])
    );
    expect(first.chunks.filter((chunk) => chunk.partition === "canonical_scripture")).toHaveLength(31098);
    expect(first.chunks.every((chunk) => chunk.sensitivity === "public")).toBe(true);
  });

  it("stays below the owner-approved public cost and size caps", () => {
    const pipeline = new PublicIndexPipeline({
      now: () => "2026-07-23T00:00:00.000Z"
    });
    const estimate = pipeline.estimate();
    expect(estimate.maximumApprovedCostUsd).toBe(PROMPT_20_BUDGETS.publicIndexUsd);
    expect(estimate.conservativeCostUsd).toBeLessThanOrEqual(PROMPT_20_BUDGETS.publicIndexUsd);
    expect(estimate.estimatedVectorBytes).toBeLessThanOrEqual(RETRIEVAL_LIMITS.activePublicIndexBytes);
    expect(estimate.withinCostBudget).toBe(true);
    expect(estimate.withinActiveIndexSizeLimit).toBe(true);
  });
});
