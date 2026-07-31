import { expect, test } from "@playwright/test";

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

test("all Today feed buttons select distinct official-channel videos", async ({ page }) => {
  const requests: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><body>TeoyubeWorld deterministic playback audit</body></html>"
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const rows = page.locator("#clientsPromiseRows tr");
  const frame = page.locator("#promiseMovieResult iframe");
  const frameShell = page.locator(
    "#promiseMovieResult .promise-video-thumbnail.promise-youtube-frame"
  );

  await expect(rows).toHaveCount(mappings.length);
  await expect(rows.locator(".today-video-select:not(:disabled)")).toHaveCount(
    mappings.length
  );
  await expect(rows.locator(".today-video-select:disabled")).toHaveCount(0);
  await expect(frame).not.toHaveAttribute(
    "src",
    /^https:\/\/www\.youtube-nocookie\.com\/embed\//
  );
  expect(requests).toEqual([]);

  for (const mapping of mappings) {
    const row = page.locator(
      `#clientsPromiseRows tr[data-today-story-id="${mapping.id}"]`
    );
    const play = row.getByRole("button", {
      name: `Play ${mapping.title} in TeoyubeWorld Video Highlight`
    });

    await expect(row).toHaveAttribute("data-playback-status", "verified");
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
    await expect(frameShell).toHaveAttribute("data-today-active-story-id", mapping.id);
    await expect(frameShell).toHaveAttribute(
      "data-playback-state",
      /^(loading|playing)$/
    );
    await expect(page.locator("#promiseMovieResult h3")).toHaveText(mapping.title);
  }

  expect(requests).toHaveLength(mappings.length);
  expect(new Set(requests.map((url) => new URL(url).pathname)).size).toBe(
    mappings.length
  );
  await expect(page.locator("#promiseMovieResult iframe")).toHaveCount(1);
});
