import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { captureRichContract, openStaticView, settlePage } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import {
  assertDisposableCandidatePath,
  candidateRoot,
  runtimeManifest,
  type ViewportName
} from "./config";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";
const evidenceRoot = path.join(candidateRoot, "shell-owner-review");

function scopeContractToShell(contract: Awaited<ReturnType<typeof captureRichContract>>) {
  return {
    ...contract,
    orderedDom: contract.orderedDom.map((row) => {
      const entry = row as Record<string, unknown>;
      if (["primarySidebar", "mobileNavBackdrop", "mobileNavToggle"].includes(String(entry.id || ""))) {
        return { ...entry, parentPath: "body > div.app-shell" };
      }
      return row;
    })
  };
}

async function shellStylesheets(page: Page) {
  return page.evaluate(async () => {
    const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')];
    const direct = links.map((link) => {
      const url = new URL(link.href);
      return `${url.pathname}${url.search}`;
    });
    if (direct.some((href) => href === "/styles/legacy.css?recovery=1")) return direct;
    const imported: string[] = [];
    for (const style of document.querySelectorAll("style")) {
      for (const match of (style.textContent || "").matchAll(/@import\s+url\(["']?([^"')]+)["']?\)/g)) {
        const url = new URL(match[1], location.href);
        imported.push(`${url.pathname}${url.search}`);
      }
    }
    if (imported.length) return imported;
    for (const link of links) {
      const css = await fetch(link.href).then((response) => response.text());
      for (const match of css.matchAll(/@import\s+url\(["']?([^"')]+)["']?\)/g)) {
        const url = new URL(match[1], location.href);
        imported.push(`${url.pathname}${url.search}`);
      }
    }
    return imported;
  });
}

async function responsiveState(page: Page) {
  return page.evaluate(() => {
    const sidebar = document.querySelector("#primarySidebar");
    const backdrop = document.querySelector("#mobileNavBackdrop");
    const toggle = document.querySelector("#mobileNavToggle");
    if (!sidebar || !backdrop || !toggle) throw new Error("Shell responsive controls are missing.");
    const sidebarStyle = getComputedStyle(sidebar);
    const backdropStyle = getComputedStyle(backdrop);
    const sidebarRect = sidebar.getBoundingClientRect();
    return {
      bodyOpen: document.body.classList.contains("mobile-nav-open"),
      expanded: toggle.getAttribute("aria-expanded"),
      backdropHidden: backdrop.hasAttribute("hidden"),
      backdropDisplay: backdropStyle.display,
      sidebarTransform: sidebarStyle.transform,
      sidebarGeometry: {
        x: Math.round(sidebarRect.x * 10) / 10,
        y: Math.round(sidebarRect.y * 10) / 10,
        width: Math.round(sidebarRect.width * 10) / 10,
        height: Math.round(sidebarRect.height * 10) / 10
      }
    };
  });
}

async function captureElement(page: Page, selector: string, outputPath: string) {
  assertDisposableCandidatePath(outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error(`Cannot capture ${selector}: it has no visible bounding box.`);
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  const right = Math.min(viewport.width, Math.ceil(box.x + box.width));
  const bottom = Math.min(viewport.height, Math.ceil(box.y + box.height));
  await page.screenshot({
    path: outputPath,
    animations: "disabled",
    clip: { x, y, width: right - x, height: bottom - y }
  });
}

async function isolateShellPaint(page: Page) {
  await page.addStyleTag({
    content:
      "#appMain > :not(.topbar), #phase113Shell { display: none !important; } .topbar, #primarySidebar { contain: paint; isolation: isolate; } #primarySidebar { transition: none !important; }"
  });
  await page.waitForTimeout(100);
}

test("approved global shell matches at every required viewport", async ({ browser }) => {
  test.setTimeout(360_000);
  assertDisposableCandidatePath(evidenceRoot);
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const context = await browser.newContext({ colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
  const results: Array<Record<string, unknown>> = [];

  try {
    for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<
      [ViewportName, { width: number; height: number }]
    >) {
      if (process.env.TEOYUBE_SHELL_VIEWPORT && process.env.TEOYUBE_SHELL_VIEWPORT !== viewportName) continue;
      const staticPage = await context.newPage();
      const nextPage = await context.newPage();
      await staticPage.setViewportSize(viewport);
      await nextPage.setViewportSize(viewport);
      await staticPage.goto(`${staticBaseUrl}/index.html#today`, { waitUntil: "domcontentloaded" });
      await openStaticView(staticPage, "today");
      await nextPage.goto(`${nextBaseUrl}/`, { waitUntil: "domcontentloaded" });
      await nextPage.waitForFunction(() => document.body.dataset.view === "today");
      await settlePage(nextPage);
      await isolateShellPaint(staticPage);
      await isolateShellPaint(nextPage);

      expect(await shellStylesheets(nextPage)).toEqual(await shellStylesheets(staticPage));

      const staticContract = scopeContractToShell(await captureRichContract(staticPage, ".topbar"));
      const nextContract = scopeContractToShell(await captureRichContract(nextPage, ".topbar"));
      const viewportOutput = path.join(evidenceRoot, viewportName);
      fs.mkdirSync(viewportOutput, { recursive: true });
      fs.writeFileSync(path.join(viewportOutput, "shell.static.contract.json"), `${JSON.stringify(staticContract, null, 2)}\n`, "utf8");
      fs.writeFileSync(path.join(viewportOutput, "shell.next.contract.json"), `${JSON.stringify(nextContract, null, 2)}\n`, "utf8");
      expect(compareRichContracts(staticContract, nextContract), `${viewportName} shell contract`).toEqual([]);

      const elementSelectors = viewport.width <= 768 ? [".topbar", "#mobileNavToggle"] : ["#primarySidebar", ".topbar"];
      const viewportMetrics: Record<string, unknown> = {};

      for (const selector of elementSelectors) {
        const artifactName = selector.replace(/^[.#]/, "").replace(/[^a-z0-9-]+/gi, "-");
        const staticPath = path.join(viewportOutput, `${artifactName}.static.png`);
        await captureElement(staticPage, selector, staticPath);
      }
      if (viewport.width <= 768) {
        await staticPage.locator("#mobileNavToggle").click();
        await settlePage(staticPage);
        await captureElement(staticPage, "#primarySidebar", path.join(viewportOutput, "mobile-sidebar-open.static.png"));
        await staticPage.keyboard.press("Escape");
      }

      for (const selector of elementSelectors) {
        const artifactName = selector.replace(/^[.#]/, "").replace(/[^a-z0-9-]+/gi, "-");
        const staticPath = path.join(viewportOutput, `${artifactName}.static.png`);
        const nextPath = path.join(viewportOutput, `${artifactName}.next.png`);
        await captureElement(nextPage, selector, nextPath);
        const comparison = await compareScreenshots(
          staticPath,
          nextPath,
          viewportOutput,
          artifactName,
          true,
          false
        );
        expect(comparison.strictPassed, `${viewportName} ${selector} raster ratio ${comparison.differentPixelRatio}`).toBe(true);
        viewportMetrics[artifactName] = comparison;
      }

      if (viewport.width <= 768) {
        await nextPage.locator("#mobileNavToggle").click();
        await settlePage(nextPage);
        const staticOpenPath = path.join(viewportOutput, "mobile-sidebar-open.static.png");
        const nextOpenPath = path.join(viewportOutput, "mobile-sidebar-open.next.png");
        await captureElement(nextPage, "#primarySidebar", nextOpenPath);
        const openComparison = await compareScreenshots(
          staticOpenPath,
          nextOpenPath,
          viewportOutput,
          "mobile-sidebar-open",
          true,
          false
        );
        expect(openComparison.strictPassed).toBe(true);
        viewportMetrics.mobileSidebarOpen = openComparison;
        await nextPage.keyboard.press("Escape");
      }

      if (viewport.width <= 768) {
        await staticPage.locator("#mobileNavToggle").click();
        await nextPage.locator("#mobileNavToggle").click();
        await settlePage(staticPage);
        await settlePage(nextPage);
        expect(await responsiveState(nextPage)).toEqual(await responsiveState(staticPage));

        await staticPage.keyboard.press("Escape");
        await nextPage.keyboard.press("Escape");
        expect(await staticPage.evaluate(() => document.activeElement?.id)).toBe("mobileNavToggle");
        expect(await nextPage.evaluate(() => document.activeElement?.id)).toBe("mobileNavToggle");

        await staticPage.locator("#mobileNavToggle").click();
        await nextPage.locator("#mobileNavToggle").click();
        await staticPage.keyboard.press("Escape");
        await nextPage.locator("#mobileNavBackdrop").dispatchEvent("click");
        expect(await responsiveState(nextPage)).toEqual(await responsiveState(staticPage));
      }

      if (viewport.width <= 768) {
        await staticPage.locator("#mobileNavToggle").click();
        await nextPage.locator("#mobileNavToggle").click();
      }
      await staticPage.locator('.nav-item[data-view="canon"]').click();
      await nextPage.locator('.nav-item[data-view="canon"]').click();
      await nextPage.waitForURL(/\/canon$/);
      expect(
        await nextPage.evaluate(() => ({
          view: document.body.dataset.view,
          active: document.querySelector(".nav-item.active")?.textContent?.trim(),
          title: document.querySelector("#viewTitle")?.textContent?.trim()
        }))
      ).toEqual(
        await staticPage.evaluate(() => ({
          view: document.body.dataset.view,
          active: document.querySelector(".nav-item.active")?.textContent?.trim(),
          title: document.querySelector("#viewTitle")?.textContent?.trim()
        }))
      );

      results.push({ viewport: viewportName, width: viewport.width, height: viewport.height, metrics: viewportMetrics });
      await staticPage.close();
      await nextPage.close();
      console.log(`shell parity compared ${viewportName}`);
    }
  } finally {
    await context.close();
  }

  fs.writeFileSync(path.join(evidenceRoot, "summary.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
});
