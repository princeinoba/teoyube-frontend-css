"use client";

import { useMemo, useReducer, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { SearchFeedback, SearchResultDto, SearchViewActions, SearchViewModel } from "@/features/search/contracts";
import { reduceSearchViewModel, searchApprovedCatalog } from "@/features/search/application/search-service";
import { ApprovedSearchView } from "./ApprovedSearchView";

type Notice = Readonly<{ title: string; detail: string; scripture?: string }> | null;
type DialogState = Readonly<{ kind: "graph" | "compare"; result: SearchResultDto }> | null;

function SearchInfrastructure({ notice, dialog, closeNotice, closeDialog }: { notice: Notice; dialog: DialogState; closeNotice(): void; closeDialog(): void }) {
  const [railOpen, setRailOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(
    <div id="phase113Shell">
      <aside className={`phase113-insight-rail${railOpen ? "" : " collapsed"}`} id="phase113InsightRail" aria-label="Phase 11.3 insight rail">
        <button type="button" className="phase113-rail-toggle" id="phase113RailToggle" aria-label="Toggle insight rail" aria-expanded={railOpen ? "true" : "false"} onClick={() => setRailOpen((open) => !open)}>i</button>
        <div id="phase113InsightContent"><p className="eyebrow">Active Context</p><h2>TIDUILOVP</h2><p>Calling &amp; Purpose</p><p className="phase113-scripture">Ephesians 1:18</p><div className="phase113-rail-metrics"><span><strong>0</strong> Promises</span><span><strong>1</strong> Book</span><span><strong>3</strong> Testimony</span></div><ul><li>No external services</li><li>No analytics</li><li>No database persistence</li><li>No live AI</li><li>No automatic contact</li></ul></div>
      </aside>
      <section className={`phase113-save-drawer${notice ? " visible" : ""}`} id="phase113SaveDrawer" aria-live="polite" aria-label="Saved action status">
        {notice && <><strong>{notice.title}</strong><span>{notice.detail}</span>{notice.scripture && <small>{notice.scripture}</small>}<div className="phase114-save-actions"><button type="button">View in Book</button><button type="button">Add Reflection</button><button type="button" onClick={closeNotice}>Close</button></div></>}
      </section>
      <aside className="phase117-offline-status" id="phase117OfflineStatus" aria-live="polite"><span className="phase117-offline-pill online">Local beta online</span><small>External services remain disabled; network is not used for AI, analytics, uploads, or persistence.</small></aside>
      {dialog && <dialog
        className={dialog.kind === "graph" ? "phase116-graph-dialog" : "phase115-comparison-dialog"}
        id={dialog.kind === "graph" ? "phase116GraphDialog" : "phase115ComparisonDialog"}
        aria-label={dialog.kind === "graph" ? "Recommendation graph" : "Recommendation comparison"}
        open
      ><p className="eyebrow">{dialog.kind === "graph" ? "Visual Intelligence Graph Explorer" : "Standard recommendation"}</p><h3>{dialog.result.title}</h3><p>{dialog.result.explanation_path.join(" → ")}</p><div className="scripture-strip">{dialog.result.scripture_references.map((reference) => <span className="scripture-pill" key={reference}>{reference}</span>)}</div><button className="phase113-icon-button" type="button" aria-label={dialog.kind === "graph" ? "Close graph explorer" : "Close recommendation comparison"} onClick={closeDialog}>x</button></dialog>}
    </div>,
    document.body
  );
}

function feedbackNotice(kind: SearchFeedback): Readonly<{ title: string; detail: string }> {
  if (kind === "reset_preference") return { title: "Preference reset", detail: "Visible personalization hints were cleared." };
  if (["more_like_this", "less_like_this", "not_relevant"].includes(kind)) {
    return { title: "Feedback noted", detail: "Personalization is off, so no preference signal was stored. Enable it from Personalization Center to learn from feedback." };
  }
  return { title: "Feedback updated", detail: "Saved to visible journey memory; personalization remains off." };
}

export function SearchPageController({ initialViewModel }: { initialViewModel: SearchViewModel }) {
  const [model, dispatch] = useReducer(reduceSearchViewModel, initialViewModel);
  const [notice, setNotice] = useState<Notice>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const router = useRouter();

  function run(query: string) {
    dispatch({ type: "query.change", query });
    dispatch({ type: "search.start" });
    window.setTimeout(() => dispatch({ type: "search.complete", results: searchApprovedCatalog(model.catalog, query, model.category) }), 0);
  }

  const actions = useMemo<SearchViewActions>(() => ({
    changeQuery: (query) => dispatch({ type: "query.change", query }),
    changeCategory: (category) => dispatch({ type: "category.change", category }),
    submitSearch: run,
    runQuickPrompt: run,
    loadSuggestion: (query) => {
      dispatch({ type: "query.change", query });
      setNotice({ title: "Search suggestion loaded", detail: query });
      window.requestAnimationFrame(() => document.querySelector<HTMLInputElement>("#teoyubeSearchInput")?.focus());
    },
    clearSuggestions: () => {
      dispatch({ type: "suggestions.clear" });
      setNotice({ title: "Search suggestions cleared", detail: "Session-only safe searches cleared." });
    },
    saveToBook: (result) => setNotice({ title: "Search result saved", detail: result.title, scripture: result.scripture_references[0] }),
    addToPromiseTable: (result) => {
      setNotice({ title: "Promise row added", detail: result.title, scripture: result.scripture_references[0] });
      router.push("/promise-table");
    },
    exploreJourney: (result) => {
      setNotice({ title: "Prayer framework opened", detail: result.title, scripture: result.scripture_references[0] });
      router.push("/teo-guide");
    },
    openGraph: (result) => setDialog({ kind: "graph", result }),
    compareRecommendation: (result) => setDialog({ kind: "compare", result }),
    recordFeedback: (kind, result) => setNotice({ ...feedbackNotice(kind), scripture: result.scripture_references[0] })
  // `model.catalog` and category are immutable inputs to the typed search transition.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [model.catalog, model.category, router]);

  return <><ApprovedSearchView model={model} actions={actions} /><SearchInfrastructure notice={notice} dialog={dialog} closeNotice={() => setNotice(null)} closeDialog={() => setDialog(null)} /></>;
}
