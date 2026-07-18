"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  createPhase11DailyWordContext,
  runPhase11TigSurface,
  type Phase11ProductSurface
} from "@/lib/phase11Productization";
import {
  createPromiseTableRows,
  getGuardrailsContent,
  type Phase112TodayJourney
} from "@/lib/phase112Productization";
import { useJournal, useTeoyubeAppState } from "./TeoyubeAppStateProvider";

type AnyRecord = Record<string, any>;

export function PageHeader({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-title-row">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {children ? <p>{children}</p> : null}
      </div>
    </section>
  );
}

export function TeoyubeProductCard({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <article className="card">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="gold">{title}</h2>
      {children}
    </article>
  );
}

export function ConfidenceBadge({ label, score }: { label?: string; score?: number }) {
  const safeLabel = label || "Cautious preview";
  return (
    <span className="status-pill">
      {safeLabel}
      {typeof score === "number" ? ` - ${Math.round(score * 100)}%` : ""}
    </span>
  );
}

export function FallbackNotice({ used, reason }: { used?: boolean; reason?: string }) {
  return (
    <div className="notice">
      <strong>{used ? "Fallback visible" : "Fallback ready"}</strong>
      <p>{reason || "If local data is incomplete, Teoyube shows the reason and keeps Scripture review visible."}</p>
    </div>
  );
}

export function ExplanationPathPanel({ items = [] }: { items?: string[] }) {
  return (
    <TeoyubeProductCard eyebrow="Explanation" title="Why This Was Suggested">
      <ol className="check-list">
        {(items.length ? items : ["Local data selected.", "Scripture anchor reviewed.", "Cautious next step prepared."]).map(
          (item) => (
            <li key={item}>{item}</li>
          )
        )}
      </ol>
    </TeoyubeProductCard>
  );
}

export function TIGResponsePanel({ result }: { result?: AnyRecord }) {
  const response = result || runPhase11TigSurface("promise_search", "I need direction.");
  const rows = response.responsePanel?.selectionRows || [];

  return (
    <TeoyubeProductCard eyebrow="TIG Response" title={response.responsePanel?.title || "Local response"}>
      <p className="muted">{response.responsePanel?.subtitle}</p>
      <ConfidenceBadge
        label={response.responsePanel?.confidence?.label}
        score={response.responsePanel?.confidence?.score}
      />
      <div className="activity-list">
        {rows.map((row: AnyRecord) => (
          <article className="mini-card" key={row.label}>
            <strong>{row.label}</strong>
            <p>{row.value}</p>
          </article>
        ))}
      </div>
      <FallbackNotice
        used={response.responsePanel?.fallback?.used}
        reason={response.responsePanel?.fallback?.reason}
      />
    </TeoyubeProductCard>
  );
}

export function TIGGraphExplorer({ result }: { result?: AnyRecord }) {
  const response = result || runPhase11TigSurface("tig_graph", "Show purpose, promise, and Scripture.");
  const nodes = response.graphPanel?.nodes || [];
  const edges = response.graphPanel?.edges || [];

  return (
    <TeoyubeProductCard eyebrow="Graph" title="Readable Local Graph">
      <p className="muted">
        Nodes: {response.graphPanel?.statistics?.totalNodes || nodes.length}. List fallback:{" "}
        {response.graphPanel?.listFallbackAvailable ? "available" : "review needed"}.
      </p>
      <div className="activity-list">
        {nodes.map((node: AnyRecord) => (
          <article className="mini-card" key={node.id}>
            <strong>{node.label}</strong>
            <p>{node.type}</p>
          </article>
        ))}
      </div>
      <ul className="check-list">
        {edges.map((edge: AnyRecord) => (
          <li key={`${edge.source}-${edge.target}`}>
            {edge.source} to {edge.target}: {edge.label}
          </li>
        ))}
      </ul>
    </TeoyubeProductCard>
  );
}

export function SafetyNotice() {
  const guardrails = getGuardrailsContent();
  return (
    <TeoyubeProductCard eyebrow="Guardrails" title={guardrails.title}>
      <ul className="check-list">
        {guardrails.points.slice(0, 5).map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </TeoyubeProductCard>
  );
}

export function KnownLimitationsNotice() {
  return (
    <TeoyubeProductCard eyebrow="Limitations" title="Local Preview Boundaries">
      <ul className="check-list">
        <li>No live AI orchestration, analytics, accounts, payments, automatic contact, or database persistence is connected.</li>
        <li>Personalization is session-only and explainable; raw private text is not exported or stored in browser persistence.</li>
        <li>Calling and prayer language remains devotional, cautious, and Scripture-reviewable.</li>
      </ul>
    </TeoyubeProductCard>
  );
}

export function ActionStatus({ label, status }: { label: string; status?: string }) {
  return (
    <div className="mini-card">
      <strong>{label}</strong>
      <p>{status || "Ready in local session."}</p>
    </div>
  );
}

export function EmptyState({ title = "Nothing selected", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="notice">
      <strong>{title}</strong>
      <p>{children || "Choose a local item to populate this surface."}</p>
    </div>
  );
}

export function ErrorState({ message = "This local surface could not be prepared." }: { message?: string }) {
  return (
    <div className="notice">
      <strong>Review needed</strong>
      <p>{message}</p>
    </div>
  );
}

export function LoadingState({ message = "Preparing local preview..." }: { message?: string }) {
  return (
    <div className="notice">
      <strong>Loading</strong>
      <p>{message}</p>
    </div>
  );
}

export function DailyWordPanel({ initialContext }: { initialContext?: Phase112TodayJourney | AnyRecord }) {
  const [context, setContext] = useState<AnyRecord>(() => initialContext || createPhase11DailyWordContext());
  const { generateDailyJourney: generateSessionJourney } = useTeoyubeAppState();

  function handleGenerate() {
    const next = createPhase11DailyWordContext();
    setContext(next);
    generateSessionJourney();
  }

  return (
    <TeoyubeProductCard eyebrow="Daily Word" title={context.dailyWord?.word || "Teoyube Word"}>
      <p>{context.dailyWord?.meaning || "A local Scripture-rooted word is ready for review."}</p>
      <div className="activity-list">
        <ActionStatus label="Scripture" status={context.scripture?.reference} />
        <ActionStatus label="Promise Cluster" status={context.promiseCluster?.title} />
        <ActionStatus label="Action" status={context.actionStep} />
      </div>
      <p className="muted">{context.prayer}</p>
      <ConfidenceBadge label={context.confidenceLabel} />
      <ExplanationPathPanel items={context.explanationPath} />
      <button className="button primary" type="button" onClick={handleGenerate}>
        Generate Today's Journey
      </button>
    </TeoyubeProductCard>
  );
}

export function Phase11TigFlowPanel({
  surface,
  title = "Local TIG Flow",
  initialInput = "I need direction.",
  primaryActionLabel = "Generate"
}: {
  surface: Phase11ProductSurface;
  title?: string;
  initialInput?: string;
  primaryActionLabel?: string;
}) {
  const [input, setInput] = useState(initialInput);
  const [result, setResult] = useState(() => runPhase11TigSurface(surface, initialInput));
  const { setActiveTigSurface } = useTeoyubeAppState();

  function handleGenerate() {
    const next = runPhase11TigSurface(surface, input);
    setResult(next);
    setActiveTigSurface(surface, input);
  }

  return (
    <section className="grid two">
      <TeoyubeProductCard eyebrow="Local Flow" title={title}>
        <label className="field-label" htmlFor={`phase11-${surface}`}>
          Search, prayer, calling, or Scripture need
        </label>
        <textarea
          id={`phase11-${surface}`}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={4}
        />
        <button className="button primary" type="button" onClick={handleGenerate}>
          {primaryActionLabel}
        </button>
        <FallbackNotice
          used={result.responsePanel.fallback.used}
          reason={result.responsePanel.fallback.reason}
        />
      </TeoyubeProductCard>
      <TIGResponsePanel result={result} />
      <TIGGraphExplorer result={result} />
      <ExplanationPathPanel items={result.explanationPanel.items} />
    </section>
  );
}

export function JournalEntryForm() {
  const { entries, saveJournalEntry } = useJournal();
  const [text, setText] = useState("");

  function handleSave() {
    saveJournalEntry(text);
    setText("");
  }

  return (
    <TeoyubeProductCard eyebrow="Session Journal" title="Add Reflection">
      <textarea
        aria-label="Journal reflection"
        placeholder="Write a short reflection for this session..."
        rows={5}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <p className="muted">Saved as an in-memory sanitized summary. No browser persistence is used.</p>
      <button className="button primary" type="button" onClick={handleSave}>
        Add Reflection
      </button>
      <div className="activity-list">
        {entries.length ? (
          entries.map((entry) => (
            <article className="mini-card" key={entry.id}>
              <strong>{entry.createdAt.slice(0, 10)}</strong>
              <p>{entry.summary}</p>
            </article>
          ))
        ) : (
          <EmptyState title="No reflections yet">Write a reflection to add it to this local session.</EmptyState>
        )}
      </div>
    </TeoyubeProductCard>
  );
}

export function GrowthJourneyPanel({ journeys = [], levels = [] }: { journeys?: AnyRecord[]; levels?: AnyRecord[] }) {
  const journeyList = Array.isArray(journeys) ? journeys.slice(0, 4) : [];
  const levelList = Array.isArray(levels) ? levels.slice(0, 4) : [];

  return (
    <section className="grid two">
      <TeoyubeProductCard eyebrow="Journeys" title={`${journeyList.length} Local Journey Seeds`}>
        <div className="activity-list">
          {journeyList.map((journey, index) => (
            <article className="mini-card" key={journey.id || journey.title || index}>
              <strong>{journey.title || journey.name || `Journey ${index + 1}`}</strong>
              <p>{journey.summary || journey.description || "Local journey seed ready for review."}</p>
            </article>
          ))}
        </div>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Levels" title={`${levelList.length} Growth Levels`}>
        <div className="activity-list">
          {levelList.map((level, index) => (
            <article className="mini-card" key={level.id || level.name || index}>
              <strong>{level.name || level.title || `Level ${index + 1}`}</strong>
              <p>{level.description || level.summary || "Growth step prepared locally."}</p>
            </article>
          ))}
        </div>
      </TeoyubeProductCard>
    </section>
  );
}

export function PrayerCompanionProductPanel() {
  const result = useMemo(
    () => runPhase11TigSurface("prayer", "I need prayer for wisdom and surrender."),
    []
  );
  const rows = createPromiseTableRows(2);

  return (
    <section className="grid two">
      <TIGResponsePanel result={result} />
      <TeoyubeProductCard eyebrow="Prayer Safety" title="Devotional Boundary">
        <p>
          Prayer copy is generated from local promise and Scripture context. It does not claim divine certainty,
          does not persist user prayer text, and keeps explanation visible.
        </p>
        <ul className="check-list">
          {rows.map((row) => (
            <li key={row.id}>
              {row.scripture}: {row.prayer}
            </li>
          ))}
        </ul>
      </TeoyubeProductCard>
    </section>
  );
}
