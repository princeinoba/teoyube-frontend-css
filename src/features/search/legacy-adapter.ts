import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";
import baseVocabulary from "../../data/coreTeoyubeVocabulary.json";
import vocabularyPart3 from "../../data/coreTeoyubeVocabulary-part3.json";
import promiseClusters from "../../data/promiseClusters.json";
import promiseClusterNavigation from "../../data/promiseClusterNavigation.json";
import type { SearchCatalog, SearchCatalogCluster, SearchCatalogWord } from "./contracts";
import { createSearchViewModel } from "./application/search-service";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Search composition and events" },
  { module: "@/lib/teoyube/data-access", responsibility: "local search behavior" }
] as const);

export function createSearchLegacyAdapter(bridge: LegacyCapabilityBridge<"search">) {
  return createLegacyCapabilityAdapter("search", LEGACY_OWNERS, bridge);
}

function toWord(record: (typeof baseVocabulary)[number], sourceOwner: SearchCatalogWord["sourceOwner"]): SearchCatalogWord {
  return Object.freeze({
    word: record.word || "",
    pronunciation: record.pronunciation || "",
    meaning: record.meaning || "",
    category: record.category || "",
    scripture_sources: record.scripture_sources || [],
    promise_category: record.promise_category || "",
    prayer_use: record.prayer_use || "",
    animation_symbol: record.animation_symbol || "",
    related_words: record.related_words || [],
    sourceOwner
  });
}

function toCluster(record: (typeof promiseClusters)[number]): SearchCatalogCluster {
  return Object.freeze({
    title: record.title || record.theme || "Promise Cluster",
    theme: record.theme || record.title || "Promise Cluster",
    summary: record.summary || record.description || "",
    promise_category: record.promise_category || record.theme || "",
    scripture_references: record.scripture_references || [],
    keywords: record.keywords || [],
    related_teoyube_words: record.related_teoyube_words || [],
    divine_assignment: record.divine_assignment || "Take one small step of obedience and record what you notice."
  });
}

export function createApprovedSearchCatalog(): SearchCatalog {
  return Object.freeze({
    words: Object.freeze([
      ...baseVocabulary.map((word) => toWord(word, "src/data/coreTeoyubeVocabulary.json")),
      ...vocabularyPart3.map((word) => toWord(word, "src/data/coreTeoyubeVocabulary-part3.json"))
    ]),
    clusters: Object.freeze(promiseClusters.map(toCluster))
  });
}

export function createApprovedSearchViewModel() {
  return createSearchViewModel(createApprovedSearchCatalog(), promiseClusterNavigation.map((item) => item.label));
}
