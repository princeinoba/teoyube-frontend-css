export type CanonJourneyMediaDto = Readonly<{
  canonItemId: string;
  journeyTitle: string;
  status: "In Progress" | "Completed" | "Planning" | "Review" | "On Hold";
  mediaId: string;
  mediaTitle: string;
  channelUrl: string;
  youtubeVideoId: string;
  youtubeWatchUrl: string;
  playbackStatus: "verified";
}>;

export type CanonViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  canonicalEntryCount: number;
  promiseClusterCount: number;
  activeTab: string;
  media: readonly CanonJourneyMediaDto[];
}>;
