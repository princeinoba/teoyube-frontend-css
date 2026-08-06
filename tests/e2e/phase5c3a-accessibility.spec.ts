import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "desktop-wide", width: 1440, height: 900 },
  { name: "desktop-standard", width: 1280, height: 800 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-small", width: 360, height: 800 }
] as const;

const routes = [
  { route: "/", selectors: ["#promiseCarouselDots button[data-slide-index]", ".featured-story-dots button[data-featured-story-index]"] },
  { route: "/book", selectors: ["#book .book-toolbar .phase116-chip-row button.phase116-chip", "#phase115BookMemory .phase115-memory-filters button"] },
  { route: "/canon", selectors: [".canon-watchman-story-card .canon-watchman-video-dots button[data-watchman-video-index]"] },
  { route: "/explore", selectors: [".tab-list button.tab"] }
] as const;

async function assertTargets(page: Page, selectors: readonly string[]) {
  for (const selector of selectors) {
    const targets = page.locator(selector);
    expect(await targets.count(), selector).toBeGreaterThan(0);
    const measurements = await targets.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      const name = element.getAttribute("aria-label") || element.textContent?.trim() || element.getAttribute("title") || "";
      return { width: rect.width, height: rect.height, name, visible: Boolean(rect.width && rect.height), tabIndex: (element as HTMLElement).tabIndex };
    }));
    for (const target of measurements) {
      expect(target.visible, selector).toBe(true);
      expect(target.width, selector).toBeGreaterThanOrEqual(24);
      expect(target.height, selector).toBeGreaterThanOrEqual(24);
      expect(target.name, selector).not.toBe("");
      expect(target.tabIndex, selector).toBeLessThanOrEqual(0);
    }
    const overlaps = await targets.evaluateAll((elements) => {
      const rects = elements.map((element) => element.getBoundingClientRect());
      return rects.slice(0, -1).filter((rect, index) => {
        const next = rects[index + 1];
        return rect.right > next.left && rect.left < next.right && rect.bottom > next.top && rect.top < next.bottom;
      }).length;
    });
    expect(overlaps, selector).toBe(0);
  }
}

async function exercisePointerAndKeyboard(page: Page, route: string, hasTouch: boolean) {
  if (route === "/") {
    const promise = page.locator("#promiseCarouselDots button[data-slide-index='1']");
    if (hasTouch) await promise.tap(); else await promise.click();
    await expect(promise).toHaveAttribute("aria-current", "true");
    const promiseKeyboard = page.locator("#promiseCarouselDots button[data-slide-index='2']");
    await promiseKeyboard.focus();
    await promiseKeyboard.press("Enter");
    await expect(promiseKeyboard).toHaveAttribute("aria-current", "true");
    const featured = page.locator(".featured-story-dots button[data-featured-story-index='1']");
    await featured.click();
    await expect(featured).toHaveAttribute("aria-current", "true");
    return;
  }
  if (route === "/book") {
    const chip = page.locator("#book .book-toolbar button[data-phase116-query='reflection']");
    if (hasTouch) await chip.tap(); else await chip.click();
    await expect(page.locator("#bookSearchInput")).toHaveValue("reflection");
    const keyboardChip = page.locator("#book .book-toolbar button[data-phase116-query='testimony']");
    await keyboardChip.focus();
    await keyboardChip.press("Enter");
    await expect(page.locator("#bookSearchInput")).toHaveValue("testimony");
    const filter = page.locator("#phase115BookMemory button[data-phase115-memory-filter='today']");
    if (hasTouch) await filter.tap(); else await filter.click();
    await filter.focus();
    await expect(filter).toBeFocused();
    await expect(filter).not.toHaveClass(/active/);
    return;
  }
  if (route === "/canon") {
    const dot = page.locator(".canon-watchman-story-card button[data-watchman-video-index='1']");
    if (hasTouch) await dot.tap(); else await dot.click();
    await expect(dot).toHaveAttribute("aria-current", "true");
    const keyboardDot = page.locator(".canon-watchman-story-card button[data-watchman-video-index='2']");
    await keyboardDot.focus();
    await keyboardDot.press(" ");
    await expect(keyboardDot).toHaveAttribute("aria-current", "true");
    return;
  }
  const tab = page.locator(".tab-list button.tab", { hasText: "Clusters" });
  if (hasTouch) await tab.tap(); else await tab.click();
  await expect(tab).toHaveClass(/active/);
  const keyboardTab = page.locator(".tab-list button.tab", { hasText: "Words" });
  await keyboardTab.focus();
  await keyboardTab.press("Enter");
  await expect(keyboardTab).toHaveClass(/active/);
}

test("A11Y-007 targets remain 24 by 24, non-overlapping, named, and operable in every approved viewport", async ({ browser }) => {
  test.setTimeout(300_000);
  for (const viewport of viewports) {
    const hasTouch = viewport.width <= 768;
    const context = await browser.newContext({ viewport, hasTouch, reducedMotion: "reduce" });
    try {
      const page = await context.newPage();
      for (const entry of routes) {
        await page.goto(`${entry.route}?ownerQa=1`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
        await page.waitForTimeout(250);
        await assertTargets(page, entry.selectors);
        await exercisePointerAndKeyboard(page, entry.route, hasTouch);
      }
    } finally {
      await context.close();
    }
  }
}, 180_000);
