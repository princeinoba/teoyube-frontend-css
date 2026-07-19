import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { settlePage } from "./capture";
import { candidateRoot, workspaceRoot } from "./config";

export interface SupportRouteBaselineSource {
  schemaVersion: number;
  approvalId: string;
  approvalDate: string;
  approvedCommit: string;
  state: string;
  captureEnvironment: Record<string, string | number>;
  viewports: Array<{ name: string; width: number; height: number }>;
  routes: Array<{ route: string; slug: string; status: "OWNER_APPROVED_SOURCE_BASELINE" }>;
}

export const supportRouteBaselineSource = JSON.parse(
  fs.readFileSync(path.join(workspaceRoot, "tests/visual/parity/support-route-baseline-source.json"), "utf8")
) as SupportRouteBaselineSource;

export const supportRouteCandidateRoot = path.join(candidateRoot, "prompt-12b-support-route-capture");
export const supportRouteVerificationRoot = path.join(candidateRoot, "owner-approved-support-route-verify");
export const supportRouteBaselineRoot = path.join(
  workspaceRoot,
  "tests/visual/baselines/owner-approved-support-routes"
);

export async function gotoApprovedSupportRoute(page: Page, url: string): Promise<void> {
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

export async function settleApprovedSupportRoute(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  await settlePage(page);
}
