import { expect, test } from "@playwright/test";

test("canonical local Next health endpoint is available and secret-safe", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");

  const payload = await response.json();
  const serialized = JSON.stringify(payload);
  expect(payload).toMatchObject({
    status: "ok",
    runtime: "next-canonical-local",
    rollbackRuntime: "static-node",
    deployment: "local/release-candidate",
    gateCPreview: "pass",
    gateCProduction: "closed"
  });
  expect(serialized).not.toMatch(/api.?key|database.?url|credential|secret/i);
});
