import { expect, test } from "@playwright/test";

test("TeoyubeWorld tab restores approved content, carousel details, and local playback", async ({
  page
}) => {
  await page.goto("/embedded-videos", { waitUntil: "domcontentloaded" });
  await page.locator("#uiVideoCategoryTabs [data-video-category='TeoyubeWorld Media']").click();

  const cards = page.locator("#uiVideoGrid .ui-video-card[data-ui-video-source='approved']");
  await expect(cards).toHaveCount(4);
  await expect(page.locator("#uiVideoGrid .ui-video-empty")).toHaveCount(0);
  await expect(page.locator("#uiVideoStats")).toContainText("12");
  await expect(page.locator("#uiVideoLoadMore")).toBeHidden();

  const firstCard = cards.first();
  await expect(firstCard.locator("h4")).toHaveText(
    "No Other Gospel - Segment 01 - Paul, an Apostle"
  );
  await expect(firstCard.locator(".embedded-video-position")).toHaveText("1 / 12");

  await firstCard.locator("[data-ui-video-nav='next']").click();
  await expect(firstCard.locator("h4")).toHaveText(
    "No Other Gospel - Segment 02 - Not From Men"
  );
  await expect(firstCard.locator(".ui-video-meta")).toContainText("Galatians 1:1");
  await expect(firstCard.locator(".embedded-video-position")).toHaveText("2 / 12");

  await firstCard.locator("[data-ui-video-play]").first().click();
  await expect(firstCard.locator("video source")).toHaveAttribute(
    "src",
    /\/media\/teoyubeworld\/pilot-v1\/.+\/card-preview\.mp4$/
  );

  await firstCard.locator(".embedded-video-menu summary").click();
  await firstCard.getByRole("button", { name: "Details" }).click();
  await expect(firstCard.locator("[data-ui-video-detail-panel]")).toContainText(
    "No Other Gospel - Galatians 1 Opening, segment 2."
  );

  await page.locator("#uiVideoCategoryTabs [data-video-category='All Videos']").click();
  await expect(page.locator("#uiVideoGrid .ui-video-card[data-ui-video-source='original']")).toHaveCount(4);
});
