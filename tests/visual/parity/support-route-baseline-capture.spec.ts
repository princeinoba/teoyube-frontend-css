import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { captureRichContract, installDeterminism } from "./capture";
import { assertDisposableCandidatePath } from "./config";
import {
  gotoApprovedSupportRoute,
  settleApprovedSupportRoute,
  supportRouteBaselineSource,
  supportRouteCandidateRoot
} from "./support-route-baseline-config";

const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";

test("capture the ten owner-approved support routes from the approved Next commit", async ({ browser }) => {
  test.setTimeout(600_000);
  assertDisposableCandidatePath(supportRouteCandidateRoot);

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
        const output = path.join(supportRouteCandidateRoot, definition.slug, viewport.name);
        assertDisposableCandidatePath(output);
        fs.mkdirSync(output, { recursive: true });
        const contract = await captureRichContract(page, "#appMain > main");
        fs.writeFileSync(path.join(output, "contract.json"), `${JSON.stringify(contract, null, 2)}\n`, "utf8");
        await page.screenshot({
          path: path.join(output, "screenshot.png"),
          fullPage: false,
          animations: "disabled"
        });
      }
    } finally {
      await context.close();
    }
  }
});
