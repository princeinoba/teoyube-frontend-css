import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import tablesYouTubeFeed from "../../src/features/promises/promise-table-youtube-feed.json";
import {
  createTablesYouTubeEmbedUrl,
  validateTablesYouTubeFeed
} from "../../src/features/media/tables-youtube-player.js";

const root = path.resolve(__dirname, "../..");

const expectedMappings = [
  ["local-seed-of-promise", "The Seed of Promise", "4zM2olpouIo"],
  ["local-power-of-prayer", "The Power of Prayer", "yLBb7JCMqJE"],
  ["local-walk-in-purpose", "Walk in Divine Purpose", "yDu0bD1lukE"],
  ["local-rooted-in-truth", "Rooted in His Word", "tnjdlvbaBY8"],
  ["local-called-for-more", "Called for More", "chLnoAGxyrc"],
  ["local-strength-for-today", "Strength for Today", "jAmIjP7-T5w"],
  ["local-promise-language", "Promise Language and Calling", "I8Y3syhDG64"],
  ["local-daily-assignment", "Daily Divine Assignment", "YY9VYdPUVf8"]
] as const;

describe("Tables dual-container TeoyubeWorld playback boundary", () => {
  it("uses the existing verified official-channel mapping without duplication", () => {
    expect(validateTablesYouTubeFeed(tablesYouTubeFeed)).toBe(true);
    expect(
      tablesYouTubeFeed.items.map((item) => [item.id, item.canonicalMatchTitle, item.youtubeVideoId])
    ).toEqual(expectedMappings);
    expect(new Set(tablesYouTubeFeed.items.map((item) => item.youtubeVideoId)).size).toBe(8);
  });

  it("constructs privacy-enhanced embeds only for verified records", () => {
    expect(createTablesYouTubeEmbedUrl(tablesYouTubeFeed.items[0])).toBe(
      "https://www.youtube-nocookie.com/embed/4zM2olpouIo?autoplay=1&playsinline=1&rel=0&modestbranding=1"
    );
    expect(createTablesYouTubeEmbedUrl(undefined)).toBeNull();
    expect(
      createTablesYouTubeEmbedUrl({ ...tablesYouTubeFeed.items[0], playbackStatus: "unavailable" })
    ).toBeNull();
  });

  it("binds static and Next Tables routes while keeping both players independent", () => {
    const player = fs.readFileSync(path.join(root, "src/features/media/tables-youtube-player.js"), "utf8");
    const controller = fs.readFileSync(path.join(root, "src/app/_media/TablesPageController.tsx"), "utf8");
    const bootstrap = fs.readFileSync(path.join(root, "embedded-videos.js"), "utf8");

    expect(player).toContain('panel.dataset.tableVideoRole = "compact-preview"');
    expect(player).toContain('panel.dataset.tableVideoRole = "airplay"');
    expect(player).toContain("event.stopImmediatePropagation()");
    expect(player).toContain("setAirplayVideo(panel");
    expect(player).not.toContain('querySelector("[data-table-video-preview]")');
    expect(controller).toContain("createTablesYouTubePlayback(root, tablesYouTubeFeed)");
    expect(bootstrap).toContain('import("./src/features/media/tables-youtube-player.js")');
    expect(bootstrap).toContain("initializeStaticTablesYouTubePlayback");
  });
});