#!/usr/bin/env node
"use strict";

import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const nextPort = Number(process.env.TEOYUBE_A11Y008_PHASE5D2_NEXT_PORT || 3294);
const staticPort = Number(process.env.TEOYUBE_A11Y008_PHASE5D2_STATIC_PORT || 4294);
const origins = { next: `http://127.0.0.1:${nextPort}`, static: `http://127.0.0.1:${staticPort}` };
const nextCli = require.resolve("next/dist/bin/next");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const tempRoot = path.join(root, ".tmp", "accessibility", "a11y008-phase5d2");
const retainedRoot = path.join(root, "tests", "accessibility", "evidence", "a11y008-phase5d2");
const measurementPath = path.join(root, "docs", "accessibility", "a11y008-phase5d2-measurements.json");
const generatedAt = new Date().toISOString();
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001";
const formerProposalHash = "86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8";
const requiredRatio = 4.5;

const browsers = [
  { id: "playwright-chromium", launch: {} },
  { id: "google-chrome", launch: { channel: "chrome" } },
  { id: "microsoft-edge", launch: { channel: "msedge" } }
];
const elements = [
  { id: "D02", itemId: "canon-map-D02", selector: '[data-canon-item="canon-map-D02"] .canon-status.in-progress', expectedText: "In Progress" },
  { id: "D05", itemId: "canon-map-D05", selector: '[data-canon-item="canon-map-D05"] .canon-status.in-progress', expectedText: "In Progress" }
];
const routes = {
  next: { id: "next", route: "/canon?ownerQa=1", root: "#canon" },
  static: { id: "static", route: "/index.html?ownerQa=1#canon", root: "#canon" }
};
const desktopWide200 = { name: "desktop-wide", physical: { width: 1440, height: 900 }, viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 };
const tabletLandscape200 = { name: "tablet-landscape", physical: { width: 1024, height: 768 }, viewport: { width: 512, height: 384 }, deviceScaleFactor: 2 };

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalizePath = (value) => path.relative(root, value).replace(/\\/g, "/");
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

async function installDeterminism(context, blockedOrigins) {
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
    else { blockedOrigins.push(url.origin); await route.abort("blockedbyclient"); }
  });
}

async function deterministicReady(page, rootSelector) {
  await page.locator(rootSelector).waitFor({ state: "visible", timeout: 30_000 });
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}" });
  return page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 3000);
    })));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      readyState: document.readyState,
      fontsReady: !document.fonts || document.fonts.status === "loaded",
      imagesReady: [...document.images].every((image) => image.complete),
      failedImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      viewport: { width: innerWidth, height: innerHeight },
      devicePixelRatio,
      forcedColors: matchMedia("(forced-colors: active)").matches,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches
    };
  });
}

function parseColor(value) {
  const match = String(value).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,\/]\s*([\d.]+))?\s*\)/i);
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] === undefined ? 1 : Number(match[4]) };
}
function parseHexColor(value) {
  const normalized = String(value || "").replace(/^#/, "");
  const expanded = normalized.length === 3 ? normalized.split("").map((part) => `${part}${part}`).join("") : normalized;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return null;
  return { r: Number.parseInt(expanded.slice(0, 2), 16), g: Number.parseInt(expanded.slice(2, 4), 16), b: Number.parseInt(expanded.slice(4, 6), 16), a: 1 };
}
function luminance(color) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}
function contrastRatio(left, right) {
  if (!left || !right) return null;
  const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return Math.round(((values[0] + 0.05) / (values[1] + 0.05)) * 10_000) / 10_000;
}
function distance(left, right) {
  return Math.sqrt((left.r - right.r) ** 2 + (left.g - right.g) ** 2 + (left.b - right.b) ** 2);
}
const rgbKey = (color) => `${color.r},${color.g},${color.b}`;

async function analyzeRendered(buffer, backgroundOnlyBuffer, maskPath) {
  const image = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const backgroundOnly = await sharp(backgroundOnlyBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = image.info;
  if (backgroundOnly.info.width !== width || backgroundOnly.info.height !== height || backgroundOnly.info.channels !== channels) {
    return { method: "paired text-visible/text-transparent pixel difference", reliable: false, reason: "background-only dimensions differ", width, height };
  }
  const pairs = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const offset = (y * width + x) * channels;
      const foreground = { r: image.data[offset], g: image.data[offset + 1], b: image.data[offset + 2], a: image.data[offset + 3] / 255 };
      const background = { r: backgroundOnly.data[offset], g: backgroundOnly.data[offset + 1], b: backgroundOnly.data[offset + 2], a: backgroundOnly.data[offset + 3] / 255 };
      if (foreground.a < 0.99 || background.a < 0.99) continue;
      const delta = distance(foreground, background);
      if (delta > 0.5) pairs.push({ x, y, foreground, background, delta, ratio: contrastRatio(foreground, background) });
    }
  }
  const maximumDelta = pairs.length ? Math.max(...pairs.map((entry) => entry.delta)) : 0;
  const interiorPairs = pairs.filter((entry) => entry.delta >= Math.max(1, maximumDelta * 0.85));
  const pairFrequencies = new Map();
  for (const pair of interiorPairs) {
    const key = `${rgbKey(pair.foreground)}|${rgbKey(pair.background)}`;
    const existing = pairFrequencies.get(key) || { foreground: pair.foreground, background: pair.background, count: 0, delta: pair.delta, ratio: pair.ratio };
    existing.count += 1;
    pairFrequencies.set(key, existing);
  }
  const clusters = [...pairFrequencies.values()].sort((a, b) => b.count - a.count || b.delta - a.delta);
  const primary = clusters[0] || null;
  const mask = Buffer.alloc(width * height * 4, 255);
  for (const pair of pairs) {
    const outputOffset = (pair.y * width + pair.x) * 4;
    const value = pair.delta >= Math.max(1, maximumDelta * 0.85) ? 255 : 128;
    mask[outputOffset] = value;
    mask[outputOffset + 1] = value;
    mask[outputOffset + 2] = value;
    mask[outputOffset + 3] = 255;
  }
  fs.mkdirSync(path.dirname(maskPath), { recursive: true });
  const maskBuffer = await sharp(mask, { raw: { width, height, channels: 4 } }).png().toBuffer();
  fs.writeFileSync(maskPath, maskBuffer);
  const ratio = primary?.ratio ?? null;
  const reliable = Boolean(primary && primary.count >= 2 && pairs.length >= 2 && Number.isFinite(ratio));
  return {
    method: "paired text-visible/text-transparent captures; one-pixel clip edge excluded; changed pixels identify glyph coverage; primary interior glyph/background pair is the most frequent pair within the top 15% of observed pixel delta; antialias pairs retained but excluded from the primary pair",
    width,
    height,
    changedPixelCount: pairs.length,
    maximumPixelDelta: maximumDelta,
    interiorPairCount: interiorPairs.length,
    clusterCount: clusters.length,
    topClusters: clusters.slice(0, 20),
    foreground: primary ? { color: primary.foreground, count: primary.count } : null,
    background: primary ? { color: primary.background, count: primary.count } : null,
    ratio,
    reliable,
    mask: { path: normalizePath(maskPath), bytes: maskBuffer.length, sha256: sha256(maskBuffer) }
  };
}
async function authoredColorEvidence(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const declarations = [];
    const errors = [];
    const relevant = new Set(["color", "background", "background-color", "background-image", "opacity", "filter", "backdrop-filter", "mix-blend-mode", "forced-color-adjust", "-webkit-text-fill-color", "text-shadow"]);
    const visit = (rules, source, media = []) => {
      for (const rule of [...rules]) {
        if (rule.cssRules) {
          const nextMedia = rule.conditionText ? [...media, rule.conditionText] : media;
          visit(rule.cssRules, source, nextMedia);
          continue;
        }
        if (!rule.selectorText || !rule.style) continue;
        let matches = false;
        try { matches = element.matches(rule.selectorText); } catch {}
        if (!matches) continue;
        const values = [];
        for (const property of [...rule.style]) {
          if (relevant.has(property)) values.push({ property, value: rule.style.getPropertyValue(property).trim(), priority: rule.style.getPropertyPriority(property) || null });
        }
        if (values.length) declarations.push({ source, selector: rule.selectorText, media, values });
      }
    };
    for (const sheet of [...document.styleSheets]) {
      try { visit(sheet.cssRules, sheet.href || "inline-style-sheet"); }
      catch (error) { errors.push({ source: sheet.href || "inline-style-sheet", error: String(error?.name || error) }); }
    }
    const inline = [];
    for (const property of [...element.style]) if (relevant.has(property)) inline.push({ property, value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) || null });
    return { inline, matchingDeclarations: declarations, stylesheetAccessErrors: errors };
  });
}

async function computedStyleEvidence(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const round = (value) => Math.round(value * 100) / 100;
    const read = (subject, pseudo = null) => {
      const style = getComputedStyle(subject, pseudo);
      const rect = subject.getBoundingClientRect();
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        opacity: style.opacity,
        filter: style.filter,
        backdropFilter: style.backdropFilter,
        mixBlendMode: style.mixBlendMode,
        forcedColorAdjust: style.forcedColorAdjust,
        webkitTextFillColor: style.webkitTextFillColor,
        textShadow: style.textShadow,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        display: style.display,
        visibility: style.visibility,
        rect: { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) }
      };
    };
    const ancestors = [];
    let current = element;
    while (current instanceof Element) {
      ancestors.push({ tag: current.tagName.toLowerCase(), id: current.id || null, className: typeof current.className === "string" ? current.className : null, style: read(current) });
      current = current.parentElement;
    }
    return {
      text: String(element.textContent || "").replace(/\s+/g, " ").trim(),
      tag: element.tagName.toLowerCase(),
      role: element.getAttribute("role"),
      ariaLabel: element.getAttribute("aria-label"),
      style: read(element),
      pseudo: { before: read(element, "::before"), after: read(element, "::after") },
      ancestors
    };
  });
}

async function usedForcedColorEvidence(page, classification) {
  return page.evaluate((classification) => {
    const probe = document.createElement("span");
    probe.setAttribute("data-a11y008-system-color-probe", "");
    probe.style.cssText = "position:fixed;left:-10000px;top:-10000px;color:CanvasText;background-color:Canvas;forced-color-adjust:auto";
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const evidence = {
      classification,
      forcedColorsMedia: matchMedia("(forced-colors: active)").matches,
      prefersContrastMore: matchMedia("(prefers-contrast: more)").matches,
      canvasTextResolved: style.color,
      canvasResolved: style.backgroundColor,
      forcedColorAdjustResolved: style.forcedColorAdjust,
      supportsForcedColorsMedia: CSS.supports("color", "CanvasText")
    };
    probe.remove();
    return evidence;
  }, classification);
}

async function rawAxeEvidence(page, selector) {
  return page.evaluate(async ({ selector }) => {
    const result = await window.axe.run({ include: [[selector]] }, {
      runOnly: { type: "rule", values: ["color-contrast"] },
      resultTypes: ["violations", "incomplete", "passes", "inapplicable"]
    });
    const keepNode = (node) => ({
      any: node.any,
      all: node.all,
      none: node.none,
      impact: node.impact,
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary
    });
    const keepEntries = (entries) => entries.map((entry) => ({
      id: entry.id,
      impact: entry.impact,
      tags: entry.tags,
      description: entry.description,
      help: entry.help,
      helpUrl: entry.helpUrl,
      nodes: entry.nodes.map(keepNode)
    }));
    return {
      runner: { axeVersion: window.axe.version, runOnly: { type: "rule", values: ["color-contrast"] }, resultTypes: ["violations", "incomplete", "passes", "inapplicable"] },
      testEngine: result.testEngine,
      testRunner: result.testRunner,
      testEnvironment: result.testEnvironment,
      timestamp: result.timestamp,
      url: result.url,
      violations: keepEntries(result.violations),
      incomplete: keepEntries(result.incomplete),
      passes: keepEntries(result.passes),
      inapplicable: keepEntries(result.inapplicable)
    };
  }, { selector });
}

async function accessibilityTreeEvidence(context, page, selector) {
  const session = await context.newCDPSession(page);
  try {
    await session.send("Accessibility.enable");
    const documentNode = await session.send("DOM.getDocument", { depth: 0, pierce: true });
    const selected = await session.send("DOM.querySelector", { nodeId: documentNode.root.nodeId, selector });
    if (!selected.nodeId) return { available: false, reason: "selector-not-found" };
    const result = await session.send("Accessibility.getPartialAXTree", { nodeId: selected.nodeId, fetchRelatives: true });
    return { available: true, nodes: result.nodes };
  } catch (error) {
    return { available: false, reason: String(error?.message || error) };
  } finally {
    await session.detach().catch(() => {});
  }
}

async function stableGeometry(page, selector) {
  const first = await page.locator(selector).boundingBox();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const second = await page.locator(selector).boundingBox();
  const delta = first && second ? Math.max(...["x", "y", "width", "height"].map((key) => Math.abs(first[key] - second[key]))) : null;
  return { first, second, maximumDeltaCssPixels: delta, stable: Number.isFinite(delta) && delta <= 0.25 };
}

async function captureTarget({ browser, browserId, runtime, viewport, mode, definition, repeat, retainPrefix }) {
  const blockedOrigins = [];
  const context = await browser.newContext({
    viewport: viewport.viewport,
    screen: viewport.physical,
    deviceScaleFactor: viewport.deviceScaleFactor,
    colorScheme: "light",
    locale: "en-US",
    reducedMotion: mode.reducedMotion,
    forcedColors: mode.forcedColors,
    hasTouch: viewport.physical.width <= 768
  });
  await installDeterminism(context, blockedOrigins);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  try {
    await page.goto(`${origins[runtime.id]}${runtime.route}`, { waitUntil: "domcontentloaded" });
    const readiness = await deterministicReady(page, runtime.root);
    await page.evaluate((source) => window.eval(source), axeSource);
    const locator = page.locator(definition.selector);
    await locator.waitFor({ state: "visible", timeout: 30_000 });
    await locator.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" }));
    const geometry = await stableGeometry(page, definition.selector);
    const authored = await authoredColorEvidence(page, definition.selector);
    const computed = await computedStyleEvidence(page, definition.selector);
    const usedForcedColors = await usedForcedColorEvidence(page, mode.classification);
    const axe = await rawAxeEvidence(page, definition.selector);
    const accessibilityTree = await accessibilityTreeEvidence(context, page, definition.selector);
    const clipBuffer = await locator.screenshot({ animations: "disabled" });
    const originalStyleAttribute = await locator.getAttribute("style");
    await locator.evaluate((element) => {
      element.style.setProperty("color", "transparent", "important");
      element.style.setProperty("-webkit-text-fill-color", "transparent", "important");
      element.style.setProperty("text-shadow", "none", "important");
    });
    const backgroundOnlyBuffer = await locator.screenshot({ animations: "disabled" });
    await locator.evaluate((element, originalStyleAttribute) => {
      if (originalStyleAttribute === null) element.removeAttribute("style");
      else element.setAttribute("style", originalStyleAttribute);
    }, originalStyleAttribute);
    const paddedBox = geometry.second ? {
      x: Math.max(0, geometry.second.x - 8),
      y: Math.max(0, geometry.second.y - 8),
      width: Math.min(viewport.viewport.width - Math.max(0, geometry.second.x - 8), geometry.second.width + 16),
      height: Math.min(viewport.viewport.height - Math.max(0, geometry.second.y - 8), geometry.second.height + 16)
    } : null;
    const paddedBuffer = paddedBox ? await page.screenshot({ clip: paddedBox, animations: "disabled" }) : clipBuffer;
    const fullBuffer = await page.screenshot({ fullPage: true, animations: "disabled" });
    const base = [retainPrefix, browserId, runtime.id, definition.id, `repeat-${repeat}`].join("--");
    const clipPath = path.join(retainedRoot, "samples", `${base}--element.png`);
    const paddedPath = path.join(retainedRoot, "samples", `${base}--padded.png`);
    const backgroundOnlyPath = path.join(retainedRoot, "samples", `${base}--background-only.png`);
    const maskPath = path.join(retainedRoot, "samples", `${base}--mask.png`);
    fs.mkdirSync(path.dirname(clipPath), { recursive: true });
    fs.writeFileSync(clipPath, clipBuffer);
    fs.writeFileSync(paddedPath, paddedBuffer);
    fs.writeFileSync(backgroundOnlyPath, backgroundOnlyBuffer);
    const rendered = await analyzeRendered(clipBuffer, backgroundOnlyBuffer, maskPath);
    return {
      id: [browserId, runtime.id, viewport.name, mode.id, definition.id, repeat].join(":"),
      browser: browserId,
      browserVersion: browser.version(),
      runtime: runtime.id,
      route: runtime.route,
      viewport: viewport.name,
      viewportPhysical: viewport.physical,
      viewportCss: viewport.viewport,
      deviceScaleFactor: viewport.deviceScaleFactor,
      zoom: 200,
      contextMode: mode.id,
      contextClassification: mode.classification,
      element: definition.id,
      itemId: definition.itemId,
      selector: definition.selector,
      repeat,
      readiness,
      geometry,
      evidence: {
        AUTHORED_COLOR_EVIDENCE: authored,
        COMPUTED_STYLE_EVIDENCE: computed,
        USED_FORCED_COLOR_EVIDENCE: usedForcedColors,
        RENDERED_PIXEL_EVIDENCE: rendered,
        AXE_RULE_EVIDENCE: axe,
        ACCESSIBILITY_TREE_EVIDENCE: accessibilityTree
      },
      screenshots: {
        element: { path: normalizePath(clipPath), bytes: clipBuffer.length, sha256: sha256(clipBuffer) },
        padded: { path: normalizePath(paddedPath), bytes: paddedBuffer.length, sha256: sha256(paddedBuffer) },
        backgroundOnly: { path: normalizePath(backgroundOnlyPath), bytes: backgroundOnlyBuffer.length, sha256: sha256(backgroundOnlyBuffer) },
        fullPageTemporary: { retained: false, bytes: fullBuffer.length, sha256: sha256(fullBuffer) }
      },
      blockedExternalOrigins: [...new Set(blockedOrigins)].sort(),
      errors,
      sourceSafe: true
    };
  } finally {
    await context.close();
  }
}

function extractAxePair(axe) {
  const text = axe.violations.flatMap((entry) => entry.nodes.map((node) => node.failureSummary || "")).join("\n");
  const match = text.match(/foreground color:\s*(#[0-9a-f]{3,8}).*background color:\s*(#[0-9a-f]{3,8})/i);
  return match ? { foreground: match[1].toLowerCase(), background: match[2].toLowerCase() } : null;
}
function summarizeRepeated(records) {
  const reliable = records.filter((entry) => entry.evidence.RENDERED_PIXEL_EVIDENCE.reliable && entry.geometry.stable);
  const ratios = reliable.map((entry) => entry.evidence.RENDERED_PIXEL_EVIDENCE.ratio);
  const hashes = records.map((entry) => entry.screenshots.element.sha256);
  return {
    attempts: records.length,
    reliableAttempts: reliable.length,
    ratios,
    minimumRatio: ratios.length ? Math.min(...ratios) : null,
    maximumRatio: ratios.length ? Math.max(...ratios) : null,
    ratioSpread: ratios.length ? Math.max(...ratios) - Math.min(...ratios) : null,
    stableGeometryAttempts: records.filter((entry) => entry.geometry.stable).length,
    uniqueElementScreenshotHashes: [...new Set(hashes)].length,
    decision: reliable.length === records.length && ratios.every((ratio) => ratio >= requiredRatio) ? "PASS_RENDERED" : reliable.length === records.length ? "FAIL_RENDERED" : "UNKNOWN"
  };
}

function sourceSafeArtifact(target) {
  const buffer = fs.readFileSync(target);
  return { path: normalizePath(target), bytes: buffer.length, sha256: sha256(buffer) };
}

async function main() {
  if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error(`Dedicated ports ${nextPort}/${staticPort} must be closed.`);
  fs.mkdirSync(tempRoot, { recursive: true });
  fs.mkdirSync(retainedRoot, { recursive: true });
  const nextServer = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(nextPort)], { cwd: root, env: { ...process.env, NODE_ENV: "production", TEOYUBE_OWNER_QA_TEST_MODE: "true" }, stdio: "ignore", windowsHide: true });
  const staticServer = spawn(process.execPath, [path.join(root, "server.js")], { cwd: root, env: { ...process.env, PORT: String(staticPort) }, stdio: "ignore", windowsHide: true });
  const launched = [];
  try {
    await Promise.all([waitForUrl(nextServer, `${origins.next}/api/health`), waitForUrl(staticServer, `${origins.static}/index.html`)]);
    const reconciliation = [];
    const staticRepeats = [];
    const reducedMotionRepeats = [];
    const nativeAvailability = [];
    for (const browserDefinition of browsers) {
      const browser = await chromium.launch({ headless: true, ...browserDefinition.launch });
      launched.push(browser);
      const nativeContext = await browser.newContext({ viewport: desktopWide200.viewport, screen: desktopWide200.physical, deviceScaleFactor: 2, colorScheme: "light" });
      const nativePage = await nativeContext.newPage();
      await nativePage.goto(`${origins.next}${routes.next.route}`, { waitUntil: "domcontentloaded" });
      await deterministicReady(nativePage, routes.next.root);
      const nativeActive = await nativePage.evaluate(() => matchMedia("(forced-colors: active)").matches);
      nativeAvailability.push({ browser: browserDefinition.id, browserVersion: browser.version(), status: nativeActive ? "AVAILABLE_ACTIVE" : "NOT_AVAILABLE", reason: nativeActive ? "The existing OS/browser session reported native forced colors active." : "The existing OS/browser session did not report native forced colors active; Phase 5D-2 did not change OS settings." });
      await nativeContext.close();

      const inactive = [];
      const active = [];
      for (const definition of elements) {
        inactive.push(await captureTarget({ browser, browserId: browserDefinition.id, runtime: routes.next, viewport: desktopWide200, mode: { id: "forced-colors-inactive", classification: "INACTIVE_CONTROL", reducedMotion: "no-preference", forcedColors: "none" }, definition, repeat: 1, retainPrefix: "axe-reconciliation-inactive" }));
        active.push(await captureTarget({ browser, browserId: browserDefinition.id, runtime: routes.next, viewport: desktopWide200, mode: { id: "forced-colors-emulated", classification: "EMULATED_FORCED_COLORS", reducedMotion: "no-preference", forcedColors: "active" }, definition, repeat: 1, retainPrefix: "axe-reconciliation-active" }));
      }
      for (const definition of elements) {
        const inactiveEntry = inactive.find((entry) => entry.element === definition.id);
        const activeEntry = active.find((entry) => entry.element === definition.id);
        const axePair = extractAxePair(activeEntry.evidence.AXE_RULE_EVIDENCE);
        const used = activeEntry.evidence.USED_FORCED_COLOR_EVIDENCE;
        const rendered = activeEntry.evidence.RENDERED_PIXEL_EVIDENCE;
        const computed = activeEntry.evidence.COMPUTED_STYLE_EVIDENCE.style;
        const axeForeground = axePair ? parseHexColor(axePair.foreground) : null;
        const axeBackground = axePair ? parseHexColor(axePair.background) : null;
        const axeMatchesRendered = Boolean(rendered.reliable && rendered.foreground && rendered.background && axeForeground && axeBackground && distance(rendered.foreground.color, axeForeground) <= 8 && distance(rendered.background.color, axeBackground) <= 8);
        const evaluationClassification = axePair && axeMatchesRendered
          ? "AXE_EVALUATED_RENDERED_PAIR"
          : axePair ? "AXE_DID_NOT_EVALUATE_RENDERED_PAIR" : "AXE_REPORTED_NO_FAILURE";
        reconciliation.push({
          cell: `${browserDefinition.id}:${definition.id}`,
          browser: browserDefinition.id,
          browserVersion: browser.version(),
          element: definition.id,
          selector: definition.selector,
          inactive: inactiveEntry,
          emulatedActive: activeEntry,
          directReconciliation: {
            axeReportedPair: axePair,
            activeComputedPair: { foreground: computed.color, background: computed.backgroundColor },
            activeSystemPair: { foreground: used.canvasTextResolved, background: used.canvasResolved },
            activeRenderedPair: rendered.foreground && rendered.background ? { foreground: rendered.foreground.color, background: rendered.background.color, ratio: rendered.ratio, reliable: rendered.reliable } : null,
            classification: evaluationClassification
          }
        });
      }

      for (const definition of elements) {
        for (let repeat = 1; repeat <= 5; repeat += 1) {
          staticRepeats.push(await captureTarget({ browser, browserId: browserDefinition.id, runtime: routes.static, viewport: desktopWide200, mode: { id: "forced-colors-emulated", classification: "EMULATED_FORCED_COLORS", reducedMotion: "no-preference", forcedColors: "active" }, definition, repeat, retainPrefix: "static-forced-colors" }));
        }
      }
      if (browserDefinition.id === "playwright-chromium") {
        for (const runtime of [routes.next, routes.static]) {
          for (const definition of elements) {
            for (let repeat = 1; repeat <= 5; repeat += 1) {
              reducedMotionRepeats.push(await captureTarget({ browser, browserId: browserDefinition.id, runtime, viewport: tabletLandscape200, mode: { id: "reduced-motion", classification: "REDUCED_MOTION_CONTROL", reducedMotion: "reduce", forcedColors: "none" }, definition, repeat, retainPrefix: "tablet-reduced-motion" }));
            }
          }
        }
      }
      await browser.close();
      launched.splice(launched.indexOf(browser), 1);
    }

    const staticGroups = [];
    for (const browserDefinition of browsers) for (const definition of elements) {
      const records = staticRepeats.filter((entry) => entry.browser === browserDefinition.id && entry.element === definition.id);
      staticGroups.push({ browser: browserDefinition.id, element: definition.id, selector: definition.selector, ...summarizeRepeated(records) });
    }
    const reducedGroups = [];
    for (const runtime of [routes.next, routes.static]) for (const definition of elements) {
      const records = reducedMotionRepeats.filter((entry) => entry.runtime === runtime.id && entry.element === definition.id);
      reducedGroups.push({ browser: "playwright-chromium", runtime: runtime.id, element: definition.id, selector: definition.selector, ...summarizeRepeated(records) });
    }
    const protections = { productSourceChanges: 0, protectedVisualChanges: 0, cssColorChanges: 0, domAriaChanges: 0, baselineWrites: 0, packageLockfileChanges: 0, paidCalls: 0, participantRecords: 0 };
    const allAxeClassified = reconciliation.every((entry) => ["AXE_EVALUATED_RENDERED_PAIR", "AXE_DID_NOT_EVALUATE_RENDERED_PAIR", "AXE_REPORTED_NO_FAILURE"].includes(entry.directReconciliation.classification));
    const allStaticReliable = staticGroups.every((entry) => entry.reliableAttempts === entry.attempts);
    const allStaticReliablePass = staticGroups.every((entry) => entry.decision === "PASS_RENDERED");
    const reproducibleStaticFailure = staticGroups.some((entry) => entry.decision === "FAIL_RENDERED" && entry.reliableAttempts === entry.attempts && entry.maximumRatio < requiredRatio);
    const reconciledActiveFailure = reconciliation.some((entry) => entry.directReconciliation.classification === "AXE_EVALUATED_RENDERED_PAIR" && entry.emulatedActive.evidence.RENDERED_PIXEL_EVIDENCE.reliable && entry.emulatedActive.evidence.RENDERED_PIXEL_EVIDENCE.ratio < requiredRatio);
    const allReducedReliablePass = reducedGroups.every((entry) => entry.decision === "PASS_RENDERED");
    const knownErrors = new Set(["console: Failed to load resource: the server responded with a status of 404 (Not Found)", "pageerror: Published media manifest returned 404."]);
    const harnessErrors = [...reconciliation.flatMap((entry) => [entry.inactive, entry.emulatedActive]), ...staticRepeats, ...reducedMotionRepeats].flatMap((entry) => entry.errors.filter((error) => !knownErrors.has(error))).length;
    const outcome = reproducibleStaticFailure && reconciledActiveFailure && allStaticReliable && allReducedReliablePass && harnessErrors === 0
      ? "A_REAL_CURRENT_PRODUCT_FAILURE"
      : allAxeClassified && allStaticReliablePass && allReducedReliablePass && harnessErrors === 0
        ? "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE"
        : "B_UNRESOLVED_ENVIRONMENT_OR_TOOLING_CONFLICT";
    const measurements = {
      schemaVersion: 1,
      phase: "5D-2",
      generatedAt,
      issueId: "A11Y-008",
      decisionId,
      formerProposalHash,
      threshold: requiredRatio,
      implementationAuthorized: false,
      evidenceModel: ["AUTHORED_COLOR_EVIDENCE", "COMPUTED_STYLE_EVIDENCE", "USED_FORCED_COLOR_EVIDENCE", "RENDERED_PIXEL_EVIDENCE", "AXE_RULE_EVIDENCE", "ACCESSIBILITY_TREE_EVIDENCE"],
      environment: { platform: process.platform, release: os.release(), version: os.version(), architecture: os.arch(), ports: { next: nextPort, static: staticPort }, networkPolicy: "loopback and data only; external network blocked" },
      targets: elements,
      nativeAvailability,
      forcedColorsAxeReconciliation: reconciliation,
      staticForcedColorsRepeats: staticRepeats,
      staticForcedColorsSummary: staticGroups,
      tabletReducedMotionRepeats: reducedMotionRepeats,
      tabletReducedMotionSummary: reducedGroups,
      adjudication: { outcome, allAxeClassified, allStaticReliable, allStaticReliablePass, reproducibleStaticFailure, reconciledActiveFailure, allReducedReliablePass, harnessErrors, ownerGateRequired: true },
      protections
    };
    writeJson(measurementPath, measurements);
    const sampleFiles = fs.readdirSync(path.join(retainedRoot, "samples")).filter((name) => name.endsWith(".png")).sort().map((name) => sourceSafeArtifact(path.join(retainedRoot, "samples", name)));
    const measurementArtifact = sourceSafeArtifact(measurementPath);
    const manifest = {
      schemaVersion: 1,
      phase: "5D-2",
      generatedAt,
      issueId: "A11Y-008",
      decisionId,
      formerProposalHash,
      implementationAuthorized: false,
      measurementArtifact,
      retainedSamples: sampleFiles,
      counts: { reconciliationCells: reconciliation.length, staticFreshContexts: staticRepeats.length, reducedMotionFreshContexts: reducedMotionRepeats.length, retainedSampleFiles: sampleFiles.length },
      adjudication: measurements.adjudication,
      protections
    };
    writeJson(path.join(retainedRoot, "manifest.json"), manifest);
    console.log(JSON.stringify({ generatedAt, counts: manifest.counts, staticGroups, reducedGroups, adjudication: measurements.adjudication }, null, 2));
    if (outcome !== "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE") process.exitCode = 2;
  } finally {
    await Promise.all(launched.map((browser) => browser.close().catch(() => {})));
    await Promise.all([stopServer(nextServer), stopServer(staticServer)]);
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline && (await portOpen(nextPort) || await portOpen(staticPort))) await new Promise((resolve) => setTimeout(resolve, 250));
    if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error("Owned Phase 5D-2 listeners did not close.");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
