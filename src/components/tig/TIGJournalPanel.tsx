"use client";

import { JournalEntryForm, TeoyubeProductCard } from "@/components/productization/Phase11ProductPanels";
import { useJournal } from "@/components/productization/TeoyubeAppStateProvider";

export function TIGJournalPanel() {
  const { entries } = useJournal();
  return (
    <section className="grid two">
      <JournalEntryForm />
      <TeoyubeProductCard eyebrow="Session Reflections" title={`${entries.length} Entries`}>
        <p className="muted">Journal entries are sanitized summaries held in React state only.</p>
      </TeoyubeProductCard>
    </section>
  );
}
