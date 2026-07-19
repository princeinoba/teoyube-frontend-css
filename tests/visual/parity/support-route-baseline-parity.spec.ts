import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { captureRichContract, installDeterminism } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { assertDisposableCandidatePath } from "./config";
import {
  gotoApprovedSupportRoute,
  settleApprovedSupportRoute,
  supportRouteBaselineRoot,
  supportRouteBaselineSource,
  supportRouteVerificationRoot
} from "./support-route-baseline-config";

const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";

test("current Next support routes match all 60 owner-approved baseline cells", async ({ browser }) => {
  test.setTimeout(600_000);
  for (const viewport of supportRouteBaselineSource.viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: "light",
      deviceScaleFactor: 1,
      locale: "en-US"
    });
    await installDeterminism(context, [new URL(nextBaseUrl).origin]);
    const page = await context.newPage();
    try {
      for (const definition of supportRouteBaselineSource.routes) {
        await gotoApprovedSupportRoute(page, `${nextBaseUrl}${definition.route}`);
        await settleApprovedSupportRoute(page);
        await expect(page.locator("#primarySidebar")).toBeAttached();
        await expect(page.locator("#appMain > main")).toBeAttached();
        const baseline = path.join(supportRouteBaselineRoot, definition.slug, viewport.name);
        const output = path.join(supportRouteVerificationRoot, definition.slug, viewport.name);
        assertDisposableCandidatePath(output);
        fs.mkdirSync(output, { recursive: true });
        const contract = await captureRichContract(page, "#appMain > main");
        const candidateContract = path.join(output, "contract.json");
        fs.writeFileSync(candidateContract, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
        const baselineContract = JSON.parse(fs.readFileSync(path.join(baseline, "contract.json"), "utf8"));
        expect(compareRichContracts(baselineContract, contract), `${definition.route}/${viewport.name} contract`).toEqual([]);
        const screenshot = path.join(output, "screenshot.png");
        await page.screenshot({ path: screenshot, fullPage: false, animations: "disabled" });
        const comparison = await compareScreenshots(
          path.join(baseline, "screenshot.png"),
          screenshot,
          output,
          "support-route",
          true,
          false
        );
        expect(comparison.strictPassed, `${definition.route}/${viewport.name} raster ratio`).toBe(true);
      }
    } finally {
      await context.close();
    }
  }
});

test("internal and canonical support-route boundaries are enforced", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/settings`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#primarySidebar .nav-list")).not.toContainText("Graph");
  const response = await page.goto(`${nextBaseUrl}/compass`, { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe("/calling-compass");
  await expect(page.locator("#calling")).toBeAttached();
});
