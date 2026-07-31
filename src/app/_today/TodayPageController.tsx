"use client";

import { useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "@/features/journey/ui/DailySpiritualLoopProvider";
import { getDailySpiritualLoopProgress } from "@/domain/journey/daily-spiritual-loop";
import type { TodayViewActions, TodayViewModel } from "@/features/today/contracts";
import { reduceTodayViewModel } from "@/features/today/application/today-service";
import { createTodayYouTubeEmbedUrl, isTodayStoryPlayable } from "@/features/today/today-youtube";
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
      <aside className="phase117-offline-status" id="phase117OfflineStatus" aria-live="polite"><span className="phase117-offline-pill online">Local beta online</span><small>YouTube media connects only after you press Play; Teoyube does not use that connection for AI, analytics, uploads, or persistence.</small></aside>
    </div>,
    document.body
  );
}

export function TodayPageController({ initialViewModel }: { initialViewModel: TodayViewModel }) {
  const [model, dispatch] = useReducer(reduceTodayViewModel, initialViewModel);
  const [notice, setNotice] = useState<SaveNotice>(null);
  const promisePaused = useRef(false);
  const storyPaused = useRef(false);
  const playerActive = useRef(false);
  const router = useRouter();
  const { state: dailySpiritualLoop, start: startDailySpiritualLoop, act: actOnDailySpiritualLoop } = useDailySpiritualLoop();

  useEffect(() => {
    const promiseTimer = window.setInterval(() => {
      if (!promisePaused.current) dispatch({ type: "promise.next" });
    }, 8000);
    const storyTimer = window.setInterval(() => {
      if (!storyPaused.current && !playerActive.current) dispatch({ type: "story.next" });
    }, 7000);
    return () => { window.clearInterval(promiseTimer); window.clearInterval(storyTimer); };
  }, []);

  useEffect(() => {
    playerActive.current = model.sourcePreviewOpened;
  }, [model.sourcePreviewOpened]);

  useEffect(() => {
    const generate = () => {
      if (!dailySpiritualLoop?.active) startDailySpiritualLoop();
      setNotice({ title: "Journey generated", detail: "Begin with a private check-in in the existing Daily Divine Assignment field.", scripture: "Romans 8:28-30" });
    };
    document.addEventListener("teoyube:generate-today", generate);
    return () => document.removeEventListener("teoyube:generate-today", generate);
  }, [dailySpiritualLoop?.active, startDailySpiritualLoop]);

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
    playStory: (storyId) => {
      storyPaused.current = true;
      dispatch({ type: "story.play", storyId });
    },
    playSelectedStory: () => {
      storyPaused.current = true;
      dispatch({ type: "media.preview" });
    },
    playPreviousStory: () => {
      storyPaused.current = true;
      dispatch({ type: "story.play.previous" });
    },
    playNextStory: () => {
      storyPaused.current = true;
      dispatch({ type: "story.play.next" });
    },
    markPlayerReady: () => dispatch({ type: "media.ready" }),
    markPlayerError: () => dispatch({ type: "media.error" }),
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
      if (dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "check_in") {
        actOnDailySpiritualLoop({ type: "accept", userInput: model.reflection });
        dispatch({ type: "assignment.complete" });
        router.push("/canon");
        return;
      }
      if (dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "daily_assignment") {
        actOnDailySpiritualLoop({ type: "accept", userInput: model.assignmentItems.join(" ") });
        dispatch({ type: "assignment.complete" });
        router.push("/journal");
        return;
      }
      if (dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "tomorrow") {
        actOnDailySpiritualLoop({ type: "accept", userInput: model.reflection });
        dispatch({ type: "assignment.complete" });
        setNotice({
          title: "Journey complete",
          detail: "Tomorrow's carry-forward remains editable, session-only, and free of hidden profiling.",
          scripture: dailySpiritualLoop.artifacts.scripture.payload.references[0] || "Ephesians 1:18"
        });
        return;
      }
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
  }), [actOnDailySpiritualLoop, dailySpiritualLoop, model.assignmentItems, model.reflection, router]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("#today");
    if (!root) return;
    const selected = model.stories[model.activeStoryIndex];
    const playbackStatus = root.querySelector<HTMLElement>("#promiseMovieStatus");
    playbackStatus?.setAttribute("role", "status");
    playbackStatus?.setAttribute("aria-live", "polite");
    const selectedPlayable = isTodayStoryPlayable(selected);

    root.querySelectorAll<HTMLTableRowElement>("#clientsPromiseRows tr").forEach((row, index) => {
      const story = model.stories[index];
      const button = row.querySelector<HTMLButtonElement>(".today-video-select");
      if (!story || !button) return;
      const playable = isTodayStoryPlayable(story);
      row.dataset.todayStoryId = story.id;
      row.dataset.playbackStatus = story.playbackStatus;
      button.dataset.todayStoryId = story.id;
      button.disabled = !playable;
      button.setAttribute("aria-disabled", String(!playable));
      button.setAttribute(
        "aria-label",
        playable
          ? `Play ${story.title} in TeoyubeWorld Video Highlight`
          : `Playback unavailable for ${story.title}: ${story.playbackUnavailableReason}`
      );
      button.title = playable ? `Play ${story.title}` : story.playbackUnavailableReason || "Playback unavailable";
    });

    const panel = root.querySelector<HTMLElement>("#promiseMovieResult");
    const frameShell = panel?.querySelector<HTMLElement>(".promise-video-thumbnail.promise-youtube-frame");
    const frame = frameShell?.querySelector<HTMLIFrameElement>("iframe");
    const overlay = frameShell?.querySelector<HTMLButtonElement>(".promise-embed-play-overlay");
    const watchButton = panel?.querySelector<HTMLButtonElement>(".watch-now-button");
    const note = panel?.querySelector<HTMLElement>(".local-media-note");
    panel?.querySelector<HTMLElement>(".promise-video-nav")?.setAttribute("role", "group");
    if (selected && frameShell && frame && watchButton && note) {
      if (overlay) {
        overlay.dataset.todayStoryId = selected.id;
        overlay.disabled = !selectedPlayable;
        overlay.setAttribute("aria-disabled", String(!selectedPlayable));
        overlay.setAttribute(
          "aria-label",
          selectedPlayable
            ? `Play ${selected.title} in TeoyubeWorld Video Highlight`
            : `Playback unavailable for ${selected.title}: ${selected.playbackUnavailableReason}`
        );
      }
      const playing = selectedPlayable && model.sourcePreviewOpened && model.activePlaybackStoryId === selected.id;
      watchButton.dataset.todayStoryId = selected.id;
      watchButton.disabled = !selectedPlayable;
      watchButton.setAttribute("aria-disabled", String(!selectedPlayable));
      watchButton.textContent = selectedPlayable ? "Play Official Video" : "Source Unavailable";
      watchButton.title = selectedPlayable
        ? `Play ${selected.title}`
        : selected.playbackUnavailableReason || "Playback unavailable";
      note.textContent = selectedPlayable
        ? "Official TeoyubeWorld video. YouTube playback begins only after you press Play."
        : "No exact official TeoyubeWorld channel video is available for this feed item.";
      frame.title = playing ? `TeoyubeWorld video: ${selected.title}` : `${selected.title} media preview`;
      frame.allow = "autoplay; encrypted-media; picture-in-picture; web-share";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frameShell.dataset.todayActiveStoryId = selected.id;
      frameShell.dataset.playbackState = model.playbackState;
      if (playing) {
        const embedUrl = createTodayYouTubeEmbedUrl(selected);
        if (embedUrl) {
          frame.removeAttribute("srcdoc");
          if (frame.src !== embedUrl) frame.src = embedUrl;
          frame.dataset.youtubeVideoId = selected.youtubeVideoId;
          if (frame.dataset.playbackListener !== selected.id) {
            frame.dataset.playbackListener = selected.id;
            frame.addEventListener("load", actions.markPlayerReady, { once: true });
            frame.addEventListener("error", actions.markPlayerError, { once: true });
          }
        }
      } else {
        frame.removeAttribute("src");
        delete frame.dataset.youtubeVideoId;
      }
    }

    const handlePlaybackClick = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const rowButton = target.closest<HTMLButtonElement>("#clientsPromiseRows .today-video-select");
      const mainButton = target.closest<HTMLButtonElement>("#promiseMovieResult .promise-embed-play-overlay, #promiseMovieResult .watch-now-button");
      const navButton = target.closest<HTMLButtonElement>("#promiseMovieResult [data-today-video-nav]");
      if (rowButton && !rowButton.disabled) {
        event.preventDefault();
        event.stopPropagation();
        actions.playStory(rowButton.dataset.todayStoryId || "");
      } else if (mainButton && !mainButton.disabled) {
        event.preventDefault();
        event.stopPropagation();
        actions.playSelectedStory();
      } else if (navButton) {
        event.preventDefault();
        event.stopPropagation();
        if (navButton.dataset.todayVideoNav === "previous") actions.playPreviousStory();
        else actions.playNextStory();
      }
    };
    root.addEventListener("click", handlePlaybackClick, true);
    return () => root.removeEventListener("click", handlePlaybackClick, true);
  }, [actions, model.activePlaybackStoryId, model.activeStoryIndex, model.playbackState, model.sourcePreviewOpened, model.stories]);
  const approvedModel = useMemo<TodayViewModel>(() => {
    if (!dailySpiritualLoop?.active || !["check_in", "daily_assignment", "tomorrow"].includes(dailySpiritualLoop.currentStage)) return model;
    const stage = dailySpiritualLoop.currentStage as "check_in" | "daily_assignment" | "tomorrow";
    return {
      ...model,
      journeyMoment: {
        stage,
        progressPercent: getDailySpiritualLoopProgress(dailySpiritualLoop),
        reflectionPlaceholder: stage === "check_in"
          ? "How are you arriving today? This remains in memory only."
          : stage === "tomorrow"
            ? "Optional note for tomorrow; no hidden profile is created."
            : "Optional note for this voluntary, Scripture-consistent action.",
        primaryLabel: stage === "check_in"
          ? "Continue to Scripture"
          : stage === "tomorrow"
            ? "Carry Forward to Tomorrow"
            : "Complete Assignment",
        progressItems: [
          { label: "Prayer", complete: dailySpiritualLoop.artifacts.prayer.status !== "pending" },
          { label: "Scripture", complete: dailySpiritualLoop.artifacts.scripture.status !== "pending" },
          { label: "Reflection", complete: dailySpiritualLoop.artifacts.reflection.status !== "pending" },
          { label: "Assignment", complete: dailySpiritualLoop.artifacts.daily_assignment.status !== "pending" }
        ]
      }
    };
  }, [dailySpiritualLoop, model]);

  return <><ApprovedTodayView model={approvedModel} actions={actions} /><LegacyTodayOverlays model={approvedModel} notice={notice} clearNotice={() => setNotice(null)} /></>;
}
