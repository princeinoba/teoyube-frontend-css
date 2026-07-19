import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { captureRichContract, installDeterminism, openStaticView, settlePage } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { assertDisposableCandidatePath, candidateRoot, runtimeManifest, type ViewportName } from "./config";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";
const journalStructuralDigest = "40ce99c2ca02c7beaca58d164000ef50c0e0ddf6cda09c30d282a0c4001f9196";

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

async function preservedSurfaceContract(page: Page) {
  return page.locator("#appMain > main").evaluate((root) => {
    const normalize = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim();
    return [root, ...root.querySelectorAll("*")].map((element) => ({
      attributes: [...element.attributes].filter((attribute) => !/^(data-(nextjs|react|test)|data-testid$|nonce$)/i.test(attribute.name)).map((attribute) => [attribute.name, normalize(attribute.value)]).sort(([left], [right]) => left.localeCompare(right)),
      className: element.getAttribute("class") || "",
      directText: normalize([...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent || "").join(" ")),
      id: element.id || "",
      tag: element.tagName.toLowerCase()
    }));
  });
}

for (const definition of [
  { view: "book" as const, route: "/book" },
  { view: "testimony" as const, route: "/testimony" }
]) {
  test(`approved ${definition.view} candidate matches at every required viewport`, async ({ browser }) => {
    test.setTimeout(600_000);
    const evidenceRoot = path.join(candidateRoot, "journal-testimony-book-owner-review", definition.view);
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
        await staticPage.goto(`${staticBaseUrl}/index.html#${definition.view}`, { waitUntil: "domcontentloaded" });
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

test("Journal keeps its pre-migration DOM, classes, labels, and responsive render", async ({ browser }) => {
  test.setTimeout(300_000);
  const evidenceRoot = path.join(candidateRoot, "journal-testimony-book-owner-review", "journal");
  assertDisposableCandidatePath(evidenceRoot);
  for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
    const context = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
    await installDeterminism(context, [new URL(nextBaseUrl).origin]);
    const page = await context.newPage();
    try {
      await page.goto(`${nextBaseUrl}/journal`, { waitUntil: "domcontentloaded" });
      await settlePage(page);
      const contract = await preservedSurfaceContract(page);
      const output = path.join(evidenceRoot, viewportName);
      fs.mkdirSync(output, { recursive: true });
      fs.writeFileSync(path.join(output, "journal.contract.json"), `${JSON.stringify(contract, null, 2)}\n`, "utf8");
      await captureViewport(page, path.join(output, "journal.png"));
      expect(crypto.createHash("sha256").update(JSON.stringify(contract)).digest("hex"), `${viewportName} journal structural digest`).toBe(journalStructuralDigest);
    } finally {
      await context.close();
    }
  }
});

test("Journal saves only a redacted session summary", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/journal`, { waitUntil: "domcontentloaded" });
  const storageBefore = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }));
  await page.getByLabel("Journal reflection").fill("Contact saint@example.com or +1 (416) 555-0199");
  await page.getByRole("button", { name: "Add Reflection" }).click();
  await expect(page.locator(".activity-list .mini-card")).toContainText("[redacted email]");
  await expect(page.locator(".activity-list .mini-card")).toContainText("[redacted phone]");
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual(storageBefore);
});

test("Testimony remains user-reviewed, reversible, and separate from the Book", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/testimony`, { waitUntil: "domcontentloaded" });
  await page.locator("#testimonyTitle").fill("A user-reviewed account");
  await page.locator("#testimonyBody").fill("I chose to record this account for later review.");
  await page.locator("#testimonyForm").getByRole("button", { name: "Save Testimony" }).click();
  const card = page.locator(".testimony-entry", { hasText: "A user-reviewed account" });
  await expect(card.locator(".testimony-status-badge")).toHaveText("Draft");
  await expect(page.locator("#phase113SaveDrawer")).toContainText("not added to the Book");
  await card.locator('[data-phase116b-action="testimony-status"]').click();
  await expect(card.locator(".testimony-status-badge")).toHaveText("Private");
  await card.locator('[data-phase116b-action="testimony-delete"]').click();
  await expect(card).toHaveCount(0);
  await page.locator("#phase113SaveDrawer").getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".testimony-entry", { hasText: "A user-reviewed account" })).toHaveCount(1);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("Book journal action does not silently promote a reflection", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/book`, { waitUntil: "domcontentloaded" });
  await page.locator("#bookSearchInput").fill("no matching reflection");
  await expect(page.locator("#bookTimeline .timeline-entry")).toBeHidden();
  await page.locator('[data-phase116-action="clear-search-suggestions"]').click();
  await expect(page.locator("#bookTimeline .timeline-entry")).toBeVisible();
  await page.locator("#phase116bJournalTitle").fill("Private review");
  await page.locator("#phase116bJournalContent").fill("A reflection that needs review.");
  await page.locator('[data-phase116b-action="journal-save"]').click();
  await expect(page.locator("#phase113SaveDrawer")).toContainText("It was not promoted to the Book");
  await expect(page.locator("#bookTimeline")).not.toContainText("Private review");
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});
