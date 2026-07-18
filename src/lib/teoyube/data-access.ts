import coreTeoyubeVocabulary from "../../data/coreTeoyubeVocabulary.json";
import coreTeoyubeVocabularyPart2 from "../../data/coreTeoyubeVocabulary-part2.json";
import coreTeoyubeVocabularyPart3 from "../../data/coreTeoyubeVocabulary-part3.json";
import glyphDefinitions from "../../data/glyphDefinitions.json";
import graphRelationships from "../../data/graphRelationships.json";
import covenantPaths from "../../data/covenantPaths.json";
import kingdomArchetypes from "../../data/kingdomArchetypes.json";
import onboardingFlow from "../../data/onboardingFlow.json";
import prayerJourneys from "../../data/prayerJourneys.json";
import projectStructureRoadmap from "../../data/projectStructureRoadmap.json";
import promiseCategories from "../../data/promiseCategories.json";
import promiseClusters from "../../data/promiseClusters.json";
import scriptureCanon from "../../data/scriptureCanon.json";
import teoyubePromiseLanguageLexicon from "../../data/teoyubePromiseLanguageLexicon.json";
import teoyubeSearchFramework from "../../data/teoyubeSearchFramework.json";
import theologyConstitution from "../../data/theologyConstitution.json";
import tkosGrowthLevels from "../../data/tkosGrowthLevels.json";
import tkosSampleProfile from "../../data/tkosSampleProfile.json";
import { TIG_ACTION_STEP_SEEDS } from "../tig/seed/action-steps.seed";
import { TIG_JOURNEY_SEEDS } from "../tig/seed/journeys.seed";
import { TIG_PRAYER_SEQUENCE_SEEDS } from "../tig/seed/prayer-sequences.seed";

type UnknownRecord = Record<string, unknown>;

export type NormalizedTeoyubeWord = UnknownRecord & {
  id: string;
  word: string;
  teoyubeWord: string;
  meaning: string;
  category: string;
  scriptureReferences: string[];
  promiseCategory: string;
  prayerUse: string;
  relatedWords: string[];
  source: "core_vocabulary" | "scripture_canon" | "unknown";
  original: UnknownRecord;
};

export type NormalizedPromiseCluster = UnknownRecord & {
  id: string;
  name: string;
  title: string;
  theme: string;
  coreWords: string[];
  scriptureAnchors: string[];
  anchorScripture: string;
  declaration: string;
  source: "promise_clusters" | "unknown";
  original: UnknownRecord;
};

export type NormalizedScriptureRecord = UnknownRecord & {
  id: string;
  reference: string;
  word: string;
  teoyubeWord: string;
  meaning: string;
  category: string;
  scriptureReferences: string[];
  promiseStatement: string;
  clusterLinks: string[];
  original: UnknownRecord;
};

export type NormalizedTeoyubeJourney = UnknownRecord & {
  id: string;
  title: string;
  description: string;
  summary: string;
  tags: string[];
  scriptureReferences: string[];
  relatedWords: string[];
  relatedPromises: string[];
  stages: UnknownRecord[];
  source: "tig_journey_seed" | "prayer_journeys" | "covenant_paths" | "unknown";
  original: UnknownRecord;
};

export type NormalizedTeoyubeMediaRecord = UnknownRecord & {
  id: string;
  title: string;
  category: string;
  description: string;
  scriptureReferences: string[];
  tags: string[];
  duration: string;
  popularity: number;
  publishedAt: string;
  sourceStatus: "local_preview" | "source_not_connected";
  sourceUrl?: string;
};

export type TeoyubeCanonSearchFilters = {
  category?: string;
  scripture?: string;
  word?: string;
  limit?: number;
};

export type TeoyubeCanonSearchResult = {
  query: string;
  filters: TeoyubeCanonSearchFilters;
  words: NormalizedTeoyubeWord[];
  promiseClusters: NormalizedPromiseCluster[];
  scriptures: NormalizedScriptureRecord[];
  journeys: NormalizedTeoyubeJourney[];
  archetypes: UnknownRecord[];
  total: number;
  fallbackUsed: boolean;
  safety: {
    localOnly: true;
    noExternalServices: true;
    noRawPrivateTextStored: true;
  };
};

export type TeoyubeMediaSearchFilters = {
  category?: string;
  scripture?: string;
  sort?: "latest" | "title" | "duration" | "popularity";
  page?: number;
  pageSize?: number;
};

export type TeoyubeMediaSearchResult = {
  query: string;
  filters: TeoyubeMediaSearchFilters;
  items: NormalizedTeoyubeMediaRecord[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  fallbackMessage?: string;
};

export const TEOYUBE_MEDIA_LIBRARY: NormalizedTeoyubeMediaRecord[] = [
  {
    id: "media_seed_of_promise",
    title: "The Seed of Promise",
    category: "Teaching",
    description: "A local TeoyubeWorld preview about tending promise language through Scripture and faithful action.",
    scriptureReferences: ["2 Corinthians 5:17", "Ephesians 1:18"],
    tags: ["promise", "calling", "seed", "growth"],
    duration: "21:09",
    popularity: 1200,
    publishedAt: "2026-07-01",
    sourceStatus: "source_not_connected"
  },
  {
    id: "media_power_of_prayer",
    title: "The Power of Prayer",
    category: "Message",
    description: "A Scripture-rooted local preview for prayer, surrender, wisdom, and one faithful next step.",
    scriptureReferences: ["Proverbs 3:5-6", "James 1:5"],
    tags: ["prayer", "wisdom", "surrender", "direction"],
    duration: "16:09",
    popularity: 890,
    publishedAt: "2026-06-29",
    sourceStatus: "source_not_connected"
  },
  {
    id: "media_walk_in_divine_purpose",
    title: "Walk in Divine Purpose",
    category: "Teaching",
    description: "A cautious calling preview that connects purpose, courage, and Scripture without claiming certainty.",
    scriptureReferences: ["Romans 8:28", "Joshua 1:9"],
    tags: ["purpose", "calling", "courage", "journey"],
    duration: "19:45",
    popularity: 1600,
    publishedAt: "2026-06-24",
    sourceStatus: "source_not_connected"
  },
  {
    id: "media_rooted_in_truth",
    title: "Rooted in His Word",
    category: "Documentary",
    description: "A local preview about Scripture as the highest authority over Teoyube language aids.",
    scriptureReferences: ["Psalm 119:105", "Ephesians 1:18"],
    tags: ["scripture", "guardrails", "truth", "canon"],
    duration: "24:35",
    popularity: 1280,
    publishedAt: "2026-06-20",
    sourceStatus: "source_not_connected"
  },
  {
    id: "media_called_for_more",
    title: "Called for More",
    category: "Shorts",
    description: "A short local preview encouraging prayerful testing of calling through Scripture, fruit, counsel, and time.",
    scriptureReferences: ["Ephesians 2:10", "Romans 8:28"],
    tags: ["calling", "gifts", "counsel", "obedience"],
    duration: "04:03",
    popularity: 720,
    publishedAt: "2026-06-18",
    sourceStatus: "source_not_connected"
  },
  {
    id: "media_strength_for_today",
    title: "Strength for Today",
    category: "Worship",
    description: "A worship preview for renewed strength, patient trust, and hope in waiting.",
    scriptureReferences: ["Isaiah 40:31"],
    tags: ["worship", "strength", "waiting", "hope"],
    duration: "12:12",
    popularity: 970,
    publishedAt: "2026-06-11",
    sourceStatus: "source_not_connected"
  }
];

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => asString(entry)).filter(Boolean);
  }
  const text = asString(value);
  return text ? [text] : [];
}

function asRecordArray(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) return value.map(asRecord).filter((item) => Object.keys(item).length > 0);
  const record = asRecord(value);
  const nested = ["items", "journeys", "paths", "archetypes", "data", "phases"]
    .flatMap((key) => asArray(record[key]).map(asRecord))
    .filter((item) => Object.keys(item).length > 0);
  if (nested.length) return nested;
  return Object.keys(record).length ? Object.values(record).map(asRecord).filter((item) => Object.keys(item).length > 0) : [];
}

function stableId(prefix: string, value: string, index = 0): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${prefix}_${slug || index + 1}`;
}

function normalizeReference(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function hashSeed(seed: string): number {
  return seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  return [...new Map(items.map((item) => [getKey(item), item])).values()];
}

function wordRecords(): unknown[] {
  return [
    ...asArray(coreTeoyubeVocabulary),
    ...asArray(coreTeoyubeVocabularyPart2),
    ...asArray(coreTeoyubeVocabularyPart3),
    ...asArray(scriptureCanon)
  ];
}

export function normalizeWordRecord(record: unknown): NormalizedTeoyubeWord {
  const original = asRecord(record);
  const word = asString(original.word) || asString(original.teoyubeWord) || asString(original.id) || "Unknown";
  const scriptureReferences = [
    ...asStringArray(original.scriptureReferences),
    ...asStringArray(original.scripture_sources),
    ...asStringArray(original.scriptureAnchors),
    ...asStringArray(original.anchorScripture)
  ];

  return {
    ...original,
    id: asString(original.id) || stableId("word", word),
    word,
    teoyubeWord: asString(original.teoyubeWord) || word,
    meaning: asString(original.meaning, "Meaning is under review."),
    category: asString(original.category, "Uncategorized"),
    scriptureReferences,
    promiseCategory: asString(original.promiseCategory) || asString(original.promise_category),
    prayerUse: asString(original.prayerUse) || asString(original.prayer_use),
    relatedWords: asStringArray(original.relatedWords).concat(asStringArray(original.related_words)),
    source: asString(original.id).startsWith("SC") ? "scripture_canon" : "core_vocabulary",
    original
  };
}

export function normalizePromiseClusterRecord(record: unknown): NormalizedPromiseCluster {
  const original = asRecord(record);
  const name = asString(original.name) || asString(original.title) || asString(original.theme) || "Promise Cluster";
  const scriptureAnchors = [
    ...asStringArray(original.scriptureAnchors),
    ...asStringArray(original.anchorScripture),
    ...asStringArray(original.scriptureReferences)
  ];

  return {
    ...original,
    id: asString(original.id) || stableId("cluster", name),
    name,
    title: asString(original.title) || name,
    theme: asString(original.theme) || name,
    coreWords: asStringArray(original.coreWords).concat(asStringArray(original.relatedTeoyubeWords)),
    scriptureAnchors,
    anchorScripture: scriptureAnchors[0] || "",
    declaration: asString(original.declaration) || asString(original.promiseStatement),
    source: "promise_clusters",
    original
  };
}

export const normalizePromiseRecord = normalizePromiseClusterRecord;

export function normalizeScriptureRecord(record: unknown): NormalizedScriptureRecord {
  const original = asRecord(record);
  const scriptureReferences = [
    ...asStringArray(original.scriptureReferences),
    ...asStringArray(original.reference),
    ...asStringArray(original.anchorScripture)
  ];
  const word = asString(original.word) || asString(original.teoyubeWord) || asString(original.id) || "Unknown";

  return {
    ...original,
    id: asString(original.id) || stableId("scripture", scriptureReferences[0] || word),
    reference: scriptureReferences[0] || "",
    word,
    teoyubeWord: asString(original.teoyubeWord) || word,
    meaning: asString(original.meaning, "Meaning is under review."),
    category: asString(original.category, "Uncategorized"),
    scriptureReferences,
    promiseStatement: asString(original.promiseStatement) || asString(original.declaration),
    clusterLinks: asStringArray(original.clusterLinks),
    original
  };
}

export function getAllTeoyubeWords(): NormalizedTeoyubeWord[] {
  return uniqueBy(wordRecords().map(normalizeWordRecord), (item) => item.word.toLowerCase());
}

export function getAllWords(): NormalizedTeoyubeWord[] {
  return getAllTeoyubeWords();
}

export function getWordByIdOrWord(value: string): NormalizedTeoyubeWord | undefined {
  const query = value.trim().toLowerCase();
  if (!query) return undefined;
  return getAllTeoyubeWords().find((item) =>
    [item.id, item.word, item.teoyubeWord].some((candidate) => candidate.toLowerCase() === query)
  );
}

export function getWordByValue(value: string): NormalizedTeoyubeWord | undefined {
  return getWordByIdOrWord(value);
}

export function getWordsByCategory(category: string): NormalizedTeoyubeWord[] {
  const query = category.trim().toLowerCase();
  if (!query) return [];
  return getAllTeoyubeWords().filter((item) =>
    [item.category, item.promiseCategory].some((candidate) => candidate.toLowerCase().includes(query))
  );
}

export function getAllPromiseClusters(): NormalizedPromiseCluster[] {
  return asArray(promiseClusters).map(normalizePromiseClusterRecord);
}

export function getPromiseClusterById(id: string): NormalizedPromiseCluster | undefined {
  const query = id.trim().toLowerCase();
  if (!query) return undefined;
  return getAllPromiseClusters().find((cluster) =>
    [cluster.id, cluster.name, cluster.title, cluster.theme].some((candidate) => candidate.toLowerCase() === query)
  );
}

export function getAllScriptures(): NormalizedScriptureRecord[] {
  return asArray(scriptureCanon).map(normalizeScriptureRecord);
}

export function getScriptureByReference(reference: string): NormalizedScriptureRecord | undefined {
  const query = normalizeReference(reference);
  if (!query) return undefined;
  return getAllScriptures().find((entry) =>
    entry.scriptureReferences.some((candidate) => normalizeReference(candidate) === query)
  );
}

export function getDailyWord(seedDate: string = new Date().toISOString().slice(0, 10)): NormalizedTeoyubeWord {
  const words = getAllTeoyubeWords();
  if (!words.length) return normalizeWordRecord({ word: "TEOYUBE", meaning: "Scripture-rooted attention", scripture_sources: ["Ephesians 1:18"] });
  return words[hashSeed(seedDate) % words.length];
}

export function normalizeJourneyRecord(record: unknown, source: NormalizedTeoyubeJourney["source"] = "unknown"): NormalizedTeoyubeJourney {
  const original = asRecord(record);
  const title =
    asString(original.title) ||
    asString(original.journeyName) ||
    asString(original.name) ||
    asString(original.slug) ||
    "Teoyube Journey";
  const scriptureReferences = [
    ...asStringArray(original.scriptureReferences),
    ...asStringArray(original.relatedScriptures),
    ...asStringArray(original.scriptureAnchors),
    ...asStringArray(original.anchorScripture)
  ];

  return {
    ...original,
    id: asString(original.id) || stableId("journey", title),
    title,
    description: asString(original.description, "A local Teoyube journey preview."),
    summary: asString(original.summary) || asString(original.description, "A Scripture-grounded local journey."),
    tags: asStringArray(original.tags).concat(asStringArray(original.aliases)),
    scriptureReferences,
    relatedWords: asStringArray(original.relatedWords).concat(asStringArray(original.relatedTeoyubeWordIds)),
    relatedPromises: asStringArray(original.relatedPromises).concat(asStringArray(original.relatedPromiseCategoryIds)),
    stages: asRecordArray(original.stages),
    source,
    original
  };
}

export function getAllJourneys(): NormalizedTeoyubeJourney[] {
  return uniqueBy(
    [
      ...TIG_JOURNEY_SEEDS.map((item) => normalizeJourneyRecord(item, "tig_journey_seed")),
      ...asRecordArray(prayerJourneys).map((item) => normalizeJourneyRecord(item, "prayer_journeys")),
      ...asRecordArray(covenantPaths).map((item) => normalizeJourneyRecord(item, "covenant_paths"))
    ],
    (journey) => journey.id
  );
}

export function getJourneyById(id: string): NormalizedTeoyubeJourney | undefined {
  const query = id.trim().toLowerCase();
  if (!query) return undefined;
  return getAllJourneys().find((journey) =>
    [journey.id, journey.title, asString(journey.slug), asString(journey.journeyKey)]
      .filter(Boolean)
      .some((candidate) => candidate.toLowerCase() === query)
  );
}

export function getAllArchetypes(): UnknownRecord[] {
  return asRecordArray(kingdomArchetypes);
}

export function getAllPrayerSequences(): UnknownRecord[] {
  return TIG_PRAYER_SEQUENCE_SEEDS.map(asRecord);
}

export function getAllActionSteps(): UnknownRecord[] {
  return TIG_ACTION_STEP_SEEDS.map(asRecord);
}

function textIncludes(record: UnknownRecord, query: string): boolean {
  if (!query) return true;
  return JSON.stringify(record).toLowerCase().includes(query);
}

function categoryMatches(category: string | undefined, candidates: string[]): boolean {
  const query = category?.trim().toLowerCase();
  if (!query || query === "all") return true;
  return candidates.some((candidate) => candidate.toLowerCase().includes(query));
}

export function searchTeoyubeCanon(
  queryValue = "",
  filters: TeoyubeCanonSearchFilters = {}
): TeoyubeCanonSearchResult {
  const query = queryValue.trim().toLowerCase();
  const limit = Math.max(1, filters.limit || 12);
  const scriptureQuery = filters.scripture?.trim().toLowerCase() || "";
  const wordQuery = filters.word?.trim().toLowerCase() || "";
  const words = getAllWords()
    .filter((word) => textIncludes(word, query))
    .filter((word) => categoryMatches(filters.category, [word.category, word.promiseCategory]))
    .filter((word) => !scriptureQuery || word.scriptureReferences.some((reference) => reference.toLowerCase().includes(scriptureQuery)))
    .filter((word) => !wordQuery || [word.word, word.teoyubeWord].some((value) => value.toLowerCase().includes(wordQuery)))
    .slice(0, limit);
  const promiseClusterResults = getAllPromiseClusters()
    .filter((cluster) => textIncludes(cluster, query))
    .filter((cluster) => categoryMatches(filters.category, [cluster.theme, cluster.name, cluster.title]))
    .slice(0, limit);
  const scriptures = getAllScriptures()
    .filter((scripture) => textIncludes(scripture, query))
    .filter((scripture) => !scriptureQuery || scripture.scriptureReferences.some((reference) => reference.toLowerCase().includes(scriptureQuery)))
    .slice(0, limit);
  const journeys = getAllJourneys()
    .filter((journey) => textIncludes(journey, query))
    .filter((journey) => categoryMatches(filters.category, [journey.title, ...journey.tags]))
    .slice(0, limit);
  const archetypes = getAllArchetypes()
    .filter((archetype) => textIncludes(archetype, query))
    .slice(0, limit);
  const total = words.length + promiseClusterResults.length + scriptures.length + journeys.length + archetypes.length;

  return {
    query: queryValue,
    filters,
    words,
    promiseClusters: promiseClusterResults,
    scriptures,
    journeys,
    archetypes,
    total,
    fallbackUsed: total === 0,
    safety: {
      localOnly: true,
      noExternalServices: true,
      noRawPrivateTextStored: true
    }
  };
}

export function searchMedia(queryValue = "", filters: TeoyubeMediaSearchFilters = {}): TeoyubeMediaSearchResult {
  const query = queryValue.trim().toLowerCase();
  const pageSize = Math.max(1, filters.pageSize || 6);
  const page = Math.max(1, filters.page || 1);
  const category = filters.category?.trim().toLowerCase() || "all";
  const scripture = filters.scripture?.trim().toLowerCase() || "";
  const filtered = TEOYUBE_MEDIA_LIBRARY.filter((item) => {
    const textMatch = !query || [item.title, item.category, item.description, ...item.tags, ...item.scriptureReferences]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const categoryMatch = category === "all" || item.category.toLowerCase() === category;
    const scriptureMatch = !scripture || item.scriptureReferences.some((reference) => reference.toLowerCase().includes(scripture));
    return textMatch && categoryMatch && scriptureMatch;
  }).sort((a, b) => {
    if (filters.sort === "title") return a.title.localeCompare(b.title);
    if (filters.sort === "duration") return a.duration.localeCompare(b.duration);
    if (filters.sort === "popularity") return b.popularity - a.popularity;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
  const start = (page - 1) * pageSize;

  return {
    query: queryValue,
    filters,
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    hasMore: start + pageSize < filtered.length,
    fallbackMessage: filtered.length ? undefined : "No local TeoyubeWorld media matched this search. External video sources are not connected in this preview."
  };
}

export function getOnboardingSteps() {
  return asArray(onboardingFlow).map(asRecord);
}

export function getPrayerJourneys() {
  return asArray(prayerJourneys).map(asRecord);
}

export function getGrowthLevels() {
  return asArray(tkosGrowthLevels).map(asRecord);
}

export function getGlyphForWord(word: string) {
  const query = word.trim().toLowerCase();
  if (!query) return undefined;
  return asArray(glyphDefinitions).map(asRecord).find((glyph) => asString(glyph.word).toLowerCase() === query);
}

export function getTeoyubeDataSourceSummary() {
  return {
    words: getAllTeoyubeWords().length,
    promiseClusters: getAllPromiseClusters().length,
    scriptureEntries: getAllScriptures().length,
    journeys: getAllJourneys().length,
    archetypes: getAllArchetypes().length,
    prayerSequences: getAllPrayerSequences().length,
    actionSteps: getAllActionSteps().length,
    mediaRecords: TEOYUBE_MEDIA_LIBRARY.length,
    roadmapRecords: asRecordArray(projectStructureRoadmap).length,
    promiseCategories: asArray(promiseCategories).length,
    onboardingSteps: getOnboardingSteps().length,
    prayerJourneys: getPrayerJourneys().length,
    growthLevels: getGrowthLevels().length,
    glyphs: asArray(glyphDefinitions).length,
    graphRelationships: asArray(graphRelationships).length,
    lexiconEntries: asArray(teoyubePromiseLanguageLexicon).length,
    searchFrameworkLoaded: Object.keys(asRecord(teoyubeSearchFramework)).length > 0,
    theologyConstitutionLoaded: Object.keys(asRecord(theologyConstitution)).length > 0,
    sampleProfileLoaded: Object.keys(asRecord(tkosSampleProfile)).length > 0
  };
}
