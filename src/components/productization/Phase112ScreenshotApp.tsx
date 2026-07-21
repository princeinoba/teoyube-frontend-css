"use client";

import { useEffect, useState } from "react";
import {
  ExplanationPathPanel,
  FallbackNotice,
  KnownLimitationsNotice,
  PageHeader,
  SafetyNotice as ProductSafetyNotice,
  TIGGraphExplorer,
  TIGResponsePanel,
  TeoyubeProductCard
} from "./Phase11ProductPanels";
import {
  useBookOfTheSaint,
  useDailyJourney,
  usePersonalizationControls,
  usePromiseTable,
  useTeoyubeAppState,
  useTestimonies,
  useTeoGuide
} from "./TeoyubeAppStateProvider";
import { ConsentAwareMemoryControls } from "./ConsentAwareMemoryControls";

type AnyRecord = Record<string, any>;

const EMPTY_SEARCH_RESULT = Object.freeze({ rows: Object.freeze([]) });
const EMPTY_GUIDE_RESPONSE = Object.freeze({
  confidenceLabel: "Cautious local preview",
  promiseCluster: "Scripture-grounded guidance",
  response: "Review the relevant Scripture in context before choosing a faithful next step.",
  scriptureAnchor: "Ephesians 1:18",
  explanationPath: Object.freeze(["Local deterministic guidance is prepared on the server."])
});

export function SidebarNav() {
  const appRoutes = [
    ["/", "Today"],
    ["/roadmap", "Roadmap"],
    ["/promise-search", "TeoyubeSearch"],
    ["/canon", "Canon"],
    ["/promise-table", "Promise Table"],
    ["/calling-compass", "Calling Compass"],
    ["/book", "Book of the Saint"],
    ["/lexicon", "Lexicon"],
    ["/testimony", "Testimony"],
    ["/teo-guide", "Teo Guide"],
    ["/embedded-videos", "Embedded Videos"],
    ["/settings", "Settings"]
  ];

  return (
    <aside className="sidebar">
      <a className="brand" href="/">
        <span className="brand-mark">T</span>
        <span>
          <strong>TEOYUBE</strong>
          <small>Ephesians 1:18</small>
        </span>
      </a>
      <nav aria-label="Primary">
        {appRoutes.map(([href, label]) => (
          <a href={href} key={href}>
            {label}
          </a>
        ))}
      </nav>
      <div className="sidebar-card">
        <strong>{appRoutes.length} local routes</strong>
        <p>No analytics, accounts, payments, external AI, or database persistence.</p>
      </div>
    </aside>
  );
}

export function TopActionBar() {
  const { generateDailyJourney } = useDailyJourney();
  const [status, setStatus] = useState("Ready");

  function handleGenerate() {
    generateDailyJourney();
    setStatus("Generated session journey");
  }

  return (
    <header className="top-action-bar">
      <button className="button secondary" type="button" onClick={() => setStatus("Guardrails reviewed locally")}>
        Guardrails
      </button>
      <button className="button primary" type="button" onClick={handleGenerate}>
        Generate Today's Journey
      </button>
      <span className="status-pill">{status}</span>
    </header>
  );
}

export function SafetyNotice() {
  return <ProductSafetyNotice />;
}

export function ConsentControlsPanel() {
  const { consentState, setConsentState, resetPersonalization } = usePersonalizationControls();
  return (
    <>
      <TeoyubeProductCard eyebrow="Consent" title="Session Personalization">
        <p className="muted">
          Current mode: {consentState.personalization}. Raw private text storage, analytics, live AI, and automatic contact remain disabled.
        </p>
        <div className="button-row">
          <button className="button secondary" type="button" onClick={() => setConsentState("session_only")}>
            Session Only
          </button>
          <button className="button secondary" type="button" onClick={() => setConsentState("disabled")}>
            Disable
          </button>
          <button className="button secondary" type="button" onClick={resetPersonalization}>
            Clear Signals
          </button>
        </div>
      </TeoyubeProductCard>
      <ConsentAwareMemoryControls />
    </>
  );
}

export function FeedbackControlsPanel() {
  return (
    <TeoyubeProductCard eyebrow="Feedback" title="Manual Feedback Only">
      <p>
        Feedback is not sent, stored, or automatically collected. The local app can prepare a sanitized note for
        user-controlled review in a later approved workflow.
      </p>
      <FallbackNotice reason="Automatic feedback intake and user contact remain disabled." />
    </TeoyubeProductCard>
  );
}

function Hero({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="page-hero compact-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  );
}

export function TodayScreenshotPage() {
  const { state } = useTeoyubeAppState();
  const context = state.generatedDailyJourney || {};
  const tig = state.activeTigResponse;

  return (
    <main>
      <Hero
        eyebrow="God's promises meet your calling"
        title="Today's Promise Animation"
        body="A local daily word, Scripture anchor, promise cluster, prayer, and action path for this session."
      />
      <section className="grid two">
        <TeoyubeProductCard eyebrow="Word of the Day" title={context.dailyWord?.word || "Teoyube Word"}>
          <p>{context.dailyWord?.meaning}</p>
          <p className="muted">Scripture: {context.scripture?.reference}</p>
          <p>{context.prayer}</p>
        </TeoyubeProductCard>
        <TIGResponsePanel result={tig} />
      </section>
      <ExplanationPathPanel items={context.explanationPath} />
    </main>
  );
}

export function RoadmapScreenshotPage() {
  const routeCount = 12;
  return (
    <main>
      <PageHeader eyebrow="Implementation Roadmap" title="Phase 11 Runtime Consolidation">
        Static Node is the primary runtime; the App Router source is repaired as a migration layer.
      </PageHeader>
      <section className="grid three">
        <TeoyubeProductCard eyebrow="Primary Runtime" title="Static Node App">
          <p>Uses server.js, index.html, app.js, and styles.css.</p>
        </TeoyubeProductCard>
        <TeoyubeProductCard eyebrow="Migration Layer" title="Next Source Repaired">
          <p>Missing aliases, components, and local modules are restored for future Next migration.</p>
        </TeoyubeProductCard>
        <TeoyubeProductCard eyebrow="Routes" title={`${routeCount} Routes`}>
          <p>All route records point to local data and safe fallback behavior.</p>
        </TeoyubeProductCard>
      </section>
    </main>
  );
}

export function CanonScreenshotPage() {
  const canon = { words: [] as AnyRecord[] };
  return (
    <main>
      <Hero
        eyebrow="Teoyube Canon"
        title="Every Journey Reveals His Promise"
        body="Browse local words, promise clusters, Scripture canon entries, and journey seeds without service calls."
      />
      <section className="grid three">
        {canon.words.slice(0, 6).map((word) => (
          <TeoyubeProductCard eyebrow={word.category} title={word.word} key={word.id}>
            <p>{word.meaning}</p>
            <p className="muted">{word.scriptureReferences.join(", ") || "Scripture anchor review needed"}</p>
          </TeoyubeProductCard>
        ))}
      </section>
    </main>
  );
}

export function TeoyubeSearchScreenshotPage() {
  const [query, setQuery] = useState("I feel confused about my purpose");
  const { initialSearchResult } = useTeoyubeAppState();
  const [result, setResult] = useState<AnyRecord>(initialSearchResult);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/teoyube/search-rows", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: query }),
      signal: controller.signal
    }).then((response) => response.ok ? response.json() : EMPTY_SEARCH_RESULT).then(setResult).catch(() => undefined);
    return () => controller.abort();
  }, [query]);

  return (
    <main>
      <Hero
        eyebrow="TeoyubeSearch"
        title="Search with Purpose. Walk in His Promises."
        body="Search local Teoyube words, Scripture anchors, promise clusters, and cautious next steps."
      />
      <section className="card">
        <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search Teoyube" />
      </section>
      <section className="grid three">
        {result.rows.slice(0, 6).map((row) => (
          <TeoyubeProductCard eyebrow={row.promiseCategory} title={row.teoyubeWord} key={row.id}>
            <p>{row.meaning}</p>
            <p className="muted">{row.scriptureAnchors.join(", ")}</p>
            <p>{row.confidenceLabel}</p>
          </TeoyubeProductCard>
        ))}
      </section>
    </main>
  );
}

export function PromiseTableScreenshotPage() {
  const { rows, addPromiseTableItem } = usePromiseTable();
  const visibleRows = rows;

  return (
    <main>
      <Hero
        eyebrow="Promise Scrolls"
        title="Calling and Purpose"
        body="Promise rows come from local promise clusters and keep Scripture anchors visible."
      />
      <button className="button primary" type="button" onClick={() => addPromiseTableItem("purpose")}>
        Add Purpose Promise
      </button>
      <section className="grid three">
        {visibleRows.slice(0, 6).map((row) => (
          <TeoyubeProductCard eyebrow={row.status} title={row.category} key={row.id}>
            <p>{row.promise}</p>
            <p className="muted">{row.scripture}</p>
            <p>{row.action}</p>
          </TeoyubeProductCard>
        ))}
      </section>
    </main>
  );
}

export function CallingCompassScreenshotPage() {
  const [query, setQuery] = useState("calling purpose");
  const [preview, setPreview] = useState<AnyRecord>({ suggestedCallingPattern: "A calling pattern may be emerging.", relatedPromiseCluster: "Calling & Purpose", scriptureAnchor: "Romans 8:28", relatedWord: "TEOYUBE", actionStep: "Take one faithful next step.", explanationPath: [] });
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/teoyube/calling-context", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query }), signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((context) => context && setPreview({
        suggestedCallingPattern: context.callingPath.archetype.name,
        relatedPromiseCluster: context.callingPath.promises[0]?.title || "Calling & Purpose",
        scriptureAnchor: context.callingPath.scriptureAnchors[0] || "Romans 8:28",
        relatedWord: context.callingPath.archetype.name,
        actionStep: context.callingPath.actionSteps[0] || "Take one faithful next step.",
        explanationPath: context.explanationPath
      })).catch(() => undefined);
    return () => controller.abort();
  }, [query]);

  return (
    <main>
      <Hero
        eyebrow="Calling Compass"
        title="Discover God's Voice Through Scripture, Prayer and Calling"
        body="Calling language remains cautious and is tested through Scripture, prayer, counsel, fruit, and time."
      />
      <section className="grid two">
        <TeoyubeProductCard eyebrow="Compass Input" title="Ask Locally">
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Compass query" />
          <p>{preview.suggestedCallingPattern}</p>
        </TeoyubeProductCard>
        <TeoyubeProductCard eyebrow="Anchor" title={preview.relatedPromiseCluster}>
          <p>Scripture: {preview.scriptureAnchor}</p>
          <p>Related word: {preview.relatedWord}</p>
          <p>{preview.actionStep}</p>
        </TeoyubeProductCard>
      </section>
      <ExplanationPathPanel items={preview.explanationPath} />
    </main>
  );
}

export function BookOfTheSaintScreenshotPage() {
  const { entries } = useBookOfTheSaint();
  return (
    <main>
      <Hero
        eyebrow="Living Spiritual Record"
        title="Book of the Saint"
        body="Session-only reflections, assignments, promise discoveries, and user-recorded testimony."
      />
      <section className="activity-list">
        {entries.map((entry) => (
          <article className="card" key={entry.id}>
            <p className="eyebrow">{entry.type}</p>
            <h2>{entry.title}</h2>
            <p>{entry.summary}</p>
            <p className="muted">{entry.scriptureReferences.join(", ")}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export function LexiconScreenshotPage() {
  const words: AnyRecord[] = [];
  return (
    <main>
      <Hero
        eyebrow="God's language, eternal truth"
        title="Lexicon"
        body="Explore Teoyube words from the local vocabulary with Scripture anchors and prayer use."
      />
      <section className="grid four">
        {words.map((word) => (
          <TeoyubeProductCard eyebrow={word.category} title={word.word} key={word.id}>
            <p>{word.meaning}</p>
            <p className="muted">{word.scriptureReferences[0] || "Scripture review needed"}</p>
          </TeoyubeProductCard>
        ))}
      </section>
    </main>
  );
}

export function TestimonyArchiveScreenshotPage() {
  const { entries: testimonies } = useTestimonies();
  return (
    <main>
      <Hero
        eyebrow="Testimony Archive"
        title="Your Story. God's Glory."
        body="Testimony is user-recorded only and is never automatically certified as promise fulfillment."
      />
      <section className="grid two">
        {testimonies.map((testimony) => (
          <TeoyubeProductCard eyebrow={testimony.status} title={testimony.title} key={testimony.id}>
            <p>{testimony.body}</p>
            <p className="muted">{testimony.scriptureReferences.join(", ")}</p>
          </TeoyubeProductCard>
        ))}
      </section>
    </main>
  );
}

export function TeoGuideScreenshotPage() {
  const { turns, createTeoGuideTurn } = useTeoGuide();
  const [prompt, setPrompt] = useState("Help me overcome confusion with Scripture.");
  const [serverPreview, setServerPreview] = useState<AnyRecord>(EMPTY_GUIDE_RESPONSE);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/teoyube/teo-guide", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt }), signal: controller.signal })
      .then((response) => response.ok ? response.json() : EMPTY_GUIDE_RESPONSE).then(setServerPreview).catch(() => undefined);
    return () => controller.abort();
  }, [prompt]);
  const preview = turns[0] || serverPreview;

  return (
    <main>
      <Hero
        eyebrow="Teo Guide"
        title="Scripture-Grounded Guidance"
        body="A local response panel for Bible-rooted next steps without live AI or hidden personalization."
      />
      <section className="grid two">
        <TeoyubeProductCard eyebrow="Ask" title="Local Teo Guide">
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} />
          <button className="button primary" type="button" onClick={() => createTeoGuideTurn(prompt)}>
            Ask
          </button>
        </TeoyubeProductCard>
        <TeoyubeProductCard eyebrow={preview.confidenceLabel} title={preview.promiseCluster}>
          <p>{preview.response}</p>
          <p className="muted">{preview.scriptureAnchor}</p>
        </TeoyubeProductCard>
      </section>
      <ExplanationPathPanel items={preview.explanationPath} />
    </main>
  );
}

export function EmbeddedVideosScreenshotPage() {
  const media = { items: [] as AnyRecord[] };
  return (
    <main>
      <Hero
        eyebrow="Embedded Videos"
        title="TeoyubeWorld Local Media Preview"
        body="Reviewed external video sources are not connected; local media records are shown with source-disabled status."
      />
      <section className="grid three">
        {media.items.map((item) => (
          <TeoyubeProductCard eyebrow={item.sourceStatus} title={item.title} key={item.id}>
            <p>{item.description}</p>
            <p className="muted">{item.scriptureReferences.join(", ")} - {item.duration}</p>
          </TeoyubeProductCard>
        ))}
      </section>
    </main>
  );
}

export function PersonalizationScreenshotPage() {
  const { signals, addPersonalizationSignal, resetPersonalization } = usePersonalizationControls();
  const preview = { scriptureAnchorPreserved: true };

  return (
    <main>
      <PageHeader eyebrow="Personalization" title="Explainable Session Personalization">
        Personalization signals are session-only, sanitized, and user-controllable.
      </PageHeader>
      <section className="grid two">
        <ConsentControlsPanel />
        <TeoyubeProductCard eyebrow="Preview" title="Scripture Anchor Preserved">
          <p>{String(preview.scriptureAnchorPreserved)}</p>
          <p className="muted">Signal count: {signals.length}</p>
          <div className="button-row">
            <button className="button secondary" type="button" onClick={() => addPersonalizationSignal("wisdom", "button")}>
              Add Wisdom Signal
            </button>
            <button className="button secondary" type="button" onClick={resetPersonalization}>
              Reset
            </button>
          </div>
        </TeoyubeProductCard>
      </section>
    </main>
  );
}
