import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { captureRichContract, installDeterminism, openStaticView, settlePage } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { assertDisposableCandidatePath, candidateRoot, runtimeManifest, type ViewportName } from "./config";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";
const evidenceRoot = path.join(candidateRoot, "search-owner-review");

async function alignApprovedSearchScope(page: Page) {
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
      } catch {
        // Browser-owned animations may not expose writable timing state.
      }
    }
  });
}

function normalizeStyle(value: string): string {
  return value
    .replace(/url\(["']?([^"')]+)["']?\)/g, "url($1)")
    .replace(/object-position:\s*center center/g, "object-position:center")
    .replace(/:\s*/g, ":")
    .replace(/;\s*$/, "");
}

function scopeFrameworkParents(contract: Awaited<ReturnType<typeof captureRichContract>>) {
  return {
    ...contract,
    orderedDom: contract.orderedDom.map((row) => {
      const entry = row as Record<string, unknown>;
      const attributes = (entry.attributes as Array<[string, string]> | undefined)?.map(([name, value]) => [
        name,
        name === "style" ? normalizeStyle(value) : value
      ] as [string, string]).sort(([left], [right]) => left.localeCompare(right));
      if (["primarySidebar", "mobileNavBackdrop", "mobileNavToggle"].includes(String(entry.id || ""))) {
        return { ...entry, attributes, parentPath: "body > div.app-shell" };
      }
      return { ...entry, attributes };
    })
  };
}

async function captureViewport(page: Page, outputPath: string) {
  assertDisposableCandidatePath(outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: false, animations: "disabled" });
}

test("approved TeoyubeSearch candidate matches at every required viewport", async ({ browser }) => {
  test.setTimeout(480_000);
  assertDisposableCandidatePath(evidenceRoot);
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const summary: Array<Record<string, unknown>> = [];
  for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
    if (process.env.TEOYUBE_SEARCH_VIEWPORT && process.env.TEOYUBE_SEARCH_VIEWPORT !== viewportName) continue;
    const staticContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
    const nextContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
    await installDeterminism(staticContext, [new URL(staticBaseUrl).origin]);
    await installDeterminism(nextContext, [new URL(nextBaseUrl).origin]);
    const staticPage = await staticContext.newPage();
    const nextPage = await nextContext.newPage();
    const viewportOutput = path.join(evidenceRoot, viewportName);
    try {
      await staticPage.goto(`${staticBaseUrl}/index.html#search`, { waitUntil: "domcontentloaded" });
      await openStaticView(staticPage, "search");
      await nextPage.goto(`${nextBaseUrl}/search`, { waitUntil: "domcontentloaded" });
      await nextPage.waitForFunction(() => document.body.dataset.view === "search");
      await settlePage(nextPage);
      await alignApprovedSearchScope(staticPage);
      await alignApprovedSearchScope(nextPage);
      const staticContract = scopeFrameworkParents(await captureRichContract(staticPage, "#search"));
      const nextContract = scopeFrameworkParents(await captureRichContract(nextPage, "#search"));
      fs.mkdirSync(viewportOutput, { recursive: true });
      fs.writeFileSync(path.join(viewportOutput, "search.static.contract.json"), `${JSON.stringify(staticContract, null, 2)}\n`, "utf8");
      fs.writeFileSync(path.join(viewportOutput, "search.next.contract.json"), `${JSON.stringify(nextContract, null, 2)}\n`, "utf8");
      expect(compareRichContracts(staticContract, nextContract), `${viewportName} Search contract`).toEqual([]);
      const staticScreenshot = path.join(viewportOutput, "search.static.png");
      const nextScreenshot = path.join(viewportOutput, "search.next.png");
      await captureViewport(staticPage, staticScreenshot);
      await captureViewport(nextPage, nextScreenshot);
      const comparison = await compareScreenshots(staticScreenshot, nextScreenshot, viewportOutput, "search", true, false);
      expect(comparison.strictPassed, `${viewportName} Search raster ratio ${comparison.differentPixelRatio}`).toBe(true);
      summary.push({ viewport: viewportName, width: viewport.width, height: viewport.height, comparison });
      console.log(`Search parity compared ${viewportName}`);
    } finally {
      await staticContext.close();
      await nextContext.close();
    }
  }
  fs.writeFileSync(path.join(evidenceRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
});

test("all seven approved Search categories retain deterministic visible results", async ({ page }) => {
  const cases = [
    ["Promise", "I need a promise for direction", "JIREH - Provision"],
    ["Scripture", "Romans 8:28", "PRAYERA - Scripture-Based Prayer"],
    ["Life Problem", "I need healing", "TEOYUBE - The Eyes Of Your Understanding Being Enlightened"],
    ["Calling", "calling clarity", "MISSIONA - Sent With Purpose"],
    ["Prayer", "help me pray for wisdom", "PRAYERA - Scripture-Based Prayer"],
    ["Teoyube Word", "TEOYUBE", "TEOYUBE - The Eyes Of Your Understanding Being Enlightened"],
    ["Testimony", "testimony of breakthrough", "TESTIMA - Testimony Recorded"]
  ] as const;
  await page.goto(`${nextBaseUrl}/search`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.view === "search");
  for (const [category, query, title] of cases) {
    await page.locator("#teoyubeSearchCategory").selectOption(category);
    await page.locator("#teoyubeSearchInput").fill(query);
    await page.locator("#teoyubeSearchForm").press("Enter");
    await expect(page.locator("#teoyubeSearchResults > article").first().locator("h3")).toHaveText(title);
    await expect(page.locator("#teoyubeSearchResults > article")).toHaveCount(3);
  }
});

test("Search entrance, controls, result actions, and feedback remain functional", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/search`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.view === "search");
  await page.locator('button[data-query="I need healing"]').click();
  await expect(page.locator("#teoyubeSearchInput")).toHaveValue("I need healing");
  await expect(page.locator("#teoyubeSearchResults > article")).toHaveCount(3);

  await page.locator('button[data-phase116-query="Romans 8:28-30"]').click();
  await expect(page.locator("#teoyubeSearchInput")).toHaveValue("Romans 8:28-30");
  await expect(page.locator("#teoyubeSearchInput")).toBeFocused();
  await expect(page.locator("#phase113SaveDrawer")).toContainText("Search suggestion loaded");
  await page.locator('button[data-phase116-action="clear-search-suggestions"]').click();
  await expect(page.locator("#phase113SaveDrawer")).toContainText("Search suggestions cleared");

  await page.getByLabel("List view").click();
  await expect(page.getByLabel("Grid view")).toHaveClass("active");
  await page.getByLabel("Sort search results").selectOption("Calling Match");
  await expect(page.getByLabel("Sort search results")).toHaveValue("Calling Match");
  await page.locator(".search-bookmark").first().click();

  const card = page.locator("#teoyubeSearchResults > article").first();
  await expect(card.locator(".result-actions button")).toHaveCount(5);
  await expect(card.locator(".phase115-feedback-controls button")).toHaveCount(8);
  await card.locator(".search-save-book").click();
  await expect(page.locator("#phase113SaveDrawer")).toContainText("Search result saved");
  await card.locator(".search-open-graph").click();
  await expect(page.getByRole("dialog", { name: "Recommendation graph" })).toBeVisible();
  await page.getByRole("dialog", { name: "Recommendation graph" }).getByRole("button", { name: "Close graph explorer" }).click();
  await card.locator('[data-phase115-action="compare-recommendation"]').last().click();
  await expect(page.getByRole("dialog", { name: "Recommendation comparison" })).toBeVisible();
  await page.getByRole("dialog", { name: "Recommendation comparison" }).getByRole("button", { name: "Close recommendation comparison" }).click();
  await card.locator(".phase114-explanation-path summary").click();
  await expect(card.locator(".phase114-explanation-path")).toHaveAttribute("open", "");
  await card.locator(".phase116-why-this-panel summary").click();
  await card.locator('.phase116-panel-actions [data-phase116-action="open-graph"]').click();
  await expect(page.getByRole("dialog", { name: "Recommendation graph" })).toBeVisible();
  await page.getByRole("dialog", { name: "Recommendation graph" }).getByRole("button", { name: "Close graph explorer" }).click();

  for (const button of await card.locator(".phase115-feedback-controls button").all()) {
    await button.click();
    await expect(page.locator("#phase113SaveDrawer")).toHaveClass(/visible/);
  }
  await card.locator(".search-add-table").click();
  await page.waitForURL(/\/promise-table$/);
  expect(new URL(page.url()).pathname).toBe("/promise-table");
});

test("Explore Journey keeps the approved Teo Guide destination", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/search`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.view === "search");
  await page.locator(".search-generate-prayer").first().click();
  await page.waitForURL(/\/teo-guide$/);
  expect(new URL(page.url()).pathname).toBe("/teo-guide");
});
