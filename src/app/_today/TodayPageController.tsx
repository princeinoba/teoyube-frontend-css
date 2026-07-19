"use client";

import { useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { TodayViewActions, TodayViewModel } from "@/features/today/contracts";
import { reduceTodayViewModel } from "@/features/today/application/today-service";
import { ApprovedTodayView } from "./ApprovedTodayView";

type SaveNotice = Readonly<{ title: string; detail: string; scripture: string }> | null;

function LegacyTodayOverlays({ model, notice, clearNotice }: { model: TodayViewModel; notice: SaveNotice; clearNotice(): void }) {
  const [railOpen, setRailOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(
    <div id="phase113Shell">
      <aside className={`phase113-insight-rail${railOpen ? "" : " collapsed"}`} id="phase113InsightRail" aria-label="Phase 11.3 insight rail">
        <button type="button" className="phase113-rail-toggle" id="phase113RailToggle" aria-label="Toggle insight rail" aria-expanded={railOpen ? "true" : "false"} onClick={() => setRailOpen((open) => !open)}>i</button>
        <div id="phase113InsightContent">
          <p className="eyebrow">Active Context</p><h2>{model.dailyWord.word}</h2><p>Calling &amp; Purpose</p><p className="phase113-scripture">Ephesians 1:18</p>
          <div className="phase113-rail-metrics"><span><strong>0</strong> Promises</span><span><strong>1</strong> Book</span><span><strong>3</strong> Testimony</span></div>
          <ul><li>No external services</li><li>No analytics</li><li>No database persistence</li><li>No live AI</li><li>No automatic contact</li></ul>
        </div>
      </aside>
      <section className={`phase113-save-drawer${notice ? " visible" : ""}`} id="phase113SaveDrawer" aria-live="polite" aria-label="Saved action status">
        {notice && <><strong>{notice.title}</strong><span>{notice.detail}</span><small>{notice.scripture}</small><div className="phase114-save-actions"><button type="button">View in Book</button><button type="button">Add Reflection</button><button type="button" onClick={clearNotice}>Close</button></div></>}
      </section>
      <aside className="phase117-offline-status" id="phase117OfflineStatus" aria-live="polite"><span className="phase117-offline-pill online">Local beta online</span><small>External services remain disabled; network is not used for AI, analytics, uploads, or persistence.</small></aside>
    </div>,
    document.body
  );
}

export function TodayPageController({ initialViewModel }: { initialViewModel: TodayViewModel }) {
  const [model, dispatch] = useReducer(reduceTodayViewModel, initialViewModel);
  const [notice, setNotice] = useState<SaveNotice>(null);
  const promisePaused = useRef(false);
  const storyPaused = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const promiseTimer = window.setInterval(() => {
      if (!promisePaused.current) dispatch({ type: "promise.next" });
    }, 8000);
    const storyTimer = window.setInterval(() => {
      if (!storyPaused.current) dispatch({ type: "story.next" });
    }, 7000);
    return () => { window.clearInterval(promiseTimer); window.clearInterval(storyTimer); };
  }, []);

  useEffect(() => {
    const generate = () => setNotice({ title: "Journey generated", detail: "Calling & Purpose connected to TIDUILOVP. Standard Scripture Path.", scripture: "Romans 8:28-30" });
    document.addEventListener("teoyube:generate-today", generate);
    return () => document.removeEventListener("teoyube:generate-today", generate);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 7200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const actions = useMemo<TodayViewActions>(() => ({
    previousPromise: () => dispatch({ type: "promise.previous" }),
    nextPromise: () => dispatch({ type: "promise.next" }),
    selectPromise: (index) => dispatch({ type: "promise.select", index }),
    previousStory: () => dispatch({ type: "story.previous" }),
    nextStory: () => dispatch({ type: "story.next" }),
    selectStory: (index) => dispatch({ type: "story.select", index }),
    changeSearchQuery: (query) => dispatch({ type: "search.query", query }),
    submitSearch: (query) => dispatch({ type: "search.submit", query }),
    loadSearchSuggestion: (query) => {
      dispatch({ type: "search.query", query });
      setNotice({ title: "Search suggestion loaded", detail: query, scripture: "Romans 8:28-30" });
      window.requestAnimationFrame(() => document.querySelector<HTMLInputElement>("#promiseMovieInput")?.focus());
    },
    clearSearchSuggestions: () => {
      dispatch({ type: "search.suggestions.clear" });
      setNotice({ title: "Search suggestions cleared", detail: "Session-only safe searches cleared.", scripture: "Romans 8:28-30" });
    },
    changeReflection: (value) => dispatch({ type: "reflection.change", value }),
    completeAssignment: () => {
      dispatch({ type: "assignment.complete" });
      setNotice({ title: "Assignment recorded", detail: "Calling & Purpose", scripture: "Romans 8:28-30" });
    },
    openPrayerFramework: () => router.push("/teo-guide"),
    previewSource: () => dispatch({ type: "media.preview" }),
    activatePromiseAction: (label) => {
      if (label.includes("Guardrails")) { router.push("/consent"); return; }
      if (label.includes("Search")) { router.push("/search"); return; }
      if (label.includes("Canon") || label === "Explore Teoyube") { router.push("/canon"); return; }
      if (label.includes("Promise Table") || label.includes("Favorite")) { router.push("/promise-table"); return; }
      if (label.includes("Journey") || label.includes("Progress") || label.includes("Impact") || label.includes("Promises")) {
        setNotice({ title: "Journey generated", detail: "Calling & Purpose connected to TIDUILOVP. Standard Scripture Path.", scripture: "Romans 8:28-30" });
      }
    },
    setPromisePaused: (paused) => { promisePaused.current = paused; },
    setStoryPaused: (paused) => { storyPaused.current = paused; }
  }), [router]);

  return <><ApprovedTodayView model={model} actions={actions} /><LegacyTodayOverlays model={model} notice={notice} clearNotice={() => setNotice(null)} /></>;
}
