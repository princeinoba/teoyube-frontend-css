import scriptureCanonJson from "../../../data/scriptureCanon.json";
import type { ScriptureCanonEntry, ScriptureRepository } from "../../../domain/scripture/scripture-repository";

type SourceEntry = Readonly<{
  id?: string;
  teoyubeWord?: string;
  word?: string;
  meaning?: string;
  category?: string;
  scriptureReferences?: readonly string[];
  promiseStatement?: string;
}>;

const entries: readonly ScriptureCanonEntry[] = (scriptureCanonJson as readonly SourceEntry[]).map((entry, index) => Object.freeze({
  id: entry.id || `scripture-canon-${index + 1}`,
  word: entry.teoyubeWord || entry.word || "",
  meaning: entry.meaning || "",
  category: entry.category || "",
  scriptureReferences: Object.freeze([...(entry.scriptureReferences || [])]),
  promiseStatement: entry.promiseStatement || ""
}));

export function createLocalScriptureRepository(): ScriptureRepository {
  return {
    listCanonEntries: () => entries,
    findCanonEntryById: (id) => entries.find((entry) => entry.id === id),
    findCanonEntriesByReference: (reference) => entries.filter((entry) => entry.scriptureReferences.includes(reference)),
    hasReference: (reference) => entries.some((entry) => entry.scriptureReferences.includes(reference))
  };
}
