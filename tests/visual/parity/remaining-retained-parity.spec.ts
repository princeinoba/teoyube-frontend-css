import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { captureRichContract, installDeterminism, openStaticView, settlePage } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { assertDisposableCandidatePath, candidateRoot, runtimeManifest, type ViewportName } from "./config";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";

const approvedRoutes = [
  { view: "lexicon", route: "/lexicon" },
  { view: "guide", route: "/teo-guide" },
  { view: "ui-elements", route: "/embedded-videos" },
  { view: "teoyube-tables", route: "/tables" },
  { view: "roadmap", route: "/roadmap", ownerQa: true }
] as const;

const supportRoutes = [
  "/settings", "/privacy", "/consent", "/terms", "/profile", "/daily-word",
  "/dashboard", "/explore", "/personalization", "/promise-search"
] as const;

function normalizeStyle(value: string): string {
  return value.replace(/url\(["']?([^"')]+)["']?\)/g, "url($1)").replace(/object-position:\s*center center/g, "object-position:center").replace(/:\s*/g, ":").replace(/;\s*$/, "");
}

function scopeFrameworkParents(contract: Awaited<ReturnType<typeof captureRichContract>>) {
  return {
    ...contract,
    orderedDom: contract.orderedDom.map((row) => {
      const entry = row as Record<string, unknown>;
      const attributes = (entry.attributes as Array<[string, string]> | undefined)?.map(([name, value]) => [name, name === "style" ? normalizeStyle(value) : value] as [string, string]).sort(([left], [right]) => left.localeCompare(right));
      if (["primarySidebar", "mobileNavBackdrop", "mobileNavToggle"].includes(String(entry.id || ""))) return { ...entry, attributes, parentPath: "body > div.app-shell" };
      return { ...entry, attributes };
    })
  };
}

async function align(page: Page) {
  await page.addStyleTag({ content: "html, body, body * { -webkit-font-smoothing: antialiased !important; }" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await settlePage(page);
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      try {
        const timing = animation.effect?.getComputedTiming();
        if (timing?.iterations === Infinity) animation.currentTime = 0;
        else animation.finish();
        animation.pause();
      } catch { /* browser-owned animation */ }
    }
  });
}

async function captureViewport(page: Page, outputPath: string) {
  assertDisposableCandidatePath(outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: false, animations: "disabled" });
}

async function preservedSurfaceContract(page: Page) {
  return page.locator("#appMain > main").evaluate((root) => {
    const normalize = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim();
    return [root, ...root.querySelectorAll("*")].map((element) => ({
      tag: element.tagName.toLowerCase(),
      id: element.id || "",
      className: element.getAttribute("class") || "",
      attributes: [...element.attributes]
        .filter((attribute) => !/^(data-(nextjs|react|test)|data-testid$|nonce$)/i.test(attribute.name))
        .map((attribute) => [attribute.name, normalize(attribute.value)])
        .sort(([left], [right]) => left.localeCompare(right)),
      directText: normalize([...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent || "").join(" "))
    }));
  });
}

for (const definition of approvedRoutes) {
  test(`approved ${definition.view} candidate matches at every required viewport`, async ({ browser }) => {
    test.setTimeout(600_000);
    const evidenceRoot = path.join(candidateRoot, "remaining-retained-owner-review", definition.view);
    assertDisposableCandidatePath(evidenceRoot);
    fs.mkdirSync(evidenceRoot, { recursive: true });
    const summary: Array<Record<string, unknown>> = [];
    for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
      const staticContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
      const nextContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
      await installDeterminism(staticContext, [new URL(staticBaseUrl).origin]);
      await installDeterminism(nextContext, [new URL(nextBaseUrl).origin]);
      const staticPage = await staticContext.newPage();
      const nextPage = await nextContext.newPage();
      const output = path.join(evidenceRoot, viewportName);
      try {
        const staticUrl = `${staticBaseUrl}/index.html${definition.ownerQa ? "?qa=1" : ""}#${definition.view}`;
        await staticPage.goto(staticUrl, { waitUntil: "domcontentloaded" });
        await openStaticView(staticPage, definition.view);
        await nextPage.goto(`${nextBaseUrl}${definition.route}`, { waitUntil: "domcontentloaded" });
        await nextPage.waitForFunction((view) => document.body.dataset.view === view, definition.view);
        await align(staticPage);
        await align(nextPage);
        const staticContract = scopeFrameworkParents(await captureRichContract(staticPage, `#${definition.view}`));
        const nextContract = scopeFrameworkParents(await captureRichContract(nextPage, `#${definition.view}`));
        fs.mkdirSync(output, { recursive: true });
        fs.writeFileSync(path.join(output, `${definition.view}.static.contract.json`), `${JSON.stringify(staticContract, null, 2)}\n`, "utf8");
        fs.writeFileSync(path.join(output, `${definition.view}.next.contract.json`), `${JSON.stringify(nextContract, null, 2)}\n`, "utf8");
        expect(compareRichContracts(staticContract, nextContract), `${viewportName} ${definition.view} contract`).toEqual([]);
        const staticScreenshot = path.join(output, `${definition.view}.static.png`);
        const nextScreenshot = path.join(output, `${definition.view}.next.png`);
        await captureViewport(staticPage, staticScreenshot);
        await captureViewport(nextPage, nextScreenshot);
        const comparison = await compareScreenshots(staticScreenshot, nextScreenshot, output, definition.view, true, false);
        expect(comparison.strictPassed, `${viewportName} ${definition.view} raster ratio ${comparison.differentPixelRatio}`).toBe(true);
        summary.push({ viewport: viewportName, width: viewport.width, height: viewport.height, comparison });
      } finally {
        await staticContext.close();
        await nextContext.close();
      }
    }
    fs.writeFileSync(path.join(evidenceRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  });
}

test("owner-approved support routes keep their approved shell and responsive treatment", async ({ browser }) => {
  test.setTimeout(600_000);
  const evidenceRoot = path.join(candidateRoot, "remaining-retained-owner-review", "support-views");
  const desktopDigests = new Map<string, string>();
  for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
    const context = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
    await installDeterminism(context, [new URL(nextBaseUrl).origin]);
    const page = await context.newPage();
    try {
      for (const route of supportRoutes) {
        await page.goto(`${nextBaseUrl}${route}`, { waitUntil: "domcontentloaded" });
        await settlePage(page);
        await expect(page.locator("#primarySidebar")).toBeAttached();
        await expect(page.locator("#appMain > main")).toBeAttached();
        const normalNavigation = await page.locator("#primarySidebar .nav-list").innerText();
        expect(normalNavigation).not.toMatch(/Roadmap|TIG|Teoyube Health|Media Review/i);
        const contract = await preservedSurfaceContract(page);
        const digest = crypto.createHash("sha256").update(JSON.stringify(contract)).digest("hex");
        const prior = desktopDigests.get(route);
        if (!prior) desktopDigests.set(route, digest);
        else expect(digest, `${viewportName} ${route} responsive structure`).toBe(prior);
        const routeDirectory = path.join(evidenceRoot, route.slice(1), viewportName);
        fs.mkdirSync(routeDirectory, { recursive: true });
        fs.writeFileSync(path.join(routeDirectory, "contract.json"), `${JSON.stringify(contract, null, 2)}\n`, "utf8");
        await captureViewport(page, path.join(routeDirectory, "candidate.png"));
      }
    } finally {
      await context.close();
    }
  }
});

test("Lexicon filters and keeps Scripture-derived aid semantics visible", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/lexicon`, { waitUntil: "domcontentloaded" });
  const before = await page.locator("#lexiconGrid .lexicon-item:visible").count();
  await page.locator("#lexiconCategoryFilter").selectOption({ index: 1 });
  const after = await page.locator("#lexiconGrid .lexicon-item:visible").count();
  expect(after).toBeGreaterThan(0);
  expect(after).toBeLessThan(before);
  await page.locator("#lexiconSearchInput").fill("AGAPE");
  await expect(page.locator("#lexiconGrid .lexicon-item:visible")).toHaveCount(0);
  await page.locator("#lexiconCategoryFilter").selectOption("all");
  await expect(page.locator("#lexiconGrid .lexicon-item:visible").filter({ hasText: "AGAPE" })).toHaveCount(1);
  await page.locator("#lexiconGrid .lexicon-item:visible", { hasText: "AGAPE" }).getByRole("button", { name: "Study", exact: true }).click();
  await expect(page.locator("#phase113SaveDrawer")).toContainText("Scripture-derived aid, not Scripture");
});

test("Teo Guide responds locally with typed source, interpretation, action, and limitation", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/teo-guide`, { waitUntil: "domcontentloaded" });
  const networkCalls: string[] = [];
  page.on("request", (request) => { if (/api\/(ai|teoyube\/teo-guide)/.test(request.url())) networkCalls.push(request.url()); });
  await page.locator("#chatInput").fill("I need wisdom for a decision.");
  await page.locator("#chatInput").press("Enter");
  const response = page.locator("#chatLog .message-row.teo").last();
  await expect(response).toContainText("James 1:5");
  await expect(response).toContainText("Teoyube interpretation");
  await expect(response).toContainText("Suggested action");
  await expect(response).toContainText("not divine speech or certainty");
  await expect(response).not.toContainText(/God told you|God commands you|final destiny/i);
  expect(networkCalls).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("Embedded Videos preserves contained sources, controls, MIME, Range, cache, and protected paths", async ({ page, request }) => {
  await page.goto(`${nextBaseUrl}/embedded-videos`, { waitUntil: "domcontentloaded" });
  await page.locator("#uiVideoCategoryTabs [data-video-category='TeoyubeWorld Media']").click();
  await expect(page.locator("#uiVideoGrid [data-ui-video-source='approved']")).toHaveCount(0);
  await expect(page.locator("#uiVideoGrid .ui-video-empty")).toContainText("No videos found");
  await page.locator("#uiVideoCategoryTabs [data-video-category='All Videos']").click();
  await page.locator("#uiVideoGrid [data-ui-video-play]").first().click();
  await expect(page.locator("#phase113SaveDrawer")).toContainText("has no connected playable source");
  const manifest = await request.get(`${nextBaseUrl}/media/teoyubeworld/pilot-v1/runtime-manifest.json`);
  const manifestBody = await manifest.json();
  const sourcePath = manifestBody.records[0].plannedPublicCardUrl as string;
  expect(sourcePath).toMatch(/^\/media\/teoyubeworld\/pilot-v1\/.+\/card-preview\.mp4$/);
  const range = await request.get(`${nextBaseUrl}${sourcePath}`, { headers: { Range: "bytes=0-99" } });
  expect(range.status()).toBe(206);
  expect(range.headers()["content-type"]).toBe("video/mp4");
  expect(range.headers()["content-range"]).toMatch(/^bytes 0-99\//);
  expect(range.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
  expect(manifest.headers()["cache-control"]).toBe("no-store");
  expect((await request.get(`${nextBaseUrl}/media-source/teoyubeworld/originals/not-public.mp4`)).status()).toBe(404);
});

test("Tables preserves pagination, management tabs, row controls, and full-width data regions", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/tables`, { waitUntil: "domcontentloaded" });
  const firstPageName = await page.locator("#teoyubeTablesRows .teoyube-main-row .table-name-cell").first().innerText();
  await page.getByRole("button", { name: "Go to page 2" }).click();
  await expect(page.getByRole("button", { name: "Go to page 2" })).toHaveClass(/active/);
  expect(await page.locator("#teoyubeTablesRows .teoyube-main-row .table-name-cell").first().innerText()).not.toBe(firstPageName);
  await page.locator("#teoyubeDataTableTabs [data-data-table-tab='videos']").click();
  await expect(page.locator("#teoyubeDataTableTabs [data-data-table-tab='videos']")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#teoyubeDataVideoSourceWrap")).toBeVisible();
  await expect(page.locator("#teoyubeDataTableRows tr").first()).toBeVisible();
  await page.locator("#teoyubeTableSearch").fill("no matching table row");
  await expect(page.locator("#teoyubeTablesRows .teoyube-main-row:visible")).toHaveCount(0);
});

test("owner and development routes remain absent from normal navigation", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/roadmap`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#roadmap")).toHaveClass(/owner-qa-view/);
  const nav = page.locator("#primarySidebar .nav-list");
  await expect(nav).not.toContainText("Roadmap");
  await expect(nav).not.toContainText("TIG");
  await expect(nav).not.toContainText("Teoyube Health");
  await expect(nav).not.toContainText("Graph");
  await page.goto(`${nextBaseUrl}/compass`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  expect(new URL(page.url()).pathname).toBe("/calling-compass");
  await expect(page.locator("#calling")).toBeAttached();
});
