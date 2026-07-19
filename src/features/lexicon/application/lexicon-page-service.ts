import { APPROVED_VIEW_MARKUP } from "../../../app/_approved-source/approved-view-markup.generated";
import coreTeoyubeVocabulary from "../../../data/coreTeoyubeVocabulary.json";
import coreTeoyubeVocabularyPart2 from "../../../data/coreTeoyubeVocabulary-part2.json";
import coreTeoyubeVocabularyPart3 from "../../../data/coreTeoyubeVocabulary-part3.json";
import { createLexiconEntry, LEXICON_AUTHORITY, type LexiconEntry } from "../../../domain/lexicon/lexicon-entry";
import { getAllPromiseClusters, getAllTeoyubeWords, type NormalizedTeoyubeWord } from "../../../lib/teoyube/data-access";

export type LexiconPageViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  entries: readonly LexiconEntry[];
  authorityNotice: typeof LEXICON_AUTHORITY;
}>;

const NORMATIVE_CORE_METADATA = Object.freeze([
  ["AGAPE", "Beginner", "Promise Word"], ["DUNAMIS", "Intermediate", "Action Word"], ["BASILEIA", "Advanced", "Root Word"],
  ["MARTURIA", "Intermediate", "Legacy Word"], ["DISCIPLA", "Intermediate", "Action Word"], ["EVANGELA", "Intermediate", "Action Word"],
  ["PRAYERA", "Beginner", "Action Word"], ["COMPASSIA", "Intermediate", "Action Word"], ["HOLIA", "Advanced", "Identity Word"],
  ["RIGHTEA", "Advanced", "Identity Word"], ["FRUITA", "Intermediate", "Legacy Word"], ["AUTHORIA", "Advanced", "Action Word"],
  ["KAINOS", "Beginner", "Identity Word"], ["RENEWA", "Beginner", "Identity Word"], ["SANCTA", "Advanced", "Identity Word"],
  ["GROWTHA", "Beginner", "Action Word"], ["MATURA", "Intermediate", "Identity Word"], ["HUMILIA", "Intermediate", "Identity Word"],
  ["PATIENA", "Intermediate", "Action Word"], ["PERSEVA", "Intermediate", "Action Word"], ["COURAGA", "Beginner", "Action Word"],
  ["FREEDOMA", "Beginner", "Identity Word"], ["PURITA", "Advanced", "Identity Word"], ["TRANSFORMA", "Master", "Root Word"],
  ["HERITA", "Advanced", "Root Word"], ["REWARDA", "Advanced", "Legacy Word"], ["IMPACTA", "Intermediate", "Legacy Word"],
  ["LEGACIA", "Master", "Legacy Word"], ["MULTIPLA", "Advanced", "Legacy Word"], ["BLESSIA", "Beginner", "Promise Word"],
  ["GENERA", "Advanced", "Legacy Word"], ["TESTIMA", "Intermediate", "Legacy Word"], ["FULFILLA", "Master", "Legacy Word"],
  ["COMPLETA", "Master", "Legacy Word"], ["ZOE", "Beginner", "Promise Word"], ["GLORIA", "Master", "Root Word"]
].map(([word, wordLevel, grammarRole], index) => Object.freeze({ word, wordRank: index + 37, wordLevel, grammarRole })));

const NORMATIVE_BY_WORD = new Map(NORMATIVE_CORE_METADATA.map((entry) => [entry.word, entry]));
const SOURCE_METADATA_BY_WORD = new Map(
  [...coreTeoyubeVocabulary, ...coreTeoyubeVocabularyPart2, ...coreTeoyubeVocabularyPart3]
    .map((entry) => [entry.word.toLowerCase(), entry as Record<string, unknown>] as const)
);

function sourceString(source: Record<string, unknown> | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function sourceList(source: Record<string, unknown> | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = source?.[key];
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  }
  return [];
}

function sourceNumber(source: Record<string, unknown> | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function stringValue(record: NormalizedTeoyubeWord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key] ?? record.original[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function stringList(record: NormalizedTeoyubeWord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key] ?? record.original[key];
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  }
  return [];
}

function numberValue(record: NormalizedTeoyubeWord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key] ?? record.original[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function mapEntry(record: NormalizedTeoyubeWord): LexiconEntry {
  const sourceMetadata = SOURCE_METADATA_BY_WORD.get(record.word.toLowerCase());
  const scriptures = record.scriptureReferences.length ? record.scriptureReferences : ["Ephesians 1:18"];
  const normative = NORMATIVE_BY_WORD.get(record.word.toUpperCase());
  const relatedWords = stringList(record, "word_combinations", "wordCombinations", "related_words", "relatedWords").length
    ? stringList(record, "word_combinations", "wordCombinations", "related_words", "relatedWords")
    : sourceList(sourceMetadata, "word_combinations", "related_words");
  const promiseClusters = stringList(record, "promise_clusters", "promiseClusters", "relatedPromiseClusters").length
    ? stringList(record, "promise_clusters", "promiseClusters", "relatedPromiseClusters")
    : sourceList(sourceMetadata, "promise_clusters");
  const resolvedPromiseClusters = promiseClusters.length ? promiseClusters : getAllPromiseClusters()
    .filter((cluster) => cluster.coreWords.some((word) => word.toLowerCase() === record.word.toLowerCase()))
    .map((cluster) => cluster.title);
  const promiseCategory = record.promiseCategory || sourceString(sourceMetadata, "promise_category", "promiseCategory");
  const prayerUse = record.prayerUse || sourceString(sourceMetadata, "prayer_use", "prayerUse");
  const grammarRole = stringValue(record, "grammar_role", "grammarRole", "part_of_speech", "represents")
    || sourceString(sourceMetadata, "grammar_role", "part_of_speech", "represents")
    || normative?.grammarRole
    || record.category;
  const prayerSequence = stringValue(record, "prayer_sequence", "prayerSequence") || (
    grammarRole === "Promise Word" ? "Scripture -> Promise -> Prayer"
      : grammarRole === "Identity Word" ? "Scripture -> Renewal -> Identity"
        : grammarRole === "Legacy Word" ? "Faithfulness -> Testimony -> Legacy"
          : grammarRole === "Root Word" ? "Revelation -> Promise -> Purpose"
            : "Revelation -> Calling -> Action"
  );
  return createLexiconEntry({
    id: record.id,
    word: record.word,
    pronunciation: stringValue(record, "pronunciation") || sourceString(sourceMetadata, "pronunciation"),
    meaning: record.meaning,
    category: record.category,
    wordRank: numberValue(record, "word_rank", "wordRank") ?? sourceNumber(sourceMetadata, "word_rank", "lexicon_number") ?? normative?.wordRank ?? null,
    wordLevel: stringValue(record, "word_level", "wordLevel", "level") || sourceString(sourceMetadata, "word_level", "level") || normative?.wordLevel || "Beginner",
    scriptureSources: scriptures,
    promiseCategory,
    prayerUse,
    prayerSequence,
    wordCombinations: relatedWords.map((word) => word.includes("+") ? word : `${record.word} + ${word}`),
    promiseClusters: resolvedPromiseClusters,
    callingAssociations: stringList(record, "calling_associations", "callingAssociations").length
      ? stringList(record, "calling_associations", "callingAssociations")
      : sourceList(sourceMetadata, "calling_associations").length
        ? sourceList(sourceMetadata, "calling_associations")
        : [record.category, promiseCategory].filter(Boolean),
    animationSymbol: stringValue(record, "animation_symbol", "animationSymbol", "symbol") || sourceString(sourceMetadata, "animation_symbol", "symbol"),
    grammarRole
  });
}

export function createLexiconPageViewModel(): LexiconPageViewModel {
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.lexicon.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    entries: Object.freeze(getAllTeoyubeWords().map(mapEntry)),
    authorityNotice: LEXICON_AUTHORITY
  });
}
