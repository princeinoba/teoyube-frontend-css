import { TIG_WORD_SEEDS, type TeoyubeWordNode } from "../../tig";
import {
  getCoreTeoyubeVocabulary as getCoreTeoyubeVocabularyData,
  getScriptureCanonData
} from "../data/teoyube-data-access";
import {
  findPromiseClustersByTheme,
  findPromiseClustersByWord,
  getScriptureAnchorsForPromiseCluster,
  type TeoyubePromiseCluster
} from "../promises/promise-engine";
import { validateTheologyBoundaries } from "../theology/theology-framework";

export type TeoyubeVocabularyWord = {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  category: string;
  themes: string[];
  scriptureReferences: string[];
  promiseCategory?: string;
  prayerUse?: string;
  relatedWords: string[];
  promiseConnections: string[];
  source: "core_vocabulary" | "scripture_canon" | "tig_seed";
  raw: unknown;
};

export type TeoyubeWordCardContext = {
  word: TeoyubeVocabularyWord;
  scriptureAnchors: string[];
  promiseConnections: TeoyubePromiseCluster[];
  prayerUse?: string;
  callingLinks: string[];
  explanationPath: string[];
  valid: boolean;
  blockers: string[];
  warnings: string[];
};

type RawVocabularyWord = Record<string, unknown>;
type RawCanonWord = Record<string, unknown>;

const rawVocabulary = getCoreTeoyubeVocabularyData() as RawVocabularyWord[];
const rawCanon = getScriptureCanonData() as RawCanonWord[];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function tokenize(value: string): string[] {
  return unique(normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2));
}

function idForWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function normalizeVocabularyWord(raw: RawVocabularyWord): TeoyubeVocabularyWord {
  const word = asString(raw.word, asString(raw.teoyubeWord));
  return {
    id: asString(raw.id, idForWord(word)),
    word,
    pronunciation: asString(raw.pronunciation),
    meaning: asString(raw.meaning),
    category: asString(raw.category, asString(raw.promise_category, "Unknown")),
    themes: unique([asString(raw.category), asString(raw.promise_category)]),
    scriptureReferences: unique([
      ...asStringArray(raw.scriptureReferences),
      ...asStringArray(raw.scripture_sources)
    ]),
    promiseCategory: asString(raw.promise_category),
    prayerUse: asString(raw.prayer_use, asString(raw.prayerUse)),
    relatedWords: unique(asStringArray(raw.related_words)),
    promiseConnections: unique([asString(raw.promise_category)]),
    source: "core_vocabulary",
    raw
  };
}

function normalizeCanonWord(raw: RawCanonWord): TeoyubeVocabularyWord {
  const word = asString(raw.word, asString(raw.teoyubeWord));
  return {
    id: asString(raw.id, idForWord(word)),
    word,
    meaning: asString(raw.meaning),
    category: asString(raw.category, "Unknown"),
    themes: unique([...asStringArray(raw.scriptureThemes), asString(raw.category)]),
    scriptureReferences: unique(asStringArray(raw.scriptureReferences)),
    prayerUse: asString(raw.prayerUse),
    relatedWords: [],
    promiseConnections: unique([
      ...asStringArray(raw.clusterLinks),
      asString(raw.promiseStatement)
    ]),
    source: "scripture_canon",
    raw
  };
}

function normalizeTigWord(word: TeoyubeWordNode): TeoyubeVocabularyWord {
  return {
    id: word.id,
    word: word.word || word.title,
    meaning: word.description,
    category: word.tags[0] || "TIG",
    themes: word.tags,
    scriptureReferences: word.scriptureReferences,
    promiseCategory: word.promiseClusterIds[0],
    prayerUse: undefined,
    relatedWords: word.aliases,
    promiseConnections: word.promiseClusterIds,
    source: "tig_seed",
    raw: word
  };
}

export function getCoreTeoyubeWords(): TeoyubeVocabularyWord[] {
  const combined = [
    ...rawVocabulary.map(normalizeVocabularyWord),
    ...rawCanon.map(normalizeCanonWord),
    ...TIG_WORD_SEEDS.map(normalizeTigWord)
  ];
  return [...new Map(combined.map((word) => [normalize(word.word), word])).values()];
}

export function getCoreTeoyubeVocabulary(): TeoyubeVocabularyWord[] {
  return getCoreTeoyubeWords();
}

export function findTeoyubeWordById(id: string): TeoyubeVocabularyWord | undefined {
  const normalizedId = normalize(id);
  return getCoreTeoyubeVocabulary().find((word) =>
    [word.id, word.word].some((value) => normalize(value) === normalizedId)
  );
}

export function findTeoyubeWordsByTheme(theme: string): TeoyubeVocabularyWord[] {
  const normalizedTheme = normalize(theme);
  const tokens = tokenize(theme);
  if (!normalizedTheme) return [];

  return getCoreTeoyubeVocabulary().filter((word) =>
    {
      const searchable = [word.category, word.promiseCategory || "", ...word.themes, ...word.promiseConnections, ...word.relatedWords]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedTheme) || tokens.some((token) => searchable.includes(token));
    }
  );
}

export function findTeoyubeWordsByScripture(reference: string): TeoyubeVocabularyWord[] {
  const normalizedReference = normalize(reference);
  if (!normalizedReference) return [];

  return getCoreTeoyubeVocabulary().filter((word) =>
    getWordScriptureAnchors(word.id).some((anchor) => normalize(anchor).includes(normalizedReference))
  );
}

export function getWordScriptureAnchors(wordId: string): string[] {
  const word = findTeoyubeWordById(wordId);
  if (!word) return [];
  const clusterAnchors = word.promiseConnections.flatMap(getScriptureAnchorsForPromiseCluster);
  return unique([...word.scriptureReferences, ...clusterAnchors]);
}

export function getWordPromiseConnections(wordId: string): TeoyubePromiseCluster[] {
  const word = findTeoyubeWordById(wordId);
  if (!word) return [];
  const byConnection = word.promiseConnections.flatMap(findPromiseClustersByTheme);
  const byWord = findPromiseClustersByWord(word.word);
  return [...new Map([...byConnection, ...byWord].map((cluster) => [cluster.id, cluster])).values()];
}

export function validateTeoyubeWordAnchoring(word: TeoyubeVocabularyWord) {
  return validateTheologyBoundaries({
    scriptureReferences: getWordScriptureAnchors(word.id),
    explanationPath: [`${word.word} is mapped through ${word.source}.`],
    text: `${word.word} ${word.meaning}`
  });
}

export function createWordCardContext(wordId: string): TeoyubeWordCardContext {
  const word = findTeoyubeWordById(wordId) || getCoreTeoyubeVocabulary()[0];
  const promiseConnections = getWordPromiseConnections(word.id);
  const scriptureAnchors = getWordScriptureAnchors(word.id);
  const validation = validateTeoyubeWordAnchoring(word);

  return {
    word,
    scriptureAnchors,
    promiseConnections,
    prayerUse: word.prayerUse,
    callingLinks: promiseConnections.map((cluster) => cluster.callingConnection || cluster.theme).filter(Boolean),
    explanationPath: [
      `Loaded ${word.word} from ${word.source}.`,
      `Connected ${promiseConnections.length} promise cluster(s).`,
      `Found ${scriptureAnchors.length} Scripture anchor(s).`
    ],
    valid: validation.valid,
    blockers: validation.blockers,
    warnings: validation.warnings
  };
}
