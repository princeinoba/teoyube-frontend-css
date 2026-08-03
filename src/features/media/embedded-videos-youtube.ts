import type { MediaAssetDto } from "../../domain/media/media-contracts";
import {
  createTeoyubeWorldYouTubeEmbedUrl,
  isVerifiedTeoyubeWorldVideo,
  validateTeoyubeWorldYouTubeFeed
} from "../../shared/media/teoyubeworld-youtube-contract.js";

export const EMBEDDED_VIDEOS_OFFICIAL_CHANNEL = Object.freeze({
  id: "UCxG1guesWqO69QK022fyp2w",
  name: "TeoyubeWorld",
  url: "https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w"
});

export type EmbeddedVideosYouTubeMapping = Readonly<{
  id: string;
  order: number;
  youtubeVideoId: string;
  youtubeWatchUrl: string;
  playbackStatus: "verified";
}>;

export const EMBEDDED_VIDEOS_YOUTUBE_MAPPINGS = Object.freeze([
  Object.freeze({ id: "local-seed-of-promise", order: 0, youtubeVideoId: "4zM2olpouIo", youtubeWatchUrl: "https://www.youtube.com/watch?v=4zM2olpouIo", playbackStatus: "verified" }),
  Object.freeze({ id: "local-power-of-prayer", order: 1, youtubeVideoId: "yLBb7JCMqJE", youtubeWatchUrl: "https://www.youtube.com/watch?v=yLBb7JCMqJE", playbackStatus: "verified" }),
  Object.freeze({ id: "local-walk-in-purpose", order: 2, youtubeVideoId: "yDu0bD1lukE", youtubeWatchUrl: "https://www.youtube.com/watch?v=yDu0bD1lukE", playbackStatus: "verified" }),
  Object.freeze({ id: "local-rooted-in-truth", order: 3, youtubeVideoId: "tnjdlvbaBY8", youtubeWatchUrl: "https://www.youtube.com/watch?v=tnjdlvbaBY8", playbackStatus: "verified" }),
  Object.freeze({ id: "local-called-for-more", order: 4, youtubeVideoId: "chLnoAGxyrc", youtubeWatchUrl: "https://www.youtube.com/watch?v=chLnoAGxyrc", playbackStatus: "verified" }),
  Object.freeze({ id: "local-strength-for-today", order: 5, youtubeVideoId: "jAmIjP7-T5w", youtubeWatchUrl: "https://www.youtube.com/watch?v=jAmIjP7-T5w", playbackStatus: "verified" }),
  Object.freeze({ id: "local-promise-language", order: 6, youtubeVideoId: "I8Y3syhDG64", youtubeWatchUrl: "https://www.youtube.com/watch?v=I8Y3syhDG64", playbackStatus: "verified" }),
  Object.freeze({ id: "local-daily-assignment", order: 7, youtubeVideoId: "YY9VYdPUVf8", youtubeWatchUrl: "https://www.youtube.com/watch?v=YY9VYdPUVf8", playbackStatus: "verified" })
] satisfies readonly EmbeddedVideosYouTubeMapping[]);

const mappingById = new Map<string, EmbeddedVideosYouTubeMapping>(EMBEDDED_VIDEOS_YOUTUBE_MAPPINGS.map((mapping) => [mapping.id, mapping]));

export function getEmbeddedVideosYouTubeMapping(id: string) {
  return mappingById.get(id);
}

export function validateEmbeddedVideosYouTubeMappings() {
  return validateTeoyubeWorldYouTubeFeed({
    schemaVersion: 1,
    officialChannel: EMBEDDED_VIDEOS_OFFICIAL_CHANNEL,
    items: EMBEDDED_VIDEOS_YOUTUBE_MAPPINGS
  });
}

export function isPlayableEmbeddedVideosYouTubeAsset(asset: MediaAssetDto) {
  const expected = getEmbeddedVideosYouTubeMapping(asset.id);
  if (!expected) return false;
  return Boolean(
    asset.source === "original_local_preview" &&
    asset.channelUrl === EMBEDDED_VIDEOS_OFFICIAL_CHANNEL.url &&
    asset.order === expected.order &&
    asset.youtubeVideoId === expected.youtubeVideoId &&
    asset.youtubeWatchUrl === expected.youtubeWatchUrl &&
    asset.playbackStatus === expected.playbackStatus &&
    isVerifiedTeoyubeWorldVideo(expected)
  );
}

export function createEmbeddedVideosYouTubeEmbedUrl(asset: MediaAssetDto) {
  if (!isPlayableEmbeddedVideosYouTubeAsset(asset)) return null;
  return createTeoyubeWorldYouTubeEmbedUrl(getEmbeddedVideosYouTubeMapping(asset.id));
}