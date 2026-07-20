import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { installDeterminism } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { assertDisposableCandidatePath } from "./config";
import {
  applyNextSupportState,
  captureRichContract,
  captureSupportAudit,
  gotoNextSupportRoute,
  nextSupportBaselineRoot,
  nextSupportSource,
  nextSupportVerificationRoot,
  settleNextSupportRoute,
  stateUsesViewport
} from "./owner-approved-next-support-config";

const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";

test("current Next routes match every Prompt 12D support baseline artifact", async ({ browser }) => {
  test.setTimeout(900_000);
  for (const viewport of nextSupportSource.viewports) {
    for (const definition of nextSupportSource.routes) {
      for (const state of definition.states.filter((entry) => stateUsesViewport(entry, viewport.name))) {
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
        await installDeterminism(context, [new URL(nextBaseUrl).origin]);
        const page = await context.newPage();
        try {
          await gotoNextSupportRoute(page, `${nextBaseUrl}${definition.route}`);
          await settleNextSupportRoute(page);
          await applyNextSupportState(page, definition.route, state.name);
          await settleNextSupportRoute(page);
          const baseline = path.join(nextSupportBaselineRoot, definition.slug, viewport.name, state.name);
          const output = path.join(nextSupportVerificationRoot, definition.slug, viewport.name, state.name);
          assertDisposableCandidatePath(output);
          fs.mkdirSync(output, { recursive: true });
          const contract = await captureRichContract(page, "#appMain > main");
          const audit = await captureSupportAudit(page);
          expect(compareRichContracts(JSON.parse(fs.readFileSync(path.join(baseline, "contract.json"), "utf8")), contract), `${definition.route}/${viewport.name}/${state.name} contract`).toEqual([]);
          const baselineAudit = JSON.parse(fs.readFileSync(path.join(baseline, "audit.json"), "utf8"));
          expect({ issues: audit.issues, focusOrder: audit.focusOrder, lang: audit.lang, storage: audit.storage }, `${definition.route}/${viewport.name}/${state.name} accessibility/focus`).toEqual({
            issues: baselineAudit.issues,
            focusOrder: baselineAudit.focusOrder,
            lang: baselineAudit.lang,
            storage: baselineAudit.storage
          });
          expect(audit.performance.domInteractiveMs).toBeGreaterThanOrEqual(0);
          const screenshot = path.join(output, "screenshot.png");
          await page.screenshot({ path: screenshot, fullPage: false, animations: "disabled" });
          const comparison = await compareScreenshots(path.join(baseline, "screenshot.png"), screenshot, output, "next-support", true, false);
          expect(comparison.strictPassed, `${definition.route}/${viewport.name}/${state.name} raster`).toBe(true);
        } finally {
          await context.close();
        }
      }
    }
  }
});

test("Promise Search retains its distinct local query and six-result behavior", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/promise-search`, { waitUntil: "domcontentloaded" });
  const input = page.getByRole("textbox", { name: "Search Teoyube" });
  await expect(input).toHaveValue("I feel confused about my purpose");
  const defaultResults = await page.locator("#appMain > main .grid.three > *").count();
  expect(defaultResults).toBeGreaterThan(0);
  expect(defaultResults).toBeLessThanOrEqual(6);
  await expect(page.locator("#appMain > main")).toContainText(/Scripture|Psalm|John|Romans|Proverbs|Isaiah/);
  await input.fill("wisdom");
  const wisdomResults = await page.locator("#appMain > main .grid.three > *").count();
  expect(wisdomResults).toBeGreaterThan(0);
  expect(wisdomResults).toBeLessThanOrEqual(6);
  await input.press("Enter");
  await expect(page).toHaveURL(/\/promise-search$/);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("Daily Word and Explore preserve their current generated, TIG, tab, journey, and session-safe behavior", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/daily-word`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#appMain > main")).toContainText("Scripture");
  await expect(page.locator("#appMain > main")).toContainText(/Father|prayer/i);
  await page.locator("#appMain > main").getByRole("button", { name: "Generate Today's Journey", exact: true }).click();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  await page.goto(`${nextBaseUrl}/explore`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#appMain > main")).toContainText("Canon Production Surface");
  await expect(page.locator('[aria-label="Canon journey state"]')).toBeAttached();
  await page.getByRole("button", { name: "Clusters", exact: true }).click();
  await expect(page.getByRole("button", { name: "Clusters", exact: true })).toHaveClass(/active/);
  await page.getByRole("button", { name: "Promise Table", exact: true }).click();
  await expect(page.getByRole("button", { name: "Promise Table", exact: true })).toHaveClass(/active/);
  await page.getByRole("searchbox", { name: "Search", exact: true }).fill("wisdom");
  await expect(page.getByRole("searchbox", { name: "Search", exact: true })).toHaveValue("wisdom");
});

test("Compass preserves safe relevant query parameters and drops unknown input", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/compass?assessment=1&topic=calling%20clarity&unsafe=discard`, { waitUntil: "domcontentloaded" });
  const url = new URL(page.url());
  expect(url.pathname).toBe("/calling-compass");
  expect(url.searchParams.get("assessment")).toBe("1");
  expect(url.searchParams.get("topic")).toBe("calling clarity");
  expect(url.searchParams.has("unsafe")).toBe(false);
  await expect(page.locator("#calling")).toBeAttached();
});

test("Dashboard and internal routes remain absent from normal navigation", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/dashboard`, { waitUntil: "domcontentloaded" });
  const nav = page.locator("#primarySidebar .nav-list");
  await expect(nav).not.toContainText(/Dashboard|Roadmap|Graph|TIG|Teoyube Health|Media Review/i);
});
