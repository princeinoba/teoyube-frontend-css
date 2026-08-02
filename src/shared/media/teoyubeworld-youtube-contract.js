const OFFICIAL_CHANNEL_ID = "UCxG1guesWqO69QK022fyp2w";
const OFFICIAL_CHANNEL_URL = "https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w";
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function isVerifiedTeoyubeWorldVideo(video) {
  return Boolean(
    video &&
    video.playbackStatus === "verified" &&
    video.youtubeVideoId &&
    VIDEO_ID_PATTERN.test(video.youtubeVideoId)
  );
}

export function createTeoyubeWorldYouTubeEmbedUrl(video) {
  if (!isVerifiedTeoyubeWorldVideo(video)) return null;
  const parameters = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1"
  });
  return `https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?${parameters.toString()}`;
}

export function validateTeoyubeWorldYouTubeFeed(feed) {
  if (
    !feed ||
    feed.officialChannel?.id !== OFFICIAL_CHANNEL_ID ||
    feed.officialChannel?.url !== OFFICIAL_CHANNEL_URL ||
    !Array.isArray(feed.items) ||
    !feed.items.length
  ) return false;

  const ids = new Set();
  const videoIds = new Set();
  for (const video of feed.items) {
    if (!video?.id || ids.has(video.id) || !Number.isInteger(video.order)) return false;
    ids.add(video.id);
    if (video.playbackStatus === "verified") {
      if (
        !VIDEO_ID_PATTERN.test(video.youtubeVideoId || "") ||
        video.youtubeWatchUrl !== `https://www.youtube.com/watch?v=${video.youtubeVideoId}` ||
        videoIds.has(video.youtubeVideoId)
      ) return false;
      videoIds.add(video.youtubeVideoId);
    }
  }
  return true;
}