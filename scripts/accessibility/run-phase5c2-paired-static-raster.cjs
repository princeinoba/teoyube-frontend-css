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
const beforeRoot = path.resolve(process.env.TEOYUBE_PHASE5C2_BEFORE_ROOT || "");
if (!process.env.TEOYUBE_PHASE5C2_BEFORE_ROOT || !fs.existsSync(path.join(beforeRoot, "server.js"))) throw new Error("TEOYUBE_PHASE5C2_BEFORE_ROOT must identify the extracted starting commit.");
const ports = { current: 4187, before: 4188 };
const origins = { current: `http://127.0.0.1:${ports.current}`, before: `http://127.0.0.1:${ports.before}` };
const cases = [
  { key: "canon-desktop-standard", hash: "canon", root: "#canon", viewport: { width: 1280, height: 800 } },
  { key: "lexicon-tablet-landscape", hash: "lexicon", root: "#lexicon", viewport: { width: 1024, height: 768 } }
];
const outputRoot = path.join(root, ".tmp", "accessibility", "phase-5c2", "paired-static-raster");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

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
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Owned server exited before ${url} was ready.`);
    try { if ((await fetch(url, { cache: "no-store" })).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}.`);
}
async function stop(child) {
  if (!child?.pid || child.exitCode !== null) return;
  await new Promise((resolve) => {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    killer.once("exit", resolve);
    killer.once("error", resolve);
  });
}
async function deterministicContext(browser, viewport) {
  const context = await browser.newContext({ viewport, colorScheme: "light", locale: "en-US", reducedMotion: "reduce" });
  await context.addInitScript(() => {
    const fixedNow = 1785945600000;
    const RealDate = Date;
    class FixedDate extends RealDate { constructor(...args) { super(...(args.length ? args : [fixedNow])); } static now() { return fixedNow; } }
    Object.defineProperty(window, "Date", { value: FixedDate });
    Math.random = () => 0.5;
    const install = () => {
      if (document.getElementById("phase5c2-freeze-style")) return;
      const style = document.createElement("style");
      style.id = "phase5c2-freeze-style";
      style.textContent = "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";
      (document.head || document.documentElement).append(style);
    };
    if (document.documentElement) install();
    else new MutationObserver((_records, observer) => { if (document.documentElement) { observer.disconnect(); install(); } }).observe(document, { childList: true, subtree: true });
    Object.defineProperty(window, "setInterval", { value: () => 0 });
    Object.defineProperty(window, "clearInterval", { value: () => {} });
    try { localStorage.clear(); sessionStorage.clear(); } catch {}
  });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname) || url.protocol === "data:") await route.continue();
    else await route.abort("blockedbyclient");
  });
  return context;
}
async function capture(browser, runtime, testCase, round) {
  const context = await deterministicContext(browser, testCase.viewport);
  const page = await context.newPage();
  await page.goto(`${origins[runtime]}/index.html?ownerQa=1#${testCase.hash}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  const routeRoot = page.locator(testCase.root);
  await routeRoot.waitFor({ state: "visible", timeout: 30_000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : Promise.race([new Promise((resolve) => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); }), new Promise((resolve) => setTimeout(resolve, 5000))])));
    const urls = new Set();
    for (const element of document.querySelectorAll("*")) for (const match of getComputedStyle(element).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(match[1]);
    await Promise.all([...urls].map((url) => Promise.race([new Promise((resolve) => { const image = new Image(); image.onload = resolve; image.onerror = resolve; image.src = url; if (image.complete) resolve(); }), new Promise((resolve) => setTimeout(resolve, 5000))])));
  });
  await page.waitForTimeout(200);
  const directory = path.join(outputRoot, `round-${round}`);
  fs.mkdirSync(directory, { recursive: true });
  const target = path.join(directory, `${runtime}-${testCase.key}.png`);
  const bytes = await routeRoot.screenshot({ path: target, animations: "disabled" });
  await context.close();
  return { runtime, key: testCase.key, round, path: path.relative(root, target).replaceAll("\\", "/"), bytes: bytes.length, sha256: sha256(bytes) };
}
async function compare(left, right, label) {
  const a = await sharp(path.join(root, left.path)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(path.join(root, right.path)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let changedPixels = 0;
  if (a.info.width !== b.info.width || a.info.height !== b.info.height || a.info.channels !== b.info.channels) changedPixels = Math.max(a.info.width * a.info.height, b.info.width * b.info.height);
  else for (let offset = 0; offset < a.data.length; offset += a.info.channels) {
    let changed = false;
    for (let channel = 0; channel < a.info.channels; channel += 1) if (a.data[offset + channel] !== b.data[offset + channel]) changed = true;
    if (changed) changedPixels += 1;
  }
  return { label, left: left.path, right: right.path, changedPixels };
}

async function main() {
  if (await portOpen(ports.current) || await portOpen(ports.before)) throw new Error("Dedicated paired-static ports must be closed.");
  fs.rmSync(outputRoot, { recursive: true, force: true });
  const servers = {
    current: spawn(process.execPath, [path.join(root, "server.js")], { cwd: root, env: { ...process.env, PORT: String(ports.current) }, stdio: "ignore", windowsHide: true }),
    before: spawn(process.execPath, [path.join(beforeRoot, "server.js")], { cwd: beforeRoot, env: { ...process.env, PORT: String(ports.before) }, stdio: "ignore", windowsHide: true })
  };
  let browser;
  try {
    await Promise.all([waitForUrl(servers.current, `${origins.current}/index.html`), waitForUrl(servers.before, `${origins.before}/index.html`)]);
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const captures = [];
    for (const round of [1, 2, 3]) for (const testCase of cases) {
      const order = round === 1 ? ["before", "current"] : ["current", "before"];
      for (const runtime of order) captures.push(await capture(browser, runtime, testCase, round));
    }
    const comparisons = [];
    for (const testCase of cases) {
      const get = (runtime, round) => captures.find((item) => item.runtime === runtime && item.round === round && item.key === testCase.key);
      comparisons.push(await compare(get("before", 1), get("current", 1), `${testCase.key}: cross-version round 1`));
      comparisons.push(await compare(get("before", 2), get("current", 2), `${testCase.key}: cross-version round 2`));
      comparisons.push(await compare(get("before", 1), get("before", 2), `${testCase.key}: before repeat`));
      comparisons.push(await compare(get("current", 1), get("current", 2), `${testCase.key}: current repeat`));
    }
    const stableCaptures = [];
    for (const testCase of cases) for (const runtime of ["before", "current"]) {
      const candidates = captures.filter((item) => item.runtime === runtime && item.key === testCase.key).sort((left, right) => left.round - right.round);
      let stable = null;
      for (let index = 1; index < candidates.length; index += 1) if (candidates[index - 1].sha256 === candidates[index].sha256) { stable = { runtime, key: testCase.key, rounds: [candidates[index - 1].round, candidates[index].round], capture: candidates[index] }; break; }
      stableCaptures.push(stable);
    }
    const stableComparisons = [];
    for (const testCase of cases) {
      const beforeStable = stableCaptures.find((item) => item?.runtime === "before" && item.key === testCase.key);
      const currentStable = stableCaptures.find((item) => item?.runtime === "current" && item.key === testCase.key);
      if (beforeStable && currentStable) stableComparisons.push(await compare(beforeStable.capture, currentStable.capture, `${testCase.key}: stable cross-version`));
    }
    const stable = stableCaptures.every(Boolean) && stableComparisons.length === cases.length && stableComparisons.every((item) => item.changedPixels === 0);
    const report = { schemaVersion: 1, phase: "5C-2", ownerDecisionId: "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001", startingCommit: "621aac4d70858c823e44b1f5df6f43688c68f451", generatedAt: new Date().toISOString(), cases, captures, comparisons, changedPixelCount: comparisons.reduce((sum, item) => sum + item.changedPixels, 0), stableCaptures, stableComparisons, stableCrossVersionChangedPixelCount: stableComparisons.reduce((sum, item) => sum + item.changedPixels, 0), status: stable ? "PASS_STABLE_ZERO_PIXELS" : "FAIL" };
    const reportPath = path.join(root, "tests/accessibility/evidence/phase-5c2/after/paired-static-raster.json");
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== "PASS_STABLE_ZERO_PIXELS") process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await Promise.all(Object.values(servers).map(stop));
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline && (await portOpen(ports.current) || await portOpen(ports.before))) await new Promise((resolve) => setTimeout(resolve, 250));
    if (await portOpen(ports.current) || await portOpen(ports.before)) throw new Error("Owned paired-static listeners did not close.");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
