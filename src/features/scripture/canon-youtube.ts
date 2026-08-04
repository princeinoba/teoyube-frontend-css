import {
  EMBEDDED_VIDEOS_OFFICIAL_CHANNEL,
  createEmbeddedVideosYouTubeEmbedUrl,
  getEmbeddedVideosYouTubeMapping
} from "../media";
import type { CanonJourneyMediaDto } from "./canon-contracts";

type CanonJourneyMediaDefinition = Readonly<{
  canonItemId: string;
  journeyTitle: string;
  status: CanonJourneyMediaDto["status"];
  mediaId: string;
}>;

const definitions = Object.freeze([
  Object.freeze({ canonItemId: "canon-map-D02", journeyTitle: "The Chosen Sonship Journey", status: "In Progress", mediaId: "local-rooted-in-truth" }),
  Object.freeze({ canonItemId: "canon-map-D03", journeyTitle: "The Chosen Leadership Journey", status: "Completed", mediaId: "local-called-for-more" }),
  Object.freeze({ canonItemId: "canon-map-D04", journeyTitle: "The Builder Stewardship Journey", status: "Planning", mediaId: "local-seed-of-promise" }),
  Object.freeze({ canonItemId: "canon-map-D05", journeyTitle: "The Builder Legacy Journey", status: "In Progress", mediaId: "local-promise-language" }),
  Object.freeze({ canonItemId: "canon-map-D06", journeyTitle: "The Builder Kingdom Maturity Journey", status: "Review", mediaId: "local-walk-in-purpose" }),
  Object.freeze({ canonItemId: "canon-map-D07", journeyTitle: "The Lightbearer Wisdom Journey", status: "Completed", mediaId: "local-strength-for-today" }),
  Object.freeze({ canonItemId: "canon-map-D08", journeyTitle: "The Lightbearer Protection Journey", status: "On Hold", mediaId: "local-rooted-in-truth" }),
  Object.freeze({ canonItemId: "canon-map-D09", journeyTitle: "The Lightbearer Dominion Journey", status: "In Progress", mediaId: "local-called-for-more" }),
  Object.freeze({ canonItemId: "canon-map-D10", journeyTitle: "The Healer Healing Journey", status: "Planning", mediaId: "local-power-of-prayer" }),
  Object.freeze({ canonItemId: "canon-map-D11", journeyTitle: "The Healer Authority Journey", status: "Review", mediaId: "local-strength-for-today" }),
  Object.freeze({ canonItemId: "canon-map-D12", journeyTitle: "The Healer Service Journey", status: "In Progress", mediaId: "local-daily-assignment" })
] satisfies readonly CanonJourneyMediaDefinition[]);

function mediaTitle(mediaId: string) {
  return mediaId === "local-rooted-in-truth" ? "Rooted in His Word" :
    mediaId === "local-walk-in-purpose" ? "Walk in Divine Purpose" :
    mediaId === "local-seed-of-promise" ? "The Seed of Promise" :
    mediaId === "local-power-of-prayer" ? "The Power of Prayer" :
    mediaId === "local-called-for-more" ? "Called for More" :
    mediaId === "local-strength-for-today" ? "Strength for Today" :
    mediaId === "local-promise-language" ? "Promise Language and Calling" :
    "Daily Divine Assignment";
}

function createMapping(definition: CanonJourneyMediaDefinition): CanonJourneyMediaDto {
  const source = getEmbeddedVideosYouTubeMapping(definition.mediaId);
  if (!source) throw new Error(`Missing verified TeoyubeWorld media mapping for ${definition.mediaId}.`);
  return Object.freeze({
    ...definition,
    mediaTitle: mediaTitle(source.id),
    channelUrl: EMBEDDED_VIDEOS_OFFICIAL_CHANNEL.url,
    youtubeVideoId: source.youtubeVideoId,
    youtubeWatchUrl: source.youtubeWatchUrl,
    playbackStatus: source.playbackStatus
  });
}

export const CANON_JOURNEY_YOUTUBE_MAPPINGS = Object.freeze(definitions.map(createMapping));

const mappingByItemId = new Map(CANON_JOURNEY_YOUTUBE_MAPPINGS.map((mapping) => [mapping.canonItemId, mapping]));

export function getCanonJourneyYouTubeMapping(canonItemId: string) {
  return mappingByItemId.get(canonItemId);
}

export function createCanonJourneyYouTubeEmbedUrl(mapping: CanonJourneyMediaDto | undefined) {
  if (!mapping || mapping.playbackStatus !== "verified") return null;
  const expected = getCanonJourneyYouTubeMapping(mapping.canonItemId);
  if (!expected || expected.mediaId !== mapping.mediaId || expected.mediaTitle !== mapping.mediaTitle ||
    expected.channelUrl !== mapping.channelUrl || expected.youtubeVideoId !== mapping.youtubeVideoId ||
    expected.youtubeWatchUrl !== mapping.youtubeWatchUrl) return null;
  return createEmbeddedVideosYouTubeEmbedUrl({
    id: mapping.mediaId,
    title: mapping.mediaTitle,
    description: mapping.journeyTitle,
    category: "Canon journey",
    scriptureReferences: [],
    playbackUrl: null,
    posterUrl: "",
    thumbnailUrl: "",
    durationSeconds: null,
    sequenceTitle: null,
    sequenceOrder: null,
    mimeType: null,
    source: "original_local_preview",
    runtimeApproved: false,
    order: getEmbeddedVideosYouTubeMapping(mapping.mediaId)?.order ?? -1,
    channelUrl: mapping.channelUrl,
    youtubeVideoId: mapping.youtubeVideoId,
    youtubeWatchUrl: mapping.youtubeWatchUrl,
    playbackStatus: mapping.playbackStatus
  });
}

export function validateCanonJourneyYouTubeMappings() {
  const statuses = new Set(CANON_JOURNEY_YOUTUBE_MAPPINGS.map((mapping) => mapping.status));
  return CANON_JOURNEY_YOUTUBE_MAPPINGS.length === 11 &&
    mappingByItemId.size === CANON_JOURNEY_YOUTUBE_MAPPINGS.length &&
    statuses.size === 5 &&
    CANON_JOURNEY_YOUTUBE_MAPPINGS.every((mapping) => Boolean(createCanonJourneyYouTubeEmbedUrl(mapping)));
}