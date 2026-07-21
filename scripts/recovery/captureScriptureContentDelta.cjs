/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const sharp = require("sharp");

const root = path.resolve(__dirname, "../..");
const decisionId = "TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B";
if (!process.argv.includes(`--owner-decision=${decisionId}`)) throw new Error(`Capture requires --owner-decision=${decisionId}.`);
const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL;
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL;
const onlyViewport = process.argv.find((value) => value.startsWith("--only-viewport="))?.split("=")[1];
const onlyScenario = process.argv.find((value) => value.startsWith("--only-scenario="))?.split("=")[1];
if (!staticBaseUrl || !nextBaseUrl) throw new Error("TEOYUBE_STATIC_BASE_URL and TEOYUBE_NEXT_BASE_URL are required.");

const baselineManifest = JSON.parse(fs.readFileSync(path.join(root, "tests/visual/baselines/static-runtime/manifest.json"), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "docs/scripture/legacy-quotation-owner-review.json"), "utf8"));
const outputRoot = path.join(root, "tests/visual/baselines/owner-approved-scripture-content-delta");
const scenarios = [
  { id: "today", staticView: "today", nextPath: "/", selectors: [".daily-inspiration-card blockquote"], recordIds: ["UI-TODAY-001"] },
  { id: "canon", staticView: "canon", nextPath: "/canon", selectors: [".canon-profile-widget blockquote"], recordIds: ["UI-CANON-001"] },
  { id: "calling", staticView: "calling", nextPath: "/calling-compass", selectors: [".calling-daily-inspiration p"], recordIds: ["UI-CALLING-001"] },
  { id: "book", staticView: "book", nextPath: "/book", selectors: [".book-encouragement-card p", ".book-journey-scripture p", ".book-lantern-card h4"], recordIds: ["UI-BOOK-001", "UI-BOOK-002", "UI-BOOK-003"] },
  { id: "lexicon", staticView: "lexicon", nextPath: "/lexicon", selectors: [".lexicon-inspiration-card p:not(.eyebrow)", ".lexicon-scripture-art p"], recordIds: ["UI-LEXICON-001", "UI-LEXICON-002"] },
  { id: "guide", staticView: "guide", nextPath: "/teo-guide", selectors: [".guide-wisdom-banner p"], recordIds: ["UI-GUIDE-001"] },
  { id: "table", staticView: "table", nextPath: "/promise-table", selectors: [".promise-search-item p"], recordIds: ["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003"] },
  { id: "teoyube-tables", staticView: "teoyube-tables", nextPath: "/tables", selectors: [".table-detail-copy p"], recordIds: ["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003"] }
];
const fallbackScenarios = [
  { id: "table-local-fallback", staticView: "table", selectors: [".promise-search-item p"], recordIds: ["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003", "UI-PROMISE-004", "UI-PROMISE-005", "UI-PROMISE-006", "UI-PROMISE-007", "UI-PROMISE-008"] },
  { id: "tables-local-fallback-expanded", staticView: "teoyube-tables", selectors: [".table-detail-copy p"], recordIds: ["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003", "UI-PROMISE-004", "UI-PROMISE-005", "UI-PROMISE-006", "UI-PROMISE-007", "UI-PROMISE-008"] }
];

function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function artifact(relativePath, kind, metadata) {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  return { kind, path: relativePath.replaceAll("\\", "/"), bytes: bytes.length, sha256: sha256(bytes), ...metadata };
}

const initScript = ({ now }) => {
  const fixedNow = new Date(now).valueOf();
  const NativeDate = Date;
  class FixedDate extends NativeDate { constructor(...args) { super(...(args.length ? args : [fixedNow])); } static now() { return fixedNow; } }
  Object.defineProperty(window, "Date", { value: FixedDate });
  let state = 0x6d2b79f5;
  Math.random = () => { state = Math.imul(state ^ (state >>> 15), state | 1); state ^= state + Math.imul(state ^ (state >>> 7), state | 61); return ((state ^ (state >>> 14)) >>> 0) / 4294967296; };
  window.setInterval = () => 0;
};

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const requestedImages = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return Boolean(image.currentSrc) && rect.width > 0 && rect.height > 0;
    });
    await Promise.race([
      Promise.all(requestedImages.map((image) => image.complete ? Promise.resolve() : image.decode().catch(() => undefined))),
      new Promise((resolve) => window.setTimeout(resolve, 1_500))
    ]);
    for (const animation of document.getAnimations()) { try { animation.pause(); } catch { /* browser-owned */ } }
    for (const media of document.querySelectorAll("video,audio")) { try { media.pause(); media.currentTime = 0; } catch { /* metadata unavailable */ } }
    window.scrollTo(0, 0);
  });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  await page.waitForTimeout(250);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(50);
}

async function openStatic(page, view) {
  await page.goto(staticBaseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.setView === "function");
  await page.waitForTimeout(2_500);
  await page.evaluate((viewId) => window.setView(viewId, { updateHash: false }), view);
  await page.waitForTimeout(450);
  if (view === "today") {
    await page.evaluate(() => {
      for (const selector of ["#phase116bTodayCommandCenter", "#phase116b1Continuation-today", "#phase115SmartRecommendations-today"]) {
        document.querySelector(selector)?.remove();
      }
    });
  }
  await settle(page);
}

async function openNext(page, nextPath) {
  await page.goto(`${nextBaseUrl}${nextPath}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("main, .main-content, [data-approved-view]", { state: "attached" });
  await page.waitForTimeout(200);
  await settle(page);
}

async function installDeterminism(context, allowedOrigin) {
  await context.addInitScript(initScript, { now: "2026-07-18T12:00:00.000Z" });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["data:", "blob:", "about:"].includes(url.protocol) || url.origin === allowedOrigin) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });
}

async function textSafety(page, selectors, recordIds) {
  const records = inventory.visibleProductRecords.filter((record) => recordIds.includes(record.id));
  const expectedTexts = records.map((record) => record.exactWebText);
  const matchedTexts = new Set();
  const bodyOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  const source = await page.locator("body").innerText();
  for (const record of records) if (!source.replace(/\s+/g, " ").includes(record.exactWebText)) throw new Error(`${record.id}: exact WEB wording is not rendered.`);
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    if (!count) throw new Error(`${selector}: approved quotation selector is missing.`);
    for (let index = 0; index < count; index += 1) {
      const result = await page.locator(selector).nth(index).evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          text: element.innerText?.trim() || element.textContent?.trim() || "",
          clipped: (style.overflowY === "hidden" || style.overflowY === "clip") && element.scrollHeight > element.clientHeight + 1,
          ellipsis: style.textOverflow === "ellipsis",
          horizontal: element.scrollWidth > element.clientWidth + 1 && !["auto", "scroll"].includes(style.overflowX),
          invalidRect: rect.width <= 0 || rect.height <= 0
        };
      });
      const normalizedText = result.text.replace(/\s+/g, " ");
      const matches = expectedTexts.filter((text) => normalizedText.includes(text));
      if (!matches.length) continue;
      matches.forEach((text) => matchedTexts.add(text));
      if (result.clipped || result.ellipsis || result.horizontal || result.invalidRect) throw new Error(`${selector}[${index}]: Scripture text is clipped, truncated, overflowed, or collapsed: ${JSON.stringify(result)}.`);
    }
  }
  if (matchedTexts.size !== records.length) {
    const missing = records.filter((record) => !matchedTexts.has(record.exactWebText)).map((record) => record.id);
    throw new Error(`${page.url()}: only ${matchedTexts.size} of ${records.length} exact WEB records were found inside ${selectors.join(", ")}; missing ${missing.join(", ")}.`);
  }
  return {
    pageHorizontalOverflowObserved: bodyOverflow.scrollWidth > bodyOverflow.clientWidth + 1,
    pageScrollWidth: bodyOverflow.scrollWidth,
    pageClientWidth: bodyOverflow.clientWidth,
    quotationHorizontalOverflow: false,
    selectorsVerified: selectors.length,
    recordsVerified: records.length,
    matchedRecords: matchedTexts.size
  };
}

async function pixelDifference(leftPath, rightPath) {
  const left = await sharp(leftPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const right = await sharp(rightPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (left.info.width !== right.info.width || left.info.height !== right.info.height || left.info.channels !== right.info.channels) return { ratio: 1, mismatchedPixels: left.info.width * left.info.height };
  let mismatchedPixels = 0;
  let maxChannelDelta = 0;
  for (let offset = 0; offset < left.data.length; offset += left.info.channels) {
    let delta = 0;
    for (let channel = 0; channel < left.info.channels; channel += 1) delta = Math.max(delta, Math.abs(left.data[offset + channel] - right.data[offset + channel]));
    maxChannelDelta = Math.max(maxChannelDelta, delta);
    if (delta > 16) mismatchedPixels += 1;
  }
  const ratio = mismatchedPixels / (left.info.width * left.info.height);
  return { channelDelta: 16, strictRatio: 0.005, ratio, mismatchedPixels, maxChannelDelta, strictPassed: ratio <= 0.005 };
}

async function captureAgreementContract(page, view, selectors) {
  return page.evaluate(({ viewId, quotationSelectors }) => {
    const root = document.getElementById(viewId);
    if (!root) throw new Error(`Missing agreement root #${viewId}.`);
    const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
    const round = (value) => Math.round(value * 100) / 100;
    const rect = (element) => {
      const value = element.getBoundingClientRect();
      return { x: round(value.x), y: round(value.y), width: round(value.width), height: round(value.height) };
    };
    const normalizeUrl = (value) => value.replace(/url\(["']?([^"')]+)["']?\)/g, (_match, raw) => {
      try { const url = new URL(raw, location.href); return `url(${url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : url.href})`; }
      catch { return `url(${raw})`; }
    });
    const elements = [root, ...root.querySelectorAll("*")];
    const index = new Map(elements.map((element, elementIndex) => [element, elementIndex]));
    const structure = elements.map((element) => ({
      tag: element.tagName.toLowerCase(),
      id: element.id || "",
      classes: [...element.classList],
      parent: index.get(element.parentElement) ?? -1
    }));
    const assets = elements.flatMap((element, elementIndex) => {
      const style = getComputedStyle(element);
      const attributes = ["src", "srcset", "poster", "href", "xlink:href"]
        .map((name) => [name, element.getAttribute(name) || ""])
        .filter(([, value]) => value && /\.(png|jpe?g|webp|gif|svg|mp4|webm|mov|ico)(\?|#|$)/i.test(value));
      const backgroundImage = normalizeUrl(style.backgroundImage || "");
      return attributes.length || (backgroundImage && backgroundImage !== "none") ? [{ elementIndex, attributes, backgroundImage }] : [];
    });
    const quotationRegions = quotationSelectors.flatMap((selector) => [...root.querySelectorAll(selector)].map((element) => {
      const style = getComputedStyle(element);
      return {
        selector,
        elementIndex: index.get(element),
        tag: element.tagName.toLowerCase(),
        id: element.id || "",
        classes: [...element.classList],
        text: normalize(element.innerText || element.textContent),
        geometry: rect(element),
        presentation: {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          overflow: style.overflow,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          textOverflow: style.textOverflow,
          whiteSpace: style.whiteSpace
        }
      };
    }));
    const controlSelector = "a[href],button,input,select,textarea,summary,video[controls],audio[controls],[tabindex],[role=button],[role=tab],[role=link]";
    const visibleControls = elements.filter((element) => {
      if (!element.matches(controlSelector)) return false;
      const value = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && value.width > 0 && value.height > 0 && value.bottom > 0 && value.right > 0 && value.top < innerHeight && value.left < innerWidth;
    }).map((element) => ({
      elementIndex: index.get(element),
      tag: element.tagName.toLowerCase(),
      id: element.id || "",
      classes: [...element.classList],
      type: element.getAttribute("type") || "",
      name: element.getAttribute("aria-label") || normalize(element.textContent).slice(0, 160),
      geometry: rect(element)
    }));
    return { structure, assets, quotationRegions, visibleControls };
  }, { viewId: view, quotationSelectors: selectors });
}

function agreementFailures(staticContract, nextContract) {
  const failures = [];
  for (const key of ["structure", "assets"]) {
    if (JSON.stringify(staticContract[key]) !== JSON.stringify(nextContract[key])) failures.push(`${key} differs.`);
  }
  for (const key of ["quotationRegions", "visibleControls"]) {
    if (staticContract[key].length !== nextContract[key].length) { failures.push(`${key} count differs.`); continue; }
    for (let index = 0; index < staticContract[key].length; index += 1) {
      const left = staticContract[key][index];
      const right = nextContract[key][index];
      const leftGeometry = left.geometry;
      const rightGeometry = right.geometry;
      if (JSON.stringify({ ...left, geometry: undefined }) !== JSON.stringify({ ...right, geometry: undefined })) failures.push(`${key}[${index}] signature differs.`);
      for (const dimension of ["x", "y", "width", "height"]) if (Math.abs(leftGeometry[dimension] - rightGeometry[dimension]) > 0.75) failures.push(`${key}[${index}].${dimension} differs by more than 0.75px.`);
    }
  }
  return failures;
}

async function composeEvidence(beforePath, staticPath, nextPath, sidePath, overlayPath) {
  const before = await sharp(beforePath).png().toBuffer({ resolveWithObject: true });
  const staticImage = await sharp(staticPath).resize(before.info.width, before.info.height).png().toBuffer();
  const nextImage = await sharp(nextPath).resize(before.info.width, before.info.height).png().toBuffer();
  await sharp({ create: { width: before.info.width * 3, height: before.info.height, channels: 4, background: "white" } })
    .composite([{ input: before.data, left: 0, top: 0 }, { input: staticImage, left: before.info.width, top: 0 }, { input: nextImage, left: before.info.width * 2, top: 0 }]).png().toFile(sidePath);
  await sharp(before.data).composite([{ input: staticImage, blend: "over", opacity: 0.5 }]).png().toFile(overlayPath);
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  const browser = await chromium.launch(process.platform === "win32" ? { channel: "chrome" } : {});
  const artifacts = [];
  const results = [];
  try {
    for (const [viewportId, viewport] of Object.entries(baselineManifest.viewports)) {
      if (onlyViewport && viewportId !== onlyViewport) continue;
      const staticContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
      const nextContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
      await installDeterminism(staticContext, new URL(staticBaseUrl).origin);
      await installDeterminism(nextContext, new URL(nextBaseUrl).origin);
      for (const scenario of scenarios) {
        if (onlyScenario && scenario.id !== onlyScenario) continue;
        const directory = path.join(outputRoot, viewportId);
        fs.mkdirSync(directory, { recursive: true });
        const staticPath = path.join(directory, `${scenario.id}.static.png`);
        const nextPath = path.join(directory, `${scenario.id}.next.png`);
        const sidePath = path.join(directory, `${scenario.id}.side-by-side.png`);
        const overlayPath = path.join(directory, `${scenario.id}.overlay.png`);
        const staticContractPath = path.join(directory, `${scenario.id}.static.contract.json`);
        const nextContractPath = path.join(directory, `${scenario.id}.next.contract.json`);
        const staticPage = await staticContext.newPage();
        await openStatic(staticPage, scenario.staticView);
        const staticSafety = await textSafety(staticPage, scenario.selectors, scenario.recordIds);
        const staticContract = await captureAgreementContract(staticPage, scenario.staticView, scenario.selectors);
        await staticPage.screenshot({ path: staticPath });
        await staticPage.close();
        const nextPage = await nextContext.newPage();
        await openNext(nextPage, scenario.nextPath);
        const nextSafety = await textSafety(nextPage, scenario.selectors, scenario.recordIds);
        const nextContract = await captureAgreementContract(nextPage, scenario.staticView, scenario.selectors);
        await nextPage.screenshot({ path: nextPath });
        await nextPage.close();
        fs.writeFileSync(staticContractPath, `${JSON.stringify(staticContract, null, 2)}\n`, "utf8");
        fs.writeFileSync(nextContractPath, `${JSON.stringify(nextContract, null, 2)}\n`, "utf8");
        const agreement = agreementFailures(staticContract, nextContract);
        if (agreement.length) throw new Error(`${viewportId}/${scenario.id}: static/Next agreement failed:\n${agreement.join("\n")}`);
        const beforeRecord = baselineManifest.artifacts.find((item) => item.kind === "screenshot" && item.viewport === viewportId && item.view === scenario.staticView);
        if (!beforeRecord) throw new Error(`${viewportId}/${scenario.id}: immutable before screenshot is missing.`);
        const beforePath = path.join(root, beforeRecord.path);
        await composeEvidence(beforePath, staticPath, nextPath, sidePath, overlayPath);
        const difference = await pixelDifference(staticPath, nextPath);
        const metadata = { viewport: viewportId, scenario: scenario.id, recordIds: scenario.recordIds, decisionId };
        for (const [filePath, kind] of [[staticPath, "static-after"], [nextPath, "next-after"], [sidePath, "before-static-next-side-by-side"], [overlayPath, "before-static-overlay"], [staticContractPath, "static-agreement-contract"], [nextContractPath, "next-agreement-contract"]]) artifacts.push(artifact(path.relative(root, filePath), kind, metadata));
        results.push({ viewport: viewportId, scenario: scenario.id, recordIds: scenario.recordIds, immutableBefore: beforeRecord, staticNextPixelDifference: difference, staticSafety, nextSafety, staticNextAgreement: { passed: true, failures: [], structureElements: staticContract.structure.length, assets: staticContract.assets.length, quotationRegions: staticContract.quotationRegions.length, visibleControls: staticContract.visibleControls.length }, structurePolicy: "exact production tag/ID/class/parent structure and asset agreement; exact quotation text/presentation and <=0.75px quotation/control geometry agreement; framework-only attributes excluded" });
      }
      for (const scenario of fallbackScenarios) {
        if (onlyScenario && scenario.id !== onlyScenario) continue;
        const page = await staticContext.newPage();
        await page.route("**/api/promises/seed", (route) => route.abort("failed"));
        await openStatic(page, scenario.staticView);
        if (scenario.id === "tables-local-fallback-expanded") {
          const collapsed = page.locator(".table-expand-button[aria-expanded='false']");
          while (await collapsed.count()) await collapsed.first().click();
          await settle(page);
        }
        const safety = await textSafety(page, scenario.selectors, scenario.recordIds);
        const filePath = path.join(outputRoot, viewportId, `${scenario.id}.static.png`);
        await page.screenshot({ path: filePath });
        await page.close();
        artifacts.push(artifact(path.relative(root, filePath), "static-local-fallback", { viewport: viewportId, scenario: scenario.id, recordIds: scenario.recordIds, decisionId }));
        results.push({ viewport: viewportId, scenario: scenario.id, recordIds: scenario.recordIds, staticSafety: safety, nextStatus: "NOT_APPLICABLE_RECORDS_004_TO_008_HAVE_NO_NEXT_ROUTE" });
      }
      await staticContext.close();
      await nextContext.close();
    }
  } finally {
    await browser.close();
  }
  if (onlyViewport || onlyScenario) {
    console.log(`SCRIPTURE CONTENT-DELTA DIAGNOSTIC CAPTURE: PASSED (${artifacts.length} artifacts, ${results.length} states).`);
    return;
  }
  const manifest = {
    schemaVersion: 1,
    decisionId,
    evidenceCommit: "4da2adfaa784039c5250a894fdcbd4c4aea64e82",
    inventorySha256: "f6108e8617786464888dcbabb3f48899ed5a113d4d3851af947ced776d91d68c",
    historicalBaselineManifestSha256: sha256(fs.readFileSync(path.join(root, "tests/visual/baselines/static-runtime/manifest.json"))),
    viewports: baselineManifest.viewports,
    scenarios: scenarios.map(({ id, staticView, nextPath, recordIds }) => ({ id, staticView, nextPath, recordIds })),
    fallbackScenarios,
    captureEnvironment: { browser: "system Chrome via Playwright", deviceScaleFactor: 1, locale: "en-US", colorScheme: "light", fixedTime: "2026-07-18T12:00:00.000Z", animationsFrozenInHarnessOnly: true, externalNetworkBlocked: true, staticWarmupMs: 2500 },
    staticNextAgreementPolicy: { exactStructureAndAssets: true, exactQuotationTextAndPresentation: true, quotationAndVisibleControlGeometryTolerancePx: 0.75, rasterEvidenceChannelDelta: 16, rasterEvidenceStrictRatio: 0.005, rasterEvidenceIsRecordedForOwnerReview: true },
    immutableBaselinesOverwritten: 0,
    cssChangesAuthorized: 0,
    domClassChangesAuthorized: 0,
    assetChangesAuthorized: 0,
    artifacts,
    results
  };
  fs.writeFileSync(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`SCRIPTURE CONTENT-DELTA CAPTURE: PASSED (${artifacts.length} new artifacts, ${results.length} route/viewport states).`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
