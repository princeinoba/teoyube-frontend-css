import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { verifyPhase5c2Delta } = require("../../scripts/accessibility/phase5c2DeltaContract.cjs") as {
  verifyPhase5c2Delta: () => {
    valid: boolean;
    failures: string[];
    approvedByPath: Map<string, unknown>;
    contract: {
      issueIds: string[];
      proposalHashes: Record<string, string>;
      allowedAriaLabels: string[];
      constraints: Record<string, unknown>;
    };
  };
};

const { verifyPhase5c1Delta } = require("../../scripts/accessibility/phase5c1DeltaContract.cjs") as {
  verifyPhase5c1Delta: () => { valid: boolean; failures: string[] };
};

const root = resolve(import.meta.dirname, "../..");

describe("Phase 5C-2 approved accessibility delta", () => {
  it("binds the exact owner-approved issues, hashes, ARIA labels, and six source records", () => {
    const result = verifyPhase5c2Delta();
    expect(result.failures).toEqual([]);
    expect(result.valid).toBe(true);
    expect(verifyPhase5c1Delta()).toMatchObject({ valid: true, failures: [] });
    expect([...result.approvedByPath.keys()]).toEqual([
      "app.js",
      "index.html",
      "src/app/_approved-source/approved-view-markup.generated.ts",
      "src/app/_canon/CanonPageController.tsx",
      "src/features/scripture/canon-youtube.ts",
      "config/runtime/canonical-runtime-manifest.json"
    ]);
    expect(result.contract.issueIds).toEqual(["A11Y-003", "A11Y-005", "A11Y-006"]);
    expect(result.contract.proposalHashes).toEqual({
      "A11Y-003": "512755ac81b5cf4961c9c548a8a7eea12c7677564762635d589d26de1656a1ca",
      "A11Y-005": "048ab643249f468aedd9d9db15205a762d2789c40ddd2936ccbd763ede2ac5ce",
      "A11Y-006": "0ba9a5fb8e12da2e3f26176e168ee3255d64d0033b9467ac6ff35fb48bde0a61"
    });
    expect(result.contract.allowedAriaLabels).toEqual([
      "Search Teoyube tables",
      "Search embedded videos",
      "Search the Teoyube Lexicon",
      "Testimony milestones"
    ]);
    expect(result.contract.constraints).toMatchObject({
      behaviorParityOnly: true,
      nextCanonControlsPreserved: 11,
      staticCanonControlsAdded: 11,
      visibleCopyChanged: false,
      cssChanged: false,
      classOrIdChanged: false,
      assetChanged: false,
      baselineChanged: false,
      phase5c3Started: false,
      manualEvidenceExecuted: 0
    });
  }, 20_000);

  it("preserves the eleven Next Canon controls and adds equivalent static activation", () => {
    const app = readFileSync(resolve(root, "app.js"), "utf8");
    const controller = readFileSync(resolve(root, "src/app/_canon/CanonPageController.tsx"), "utf8");
    const media = readFileSync(resolve(root, "src/features/scripture/canon-youtube.ts"), "utf8");
    expect(controller).toContain('root.querySelectorAll<HTMLElement>(".canon-project-media, .canon-recent-media")');
    expect(controller).toContain('stage.setAttribute("role", "button")');
    expect(controller).toContain('stage.setAttribute("tabindex", "0")');
    expect(controller).toContain('stage.setAttribute("aria-pressed", "false")');
    expect(media.match(/"canon-map-D\d{2}"/g)).toHaveLength(11);
    expect(app).toContain("function configureStaticCanonJourneyMediaStages()");
    expect(app).toContain('event.key !== "Enter" && event.key !== " "');
    expect(app).not.toMatch(/tabindex=["']?[1-9]/i);
  });

  it("provides stable route-specific search names and one focusable testimony region", () => {
    const html = readFileSync(resolve(root, "index.html"), "utf8");
    expect(html).toContain('id="lexiconSearchInput" type="search" placeholder="Search words, meanings, scriptures, or concepts..." aria-label="Search the Teoyube Lexicon"');
    expect(html).toContain('id="uiVideoSearch" type="search" placeholder="Search videos..." autocomplete="off" aria-label="Search embedded videos"');
    expect(html).toContain('id="teoyubeTableSearch" type="search" placeholder="Search tables, scriptures, or keywords..." autocomplete="off" aria-label="Search Teoyube tables"');
    expect(html.match(/class="testimony-milestones" tabindex="0" role="region" aria-label="Testimony milestones"/g)).toHaveLength(1);
  });
});
