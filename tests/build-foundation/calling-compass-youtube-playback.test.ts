import { describe, expect, it } from "vitest";
import { createCallingCompassViewModel } from "../../src/features/calling/application/calling-compass-service";
import {
  CALLING_COMPASS_OFFICIAL_CHANNEL_URL,
  createCallingCompassYouTubeEmbedUrl,
  isPlayableCallingCompassMedia
} from "../../src/features/calling/calling-compass-youtube";

const expectedMappings = [
  ["local-seed-of-promise", "The Seed of Promise", "4zM2olpouIo"],
  ["local-power-of-prayer", "The Power of Prayer", "yLBb7JCMqJE"],
  ["local-walk-in-purpose", "Walk in Divine Purpose", "yDu0bD1lukE"],
  ["local-rooted-in-word", "Rooted in His Word", "tnjdlvbaBY8"],
  ["local-called-for-more", "Called for More", "chLnoAGxyrc"],
  ["local-strength-for-today", "Strength for Today", "jAmIjP7-T5w"],
  ["local-promise-language", "Promise Language and Calling", "I8Y3syhDG64"],
  ["local-daily-assignment", "Daily Divine Assignment", "YY9VYdPUVf8"]
] as const;

describe("Calling Compass official TeoyubeWorld playback contract", () => {
  it("maps every current playlist item to one distinct verified official-channel video", () => {
    const media = createCallingCompassViewModel().media;

    expect(media.map((item) => [item.id, item.title, item.youtubeVideoId])).toEqual(expectedMappings);
    expect(new Set(media.map((item) => item.youtubeVideoId)).size).toBe(media.length);
    for (const item of media) {
      expect(item.order).toBe(media.indexOf(item));
      expect(item.channelUrl).toBe(CALLING_COMPASS_OFFICIAL_CHANNEL_URL);
      expect(item.youtubeWatchUrl).toBe(`https://www.youtube.com/watch?v=${item.youtubeVideoId}`);
      expect(isPlayableCallingCompassMedia(item)).toBe(true);
      expect(createCallingCompassYouTubeEmbedUrl(item)).toMatch(
        new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${item.youtubeVideoId}\\?`)
      );
    }
  });

  it("fails closed when channel provenance or playback verification is absent", () => {
    const media = createCallingCompassViewModel().media[0];
    expect(isPlayableCallingCompassMedia({ ...media, channelUrl: "https://example.com/not-teoyubeworld" })).toBe(false);
    expect(createCallingCompassYouTubeEmbedUrl({ ...media, playbackStatus: "unavailable" })).toBeNull();
  });
});