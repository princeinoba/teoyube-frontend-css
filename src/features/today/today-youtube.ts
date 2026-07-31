import type { TodayStory } from "./contracts";
import todayYouTubeFeed from "./today-youtube-feed.json";

export const TEOYUBEWORLD_CHANNEL_ID = todayYouTubeFeed.officialChannel.id;
export const TEOYUBEWORLD_CHANNEL_URL = todayYouTubeFeed.officialChannel.url;

export const TODAY_YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function isTodayStoryPlayable(
  story: TodayStory | undefined
): story is TodayStory & Readonly<{ youtubeVideoId: string }> {
  return Boolean(
    story &&
      story.playbackStatus === "verified" &&
      story.youtubeVideoId &&
      TODAY_YOUTUBE_VIDEO_ID_PATTERN.test(story.youtubeVideoId)
  );
}

export function createTodayYouTubeEmbedUrl(
  story: TodayStory | undefined
): string | null {
  if (!isTodayStoryPlayable(story)) return null;
  const parameters = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1"
  });
  return `https://www.youtube-nocookie.com/embed/${story.youtubeVideoId}?${parameters.toString()}`;
}
