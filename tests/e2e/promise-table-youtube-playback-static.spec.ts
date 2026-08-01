import { expect, test } from "@playwright/test";

const staticBaseUrl = process.env.TEOYUBE_STATIC_E2E_BASE_URL;
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

test.describe("canonical static Promise Table TeoyubeWorld playback", () => {
  test.skip(!staticBaseUrl, "Runs only when the canonical static rollback server is supplied.");

  test("uses the same mapping, consent boundary, controls, and single player", async ({ page }) => {
    const requests: string[] = [];
    const pageErrors: string[] = [];
    const consoleErrors: Array<{ text: string; url: string }> = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push({ text: message.text(), url: message.location().url });
    });
    await page.route("https://www.youtube-nocookie.com/**", async (route) => {
      if (route.request().url().includes("/embed/")) requests.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><html lang=\"en\"><body>Static TeoyubeWorld playback audit</body></html>"
      });
    });

    await page.goto(`${staticBaseUrl}/index.html#table`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toHaveAttribute("data-view", "table");
    const frame = page.locator("#promiseTableVideoPanel iframe");
    await expect(frame).toHaveCount(1);
    await expect(frame).not.toHaveAttribute("src", /youtube-nocookie/);
    expect(requests).toEqual([]);

    for (const mapping of mappings) {
      const play = page
        .locator(`#promiseTableSearchResults .promise-search-item[data-promise-table-media-id="${mapping.id}"]`)
        .first()
        .locator(".promise-watch-video");
      await expect(play).toBeEnabled();
      await play.click();
      await expect(frame).toHaveAttribute(
        "src",
        new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${mapping.videoId}\\?`)
      );
      await expect(frame).toHaveAttribute("title", `TeoyubeWorld video: ${mapping.title}`);
      await expect(page.locator("#promiseTableVideoPanel .promise-table-featured-copy h3")).toHaveText(mapping.title);
      await expect(page.locator("#promiseTableVideoPanel")).toHaveAttribute("data-playback-state", "playing");
      await expect(page.locator("#promiseTableVideoPanel iframe")).toHaveCount(1);
    }

    const next = page.locator("#promiseTableVideoPanel .promise-table-next-video");
    await next.click();
    await expect(frame).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/4zM2olpouIo\?/
    );
    await page.getByRole("button", { name: "Previous Promise Table video" }).click();
    await expect(frame).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/YY9VYdPUVf8\?/
    );
    await expect(page.locator("#promiseTableVideoPanel iframe")).toHaveCount(1);
    expect(requests).toHaveLength(mappings.length + 2);
    const newPageErrors = pageErrors.filter(
      (message) => message !== "Published media manifest returned 404."
    );
    expect(newPageErrors).toEqual([]);
    const newConsoleErrors = consoleErrors.filter(
      (entry) => !(
        entry.text === "Failed to load resource: the server responded with a status of 404 (Not Found)" &&
        entry.url.endsWith("/media/teoyubeworld/pilot-v1/runtime-manifest.json")
      )
    );
    expect(newConsoleErrors).toEqual([]);
  });
});
