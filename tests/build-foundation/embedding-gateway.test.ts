import { describe, expect, it, vi } from "vitest";
import {
  EmbeddingGatewayError,
  OpenAiEmbeddingGateway
} from "../../src/server/retrieval/openai-embedding-gateway";
import { hashNormalizedContent } from "../../src/server/retrieval/content-hashing";

const enabledEnvironment = Object.freeze({
  OPENAI_API_KEY: "test-only",
  OPENAI_ORG_ID: "org-test",
  TEOYUBE_ENABLE_EMBEDDINGS: "true"
});

function request(content = "reviewed public source") {
  return Object.freeze({
    inputs: Object.freeze([
      Object.freeze({
        id: "input-1",
        content,
        normalizedContentHash: hashNormalizedContent(content),
        sourceVersion: "v1",
        chunkerVersion: "c1",
        sensitivity: "public" as const
      })
    ]),
    model: "text-embedding-3-small",
    dimension: 1536,
    budget: Object.freeze({
      purpose: "document_indexing" as const,
      maximumInputTokens: 1000,
      maximumCostUsd: 0.25,
      spentCostUsd: 0,
      pricePerMillionInputTokensUsd: 0.02
    })
  });
}

describe("OpenAiEmbeddingGateway", () => {
  it("fails closed while the embedding flag is disabled", async () => {
    const factory = vi.fn();
    const gateway = new OpenAiEmbeddingGateway({
      environment: {
        ...enabledEnvironment,
        TEOYUBE_ENABLE_EMBEDDINGS: "false"
      },
      clientFactory: factory
    });
    await expect(gateway.embedDocuments(request())).rejects.toMatchObject({
      code: "disabled"
    });
    expect(factory).not.toHaveBeenCalled();
  });

  it("returns the configured dimension and privacy-safe usage", async () => {
    const create = vi.fn().mockResolvedValue({
      data: [{ embedding: Array.from({ length: 1536 }, (_, index) => index / 1536), index: 0 }],
      usage: { prompt_tokens: 7, total_tokens: 7 },
      _request_id: "req-test"
    });
    const gateway = new OpenAiEmbeddingGateway({
      environment: enabledEnvironment,
      clientFactory: () => ({ embeddings: { create } })
    });
    const result = await gateway.embedDocuments(request());
    expect(result.dimension).toBe(1536);
    expect(result.results[0].vector).toHaveLength(1536);
    expect(result.usage).toMatchObject({
      inputTokens: 7,
      providerCalls: 1,
      estimatedCostUsd: 0.00000014
    });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("accepts a project-scoped key without requiring an organization header", async () => {
    const create = vi.fn().mockResolvedValue({
      data: [{ embedding: Array.from({ length: 1536 }, () => 0.25), index: 0 }],
      usage: { prompt_tokens: 4, total_tokens: 4 }
    });
    const factory = vi.fn(() => ({ embeddings: { create } }));
    const gateway = new OpenAiEmbeddingGateway({
      environment: {
        OPENAI_API_KEY: "test-only-project-key",
        TEOYUBE_ENABLE_EMBEDDINGS: "true"
      },
      clientFactory: factory
    });
    await expect(gateway.embedDocuments(request())).resolves.toMatchObject({ dimension: 1536 });
    expect(factory).toHaveBeenCalledWith("test-only-project-key", undefined);
  });

  it("supports a zero-retry evaluation profile", async () => {
    const create = vi.fn().mockRejectedValue(new Error("synthetic provider failure"));
    const gateway = new OpenAiEmbeddingGateway({
      environment: enabledEnvironment,
      maximumAttempts: 1,
      clientFactory: () => ({ embeddings: { create } })
    });
    await expect(gateway.embedDocuments(request())).rejects.toMatchObject({
      code: "provider_unavailable"
    });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("rejects raw sensitive text before creating a provider client", async () => {
    const factory = vi.fn();
    const base = request();
    const gateway = new OpenAiEmbeddingGateway({
      environment: enabledEnvironment,
      clientFactory: factory
    });
    await expect(
      gateway.embedDocuments({
        ...base,
        inputs: Object.freeze([
          Object.freeze({ ...base.inputs[0], sensitivity: "sensitive_spiritual" as const })
        ])
      })
    ).rejects.toBeInstanceOf(EmbeddingGatewayError);
    expect(factory).not.toHaveBeenCalled();
  });

  it("enforces the approved cost budget before a provider call", async () => {
    const factory = vi.fn();
    const gateway = new OpenAiEmbeddingGateway({
      environment: enabledEnvironment,
      clientFactory: factory
    });
    const base = request("x".repeat(1000));
    await expect(
      gateway.embedDocuments({
        ...base,
        budget: Object.freeze({ ...base.budget, maximumCostUsd: 0 })
      })
    ).rejects.toMatchObject({ code: "budget_exceeded" });
    expect(factory).not.toHaveBeenCalled();
  });
});
