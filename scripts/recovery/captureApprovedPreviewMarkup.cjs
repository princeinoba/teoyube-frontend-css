/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const workspaceRoot = path.resolve(__dirname, "../..");
const outputFile = path.join(workspaceRoot, "src/app/_approved-source/approved-view-markup.generated.ts");
const baseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";

const deterministicInitScript = ({ now }) => {
  const fixedNow = new Date(now).valueOf();
  const NativeDate = Date;
  class FixedDate extends NativeDate {
    constructor(...args) {
      super(...(args.length ? args : [fixedNow]));
    }
    static now() {
      return fixedNow;
    }
  }
  Object.defineProperty(window, "Date", { value: FixedDate });
  let randomState = 0x6d2b79f5;
  Math.random = () => {
    randomState = Math.imul(randomState ^ (randomState >>> 15), randomState | 1);
    randomState ^= randomState + Math.imul(randomState ^ (randomState >>> 7), randomState | 61);
    return ((randomState ^ (randomState >>> 14)) >>> 0) / 4294967296;
  };
  window.setInterval = () => 0;
};

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const animation of document.getAnimations()) {
      try { animation.pause(); } catch { /* browser-owned animation */ }
    }
    for (const media of document.querySelectorAll("video, audio")) {
      try { media.pause(); media.currentTime = 0; } catch { /* metadata unavailable */ }
    }
  });
  await page.waitForTimeout(200);
}

async function openView(page, view) {
  await page.goto(`${baseUrl}/index.html#${view}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.setView === "function");
  await page.evaluate((viewId) => {
    window.setView(viewId, { updateHash: false });
    window.scrollTo(0, 0);
  }, view);
  await settle(page);
}

async function innerHtml(page, selector) {
  return page.locator(selector).evaluate((element) => element.innerHTML);
}

async function captureCanon(page) {
  await openView(page, "canon");
  const initial = await innerHtml(page, "#canon");
  const tabs = {};
  const tabIds = await page.locator("#canonTabs [data-canon-tab]").evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("data-canon-tab")).filter(Boolean)
  );
  for (const tabId of tabIds) {
    await page.locator(`#canonTabs [data-canon-tab="${tabId}"]`).click();
    await settle(page);
    tabs[tabId] = await innerHtml(page, "#canon");
  }
  await page.locator('#canonTabs [data-canon-tab="canon-maps"]').click();
  await settle(page);
  const pages = {};
  const pageNumbers = await page.locator("#canonPagination [data-canon-page]").evaluateAll((buttons) =>
    [...new Set(buttons.map((button) => Number(button.getAttribute("data-canon-page"))).filter((value) => Number.isFinite(value)))]
  );
  for (const pageNumber of pageNumbers) {
    const button = page.locator(`#canonPagination [data-canon-page="${pageNumber}"]`).last();
    if (await button.isEnabled()) await button.click();
    await settle(page);
    pages[String(pageNumber)] = await innerHtml(page, "#canon");
  }
  return { initial, tabs, pages };
}

async function captureTable(page) {
  await openView(page, "table");
  return { initial: await innerHtml(page, "#table") };
}

async function captureCalling(page) {
  await openView(page, "calling");
  return { initial: await innerHtml(page, "#calling") };
}

async function captureBook(page) {
  await openView(page, "book");
  return { initial: await innerHtml(page, "#book") };
}

async function captureTestimony(page) {
  await openView(page, "testimony");
  return { initial: await innerHtml(page, "#testimony") };
}

async function captureLexicon(page) {
  await openView(page, "lexicon");
  return { initial: await innerHtml(page, "#lexicon") };
}

async function captureGuide(page) {
  await openView(page, "guide");
  return { initial: await innerHtml(page, "#guide") };
}

async function captureEmbeddedVideos(page) {
  await openView(page, "ui-elements");
  const initial = await innerHtml(page, "#ui-elements");
  const tabs = {};
  const tabIds = await page.locator("#uiVideoCategoryTabs [data-video-category]").evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("data-video-category")).filter(Boolean)
  );
  for (const tabId of tabIds) {
    await page.locator(`#uiVideoCategoryTabs [data-video-category="${tabId}"]`).click();
    await settle(page);
    tabs[tabId] = {
      grid: await innerHtml(page, "#uiVideoGrid"),
      stats: await innerHtml(page, "#uiVideoStats")
    };
  }
  return { initial, tabs };
}

async function captureTables(page) {
  await openView(page, "teoyube-tables");
  const initial = await innerHtml(page, "#teoyube-tables");
  const pages = {};
  const pageNumbers = await page.locator("#teoyubeTablePagination [data-table-page]").evaluateAll((buttons) =>
    [...new Set(buttons.map((button) => Number(button.getAttribute("data-table-page"))).filter((value) => Number.isFinite(value)))]
  );
  for (const pageNumber of pageNumbers) {
    await page.locator(`#teoyubeTablePagination [data-table-page="${pageNumber}"]`).last().click();
    await settle(page);
    pages[String(pageNumber)] = await innerHtml(page, "#teoyube-tables");
  }

  await openView(page, "teoyube-tables");
  const managementTabs = {};
  const managementTabIds = await page.locator("#teoyubeDataTableTabs [data-data-table-tab]").evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("data-data-table-tab")).filter(Boolean)
  );
  for (const tabId of managementTabIds) {
    await page.locator(`#teoyubeDataTableTabs [data-data-table-tab="${tabId}"]`).click();
    await settle(page);
    managementTabs[tabId] = {
      rows: await innerHtml(page, "#teoyubeDataTableRows"),
      pagination: await innerHtml(page, "#teoyubeDataTablePagination"),
      status: await page.locator("#teoyubeDataTableStatus").textContent(),
      videoSourceHidden: await page.locator("#teoyubeDataVideoSourceWrap").getAttribute("hidden") !== null
    };
  }
  return { initial, pages, managementTabs };
}

async function captureRoadmap(page) {
  await page.goto(`${baseUrl}/index.html?qa=1#roadmap`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.setView === "function");
  await page.evaluate(() => {
    window.setView("roadmap", { updateHash: false });
    window.scrollTo(0, 0);
  });
  await settle(page);
  return {
    initial: await innerHtml(page, "#roadmap"),
    qaPanel: await innerHtml(page, "#phase114QaPanel")
  };
}

function approvedSourceDigest() {
  const hash = crypto.createHash("sha256");
  for (const relativePath of ["index.html", "app.js", "phase116b1.js"]) {
    hash.update(relativePath);
    hash.update(fs.readFileSync(path.join(workspaceRoot, relativePath)));
  }
  return hash.digest("hex");
}

async function main() {
  const browser = await chromium.launch(process.platform === "win32" ? { channel: "chrome" } : {});
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
  await context.addInitScript(deterministicInitScript, { now: "2026-07-18T12:00:00.000Z" });
  const page = await context.newPage();
  try {
    const markup = {
      sourceDigest: approvedSourceDigest(),
      capturedAt: "2026-07-18T12:00:00.000Z",
      canon: await captureCanon(page),
      table: await captureTable(page),
      calling: await captureCalling(page),
      book: await captureBook(page),
      testimony: await captureTestimony(page),
      lexicon: await captureLexicon(page),
      guide: await captureGuide(page),
      embeddedVideos: await captureEmbeddedVideos(page),
      tables: await captureTables(page),
      roadmap: await captureRoadmap(page)
    };
    const source = [
      "// Generated only from the protected static runtime. Do not hand-edit or use as a baseline update.",
      `export const APPROVED_VIEW_MARKUP = ${JSON.stringify(markup)} as const;`,
      ""
    ].join("\n");
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, source, "utf8");
    console.log(`Captured approved retained-route markup to ${path.relative(workspaceRoot, outputFile)}.`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
