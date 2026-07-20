import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import { captureRichContract, settlePage } from "./capture";
import { candidateRoot, workspaceRoot } from "./config";

export type SupportViewport = { name: string; width: number; height: number };
export type SupportState = { name: string; viewports: "all" | string[] };
export type SupportRoute = { route: string; slug: string; sourceSha256: string; states: SupportState[] };

export interface NextSupportSource {
  schemaVersion: number;
  amendmentId: string;
  approvalDate: string;
  evidenceCommit: string;
  state: string;
  captureEnvironment: Record<string, string | number>;
  viewports: SupportViewport[];
  routes: SupportRoute[];
  unsupportedCurrentStates: Record<string, string[]>;
}

export const nextSupportSource = JSON.parse(
  fs.readFileSync(path.join(workspaceRoot, "tests/visual/parity/owner-approved-next-support-source.json"), "utf8")
) as NextSupportSource;

export const nextSupportCandidateRoot = path.join(candidateRoot, "prompt-12d-next-support-capture");
export const nextSupportVerificationRoot = path.join(candidateRoot, "prompt-12d-next-support-verify");
export const nextSupportBaselineRoot = path.join(workspaceRoot, "tests/visual/baselines/owner-approved-next-support");

export function stateUsesViewport(state: SupportState, viewport: string): boolean {
  return state.viewports === "all" || state.viewports.includes(viewport);
}

export async function gotoNextSupportRoute(page: Page, url: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await page.waitForTimeout(250);
    }
  }
  throw lastError;
}

export async function applyNextSupportState(page: Page, route: string, state: string): Promise<void> {
  if (state === "default") return;
  if (route === "/settings" && state === "personalization-disabled") {
    await page.getByRole("button", { name: "Disable", exact: true }).click();
    await expect(page.locator("#appMain > main")).toContainText("Current mode: disabled");
    return;
  }
  if (route === "/personalization" && state === "wisdom-signal") {
    await page.getByRole("button", { name: "Add Wisdom Signal", exact: true }).click();
    await expect(page.locator("#appMain > main")).toContainText("Signal count: 1");
    return;
  }
  if (route === "/daily-word" && state === "generated-session") {
    await page.locator("#appMain > main").getByRole("button", { name: "Generate Today's Journey", exact: true }).click();
    await expect(page.locator("#appMain > main")).toContainText("Scripture");
    await expect(page.locator("#appMain > main")).toContainText("Promise Cluster");
    return;
  }
  if (route === "/explore" && state === "clusters-tab") {
    await page.getByRole("button", { name: "Clusters", exact: true }).click();
    await expect(page.getByRole("button", { name: "Clusters", exact: true })).toHaveClass(/active/);
    return;
  }
  if (route === "/explore" && state === "promise-table-tab") {
    await page.getByRole("button", { name: "Promise Table", exact: true }).click();
    await expect(page.getByRole("button", { name: "Promise Table", exact: true })).toHaveClass(/active/);
    return;
  }
  if (route === "/explore" && state === "filtered-wisdom") {
    await page.locator(".search-filter input").fill("wisdom");
    await expect(page.locator(".search-filter input")).toHaveValue("wisdom");
    return;
  }
  if (route === "/promise-search" && state === "query-wisdom") {
    await page.getByRole("textbox", { name: "Search Teoyube" }).fill("wisdom");
    await expect(page.getByRole("textbox", { name: "Search Teoyube" })).toHaveValue("wisdom");
    return;
  }
  if (route === "/promise-search" && state === "keyboard-query") {
    const input = page.getByRole("textbox", { name: "Search Teoyube" });
    await input.fill("calling");
    await input.press("Enter");
    await expect(input).toHaveValue("calling");
    return;
  }
  throw new Error(`Unsupported support-route state ${route}:${state}`);
}

export async function settleNextSupportRoute(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  await settlePage(page);
}

export async function captureSupportAudit(page: Page) {
  return page.locator("#appMain > main").evaluate((root) => {
    const normalize = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim();
    const elements = [root, ...root.querySelectorAll("*")];
    const visible = (element: Element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const pathFor = (element: Element) => element.id ? `${element.tagName.toLowerCase()}#${element.id}` : element.tagName.toLowerCase();
    const label = (element: Element) => {
      const control = element as HTMLInputElement;
      const associated = control.labels ? [...control.labels].map((item) => item.textContent || "").join(" ") : "";
      return normalize(element.getAttribute("aria-label") || associated || element.getAttribute("title") || control.placeholder || element.textContent);
    };
    const issues: string[] = [];
    const ids = elements.map((element) => element.id).filter(Boolean);
    for (const id of [...new Set(ids)]) if (ids.filter((value) => value === id).length > 1) issues.push(`duplicate-id:${id}`);
    for (const element of elements) {
      if (element.matches("img:not([alt])")) issues.push(`missing-alt:${pathFor(element)}`);
      if (visible(element) && element.matches("button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=link],[role=tab]") && !label(element)) issues.push(`missing-name:${pathFor(element)}`);
      if (element.hasAttribute("tabindex") && (element as HTMLElement).tabIndex > 0) issues.push(`positive-tabindex:${pathFor(element)}`);
    }
    const focusOrder = elements
      .filter((element) => visible(element) && element.matches("a[href],button,input,select,textarea,[tabindex],[role=button],[role=tab],[role=link]") && (element as HTMLElement).tabIndex >= 0 && !element.hasAttribute("disabled"))
      .map((element) => `${pathFor(element)}|${(element as HTMLElement).tabIndex}|${label(element)}`);
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return {
      issues: [...new Set(issues)].sort(),
      focusOrder,
      lang: document.documentElement.lang || "",
      performance: {
        domInteractiveMs: Math.round((navigation?.domInteractive || 0) * 10) / 10,
        loadMs: Math.round((navigation?.loadEventEnd || 0) * 10) / 10,
        resourceCount: performance.getEntriesByType("resource").length
      },
      storage: { local: localStorage.length, session: sessionStorage.length }
    };
  });
}

export { captureRichContract };
