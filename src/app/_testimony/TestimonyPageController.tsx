"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "../../features/journey/ui/DailySpiritualLoopProvider";
import {
  createTestimonyDraft,
  finalizeTestimony,
  rejectTestimony,
  restoreTestimony,
  type TestimonyRecord
} from "../../domain/testimony/testimony-record";
import type { TestimonyDisplayDto, TestimonyPageViewModel } from "../../features/testimony/application/testimony-page-service";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedTestimonyView } from "./ApprovedTestimonyView";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}

function lifecycleLabel(record: TestimonyRecord) {
  if (record.lifecycle === "published") return "Public";
  if (record.lifecycle === "private") return "Private";
  return "Draft";
}

function statusIcon(record: TestimonyRecord) {
  if (record.lifecycle === "private") return "lock";
  if (record.lifecycle === "published") return "public";
  return "draft";
}

function renderTestimony(dto: TestimonyDisplayDto) {
  const record = dto.record;
  return `<article class="testimony-entry testimony-media-card">
    <div class="testimony-thumb testimony-thumb-image"><img src="${escapeHtml(dto.image)}" alt="" loading="lazy"><span class="testimony-status-badge" data-status="${statusIcon(record)}">${lifecycleLabel(record)}</span></div>
    <div class="testimony-entry-body"><h4>${escapeHtml(record.title)}</h4><div class="testimony-entry-meta"><span><b>Category:</b> ${escapeHtml(record.category)}</span><time datetime="${escapeHtml(record.createdAt)}">${escapeHtml(dto.dateLabel)}</time><span>${escapeHtml(dto.updatedLabel)}</span></div><p>${escapeHtml(record.body)}</p><div class="scripture-strip">${record.scriptureReferences.map((reference) => `<span class="scripture-pill">${escapeHtml(reference)}</span>`).join("")}</div></div>
    <div class="testimony-entry-stats"><span data-metric="encouragements"><b>${dto.metrics.encouragements}</b><small>Encouragements</small></span><span data-metric="views"><b>${dto.metrics.views}</b><small>Views</small></span><span data-metric="shares"><b>${dto.metrics.shares}</b><small>Shares</small></span><button type="button" data-phase116b-action="testimony-status" data-phase116b-id="${escapeHtml(record.title)}" aria-label="Change local label for ${escapeHtml(record.title)}">Label</button><button type="button" data-phase116b-action="testimony-delete" data-phase116b-id="${escapeHtml(record.title)}" aria-label="Delete ${escapeHtml(record.title)}">Delete</button></div>
  </article>`;
}

export function TestimonyPageController({ initialViewModel }: { initialViewModel: TestimonyPageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const recordsRef = useRef(new Map(initialViewModel.testimonies.map((dto) => [dto.record.title, dto.record])));
  const lastCreatedTitleRef = useRef<string | null>(null);
  const removedRef = useRef<{ title: string; dto: TestimonyDisplayDto; node: HTMLElement; parent: HTMLElement; next: ChildNode | null } | null>(null);
  const [notice, setNotice] = useState<MigrationNotice>(null);
  const router = useRouter();
  const { state: dailySpiritualLoop, act: actOnDailySpiritualLoop } = useDailySpiritualLoop();
  const testimonyMomentActive = dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "testimony_candidate";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (testimonyMomentActive && dailySpiritualLoop) {
      const candidate = dailySpiritualLoop.artifacts.testimony_candidate.payload;
      const title = root.querySelector<HTMLInputElement>("#testimonyTitle");
      const body = root.querySelector<HTMLTextAreaElement>("#testimonyBody");
      const submit = root.querySelector<HTMLButtonElement>('#testimonyForm button[type="submit"]');
      if (title && !title.value) title.value = candidate.title;
      if (body && !body.value) body.value = candidate.bodySummary;
      submit?.setAttribute("data-daily-journey-action", "accept");
    }

    function applyFilter(label: string) {
      const wanted = label === "Drafts" ? "Draft" : label;
      root?.querySelectorAll<HTMLElement>("#testimonyList .testimony-entry").forEach((entry) => {
        const status = entry.querySelector(".testimony-status-badge")?.textContent?.trim() || "Draft";
        entry.hidden = wanted !== "All" && status !== wanted;
      });
    }

    function downloadSafeArchive() {
      const safe = [...recordsRef.current.values()].map((record) => ({
        id: record.id,
        title: record.title,
        category: record.category,
        status: lifecycleLabel(record),
        scriptureReferences: record.scriptureReferences,
        provenance: record.provenance.sourceLocation,
        userAuthored: true,
        divineActionAttribution: "user_authored_unverified"
      }));
      const url = URL.createObjectURL(new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "teoyube-testimony-safe-export.json";
      link.click();
      URL.revokeObjectURL(url);
      setNotice({ title: "Safe testimony export prepared", detail: "Raw testimony body text was excluded from the export." });
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement;
      if (form.id !== "testimonyForm") return;
      event.preventDefault();
      const title = root?.querySelector<HTMLInputElement>("#testimonyTitle")?.value.trim() || "User-recorded testimony draft";
      const category = root?.querySelector<HTMLSelectElement>("#testimonyCategory")?.value || "Faith";
      const body = root?.querySelector<HTMLTextAreaElement>("#testimonyBody")?.value.trim() || "User-recorded testimony draft. Teoyube does not certify fulfillment.";
      const record = createTestimonyDraft({ title, category, body, createdAt: new Date().toISOString() });
      const dto: TestimonyDisplayDto = Object.freeze({ record, image: "public/images/carousel/faith-in-action.png", dateLabel: "Draft saved just now", updatedLabel: "Updated just now", metrics: Object.freeze({ encouragements: 0, views: 0, shares: 0 }) });
      recordsRef.current.set(record.title, record);
      lastCreatedTitleRef.current = record.title;
      root?.querySelector("#testimonyList")?.insertAdjacentHTML("afterbegin", renderTestimony(dto));
      form.reset();
      setNotice({ title: "Testimony draft saved", detail: "User-authored, editable, session-only, and not added to the Book.", undoLabel: "Undo" });
      if (testimonyMomentActive) {
        actOnDailySpiritualLoop({ type: "accept", userInput: body });
        router.push("/book");
      }
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const tab = target.closest<HTMLButtonElement>(".testimony-tabs button");
      if (tab) {
        root?.querySelectorAll(".testimony-tabs button").forEach((button) => button.classList.toggle("active", button === tab));
        applyFilter(tab.textContent?.trim() || "All");
        return;
      }
      const action = target.closest<HTMLElement>("[data-phase116b-action], [data-phase117-action]");
      const actionId = action?.dataset.phase116bAction || action?.dataset.phase117Action;
      if (actionId === "download-json") { downloadSafeArchive(); return; }
      if (actionId === "testimony-status") {
        const title = action?.dataset.phase116bId || "";
        const current = recordsRef.current.get(title);
        if (!current) return;
        const next = current.lifecycle === "draft" || current.lifecycle === "candidate"
          ? finalizeTestimony(current, "private", { actor: "user", confirmed: true })
          : current.lifecycle === "private"
            ? finalizeTestimony(current, "published", { actor: "user", confirmed: true })
            : createTestimonyDraft({ title: current.title, category: current.category, body: current.body, scriptureReferences: current.scriptureReferences, createdAt: current.createdAt });
        recordsRef.current.set(title, next);
        const card = action?.closest<HTMLElement>(".testimony-entry");
        const badge = card?.querySelector<HTMLElement>(".testimony-status-badge");
        if (badge) { badge.textContent = lifecycleLabel(next); badge.dataset.status = statusIcon(next); }
        setNotice({ title: "Testimony label updated", detail: `${title}: ${lifecycleLabel(next)}. This was an explicit user action.` });
        return;
      }
      if (actionId === "testimony-delete") {
        const title = action?.dataset.phase116bId || "";
        const record = recordsRef.current.get(title);
        const node = action?.closest<HTMLElement>(".testimony-entry");
        if (!record || !node?.parentElement) return;
        const dto = initialViewModel.testimonies.find((item) => item.record.title === title) || Object.freeze({ record, image: "public/images/carousel/faith-in-action.png", dateLabel: "Draft saved just now", updatedLabel: "Updated just now", metrics: Object.freeze({ encouragements: 0, views: 0, shares: 0 }) });
        removedRef.current = { title, dto, node, parent: node.parentElement, next: node.nextSibling };
        recordsRef.current.set(title, rejectTestimony(record, { actor: "user", confirmed: true }));
        node.remove();
        setNotice({ title: "Testimony removed", detail: "The user-recorded session item can be restored.", undoLabel: "Undo" });
        return;
      }
      if (actionId === "open-data-controls") {
        setNotice({ title: "Testimony data controls", detail: "Session-only, no analytics, no public outreach, no durable write, and raw text is excluded from safe export." });
        return;
      }
      if (target.closest(".testimony-media-actions button, .testimony-list-tools button, .testimony-load-more, .testimony-rail button")) {
        setNotice({ title: target.getAttribute("aria-label") || target.textContent?.trim() || "Testimony action ready", detail: "This preview does not upload, publish, contact, analyze, or persist anything automatically." });
      }
    }

    root.addEventListener("submit", onSubmit);
    root.addEventListener("click", onClick);
    return () => { root.removeEventListener("submit", onSubmit); root.removeEventListener("click", onClick); };
  }, [actOnDailySpiritualLoop, dailySpiritualLoop, initialViewModel, router, testimonyMomentActive]);

  function undoNotice() {
    const removed = removedRef.current;
    if (!removed) {
      const createdTitle = lastCreatedTitleRef.current;
      const first = createdTitle ? [...(rootRef.current?.querySelectorAll<HTMLElement>("#testimonyList .testimony-entry") || [])].find((entry) => entry.querySelector("h4")?.textContent === createdTitle) : null;
      if (first) first.remove();
      if (createdTitle) recordsRef.current.delete(createdTitle);
      lastCreatedTitleRef.current = null;
      setNotice({ title: "Testimony draft removed", detail: "The reversible session action was undone." });
      return;
    }
    const rejected = recordsRef.current.get(removed.title);
    if (rejected) recordsRef.current.set(removed.title, restoreTestimony(rejected, { actor: "user", confirmed: true }));
    removed.parent.insertBefore(removed.node, removed.next);
    removedRef.current = null;
    setNotice({ title: "Testimony restored", detail: "The reversible session action was undone." });
  }

  return <><ApprovedTestimonyView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} undoNotice={undoNotice} /></>;
}
