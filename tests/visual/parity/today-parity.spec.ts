import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { captureRichContract, installDeterminism, openStaticView, settlePage } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { assertDisposableCandidatePath, candidateRoot, runtimeManifest, type ViewportName } from "./config";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";
const evidenceRoot = path.join(candidateRoot, "today-owner-review");

async function alignApprovedTodayScope(page: Page, runtime: "static" | "next") {
  if (runtime === "static") {
    await page.evaluate(() => {
      for (const selector of [
        "#phase116bTodayCommandCenter",
        "#phase116b1Continuation-today",
        "#phase115SmartRecommendations-today"
      ]) document.querySelector(selector)?.remove();
    });
  }
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
        // A browser-owned animation may not expose writable timing state.
      }
    }
  });
}

function scopeFrameworkParents(contract: Awaited<ReturnType<typeof captureRichContract>>) {
  return {
    ...contract,
    orderedDom: contract.orderedDom.map((row) => {
      const entry = row as Record<string, unknown>;
      const attributes = (entry.attributes as Array<[string, string]> | undefined)?.map(([name, value]) => [
        name,
        name === "style"
          ? value
              .replace(/object-position:\s*center center/g, "object-position:center")
              .replace(/:\s*/g, ":")
              .replace(/;\s*$/, "")
          : value
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

async function activeState(page: Page) {
  return page.evaluate(() => ({
    promise: [...document.querySelectorAll("#promiseCarouselDots button")].findIndex((item) => item.classList.contains("active")),
    promiseTitle: document.querySelector("#dailyTheme")?.textContent?.trim(),
    story: [...document.querySelectorAll(".featured-story-dots button")].findIndex((item) => item.classList.contains("active")),
    storyTitle: document.querySelector("#promiseMovieResult h3")?.textContent?.trim(),
    query: (document.querySelector("#promiseMovieInput") as HTMLInputElement | null)?.value,
    status: document.querySelector("#promiseMovieStatus")?.textContent?.trim()
  }));
}

async function exerciseTodayActions(page: Page) {
  const initial = await activeState(page);
  await page.locator("#carouselNext").click();
  const nextPromise = await activeState(page);
  await page.locator("#todayPromiseCarousel").press("ArrowLeft");
  const keyboardPromise = await activeState(page);
  await page.locator('#promiseCarouselDots button[data-slide-index="4"]').click();
  const selectedPromise = await activeState(page);
  await page.locator("#todayPromiseCarousel").dispatchEvent("pointerdown", { clientX: 200 });
  await page.locator("#todayPromiseCarousel").dispatchEvent("pointerup", { clientX: 100 });
  const swipedPromise = await activeState(page);
  await page.locator("#featuredStoryNext").click();
  const nextStory = await activeState(page);
  await page.locator("#featuredStoryCarousel").press("ArrowLeft");
  const keyboardStory = await activeState(page);
  await page.locator('.featured-story-dots button[data-featured-story-index="3"]').click();
  const selectedStory = await activeState(page);
  await page.locator("#featuredStoryCarousel").dispatchEvent("pointerdown", { clientX: 200 });
  await page.locator("#featuredStoryCarousel").dispatchEvent("pointerup", { clientX: 100 });
  const swipedStory = await activeState(page);
  await page.locator("#promiseMovieInput").fill("TeoyubeWorld devotionals");
  await page.locator("#promiseMovieForm").press("Enter");
  const search = await activeState(page);
  await page.locator('button[data-world-query="TeoyubeWorld articles"]').click();
  const filter = await activeState(page);
  const unavailableFeed = await page.locator('button.today-video-select[data-today-video-index="2"]').isDisabled();
  await page.locator('.featured-story-dots button[data-featured-story-index="2"]').click();
  const feed = await activeState(page);
  const mainPlayDisabled = await page.locator(".promise-embed-play-overlay").isDisabled();
  const navigationControlCount = await page.locator('#promiseMovieResult [data-today-video-nav]').count();
  await page.locator("#reflectionInput").fill("A voluntary reflection");
  await page.locator("#completeAssignment").click();
  const assignment = await page.evaluate(() => ({
    reflection: (document.querySelector("#reflectionInput") as HTMLTextAreaElement | null)?.value,
    drawerVisible: document.querySelector("#phase113SaveDrawer")?.classList.contains("visible"),
    drawerText: document.querySelector("#phase113SaveDrawer")?.textContent?.replace(/\s+/g, " ").trim()
  }));
  return { initial, nextPromise, keyboardPromise, selectedPromise, swipedPromise, nextStory, keyboardStory, selectedStory, swipedStory, search, filter, feed, unavailableFeed, mainPlayDisabled, navigationControlCount, assignment };
}

test("approved Today candidate matches at every required viewport", async ({ browser }) => {
  test.setTimeout(480_000);
  assertDisposableCandidatePath(evidenceRoot);
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const summary: Array<Record<string, unknown>> = [];
  for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
    if (process.env.TEOYUBE_TODAY_VIEWPORT && process.env.TEOYUBE_TODAY_VIEWPORT !== viewportName) continue;
    const staticContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
    const nextContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
    await installDeterminism(staticContext, [new URL(staticBaseUrl).origin]);
    await installDeterminism(nextContext, [new URL(nextBaseUrl).origin]);
    const staticPage = await staticContext.newPage();
    const nextPage = await nextContext.newPage();
    const viewportOutput = path.join(evidenceRoot, viewportName);
    try {
      await staticPage.goto(`${staticBaseUrl}/index.html#today`, { waitUntil: "domcontentloaded" });
      await openStaticView(staticPage, "today");
      await nextPage.goto(`${nextBaseUrl}/`, { waitUntil: "domcontentloaded" });
      await nextPage.waitForFunction(() => document.body.dataset.view === "today");
      await settlePage(nextPage);
      await alignApprovedTodayScope(staticPage, "static");
      await alignApprovedTodayScope(nextPage, "next");
      const staticContract = scopeFrameworkParents(await captureRichContract(staticPage, "#today"));
      const nextContract = scopeFrameworkParents(await captureRichContract(nextPage, "#today"));
      fs.mkdirSync(viewportOutput, { recursive: true });
      fs.writeFileSync(path.join(viewportOutput, "today.static.contract.json"), `${JSON.stringify(staticContract, null, 2)}\n`, "utf8");
      fs.writeFileSync(path.join(viewportOutput, "today.next.contract.json"), `${JSON.stringify(nextContract, null, 2)}\n`, "utf8");
      expect(compareRichContracts(staticContract, nextContract), `${viewportName} Today contract`).toEqual([]);
      const staticScreenshot = path.join(viewportOutput, "today.static.png");
      const nextScreenshot = path.join(viewportOutput, "today.next.png");
      await captureViewport(staticPage, staticScreenshot);
      await captureViewport(nextPage, nextScreenshot);
      const comparison = await compareScreenshots(staticScreenshot, nextScreenshot, viewportOutput, "today", true, false);
      expect(comparison.strictPassed, `${viewportName} Today raster ratio ${comparison.differentPixelRatio}`).toBe(true);
      summary.push({ viewport: viewportName, width: viewport.width, height: viewport.height, comparison });
      console.log(`Today parity compared ${viewportName}`);
    } finally {
      await staticContext.close();
      await nextContext.close();
    }
  }
  fs.writeFileSync(path.join(evidenceRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
});

test("Today typed actions preserve the approved functional sequence", async ({ browser }) => {
  test.setTimeout(180_000);
  const viewport = runtimeManifest.viewports["desktop-wide"];
  const context = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
  await installDeterminism(context, [new URL(nextBaseUrl).origin]);
  const page = await context.newPage();
  try {
    await page.goto(`${nextBaseUrl}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.dataset.view === "today");
    await settlePage(page);
    const result = await exerciseTodayActions(page);
    expect(result.initial).toMatchObject({ promise: 0, story: 0, query: "TeoyubeWorld" });
    expect(result.nextPromise.promise).toBe(1);
    expect(result.keyboardPromise.promise).toBe(0);
    expect(result.selectedPromise.promise).toBe(4);
    expect(result.swipedPromise.promise).toBe(5);
    expect(result.nextStory.story).toBe(1);
    expect(result.keyboardStory.story).toBe(0);
    expect(result.selectedStory.story).toBe(3);
    expect(result.swipedStory.story).toBe(4);
    expect(result.search).toMatchObject({ query: "TeoyubeWorld devotionals", story: 0 });
    expect(result.search.status).toContain('8 TeoyubeWorld feed items for "TeoyubeWorld devotionals"');
    expect(result.filter).toMatchObject({ query: "TeoyubeWorld articles", story: 0 });
    expect(result.unavailableFeed).toBe(true);
    expect(result.feed.story).toBe(2);
    expect(result.mainPlayDisabled).toBe(true);
    expect(result.navigationControlCount).toBe(2);
    expect(result.assignment).toMatchObject({ reflection: "", drawerVisible: true });
    expect(result.assignment.drawerText).toContain("Assignment recorded");
  } finally {
    await context.close();
  }
});

test("Today prayer action keeps the approved Teo Guide route", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.locator("#prayBtn").click();
  await page.waitForURL(/\/teo-guide$/);
  expect(new URL(page.url()).pathname).toBe("/teo-guide");
});

test("Today carousels advance automatically and pause on hover", async ({ page }) => {
  test.setTimeout(60_000);
  await page.clock.install({ time: new Date("2026-07-18T12:00:00.000Z") });
  await page.goto(`${nextBaseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.view === "today");
  expect((await activeState(page)).promise).toBe(0);
  await page.clock.fastForward(8_000);
  expect((await activeState(page)).promise).toBe(1);
  await page.locator("#todayPromiseCarousel").hover();
  await page.clock.fastForward(8_000);
  expect((await activeState(page)).promise).toBe(1);
  await page.locator(".topbar").hover();
  await page.clock.fastForward(8_000);
  expect((await activeState(page)).promise).toBe(2);
});
