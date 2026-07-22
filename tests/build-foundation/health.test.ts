import { describe, expect, it } from "vitest";
import { createHealthPayload } from "@/config/health";

describe("Teoyube preview health metadata", () => {
  it("returns safe runtime metadata without secret values", () => {
    const secret = "do-not-expose-this-value";
    const payload = createHealthPayload({
      TEOYUBE_BUILD_VERSION: "r2-test",
      NEXT_PUBLIC_TEOYUBE_APP_ENV: "test",
      NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET: "local",
      TEOYUBE_ENABLE_LIVE_AI: "true",
      TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER: "true",
      TEOYUBE_LIVE_AI_ENABLED: "true",
      OPENAI_API_KEY: secret,
      TEOYUBE_DATABASE_URL: `postgres://${secret}`
    });
    const serialized = JSON.stringify(payload);

    expect(payload).toMatchObject({
      status: "ok",
      runtime: "next-preview",
      buildVersion: "r2-test",
      environment: "test",
      deploymentTarget: "local"
    });
    expect(payload.enabledFlags.liveAi).toBe(true);
    expect(payload.enabledFlags.databasePersistence).toBe(false);
    expect(serialized).not.toContain(secret);
    expect(serialized).not.toMatch(/api.?key|database.?url|credential|secret/i);
  });
});
