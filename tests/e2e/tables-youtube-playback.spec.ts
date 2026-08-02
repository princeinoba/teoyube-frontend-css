import fs from "node:fs";
import { expect, test } from "@playwright/test";

const mappings = {
  seed: { id: "local-seed-of-promise", title: "The Seed of Promise", videoId: "4zM2olpouIo" },
  prayer: { id: "local-power-of-prayer", title: "The Power of Prayer", videoId: "yLBb7JCMqJE" },
  purpose: { id: "local-walk-in-purpose", title: "Walk in Divine Purpose", videoId: "yDu0bD1lukE" }
} as const;

const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const orderedMappings = [
  { id: "local-seed-of-promise", videoId: "4zM2olpouIo" },
  { id: "local-power-of-prayer", videoId: "yLBb7JCMqJE" },
  { id: "local-walk-in-purpose", videoId: "yDu0bD1lukE" },
  { id: "local-rooted-in-truth", videoId: "tnjdlvbaBY8" },
  { id: "local-called-for-more", videoId: "chLnoAGxyrc" },
  { id: "local-strength-for-today", videoId: "jAmIjP7-T5w" },
  { id: "local-promise-language", videoId: "I8Y3syhDG64" },
  { id: "local-daily-assignment", videoId: "YY9VYdPUVf8" }
] as const;

test("Tables compact preview and Airplay players stay independent", async ({ page }) => {
  const requestedEmbeds: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    requestedEmbeds.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html lang=\"en\"><body>TeoyubeWorld Tables playback audit</body></html>"
    });
  });

  await page.goto("/tables", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toHaveAttribute("data-view", "teoyube-tables");
  await expect(page.locator("body")).toHaveAttribute("data-tables-teoyube-world-playback", "ready");

  const firstRow = page.locator("#teoyubeTablesRows .teoyube-main-row").first();
  const detail = firstRow.locator("xpath=following-sibling::tr[1]");
  if (!(await detail.isVisible())) await firstRow.locator(".table-expand-button").click();
  const compact = detail.locator(".table-preview-video-panel");
  const airplay = detail.locator(".table-row-video.table-row-video-premium");
  const compactFrame = compact.locator("iframe");
  const airplayFrame = airplay.locator("iframe");

  await expect(compact).toHaveAttribute("data-table-video-preview", mappings.seed.id);
  await expect(airplay).toHaveAttribute("data-table-video-id", mappings.seed.id);
  await expect(compactFrame).not.toHaveAttribute("src", /youtube-nocookie/);
  await expect(airplayFrame).not.toHaveAttribute("src", /youtube-nocookie/);

  const compactPlay = compact.locator("[data-table-preview-video-play]");
  await compactPlay.focus();
  await expect(compactPlay).toBeFocused();
  await page.keyboard.press("Space");
  await expect(compactFrame).toHaveAttribute("src", new RegExp(`/embed/${mappings.seed.videoId}\\?`));
  await expect(compactFrame).not.toHaveAttribute("loading", "lazy");
  await expect.poll(() => requestedEmbeds.some((url) => url.includes(`/embed/${mappings.seed.videoId}?`))).toBe(true);
  await expect(compactFrame).toHaveAttribute("title", `${mappings.seed.title} preview`);
  await expect(airplayFrame).not.toHaveAttribute("src", /youtube-nocookie/);

  await airplay.locator('[data-table-video-nav="next"]').click();
  await expect(airplay).toHaveAttribute("data-table-video-id", mappings.prayer.id);
  await expect(airplay.locator(".table-row-video-title")).toHaveText(mappings.prayer.title);
  await expect(compact).toHaveAttribute("data-table-video-preview", mappings.seed.id);
  await expect(compactFrame).toHaveAttribute("src", new RegExp(`/embed/${mappings.seed.videoId}\\?`));

  await airplay.locator("[data-table-video-play]").click();
  await expect(airplayFrame).toHaveAttribute("src", new RegExp(`/embed/${mappings.prayer.videoId}\\?`));
  await expect(airplayFrame).toHaveAttribute("title", mappings.prayer.title);
  await expect(compactFrame).toHaveAttribute("src", new RegExp(`/embed/${mappings.seed.videoId}\\?`));

  await airplay.locator('[data-table-video-nav="next"]').click();
  await expect(airplay).toHaveAttribute("data-table-video-id", mappings.purpose.id);
  await expect(airplayFrame).not.toHaveAttribute("src", /youtube-nocookie/);
  await expect(compact).toHaveAttribute("data-table-video-preview", mappings.seed.id);

  await page.addScriptTag({ content: axeSource });
  const seriousViolations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run(context: string, options: unknown): Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe;
    const result = await axe.run("#teoyubeTablesRows .teoyube-detail-row:not([hidden])", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }
    });
    return result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  });
  expect(seriousViolations).toEqual([]);
});
test("all 24 Tables rows restore both corresponding Play controls without disturbing adjacent rows", async ({ page }) => {
  const requestedEmbeds: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    requestedEmbeds.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Tables playback audit</title>" });
  });
  await page.goto("/tables", { waitUntil: "domcontentloaded" });

  for (const pageNumber of [1, 2, 3]) {
    await page.locator(`#teoyubeTablePagination [data-table-page="${pageNumber}"]`).last().click();
    const rows = page.locator("#teoyubeTablesRows .teoyube-main-row");
    const count = await rows.count();
    for (let visibleIndex = 0; visibleIndex < count; visibleIndex += 1) {
      const row = rows.nth(visibleIndex);
      const toggle = row.locator(".table-expand-button");
      const rowId = Number(await toggle.getAttribute("data-table-row"));
      const mapping = orderedMappings[rowId % orderedMappings.length];
      let detail = row.locator("xpath=following-sibling::tr[1][contains(@class, 'teoyube-detail-row')]");
      if (!(await detail.count()) || !(await detail.isVisible())) await toggle.click();
      detail = row.locator("xpath=following-sibling::tr[1][contains(@class, 'teoyube-detail-row')]");

      await expect(detail).toBeVisible();
      await expect(row).toHaveClass(/expanded/);
      await expect(detail.locator(".table-preview-video-panel")).toHaveAttribute("data-table-video-preview", mapping.id);
      await expect(detail.locator(".table-row-video-premium")).toHaveAttribute("data-table-video-id", mapping.id);

      await detail.locator("[data-table-preview-video-play]").click();
      await expect(detail.locator(".table-preview-video-panel iframe")).toHaveAttribute("src", new RegExp(`/embed/${mapping.videoId}\\?`));
      await expect(detail.locator(".table-preview-video-panel iframe")).not.toHaveAttribute("loading", "lazy");
      await detail.locator("[data-table-video-play]").click();
      await expect(detail.locator(".table-row-video-premium iframe")).toHaveAttribute("src", new RegExp(`/embed/${mapping.videoId}\\?`));
      await expect(detail.locator(".table-row-video-premium iframe")).not.toHaveAttribute("loading", "lazy");
    }
  }

  await page.locator('#teoyubeTablePagination [data-table-page="1"]').last().click();
  const fifthRow = page.locator("#teoyubeTablesRows .teoyube-main-row").nth(4);
  await fifthRow.locator(".table-expand-button").click();
  const sixthRow = page.locator("#teoyubeTablesRows .teoyube-main-row").nth(5);
  await expect(sixthRow).toBeVisible();
  await page.locator("#teoyubeTableSearch").fill("WETAWTWHIBYATYRNTGOGODIV 2");
  await expect(fifthRow).toBeVisible();
  await expect(sixthRow).toBeHidden();
  await page.locator("#teoyubeTableSearch").fill("");
  await expect(sixthRow).toBeVisible();
  expect(requestedEmbeds).toHaveLength(48);
});
