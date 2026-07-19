import type { JournalRecord } from "../journal/journal-record";
import { createRecordProvenance, createReversibleRecordState, type RecordProvenance, type ReversibleRecordState } from "../memory/record-provenance";

export type TestimonyLifecycle = "candidate" | "draft" | "private" | "published" | "rejected";
export type TestimonyRecord = Readonly<{
  id: string;
  title: string;
  category: string;
  body: string;
  lifecycle: TestimonyLifecycle;
  scriptureReferences: readonly string[];
  createdAt: string;
  userReviewed: boolean;
  promiseFulfillment: "not_declared" | "user_declared";
  divineActionAttribution: "user_authored_unverified";
  editable: true;
  rejectable: true;
  provenance: RecordProvenance;
  state: ReversibleRecordState;
}>;

export type UserConfirmation = Readonly<{ actor: "user"; confirmed: true }>;

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "user_recorded";
}

export function createTestimonyDraft(input: {
  title: string;
  category: string;
  body: string;
  scriptureReferences?: readonly string[];
  createdAt: string;
  sourceJournal?: JournalRecord;
}): TestimonyRecord {
  const lifecycle = input.sourceJournal ? "candidate" : "draft";
  const scriptureReferences = Object.freeze([...(input.scriptureReferences || input.sourceJournal?.scriptureReferences || [])]);
  return Object.freeze({
    id: `testimony_${safeId(input.title || input.createdAt)}`,
    title: input.title.trim() || "User-recorded testimony draft",
    category: input.category || "Faith",
    body: input.body.trim() || "User-recorded testimony draft. Teoyube does not certify fulfillment.",
    lifecycle,
    scriptureReferences,
    createdAt: input.createdAt,
    userReviewed: false,
    promiseFulfillment: "not_declared",
    divineActionAttribution: "user_authored_unverified",
    editable: true,
    rejectable: true,
    provenance: createRecordProvenance({
      sourceCapability: input.sourceJournal ? "journal" : "testimony",
      sourceRecordId: input.sourceJournal?.id,
      sourceLocation: input.sourceJournal ? "session:journal-candidate" : "session:testimony-form",
      scriptureReferences,
      createdAt: input.createdAt,
      userApproved: false
    }),
    state: createReversibleRecordState()
  });
}

export function editTestimony(record: TestimonyRecord, changes: Partial<Pick<TestimonyRecord, "title" | "category" | "body">>): TestimonyRecord {
  return Object.freeze({ ...record, ...changes, state: Object.freeze({ ...record.state, revision: record.state.revision + 1 }) });
}

export function rejectTestimony(record: TestimonyRecord, confirmation: UserConfirmation): TestimonyRecord {
  if (!confirmation.confirmed) return record;
  return Object.freeze({ ...record, lifecycle: "rejected", state: Object.freeze({ ...record.state, revision: record.state.revision + 1, previousLifecycle: record.lifecycle }) });
}

export function restoreTestimony(record: TestimonyRecord, confirmation: UserConfirmation): TestimonyRecord {
  if (!confirmation.confirmed || !record.state.previousLifecycle) return record;
  return Object.freeze({ ...record, lifecycle: record.state.previousLifecycle as TestimonyLifecycle, state: Object.freeze({ ...record.state, revision: record.state.revision + 1, previousLifecycle: null, removed: false }) });
}

export function finalizeTestimony(record: TestimonyRecord, visibility: "private" | "published", confirmation: UserConfirmation): TestimonyRecord {
  if (!confirmation.confirmed) return record;
  return Object.freeze({
    ...record,
    lifecycle: visibility,
    userReviewed: true,
    provenance: Object.freeze({ ...record.provenance, userApproved: true }),
    state: Object.freeze({ ...record.state, revision: record.state.revision + 1, previousLifecycle: record.lifecycle })
  });
}

export function hydrateExistingUserTestimony(record: TestimonyRecord, lifecycle: "draft" | "private" | "published", evidence: "approved_static_user_record"): TestimonyRecord {
  const userReviewed = lifecycle !== "draft";
  return Object.freeze({
    ...record,
    lifecycle,
    userReviewed,
    provenance: Object.freeze({
      ...record.provenance,
      sourceLocation: `approved-static:${evidence}`,
      userApproved: userReviewed
    })
  });
}
