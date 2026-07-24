import { describe, expect, it } from "vitest";
import { createReadinessPayload } from "@/config/readiness";
import {
  assertAllowedFields,
  readJsonObject,
  safeApiError
} from "@/server/http/memory-route-helpers";

describe("release request controls", () => {
  it("requires JSON content type and bounded object input", async () => {
    await expect(
      readJsonObject(new Request("http://localhost/api/test", {
        method: "POST",
        body: "{}"
      }))
    ).rejects.toThrow(/content type/);
    await expect(
      readJsonObject(new Request("http://localhost/api/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "[]"
      }))
    ).rejects.toThrow(/invalid/);
    await expect(
      readJsonObject(new Request("http://localhost/api/test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "1048577"
        },
        body: "{}"
      }))
    ).rejects.toThrow(/too large/);
  });

  it("rejects unsupported fields deterministically", () => {
    expect(() => assertAllowedFields({ allowed: true }, ["allowed"])).not.toThrow();
    expect(() => assertAllowedFields({ allowed: true, privilege: "owner" }, ["allowed"])).toThrow(/unsupported/);
  });

  it("returns bounded and retryable rate-limit errors", async () => {
    const response = safeApiError(new Error("The request limit was reached."));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await response.json()).toEqual({
      error: "The request limit was reached."
    });
  });

  it("keeps public readiness secret-safe and fallback-aware", () => {
    const secret = "never-serialize-this";
    const normal = createReadinessPayload({
      OPENAI_API_KEY: secret,
      TEOYUBE_DATABASE_URL: `sqlite://${secret}`
    });
    expect(normal).toMatchObject({
      status: "ready",
      runtime: "next-preview",
      deterministicFallbackReady: true,
      dependencies: {
        scripture: "ready",
        tig: "ready",
        safety: "ready",
        durableMemory: "disabled",
        vectorIndex: "disabled",
        liveAiProvider: "disabled"
      }
    });
    expect(JSON.stringify(normal)).not.toContain(secret);

    const degraded = createReadinessPayload(
      {
        TEOYUBE_ENABLE_LIVE_AI: "true",
        TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER: "true",
        TEOYUBE_LIVE_AI_ENABLED: "true",
        OPENAI_API_KEY: secret
      },
      { liveAiProviderReady: false }
    );
    expect(degraded).toMatchObject({
      status: "degraded",
      deterministicFallbackReady: true,
      dependencies: { liveAiProvider: "fallback" }
    });
  });
});
