import { expect, test } from "@playwright/test";

test.describe("Prompt 13 guided daily spiritual loop", () => {
  test("completes Today through Tomorrow across approved module controls without losing session context", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/");
    await expect(page.locator("body")).not.toHaveAttribute("data-daily-journey-status");

    await page.locator("#generateBtn").click();
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "check_in");
    await expect(page.locator("#completeAssignment")).toHaveText("Continue to Scripture");
    await page.locator("#reflectionInput").fill("I am arriving hopeful and need Scripture-grounded direction.");
    await page.locator("#completeAssignment").click();

    await expect(page).toHaveURL(/\/canon$/);
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "scripture");
    await page.getByRole("button", { name: /Continue Your Journey/ }).click();

    await expect(page).toHaveURL(/\/promise-table$/);
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "promise");
    await page.locator('[data-phase116b-action="promise-prayer"][data-daily-journey-action="accept"]').first().click();

    await expect(page).toHaveURL(/\/prayer$/);
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "prayer");
    await page.getByLabel("Prayer need").fill("Help me pray through this promise with humility and wise counsel.");
    await page.getByRole("button", { name: "Ask Companion" }).click();
    await expect(page.locator(".companion-reply")).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "calling_discernment");
    await page.getByRole("button", { name: "Continue to Calling Compass" }).click();

    await expect(page).toHaveURL(/\/calling-compass$/);
    await page.locator('[data-phase116b-action="compass-start"]').click();
    await page.locator('[data-phase116b-compass-answer="burden"]').first().click();
    await page.locator('[data-phase116b-action="compass-result"]').click();
    await page.locator('[data-phase116b-action="compass-start-journey"][data-daily-journey-action="accept"]').click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "daily_assignment");
    await expect(page.locator("#completeAssignment")).toHaveText("Complete Assignment");
    await page.locator("#completeAssignment").click();

    await expect(page).toHaveURL(/\/journal$/);
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "reflection");
    await page.getByLabel("Journal reflection").fill("I chose one faithful step and will review its fruit through Scripture, prayer, and counsel.");
    await page.getByRole("button", { name: "Add Reflection" }).click();

    await expect(page).toHaveURL(/\/testimony$/);
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "testimony_candidate");
    await expect(page.locator("#testimonyBody")).not.toHaveValue("");
    await page.locator("#testimonyTitle").fill("A reviewed daily journey draft");
    await page.locator("#testimonyBody").fill("This is my reviewed account. It does not declare fulfillment or certify God's action.");
    await page.getByRole("button", { name: "Save Testimony" }).click();

    await expect(page).toHaveURL(/\/book$/);
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "book_review");
    await page.getByRole("button", { name: "Add Reviewed Testimony to Book" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "tomorrow");
    await expect(page.locator("#completeAssignment")).toHaveText("Carry Forward to Tomorrow");
    await page.locator("#reflectionInput").fill("Return to the same Scripture tomorrow without hidden profiling.");
    await page.locator("#completeAssignment").click();

    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-status", "complete");
    await expect(page.locator("#phase113SaveDrawer")).toContainText("Journey complete");
    const browserStorage = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage)
    }));
    expect(browserStorage).toEqual({ local: [], session: [] });
  });

  test("offers one primary and two secondary journey actions and makes skip, revisit, and undo reversible", async ({ page }) => {
    await page.goto("/");
    await page.locator("#generateBtn").click();
    await expect(page.locator("#generateBtn")).toContainText("Journey Progress");
    await page.locator("#generateBtn").click();

    await expect(page).toHaveURL(/\/journey$/);
    const activeMoment = page.locator("article.card").filter({ hasText: "Active Moment" });
    await expect(activeMoment.locator("button.primary")).toHaveCount(1);
    await expect(activeMoment.locator("button.secondary")).toHaveCount(2);
    await activeMoment.locator('[data-daily-journey-action="revisit"]').click();
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "check_in");
    await activeMoment.locator('[data-daily-journey-action="skip"]').click();
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "scripture");
    await activeMoment.locator('[data-daily-journey-action="undo"]').click();
    await expect(page.locator("body")).toHaveAttribute("data-daily-journey-stage", "check_in");
  });
});
