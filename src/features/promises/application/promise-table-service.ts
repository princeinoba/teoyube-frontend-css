import type { PromiseRepository } from "../../../domain/promises/promise-repository";
import { APPROVED_VIEW_MARKUP } from "../../../app/_approved-source/approved-view-markup.generated";
import type { PromiseTableViewModel } from "../contracts";

export function createApprovedPromiseTableViewModel(repository: PromiseRepository): PromiseTableViewModel {
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.table.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    rows: repository.listSaved(),
    clusterCount: repository.listClusters().length
  });
}
