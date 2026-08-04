import { describe, expect, it } from "vitest";
import {
  CANON_JOURNEY_YOUTUBE_MAPPINGS,
  createCanonJourneyYouTubeEmbedUrl,
  getCanonJourneyYouTubeMapping,
  validateCanonJourneyYouTubeMappings
} from "../../src/features/scripture/canon-youtube";

const expected = [
  ["canon-map-D02", "In Progress", "local-rooted-in-truth", "tnjdlvbaBY8"],
  ["canon-map-D03", "Completed", "local-called-for-more", "chLnoAGxyrc"],
  ["canon-map-D04", "Planning", "local-seed-of-promise", "4zM2olpouIo"],
  ["canon-map-D05", "In Progress", "local-promise-language", "I8Y3syhDG64"],
  ["canon-map-D06", "Review", "local-walk-in-purpose", "yDu0bD1lukE"],
  ["canon-map-D07", "Completed", "local-strength-for-today", "jAmIjP7-T5w"],
  ["canon-map-D08", "On Hold", "local-rooted-in-truth", "tnjdlvbaBY8"],
  ["canon-map-D09", "In Progress", "local-called-for-more", "chLnoAGxyrc"],
  ["canon-map-D10", "Planning", "local-power-of-prayer", "yLBb7JCMqJE"],
  ["canon-map-D11", "Review", "local-strength-for-today", "jAmIjP7-T5w"],
  ["canon-map-D12", "In Progress", "local-daily-assignment", "YY9VYdPUVf8"]
] as const;

describe("Canon TeoyubeWorld playback contract", () => {
  it("maps all eleven existing Canon play controls across every displayed status", () => {
    expect(validateCanonJourneyYouTubeMappings()).toBe(true);
    expect(CANON_JOURNEY_YOUTUBE_MAPPINGS.map((item) => [item.canonItemId, item.status, item.mediaId, item.youtubeVideoId])).toEqual(expected);
    expect(new Set(CANON_JOURNEY_YOUTUBE_MAPPINGS.map((item) => item.youtubeVideoId)).size).toBe(8);
    expect(new Set(CANON_JOURNEY_YOUTUBE_MAPPINGS.map((item) => item.status))).toEqual(
      new Set(["In Progress", "Completed", "Planning", "Review", "On Hold"])
    );
    for (const mapping of CANON_JOURNEY_YOUTUBE_MAPPINGS) {
      expect(mapping.channelUrl).toBe("https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w");
      expect(mapping.youtubeWatchUrl).toBe(`https://www.youtube.com/watch?v=${mapping.youtubeVideoId}`);
      expect(mapping.playbackStatus).toBe("verified");
      expect(createCanonJourneyYouTubeEmbedUrl(mapping)).toMatch(
        new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${mapping.youtubeVideoId}\\?`)
      );
    }
  });

  it("fails closed for an unknown item or altered video identity", () => {
    const mapping = getCanonJourneyYouTubeMapping("canon-map-D02");
    expect(mapping).toBeDefined();
    if (!mapping) return;
    expect(createCanonJourneyYouTubeEmbedUrl(undefined)).toBeNull();
    expect(createCanonJourneyYouTubeEmbedUrl({ ...mapping, canonItemId: "canon-map-D99" })).toBeNull();
    expect(createCanonJourneyYouTubeEmbedUrl({ ...mapping, youtubeVideoId: "YY9VYdPUVf8" })).toBeNull();
    expect(createCanonJourneyYouTubeEmbedUrl({ ...mapping, channelUrl: "https://example.com" })).toBeNull();
  });
});