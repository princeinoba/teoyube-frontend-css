import { expect, test } from "@playwright/test";

const staticBaseUrl = process.env.TEOYUBE_STATIC_E2E_BASE_URL;
const mappings = [
  { id: "local-seed-of-promise", title: "The Seed of Promise", videoId: "4zM2olpouIo" },
  { id: "local-power-of-prayer", title: "Walk in Divine Purpose", videoId: "yLBb7JCMqJE" },
  { id: "local-walk-in-purpose", title: "Faith That Moves Mountains", videoId: "yDu0bD1lukE" },
  { id: "local-rooted-in-truth", title: "The Power of Prayer", videoId: "tnjdlvbaBY8" },
  { id: "local-called-for-more", title: "Grace for Every Season", videoId: "chLnoAGxyrc" },
  { id: "local-strength-for-today", title: "Kingdom Calling", videoId: "jAmIjP7-T5w" },
  { id: "local-promise-language", title: "Promise Language", videoId: "I8Y3syhDG64" },
  { id: "local-daily-assignment", title: "Daily Divine Assignment", videoId: "YY9VYdPUVf8" }
] as const;

test.describe("static Today TeoyubeWorld playback rollback", () => {
  test.skip(!staticBaseUrl, "Runs only when the canonical static rollback server is supplied.");

  test("uses the same feed mapping, consent boundary, and single player", async ({ page }) => {
    const externalRequests: string[] = [];
    await page.route("https://www.youtube-nocookie.com/**", async (route) => {
      externalRequests.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><html><body>TeoyubeWorld static playback audit</body></html>"
      });
    });

    await page.goto(`${staticBaseUrl}/#today`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toHaveAttribute("data-view", "today");
    await expect(page.locator("#clientsPromiseRows tr")).toHaveCount(mappings.length);
    await expect(
      page.locator("#clientsPromiseRows .today-video-select:not(:disabled)")
    ).toHaveCount(mappings.length);
    await expect(
      page.locator("#clientsPromiseRows .today-video-select:disabled")
    ).toHaveCount(0);

    const frame = page.locator("#promiseMovieResult iframe");
    await expect(frame).toHaveCount(1);
    await expect(frame).not.toHaveAttribute("src", /youtube-nocookie/);
    expect(externalRequests).toEqual([]);

    for (const mapping of mappings) {
      const play = page
        .locator(`#clientsPromiseRows tr[data-today-story-id="${mapping.id}"]`)
        .getByRole("button", {
          name: `Play ${mapping.title} in TeoyubeWorld Video Highlight`
        });
      await expect(play).toBeEnabled();
      await play.click();
      await expect(frame).toHaveAttribute(
        "src",
        new RegExp(
          `^https://www\\.youtube-nocookie\\.com/embed/${mapping.videoId}\\?`
        )
      );
      await expect(frame).toHaveAttribute(
        "title",
        `TeoyubeWorld video: ${mapping.title}`
      );
    }
    await expect(page.locator("#promiseMovieResult iframe")).toHaveCount(1);
    expect(externalRequests).toHaveLength(mappings.length);

    const navigation = page.locator("#promiseMovieResult .promise-video-nav");
    await navigation.getByRole("button", { name: "Next", exact: true }).click();
    await expect(frame).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/4zM2olpouIo\?/
    );
    await navigation.getByRole("button", { name: "Previous", exact: true }).click();
    await expect(page.locator("#promiseMovieResult iframe")).toHaveCount(1);
    await expect(page.locator("#promiseMovieResult h3")).toHaveText(
      "Daily Divine Assignment"
    );
  });
});
