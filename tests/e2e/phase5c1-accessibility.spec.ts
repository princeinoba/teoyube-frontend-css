import { expect, test } from "@playwright/test";

test.describe("Phase 5C-1 approved accessibility barriers", () => {
  test("A11Y-001 keeps Lexicon keyboard selection without aria-pressed", async ({ page }) => {
    await page.goto("/lexicon?ownerQa=1");
    const options = page.locator('#lexiconAlphaTabs [role="option"]');
    await expect(options).toHaveCount(27);
    for (const option of await options.all()) await expect(option).not.toHaveAttribute("aria-pressed", /.+/);
    await options.nth(1).focus();
    await options.nth(1).press("Enter");
    await expect(page.locator('#lexiconAlphaTabs [role="option"][aria-selected="true"]')).toHaveCount(1);
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("A11Y-002 excludes every inactive Today carousel slide from focus", async ({ page }) => {
    await page.goto("/?ownerQa=1");
    const verify = async () => {
      const result = await page.locator("#today").evaluate((root) => {
        const slides = [...root.querySelectorAll<HTMLElement>('.carousel-slide[aria-hidden="true"], .featured-story-slide[aria-hidden="true"]')];
        return {
          hidden: slides.length,
          inert: slides.filter((slide) => slide.inert).length,
          focusable: slides.flatMap((slide) => [...slide.querySelectorAll<HTMLElement>("a[href],button,input,select,textarea,[tabindex]")]).filter((control) => control.tabIndex >= 0 && !control.closest("[inert]")).length
        };
      });
      expect(result.hidden).toBeGreaterThan(0);
      expect(result.inert).toBe(result.hidden);
      expect(result.focusable).toBe(0);
    };
    await verify();
    await page.locator("#carouselNext").click();
    await page.locator("#featuredStoryNext").click();
    await verify();
  });

  test("A11Y-004 isolates hidden Canon rows and preserves visible Watchman navigation", async ({ page }) => {
    await page.goto("/canon?ownerQa=1");
    const hiddenWrapper = page.locator('.canon-watchman-story-copy[aria-hidden="true"]');
    await expect(hiddenWrapper).toHaveCount(1);
    await expect(hiddenWrapper).toHaveAttribute("inert", "");
    const hiddenButton = hiddenWrapper.locator("button.canon-recent-merged-row").first();
    expect(await hiddenButton.evaluate((button) => { button.focus(); return document.activeElement === button; })).toBe(false);
    const next = page.locator('[data-watchman-video-nav="next"]').first();
    await expect(next).toBeVisible();
    await next.click();
    await expect(next).toBeVisible();
  });
});
