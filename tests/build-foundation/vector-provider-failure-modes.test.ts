import OpenAI from "openai";
import { describe, expect, it, vi } from "vitest";
import { hashNormalizedContent } from "../../src/server/retrieval/content-hashing";
import { OpenAiEmbeddingGateway } from "../../src/server/retrieval/openai-embedding-gateway";

const environment = Object.freeze({
  OPENAI_API_KEY: "test-only-project-key",
  TEOYUBE_ENABLE_EMBEDDINGS: "true"
});

function request(contents = ["reviewed public source"]) {
  return Object.freeze({
    inputs: Object.freeze(contents.map((content, index) => Object.freeze({
      id: `input-${index + 1}`,
      content,
      normalizedContentHash: hashNormalizedContent(content),
      sourceVersion: "test-source-v1",
      chunkerVersion: "test-chunker-v1",
      sensitivity: "public" as const
    }))),
    model: "text-embedding-3-small",
    dimension: 1536,
    budget: Object.freeze({
      purpose: "document_indexing" as const,
      maximumInputTokens: 10_000,
      maximumCostUsd: 0.25,
      spentCostUsd: 0,
      pricePerMillionInputTokensUsd: 0.02
    })
  });
}

describe("vector provider failure modes", () => {
  it("fails closed when the project key is absent", async () => {
    const factory = vi.fn();
    const gateway = new OpenAiEmbeddingGateway({
      environment: { TEOYUBE_ENABLE_EMBEDDINGS: "true" },
      clientFactory: factory
    });
    await expect(gateway.embedDocuments(request())).rejects.toMatchObject({ code: "disabled" });
    expect(factory).not.toHaveBeenCalled();
  });

  it("does not retry a rate limit in the evaluation profile", async () => {
    const create = vi.fn().mockRejectedValue(
      new OpenAI.RateLimitError(429, { error: { message: "synthetic" } }, "synthetic", new Headers(), "req-test")
    );
    const gateway = new OpenAiEmbeddingGateway({
      environment,
      maximumAttempts: 1,
      clientFactory: () => ({ embeddings: { create } })
    });
    await expect(gateway.embedDocuments(request())).rejects.toMatchObject({ code: "provider_unavailable" });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("fails safely on a provider timeout without retry", async () => {
    const create = vi.fn().mockRejectedValue(new OpenAI.APIConnectionTimeoutError());
    const gateway = new OpenAiEmbeddingGateway({
      environment,
      maximumAttempts: 1,
      clientFactory: () => ({ embeddings: { create } })
    });
    await expect(gateway.embedDocuments(request())).rejects.toMatchObject({ code: "provider_unavailable" });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("rejects a partial batch response", async () => {
    const create = vi.fn().mockResolvedValue({
      data: [{ embedding: Array.from({ length: 1536 }, () => 0.1), index: 0 }],
      usage: { prompt_tokens: 8, total_tokens: 8 }
    });
    const gateway = new OpenAiEmbeddingGateway({
      environment,
      maximumAttempts: 1,
      clientFactory: () => ({ embeddings: { create } })
    });
    await expect(gateway.embedDocuments(request(["one", "two"]))).rejects.toMatchObject({
      code: "provider_response_invalid"
    });
  });

  it("rejects a corrupted vector dimension", async () => {
    const create = vi.fn().mockResolvedValue({
      data: [{ embedding: [0.1, 0.2], index: 0 }],
      usage: { prompt_tokens: 4, total_tokens: 4 }
    });
    const gateway = new OpenAiEmbeddingGateway({
      environment,
      maximumAttempts: 1,
      clientFactory: () => ({ embeddings: { create } })
    });
    await expect(gateway.embedDocuments(request())).rejects.toMatchObject({
      code: "provider_response_invalid"
    });
  });
});
