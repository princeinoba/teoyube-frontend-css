import type { PromiseRepository } from "../../../domain/promises/promise-repository";
import type { ScriptureRepository } from "../../../domain/scripture/scripture-repository";
import { APPROVED_VIEW_MARKUP } from "../../../app/_approved-source/approved-view-markup.generated";
import type { CanonViewModel } from "../canon-contracts";
import { CANON_JOURNEY_YOUTUBE_MAPPINGS } from "../canon-youtube";

export function createApprovedCanonViewModel(
  scriptureRepository: ScriptureRepository,
  promiseRepository: PromiseRepository
): CanonViewModel {
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.canon.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    canonicalEntryCount: scriptureRepository.listCanonEntries().length,
    promiseClusterCount: promiseRepository.listClusters().length,
    activeTab: "canon-maps",
    media: CANON_JOURNEY_YOUTUBE_MAPPINGS
  });
}
