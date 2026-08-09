import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { captureRichContract, installDeterminism, openStaticView, settlePage } from "./capture";
import { compareRichContracts, compareScreenshots } from "./compare";
import { alignApprovedRuntimeStatusForVisualParity } from "./secondary-static-evidence";
import { assertDisposableCandidatePath, candidateRoot, runtimeManifest, type ViewportName } from "./config";

const staticBaseUrl = process.env.TEOYUBE_STATIC_BASE_URL || "http://127.0.0.1:4173";
const nextBaseUrl = process.env.TEOYUBE_NEXT_BASE_URL || "http://127.0.0.1:3100";
const preservedSurfaceDigests = Object.freeze({
  prayer: "0d8303c2f64f9d48eb6e2f2765d05b9a01d296707a32c83f70826264ebd8a045",
  journey: "427eba61a7997f7afb87f125d0e73d9a26f758170616cc47f4491d26c3efd61c"
});

function normalizeStyle(value: string): string {
  return value.replace(/url\(["']?([^"')]+)["']?\)/g, "url($1)").replace(/object-position:\s*center center/g, "object-position:center").replace(/:\s*/g, ":").replace(/;\s*$/, "");
}

function scopeFrameworkParents(contract: Awaited<ReturnType<typeof captureRichContract>>) {
  return {
    ...contract,
    orderedDom: contract.orderedDom.map((row) => {
      const entry = row as Record<string, unknown>;
      const attributes = (entry.attributes as Array<[string, string]> | undefined)?.map(([name, value]) => [name, name === "style" ? normalizeStyle(value) : value] as [string, string]).sort(([left], [right]) => left.localeCompare(right));
      if (["primarySidebar", "mobileNavBackdrop", "mobileNavToggle"].includes(String(entry.id || ""))) return { ...entry, attributes, parentPath: "body > div.app-shell" };
      return { ...entry, attributes };
    })
  };
}

async function align(page: Page) {
  await page.addStyleTag({ content: "html, body, body * { -webkit-font-smoothing: antialiased !important; }" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await settlePage(page);
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      try { const timing = animation.effect?.getComputedTiming(); if (timing?.iterations === Infinity) animation.currentTime = 0; else animation.finish(); animation.pause(); } catch { /* browser-owned animation */ }
    }
  });
}

async function captureViewport(page: Page, outputPath: string) {
  assertDisposableCandidatePath(outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: false, animations: "disabled" });
}

async function preservedSurfaceContract(page: Page) {
  return page.locator("#appMain > main").evaluate((root) => {
    const normalize = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim();
    return [root, ...root.querySelectorAll("*")].map((element) => ({
      tag: element.tagName.toLowerCase(),
      id: element.id || "",
      className: element.getAttribute("class") || "",
      attributes: [...element.attributes]
        .filter((attribute) => !/^(data-(nextjs|react|test)|data-testid$|nonce$)/i.test(attribute.name))
        .map((attribute) => [attribute.name, normalize(attribute.value)])
        .sort(([left], [right]) => left.localeCompare(right)),
      directText: normalize([...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent || "")
        .join(" "))
    }));
  });
}

test("approved Calling Compass candidate matches at every required viewport", async ({ browser }) => {
  test.setTimeout(600_000);
  const evidenceRoot = path.join(candidateRoot, "calling-owner-review");
  assertDisposableCandidatePath(evidenceRoot);
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const summary: Array<Record<string, unknown>> = [];
  for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
    const staticContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
    const nextContext = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
    await installDeterminism(staticContext, [new URL(staticBaseUrl).origin]);
    await installDeterminism(nextContext, [new URL(nextBaseUrl).origin]);
    const staticPage = await staticContext.newPage();
    const nextPage = await nextContext.newPage();
    const viewportOutput = path.join(evidenceRoot, viewportName);
    try {
      await staticPage.goto(`${staticBaseUrl}/index.html#calling`, { waitUntil: "domcontentloaded" });
      await openStaticView(staticPage, "calling");
      await nextPage.goto(`${nextBaseUrl}/calling-compass`, { waitUntil: "domcontentloaded" });
      await nextPage.waitForFunction(() => document.body.dataset.view === "calling");
      await align(staticPage);
      await align(nextPage);
      await alignApprovedRuntimeStatusForVisualParity(staticPage, nextPage);
      const staticContract = scopeFrameworkParents(await captureRichContract(staticPage, "#calling"));
      const nextContract = scopeFrameworkParents(await captureRichContract(nextPage, "#calling"));
      fs.mkdirSync(viewportOutput, { recursive: true });
      fs.writeFileSync(path.join(viewportOutput, "calling.static.contract.json"), `${JSON.stringify(staticContract, null, 2)}\n`, "utf8");
      fs.writeFileSync(path.join(viewportOutput, "calling.next.contract.json"), `${JSON.stringify(nextContract, null, 2)}\n`, "utf8");
      expect(compareRichContracts(staticContract, nextContract), `${viewportName} calling contract`).toEqual([]);
      const staticScreenshot = path.join(viewportOutput, "calling.static.png");
      const nextScreenshot = path.join(viewportOutput, "calling.next.png");
      await captureViewport(staticPage, staticScreenshot);
      await captureViewport(nextPage, nextScreenshot);
      const comparison = await compareScreenshots(staticScreenshot, nextScreenshot, viewportOutput, "calling", true, false);
      expect(comparison.strictPassed, `${viewportName} calling raster ratio ${comparison.differentPixelRatio}`).toBe(true);
      summary.push({ viewport: viewportName, width: viewport.width, height: viewport.height, comparison });
    } finally {
      await staticContext.close();
      await nextContext.close();
    }
  }
  fs.writeFileSync(path.join(evidenceRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
});

for (const definition of [
  { capability: "prayer" as const, route: "/prayer" },
  { capability: "journey" as const, route: "/journey" }
]) {
  test(`existing ${definition.capability} surface keeps its pre-migration DOM, classes, attributes, labels, and responsive render`, async ({ browser }) => {
    const evidenceRoot = path.join(candidateRoot, "prayer-journey-owner-review", definition.capability);
    assertDisposableCandidatePath(evidenceRoot);
    fs.mkdirSync(evidenceRoot, { recursive: true });
    for (const [viewportName, viewport] of Object.entries(runtimeManifest.viewports) as Array<[ViewportName, { width: number; height: number }]>) {
      const context = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1, locale: "en-US" });
      await installDeterminism(context, [new URL(nextBaseUrl).origin]);
      const page = await context.newPage();
      try {
        await page.goto(`${nextBaseUrl}${definition.route}`, { waitUntil: "domcontentloaded" });
        await settlePage(page);
        const contract = await preservedSurfaceContract(page);
        const digest = crypto.createHash("sha256").update(JSON.stringify(contract)).digest("hex");
        expect(digest, `${viewportName} ${definition.capability} pre-migration structural digest`).toBe(preservedSurfaceDigests[definition.capability]);
        const outputDirectory = path.join(evidenceRoot, viewportName);
        fs.mkdirSync(outputDirectory, { recursive: true });
        fs.writeFileSync(path.join(outputDirectory, `${definition.capability}.contract.json`), `${JSON.stringify(contract, null, 2)}\n`, "utf8");
        await captureViewport(page, path.join(outputDirectory, `${definition.capability}.png`));
      } finally {
        await context.close();
      }
    }
  });
}

test("Calling Compass preserves media controls and produces cautious, evidence-linked discernment", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/calling-compass`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.view === "calling");
  await page.locator('[data-compass-video-nav="next"]').click();
  await expect(page.locator("#compassVideoPlayer h4")).toHaveText("The Power of Prayer");
  await page.locator('[data-phase116-query="calling clarity"]').click();
  await expect(page.locator("#compassVideoInput")).toHaveValue("calling clarity");
  await page.locator("#compassVideoInput").fill("purpose");
  await page.locator("#compassVideoForm").press("Enter");
  await expect(page.locator("#compassVideoPlayer h4")).toHaveText("Walk in Divine Purpose");
  await page.locator('[data-phase116b-action="compass-start"]').click();
  for (const answer of ["People needing wisdom", "Teaching and encouragement", "Serve consistently"]) {
    await page.getByRole("button", { name: answer }).click();
    if (answer !== "Serve consistently") await page.locator('[data-phase116b-action="compass-next"]').click();
  }
  await page.locator('[data-phase116b-action="compass-result"]').click();
  const result = page.locator(".phase116b-result-card");
  await expect(result).toContainText(/Strongest indicators suggest|Appears to be emerging|Needs further discernment/);
  await expect(result).toContainText(/Scripture|Ephesians|Romans|Psalm|Proverbs|Corinthians|Timothy|Matthew|Acts/);
  await expect(result).not.toContainText(/Confirmed Direction|Active Assignment|final destiny|God told you/i);
});

test("Prayer Companion keeps Scripture, prayer, confidence, explanation, and devotional limits visible", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/prayer`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Prayer need").fill("Please help me pray for wisdom and surrender.");
  await page.getByRole("button", { name: "Ask Companion" }).click();
  const reply = page.locator(".companion-reply");
  await expect(reply).toContainText("Scripture Anchor:");
  await expect(reply).toContainText("Prayer:");
  await expect(reply).toContainText("Confidence:");
  await expect(reply).toContainText("Why this was selected:");
  await expect(reply).toContainText("not divine certainty");
  await expect(reply).not.toContainText(/God told you|God commands you|I am God/i);
});

test("Journey retains its existing seed, level, guardrail, and limitation surface without the final daily loop", async ({ page }) => {
  await page.goto(`${nextBaseUrl}/journey`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Session Journey Progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "3 Local Journey Seeds" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "4 Growth Levels" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Teoyube Guardrails" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Local Preview Boundaries" })).toBeVisible();
  await expect(page.locator("#appMain")).not.toContainText(/unified daily loop|ten-step/i);
});
