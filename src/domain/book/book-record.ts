import { createRecordProvenance, createReversibleRecordState, type RecordProvenance, type ReversibleRecordState } from "../memory/record-provenance";
import type { TestimonyRecord, UserConfirmation } from "../testimony/testimony-record";

export type BookRecord = Readonly<{
  id: string;
  kind: "curated_spiritual_autobiography_milestone";
  sourceType: "testimony" | "prayer" | "lesson" | "calling_reflection" | "milestone";
  title: string;
  summary: string;
  scriptureReferences: readonly string[];
  createdAt: string;
  provenance: RecordProvenance;
  state: ReversibleRecordState;
}>;

export type BookPromotionResult = Readonly<{
  accepted: boolean;
  reason: string;
  record: BookRecord | null;
}>;

export function promoteTestimonyToBook(testimony: TestimonyRecord, confirmation: UserConfirmation): BookPromotionResult {
  if (!confirmation.confirmed || !testimony.userReviewed || !["private", "published"].includes(testimony.lifecycle)) {
    return Object.freeze({ accepted: false, reason: "A user-reviewed testimony requires explicit user confirmation before Book promotion.", record: null });
  }
  const record = Object.freeze({
    id: `book_${testimony.id}`,
    kind: "curated_spiritual_autobiography_milestone" as const,
    sourceType: "testimony" as const,
    title: testimony.title,
    summary: testimony.body,
    scriptureReferences: testimony.scriptureReferences,
    createdAt: testimony.createdAt,
    provenance: createRecordProvenance({
      sourceCapability: "testimony",
      sourceRecordId: testimony.id,
      sourceLocation: "session:explicit-book-promotion",
      scriptureReferences: testimony.scriptureReferences,
      createdAt: testimony.createdAt,
      userApproved: true
    }),
    state: createReversibleRecordState()
  });
  return Object.freeze({ accepted: true, reason: "Explicit user confirmation recorded for this session-only Book promotion.", record });
}

export function removeBookRecord(record: BookRecord, confirmation: UserConfirmation): BookRecord {
  if (!confirmation.confirmed) return record;
  return Object.freeze({ ...record, state: Object.freeze({ ...record.state, revision: record.state.revision + 1, removed: true, previousLifecycle: "curated" }) });
}

export function restoreBookRecord(record: BookRecord, confirmation: UserConfirmation): BookRecord {
  if (!confirmation.confirmed) return record;
  return Object.freeze({ ...record, state: Object.freeze({ ...record.state, revision: record.state.revision + 1, removed: false, previousLifecycle: null }) });
}
