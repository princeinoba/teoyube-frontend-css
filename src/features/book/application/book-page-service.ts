import { APPROVED_VIEW_MARKUP } from "../../../app/_approved-source/approved-view-markup.generated";
import type { BookRecord } from "../../../domain/book/book-record";

export type BookPageViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  records: readonly BookRecord[];
  sessionOnly: true;
  requiresExplicitPromotionConfirmation: true;
}>;

export function createBookPageViewModel(): BookPageViewModel {
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.book.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    records: Object.freeze([]),
    sessionOnly: true,
    requiresExplicitPromotionConfirmation: true
  });
}
