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
const sampleRoot = path.join(root, "tests", "accessibility", "evidence", "a11y008-phase5d2", "samples");
const nextPort = 3294;
const staticPort = 4294;
const origins = { next: `http://127.0.0.1:${nextPort}`, static: `http://127.0.0.1:${staticPort}` };
const nextCli = require.resolve("next/dist/bin/next");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const selector = '[data-canon-item="canon-map-D05"] .canon-status.in-progress';
const viewportPhysical = { width: 1024, height: 768 };
const viewportCss = { width: 512, height: 384 };
const deviceScaleFactor = 2;
const routes = {
  next: { route: "/canon?ownerQa=1", root: "#canon" },
  static: { route: "/index.html?ownerQa=1#canon", root: "#canon" }
};
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalizePath = (value) => path.relative(root, value).replace(/\\/g, "/");
const rgbKey = (color) => `${color.r},${color.g},${color.b}`;

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
  if (process.platform === "win32") await waitForExit(spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }));
  else child.kill("SIGTERM");
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
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}#phase117OfflineStatus{visibility:hidden!important;pointer-events:none!important}" });
  return page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 3000);
    })));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return { readyState: document.readyState, fontsReady: !document.fonts || document.fonts.status === "loaded", imagesReady: [...document.images].every((image) => image.complete), forcedColors: matchMedia("(forced-colors: active)").matches, reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches, devicePixelRatio };
  });
}
function luminance(color) {
  const channel = (value) => { const normalized = value / 255; return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}
function contrastRatio(left, right) {
  const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return Math.round(((values[0] + 0.05) / (values[1] + 0.05)) * 10_000) / 10_000;
}
function distance(left, right) { return Math.sqrt((left.r - right.r) ** 2 + (left.g - right.g) ** 2 + (left.b - right.b) ** 2); }
async function renderedEvidence(elementBuffer, backgroundBuffer, maskPath) {
  const image = await sharp(elementBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const backgroundOnly = await sharp(backgroundBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = image.info;
  if (backgroundOnly.info.width !== width || backgroundOnly.info.height !== height || backgroundOnly.info.channels !== channels) return { reliable: false, reason: "dimension mismatch" };
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
    current.count += 1; frequencies.set(key, current);
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
  return { method: "same-context visible/text-removed pair; interior top-15%-delta cluster", width, height, changedPixelCount: pairs.length, maximumPixelDelta: maximumDelta, interiorPairCount: interior.length, clusterCount: clusters.length, topClusters: clusters.slice(0, 20), foreground: primary ? { color: primary.foreground, count: primary.count } : null, background: primary ? { color: primary.background, count: primary.count } : null, ratio: primary?.ratio ?? null, reliable: Boolean(primary && primary.count >= 2 && pairs.length >= 2), mask: { path: normalizePath(maskPath), bytes: maskBuffer.length, sha256: sha256(maskBuffer) } };
}
async function rawAxe(page) {
  return page.evaluate(async ({ selector }) => {
    const result = await window.axe.run({ include: [[selector]] }, { runOnly: { type: "rule", values: ["color-contrast"] }, resultTypes: ["violations", "incomplete", "passes", "inapplicable"] });
    const nodes = (entry) => entry.nodes.map((node) => ({ any: node.any, all: node.all, none: node.none, impact: node.impact, html: node.html, target: node.target, failureSummary: node.failureSummary }));
    const entries = (values) => values.map((entry) => ({ id: entry.id, impact: entry.impact, tags: entry.tags, description: entry.description, help: entry.help, helpUrl: entry.helpUrl, nodes: nodes(entry) }));
    return { runner: { axeVersion: window.axe.version, runOnly: { type: "rule", values: ["color-contrast"] } }, testEngine: result.testEngine, testRunner: result.testRunner, testEnvironment: result.testEnvironment, timestamp: result.timestamp, url: result.url, violations: entries(result.violations), incomplete: entries(result.incomplete), passes: entries(result.passes), inapplicable: entries(result.inapplicable) };
  }, { selector });
}
async function accessibilityTree(context, page) {
  const session = await context.newCDPSession(page);
  try {
    await session.send("Accessibility.enable");
    const documentNode = await session.send("DOM.getDocument", { depth: 0, pierce: true });
    const selected = await session.send("DOM.querySelector", { nodeId: documentNode.root.nodeId, selector });
    const result = await session.send("Accessibility.getPartialAXTree", { nodeId: selected.nodeId, fetchRelatives: true });
    return { available: true, nodes: result.nodes };
  } catch (error) { return { available: false, reason: String(error?.message || error) }; }
  finally { await session.detach().catch(() => {}); }
}
async function capture(browser, runtime, repeat) {
  const context = await browser.newContext({ viewport: viewportCss, screen: viewportPhysical, deviceScaleFactor, colorScheme: "light", locale: "en-US", forcedColors: "none", reducedMotion: "reduce", hasTouch: true });
  await installDeterminism(context);
  const page = await context.newPage();
  page.setDefaultTimeout(30_000); page.setDefaultNavigationTimeout(45_000);
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  try {
    await page.goto(`${origins[runtime]}${routes[runtime].route}`, { waitUntil: "domcontentloaded" });
    const readiness = await ready(page, routes[runtime].root);
    await page.evaluate((source) => window.eval(source), axeSource);
    const locator = page.locator(selector);
    await locator.waitFor({ state: "visible" });
    await locator.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" }));
    const first = await locator.boundingBox();
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const second = await locator.boundingBox();
    const maximumDeltaCssPixels = Math.max(...["x", "y", "width", "height"].map((key) => Math.abs(first[key] - second[key])));
    const topmost = await locator.evaluate((element) => { const rect = element.getBoundingClientRect(); const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; const hit = document.elementFromPoint(point.x, point.y); return { targetTopmost: hit === element || Boolean(hit && element.contains(hit)), topmostTag: hit?.tagName?.toLowerCase() || null, topmostId: hit?.id || null, topmostClass: typeof hit?.className === "string" ? hit.className : null }; });
    if (!topmost.targetTopmost) throw new Error(`D05 remained occluded: ${JSON.stringify(topmost)}`);
    const computed = await locator.evaluate((element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); const ancestors = []; let current = element; while (current instanceof Element) { const value = getComputedStyle(current); ancestors.push({ tag: current.tagName.toLowerCase(), id: current.id || null, className: typeof current.className === "string" ? current.className : null, color: value.color, backgroundColor: value.backgroundColor, opacity: value.opacity, transform: value.transform, animationName: value.animationName, animationDuration: value.animationDuration, transitionProperty: value.transitionProperty, transitionDuration: value.transitionDuration, filter: value.filter, backdropFilter: value.backdropFilter, mixBlendMode: value.mixBlendMode, forcedColorAdjust: value.forcedColorAdjust }); current = current.parentElement; } return { text: String(element.textContent || "").replace(/\s+/g, " ").trim(), style: { color: style.color, backgroundColor: style.backgroundColor, fontFamily: style.fontFamily, fontWeight: style.fontWeight, fontSize: style.fontSize, opacity: style.opacity, transform: style.transform, animationName: style.animationName, animationDuration: style.animationDuration, transitionProperty: style.transitionProperty, transitionDuration: style.transitionDuration, filter: style.filter, textShadow: style.textShadow, mixBlendMode: style.mixBlendMode, forcedColorAdjust: style.forcedColorAdjust, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } }, pseudo: { before: { color: getComputedStyle(element, "::before").color, backgroundColor: getComputedStyle(element, "::before").backgroundColor, content: getComputedStyle(element, "::before").content }, after: { color: getComputedStyle(element, "::after").color, backgroundColor: getComputedStyle(element, "::after").backgroundColor, content: getComputedStyle(element, "::after").content } }, ancestors }; });
    const cssLinks = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => ({ href: link.href, media: link.media || "all", disabled: link.disabled })));
    const cssBundleIdentities = [];
    for (const link of cssLinks) { try { const response = await fetch(link.href); const buffer = Buffer.from(await response.arrayBuffer()); cssBundleIdentities.push({ ...link, bytes: buffer.length, sha256: sha256(buffer) }); } catch (error) { cssBundleIdentities.push({ ...link, error: String(error?.message || error) }); } }
    const axe = await rawAxe(page);
    const axTree = await accessibilityTree(context, page);
    const originalBuffer = await locator.screenshot({ animations: "disabled" });
    const originalHtml = await locator.innerHTML();
    const originalStyleAttribute = await locator.getAttribute("style");
    await locator.evaluate((element) => { const rect = element.getBoundingClientRect(); element.style.setProperty("box-sizing", "border-box", "important"); for (const property of ["width", "min-width", "max-width"]) element.style.setProperty(property, `${rect.width}px`, "important"); for (const property of ["height", "min-height", "max-height"]) element.style.setProperty(property, `${rect.height}px`, "important"); element.replaceChildren(); });
    const backgroundBuffer = await locator.screenshot({ animations: "disabled" });
    await locator.evaluate((element, state) => { element.innerHTML = state.originalHtml; if (state.originalStyleAttribute === null) element.removeAttribute("style"); else element.setAttribute("style", state.originalStyleAttribute); }, { originalHtml, originalStyleAttribute });
    const fullBuffer = await page.screenshot({ fullPage: true, animations: "disabled" });
    const base = `tablet-reduced-motion-d05-extension--playwright-chromium--${runtime}--D05--repeat-${repeat}`;
    const elementPath = path.join(sampleRoot, `${base}--element-paired-v2.png`);
    const backgroundPath = path.join(sampleRoot, `${base}--background-only-v3.png`);
    const paddedPath = path.join(sampleRoot, `${base}--padded.png`);
    const maskPath = path.join(sampleRoot, `${base}--mask.png`);
    fs.mkdirSync(sampleRoot, { recursive: true });
    fs.writeFileSync(elementPath, originalBuffer); fs.writeFileSync(backgroundPath, backgroundBuffer); fs.writeFileSync(paddedPath, originalBuffer);
    const rendered = await renderedEvidence(originalBuffer, backgroundBuffer, maskPath);
    return { id: `playwright-chromium:${runtime}:tablet-landscape:reduced-motion:D05:${repeat}`, browser: "playwright-chromium", browserVersion: browser.version(), runtime, route: routes[runtime].route, viewport: "tablet-landscape", viewportPhysical, viewportCss, deviceScaleFactor, zoom: 200, contextMode: "reduced-motion", contextClassification: "REDUCED_MOTION_CONTROL", element: "D05", itemId: "canon-map-D05", selector, repeat, readiness: { ...readiness, hydrationComplete: true, cssBundleIdentities }, geometry: { first, second, maximumDeltaCssPixels, stable: maximumDeltaCssPixels <= 0.25 }, evidence: { AUTHORED_COLOR_EVIDENCE: { status: "PRESERVED_IN_PRIMARY_PHASE5D2_RECORDS", missing: "not recollected for extension repeats" }, COMPUTED_STYLE_EVIDENCE: computed, USED_FORCED_COLOR_EVIDENCE: { classification: "REDUCED_MOTION_CONTROL", forcedColorsMedia: false }, RENDERED_PIXEL_EVIDENCE: rendered, AXE_RULE_EVIDENCE: axe, ACCESSIBILITY_TREE_EVIDENCE: axTree }, screenshots: { element: { path: normalizePath(elementPath), bytes: originalBuffer.length, sha256: sha256(originalBuffer) }, elementPairedControl: { path: normalizePath(elementPath), bytes: originalBuffer.length, sha256: sha256(originalBuffer), sameFreshContextAsBackground: true }, padded: { path: normalizePath(paddedPath), bytes: originalBuffer.length, sha256: sha256(originalBuffer) }, backgroundOnly: { path: normalizePath(backgroundPath), bytes: backgroundBuffer.length, sha256: sha256(backgroundBuffer), sameFreshContextAsElement: true }, fullPageTemporary: { retained: false, bytes: fullBuffer.length, sha256: sha256(fullBuffer) } }, pairedCaptureOcclusionEvidence: topmost, blockedExternalOrigins: [], errors, sourceSafe: true };
  } finally { await context.close(); }
}

async function main() {
  const measurements = JSON.parse(fs.readFileSync(measurementPath, "utf8"));
  if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error("Dedicated Phase 5D-2 ports must be closed.");
  const nextServer = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(nextPort)], { cwd: root, env: { ...process.env, NODE_ENV: "production", TEOYUBE_OWNER_QA_TEST_MODE: "true" }, stdio: "ignore", windowsHide: true });
  const staticServer = spawn(process.execPath, [path.join(root, "server.js")], { cwd: root, env: { ...process.env, PORT: String(staticPort) }, stdio: "ignore", windowsHide: true });
  let browser;
  try {
    await Promise.all([waitForUrl(nextServer, `${origins.next}/api/health`), waitForUrl(staticServer, `${origins.static}/index.html`)]);
    browser = await chromium.launch({ headless: true });
    for (const runtime of ["next", "static"]) for (let repeat = 6; repeat <= 10; repeat += 1) {
      const id = `playwright-chromium:${runtime}:tablet-landscape:reduced-motion:D05:${repeat}`;
      if (measurements.tabletReducedMotionRepeats.some((entry) => entry.id === id)) continue;
      console.log(`EXTEND ${id}`);
      measurements.tabletReducedMotionRepeats.push(await capture(browser, runtime, repeat));
      fs.writeFileSync(measurementPath, `${JSON.stringify(measurements, null, 2)}\n`, "utf8");
    }
    measurements.tabletReducedMotionRepeats.sort((a, b) => a.runtime.localeCompare(b.runtime) || a.element.localeCompare(b.element) || a.repeat - b.repeat);
    measurements.d05ReducedMotionExtension = { completedAt: new Date().toISOString(), browser: "playwright-chromium", nextD05Captures: measurements.tabletReducedMotionRepeats.filter((entry) => entry.runtime === "next" && entry.element === "D05").length, staticD05Captures: measurements.tabletReducedMotionRepeats.filter((entry) => entry.runtime === "static" && entry.element === "D05").length };
    fs.writeFileSync(measurementPath, `${JSON.stringify(measurements, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(measurements.d05ReducedMotionExtension, null, 2));
  } finally {
    await browser?.close().catch(() => {});
    await Promise.all([stopServer(nextServer), stopServer(staticServer)]);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
