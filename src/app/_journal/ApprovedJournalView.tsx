"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "../../features/journey/ui/DailySpiritualLoopProvider";
import { createJournalRecord, type JournalRecord } from "../../domain/journal/journal-record";
import type { JournalPageViewModel } from "../../features/journal/application/journal-page-service";

function Card({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return <article className="card">{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2 className="gold">{title}</h2>{children}</article>;
}

function JournalEntryForm({ initialEntries }: { initialEntries: readonly JournalRecord[] }) {
  const [entries, setEntries] = useState<readonly JournalRecord[]>(initialEntries);
  const [text, setText] = useState("");
  const router = useRouter();
  const { state: dailySpiritualLoop, act: actOnDailySpiritualLoop } = useDailySpiritualLoop();
  const reflectionMomentActive = dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "reflection";

  function handleSave() {
    const entry = createJournalRecord({ text, createdAt: new Date().toISOString() });
    setEntries((current) => [entry, ...current]);
    setText("");
    if (reflectionMomentActive) {
      actOnDailySpiritualLoop({ type: "accept", userInput: entry.summary });
      router.push("/testimony");
    }
  }

  return (
    <Card eyebrow="Session Journal" title="Add Reflection">
      <textarea aria-label="Journal reflection" placeholder="Write a short reflection for this session..." rows={5} value={text} onChange={(event) => setText(event.target.value)} />
      <p className="muted">Saved as an in-memory sanitized summary. No browser persistence is used.</p>
      <button className="button primary" type="button" data-daily-journey-action={reflectionMomentActive ? "accept" : undefined} onClick={handleSave}>Add Reflection</button>
      <div className="activity-list">
        {entries.length ? entries.map((entry) => <article className="mini-card" key={entry.id}><strong>{entry.createdAt.slice(0, 10)}</strong><p>{entry.summary}</p></article>) : <div className="notice"><strong>No reflections yet</strong><p>Write a reflection to add it to this local session.</p></div>}
      </div>
    </Card>
  );
}

export function ApprovedJournalView({ viewModel }: { viewModel: JournalPageViewModel }) {
  return (
    <main>
      <section className="page-title-row"><div><p className="eyebrow">Reflection</p><h1>Teoyube Journal</h1><p>Write session-only reflections, attach the current Scripture/word/promise manually, export a safe local bundle, and clear entries.</p></div></section>
      <JournalEntryForm initialEntries={viewModel.entries} />
      <Card eyebrow="Prompts" title="Reflection Prompts">{viewModel.prompts.map((prompt) => <p key={prompt}>{prompt}</p>)}</Card>
      <section className="grid two">
        <Card eyebrow="Guardrails" title={viewModel.guardrails.title}><ul className="check-list">{viewModel.guardrails.points.map((point) => <li key={point}>{point}</li>)}</ul></Card>
        <Card eyebrow="Limitations" title="Local Preview Boundaries"><ul className="check-list"><li>No live AI orchestration, analytics, accounts, payments, automatic contact, or database persistence is connected.</li><li>Personalization is session-only and explainable; raw private text is not exported or stored in browser persistence.</li><li>Calling and prayer language remains devotional, cautious, and Scripture-reviewable.</li></ul></Card>
      </section>
    </main>
  );
}
