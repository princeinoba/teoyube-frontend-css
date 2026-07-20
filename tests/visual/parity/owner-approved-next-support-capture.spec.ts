import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { installDeterminism } from "./capture";
import { assertDisposableCandidatePath } from "./config";
import {
  applyNextSupportState,
  captureRichContract,
  captureSupportAudit,
  gotoNextSupportRoute,
  nextSupportCandidateRoot,
  nextSupportSource,
  settleNextSupportRoute,
  stateUsesViewport
} from "./owner-approved-next-support-config";

const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";

test("capture the nine Prompt 12D owner-approved Next support routes and interaction states", async ({ browser }) => {
  test.setTimeout(900_000);
  assertDisposableCandidatePath(nextSupportCandidateRoot);
  for (const viewport of nextSupportSource.viewports) {
    for (const definition of nextSupportSource.routes) {
      for (const state of definition.states.filter((entry) => stateUsesViewport(entry, viewport.name))) {
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
        await installDeterminism(context, [new URL(nextBaseUrl).origin]);
        const page = await context.newPage();
        try {
          await gotoNextSupportRoute(page, `${nextBaseUrl}${definition.route}`);
          await settleNextSupportRoute(page);
          await expect(page).toHaveURL(new RegExp(`${definition.route.replace("/", "\\/")}(?:\\?.*)?$`));
          await expect(page.locator("#primarySidebar")).toBeAttached();
          await expect(page.locator("#appMain > main")).toBeAttached();
          await applyNextSupportState(page, definition.route, state.name);
          await settleNextSupportRoute(page);
          const output = path.join(nextSupportCandidateRoot, definition.slug, viewport.name, state.name);
          assertDisposableCandidatePath(output);
          fs.mkdirSync(output, { recursive: true });
          const contract = await captureRichContract(page, "#appMain > main");
          const audit = await captureSupportAudit(page);
          fs.writeFileSync(path.join(output, "contract.json"), `${JSON.stringify(contract, null, 2)}\n`, "utf8");
          fs.writeFileSync(path.join(output, "audit.json"), `${JSON.stringify(audit, null, 2)}\n`, "utf8");
          await page.screenshot({ path: path.join(output, "screenshot.png"), fullPage: false, animations: "disabled" });
        } finally {
          await context.close();
        }
      }
    }
  }
});
