import fs from "node:fs";
import os from "node:os";
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
const defaultCheckpointPath = path.join(outputRoot, "performance-accessibility-checkpoint.json");
const performanceThresholdMs = 5_000;
const boundedCellTimeoutMs = 120_000;
const resumableGateEnabled = process.env.TEOYUBE_RESUMABLE_GATE === "1";

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

type GateIdentity = Readonly<{
  gitCommit: string;
  trackedWorktreeStatus: string;
  nodeVersion: string;
  npmVersion: string;
  auditVersion: string;
  thresholdMs: number;
  baselineHashes: unknown;
  buildHashes: unknown;
}>;

type GateCellResult = Record<string, unknown> & {
  cellId: string;
  view: ViewId;
  viewport: ViewportName;
  passed: boolean;
  violations: string[];
  static: { accessibility: AuditResult; performance: PerformanceResult };
  next: { accessibility: AuditResult; performance: PerformanceResult };
};

type GateSegment = {
  segmentId: string;
  startedAt: string;
  endedAt: string | null;
  resumed: boolean;
  initialCompletedCells: number;
  completedCells: number;
  status: "in_progress" | "interrupted" | "failed" | "passed";
};

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

function atomicWriteJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  const handle = fs.openSync(temporary, "r");
  try {
    fs.fsyncSync(handle);
  } finally {
    fs.closeSync(handle);
  }
  fs.renameSync(temporary, filePath);
}

function identitySignature(identity: GateIdentity) {
  return JSON.stringify({
    gitCommit: identity.gitCommit,
    trackedWorktreeStatus: identity.trackedWorktreeStatus,
    nodeVersion: identity.nodeVersion,
    npmVersion: identity.npmVersion,
    auditVersion: identity.auditVersion,
    thresholdMs: identity.thresholdMs,
    baselineHashes: identity.baselineHashes,
    buildHashes: identity.buildHashes
  });
}

function requireEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} for the resumable visual gate.`);
  return value;
}

function canonicalCells() {
  return runtimeManifest.views.flatMap((view) =>
    (Object.keys(runtimeManifest.viewports) as ViewportName[]).map((viewport) => ({
      cellId: `${view}/${viewport}`,
      view,
      viewport
    }))
  );
}

function readResumableSettings() {
  if (!resumableGateEnabled) return null;
  const identityPath = path.resolve(requireEnvironment("TEOYUBE_GATE_IDENTITY_PATH"));
  const checkpointPath = path.resolve(requireEnvironment("TEOYUBE_GATE_CHECKPOINT_PATH"));
  const resultPath = path.resolve(requireEnvironment("TEOYUBE_GATE_RESULT_PATH"));
  const runId = requireEnvironment("TEOYUBE_GATE_RUN_ID");
  const runOrdinal = Number(requireEnvironment("TEOYUBE_GATE_RUN_ORDINAL"));
  const artifactBudgetBytes = Number(requireEnvironment("TEOYUBE_GATE_ARTIFACT_BUDGET_BYTES"));
  for (const candidatePath of [identityPath, checkpointPath, resultPath]) assertDisposableCandidatePath(candidatePath);
  const identity = JSON.parse(fs.readFileSync(identityPath, "utf8")) as GateIdentity;
  if (identity.thresholdMs !== performanceThresholdMs) {
    throw new Error(`Locked threshold mismatch: identity=${identity.thresholdMs}; audit=${performanceThresholdMs}.`);
  }
  if (!Number.isInteger(runOrdinal) || runOrdinal < 1 || !Number.isFinite(artifactBudgetBytes)) {
    throw new Error("Invalid resumable gate ordinal or artifact budget.");
  }
  return { identity, checkpointPath, resultPath, runId, runOrdinal, artifactBudgetBytes };
}

async function withCellTimeout<T>(operation: Promise<T>, cellId: string, attempt: number): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`${cellId} attempt ${attempt} exceeded the ${boundedCellTimeoutMs} ms cell-execution bound.`)),
          boundedCellTimeoutMs
        );
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

test("all 72 matrix cells retain accessibility and provide side-by-side performance evidence", async () => {
  test.setTimeout(2_400_000);
  assertDisposableCandidatePath(outputRoot);
  fs.mkdirSync(outputRoot, { recursive: true });
  const settings = readResumableSettings();
  const checkpointPath = settings?.checkpointPath || defaultCheckpointPath;
  assertDisposableCandidatePath(checkpointPath);
  const cells = canonicalCells();
  const cellOrder = new Map(cells.map((cell, index) => [cell.cellId, index]));
  const startedAt = new Date().toISOString();
  let checkpointStartedAt = startedAt;
  let rows: GateCellResult[] = [];
  let segments: GateSegment[] = [];

  if (settings && fs.existsSync(checkpointPath)) {
    const prior = JSON.parse(fs.readFileSync(checkpointPath, "utf8")) as Record<string, unknown> & {
      schemaVersion?: string;
      runId?: string;
      runOrdinal?: number;
      thresholdMs?: number;
      startedAt?: string;
      results?: GateCellResult[];
      segments?: GateSegment[];
    };
    const priorIdentity = prior as unknown as GateIdentity;
    const compatible =
      prior.schemaVersion === "teoyube-performance-gate-checkpoint-1"
      && prior.runId === settings.runId
      && prior.runOrdinal === settings.runOrdinal
      && prior.thresholdMs === performanceThresholdMs
      && identitySignature(priorIdentity) === identitySignature(settings.identity);
    if (compatible) {
      const failed = (prior.results || []).filter((result) => result.passed === false);
      if (failed.length > 0) throw new Error("A checkpoint containing a failed cell cannot resume or skip that failure.");
      rows = (prior.results || []).filter((result) => result.passed === true);
      segments = [...(prior.segments || [])];
      checkpointStartedAt = prior.startedAt || startedAt;
      const unfinished = segments.at(-1);
      if (unfinished && unfinished.endedAt === null) {
        unfinished.endedAt = String((prior as Record<string, unknown>).updatedAt || startedAt);
        unfinished.status = "interrupted";
      }
    } else {
      fs.rmSync(checkpointPath, { force: true });
    }
  }

  const completedCellIds = new Set(rows.map((row) => row.cellId));
  const segment: GateSegment = {
    segmentId: `${settings?.runId || "nonresumable"}-segment-${segments.length + 1}`,
    startedAt,
    endedAt: null,
    resumed: completedCellIds.size > 0,
    initialCompletedCells: completedCellIds.size,
    completedCells: 0,
    status: "in_progress"
  };
  segments.push(segment);

  const checkpointPayload = (status: "in_progress" | "passed" | "failed") => {
    rows.sort((left, right) => (cellOrder.get(left.cellId) || 0) - (cellOrder.get(right.cellId) || 0));
    const passedCellIds = rows.filter((row) => row.passed).map((row) => row.cellId);
    const failures = rows.filter((row) => !row.passed).flatMap((row) => row.violations);
    const passedSet = new Set(passedCellIds);
    return {
      schemaVersion: "teoyube-performance-gate-checkpoint-1",
      ...(settings?.identity || {
        gitCommit: "nonresumable",
        trackedWorktreeStatus: "unrecorded",
        nodeVersion: process.version,
        npmVersion: process.env.TEOYUBE_NPM_VERSION || "unrecorded",
        auditVersion: "canonical-direct",
        baselineHashes: null,
        buildHashes: null
      }),
      runId: settings?.runId || "canonical-direct",
      runOrdinal: settings?.runOrdinal || 1,
      thresholdMs: performanceThresholdMs,
      artifactBudgetBytes: settings?.artifactBudgetBytes || null,
      completedCellIds: passedCellIds,
      nextCellId: cells.find((cell) => !passedSet.has(cell.cellId))?.cellId || null,
      results: rows,
      failures,
      status,
      startedAt: checkpointStartedAt,
      updatedAt: new Date().toISOString(),
      segments
    };
  };

  atomicWriteJson(checkpointPath, checkpointPayload("in_progress"));

  try {
    for (const view of runtimeManifest.views) {
      const pendingViewports = (Object.keys(runtimeManifest.viewports) as ViewportName[])
        .filter((viewportName) => !completedCellIds.has(`${view}/${viewportName}`));
      if (pendingViewports.length === 0) {
        console.log(`Gate audit resume retained all six completed ${view} cells.`);
        continue;
      }
      const browser = await chromium.launch({ channel: "chrome", headless: true });
      try {
        for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
          const cellId = `${view}/${viewportName}`;
          if (completedCellIds.has(cellId)) {
            console.log(`Gate audit resume retained completed ${cellId}.`);
            continue;
          }
          const staticContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
          const nextContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
          await installDeterminism(staticContext, [new URL(staticBaseUrl).origin]);
          await installDeterminism(nextContext, [new URL(nextBaseUrl).origin]);
          const staticPage = await staticContext.newPage();
          const nextPage = await nextContext.newPage();
          try {
            let attempts = 1;
            let { staticAccessibility, nextAccessibility, staticPerformance, nextPerformance } =
              await withCellTimeout(auditPair(staticPage, nextPage, view), cellId, attempts);
            const firstAttemptMismatch =
              JSON.stringify(staticAccessibility) !== JSON.stringify(nextAccessibility);
            const firstAttemptSlow =
              staticPerformance.readyMs > performanceThresholdMs || nextPerformance.readyMs > performanceThresholdMs;
            if (firstAttemptMismatch || firstAttemptSlow) {
              attempts = 2;
              ({ staticAccessibility, nextAccessibility, staticPerformance, nextPerformance } =
                await withCellTimeout(auditPair(staticPage, nextPage, view), cellId, attempts));
            }
            const cellViolations: string[] = [];
            if (JSON.stringify(staticAccessibility) !== JSON.stringify(nextAccessibility)) {
              cellViolations.push(`${cellId}: accessibility or focus-order mismatch`);
            }
            if (staticPerformance.readyMs > performanceThresholdMs || nextPerformance.readyMs > performanceThresholdMs) {
              cellViolations.push(`${cellId}: local ready time exceeded 5,000 ms`);
            }
            const memory = process.memoryUsage();
            const row: GateCellResult = {
              cellId,
              view,
              route: routeForView(view),
              viewport: viewportName,
              viewportSize: viewport,
              attempts,
              static: { accessibility: staticAccessibility, performance: staticPerformance },
              next: { accessibility: nextAccessibility, performance: nextPerformance },
              accessibilityParity: JSON.stringify(staticAccessibility) === JSON.stringify(nextAccessibility),
              passed: cellViolations.length === 0,
              violations: cellViolations,
              telemetry: {
                capturedAt: new Date().toISOString(),
                processId: process.pid,
                processRssBytes: memory.rss,
                processHeapUsedBytes: memory.heapUsed,
                systemFreeMemoryBytes: os.freemem(),
                systemTotalMemoryBytes: os.totalmem(),
                loadAverage: os.loadavg()
              }
            };
            rows = rows.filter((existing) => existing.cellId !== cellId);
            rows.push(row);
            if (row.passed) completedCellIds.add(cellId);
            segment.completedCells += 1;
            atomicWriteJson(checkpointPath, checkpointPayload("in_progress"));
            console.log(`Gate audit completed ${cellId}: attempts=${attempts}; static=${staticPerformance.readyMs}ms; next=${nextPerformance.readyMs}ms`);
          } finally {
            await staticContext.close();
            await nextContext.close();
          }
        }
      } finally {
        await browser.close();
      }
    }
  } catch (error) {
    segment.endedAt = new Date().toISOString();
    segment.status = "interrupted";
    atomicWriteJson(checkpointPath, checkpointPayload("in_progress"));
    throw error;
  }

  const violations = rows.flatMap((row) => row.violations);
  segment.endedAt = new Date().toISOString();
  segment.status = violations.length === 0 ? "passed" : "failed";

  const routeSummary = runtimeManifest.views.map((view) => {
    const routeRows = rows.filter((row) => row.view === view);
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
    environment: { staticBaseUrl, nextBaseUrl, browser: "Windows Chrome", samplePolicy: "one isolated cold browser context per route and viewport; browser process recycled per route; one same-threshold retry for a transient mismatch or >5,000 ms ready time; local comparative evidence, not a production benchmark", resumable: resumableGateEnabled, segments: segments.length, boundedCellTimeoutMs },
    totals: { routes: runtimeManifest.views.length, viewports: Object.keys(runtimeManifest.viewports).length, cells: rows.length, violations: violations.length },
    routeSummary,
    rows,
    violations
  };
  atomicWriteJson(path.join(outputRoot, "performance-accessibility.json"), artifact);
  const finalStatus = violations.length === 0 && rows.length === 72 ? "passed" : "failed";
  const finalCheckpoint = checkpointPayload(finalStatus);
  atomicWriteJson(checkpointPath, finalCheckpoint);
  if (settings) atomicWriteJson(settings.resultPath, finalCheckpoint);
  expect(rows).toHaveLength(72);
  expect(violations).toEqual([]);
});
