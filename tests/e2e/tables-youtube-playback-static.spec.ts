import { expect, test } from "@playwright/test";

const staticBaseUrl = process.env.TEOYUBE_STATIC_E2E_BASE_URL;

test.describe("canonical static Tables dual-container playback", () => {
  test.skip(!staticBaseUrl, "Runs only when the canonical static rollback server is supplied.");

  test("loads each verified container only after its own Play action", async ({ page }) => {
    await page.route("https://www.youtube-nocookie.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><html lang=\"en\"><body>Static Tables playback audit</body></html>"
      });
    });

    await page.goto(`${staticBaseUrl}/#teoyube-tables`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toHaveAttribute("data-view", "teoyube-tables");
    await expect(page.locator("body")).toHaveAttribute("data-tables-teoyube-world-playback", "ready");

    const firstRow = page.locator("#teoyubeTablesRows .teoyube-main-row").first();
    const detail = firstRow.locator("xpath=following-sibling::tr[1]");
    if (!(await detail.isVisible())) await firstRow.locator(".table-expand-button").click();
    const compact = detail.locator(".table-preview-video-panel");
    const airplay = detail.locator(".table-row-video.table-row-video-premium");

    await compact.locator("[data-table-preview-video-play]").click();
    await expect(compact.locator("iframe")).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/4zM2olpouIo\?/
    );
    await expect(airplay.locator("iframe")).not.toHaveAttribute("src", /youtube-nocookie/);

    await airplay.locator('[data-table-video-nav="next"]').click();
    await expect(airplay).toHaveAttribute("data-table-video-id", "local-power-of-prayer");
    await expect(compact).toHaveAttribute("data-table-video-preview", "local-seed-of-promise");
    await airplay.locator("[data-table-video-play]").click();
    await expect(airplay.locator("iframe")).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/yLBb7JCMqJE\?/
    );
    await expect(compact.locator("iframe")).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/4zM2olpouIo\?/
    );
  });
});