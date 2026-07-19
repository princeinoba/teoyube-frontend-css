export const SEARCH_CATEGORIES = [
  "All",
  "Promise",
  "Scripture",
  "Life Problem",
  "Calling",
  "Prayer",
  "Teoyube Word",
  "Testimony"
] as const;

export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

export type SearchIntent =
  | "Promise Search"
  | "Scripture Search"
  | "Life Problem + Calling"
  | "Prayer Search"
  | "Teoyube Word Search"
  | "Testimony Search";

export type SearchResultSource = Readonly<{
  kind: "approved-local-catalog";
  wordOwner: "src/data/coreTeoyubeVocabulary.json" | "src/data/coreTeoyubeVocabulary-part3.json";
  clusterOwner: "src/data/promiseClusters.json";
  localOnly: true;
  externalModelUsed: false;
  vectorDatabaseUsed: false;
}>;

export type SearchResultConfidence = Readonly<{
  label: "Excellent" | "Good" | "Partial" | "Needs fallback";
  score: number;
  limitation: "Deterministic local match; Scripture remains the authority.";
}>;

export type SearchResultDto = Readonly<{
  title: string;
  search_intent: SearchIntent;
  promise_category: string;
  scripture_references: readonly string[];
  promise_level: "A + B + C" | "B + C" | "C";
  relevance_score: number;
  quality_score: number;
  confidence_label: SearchResultConfidence["label"];
  explanation_path: readonly string[];
  fallback_reason: string;
  short_explanation: string;
  calling_connection: string;
  teoyube_word: string;
  pronunciation: string;
  meaning: string;
  prayer: string;
  assignment: string;
  animation_prompt: string;
  source: SearchResultSource;
  confidence: SearchResultConfidence;
}>;

export type SearchCatalogWord = Readonly<{
  word: string;
  pronunciation: string;
  meaning: string;
  category: string;
  scripture_sources: readonly string[];
  promise_category: string;
  prayer_use: string;
  animation_symbol: string;
  related_words: readonly string[];
  sourceOwner: SearchResultSource["wordOwner"];
}>;

export type SearchCatalogCluster = Readonly<{
  title: string;
  theme: string;
  summary: string;
  promise_category: string;
  scripture_references: readonly string[];
  keywords: readonly string[];
  related_teoyube_words: readonly string[];
  divine_assignment: string;
}>;

export type SearchCatalog = Readonly<{
  words: readonly SearchCatalogWord[];
  clusters: readonly SearchCatalogCluster[];
}>;

export type SearchStatus = "empty" | "loading" | "results";

export type SearchViewModel = Readonly<{
  capability: "search";
  query: string;
  category: SearchCategory;
  status: SearchStatus;
  results: readonly SearchResultDto[];
  catalog: SearchCatalog;
  suggestions: readonly string[];
  quickPrompts: readonly string[];
  safety: Readonly<{
    deterministic: true;
    localOnly: true;
    externalModelConnected: false;
    vectorDatabaseConnected: false;
  }>;
}>;

export type SearchAction =
  | Readonly<{ type: "query.change"; query: string }>
  | Readonly<{ type: "category.change"; category: SearchCategory }>
  | Readonly<{ type: "search.start" }>
  | Readonly<{ type: "search.complete"; results: readonly SearchResultDto[] }>
  | Readonly<{ type: "search.empty" }>
  | Readonly<{ type: "suggestions.clear" }>;

export type SearchFeedback =
  | "more_like_this"
  | "less_like_this"
  | "not_relevant"
  | "save_scripture"
  | "save_word"
  | "save_prayer"
  | "complete_action"
  | "reset_preference";

export type SearchViewActions = Readonly<{
  changeQuery(query: string): void;
  changeCategory(category: SearchCategory): void;
  submitSearch(query: string): void;
  runQuickPrompt(query: string): void;
  loadSuggestion(query: string): void;
  clearSuggestions(): void;
  saveToBook(result: SearchResultDto): void;
  addToPromiseTable(result: SearchResultDto): void;
  exploreJourney(result: SearchResultDto): void;
  openGraph(result: SearchResultDto): void;
  compareRecommendation(result: SearchResultDto): void;
  recordFeedback(kind: SearchFeedback, result: SearchResultDto): void;
}>;
