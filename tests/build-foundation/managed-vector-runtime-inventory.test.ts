import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { buildManagedVectorRuntimeInventory } from "../../src/server/retrieval/managed-vector-runtime-inventory";
import {
  MANAGED_VECTOR_CORPUS_HASH,
  MANAGED_VECTOR_DIMENSION,
  MANAGED_VECTOR_INDEX_VERSION,
  MANAGED_VECTOR_MODEL,
} from "../../src/server/retrieval/upstash-vector-repository";

describe("managed vector static runtime inventory", () => {
  it("reconstructs the exact authorized checkpoint identity from six statically imported public sources", () => {
    const inventory = buildManagedVectorRuntimeInventory(
      MANAGED_VECTOR_MODEL,
      MANAGED_VECTOR_DIMENSION,
      "2026-08-09T00:00:00.000Z",
    );
    expect(inventory).toMatchObject({
      compositeSourceHash: MANAGED_VECTOR_CORPUS_HASH,
      indexVersion: MANAGED_VECTOR_INDEX_VERSION,
      totalDocuments: 32_515,
      totalChunks: 33_656,
      contentTypeCounts: {
        SCRIPTURE: 33_428,
        CANON: 108,
        PROMISE: 12,
        LEXICON: 108,
        INTERPRETATION: 0,
        TIG_EXPLANATION: 0,
      },
    });
  });
});
