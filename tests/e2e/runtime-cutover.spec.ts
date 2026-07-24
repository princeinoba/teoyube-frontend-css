import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/search",
  "/canon",
  "/promise-table",
  "/calling-compass",
  "/book",
  "/lexicon",
  "/testimony",
  "/teo-guide",
  "/embedded-videos",
  "/tables",
  "/prayer",
  "/journey",
  "/journal",
  "/settings",
  "/privacy",
  "/consent",
  "/terms",
  "/profile",
  "/personalization",
  "/daily-word",
  "/explore",
  "/promise-search"
] as const;

test("canonical Next runtime serves every retained public route and protects internal routes", async ({
  request
}) => {
  for (const route of publicRoutes) {
    expect((await request.get(route)).status(), route).toBe(200);
  }
  for (const route of ["/roadmap", "/dashboard", "/dev/teoyube-health", "/graph", "/tig"]) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
});

test("legacy static hashes become typed routes without losing safe query parameters", async ({
  page
}) => {
  await page.goto("/?source=legacy#canon", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/canon\?source=legacy$/);
  await expect(page.locator("#canon")).toBeAttached();

  await page.goto("/index.html?source=bookmark#table", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/promise-table\?source=bookmark$/);
  await expect(page.locator("#table")).toBeAttached();

  await page.goto("/#videos", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/embedded-videos$/);
  await expect(page.locator("#ui-elements")).toBeAttached();

  await page.goto("/#unknown-view", { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/");
  await expect(page.locator("#today")).toBeAttached();
});

test("canonical redirects, trailing slashes, refresh, and browser history remain stable", async ({
  page
}) => {
  await page.goto("/compass?assessment=1&topic=wisdom&unsafe=drop", {
    waitUntil: "domcontentloaded"
  });
  const compass = new URL(page.url());
  expect(compass.pathname).toBe("/calling-compass");
  expect(compass.searchParams.get("assessment")).toBe("1");
  expect(compass.searchParams.get("topic")).toBe("wisdom");
  expect(compass.searchParams.has("unsafe")).toBe(false);

  await page.goto("/search/", { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/search");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#search")).toBeAttached();

  await page.goto("/canon", { waitUntil: "domcontentloaded" });
  await page.goto("/promise-table", { waitUntil: "domcontentloaded" });
  await page.goBack({ waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/canon");
  await page.goForward({ waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/promise-table");
});

test("canonical media preserves HEAD, Range, cache, conditional, and not-found behavior", async ({
  request
}) => {
  const path =
    "/media/teoyubeworld/pilot-v1/media-1cb26db0174bf3fa9fec/card-preview.mp4";
  const head = await request.head(path);
  expect(head.status()).toBe(200);
  expect(head.headers()["content-type"]).toBe("video/mp4");
  expect(head.headers()["accept-ranges"]).toBe("bytes");
  expect(head.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
  expect(Number(head.headers()["content-length"])).toBe(942235);

  const range = await request.get(path, { headers: { Range: "bytes=0-99" } });
  expect(range.status()).toBe(206);
  expect(range.headers()["content-range"]).toBe("bytes 0-99/942235");
  expect((await range.body()).byteLength).toBe(100);

  const conditional = await request.get(path, {
    headers: { "If-Modified-Since": head.headers()["last-modified"] }
  });
  expect(conditional.status()).toBe(304);
  expect((await request.get("/images/prompt22-missing.png")).status()).toBe(404);
  expect(
    (await request.get("/media-source/teoyubeworld/originals/not-public.mp4")).status()
  ).toBe(404);
});
