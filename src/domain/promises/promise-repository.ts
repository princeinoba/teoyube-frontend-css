export const PROMISE_STATUSES = [
  "Discovered",
  "Studying",
  "Praying",
  "Acting",
  "Witnessing Progress",
  "Testified",
  "Remembered"
] as const;

export type PromiseStatus = (typeof PROMISE_STATUSES)[number];
export type PromiseLevel = "A" | "B" | "C";

export type PromiseSource = Readonly<{
  kind: "today" | "search" | "canon" | "manual";
  label: string;
  sourceId: string;
  scriptureReferences: readonly string[];
}>;

export type PromiseRecord = Readonly<{
  id: string;
  title: string;
  scriptureReference: string;
  promiseLevel: PromiseLevel;
  explanation: string;
  status: PromiseStatus;
  source: PromiseSource;
  notes: string;
}>;

export type PromiseStatusTransition = Readonly<{
  recordId: string;
  previousStatus: PromiseStatus;
  nextStatus: PromiseStatus;
}>;

export interface PromiseRepository {
  listClusters(): readonly PromiseRecord[];
  listSaved(): readonly PromiseRecord[];
  findSavedById(id: string): PromiseRecord | undefined;
  save(record: PromiseRecord): PromiseRecord;
  updateStatus(id: string, status: PromiseStatus): PromiseStatusTransition | undefined;
  undoLastStatusTransition(id: string): PromiseStatusTransition | undefined;
  remove(id: string): PromiseRecord | undefined;
  restore(record: PromiseRecord): PromiseRecord;
}
