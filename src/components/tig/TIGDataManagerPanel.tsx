"use client";

import { useMemo } from "react";
import { TeoyubeProductCard } from "@/components/productization/Phase11ProductPanels";
import { useBookOfTheSaint, useJournal, usePromiseTable, useTestimonies } from "@/components/productization/TeoyubeAppStateProvider";

export function TIGDataManagerPanel() {
  const book = useBookOfTheSaint();
  const journal = useJournal();
  const promises = usePromiseTable();
  const testimonies = useTestimonies();
  const exportBundle = useMemo(() => book.createSafeExportBundle(), [book]);

  return (
    <section className="grid two">
      <TeoyubeProductCard eyebrow="Export" title="Safe Session Bundle">
        <p className="muted">Raw private text included: {String(exportBundle.appState.rawPrivateTextIncluded)}</p>
        <pre className="export-box">{JSON.stringify(exportBundle.appState, null, 2)}</pre>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Session Counts" title="Local Data Only">
        <ul className="check-list">
          <li>Promise rows: {promises.rows.length}</li>
          <li>Book entries: {book.entries.length}</li>
          <li>Journal entries: {journal.entries.length}</li>
          <li>Testimony entries: {testimonies.entries.length}</li>
          <li>No database, browser persistence, analytics, or external service sync.</li>
        </ul>
      </TeoyubeProductCard>
    </section>
  );
}
