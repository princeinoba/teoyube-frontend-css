import { describe, expect, it } from "vitest";
import { createEmbeddedVideosPageViewModel } from "../../src/features/media/application/retained-media-page-service";
import {
  EMBEDDED_VIDEOS_OFFICIAL_CHANNEL,
  createEmbeddedVideosYouTubeEmbedUrl,
  isPlayableEmbeddedVideosYouTubeAsset,
  validateEmbeddedVideosYouTubeMappings
} from "../../src/features/media/embedded-videos-youtube";

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

describe("Embedded Videos source-specific playback contract", () => {
  it("maps every retained card to one distinct verified official-channel video", () => {
    const media = createEmbeddedVideosPageViewModel().media.filter((item) => item.source === "original_local_preview");

    expect(validateEmbeddedVideosYouTubeMappings()).toBe(true);
    expect(media.map((item) => [item.id, item.title, item.youtubeVideoId])).toEqual(expectedMappings);
    expect(new Set(media.map((item) => item.youtubeVideoId)).size).toBe(media.length);
    for (const item of media) {
      expect(item.order).toBe(expectedMappings.findIndex(([id]) => id === item.id));
      expect(item.channelUrl).toBe(EMBEDDED_VIDEOS_OFFICIAL_CHANNEL.url);
      expect(item.youtubeWatchUrl).toBe(`https://www.youtube.com/watch?v=${item.youtubeVideoId}`);
      expect(item.playbackStatus).toBe("verified");
      expect(isPlayableEmbeddedVideosYouTubeAsset(item)).toBe(true);
      expect(createEmbeddedVideosYouTubeEmbedUrl(item)).toMatch(
        new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${item.youtubeVideoId}\\?`)
      );
    }
  });

  it("retains all approved pilot clips as exact local MP4 sources", () => {
    const media = createEmbeddedVideosPageViewModel().media.filter((item) => item.source === "approved_teoyubeworld_pilot");

    expect(media).toHaveLength(12);
    for (const item of media) {
      expect(item.playbackStatus).toBe("local");
      expect(item.mimeType).toBe("video/mp4");
      expect(item.playbackUrl).toMatch(/^\/media\/teoyubeworld\/pilot-v1\/.+\/card-preview\.mp4$/);
      expect(item.youtubeVideoId).toBeNull();
      expect(createEmbeddedVideosYouTubeEmbedUrl(item)).toBeNull();
    }
  });

  it("fails closed when verified identity, channel provenance, or playback status is altered", () => {
    const item = createEmbeddedVideosPageViewModel().media.find((candidate) => candidate.id === "local-seed-of-promise");
    expect(item).toBeDefined();
    if (!item) return;

    expect(isPlayableEmbeddedVideosYouTubeAsset({ ...item, youtubeVideoId: "YY9VYdPUVf8" })).toBe(false);
    expect(isPlayableEmbeddedVideosYouTubeAsset({ ...item, channelUrl: "https://example.com/not-teoyubeworld" })).toBe(false);
    expect(createEmbeddedVideosYouTubeEmbedUrl({ ...item, playbackStatus: "unavailable" })).toBeNull();
  });
});