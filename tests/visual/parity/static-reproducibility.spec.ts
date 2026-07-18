import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  assertDisposableCandidatePath,
  candidateRoot,
  immutableBaselineRoot,
  runtimeManifest,
  type ViewId,
  type ViewportName
} from "./config";
import { captureCandidate, installDeterminism, openStaticView } from "./capture";
import { compareLegacyDom, compareScreenshots } from "./compare";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const outputGroup = "static-reproducibility";
const outputRoot = path.join(candidateRoot, outputGroup);

async function alignTimedStateToRecordedDom(page: import("@playwright/test").Page, view: ViewId): Promise<void> {
  const baselineDomPath = path.join(immutableBaselineRoot, "desktop-wide", `${view}.dom.json`);
  const baselineDom = JSON.parse(fs.readFileSync(baselineDomPath, "utf8")) as {
    elements: Array<{ classes: string[]; ariaLabel: string }>;
  };
  const activeTimedLabels = baselineDom.elements
    .filter(
      (element) =>
        element.classes.includes("active") &&
        /^(go to|show).*(slide|recommend)/i.test(element.ariaLabel)
    )
    .map((element) => element.ariaLabel);

  for (const label of activeTimedLabels) {
    const control = page.getByLabel(label, { exact: true }).first();
    if ((await control.count()) > 0 && !(await control.evaluate((element) => element.classList.contains("active")))) {
      await control.click({ force: true });
    }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

test("second static capture reproduces all immutable screenshots and DOM snapshots", async ({ context, page }) => {
  test.setTimeout(12 * 60_000);
  assertDisposableCandidatePath(outputRoot);
  fs.rmSync(outputRoot, { recursive: true, force: true });
  await installDeterminism(context, [new URL(staticBaseUrl).origin]);
  await page.goto(staticBaseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(2_500);

  const failures: string[] = [];
  let screenshotsCompared = 0;
  let domSnapshotsCompared = 0;
  let strictRasterPasses = 0;
  let maxRawPixelRatio = 0;
  let maxPerceptualDelta = 0;
  let maxRegionalPerceptualDelta = 0;

  for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<
    [ViewportName, { width: number; height: number }]
  >) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(350);

    for (const view of runtimeManifest.views as ViewId[]) {
      await openStaticView(page, view);
      await alignTimedStateToRecordedDom(page, view);
      const candidate = await captureCandidate(page, outputGroup, viewportName, view, `#${view}`);
      const baselineScreenshot = path.join(immutableBaselineRoot, viewportName, `${view}.png`);
      const screenshot = await compareScreenshots(
        baselineScreenshot,
        candidate.screenshotPath,
        path.join(outputRoot, "diffs", viewportName),
        view,
        false,
        process.platform === "win32" || process.env.TEOYUBE_ALLOW_CROSS_PLATFORM_STATIC === "1"
      );
      screenshotsCompared += 1;
      if (screenshot.strictPassed) strictRasterPasses += 1;
      maxRawPixelRatio = Math.max(maxRawPixelRatio, screenshot.differentPixelRatio);
      maxPerceptualDelta = Math.max(maxPerceptualDelta, screenshot.meanPerceptualDelta);
      maxRegionalPerceptualDelta = Math.max(
        maxRegionalPerceptualDelta,
        screenshot.maxRegionalPerceptualDelta
      );
      if (!screenshot.passed) {
        failures.push(
          `${viewportName}/${view} raw difference ${(screenshot.differentPixelRatio * 100).toFixed(4)}%, ` +
            `perceptual ${(screenshot.meanPerceptualDelta * 100).toFixed(3)}%, ` +
            `max region ${(screenshot.maxRegionalPerceptualDelta * 100).toFixed(3)}%.`
        );
      }

      if (candidate.domPath) {
        const baselineDom = path.join(immutableBaselineRoot, "desktop-wide", `${view}.dom.json`);
        failures.push(...compareLegacyDom(baselineDom, candidate.domPath, view));
        domSnapshotsCompared += 1;
      }
      console.log(`static parity compared ${viewportName}/${view}`);
    }
  }

  if (failures.length) {
    throw new Error(
      `Static reproducibility failed; disposable evidence retained under ${outputRoot}.\n${failures
        .slice(0, 80)
        .map((failure) => `- ${failure}`)
        .join("\n")}`
    );
  }

  expect(screenshotsCompared).toBe(72);
  expect(domSnapshotsCompared).toBe(12);
  fs.rmSync(outputRoot, { recursive: true, force: true });
  console.log(
    `STATIC REPRODUCIBILITY PASSED: 72 screenshots, 12 DOM snapshots, ${strictRasterPasses} raw-raster passes, ` +
      `max raw ${(maxRawPixelRatio * 100).toFixed(4)}%, max perceptual ${(maxPerceptualDelta * 100).toFixed(3)}%, ` +
      `max regional ${(maxRegionalPerceptualDelta * 100).toFixed(3)}%; temporary candidates deleted.`
  );
});
