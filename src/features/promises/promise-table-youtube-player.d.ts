export type PromiseTableYouTubeVideo = Readonly<{
  id: string;
  slug: string;
  canonicalMatchTitle: string;
  officialYouTubeTitle: string;
  description: string;
  category: string;
  poster: string;
  duration: string;
  viewCount: string;
  publicationLabel: string;
  scriptureReferences: readonly string[];
  youtubeVideoId: string | null;
  youtubeWatchUrl: string | null;
  playbackStatus: "verified" | "unavailable";
  playbackUnavailableReason: string | null;
  order: number;
}>;

export type PromiseTableYouTubeFeed = Readonly<{
  schemaVersion: number;
  officialChannel: Readonly<{ id: string; name: string; url: string }>;
  items: readonly PromiseTableYouTubeVideo[];
}>;

export type PromiseTableYouTubePlayback = Readonly<{
  destroy(): void;
  getActiveVideoId(): string | null;
  getSelectedVideoId(): string | null;
}>;

export function createPromiseTableYouTubeEmbedUrl(video: PromiseTableYouTubeVideo | undefined): string | null;
export function validatePromiseTableYouTubeFeed(feed: unknown): feed is PromiseTableYouTubeFeed;
export function createPromiseTableYouTubePlayback(root: HTMLElement, feed: unknown): PromiseTableYouTubePlayback;
export function initializeStaticPromiseTableYouTubePlayback(): Promise<PromiseTableYouTubePlayback | null>;
