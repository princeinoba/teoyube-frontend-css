const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "../..");
const outputDir = path.join(root, ".tmp", "accessibility", "phase-5a");
const outputFile = path.join(outputDir, "current-audit.json");
const port = Number(process.env.TEOYUBE_A11Y_PORT || 3185);
const baseURL = `http://127.0.0.1:${port}`;
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const nextCli = require.resolve("next/dist/bin/next");

const routes = [
  "/", "/search", "/canon", "/promise-table", "/calling-compass", "/book",
  "/lexicon", "/testimony", "/teo-guide", "/embedded-videos", "/tables",
  "/prayer", "/journey", "/journal", "/settings", "/privacy", "/consent",
  "/terms", "/profile", "/personalization", "/daily-word", "/explore",
  "/promise-search"
];

const viewports = [
  { name: "desktop-wide", width: 1440, height: 900 },
  { name: "desktop-standard", width: 1280, height: 800 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-small", width: 360, height: 800 }
];

const stateCases = [
  { route: "/", state: "carousel-next", action: async (page) => click(page, "#carouselNext") },
  { route: "/", state: "guardrails-dialog", action: async (page) => click(page, "#privacyBtn") },
  { route: "/search", state: "query-calling", action: async (page) => fillPress(page, "#teoyubeSearchInput", "calling") },
  { route: "/canon", state: "alternate-tab", action: async (page) => click(page, "#canonTabs .canon-tab:not(.active)") },
  { route: "/canon", state: "media-control-focus", action: async (page) => clickFirst(page, "[data-canon-video-stage]") },
  { route: "/promise-table", state: "video-selected", action: async (page) => clickFirst(page, "[data-promise-table-video-id], .promise-table-watch-button, button:has-text('Watch Video')") },
  { route: "/calling-compass", state: "compass-started", action: async (page) => clickFirst(page, "#callingCompassStart, button:has-text('Start Compass')") },
  { route: "/book", state: "memory-search", action: async (page) => fillFirst(page, "#bookSearchInput", "promise") },
  { route: "/lexicon", state: "category-filter", action: async (page) => selectSecond(page, "#lexiconCategoryFilter") },
  { route: "/testimony", state: "drafts-tab", action: async (page) => clickFirst(page, "button:has-text('Drafts')") },
  { route: "/teo-guide", state: "deterministic-prompt-draft", action: async (page) => fillFirst(page, "#chatInput", "A synthetic question about a promise") },
  { route: "/embedded-videos", state: "teachings-tab", action: async (page) => clickFirst(page, "button:has-text('Teachings')") },
  { route: "/embedded-videos", state: "worship-tab", action: async (page) => clickFirst(page, "button:has-text('Worship')") },
  { route: "/embedded-videos", state: "messages-tab", action: async (page) => clickFirst(page, "button:has-text('Messages')") },
  { route: "/embedded-videos", state: "documentaries-tab", action: async (page) => clickFirst(page, "button:has-text('Documentaries')") },
  { route: "/embedded-videos", state: "shorts-tab", action: async (page) => clickFirst(page, "button:has-text('Shorts')") },
  { route: "/embedded-videos", state: "teoyubeworld-media-tab", action: async (page) => clickFirst(page, "button:has-text('TeoyubeWorld Media')") },
  { route: "/tables", state: "expanded-row", action: async (page) => clickFirst(page, "[data-table-expand], #teoyubeTableBody button, #teoyubeTablesRows button") },
  { route: "/prayer", state: "synthetic-input", action: async (page) => fillFirst(page, "textarea, input[type='text']", "A synthetic prayer request for wisdom") },
  { route: "/journey", state: "journey-primary-action", action: async (page) => clickFirst(page, "main button") },
  { route: "/journal", state: "synthetic-reflection-draft", action: async (page) => fillFirst(page, "textarea, input[type='text']", "Synthetic accessibility audit reflection") },
  { route: "/settings", state: "personalization-disabled", action: async (page) => clickByRole(page, "Disable") },
  { route: "/personalization", state: "wisdom-signal", action: async (page) => clickByRole(page, "Add Wisdom Signal") },
  { route: "/daily-word", state: "generated-session", action: async (page) => clickByRole(page, "Generate Today's Journey") },
  { route: "/explore", state: "clusters-tab", action: async (page) => clickByRole(page, "Clusters") },
  { route: "/explore", state: "promise-table-tab", action: async (page) => clickByRole(page, "Promise Table") },
  { route: "/explore", state: "filtered-wisdom", action: async (page) => fillFirst(page, ".search-filter input", "wisdom") },
  { route: "/promise-search", state: "query-wisdom", action: async (page) => fillFirst(page, "input", "wisdom") },
  { route: "/promise-search", state: "keyboard-query", action: async (page) => fillPress(page, "input", "calling") }
];

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function waitForHealth(child) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Next exited early (${child.exitCode}).`);
    try {
      const response = await fetch(`${baseURL}/api/health`, { cache: "no-store" });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for Next health.");
}

async function stopServer(child) {
  if (!child.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    await waitForExit(killer);
    return;
  }
  child.kill("SIGTERM");
  await Promise.race([waitForExit(child), new Promise((resolve) => setTimeout(resolve, 2000))]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

async function goto(page, route) {
  await page.route("**/*", async (requestRoute) => {
    const url = new URL(requestRoute.request().url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.protocol === "data:") {
      await requestRoute.continue();
    } else {
      await requestRoute.abort("blockedbyclient");
    }
  });
  await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function click(page, selector) {
  await page.locator(selector).first().click({ timeout: 8_000 });
}
async function clickFirst(page, selector) {
  const locator = page.locator(selector).filter({ visible: true }).first();
  await locator.click({ timeout: 8_000 });
}
async function fillFirst(page, selector, value) {
  const locator = page.locator(selector).filter({ visible: true }).first();
  await locator.fill(value, { timeout: 8_000 });
}
async function fillPress(page, selector, value) {
  const locator = page.locator(selector).filter({ visible: true }).first();
  await locator.fill(value, { timeout: 8_000 });
  await locator.press("Enter");
}
async function selectSecond(page, selector) {
  await page.locator(selector).first().selectOption({ index: 1 });
}
async function clickByRole(page, name) {
  await page.getByRole("button", { name, exact: true }).first().click({ timeout: 8_000 });
}

async function scan(page, { route, viewport, state = "default", mode = "default", keyboard = false }) {
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      resultTypes: ["violations", "incomplete"]
    });
    const compact = (item) => ({
      id: item.id,
      impact: item.impact,
      tags: item.tags,
      help: item.help,
      nodes: item.nodes.slice(0, 12).map((node) => ({ target: node.target, failureSummary: node.failureSummary }))
    });
    return { violations: result.violations.map(compact), incomplete: result.incomplete.map(compact) };
  });

  const dom = await page.evaluate(() => {
    const focusSelector = "a[href],area[href],button,input:not([type=hidden]),select,textarea,iframe,[tabindex],[contenteditable=true],[role=button],[role=link],[role=tab],[role=option]";
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const label = (element) => {
      const labels = element.labels ? [...element.labels].map((item) => item.textContent || "").join(" ") : "";
      return String(element.getAttribute("aria-label") || element.getAttribute("aria-labelledby") || labels || element.getAttribute("title") || element.getAttribute("alt") || element.getAttribute("placeholder") || element.textContent || "").replace(/\s+/g, " ").trim();
    };
    const pathFor = (element) => {
      if (element.id) return `${element.tagName.toLowerCase()}#${element.id}`;
      const cls = [...element.classList].slice(0, 3).join(".");
      return `${element.tagName.toLowerCase()}${cls ? `.${cls}` : ""}`;
    };
    const elements = [...document.querySelectorAll("*")];
    const focusables = elements.filter((element) => element.matches(focusSelector) && element.tabIndex >= 0 && !element.hasAttribute("disabled") && isVisible(element));
    const hiddenFocusable = elements.filter((element) => element.matches(focusSelector) && element.tabIndex >= 0 && element.closest('[aria-hidden="true"]')).map(pathFor);
    const missingNames = focusables.filter((element) => !label(element)).map(pathFor);
    const positiveTabindex = focusables.filter((element) => element.tabIndex > 0).map(pathFor);
    const ids = elements.map((element) => element.id).filter(Boolean);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const undersizedTargets = focusables.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width < 24 || rect.height < 24;
    }).map((element) => {
      const rect = element.getBoundingClientRect();
      return { path: pathFor(element), width: Math.round(rect.width * 10) / 10, height: Math.round(rect.height * 10) / 10, label: label(element).slice(0, 120) };
    });
    const bodyRect = document.documentElement.getBoundingClientRect();
    return {
      title: document.title,
      lang: document.documentElement.lang,
      landmarks: elements.filter((element) => ["MAIN", "NAV", "HEADER", "FOOTER", "ASIDE"].includes(element.tagName) || element.hasAttribute("role")).map(pathFor).slice(0, 120),
      headings: elements.filter((element) => /^H[1-6]$/.test(element.tagName) && isVisible(element)).map((element) => ({ level: Number(element.tagName.slice(1)), text: label(element).slice(0, 160) })),
      focusableCount: focusables.length,
      hiddenFocusable: [...new Set(hiddenFocusable)],
      missingNames: [...new Set(missingNames)],
      positiveTabindex: [...new Set(positiveTabindex)],
      duplicateIds,
      undersizedTargets: undersizedTargets.slice(0, 80),
      horizontalOverflowPx: Math.max(0, Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth)),
      documentWidth: Math.round(bodyRect.width),
      liveRegions: elements.filter((element) => element.matches("[aria-live],[role=status],[role=alert]")).map((element) => ({ path: pathFor(element), live: element.getAttribute("aria-live"), role: element.getAttribute("role"), text: label(element).slice(0, 160) })).slice(0, 80)
    };
  });

  let keyboardResult = null;
  if (keyboard) {
    keyboardResult = await auditKeyboard(page);
  }
  return { route, viewport, state, mode, axe, dom, keyboard: keyboardResult };
}

async function auditKeyboard(page) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  const sequence = [];
  const seen = new Set();
  for (let index = 0; index < 80; index += 1) {
    await page.keyboard.press("Tab");
    const item = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement) || element === document.body) return { body: true };
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const name = String(element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent || element.getAttribute("placeholder") || "").replace(/\s+/g, " ").trim().slice(0, 120);
      const centerX = Math.max(0, Math.min(innerWidth - 1, rect.left + Math.min(rect.width / 2, 4)));
      const centerY = Math.max(0, Math.min(innerHeight - 1, rect.top + Math.min(rect.height / 2, 4)));
      const top = document.elementFromPoint(centerX, centerY);
      return {
        body: false,
        path: element.id ? `${element.tagName.toLowerCase()}#${element.id}` : `${element.tagName.toLowerCase()}.${[...element.classList].slice(0, 3).join(".")}`,
        name,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
        focusIndicator: style.outlineStyle !== "none" || style.boxShadow !== "none" || style.borderColor !== "rgba(0, 0, 0, 0)",
        centerObscured: Boolean(top && top !== element && !element.contains(top) && !top.contains(element))
      };
    });
    if (item.body) break;
    const key = `${item.path}|${item.name}`;
    sequence.push(item);
    if (seen.has(key) && sequence.length > 1) break;
    seen.add(key);
  }
  return {
    count: sequence.length,
    missingVisibleIndicator: sequence.filter((item) => !item.focusIndicator).map((item) => item.path),
    obscured: sequence.filter((item) => item.centerObscured).map((item) => item.path),
    sequence
  };
}

async function scanDefaultCells(browser, report) {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, colorScheme: "light", locale: "en-US", reducedMotion: "no-preference" });
    for (const route of routes) {
      const page = await context.newPage();
      try {
        await goto(page, route);
        report.defaultCells.push(await scan(page, { route, viewport: viewport.name, keyboard: viewport.name === "desktop-wide" }));
        if (viewport.name === "desktop-standard") {
          await page.addStyleTag({ content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}" });
          report.modeCells.push(await scan(page, { route, viewport: viewport.name, mode: "wcag-text-spacing" }));
          await page.emulateMedia({ reducedMotion: "reduce" });
          report.modeCells.push(await scan(page, { route, viewport: viewport.name, mode: "reduced-motion" }));
          await page.emulateMedia({ forcedColors: "active" });
          report.modeCells.push(await scan(page, { route, viewport: viewport.name, mode: "forced-colors" }));
        }
      } catch (error) {
        report.errors.push({ phase: "default", route, viewport: viewport.name, error: String(error.stack || error) });
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
}

async function scanReflowAndZoom(browser, report) {
  for (const modeViewport of [
    { name: "reflow-320", width: 320, height: 720 },
    { name: "effective-200-percent-zoom", width: 640, height: 720 }
  ]) {
    const context = await browser.newContext({ viewport: modeViewport, colorScheme: "light", locale: "en-US" });
    for (const route of routes) {
      const page = await context.newPage();
      try {
        await goto(page, route);
        report.modeCells.push(await scan(page, { route, viewport: modeViewport.name, mode: modeViewport.name }));
      } catch (error) {
        report.errors.push({ phase: "mode", route, viewport: modeViewport.name, error: String(error.stack || error) });
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
}

async function scanStates(browser, report) {
  for (const viewport of [{ name: "desktop-wide", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, colorScheme: "light", locale: "en-US" });
    for (const testCase of stateCases) {
      const page = await context.newPage();
      try {
        await goto(page, testCase.route);
        await testCase.action(page);
        await page.waitForTimeout(150);
        report.stateCells.push(await scan(page, { route: testCase.route, viewport: viewport.name, state: testCase.state, keyboard: true }));
      } catch (error) {
        report.errors.push({ phase: "state", route: testCase.route, state: testCase.state, viewport: viewport.name, error: String(error.stack || error) });
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
}

function summarize(report) {
  const cells = [...report.defaultCells, ...report.modeCells, ...report.stateCells];
  const violationMap = new Map();
  for (const cell of cells) {
    for (const violation of cell.axe.violations) {
      const item = violationMap.get(violation.id) || { id: violation.id, impact: violation.impact, help: violation.help, occurrences: 0, routes: new Set(), sampleTargets: [] };
      item.occurrences += violation.nodes.length;
      item.routes.add(cell.route);
      if (item.sampleTargets.length < 12) item.sampleTargets.push(...violation.nodes.map((node) => node.target).slice(0, 12 - item.sampleTargets.length));
      violationMap.set(violation.id, item);
    }
  }
  const violations = [...violationMap.values()].map((item) => ({ ...item, routes: [...item.routes].sort() })).sort((a, b) => b.occurrences - a.occurrences);
  report.summary = {
    routeCount: routes.length,
    viewportCount: viewports.length,
    defaultCellCount: report.defaultCells.length,
    modeCellCount: report.modeCells.length,
    stateCellCount: report.stateCells.length,
    errorCount: report.errors.length,
    axeViolationRuleCount: violations.length,
    axeViolations: violations,
    hiddenFocusableCellCount: cells.filter((cell) => cell.dom.hiddenFocusable.length).length,
    missingNameCellCount: cells.filter((cell) => cell.dom.missingNames.length).length,
    positiveTabindexCellCount: cells.filter((cell) => cell.dom.positiveTabindex.length).length,
    duplicateIdCellCount: cells.filter((cell) => cell.dom.duplicateIds.length).length,
    horizontalOverflowCellCount: cells.filter((cell) => cell.dom.horizontalOverflowPx > 1).length,
    keyboardCellCount: cells.filter((cell) => cell.keyboard).length,
    keyboardMissingIndicatorCellCount: cells.filter((cell) => cell.keyboard?.missingVisibleIndicator.length).length,
    keyboardObscuredCellCount: cells.filter((cell) => cell.keyboard?.obscured.length).length
  };
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const server = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let browser;
  try {
    await waitForHealth(server);
    browser = await chromium.launch({ channel: process.platform === "win32" ? "chrome" : undefined, headless: true });
    const retryStates = process.argv.includes("--retry-states");
    const report = retryStates && fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, "utf8")) : {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      baseURL,
      browser: await browser.version(),
      axeVersion: require("axe-core/package.json").version,
      routes,
      viewports,
      stateInventory: stateCases.map(({ route, state }) => ({ route, state })),
      networkPolicy: "Only 127.0.0.1, localhost, and data URLs allowed; external media blocked.",
      defaultCells: [],
      modeCells: [],
      stateCells: [],
      errors: []
    };
    if (!retryStates) {
      await scanDefaultCells(browser, report);
      await scanReflowAndZoom(browser, report);
    }
    report.stateInventory = stateCases.map(({ route, state }) => ({ route, state }));
    report.stateCells = [];
    report.errors = retryStates ? report.errors.filter((error) => error.phase !== "state") : report.errors;
    await scanStates(browser, report);
    summarize(report);
    fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report.summary, null, 2));
    console.log(`Evidence: ${outputFile}`);
    if (report.errors.length) process.exitCode = 2;
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
