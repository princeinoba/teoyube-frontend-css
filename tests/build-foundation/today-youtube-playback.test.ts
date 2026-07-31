import { describe, expect, it } from "vitest";
import { createTodayViewModel, reduceTodayViewModel } from "../../src/features/today/application/today-service";
import { TODAY_STORIES } from "../../src/features/today/today-data";
import {
  createTodayYouTubeEmbedUrl,
  isTodayStoryPlayable,
  TEOYUBEWORLD_CHANNEL_ID,
  TEOYUBEWORLD_CHANNEL_URL,
  TODAY_YOUTUBE_VIDEO_ID_PATTERN
} from "../../src/features/today/today-youtube";
import todayYouTubeFeed from "../../src/features/today/today-youtube-feed.json";

describe("Today TeoyubeWorld playback boundary", () => {
  it("keeps one deterministic feed shared by the Today highlight and table", () => {
    expect(todayYouTubeFeed.officialChannel).toEqual({
      id: "UCxG1guesWqO69QK022fyp2w",
      url: "https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w"
    });
    expect(TEOYUBEWORLD_CHANNEL_ID).toBe(todayYouTubeFeed.officialChannel.id);
    expect(TEOYUBEWORLD_CHANNEL_URL).toBe(todayYouTubeFeed.officialChannel.url);
    expect(TODAY_STORIES).toHaveLength(8);
    expect(TODAY_STORIES.map((story) => story.id)).toEqual(
      todayYouTubeFeed.items.map((item) => item.id)
    );
    expect(new Set(TODAY_STORIES.map((story) => story.id)).size).toBe(8);
    expect(todayYouTubeFeed.items.map((item) => item.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(TODAY_STORIES.every((story) => story.channelUrl === TEOYUBEWORLD_CHANNEL_URL)).toBe(true);
  });

  it("keeps every feed row mapped to a unique verified official-channel video", () => {
    const playable = TODAY_STORIES.filter(isTodayStoryPlayable);
    const unavailable = TODAY_STORIES.filter((story) => !isTodayStoryPlayable(story));
    const expectedVideoIds = [
      "4zM2olpouIo",
      "yLBb7JCMqJE",
      "yDu0bD1lukE",
      "tnjdlvbaBY8",
      "chLnoAGxyrc",
      "jAmIjP7-T5w",
      "I8Y3syhDG64",
      "YY9VYdPUVf8"
    ];

    expect(playable).toHaveLength(8);
    expect(new Set(playable.map((story) => story.youtubeVideoId)).size).toBe(playable.length);
    expect(playable.map((story) => story.youtubeVideoId)).toEqual(expectedVideoIds);
    expect(playable[0]).toMatchObject({
      id: "local-seed-of-promise",
      title: "The Seed of Promise",
      youtubeVideoId: "4zM2olpouIo",
      youtubeWatchUrl: "https://www.youtube.com/watch?v=4zM2olpouIo",
      playbackStatus: "verified",
      playbackUnavailableReason: null
    });
    for (const story of playable) {
      expect(TODAY_YOUTUBE_VIDEO_ID_PATTERN.test(story.youtubeVideoId)).toBe(true);
      expect(story.youtubeWatchUrl).toBe(
        `https://www.youtube.com/watch?v=${story.youtubeVideoId}`
      );
      expect(story.playbackUnavailableReason).toBeNull();
    }
    expect(unavailable).toHaveLength(0);
  });

  it("creates a privacy-enhanced embed URL only for a verified story", () => {
    expect(createTodayYouTubeEmbedUrl(TODAY_STORIES[0])).toBe(
      "https://www.youtube-nocookie.com/embed/4zM2olpouIo?autoplay=1&playsinline=1&rel=0&modestbranding=1"
    );
    expect(createTodayYouTubeEmbedUrl(TODAY_STORIES[1])).toBe(
      "https://www.youtube-nocookie.com/embed/yLBb7JCMqJE?autoplay=1&playsinline=1&rel=0&modestbranding=1"
    );
    expect(createTodayYouTubeEmbedUrl(undefined)).toBeNull();
  });

  it("does not activate an external player until a user requests playback", () => {
    const initial = createTodayViewModel();
    expect(initial.sourcePreviewOpened).toBe(false);
    expect(initial.activePlaybackStoryId).toBeNull();
    expect(initial.playbackState).toBe("idle");

    const loading = reduceTodayViewModel(initial, { type: "media.preview" });
    expect(loading).toMatchObject({
      activeStoryIndex: 0,
      activePlaybackStoryId: "local-seed-of-promise",
      sourcePreviewOpened: true,
      playbackState: "loading"
    });

    const playing = reduceTodayViewModel(loading, { type: "media.ready" });
    expect(playing.playbackState).toBe("playing");
    expect(playing.movieStatus).toContain('Playing "The Seed of Promise"');
    expect(playing.movieStatus).toContain("only after you press Play");

    const failed = reduceTodayViewModel(loading, { type: "media.error" });
    expect(failed).toMatchObject({
      activePlaybackStoryId: null,
      sourcePreviewOpened: false,
      playbackState: "error"
    });
  });

  it("plays every row and navigates the unique video sequence", () => {
    const initial = createTodayViewModel();
    const second = reduceTodayViewModel(initial, {
      type: "story.play",
      storyId: "local-power-of-prayer"
    });
    expect(second).toMatchObject({
      activeStoryIndex: 1,
      activePlaybackStoryId: "local-power-of-prayer",
      sourcePreviewOpened: true,
      playbackState: "loading"
    });

    const next = reduceTodayViewModel(second, { type: "story.play.next" });
    const previous = reduceTodayViewModel(next, { type: "story.play.previous" });
    expect(next.activePlaybackStoryId).toBe("local-walk-in-purpose");
    expect(previous.activePlaybackStoryId).toBe("local-power-of-prayer");

    const selected = reduceTodayViewModel(second, {
      type: "story.select",
      index: 3
    });
    const previewed = reduceTodayViewModel(selected, { type: "media.preview" });
    expect(previewed).toMatchObject({
      activeStoryIndex: 3,
      activePlaybackStoryId: "local-rooted-in-truth",
      sourcePreviewOpened: true,
      playbackState: "loading"
    });
  });
});
