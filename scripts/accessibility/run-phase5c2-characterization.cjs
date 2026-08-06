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
if (!new Set(["before", "after"]).has(mode)) throw new Error("Usage: node scripts/accessibility/run-phase5c2-characterization.cjs <before|after>");
const nextPort = Number(process.env.TEOYUBE_PHASE5C2_NEXT_PORT || 3187);
const staticPort = Number(process.env.TEOYUBE_PHASE5C2_STATIC_PORT || 4187);
const origins = { next: `http://127.0.0.1:${nextPort}`, static: `http://127.0.0.1:${staticPort}` };
const nextCli = require.resolve("next/dist/bin/next");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const screenshotRoot = path.join(root, ".tmp", "accessibility", "phase-5c2", mode);
const generatedAt = new Date().toISOString();

const viewports = [
  { name: "desktop-wide", width: 1440, height: 900 },
  { name: "desktop-standard", width: 1280, height: 800 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-small", width: 360, height: 800 }
];
const mobileNames = new Set(["mobile", "mobile-small"]);
const definitions = [
  { key: "canon", issueId: "A11Y-003", view: "canon", nextRoute: "/canon", staticHash: "canon", root: "#canon", viewports: "all" },
  { key: "lexicon-search", issueId: "A11Y-005", view: "lexicon", nextRoute: "/lexicon", staticHash: "lexicon", root: "#lexicon", inputId: "lexiconSearchInput", viewports: "all" },
  { key: "embedded-search", issueId: "A11Y-005", view: "embedded-videos", nextRoute: "/embedded-videos", staticHash: "ui-elements", root: "#ui-elements", inputId: "uiVideoSearch", viewports: "all" },
  { key: "tables-search", issueId: "A11Y-005", view: "tables", nextRoute: "/tables", staticHash: "teoyube-tables", root: "#teoyube-tables", inputId: "teoyubeTableSearch", viewports: "all" },
  { key: "testimony-default", issueId: "A11Y-006", view: "testimony", state: "default", nextRoute: "/testimony", staticHash: "testimony", root: "#testimony", viewports: "mobile" },
  { key: "testimony-drafts", issueId: "A11Y-006", view: "testimony", state: "drafts-tab", nextRoute: "/testimony", staticHash: "testimony", root: "#testimony", viewports: "mobile" }
];

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
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
function portOpen(port) {
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
    try { if ((await fetch(url, { cache: "no-store" })).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}.`);
}
async function stopServer(child) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    await waitForExit(spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }));
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
    const installFreezeStyle = () => {
      if (document.getElementById("phase5c2-freeze-style")) return;
      const style = document.createElement("style");
      style.id = "phase5c2-freeze-style";
      style.textContent = "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";
      (document.head || document.documentElement).append(style);
    };
    if (document.documentElement) installFreezeStyle();
    else new MutationObserver((_records, observer) => { if (document.documentElement) { observer.disconnect(); installFreezeStyle(); } }).observe(document, { childList: true, subtree: true });
    Object.defineProperty(window, "setInterval", { value: () => 0 });
    Object.defineProperty(window, "clearInterval", { value: () => {} });
    try { localStorage.clear(); sessionStorage.clear(); } catch {}
  });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname) || url.protocol === "data:") await route.continue();
    else await route.abort("blockedbyclient");
  });
}
async function ariaSnapshot(locator) {
  try {
    return await Promise.race([locator.ariaSnapshot(), new Promise((_, reject) => setTimeout(() => reject(new Error("bounded ariaSnapshot timeout")), 2500))]);
  } catch (error) {
    return `UNAVAILABLE: ${String(error.message || error)}`;
  }
}
async function axe(page, rules) {
  return page.evaluate(async ({ source, wantedRules }) => {
    window.eval(source);
    const result = await window.axe.run(document, { runOnly: { type: "rule", values: wantedRules }, resultTypes: ["violations"] });
    return result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, targets: violation.nodes.map((node) => node.target) }));
  }, { source: axeSource, wantedRules: rules });
}
async function commonEvidence(page, definition, screenshotPath) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}" });
  const routeRoot = page.locator(definition.root);
  await routeRoot.waitFor({ state: "visible", timeout: 30_000 });
  if (definition.state === "drafts-tab") {
    await page.locator(".testimony-tabs button", { hasText: "Drafts" }).click();
    await page.waitForTimeout(100);
  }
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete
      ? Promise.resolve()
      : Promise.race([new Promise((resolve) => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); }), new Promise((resolve) => setTimeout(resolve, 5000))])));
    const backgroundUrls = new Set();
    for (const element of document.querySelectorAll("*")) {
      const value = getComputedStyle(element).backgroundImage;
      for (const match of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)) backgroundUrls.add(match[1]);
    }
    await Promise.all([...backgroundUrls].map((url) => new Promise((resolve) => {
      const image = new Image();
      const done = () => resolve();
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
      image.src = url;
      if (image.complete) resolve();
    })));
  });
  await page.waitForTimeout(200);
  const screenshot = await routeRoot.screenshot({ path: screenshotPath, animations: "disabled" });
  const geometry = await routeRoot.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight };
  });
  return { screenshot: { path: path.relative(root, screenshotPath).replace(/\\/g, "/"), bytes: screenshot.length, sha256: sha256(screenshot) }, geometry };
}

async function canonEvidence(page) {
  const selector = ".canon-project-media, .canon-recent-media";
  const collect = () => page.locator("#canon").evaluate((rootElement, stageSelector) => {
    const expected = new Set(Array.from({ length: 11 }, (_, index) => `canon-map-D${String(index + 2).padStart(2, "0")}`));
    return [...rootElement.querySelectorAll(stageSelector)].map((stage) => {
      const card = stage.closest("[data-canon-item]");
      const itemId = card?.getAttribute("data-canon-item") || null;
      return {
        itemId,
        expected: expected.has(itemId),
        role: stage.getAttribute("role"),
        tabIndexAttribute: stage.getAttribute("tabindex"),
        tabIndexProperty: stage.tabIndex,
        ariaPressed: stage.getAttribute("aria-pressed"),
        ariaLabel: stage.getAttribute("aria-label"),
        videoStage: stage.getAttribute("data-canon-video-stage"),
        videoId: stage.getAttribute("data-canon-video-id"),
        playbackState: stage.getAttribute("data-playback-state"),
        className: stage.className
      };
    }).filter((stage) => stage.expected);
  }, selector);
  const initial = await collect();
  const activations = [];
  for (const key of ["click", "Enter", " "]) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#canon").waitFor({ state: "visible" });
    await page.waitForTimeout(150);
    const stages = page.locator(`${selector}[data-canon-video-stage]`);
    const count = await stages.count();
    if (!count) { activations.push({ key, available: false }); continue; }
    const stage = stages.nth(key === "click" ? 0 : key === "Enter" ? 1 : 2);
    if (key === "click") await stage.click();
    else { await stage.focus(); await stage.press(key); }
    activations.push({ key, available: true, ...(await stage.evaluate((element) => ({ playbackState: element.getAttribute("data-playback-state"), ariaPressed: element.getAttribute("aria-pressed"), hasFrame: Boolean(element.querySelector("iframe")), activeVideoId: element.getAttribute("data-active-video-id"), activeElement: document.activeElement === element }))) });
  }
  return { selector, initial, activations, accessibilityTree: await ariaSnapshot(page.locator("#canon")) };
}

async function searchEvidence(page, inputId) {
  const input = page.locator(`#${inputId}`);
  const initial = await input.evaluate((element) => ({ id: element.id, ariaLabel: element.getAttribute("aria-label"), placeholder: element.getAttribute("placeholder"), role: element.getAttribute("role"), type: element.getAttribute("type"), value: element.value }));
  await input.fill("faith");
  await page.waitForTimeout(100);
  const afterInput = await page.locator(`#${inputId}`).evaluate((element) => ({ value: element.value, connected: element.isConnected, focused: document.activeElement === element }));
  return { inputId, initial, afterInput, accessibilityTree: await ariaSnapshot(page.locator(`#${inputId}`)) };
}

async function testimonyEvidence(page) {
  const region = page.locator(".testimony-milestones");
  const initial = await region.evaluate((element) => ({
    tabIndexAttribute: element.getAttribute("tabindex"),
    tabIndexProperty: element.tabIndex,
    role: element.getAttribute("role"),
    ariaLabel: element.getAttribute("aria-label"),
    scrollLeft: element.scrollLeft,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    children: element.children.length
  }));
  await region.focus();
  const focused = await region.evaluate((element) => document.activeElement === element);
  await region.press("ArrowRight");
  await page.waitForTimeout(150);
  const afterArrow = await region.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const card = element.closest(".testimony-milestones-card")?.getBoundingClientRect();
    return { scrollLeft: element.scrollLeft, focused: document.activeElement === element, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, withinCard: !card || (rect.left >= card.left && rect.right <= card.right && rect.top >= card.top && rect.bottom <= card.bottom) };
  });
  return { selector: ".testimony-milestones", initial, focused, afterArrow, axe: await axe(page, ["scrollable-region-focusable"]), accessibilityTree: await ariaSnapshot(region) };
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
  const url = runtime === "next" ? `${origins.next}${definition.nextRoute}?ownerQa=1` : `${origins.static}/index.html?ownerQa=1#${definition.staticHash}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  const directory = path.join(screenshotRoot, runtime, viewport.name);
  fs.mkdirSync(directory, { recursive: true });
  const common = await commonEvidence(page, definition, path.join(directory, `${definition.key}.png`));
  const issue = definition.issueId === "A11Y-003"
    ? await canonEvidence(page)
    : definition.issueId === "A11Y-005"
      ? await searchEvidence(page, definition.inputId)
      : await testimonyEvidence(page);
  await context.close();
  return { runtime, issueId: definition.issueId, key: definition.key, route: definition.nextRoute, staticHash: definition.staticHash, state: definition.state || "default", viewport: viewport.name, browser: await browser.version(), url, common, issue, errors };
}

const knownErrors = new Set([
  "console: Failed to load resource: the server responded with a status of 404 (Not Found)",
  "pageerror: Published media manifest returned 404."
]);
async function compareScreenshots(cells) {
  if (mode !== "after") return null;
  const results = [];
  for (const cell of cells) {
    const afterPath = path.join(root, cell.common.screenshot.path);
    const beforePath = afterPath.replace(`${path.sep}after${path.sep}`, `${path.sep}before${path.sep}`);
    if (!fs.existsSync(beforePath)) throw new Error(`Missing before screenshot: ${path.relative(root, beforePath)}`);
    const before = await sharp(beforePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const after = await sharp(afterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let changedPixels = 0;
    if (before.info.width !== after.info.width || before.info.height !== after.info.height || before.info.channels !== after.info.channels) changedPixels = Math.max(before.info.width * before.info.height, after.info.width * after.info.height);
    else for (let offset = 0; offset < before.data.length; offset += before.info.channels) {
      let differs = false;
      for (let channel = 0; channel < before.info.channels; channel += 1) if (before.data[offset + channel] !== after.data[offset + channel]) differs = true;
      if (differs) changedPixels += 1;
    }
    results.push({ runtime: cell.runtime, key: cell.key, state: cell.state, viewport: cell.viewport, changedPixels });
  }
  return { cellCount: results.length, changedCellCount: results.filter((item) => item.changedPixels > 0).length, changedPixelCount: results.reduce((sum, item) => sum + item.changedPixels, 0), results };
}
function summarize(cells) {
  const canon = cells.filter((cell) => cell.issueId === "A11Y-003");
  const names = cells.filter((cell) => cell.issueId === "A11Y-005");
  const testimony = cells.filter((cell) => cell.issueId === "A11Y-006");
  const allErrors = cells.flatMap((cell) => cell.errors);
  return {
    cellCount: cells.length,
    runtimeCount: new Set(cells.map((cell) => cell.runtime)).size,
    viewportCount: new Set(cells.map((cell) => cell.viewport)).size,
    errorCount: allErrors.length,
    knownErrorCount: allErrors.filter((error) => knownErrors.has(error)).length,
    unexpectedErrorCount: allErrors.filter((error) => !knownErrors.has(error)).length,
    a11y003: {
      cells: canon.length,
      stageCounts: [...new Set(canon.map((cell) => cell.issue.initial.length))],
      namedKeyboardCells: canon.filter((cell) => cell.issue.initial.length === 11 && cell.issue.initial.every((stage) => stage.role === "button" && stage.tabIndexProperty === 0 && stage.ariaPressed === "false" && stage.ariaLabel)).length,
      activationPasses: canon.reduce((sum, cell) => sum + cell.issue.activations.filter((item) => item.available && item.hasFrame && item.ariaPressed === "true" && item.activeVideoId).length, 0)
    },
    a11y005: {
      cells: names.length,
      namedCells: names.filter((cell) => Boolean(cell.issue.initial.ariaLabel)).length,
      uniqueLabels: [...new Set(names.map((cell) => cell.issue.initial.ariaLabel).filter(Boolean))],
      functionalInputCells: names.filter((cell) => cell.issue.afterInput.value === "faith" && cell.issue.afterInput.connected).length
    },
    a11y006: {
      cells: testimony.length,
      focusableRegionCells: testimony.filter((cell) => cell.issue.initial.tabIndexProperty === 0 && cell.issue.initial.role === "region" && cell.issue.initial.ariaLabel).length,
      focusedCells: testimony.filter((cell) => cell.issue.focused && cell.issue.afterArrow.focused).length,
      scrollableCells: testimony.filter((cell) => cell.issue.initial.scrollWidth > cell.issue.initial.clientWidth).length,
      arrowScrolledCells: testimony.filter((cell) => cell.issue.afterArrow.scrollLeft > cell.issue.initial.scrollLeft).length,
      axeViolationCells: testimony.filter((cell) => cell.issue.axe.length > 0).length,
      containedFocusCells: testimony.filter((cell) => cell.issue.afterArrow.withinCard).length
    }
  };
}
function validateAfter(summary, pixels) {
  if (mode !== "after") return [];
  const failures = [];
  if (summary.unexpectedErrorCount) failures.push("Unexpected browser/runtime errors were recorded.");
  if (summary.a11y003.namedKeyboardCells !== summary.a11y003.cells || summary.a11y003.stageCounts.length !== 1 || summary.a11y003.stageCounts[0] !== 11) failures.push("A11Y-003 stage semantics are incomplete.");
  if (summary.a11y003.activationPasses !== summary.a11y003.cells * 3) failures.push("A11Y-003 click, Enter, and Space playback are not equivalent in every cell.");
  if (summary.a11y005.namedCells !== summary.a11y005.cells || summary.a11y005.uniqueLabels.length !== 3 || summary.a11y005.functionalInputCells !== summary.a11y005.cells) failures.push("A11Y-005 accessible names or input behavior are incomplete.");
  if (summary.a11y006.focusableRegionCells !== summary.a11y006.cells || summary.a11y006.focusedCells !== summary.a11y006.cells || summary.a11y006.axeViolationCells !== 0 || summary.a11y006.containedFocusCells !== summary.a11y006.cells) failures.push("A11Y-006 focusable-region contract is incomplete.");
  if (!pixels || pixels.changedCellCount !== 0) failures.push("Before/after screenshots are not pixel-identical.");
  return failures;
}

async function main() {
  if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error(`Dedicated ports ${nextPort}/${staticPort} must be closed.`);
  const nextServer = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(nextPort)], { cwd: root, env: { ...process.env, NODE_ENV: "production", TEOYUBE_OWNER_QA_TEST_MODE: "true" }, stdio: "ignore", windowsHide: true });
  const staticServer = spawn(process.execPath, [path.join(root, "server.js")], { cwd: root, env: { ...process.env, PORT: String(staticPort) }, stdio: "ignore", windowsHide: true });
  let browser;
  try {
    await Promise.all([waitForUrl(nextServer, `${origins.next}/api/health`), waitForUrl(staticServer, `${origins.static}/index.html`)]);
    browser = await chromium.launch({ channel: process.platform === "win32" ? "chrome" : undefined, headless: true });
    const checkpointPath = path.join(screenshotRoot, "cells.json");
    const cells = fs.existsSync(checkpointPath) ? JSON.parse(fs.readFileSync(checkpointPath, "utf8")) : [];
    for (const runtime of ["next", "static"]) for (const viewport of viewports) for (const definition of definitions) {
      if (definition.viewports === "mobile" && !mobileNames.has(viewport.name)) continue;
      if (cells.some((cell) => cell.runtime === runtime && cell.viewport === viewport.name && cell.key === definition.key)) continue;
      console.log(`CAPTURE ${runtime} ${viewport.name} ${definition.key}`);
      cells.push(await capture(browser, runtime, definition, viewport));
      fs.mkdirSync(path.dirname(checkpointPath), { recursive: true });
      fs.writeFileSync(checkpointPath, `${JSON.stringify(cells, null, 2)}\n`, "utf8");
      console.log(`PASS ${runtime} ${viewport.name} ${definition.key}`);
    }
    const summary = summarize(cells);
    const pixelComparison = await compareScreenshots(cells);
    const validationFailures = validateAfter(summary, pixelComparison);
    const report = { schemaVersion: 1, phase: "5C-2", evidenceStage: mode, generatedAt, ownerDecisionId: "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001", batch: "5C-2", issueIds: ["A11Y-003", "A11Y-005", "A11Y-006"], networkPolicy: "loopback and data only", ports: { next: nextPort, static: staticPort }, viewports, cells, summary, pixelComparison, validationFailures };
    write(`tests/accessibility/evidence/phase-5c2/${mode}/manifest.json`, report);
    write(`docs/accessibility/phase-5c2-${mode === "before" ? "before-characterization" : "after-evidence"}.json`, report);
    write(`docs/accessibility/phase-5c2-${mode === "before" ? "before-characterization" : "after-evidence"}.md`, `# Phase 5C-2 ${mode} characterization\n\n- Result: **${mode === "before" ? "BEFORE DEFECTS REPRODUCED" : "AFTER REMEDIATION VERIFIED"}**\n- Generated: ${generatedAt}\n- Owner decision: \`TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001\`\n- Cells: **${summary.cellCount}** across two runtimes and six approved viewports.\n- Browser/runtime errors: **${summary.errorCount}** total; **${summary.knownErrorCount}** known; **${summary.unexpectedErrorCount}** unexpected.\n- Screenshots: ignored working evidence under \`.tmp/accessibility/phase-5c2/${mode}/\`; hashes and geometry are bound in the tracked manifest.\n\n## A11Y-003\n\n- Cells: ${summary.a11y003.cells}\n- Stage counts: ${summary.a11y003.stageCounts.join(", ")}\n- Cells with all 11 named keyboard controls: ${summary.a11y003.namedKeyboardCells}\n- Passing click/Enter/Space activations: ${summary.a11y003.activationPasses}\n\n## A11Y-005\n\n- Cells: ${summary.a11y005.cells}\n- Cells with durable route-specific names: ${summary.a11y005.namedCells}\n- Unique names: ${summary.a11y005.uniqueLabels.join(", ") || "none"}\n- Search input behavior retained: ${summary.a11y005.functionalInputCells}/${summary.a11y005.cells}\n\n## A11Y-006\n\n- Cells: ${summary.a11y006.cells}\n- Focusable named region cells: ${summary.a11y006.focusableRegionCells}\n- Focus retained during ArrowRight: ${summary.a11y006.focusedCells}\n- Horizontally scrollable cells: ${summary.a11y006.scrollableCells}\n- Arrow-scrolled cells: ${summary.a11y006.arrowScrolledCells}\n- Axe scrollable-region violation cells: ${summary.a11y006.axeViolationCells}\n\nNo baseline was updated.\n`);
    console.log(JSON.stringify({ summary, pixelComparison, validationFailures }, null, 2));
    if (summary.unexpectedErrorCount || validationFailures.length) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await Promise.all([stopServer(nextServer), stopServer(staticServer)]);
    const closeDeadline = Date.now() + 10_000;
    while (Date.now() < closeDeadline && (await portOpen(nextPort) || await portOpen(staticPort))) await new Promise((resolve) => setTimeout(resolve, 250));
    if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error("Owned Phase 5C-2 listeners did not close.");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
