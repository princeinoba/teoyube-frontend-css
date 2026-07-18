import { expect, test } from "@playwright/test";

test("Next preview health endpoint is available and secret-safe", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");

  const payload = await response.json();
  const serialized = JSON.stringify(payload);
  expect(payload).toMatchObject({
    status: "ok",
    runtime: "next-preview"
  });
  expect(serialized).not.toMatch(/api.?key|database.?url|credential|secret/i);
});
