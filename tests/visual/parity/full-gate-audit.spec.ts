import fs from "node:fs";
import path from "node:path";
import { performance as nodePerformance } from "node:perf_hooks";
import { chromium, expect, test, type Page } from "@playwright/test";
import { installDeterminism } from "./capture";
import {
  assertDisposableCandidatePath,
  candidateRoot,
  routeForView,
  runtimeManifest,
  type ViewId,
  type ViewportName
} from "./config";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4183";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3183";
const outputRoot = path.join(candidateRoot, "next-preview-parity-gate");
const checkpointPath = path.join(outputRoot, "performance-accessibility-checkpoint.json");

type AuditResult = Readonly<{
  issues: readonly string[];
  focusOrder: readonly string[];
  lang: string;
}>;

type PerformanceResult = Readonly<{
  readyMs: number;
  responseStartMs: number;
  domInteractiveMs: number;
  domContentLoadedMs: number;
  loadMs: number;
  resourceCount: number;
  transferBytes: number;
  encodedBodyBytes: number;
}>;

function round(value: number) {
  return Math.round(value * 10) / 10;
}

async function readyForAudit(page: Page) {
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts.ready;
    const visibleImages = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return Boolean(image.currentSrc) && rect.width > 0 && rect.height > 0;
    });
    await Promise.race([
      Promise.all(visibleImages.map((image) => image.complete ? Promise.resolve() : image.decode().catch(() => undefined))),
      new Promise((resolve) => window.setTimeout(resolve, 1_500))
    ]);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function openStaticForAudit(page: Page, view: ViewId) {
  const ownerQa = view === "roadmap" ? "?qa=1" : "";
  await page.goto(`${staticBaseUrl}/index.html${ownerQa}#${view}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof (window as typeof window & { setView?: unknown }).setView === "function");
  await page.evaluate((requestedView) => {
    (window as typeof window & { setView(viewId: string, options: { updateHash: boolean }): void }).setView(requestedView, { updateHash: false });
    if (requestedView === "today") {
      for (const selector of ["#phase116bTodayCommandCenter", "#phase116b1Continuation-today", "#phase115SmartRecommendations-today"]) {
        document.querySelector(selector)?.remove();
      }
    }
    window.scrollTo(0, 0);
  }, view);
  await page.waitForTimeout(450);
  await readyForAudit(page);
  if (view === "today") {
    await page.evaluate(() => {
      for (const selector of ["#phase116bTodayCommandCenter", "#phase116b1Continuation-today", "#phase115SmartRecommendations-today"]) {
        document.querySelector(selector)?.remove();
      }
    });
  }
}

async function openNextForAudit(page: Page, view: ViewId) {
  await page.goto(`${nextBaseUrl}${routeForView(view)}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction((requestedView) => document.body.dataset.view === requestedView, view);
  await page.waitForTimeout(200);
  await readyForAudit(page);
}

async function captureAccessibility(page: Page, rootSelector: string): Promise<AuditResult> {
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) throw new Error(`Missing audit root ${selector}.`);
    const normalize = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim();
    const elements = [root, ...root.querySelectorAll("*")];
    const visible = (element: Element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const path = (element: Element) => {
      if (element.id) return `${element.tagName.toLowerCase()}#${element.id}`;
      const parent = element.parentElement;
      const siblings = parent ? [...parent.children].filter((item) => item.tagName === element.tagName) : [];
      const suffix = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(element) + 1})` : "";
      return `${element.tagName.toLowerCase()}${suffix}`;
    };
    const label = (element: Element) => {
      const labelledBy = element.getAttribute("aria-labelledby");
      const labelledText = labelledBy
        ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ")
        : "";
      const input = element as HTMLInputElement;
      const associated = input.labels ? [...input.labels].map((item) => item.textContent || "").join(" ") : "";
      const imageAlt = [...element.querySelectorAll("img")].map((image) => image.alt).join(" ");
      return normalize(element.getAttribute("aria-label") || labelledText || associated || element.getAttribute("title") || input.placeholder || element.textContent || imageAlt);
    };
    const issues: string[] = [];
    const ids = elements.map((element) => element.id).filter(Boolean);
    for (const id of [...new Set(ids)]) if (ids.filter((value) => value === id).length > 1) issues.push(`duplicate-id:${id}`);
    for (const element of elements) {
      if (element.matches("img:not([alt])")) issues.push(`missing-alt:${path(element)}`);
      if (visible(element) && element.matches("button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab]") && !label(element)) {
        issues.push(`missing-name:${path(element)}`);
      }
      const tabIndex = (element as HTMLElement).tabIndex;
      if (element.hasAttribute("tabindex") && tabIndex > 0) issues.push(`positive-tabindex:${path(element)}:${tabIndex}`);
      if (element.getAttribute("aria-hidden") === "true" && element.querySelector("a[href],button,input,select,textarea,[tabindex]:not([tabindex='-1'])")) {
        issues.push(`aria-hidden-focusable:${path(element)}`);
      }
    }
    const focusOrder = elements
      .filter((element) => visible(element) && element.matches("a[href],button,input,select,textarea,summary,video[controls],audio[controls],[tabindex],[role=button],[role=tab],[role=link]") && (element as HTMLElement).tabIndex >= 0 && !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true")
      .map((element) => `${path(element)}|${(element as HTMLElement).tabIndex}|${label(element)}`);
    return { issues: [...new Set(issues)].sort(), focusOrder, lang: document.documentElement.lang || "" };
  }, rootSelector);
}

async function capturePerformance(page: Page, readyMs: number): Promise<PerformanceResult> {
  return page.evaluate((elapsed) => {
    const navigation = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const resources = window.performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return {
      readyMs: Math.round(elapsed * 10) / 10,
      responseStartMs: Math.round((navigation?.responseStart || 0) * 10) / 10,
      domInteractiveMs: Math.round((navigation?.domInteractive || 0) * 10) / 10,
      domContentLoadedMs: Math.round((navigation?.domContentLoadedEventEnd || 0) * 10) / 10,
      loadMs: Math.round((navigation?.loadEventEnd || 0) * 10) / 10,
      resourceCount: resources.length,
      transferBytes: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
      encodedBodyBytes: resources.reduce((sum, entry) => sum + entry.encodedBodySize, 0)
    };
  }, readyMs);
}

async function auditPair(staticPage: Page, nextPage: Page, view: ViewId) {
  const staticStart = nodePerformance.now();
  await openStaticForAudit(staticPage, view);
  const staticReadyMs = nodePerformance.now() - staticStart;
  const nextStart = nodePerformance.now();
  await openNextForAudit(nextPage, view);
  const nextReadyMs = nodePerformance.now() - nextStart;
  const staticAccessibility = await captureAccessibility(staticPage, `#${view}`);
  const nextAccessibility = await captureAccessibility(nextPage, `#${view}`);
  return {
    staticAccessibility,
    nextAccessibility,
    staticPerformance: await capturePerformance(staticPage, staticReadyMs),
    nextPerformance: await capturePerformance(nextPage, nextReadyMs)
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

test("all 72 matrix cells retain accessibility and provide side-by-side performance evidence", async () => {
  test.setTimeout(2_400_000);
  assertDisposableCandidatePath(outputRoot);
  fs.mkdirSync(outputRoot, { recursive: true });
  const rows: Array<Record<string, unknown>> = [];
  const violations: string[] = [];

  for (const view of runtimeManifest.views) {
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    try {
      for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
        const staticContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
        const nextContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
        await installDeterminism(staticContext, [new URL(staticBaseUrl).origin]);
        await installDeterminism(nextContext, [new URL(nextBaseUrl).origin]);
        const staticPage = await staticContext.newPage();
        const nextPage = await nextContext.newPage();
        try {
          let attempts = 1;
          let { staticAccessibility, nextAccessibility, staticPerformance, nextPerformance } =
            await auditPair(staticPage, nextPage, view);
          const firstAttemptMismatch =
            JSON.stringify(staticAccessibility) !== JSON.stringify(nextAccessibility);
          const firstAttemptSlow =
            staticPerformance.readyMs > 5_000 || nextPerformance.readyMs > 5_000;
          if (firstAttemptMismatch || firstAttemptSlow) {
            attempts = 2;
            ({ staticAccessibility, nextAccessibility, staticPerformance, nextPerformance } =
              await auditPair(staticPage, nextPage, view));
          }
          if (JSON.stringify(staticAccessibility) !== JSON.stringify(nextAccessibility)) violations.push(`${view}/${viewportName}: accessibility or focus-order mismatch`);
          if (staticPerformance.readyMs > 5_000 || nextPerformance.readyMs > 5_000) violations.push(`${view}/${viewportName}: local ready time exceeded 5,000 ms`);
          rows.push({ view, route: routeForView(view), viewport: viewportName, viewportSize: viewport, attempts, static: { accessibility: staticAccessibility, performance: staticPerformance }, next: { accessibility: nextAccessibility, performance: nextPerformance }, accessibilityParity: JSON.stringify(staticAccessibility) === JSON.stringify(nextAccessibility) });
          fs.writeFileSync(checkpointPath, `${JSON.stringify({ rows, violations }, null, 2)}\n`, "utf8");
          console.log(`Gate audit completed ${view}/${viewportName}: attempts=${attempts}; static=${staticPerformance.readyMs}ms; next=${nextPerformance.readyMs}ms`);
        } finally {
          await staticContext.close();
          await nextContext.close();
        }
      }
    } finally {
      await browser.close();
    }
  }

  const routeSummary = runtimeManifest.views.map((view) => {
    const routeRows = rows.filter((row) => row.view === view) as Array<{ static: { performance: PerformanceResult; accessibility: AuditResult }; next: { performance: PerformanceResult; accessibility: AuditResult } }>;
    return {
      view,
      route: routeForView(view),
      cells: routeRows.length,
      staticMedianReadyMs: round(median(routeRows.map((row) => row.static.performance.readyMs))),
      nextMedianReadyMs: round(median(routeRows.map((row) => row.next.performance.readyMs))),
      staticMaxReadyMs: round(Math.max(...routeRows.map((row) => row.static.performance.readyMs))),
      nextMaxReadyMs: round(Math.max(...routeRows.map((row) => row.next.performance.readyMs))),
      existingAccessibilityIssueCount: routeRows[0]?.static.accessibility.issues.length || 0,
      newNextAccessibilityIssueCount: routeRows.filter((row) => JSON.stringify(row.static.accessibility) !== JSON.stringify(row.next.accessibility)).length
    };
  });
  const artifact = {
    artifactType: "next_preview_parity_gate_performance_accessibility",
    generatedAt: new Date().toISOString(),
    environment: { staticBaseUrl, nextBaseUrl, browser: "Windows Chrome", samplePolicy: "one isolated cold browser context per route and viewport; browser process recycled per route; one same-threshold retry for a transient mismatch or >5,000 ms ready time; local comparative evidence, not a production benchmark" },
    totals: { routes: runtimeManifest.views.length, viewports: Object.keys(runtimeManifest.viewports).length, cells: rows.length, violations: violations.length },
    routeSummary,
    rows,
    violations
  };
  fs.writeFileSync(path.join(outputRoot, "performance-accessibility.json"), `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  expect(rows).toHaveLength(72);
  expect(violations).toEqual([]);
});
