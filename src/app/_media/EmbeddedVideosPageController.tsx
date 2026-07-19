"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaAssetDto } from "../../domain/media/media-contracts";
import type { EmbeddedVideosPageViewModel } from "../../features/media/application/retained-media-page-service";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedEmbeddedVideosView } from "./ApprovedEmbeddedVideosView";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function EmbeddedVideosPageController({ initialViewModel }: { initialViewModel: EmbeddedVideosPageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [notice, setNotice] = useState<MigrationNotice>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let activeTab = "All Videos";
    const mediaById = new Map(initialViewModel.media.map((item) => [item.id, item]));

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
      const grid = root?.querySelector<HTMLElement>("#uiVideoGrid");
      const stats = root?.querySelector<HTMLElement>("#uiVideoStats");
      if (grid) grid.innerHTML = captured.grid;
      if (stats) stats.innerHTML = captured.stats;
      root?.querySelectorAll<HTMLElement>("#uiVideoCategoryTabs [data-video-category]").forEach((button) => button.classList.toggle("active", button.dataset.videoCategory === tabId));
      const select = root?.querySelector<HTMLSelectElement>("#uiVideoCategorySelect");
      if (select) select.value = tabId === "All Videos" ? "All Categories" : tabId;
      applySearch();
    }

    function assetFor(action: HTMLElement): MediaAssetDto | undefined {
      const id = action.dataset.uiVideoPlay || action.dataset.uiVideoSave || action.closest<HTMLElement>("[data-ui-video-id]")?.dataset.uiVideoId || "";
      return mediaById.get(id);
    }

    function play(action: HTMLElement) {
      const asset = assetFor(action);
      const stage = action.closest<HTMLElement>(".ui-video-card")?.querySelector<HTMLElement>("[data-ui-video-stage]");
      if (!asset || !stage) return;
      if (!asset.playbackUrl || asset.mimeType !== "video/mp4") {
        const detail = action.closest<HTMLElement>(".ui-video-card")?.querySelector<HTMLElement>("[data-ui-video-detail-panel]");
        if (detail) detail.hidden = false;
        setNotice({ title: `${asset.title} preview`, detail: "The original library record has no connected playable source; approved local pilot media remains available in its contained tab.", scripture: asset.scriptureReferences[0] });
        return;
      }
      root?.querySelectorAll<HTMLVideoElement>("video").forEach((video) => video.pause());
      stage.innerHTML = `<video controls playsinline preload="metadata" poster="${asset.posterUrl}"><source src="${asset.playbackUrl}" type="video/mp4">Your browser cannot play this local video.</video>`;
      stage.querySelector<HTMLVideoElement>("video")?.play().catch(() => undefined);
    }

    function cycleCard(action: HTMLElement) {
      const card = action.closest<HTMLElement>(".ui-video-card");
      if (!card) return;
      const source = card.dataset.uiVideoSource === "approved" ? "approved_teoyubeworld_pilot" : "original_local_preview";
      const candidates = initialViewModel.media.filter((item) => item.source === source);
      const current = candidates.findIndex((item) => item.id === card.dataset.uiVideoId);
      const offset = action.dataset.uiVideoNav === "next" ? 1 : -1;
      const selected = candidates[(Math.max(0, current) + offset + candidates.length) % candidates.length];
      if (!selected) return;
      card.dataset.uiVideoId = selected.id;
      card.querySelectorAll<HTMLElement>("[data-ui-video-play]").forEach((button) => { button.dataset.uiVideoPlay = selected.id; });
      const heading = card.querySelector("h4");
      if (heading) heading.textContent = selected.title;
      card.querySelectorAll<HTMLImageElement>(".embedded-video-poster-image, .embedded-video-poster-backdrop").forEach((image) => { image.src = selected.thumbnailUrl; });
      const position = card.querySelector(".embedded-video-position");
      if (position) position.textContent = `${((current + offset + candidates.length) % candidates.length) + 1} / ${candidates.length}`;
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
    return () => { root.removeEventListener("input", onInput); root.removeEventListener("change", onChange); root.removeEventListener("click", onClick); };
  }, [initialViewModel, router]);

  return <><ApprovedEmbeddedVideosView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} /></>;
}
