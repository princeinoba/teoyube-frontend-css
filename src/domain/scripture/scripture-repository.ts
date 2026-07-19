export type ScriptureCanonEntry = Readonly<{
  id: string;
  word: string;
  meaning: string;
  category: string;
  scriptureReferences: readonly string[];
  promiseStatement: string;
}>;

export interface ScriptureRepository {
  listCanonEntries(): readonly ScriptureCanonEntry[];
  findCanonEntryById(id: string): ScriptureCanonEntry | undefined;
  findCanonEntriesByReference(reference: string): readonly ScriptureCanonEntry[];
  hasReference(reference: string): boolean;
}
