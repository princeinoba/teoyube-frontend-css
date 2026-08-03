"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaAssetDto } from "../../domain/media/media-contracts";
import type { EmbeddedVideosPageViewModel } from "../../features/media/application/retained-media-page-service";
import { createEmbeddedVideosYouTubeEmbedUrl } from "../../features/media/embedded-videos-youtube";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedEmbeddedVideosView } from "./ApprovedEmbeddedVideosView";
import { syncEmbeddedVideoCard } from "./embedded-video-card-sync";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

type ActivePlayback = {
  stage: HTMLElement;
  markup: string;
};

export function EmbeddedVideosPageController({ initialViewModel }: { initialViewModel: EmbeddedVideosPageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [notice, setNotice] = useState<MigrationNotice>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let activeTab = "All Videos";
    let activePlayback: ActivePlayback | null = null;
    const mediaById = new Map(initialViewModel.media.map((item) => [item.id, item]));

    function restoreActivePlayback() {
      const playback = activePlayback;
      activePlayback = null;
      if (!playback?.stage.isConnected) return;
      playback.stage.innerHTML = playback.markup;
      delete playback.stage.dataset.playbackState;
      delete playback.stage.dataset.activeVideoId;
    }

    function installPlayback(stage: HTMLElement, asset: MediaAssetDto, player: HTMLElement) {
      restoreActivePlayback();
      root?.querySelectorAll<HTMLVideoElement>("video").forEach((video) => video.pause());
      const markup = stage.innerHTML;
      stage.replaceChildren(player);
      stage.dataset.playbackState = "playing";
      stage.dataset.activeVideoId = asset.id;
      activePlayback = { stage, markup };
    }

    function applySearch() {
      const query = normalize(root?.querySelector<HTMLInputElement>("#uiVideoSearch")?.value || "");
      root?.querySelectorAll<HTMLElement>("#uiVideoGrid .ui-video-card").forEach((card) => {
        card.hidden = Boolean(query) && !normalize(card.textContent || "").includes(query);
      });
    }

    function applyTab(tabId: string) {
      const captured = initialViewModel.tabs[tabId];
      if (!captured) return;
      activeTab = tabId;
      activePlayback = null;
      const grid = root?.querySelector<HTMLElement>("#uiVideoGrid");
      const stats = root?.querySelector<HTMLElement>("#uiVideoStats");
      if (grid) grid.innerHTML = captured.grid;
      if (stats) stats.innerHTML = captured.stats;
      root?.querySelectorAll<HTMLElement>("#uiVideoCategoryTabs [data-video-category]").forEach((button) => button.classList.toggle("active", button.dataset.videoCategory === tabId));
      const select = root?.querySelector<HTMLSelectElement>("#uiVideoCategorySelect");
      if (select) select.value = tabId === "All Videos" ? "All Categories" : tabId;
      const loadMore = root?.querySelector<HTMLElement>("#uiVideoLoadMore");
      if (loadMore) {
        const cardCount = grid?.querySelectorAll(".ui-video-card").length || 0;
        const shouldHide = tabId === "TeoyubeWorld Media" || (tabId !== "All Videos" && cardCount <= 4);
        loadMore.hidden = shouldHide;
        loadMore.style.display = shouldHide ? "none" : "";
      }
      applySearch();
    }

    function assetFor(action: HTMLElement): MediaAssetDto | undefined {
      const id = action.dataset.uiVideoPlay || action.dataset.uiVideoSave || action.closest<HTMLElement>("[data-ui-video-id]")?.dataset.uiVideoId || "";
      return mediaById.get(id);
    }

    function play(action: HTMLElement) {
      const asset = assetFor(action);
      const card = action.closest<HTMLElement>(".ui-video-card");
      const stage = card?.querySelector<HTMLElement>("[data-ui-video-stage]");
      if (!asset || !card || !stage) return;

      const youtubeEmbedUrl = createEmbeddedVideosYouTubeEmbedUrl(asset);
      if (youtubeEmbedUrl) {
        const frame = document.createElement("iframe");
        frame.title = `TeoyubeWorld video: ${asset.title}`;
        frame.src = youtubeEmbedUrl;
        frame.allow = "autoplay; encrypted-media; picture-in-picture; web-share";
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        frame.setAttribute("allowfullscreen", "");
        frame.dataset.youtubeVideoId = asset.youtubeVideoId || "";
        frame.addEventListener("error", () => {
          if (activePlayback?.stage !== stage) return;
          restoreActivePlayback();
          setNotice({
            title: `${asset.title} playback unavailable`,
            detail: "The verified TeoyubeWorld video could not load. Check the network connection and try again.",
            scripture: asset.scriptureReferences[0]
          });
        }, { once: true });
        installPlayback(stage, asset, frame);
        return;
      }

      if (asset.playbackUrl && asset.mimeType === "video/mp4") {
        const video = document.createElement("video");
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.poster = asset.posterUrl;
        const source = document.createElement("source");
        source.src = asset.playbackUrl;
        source.type = "video/mp4";
        video.append(source, document.createTextNode("Your browser cannot play this local video."));
        installPlayback(stage, asset, video);
        video.play().catch(() => undefined);
        return;
      }

      const detail = card.querySelector<HTMLElement>("[data-ui-video-detail-panel]");
      if (detail) detail.hidden = false;
      setNotice({
        title: `${asset.title} preview`,
        detail: "This library record has no verified playable source.",
        scripture: asset.scriptureReferences[0]
      });
    }

    function cycleCard(action: HTMLElement) {
      const card = action.closest<HTMLElement>(".ui-video-card");
      if (!card) return;
      const stage = card.querySelector<HTMLElement>("[data-ui-video-stage]");
      const shouldResumePlayback = Boolean(stage && activePlayback?.stage === stage);
      if (shouldResumePlayback) restoreActivePlayback();
      const source = card.dataset.uiVideoSource === "approved" ? "approved_teoyubeworld_pilot" : "original_local_preview";
      const candidates = initialViewModel.media.filter((item) => item.source === source);
      const current = candidates.findIndex((item) => item.id === card.dataset.uiVideoId);
      const offset = action.dataset.uiVideoNav === "next" ? 1 : -1;
      const selectedPosition = (Math.max(0, current) + offset + candidates.length) % candidates.length;
      const selected = candidates[selectedPosition];
      if (!selected) return;
      card.dataset.uiVideoId = selected.id;
      card.querySelectorAll<HTMLElement>("[data-ui-video-play]").forEach((button) => { button.dataset.uiVideoPlay = selected.id; });
      const heading = card.querySelector("h4");
      if (heading) heading.textContent = selected.title;
      card.querySelectorAll<HTMLImageElement>(".embedded-video-poster-image, .embedded-video-poster-backdrop").forEach((image) => { image.src = selected.thumbnailUrl; });
      const position = card.querySelector(".embedded-video-position");
      if (position) position.textContent = `${((current + offset + candidates.length) % candidates.length) + 1} / ${candidates.length}`;
      syncEmbeddedVideoCard(card, selected, selectedPosition, candidates.length);
      if (shouldResumePlayback) {
        const resume = card.querySelector<HTMLElement>("[data-ui-video-play]");
        if (resume) play(resume);
      }
    }

    function onInput(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.id === "uiVideoSearch") applySearch();
    }

    function onChange(event: Event) {
      const target = event.target as HTMLSelectElement;
      if (target.id === "uiVideoCategorySelect") applyTab(target.value === "All Categories" ? "All Videos" : target.value);
      if (target.id === "uiVideoSort") {
        const grid = root?.querySelector("#uiVideoGrid");
        const cards = [...(grid?.querySelectorAll<HTMLElement>(".ui-video-card") || [])];
        if (target.value.includes("Scripture")) cards.sort((left, right) => normalize(left.querySelector(".ui-video-meta")?.textContent || "").localeCompare(normalize(right.querySelector(".ui-video-meta")?.textContent || "")));
        if (target.value.includes("Shortest")) cards.sort((left, right) => (left.querySelector(".ui-video-duration")?.textContent || "").localeCompare(right.querySelector(".ui-video-duration")?.textContent || ""));
        cards.forEach((card) => grid?.appendChild(card));
      }
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const tab = target.closest<HTMLElement>("[data-video-category]");
      if (tab) { applyTab(tab.dataset.videoCategory || "All Videos"); return; }
      const suggestion = target.closest<HTMLElement>("[data-phase116-query][data-phase116-input='uiVideoSearch']");
      if (suggestion) {
        const input = root?.querySelector<HTMLInputElement>("#uiVideoSearch");
        if (input) input.value = suggestion.dataset.phase116Query || "";
        applySearch();
        return;
      }
      if (target.closest("[data-phase116-action='clear-search-suggestions']")) {
        const input = root?.querySelector<HTMLInputElement>("#uiVideoSearch");
        if (input) input.value = "";
        applySearch();
        return;
      }
      const navigation = target.closest<HTMLElement>("[data-ui-video-nav]");
      if (navigation) { cycleCard(navigation); return; }
      const playButton = target.closest<HTMLElement>("[data-ui-video-play]");
      if (playButton) { play(playButton); return; }
      const detailButton = target.closest<HTMLElement>("[data-ui-video-detail]");
      if (detailButton) {
        const panel = root?.querySelector<HTMLElement>(`[data-ui-video-detail-panel="${CSS.escape(detailButton.dataset.uiVideoDetail || "")}"]`);
        if (panel) { panel.hidden = !panel.hidden; detailButton.setAttribute("aria-expanded", String(!panel.hidden)); }
        return;
      }
      const saveButton = target.closest<HTMLElement>("[data-ui-video-save]");
      if (saveButton) {
        const asset = assetFor(saveButton);
        setNotice({ title: "Video saved to Book", detail: "Session-only, reversible, and no external request was made.", scripture: asset?.scriptureReferences[0] });
        return;
      }
      const scriptureButton = target.closest<HTMLElement>("[data-ui-video-scripture]");
      if (scriptureButton) { router.push(`/search?q=${encodeURIComponent(scriptureButton.dataset.uiVideoScripture || "")}`); return; }
      if (target.closest("#refreshUiVideos")) { applyTab(activeTab); setNotice({ title: "Local video library refreshed", detail: "No external source was contacted." }); return; }
      if (target.closest("#uiVideoLoadMore")) setNotice({ title: "More local media ready", detail: "Pagination remains local and no external source was contacted." });
      const shortcut = target.closest<HTMLElement>("[data-view-shortcut]");
      if (shortcut?.dataset.viewShortcut === "today") router.push("/");
    }

    root.addEventListener("input", onInput);
    root.addEventListener("change", onChange);
    root.addEventListener("click", onClick);
    return () => {
      activePlayback = null;
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onChange);
      root.removeEventListener("click", onClick);
    };
  }, [initialViewModel, router]);

  return <><ApprovedEmbeddedVideosView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} /></>;
}