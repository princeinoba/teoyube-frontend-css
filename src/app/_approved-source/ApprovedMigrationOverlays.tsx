"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export type MigrationNotice = Readonly<{ title: string; detail: string; scripture?: string; undoLabel?: string }> | null;

export function ApprovedMigrationOverlays({
  notice,
  clearNotice,
  undoNotice
}: {
  notice: MigrationNotice;
  clearNotice(): void;
  undoNotice?(): void;
}) {
  const [railOpen, setRailOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(
    <div id="phase113Shell">
      <aside className={`phase113-insight-rail${railOpen ? "" : " collapsed"}`} id="phase113InsightRail" aria-label="Phase 11.3 insight rail">
        <button type="button" className="phase113-rail-toggle" id="phase113RailToggle" aria-label="Toggle insight rail" aria-expanded={railOpen ? "true" : "false"} onClick={() => setRailOpen((open) => !open)}>i</button>
        <div id="phase113InsightContent"><p className="eyebrow">Active Context</p><h2>TIDUILOVP</h2><p>Calling &amp; Purpose</p><p className="phase113-scripture">Ephesians 1:18</p><div className="phase113-rail-metrics"><span><strong>1</strong> Promises</span><span><strong>1</strong> Book</span><span><strong>3</strong> Testimony</span></div><ul><li>No external services</li><li>No analytics</li><li>No database persistence</li><li>No live AI</li><li>No automatic contact</li></ul></div>
      </aside>
      <section className={`phase113-save-drawer${notice ? " visible" : ""}`} id="phase113SaveDrawer" aria-live="polite" aria-label="Saved action status">
        {notice && <><strong>{notice.title}</strong><span>{notice.detail}</span>{notice.scripture && <small>{notice.scripture}</small>}<div className="phase114-save-actions">{notice.undoLabel && undoNotice && <button type="button" onClick={undoNotice}>{notice.undoLabel}</button>}<button type="button">View in Book</button><button type="button">Add Reflection</button><button type="button" onClick={clearNotice}>Close</button></div></>}
      </section>
      <aside className="phase117-offline-status" id="phase117OfflineStatus" aria-live="polite"><span className="phase117-offline-pill online">Local beta online</span><small>External services remain disabled; network is not used for AI, analytics, uploads, or persistence.</small></aside>
    </div>,
    document.body
  );
}
