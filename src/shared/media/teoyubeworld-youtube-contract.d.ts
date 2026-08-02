export type TeoyubeWorldYouTubeVideo = Readonly<{
  id: string;
  youtubeVideoId?: string;
  youtubeWatchUrl?: string;
  playbackStatus: string;
  order: number;
}>;

export type TeoyubeWorldYouTubeFeed = Readonly<{
  officialChannel: Readonly<{ id: string; name: string; url: string }>;
  items: readonly TeoyubeWorldYouTubeVideo[];
}>;

export function isVerifiedTeoyubeWorldVideo(video: TeoyubeWorldYouTubeVideo | undefined): boolean;
export function createTeoyubeWorldYouTubeEmbedUrl(video: TeoyubeWorldYouTubeVideo | undefined): string | null;
export function validateTeoyubeWorldYouTubeFeed(feed: unknown): boolean;