import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  assertParityMatrixIntegrity,
  candidateRoot,
  immutableBaselineRoot,
  nextRouteStatuses,
  runtimeManifest,
  type ViewId,
  type ViewportName
} from "./config";
import { captureCandidate, captureRichContract, installDeterminism, openStaticView, settlePage } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { functionalScenarios, runFunctionalScenario } from "./functional-scenarios";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";

test("Next parity matrix is complete and owner-gated", () => {
  assertParityMatrixIntegrity();
  expect(nextRouteStatuses).toHaveLength(12);
});

for (const status of nextRouteStatuses) {
  for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<
    [ViewportName, { width: number; height: number }]
  >) {
    test(`${status.viewId}/${viewportName} Next candidate parity`, async ({ browser }) => {
      test.skip(status.status === "NOT_VERIFIED", "Initial Next status is NOT VERIFIED; no migration evidence exists.");
      test.setTimeout(180_000);
      const staticContext = await browser.newContext({ viewport, colorScheme: "light", locale: "en-US" });
      const nextContext = await browser.newContext({ viewport, colorScheme: "light", locale: "en-US" });
      await installDeterminism(staticContext, [new URL(staticBaseUrl).origin]);
      await installDeterminism(nextContext, [new URL(nextBaseUrl).origin]);
      const staticPage = await staticContext.newPage();
      const nextPage = await nextContext.newPage();
      const outputGroup = `next-preview/${status.viewId}`;

      try {
        await staticPage.goto(staticBaseUrl, { waitUntil: "domcontentloaded" });
        await staticPage.waitForTimeout(2_500);
        await openStaticView(staticPage, status.viewId as ViewId);
        await nextPage.goto(new URL(status.nextRoute, nextBaseUrl).href, { waitUntil: "domcontentloaded" });
        await settlePage(nextPage);

        const staticContract = await captureRichContract(staticPage, `#${status.viewId}`);
        const nextCandidate = await captureCandidate(
          nextPage,
          outputGroup,
          viewportName,
          status.viewId as ViewId,
          `#${status.viewId}`
        );
        const nextContract = JSON.parse(fs.readFileSync(nextCandidate.contractPath, "utf8"));
        const structuralFailures = compareRichContracts(staticContract, nextContract);
        const screenshot = await compareScreenshots(
          path.join(immutableBaselineRoot, viewportName, `${status.viewId}.png`),
          nextCandidate.screenshotPath,
          path.join(candidateRoot, outputGroup, "evidence", viewportName),
          status.viewId,
          true
        );
        expect(structuralFailures, structuralFailures.join("\n")).toEqual([]);
        expect(screenshot.passed).toBe(true);

        const scenarios = functionalScenarios.filter(
          (scenario) => scenario.view === status.viewId && scenario.viewports.includes(viewportName)
        );
        for (const scenario of scenarios) {
          await staticPage.reload({ waitUntil: "domcontentloaded" });
          await openStaticView(staticPage, status.viewId as ViewId);
          await nextPage.reload({ waitUntil: "domcontentloaded" });
          await settlePage(nextPage);
          const staticResult = await runFunctionalScenario(staticPage, scenario);
          const nextResult = await runFunctionalScenario(nextPage, scenario);
          expect(nextResult, `${scenario.id} functional output differs`).toEqual(staticResult);
        }
      } finally {
        await staticContext.close();
        await nextContext.close();
      }
    });
  }
}
