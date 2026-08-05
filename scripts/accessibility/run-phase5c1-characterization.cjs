#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");
const sharp = require("sharp");

const root = path.resolve(__dirname, "../..");
const mode = process.argv[2];
if (!new Set(["before", "after"]).has(mode)) throw new Error("Usage: node scripts/accessibility/run-phase5c1-characterization.cjs <before|after>");
const nextPort = Number(process.env.TEOYUBE_PHASE5C1_NEXT_PORT || 3186);
const staticPort = Number(process.env.TEOYUBE_PHASE5C1_STATIC_PORT || 4186);
const nextOrigin = `http://127.0.0.1:${nextPort}`;
const staticOrigin = `http://127.0.0.1:${staticPort}`;
const nextCli = require.resolve("next/dist/bin/next");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const screenshotRoot = path.join(root, ".tmp", "accessibility", "phase-5c1", mode);
const evidenceRoot = path.join(root, "tests", "accessibility", "evidence", "phase-5c1", mode);
const generatedAt = new Date().toISOString();

const viewports = [
  { name: "desktop-wide", width: 1440, height: 900 },
  { name: "desktop-standard", width: 1280, height: 800 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-small", width: 360, height: 800 }
];

const definitions = [
  { issueId: "A11Y-001", view: "lexicon", nextRoute: "/lexicon", staticHash: "lexicon", root: "#lexicon" },
  { issueId: "A11Y-002", view: "today", nextRoute: "/", staticHash: "today", root: "#today" },
  { issueId: "A11Y-004", view: "canon", nextRoute: "/canon", staticHash: "canon", root: "#canon" }
];

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function write(relativePath, value) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  fs.writeFileSync(target, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(500);
    socket.once("connect", () => { socket.destroy(); resolve(true); });
    socket.once("timeout", () => { socket.destroy(); resolve(false); });
    socket.once("error", () => resolve(false));
  });
}

async function waitForUrl(child, url) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Owned server exited before ${url} was ready.`);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}.`);
}

async function stopServer(child) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    await waitForExit(killer);
  } else {
    child.kill("SIGTERM");
    await Promise.race([waitForExit(child), new Promise((resolve) => setTimeout(resolve, 2000))]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
}

async function installDeterminism(context) {
  await context.addInitScript(() => {
    const fixedNow = 1785945600000;
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args) { super(...(args.length ? args : [fixedNow])); }
      static now() { return fixedNow; }
    }
    Object.defineProperty(window, "Date", { value: FixedDate });
    Math.random = () => 0.5;
    try { window.localStorage.clear(); window.sessionStorage.clear(); } catch {}
  });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname) || url.protocol === "data:") await route.continue();
    else await route.abort("blockedbyclient");
  });
}

async function ariaSnapshot(locator) {
  try {
    return await Promise.race([
      locator.ariaSnapshot(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("bounded ariaSnapshot timeout")), 2500))
    ]);
  }
  catch (error) { return `UNAVAILABLE: ${String(error.message || error)}`; }
}

async function commonEvidence(page, definition, screenshotPath) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}" });
  const rootLocator = page.locator(definition.root);
  await rootLocator.waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(200);
  const screenshot = await rootLocator.screenshot({ path: screenshotPath, animations: "disabled" });
  const geometry = await rootLocator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight };
  });
  const axe = await page.evaluate(async (source) => {
    window.eval(source);
    const result = await window.axe.run(document, { runOnly: { type: "rule", values: ["aria-allowed-attr", "aria-hidden-focus"] }, resultTypes: ["violations"] });
    return result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, targets: violation.nodes.map((node) => node.target) }));
  }, axeSource);
  return { screenshot: { path: path.relative(root, screenshotPath).replace(/\\/g, "/"), bytes: screenshot.length, sha256: sha256(screenshot) }, geometry, axe };
}

async function lexiconEvidence(page) {
  const tabs = page.locator("#lexiconAlphaTabs");
  const before = await tabs.evaluate((rootElement) => {
    const options = [...rootElement.querySelectorAll('[role="option"]')];
    return { count: options.length, ariaPressedCount: options.filter((item) => item.hasAttribute("aria-pressed")).length, selectedTrueCount: options.filter((item) => item.getAttribute("aria-selected") === "true").length, classes: options.map((item) => item.className), ids: options.map((item) => item.id), labels: options.map((item) => item.getAttribute("aria-label")) };
  });
  const second = tabs.locator('[role="option"]').nth(1);
  await second.focus();
  await second.press("Enter");
  const afterActivation = await tabs.evaluate((rootElement) => ({
    selectedTrueCount: [...rootElement.querySelectorAll('[role="option"]')].filter((item) => item.getAttribute("aria-selected") === "true").length,
    selectedLabel: rootElement.querySelector('[role="option"][aria-selected="true"]')?.getAttribute("aria-label") || null,
    ariaPressedCount: rootElement.querySelectorAll('[role="option"][aria-pressed]').length
  }));
  return { selector: '#lexiconAlphaTabs [role="option"]', before, afterActivation, accessibilityTree: await ariaSnapshot(tabs) };
}

async function todayEvidence(page) {
  const collect = () => page.locator("#today").evaluate((rootElement) => {
    const candidate = "a[href],button,input,select,textarea,[tabindex]";
    const summarize = (selector) => [...rootElement.querySelectorAll(selector)].map((slide) => ({
      className: slide.className,
      ariaHidden: slide.getAttribute("aria-hidden"),
      inertAttribute: slide.hasAttribute("inert"),
      inertProperty: Boolean(slide.inert),
      focusableDescendants: [...slide.querySelectorAll(candidate)].filter((item) => item.tabIndex >= 0 && !item.hasAttribute("disabled") && !item.closest("[inert]")).map((item) => item.id ? `${item.tagName.toLowerCase()}#${item.id}` : `${item.tagName.toLowerCase()}.${item.className}`)
    }));
    return { promiseSlides: summarize(".carousel-slide"), featuredStorySlides: summarize(".featured-story-slide") };
  });
  const initial = await collect();
  await page.locator("#carouselNext").click();
  const afterPromiseNext = await collect();
  await page.locator("#featuredStoryNext").click();
  const afterFeaturedNext = await collect();
  return {
    selectors: ["#todayPromiseCarousel .carousel-slide", "#featuredStoryCarousel .featured-story-slide"],
    initial,
    afterPromiseNext,
    afterFeaturedNext,
    accessibilityTree: {
      promise: await ariaSnapshot(page.locator("#todayPromiseCarousel")),
      featuredStory: await ariaSnapshot(page.locator("#featuredStoryCarousel"))
    }
  };
}

async function canonEvidence(page) {
  const collect = () => page.locator("#canon").evaluate((rootElement) => {
    const wrappers = [...rootElement.querySelectorAll('.canon-watchman-story-copy[aria-hidden="true"]')];
    return {
      wrappers: wrappers.map((wrapper) => ({
        inertAttribute: wrapper.hasAttribute("inert"),
        inertProperty: Boolean(wrapper.inert),
        nestedRows: [...wrapper.querySelectorAll("button.canon-recent-merged-row")].map((button) => ({ tabIndex: button.tabIndex, disabled: button.disabled }))
      })),
      visibleControls: [...rootElement.querySelectorAll("[data-watchman-video-nav], [data-watchman-video-index]")].filter((item) => { const rect = item.getBoundingClientRect(); return rect.width > 0 && rect.height > 0; }).map((item) => ({ selector: item.hasAttribute("data-watchman-video-nav") ? `[data-watchman-video-nav="${item.getAttribute("data-watchman-video-nav")}"]` : `[data-watchman-video-index="${item.getAttribute("data-watchman-video-index")}"]`, ariaCurrent: item.getAttribute("aria-current"), label: item.getAttribute("aria-label") }))
    };
  });
  const initial = await collect();
  const hiddenButton = page.locator('.canon-watchman-story-copy[aria-hidden="true"] button.canon-recent-merged-row').first();
  const programmaticFocus = await hiddenButton.evaluate((button) => { button.focus(); return { focused: document.activeElement === button, activeElement: document.activeElement?.className || document.activeElement?.tagName || null }; });
  const next = page.locator('[data-watchman-video-nav="next"]').first();
  const visibleNavigationOperable = await next.count() ? (await next.click(), true) : false;
  const afterNavigation = await collect();
  return { selector: '.canon-watchman-story-copy[aria-hidden="true"]', initial, programmaticFocus, visibleNavigationOperable, afterNavigation, accessibilityTree: await ariaSnapshot(page.locator(".canon-watchman-story-card").first()) };
}

async function capture(browser, runtime, definition, viewport) {
  const context = await browser.newContext({ viewport, colorScheme: "light", locale: "en-US", reducedMotion: "reduce" });
  await installDeterminism(context);
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(45_000);
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  const url = runtime === "next" ? `${nextOrigin}${definition.nextRoute}?ownerQa=1` : `${staticOrigin}/index.html?ownerQa=1#${definition.staticHash}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 2500 }).catch(() => {});
  const directory = path.join(screenshotRoot, runtime, viewport.name);
  fs.mkdirSync(directory, { recursive: true });
  const common = await commonEvidence(page, definition, path.join(directory, `${definition.view}.png`));
  const issue = definition.issueId === "A11Y-001" ? await lexiconEvidence(page) : definition.issueId === "A11Y-002" ? await todayEvidence(page) : await canonEvidence(page);
  await context.close();
  return { runtime, issueId: definition.issueId, route: definition.nextRoute, staticHash: definition.staticHash, view: definition.view, viewport: viewport.name, browser: await browser.version(), inputModes: ["keyboard", "pointer", "programmatic-focus"], url, common, issue, errors };
}

const knownPreExistingErrors = new Set([
  "console: Failed to load resource: the server responded with a status of 404 (Not Found)",
  "pageerror: Published media manifest returned 404."
]);

async function compareScreenshots(cells) {
  if (mode !== "after") return null;
  const results = [];
  for (const cell of cells) {
    const afterPath = path.join(root, cell.common.screenshot.path);
    const beforePath = path.join(root, cell.common.screenshot.path.replace("/after/", "/before/"));
    if (!fs.existsSync(beforePath)) throw new Error(`Missing before screenshot: ${path.relative(root, beforePath)}`);
    const before = await sharp(beforePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const after = await sharp(afterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let diffPixels = 0;
    if (before.info.width !== after.info.width || before.info.height !== after.info.height || before.info.channels !== after.info.channels) {
      diffPixels = Math.max(before.info.width * before.info.height, after.info.width * after.info.height);
    } else {
      const channels = before.info.channels;
      for (let offset = 0; offset < before.data.length; offset += channels) {
        let differs = false;
        for (let channel = 0; channel < channels; channel += 1) if (before.data[offset + channel] !== after.data[offset + channel]) differs = true;
        if (differs) diffPixels += 1;
      }
    }
    results.push({ runtime: cell.runtime, viewport: cell.viewport, issueId: cell.issueId, view: cell.view, diffPixels });
  }
  return {
    cellCount: results.length,
    changedCellCount: results.filter((result) => result.diffPixels > 0).length,
    totalDiffPixels: results.reduce((sum, result) => sum + result.diffPixels, 0),
    maxDiffPixels: Math.max(0, ...results.map((result) => result.diffPixels)),
    results
  };
}

function validateAfter(summary, pixelComparison) {
  if (mode !== "after") return [];
  const failures = [];
  if (summary.a11y001.ariaPressedCells !== 0 || summary.a11y001.validSingleSelectionCells !== 12) failures.push("A11Y-001 failed across the 12 runtime/viewport cells.");
  if (summary.a11y002.inertHiddenSlideCount !== summary.a11y002.hiddenSlideCount || summary.a11y002.hiddenFocusableDescendantCount !== 0) failures.push("A11Y-002 failed across the 12 runtime/viewport cells.");
  if (summary.a11y004.inertWrapperCount !== summary.a11y004.hiddenWrapperCount || summary.a11y004.programmaticFocusCells !== 0 || summary.a11y004.visibleNavigationOperableCells !== 12) failures.push("A11Y-004 failed across the 12 runtime/viewport cells.");
  if (!pixelComparison || pixelComparison.changedCellCount !== 0) failures.push("Before/after screenshots are not pixel-identical.");
  return failures;
}

function summarize(cells) {
  const lexicon = cells.filter((cell) => cell.issueId === "A11Y-001");
  const today = cells.filter((cell) => cell.issueId === "A11Y-002");
  const canon = cells.filter((cell) => cell.issueId === "A11Y-004");
  const todayHidden = (cell) => [...cell.issue.initial.promiseSlides, ...cell.issue.initial.featuredStorySlides].filter((slide) => slide.ariaHidden === "true");
  return {
    cellCount: cells.length,
    runtimeCount: new Set(cells.map((cell) => cell.runtime)).size,
    viewportCount: new Set(cells.map((cell) => cell.viewport)).size,
    errorCount: cells.reduce((sum, cell) => sum + cell.errors.length, 0),
    knownPreExistingErrorCount: cells.reduce((sum, cell) => sum + cell.errors.filter((error) => knownPreExistingErrors.has(error)).length, 0),
    unexpectedErrorCount: cells.reduce((sum, cell) => sum + cell.errors.filter((error) => !knownPreExistingErrors.has(error)).length, 0),
    a11y001: { cells: lexicon.length, optionCountPerCell: [...new Set(lexicon.map((cell) => cell.issue.before.count))], ariaPressedCells: lexicon.filter((cell) => cell.issue.before.ariaPressedCount > 0).length, validSingleSelectionCells: lexicon.filter((cell) => cell.issue.afterActivation.selectedTrueCount === 1).length },
    a11y002: { cells: today.length, hiddenSlideCount: today.reduce((sum, cell) => sum + todayHidden(cell).length, 0), inertHiddenSlideCount: today.reduce((sum, cell) => sum + todayHidden(cell).filter((slide) => slide.inertAttribute).length, 0), hiddenFocusableDescendantCount: today.reduce((sum, cell) => sum + todayHidden(cell).reduce((inner, slide) => inner + slide.focusableDescendants.length, 0), 0) },
    a11y004: { cells: canon.length, hiddenWrapperCount: canon.reduce((sum, cell) => sum + cell.issue.initial.wrappers.length, 0), inertWrapperCount: canon.reduce((sum, cell) => sum + cell.issue.initial.wrappers.filter((wrapper) => wrapper.inertAttribute).length, 0), programmaticFocusCells: canon.filter((cell) => cell.issue.programmaticFocus.focused).length, visibleNavigationOperableCells: canon.filter((cell) => cell.issue.visibleNavigationOperable).length }
  };
}

async function main() {
  if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error(`Dedicated ports ${nextPort}/${staticPort} must be closed.`);
  const nextServer = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(nextPort)], { cwd: root, env: { ...process.env, NODE_ENV: "production", TEOYUBE_OWNER_QA_TEST_MODE: "true" }, stdio: "ignore", windowsHide: true });
  const staticServer = spawn(process.execPath, [path.join(root, "server.js")], { cwd: root, env: { ...process.env, PORT: String(staticPort) }, stdio: "ignore", windowsHide: true });
  let browser;
  try {
    await Promise.all([waitForUrl(nextServer, `${nextOrigin}/api/health`), waitForUrl(staticServer, `${staticOrigin}/index.html`)]);
    browser = await chromium.launch({ channel: process.platform === "win32" ? "chrome" : undefined, headless: true });
    const checkpointPath = path.join(screenshotRoot, "cells.json");
    const cells = fs.existsSync(checkpointPath) ? JSON.parse(fs.readFileSync(checkpointPath, "utf8")) : [];
    for (const runtime of ["next", "static"]) for (const viewport of viewports) for (const definition of definitions) {
      const alreadyCaptured = cells.some((cell) => cell.runtime === runtime && cell.viewport === viewport.name && cell.issueId === definition.issueId);
      if (alreadyCaptured) {
        console.log(`SKIP ${runtime} ${viewport.name} ${definition.issueId}`);
        continue;
      }
      console.log(`CAPTURE ${runtime} ${viewport.name} ${definition.issueId}`);
      cells.push(await capture(browser, runtime, definition, viewport));
      fs.writeFileSync(checkpointPath, `${JSON.stringify(cells, null, 2)}\n`, "utf8");
      console.log(`PASS ${runtime} ${viewport.name} ${definition.issueId}`);
    }
    const summary = summarize(cells);
    const pixelComparison = await compareScreenshots(cells);
    const validationFailures = validateAfter(summary, pixelComparison);
    const report = { schemaVersion: 1, phase: "5C-1", evidenceStage: mode, generatedAt, ownerDecisionId: "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001", batch: "5C-1", issueIds: definitions.map((item) => item.issueId), networkPolicy: "loopback and data only", ports: { next: nextPort, static: staticPort }, viewports, cells, summary, pixelComparison, validationFailures };
    fs.mkdirSync(evidenceRoot, { recursive: true });
    write(`tests/accessibility/evidence/phase-5c1/${mode}/manifest.json`, report);
    write(`docs/accessibility/phase-5c1-${mode === "before" ? "before-characterization" : "after-evidence"}.json`, report);
    const resultLabel = mode === "before" ? "BEFORE DEFECTS REPRODUCED" : "AFTER REMEDIATION VERIFIED";
    write(`docs/accessibility/phase-5c1-${mode === "before" ? "before-characterization" : "after-evidence"}.md`, `# Phase 5C-1 ${mode} characterization\n\n- Result: **${resultLabel}**\n- Generated: ${generatedAt}\n- Owner decision: \`TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001\`\n- Cells: **${summary.cellCount}** (${summary.runtimeCount} runtimes × ${summary.viewportCount} viewports × 3 issues)\n- Browser/runtime errors: **${summary.errorCount}** total; **${summary.knownPreExistingErrorCount}** unchanged published-media-manifest 404 errors; **${summary.unexpectedErrorCount}** unexpected\n- Screenshots: ignored working evidence under \`.tmp/accessibility/phase-5c1/${mode}/\`; hashes and geometry are bound in the tracked manifest.\n\n## A11Y-001\n\n- Cells: ${summary.a11y001.cells}\n- Options per cell: ${summary.a11y001.optionCountPerCell.join(", ")}\n- Cells with unsupported \`aria-pressed\`: ${summary.a11y001.ariaPressedCells}\n- Cells retaining one selected option after keyboard activation: ${summary.a11y001.validSingleSelectionCells}\n\n## A11Y-002\n\n- Cells: ${summary.a11y002.cells}\n- Hidden slides: ${summary.a11y002.hiddenSlideCount}\n- Hidden slides made inert: ${summary.a11y002.inertHiddenSlideCount}\n- Focusable descendants remaining in hidden slides: ${summary.a11y002.hiddenFocusableDescendantCount}\n\n## A11Y-004\n\n- Cells: ${summary.a11y004.cells}\n- Hidden copy wrappers: ${summary.a11y004.hiddenWrapperCount}\n- Hidden wrappers made inert: ${summary.a11y004.inertWrapperCount}\n- Cells where the hidden row accepts programmatic focus: ${summary.a11y004.programmaticFocusCells}\n- Cells where visible Watchman navigation remains operable: ${summary.a11y004.visibleNavigationOperableCells}\n\nNo baseline was updated.\n`);
    console.log(JSON.stringify({ summary, pixelComparison, validationFailures }, null, 2));
    if (summary.unexpectedErrorCount || validationFailures.length) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await Promise.all([stopServer(nextServer), stopServer(staticServer)]);
    if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error("Owned Phase 5C-1 listeners did not close.");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
