import { expect, test, type Page } from "@playwright/test";

const upgradedRoutes = [
  { route: "/lexicon", view: "lexicon" },
  { route: "/testimony", view: "testimony" },
  { route: "/book", view: "book" }
] as const;

async function sidebarStyleContract(page: Page) {
  return page.evaluate(() => {
    const style = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing sidebar element: ${selector}`);
      return { element, computed: getComputedStyle(element) };
    };
    const shell = style(".app-shell");
    const sidebar = style("#primarySidebar");
    const brand = style("#primarySidebar .brand-lockup");
    const mark = style("#primarySidebar .brand-mark");
    const navItem = style("#primarySidebar .nav-item");
    const saint = style("#primarySidebar .saint-card");
    return {
      shell: {
        gridTemplateColumns: shell.computed.gridTemplateColumns
      },
      sidebar: {
        backgroundColor: sidebar.computed.backgroundColor,
        borderRadius: sidebar.computed.borderRadius,
        boxShadow: sidebar.computed.boxShadow,
        gap: sidebar.computed.gap,
        margin: sidebar.computed.margin,
        padding: sidebar.computed.padding,
        width: sidebar.element.getBoundingClientRect().width
      },
      brand: {
        gap: brand.computed.gap,
        padding: brand.computed.padding,
        width: brand.element.getBoundingClientRect().width
      },
      mark: {
        height: mark.element.getBoundingClientRect().height,
        width: mark.element.getBoundingClientRect().width
      },
      navItem: {
        fontSize: navItem.computed.fontSize,
        gap: navItem.computed.gap,
        height: navItem.element.getBoundingClientRect().height,
        padding: navItem.computed.padding,
        width: navItem.element.getBoundingClientRect().width
      },
      saint: {
        boxShadow: saint.computed.boxShadow,
        gap: saint.computed.gap,
        padding: saint.computed.padding,
        width: saint.element.getBoundingClientRect().width
      }
    };
  });
}

test("Lexicon, Testimony, and Book use the shared upgraded desktop sidebar", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const referencePage = await context.newPage();
  await referencePage.goto("/search", { waitUntil: "domcontentloaded" });
  const reference = await sidebarStyleContract(referencePage);

  for (const definition of upgradedRoutes) {
    const page = await context.newPage();
    await page.goto(definition.route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toHaveAttribute("data-view", definition.view);
    await expect(page.locator("#primarySidebar .nav-item")).toHaveCount(11);
    await expect(page.locator(`#primarySidebar .nav-item[data-view="${definition.view}"]`)).toHaveClass(/active/);
    expect(await sidebarStyleContract(page)).toEqual(reference);

    await page.locator('#primarySidebar .nav-item[data-view="search"]').click();
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.locator('#primarySidebar .nav-item[data-view="search"]')).toHaveClass(/active/);
    await page.close();
  }

  await referencePage.close();
  await context.close();
});

test("the three upgraded sidebars keep the shared mobile drawer behavior", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

  for (const definition of upgradedRoutes) {
    const page = await context.newPage();
    await page.goto(definition.route, { waitUntil: "domcontentloaded" });
    const toggle = page.locator("#mobileNavToggle");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("body")).toHaveClass(/mobile-nav-open/);
    await expect(page.locator("#primarySidebar")).toBeVisible();
    await expect(page.locator("#primarySidebar")).toHaveCSS("width", "320px");
    await expect(page.locator("#primarySidebar")).toHaveCSS("padding", "16px");
    await expect(page.locator("#primarySidebar")).toHaveCSS("border-radius", "12px");
    await expect(page.locator("#primarySidebar .nav-item")).toHaveCount(11);

    await page.locator("#mobileNavBackdrop").click({ position: { x: 380, y: 20 } });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("body")).not.toHaveClass(/mobile-nav-open/);
    await expect(toggle).toBeFocused();
    await page.close();
  }

  await context.close();
});
