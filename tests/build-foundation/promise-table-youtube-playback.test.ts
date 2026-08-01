import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import promiseTableYouTubeFeed from "../../src/features/promises/promise-table-youtube-feed.json";
import {
  createPromiseTableYouTubeEmbedUrl,
  validatePromiseTableYouTubeFeed
} from "../../src/features/promises/promise-table-youtube-player.js";

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

describe("Promise Table TeoyubeWorld playback boundary", () => {
  it("keeps one ordered, verified official-channel mapping", () => {
    expect(validatePromiseTableYouTubeFeed(promiseTableYouTubeFeed)).toBe(true);
    expect(promiseTableYouTubeFeed.officialChannel).toEqual({
      id: "UCxG1guesWqO69QK022fyp2w",
      name: "TeoyubeWorld",
      url: "https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w"
    });
    expect(
      promiseTableYouTubeFeed.items.map((item) => [
        item.id,
        item.canonicalMatchTitle,
        item.youtubeVideoId
      ])
    ).toEqual(expectedMappings);
    expect(promiseTableYouTubeFeed.items.map((item) => item.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(promiseTableYouTubeFeed.items.map((item) => item.id)).size).toBe(8);
    expect(new Set(promiseTableYouTubeFeed.items.map((item) => item.youtubeVideoId)).size).toBe(8);

    for (const item of promiseTableYouTubeFeed.items) {
      expect(item.playbackStatus).toBe("verified");
      expect(item.playbackUnavailableReason).toBeNull();
      expect(item.youtubeWatchUrl).toBe(`https://www.youtube.com/watch?v=${item.youtubeVideoId}`);
      expect(item.officialYouTubeTitle.trim().length).toBeGreaterThan(0);
      expect(item.scriptureReferences.length).toBeGreaterThan(0);
    }
  });

  it("constructs only a privacy-enhanced, user-initiated embed URL", () => {
    expect(createPromiseTableYouTubeEmbedUrl(promiseTableYouTubeFeed.items[0])).toBe(
      "https://www.youtube-nocookie.com/embed/4zM2olpouIo?autoplay=1&playsinline=1&rel=0&modestbranding=1"
    );
    expect(createPromiseTableYouTubeEmbedUrl(undefined)).toBeNull();
    expect(
      createPromiseTableYouTubeEmbedUrl({
        ...promiseTableYouTubeFeed.items[0],
        playbackStatus: "unavailable"
      })
    ).toBeNull();
    expect(
      validatePromiseTableYouTubeFeed({
        ...promiseTableYouTubeFeed,
        officialChannel: { ...promiseTableYouTubeFeed.officialChannel, id: "wrong-channel" }
      })
    ).toBe(false);
  });

  it("binds both static and Next Promise Table routes to the same scoped player", () => {
    const staticSource = fs.readFileSync(path.join(root, "embedded-videos.js"), "utf8");
    const playerSource = fs.readFileSync(
      path.join(root, "src/features/promises/promise-table-youtube-player.js"),
      "utf8"
    );
    const nextSource = fs.readFileSync(
      path.join(root, "src/app/_promise-table/PromiseTablePageController.tsx"),
      "utf8"
    );
    const generatedMarkup = fs.readFileSync(
      path.join(root, "src/app/_approved-source/approved-view-markup.generated.ts"),
      "utf8"
    );

    expect(staticSource).toContain('import("./src/features/promises/promise-table-youtube-player.js")');
    expect(staticSource).toContain("initializeStaticPromiseTableYouTubePlayback");
    expect(playerSource).toContain('startsWith("TeoyubeWorld match:")');
    expect(playerSource).toContain("button.dataset.promiseTableMediaId = video.id");
    expect(playerSource).not.toContain("nth-child");
    expect(nextSource).toContain('from "@/features/promises/promise-table-youtube-feed.json"');
    expect(nextSource).toContain("createPromiseTableYouTubePlayback(root, promiseTableYouTubeFeed)");
    expect(nextSource).not.toContain("scrollIntoView");
    expect(generatedMarkup).toContain("TeoyubeWorld match: The Seed of Promise");
    expect(generatedMarkup).toContain("phase116-why-this-panel");
    expect(generatedMarkup).not.toContain("youtube-nocookie.com/embed/");
  });
});
