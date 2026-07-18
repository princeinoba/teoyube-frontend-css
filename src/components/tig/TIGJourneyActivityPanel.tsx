"use client";

import { TeoyubeProductCard } from "@/components/productization/Phase11ProductPanels";
import { useBookOfTheSaint, useDailyJourney, usePromiseTable } from "@/components/productization/TeoyubeAppStateProvider";

export function TIGJourneyActivityPanel() {
  const { journey } = useDailyJourney();
  const { rows } = usePromiseTable();
  const { entries } = useBookOfTheSaint();

  return (
    <section className="grid three">
      <TeoyubeProductCard eyebrow="Today" title={journey?.dailyWord.word || "Daily word"}>
        <p>{journey?.scripture.reference || "Scripture anchor pending"}</p>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Promises" title={`${rows.length} Saved`}>
        <p>{rows[0]?.promise || "Add a promise row from local search."}</p>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Book" title={`${entries.length} Entries`}>
        <p>{entries[0]?.summary || "Session activity appears here."}</p>
      </TeoyubeProductCard>
    </section>
  );
}
