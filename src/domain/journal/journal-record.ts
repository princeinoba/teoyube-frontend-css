import { createRecordProvenance, createReversibleRecordState, type RecordProvenance, type ReversibleRecordState } from "../memory/record-provenance";

export type JournalRecord = Readonly<{
  id: string;
  kind: "private_chronological_reflection";
  summary: string;
  scriptureReferences: readonly string[];
  createdAt: string;
  testimonyCandidateState: "not_proposed" | "proposed" | "rejected";
  provenance: RecordProvenance;
  state: ReversibleRecordState;
}>;

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "reflection";
}

export function summarizePrivateReflection(text: string, fallback = "Reflection captured for this in-memory session."): string {
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  const redacted = trimmed
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted phone]");
  return redacted.length > 180 ? `${redacted.slice(0, 177)}...` : redacted;
}

export function createJournalRecord(input: {
  text: string;
  scriptureReferences?: readonly string[];
  createdAt: string;
}): JournalRecord {
  const summary = summarizePrivateReflection(input.text);
  const scriptureReferences = Object.freeze([...(input.scriptureReferences || [])]);
  return Object.freeze({
    id: `journal_entry_${safeId(`${scriptureReferences[0] || "reflection"}_${input.createdAt}`)}`,
    kind: "private_chronological_reflection",
    summary,
    scriptureReferences,
    createdAt: input.createdAt,
    testimonyCandidateState: "not_proposed",
    provenance: createRecordProvenance({
      sourceCapability: "journal",
      sourceLocation: "session:journal",
      scriptureReferences,
      createdAt: input.createdAt,
      userApproved: true
    }),
    state: createReversibleRecordState()
  });
}
