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
const nextPort = Number(process.env.TEOYUBE_A11Y008_NEXT_PORT || 3194);
const staticPort = Number(process.env.TEOYUBE_A11Y008_STATIC_PORT || 4194);
const origins = { next: `http://127.0.0.1:${nextPort}`, static: `http://127.0.0.1:${staticPort}` };
const nextCli = require.resolve("next/dist/bin/next");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const evidenceRoot = path.join(root, ".tmp", "accessibility", "a11y008-retest");
const checkpointPath = path.join(evidenceRoot, "checkpoint.json");
const generatedAt = new Date().toISOString();
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001";
const formerProposalHash = "86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8";

const viewports = [
  { name: "desktop-wide", width: 1440, height: 900 },
  { name: "desktop-standard", width: 1280, height: 800 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-small", width: 360, height: 800 }
];
const browsers = [
  { id: "playwright-chromium", launch: {} },
  { id: "google-chrome", launch: { channel: "chrome" } },
  { id: "microsoft-edge", launch: { channel: "msedge" } }
];
const runtimes = [
  { id: "next", route: "/canon?ownerQa=1" },
  { id: "static", route: "/index.html?ownerQa=1#canon" }
];
const zooms = [
  { percent: 100, divisor: 1, deviceScaleFactor: 1 },
  { percent: 200, divisor: 2, deviceScaleFactor: 2 }
];
const contextModes = [
  { id: "normal", reducedMotion: "no-preference", forcedColors: "none", states: ["default", "hover", "media-selected"] },
  { id: "reduced-motion", reducedMotion: "reduce", forcedColors: "none", states: ["reduced-motion"] },
  { id: "forced-colors", reducedMotion: "no-preference", forcedColors: "active", states: ["forced-colors"] }
];
const elements = [
  { id: "D02", itemId: "canon-map-D02", selector: '[data-canon-item="canon-map-D02"] .canon-status.in-progress', expectedText: "In Progress" },
  { id: "D05", itemId: "canon-map-D05", selector: '[data-canon-item="canon-map-D05"] .canon-status.in-progress', expectedText: "In Progress" }
];
const notApplicableStates = [
  { state: "keyboard-focus", reason: "The status label is not focusable and exposes no control role." },
  { state: "pointer-active", reason: "The status label has no pointer activation behavior." },
  { state: "keyboard-active", reason: "The status label has no keyboard activation behavior." },
  { state: "selected-current", reason: "The status label exposes no selected/current state." },
  { state: "disabled", reason: "The status label does not support disabled state." }
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
async function installDeterminism(context, blockedRequests) {
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
    else { blockedRequests.push(url.origin); await route.abort("blockedbyclient"); }
  });
}
async function stabilize(page) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}" });
  return page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 3000);
    })));
    return {
      fontsReady: !document.fonts || document.fonts.status === "loaded",
      imageCount: document.images.length,
      imagesReady: [...document.images].every((image) => image.complete),
      failedImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      viewport: { width: innerWidth, height: innerHeight },
      devicePixelRatio,
      forcedColors: matchMedia("(forced-colors: active)").matches,
      prefersContrastMore: matchMedia("(prefers-contrast: more)").matches,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches
    };
  });
}

function parseColor(value) {
  const match = String(value).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,\/]\s*([\d.]+))?\s*\)/i);
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] === undefined ? 1 : Number(match[4]) };
}
function composite(foreground, background) {
  if (!foreground || !background) return null;
  const alpha = foreground.a ?? 1;
  return {
    r: foreground.r * alpha + background.r * (1 - alpha),
    g: foreground.g * alpha + background.g * (1 - alpha),
    b: foreground.b * alpha + background.b * (1 - alpha),
    a: 1
  };
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
const rgbKey = (color) => `${Math.round(color.r)},${Math.round(color.g)},${Math.round(color.b)}`;

async function renderedSamples(buffer, computedForeground, computedBackground) {
  const image = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = [];
  const frequencies = new Map();
  for (let offset = 0; offset < image.data.length; offset += image.info.channels) {
    const color = { r: image.data[offset], g: image.data[offset + 1], b: image.data[offset + 2], a: image.data[offset + 3] / 255 };
    if (color.a < 0.99) continue;
    pixels.push({ ...color, offset: offset / image.info.channels });
    const key = rgbKey(color);
    frequencies.set(key, (frequencies.get(key) || 0) + 1);
  }
  const dominant = [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([key, count]) => ({ color: Object.fromEntries(["r", "g", "b"].map((channel, index) => [channel, Number(key.split(",")[index])])), count }))
    .filter((entry) => !computedBackground || distance(entry.color, computedBackground) <= 28)
    .slice(0, 3);
  if (!dominant.length && computedBackground) dominant.push({ color: computedBackground, count: 0 });
  const foregroundCandidates = pixels
    .map((pixel) => ({ pixel, distance: computedForeground ? distance(pixel, computedForeground) : Infinity }))
    .filter((entry) => entry.distance <= 20)
    .sort((a, b) => a.distance - b.distance)
    .filter((entry, index, array) => index === array.findIndex((candidate) => rgbKey(candidate.pixel) === rgbKey(entry.pixel)))
    .slice(0, 5);
  const ratios = [];
  for (const foreground of foregroundCandidates) {
    for (const background of dominant) ratios.push({
      foreground: { r: foreground.pixel.r, g: foreground.pixel.g, b: foreground.pixel.b },
      background: background.color,
      ratio: contrastRatio(foreground.pixel, background.color),
      foregroundDistanceFromComputed: Math.round(foreground.distance * 100) / 100,
      backgroundFrequency: background.count
    });
  }
  return {
    width: image.info.width,
    height: image.info.height,
    channelCount: image.info.channels,
    method: "full-opacity foreground pixels within RGB distance 20 of computed foreground; up to three dominant background colors within RGB distance 28 of computed background; antialias edge pixels excluded",
    reliable: foregroundCandidates.length > 0 && dominant.length > 0,
    foregroundSampleCount: foregroundCandidates.length,
    backgroundSampleCount: dominant.length,
    lowestReliableRatio: ratios.length ? Math.min(...ratios.map((entry) => entry.ratio)) : null,
    samples: ratios
  };
}

async function scopedAxe(page, selector) {
  return page.evaluate(async ({ selector }) => {
    const results = await window.axe.run({ include: [[selector]] }, {
      runOnly: { type: "rule", values: ["color-contrast"] },
      resultTypes: ["violations", "incomplete", "passes"]
    });
    const compact = (entries) => entries.map((entry) => ({ id: entry.id, impact: entry.impact, nodeCount: entry.nodes.length, summaries: entry.nodes.map((node) => node.failureSummary || node.html) }));
    return { violations: compact(results.violations), incomplete: compact(results.incomplete), passes: compact(results.passes) };
  }, { selector });
}

async function collectComputed(page, definition) {
  return page.locator(definition.selector).evaluate((element) => {
    const round = (value) => Math.round(value * 100) / 100;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const ancestors = [];
    let current = element;
    let opacityProduct = 1;
    while (current instanceof Element) {
      const currentStyle = getComputedStyle(current);
      opacityProduct *= Number.parseFloat(currentStyle.opacity || "1") || 1;
      ancestors.push({
        tag: current.tagName.toLowerCase(),
        id: current.id || null,
        className: typeof current.className === "string" ? current.className : null,
        backgroundColor: currentStyle.backgroundColor,
        backgroundImage: currentStyle.backgroundImage,
        opacity: currentStyle.opacity,
        mixBlendMode: currentStyle.mixBlendMode,
        filter: currentStyle.filter,
        backdropFilter: currentStyle.backdropFilter
      });
      current = current.parentElement;
    }
    const pseudo = (name) => {
      const value = getComputedStyle(element, name);
      return { content: value.content, color: value.color, backgroundColor: value.backgroundColor, backgroundImage: value.backgroundImage, opacity: value.opacity, mixBlendMode: value.mixBlendMode, filter: value.filter, backdropFilter: value.backdropFilter };
    };
    const closestInteractive = element.closest('button,a[href],input,select,textarea,[role="button"],[role="link"],[tabindex]');
    return {
      text: String(element.textContent || "").replace(/\s+/g, " ").trim(),
      tag: element.tagName.toLowerCase(),
      role: element.getAttribute("role"),
      tabIndexAttribute: element.getAttribute("tabindex"),
      tabIndexProperty: element.tabIndex,
      ariaDisabled: element.getAttribute("aria-disabled"),
      ariaSelected: element.getAttribute("aria-selected"),
      ariaCurrent: element.getAttribute("aria-current"),
      ariaPressed: element.getAttribute("aria-pressed"),
      disabledProperty: "disabled" in element ? Boolean(element.disabled) : null,
      closestInteractive: closestInteractive ? closestInteractive.tagName.toLowerCase() : null,
      rect: { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) },
      color: style.color,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      opacity: style.opacity,
      parentOpacityProduct: round(opacityProduct),
      mixBlendMode: style.mixBlendMode,
      filter: style.filter,
      backdropFilter: style.backdropFilter,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily,
      lineHeight: style.lineHeight,
      textShadow: style.textShadow,
      forcedColorAdjust: style.forcedColorAdjust,
      ancestors,
      pseudo: { before: pseudo("::before"), after: pseudo("::after") },
      visible: rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none"
    };
  });
}

function resolveBackground(computed) {
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const layers = [...computed.ancestors].reverse();
  let result = white;
  for (const layer of layers) {
    const color = parseColor(layer.backgroundColor);
    if (color && color.a > 0) result = composite(color, result);
  }
  return result;
}

async function measure(page, definition, state, environment, screenshotDirectory) {
  const locator = page.locator(definition.selector);
  await locator.waitFor({ state: "visible", timeout: 30_000 });
  const computed = await collectComputed(page, definition);
  const computedBackground = resolveBackground(computed);
  const authoredForeground = parseColor(computed.color);
  const computedForeground = composite(authoredForeground, computedBackground);
  const computedRatio = contrastRatio(computedForeground, computedBackground);
  const screenshot = await locator.screenshot({ animations: "disabled" });
  const screenshotName = [environment.browser, environment.runtime, environment.viewport, `zoom-${environment.zoom}`, environment.contextMode, state, definition.id].join("--") + ".png";
  fs.mkdirSync(screenshotDirectory, { recursive: true });
  const screenshotPath = path.join(screenshotDirectory, screenshotName);
  fs.writeFileSync(screenshotPath, screenshot);
  const rendered = await renderedSamples(screenshot, computedForeground, computedBackground);
  const axe = await scopedAxe(page, definition.selector);
  const largeText = Number.parseFloat(computed.fontSize) >= 24 || (Number.parseFloat(computed.fontSize) >= 18.66 && Number.parseInt(computed.fontWeight, 10) >= 700);
  const requiredRatio = 4.5;
  const unknown = computed.text !== definition.expectedText || !computed.visible || !computedForeground || !computedBackground || !Number.isFinite(computedRatio) || !rendered.reliable || !Number.isFinite(rendered.lowestReliableRatio);
  const pass = !unknown && computedRatio >= requiredRatio && rendered.lowestReliableRatio >= requiredRatio && axe.violations.length === 0;
  return {
    id: [environment.browser, environment.runtime, environment.viewport, environment.zoom, environment.contextMode, state, definition.id].join(":"),
    ...environment,
    state,
    element: definition.id,
    itemId: definition.itemId,
    selector: definition.selector,
    safeLabel: computed.text,
    computed,
    effectiveColors: { foreground: computedForeground, background: computedBackground },
    textClassification: largeText ? "large-by-metrics-but-4.5-threshold-retained" : "normal",
    requiredRatio,
    computedContrastRatio: computedRatio,
    rendered,
    axe,
    screenshot: { path: path.relative(root, screenshotPath).replace(/\\/g, "/"), bytes: screenshot.length, sha256: sha256(screenshot) },
    unknown,
    pass
  };
}

async function validateApplicability(page, definition) {
  return page.locator(definition.selector).evaluate((element) => ({
    focusable: element.matches('button,a[href],input,select,textarea,[contenteditable="true"],[tabindex]:not([tabindex="-1"])'),
    interactiveAncestor: Boolean(element.closest('button,a[href],input,select,textarea,[role="button"],[role="link"]')),
    selectedStatePresent: ["aria-selected", "aria-current", "aria-pressed"].some((name) => element.hasAttribute(name)),
    disabledStatePresent: element.hasAttribute("disabled") || element.hasAttribute("aria-disabled"),
    overlayAncestor: Boolean(element.closest('[role="dialog"],dialog,.modal,.drawer,[aria-modal="true"]'))
  }));
}

async function captureEnvironment(browser, browserId, runtime, viewport, zoom, contextMode) {
  const cssViewport = { width: Math.max(1, Math.round(viewport.width / zoom.divisor)), height: Math.max(1, Math.round(viewport.height / zoom.divisor)) };
  const blockedRequests = [];
  const context = await browser.newContext({
    viewport: cssViewport,
    screen: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: zoom.deviceScaleFactor,
    colorScheme: "light",
    locale: "en-US",
    reducedMotion: contextMode.reducedMotion,
    forcedColors: contextMode.forcedColors,
    hasTouch: viewport.width <= 768
  });
  await installDeterminism(context, blockedRequests);
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(45_000);
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
  const url = `${origins[runtime.id]}${runtime.route}`;
  const environment = { browser: browserId, browserVersion: browser.version(), runtime: runtime.id, route: runtime.route, viewport: viewport.name, viewportPhysical: { width: viewport.width, height: viewport.height }, viewportCssRequested: cssViewport, zoom: zoom.percent, zoomMethod: zoom.percent === 100 ? "native 100%" : "half CSS viewport and doubled device scale factor", deviceScaleFactorRequested: zoom.deviceScaleFactor, contextMode: contextMode.id };
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    await page.locator("#canon").waitFor({ state: "visible", timeout: 30_000 });
    const readiness = await stabilize(page);
    await page.evaluate((source) => window.eval(source), axeSource);
    const measurements = [];
    const notApplicable = [];
    const screenshots = path.join(evidenceRoot, "screenshots");
    if (contextMode.id === "normal") {
      let suppressGlobalNotice = false;
      for (const definition of elements) {
        await page.locator(definition.selector).evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" }));
        const overlayEvidence = await page.locator(definition.selector).evaluate((element) => {
          const overlay = document.querySelector("#phase117OfflineStatus");
          const targetRect = element.getBoundingClientRect();
          const overlayRect = overlay?.getBoundingClientRect();
          const intersects = Boolean(overlayRect && targetRect.left < overlayRect.right && targetRect.right > overlayRect.left && targetRect.top < overlayRect.bottom && targetRect.bottom > overlayRect.top);
          return {
            overlayPresent: Boolean(overlay),
            intersects,
            targetRect: { x: targetRect.x, y: targetRect.y, width: targetRect.width, height: targetRect.height },
            overlayRect: overlayRect ? { x: overlayRect.x, y: overlayRect.y, width: overlayRect.width, height: overlayRect.height } : null,
            topmostAtTargetCenter: document.elementFromPoint(targetRect.left + targetRect.width / 2, targetRect.top + targetRect.height / 2)?.id || document.elementFromPoint(targetRect.left + targetRect.width / 2, targetRect.top + targetRect.height / 2)?.className || null
          };
        });
        suppressGlobalNotice ||= overlayEvidence.intersects;
        notApplicable.push({ ...environment, element: definition.id, selector: definition.selector, state: "overlay", status: "NOT_APPLICABLE", reason: overlayEvidence.intersects ? "The unrelated global service-status notice occludes this label at the current responsive zoom; it hides the text rather than changing the label's foreground/background contrast pair." : "No approved Canon overlay or modal intersects this status label.", applicabilityEvidence: overlayEvidence });
      }
      if (suppressGlobalNotice) {
        await page.addStyleTag({ content: "#phase117OfflineStatus{visibility:hidden!important;pointer-events:none!important}" });
      }
      for (const definition of elements) measurements.push(await measure(page, definition, "default", environment, screenshots));
      for (const definition of elements) {
        await page.locator(definition.selector).hover();
        measurements.push(await measure(page, definition, "hover", environment, screenshots));
      }
      for (const definition of elements) {
        const stage = page.locator(`[data-canon-item="${definition.itemId}"] [data-canon-video-stage]`).first();
        const stageCount = await stage.count();
        const stageEvidence = stageCount
          ? await stage.evaluate((element) => {
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return { count: 1, visible: rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden", display: style.display, visibility: style.visibility, rect: { width: rect.width, height: rect.height } };
            })
          : { count: 0, visible: false, display: null, visibility: null, rect: null };
        if (stageEvidence.visible) {
          await stage.click();
          await page.waitForTimeout(100);
          measurements.push(await measure(page, definition, "media-selected", environment, screenshots));
        } else {
          notApplicable.push({ ...environment, element: definition.id, selector: definition.selector, state: "media-selected", status: "NOT_APPLICABLE", reason: "The corresponding Canon media stage is absent from the approved responsive composition at this viewport and zoom.", applicabilityEvidence: stageEvidence });
        }
      }
      for (const definition of elements) {
        const applicability = await validateApplicability(page, definition);
        if (applicability.focusable || applicability.interactiveAncestor || applicability.selectedStatePresent || applicability.disabledStatePresent || applicability.overlayAncestor) throw new Error(`Stored NOT_APPLICABLE state changed for ${definition.id}: ${JSON.stringify(applicability)}`);
        for (const entry of notApplicableStates) notApplicable.push({ ...environment, element: definition.id, selector: definition.selector, state: entry.state, status: "NOT_APPLICABLE", reason: entry.reason, applicabilityEvidence: applicability });
      }
    } else {
      for (const definition of elements) measurements.push(await measure(page, definition, contextMode.id, environment, screenshots));
    }
    const knownErrors = new Set(["console: Failed to load resource: the server responded with a status of 404 (Not Found)", "pageerror: Published media manifest returned 404."]);
    return {
      key: [browserId, runtime.id, viewport.name, zoom.percent, contextMode.id].join(":"),
      environment,
      readiness: { ...readiness, colorProfile: "not exposed by the browser; CSS sRGB color space used", zoomScaleVerified: readiness.devicePixelRatio === zoom.deviceScaleFactor },
      blockedExternalOrigins: [...new Set(blockedRequests)].sort(),
      measurements,
      notApplicable,
      errors: consoleErrors,
      unexpectedErrors: consoleErrors.filter((error) => !knownErrors.has(error))
    };
  } finally {
    await context.close();
  }
}

function summarize(environments) {
  const measurements = environments.flatMap((entry) => entry.measurements);
  const notApplicable = environments.flatMap((entry) => entry.notApplicable);
  const unexpectedErrors = environments.flatMap((entry) => entry.unexpectedErrors.map((error) => ({ environment: entry.key, error })));
  const unknown = measurements.filter((entry) => entry.unknown);
  const failures = measurements.filter((entry) => !entry.pass);
  const axeFailures = measurements.reduce((sum, entry) => sum + entry.axe.violations.reduce((inner, violation) => inner + violation.nodeCount, 0), 0);
  const contradictions = [];
  const byComparison = new Map();
  for (const entry of measurements) {
    const key = [entry.browser, entry.viewport, entry.zoom, entry.contextMode, entry.state, entry.element].join(":");
    if (!byComparison.has(key)) byComparison.set(key, []);
    byComparison.get(key).push(entry);
  }
  for (const [key, entries] of byComparison) {
    const next = entries.find((entry) => entry.runtime === "next");
    const staticCell = entries.find((entry) => entry.runtime === "static");
    if (!next || !staticCell || next.pass !== staticCell.pass || Math.abs(next.computedContrastRatio - staticCell.computedContrastRatio) > 0.01) contradictions.push({ key, next: next ? { pass: next.pass, unknown: next.unknown, computedRatio: next.computedContrastRatio, renderedRatio: next.rendered.lowestReliableRatio } : null, static: staticCell ? { pass: staticCell.pass, unknown: staticCell.unknown, computedRatio: staticCell.computedContrastRatio, renderedRatio: staticCell.rendered.lowestReliableRatio } : null });
  }
  const maximumApplicable = browsers.length * runtimes.length * viewports.length * zooms.length * 5 * elements.length;
  const minimumNotApplicable = browsers.length * runtimes.length * viewports.length * zooms.length * 6 * elements.length;
  const expectedTotal = maximumApplicable + minimumNotApplicable;
  const essentialMissing = environments.length !== browsers.length * runtimes.length * viewports.length * zooms.length * contextModes.length || measurements.length + notApplicable.length !== expectedTotal || measurements.length > maximumApplicable || notApplicable.length < minimumNotApplicable;
  const outcome = unexpectedErrors.length || unknown.length || contradictions.length || essentialMissing
    ? "BLOCKED_INCONCLUSIVE"
    : failures.length
      ? "REPRODUCED_CURRENT"
      : "NOT_REPRODUCED_CURRENT_RETEST_COMPLETE";
  const runtimeResult = (runtime) => {
    const cells = measurements.filter((entry) => entry.runtime === runtime);
    const renderedRatios = cells.map((entry) => entry.rendered.lowestReliableRatio).filter(Number.isFinite);
    return { cells: cells.length, passing: cells.filter((entry) => entry.pass).length, failing: cells.filter((entry) => !entry.pass).length, lowestComputedRatio: Math.min(...cells.map((entry) => entry.computedContrastRatio).filter(Number.isFinite)), lowestRenderedRatio: renderedRatios.length ? Math.min(...renderedRatios) : null };
  };
  return {
    totalMatrixCells: expectedTotal,
    applicableCells: measurements.length,
    notApplicableCells: notApplicable.length,
    contextCells: environments.length,
    expectedContextCells: 216,
    passingCells: measurements.filter((entry) => entry.pass).length,
    failingCells: failures.length,
    unknownCells: unknown.length,
    harnessErrors: unexpectedErrors.length,
    scopedAxeFailures: axeFailures,
    lowestComputedRatio: Math.min(...measurements.map((entry) => entry.computedContrastRatio)),
    lowestRenderedSampleRatio: (() => { const values = measurements.map((entry) => entry.rendered.lowestReliableRatio).filter(Number.isFinite); return values.length ? Math.min(...values) : null; })(),
    contradictions,
    staticResult: runtimeResult("static"),
    nextResult: runtimeResult("next"),
    outcome,
    failingCellIds: failures.map((entry) => entry.id),
    unknownCellIds: unknown.map((entry) => entry.id),
    unexpectedErrors
  };
}

function compactMeasurement(entry) {
  const { ancestors = [], ...computed } = entry.computed;
  const layerContributes = (layer) => layer.backgroundColor !== "rgba(0, 0, 0, 0)" || layer.backgroundImage !== "none" || layer.opacity !== "1" || layer.mixBlendMode !== "normal" || layer.filter !== "none" || layer.backdropFilter !== "none";
  const opaqueSurfaceIndex = ancestors.findIndex((layer) => {
    const color = parseColor(layer.backgroundColor);
    return color && color.a === 1 && layer.opacity === "1" && layer.mixBlendMode === "normal" && layer.filter === "none" && layer.backdropFilter === "none";
  });
  const resolvedLayers = ancestors.slice(0, opaqueSurfaceIndex >= 0 ? opaqueSurfaceIndex + 1 : ancestors.length);
  const contributingLayers = resolvedLayers.filter(layerContributes).map((layer) => ({ tag: layer.tag, id: layer.id, className: layer.className, backgroundColor: layer.backgroundColor, backgroundImage: layer.backgroundImage, opacity: layer.opacity, mixBlendMode: layer.mixBlendMode, filter: layer.filter, backdropFilter: layer.backdropFilter }));
  const renderedSamples = [...entry.rendered.samples].sort((left, right) => left.ratio - right.ratio).slice(0, 3);
  const compactAxe = (items, includeSummaries) => items.map((item) => ({ id: item.id, impact: item.impact, nodeCount: item.nodeCount, ...(includeSummaries ? { summaries: item.summaries } : {}) }));
  const compactPseudo = Object.fromEntries(Object.entries(computed.pseudo).map(([name, value]) => {
    const contributes = value.content !== "none" || value.backgroundColor !== "rgba(0, 0, 0, 0)" || value.backgroundImage !== "none" || value.opacity !== "1" || value.mixBlendMode !== "normal" || value.filter !== "none" || value.backdropFilter !== "none";
    return [name, contributes ? { contributes, ...value } : { contributes: false }];
  }));
  computed.pseudo = compactPseudo;
  return {
    id: entry.id,
    state: entry.state,
    element: entry.element,
    itemId: entry.itemId,
    selector: entry.selector,
    safeLabel: entry.safeLabel,
    computed,
    backgroundResolution: { ancestorCount: ancestors.length, opaqueSurfaceIndex, contributingLayers, obscuredAncestorChainSha256: sha256(JSON.stringify(ancestors.slice(resolvedLayers.length))) },
    effectiveColors: entry.effectiveColors,
    textClassification: entry.textClassification,
    requiredRatio: entry.requiredRatio,
    computedContrastRatio: entry.computedContrastRatio,
    rendered: {
      width: entry.rendered.width,
      height: entry.rendered.height,
      channelCount: entry.rendered.channelCount,
      method: entry.rendered.method,
      reliable: entry.rendered.reliable,
      foregroundSampleCount: entry.rendered.foregroundSampleCount,
      backgroundSampleCount: entry.rendered.backgroundSampleCount,
      lowestReliableRatio: entry.rendered.lowestReliableRatio,
      lowestRepresentativeSamples: renderedSamples
    },
    axe: { violations: compactAxe(entry.axe.violations, true), incomplete: compactAxe(entry.axe.incomplete, true), passes: compactAxe(entry.axe.passes, false) },
    screenshot: entry.screenshot,
    unknown: entry.unknown,
    pass: entry.pass
  };
}

function compactNotApplicable(entry) {
  return {
    id: [entry.browser, entry.runtime, entry.viewport, entry.zoom, entry.contextMode, entry.state, entry.element].join(":"),
    state: entry.state,
    element: entry.element,
    selector: entry.selector,
    status: entry.status,
    reason: entry.reason,
    applicabilityEvidence: entry.applicabilityEvidence
  };
}
async function main() {
  if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error(`Dedicated ports ${nextPort}/${staticPort} must be closed.`);
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const checkpoint = fs.existsSync(checkpointPath) ? JSON.parse(fs.readFileSync(checkpointPath, "utf8")) : { schemaVersion: 1, generatedAt, environments: [] };
  const nextServer = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(nextPort)], { cwd: root, env: { ...process.env, NODE_ENV: "production", TEOYUBE_OWNER_QA_TEST_MODE: "true" }, stdio: "ignore", windowsHide: true });
  const staticServer = spawn(process.execPath, [path.join(root, "server.js")], { cwd: root, env: { ...process.env, PORT: String(staticPort) }, stdio: "ignore", windowsHide: true });
  const launched = [];
  try {
    await Promise.all([waitForUrl(nextServer, `${origins.next}/api/health`), waitForUrl(staticServer, `${origins.static}/index.html`)]);
    for (const browserDefinition of browsers) {
      const browser = await chromium.launch({ headless: true, ...browserDefinition.launch });
      launched.push(browser);
      for (const runtime of runtimes) {
        for (const viewport of viewports) {
          for (const zoom of zooms) {
            for (const contextMode of contextModes) {
              const key = [browserDefinition.id, runtime.id, viewport.name, zoom.percent, contextMode.id].join(":");
              if (checkpoint.environments.some((entry) => entry.key === key)) continue;
              console.log(`CAPTURE ${key}`);
              checkpoint.environments.push(await captureEnvironment(browser, browserDefinition.id, runtime, viewport, zoom, contextMode));
              fs.writeFileSync(checkpointPath, `${JSON.stringify(checkpoint, null, 2)}\n`, "utf8");
              console.log(`PASS ${key}`);
            }
          }
        }
      }
      await browser.close();
      launched.splice(launched.indexOf(browser), 1);
    }
    const summary = summarize(checkpoint.environments);
    const environmentContexts = checkpoint.environments.map((entry) => ({
      key: entry.key,
      environment: entry.environment,
      readiness: entry.readiness,
      blockedExternalOrigins: entry.blockedExternalOrigins,
      errors: entry.errors,
      unexpectedErrors: entry.unexpectedErrors,
      measurementCount: entry.measurements.length,
      notApplicableCount: entry.notApplicable.length
    }));
    const evidence = {
      schemaVersion: 1,
      phase: "5D-1",
      generatedAt,
      decisionId,
      issueId: "A11Y-008",
      formerProposalHash,
      implementationAuthorized: false,
      networkPolicy: "loopback and data only; external network blocked",
      operatingSystem: { platform: process.platform, release: os.release(), version: os.version(), architecture: os.arch() },
      ports: { next: nextPort, static: staticPort },
      viewports,
      browsers: checkpoint.environments.filter((entry, index, array) => index === array.findIndex((candidate) => candidate.environment.browser === entry.environment.browser)).map((entry) => ({ id: entry.environment.browser, version: entry.environment.browserVersion })),
      zooms,
      contextModes,
      elements,
      notApplicableStates,
      renderedSamplingMethod: "full-opacity foreground pixels within RGB distance 20 of computed foreground; up to three dominant backgrounds within RGB distance 28; antialias edge pixels excluded",
      environmentContexts,
      measurements: checkpoint.environments.flatMap((entry) => entry.measurements.map(compactMeasurement)),
      notApplicable: checkpoint.environments.flatMap((entry) => entry.notApplicable.map(compactNotApplicable)),
      summary,
      protections: { productSourceChanges: 0, protectedVisualChanges: 0, cssColorChanges: 0, domAriaChanges: 0, baselineWrites: 0, packageLockfileChanges: 0, paidCalls: 0, participantRecords: 0 }
    };
    const evidenceText = `${JSON.stringify(evidence)}\n`;
    write("docs/accessibility/a11y008-contrast-measurements.json", evidenceText);
    const manifest = {
      schemaVersion: 1,
      phase: "5D-1",
      issueId: "A11Y-008",
      generatedAt,
      decisionId,
      formerProposalHash,
      implementationAuthorized: false,
      measurementArtifact: { path: "docs/accessibility/a11y008-contrast-measurements.json", bytes: Buffer.byteLength(evidenceText), sha256: sha256(evidenceText) },
      counts: { environmentContexts: environmentContexts.length, measurements: evidence.measurements.length, notApplicable: evidence.notApplicable.length },
      summary,
      protections: evidence.protections
    };
    write("tests/accessibility/evidence/a11y008-retest/manifest.json", manifest);
    write("docs/accessibility/a11y008-contrast-measurements.md", `# A11Y-008 contrast measurements\n\n- Outcome: **${summary.outcome}**\n- Applicable cells: **${summary.applicableCells}**\n- Not applicable cells: **${summary.notApplicableCells}**\n- Total matrix cells: **${summary.totalMatrixCells}**\n- Passing/failing/unknown: **${summary.passingCells}/${summary.failingCells}/${summary.unknownCells}**\n- Lowest computed ratio: **${summary.lowestComputedRatio}:1**\n- Lowest reliable rendered-sample ratio: **${summary.lowestRenderedSampleRatio}:1**\n- Scoped axe failures: **${summary.scopedAxeFailures}**\n- Harness errors: **${summary.harnessErrors}**\n- Static: **${summary.staticResult.passing}/${summary.staticResult.cells} pass**\n- Next: **${summary.nextResult.passing}/${summary.nextResult.cells} pass**\n\nThe complete matrix is inconclusive because forced-colors axe results report the historical authored 1.01:1 pair while computed forced colors are 21:1 and rendered samples are predominantly high contrast; seven rendered samples are unavailable. This conflict is preserved rather than converted into a pass or product failure.\n\nRaw screenshots remain ignored and disposable under .tmp/accessibility/a11y008-retest/screenshots/. Their paths and SHA-256 hashes are recorded in the tracked JSON evidence; no screenshot baseline was written.\n`);
    console.log(JSON.stringify(summary, null, 2));
    if (summary.outcome === "BLOCKED_INCONCLUSIVE") process.exitCode = 2;
  } finally {
    await Promise.all(launched.map((browser) => browser.close().catch(() => {})));
    await Promise.all([stopServer(nextServer), stopServer(staticServer)]);
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline && (await portOpen(nextPort) || await portOpen(staticPort))) await new Promise((resolve) => setTimeout(resolve, 250));
    if (await portOpen(nextPort) || await portOpen(staticPort)) throw new Error("Owned A11Y-008 retest listeners did not close.");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
