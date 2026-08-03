import type { CallingMediaDto } from "../../domain/calling/calling-discernment";
import {
  createTeoyubeWorldYouTubeEmbedUrl,
  isVerifiedTeoyubeWorldVideo
} from "../../shared/media/teoyubeworld-youtube-contract.js";

export const CALLING_COMPASS_OFFICIAL_CHANNEL_URL = "https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w";

export function isPlayableCallingCompassMedia(media: CallingMediaDto) {
  return Boolean(
    media.channelUrl === CALLING_COMPASS_OFFICIAL_CHANNEL_URL &&
    media.youtubeWatchUrl === `https://www.youtube.com/watch?v=${media.youtubeVideoId}` &&
    isVerifiedTeoyubeWorldVideo(media)
  );
}

export function createCallingCompassYouTubeEmbedUrl(media: CallingMediaDto) {
  if (!isPlayableCallingCompassMedia(media)) return null;
  return createTeoyubeWorldYouTubeEmbedUrl(media);
}