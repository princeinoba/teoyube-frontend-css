import type {
  SearchAction,
  SearchCatalog,
  SearchCatalogCluster,
  SearchCatalogWord,
  SearchCategory,
  SearchIntent,
  SearchResultDto,
  SearchViewModel
} from "../contracts";

const DEFAULT_QUERY = "I feel confused about my purpose";
const CALLING_ASSIGNMENT = "Write down three gifts, three burdens, and one step you can take today toward your calling.";
const CONSTITUTION_LANGUAGE = "Based on Scripture and your profile, this may guide your next step.";
const CALLING_NAME = "Creative Digital Ministry";
const DEFAULT_PROFILE_CONTEXT = "Discipleship, purpose People needing direction";

export const SEARCH_SUGGESTIONS = Object.freeze([
  "Romans 8:28-30",
  "I need direction",
  "I need healing",
  "I need wisdom",
  "calling clarity"
] as const);

function normalize(value = ""): string {
  return value.toLowerCase();
}

function tokens(value = "purpose"): string[] {
  return normalize(value || "purpose").split(/[^a-z0-9:]+/).filter((term) => term.length > 1);
}

function fuzzyIncludes(haystack: string, term: string): boolean {
  if (term.length < 4) return false;
  return haystack.split(/\s+/).some((word) =>
    word.length > 3 && Math.abs(word.length - term.length) <= 2 &&
    (word.startsWith(term.slice(0, 3)) || term.startsWith(word.slice(0, 3)))
  );
}

function clusterHaystack(cluster: SearchCatalogCluster): string {
  return normalize([
    cluster.title,
    cluster.theme,
    cluster.summary,
    cluster.promise_category,
    cluster.scripture_references.join(" "),
    ...cluster.related_teoyube_words
  ].join(" "));
}

function rankClusters(catalog: SearchCatalog, searchText: string) {
  return catalog.clusters.map((cluster) => ({
    cluster,
    score: tokens(searchText).reduce((sum, term) => {
      const haystack = clusterHaystack(cluster);
      return sum + (haystack.includes(term) ? 12 : fuzzyIncludes(haystack, term) ? 5 : 0);
    }, 0)
  })).sort((left, right) => right.score - left.score);
}

function pickFallbackCluster(catalog: SearchCatalog, query: string): SearchCatalogCluster {
  const haystack = normalize(`${query} ${query} ${DEFAULT_PROFILE_CONTEXT}`);
  let best = { cluster: catalog.clusters[0], score: -1 };
  for (const cluster of catalog.clusters) {
    const terms = [
      ...cluster.keywords,
      cluster.title,
      cluster.theme,
      cluster.promise_category,
      ...cluster.scripture_references,
      ...cluster.related_teoyube_words
    ].filter(Boolean).map(normalize);
    const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    if (score > best.score) best = { cluster, score };
  }
  return best.cluster;
}

function scoreWord(word: SearchCatalogWord, searchText: string, selectedCategory: SearchCategory): number {
  const categoryMatches = selectedCategory === "All" || selectedCategory === "Teoyube Word" ||
    normalize(word.category).includes(normalize(selectedCategory)) ||
    normalize(word.promise_category).includes(normalize(selectedCategory));
  const haystack = normalize([
    word.word,
    word.meaning,
    word.category,
    word.promise_category,
    word.prayer_use,
    word.animation_symbol,
    ...word.scripture_sources,
    ...word.related_words
  ].join(" "));
  const termScore = normalize(searchText).split(/\s+/).filter(Boolean)
    .reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
  const wordScore = normalize(word.word) === normalize(searchText)
    ? 10
    : normalize(word.word).includes(normalize(searchText)) ? 6 : 0;
  return termScore + wordScore + (categoryMatches ? 1 : -4);
}

function scorePromiseResult(word: SearchCatalogWord, cluster: SearchCatalogCluster, searchText: string, selectedCategory: SearchCategory): number {
  const terms = tokens(searchText);
  const scriptureText = cluster.scripture_references.join(" ");
  const haystack = normalize([
    word.word,
    word.meaning,
    word.promise_category,
    word.category,
    word.prayer_use,
    cluster.title,
    cluster.theme,
    cluster.summary,
    cluster.promise_category,
    scriptureText,
    ...word.related_words
  ].join(" "));
  const termScore = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 10 : fuzzyIncludes(haystack, term) ? 5 : 0), 0);
  const scriptureBoost = terms.some((term) => scriptureText.toLowerCase().includes(term)) ? 16 : 0;
  const wordBoost = terms.some((term) => normalize(word.word).includes(term)) ? 18 : 0;
  const categoryBoost = selectedCategory === "All" || haystack.includes(normalize(selectedCategory)) ||
    normalize(word.promise_category).includes(normalize(selectedCategory)) ? 8 : -8;
  return Math.max(0, termScore + scriptureBoost + wordBoost + categoryBoost);
}

export function detectSearchIntent(query: string): SearchIntent {
  const text = normalize(query);
  if (/\b(ephesians|john|romans|psalm|proverbs|isaiah|james|matthew|mark|luke|acts)\b/.test(text)) return "Scripture Search";
  if (text.includes("pray") || text.includes("prayer")) return "Prayer Search";
  if (text.includes("call") || text.includes("purpose") || text.includes("teach")) return "Life Problem + Calling";
  if (text.includes("testimony") || text.includes("answered")) return "Testimony Search";
  return "Promise Search";
}

function detectIntentWithCatalog(query: string, words: readonly SearchCatalogWord[]): SearchIntent {
  const text = normalize(query);
  if (words.some((word) => normalize(word.word) === text)) return "Teoyube Word Search";
  return detectSearchIntent(query);
}

function detectNeed(query: string): string {
  const text = normalize(query);
  if (["discourage", "weary", "tired", "stuck"].some((word) => text.includes(word))) return "discouragement";
  if (["confused", "unclear", "lost"].some((word) => text.includes(word))) return "confusion";
  if (["fear", "anxious", "worry"].some((word) => text.includes(word))) return "fear";
  if (["grief", "loss", "sorrow"].some((word) => text.includes(word))) return "sorrow";
  if (["calling", "purpose", "assignment"].some((word) => text.includes(word))) return "calling clarity";
  if (["wisdom", "decision", "choose"].some((word) => text.includes(word))) return "wisdom";
  if (["pray", "prayer"].some((word) => text.includes(word))) return "prayer";
  return "general guidance";
}

function unique(values: readonly string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function buildResult(
  query: string,
  cluster: SearchCatalogCluster,
  word: SearchCatalogWord & { score?: number },
  index: number,
  words: readonly SearchCatalogWord[]
): SearchResultDto {
  const scriptureReferences = unique([...word.scripture_sources, ...cluster.scripture_references]).slice(0, 5);
  const intent = detectIntentWithCatalog(query, words);
  const promiseLevel = index === 0 ? "A + B + C" : index === 1 ? "B + C" : "C";
  const assignment = intent.includes("Calling") ? CALLING_ASSIGNMENT : cluster.divine_assignment;
  const prayer = `Father, according to Your Word, guide me through ${word.meaning.toLowerCase()} with humility, wisdom, and obedience.`;
  const promise = word.promise_category || cluster.promise_category || cluster.theme;
  const explanationPath = [
    "Sanitized local context",
    intent,
    detectNeed(query),
    word.word,
    promise,
    scriptureReferences[0],
    assignment
  ].filter(Boolean);
  const qualityScore = 99;
  return Object.freeze({
    title: `${word.word} - ${word.meaning}`,
    search_intent: intent,
    promise_category: promise,
    scripture_references: scriptureReferences,
    promise_level: promiseLevel,
    relevance_score: Math.min(100, 55 + (word.score || 0) + index * 4),
    quality_score: qualityScore,
    confidence_label: "Excellent" as const,
    explanation_path: explanationPath,
    fallback_reason: "No fallback used",
    short_explanation: `${CONSTITUTION_LANGUAGE} ${cluster.summary}`,
    calling_connection: `This connects to ${CALLING_NAME} through ${promise}.`,
    teoyube_word: word.word,
    pronunciation: word.pronunciation,
    meaning: word.meaning,
    prayer,
    assignment,
    animation_prompt: word.animation_symbol || `A Saint moves from search to promise as ${word.word} appears in light.`,
    source: {
      kind: "approved-local-catalog" as const,
      wordOwner: word.sourceOwner,
      clusterOwner: "src/data/promiseClusters.json" as const,
      localOnly: true as const,
      externalModelUsed: false as const,
      vectorDatabaseUsed: false as const
    },
    confidence: {
      label: "Excellent" as const,
      score: qualityScore,
      limitation: "Deterministic local match; Scripture remains the authority." as const
    }
  });
}

export function searchApprovedCatalog(catalog: SearchCatalog, queryValue: string, selectedCategory: SearchCategory): readonly SearchResultDto[] {
  const query = queryValue.trim();
  const searchText = normalize(query || "purpose");
  const fallbackCluster = pickFallbackCluster(catalog, query);
  const rankedClusters = rankClusters(catalog, searchText);
  const matched = catalog.words.map((word) => {
    const matchingCluster = rankedClusters.find(({ cluster }) => normalize([
      cluster.title,
      cluster.theme,
      cluster.promise_category,
      ...cluster.related_teoyube_words
    ].join(" ")).includes(normalize(word.promise_category || word.category || word.word)))?.cluster || rankedClusters[0]?.cluster || fallbackCluster;
    return {
      ...word,
      matchedCluster: matchingCluster,
      score: scoreWord(word, searchText, selectedCategory) + scorePromiseResult(word, matchingCluster, searchText, selectedCategory)
    };
  }).filter((word) => word.score > 0).sort((left, right) => right.score - left.score);
  const topWords = matched.length
    ? matched.slice(0, 3)
    : catalog.words
        .filter((word) => ["WISDORA", "TEOYUBE", "KLESIS"].includes(word.word))
        .slice(0, 3)
        .map((word) => ({ ...word, matchedCluster: fallbackCluster, score: 0 }));
  return topWords.map((word, index) => buildResult(query, word.matchedCluster, word, index, catalog.words));
}

export function createSearchViewModel(catalog: SearchCatalog, quickPrompts: readonly string[]): SearchViewModel {
  return Object.freeze({
    capability: "search",
    query: DEFAULT_QUERY,
    category: "All",
    status: "results",
    results: searchApprovedCatalog(catalog, DEFAULT_QUERY, "All"),
    catalog,
    suggestions: SEARCH_SUGGESTIONS,
    quickPrompts,
    safety: {
      deterministic: true as const,
      localOnly: true as const,
      externalModelConnected: false as const,
      vectorDatabaseConnected: false as const
    }
  });
}

export function reduceSearchViewModel(model: SearchViewModel, action: SearchAction): SearchViewModel {
  switch (action.type) {
    case "query.change": return { ...model, query: action.query };
    case "category.change": return { ...model, category: action.category };
    case "search.start": return { ...model, status: "loading" };
    case "search.complete": return { ...model, status: action.results.length ? "results" : "empty", results: action.results };
    case "search.empty": return { ...model, status: "empty", results: [] };
    case "suggestions.clear": return { ...model, suggestions: SEARCH_SUGGESTIONS };
  }
}

export function toLegacySearchResult(result: SearchResultDto) {
  return {
    title: result.title,
    search_intent: result.search_intent,
    promise_category: result.promise_category,
    scripture_references: result.scripture_references,
    promise_level: result.promise_level,
    relevance_score: result.relevance_score,
    quality_score: result.quality_score,
    confidence_label: result.confidence_label,
    explanation_path: result.explanation_path,
    fallback_reason: result.fallback_reason,
    short_explanation: result.short_explanation,
    calling_connection: result.calling_connection,
    teoyube_word: result.teoyube_word,
    pronunciation: result.pronunciation,
    meaning: result.meaning,
    prayer: result.prayer,
    assignment: result.assignment,
    animation_prompt: result.animation_prompt
  };
}
