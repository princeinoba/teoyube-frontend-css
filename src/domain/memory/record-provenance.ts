export type RecordCapability = "journal" | "testimony" | "book";

export type RecordProvenance = Readonly<{
  sourceCapability: RecordCapability;
  sourceRecordId: string | null;
  sourceLocation: string;
  scriptureReferences: readonly string[];
  createdAt: string;
  userAuthored: boolean;
  userApproved: boolean;
  sessionOnly: true;
  durableWritePerformed: false;
  rawPrivateTextLogged: false;
}>;

export type ReversibleRecordState = Readonly<{
  revision: number;
  reversible: true;
  removed: boolean;
  previousLifecycle: string | null;
}>;

export function createRecordProvenance(input: {
  sourceCapability: RecordCapability;
  sourceRecordId?: string | null;
  sourceLocation: string;
  scriptureReferences?: readonly string[];
  createdAt: string;
  userAuthored?: boolean;
  userApproved?: boolean;
}): RecordProvenance {
  return Object.freeze({
    sourceCapability: input.sourceCapability,
    sourceRecordId: input.sourceRecordId ?? null,
    sourceLocation: input.sourceLocation,
    scriptureReferences: Object.freeze([...(input.scriptureReferences || [])]),
    createdAt: input.createdAt,
    userAuthored: input.userAuthored ?? true,
    userApproved: input.userApproved ?? false,
    sessionOnly: true,
    durableWritePerformed: false,
    rawPrivateTextLogged: false
  });
}

export function createReversibleRecordState(): ReversibleRecordState {
  return Object.freeze({ revision: 1, reversible: true, removed: false, previousLifecycle: null });
}
