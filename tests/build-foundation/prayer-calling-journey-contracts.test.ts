import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createCallingCompassViewModel } from "../../src/features/calling/application/calling-compass-service";
import { createJourneyPageViewModel } from "../../src/features/journey/application/journey-service";
import { createPrayerPageViewModel, createPrayerReplyDto } from "../../src/features/prayer/application/prayer-service";

const workspaceRoot = path.resolve(__dirname, "../..");
const read = (relativePath: string) => fs.readFileSync(path.join(workspaceRoot, relativePath), "utf8");

describe("Prayer, Calling Compass, and Journey typed contracts", () => {
  it("keeps prayer Scripture-grounded, explainable, cautious, and local", () => {
    const page = createPrayerPageViewModel();
    const reply = createPrayerReplyDto("Please help me pray for wisdom and surrender.");

    expect(page.prayerCards.length).toBeGreaterThan(0);
    expect(page.prayerCards.every((prayer) => prayer.scriptureAnchor && prayer.prayer)).toBe(true);
    expect(page.production.explanationItems.length).toBeGreaterThan(0);
    expect(reply.scriptureAnchor).not.toBe("");
    expect(reply.prayer).not.toBe("");
    expect(reply.explanationPath.length).toBeGreaterThan(0);
    expect(reply.devotionalBoundary).toContain("not divine certainty");
    expect(`${reply.response} ${reply.prayer}`).not.toMatch(/God (?:told|commands) you|I am God|this is divine certainty/i);
  });

  it("models Calling Compass as provisional discernment with evidence", () => {
    const model = createCallingCompassViewModel();
    const result = model.discernment;

    expect(model.approvedHtml).toContain('id="phase116bCallingCompassTool"');
    expect(model.approvedHtml).toContain('class="calling-premium-grid"');
    expect(model.questions).toHaveLength(3);
    expect(model.media).toHaveLength(8);
    expect(result.summary).toMatch(/Strongest indicators suggest|Appears to be emerging|Needs further discernment/);
    expect(result.summary).toContain("appears to be emerging");
    expect(result.scriptureReference).not.toBe("");
    expect(result.explanationPath.length).toBeGreaterThan(0);
    expect(result.limitation).toContain("not a final destiny");
    expect(`${result.title} ${result.summary} ${result.actionStep}`).not.toMatch(
      /confirmed direction|active assignment|final destiny|God told you|God has declared/i
    );
  });

  it("keeps the existing Journey surface typed without enabling the final daily loop", () => {
    const model = createJourneyPageViewModel();

    expect(model.journeys).toHaveLength(3);
    expect(model.levels).toHaveLength(4);
    expect(model.journeys.every((journey) => journey.explanationPath.length > 0)).toBe(true);
    expect(model.guardrails).toHaveLength(5);
    expect(model.finalUnifiedDailyLoopEnabled).toBe(false);
  });
});

describe("TIG direct-import and browser-bundle boundaries", () => {
  it("retains the authoritative calling-engine ownership contract", () => {
    const source = read("src/lib/teoyube/calling/calling-engine.ts");
    expect(source).toContain('from "../../tig/calling-compass"');
    expect(source).toContain('from "../../tig/seed/callings.seed"');
    expect(source).toContain('from "../../tig/types"');
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/tig["']/);
  });

  it("keeps TIG engines, seed owners, and legacy adapters out of client components", () => {
    for (const relativePath of [
      "src/app/_calling/CallingCompassPageController.tsx",
      "src/app/_prayer/PrayerCompanionController.tsx"
    ]) {
      const source = read(relativePath);
      expect(source).toContain('"use client"');
      expect(source, relativePath).not.toMatch(/lib\/tig|tig\/seed|callings\.seed|calling-engine|prayer-companion-adapter/);
    }
  });

  it("imports prayer TIG production behavior from its owning module, never the broad barrel", () => {
    const source = read("src/features/prayer/application/prayer-service.ts");
    expect(source).toContain('from "../../../lib/tig/production-surface-adapters"');
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/\.\.\/lib\/tig["']/);
  });
});
