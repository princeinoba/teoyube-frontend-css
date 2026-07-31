import { expect, test } from "@playwright/test";

const staticBaseUrl = process.env.TEOYUBE_STATIC_E2E_BASE_URL;

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
    await expect(page.locator("#clientsPromiseRows tr")).toHaveCount(8);
    await expect(page.locator("#clientsPromiseRows .today-video-select:not(:disabled)")).toHaveCount(1);
    await expect(page.locator("#clientsPromiseRows .today-video-select:disabled")).toHaveCount(7);

    const frame = page.locator("#promiseMovieResult iframe");
    await expect(frame).toHaveCount(1);
    await expect(frame).not.toHaveAttribute("src", /youtube-nocookie/);
    expect(externalRequests).toEqual([]);

    const play = page.locator("#clientsPromiseRows").getByRole("button", {
      name: "Play The Seed of Promise in TeoyubeWorld Video Highlight"
    });
    await play.focus();
    await page.keyboard.press("Enter");
    await expect(frame).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/4zM2olpouIo\?/
    );
    await expect(frame).toHaveAttribute("title", "TeoyubeWorld video: The Seed of Promise");
    await expect(page.locator("#promiseMovieResult iframe")).toHaveCount(1);
    expect(externalRequests).toHaveLength(1);

    const navigation = page.locator("#promiseMovieResult .promise-video-nav");
    await navigation.getByRole("button", { name: "Next", exact: true }).click();
    await navigation.getByRole("button", { name: "Previous", exact: true }).click();
    await expect(page.locator("#promiseMovieResult iframe")).toHaveCount(1);
    await expect(page.locator("#promiseMovieResult h3")).toHaveText("The Seed of Promise");
  });
});
