"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LexiconEntry } from "../../domain/lexicon/lexicon-entry";
import type { LexiconPageViewModel } from "../../features/lexicon/application/lexicon-page-service";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedLexiconView } from "./ApprovedLexiconView";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function LexiconPageController({ initialViewModel }: { initialViewModel: LexiconPageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [notice, setNotice] = useState<MigrationNotice>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const entries = new Map(initialViewModel.entries.map((entry) => [entry.word.toLowerCase(), entry]));
    let activeLetter = "all";

    function selectedEntry(word: string) {
      return entries.get(word.toLowerCase()) || initialViewModel.entries.find((entry) => normalize(entry.word) === normalize(word));
    }

    function applyFilters() {
      const query = normalize(root?.querySelector<HTMLInputElement>("#lexiconSearchInput")?.value || "");
      const category = normalize(root?.querySelector<HTMLSelectElement>("#lexiconCategoryFilter")?.value || "all");
      const speech = normalize(root?.querySelector<HTMLSelectElement>("#lexiconSpeechFilter")?.value || "all");
      root?.querySelectorAll<HTMLElement>("#lexiconGrid .lexicon-item").forEach((card) => {
        const word = card.querySelector(".lexicon-card-head strong")?.textContent?.trim() || "";
        const part = normalize(card.querySelector(".lexicon-card-head span")?.textContent || "");
        const entry = selectedEntry(word);
        const haystack = normalize([card.textContent || "", entry?.pronunciation, entry?.promiseCategory, entry?.prayerUse, ...(entry?.scriptureSources || [])].join(" "));
        const categoryText = normalize(`${entry?.category || ""} ${entry?.promiseCategory || ""}`);
        const matches = (!query || haystack.includes(query))
          && (category === "all" || categoryText.includes(category))
          && (speech === "all" || part === speech || normalize(entry?.grammarRole || "") === speech)
          && (activeLetter === "all" || normalize(word).startsWith(activeLetter));
        card.hidden = !matches;
      });
    }

    function focusStudy(entry: LexiconEntry | undefined) {
      if (!entry) return;
      const select = root?.querySelector<HTMLSelectElement>("#phase116bLexiconWordSelect");
      if (select && [...select.options].some((option) => option.value === entry.word)) select.value = entry.word;
      const panel = root?.querySelector<HTMLElement>("#phase116bLexiconStudyPanel");
      const heading = panel?.querySelector(".phase116b-panel-head h3");
      const summary = panel?.querySelector(".phase116b-panel-head p:last-child");
      if (heading) heading.textContent = entry.word;
      if (summary) summary.textContent = entry.meaning;
      setNotice({
        title: `${entry.word} selected`,
        detail: `${initialViewModel.authorityNotice.label}. ${entry.meaning}`,
        scripture: entry.scriptureSources[0]
      });
    }

    function onInput(event: Event) {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      if (["lexiconSearchInput", "lexiconCategoryFilter", "lexiconSpeechFilter"].includes(target.id)) applyFilters();
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const alpha = target.closest<HTMLElement>("[data-lexicon-alpha]");
      if (alpha) {
        activeLetter = alpha.dataset.lexiconAlpha || "all";
        root?.querySelectorAll<HTMLElement>("[data-lexicon-alpha]").forEach((button) => {
          const active = button === alpha;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
          button.setAttribute("aria-pressed", String(active));
        });
        applyFilters();
        return;
      }
      const suggestion = target.closest<HTMLElement>("[data-phase116-query][data-phase116-input='lexiconSearchInput']");
      if (suggestion) {
        const input = root?.querySelector<HTMLInputElement>("#lexiconSearchInput");
        if (input) input.value = suggestion.dataset.phase116Query || "";
        applyFilters();
        return;
      }
      if (target.closest("[data-phase116-action='clear-search-suggestions']")) {
        const input = root?.querySelector<HTMLInputElement>("#lexiconSearchInput");
        if (input) input.value = "";
        applyFilters();
        return;
      }
      const action = target.closest<HTMLElement>("[data-phase116b-action]");
      if (action?.dataset.phase116bAction?.startsWith("lexicon-")) {
        const word = action.dataset.phase116bWord || root?.querySelector<HTMLSelectElement>("#phase116bLexiconWordSelect")?.value || "";
        const entry = selectedEntry(word);
        focusStudy(entry);
        if (action.dataset.phase116bAction === "lexicon-pray") setNotice({ title: `Prayer framework: ${entry?.word || word}`, detail: entry?.prayerUse || "Pray from the visible Scripture source with humility.", scripture: entry?.scriptureSources[0] });
        if (action.dataset.phase116bAction === "lexicon-add-table") setNotice({ title: "Added to Promise Table", detail: "Session-only and reversible; no durable write occurred.", scripture: entry?.scriptureSources[0] });
        if (action.dataset.phase116bAction === "lexicon-view-graph") setNotice({ title: "Lexicon explanation path", detail: `${entry?.word || word} -> ${entry?.promiseCategory || entry?.category || "Promise"} -> ${entry?.scriptureSources[0] || "Scripture"}` });
        if (action.dataset.phase116bAction === "lexicon-complete-study") setNotice({ title: "Study session complete", detail: "Recorded in this session only; Teoyube did not assign spiritual worth.", scripture: entry?.scriptureSources[0] });
        return;
      }
      if (target.closest(".lexicon-explore-word-button")) {
        focusStudy(selectedEntry(root?.querySelector("#lexiconWordDay h4")?.childNodes[0]?.textContent?.trim() || ""));
        root?.querySelector("#phase116bLexiconStudyPanel")?.scrollIntoView({ block: "center" });
        return;
      }
      if (target.closest(".lexicon-save-word-button, .lexicon-share-word-button, .lexicon-load-more, .lexicon-tools-card button, .lexicon-challenge-card button")) {
        setNotice({ title: target.getAttribute("aria-label") || target.textContent?.trim() || "Lexicon action ready", detail: "This preview remains local, reversible, and Scripture-submitted." });
        return;
      }
      const shortcut = target.closest<HTMLElement>("[data-view-shortcut]");
      if (shortcut?.dataset.viewShortcut === "book") router.push("/book");
    }

    function onChange(event: Event) {
      const target = event.target as HTMLSelectElement;
      if (target.id === "phase116bLexiconWordSelect") focusStudy(selectedEntry(target.value));
    }

    root.addEventListener("input", onInput);
    root.addEventListener("change", onInput);
    root.addEventListener("change", onChange);
    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onInput);
      root.removeEventListener("change", onChange);
      root.removeEventListener("click", onClick);
    };
  }, [initialViewModel, router]);

  return <><ApprovedLexiconView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} /></>;
}
