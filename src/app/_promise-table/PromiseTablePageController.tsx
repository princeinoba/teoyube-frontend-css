"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "@/features/journey/ui/DailySpiritualLoopProvider";
import { PROMISE_STATUSES, type PromiseRecord, type PromiseStatus } from "@/domain/promises/promise-repository";
import type { PromiseTableViewModel } from "@/features/promises/contracts";
import { LocalPromiseRepository } from "@/features/promises/infrastructure/local-promise-repository";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedPromiseTableView } from "./ApprovedPromiseTableView";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}

function PromiseAddDialog({ open, close, add }: { open: boolean; close(): void; add(record: PromiseRecord): void }) {
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  if (!mounted || !open || typeof document === "undefined") return null;
  return createPortal(
    <dialog id="phase116b1PromiseDialog" className="phase116b1-dialog" aria-labelledby="phase116b1PromiseDialogTitle" open>
      <div className="phase113-command-header"><div><p className="eyebrow">Promise Table</p><h2 id="phase116b1PromiseDialogTitle">Add a Promise</h2></div><button type="button" className="phase113-icon-button" data-phase116b1-close="promise" aria-label="Close Add Promise dialog" onClick={close}>x</button></div>
      <p>Every manual promise requires a visible Scripture anchor. Testified is never selected automatically.</p>
      <form id="phase116b1PromiseAddForm" className="phase116b1-promise-form" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const title = String(data.get("title") || "").trim();
        const scripture = String(data.get("scripture") || "").trim();
        const status = String(data.get("status") || "Discovered") as PromiseStatus;
        if (!title || !scripture || !PROMISE_STATUSES.includes(status)) return;
        add({ id: `manual-${Date.now()}`, title, scriptureReference: scripture, promiseLevel: "C", explanation: "User-entered promise application retained with its visible Scripture reference.", status, source: { kind: "manual", label: "Manual", sourceId: "manual-entry", scriptureReferences: [scripture] }, notes: String(data.get("notes") || "").trim() });
      }}>
        <label>Promise title<input name="title" required minLength={3} maxLength={100} autoComplete="off" /></label>
        <label>Scripture reference<input name="scripture" required maxLength={60} autoComplete="off" placeholder="John 3:16" /></label>
        <label>Teoyube word<input name="word" maxLength={60} autoComplete="off" /></label>
        <label>Category<select name="category"><option>Calling &amp; Purpose</option><option>Faith &amp; Trust</option><option>Prayer &amp; Surrender</option><option>Wisdom &amp; Direction</option><option>Healing &amp; Restoration</option></select></label>
        <label>Initial status<select name="status">{PROMISE_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="phase116b1-full-field">Optional safe note<textarea name="notes" maxLength={500} placeholder="Session-only note. Ctrl or Command + Enter submits."></textarea></label>
        <label className="phase116b1-check"><input type="checkbox" name="saveToBook" /> Save a safe reference to Book</label>
        <div className="phase116b-action-row phase116b1-full-field"><button type="button" className="secondary" data-phase116b1-close="promise" onClick={close}>Cancel</button><button type="submit" className="primary">Add Promise</button></div>
      </form>
    </dialog>, document.body
  );
}

function rowHtml(record: PromiseRecord) {
  return `<tr data-promise-row="${escapeHtml(record.id)}"><td><strong>${escapeHtml(record.title)}</strong><small>Saved today</small></td><td><span class="scripture-pill">${escapeHtml(record.scriptureReference)}</span></td><td><select data-phase114-promise-status="${escapeHtml(record.id)}" aria-label="Update status for ${escapeHtml(record.title)}">${PROMISE_STATUSES.map((status) => `<option${status === record.status ? " selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select></td><td>${escapeHtml(record.source.label)}</td><td><div class="phase114-row-actions"><button class="secondary" type="button" data-phase116b-action="promise-detail" data-phase116b-id="${escapeHtml(record.id)}">Detail</button><button class="secondary" type="button" data-phase114-save-promise="${escapeHtml(record.id)}">Save to Book</button><button class="secondary" type="button" data-phase114-remove-promise="${escapeHtml(record.id)}">Remove</button></div></td></tr>`;
}

export function PromiseTablePageController({ initialViewModel }: { initialViewModel: PromiseTableViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const repositoryRef = useRef(new LocalPromiseRepository(initialViewModel.rows));
  const removedRef = useRef<PromiseRecord | null>(null);
  const [notice, setNotice] = useState<MigrationNotice>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const { state: dailySpiritualLoop, act: actOnDailySpiritualLoop } = useDailySpiritualLoop();
  const promiseMomentActive = dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "promise";

  function addRecord(record: PromiseRecord) {
    repositoryRef.current.save(record);
    rootRef.current?.querySelector("#savedPromiseTableRows")?.insertAdjacentHTML("afterbegin", rowHtml(record));
    setDialogOpen(false);
    setNotice({ title: "Promise row added", detail: `${record.title} · Level ${record.promiseLevel}`, scripture: record.scriptureReference });
  }

  function restoreRemoved() {
    const record = removedRef.current;
    if (!record) return;
    repositoryRef.current.restore(record);
    rootRef.current?.querySelector("#savedPromiseTableRows")?.insertAdjacentHTML("afterbegin", rowHtml(record));
    removedRef.current = null;
    setNotice({ title: "Promise row restored", detail: record.title, scripture: record.scriptureReference });
  }

  useEffect(() => {
    const currentRoot = rootRef.current;
    if (!currentRoot) return;
    const root: HTMLElement = currentRoot;
    if (promiseMomentActive) {
      root.querySelector<HTMLElement>('[data-phase116b-action="promise-prayer"]')?.setAttribute("data-daily-journey-action", "accept");
    }

    function setVideo(index: number) {
      const dots = [...root.querySelectorAll<HTMLButtonElement>("[data-promise-table-video-index]")];
      if (!dots.length) return;
      const next = ((index % dots.length) + dots.length) % dots.length;
      dots.forEach((dot) => dot.classList.toggle("active", Number(dot.dataset.promiseTableVideoIndex) === next));
      const title = dots[next]?.getAttribute("aria-label")?.replace(/^Show /, "") || "TeoyubeWorld Video Feed";
      const heading = root.querySelector("#promiseTableVideoPanel h3");
      if (heading) heading.textContent = title;
      root.querySelector("#promiseTableVideoPanel")?.setAttribute("data-active-video-index", String(next));
    }

    function filterRows(status: string) {
      root.querySelectorAll<HTMLElement>("[data-phase116b-promise-filter]").forEach((button) => button.classList.toggle("active", button.dataset.phase116bPromiseFilter === status));
      root.querySelectorAll<HTMLTableRowElement>("#savedPromiseTableRows tr").forEach((row) => {
        const select = row.querySelector<HTMLSelectElement>("[data-phase114-promise-status]");
        const id = row.dataset.phase114PromiseRow || row.dataset.promiseRow || select?.dataset.phase114PromiseStatus || "";
        const currentStatus = repositoryRef.current.findSavedById(id)?.status || select?.value;
        row.hidden = status !== "all" && currentStatus !== status;
      });
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const journeyPrayer = target.closest<HTMLElement>('[data-phase116b-action="promise-prayer"][data-daily-journey-action="accept"]');
      if (journeyPrayer) {
        const record = repositoryRef.current.findSavedById(journeyPrayer.dataset.phase116bId || "") || repositoryRef.current.listSaved()[0];
        actOnDailySpiritualLoop({ type: "accept", userInput: record ? `${record.title} · Level ${record.promiseLevel} · ${record.scriptureReference}` : "Promise reviewed with its Scripture source." });
        router.push("/prayer");
        return;
      }
      if (target.closest('[data-teoyube-action="promise.add.open"]')) { setDialogOpen(true); return; }
      const filter = target.closest<HTMLElement>("[data-phase116b-promise-filter]");
      if (filter) { filterRows(filter.dataset.phase116bPromiseFilter || "all"); return; }
      const suggestion = target.closest<HTMLElement>('[data-phase116-action="use-search-suggestion"]');
      if (suggestion) {
        const input = root.querySelector<HTMLInputElement>(`#${suggestion.dataset.phase116Input}`);
        if (input) { input.value = suggestion.dataset.phase116Query || ""; input.focus(); }
        return;
      }
      if (target.closest('[data-phase116-action="clear-search-suggestions"]')) {
        const input = root.querySelector<HTMLInputElement>("#promiseTableSearchInput");
        if (input) input.value = "";
        setNotice({ title: "Search suggestions cleared", detail: "Session-only safe searches cleared." });
        return;
      }
      const remove = target.closest<HTMLElement>("[data-phase114-remove-promise]");
      if (remove && !remove.hasAttribute("disabled")) {
        const id = remove.dataset.phase114RemovePromise || "";
        const record = repositoryRef.current.remove(id);
        if (record) {
          removedRef.current = record;
          remove.closest("tr")?.remove();
          setNotice({ title: "Promise row removed", detail: record.title, scripture: record.scriptureReference, undoLabel: "Undo" });
        }
        return;
      }
      const save = target.closest<HTMLElement>("[data-phase114-save-promise]");
      if (save) {
        const record = repositoryRef.current.findSavedById(save.dataset.phase114SavePromise || "");
        if (record) setNotice({ title: "Promise saved to Book", detail: `${record.title} · Level ${record.promiseLevel}`, scripture: record.scriptureReference });
        return;
      }
      const videoDot = target.closest<HTMLElement>("[data-promise-table-video-index]");
      if (videoDot) { setVideo(Number(videoDot.dataset.promiseTableVideoIndex)); return; }
      const videoNav = target.closest<HTMLElement>("[data-promise-table-video-nav]");
      if (videoNav) {
        const panel = root.querySelector("#promiseTableVideoPanel");
        const current = Number(panel?.getAttribute("data-active-video-index") || 0);
        setVideo(current + (videoNav.dataset.promiseTableVideoNav === "next" ? 1 : -1));
        return;
      }
      const watch = target.closest<HTMLElement>("[data-video-index]");
      if (watch) { setVideo(Number(watch.dataset.videoIndex)); root.querySelector("#promiseTableVideoPanel")?.scrollIntoView({ block: "nearest" }); return; }
      const action = target.closest<HTMLElement>("[data-phase116b-action]");
      if (action) setNotice({ title: action.textContent?.trim() || "Promise action ready", detail: "Calling & Purpose: TIDUILOVP", scripture: "Ephesians 1:18" });
    }

    function onChange(event: Event) {
      const select = (event.target as HTMLElement).closest<HTMLSelectElement>("[data-phase114-promise-status]");
      if (!select) return;
      const id = select.dataset.phase114PromiseStatus || "";
      const status = select.value as PromiseStatus;
      const transition = repositoryRef.current.updateStatus(id, status);
      if (!transition) return;
      const detail = root.querySelector(".phase116b-detail-drawer p");
      if (detail) detail.innerHTML = `<strong>Status:</strong> ${escapeHtml(status)}. <strong>Source:</strong> ${escapeHtml(repositoryRef.current.findSavedById(id)?.source.label || "Unknown")}`;
      setNotice({ title: "Promise status updated", detail: `${transition.previousStatus} → ${transition.nextStatus}`, scripture: repositoryRef.current.findSavedById(id)?.scriptureReference });
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement;
      if (form.id !== "promiseTableSearchForm") return;
      event.preventDefault();
      const query = root.querySelector<HTMLInputElement>("#promiseTableSearchInput")?.value.trim() || "";
      setNotice({ title: "Promise search complete", detail: query || "Local TeoyubeWorld promise feed", scripture: "Ephesians 1:18" });
    }

    root.addEventListener("click", onClick);
    root.addEventListener("change", onChange);
    root.addEventListener("submit", onSubmit);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("change", onChange);
      root.removeEventListener("submit", onSubmit);
    };
  }, [actOnDailySpiritualLoop, promiseMomentActive, router]);

  return <><ApprovedPromiseTableView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} undoNotice={restoreRemoved} /><PromiseAddDialog open={dialogOpen} close={() => setDialogOpen(false)} add={addRecord} /></>;
}
