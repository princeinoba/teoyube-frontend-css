import coreVocabularyData from "../../../data/coreTeoyubeVocabulary.json";
import promiseClustersData from "../../../data/promiseClusters.json";
import scriptureCanonData from "../../../data/scriptureCanon.json";
import type {
  TeoyubeNormalizedDataSnapshot,
  TeoyubePromiseCluster,
  TeoyubeScriptureAnchor,
  TeoyubeScriptureCanonEntry,
  TeoyubeTheme,
  TeoyubeVocabularyItem
} from "./teoyube-data-contracts";

type RawRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function idFor(value: string, fallback: string): string {
  const base = value || fallback;
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || fallback;
}

export function normalizeScriptureAnchors(input: unknown): TeoyubeScriptureAnchor[] {
  return unique(asStringArray(input));
}

export function normalizeThemeList(input: unknown): TeoyubeTheme[] {
  return unique(asStringArray(input));
}

export function normalizeConnectionList(input: unknown): string[] {
  return unique(asStringArray(input));
}

export function normalizeVocabularyItem(item: unknown): TeoyubeVocabularyItem {
  const raw = (item || {}) as RawRecord;
  const word = asString(raw.word, asString(raw.teoyubeWord, "Teoyube Word"));
  const category = asString(raw.category, asString(raw.promise_category, "Unknown"));
  const scriptureReferences = unique([
    ...normalizeScriptureAnchors(raw.scriptureReferences),
    ...normalizeScriptureAnchors(raw.scripture_sources)
  ]);

  return {
    ...raw,
    id: asString(raw.id, idFor(word, "teoyube_word")),
    word,
    teoyubeWord: asString(raw.teoyubeWord, word),
    pronunciation: asString(raw.pronunciation),
    meaning: asString(raw.meaning),
    category,
    themes: unique([category, asString(raw.promise_category)]),
    scriptureReferences,
    scripture_sources: normalizeScriptureAnchors(raw.scripture_sources),
    promise_category: asString(raw.promise_category),
    prayer_use: asString(raw.prayer_use, asString(raw.prayerUse)),
    related_words: normalizeConnectionList(raw.related_words),
    sourceFile: "src/data/coreTeoyubeVocabulary.json",
    original: item
  };
}

export function normalizePromiseCluster(cluster: unknown): TeoyubePromiseCluster {
  const raw = (cluster || {}) as RawRecord;
  const title = asString(raw.title, asString(raw.name, asString(raw.theme, "Promise Cluster")));
  const theme = asString(raw.theme, asString(raw.promise_category, title));
  const scriptureReferences = unique([
    ...normalizeScriptureAnchors(raw.scriptureReferences),
    ...normalizeScriptureAnchors(raw.scripture_references),
    asString(raw.anchorScripture),
    asString(raw.anchor_scripture)
  ]);

  return {
    ...raw,
    id: asString(raw.id, asString(raw.cluster_id, idFor(title, "promise_cluster"))),
    cluster_id: asString(raw.cluster_id),
    title,
    name: asString(raw.name, title),
    theme,
    description: asString(raw.description, asString(raw.summary)),
    scriptureReferences,
    scripture_references: normalizeScriptureAnchors(raw.scripture_references),
    anchorScripture: asString(raw.anchorScripture, scriptureReferences[0] || ""),
    anchor_scripture: asString(raw.anchor_scripture, scriptureReferences[0] || ""),
    coreWords: unique([
      ...normalizeConnectionList(raw.coreWords),
      ...normalizeConnectionList(raw.core_words),
      ...normalizeConnectionList(raw.related_teoyube_words),
      ...normalizeConnectionList(raw.keywords)
    ]),
    core_words: normalizeConnectionList(raw.core_words),
    related_teoyube_words: normalizeConnectionList(raw.related_teoyube_words),
    prayerSequence: unique([
      ...normalizeConnectionList(raw.prayerSequence),
      ...normalizeConnectionList(raw.prayer_sequence)
    ]),
    prayer_sequence: normalizeConnectionList(raw.prayer_sequence),
    declaration: asString(raw.declaration, asString(raw.promiseStatement)),
    calling_connection: asString(raw.calling_connection),
    sourceFile: "src/data/promiseClusters.json",
    original: cluster
  };
}

export function normalizeScriptureCanonEntry(entry: unknown): TeoyubeScriptureCanonEntry {
  const raw = (entry || {}) as RawRecord;
  const word = asString(raw.word, asString(raw.teoyubeWord, "Scripture Word"));

  return {
    ...raw,
    id: asString(raw.id, idFor(word, "scripture_canon")),
    word,
    teoyubeWord: asString(raw.teoyubeWord, word),
    meaning: asString(raw.meaning),
    category: asString(raw.category, "Unknown"),
    scriptureReferences: normalizeScriptureAnchors(raw.scriptureReferences),
    scriptureThemes: normalizeThemeList(raw.scriptureThemes),
    promiseStatement: asString(raw.promiseStatement),
    archetypeLinks: normalizeConnectionList(raw.archetypeLinks),
    pathLinks: normalizeConnectionList(raw.pathLinks),
    clusterLinks: normalizeConnectionList(raw.clusterLinks),
    prayerUse: asString(raw.prayerUse),
    graphTags: normalizeConnectionList(raw.graphTags),
    sourceFile: "src/data/scriptureCanon.json",
    original: entry
  };
}

export function createNormalizedTeoyubeDataSnapshot(): TeoyubeNormalizedDataSnapshot {
  return {
    vocabulary: (coreVocabularyData as unknown[]).map(normalizeVocabularyItem),
    promiseClusters: (promiseClustersData as unknown[]).map(normalizePromiseCluster),
    scriptureCanon: (scriptureCanonData as unknown[]).map(normalizeScriptureCanonEntry),
    generatedAt: new Date().toISOString(),
    sourceFiles: [
      "src/data/coreTeoyubeVocabulary.json",
      "src/data/promiseClusters.json",
      "src/data/scriptureCanon.json"
    ]
  };
}
