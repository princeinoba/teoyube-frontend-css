import runtimeManifest from "../../../../public/media/teoyubeworld/pilot-v1/runtime-manifest.json";
import { APPROVED_TABLE_ROW_DETAILS } from "../../../app/_approved-source/approved-tables-row-details.generated";
import { APPROVED_VIEW_MARKUP } from "../../../app/_approved-source/approved-view-markup.generated";
import { MEDIA_DELIVERY_CONTRACT, type MediaAssetDto } from "../../../domain/media/media-contracts";
import { TEOYUBE_MEDIA_LIBRARY } from "../../../lib/teoyube/data-access";
import { EMBEDDED_VIDEOS_OFFICIAL_CHANNEL, getEmbeddedVideosYouTubeMapping } from "../embedded-videos-youtube";
import { renderApprovedMediaGrid, renderApprovedMediaStats } from "./embedded-video-tab-renderer";

type CapturedTab = Readonly<{ grid: string; stats: string }>;
type CapturedManagementTab = Readonly<{ rows: string; pagination: string; status: string | null; videoSourceHidden: boolean }>;

export type EmbeddedVideosPageViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  tabs: Readonly<Record<string, CapturedTab>>;
  media: readonly MediaAssetDto[];
  delivery: typeof MEDIA_DELIVERY_CONTRACT;
}>;

export type TablesPageViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  pages: Readonly<Record<string, string>>;
  rowDetails: Readonly<Record<string, string>>;
  managementTabs: Readonly<Record<string, CapturedManagementTab>>;
}>;

function originalMedia(): MediaAssetDto[] {
  const renderedIds: Readonly<Record<string, string>> = Object.freeze({
    media_seed_of_promise: "local-seed-of-promise",
    media_power_of_prayer: "local-power-of-prayer",
    media_walk_in_divine_purpose: "local-walk-in-purpose",
    media_rooted_in_truth: "local-rooted-in-truth",
    media_called_for_more: "local-called-for-more",
    media_strength_for_today: "local-strength-for-today"
  });
  const mapped = TEOYUBE_MEDIA_LIBRARY.map((record, index) => {
    const id = renderedIds[record.id] || record.id;
    const youtube = getEmbeddedVideosYouTubeMapping(id);
    return Object.freeze({
      id,
      title: record.title,
      description: record.description,
      category: record.category,
      scriptureReferences: Object.freeze([...record.scriptureReferences]),
      playbackUrl: null,
      posterUrl: "public/images/embed/embedded-videos-hero-bg.png",
      thumbnailUrl: "public/images/embed/embedded-videos-hero-bg.png",
      durationSeconds: null,
      sequenceTitle: null,
      sequenceOrder: null,
      mimeType: null,
      source: "original_local_preview",
      runtimeApproved: false,
      order: youtube?.order ?? index,
      channelUrl: youtube ? EMBEDDED_VIDEOS_OFFICIAL_CHANNEL.url : null,
      youtubeVideoId: youtube?.youtubeVideoId ?? null,
      youtubeWatchUrl: youtube?.youtubeWatchUrl ?? null,
      playbackStatus: youtube ? "verified" : "unavailable"
    }) satisfies MediaAssetDto;
  });
  const supplemental: MediaAssetDto[] = [
    {
      id: "local-promise-language",
      title: "Promise Language and Calling",
      description: "A local preview that keeps Teoyube words as memory aids, not Scripture replacements.",
      category: "Teaching",
      scriptureReferences: ["Ephesians 1:18", "Psalm 119:105"]
    },
    {
      id: "local-daily-assignment",
      title: "Daily Divine Assignment",
      description: "A local preview for translating Scripture, prayer, and calling into one faithful action.",
      category: "Message",
      scriptureReferences: ["Matthew 25:21", "Proverbs 16:3"]
    }
  ].map((record, index) => {
    const youtube = getEmbeddedVideosYouTubeMapping(record.id);
    return Object.freeze({
      ...record,
      playbackUrl: null,
      posterUrl: "public/images/embed/embedded-videos-hero-bg.png",
      thumbnailUrl: "public/images/embed/embedded-videos-hero-bg.png",
      durationSeconds: null,
      sequenceTitle: null,
      sequenceOrder: null,
      mimeType: null,
      source: "original_local_preview",
      runtimeApproved: false,
      order: youtube?.order ?? mapped.length + index,
      channelUrl: youtube ? EMBEDDED_VIDEOS_OFFICIAL_CHANNEL.url : null,
      youtubeVideoId: youtube?.youtubeVideoId ?? null,
      youtubeWatchUrl: youtube?.youtubeWatchUrl ?? null,
      playbackStatus: youtube ? "verified" : "unavailable"
    });
  });
  return [...mapped, ...supplemental];
}

function approvedMedia(): MediaAssetDto[] {
  return runtimeManifest.records.map((record, index) => Object.freeze({
    id: record.mediaId,
    title: record.title,
    description: record.description,
    category: record.mediaKind,
    scriptureReferences: Object.freeze([record.ScriptureReference]),
    playbackUrl: record.plannedPublicCardUrl,
    posterUrl: record.plannedPublicPosterUrl,
    thumbnailUrl: record.plannedPublicThumbnailUrl,
    durationSeconds: record.durationSeconds,
    sequenceTitle: record.sequenceTitle,
    sequenceOrder: record.sequenceOrder,
    mimeType: "video/mp4",
    source: "approved_teoyubeworld_pilot",
    runtimeApproved: record.validationState === "validated" && record.ownerReviewState === "confirmed",
    order: index,
    channelUrl: null,
    youtubeVideoId: null,
    youtubeWatchUrl: null,
    playbackStatus: "local"
  }));
}

export function createEmbeddedVideosPageViewModel(): EmbeddedVideosPageViewModel {
  const original = originalMedia();
  const approved = approvedMedia();
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.embeddedVideos.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    tabs: Object.freeze({
      ...APPROVED_VIEW_MARKUP.embeddedVideos.tabs,
      "TeoyubeWorld Media": Object.freeze({
        grid: renderApprovedMediaGrid(approved),
        stats: renderApprovedMediaStats(approved.length)
      })
    }),
    media: Object.freeze([...original, ...approved]),
    delivery: MEDIA_DELIVERY_CONTRACT
  });
}

export function createTablesPageViewModel(): TablesPageViewModel {
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.tables.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    pages: APPROVED_VIEW_MARKUP.tables.pages,
    rowDetails: APPROVED_TABLE_ROW_DETAILS.rows,
    managementTabs: APPROVED_VIEW_MARKUP.tables.managementTabs
  });
}

export function createOwnerRoadmapViewModel() {
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.roadmap.initial,
    qaPanelHtml: APPROVED_VIEW_MARKUP.roadmap.qaPanel,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    ownerOnly: true,
    normalNavigation: false
  });
}
