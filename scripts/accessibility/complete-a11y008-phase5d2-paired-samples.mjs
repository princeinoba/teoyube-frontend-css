#!/usr/bin/env node
"use strict";

import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const measurementPath = path.join(root, "docs", "accessibility", "a11y008-phase5d2-measurements.json");
const retainedRoot = path.join(root, "tests", "accessibility", "evidence", "a11y008-phase5d2");
const nextPort = 3294;
const staticPort = 4294;
const origins = { next: `http://127.0.0.1:${nextPort}`, static: `http://127.0.0.1:${staticPort}` };
const nextCli = require.resolve("next/dist/bin/next");
const requiredRatio = 4.5;
const browsers = [
  { id: "playwright-chromium", launch: {} },
  { id: "google-chrome", launch: { channel: "chrome" } },
  { id: "microsoft-edge", launch: { channel: "msedge" } }
];
const routes = {
  next: { route: "/canon?ownerQa=1", root: "#canon" },
  static: { route: "/index.html?ownerQa=1#canon", root: "#canon" }
};

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalizePath = (value) => path.relative(root, value).replace(/\\/g, "/");
const rgbKey = (color) => `${color.r},${color.g},${color.b}`;
function writeJson(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
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
async function ready(page, rootSelector) {
  await page.locator(rootSelector).waitFor({ state: "visible", timeout: 30_000 });
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 3000);
    })));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
function luminance(color) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}
function contrastRatio(left, right) {
  const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return Math.round(((values[0] + 0.05) / (values[1] + 0.05)) * 10_000) / 10_000;
}
function distance(left, right) {
  return Math.sqrt((left.r - right.r) ** 2 + (left.g - right.g) ** 2 + (left.b - right.b) ** 2);
}
function parseHexColor(value) {
  const normalized = String(value || "").replace(/^#/, "");
  const expanded = normalized.length === 3 ? normalized.split("").map((part) => `${part}${part}`).join("") : normalized;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return null;
  return { r: Number.parseInt(expanded.slice(0, 2), 16), g: Number.parseInt(expanded.slice(2, 4), 16), b: Number.parseInt(expanded.slice(4, 6), 16), a: 1 };
}
async function analyzeRendered(elementBuffer, backgroundBuffer, maskPath) {
  const image = await sharp(elementBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const backgroundOnly = await sharp(backgroundBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = image.info;
  if (backgroundOnly.info.width !== width || backgroundOnly.info.height !== height || backgroundOnly.info.channels !== channels) {
    return { method: "paired text-visible/text-transparent pixel difference", reliable: false, reason: "dimension mismatch", width, height };
  }
  const pairs = [];
  for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
    const offset = (y * width + x) * channels;
    const foreground = { r: image.data[offset], g: image.data[offset + 1], b: image.data[offset + 2], a: image.data[offset + 3] / 255 };
    const background = { r: backgroundOnly.data[offset], g: backgroundOnly.data[offset + 1], b: backgroundOnly.data[offset + 2], a: backgroundOnly.data[offset + 3] / 255 };
    if (foreground.a < 0.99 || background.a < 0.99) continue;
    const delta = distance(foreground, background);
    if (delta > 0.5) pairs.push({ x, y, foreground, background, delta, ratio: contrastRatio(foreground, background) });
  }
  const maximumDelta = pairs.length ? Math.max(...pairs.map((entry) => entry.delta)) : 0;
  const interior = pairs.filter((entry) => entry.delta >= Math.max(1, maximumDelta * 0.85));
  const frequencies = new Map();
  for (const pair of interior) {
    const key = `${rgbKey(pair.foreground)}|${rgbKey(pair.background)}`;
    const current = frequencies.get(key) || { foreground: pair.foreground, background: pair.background, count: 0, delta: pair.delta, ratio: pair.ratio };
    current.count += 1;
    frequencies.set(key, current);
  }
  const clusters = [...frequencies.values()].sort((a, b) => b.count - a.count || b.delta - a.delta);
  const primary = clusters[0] || null;
  const mask = Buffer.alloc(width * height * 4, 255);
  for (const pair of pairs) {
    const offset = (pair.y * width + pair.x) * 4;
    const value = pair.delta >= Math.max(1, maximumDelta * 0.85) ? 255 : 128;
    mask[offset] = value; mask[offset + 1] = value; mask[offset + 2] = value; mask[offset + 3] = 255;
  }
  const maskBuffer = await sharp(mask, { raw: { width, height, channels: 4 } }).png().toBuffer();
  fs.writeFileSync(maskPath, maskBuffer);
  return {
    method: "paired text-visible/text-transparent captures; one-pixel clip edge excluded; changed pixels identify glyph coverage; primary interior glyph/background pair is the most frequent pair within the top 15% of observed pixel delta",
    width,
    height,
    changedPixelCount: pairs.length,
    maximumPixelDelta: maximumDelta,
    interiorPairCount: interior.length,
    clusterCount: clusters.length,
    topClusters: clusters.slice(0, 20),
    foreground: primary ? { color: primary.foreground, count: primary.count } : null,
    background: primary ? { color: primary.background, count: primary.count } : null,
    ratio: primary?.ratio ?? null,
    reliable: Boolean(primary && primary.count >= 2 && pairs.length >= 2 && Number.isFinite(primary.ratio)),
    mask: { path: normalizePath(maskPath), bytes: maskBuffer.length, sha256: sha256(maskBuffer) }
  };
}
function flatten(measurements) {
  return [
    ...measurements.forcedColorsAxeReconciliation.flatMap((entry) => [entry.inactive, entry.emulatedActive]),
    ...measurements.staticForcedColorsRepeats,
    ...measurements.tabletReducedMotionRepeats
  ];
}
function elementPairPathFor(record) {
  if (record.screenshots.elementPairedControl?.path) return path.join(root, record.screenshots.elementPairedControl.path);
  return path.join(root, record.screenshots.element.path.replace(/--element\.png$/, "--element-paired-v2.png"));
}
function backgroundPathFor(record) {
  if (record.screenshots.backgroundOnly?.path) return path.join(root, record.screenshots.backgroundOnly.path);
  return path.join(root, record.screenshots.element.path.replace(/--element\.png$/, "--background-only-v3.png"));
}
function maskPathFor(record) {
  return path.join(root, record.evidence.RENDERED_PIXEL_EVIDENCE.mask.path);
}
async function capturePair(browser, record, elementPath, backgroundPath) {
  const forcedColors = record.contextMode.includes("forced-colors") && !record.contextMode.includes("inactive") ? "active" : "none";
  const reducedMotion = record.contextMode === "reduced-motion" ? "reduce" : "no-preference";
  const context = await browser.newContext({ viewport: record.viewportCss, screen: record.viewportPhysical, deviceScaleFactor: record.deviceScaleFactor, colorScheme: "light", locale: "en-US", forcedColors, reducedMotion, hasTouch: record.viewportPhysical.width <= 768 });
  await installDeterminism(context);
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  page.setDefaultNavigationTimeout(45_000);
  try {
    await page.goto(`${origins[record.runtime]}${routes[record.runtime].route}`, { waitUntil: "domcontentloaded" });
    await ready(page, routes[record.runtime].root);
    await page.addStyleTag({ content: "#phase117OfflineStatus{visibility:hidden!important;pointer-events:none!important}" });
    const locator = page.locator(record.selector);
    await locator.waitFor({ state: "visible" });
    const placements = ["center", "start", "end"];
    let occlusionEvidence = null;
    for (const placement of placements) {
      await locator.evaluate((element, placement) => element.scrollIntoView({ block: placement, inline: "nearest", behavior: "instant" }), placement);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      occlusionEvidence = await locator.evaluate((element, placement) => {
        const rect = element.getBoundingClientRect();
        const point = { x: Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2)), y: Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2)) };
        const topmost = document.elementFromPoint(point.x, point.y);
        return { placement, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, point, topmostTag: topmost?.tagName?.toLowerCase() || null, topmostId: topmost?.id || null, topmostClass: typeof topmost?.className === "string" ? topmost.className : null, targetTopmost: topmost === element || Boolean(topmost && element.contains(topmost)) };
      }, placement);
      if (occlusionEvidence.targetTopmost) break;
    }
    if (!occlusionEvidence?.targetTopmost) throw new Error(`Target remained occluded: ${JSON.stringify(occlusionEvidence)}`);
    const originalBuffer = await locator.screenshot({ animations: "disabled", timeout: 30_000 });
    const originalHtml = await locator.innerHTML();
    const originalStyleAttribute = await locator.getAttribute("style");
    await locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty("box-sizing", "border-box", "important");
      element.style.setProperty("width", `${rect.width}px`, "important");
      element.style.setProperty("min-width", `${rect.width}px`, "important");
      element.style.setProperty("max-width", `${rect.width}px`, "important");
      element.style.setProperty("height", `${rect.height}px`, "important");
      element.style.setProperty("min-height", `${rect.height}px`, "important");
      element.style.setProperty("max-height", `${rect.height}px`, "important");
      element.replaceChildren();
    });
    const backgroundBuffer = await locator.screenshot({ animations: "disabled", timeout: 30_000 });
    await locator.evaluate((element, state) => {
      element.innerHTML = state.originalHtml;
      if (state.originalStyleAttribute === null) element.removeAttribute("style");
      else element.setAttribute("style", state.originalStyleAttribute);
    }, { originalHtml, originalStyleAttribute });
    fs.mkdirSync(path.dirname(elementPath), { recursive: true });
    fs.writeFileSync(elementPath, originalBuffer);
    fs.writeFileSync(backgroundPath, backgroundBuffer);
    return { originalBuffer, backgroundBuffer, occlusionEvidence };
  } finally {
    await context.close();
  }
}
function extractAxePair(axe) {
  const text = axe.violations.flatMap((entry) => entry.nodes.map((node) => node.failureSummary || "")).join("\n");
  const match = text.match(/foreground color:\s*(#[0-9a-f]{3,8}).*background color:\s*(#[0-9a-f]{3,8})/i);
  return match ? { foreground: match[1].toLowerCase(), background: match[2].toLowerCase() } : null;
}
function summarize(records) {
  const reliable = records.filter((entry) => entry.evidence.RENDERED_PIXEL_EVIDENCE.reliable && entry.geometry.stable);
  const ratios = reliable.map((entry) => entry.evidence.RENDERED_PIXEL_EVIDENCE.ratio);
  return {
    attempts: records.length,
    reliableAttempts: reliable.length,
    ratios,
    minimumRatio: ratios.length ? Math.min(...ratios) : null,
    maximumRatio: ratios.length ? Math.max(...ratios) : null,
    ratioSpread: ratios.length ? Math.max(...ratios) - Math.min(...ratios) : null,
    stableGeometryAttempts: records.filter((entry) => entry.geometry.stable).length,
    uniqueElementScreenshotHashes: [...new Set(records.map((entry) => entry.screenshots.element.sha256))].length,
    decision: reliable.length === records.length && ratios.every((ratio) => ratio >= requiredRatio) ? "PASS_RENDERED" : reliable.length === records.length ? "FAIL_RENDERED" : "UNKNOWN"
  };
}
function artifact(target) {
  const buffer = fs.readFileSync(target);
  return { path: normalizePath(target), bytes: buffer.length, sha256: sha256(buffer) };
}

async function main() {
  if (!fs.existsSync(measurementPath)) throw new Error("Completed 62-target diagnostic measurement is missing.");
  const measurements = JSON.parse(fs.readFileSync(measurementPath, "utf8"));
  if (measurements.forcedColorsAxeReconciliation.length !== 6 || measurements.staticForcedColorsRepeats.length !== 30 || measurements.tabletReducedMotionRepeats.length !== 30) throw new Error("Diagnostic measurement counts are incomplete.");
  if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error("Dedicated Phase 5D-2 ports must be closed.");
  const nextServer = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(nextPort)], { cwd: root, env: { ...process.env, NODE_ENV: "production", TEOYUBE_OWNER_QA_TEST_MODE: "true" }, stdio: "ignore", windowsHide: true });
  const staticServer = spawn(process.execPath, [path.join(root, "server.js")], { cwd: root, env: { ...process.env, PORT: String(staticPort) }, stdio: "ignore", windowsHide: true });
  const launched = [];
  try {
    await Promise.all([waitForUrl(nextServer, `${origins.next}/api/health`), waitForUrl(staticServer, `${origins.static}/index.html`)]);
    const records = flatten(measurements);
    for (const browserDefinition of browsers) {
      const browserRecords = records.filter((record) => record.browser === browserDefinition.id);
      if (!browserRecords.length) continue;
      const browser = await chromium.launch({ headless: true, ...browserDefinition.launch });
      launched.push(browser);
      for (const record of browserRecords) {
        const elementPath = elementPairPathFor(record);
        const backgroundPath = backgroundPathFor(record);
        let originalBuffer;
        let backgroundBuffer;
        let occlusionEvidence = record.pairedCaptureOcclusionEvidence || null;
        if (fs.existsSync(elementPath) && fs.existsSync(backgroundPath)) {
          originalBuffer = fs.readFileSync(elementPath);
          backgroundBuffer = fs.readFileSync(backgroundPath);
        } else {
          console.log(`PAIR ${record.id}`);
          const captured = await capturePair(browser, record, elementPath, backgroundPath);
          originalBuffer = captured.originalBuffer;
          backgroundBuffer = captured.backgroundBuffer;
          occlusionEvidence = captured.occlusionEvidence;
        }
        record.evidence.RENDERED_PIXEL_EVIDENCE = await analyzeRendered(originalBuffer, backgroundBuffer, maskPathFor(record));
        record.pairedCaptureOcclusionEvidence = occlusionEvidence;
        record.screenshots.elementPairedControl = { path: normalizePath(elementPath), bytes: originalBuffer.length, sha256: sha256(originalBuffer), sameFreshContextAsBackground: true };
        record.screenshots.backgroundOnly = { path: normalizePath(backgroundPath), bytes: backgroundBuffer.length, sha256: sha256(backgroundBuffer), sameFreshContextAsElement: true, backgroundIsolation: "layout-frozen text-removed control", unrelatedStatusNoticeHidden: true };
      }
      await browser.close();
      launched.splice(launched.indexOf(browser), 1);
    }
    for (const cell of measurements.forcedColorsAxeReconciliation) {
      const record = cell.emulatedActive;
      const rendered = record.evidence.RENDERED_PIXEL_EVIDENCE;
      const pair = extractAxePair(record.evidence.AXE_RULE_EVIDENCE);
      const axeForeground = pair ? parseHexColor(pair.foreground) : null;
      const axeBackground = pair ? parseHexColor(pair.background) : null;
      const matches = Boolean(rendered.reliable && rendered.foreground && rendered.background && axeForeground && axeBackground && distance(rendered.foreground.color, axeForeground) <= 8 && distance(rendered.background.color, axeBackground) <= 8);
      cell.directReconciliation.axeReportedPair = pair;
      cell.directReconciliation.activeRenderedPair = rendered.foreground && rendered.background ? { foreground: rendered.foreground.color, background: rendered.background.color, ratio: rendered.ratio, reliable: rendered.reliable } : null;
      cell.directReconciliation.classification = pair && matches ? "AXE_EVALUATED_RENDERED_PAIR" : pair ? "AXE_DID_NOT_EVALUATE_RENDERED_PAIR" : "AXE_REPORTED_NO_FAILURE";
    }
    const staticGroups = [];
    for (const browserDefinition of browsers) for (const element of ["D02", "D05"]) {
      const records = measurements.staticForcedColorsRepeats.filter((entry) => entry.browser === browserDefinition.id && entry.element === element);
      staticGroups.push({ browser: browserDefinition.id, element, selector: records[0].selector, ...summarize(records) });
    }
    const reducedGroups = [];
    for (const runtime of ["next", "static"]) for (const element of ["D02", "D05"]) {
      const records = measurements.tabletReducedMotionRepeats.filter((entry) => entry.runtime === runtime && entry.element === element);
      reducedGroups.push({ browser: "playwright-chromium", runtime, element, selector: records[0].selector, ...summarize(records) });
    }
    const allAxeClassified = measurements.forcedColorsAxeReconciliation.every((entry) => ["AXE_EVALUATED_RENDERED_PAIR", "AXE_DID_NOT_EVALUATE_RENDERED_PAIR", "AXE_REPORTED_NO_FAILURE"].includes(entry.directReconciliation.classification));
    const allStaticReliable = staticGroups.every((entry) => entry.reliableAttempts === entry.attempts);
    const allStaticReliablePass = staticGroups.every((entry) => entry.decision === "PASS_RENDERED");
    const reproducibleStaticFailure = staticGroups.some((entry) => entry.decision === "FAIL_RENDERED" && entry.reliableAttempts === entry.attempts && entry.maximumRatio < requiredRatio);
    const reconciledActiveFailure = measurements.forcedColorsAxeReconciliation.some((entry) => entry.directReconciliation.classification === "AXE_EVALUATED_RENDERED_PAIR" && entry.emulatedActive.evidence.RENDERED_PIXEL_EVIDENCE.reliable && entry.emulatedActive.evidence.RENDERED_PIXEL_EVIDENCE.ratio < requiredRatio);
    const allReducedReliablePass = reducedGroups.every((entry) => entry.decision === "PASS_RENDERED");
    const knownErrors = new Set(["console: Failed to load resource: the server responded with a status of 404 (Not Found)", "pageerror: Published media manifest returned 404."]);
    const harnessErrors = flatten(measurements).flatMap((entry) => entry.errors.filter((error) => !knownErrors.has(error))).length;
    const outcome = reproducibleStaticFailure && reconciledActiveFailure && allStaticReliable && allReducedReliablePass && harnessErrors === 0
      ? "A_REAL_CURRENT_PRODUCT_FAILURE"
      : allAxeClassified && allStaticReliablePass && allReducedReliablePass && harnessErrors === 0
        ? "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE"
        : "B_UNRESOLVED_ENVIRONMENT_OR_TOOLING_CONFLICT";
    measurements.staticForcedColorsSummary = staticGroups;
    measurements.tabletReducedMotionSummary = reducedGroups;
    measurements.adjudication = { outcome, allAxeClassified, allStaticReliable, allStaticReliablePass, reproducibleStaticFailure, reconciledActiveFailure, allReducedReliablePass, harnessErrors, ownerGateRequired: true };
    measurements.pairedCaptureCompletion = { completedAt: new Date().toISOString(), method: "Same-context visible-element and layout-frozen text-removed controls captured in fresh deterministic contexts after hiding only the documented unrelated local-status notice and verifying the target is topmost; original full-page hashes, raw axe evidence, authored/computed evidence, and accessibility-tree evidence preserved from the completed 62-target run." };
    writeJson(measurementPath, measurements);
    const samples = fs.readdirSync(path.join(retainedRoot, "samples")).filter((name) => name.endsWith(".png")).sort().map((name) => artifact(path.join(retainedRoot, "samples", name)));
    const manifest = {
      schemaVersion: 1,
      phase: "5D-2",
      generatedAt: measurements.generatedAt,
      completedAt: measurements.pairedCaptureCompletion.completedAt,
      issueId: "A11Y-008",
      decisionId: measurements.decisionId,
      formerProposalHash: measurements.formerProposalHash,
      implementationAuthorized: false,
      measurementArtifact: artifact(measurementPath),
      retainedSamples: samples,
      counts: { reconciliationCells: 6, staticFreshContexts: 30, reducedMotionFreshContexts: measurements.tabletReducedMotionRepeats.length, retainedSampleFiles: samples.length },
      adjudication: measurements.adjudication,
      protections: measurements.protections
    };
    writeJson(path.join(retainedRoot, "manifest.json"), manifest);
    console.log(JSON.stringify({ counts: manifest.counts, staticGroups, reducedGroups, adjudication: measurements.adjudication }, null, 2));
  } finally {
    await Promise.all(launched.map((browser) => browser.close().catch(() => {})));
    await Promise.all([stopServer(nextServer), stopServer(staticServer)]);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
