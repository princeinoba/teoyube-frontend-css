export type LexiconAuthority = Readonly<{
  kind: "scripture_derived_aid";
  label: "Scripture-derived aid, not Scripture";
  isScripture: false;
}>;

export type LexiconEntry = Readonly<{
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  category: string;
  wordRank: number | null;
  wordLevel: string;
  scriptureSources: readonly string[];
  promiseCategory: string;
  prayerUse: string;
  prayerSequence: string;
  wordCombinations: readonly string[];
  promiseClusters: readonly string[];
  callingAssociations: readonly string[];
  animationSymbol: string;
  grammarRole: string;
  authority: LexiconAuthority;
}>;

export const LEXICON_AUTHORITY = Object.freeze({
  kind: "scripture_derived_aid",
  label: "Scripture-derived aid, not Scripture",
  isScripture: false
}) satisfies LexiconAuthority;

export function createLexiconEntry(input: Omit<LexiconEntry, "authority">): LexiconEntry {
  if (!input.word.trim()) throw new Error("A Lexicon entry requires a word.");
  if (!input.scriptureSources.length) throw new Error(`${input.word} requires at least one Scripture source.`);
  return Object.freeze({
    ...input,
    scriptureSources: Object.freeze([...input.scriptureSources]),
    wordCombinations: Object.freeze([...input.wordCombinations]),
    promiseClusters: Object.freeze([...input.promiseClusters]),
    callingAssociations: Object.freeze([...input.callingAssociations]),
    authority: LEXICON_AUTHORITY
  });
}
