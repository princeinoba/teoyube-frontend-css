export type MediaAssetDto = Readonly<{
  id: string;
  title: string;
  description: string;
  category: string;
  scriptureReferences: readonly string[];
  playbackUrl: string | null;
  posterUrl: string;
  thumbnailUrl: string;
  mimeType: "video/mp4" | null;
  source: "original_local_preview" | "approved_teoyubeworld_pilot";
  runtimeApproved: boolean;
}>;

export type MediaDeliveryContract = Readonly<{
  playableMimeTypes: readonly ["video/mp4"];
  supportsByteRanges: true;
  immutablePublishedAssets: true;
  manifestNoStore: true;
  protectedPathPrefixes: readonly string[];
}>;

export const MEDIA_DELIVERY_CONTRACT = Object.freeze({
  playableMimeTypes: Object.freeze(["video/mp4"] as const),
  supportsByteRanges: true,
  immutablePublishedAssets: true,
  manifestNoStore: true,
  protectedPathPrefixes: Object.freeze(["/media-source", "/generated", "/.git", "/.media-tmp"])
}) satisfies MediaDeliveryContract;

export function isPublicMediaPath(path: string) {
  return path.startsWith("/media/teoyubeworld/pilot-v1/") && !path.includes("..") && !path.includes("\\");
}
