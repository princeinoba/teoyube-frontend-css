import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const mappings = [
  { id: "local-seed-of-promise", title: "The Seed of Promise", videoId: "4zM2olpouIo" },
  { id: "local-power-of-prayer", title: "The Power of Prayer", videoId: "yLBb7JCMqJE" },
  { id: "local-walk-in-purpose", title: "Walk in Divine Purpose", videoId: "yDu0bD1lukE" },
  { id: "local-rooted-in-word", title: "Rooted in His Word", videoId: "tnjdlvbaBY8" },
  { id: "local-called-for-more", title: "Called for More", videoId: "chLnoAGxyrc" },
  { id: "local-strength-for-today", title: "Strength for Today", videoId: "jAmIjP7-T5w" },
  { id: "local-promise-language", title: "Promise Language and Calling", videoId: "I8Y3syhDG64" },
  { id: "local-daily-assignment", title: "Daily Divine Assignment", videoId: "YY9VYdPUVf8" }
] as const;

const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function installDeterministicYouTube(page: Page) {
  const requests: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    if (route.request().url().includes("/embed/")) requests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html lang=\"en\"><body>Calling Compass TeoyubeWorld playback audit</body></html>"
    });
  });
  return requests;
}

function embedPattern(videoId: string) {
  return new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${videoId}\\?`);
}

async function openCallingCompass(page: Page) {
  await page.goto("/calling-compass", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toHaveAttribute("data-view", "calling");
  await expect(page.locator("#compassVideoPlayer .compass-embed-play-overlay")).toBeVisible();
  await expect(page.locator("#compassVideoList .compass-video-item")).toHaveCount(mappings.length);
}

async function expectFeaturedPlayer(page: Page, mapping: (typeof mappings)[number]) {
  const player = page.locator("#compassVideoPlayer");
  const frame = player.locator(".compass-video-frame iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("src", embedPattern(mapping.videoId));
  await expect(frame).toHaveAttribute("title", `TeoyubeWorld video: ${mapping.title}`);
  await expect(frame).toHaveAttribute("allow", "autoplay; encrypted-media; picture-in-picture; web-share");
  await expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  await expect(frame).toHaveAttribute("allowfullscreen", "");
  await expect(frame).not.toHaveAttribute("loading", "lazy");
  await expect(player).toHaveAttribute("data-active-video-id", mapping.id);
  await expect(player).toHaveAttribute("data-playback-state", "playing");
  await expect(player.locator(".compass-featured-meta h4")).toHaveText(mapping.title);
  await expect(player.locator(".compass-video-frame img")).toBeHidden();
  await expect(player.locator(".local-media-disabled-copy")).toBeHidden();
  await expect(player.locator(".compass-embed-play-overlay")).toBeHidden();
}

test("featured Play loads the current Up Next item only after explicit activation", async ({ page }) => {
  const requests = await installDeterministicYouTube(page);
  await openCallingCompass(page);

  const shell = page.locator("#compassVideoPlayer .compass-video-frame");
  const initialBox = await shell.boundingBox();
  await expect(shell.locator("iframe")).toHaveCount(0);
  expect(requests).toEqual([]);

  const play = page.locator("#compassVideoPlayer .compass-embed-play-overlay");
  await play.focus();
  await page.keyboard.press("Enter");
  await expectFeaturedPlayer(page, mappings[0]);
  await expect.poll(() => requests.length).toBe(1);
  const activeBox = await shell.boundingBox();
  expect(initialBox).not.toBeNull();
  expect(activeBox).not.toBeNull();
  expect(Math.abs((activeBox?.height || 0) - (initialBox?.height || 0))).toBeLessThanOrEqual(1);

  await page.locator('[data-compass-video-nav="next"]').click();
  await expectFeaturedPlayer(page, mappings[1]);
  await page.locator('[data-compass-video-nav="previous"]').click();
  await expectFeaturedPlayer(page, mappings[0]);
  await expect(page.locator("#compassVideoPlayer iframe")).toHaveCount(1);
});

test("every Up Next playlist button plays its exact corresponding official video", async ({ page }) => {
  const requests = await installDeterministicYouTube(page);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await openCallingCompass(page);

  const buttons = page.locator("#compassVideoList .compass-video-item");
  for (let index = 0; index < mappings.length; index += 1) {
    const mapping = mappings[index];
    const button = buttons.nth(index);
    await expect(button).toBeEnabled();
    await expect(button).toContainText(mapping.title);
    await button.scrollIntoViewIfNeeded();
    await button.focus();
    await page.keyboard.press(index % 2 === 0 ? "Enter" : "Space");
    await expectFeaturedPlayer(page, mapping);
    await expect(button).toBeFocused();
    await expect(button).toHaveClass(/active/);
  }

  expect(requests).toHaveLength(mappings.length);
  expect(requests.map((url) => new URL(url).pathname.split("/").pop())).toEqual(mappings.map((mapping) => mapping.videoId));
  expect(pageErrors).toEqual([]);
  await expect(page.locator("#compassVideoPlayer iframe")).toHaveCount(1);
});

test("Calling Compass video controls remain accessible and contained on mobile", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await installDeterministicYouTube(page);
  await openCallingCompass(page);
  await page.locator("#compassVideoList .compass-video-item").nth(2).click();
  await expectFeaturedPlayer(page, mappings[2]);

  const geometry = await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>("#compassVideoPlayer .compass-video-frame");
    const frame = shell?.querySelector<HTMLIFrameElement>("iframe");
    if (!shell || !frame) throw new Error("Calling Compass featured player is missing.");
    const shellRect = shell.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      frameInsideShell:
        frameRect.left >= shellRect.left - 1 && frameRect.right <= shellRect.right + 1 &&
        frameRect.top >= shellRect.top - 1 && frameRect.bottom <= shellRect.bottom + 1
    };
  });
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.frameInsideShell).toBe(true);

  await page.addScriptTag({ content: axeSource });
  const seriousViolations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run(context: string, options: unknown): Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe;
    const result = await axe.run("#compassVideoPlayer, #compassVideoList", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }
    });
    return result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  });
  expect(seriousViolations).toEqual([]);
  await context.close();
});