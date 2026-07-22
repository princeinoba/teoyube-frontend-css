import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPublicMediaPath } from "../../src/domain/media/media-contracts";
import { createDeterministicTeoGuideMessage } from "../../src/domain/teo-guide/teo-guide-message";
import { createLexiconPageViewModel } from "../../src/features/lexicon/application/lexicon-page-service";
import {
  createEmbeddedVideosPageViewModel,
  createOwnerRoadmapViewModel,
  createTablesPageViewModel
} from "../../src/features/media/application/retained-media-page-service";
import { getSupportViewRegistry } from "../../src/features/settings/application/support-view-service";
import { createTeoGuidePageViewModel } from "../../src/features/teo-guide/application/teo-guide-page-service";

const workspaceRoot = path.resolve(__dirname, "../..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

describe("remaining retained preview contracts", () => {
  it("maps every Lexicon field behind the approved view and keeps words subordinate to Scripture", () => {
    const viewModel = createLexiconPageViewModel();
    const agape = viewModel.entries.find((entry) => entry.word === "AGAPE");
    expect(viewModel.approvedHtml).toContain('class="lexicon-shell"');
    expect(viewModel.approvedHtml).toContain('id="lexiconGrid"');
    expect(viewModel.entries.length).toBeGreaterThanOrEqual(108);
    expect(agape).toMatchObject({
      pronunciation: "Ah-Gah-Pay",
      meaning: "Divine Love",
      wordRank: 37,
      wordLevel: "Beginner",
      grammarRole: "Promise Word",
      authority: { kind: "scripture_derived_aid", isScripture: false }
    });
    expect(agape?.scriptureSources).toContain("John 13:34-35");
    expect(agape?.prayerSequence).toContain("Promise");
    expect(agape?.callingAssociations.length).toBeGreaterThan(0);
    expect(viewModel.entries.find((entry) => entry.word === "Zaviel")?.promiseCategory).toBe("Acceptance");
    expect(viewModel.authorityNotice.label).toBe("Scripture-derived aid, not Scripture");
  });

  it("keeps Teo Guide deterministic, source-typed, cautious, and disconnected from live AI", () => {
    const first = createDeterministicTeoGuideMessage("I need wisdom for a decision.");
    const second = createDeterministicTeoGuideMessage("I need wisdom for a decision.");
    const viewModel = createTeoGuidePageViewModel();
    expect(first).toEqual(second);
    expect(first.sources).toEqual([{ kind: "scripture", reference: "James 1:5", authority: "Scripture" }]);
    expect(first.text).toContain("not divine speech or certainty");
    expect(first.limitation).toContain("wise counsel");
    expect(viewModel.deterministicLocalOnly).toBe(true);
    expect(viewModel.liveAiConnected).toBe(false);
    expect(viewModel.durableMemoryConnected).toBe(false);
    expect(viewModel.approvedHtml).toContain('id="chatForm"');
  });

  it("keeps original and approved media sources distinct with delivery safety metadata", () => {
    const viewModel = createEmbeddedVideosPageViewModel();
    const approved = viewModel.media.filter((entry) => entry.source === "approved_teoyubeworld_pilot");
    const original = viewModel.media.filter((entry) => entry.source === "original_local_preview");
    expect(original.length).toBe(8);
    expect(approved.length).toBe(12);
    expect(approved.every((entry) => entry.runtimeApproved && entry.mimeType === "video/mp4")).toBe(true);
    expect(approved.every((entry) => entry.playbackUrl && isPublicMediaPath(entry.playbackUrl))).toBe(true);
    expect(Object.keys(viewModel.tabs)).toEqual(["All Videos", "Teachings", "Worship", "Messages", "Documentaries", "Shorts", "TeoyubeWorld Media"]);
    expect(viewModel.tabs["TeoyubeWorld Media"].grid).toContain("No videos found");
    expect(viewModel.delivery).toMatchObject({ supportsByteRanges: true, immutablePublishedAssets: true, manifestNoStore: true });
    expect(viewModel.delivery.protectedPathPrefixes).toContain("/media-source");
  });

  it("keeps table pages, management tabs, and the owner roadmap on approved markup", () => {
    const tables = createTablesPageViewModel();
    const roadmap = createOwnerRoadmapViewModel();
    expect(tables.approvedHtml).toContain('id="teoyubeTablesRows"');
    expect(tables.approvedHtml).toContain('id="teoyubeDataTableTabs"');
    expect(Object.keys(tables.pages)).toEqual(["1", "2", "3"]);
    expect(Object.keys(tables.managementTabs)).toEqual(["promises", "scriptures", "journeys", "videos", "book"]);
    expect(roadmap.approvedHtml).toContain('class="roadmap-dashboard"');
    expect(roadmap.qaPanelHtml).toContain('class="phase114-qa-card"');
    expect(roadmap.ownerOnly).toBe(true);
    expect(roadmap.normalNavigation).toBe(false);
  });

  it("keeps approved support views source-identical, redirects Compass, and hides internal routes", () => {
    const expectedHashes: Readonly<Record<string, string>> = {
      settings: "2abec0f8653601d308f0248cd999375efc1b384ed3791be3cd98734cfed7cfc8",
      privacy: "fea268e279efda0ff5a2882840be790dc981fc522ee6b2404d9ddf7a7be17e10",
      consent: "98d8357dcecdef4b3543c8d7a5b9238b0f8a4fc532ec204cc18894383f7a049b",
      terms: "f5ee919642b9318ca932ae9a31983e977a66c42da8220732f5ddc2360c3aaeab",
      profile: "69c255fa57cbaac6338e4868e2214ed36ae39f80650aefd0ad551c3659476845",
      "daily-word": "bfe625ce8a5e0849c7d4e6ca7274066e1941edf618bd095d7a93519b4b954e6e",
      dashboard: "98a629c76cf4b85f13f2bca1a79772fdb91deab9960c0b11ccf76f6aa342fbe4",
      explore: "4aef660f788d59f0cd533d09fd107965998ce74287aff328b3e3632c5de5ff54",
      graph: "3571c2955c7e7d1d4ee4b26cfbc35d8c5b8c3447df0d6def7ce364ffccff4086",
      personalization: "bd5d0dcdfdedfe6a115797fe7bd404c15dbcc6e2a08aa8d6512298af9b7e4686",
      "promise-search": "f28a8c4642476c4df0d2e691b6fb07387034a54b9b6f8cea4fd35b4558158348",
      compass: "e8449aad1225f0004d3d73efdf11993eaf9408851c0cc084bd224d6fb62fc626"
    };
    for (const [route, digest] of Object.entries(expectedHashes)) {
      expect(crypto.createHash("sha256").update(read(`src/app/${route}/page.tsx`)).digest("hex"), route).toBe(digest);
    }
    const registry = getSupportViewRegistry();
    expect(registry.filter((entry) => entry.visibility !== "retained_public").every((entry) => !entry.normalNavigation)).toBe(true);
    const shell = read("src/app/_shell/ApprovedTeoyubeShell.tsx");
    expect(shell).not.toContain('href: "/roadmap"');
    expect(shell).not.toContain('href: "/tig"');
    expect(shell).not.toContain('href: "/dev"');
    expect(read("src/app/compass/page.tsx")).toContain("permanentRedirect(`/calling-compass");
  });

  it("uses owning feature services rather than the discarded generic screenshot pages", () => {
    for (const route of ["lexicon", "teo-guide", "embedded-videos", "tables", "roadmap"]) {
      const source = read(`src/app/${route}/page.tsx`);
      expect(source).not.toContain("Phase112ScreenshotApp");
    }
    const clientSource = [
      read("src/app/_lexicon/LexiconPageController.tsx"),
      read("src/app/_teo-guide/TeoGuidePageController.tsx"),
      read("src/app/_media/EmbeddedVideosPageController.tsx"),
      read("src/app/_media/TablesPageController.tsx")
    ].join("\n");
    expect(clientSource).not.toMatch(/callings\.seed|TIG_CALLING_SEEDS|runtime-manifest\.json|OpenAI|Anthropic|model provider/i);
    const teoGuideController = read("src/app/_teo-guide/TeoGuidePageController.tsx");
    expect(teoGuideController).toContain('fetch(liveRequested ? "/api/teoyube/teo-guide/stream" : "/api/teoyube/teo-guide"');
    expect(teoGuideController).toContain('fetch("/api/teoyube/live-ai-status"');
    const nextConfig = read("next.config.mjs");
    expect(nextConfig).toContain("public, max-age=31536000, immutable");
    expect(nextConfig).toContain('value: "no-store"');
  });
});
