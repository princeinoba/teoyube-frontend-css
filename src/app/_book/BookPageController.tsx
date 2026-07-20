"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "../../features/journey/ui/DailySpiritualLoopProvider";
import { createJournalRecord } from "../../domain/journal/journal-record";
import type { BookPageViewModel } from "../../features/book/application/book-page-service";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedBookView } from "./ApprovedBookView";

export function BookPageController({ initialViewModel }: { initialViewModel: BookPageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const removedRef = useRef<{ node: HTMLElement; parent: HTMLElement; next: ChildNode | null } | null>(null);
  const [notice, setNotice] = useState<MigrationNotice>(null);
  const router = useRouter();
  const { state: dailySpiritualLoop, act: actOnDailySpiritualLoop } = useDailySpiritualLoop();
  const bookReviewMomentActive = dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "book_review";

  useEffect(() => {
    const currentRoot = rootRef.current;
    if (!currentRoot) return;
    const root: HTMLElement = currentRoot;
    const continuationScore = root.querySelector<HTMLElement>("#phase116b1Continuation-book .phase116b-score");
    if (continuationScore) continuationScore.textContent = "book";
    if (bookReviewMomentActive) {
      const promotionButton = root.querySelector<HTMLButtonElement>('[data-teoyube-action="continuation.journey"]');
      if (promotionButton) {
        promotionButton.textContent = "Add Reviewed Testimony to Book";
        promotionButton.dataset.dailyJourneyAction = "accept";
      }
    }

    function filterTimeline() {
      const query = root.querySelector<HTMLInputElement>("#bookSearchInput")?.value.trim().toLowerCase() || "";
      const type = root.querySelector<HTMLSelectElement>("#bookTypeFilter")?.value || "All";
      root.querySelectorAll<HTMLElement>("#bookTimeline .timeline-entry").forEach((entry) => {
        const typeMatches = type.toLowerCase() === "all" || entry.className.toLowerCase().includes(type.toLowerCase().replace(/\s+/g, "-"));
        entry.hidden = !entry.textContent?.toLowerCase().includes(query) || !typeMatches;
      });
    }

    function onInput(event: Event) {
      const target = event.target as HTMLElement;
      if (target.matches("#bookSearchInput, #bookTypeFilter, #bookDateFilter")) filterTimeline();
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const query = target.closest<HTMLElement>("[data-book-query], [data-phase116-query]");
      if (query) {
        const input = root.querySelector<HTMLInputElement>("#bookSearchInput");
        if (input) input.value = query.dataset.bookQuery || query.dataset.phase116Query || query.textContent?.trim() || "";
        filterTimeline();
        return;
      }
      if (target.closest("#addManualEntry, [data-phase114-action='add-reflection']")) {
        root.querySelector<HTMLInputElement>("#phase116bJournalContent")?.focus();
        setNotice({ title: "Reflection ready", detail: "This reflection remains private and session-only until you choose another action." });
        return;
      }
      const action = target.closest<HTMLElement>("[data-phase116-action], [data-phase116b-action], [data-phase117-action], [data-teoyube-action]");
      const actionId = action?.dataset.phase116Action || action?.dataset.phase116bAction || action?.dataset.phase117Action || action?.dataset.teoyubeAction;
      if (actionId === "continuation.journey" && bookReviewMomentActive) {
        actOnDailySpiritualLoop({ type: "accept", userInput: dailySpiritualLoop?.artifacts.testimony_candidate.payload.bodySummary || "Reviewed testimony promoted by explicit user confirmation." });
        router.push("/");
        return;
      }
      if (actionId === "clear-search-suggestions") {
        const input = root.querySelector<HTMLInputElement>("#bookSearchInput");
        if (input) input.value = "";
        filterTimeline();
        return;
      }
      if (actionId === "journal-save") {
        const title = root.querySelector<HTMLInputElement>("#phase116bJournalTitle")?.value.trim() || "Book reflection";
        const text = root.querySelector<HTMLInputElement>("#phase116bJournalContent")?.value || "Reflection started in this local session.";
        const entry = createJournalRecord({ text, scriptureReferences: ["Ephesians 1:18"], createdAt: new Date().toISOString() });
        setNotice({ title: "Journal entry saved", detail: `${title}: ${entry.summary}. It was not promoted to the Book.`, scripture: "Ephesians 1:18" });
        return;
      }
      if (actionId === "book-remove") {
        const node = action?.closest<HTMLElement>(".timeline-entry, .phase116b-detail-drawer");
        if (node?.parentElement) {
          removedRef.current = { node, parent: node.parentElement, next: node.nextSibling };
          node.remove();
          setNotice({ title: "Book item removed", detail: "The session-only item can be restored.", undoLabel: "Undo" });
        }
        return;
      }
      if (actionId === "book-detail" || actionId === "open-current-graph") {
        setNotice({ title: actionId === "book-detail" ? "Book detail opened" : "Explanation path ready", detail: action?.dataset.phase116bId || "The selected source and Scripture anchors remain visible." });
        return;
      }
      if (actionId || target.closest(".book-actions-card button, .book-memory-actions button, .book-pagination button")) {
        setNotice({ title: target.textContent?.trim() || "Book action ready", detail: "This local preview performs no durable write, automatic testimony, or divine claim." });
      }
    }

    root.addEventListener("input", onInput);
    root.addEventListener("change", onInput);
    root.addEventListener("click", onClick);
    return () => { root.removeEventListener("input", onInput); root.removeEventListener("change", onInput); root.removeEventListener("click", onClick); };
  }, [actOnDailySpiritualLoop, bookReviewMomentActive, dailySpiritualLoop, router]);

  function undoNotice() {
    const removed = removedRef.current;
    if (!removed) return;
    removed.parent.insertBefore(removed.node, removed.next);
    removedRef.current = null;
    setNotice({ title: "Book item restored", detail: "The reversible session action was undone." });
  }

  return <><ApprovedBookView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} undoNotice={undoNotice} /></>;
}
