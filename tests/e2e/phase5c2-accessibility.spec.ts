import { expect, test } from "@playwright/test";

test.describe("Phase 5C-2 approved high-severity accessibility fixes", () => {
  test("A11Y-003 preserves eleven named Canon controls with click, Enter, and Space parity", async ({ page }) => {
    await page.goto("/canon?ownerQa=1");
    const controls = page.locator('#canon [data-canon-video-stage]');
    await expect(controls).toHaveCount(11);
    for (const control of await controls.all()) {
      await expect(control).toHaveAttribute("role", "button");
      await expect(control).toHaveAttribute("tabindex", "0");
      await expect(control).toHaveAttribute("aria-pressed", "false");
      await expect(control).toHaveAttribute("aria-label", /^Play .+ for .+$/);
    }

    const activate = async (index: number, key: "click" | "Enter" | " ") => {
      const control = controls.nth(index);
      if (key === "click") await control.click();
      else { await control.focus(); await control.press(key); }
      await expect(control).toHaveAttribute("aria-pressed", "true");
      await expect(control).toHaveAttribute("data-active-video-id", /^local-/);
      await expect(control.locator("iframe")).toHaveCount(1);
      if (key !== "click") await expect(control).toBeFocused();
    };
    await activate(0, "click");
    await activate(1, "Enter");
    await activate(2, " ");
  });

  test("A11Y-005 exposes durable unique search names without changing input behavior", async ({ page }) => {
    for (const entry of [
      { route: "/lexicon", name: "Search the Teoyube Lexicon" },
      { route: "/embedded-videos", name: "Search embedded videos" },
      { route: "/tables", name: "Search Teoyube tables" }
    ]) {
      await page.goto(`${entry.route}?ownerQa=1`);
      const input = page.getByRole("searchbox", { name: entry.name, exact: true });
      await expect(input).toHaveCount(1);
      await input.fill("faith");
      await expect(input).toHaveValue("faith");
    }
  });

  test("A11Y-006 gives the mobile testimony milestone scroller one named focus target", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/testimony?ownerQa=1");
    const region = page.getByRole("region", { name: "Testimony milestones", exact: true });
    await expect(region).toHaveCount(1);
    await expect(region).toHaveAttribute("tabindex", "0");
    await region.focus();
    await expect(region).toBeFocused();
    const before = await region.evaluate((element) => element.scrollLeft);
    await region.press("ArrowRight");
    await expect(region).toBeFocused();
    expect(await region.evaluate((element) => element.scrollLeft)).toBeGreaterThanOrEqual(before);
  });
});
