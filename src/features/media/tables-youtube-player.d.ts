export type TablesYouTubeVideo = Readonly<{
  id: string;
  canonicalMatchTitle: string;
  poster: string;
  duration: string;
  youtubeVideoId: string;
  youtubeWatchUrl: string;
  playbackStatus: string;
  order: number;
}>;

export type TablesYouTubeFeed = Readonly<{
  officialChannel: Readonly<{ id: string; name: string; url: string }>;
  items: readonly TablesYouTubeVideo[];
}>;

export type TablesYouTubePlayback = Readonly<{ destroy(): void }>;

export function createTablesYouTubeEmbedUrl(video: TablesYouTubeVideo | undefined): string | null;
export function validateTablesYouTubeFeed(feed: unknown): boolean;
export function createTablesYouTubePlayback(root: HTMLElement, feed: TablesYouTubeFeed): TablesYouTubePlayback;
export function initializeStaticTablesYouTubePlayback(): Promise<TablesYouTubePlayback | null>;
