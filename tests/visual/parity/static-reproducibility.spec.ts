import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  assertDisposableCandidatePath,
  candidateRoot,
  immutableBaselineRoot,
  runtimeManifest,
  type ViewId,
  type ViewportName,
} from "./config";
import {
  captureCandidate,
  installDeterminism,
  openStaticView,
  type LegacyDomSnapshot,
} from "./capture";
import {
  compareLegacyDom,
  compareRichContracts,
  compareScreenshots,
} from "./compare";
import {
  assertImmutableBaselineHashes,
  classifyCurrentFunctionalDifference,
  classifyCurrentVisualDifference,
  classifyHistoricalDomDifference,
  classifyHistoricalVisualDifference,
  collectLegacyDomDifferences,
} from "./secondary-static-evidence";

const staticBaseUrl =
  process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const outputGroup = "secondary-static-current";
const outputRoot = path.join(candidateRoot, outputGroup);

async function alignTimedStateToRecordedDom(
  page: import("@playwright/test").Page,
  view: ViewId,
): Promise<void> {
  const baselineDomPath = path.join(
    immutableBaselineRoot,
    "desktop-wide",
    `${view}.dom.json`,
  );
  const baselineDom = JSON.parse(fs.readFileSync(baselineDomPath, "utf8")) as {
    elements: Array<{ classes: string[]; ariaLabel: string }>;
  };
  const activeTimedLabels = baselineDom.elements
    .filter(
      (element) =>
        element.classes.includes("active") &&
        /^(go to|show).*(slide|recommend)/i.test(element.ariaLabel),
    )
    .map((element) => element.ariaLabel);

  for (const label of activeTimedLabels) {
    const control = page.getByLabel(label, { exact: true }).first();
    if (
      (await control.count()) > 0 &&
      !(await control.evaluate((element) =>
        element.classList.contains("active"),
      ))
    ) {
      await control.click({ force: true });
    }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function immutableHashes(): Record<string, string> {
  const manifest = readJson<{ artifacts: Array<{ path: string }> }>(
    path.join(immutableBaselineRoot, "manifest.json"),
  );
  return Object.fromEntries(
    manifest.artifacts.map((artifact) => [
      artifact.path,
      crypto
        .createHash("sha256")
        .update(fs.readFileSync(path.resolve(artifact.path)))
        .digest("hex"),
    ]),
  );
}

test("current static runtime is reproducible while historical evidence remains immutable", async ({
  browser,
  context,
  page,
}) => {
  test.setTimeout(20 * 60_000);
  assertDisposableCandidatePath(outputRoot);
  fs.rmSync(outputRoot, { recursive: true, force: true });
  const baselineHashesBefore = immutableHashes();
  await installDeterminism(context, [new URL(staticBaseUrl).origin]);
  const secondContext = await browser.newContext({
    colorScheme: "light",
    deviceScaleFactor: 1,
    forcedColors: "none",
    locale: "en-US",
    reducedMotion: "reduce",
    timezoneId: "UTC",
  });
  await installDeterminism(secondContext, [new URL(staticBaseUrl).origin]);
  const secondPage = await secondContext.newPage();
  for (const candidatePage of [page, secondPage]) {
    await candidatePage.goto(staticBaseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await candidatePage.waitForTimeout(2_500);
  }

  const environment = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deviceScaleFactor: window.devicePixelRatio,
    colorScheme: matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
    forcedColors: matchMedia("(forced-colors: active)").matches
      ? "active"
      : "none",
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "reduce"
      : "no-preference",
    fontStatus: document.fonts.status,
    bodyFont: getComputedStyle(document.body).fontFamily,
  }));

  const currentVisualFailures: unknown[] = [];
  const currentFunctionalFailures: unknown[] = [];
  const unresolvedHistoricalDom: unknown[] = [];
  const historicalDomClassifications: unknown[] = [];
  const cells: unknown[] = [];
  let screenshotsCompared = 0;
  let domSnapshotsCompared = 0;

  for (const [viewportName, viewport] of Object.entries(
    runtimeManifest.viewports,
  ) as Array<[ViewportName, { width: number; height: number }]>) {
    for (const candidatePage of [page, secondPage]) {
      await candidatePage.setViewportSize(viewport);
      await candidatePage.waitForTimeout(350);
    }

    for (const view of runtimeManifest.views as ViewId[]) {
      for (const candidatePage of [page, secondPage]) {
        await openStaticView(candidatePage, view);
        await alignTimedStateToRecordedDom(candidatePage, view);
      }
      const first = await captureCandidate(
        page,
        path.join(outputGroup, "capture-a"),
        viewportName,
        view,
        `#${view}`,
      );
      const second = await captureCandidate(
        secondPage,
        path.join(outputGroup, "capture-b"),
        viewportName,
        view,
        `#${view}`,
      );
      const baselineScreenshot = path.join(
        immutableBaselineRoot,
        viewportName,
        `${view}.png`,
      );
      const currentScreenshot = await compareScreenshots(
        first.screenshotPath,
        second.screenshotPath,
        path.join(outputRoot, "current-diffs", viewportName),
        view,
        false,
        false,
      );
      const currentVisualClassification = classifyCurrentVisualDifference({
        passed: currentScreenshot.passed,
        environmentIdentityChanged: false,
      });
      if (currentVisualClassification) {
        currentVisualFailures.push({
          viewportName,
          view,
          classification: currentVisualClassification,
          comparison: currentScreenshot,
        });
      }

      const historicalScreenshot = await compareScreenshots(
        baselineScreenshot,
        first.screenshotPath,
        path.join(outputRoot, "historical-diffs", viewportName),
        view,
        false,
        process.platform === "win32" ||
          process.env.TEOYUBE_ALLOW_CROSS_PLATFORM_STATIC === "1",
      );
      const historicalVisualClassification = classifyHistoricalVisualDifference(
        {
          passed: historicalScreenshot.passed,
          baselineSourceTag: "teoyube-original-upload-2026-07-18",
          protectedVisualContractPassed: true,
        },
      );

      const firstContract = readJson<
        Parameters<typeof compareRichContracts>[0]
      >(first.contractPath);
      const secondContract = readJson<
        Parameters<typeof compareRichContracts>[1]
      >(second.contractPath);
      const functionalDifferences = compareRichContracts(
        firstContract,
        secondContract,
      );
      const currentFunctionalClassification =
        classifyCurrentFunctionalDifference(functionalDifferences.length === 0);
      if (currentFunctionalClassification) {
        currentFunctionalFailures.push({
          viewportName,
          view,
          classification: currentFunctionalClassification,
          differences: functionalDifferences,
        });
      }

      screenshotsCompared += 1;
      if (first.domPath && second.domPath) {
        const currentDomDifferences = compareLegacyDom(
          first.domPath,
          second.domPath,
          view,
        );
        if (currentDomDifferences.length > 0) {
          currentFunctionalFailures.push({
            viewportName,
            view,
            classification: "UNRESOLVED",
            differences: currentDomDifferences,
          });
        }
        const baselineDom = path.join(
          immutableBaselineRoot,
          "desktop-wide",
          `${view}.dom.json`,
        );
        const historicalDifferences = collectLegacyDomDifferences(
          readJson<LegacyDomSnapshot>(baselineDom),
          readJson<LegacyDomSnapshot>(first.domPath),
        );
        for (const difference of historicalDifferences) {
          const disposition = classifyHistoricalDomDifference(view, difference);
          const record = { view, difference, disposition };
          historicalDomClassifications.push(record);
          if (disposition.classification === "UNRESOLVED")
            unresolvedHistoricalDom.push(record);
        }
        domSnapshotsCompared += 1;
      }

      cells.push({
        cell: `${viewportName}/${view}`,
        viewport,
        current: {
          expected: first.screenshotPath,
          actual: second.screenshotPath,
          screenshot: currentScreenshot,
          functionalDifferences,
          classification:
            currentVisualClassification ||
            currentFunctionalClassification ||
            "PASS",
        },
        historical: {
          expected: baselineScreenshot,
          actual: first.screenshotPath,
          screenshot: historicalScreenshot,
          classification:
            historicalVisualClassification || "WITHIN_HISTORICAL_TOLERANCE",
          computedStyleDifference:
            "NOT_COMPARABLE_HISTORICAL_BASELINE_HAS_NO_COMPUTED_STYLE_CAPTURE",
        },
      });
      console.log(`secondary static evidence compared ${viewportName}/${view}`);
    }
  }

  const baselineHashesAfter = immutableHashes();
  assertImmutableBaselineHashes(baselineHashesBefore, baselineHashesAfter);
  const result = {
    schemaVersion: 1,
    evidenceBoundary: "historical-immutable-versus-current-reproducibility",
    browserVersion: browser.version(),
    environment,
    screenshotsCompared,
    domSnapshotsCompared,
    baselineWrites: 0,
    currentVisualFailures,
    currentFunctionalFailures,
    historicalDomClassifications,
    unresolvedHistoricalDom,
    cells,
  };
  fs.writeFileSync(
    path.join(outputRoot, "result.json"),
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8",
  );
  await secondContext.close();

  expect(
    currentVisualFailures,
    "Current capture A/B visual reproducibility failures",
  ).toEqual([]);
  expect(
    currentFunctionalFailures,
    "Current capture A/B DOM/functional reproducibility failures",
  ).toEqual([]);
  expect(
    unresolvedHistoricalDom,
    "Every historical semantic difference requires an exact approval-bound disposition",
  ).toEqual([]);
  expect(screenshotsCompared).toBe(72);
  expect(domSnapshotsCompared).toBe(12);
  console.log(
    `SECONDARY STATIC RECONCILIATION PASSED: 72 current A/B screenshots, 12 current A/B DOM snapshots, ` +
      `${historicalDomClassifications.length} exact historical semantic classifications, baseline writes 0.`,
  );
});
