import { expect, test } from "@playwright/test";

test("readiness is secret-safe and keeps deterministic core available", async ({
  request
}) => {
  const response = await request.get("/api/readiness");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");

  const payload = await response.json();
  expect(payload).toMatchObject({
    status: "ready",
    runtime: "next-preview",
    deterministicFallbackReady: true,
    dependencies: {
      scripture: "ready",
      tig: "ready",
      safety: "ready",
      vectorIndex: "disabled",
      liveAiProvider: "disabled"
    }
  });
  expect(JSON.stringify(payload)).not.toMatch(
    /api.?key|database.?url|credential|secret|file.?path|user.?count/i
  );
});

test("preview responses expose the reviewed browser security headers", async ({
  request
}) => {
  const response = await request.get("/api/health");
  const headers = response.headers();

  expect(headers["content-security-policy-report-only"]).toContain(
    "default-src 'self'"
  );
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  expect(headers["strict-transport-security"]).toBeUndefined();
});
