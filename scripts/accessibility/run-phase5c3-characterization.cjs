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
if (!new Set(["before", "after"]).has(mode)) throw new Error("Usage: node scripts/accessibility/run-phase5c3-characterization.cjs <before|after>");

const nextPort = Number(process.env.TEOYUBE_PHASE5C3_NEXT_PORT || 3189);
const staticPort = Number(process.env.TEOYUBE_PHASE5C3_STATIC_PORT || 4189);
const origins = { next: `http://127.0.0.1:${nextPort}`, static: `http://127.0.0.1:${staticPort}` };
const nextCli = require.resolve("next/dist/bin/next");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const screenshotRoot = path.join(root, ".tmp", "accessibility", "phase-5c3", mode);
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
  {
    key: "today",
    issueIds: ["A11Y-007"],
    nextRoute: "/",
    staticHash: "today",
    rootSelector: "#today",
    groups: [
      { key: "today-promise-dots", selector: "#promiseCarouselDots button[data-slide-index]" },
      { key: "today-featured-dots", selector: ".featured-story-dots button[data-featured-story-index]" }
    ]
  },
  {
    key: "book",
    issueIds: ["A11Y-007"],
    nextRoute: "/book",
    staticHash: "book",
    rootSelector: "#book",
    groups: [
      { key: "book-memory-chips", selector: "#book .book-toolbar .phase116-chip-row button.phase116-chip" },
      { key: "book-memory-filters", selector: "#phase115BookMemory .phase115-memory-filters button" }
    ]
  },
  {
    key: "canon",
    issueIds: ["A11Y-007", "A11Y-008"],
    nextRoute: "/canon",
    staticHash: "canon",
    rootSelector: "#canon",
    groups: [
      { key: "canon-watchman-dots", selector: ".canon-watchman-story-card .canon-watchman-video-dots button[data-watchman-video-index]" }
    ],
    contrastSelector: '[data-canon-item="canon-map-D02"] .canon-status.in-progress, [data-canon-item="canon-map-D05"] .canon-status.in-progress'
  },
  {
    key: "explore",
    issueIds: ["A11Y-007"],
    nextRoute: "/explore",
    staticHash: null,
    rootSelector: "main",
    groups: [{ key: "explore-tabs", selector: ".tab-list button.tab" }]
  }
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
    const fixedNow = 1786032000000;
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args) { super(...(args.length ? args : [fixedNow])); }
      static now() { return fixedNow; }
    }
    Object.defineProperty(window, "Date", { value: FixedDate });
    Math.random = () => 0.5;
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

async function stabilize(page) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 3000);
    })));
  });
  await page.waitForTimeout(200);
}

async function axe(page, definition) {
  const include = [
    ...definition.groups.map((group) => [group.selector]),
    ...(definition.contrastSelector ? [[definition.contrastSelector]] : [])
  ];
  return page.evaluate(async ({ source, include }) => {
    window.eval(source);
    const result = await window.axe.run({ include }, {
      runOnly: { type: "rule", values: ["target-size", "color-contrast"] },
      resultTypes: ["violations"]
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({ target: node.target, failureSummary: node.failureSummary }))
    }));
  }, { source: axeSource, include });
}

async function collectTargets(page, group) {
  return page.locator(group.selector).evaluateAll((elements, groupKey) => {
    const round = (value) => Math.round(value * 10) / 10;
    const label = (element) => String(element.getAttribute("aria-label") || element.textContent || "").replace(/\s+/g, " ").trim();
    const targets = elements.map((element, index) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const centerX = Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2));
      const centerY = Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2));
      const top = document.elementFromPoint(centerX, centerY);
      return {
        index,
        label: label(element),
        className: element.className,
        ariaCurrent: element.getAttribute("aria-current"),
        attributes: Object.fromEntries([...element.attributes].filter((attribute) => attribute.name.startsWith("data-")).map((attribute) => [attribute.name, attribute.value])),
        rect: { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height), right: round(rect.right), bottom: round(rect.bottom) },
        style: {
          display: style.display,
          position: style.position,
          padding: style.padding,
          margin: style.margin,
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          backgroundSize: style.backgroundSize,
          color: style.color,
          overflow: style.overflow,
          minWidth: style.minWidth,
          minHeight: style.minHeight,
          width: style.width,
          height: style.height
        },
        centerHitSelf: Boolean(top && (top === element || element.contains(top))),
        centerTop: top ? `${top.tagName.toLowerCase()}${top.id ? `#${top.id}` : ""}${top.className && typeof top.className === "string" ? `.${top.className.trim().replace(/\s+/g, ".")}` : ""}` : null
      };
    });
    const pairs = [];
    for (let index = 0; index < targets.length - 1; index += 1) {
      const left = targets[index].rect;
      const right = targets[index + 1].rect;
      pairs.push({
        first: index,
        second: index + 1,
        horizontalGap: round(Math.max(0, right.x - left.right)),
        overlap: left.right > right.x && left.x < right.right && left.bottom > right.y && left.y < right.bottom
      });
    }
    return {
      key: groupKey,
      selector: elements.length ? null : "missing",
      count: targets.length,
      minWidth: targets.length ? Math.min(...targets.map((target) => target.rect.width)) : null,
      minHeight: targets.length ? Math.min(...targets.map((target) => target.rect.height)) : null,
      targetSizePassCount: targets.filter((target) => target.rect.width >= 24 && target.rect.height >= 24).length,
      centerHitPassCount: targets.filter((target) => target.centerHitSelf).length,
      overlappingPairCount: pairs.filter((pair) => pair.overlap).length,
      pairs,
      targets
    };
  }, group.key).then((result) => ({ ...result, selector: group.selector }));
}

async function collectContrast(page, selector) {
  if (!selector) return [];
  return page.locator(selector).evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    const card = element.closest("[data-canon-item]");
    return {
      itemId: card?.getAttribute("data-canon-item") || null,
      text: element.textContent?.trim() || "",
      className: element.className,
      color: style.color,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      rect: (() => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }; })()
    };
  }));
}

async function exercise(page, definition) {
  if (definition.key === "today") {
    const promise = page.locator("#promiseCarouselDots button[data-slide-index='1']");
    await promise.click();
    const promiseActive = await promise.getAttribute("aria-current");
    const featured = page.locator(".featured-story-dots button[data-featured-story-index='1']");
    await featured.click();
    return { promiseActive, featuredActive: await featured.getAttribute("aria-current") };
  }
  if (definition.key === "book") {
    const chip = page.locator("#book .book-toolbar button[data-phase116-query='reflection']");
    await chip.click();
    const inputValue = await page.locator("#bookSearchInput").inputValue();
    const filter = page.locator("#phase115BookMemory button[data-phase115-memory-filter='today']");
    await filter.click();
    return { inputValue, activeFilter: await filter.evaluate((element) => element.classList.contains("active")) };
  }
  if (definition.key === "canon") {
    const dot = page.locator(".canon-watchman-story-card button[data-watchman-video-index='1']");
    await dot.click();
    return { activeDot: await dot.getAttribute("aria-current") };
  }
  const tab = page.locator(".tab-list button.tab", { hasText: "Clusters" });
  await tab.click();
  return { activeTab: await tab.evaluate((element) => element.classList.contains("active")), clusterContentVisible: await page.locator(".grid.two").count() > 0 };
}

async function capture(browser, runtime, definition, viewport) {
  const context = await browser.newContext({ viewport, colorScheme: "light", locale: "en-US", reducedMotion: "reduce", hasTouch: viewport.width <= 768 });
  await installDeterminism(context);
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  page.setDefaultNavigationTimeout(45_000);
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  const url = runtime === "next"
    ? `${origins.next}${definition.nextRoute}?ownerQa=1`
    : `${origins.static}/index.html?ownerQa=1#${definition.staticHash}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  const routeRoot = page.locator(definition.rootSelector).first();
  await routeRoot.waitFor({ state: "visible", timeout: 30_000 });
  await stabilize(page);
  const groups = [];
  for (const group of definition.groups) groups.push(await collectTargets(page, group));
  const contrast = await collectContrast(page, definition.contrastSelector);
  const axeResults = await axe(page, definition);
  const directory = path.join(screenshotRoot, runtime, viewport.name);
  fs.mkdirSync(directory, { recursive: true });
  const screenshotPath = path.join(directory, `${definition.key}.png`);
  const screenshot = await routeRoot.screenshot({ path: screenshotPath, animations: "disabled" });
  const routeGeometry = await routeRoot.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight };
  });
  const activation = await exercise(page, definition);
  await context.close();
  return {
    runtime,
    key: definition.key,
    issueIds: definition.issueIds,
    route: definition.nextRoute,
    staticHash: definition.staticHash,
    viewport: viewport.name,
    browser: await browser.version(),
    url,
    screenshot: { path: path.relative(root, screenshotPath).replace(/\\/g, "/"), bytes: screenshot.length, sha256: sha256(screenshot) },
    routeGeometry,
    groups,
    contrast,
    axe: axeResults,
    activation,
    errors
  };
}

async function compareScreenshots(cells) {
  if (mode !== "after") return null;
  const results = [];
  for (const cell of cells) {
    const afterPath = path.join(root, cell.screenshot.path);
    const beforePath = afterPath.replace(`${path.sep}after${path.sep}`, `${path.sep}before${path.sep}`);
    if (!fs.existsSync(beforePath)) throw new Error(`Missing before screenshot: ${path.relative(root, beforePath)}`);
    const before = await sharp(beforePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const after = await sharp(afterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let changedPixels = 0;
    if (before.info.width !== after.info.width || before.info.height !== after.info.height || before.info.channels !== after.info.channels) {
      changedPixels = Math.max(before.info.width * before.info.height, after.info.width * after.info.height);
    } else {
      for (let offset = 0; offset < before.data.length; offset += before.info.channels) {
        let changed = false;
        for (let channel = 0; channel < before.info.channels; channel += 1) if (before.data[offset + channel] !== after.data[offset + channel]) changed = true;
        if (changed) changedPixels += 1;
      }
    }
    results.push({ runtime: cell.runtime, key: cell.key, viewport: cell.viewport, changedPixels });
  }
  return {
    cellCount: results.length,
    changedCellCount: results.filter((result) => result.changedPixels > 0).length,
    changedPixelCount: results.reduce((sum, result) => sum + result.changedPixels, 0),
    results
  };
}

function compareBehavior(cells) {
  if (mode !== "after") return null;
  const before = JSON.parse(fs.readFileSync(path.join(root, "docs", "accessibility", "phase-5c3-before-characterization.json"), "utf8"));
  const beforeByKey = new Map(before.cells.map((cell) => [`${cell.runtime}:${cell.viewport}:${cell.key}`, cell.activation]));
  const results = cells.map((cell) => {
    const key = `${cell.runtime}:${cell.viewport}:${cell.key}`;
    const expected = beforeByKey.get(key);
    return { key, pass: JSON.stringify(cell.activation) === JSON.stringify(expected), before: expected, after: cell.activation };
  });
  return { comparedCells: results.length, passedCells: results.filter((result) => result.pass).length, failures: results.filter((result) => !result.pass) };
}

function summarize(cells) {
  const targetGroups = cells.flatMap((cell) => cell.groups.map((group) => ({ runtime: cell.runtime, key: cell.key, viewport: cell.viewport, ...group })));
  const targetViolations = cells.reduce((sum, cell) => sum + cell.axe.filter((violation) => violation.id === "target-size").reduce((inner, violation) => inner + violation.nodes.length, 0), 0);
  const contrastViolations = cells.reduce((sum, cell) => sum + cell.axe.filter((violation) => violation.id === "color-contrast").reduce((inner, violation) => inner + violation.nodes.length, 0), 0);
  const allErrors = cells.flatMap((cell) => cell.errors);
  const knownErrors = new Set(["console: Failed to load resource: the server responded with a status of 404 (Not Found)", "pageerror: Published media manifest returned 404."]);
  return {
    cellCount: cells.length,
    nextCells: cells.filter((cell) => cell.runtime === "next").length,
    staticCells: cells.filter((cell) => cell.runtime === "static").length,
    viewportCount: new Set(cells.map((cell) => cell.viewport)).size,
    targetGroupCount: targetGroups.length,
    targetCount: targetGroups.reduce((sum, group) => sum + group.count, 0),
    minimumWidth: Math.min(...targetGroups.map((group) => group.minWidth).filter((value) => value !== null)),
    minimumHeight: Math.min(...targetGroups.map((group) => group.minHeight).filter((value) => value !== null)),
    targetSizePassCount: targetGroups.reduce((sum, group) => sum + group.targetSizePassCount, 0),
    centerHitPassCount: targetGroups.reduce((sum, group) => sum + group.centerHitPassCount, 0),
    overlappingPairCount: targetGroups.reduce((sum, group) => sum + group.overlappingPairCount, 0),
    targetViolationNodes: targetViolations,
    contrastViolationNodes: contrastViolations,
    contrastElementCount: cells.reduce((sum, cell) => sum + cell.contrast.length, 0),
    activationPassCount: cells.filter((cell) => Object.values(cell.activation).every(Boolean)).length,
    errorCount: allErrors.length,
    knownErrorCount: allErrors.filter((error) => knownErrors.has(error)).length,
    unexpectedErrorCount: allErrors.filter((error) => !knownErrors.has(error)).length
  };
}

function validate(summary, behaviorComparison) {
  const failures = [];
  if (summary.unexpectedErrorCount) failures.push("Unexpected browser/runtime errors were recorded.");
  if (mode === "before") {
    if (summary.targetViolationNodes === 0) failures.push("A11Y-007 did not reproduce.");
    if (summary.contrastViolationNodes === 0) failures.push("A11Y-008 did not reproduce.");
  } else {
    if (summary.targetViolationNodes !== 0) failures.push("A11Y-007 target-size violations remain.");
    if (summary.contrastViolationNodes !== 0) failures.push("A11Y-008 contrast violations remain.");
    if (summary.minimumWidth < 24 || summary.minimumHeight < 24) failures.push("An approved target remains below 24 by 24 CSS pixels.");
    if (summary.overlappingPairCount !== 0 || summary.centerHitPassCount !== summary.targetCount) failures.push("Approved targets overlap or do not receive their center hit.");
    if (!behaviorComparison || behaviorComparison.passedCells !== behaviorComparison.comparedCells) failures.push("A scoped control activation changed from the before characterization.");
  }
  return failures;
}

async function main() {
  if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error(`Dedicated ports ${nextPort}/${staticPort} must be closed.`);
  const nextServer = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(nextPort)], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production", TEOYUBE_OWNER_QA_TEST_MODE: "true" },
    stdio: "ignore",
    windowsHide: true
  });
  const staticServer = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: { ...process.env, PORT: String(staticPort) },
    stdio: "ignore",
    windowsHide: true
  });
  let browser;
  try {
    await Promise.all([waitForUrl(nextServer, `${origins.next}/api/health`), waitForUrl(staticServer, `${origins.static}/index.html`)]);
    browser = await chromium.launch({ channel: process.platform === "win32" ? "chrome" : undefined, headless: true });
    const checkpointPath = path.join(screenshotRoot, "scoped-cells.json");
    const cells = fs.existsSync(checkpointPath) ? JSON.parse(fs.readFileSync(checkpointPath, "utf8")) : [];
    for (const runtime of ["next", "static"]) {
      for (const viewport of viewports) {
        for (const definition of definitions) {
          if (runtime === "static" && !definition.staticHash) continue;
          if (cells.some((cell) => cell.runtime === runtime && cell.viewport === viewport.name && cell.key === definition.key)) continue;
          console.log(`CAPTURE ${runtime} ${viewport.name} ${definition.key}`);
          cells.push(await capture(browser, runtime, definition, viewport));
          fs.mkdirSync(path.dirname(checkpointPath), { recursive: true });
          fs.writeFileSync(checkpointPath, `${JSON.stringify(cells, null, 2)}\n`, "utf8");
          console.log(`PASS ${runtime} ${viewport.name} ${definition.key}`);
        }
      }
    }
    const summary = summarize(cells);
    const pixelComparison = await compareScreenshots(cells);
    const behaviorComparison = compareBehavior(cells);
    const validationFailures = validate(summary, behaviorComparison);
    const report = {
      schemaVersion: 1,
      phase: "5C-3",
      evidenceStage: mode,
      generatedAt,
      ownerDecisionId: "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001",
      batch: "5C-3",
      issueIds: ["A11Y-007", "A11Y-008"],
      proposalHashes: {
        "A11Y-007": "e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717",
        "A11Y-008": "86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8"
      },
      networkPolicy: "loopback and data only",
      ports: { next: nextPort, static: staticPort },
      viewports,
      cells,
      summary,
      pixelComparison,
      behaviorComparison,
      validationFailures
    };
    write(`tests/accessibility/evidence/phase-5c3/${mode}/manifest.json`, report);
    write(`docs/accessibility/phase-5c3-${mode === "before" ? "before-characterization" : "after-evidence"}.json`, report);
    write(`docs/accessibility/phase-5c3-${mode === "before" ? "before-characterization" : "after-evidence"}.md`, `# Phase 5C-3 ${mode} characterization\n\n- Result: **${mode === "before" ? "BEFORE DEFECTS REPRODUCED" : "AFTER REMEDIATION VERIFIED"}**\n- Generated: ${generatedAt}\n- Owner decision: \`TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001\`\n- Cells: **${summary.cellCount}** (${summary.nextCells} Next, ${summary.staticCells} static) across six approved viewports.\n- Approved targets measured: **${summary.targetCount}** in ${summary.targetGroupCount} groups.\n- Minimum target geometry: **${summary.minimumWidth} × ${summary.minimumHeight} CSS px**.\n- Target-size violation nodes: **${summary.targetViolationNodes}**.\n- Canon contrast violation nodes: **${summary.contrastViolationNodes}**.\n- Overlapping adjacent target pairs: **${summary.overlappingPairCount}**.\n- Successful scoped activation cells: **${summary.activationPassCount}/${summary.cellCount}**.\n- Unexpected browser/runtime errors: **${summary.unexpectedErrorCount}**.\n- Screenshots: ignored working evidence under \`.tmp/accessibility/phase-5c3/${mode}/\`; hashes and geometry are bound in the tracked manifest.\n- Physical touch and manual complex-background contrast evidence: **NOT_TESTED**.\n- Baseline writes: **0**.\n`);
    console.log(JSON.stringify({ summary, pixelComparison, behaviorComparison, validationFailures }, null, 2));
    if (validationFailures.length) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await Promise.all([stopServer(nextServer), stopServer(staticServer)]);
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline && (await portOpen(nextPort) || await portOpen(staticPort))) await new Promise((resolve) => setTimeout(resolve, 250));
    if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error("Owned Phase 5C-3 listeners did not close.");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
