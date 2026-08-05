import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { verifyPhase5c1Delta } = require("../../scripts/accessibility/phase5c1DeltaContract.cjs") as {
  verifyPhase5c1Delta: () => {
    valid: boolean;
    failures: string[];
    approvedByPath: Map<string, unknown>;
    contract: { issueIds: string[]; proposalHashes: Record<string, string>; constraints: Record<string, unknown> };
  };
};

const root = resolve(import.meta.dirname, "../..");

describe("Phase 5C-1 approved accessibility delta", () => {
  it("is bound to the exact owner-approved issues, hashes, and five source files", () => {
    const result = verifyPhase5c1Delta();
    expect(result.failures).toEqual([]);
    expect(result.valid).toBe(true);
    expect([...result.approvedByPath.keys()]).toEqual([
      "app.js",
      "src/app/_lexicon/LexiconPageController.tsx",
      "src/app/_today/ApprovedTodayView.tsx",
      "src/app/_approved-source/approved-view-markup.generated.ts",
      "config/runtime/canonical-runtime-manifest.json"
    ]);
    expect(result.contract.issueIds).toEqual(["A11Y-001", "A11Y-002", "A11Y-004"]);
    expect(result.contract.proposalHashes).toEqual({
      "A11Y-001": "11aef30ee50faf3b9c61b744bdb867dfeb1d0a8cafe3569a831f011d9cc52afe",
      "A11Y-002": "d09fd6540f400937f1b797e122e80455c3d7909a1ac80059c77cbc32b25bb61b",
      "A11Y-004": "c001c4a48c70289c2a111c1f57f78dad1fdd4f3b5e98123e7b4b4738b38718e1"
    });
    expect(result.contract.constraints).toMatchObject({
      attributeOnly: true,
      visibleCopyChanged: false,
      cssChanged: false,
      classOrIdChanged: false,
      assetChanged: false,
      baselineChanged: false,
      phase5c2Started: false,
      phase5c3Started: false,
      manualEvidenceExecuted: 0
    });
  }, 15_000);

  it("removes only the unsupported Lexicon pressed state while retaining selection", () => {
    const app = readFileSync(resolve(root, "app.js"), "utf8");
    const controller = readFileSync(resolve(root, "src/app/_lexicon/LexiconPageController.tsx"), "utf8");
    expect(app).toContain('role="option" aria-selected="${isActive}" aria-label=');
    expect(app).not.toContain('role="option" aria-selected="${isActive}" aria-pressed=');
    expect(controller).toContain('button.setAttribute("aria-selected", String(active))');
    expect(controller).not.toContain("aria-pressed");
  });

  it("makes only the approved hidden Today and Canon subtrees inert", () => {
    const app = readFileSync(resolve(root, "app.js"), "utf8");
    const today = readFileSync(resolve(root, "src/app/_today/ApprovedTodayView.tsx"), "utf8");
    expect(today.match(/inert=\{!active\}/g)).toHaveLength(2);
    expect(app).toContain('? "" : " inert"');
    expect(app).toContain('${active ? "" : "inert"}');
    expect(app).toContain('class="canon-watchman-story-copy" aria-hidden="true" inert');
  });
});
