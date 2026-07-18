"use client";

import { TeoyubeProductCard } from "@/components/productization/Phase11ProductPanels";
import { useDailyJourney, usePromiseTable } from "@/components/productization/TeoyubeAppStateProvider";

export function TIGJourneyProgressPanel() {
  const { journey } = useDailyJourney();
  const { rows } = usePromiseTable();

  return (
    <section className="grid three">
      <TeoyubeProductCard eyebrow="Scripture" title={journey?.scripture.reference || "Anchor pending"}>
        <p>{journey?.promiseCluster.title || "Generate a journey to review the promise cluster."}</p>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Promise Table" title={`${rows.length} Rows`}>
        <p>Status remains user-driven. Testimony is never auto-certified.</p>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Action" title="Next Faithful Step">
        <p>{journey?.actionStep || "Pray, review Scripture, and take one faithful action."}</p>
      </TeoyubeProductCard>
    </section>
  );
}
