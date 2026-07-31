import { expect, test, type Page } from "@playwright/test";

const officialEmbedPattern =
  /^https:\/\/www\.youtube-nocookie\.com\/embed\/4zM2olpouIo\?/;

function officialEmbedPatternFor(videoId: string) {
  return new RegExp(
    `^https://www\\.youtube-nocookie\\.com/embed/${videoId}\\?`
  );
}

async function installDeterministicYouTubeResponse(page: Page) {
  const requests: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html>
        <html lang="en">
          <body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#003f34;color:white;font:700 24px system-ui">
            TeoyubeWorld video active — The Seed of Promise
          </body>
        </html>`
    });
  });
  return requests;
}

async function expectIdlePlayer(page: Page) {
  const frame = page.locator("#promiseMovieResult iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).not.toHaveAttribute("src", officialEmbedPattern);
  await expect(page.locator("#promiseMovieResult .promise-embed-play-overlay")).toBeVisible();
}

async function expectActivePlayer(
  page: Page,
  videoId = "4zM2olpouIo",
  title = "The Seed of Promise"
) {
  const frame = page.locator("#promiseMovieResult iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("src", officialEmbedPatternFor(videoId));
  await expect(frame).toHaveAttribute(
    "title",
    `TeoyubeWorld video: ${title}`
  );
  await expect(frame).toHaveAttribute(
    "allow",
    "autoplay; encrypted-media; picture-in-picture; web-share"
  );
  await expect(frame).toHaveAttribute(
    "referrerpolicy",
    "strict-origin-when-cross-origin"
  );  await expect(frame).toHaveAttribute("allowfullscreen", "");

  await expect(page.locator("#promiseMovieResult .promise-embed-play-overlay")).toHaveCount(0);
}

test("Today feed controls one privacy-enhanced player only after explicit Play", async ({
  page
}) => {
  const externalRequests = await installDeterministicYouTubeResponse(page);
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const errorResponses: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  page.on("response", (response) => {
    if (response.status() >= 400) errorResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toHaveAttribute("data-view", "today");
  await expect(page.locator("#clientsPromiseRows tr")).toHaveCount(8);
  await expectIdlePlayer(page);
  expect(externalRequests).toEqual([]);

  const rows = page.locator("#clientsPromiseRows tr");
  const playableButton = page.locator("#clientsPromiseRows").getByRole("button", {
    name: "Play The Seed of Promise in TeoyubeWorld Video Highlight"
  });
  const playable = playableButton.locator("xpath=ancestor::tr");
  await expect(playable).toHaveCount(1);
  await expect(playable).toHaveAttribute("data-today-story-id", "local-seed-of-promise");
  await expect(playable).toHaveAttribute("data-playback-status", "verified");

  await expect(rows.locator(".today-video-select:not(:disabled)")).toHaveCount(8);
  await expect(rows.locator(".today-video-select:disabled")).toHaveCount(0);

  await playableButton.click();
  await expectActivePlayer(page);
  await expect(page.locator("#promiseMovieResult h3")).toHaveText("The Seed of Promise");
  await expect(page.locator("#promiseMovieStatus")).toContainText(
    'Playing "The Seed of Promise"'
  );
  await expect(page.locator("#promiseMovieResult .local-media-note")).toContainText(
    "YouTube playback begins only after you press Play"
  );
  await expect.poll(() => externalRequests.length).toBe(1);
  expect(externalRequests[0]).toMatch(officialEmbedPattern);

  const navigation = page.locator("#promiseMovieResult .promise-video-nav");
  const next = navigation.getByRole("button", { name: "Next", exact: true });
  await next.focus();
  await page.keyboard.press("Enter");
  await expectActivePlayer(page, "yLBb7JCMqJE", "Walk in Divine Purpose");
  const previous = navigation.getByRole("button", { name: "Previous", exact: true });
  await previous.focus();
  await page.keyboard.press("Space");
  await expectActivePlayer(page);
  await expect(page.locator("#promiseMovieResult iframe")).toHaveCount(1);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(errorResponses).toEqual([]);
});

test("main Play and keyboard Play select the first verified feed item", async ({
  page
}) => {
  const externalRequests = await installDeterministicYouTubeResponse(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expectIdlePlayer(page);

  const mainPlay = page.locator("#promiseMovieResult .promise-embed-play-overlay");
  await expect(mainPlay).toBeEnabled();
  await expect(mainPlay).toHaveAttribute("aria-disabled", "false");
  await mainPlay.focus();
  await expect(mainPlay).toBeFocused();
  await page.keyboard.press("Enter");
  await expectActivePlayer(page);
  await expect.poll(() => externalRequests.length).toBe(1);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expectIdlePlayer(page);
  const mainPlayWithSpace = page.locator("#promiseMovieResult .promise-embed-play-overlay");
  await expect(mainPlayWithSpace).toBeEnabled();
  await expect(mainPlayWithSpace).toHaveAttribute("aria-disabled", "false");
  await mainPlayWithSpace.focus();
  await expect(mainPlayWithSpace).toBeFocused();
  await page.keyboard.press("Space");
  await expectActivePlayer(page);
  await expect.poll(() => externalRequests.length).toBe(2);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expectIdlePlayer(page);
  const feedPlayWithEnter = page.locator("#clientsPromiseRows").getByRole("button", {
    name: "Play The Seed of Promise in TeoyubeWorld Video Highlight"
  });
  await expect(feedPlayWithEnter).toBeEnabled();
  await expect(feedPlayWithEnter).toHaveAttribute("aria-disabled", "false");
  await feedPlayWithEnter.focus();
  await expect(feedPlayWithEnter).toBeFocused();
  await page.keyboard.press("Enter");
  await expectActivePlayer(page);
  await expect(feedPlayWithEnter).toBeFocused();
  await expect.poll(() => externalRequests.length).toBe(3);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expectIdlePlayer(page);
  const feedPlayWithSpace = page.locator("#clientsPromiseRows").getByRole("button", {
    name: "Play The Seed of Promise in TeoyubeWorld Video Highlight"
  });
  await expect(feedPlayWithSpace).toBeEnabled();
  await expect(feedPlayWithSpace).toHaveAttribute("aria-disabled", "false");
  await feedPlayWithSpace.focus();
  await expect(feedPlayWithSpace).toBeFocused();
  await page.keyboard.press("Space");
  await expectActivePlayer(page);
  await expect.poll(() => externalRequests.length).toBe(4);
});

for (const viewport of [
  { label: "desktop-wide", width: 1536, height: 1024 },
  { label: "desktop", width: 1440, height: 900 },
  { label: "desktop-standard", width: 1280, height: 800 },
  { label: "tablet-landscape", width: 1024, height: 768 },
  { label: "tablet-portrait", width: 768, height: 1024 },
  { label: "mobile", width: 390, height: 844 }
]) {
  test(`Today playback remains contained at ${viewport.label}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    const page = await context.newPage();
    await installDeterministicYouTubeResponse(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("#clientsPromiseRows").getByRole("button", {
      name: "Play The Seed of Promise in TeoyubeWorld Video Highlight"
    }).click();
    await expectActivePlayer(page);

    const geometry = await page.evaluate(() => {
      const panel = document.querySelector<HTMLElement>("#promiseMovieResult");
      const shell = document.querySelector<HTMLElement>(
        "#promiseMovieResult .promise-video-thumbnail"
      );
      const frame = document.querySelector<HTMLIFrameElement>("#promiseMovieResult iframe");
      if (!panel || !shell || !frame) throw new Error("Today player geometry is missing.");
      const panelRect = panel.getBoundingClientRect();
      const shellRect = shell.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      return {
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        frameInsideShell:
          frameRect.left >= shellRect.left - 1 &&
          frameRect.right <= shellRect.right + 1 &&
          frameRect.top >= shellRect.top - 1 &&
          frameRect.bottom <= shellRect.bottom + 1,
        shellInsidePanel:
          shellRect.left >= panelRect.left - 1 &&
          shellRect.right <= panelRect.right + 1
      };
    });
    expect(geometry.documentOverflow).toBeLessThanOrEqual(1);
    expect(geometry.frameInsideShell).toBe(true);
    expect(geometry.shellInsidePanel).toBe(true);
    await context.close();
  });
}

test("Today playback retains focus and accessible controls at 200 percent scale", async ({
  browser
}) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await installDeterministicYouTubeResponse(page);
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const play = page.locator("#promiseMovieResult .promise-embed-play-overlay");

  await expect(play).toBeVisible();
  await play.focus();
  await expect(play).toBeFocused();
  await page.keyboard.press("Enter");
  await expectActivePlayer(page);
  await expect(page.getByRole("button", { name: "Previous", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  await context.close();
});
