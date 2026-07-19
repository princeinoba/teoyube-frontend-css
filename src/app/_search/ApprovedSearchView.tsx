"use client";

/* eslint-disable react/no-unescaped-entities */
import type { CSSProperties, FormEvent } from "react";
import { SEARCH_CATEGORIES, type SearchFeedback, type SearchResultDto, type SearchViewActions, type SearchViewModel } from "@/features/search/contracts";
import { toLegacySearchResult } from "@/features/search/application/search-service";

type CustomProperties = CSSProperties & Record<`--${string}`, string | number>;

const FEEDBACK_ACTIONS: ReadonlyArray<Readonly<{ kind: SearchFeedback; label: string }>> = [
  { kind: "more_like_this", label: "More like this" },
  { kind: "less_like_this", label: "Less like this" },
  { kind: "not_relevant", label: "Not relevant" },
  { kind: "save_scripture", label: "Save Scripture" },
  { kind: "save_word", label: "Save Word" },
  { kind: "save_prayer", label: "Save Prayer" },
  { kind: "complete_action", label: "Complete Action" },
  { kind: "reset_preference", label: "Reset this preference" }
];

function FeedbackControls({ result, actions }: { result: SearchResultDto; actions: SearchViewActions }) {
  return (
    <div className="phase115-feedback-controls" aria-label="Personalization feedback controls">
      {FEEDBACK_ACTIONS.map(({ kind, label }) => (
        <button
          type="button"
          className="secondary"
          data-phase115-feedback={kind}
          data-phase115-label={result.title}
          data-phase115-scripture={result.scripture_references[0]}
          data-phase115-word={result.teoyube_word}
          data-phase115-promise={result.promise_category}
          data-phase115-source="teoyube-search"
          data-phase115-prayer={result.prayer}
          data-phase115-action-step={result.assignment}
          onClick={() => actions.recordFeedback(kind, result)}
          key={kind}
        >{label}</button>
      ))}
    </div>
  );
}

function WhyThisPanel({ query, result, actions }: { query: string; result: SearchResultDto; actions: SearchViewActions }) {
  const need = result.explanation_path[2] || "general guidance";
  const path = ["Sanitized local context", result.search_intent, need, result.teoyube_word, result.promise_category, result.scripture_references[0], result.assignment];
  return (
    <details className="phase116-why-this-panel">
      <summary><span>Why this?</span>{" "}<strong>Excellent</strong></summary>
      <div className="phase116-why-grid">
        <article><span>Context</span><strong>{query}</strong></article>
        <article><span>Intent</span><strong>{result.search_intent}</strong></article>
        <article><span>Need</span><strong>{need}</strong></article>
        <article><span>Word</span><strong>{result.teoyube_word}</strong></article>
        <article><span>Promise</span><strong>{result.promise_category}</strong></article>
        <article><span>Scripture</span><strong>{result.scripture_references[0]}</strong></article>
        <article><span>Prayer</span><strong>{result.prayer}</strong></article>
        <article><span>Action</span><strong>{result.assignment}</strong></article>
      </div>
      <div className="phase116-path-row">{path.map((step, index) => <span key={`${index}-${step}`}>{step}</span>)}</div>
      <p>Scripture anchors stay visible and remain the authority; Teoyube words, prayers, and actions are devotional aids only.</p>
      <p><strong>Confidence:</strong> Level {result.promise_level} (82%). <strong>Fallback:</strong> Scripture anchors available.</p>
      <p><strong>Personalization:</strong> Off. Standard Scripture Path is active. No personalization change. Standard Scripture Path is active.</p>
      <aside className="phase116-quality-score" aria-label="Recommendation Quality Score">
        <div className="phase116-score-ring" style={{ "--phase116-score": "100%" } as CustomProperties}><strong>100</strong><span>Excellent</span></div>
        <div><p className="eyebrow">Recommendation Quality</p><p>Strong Scripture, promise, word, prayer, and action alignment.</p><small>You can continue with prayer, counsel, and one faithful action.</small></div>
      </aside>
      <div className="phase116-panel-actions">
        <button type="button" className="secondary" data-phase116-action="open-graph" onClick={() => actions.openGraph(result)}>View Graph</button>
        <button type="button" className="secondary" data-phase115-action="compare-recommendation" onClick={() => actions.compareRecommendation(result)}>Compare Preview</button>
      </div>
    </details>
  );
}

function SearchResultCard({ index, query, result, actions }: { index: number; query: string; result: SearchResultDto; actions: SearchViewActions }) {
  const artwork = `public/images/search/suggested-journey-0${(index % 3) + 1}.png`;
  return (
    <article className="search-result-card">
      <div className="thumbnail" aria-label="Promise animation preview" style={{ backgroundImage: `linear-gradient(180deg, rgba(0, 39, 31, 0.08), rgba(0, 39, 31, 0.38)), url('${artwork}')` }}>
        <button className="search-bookmark" type="button" aria-label={`Bookmark ${result.title}`}>▱</button>
      </div>
      <p className="eyebrow">{result.search_intent} + Calling + Level {result.promise_level}</p>
      <h3>{result.title}</h3>
      <p><b>Promise category:</b> {result.promise_category}</p>
      <div className="scripture-strip">{result.scripture_references.map((reference) => <span className="scripture-pill" key={reference}>{reference}</span>)}</div>
      <p>{result.short_explanation}</p>
      <div className="phase116b-result-metrics"><span>Relevance {result.relevance_score}</span><span>Quality {result.quality_score}</span><span>{result.confidence_label}</span></div>
      <details className="phase114-explanation-path">
        <summary>Why this?</summary>
        <p>{result.calling_connection}</p>
        <p>{result.explanation_path.join(" -> ")}</p>
        <p>Confidence label: {result.confidence_label}. Fallback reason: {result.fallback_reason}</p>
      </details>
      <WhyThisPanel query={query} result={result} actions={actions} />
      <div className="search-progress"><span style={{ width: `${Math.min(96, 42 + index * 14)}%` }}></span></div>
      <div className="result-actions">
        <button className="secondary search-save-book icon-only" data-result-index={index} aria-label="Save to Book" onClick={() => actions.saveToBook(result)}>▱</button>
        <button className="secondary search-add-table" data-result-index={index} onClick={() => actions.addToPromiseTable(result)}>Add to Promise Table</button>
        <button className="secondary search-generate-prayer" data-result-index={index} onClick={() => actions.exploreJourney(result)}>Explore Journey</button>
        <button className="secondary search-open-graph" type="button" data-result-index={index} onClick={() => actions.openGraph(result)}>View Graph</button>
        <button className="secondary" type="button" data-phase115-action="compare-recommendation" onClick={() => actions.compareRecommendation(result)}>Compare Preview</button>
      </div>
      <FeedbackControls result={result} actions={actions} />
    </article>
  );
}

function EmptySearchState({ suggestions, actions }: { suggestions: readonly string[]; actions: SearchViewActions }) {
  return (
    <article className="search-result-card phase114-empty-state">
      <p className="eyebrow">Local fallback</p><h3>No strong match yet</h3>
      <p>Try a simpler prompt such as wisdom, direction, prayer, calling, identity, or healing. Scripture remains visible while the local engine searches for a stronger connection.</p>
      <div className="scripture-strip"><span className="scripture-pill">Ephesians 1:18</span></div>
      <div className="result-actions"><button className="secondary" type="button" data-phase114-action="focus-search" onClick={() => document.querySelector<HTMLInputElement>("#teoyubeSearchInput")?.focus()}>Refine Search</button><button className="primary" type="button" data-phase114-action="generate-journey">Generate Journey</button></div>
      <div className="phase116-search-suggestions" data-phase116-search-surface="search">
        <div><span className="eyebrow">Smart Search Suggestions</span><small>Session-only, sanitized, local suggestions.</small></div>
        <div className="phase116-chip-row">{suggestions.map((suggestion) => <button type="button" className="phase116-chip" data-phase116-action="use-search-suggestion" data-phase116-query={suggestion} data-phase116-input="teoyubeSearchInput" onClick={() => actions.loadSuggestion(suggestion)} key={suggestion}>{suggestion}</button>)}<button type="button" className="phase116-chip subtle" data-phase116-action="clear-search-suggestions" onClick={actions.clearSuggestions}>Clear</button></div>
      </div>
    </article>
  );
}

export function ApprovedSearchView({ model, actions }: { model: SearchViewModel; actions: SearchViewActions }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); actions.submitSearch(model.query); };
  const legacyResults = JSON.stringify(model.results.map(toLegacySearchResult));
  return (
    <section className="view page-container active" id="search">
      <article className="search-jumbotron">
        <p className="eyebrow">TeoyubeSearch</p>
        <h3>Search with <span>Purpose.</span> Walk in His <span>Promises.</span></h3>
        <p className="search-hero-copy">Search your situation, promise, Scripture, prayer, calling, Teoyube word, journey, assignment, canon, or Kingdom principle.</p>
        <form className="search-form" id="teoyubeSearchForm" onSubmit={submit}>
          <input id="teoyubeSearchInput" placeholder="I feel confused about my purpose" value={model.query} onChange={(event) => actions.changeQuery(event.target.value)} />
          <select id="teoyubeSearchCategory" aria-label="Search category" onChange={(event) => actions.changeCategory(event.target.value as SearchViewModel["category"])}>
            {SEARCH_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
          <button className="primary" type="submit">Search Promise</button>
        </form>
        <div data-phase116-mounted="teoyubeSearchForm">
          <div className="phase116-search-suggestions" data-phase116-search-surface="search">
            <div><span className="eyebrow">Smart Search Suggestions</span><small>Session-only, sanitized, local suggestions.</small></div>
            <div className="phase116-chip-row">
              {model.suggestions.map((suggestion) => <button type="button" className="phase116-chip" data-phase116-action="use-search-suggestion" data-phase116-query={suggestion} data-phase116-input="teoyubeSearchInput" onClick={() => actions.loadSuggestion(suggestion)} key={suggestion}>{suggestion}</button>)}
              <button type="button" className="phase116-chip subtle" data-phase116-action="clear-search-suggestions" onClick={actions.clearSuggestions}>Clear</button>
            </div>
          </div>
        </div>
        <div className="quick-prompts" id="promiseClusterNavigation">{model.quickPrompts.map((prompt) => <button className="secondary prompt-chip cluster-nav-chip" data-query={prompt} onClick={() => actions.runQuickPrompt(prompt)} key={prompt}>{prompt}</button>)}</div>
      </article>
      <section className="search-results-shell">
        <div className="search-results-toolbar">
          <div><p className="eyebrow">Suggested Journeys for You</p><h3>Personalized guidance based on your search</h3></div>
          <div className="search-view-actions" aria-label="Search result view controls">
            <button className="active" type="button" aria-label="Grid view">▦</button><button type="button" aria-label="List view">☰</button>
            <select aria-label="Sort search results"><option>Most Relevant</option><option>Newest</option><option>Calling Match</option><option>Journey Level</option></select>
          </div>
        </div>
        <div className="search-results" id="teoyubeSearchResults" data-results={model.status === "empty" ? "[]" : legacyResults}>
          {model.status === "empty"
            ? <EmptySearchState suggestions={model.suggestions} actions={actions} />
            : model.results.map((result, index) => <SearchResultCard index={index} query={model.query} result={result} actions={actions} key={`${result.title}-${index}`} />)}
        </div>
      </section>
      <section className="search-feature-row" aria-label="TeoyubeSearch benefits">
        <article><span className="search-feature-icon" data-icon="book"></span><div><h3>Scripture Rooted</h3><p>Every result is anchored in God's Word.</p></div></article>
        <article><span className="search-feature-icon" data-icon="person"></span><div><h3>Personalized Guidance</h3><p>Tailored to your profile, calling, and current season.</p></div></article>
        <article><span className="search-feature-icon" data-icon="check"></span><div><h3>Take Action</h3><p>Save, pray, and walk forward with clarity.</p></div></article>
        <article><span className="search-feature-icon" data-icon="leaf"></span><div><h3>Grow Daily</h3><p>Generate a daily journey and stay aligned with purpose.</p></div></article>
      </section>
    </section>
  );
}
