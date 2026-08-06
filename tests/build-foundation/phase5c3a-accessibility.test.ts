import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { verifyPhase5c3aDelta } = require("../../scripts/accessibility/phase5c3aDeltaContract.cjs") as {
  verifyPhase5c3aDelta: () => {
    valid: boolean;
    failures: string[];
    approvedByPath: Map<string, unknown>;
    contract: {
      issueIds: string[];
      proposalHashes: Record<string, string>;
      routes: string[];
      states: string[];
      selectors: string[];
      geometry: { before: Record<string, number>; after: Record<string, number> };
      allowedDifference: Record<string, unknown>;
      constraints: Record<string, unknown>;
    };
  };
};
const { verifyPhase5c2Delta } = require("../../scripts/accessibility/phase5c2DeltaContract.cjs") as {
  verifyPhase5c2Delta: () => { valid: boolean; failures: string[] };
};
const { verifyPhase5c1Delta } = require("../../scripts/accessibility/phase5c1DeltaContract.cjs") as {
  verifyPhase5c1Delta: () => { valid: boolean; failures: string[] };
};

const root = resolve(import.meta.dirname, "../..");

describe("Phase 5C-3A approved A11Y-007 delta", () => {
  it("binds one issue, one proposal hash, six target selectors, and six exact source records", () => {
    const result = verifyPhase5c3aDelta();
    expect(result).toMatchObject({ valid: true, failures: [] });
    expect([...result.approvedByPath.keys()]).toEqual([
      "styles/pages/today.css",
      "styles/pages/book.css",
      "styles/pages/canon.css",
      "src/app/globals.css",
      "src/components/teoyube/ExploreTabs.tsx",
      "config/runtime/canonical-runtime-manifest.json"
    ]);
    expect(result.contract.issueIds).toEqual(["A11Y-007"]);
    expect(result.contract.proposalHashes).toEqual({
      "A11Y-007": "e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717"
    });
    expect(result.contract.routes).toEqual(["/", "/book", "/canon", "/explore"]);
    expect(result.contract.states).toEqual(["default", "carousel-pagination", "memory-filtering", "explore-tab-selection"]);
    expect(result.contract.selectors).toHaveLength(6);
    expect(result.contract.allowedDifference).toMatchObject({
      cssByteDelta: 1119,
      tsxByteDelta: 52,
      domHierarchyDelta: 0,
      classIdDelta: 0,
      ariaDelta: 0,
      visibleCopyDelta: 0,
      assetDelta: 0,
      controlRemovalDelta: 0
    });
    expect(result.contract.constraints).toMatchObject({
      minimumTargetWidthCssPixels: 24,
      minimumTargetHeightCssPixels: 24,
      a11y008Changed: false,
      baselineChanged: false,
      manualEvidenceExecuted: 0
    });
  }, 120_000);

  it("binds the reproduced before defect and the complete after geometry", () => {
    const result = verifyPhase5c3aDelta();
    expect(result.contract.geometry.before).toMatchObject({
      targetCount: 570,
      minimumWidth: 12,
      minimumHeight: 5.4,
      targetViolationNodes: 286,
      overlappingPairCount: 0
    });
    expect(result.contract.geometry.after).toMatchObject({
      targetCount: 570,
      minimumWidth: 24,
      minimumHeight: 24,
      targetSizePassCount: 570,
      targetViolationNodes: 0,
      overlappingPairCount: 0
    });
  }, 120_000);

  it("preserves the Phase 5C-1 and Phase 5C-2 contracts in the composed chain", () => {
    expect(verifyPhase5c2Delta()).toMatchObject({ valid: true, failures: [] });
    expect(verifyPhase5c1Delta()).toMatchObject({ valid: true, failures: [] });
  }, 180_000);

  it("keeps the implementation selector-scoped without positive tabindex or A11Y-008 color changes", () => {
    const today = readFileSync(resolve(root, "styles/pages/today.css"), "utf8");
    const book = readFileSync(resolve(root, "styles/pages/book.css"), "utf8");
    const canon = readFileSync(resolve(root, "styles/pages/canon.css"), "utf8");
    const explore = readFileSync(resolve(root, "src/components/teoyube/ExploreTabs.tsx"), "utf8");
    expect(today).toContain("#promiseCarouselDots button[data-slide-index]");
    expect(today.indexOf("@media (max-width: 430px)")).toBeLessThan(today.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(book).toContain("#phase115BookMemory .phase115-memory-filters button");
    expect(canon).toContain(".canon-watchman-story-card .canon-watchman-video-dots button[data-watchman-video-index]");
    expect(explore).toContain("style={{ minHeight: 24, minWidth: 24 }}");
    expect([today, book, canon, explore].join("\n")).not.toMatch(/tabIndex\s*=\s*["'{]?\s*[1-9]/i);
    const canonDiff = execFileSync("git", ["diff", "8f01138907a9c76439bd725662097bb6106dea52", "--", "styles/pages/canon.css"], { cwd: root, encoding: "utf8" });
    expect(canonDiff).not.toContain("canon-status.in-progress");
    expect(canonDiff).not.toMatch(/^\+.*(?:color|background(?:-color)?):/m);
  });
});
