import { describe, expect, it, vi } from "vitest";
import {
  CROSS_MODULE_RETRIEVAL_POLICIES,
  CrossModuleRetrievalService
} from "../../src/features/retrieval";

describe("cross-module retrieval adapters", () => {
  it("keeps Promise Search distinct and maps every retained capability", () => {
    expect(Object.keys(CROSS_MODULE_RETRIEVAL_POLICIES)).toHaveLength(9);
    expect(CROSS_MODULE_RETRIEVAL_POLICIES.search.intent).toBe("multi_category_search");
    expect(CROSS_MODULE_RETRIEVAL_POLICIES.promise_search.intent).toBe("promise_search");
    expect(CROSS_MODULE_RETRIEVAL_POLICIES.search.partitions).toContain("testimonies");
    expect(CROSS_MODULE_RETRIEVAL_POLICIES.promise_search.partitions).not.toContain("testimonies");
    expect(CROSS_MODULE_RETRIEVAL_POLICIES.teo_guide.partitions).toContain("theology_safety");
    expect(CROSS_MODULE_RETRIEVAL_POLICIES.product_help.partitions).toEqual([
      "theology_safety",
      "product_help"
    ]);
  });

  it("preserves default views and never mutates state", async () => {
    const result = Object.freeze({
      requestId: "r",
      queryHash: "q",
      intent: "promise_search",
      exactReferenceResolved: false,
      pathsUsed: Object.freeze(["lexical" as const]),
      sources: Object.freeze([]),
      fallback: Object.freeze({ used: true, reason: "disabled" as const }),
      limitations: Object.freeze([]),
      contextTokenCount: 0,
      latencyMs: 0,
      indexVersion: "index-v1"
    });
    const retrieve = vi.fn().mockResolvedValue(result);
    const service = new CrossModuleRetrievalService({ retrieve });
    const output = await service.retrieve("promise_search", {
      query: "peace",
      now: "2026-07-23T00:00:00.000Z",
      activeIndexVersion: "index-v1",
      vectorEnabled: false
    });
    expect(output).toMatchObject({
      surface: "promise_search",
      stateMutation: false,
      visibleCopyChanged: false,
      defaultViewChanged: false
    });
    expect(retrieve).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: "promise_search",
        enableVector: false,
        executionKind: "user_query"
      })
    );
  });
});
