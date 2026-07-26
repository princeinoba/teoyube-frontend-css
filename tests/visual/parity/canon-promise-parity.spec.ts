import fs from "node:fs";
import path from "node:path";
import { chromium, expect, test, type Page } from "@playwright/test";
import { captureRichContract, installDeterminism, openStaticView, settlePage } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { assertDisposableCandidatePath, candidateRoot, runtimeManifest, type ViewportName } from "./config";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";

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
      try { const timing = animation.effect?.getComputedTiming(); if (timing?.iterations === Infinity) animation.currentTime = 0; else animation.finish(); animation.pause(); } catch { /* browser-owned animation */ }
    }
  });
}

async function captureViewport(page: Page, outputPath: string) {
  assertDisposableCandidatePath(outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: false, animations: "disabled" });
}

for (const definition of [
  { view: "canon" as const, route: "/canon", root: "#canon", evidence: "canon-owner-review" },
  { view: "table" as const, route: "/promise-table", root: "#table", evidence: "promise-table-owner-review" }
]) {
  test(`approved ${definition.view} candidate matches at every required viewport`, async () => {
    test.setTimeout(600_000);
    const evidenceRoot = path.join(candidateRoot, definition.evidence);
    assertDisposableCandidatePath(evidenceRoot);
    fs.mkdirSync(evidenceRoot, { recursive: true });
    const summary: Array<Record<string, unknown>> = [];
    for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
      const requested = process.env.TEOYUBE_PROMPT8_VIEWPORT;
      if (requested && requested !== viewportName) continue;
      const isolatedBrowser = await chromium.launch({
        channel: process.platform === "win32" ? "chrome" : undefined,
        headless: true
      });
      const staticContext = await isolatedBrowser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
      const nextContext = await isolatedBrowser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
      await installDeterminism(staticContext, [new URL(staticBaseUrl).origin]);
      await installDeterminism(nextContext, [new URL(nextBaseUrl).origin]);
      const staticPage = await staticContext.newPage();
      const nextPage = await nextContext.newPage();
      const viewportOutput = path.join(evidenceRoot, viewportName);
      try {
        await staticPage.goto(`${staticBaseUrl}/index.html#${definition.view}`, { waitUntil: "domcontentloaded" });
        await openStaticView(staticPage, definition.view);
        await nextPage.goto(`${nextBaseUrl}${definition.route}`, { waitUntil: "domcontentloaded" });
        await nextPage.waitForFunction((view) => document.body.dataset.view === view, definition.view);
        await settlePage(nextPage);
        await align(staticPage);
        await align(nextPage);
        const staticContract = scopeFrameworkParents(await captureRichContract(staticPage, definition.root));
        const nextContract = scopeFrameworkParents(await captureRichContract(nextPage, definition.root));
        fs.mkdirSync(viewportOutput, { recursive: true });
        fs.writeFileSync(path.join(viewportOutput, `${definition.view}.static.contract.json`), `${JSON.stringify(staticContract, null, 2)}\n`, "utf8");
        fs.writeFileSync(path.join(viewportOutput, `${definition.view}.next.contract.json`), `${JSON.stringify(nextContract, null, 2)}\n`, "utf8");
        expect(compareRichContracts(staticContract, nextContract), `${viewportName} ${definition.view} contract`).toEqual([]);
        const staticScreenshot = path.join(viewportOutput, `${definition.view}.static.png`);
        const nextScreenshot = path.join(viewportOutput, `${definition.view}.next.png`);
        await captureViewport(staticPage, staticScreenshot);
        await captureViewport(nextPage, nextScreenshot);
        const comparison = await compareScreenshots(staticScreenshot, nextScreenshot, viewportOutput, definition.view, true, false);
        expect(comparison.strictPassed, `${viewportName} ${definition.view} raster ratio ${comparison.differentPixelRatio}`).toBe(true);
        summary.push({ viewport: viewportName, width: viewport.width, height: viewport.height, comparison });
        console.log(`${definition.view} parity compared ${viewportName}`);
      } finally {
        await staticContext.close();
        await nextContext.close();
        await isolatedBrowser.close();
      }
    }
    fs.writeFileSync(path.join(evidenceRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  });
}

test("Canon tabs, paging, search, and carousels preserve approved controls", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/canon`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.view === "canon");
  await page.locator('[data-canon-tab="promise-clusters"]').click();
  await expect(page.locator('[data-canon-tab="promise-clusters"]')).toHaveClass(/active/);
  await expect(page.locator("#canonGrid [data-canon-item]")).toHaveCount(5);
  await page.locator('[data-canon-tab="canon-maps"]').click();
  await page.locator('#canonPagination [data-canon-page="2"].canon-page-number').click();
  await expect(page.locator('#canonPagination [data-canon-page="2"].canon-page-number')).toHaveClass(/active/);
  await page.locator('[data-canon-page="1"].canon-page-number').click();
  await page.locator('[data-canon-featured-slide-nav="next"]').click();
  await expect(page.locator('[data-canon-featured-slide-index="1"]')).toHaveClass(/active/);
  await page.locator("[data-canon-featured-carousel]").press("ArrowLeft");
  await expect(page.locator('[data-canon-featured-slide-index="0"]')).toHaveClass(/active/);
  await page.locator(".canon-quick-chips button", { hasText: "I need wisdom" }).click();
  await expect(page.locator(".canon-hero-search input")).toHaveValue("I need wisdom");
  await page.locator(".canon-hero-search").press("Enter");
  await expect(page.locator("#phase113SaveDrawer")).toContainText("Canon search ready");
});

test("Promise Table keeps provenance through add, status, remove, undo, search, and media actions", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/promise-table`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.view === "table");
  const status = page.locator('[data-phase114-promise-status="active-daily-promise"]');
  await status.selectOption("Praying");
  await expect(page.locator("#phase113SaveDrawer")).toContainText("Studying → Praying");
  await page.locator('[data-phase116b-promise-filter="Praying"]').click();
  await expect(page.locator("#savedPromiseTableRows tr")).toBeVisible();
  await page.locator('[data-phase116-query="Romans 8:28-30"]').click();
  await expect(page.locator("#promiseTableSearchInput")).toHaveValue("Romans 8:28-30");
  await page.locator("#promiseTableSearchForm").press("Enter");
  await expect(page.locator("#phase113SaveDrawer")).toContainText("Promise search complete");
  await page.locator('[data-promise-table-video-index="2"]').click();
  await expect(page.locator("#promiseTableVideoPanel h3")).toHaveText("Walk in Divine Purpose");
  await page.locator('[data-teoyube-action="promise.add.open"]').click();
  const dialog = page.locator("#phase116b1PromiseDialog");
  await expect(dialog).toBeVisible();
  await dialog.locator('input[name="title"]').fill("Wisdom for a faithful step");
  await dialog.locator('input[name="scripture"]').fill("James 1:5");
  await dialog.locator('select[name="status"]').selectOption("Discovered");
  await dialog.locator('button[type="submit"]').click();
  await expect(page.locator("#phase113SaveDrawer")).toContainText("Level C");
  const manualRow = page.locator('#savedPromiseTableRows tr[data-promise-row^="manual-"]');
  await expect(manualRow).toContainText("James 1:5");
  await manualRow.locator("[data-phase114-remove-promise]").click();
  await expect(manualRow).toHaveCount(0);
  await page.locator("#phase113SaveDrawer").getByRole("button", { name: "Undo" }).click();
  await expect(page.locator('#savedPromiseTableRows tr[data-promise-row^="manual-"]')).toContainText("James 1:5");
});
