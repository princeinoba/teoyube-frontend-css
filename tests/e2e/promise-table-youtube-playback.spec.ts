import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const mappings = [
  { id: "local-seed-of-promise", title: "The Seed of Promise", videoId: "4zM2olpouIo" },
  { id: "local-power-of-prayer", title: "The Power of Prayer", videoId: "yLBb7JCMqJE" },
  { id: "local-walk-in-purpose", title: "Walk in Divine Purpose", videoId: "yDu0bD1lukE" },
  { id: "local-rooted-in-truth", title: "Rooted in His Word", videoId: "tnjdlvbaBY8" },
  { id: "local-called-for-more", title: "Called for More", videoId: "chLnoAGxyrc" },
  { id: "local-strength-for-today", title: "Strength for Today", videoId: "jAmIjP7-T5w" },
  { id: "local-promise-language", title: "Promise Language and Calling", videoId: "I8Y3syhDG64" },
  { id: "local-daily-assignment", title: "Daily Divine Assignment", videoId: "YY9VYdPUVf8" }
] as const;

const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

function embedPattern(videoId: string) {
  return new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${videoId}\\?`);
}

async function installDeterministicYouTube(page: Page) {
  const requests: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    if (route.request().url().includes("/embed/")) requests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html lang=\"en\"><body>TeoyubeWorld playback audit</body></html>"
    });
  });
  return requests;
}

async function openPromiseTable(page: Page) {
  await page.goto("/promise-table", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: "*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }"
  });
  await expect(page.locator("body")).toHaveAttribute("data-view", "table");
  await expect(page.locator("body")).toHaveAttribute("data-promise-table-teoyube-world-playback", "ready");
  await expect(page.locator("#promiseTableVideoPanel")).toHaveAttribute("data-playback-state", "idle");
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

async function expectPlayer(page: Page, mapping: (typeof mappings)[number]) {
  const panel = page.locator("#promiseTableVideoPanel");
  const frame = panel.locator("iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("src", embedPattern(mapping.videoId));
  await expect(frame).toHaveAttribute("title", `TeoyubeWorld video: ${mapping.title}`);
  await expect(frame).toHaveAttribute("allow", "autoplay; encrypted-media; picture-in-picture; web-share");
  await expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  await expect(frame).toHaveAttribute("allowfullscreen", "");
  await expect(panel).toHaveAttribute("data-active-video-id", mapping.id);
  await expect(panel).toHaveAttribute("data-playback-state", "playing");
  await expect(panel.locator(".promise-table-featured-copy h3")).toHaveText(mapping.title);
  await expect(panel.locator(".promise-table-video-artwork")).toBeHidden();
  await expect(panel.locator(".promise-table-embed-play-overlay")).toBeHidden();
}

test("Promise Table controls one click-to-load TeoyubeWorld player", async ({ page }) => {
  const requests = await installDeterministicYouTube(page);
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await openPromiseTable(page);
  const panel = page.locator("#promiseTableVideoPanel");
  const frame = panel.locator("iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).not.toHaveAttribute("src", /youtube-nocookie/);
  expect(requests).toEqual([]);
  await expect(page.locator("#phase117OfflineStatus small")).toContainText(
    "YouTube media connects only after you press Play"
  );

  const initialHeight = await panel.evaluate((element) => (element as HTMLElement).offsetHeight);
  const mainPlay = panel.locator(".promise-table-embed-play-overlay");
  await mainPlay.focus();
  await expect(mainPlay).toBeFocused();
  await page.keyboard.press("Enter");
  await expectPlayer(page, mappings[0]);
  await expect.poll(() => requests.length).toBe(1);
  const activeHeight = await panel.evaluate((element) => (element as HTMLElement).offsetHeight);
  expect(Math.abs(activeHeight - initialHeight)).toBeLessThanOrEqual(1);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#promiseTableVideoPanel")).toHaveAttribute("data-playback-state", "idle");
  const watchNow = page.locator("#promiseTableVideoPanel .promise-table-watch-now");
  await watchNow.focus();
  await page.keyboard.press("Space");
  await expectPlayer(page, mappings[0]);

  const next = page.locator("#promiseTableVideoPanel .promise-table-next-video");
  await next.focus();
  await page.keyboard.press("Enter");
  await expectPlayer(page, mappings[1]);
  const previous = page.getByRole("button", { name: "Previous Promise Table video" });
  await previous.focus();
  await page.keyboard.press("Space");
  await expectPlayer(page, mappings[0]);
  await expect(page.locator("#promiseTableVideoPanel iframe")).toHaveCount(1);

  const firstCard = page
    .locator(`#promiseTableSearchResults .promise-search-item[data-promise-table-media-id="${mappings[0].id}"]`)
    .first();
  const whyThis = firstCard.locator(".phase116-why-this-panel");
  await whyThis.locator("summary").click();
  await expect(whyThis).toHaveAttribute("open", "");

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("every current Watch Video card maps by stable ID and replaces the same iframe", async ({ page }) => {
  const requests = await installDeterministicYouTube(page);
  await openPromiseTable(page);
  const frame = page.locator("#promiseTableVideoPanel iframe");

  for (const mapping of mappings) {
    const card = page
      .locator(`#promiseTableSearchResults .promise-search-item[data-promise-table-media-id="${mapping.id}"]`)
      .first();
    const play = card.locator(".promise-watch-video");
    await expect(play).toBeEnabled();
    await expect(play).toHaveAttribute("aria-disabled", "false");
    await play.scrollIntoViewIfNeeded();
    await play.focus();
    const { before, after } = await play.evaluate(async (button: HTMLButtonElement) => {
      const before = window.scrollY;
      button.click();
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      return { before, after: window.scrollY };
    });
    expect(Math.abs(after - before), `${mapping.id} changed scroll from ${before} to ${after}`).toBeLessThanOrEqual(1);
    await expectPlayer(page, mapping);
    await expect(play).toBeFocused();
    await expect(frame).toHaveCount(1);
  }

  expect(requests).toHaveLength(mappings.length);
  await expect(page.locator("#promiseTableVideoPanel iframe")).toHaveCount(1);
});

for (const viewport of [
  { label: "desktop-wide", width: 1536, height: 1024 },
  { label: "desktop", width: 1440, height: 900 },
  { label: "desktop-standard", width: 1280, height: 800 },
  { label: "tablet-landscape", width: 1024, height: 768 },
  { label: "tablet-portrait", width: 768, height: 1024 },
  { label: "mobile", width: 390, height: 844 }
]) {
  test(`Promise Table player remains contained at ${viewport.label}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    await installDeterministicYouTube(page);
    await openPromiseTable(page);

    const panel = page.locator("#promiseTableVideoPanel");
    const initialHeight = await panel.evaluate((element) => (element as HTMLElement).offsetHeight);
    await panel.locator(".promise-table-embed-play-overlay").click();
    await expectPlayer(page, mappings[0]);
    const geometry = await page.evaluate(() => {
      const pagePanel = document.querySelector<HTMLElement>("#promiseTableVideoPanel");
      const frameShell = document.querySelector<HTMLElement>("#promiseTableVideoPanel .promise-table-video-frame");
      const frame = document.querySelector<HTMLIFrameElement>("#promiseTableVideoPanel iframe");
      const notice = document.querySelector<HTMLElement>("#phase117OfflineStatus");
      if (!pagePanel || !frameShell || !frame) throw new Error("Promise Table player geometry is missing.");
      const panelRect = pagePanel.getBoundingClientRect();
      const shellRect = frameShell.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const noticeRect = notice?.getBoundingClientRect();
      const controls = [...pagePanel.querySelectorAll<HTMLElement>("button")].map((button) => button.getBoundingClientRect());
      const noticeCoversControl = noticeRect
        ? controls.some((control) =>
            noticeRect.left < control.right && noticeRect.right > control.left &&
            noticeRect.top < control.bottom && noticeRect.bottom > control.top)
        : false;
      return {
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        frameInsideShell:
          frameRect.left >= shellRect.left - 1 && frameRect.right <= shellRect.right + 1 &&
          frameRect.top >= shellRect.top - 1 && frameRect.bottom <= shellRect.bottom + 1,
        shellInsidePanel: shellRect.left >= panelRect.left - 1 && shellRect.right <= panelRect.right + 1,
        noticeCoversControl
      };
    });
    const activeHeight = await panel.evaluate((element) => (element as HTMLElement).offsetHeight);
    expect(Math.abs(activeHeight - initialHeight)).toBeLessThanOrEqual(1);
    expect(geometry.documentOverflow).toBeLessThanOrEqual(1);
    expect(geometry.frameInsideShell).toBe(true);
    expect(geometry.shellInsidePanel).toBe(true);
    expect(geometry.noticeCoversControl).toBe(false);
    await expect(panel.locator(".promise-table-watch-now")).toBeVisible();
    await expect(panel.locator(".promise-table-next-video")).toBeVisible();
    await expect(page.locator("#promiseTableSearchResults .promise-watch-video").first()).toBeVisible();
    await expect(page.locator("#promiseTableSearchResults .phase116-why-this-panel summary").first()).toBeVisible();
    await context.close();
  });
}

test("Promise Table playback remains operable at 200 percent zoom and passes focused Axe", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await installDeterministicYouTube(page);
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  await openPromiseTable(page);
  const play = page.locator("#promiseTableVideoPanel .promise-table-embed-play-overlay");
  await play.focus();
  await expect(play).toBeFocused();
  await page.keyboard.press("Space");
  await expectPlayer(page, mappings[0]);
  await page.addScriptTag({ content: axeSource });
  const seriousViolations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run(context: string, options: unknown): Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe;
    const result = await axe.run("#promiseTableVideoPanel, #promiseTableSearchResults", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }
    });
    return result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  });
  expect(seriousViolations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await context.close();
});
