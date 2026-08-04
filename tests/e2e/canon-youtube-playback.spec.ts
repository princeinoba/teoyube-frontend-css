import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const mappings = [
  { itemId: "canon-map-D02", status: "In Progress", title: "Rooted in His Word", videoId: "tnjdlvbaBY8" },
  { itemId: "canon-map-D03", status: "Completed", title: "Called for More", videoId: "chLnoAGxyrc" },
  { itemId: "canon-map-D04", status: "Planning", title: "The Seed of Promise", videoId: "4zM2olpouIo" },
  { itemId: "canon-map-D05", status: "In Progress", title: "Promise Language and Calling", videoId: "I8Y3syhDG64" },
  { itemId: "canon-map-D06", status: "Review", title: "Walk in Divine Purpose", videoId: "yDu0bD1lukE" },
  { itemId: "canon-map-D07", status: "Completed", title: "Strength for Today", videoId: "jAmIjP7-T5w" },
  { itemId: "canon-map-D08", status: "On Hold", title: "Rooted in His Word", videoId: "tnjdlvbaBY8" },
  { itemId: "canon-map-D09", status: "In Progress", title: "Called for More", videoId: "chLnoAGxyrc" },
  { itemId: "canon-map-D10", status: "Planning", title: "The Power of Prayer", videoId: "yLBb7JCMqJE" },
  { itemId: "canon-map-D11", status: "Review", title: "Strength for Today", videoId: "jAmIjP7-T5w" },
  { itemId: "canon-map-D12", status: "In Progress", title: "Daily Divine Assignment", videoId: "YY9VYdPUVf8" }
] as const;

const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function installDeterministicYouTube(page: Page) {
  const requests: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    if (route.request().url().includes("/embed/")) requests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><html lang=\"en\"><body>Canon TeoyubeWorld playback audit</body></html>" });
  });
  return requests;
}

function embedPattern(videoId: string) {
  return new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${videoId}\\?`);
}

async function openCanon(page: Page) {
  await page.goto("/canon", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toHaveAttribute("data-view", "canon");
  await expect(page.locator("[data-canon-video-stage]")).toHaveCount(mappings.length);
}

test("every status-bearing Canon play control loads its corresponding official video", async ({ page }) => {
  const requests = await installDeterministicYouTube(page);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await openCanon(page);
  await expect(page.locator("[data-canon-video-stage] iframe")).toHaveCount(0);
  expect(requests).toEqual([]);
  const defaultPresentation = await page.locator("[data-canon-video-stage]").evaluateAll((stages) => stages.map((stage) => ({
    playGlyph: getComputedStyle(stage, "::before").content,
    playGlyphDisplay: getComputedStyle(stage, "::before").display,
    backgroundImage: getComputedStyle(stage).backgroundImage
  })));
  expect(defaultPresentation.every((stage) => stage.playGlyph !== "none" && stage.playGlyphDisplay === "grid" && stage.backgroundImage !== "none")).toBe(true);

  for (let index = 0; index < mappings.length; index += 1) {
    const mapping = mappings[index];
    const card = page.locator(`[data-canon-item="${mapping.itemId}"]`).first();
    const stage = card.locator("[data-canon-video-stage]");
    await expect(card.locator(".canon-status")).toHaveText(mapping.status);
    await expect(stage).toHaveAttribute("role", "button");
    await expect(stage).toHaveAttribute("tabindex", "0");
    await stage.scrollIntoViewIfNeeded();
    await stage.focus();
    await page.keyboard.press(index % 2 === 0 ? "Enter" : "Space");

    const frame = stage.locator("iframe");
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute("src", embedPattern(mapping.videoId));
    await expect(frame).toHaveAttribute("title", new RegExp(`^TeoyubeWorld video: ${mapping.title} for `));
    await expect(frame).toHaveAttribute("allow", "autoplay; encrypted-media; picture-in-picture; web-share");
    await expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    await expect(frame).toHaveAttribute("allowfullscreen", "");
    await expect(stage).toHaveAttribute("data-playback-state", "playing");
    await expect(stage).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-canon-video-stage] iframe")).toHaveCount(1);
    if (index > 0) {
      const previous = page.locator(`[data-canon-item="${mappings[index - 1].itemId}"]`).first().locator("[data-canon-video-stage]");
      await expect(previous.locator("iframe")).toHaveCount(0);
      await expect(previous).toHaveAttribute("aria-pressed", "false");
      await expect(previous).not.toHaveAttribute("data-active-video-id", /.+/);
    }
  }

  expect(requests.map((url) => new URL(url).pathname.split("/").pop())).toEqual(mappings.map((mapping) => mapping.videoId));
  expect(pageErrors).toEqual([]);
});

test("Canon carousel, selection, and tab behavior remain available with playback", async ({ page }) => {
  await installDeterministicYouTube(page);
  await openCanon(page);

  await page.locator('[data-canon-featured-slide-nav="next"]').click();
  await expect(page.locator('[data-canon-featured-slide-index="1"]')).toHaveAttribute("aria-current", "true");
  await page.locator('[data-canon-item="canon-map-D02"] [data-canon-video-stage]').click();
  await expect(page.locator('[data-canon-item="canon-map-D02"]')).toHaveClass(/active/);

  await page.locator('[data-canon-tab="archetypes"]').click();
  await expect(page.locator('[data-canon-tab="archetypes"]')).toHaveClass(/active/);
  await expect(page.locator("[data-canon-video-stage] iframe")).toHaveCount(0);
  await page.locator('[data-canon-tab="canon-maps"]').click();
  await expect(page.locator("[data-canon-video-stage]")).toHaveCount(mappings.length);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
  test(`active Canon video remains contained at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await installDeterministicYouTube(page);
    await openCanon(page);
    const stage = page.locator('[data-canon-item="canon-map-D10"] [data-canon-video-stage]');
    await stage.click();
    await expect(stage.locator("iframe")).toHaveAttribute("src", embedPattern("yLBb7JCMqJE"));

    const geometry = await stage.evaluate((element) => {
      const frame = element.querySelector("iframe");
      if (!frame) throw new Error("Canon player frame is missing.");
      const stageRect = element.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        frameInsideStage: frameRect.left >= stageRect.left - 1 && frameRect.right <= stageRect.right + 1 &&
          frameRect.top >= stageRect.top - 1 && frameRect.bottom <= stageRect.bottom + 1
      };
    });
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    expect(geometry.frameInsideStage).toBe(true);

    if (viewport.width === 390) {
      await page.addScriptTag({ content: axeSource });
      const seriousViolations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run(context: string, options: unknown): Promise<{ violations: Array<{ impact: string | null }> }> } }).axe;
        const result = await axe.run("#canonGrid, #canonRecentGrid", {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }
        });
        return result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
      });
      expect(seriousViolations).toEqual([]);
    }
    await context.close();
  });
}