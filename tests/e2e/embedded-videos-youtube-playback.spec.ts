import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const youtubeTabs = {
  "All Videos": [
    ["local-seed-of-promise", "The Seed of Promise", "4zM2olpouIo"],
    ["local-power-of-prayer", "The Power of Prayer", "yLBb7JCMqJE"],
    ["local-walk-in-purpose", "Walk in Divine Purpose", "yDu0bD1lukE"],
    ["local-rooted-in-truth", "Rooted in His Word", "tnjdlvbaBY8"]
  ],
  Teachings: [
    ["local-seed-of-promise", "The Seed of Promise", "4zM2olpouIo"],
    ["local-walk-in-purpose", "Walk in Divine Purpose", "yDu0bD1lukE"],
    ["local-promise-language", "Promise Language and Calling", "I8Y3syhDG64"]
  ],
  Worship: [["local-strength-for-today", "Strength for Today", "jAmIjP7-T5w"]],
  Messages: [
    ["local-power-of-prayer", "The Power of Prayer", "yLBb7JCMqJE"],
    ["local-daily-assignment", "Daily Divine Assignment", "YY9VYdPUVf8"]
  ],
  Documentaries: [["local-rooted-in-truth", "Rooted in His Word", "tnjdlvbaBY8"]],
  Shorts: [["local-called-for-more", "Called for More", "chLnoAGxyrc"]]
} as const;

const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function installDeterministicYouTube(page: Page) {
  const requests: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    if (route.request().url().includes("/embed/")) requests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html lang=\"en\"><body>Embedded Videos TeoyubeWorld playback audit</body></html>"
    });
  });
  return requests;
}

async function openEmbeddedVideos(page: Page) {
  await page.goto("/embedded-videos", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toHaveAttribute("data-view", "ui-elements");
  await expect(page.locator("#uiVideoCategoryTabs [data-video-category]")).toHaveCount(7);
}

async function chooseTab(page: Page, tab: string) {
  await page.locator(`#uiVideoCategoryTabs [data-video-category="${tab}"]`).click();
}

async function expectYouTubePlayer(page: Page, card: ReturnType<Page["locator"]>, title: string, videoId: string) {
  const frame = card.locator("[data-ui-video-stage] iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("src", new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${videoId}\\?`));
  await expect(frame).toHaveAttribute("title", `TeoyubeWorld video: ${title}`);
  await expect(frame).toHaveAttribute("allow", "autoplay; encrypted-media; picture-in-picture; web-share");
  await expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  await expect(frame).toHaveAttribute("allowfullscreen", "");
  await expect(card.locator("[data-ui-video-stage]")).toHaveAttribute("data-playback-state", "playing");
  await expect(page.locator("#uiVideoGrid iframe")).toHaveCount(1);
}

async function expectPlayerFillsStage(page: Page) {
  const geometry = await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>("#uiVideoGrid [data-ui-video-stage][data-playback-state='playing']");
    const player = stage?.querySelector<HTMLElement>("iframe, video");
    if (!stage || !player) return null;
    const stageRect = stage.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const computed = getComputedStyle(player);
    return {
      delta: {
        left: Math.abs(playerRect.left - stageRect.left),
        top: Math.abs(playerRect.top - stageRect.top),
        width: Math.abs(playerRect.width - stageRect.width),
        height: Math.abs(playerRect.height - stageRect.height)
      },
      position: computed.position,
      display: computed.display,
      margin: computed.margin,
      padding: computed.padding,
      borderWidth: computed.borderWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry?.delta.left).toBeLessThanOrEqual(1);
  expect(geometry?.delta.top).toBeLessThanOrEqual(1);
  expect(geometry?.delta.width).toBeLessThanOrEqual(1);
  expect(geometry?.delta.height).toBeLessThanOrEqual(1);
  expect(geometry?.position).toBe("absolute");
  expect(geometry?.display).toBe("block");
  expect(geometry?.margin).toBe("0px");
  expect(geometry?.padding).toBe("0px");
  expect(geometry?.borderWidth).toBe("0px");
  expect(geometry?.overflow).toBeLessThanOrEqual(1);
}

async function activateAndMeasurePanel(card: ReturnType<Page["locator"]>) {
  return card.evaluate((element) => {
    const stage = element.querySelector<HTMLElement>("[data-ui-video-stage]");
    const play = element.querySelector<HTMLButtonElement>("[data-ui-video-play]");
    if (!stage || !play) return null;
    const measure = () => {
      const cardRect = element.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      return {
        card: { width: cardRect.width, height: cardRect.height },
        stage: { width: stageRect.width, height: stageRect.height }
      };
    };
    const before = measure();
    play.click();
    return { before, after: measure() };
  });
}

test("every retained Play control across the first six tabs loads its exact official video", async ({ page }) => {
  const requests = await installDeterministicYouTube(page);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await openEmbeddedVideos(page);

  let expectedActivations = 0;
  for (const [tab, mappings] of Object.entries(youtubeTabs)) {
    await chooseTab(page, tab);
    const cards = page.locator("#uiVideoGrid .ui-video-card[data-ui-video-source='original']");
    await expect(cards).toHaveCount(mappings.length);

    for (let index = 0; index < mappings.length; index += 1) {
      const [id, title, videoId] = mappings[index];
      const card = cards.nth(index);
      await expect(card).toHaveAttribute("data-ui-video-id", id);
      await expect(card.locator("h4")).toHaveText(title);

      await card.locator("[data-ui-video-play]").first().click();
      expectedActivations += 1;
      await expectYouTubePlayer(page, card, title, videoId);

      await card.locator(".embedded-video-menu summary").click();
      await card.locator(".ui-video-actions [data-ui-video-play]").click();
      expectedActivations += 1;
      await expectYouTubePlayer(page, card, title, videoId);
    }
  }

  await expect.poll(() => requests.length).toBe(expectedActivations);
  expect(pageErrors).toEqual([]);
});

test("every visible TeoyubeWorld Media Play control retains its exact local clip", async ({ page }) => {
  await openEmbeddedVideos(page);
  await chooseTab(page, "TeoyubeWorld Media");

  const cards = page.locator("#uiVideoGrid .ui-video-card[data-ui-video-source='approved']");
  await expect(cards).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    const card = cards.nth(index);
    await card.locator("[data-ui-video-play]").first().click();
    await expect(card.locator("video source")).toHaveAttribute("src", /\/media\/teoyubeworld\/pilot-v1\/.+\/card-preview\.mp4$/);
    await expect(page.locator("#uiVideoGrid video")).toHaveCount(1);

    await card.locator(".embedded-video-menu summary").click();
    await card.locator(".ui-video-actions [data-ui-video-play]").click();
    await expect(card.locator("video source")).toHaveAttribute("src", /\/media\/teoyubeworld\/pilot-v1\/.+\/card-preview\.mp4$/);
  }

  await expect(page.locator("#uiVideoGrid video")).toHaveCount(1);
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 }
]) {
  test(`every tab fills its active ${viewport.name} panel without overflow`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    await installDeterministicYouTube(page);
    await openEmbeddedVideos(page);

    for (const tab of [...Object.keys(youtubeTabs), "TeoyubeWorld Media"]) {
      await chooseTab(page, tab);
      const card = page.locator("#uiVideoGrid .ui-video-card").first();
      const transition = await activateAndMeasurePanel(card);
      await expect(card.locator("[data-ui-video-stage] iframe, [data-ui-video-stage] video")).toHaveCount(1);
      await expectPlayerFillsStage(page);
      expect(transition).not.toBeNull();
      expect(Math.abs((transition?.after.card.width || 0) - (transition?.before.card.width || 0))).toBeLessThanOrEqual(1);
      expect(Math.abs((transition?.after.card.height || 0) - (transition?.before.card.height || 0))).toBeLessThanOrEqual(1);
      expect(Math.abs((transition?.after.stage.width || 0) - (transition?.before.stage.width || 0))).toBeLessThanOrEqual(1);
      expect(Math.abs((transition?.after.stage.height || 0) - (transition?.before.stage.height || 0))).toBeLessThanOrEqual(1);
    }

    await context.close();
  });
}

test("YouTube and local playback remain accessible and contained on mobile", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await installDeterministicYouTube(page);
  await openEmbeddedVideos(page);

  const firstCard = page.locator("#uiVideoGrid .ui-video-card").first();
  await firstCard.locator("[data-ui-video-play]").first().click();
  await expectYouTubePlayer(page, firstCard, "The Seed of Promise", "4zM2olpouIo");
  await chooseTab(page, "TeoyubeWorld Media");
  const localCard = page.locator("#uiVideoGrid .ui-video-card").first();
  await localCard.locator("[data-ui-video-play]").first().click();
  await expect(localCard.locator("video source")).toHaveAttribute("src", /\/media\/teoyubeworld\/pilot-v1\/.+\/card-preview\.mp4$/);

  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    mediaOutsideCard: [...document.querySelectorAll<HTMLElement>("#uiVideoGrid video, #uiVideoGrid iframe")].some((media) => {
      const card = media.closest<HTMLElement>(".ui-video-card");
      if (!card) return true;
      const cardRect = card.getBoundingClientRect();
      const mediaRect = media.getBoundingClientRect();
      return mediaRect.left < cardRect.left - 1 || mediaRect.right > cardRect.right + 1;
    })
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.mediaOutsideCard).toBe(false);

  await page.addScriptTag({ content: axeSource });
  const seriousViolations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run(context: string, options: unknown): Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe;
    const result = await axe.run("#uiVideoGrid, #uiVideoCategoryTabs", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }
    });
    return result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  });
  expect(seriousViolations).toEqual([]);
  await context.close();
});