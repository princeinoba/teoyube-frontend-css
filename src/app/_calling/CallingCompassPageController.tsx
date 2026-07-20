"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "../../features/journey/ui/DailySpiritualLoopProvider";
import type { CallingCompassViewModel } from "../../domain/calling/calling-discernment";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedCallingCompassView } from "./ApprovedCallingCompassView";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}

export function CallingCompassPageController({ initialViewModel }: { initialViewModel: CallingCompassViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const stepRef = useRef(0);
  const startedRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  const selectedMediaRef = useRef(0);
  const resultVisibleRef = useRef(false);
  const [notice, setNotice] = useState<MigrationNotice>(null);
  const router = useRouter();
  const { state: dailySpiritualLoop, act: actOnDailySpiritualLoop } = useDailySpiritualLoop();
  const callingMomentActive = dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "calling_discernment";

  useEffect(() => {
    const currentRoot = rootRef.current;
    if (!currentRoot) return;
    const root: HTMLElement = currentRoot;

    function renderCompass() {
      const panel = root.querySelector<HTMLElement>("#phase116bCallingCompassTool");
      const question = initialViewModel.questions[stepRef.current];
      if (!panel || !question) return;
      const result = initialViewModel.discernment;
      panel.innerHTML = `<div class="phase116b-panel-head"><div><p class="eyebrow">Guided Calling Compass</p><h3>${startedRef.current ? `Question ${stepRef.current + 1} of ${initialViewModel.questions.length}` : "Start a cautious calling flow"}</h3><p>Language stays suggestive, Scripture-tested, and counsel-aware.</p></div><button class="primary" type="button" data-phase116b-action="compass-start">Start Compass</button></div><div class="phase116b-compass-progress">${initialViewModel.questions.map((item, index) => `<span class="${startedRef.current && index <= stepRef.current ? "active" : ""}">${escapeHtml(item.id)}</span>`).join("")}</div><article class="phase116b-compass-card"><h4>${escapeHtml(question.prompt)}</h4><div class="phase116b-chip-row">${question.options.map((option) => `<button type="button" class="${answersRef.current[question.id] === option ? "active" : ""}" data-phase116b-compass-answer="${question.id}" data-phase116b-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}</div><div class="phase116b-action-row"><button class="secondary" type="button" data-phase116b-action="compass-back" ${stepRef.current === 0 ? "disabled" : ""}>Back</button><button class="secondary" type="button" data-phase116b-action="compass-next">Next</button><button class="primary" type="button" data-phase116b-action="compass-result">Generate Result</button></div></article>${resultVisibleRef.current ? `<article class="phase116b-result-card"><p class="eyebrow">Calling result</p><h4>${escapeHtml(result.title)}</h4><p>${escapeHtml(result.summary)}</p><div class="scripture-strip"><span class="scripture-pill">${escapeHtml(result.scriptureReference)}</span>${result.relatedWords.map((word) => `<span class="scripture-pill">${escapeHtml(word)}</span>`).join("")}</div><p><strong>Prayer:</strong> ${escapeHtml(result.prayer)}</p><p><strong>Action:</strong> ${escapeHtml(result.actionStep)}</p><div class="phase116b-action-row"><button class="secondary" type="button" data-phase116b-action="compass-save-reflection">Save Reflection</button><button class="secondary" type="button" data-phase116b-action="compass-start-journey"${callingMomentActive ? " data-daily-journey-action=\"accept\"" : ""}>Start Journey</button><button class="secondary" type="button" data-phase116b-action="open-current-graph">View Graph</button><button class="secondary" type="button" data-phase115-action="compare-recommendation">Compare Preview</button></div></article>` : ""}`;
    }

    function selectMedia(index: number) {
      const media = initialViewModel.media;
      if (!media.length) return;
      selectedMediaRef.current = ((index % media.length) + media.length) % media.length;
      const selected = media[selectedMediaRef.current];
      root.querySelectorAll<HTMLElement>("#compassVideoList .compass-video-item").forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === selectedMediaRef.current));
      const player = root.querySelector("#compassVideoPlayer");
      if (!player) return;
      player.querySelectorAll(".compass-player-topbar strong, .compass-featured-meta h4").forEach((element) => { element.textContent = selected.title; });
      const image = player.querySelector<HTMLImageElement>(".compass-video-frame img");
      if (image) image.src = selected.image;
      const play = player.querySelector<HTMLButtonElement>(".compass-embed-play-overlay");
      if (play) { play.dataset.videoId = selected.id; play.setAttribute("aria-label", `Play ${selected.title}`); }
      const description = player.querySelector(".compass-featured-meta p");
      if (description) description.textContent = selected.description;
      const meta = player.querySelectorAll(".compass-featured-row span");
      if (meta.length) meta[meta.length - 1].textContent = selected.duration;
    }

    function setSearch(query: string) {
      const input = root.querySelector<HTMLInputElement>("#compassVideoInput");
      const status = root.querySelector("#compassVideoStatus");
      if (input) input.value = query;
      const matchIndex = initialViewModel.media.findIndex((media) => `${media.title} ${media.description}`.toLowerCase().includes(query.toLowerCase()));
      if (matchIndex >= 0) selectMedia(matchIndex);
      if (status) status.textContent = `${matchIndex >= 0 ? 1 : 0} local TeoyubeWorld preview${matchIndex >= 0 ? "" : "s"} found. External video sources are not connected in this preview.`;
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement;
      if (form.id !== "compassVideoForm") return;
      event.preventDefault();
      setSearch(root.querySelector<HTMLInputElement>("#compassVideoInput")?.value || "TeoyubeWorld");
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const query = target.closest<HTMLElement>("[data-query], [data-phase116-query]");
      if (query) { setSearch(query.dataset.query || query.dataset.phase116Query || ""); return; }
      if (target.closest('[data-phase116-action="clear-search-suggestions"]')) { setSearch(""); return; }
      const nav = target.closest<HTMLElement>("[data-compass-video-nav]");
      if (nav) { selectMedia(selectedMediaRef.current + (nav.dataset.compassVideoNav === "next" ? 1 : -1)); return; }
      const mediaButton = target.closest<HTMLElement>("#compassVideoList .compass-video-item");
      if (mediaButton) { selectMedia(Number(mediaButton.dataset.index || 0)); return; }
      const answer = target.closest<HTMLElement>("[data-phase116b-compass-answer]");
      if (answer) { answersRef.current[answer.dataset.phase116bCompassAnswer || ""] = answer.dataset.phase116bValue || ""; renderCompass(); return; }
      const action = target.closest<HTMLElement>("[data-phase116b-action]");
      const actionId = action?.dataset.phase116bAction;
      if (actionId === "compass-start") { startedRef.current = true; stepRef.current = 0; resultVisibleRef.current = false; renderCompass(); setNotice({ title: "Start Calling Compass", detail: "Calling Compass started with cautious language." }); return; }
      if (actionId === "compass-back" || actionId === "compass-next") { stepRef.current = Math.max(0, Math.min(initialViewModel.questions.length - 1, stepRef.current + (actionId === "compass-next" ? 1 : -1))); renderCompass(); return; }
      if (actionId === "compass-result") { resultVisibleRef.current = true; renderCompass(); setNotice({ title: "Calling Compass result ready", detail: initialViewModel.discernment.title, scripture: initialViewModel.discernment.scriptureReference }); return; }
      if (actionId === "compass-save-reflection") { setNotice({ title: "Calling reflection saved", detail: initialViewModel.discernment.title, scripture: initialViewModel.discernment.scriptureReference }); return; }
      if (actionId === "compass-start-journey") {
        if (callingMomentActive) {
          actOnDailySpiritualLoop({ type: "accept", userInput: `${initialViewModel.discernment.summary} ${initialViewModel.discernment.explanationPath.join(" ")}` });
          router.push("/");
          return;
        }
        setNotice({ title: "Calling journey started", detail: initialViewModel.discernment.journeyRecommendation, scripture: initialViewModel.discernment.scriptureReference });
        return;
      }
      if (actionId === "open-current-graph") { setNotice({ title: "Calling explanation path", detail: initialViewModel.discernment.explanationPath.join(" -> "), scripture: initialViewModel.discernment.scriptureReference }); return; }
      if (target.closest(".calling-assistant-actions button, .calling-category-grid button, .calling-recommendation-grid article, [data-phase115-action]")) setNotice({ title: target.textContent?.trim() || "Calling action ready", detail: initialViewModel.discernment.limitation, scripture: initialViewModel.discernment.scriptureReference });
    }

    root.addEventListener("submit", onSubmit);
    root.addEventListener("click", onClick);
    return () => { root.removeEventListener("submit", onSubmit); root.removeEventListener("click", onClick); };
  }, [actOnDailySpiritualLoop, callingMomentActive, initialViewModel, router]);

  return <><ApprovedCallingCompassView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} /></>;
}
