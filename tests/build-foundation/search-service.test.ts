import { describe, expect, it } from "vitest";
import { createApprovedSearchCatalog, createApprovedSearchViewModel } from "@/features/search/legacy-adapter";
import { reduceSearchViewModel, searchApprovedCatalog, toLegacySearchResult } from "@/features/search/application/search-service";
import type { SearchCategory } from "@/features/search/contracts";

const CATEGORY_CASES: ReadonlyArray<Readonly<{
  category: SearchCategory;
  query: string;
  intent: string;
  titles: readonly string[];
}>> = [
  { category: "Promise", query: "I need a promise for direction", intent: "Promise Search", titles: ["JIREH - Provision", "ELPIS - Hope", "FAVORI - Favor Upon The Path"] },
  { category: "Scripture", query: "Romans 8:28", intent: "Scripture Search", titles: ["PRAYERA - Scripture-Based Prayer", "FAITHRA - Faith Rising", "KLESIS - Calling"] },
  { category: "Life Problem", query: "I need healing", intent: "Promise Search", titles: ["TEOYUBE - The Eyes Of Your Understanding Being Enlightened", "WISDORA - Wisdom And Direction", "KLESIS - Calling"] },
  { category: "Calling", query: "calling clarity", intent: "Life Problem + Calling", titles: ["MISSIONA - Sent With Purpose", "EVANGELA - Good News Mission", "TEOYUBE - The Eyes Of Your Understanding Being Enlightened"] },
  { category: "Prayer", query: "help me pray for wisdom", intent: "Prayer Search", titles: ["PRAYERA - Scripture-Based Prayer", "MERCIA - Mercy Covering", "TRANSFORMA - Changed Into Purpose"] },
  { category: "Teoyube Word", query: "TEOYUBE", intent: "Teoyube Word Search", titles: ["TEOYUBE - The Eyes Of Your Understanding Being Enlightened", "EPHPHATHA - Be Opened", "APOKALU - Revelation Unveiled"] },
  { category: "Testimony", query: "testimony of breakthrough", intent: "Testimony Search", titles: ["TESTIMA - Testimony Recorded", "MARTURIA - Testimony / Witness", "LEGACIA - Legacy In God"] }
];

describe("approved deterministic TeoyubeSearch service", () => {
  it("reproduces the approved default result order and visible scores", () => {
    const model = createApprovedSearchViewModel();
    expect(model.query).toBe("I feel confused about my purpose");
    expect(model.results.map((result) => ({
      title: result.title,
      relevance: result.relevance_score,
      scriptures: result.scripture_references
    }))).toEqual([
      { title: "TEOYUBE - The Eyes Of Your Understanding Being Enlightened", relevance: 81, scriptures: ["Ephesians 1:18", "Romans 8:28-30"] },
      { title: "ASSIGNA - Divine Assignment", relevance: 85, scriptures: ["Ephesians 2:10", "Romans 8:28-30"] },
      { title: "MISSIONA - Sent With Purpose", relevance: 89, scriptures: ["Matthew 28:19", "Romans 8:28-30"] }
    ]);
    expect(model.results.every((result) => result.quality_score === 99 && result.confidence_label === "Excellent")).toBe(true);
  });

  it.each(CATEGORY_CASES)("preserves the $category category baseline", ({ category, query, intent, titles }) => {
    const results = searchApprovedCatalog(createApprovedSearchCatalog(), query, category);
    expect(results.map((result) => result.title)).toEqual(titles);
    expect(results.every((result) => result.search_intent === intent)).toBe(true);
  });

  it("keeps provenance, confidence, and disabled external services behind the approved view", () => {
    const result = createApprovedSearchViewModel().results[0];
    expect(result.source).toEqual({
      kind: "approved-local-catalog",
      wordOwner: "src/data/coreTeoyubeVocabulary.json",
      clusterOwner: "src/data/promiseClusters.json",
      localOnly: true,
      externalModelUsed: false,
      vectorDatabaseUsed: false
    });
    expect(result.confidence).toEqual({
      label: "Excellent",
      score: 99,
      limitation: "Deterministic local match; Scripture remains the authority."
    });
    expect("source" in toLegacySearchResult(result)).toBe(false);
    expect("confidence" in toLegacySearchResult(result)).toBe(false);
  });

  it("models loading, empty, and result transitions without changing the approved default", () => {
    const initial = createApprovedSearchViewModel();
    const loading = reduceSearchViewModel(initial, { type: "search.start" });
    const empty = reduceSearchViewModel(loading, { type: "search.empty" });
    const restored = reduceSearchViewModel(empty, { type: "search.complete", results: initial.results });
    expect(loading.status).toBe("loading");
    expect(empty).toMatchObject({ status: "empty", results: [] });
    expect(restored).toMatchObject({ status: "results", results: initial.results });
  });
});
